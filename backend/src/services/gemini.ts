import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function askGemini(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function startChat(messages: any[]) {
    try {
        const chat = model.startChat({
          history: messages.slice(0, -1),
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Chat API error:', error);
        throw new Error('Failed to process chat');
    }
}
