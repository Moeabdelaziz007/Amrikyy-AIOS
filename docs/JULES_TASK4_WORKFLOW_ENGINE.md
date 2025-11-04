# Task 4: Automation & Workflow Engine - Implementation Guide for Jules

**Date:** November 4, 2025  
**Assigned to:** Jules (google-labs-jules[bot])  
**Priority:** HIGH  
**Status:** Ready to Start

---

## 📋 Answers to Your Questions

### 1. **Initial Focus: What to Build First?**

**Recommended Order:**
1. **Package structure and basic types** (Day 1 morning)
2. **Core WorkflowEngine class** (Day 1 afternoon)
3. **Triggers system** (Day 2)
4. **Actions system** (Day 3)
5. **Task Scheduler** (Day 4)
6. **UI Integration** (Day 5)

**Rationale:** Start with foundation (package + types) → build execution engine → add triggers/actions → scheduling layer → UI visualization

### 2. **State Management: Zustand vs EventEmitter?**

**Recommendation: Use EventEmitter for the workflow engine**

**Why:**
- **EventEmitter** is better suited for asynchronous event-driven workflows
- Native to Node.js, no extra dependencies for backend compatibility
- Workflows are inherently event-based (trigger → execute → complete)
- Easier to integrate with WebSocket for real-time updates
- Can still use Zustand in the UI layer for workflow UI state

**Architecture:**
```typescript
// Backend/Engine: EventEmitter for workflow execution events
class WorkflowEngine extends EventEmitter {
  execute(workflow) {
    this.emit('workflow:start', workflow);
    // ... execution logic
    this.emit('workflow:complete', result);
  }
}

// Frontend/UI: Zustand for UI state management
const useWorkflowStore = create((set) => ({
  workflows: [],
  activeWorkflow: null,
  // ... UI state
}));
```

### 3. **Persistence: Database Strategy?**

**Yes, use Supabase with new tables:**

Create three new tables in Supabase:

#### `workflows` table:
```sql
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'schedule', 'event', 'webhook', 'manual'
  trigger_config JSONB NOT NULL, -- Trigger-specific configuration
  actions JSONB NOT NULL, -- Array of action definitions
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows"
  ON workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON workflows FOR DELETE
  USING (auth.uid() = user_id);
```

#### `workflow_executions` table:
```sql
CREATE TABLE workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  trigger_data JSONB, -- Data that triggered this execution
  result JSONB, -- Execution result
  error TEXT, -- Error message if failed
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own executions"
  ON workflow_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executions"
  ON workflow_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### `scheduled_tasks` table:
```sql
CREATE TABLE scheduled_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cron_expression TEXT, -- Cron format: "0 9 * * 1-5" (9am weekdays)
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks"
  ON scheduled_tasks FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🏗️ Implementation Plan

### Phase 1: Package Setup (2 hours)

**1.1 Create Package Structure**
```bash
mkdir -p packages/automation/src
cd packages/automation
npm init -y
```

