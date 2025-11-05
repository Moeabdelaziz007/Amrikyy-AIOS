import { AdapterFactory } from './base/adapter.factory';
import { GeminiAdapter } from './gemini.adapter';
import { YouTubeAdapter } from './youtube.adapter';

export function initializeAdapters() {
  const gemini = new GeminiAdapter({});
  const youtube = new YouTubeAdapter({ rateLimit: { perMinute: 60, perHour: 1000 } });
  AdapterFactory.register(gemini as any);
  AdapterFactory.register(youtube as any);
}

export { AdapterFactory } from './base/adapter.factory';
export * from './base/adapter.interface';

