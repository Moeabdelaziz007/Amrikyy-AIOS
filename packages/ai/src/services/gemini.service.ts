/**
 * Gemini AI Service
 * Google Gemini API integration
 */
import { GoogleGenAI, Content, GenerationConfig } from "@google/genai";

// Re-export the Content type for external use, aligning with the library
export type { Content };

import { AIMessage, AIRequestOptions, AIResponse } from './index';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // In a browser environment, API keys are exposed. For production,
    // this should be handled via a backend proxy.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generates a text response from the Gemini model.
   *
   * @param {AIMessage[]} messages - An array of messages in the conversation.
   * @param {AIRequestOptions} [options={}] - Optional configuration for content generation.
   * @returns {Promise<AIResponse>} A promise that resolves to the AI's response.
   */
  async chat(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    try {
      const { history, systemInstruction, prompt } = this.transformMessages(messages);

      const generationConfig: Partial<GenerationConfig> = {
        ...(options.temperature && { temperature: options.temperature }),
        ...(options.maxTokens && { maxOutputTokens: options.maxTokens }),
      };

      const chatSession = this.ai.chats.create({
        model: 'gemini-1.5-flash',
        history,
        config: {
          ...generationConfig,
          ...(systemInstruction && { systemInstruction }),
        },
      });

      const result = await chatSession.sendMessage({ message: prompt });
      const text = result.text;

      if (!text) {
        throw new Error("The AI returned an empty response. This may be due to content policies or an internal error.");
      }
      return { content: text, model: 'gemini-1.5-flash' };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error instanceof Error) {
        throw new Error(`An error occurred while contacting the AI: ${error.message}`);
      }
      throw new Error("An unknown error occurred while contacting the AI.");
    }
  }

  private transformMessages(messages: AIMessage[]): { history: Content[], systemInstruction?: string, prompt: string } {
    const history: Content[] = [];
    let systemInstruction: string | undefined;
    let prompt = "";

    messages.forEach((msg, index) => {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
        return;
      }
      if (index === messages.length - 1 && msg.role === 'user') {
        prompt = msg.content;
      } else {
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    });

    if (!prompt) {
      throw new Error("The last message in the array must be from the 'user' role.");
    }

    return { history, systemInstruction, prompt };
  }

  // Keeping the other methods as placeholders for now
  async chatStream(_messages: Content[]): Promise<AsyncIterable<any>> {
    // Mock implementation
    return (async function* () {
      yield { content: 'Mock streaming response', model: 'gemini-pro' };
    })();
  }

  async embed(_text: string): Promise<number[]> {
    // Mock implementation
    return new Array(768).fill(0).map(() => Math.random());
  }
}

// Export a singleton instance of the service
export const geminiService = new GeminiService();
