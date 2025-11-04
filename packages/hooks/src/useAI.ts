// @ts-nocheck
/**
 * AI Hook
 * React hook for AI interactions
 */

import { useState, useCallback } from 'react';
// import { aiService } from '@auraos/core/ai/services';
import { useLearningLoop } from './useLearningLoop';
// import type { AIMessage, AIResponse } from '@auraos/core/ai/services/base.service';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { trackAIInteraction } = useLearningLoop();

  // Send chat message
  const chat = useCallback(async (
    messages: any[],
    options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
  ): Promise<any | null> => {
    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      // const response = await aiService.chat(messages, options);

      const duration = Date.now() - startTime;

      // Track interaction
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        // await trackAIInteraction(
        //   lastUserMessage.content,
        //   response.content,
        //   response.model,
        //   duration
        // );
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Stream chat message
  const chatStream = useCallback(async (
    messages: any[],
    onChunk: (chunk: { content: string; done: boolean }) => void,
    options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    const startTime = Date.now();
    const fullResponse = '';

    try {
      // await aiService.chatStream(messages, options || {}, (chunk) => {
      //   if (!chunk.done) {
      //     fullResponse += chunk.content;
      //   }
      //   onChunk(chunk);
      // });

      const duration = Date.now() - startTime;

      // Track interaction
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        // await trackAIInteraction(
        //   lastUserMessage.content,
        //   fullResponse,
        //   'streaming',
        //   duration
        // );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI stream failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhance note
  const enhanceNote = useCallback(async (
    content: string,
    instruction: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // const enhanced = await aiService.enhanceNote(content, instruction);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Note enhancement failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate automation
  const generateAutomation = useCallback(async (
    description: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // const automation = await aiService.generateAutomation(description);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Automation generation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get autopilot suggestion
  const getAutopilotSuggestion = useCallback(async (
    context: any
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // const suggestion = await aiService.getAutopilotSuggestion(context);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Autopilot suggestion failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    chat,
    chatStream,
    enhanceNote,
    generateAutomation,
    getAutopilotSuggestion,
  };
}