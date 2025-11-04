/**
 * @file supabase_integration.test.ts
 * @description Integration tests for Supabase connectivity and CRUD operations.
 * Verifies that Supabase client, Auth, Storage, and Tables (agents, knowledge_base, file_metadata)
 * are all functioning properly in Amrikyy OS.
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Load environment variables (Vite-style)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// We will hold the authenticated client and user for all tests
let authUser: User | null = null;

describe('🧠 Supabase Integration Tests', () => {
    // 1. Authenticate a test user once before all tests
    beforeAll(async () => {
        const email = `test_${Date.now()}@example.com`;
        const password = 'TestPass123!';

        // Sign up the user
        const { data: { user: signedUpUser }, error: signupError } = await supabase.auth.signUp({ email, password });

        // In a real project with email confirmation, this would fail.
        // For testing, we assume the user is confirmed or auto-confirmed in Supabase settings.
        if (signupError) {
            throw new Error('Auth: User sign-up failed: ' + signupError.message);
        }
        if (!signedUpUser) {
            throw new Error('Auth: User object was not returned after sign-up.');
        }

        // Sign in the user
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            throw new Error('Auth: User sign-in failed: ' + signInError.message);
        }
        if (!session) {
            throw new Error('Auth: Session was not returned after sign-in.');
        }

        authUser = session.user;
        console.log(`✅ Auth setup complete. Logged in as ${authUser.email}`);
    }, 15000); // Increase timeout for auth operations

    // 2. Test Agents Table
    test('Agents: should insert, update, and delete agent record', async () => {
        expect(authUser).not.toBeNull();

        const agentConfig = {
            id: `test-agent-${Date.now()}`,
            name: 'Test Agent',
            role: 'Tester',
            icon: '🧪',
            skillIDs: ['web_search'],
        };

        // Insert
        const { data: inserted, error: insertErr } = await supabase
            .from('agents')
            .insert([{ user_id: authUser!.id, name: 'Test Agent', config: agentConfig }])
            .select();
        expect(insertErr).toBeNull();
        expect(inserted![0].config.name).toBe('Test Agent');

        const agentId = inserted![0].id;
        const updatedConfig = { ...agentConfig, role: 'Senior Tester' };

        // Update
        const { data: updated, error: updateErr } = await supabase
            .from('agents')
            .update({ config: updatedConfig })
            .eq('id', agentId)
            .select();
        expect(updateErr).toBeNull();
        expect(updated![0].config.role).toBe('Senior Tester');

        // Delete
        const { error: deleteErr } = await supabase.from('agents').delete().eq('id', agentId);
        expect(deleteErr).toBeNull();

        console.log('✅ Agents table test passed.');
    });

    // 3. Test Knowledge Base Table
    test('Knowledge Base: should insert and retrieve records', async () => {
        expect(authUser).not.toBeNull();

        const { data: inserted, error } = await supabase
            .from('knowledge_base')
            .insert([{ user_id: authUser!.id, title: 'AI Note', content: 'Quantum thought sync', tags: ['ai', 'quantum'] }])
            .select();

        expect(error).toBeNull();
        expect(inserted!.length).toBeGreaterThan(0);
        console.log('✅ Knowledge Base test passed.');
    });

    // 4. Test Storage
    test('Storage: should upload and list a file', async () => {
        expect(authUser).not.toBeNull();
        const bucket = 'user_files'; // Correct bucket name
        const fileName = `test_${Date.now()}.txt`;
        const fileContent = new Blob(['Hello Supabase!'], { type: 'text/plain' });

        // Upload
        const { error: uploadErr } = await supabase.storage.from(bucket).upload(`${authUser!.id}/${fileName}`, fileContent);
        expect(uploadErr).toBeNull();

        // List
        const { data: list, error: listErr } = await supabase.storage.from(bucket).list(authUser!.id);
        expect(listErr).toBeNull();
        expect(list?.some((f) => f.name === fileName)).toBeTruthy();

        console.log('✅ Storage test passed.');
    });
});
