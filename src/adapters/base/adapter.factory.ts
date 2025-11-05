// src/adapters/base/adapter.factory.ts
export class AdapterFactory {
  private static adapters: Map<string, BaseAdapter> = new Map();

  static register(adapter: BaseAdapter): void {
    this.adapters.set(adapter['name'], adapter);
  }

  static get(name: string): BaseAdapter | undefined {
    return this.adapters.get(name);
  }

  static getAll(): BaseAdapter[] {
    return Array.from(this.adapters.values());
  }

  static async call<T = any>(
    adapterName: string,
    request: AdapterRequest
  ): Promise<AdapterResponse<T>> {
    const adapter = this.get(adapterName);

    if (!adapter) {
      return {
        success: false,
        error: {
          code: 'ADAPTER_NOT_FOUND',
          message: `Adapter '${adapterName}' not found`,
          retryable: false
        }
      };
    }

    return adapter.call<T>(request);
  }
}
