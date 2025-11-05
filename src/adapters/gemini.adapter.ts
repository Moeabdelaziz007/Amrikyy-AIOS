import { BaseAdapter, AdapterRequest, AdapterResponse } from './base/adapter.interface';
import fetch from 'node-fetch';

export class GeminiAdapter extends BaseAdapter {
  constructor(config: any) { super('gemini', config); }

  protected async execute(request: AdapterRequest): Promise<any> {
    const action = request.action;
    if (action === 'embed') {
      const text = request.params.text;
      // Proxy to backend embedding endpoint for simplicity
      const res = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/embeddings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const json = await res.json();
      return json.vector || [];
    }

    throw new Error('Unsupported action for gemini adapter');
  }
}

