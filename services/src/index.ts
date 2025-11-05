/**
 * Services Index for Amrikyy AI OS
 * Exports all service modules and utilities
 */

export type { AIRequestOptions, AIResponse } from './types';

// Import services with error handling
import * as GeminiService from './gemini.service';

// Mock implementations for missing services
export const zaiService = {
  chat: async () => ({ content: 'Mock ZAI response', model: 'zai-model' }),
  chatStream: async () => (async function* () {
    yield { content: 'Mock ZAI streaming response', model: 'zai-model' };
  }),
};

export const supabaseService = {
  auth: {
    signIn: async () => ({ user: { id: 'mock-user', email: 'mock@example.com' } }),
    signOut: async () => ({ success: true }),
  },
  realtime: {
    subscribe: () => ({ data: { subscription: 'mock-subscription' } }),
    unsubscribe: () => ({ success: true }),
  },
};

// Export the quantum agent service when available
try {
  export * as QuantumAgentService from './quantumAgentService';
} catch (error) {
  console.warn('Quantum agent service not available, using mock:', error);
  export const quantumAgentService = {
    getEnhancedResponse: async () => ({ content: 'Mock quantum response', confidence: 0.5 }),
    updateConfig: () => {},
    getConfig: () => ({ enable_quantum_reasoning: true }),
    analyzePerformance: () => ({ avgConfidence: 0.7, avgProcessingTime: 100, quantumUsageRate: 0.8, topologiesValidated: 5 }),
  };
}
