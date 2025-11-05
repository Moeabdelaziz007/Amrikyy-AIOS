import Redis from 'ioredis';

/**
 * Redis Service for caching and session storage
 * 
 * Features:
 * - Connection pooling
 * - TTL-based caching
 * - Pattern-based invalidation
 * - Session management
 */
class RedisService {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  /**
   * Connect to Redis server
   */
  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err);
        this.isConnected = false;
      });

      // Test connection
      await this.client.ping();
      
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Continue without Redis - degrade gracefully
    }
  }

  /**
   * Cache a value with TTL (Time To Live)
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (default: 1 hour)
   */
  async cache(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, skipping cache');
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
    } catch (error) {
      console.error('Redis cache error:', error);
    }
  }

  /**
   * Get a cached value
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Invalidate cache by pattern
   * @param pattern - Key pattern (e.g., 'user:*', 'knowledge:*')
   */
  async invalidate(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`Invalidated ${keys.length} keys matching ${pattern}`);
      }
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }

  /**
   * Delete a specific key
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  /**
   * Set a value with no expiration
   * @param key - Key
   * @param value - Value
   */
  async set(key: string, value: any): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  /**
   * Increment a counter
   * @param key - Counter key
   * @param by - Amount to increment by (default: 1)
   * @returns New value
   */
  async increment(key: string, by: number = 1): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      return await this.client.incrby(key, by);
    } catch (error) {
      console.error('Redis increment error:', error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   * @param key - Key to check
   * @returns true if exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL (time to live) for a key
   * @param key - Key
   * @returns TTL in seconds, or -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return -2;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -2;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }

  /**
   * Get connection status
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const redisService = new RedisService();

const REDIS_URL = process.env.REDIS_URL || '';
let client: Redis.Redis | null = null;

if (REDIS_URL) {
  client = new Redis(REDIS_URL);
  client.on('connect', () => console.log('✅ Redis connected'));
  client.on('error', (e) => console.error('Redis error', e));
} else {
  console.warn('REDIS_URL not set. Redis caching disabled.');
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600) {
  if (!client) return;
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function getCache(key: string) {
  if (!client) return null;
  const v = await client.get(key);
  return v ? JSON.parse(v) : null;
}

export default client;
