import { describe, it, expect, vi } from 'vitest';
import { createQuantumReasoningEngine, quickQuantumReasoning, validateQuantumReasoning } from './index';

// Mock the GoogleGenAI to avoid needing real API keys
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            hypotheses: [{
              title: 'Test Hypothesis',
              description: 'A test hypothesis for quantum reasoning',
              confidence: 0.8,
              reasoning: 'Test reasoning',
              evidence: ['test evidence']
            }]
          })
        }
      })
    })
  }))
}));

describe('QuantumReasoningEngine', () => {
  it('should create a quantum reasoning engine', () => {
    const engine = createQuantumReasoningEngine('fake-api-key');
    expect(engine).toBeDefined();
    expect(typeof engine.exploreProblem).toBe('function');
  });

  it('should perform quick quantum reasoning', async () => {
    const result = await quickQuantumReasoning('fake-api-key', 'Test problem');
    expect(result).toBeDefined();
    expect(result.problem_statement).toBe('Test problem');
    expect(Array.isArray(result.hypotheses)).toBe(true);
  });

  it('should validate quantum reasoning result', () => {
    const validResult = {
      problem_statement: 'Test',
      hypotheses: [{ id: '1', title: 'Test', description: 'Test', confidence: 0.8, reasoning: 'Test', evidence: [] }],
      reasoning_traces: [],
      topology_validation: { connectivity_score: 0.8, consistency_score: 0.9, completeness_score: 0.7, identified_gaps: [], recommendations: [], overall_score: 0.8 },
      best_hypothesis: { id: '1', title: 'Test', description: 'Test', confidence: 0.8, reasoning: 'Test', evidence: [] },
      confidence_score: 0.8,
      processing_time: 100,
      metadata: { model_used: 'test', exploration_depth: 1, validation_method: 'test', timestamp: '2023-01-01' }
    };

    const validation = validateQuantumReasoning(validResult);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should detect invalid quantum reasoning result', () => {
    const invalidResult = {
      problem_statement: 'Test',
      hypotheses: [],
      reasoning_traces: [],
      topology_validation: { connectivity_score: 0.8, consistency_score: 0.9, completeness_score: 0.7, identified_gaps: [], recommendations: [], overall_score: 0.8 },
      best_hypothesis: null as any,
      confidence_score: 0.8,
      processing_time: 100,
      metadata: { model_used: 'test', exploration_depth: 1, validation_method: 'test', timestamp: '2023-01-01' }
    };

    const validation = validateQuantumReasoning(invalidResult);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});