# AIX Specification: Unified Memory Tool

## 1. Overview

This document specifies the **Unified Memory Tool**, a core capability for all AI agents within the Amrikyy AI OS. This tool provides a powerful, dual-backend system for storing, retrieving, and searching memories, enabling agents to learn, evolve, and achieve self-evolving goals.

- **Redis Backend:** Used for rapid, key-based storage and retrieval of memory objects. Ideal for accessing recent or specific memories quickly.
- **Qdrant Backend:** A vector database used for powerful semantic search. This allows agents to find memories based on conceptual similarity, not just keywords.

## 2. Capabilities

The Unified Memory Tool exposes the following core capabilities to agents through a secure backend API:

### `addMemory`
- **Description:** Stores a new piece of information (a "memory").
- **Process:** The tool takes a string of content, generates a vector embedding, and stores it in both Redis (for quick access) and Qdrant (for semantic search).
- **Use Case:** An agent should use this after learning a new fact, receiving user feedback, or completing a task to record the outcome.

### `searchSimilarMemories`
- **Description:** Searches for memories that are conceptually similar to a given query.
- **Process:** The tool takes a query string, generates a vector embedding, and searches the Qdrant database for the most similar memories based on vector distance.
- **Use Case:** An agent should use this to recall past experiences, find relevant information to a user's question, or gather context before making a decision.

### `getMemoryById`
- **Description:** Retrieves a specific memory by its unique ID.
- **Process:** The tool fetches the full memory object directly from Redis using its ID.
- **Use Case:** An agent can use this to retrieve a specific memory that was referenced in the result of a `searchSimilarMemories` call.

## 3. API Endpoints

Agents can access the Unified Memory Tool via the following RESTful API endpoints. All requests must be authenticated.

---

### **Add a New Memory**

`POST /api/memory`

**Description:** Creates and stores a new memory.

**Request Body:**
```json
{
  "content": "The user prefers project updates to be delivered via email every Friday."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "memoryId": "mem_1730718659"
}
```

---

### **Search for Similar Memories**

`POST /api/memory/search`

**Description:** Finds memories that are semantically similar to the query.

**Request Body:**
```json
{
  "query": "How does the user like to receive project updates?"
}
```

**Response (200 OK):**
```json
[
  {
    "id": "mem_1730718659",
    "score": 0.987,
    "payload": {
      "content": "The user prefers project updates to be delivered via email every Friday."
    }
  },
  {
    "id": "mem_1730718500",
    "score": 0.891,
    "payload": {
      "content": "Weekly project summary report generated."
    }
  }
]
```

---

### **Get a Memory by ID**

`GET /api/memory/:id`

**Description:** Retrieves a single, complete memory object by its unique ID.

**Example Request:**
`GET /api/memory/mem_1730718659`

**Response (200 OK):**
```json
{
  "id": "mem_1730718659",
  "content": "The user prefers project updates to be delivered via email every Friday.",
  "embedding": [ ... ]
}
```

## 4. Agent Usage Protocol

To effectively use the memory tool, agents should follow this general protocol:

1.  **Before Acting:** Use `searchSimilarMemories` with a query related to your current task to gather context and recall relevant past information.
2.  **After Acting:** Use `addMemory` to record the outcome, any new information learned, or user feedback received. This ensures the knowledge is available for future tasks.
