import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { SearchResult } from './googleSearchService.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

import { generateImages } from "@google/generative-ai/node";

export async function generateImage(prompt: string) {
    try {
        const { generatedImages } = await generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            numberOfImages: 1,
            outputMimeType: 'image/png',
        });

        const base64ImageBytes = generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error('Gemini Image API error:', error);
        throw new Error('Failed to generate image');
    }
}

export async function generateContent(prompt: string) {
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

/**
* Search with Gemini - includes optional web search
*/
export async function searchWithGemini(request: {
 query: string;
 includeWebSearch?: boolean;
}): Promise<{ answer: string; sources?: string[] }> {
 const { query, includeWebSearch = false } = request;

 let prompt = query;
 let sources: string[] | undefined;

 // If web search is requested, use Google Search first
 if (includeWebSearch) {
   try {
     const { googleSearchService } = await import('./googleSearchService.js');

     if (googleSearchService.isConfigured()) {
       const searchResults = await googleSearchService.search(query, 5);

       if (searchResults.results.length > 0) {
         const context = searchResults.results
           .map((r: SearchResult, i: number) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`)
           .join('\n\n');

         prompt = `Based on these recent search results:\n\n${context}\n\nAnswer this query: ${query}`;
         sources = searchResults.results.map((r: SearchResult) => r.link);
       }
     } else {
       console.warn('Web search requested but Google Search API not configured');
     }
   } catch (error: any) {
     console.warn('Web search failed, using Gemini only:', error.message);
   }
 }

 // Generate answer with Gemini
 const answer = await generateContent(prompt);

 return { answer, sources };
}

/**
* Generate code with Gemini
*/
export async function generateCode(language: string, description: string): Promise<string> {
 const prompt = `Generate ${language} code for: ${description}\n\nProvide clean, well-commented code. Code only, no explanations.`;
 return generateContent(prompt);
}

/**
* Summarize text with Gemini
*/
export async function summarizeText(text: string, maxWords: number = 200): Promise<string> {
 const prompt = `Summarize the following text in approximately ${maxWords} words:\n\n${text}\n\nSummary:`;
 return generateContent(prompt);
}

/**
* Analyze sentiment
*/
export async function analyzeSentiment(text: string): Promise<string> {
 const prompt = `Analyze the sentiment of this text (positive/negative/neutral) and explain why:\n\n${text}\n\nAnalysis:`;
 return generateContent(prompt);
}

/**
* Extract keywords
*/
export async function extractKeywords(text: string): Promise<string> {
 const prompt = `Extract the most important keywords from this text:\n\n${text}\n\nKeywords:`;
 return generateContent(prompt);
}

/**
* Translate text
*/
export async function translateText(text: string, targetLanguage: string): Promise<string> {
 const prompt = `Translate to ${targetLanguage}:\n\n${text}\n\nTranslation:`;
 return generateContent(prompt);
}
