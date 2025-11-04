import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in the environment variables');
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply('Welcome to the Amrikyy AI OS bot!'));
bot.help((ctx) => ctx.reply('Send me a message and I will echo it back to you.'));

export function launchBot() {
    bot.launch();
    console.log('🤖 Telegram bot launched');
}
