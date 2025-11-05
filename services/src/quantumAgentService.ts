/**
 * Quantum Enhanced Agent Service
 * Integrates quantum reasoning engine with existing agent system
 * 
 * Created by Mohamed Hossameldin Abdelaziz
 * Part of Amrikyy AI OS - Enhanced Agent Intelligence
 */

import { createQuantumReasoningEngine, quickQuantumReasoning, QuantumReasoningResult } from '../../packages/quantum-reasoning/src/index';
import { geminiService } from '../../packages/ai/src/services/gemini.service';

// Types for enhanced agent responses
export interface EnhancedAgentResponse {
  content: string;
  confidence: number;
  reasoning_trace?: string[];
  alternative_hypotheses?: Array<{
    title: string;
    confidence: number;
    reasoning: string;
  }>;
  quantum_metadata?: {
    processing_time_ms: number;
    topology_score: number;
    validation_method: string;
  };
  // processing time in ms for the whole operation
  processing_time?: number;
}

export interface QuantumAgentConfig {
  enable_quantum_reasoning: boolean;
  confidence_threshold: number;
  show_alternatives: boolean;
  max_hypotheses: number;
  exploration_depth: number;
}

/**
 * Enhanced Agent Service with Quantum Reasoning
 */
export class QuantumAgentService {
  private quantumConfig: QuantumAgentConfig;
  private quantumEngine: ReturnType<typeof createQuantumReasoningEngine>;

  constructor(config: QuantumAgentConfig = {}) {
    this.quantumConfig = {
      enable_quantum_reasoning: config.enable_quantum_reasoning ?? true,
      confidence_threshold: config.confidence_threshold ?? 0.7,
      show_alternatives: config.show_alternatives ?? true,
      max_hypotheses: config.max_hypotheses ?? 5,
      exploration_depth: config.exploration_depth ?? 3,
      ...config,
    };

    // Initialize quantum reasoning engine
    this.quantumEngine = createQuantumReasoningEngine(
      typeof import.meta !== 'undefined' && import.meta.env
        ? import.meta.env.VITE_API_KEY
        : (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined),
      {
        model: 'gemini-2.0-flash',
        // use the snake_case keys expected by the quantum engine
        exploration_depth: this.quantumConfig.exploration_depth,
        max_hypotheses: this.quantumConfig.max_hypotheses,
        confidence_threshold: this.quantumConfig.confidence_threshold,
        enable_topology_validation: true,
        temperature: 0.8,
      }
    );
  }

