import { Telegraf, Context } from 'telegraf';
import { supabase } from '../services/supabase.js';
import { generateContent, searchWithGemini, generateCode } from '../services/gemini.js';
import { googleSearchService } from '../services/googleSearchService.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Store user sessions
const userSessions = new Map<number, { userId: string }>();

// /start - Welcome message
bot.command('start', (ctx) => {
 ctx.reply(
   '🤖 Welcome to Amrikyy AIOS Bot!\n\n' +
   'Commands:\n' +
   '/link - Link your account\n' +
   '/ai <question> - Ask AI assistant\n' +
   '/notes - List your knowledge entries\n' +
   '/agents - List your agents\n' +
   '/help - Show all commands'
 );
});

// /link - Link Telegram to user account
bot.command('link', (ctx) => {
 const linkCode = Math.random().toString(36).substring(2, 10).toUpperCase();

 ctx.reply(
   `🔗 Link your account:\n\n` +
   `1. Go to your Amrikyy AIOS app\n` +
   `2. Navigate to Settings > Integrations\n` +
   `3. Enter this code: ${linkCode}\n\n` +
   `This code expires in 5 minutes.`
 );

 // Store link code in database
 supabase
   .from('telegram_link_codes')
   .insert({
     code: linkCode,
     telegram_user_id: ctx.from.id,
     expires_at: new Date(Date.now() + 5 * 60 * 1000)
   });
});

// /ai - AI assistant
bot.command('ai', async (ctx) => {
 try {
   const question = ctx.message.text.replace('/ai', '').trim();
   if (!question) {
     return ctx.reply('Please provide a question. Example: /ai What is AI?');
   }

   ctx.reply('🤔 Thinking...');

   const response = await generateContent(question);
   ctx.reply(`🤖 ${response}`);
 } catch (error) {
   ctx.reply('Sorry, I encountered an error processing your request.');
 }
});

// /notes - List knowledge entries
bot.command('notes', async (ctx) => {
 try {
   const session = userSessions.get(ctx.from.id);
   if (!session) {
     return ctx.reply('Please link your account first using /link');
   }

   const { data, error } = await supabase
     .from('knowledge_base')
     .select('title, content')
     .eq('user_id', session.userId)
     .order('created_at', { ascending: false })
     .limit(5);

   if (error) throw error;

   if (!data || data.length === 0) {
     return ctx.reply('You have no knowledge entries yet.');
   }

   let message = '📚 Your Recent Notes:\n\n';
   data.forEach((note, i) => {
     message += `${i + 1}. ${note.title}\n${note.content.substring(0, 100)}...\n\n`;
   });

   ctx.reply(message);
 } catch (error) {
   ctx.reply('Error fetching notes.');
 }
});

// /agents - List agents
bot.command('agents', async (ctx) => {
 try {
   const session = userSessions.get(ctx.from.id);
   if (!session) {
     return ctx.reply('Please link your account first using /link');
   }

   const { data, error } = await supabase
     .from('agents')
     .select('name, role')
     .eq('user_id', session.userId)
     .order('created_at', { ascending: false });

   if (error) throw error;

   if (!data || data.length === 0) {
     return ctx.reply('You have no agents yet.');
   }

   let message = '🤖 Your Agents:\n\n';
   data.forEach((agent, i) => {
     message += `${i + 1}. ${agent.name} (${agent.role})\n`;
   });

   ctx.reply(message);
 } catch (error) {
   ctx.reply('Error fetching agents.');
 }
});

 // Google Search Command
 bot.command('search', async (ctx) => {
   const query = ctx.message.text.replace('/search', '').trim();

   if (!query) {
     return ctx.reply('❌ Please provide a search query.\n\nUsage: /search latest AI news');
   }

   try {
     ctx.reply('🔍 Searching...');

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

     const response = await searchWithGemini({
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

     const code = await generateCode(language, description);

     ctx.reply(`\`\`\`${language}\n${code}\n\`\`\``, { parse_mode: 'Markdown' });
   } catch (error: any) {
     console.error('Code command error:', error);
     ctx.reply('❌ Failed to generate code. Please try again.');
   }
 });

// /help - Show all commands
bot.command('help', (ctx) => {
 ctx.reply(
   '📖 Available Commands:\n\n' +
   '/start - Start the bot\n' +
   '/link - Link your Amrikyy AIOS account\n' +
   '/ai <question> - Ask AI assistant\n' +
   '/notes - List your knowledge entries\n' +
   '/agents - List your agents\n' +
   '/help - Show this help message'
 );
});

// Handle any text message (treat as AI question)
bot.on('text', async (ctx) => {
 const text = ctx.message.text;

 // Skip if it's a command
 if (text.startsWith('/')) return;

 try {
   ctx.reply('🤔 Processing...');
   const response = await generateContent(text);
   ctx.reply(`🤖 ${response}`);
 } catch (error) {
   ctx.reply('Sorry, I encountered an error. Try using /ai command instead.');
 }
});

export async function launchBot() {
 if (!process.env.TELEGRAM_BOT_TOKEN) {
   console.log('⚠️  TELEGRAM_BOT_TOKEN not set, skipping bot launch');
   return;
 }

 try {
   await bot.launch();
   console.log('✅ Telegram bot launched successfully');

   // Graceful shutdown
   process.once('SIGINT', () => bot.stop('SIGINT'));
   process.once('SIGTERM', () => bot.stop('SIGTERM'));
 } catch (error) {
   console.error('❌ Failed to launch Telegram bot:', error);
 }
}