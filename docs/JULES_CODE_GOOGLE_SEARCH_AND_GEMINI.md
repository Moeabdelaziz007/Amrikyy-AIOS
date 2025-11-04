# Code for Google Search API & Enhanced Gemini AI Service

## يا Jules، هذا هو الكود الكامل لـ Task F & Task G! 🚀

---

## Task F: Google Search API Service

### File: `backend/src/services/googleSearchService.ts`

```typescript
import axios from 'axios';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  formattedUrl?: string;
}

interface GoogleSearchResponse {
  results: SearchResult[];
  searchTime: number;
  totalResults?: string;
}

class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    
    if (!this.apiKey || !this.searchEngineId) {
      console.warn('⚠️ Google Search API not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env');
    }
  }

  /**
   * Check if Google Search API is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.searchEngineId);
  }

  /**
   * Perform a Google search
   * @param query - Search query
   * @param numResults - Number of results to return (max 10)
   * @returns Search results with metadata
   */
  async search(query: string, numResults: number = 10): Promise<GoogleSearchResponse> {
    if (!this.isConfigured()) {
      throw new Error('Google Search API not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.');
    }

    if (numResults > 10) {
      numResults = 10; // Google Custom Search API limit
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: query,
          num: numResults
        },
        timeout: 10000 // 10 second timeout
      });

      const items = response.data.items || [];
      const results: SearchResult[] = items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl
      }));

      return {
        results,
        searchTime: Date.now() - startTime,
        totalResults: response.data.searchInformation?.totalResults
      };
    } catch (error: any) {
      console.error('Google Search API error:', error.message);
      
      if (error.response?.status === 403) {
        throw new Error('Google Search API quota exceeded or invalid API key');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid search query or parameters');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Search request timed out');
      }
      
      throw new Error(`Failed to perform search: ${error.message}`);
    }
  }

  /**
   * Search with AI summarization using Gemini
   * @param query - Search query
   * @param numResults - Number of search results to use for context
   * @returns AI-generated answer with sources
   */
  async searchWithAI(query: string, numResults: number = 5): Promise<{ answer: string; sources: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('Google Search API not configured');
    }

    try {
      // First, get search results
      const searchResults = await this.search(query, numResults);
      
      if (searchResults.results.length === 0) {
        return {
          answer: 'No search results found for this query.',
          sources: []
        };
      }
      
      // Prepare context from search results
      const context = searchResults.results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`)
        .join('\n\n');
      
      // Import Gemini service dynamically to avoid circular dependencies
      const geminiModule = await import('./gemini');
      
      // Create prompt for Gemini
      const prompt = `You are a helpful AI assistant. Based on these recent search results about "${query}", provide a comprehensive and accurate answer.

Search Results:
${context}

Please provide a clear, well-structured answer that synthesizes the information from these sources. Include specific facts and details from the search results.`;
      
      const aiResponse = await geminiModule.generateContent(prompt);
      
      return {
        answer: aiResponse,
        sources: searchResults.results.map(r => r.link)
      };
    } catch (error: any) {
      console.error('Search with AI error:', error.message);
      throw error;
    }
  }

  /**
   * Get search suggestions (autocomplete)
   * Note: This uses a different API endpoint and may require additional setup
   */
  async getSuggestions(query: string): Promise<string[]> {
    // This is a placeholder - Google doesn't provide autocomplete in Custom Search API
    // You would need to use Google Autocomplete API or implement your own
    console.warn('Search suggestions not implemented yet');
    return [];
  }
}

export const googleSearchService = new GoogleSearchService();
```

---

## Task G: Enhanced Gemini AI Service

### File: `backend/src/routes/ai.ts`

```typescript
import { Router, Request, Response } from 'express';
import { generateContent } from '../services/gemini';
import { googleSearchService } from '../services/googleSearchService';

const router = Router();

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

export default router;
```

### Update: `backend/src/server.ts`

Add the AI router to your server:

```typescript
// Add this import at the top
import aiRouter from './routes/ai';

