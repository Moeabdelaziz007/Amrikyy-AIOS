import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateContent(prompt: string, model: string = 'gemini-pro') {
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function startChat(messages: any[], model: string = 'gemini-pro') {
    const generativeModel = genAI.getGenerativeModel({ model });
    const chat = generativeModel.startChat({
      history: messages.slice(0, -1),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = await result.response;
    return response.text();
}
