        const data = await this.execute(request);

        return {
          success: true,
          data,
          metadata: {
            duration: Date.now() - startTime,
            attempts,
            cached: false
          }
        };
      } catch (error: any) {
        const isLastAttempt = attempts >= (this.config.retries || 1);
        const isRetryable = this.isRetryableError(error);

        if (isLastAttempt || !isRetryable) {
          return {
            success: false,
            error: {
              code: error.code || 'ADAPTER_ERROR',
              message: error.message || 'Unknown error',
              retryable: isRetryable
            },
            metadata: {
              duration: Date.now() - startTime,
              attempts,
              cached: false
            }
          };
        }

        // Exponential backoff
        await this.sleep(Math.pow(2, attempts) * 1000);
      }
    }

    throw new Error('Unexpected error in adapter call');
  }

  /**
   * Execute the actual API call - must be implemented by subclasses
   */
  protected abstract execute(request: AdapterRequest): Promise<any>;

  /**
   * Check if error is retryable
   */
  protected isRetryableError(error: any): boolean {
    const retryableCodes = ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', '429', '503', '504'];
    return retryableCodes.some(code =>
      error.code?.includes(code) || error.status?.toString() === code
    );
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(): boolean {
    if (!this.config.rateLimit) return true;

    const now = Date.now();
    const minute = 60 * 1000;
    const hour = 60 * minute;

    const key = `${this.name}-requests`;
    const requests = this.requestCount.get(key) || [];

    // Clean old requests
    const recentRequests = requests.filter(time => now - time < hour);

    const lastMinuteCount = recentRequests.filter(time => now - time < minute).length;
    const lastHourCount = recentRequests.length;

    const { perMinute, perHour } = this.config.rateLimit;

    if (lastMinuteCount >= perMinute || lastHourCount >= perHour) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requestCount.set(key, recentRequests);

    return true;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get adapter status
   */
  getStatus(): {
    name: string;
    healthy: boolean;
    requestsLastMinute: number;
    requestsLastHour: number;
  } {
    const now = Date.now();
    const key = `${this.name}-requests`;
    const requests = this.requestCount.get(key) || [];

    return {
      name: this.name,
      healthy: true,
      requestsLastMinute: requests.filter(t => now - t < 60000).length,
      requestsLastHour: requests.filter(t => now - t < 3600000).length
    };
  }
}
// src/adapters/base/adapter.interface.ts
export interface AdapterConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  rateLimit?: {
    perMinute: number;
    perHour: number;
  };
}

export interface AdapterResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  metadata?: {
    duration: number;
    attempts: number;
    cached: boolean;
  };
}

export interface AdapterRequest {
  action: string;
  params: Record<string, any>;
  context?: {
    userId?: string;
    agentId?: string;
    conversationId?: string;
  };
}

/**
 * Base adapter interface - all service adapters must implement this
 */
export abstract class BaseAdapter {
  protected config: AdapterConfig;
  protected name: string;
  private requestCount: Map<string, number[]> = new Map();

  constructor(name: string, config: AdapterConfig) {
    this.name = name;
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config
    };
  }

  /**
   * Main call method - handles rate limiting, retries, and error handling
   */
  async call<T = any>(request: AdapterRequest): Promise<AdapterResponse<T>> {
    const startTime = Date.now();
    let attempts = 0;

    // Check rate limits
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded for ${this.name}`,
          retryable: true
        }
      };
    }

    while (attempts < (this.config.retries || 1)) {
      attempts++;

      try {