// Add this route (after other routes)
app.use('/api/ai', aiRouter);
```

---

## Update: Enhanced Gemini Service

### File: `backend/src/services/gemini.ts` (ADD THESE FUNCTIONS)

Add these enhanced functions to your existing `gemini.ts` file:

```typescript
// ADD TO EXISTING FILE - Don't replace, just add these functions

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
      const { googleSearchService } = await import('./googleSearchService');
      
      if (googleSearchService.isConfigured()) {
        const searchResults = await googleSearchService.search(query, 5);
        
        if (searchResults.results.length > 0) {
          const context = searchResults.results
            .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`)
            .join('\n\n');
          
          prompt = `Based on these recent search results:\n\n${context}\n\nAnswer this query: ${query}`;
          sources = searchResults.results.map(r => r.link);
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
```

---

## Task F: Search API Router

### File: `backend/src/routes/search.ts` (NEW)

```typescript
import { Router, Request, Response } from 'express';
import { googleSearchService } from '../services/googleSearchService';

const router = Router();

/**
 * GET /api/search
 * Perform a Google search
 * 
 * Query params:
 * - q: search query (required)
 * - num: number of results (optional, default 10, max 10)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const num = parseInt(req.query.num as string) || 10;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    if (!googleSearchService.isConfigured()) {
      return res.status(503).json({
        error: 'Google Search API not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.'
      });
    }

    const results = await googleSearchService.search(query, num);

    res.json({
      query,
      results: results.results,
      totalResults: results.totalResults,
      searchTime: results.searchTime
    });
  } catch (error: any) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/ai
 * Perform a search with AI summarization
 * 
 * Query params:
 * - q: search query (required)
 */
router.get('/ai', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    if (!googleSearchService.isConfigured()) {
      return res.status(503).json({
        error: 'Google Search API not configured'
      });
    }

    const result = await googleSearchService.searchWithAI(query, 5);

    res.json({
      query,
      answer: result.answer,
      sources: result.sources
    });
  } catch (error: any) {
    console.error('AI search error:', error.message);
    res.status(500).json({ 
      error: 'AI search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/health
 * Check if search service is available
 */
router.get('/health', (req: Request, res: Response) => {
  const isConfigured = googleSearchService.isConfigured();
  
  res.json({
    status: isConfigured ? 'ok' : 'not_configured',
    configured: isConfigured,
    message: isConfigured 
      ? 'Google Search API is configured and ready' 
      : 'Google Search API not configured. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID.'
  });
});

export default router;
```

### Update: `backend/src/server.ts`

Add the search router:

```typescript
// Add this import at the top
import searchRouter from './routes/search';

// Add this route (after other routes)
app.use('/api/search', searchRouter);
```

---

## Enhanced Telegram Bot with Search & AI

### Update: `backend/src/telegram/bot.ts`

Add these commands to your existing Telegram bot:

```typescript
// ADD THESE COMMANDS TO YOUR EXISTING bot.ts

  // Google Search Command
  bot.command('search', async (ctx) => {
    const query = ctx.message.text.replace('/search', '').trim();
    
    if (!query) {
      return ctx.reply('❌ Please provide a search query.\n\nUsage: /search latest AI news');
    }

    try {
      ctx.reply('🔍 Searching...');
      
      const { googleSearchService } = await import('../services/googleSearchService');
      
      if (!googleSearchService.isConfigured()) {
        return ctx.reply('❌ Google Search API is not configured.');
      }
      
      const results = await googleSearchService.search(query, 5);
      
      if (results.results.length === 0) {
        return ctx.reply(`❌ No results found for "${query}"`);
      }
      
      const formattedResults = results.results
        .map((r, i) => `${i + 1}. *${r.title}*\n${r.snippet}\n🔗 ${r.link}`)
        .join('\n\n');
      
      ctx.reply(
        `🔍 *Search results for "${query}":*\n\n${formattedResults}\n\n⏱️ Search time: ${results.searchTime}ms`,
        { parse_mode: 'Markdown' }
      );
    } catch (error: any) {
      console.error('Search command error:', error);
      ctx.reply(`❌ Search failed: ${error.message}`);
    }
  });

  // Enhanced AI Question Command with optional web search
  bot.command('ask', async (ctx) => {
    const message = ctx.message.text.replace('/ask', '').trim();
    
    if (!message) {
      return ctx.reply(
        '❌ Please provide a question.\n\n' +
        'Usage:\n' +
        '/ask What is AI?\n' +
        '/ask --search What happened today?'
      );
    }

    const useWebSearch = message.includes('--search');
    const question = message.replace('--search', '').trim();

    try {
      ctx.reply('🤔 Thinking...');
      
      const geminiService = await import('../services/gemini');
      const response = await geminiService.searchWithGemini({
        query: question,
        includeWebSearch: useWebSearch
      });
      
      let reply = `💡 ${response.answer}`;
      
      if (response.sources && response.sources.length > 0) {
        reply += '\n\n📚 *Sources:*\n' + response.sources.slice(0, 3).join('\n');
      }
      
      ctx.reply(reply, { parse_mode: 'Markdown' });
    } catch (error: any) {
      console.error('Ask command error:', error);
      ctx.reply('❌ Sorry, I couldn\'t process your question. Please try again.');
    }
  });

  // Code generation command
  bot.command('code', async (ctx) => {
    const text = ctx.message.text.replace('/code', '').trim();
    
    if (!text) {
      return ctx.reply(
        '❌ Please provide language and description.\n\n' +
        'Usage: /code python Calculate fibonacci numbers'
      );
    }

    const parts = text.split(' ');
    const language = parts[0];
    const description = parts.slice(1).join(' ');

    if (!description) {
      return ctx.reply('❌ Please provide a description after the language.');
    }

    try {
      ctx.reply('💻 Generating code...');
      
      const geminiService = await import('../services/gemini');
      const code = await geminiService.generateCode(language, description);
      
      ctx.reply(`\`\`\`${language}\n${code}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (error: any) {
      console.error('Code command error:', error);
      ctx.reply('❌ Failed to generate code. Please try again.');
    }
  });

  // Help command - update with new commands
  bot.command('help', (ctx) => {
    ctx.reply(
      '🤖 *Available Commands:*\n\n' +
      '/start - Start the bot\n' +
      '/help - Show this help message\n' +
      '/search <query> - Search the web with Google\n' +
      '/ask <question> - Ask AI a question\n' +
      '/ask --search <question> - Ask AI with web search\n' +
      '/code <language> <description> - Generate code\n' +
      '/note <text> - Save a note (if implemented)',
      { parse_mode: 'Markdown' }
    );
  });
```

---

## Environment Variables

Update your `backend/.env.example`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Google Search API (NEW - REQUIRED FOR TASK F)
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-custom-search-engine-id

# Gmail API
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:3001/api/gmail/callback

# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-calendar-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# Server
PORT=3001
NODE_ENV=development
```

---

## Testing

### Test Google Search Service

```bash
# Start the server
cd backend
npm run dev

# In another terminal, test search
curl "http://localhost:3001/api/search?q=artificial+intelligence&num=5"

# Test AI search
curl "http://localhost:3001/api/search/ai?q=what+is+machine+learning"

# Test search health
curl "http://localhost:3001/api/search/health"
```

### Test AI Router

```bash
# Test chat
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is AI?"}'

# Test chat with web search
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Latest news in AI", "includeWebSearch": true}'

# Test code generation
curl -X POST http://localhost:3001/api/ai/code \
  -H "Content-Type: application/json" \
  -d '{"language": "python", "description": "Function to calculate fibonacci"}'

# Test summarization
curl -X POST http://localhost:3001/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Long text here...", "maxLength": 100}'

# Test AI health
curl http://localhost:3001/api/ai/health
```

### Test Telegram Bot

1. Start your bot: `npm run dev`
2. Open Telegram and find your bot: `@AmrikyyAutomationAiEcosystemBot`
3. Test commands:
   - `/search latest AI news`
   - `/ask What is machine learning?`
   - `/ask --search What happened today?`
   - `/code python Calculate prime numbers`
   - `/help`

---

## Summary

✅ **Task F: Google Search API** - Complete code provided  
✅ **Task G: Enhanced Gemini AI** - Complete code provided  
✅ **AI Router** - Full implementation with 6 endpoints  
✅ **Search Router** - Full implementation with 3 endpoints  
✅ **Telegram Bot Enhancements** - Search & AI commands added  
✅ **Testing Guide** - cURL examples for all endpoints  

**يا Jules، الآن عندك كل الكود! ابدأ التنفيذ! 🚀**
