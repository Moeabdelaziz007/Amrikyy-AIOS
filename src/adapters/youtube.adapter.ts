import { BaseAdapter, AdapterRequest } from './base/adapter.interface';
import fetch from 'node-fetch';

export class YouTubeAdapter extends BaseAdapter {
  constructor(config: any) { super('youtube', config); }

  protected async execute(request: AdapterRequest): Promise<any> {
    const action = request.action;
    if (action === 'search') {
      const { query, maxResults = 5 } = request.params;
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) throw new Error('YOUTUBE_API_KEY not configured');
      const q = new URLSearchParams({ part: 'snippet', q: query, maxResults: String(maxResults), key });
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${q.toString()}`);
      const json = await res.json();
      return json;
    }

    throw new Error('Unsupported action for youtube adapter');
  }
}

