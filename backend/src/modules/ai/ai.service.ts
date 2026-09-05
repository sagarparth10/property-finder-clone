import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type ConversationEntry = {
  role: 'assistant' | 'user';
  content: string;
};

type OllamaMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const DEFAULT_OLLAMA_BASE_URL = 'https://ollama.cognaitive.in';
const DEFAULT_OLLAMA_MODEL = 'llama3.2:3b';
const DEFAULT_KEEP_ALIVE = '10m';
const DEFAULT_NUM_PREDICT = 384;
const DEFAULT_TEMPERATURE = 0.6;
const DEFAULT_SYSTEM_PROMPT =
  'You are Property Nexus, a concise UAE real-estate concierge. Prefer short, actionable answers.';

@Injectable()
export class AIService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  private buildMessages(
    message: string,
    language: string,
    history: ConversationEntry[],
  ): OllamaMessage[] {
    const systemPrompt =
      this.configService.get<string>('AI_SYSTEM_PROMPT') || DEFAULT_SYSTEM_PROMPT;

    return [
      {
        role: 'system',
        content: `${systemPrompt} Reply in ${language.toUpperCase()} when appropriate.`,
      },
      ...history
        .filter((entry) => entry.role === 'assistant' || entry.role === 'user')
        .slice(-8)
        .map<OllamaMessage>((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
      {
        role: 'user',
        content: message,
      },
    ];
  }

  private ollamaOptions() {
    const model =
      this.configService.get<string>('OLLAMA_MODEL') || DEFAULT_OLLAMA_MODEL;
    const keepAlive =
      this.configService.get<string>('OLLAMA_KEEP_ALIVE') || DEFAULT_KEEP_ALIVE;
    const numPredict = Number(
      this.configService.get<string>('OLLAMA_NUM_PREDICT') || DEFAULT_NUM_PREDICT,
    );
    const temperature = Number(
      this.configService.get<string>('OLLAMA_TEMPERATURE') || DEFAULT_TEMPERATURE,
    );
    return {
      model,
      keep_alive: keepAlive,
      options: {
        temperature: Number.isFinite(temperature) ? temperature : DEFAULT_TEMPERATURE,
        num_predict:
          Number.isFinite(numPredict) && numPredict > 0
            ? numPredict
            : DEFAULT_NUM_PREDICT,
      },
    };
  }

  private baseUrl() {
    return (
      this.configService.get<string>('OLLAMA_BASE_URL') || DEFAULT_OLLAMA_BASE_URL
    ).replace(/\/$/, '');
  }

  async chat(
    message: string,
    language: string = 'en',
    history: ConversationEntry[] = [],
  ): Promise<string> {
    const conversation = this.buildMessages(message, language, history);
    const opts = this.ollamaOptions();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl()}/api/chat`,
          {
            ...opts,
            messages: conversation,
            stream: false,
          },
          {
            timeout: 120_000,
          },
        ),
      );

      const content = response.data?.message?.content;

      if (typeof content === 'string' && content.trim().length > 0) {
        return content.trim();
      }

      return 'I could not generate a response at the moment. Please try again.';
    } catch (error: any) {
      const detail =
        error?.response?.data?.error || error?.message || 'unknown error';
      console.error('Ollama API Error:', detail);
      return 'I am having trouble reaching the AI engine. Please ensure Ollama is reachable at OLLAMA_BASE_URL and the requested model is available.';
    }
  }

  /**
   * Stream Ollama tokens; invokes onToken for each content chunk.
   * Returns the full concatenated reply.
   */
  async chatStream(
    message: string,
    language: string = 'en',
    history: ConversationEntry[] = [],
    onToken?: (token: string) => void,
  ): Promise<string> {
    const conversation = this.buildMessages(message, language, history);
    const opts = this.ollamaOptions();

    try {
      const res = await fetch(`${this.baseUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...opts,
          messages: conversation,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Ollama HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const chunk = JSON.parse(trimmed) as {
              message?: { content?: string };
            };
            const content = chunk?.message?.content;
            if (typeof content === 'string' && content.length > 0) {
              full += content;
              onToken?.(content);
            }
          } catch {
            /* skip bad lines */
          }
        }
      }

      return full.trim() || 'I could not generate a response at the moment. Please try again.';
    } catch (error: any) {
      const detail = error?.message || 'unknown error';
      console.error('Ollama stream error:', detail);
      return 'I am having trouble reaching the AI engine. Please ensure Ollama is reachable at OLLAMA_BASE_URL and the requested model is available.';
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
