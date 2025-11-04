// backend/src/services/memoryService.ts
import { createClient } from 'redis';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

// --- Redis Client Setup ---
const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();


// --- Qdrant Client Setup ---
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

// --- Memory Service Functions ---

/**
 * Adds a memory to both Redis (for quick access) and Qdrant (for semantic search).
 * @param memory The memory object to add.
 */
export const addMemory = async (memory: { id: string; content: string; embedding: number[] }) => {
    // 1. Store the full memory object in Redis for fast retrieval by ID.
    // Using a simple key-value store. The key is `memory:<id>`.
    await redisClient.set(`memory:${memory.id}`, JSON.stringify(memory));

    // 2. Store the memory's vector embedding in Qdrant for semantic search.
    await qdrantClient.upsert('memories', {
        wait: true,
        points: [
            {
                id: memory.id,
                vector: memory.embedding,
                payload: { content: memory.content }
            }
        ]
    });

    return { success: true, memoryId: memory.id };
};

/**
 * Searches for memories in Qdrant that are semantically similar to the given embedding.
 * @param embedding The vector embedding to search for.
 * @param limit The maximum number of similar memories to return.
 * @returns A list of similar memory points from Qdrant.
 */
export const searchSimilarMemories = async (embedding: number[], limit: number = 5) => {
    const searchResult = await qdrantClient.search('memories', {
        vector: embedding,
        limit,
        with_payload: true
    });

    return searchResult;
};

/**
 * Retrieves a single memory by its ID from Redis.
 * @param memoryId The ID of the memory to retrieve.
 * @returns The full memory object or null if not found.
 */
export const getMemoryById = async (memoryId: string) => {
    const memoryJson = await redisClient.get(`memory:${memoryId}`);
    if (!memoryJson) {
        return null;
    }
    return JSON.parse(memoryJson);
};
