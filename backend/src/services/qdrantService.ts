import { QdrantClient } from '@qdrant/js-client-rest';
import fetch from 'node-fetch';

/**
 * Qdrant Vector Database Service
 * 
 * Features:
 * - Vector storage and retrieval
 * - Semantic search
 * - RAG (Retrieval Augmented Generation)
 * - Knowledge base indexing
 */
class QdrantService {
  private client: QdrantClient | null = null;
  private isConnected: boolean = false;
  private collections: Set<string> = new Set();

  /**
   * Connect to Qdrant server
   */
  async connect() {
    try {
      const url = process.env.QDRANT_URL || 'http://localhost:6333';
      const apiKey = process.env.QDRANT_API_KEY;

      this.client = new QdrantClient({
        url,
        apiKey,
      });

      // Test connection
      await this.client.getCollections();
      
      this.isConnected = true;
      console.log('✅ Qdrant connected');
      
      // Initialize collections
      await this.initializeCollections();
      
    } catch (error) {
      console.error('Failed to connect to Qdrant:', error);
      console.warn('Continuing without vector search capabilities');
    }
  }

  /**
   * Initialize default collections
   */
  private async initializeCollections() {
    const defaultCollections = [
      { name: 'knowledge_base', vectorSize: 768 },
      { name: 'agents', vectorSize: 384 },
      { name: 'workflows', vectorSize: 512 },
    ];

    for (const collection of defaultCollections) {
      await this.createCollectionIfNotExists(collection.name, collection.vectorSize);
    }
  }

  /**
   * Create a collection if it doesn't exist
   */
  private async createCollectionIfNotExists(name: string, vectorSize: number = 768) {
    if (!this.isConnected || !this.client) return;

    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === name);

      if (!exists) {
        await this.client.createCollection(name, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        });
        console.log(`Created Qdrant collection: ${name}`);
      }

      this.collections.add(name);
    } catch (error) {
      console.error(`Error creating collection ${name}:`, error);
    }
  }

  /**
   * Create a new collection
   * @param name - Collection name
   * @param vectorSize - Size of vectors (default: 768 for most embeddings)
   */
  async createCollection(name: string, vectorSize: number = 768): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      console.warn('Qdrant not connected');
      return false;
    }

    try {
      await this.client.createCollection(name, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine', // Cosine similarity for semantic search
        },
      });

      this.collections.add(name);
      console.log(`Created collection: ${name}`);
      return true;
    } catch (error) {
      console.error(`Error creating collection ${name}:`, error);
      return false;
    }
  }

  /**
   * Upsert vectors into a collection
   * @param collection - Collection name
   * @param points - Array of points with id, vector, and optional payload
   */
  async upsertVectors(
    collection: string,
    points: Array<{
      id: string | number;
      vector: number[];
      payload?: Record<string, any>;
    }>
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.upsert(collection, {
        points,
      });

      console.log(`Upserted ${points.length} vectors to ${collection}`);
      return true;
    } catch (error) {
      console.error(`Error upserting vectors to ${collection}:`, error);
      return false;
    }
  }

  /**
   * Perform semantic search
   * @param collection - Collection name
   * @param vector - Query vector
   * @param limit - Number of results (default: 10)
   * @param filter - Optional filter conditions
   * @returns Search results with scores
   */
  async search(
    collection: string,
    vector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<Array<{
    id: string | number;
    score: number;
    payload?: Record<string, any>;
  }>> {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      const results = await this.client.search(collection, {
        vector,
        limit,
        filter,
        with_payload: true,
      });

      return results.map(r => ({
        id: r.id,
        score: r.score,
        payload: r.payload,
      }));
    } catch (error) {
      console.error(`Error searching in ${collection}:`, error);
      return [];
    }
  }

  /**
   * Delete vectors by ID
   * @param collection - Collection name
   * @param ids - Array of IDs to delete
   */
  async deleteVectors(collection: string, ids: Array<string | number>): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.delete(collection, {
        points: ids,
      });

      console.log(`Deleted ${ids.length} vectors from ${collection}`);
      return true;
    } catch (error) {
      console.error(`Error deleting vectors from ${collection}:`, error);
      return false;
    }
  }

  /**
   * Get a vector by ID
   * @param collection - Collection name
   * @param id - Vector ID
   */
  async getVector(collection: string, id: string | number): Promise<{
    id: string | number;
    vector: number[];
    payload?: Record<string, any>;
  } | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const results = await this.client.retrieve(collection, {
        ids: [id],
        with_vector: true,
        with_payload: true,
      });

      if (results.length === 0) return null;

      const result = results[0];
      return {
        id: result.id,
        vector: Array.isArray(result.vector) ? result.vector : [],
        payload: result.payload,
      };
    } catch (error) {
      console.error(`Error retrieving vector from ${collection}:`, error);
      return null;
    }
  }

  /**
   * RAG (Retrieval Augmented Generation)
   * Retrieve relevant context for a query
   * 
   * @param collection - Collection to search
   * @param queryVector - Embedded query vector
   * @param limit - Number of context items (default: 5)
   * @returns Context text for prompt augmentation
   */
  async rag(
    collection: string,
    queryVector: number[],
    limit: number = 5
  ): Promise<string> {
    const results = await this.search(collection, queryVector, limit);

    if (results.length === 0) {
      return '';
    }

    // Combine relevant context
    const context = results
      .map((r, idx) => {
        const text = r.payload?.text || r.payload?.content || '';
        const source = r.payload?.source || 'Unknown';
        return `[${idx + 1}] (Source: ${source}, Relevance: ${r.score.toFixed(2)})\n${text}`;
      })
      .join('\n\n');

    return context;
  }

  /**
   * Get collection info
   * @param name - Collection name
   */
  async getCollectionInfo(name: string): Promise<any> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      return await this.client.getCollection(name);
    } catch (error) {
      console.error(`Error getting collection info for ${name}:`, error);
      return null;
    }
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      const result = await this.client.getCollections();
      return result.collections.map(c => c.name);
    } catch (error) {
      console.error('Error listing collections:', error);
      return [];
    }
  }

  /**
   * Delete a collection
   * @param name - Collection name
   */
  async deleteCollection(name: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.deleteCollection(name);
      this.collections.delete(name);
      console.log(`Deleted collection: ${name}`);
      return true;
    } catch (error) {
      console.error(`Error deleting collection ${name}:`, error);
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const qdrantService = new QdrantService();

/**
 * Minimal Qdrant helper for upserting agent vectors
 */

const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const COLLECTION = process.env.QDRANT_COLLECTION || 'agents_vectors';

if (!QDRANT_URL) console.warn('QDRANT_URL not set. Qdrant calls will be skipped.');

export async function upsertAgentVector(agentId: string, vector: number[], payload: Record<string, any> = {}) {
  if (!QDRANT_URL) return null;

  const url = `${QDRANT_URL}/collections/${COLLECTION}/points?wait=true`;
  const body = {
    points: [
      {
        id: agentId,
        vector,
        payload
      }
    ]
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (QDRANT_API_KEY) headers['api-key'] = QDRANT_API_KEY;

  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Qdrant upsert failed:', resp.status, txt);
    throw new Error(`Qdrant upsert failed: ${resp.status}`);
  }
  return await resp.json();
}
