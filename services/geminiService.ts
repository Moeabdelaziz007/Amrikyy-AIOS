import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";

/**
 * Generates a response from the Gemini model based on a prompt and conversation history.
 * If API_KEY is not set, it returns a simulated response.
 *
 * @param {string} prompt - The user's input prompt.
 * @param {Content[]} history - An array of previous messages in the conversation.
 * @returns {Promise<string>} A promise that resolves to the AI's generated text response.
 * @throws {Error} If an error occurs during the API call or if the API key is missing.
 */
export const generateResponse = async (prompt: string, history: Content[]): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    // In a real scenario, we'd throw an error, but for the playground we can return a mock response.
    // However, to align with robust error handling, let's throw. Components can decide to mock.
    throw new Error("Gemini API key not found. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const contents: Content[] = [...history, { role: 'user', parts: [{ text: prompt }] }];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are Maya, a helpful AI assistant for the Amrikyy AI OS, specializing in travel intelligence. Be friendly, helpful, and concise.",
      },
    });

    if (!response.text) {
        throw new Error("The AI returned an empty response. This could be due to content policy violations or an internal error. Please try rephrasing your message.");
    }
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`An error occurred while contacting the AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI.");
  }
};
