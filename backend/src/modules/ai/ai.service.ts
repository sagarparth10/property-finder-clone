import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ConversationEntry = {
  role: 'assistant' | 'user';
  content: string;
};

const DEFAULT_AGENT_URL = 'https://ollama.cognaitive.in/agent';
const DEFAULT_SYSTEM_PROMPT =
  'You are Property Nexus, a concise UAE real-estate concierge. Prefer short, actionable answers.';

@Injectable()
export class AIService {
  constructor(private configService: ConfigService) {}

  private agentUrl() {
    return (
      this.configService.get<string>('OLLAMA_AGENT_URL') || DEFAULT_AGENT_URL
    ).replace(/\/$/, '');
  }

  private buildPrompt(
    message: string,
    language: string,
    history: ConversationEntry[],
  ): string {
    const systemPrompt =
      this.configService.get<string>('AI_SYSTEM_PROMPT') || DEFAULT_SYSTEM_PROMPT;
    const lines = [
      `${systemPrompt} Reply in ${language.toUpperCase()} when appropriate.`,
      '',
    ];
    for (const entry of history
      .filter((e) => e.role === 'assistant' || e.role === 'user')
      .slice(-8)) {
      lines.push(`${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`);
    }
    lines.push(`User: ${message}`);
    lines.push('Assistant:');
    return lines.join('\n');
  }

  private normalizeImages(images?: string[]): string[] | undefined {
    if (!Array.isArray(images) || images.length === 0) return undefined;
    const out: string[] = [];
    for (const item of images.slice(0, 4)) {
      const s = String(item || '').trim();
      if (!s) continue;
      const comma = s.indexOf(',');
      const b64 =
        s.startsWith('data:') && comma !== -1 ? s.slice(comma + 1).trim() : s;
      if (b64) out.push(b64);
    }
    return out.length > 0 ? out : undefined;
  }

  private async callAgent(
    message: string,
    language: string,
    history: ConversationEntry[],
    images?: string[],
  ): Promise<string> {
    const prompt = this.buildPrompt(message, language, history);
    const normalized = this.normalizeImages(images);
    const payload: { prompt: string; images?: string[] } = { prompt };
    if (normalized) payload.images = normalized;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const secret = (
      this.configService.get<string>('OLLAMA_API_SECRET') ||
      this.configService.get<string>('API_SECRET') ||
      ''
    ).trim();
    if (secret) {
      headers.Authorization = `Bearer ${secret}`;
    }

    const res = await fetch(this.agentUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Agent HTTP ${res.status}`);
    }

    const data = (await res.json()) as { answer?: string };
    if (typeof data?.answer === 'string' && data.answer.trim().length > 0) {
      return data.answer.trim();
    }
    return 'I could not generate a response at the moment. Please try again.';
  }

  async chat(
    message: string,
    language: string = 'en',
    history: ConversationEntry[] = [],
    images?: string[],
  ): Promise<string> {
    try {
      return await this.callAgent(message, language, history, images);
    } catch (error: any) {
      const detail = error?.message || 'unknown error';
      console.error('Ollama agent API Error:', detail);
      return 'I am having trouble reaching the AI engine. Please ensure OLLAMA_AGENT_URL is reachable and OLLAMA_API_SECRET is set.';
    }
  }

  /**
   * Agent endpoint is JSON-only; invoke onToken once with the full answer
   * so SSE clients still receive a single content event.
   */
  async chatStream(
    message: string,
    language: string = 'en',
    history: ConversationEntry[] = [],
    onToken?: (token: string) => void,
    images?: string[],
  ): Promise<string> {
    try {
      const answer = await this.callAgent(message, language, history, images);
      if (answer) onToken?.(answer);
      return answer;
    } catch (error: any) {
      const detail = error?.message || 'unknown error';
      console.error('Ollama agent stream error:', detail);
      return 'I am having trouble reaching the AI engine. Please ensure OLLAMA_AGENT_URL is reachable and OLLAMA_API_SECRET is set.';
    }
  }

  async getPropertyRecommendations(userId: string, userPreferences: any): Promise<any[]> {
    // Placeholder implementation for future recommendation engine
    return [];
  }

  async generatePropertyDescription(propertyData: any): Promise<string> {
    const fallbackDescription =
      'Property description generation is currently unavailable while the AI concierge is in development.';

    return fallbackDescription;
  }

  async detectFakeListing(propertyData: any): Promise<boolean> {
    return false;
  }
}
