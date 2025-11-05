import { Router, Request, Response } from 'express';
import { generateContent, generateImage } from '../services/gemini.js';
import { googleSearchService } from '../services/googleSearchService.js';

const router = Router();

/**
* POST /api/ai/generate-image
* Generate an image using Gemini AI
*
* Body:
* {
*   "prompt": "A futuristic cityscape"
* }
*/
router.post('/generate-image', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const imageUrl = await generateImage(prompt);
        res.json({ imageUrl });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
});

/**
* POST /api/ai/chat
* Chat with Gemini AI
*
* Body:
* {
*   "message": "What is artificial intelligence?",
*   "includeWebSearch": false  // Optional: include web search results
* }
*/
router.post('/chat', async (req: Request, res: Response) => {
 try {
   const { message, includeWebSearch = false } = req.body;

   if (!message || typeof message !== 'string') {
     return res.status(400).json({
       error: 'Message is required and must be a string'
     });
   }

   if (message.length > 10000) {
     return res.status(400).json({
       error: 'Message is too long (max 10,000 characters)'
     });
   }

   let response: string;
   let sources: string[] | undefined;

   // If web search is requested, use Google Search + AI
   if (includeWebSearch) {
     if (!googleSearchService.isConfigured()) {
       return res.status(503).json({
         error: 'Web search is not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID.'
       });
     }

     try {
       const searchResult = await googleSearchService.searchWithAI(message, 5);
       response = searchResult.answer;
       sources = searchResult.sources;
     } catch (error: any) {
       console.error('Web search failed, falling back to Gemini only:', error.message);
       // Fallback to Gemini without web search
       response = await generateContent(message);
     }
   } else {
     // Regular Gemini chat without web search
     response = await generateContent(message);
   }

   res.json({
     response,
     sources,
     includeWebSearch
   });
 } catch (error: any) {
   console.error('AI chat error:', error.message);
   res.status(500).json({
     error: 'Failed to generate AI response',
     message: error.message
   });
 }
});

/**
* POST /api/ai/code
* Generate code using Gemini AI
*
* Body:
* {
*   "language": "python",
*   "description": "Function to calculate fibonacci numbers"
* }
*/
router.post('/code', async (req: Request, res: Response) => {
 try {
   const { language, description } = req.body;

   if (!language || !description) {
     return res.status(400).json({
       error: 'Both language and description are required'
     });
   }

   const prompt = `Generate ${language} code for the following task:

${description}

Requirements:
- Provide clean, well-commented code
- Follow best practices for ${language}
- Include error handling where appropriate
- Provide only the code, no explanations

Code:`;

   const code = await generateContent(prompt);

   res.json({
     language,
     description,
     code: code.trim()
   });
 } catch (error: any) {
   console.error('Code generation error:', error.message);
   res.status(500).json({
     error: 'Failed to generate code',
     message: error.message
   });
 }
});

/**
* POST /api/ai/summarize
* Summarize text using Gemini AI
*
* Body:
* {
*   "text": "Long text to summarize...",
*   "maxLength": 200  // Optional: max words in summary
* }
*/
router.post('/summarize', async (req: Request, res: Response) => {
 try {
   const { text, maxLength = 200 } = req.body;

   if (!text || typeof text !== 'string') {
     return res.status(400).json({
       error: 'Text is required and must be a string'
     });
   }

   const prompt = `Summarize the following text in approximately ${maxLength} words or less. Be concise but capture the main points:

${text}

Summary:`;

   const summary = await generateContent(prompt);

   res.json({
     originalLength: text.split(' ').length,
     summaryLength: summary.split(' ').length,
     summary: summary.trim()
   });
 } catch (error: any) {
   console.error('Summarization error:', error.message);
   res.status(500).json({
     error: 'Failed to summarize text',
     message: error.message
   });
 }
});

