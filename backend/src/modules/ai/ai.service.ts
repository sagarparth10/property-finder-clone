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
const DEFAULT_OLLAMA_MODEL = 'llama3:latest';

@Injectable()
export class AIService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async chat(
    message: string,
    language: string = 'en',
    history: ConversationEntry[] = [],
  ): Promise<string> {
    const baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      DEFAULT_OLLAMA_BASE_URL;
    const model =
      this.configService.get<string>('OLLAMA_MODEL') || DEFAULT_OLLAMA_MODEL;
    const systemPrompt =
      this.configService.get<string>('AI_SYSTEM_PROMPT') ||
      'You are Property Nexus, an AI concierge helping users navigate UAE real estate. Provide concise, friendly, and trustworthy answers. When relevant, suggest using the platform\'s portals, analytics, or expert network.';

    const conversation: OllamaMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt} Respond in ${language.toUpperCase()} when appropriate.`,
      },
      ...history
        .filter((entry) => entry.role === 'assistant' || entry.role === 'user')
        .map<OllamaMessage>((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
      {
        role: 'user',
        content: message,
      },
    ];

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl.replace(/\/$/, '')}/api/chat`,
          {
            model,
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

