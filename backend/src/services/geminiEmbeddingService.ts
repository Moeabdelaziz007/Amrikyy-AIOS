otheimport { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

if (!API_KEY) console.warn('GEMINI_API_KEY not set; embeddings endpoint will return mock vectors');

export async function embedText(text: string): Promise<number[]> {
  if (!API_KEY) {
    // return a deterministic mock vector for tests
    const seed = Array.from(text).reduce((s, c) => s + c.charCodeAt(0), 0);
    return new Array(1536).fill(0).map((_, i) => ((seed + i) % 100) / 100);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.embed({ model: 'embed-english-v1', input: text });
    const vector = response?.data?.[0]?.embedding as number[] | undefined;
    if (!vector) throw new Error('Embedding API returned no vector');
    return vector;
  } catch (e) {
    console.error('Embedding error:', e);
    throw e;
  }
}

