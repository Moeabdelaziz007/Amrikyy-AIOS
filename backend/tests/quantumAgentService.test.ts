import { QuantumAgentService } from '../../services/src/quantumAgentService';
import { geminiService } from '../../packages/ai/src/services/gemini.service';

// Mock the quantum reasoning engine
jest.mock('@amrikyy/quantum-reasoning', () => ({
  createQuantumReasoningEngine: jest.fn(() => ({
    exploreProblem: jest.fn().mockResolvedValue({
      problem_statement: 'Test problem',
      hypotheses: [
        { id: 'hyp1', title: 'Hypothesis 1', description: 'Test hypothesis', confidence: 0.8, reasoning: 'Test reasoning', evidence: ['evidence1'] }
      ],
      reasoning_traces: [
        { step_number: 1, step_type: 'exploration', description: 'Exploring problem', timestamp: new Date().toISOString() }
      ],
      topology_validation: {
        connectivity_score: 0.8,
        consistency_score: 0.9,
        completeness_score: 0.7,
        identified_gaps: [],
        recommendations: [],
        overall_score: 0.8
      },
      best_hypothesis: { id: 'hyp1', title: 'Hypothesis 1', description: 'Test hypothesis', confidence: 0.8, reasoning: 'Test reasoning', evidence: ['evidence1'] },
      confidence_score: 0.8,
      processing_time: 100,
      metadata: {
        model_used: 'gemini-2.0-flash',
        exploration_depth: 3,
        validation_method: 'topology-audit',
        timestamp: new Date().toISOString()
      }
    })
  })),
  quickQuantumReasoning: jest.fn().mockResolvedValue({
    problem_statement: 'Quick test',
    hypotheses: [{ id: 'hyp1', title: 'Quick Hypothesis', description: 'Quick test', confidence: 0.7, reasoning: 'Quick reasoning', evidence: [] }],
    reasoning_traces: [{ step_number: 1, step_type: 'exploration', description: 'Quick exploration', timestamp: new Date().toISOString() }],
    topology_validation: { connectivity_score: 0.7, consistency_score: 0.8, completeness_score: 0.6, identified_gaps: [], recommendations: [], overall_score: 0.7 },
    best_hypothesis: { id: 'hyp1', title: 'Quick Hypothesis', description: 'Quick test', confidence: 0.7, reasoning: 'Quick reasoning', evidence: [] },
    confidence_score: 0.7,
    processing_time: 50,
    metadata: { model_used: 'gemini-2.0-flash', exploration_depth: 2, validation_method: 'topology-audit', timestamp: new Date().toISOString() }
  })
}));

// Mock the gemini service
jest.mock('../../packages/ai/src/services/gemini.service', () => ({
  geminiService: {
    chat: jest.fn().mockResolvedValue({
      content: 'Mock Gemini response',
      model: 'gemini-pro'
    })
  }
}));

describe('QuantumAgentService', () => {
  let service: QuantumAgentService;

  beforeEach(() => {
    service = new QuantumAgentService();
  });

  describe('getEnhancedResponse', () => {
    it('should return enhanced response with quantum reasoning when enabled', async () => {
      const result = await service.getEnhancedResponse('Test prompt', { context: 'test' });

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasoning_trace');
      expect(result).toHaveProperty('quantum_metadata');
      expect(result.confidence).toBeGreaterThan(0);
      expect(Array.isArray(result.reasoning_trace)).toBe(true);
    });

    it('should fallback to regular response when quantum reasoning is disabled', async () => {
      service.updateConfig({ enable_quantum_reasoning: false });

      const result = await service.getEnhancedResponse('Test prompt');

      expect(result).toHaveProperty('content');
      expect(result.confidence).toBe(0.8); // Default confidence for fallback
    });

    it('should handle errors gracefully and fallback', async () => {
      // Mock quantum engine to throw error
      const mockEngine = {
        exploreProblem: jest.fn().mockRejectedValue(new Error('Quantum engine error'))
      };
      (service as any).quantumEngine = mockEngine;

      const result = await service.getEnhancedResponse('Test prompt');

      expect(result).toHaveProperty('content');
      expect(result.confidence).toBe(0.5); // Lower confidence for fallback
    });

    it('should acknowledge uncertainty when confidence is below threshold', async () => {
      // Set a high confidence threshold
      service.updateConfig({ confidence_threshold: 0.9 });

      // Mock quantum engine to return a low confidence score
      const mockExploreProblem = jest.fn().mockResolvedValue({
        problem_statement: 'Test problem',
        hypotheses: [
          { id: 'hyp1', title: 'Hypothesis 1', description: 'Test hypothesis', confidence: 0.7, reasoning: 'Test reasoning', evidence: ['evidence1'] }
        ],
        reasoning_traces: [],
        topology_validation: { overall_score: 0.7 },
        best_hypothesis: { id: 'hyp1', title: 'Hypothesis 1', description: 'Test hypothesis', confidence: 0.7, reasoning: 'Test reasoning', evidence: ['evidence1'] },
        confidence_score: 0.7,
        processing_time: 100,
        metadata: { model_used: 'gemini-2.0-flash', exploration_depth: 3, validation_method: 'topology-audit', timestamp: new Date().toISOString() }
      });
      (service as any).quantumEngine.exploreProblem = mockExploreProblem;

      // Mock geminiService.chat to capture the final prompt
      const mockGeminiChat = jest.fn().mockResolvedValue({ content: 'Mock Gemini response', model: 'gemini-pro' });
      (geminiService as any).chat = mockGeminiChat;

      await service.getEnhancedResponse('Test prompt');

      // Expect the final prompt to acknowledge uncertainty
      expect(mockGeminiChat).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('If the confidence is below 0.9, acknowledge uncertainty and suggest additional information needed.')
          })
        ]),
        expect.any(Object)
      );
    });
  });

  describe('quickQuantumResponse', () => {
    it('should return quick quantum response', async () => {
      const result = await service.quickQuantumResponse('Quick test prompt');

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasoning_trace');
      expect(result).toHaveProperty('quantum_metadata');
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = { confidence_threshold: 0.9, max_hypotheses: 10 };
      service.updateConfig(newConfig);

      const config = service.getConfig();
      expect(config.confidence_threshold).toBe(0.9);
      expect(config.max_hypotheses).toBe(10);
    });

    it('should return current configuration', () => {
      const config = service.getConfig();
      expect(config).toHaveProperty('enable_quantum_reasoning');
      expect(config).toHaveProperty('confidence_threshold');
      expect(config).toHaveProperty('max_hypotheses');
    });
  });

  describe('Performance Analysis', () => {
    it('should analyze performance metrics', () => {
      const responses = [
        { confidence: 0.8, quantum_metadata: { processing_time: 100, topology_score: 0.8 } },
        { confidence: 0.7, quantum_metadata: { processing_time: 120, topology_score: 0.9 } },
        { confidence: 0.6 } // No quantum metadata
      ];

      const analysis = service.analyzePerformance(responses as any);

      expect(analysis).toHaveProperty('avgConfidence');
      expect(analysis).toHaveProperty('avgProcessingTime');
      expect(analysis).toHaveProperty('quantumUsageRate');
      expect(analysis).toHaveProperty('topologiesValidated');
      expect(analysis.avgConfidence).toBeCloseTo(0.7);
      expect(analysis.quantumUsageRate).toBe(2/3);
    });
  });
});