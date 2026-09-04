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
    });
    return response.data;
  },
  getRecommendations: async (userId: string) => {
    const response = await apiClient.get(`/ai/recommendations/${userId}`);
    return response.data;
  },
};

export default apiClient;
