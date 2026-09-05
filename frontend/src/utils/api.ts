import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const path = window.location.pathname;
      localStorage.removeItem('auth_token');
      if (path.startsWith('/agent')) {
        window.location.href = '/login?next=/agent';
      }
    }
    return Promise.reject(error);
  },
);

export const propertyAPI = {
  getAll: async (params?: Record<string, string | number | undefined>) => {
    const response = await apiClient.get('/properties', { params });
    return response.data;
  },
  getMine: async () => {
    const response = await apiClient.get('/properties/mine');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },
  create: async (property: any) => {
    const response = await apiClient.post('/properties', property);
    return response.data;
  },
  update: async (id: string, property: any) => {
    const response = await apiClient.put(`/properties/${id}`, property);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  },
  search: async (query: string) => {
    const response = await apiClient.post('/properties/search', { query });
    return response.data;
  },
  inquire: async (id: string, payload: any) => {
    const response = await apiClient.post(`/properties/${id}/inquire`, payload);
    return response.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const token = response.data.token || response.data.access_token;
    if (token) localStorage.setItem('auth_token', token);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    const token = response.data.token || response.data.access_token;
    if (token) localStorage.setItem('auth_token', token);
    return response.data;
  },
  logout: async () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const crmAPI = {
  dashboard: async () => (await apiClient.get('/crm/dashboard')).data,
  leads: async (params?: { bucket?: string; status?: string }) =>
    (await apiClient.get('/crm/leads', { params })).data,
  createLead: async (payload: any) => (await apiClient.post('/crm/leads', payload)).data,
  claimLead: async (id: string) => (await apiClient.post(`/crm/leads/${id}/claim`)).data,
  convertLead: async (id: string) => (await apiClient.post(`/crm/leads/${id}/convert`)).data,
  updateLeadStatus: async (id: string, status: string) =>
    (await apiClient.patch(`/crm/leads/${id}/status`, { status })).data,
  opportunities: async () => (await apiClient.get('/crm/opportunities')).data,
  suggestions: async () => (await apiClient.get('/crm/suggestions')).data,
  updateSuggestion: async (id: string, status: string) =>
    (await apiClient.patch(`/crm/suggestions/${id}`, { status })).data,
};

export const agentAPI = {
  getListings: async (agentId: string) => {
    const response = await apiClient.get(`/agents/${agentId}/listings`);
    return response.data;
  },
  getAnalytics: async (agentId: string) => {
    const response = await apiClient.get(`/agents/${agentId}/analytics`);
    return response.data;
  },
};

export const aiAPI = {
  chat: async (
    message: string,
    options?: {
      language?: string;
      history?: { role: 'assistant' | 'user'; content: string }[];
    },
  ) => {
    const response = await apiClient.post('/ai/chat', {
      message,
      language: options?.language,
      history: options?.history,
      stream: false,
    });
    return response.data;
  },

  /**
   * Stream tokens via SSE (Worker/Nest → Ollama). Falls back to JSON if the
   * server returns application/json. Call onToken for each chunk to improve TTFT UX.
   */
  chatStream: async (
    message: string,
    options?: {
      language?: string;
      history?: { role: 'assistant' | 'user'; content: string }[];
      signal?: AbortSignal;
      onToken?: (token: string) => void;
    },
  ): Promise<string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers,
      credentials: 'include',
      signal: options?.signal,
      body: JSON.stringify({
        message,
        language: options?.language,
        history: options?.history,
        stream: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI chat failed (${res.status})`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as { response?: string };
      const text = data.response || '';
      if (text) options?.onToken?.(text);
      return text;
    }

    if (!res.body) {
      throw new Error('AI chat stream missing body');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.startsWith('data:'));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload) as {
            content?: string;
            done?: boolean;
            error?: string;
          };
          if (json.error) throw new Error(json.error);
          if (typeof json.content === 'string' && json.content.length > 0) {
            full += json.content;
            options?.onToken?.(json.content);
          }
        } catch (err) {
          if (err instanceof SyntaxError) continue;
          throw err;
        }
      }
    }

    return full;
  },

  getRecommendations: async (userId: string) => {
    const response = await apiClient.get(`/ai/recommendations/${userId}`);
    return response.data;
  },
};

export default apiClient;