  /**
   * Enhanced agent response with quantum reasoning
   */
  async getEnhancedResponse(
    prompt: string,
    context?: any,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<EnhancedAgentResponse> {
    const startTime = Date.now();

    if (!this.quantumConfig.enable_quantum_reasoning) {
      // Fallback to regular Gemini service
      const response = await geminiService.chat([
        { role: 'user', content: prompt }
      ], {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });

      return {
        content: response.content,
        confidence: 0.8, // Default confidence for regular responses
        processing_time: Date.now() - startTime,
      };
    }

    try {
      // Use quantum reasoning for complex problems
      const quantumResult = await this.quantumEngine.exploreProblem(prompt, context);
      
      // Generate final response based on best hypothesis
      const finalPrompt = `
Based on the following quantum reasoning analysis, provide the best possible response:

BEST HYPOTHESIS:
Title: ${quantumResult.best_hypothesis.title}
Confidence: ${quantumResult.best_hypothesis.confidence}
Reasoning: ${quantumResult.best_hypothesis.reasoning}

ORIGINAL PROBLEM: ${prompt}

CONTEXT: ${context ? JSON.stringify(context, null, 2) : 'No additional context'}

TOPOLOGY VALIDATION:
Overall Score: ${quantumResult.topology_validation.overall_score}
Connectivity: ${quantumResult.topology_validation.connectivity_score}
Consistency: ${quantumResult.topology_validation.consistency_score}
Completeness: ${quantumResult.topology_validation.completeness_score}

Provide a comprehensive, accurate, and helpful response based on this analysis. If the confidence is below ${this.quantumConfig.confidenceThreshold}, acknowledge uncertainty and suggest additional information needed.

RESPONSE FORMAT:
Direct, clear response that addresses the user's problem based on the validated best hypothesis.
`;

      const finalResponse = await geminiService.chat([
        { role: 'user', content: finalPrompt }
      ], {
        temperature: 0.3, // Lower temperature for more deterministic responses
        maxTokens: 2000,
      });

      const processingTime = Date.now() - startTime;

      return {
        content: finalResponse.content,
        confidence: quantumResult.confidence_score,
        reasoning_trace: quantumResult.reasoning_traces.map(trace => 
          `Step ${trace.step_number}: ${trace.description}`
        ),
        alternative_hypotheses: this.quantumConfig.showAlternatives 
          ? quantumResult.hypotheses.slice(1, 3).map(h => ({
              title: h.title,
              confidence: h.confidence,
              reasoning: h.reasoning.substring(0, 100) + '...',
            }))
          : undefined,
        quantum_metadata: {
          processing_time: quantumResult.processing_time,
          topology_score: quantumResult.topology_validation.overall_score,
          validation_method: quantumResult.metadata.validation_method,
        },
        processing_time: processingTime,
      };

    } catch (error) {
      console.error('Quantum reasoning failed, falling back to regular response:', error);
      
      // Fallback to regular service
      const fallbackResponse = await geminiService.chat([
        { role: 'user', content: prompt }
      ], options);

      return {
        content: fallbackResponse.content,
        confidence: 0.5, // Lower confidence for fallback
        processing_time: Date.now() - startTime,
      };
    }
  }

  /**
   * Quick quantum reasoning for simple queries
   */
  async quickQuantumResponse(prompt: string): Promise<EnhancedAgentResponse> {
    try {
      const quantumResult = await quickQuantumReasoning(
        typeof import.meta !== 'undefined' && import.meta.env
          ? import.meta.env.VITE_API_KEY
          : (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined),
        prompt
      );

      return {
        content: quantumResult.best_hypothesis.description,
        confidence: quantumResult.confidence_score,
        reasoning_trace: quantumResult.reasoning_traces.map(trace => 
          `Step ${trace.step_number}: ${trace.description}`
        ),
        quantum_metadata: {
          processing_time: quantumResult.processing_time,
          topology_score: quantumResult.topology_validation.overall_score,
          validation_method: quantumResult.metadata.validation_method,
        },
      };

    } catch (error) {
      console.error('Quick quantum reasoning failed:', error);
      
      const fallbackResponse = await geminiService.chat([
        { role: 'user', content: prompt }
      ]);

      return {
        content: fallbackResponse.content,
        confidence: 0.6,
      };
    }
  }

  /**
   * Update quantum configuration
   */
  updateConfig(newConfig: Partial<QuantumAgentConfig>): void {
    this.quantumConfig = { ...this.quantumConfig, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): QuantumAgentConfig {
    return { ...this.quantumConfig };
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): QuantumAgentConfig {
    return {
      enable_quantum_reasoning: true,
      confidence_threshold: 0.7,
      show_alternatives: true,
      max_hypotheses: 5,
      exploration_depth: 3,
    };
  }

  /**
   * Analyze agent performance metrics
   */
  analyzePerformance(responses: EnhancedAgentResponse[]): {
    avgConfidence: number;
    avgProcessingTime: number;
    quantumUsageRate: number;
    topologiesValidated: number;
  } {
    const quantumResponses = responses.filter(r => r.quantum_metadata);
    
    return {
      avgConfidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      avgProcessingTime: responses.reduce((sum, r) => sum + (r.processing_time || 0), 0) / responses.length,
      quantumUsageRate: quantumResponses.length / responses.length,
      topologiesValidated: quantumResponses.filter(r => r.quantum_metadata?.topology_score && r.quantum_metadata.topology_score > 0.7).length,
    };
  }
}

// Export singleton instance
export const quantumAgentService = new QuantumAgentService();

// Export types and utilities
export type { EnhancedAgentResponse, QuantumAgentConfig };
export { quantumAgentService as default };
