import axios from 'axios';

export interface SearchResult {
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
     const geminiModule = await import('./gemini.js');

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