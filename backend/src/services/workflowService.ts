import { supabase } from './supabase.js';
import { Workflow, WorkflowExecution } from '../../../packages/automation/dist/index.js';

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
