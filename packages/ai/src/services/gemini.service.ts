/**
 * Gemini AI Service
 * Google Gemini API integration
 */
import { GoogleGenAI, Content, GenerationConfig, SystemInstruction } from "@google/genai";

// Re-export the Content type for external use, aligning with the library
export type { Content };

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // In a browser environment, API keys are exposed. For production,
    // this should be handled via a backend proxy.
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set the VITE_API_KEY environment variable.");
    }
    this.ai = new GoogleGenAI(apiKey);
  }

  /**
   * Generates a text response from the Gemini model.
   *
   * @param {string} prompt - The user's input prompt.
   * @param {Content[]} history - An array of previous messages in the conversation.
   * @param {Partial<GenerationConfig>} generationConfig - Optional configuration for content generation.
   * @param {string} systemInstruction - Optional system instruction to guide the model's behavior.
   * @returns {Promise<string>} A promise that resolves to the AI's generated text response.
   */
  async generateText(
    prompt: string,
    history: Content[],
    generationConfig: Partial<GenerationConfig> = {},
    systemInstruction?: string
  ): Promise<string> {
    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-flash', // Using a standard, available model.
        ...(systemInstruction && { systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] } as SystemInstruction }),
        generationConfig,
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("The AI returned an empty response. This may be due to content policies or an internal error.");
      }
      return text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error instanceof Error) {
        throw new Error(`An error occurred while contacting the AI: ${error.message}`);
      }
      throw new Error("An unknown error occurred while contacting the AI.");
    }
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
