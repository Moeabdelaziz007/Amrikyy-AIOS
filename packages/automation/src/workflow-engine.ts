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
