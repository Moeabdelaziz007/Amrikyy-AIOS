import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser 
} from './packages/supabase/src/auth';
import {
  createKnowledgeEntry,
  getKnowledgeEntries,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
} from './services/knowledgeService';
import {
  createAgent,
  getUserAgents,
  deleteAgent,
} from './services/agentService';
import {
  uploadUserFile,
  getUserFiles,
  deleteUserFile,
} from './services/fileService';

/**
 * Supabase Integration Tests
 * 
 * These tests verify the complete integration with Supabase including:
 * - Authentication (sign up, sign in, sign out)
 * - Database CRUD operations for Knowledge Base
 * - Database CRUD operations for Agents
 * - File storage operations
 * - Real-time subscriptions (tested implicitly through CRUD)
 * 
 * Note: These tests require a valid Supabase connection with proper environment variables set.
 * Run these tests against a development/test Supabase instance, not production.
 */

describe('Supabase Integration Tests', () => {
  let testUserId: string;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  describe('Authentication', () => {
    it('should sign up a new user', async () => {
      const result = await signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      if (result.user) {
        testUserId = result.user.id;
      }
    });

    it('should sign in an existing user', async () => {
      const result = await signIn({
        email: testEmail,
        password: testPassword,
      });

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should get current user', async () => {
      const user = await getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    });

    it('should sign out user', async () => {
      const result = await signOut();
      expect(result.error).toBeNull();

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('Knowledge Base (ChronoVaultApp)', () => {
    let knowledgeEntryId: string;

    beforeAll(async () => {
      // Sign in before knowledge base tests
      await signIn({ email: testEmail, password: testPassword });
      const user = await getCurrentUser();
      if (user) {
        testUserId = user.id;
      }
    });

    it('should create a knowledge entry', async () => {
      const entry = await createKnowledgeEntry(testUserId, {
        title: 'Test Knowledge Entry',
        content: 'This is a test knowledge entry for integration testing.',
        tags: ['test', 'integration'],
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.title).toBe('Test Knowledge Entry');
      expect(entry.user_id).toBe(testUserId);
      knowledgeEntryId = entry.id;
    });

    it('should get all knowledge entries for user', async () => {
      const entries = await getKnowledgeEntries(testUserId);
      
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].user_id).toBe(testUserId);
    });

    it('should update a knowledge entry', async () => {
      const updated = await updateKnowledgeEntry(knowledgeEntryId, {
        title: 'Updated Test Knowledge Entry',
        content: 'This content has been updated.',
      });

      expect(updated).toBeDefined();
      expect(updated.title).toBe('Updated Test Knowledge Entry');
      expect(updated.content).toBe('This content has been updated.');
    });

    it('should delete a knowledge entry', async () => {
      await deleteKnowledgeEntry(knowledgeEntryId);
      
      const entries = await getKnowledgeEntries(testUserId);
      const deletedEntry = entries.find((e) => e.id === knowledgeEntryId);
      expect(deletedEntry).toBeUndefined();
    });
  });

  describe('Agents (AgentForgeApp)', () => {
    let agentId: string;

    beforeAll(async () => {
      // Ensure user is signed in
      const user = await getCurrentUser();
      if (!user) {
        await signIn({ email: testEmail, password: testPassword });
        const newUser = await getCurrentUser();
        if (newUser) {
          testUserId = newUser.id;
        }
      }
    });

    it('should create an agent', async () => {
      const agent = await createAgent(testUserId, {
        name: 'Test Agent',
        role: 'A test agent for integration testing',
        icon: '🤖',
        skill_ids: ['web-search', 'code-analysis'],
      });

      expect(agent).toBeDefined();
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Test Agent');
      expect(agent.user_id).toBe(testUserId);
      agentId = agent.id;
    });

    it('should get all agents for user', async () => {
      const agents = await getUserAgents(testUserId);
      
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0].user_id).toBe(testUserId);
    });

    it('should delete an agent', async () => {
      await deleteAgent(agentId);
      
      const agents = await getUserAgents(testUserId);
      const deletedAgent = agents.find((a) => a.id === agentId);
      expect(deletedAgent).toBeUndefined();
    });
  });

  describe('File Storage (FilesApp)', () => {
    let fileId: string;
    let filePath: string;

    beforeAll(async () => {
      // Ensure user is signed in
      const user = await getCurrentUser();
      if (!user) {
        await signIn({ email: testEmail, password: testPassword });
        const newUser = await getCurrentUser();
        if (newUser) {
          testUserId = newUser.id;
        }
      }
    });

    it('should upload a file', async () => {
      // Create a test file
      const testContent = 'This is a test file for integration testing.';
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test-file.txt', { type: 'text/plain' });

      const metadata = await uploadUserFile(testUserId, file);

      expect(metadata).toBeDefined();
      expect(metadata.id).toBeDefined();
      expect(metadata.name).toBe('test-file.txt');
      expect(metadata.user_id).toBe(testUserId);
      expect(metadata.size).toBe(testContent.length);
      
      fileId = metadata.id;
      filePath = metadata.path;
    });

    it('should get all files for user', async () => {
      const files = await getUserFiles(testUserId);
      
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      expect(files[0].user_id).toBe(testUserId);
    });

    it('should delete a file', async () => {
      await deleteUserFile(fileId, filePath);
      
      const files = await getUserFiles(testUserId);
      const deletedFile = files.find((f) => f.id === fileId);
      expect(deletedFile).toBeUndefined();
    });
  });

  afterAll(async () => {
    // Clean up: sign out after all tests
    await signOut();
  });
});
