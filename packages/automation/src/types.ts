export type TriggerType = 'schedule' | 'event' | 'webhook' | 'manual';
export type ActionType = 'http_request' | 'email' | 'notification' | 'database' | 'ai_task' | 'custom';
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Trigger {
 type: TriggerType;
 config: ScheduleTriggerConfig | EventTriggerConfig | WebhookTriggerConfig | ManualTriggerConfig;
}

export interface ScheduleTriggerConfig {
 cronExpression: string; // e.g., "0 9 * * 1-5" (9am weekdays)
 timezone?: string;
}

export interface EventTriggerConfig {
 eventName: string; // e.g., "knowledge_base.insert"
 filters?: Record<string, any>;
}

export interface WebhookTriggerConfig {
 webhookId: string;
 secret: string;
}

export interface ManualTriggerConfig {
 // No config needed - user initiates
}

export interface Action {
 id: string;
 type: ActionType;
 name: string;
 config: any; // Specific to action type
 retries?: number;
 timeout?: number; // milliseconds
}

export interface Workflow {
 id: string;
 userId: string;
 name: string;
 description?: string;
 trigger: Trigger;
 actions: Action[];
 enabled: boolean;
 createdAt: Date;
 updatedAt: Date;
}

export interface WorkflowExecution {
 id: string;
 workflowId: string;
 userId: string;
 status: WorkflowStatus;
 triggerData?: any;
 result?: any;
 error?: string;
 startedAt: Date;
 completedAt?: Date;
}

export interface ExecutionContext {
 workflowId: string;
 executionId: string;
 userId: string;
 triggerData: any;
 variables: Map<string, any>;
}
