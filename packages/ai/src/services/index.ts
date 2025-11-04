/**
 * AI Services Index
 * Unified AI service interface
 */

import { geminiService } from './gemini.service';
import { zaiService } from './zai.service';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export abstract class BaseAIService {
  abstract chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse>;
  abstract chatStream(messages: AIMessage[], options?: AIRequestOptions): Promise<AsyncIterable<AIResponse>>;
  abstract embed(text: string): Promise<number[]>;
}

export function getAIService(provider: 'gemini' | 'zai'): BaseAIService {
  switch (provider) {
    case 'gemini':
      return geminiService;
    case 'zai':
      return zaiService;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export function getAIServiceForFeature(
  feature: 'chat' | 'notes' | 'automation' | 'learningLoop' | 'autopilot' | 'mcpTools' | 'telegramBot'
): BaseAIService {
  // Default provider mapping
  const providerMap = {
    chat: 'gemini',
    notes: 'gemini',
    automation: 'zai',
    learningLoop: 'gemini',
    autopilot: 'zai',
    mcpTools: 'gemini',
    telegramBot: 'gemini'
  } as const;

  return getAIService(providerMap[feature]);
}

export const aiService = {
  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const service = getAIServiceForFeature('chat');
    return service.chat(messages, options);
  },

  async enhanceNote(content: string, instruction: string): Promise<string> {
    const service = getAIServiceForFeature('notes');
    const response = await service.chat([
      { role: 'system', content: 'You are a note enhancement assistant.' },
      { role: 'user', content: `Enhance this note: ${content}\nInstruction: ${instruction}` }
    ]);
    return response.content;
  },

  async generateAutomation(description: string): Promise<string> {
    const service = getAIServiceForFeature('automation');
    const response = await service.chat([
      { role: 'system', content: 'You are an automation expert. Generate automation scripts.' },
      { role: 'user', content: description }
    ]);
    return response.content;
  }
};

export { geminiService, zaiService };