**1.2 Create TypeScript Configuration**
**File:** `packages/automation/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**1.3 Update Package.json**
**File:** `packages/automation/package.json`
```json
{
  "name": "@auraos/automation",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "cron-parser": "^4.9.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

**1.4 Create Core Types**
**File:** `packages/automation/src/types.ts`
```typescript
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
```

### Phase 2: Workflow Engine Core (4 hours)

**File:** `packages/automation/src/workflow-engine.ts`
```typescript
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, WorkflowExecution, ExecutionContext, WorkflowStatus, Action } from './types.js';

export class WorkflowEngine extends EventEmitter {
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor() {
    super();
  }

  /**
   * Execute a workflow
   */
  async execute(workflow: Workflow, triggerData: any = {}): Promise<WorkflowExecution> {
    const executionId = uuidv4();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      userId: workflow.userId,
      status: 'pending',
      triggerData,
      startedAt: new Date(),
    };

    this.executions.set(executionId, execution);
    this.emit('workflow:start', execution);

    try {
      // Update status to running
      execution.status = 'running';
      this.emit('workflow:running', execution);

      // Create execution context
      const context: ExecutionContext = {
        workflowId: workflow.id,
        executionId,
        userId: workflow.userId,
        triggerData,
        variables: new Map(),
      };

      // Execute actions sequentially
      const results = [];
      for (const action of workflow.actions) {
        const result = await this.executeAction(action, context);
        results.push(result);
        
        // Store result in context for next action
        context.variables.set(`action_${action.id}_result`, result);
      }

      // Mark as completed
      execution.status = 'completed';
      execution.result = results;
      execution.completedAt = new Date();
      this.emit('workflow:complete', execution);

    } catch (error) {
      // Mark as failed
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date();
      this.emit('workflow:error', execution, error);
    }

    return execution;
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action, context: ExecutionContext): Promise<any> {
    this.emit('action:start', action, context);

    try {
      let result;

      switch (action.type) {
        case 'http_request':
          result = await this.executeHttpRequest(action, context);
          break;
        case 'email':
          result = await this.executeEmail(action, context);
          break;
        case 'notification':
          result = await this.executeNotification(action, context);
          break;
        case 'database':
          result = await this.executeDatabase(action, context);
          break;
        case 'ai_task':
          result = await this.executeAiTask(action, context);
          break;
        case 'custom':
          result = await this.executeCustom(action, context);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      this.emit('action:complete', action, context, result);
      return result;

    } catch (error) {
      this.emit('action:error', action, context, error);
      throw error;
    }
  }

  /**
   * Action executors (to be implemented)
   */
  private async executeHttpRequest(action: Action, context: ExecutionContext): Promise<any> {
    const { url, method, headers, body } = action.config;
    const response = await fetch(url, { method, headers, body: JSON.stringify(body) });
    return response.json();
  }

  private async executeEmail(action: Action, context: ExecutionContext): Promise<any> {
    // TODO: Integrate with email service
    console.log('Sending email:', action.config);
    return { sent: true };
  }

  private async executeNotification(action: Action, context: ExecutionContext): Promise<any> {
    // TODO: Integrate with notification system
    console.log('Sending notification:', action.config);
    return { sent: true };
  }

  private async executeDatabase(action: Action, context: ExecutionContext): Promise<any> {
    // TODO: Integrate with Supabase
    console.log('Database operation:', action.config);
    return { success: true };
  }

  private async executeAiTask(action: Action, context: ExecutionContext): Promise<any> {
    // TODO: Integrate with @auraos/ai package
    console.log('AI task:', action.config);
    return { result: 'AI response' };
  }

  private async executeCustom(action: Action, context: ExecutionContext): Promise<any> {
    // TODO: Execute custom function
    console.log('Custom action:', action.config);
    return { success: true };
  }

  /**
   * Validate workflow structure
   */
  validate(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow name is required');
    }

    if (!workflow.trigger) {
      errors.push('Workflow must have a trigger');
    }

    if (!workflow.actions || workflow.actions.length === 0) {
      errors.push('Workflow must have at least one action');
    }

    // Validate actions
    workflow.actions.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index + 1}: type is required`);
      }
      if (!action.config) {
        errors.push(`Action ${index + 1}: config is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions
   */
  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
}
```

### Phase 3: Task Scheduler (3 hours)

**File:** `packages/automation/src/task-scheduler.ts`
```typescript
import { EventEmitter } from 'events';
import cronParser from 'cron-parser';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledTask {
  id: string;
  workflowId: string;
  userId: string;
  cronExpression: string;
  nextRunAt: Date;
  lastRunAt?: Date;
  enabled: boolean;
}

export class TaskScheduler extends EventEmitter {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(private checkFrequency: number = 60000) { // Check every minute
    super();
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.checkInterval) {
      console.warn('Scheduler already running');
      return;
    }

    this.checkInterval = setInterval(() => {
      this.checkTasks();
    }, this.checkFrequency);

    this.emit('scheduler:start');
    console.log('Task scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();

    this.emit('scheduler:stop');
    console.log('Task scheduler stopped');
  }

  /**
   * Schedule a task
   */
  scheduleTask(workflowId: string, userId: string, cronExpression: string): ScheduledTask {
    const taskId = uuidv4();
    
    // Parse cron and get next run time
    const interval = cronParser.parseExpression(cronExpression);
    const nextRunAt = interval.next().toDate();

    const task: ScheduledTask = {
      id: taskId,
      workflowId,
      userId,
      cronExpression,
      nextRunAt,
      enabled: true,
    };

    this.tasks.set(taskId, task);
    this.emit('task:scheduled', task);
    
    return task;
  }

  /**
   * Unschedule a task
   */
  unscheduleTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    this.tasks.delete(taskId);
    
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }

    this.emit('task:unscheduled', task);
    return true;
  }

  /**
   * Check all tasks for execution
   */
  private checkTasks() {
    const now = new Date();

    this.tasks.forEach((task) => {
      if (!task.enabled) return;
      if (task.nextRunAt > now) return;

      // Task should run
      this.emit('task:trigger', task);
      
      // Update last run time
      task.lastRunAt = now;

      // Calculate next run time
      try {
        const interval = cronParser.parseExpression(task.cronExpression, {
          currentDate: now,
        });
        task.nextRunAt = interval.next().toDate();
      } catch (error) {
        console.error(`Error parsing cron for task ${task.id}:`, error);
        task.enabled = false;
      }
    });
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks for a specific workflow
   */
  getTasksForWorkflow(workflowId: string): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.workflowId === workflowId
    );
  }
}
```

### Phase 4: Export Module (30 minutes)

**File:** `packages/automation/src/index.ts`
```typescript
export * from './types.js';
export * from './workflow-engine.js';
export * from './task-scheduler.js';
```

### Phase 5: Supabase Integration Service (2 hours)

**File:** `services/workflowService.ts`
```typescript
import { supabase } from '../packages/supabase/src';
import { Workflow, WorkflowExecution } from '../packages/automation/src';

export async function saveWorkflow(workflow: Omit<Workflow, 'createdAt' | 'updatedAt'>): Promise<Workflow> {
  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: workflow.userId,
      name: workflow.name,
      description: workflow.description,
      trigger_type: workflow.trigger.type,
      trigger_config: workflow.trigger.config,
      actions: workflow.actions,
      enabled: workflow.enabled,
    })
    .select()
    .single();

  if (error) throw error;
  return mapToWorkflow(data);
}

export async function getWorkflows(userId: string): Promise<Workflow[]> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapToWorkflow);
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', workflowId);

  if (error) throw error;
}

export async function saveExecution(execution: WorkflowExecution): Promise<void> {
  const { error } = await supabase
    .from('workflow_executions')
    .insert({
      id: execution.id,
      workflow_id: execution.workflowId,
      user_id: execution.userId,
      status: execution.status,
      trigger_data: execution.triggerData,
      result: execution.result,
      error: execution.error,
      started_at: execution.startedAt.toISOString(),
      completed_at: execution.completedAt?.toISOString(),
    });

  if (error) throw error;
}

function mapToWorkflow(row: any): Workflow {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    trigger: {
      type: row.trigger_type,
      config: row.trigger_config,
    },
    actions: row.actions,
    enabled: row.enabled,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
```

---

## ✅ Checkpoints

1. **Checkpoint 1:** Package builds without errors (`npm run build` in packages/automation)
2. **Checkpoint 2:** Can create and validate a workflow
3. **Checkpoint 3:** Can execute a simple workflow with one action
4. **Checkpoint 4:** Task scheduler triggers workflows on schedule
5. **Checkpoint 5:** Workflows persist to Supabase database
6. **Checkpoint 6:** UI can create, display, and execute workflows

---

## 🚀 Next Steps After Foundation

1. Integrate with WorkflowStudioApp for visual workflow builder
2. Add more action types (AI, database, notifications)
3. Implement conditional logic and branches
4. Add workflow templates
5. Implement workflow marketplace

---

**Ready to start!** Begin with Phase 1 (Package Setup) and work through each phase sequentially.
