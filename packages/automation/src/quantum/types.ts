/**
 * Quantum Workflow Types
 * Type definitions for the Quantum Workflow Engine
 */

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tool: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  dependencies?: string[];
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  timeout?: number;
  condition?: string;
  parallel?: boolean;
}

export interface WorkflowDefinition {
  name: string;
  displayName: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  steps: WorkflowStep[];
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  permissions: WorkflowPermissions;
  rateLimits: WorkflowRateLimits;
  errorHandling: WorkflowErrorHandling;
}

export interface WorkflowInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  default?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
}

export interface WorkflowOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
}

export interface WorkflowPermissions {
  required: string[];
  optional: string[];
}

export interface WorkflowRateLimits {
  maxExecutionsPerHour: number;
  maxExecutionsPerDay: number;
}

export interface WorkflowErrorHandling {
  onFailure: 'retry' | 'skip' | 'stop' | 'notify-user';
  maxRetries: number;
  retryDelay: number;
  fallbackAction?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  steps: WorkflowStepExecution[];
}

export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  attempts: number;
  duration?: number;
}

export interface WorkflowStats {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecution?: Date;
  errorRate: number;
  mostCommonErrors: Array<{
    error: string;
    count: number;
  }>;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowSchedule {
  cron: string;
  timezone: string;
  enabled: boolean;
}

export interface WorkflowWebhook {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key';
    token: string;
  };
}

export interface WorkflowEvent {
  eventType: string;
  filters?: Record<string, any>;
  conditions?: string[];
}