/**
* POST /api/ai/analyze
* Analyze and extract insights from text
*
* Body:
* {
*   "text": "Text to analyze...",
*   "analysisType": "sentiment" | "keywords" | "entities" | "general"
* }
*/
router.post('/analyze', async (req: Request, res: Response) => {
 try {
   const { text, analysisType = 'general' } = req.body;

   if (!text || typeof text !== 'string') {
     return res.status(400).json({
       error: 'Text is required and must be a string'
     });
   }

   let prompt = '';

   switch (analysisType) {
     case 'sentiment':
       prompt = `Analyze the sentiment of the following text. Classify it as positive, negative, or neutral, and provide a brief explanation:

${text}

Analysis:`;
       break;

     case 'keywords':
       prompt = `Extract the most important keywords and phrases from the following text. List them in order of importance:

${text}

Keywords:`;
       break;

     case 'entities':
       prompt = `Identify and extract all named entities (people, organizations, locations, dates, etc.) from the following text:

${text}

Entities:`;
       break;

     case 'general':
     default:
       prompt = `Analyze the following text and provide insights including:
1. Main topic/theme
2. Key points
3. Sentiment
4. Important entities mentioned

Text:
${text}

Analysis:`;
       break;
   }

   const analysis = await generateContent(prompt);

   res.json({
     analysisType,
     textLength: text.length,
     analysis: analysis.trim()
   });
 } catch (error: any) {
   console.error('Text analysis error:', error.message);
   res.status(500).json({
     error: 'Failed to analyze text',
     message: error.message
   });
 }
});

/**
* POST /api/ai/translate
* Translate text using Gemini AI
*
* Body:
* {
*   "text": "Hello, how are you?",
*   "targetLanguage": "Spanish"
* }
*/
router.post('/translate', async (req: Request, res: Response) => {
 try {
   const { text, targetLanguage } = req.body;

   if (!text || !targetLanguage) {
     return res.status(400).json({
       error: 'Both text and targetLanguage are required'
     });
   }

   const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation, no explanations:

${text}

Translation:`;

   const translation = await generateContent(prompt);

   res.json({
     originalText: text,
     targetLanguage,
     translation: translation.trim()
   });
 } catch (error: any) {
   console.error('Translation error:', error.message);
   res.status(500).json({
     error: 'Failed to translate text',
     message: error.message
   });
 }
});

/**
* GET /api/ai/health
* Check if Gemini AI service is available
*/
router.get('/health', async (req: Request, res: Response) => {
 try {
   const testMessage = 'Hello';
   await generateContent(testMessage);

   res.json({
     status: 'ok',
     service: 'Gemini AI',
     webSearchEnabled: googleSearchService.isConfigured()
   });
 } catch (error: any) {
   res.status(503).json({
     status: 'error',
     service: 'Gemini AI',
     error: error.message
   });
 }
});

/**
 * POST /api/ai/travel-plan
 * Generate a structured travel plan (itinerary, hotels, restaurants, tickets)
 * Body: { destination, startDate, endDate, budget, preferences }
 */
router.post('/travel-plan', async (req: Request, res: Response) => {
 try {
   const { destination, startDate, endDate, budget, preferences } = req.body || {};
   if (!destination || !startDate || !endDate) {
     return res.status(400).json({ error: 'destination, startDate and endDate are required' });
   }

   const prompt = `Create a detailed day-by-day travel itinerary for a trip to ${destination} from ${startDate} to ${endDate} with a budget of ${budget}. Preferences: ${JSON.stringify(preferences || {})}.

Return a JSON object with the following shape:
{
  "tripTitle": string,
  "destination": string,
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "budget": number,
  "itinerary": [ { "day": number, "title": string, "activities": [ { "time": string, "title": string, "details": string } ] } ],
  "hotels": [ { "name": string, "rating": number, "price": string, "bookingUrl": string } ],
  "restaurants": [ { "name": string, "cuisine": string, "priceLevel": string, "url": string } ],
  "notes": string
}

Only return the JSON (no additional explanation).`;

   const raw = await generateContent(prompt);

   // Attempt to parse JSON from model output
   let parsed: any = null;
   try {
     // Find first JSON object in response
     const start = raw.indexOf('{');
     const substr = start >= 0 ? raw.slice(start) : raw;
     parsed = JSON.parse(substr);
   } catch (err) {
     // Fallback: return the raw text inside 'notes'
     parsed = {
       tripTitle: `Trip to ${destination}`,
       destination,
       startDate,
       endDate,
       budget: Number(budget || 0),
       itinerary: [],
       hotels: [],
       restaurants: [],
       notes: raw
     };
   }

   res.json(parsed);
 } catch (error: any) {
   console.error('Travel plan generation error:', error.message);
   res.status(500).json({ error: 'Failed to generate travel plan', message: error.message });
 }
});

export default router;