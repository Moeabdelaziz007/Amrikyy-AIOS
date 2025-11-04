import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import {
 saveWorkflow,
 getWorkflows,
 deleteWorkflow,
 saveExecution
} from '../services/workflowService.js';
import { WorkflowExecution } from '../../../packages/automation/dist/index.js';

const router = Router();
router.use(verifyAuth);

// GET /api/workflows
router.get('/', async (req: AuthenticatedRequest, res) => {
 try {
   const workflows = await getWorkflows(req.user.id);
   res.json({ workflows });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// POST /api/workflows
router.post('/', async (req: AuthenticatedRequest, res) => {
 try {
   const workflow = await saveWorkflow({
     userId: req.user.id,
     ...req.body
   });
   res.json({ workflow });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// DELETE /api/workflows/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
 try {
   await deleteWorkflow(req.params.id);
   res.json({ message: 'Workflow deleted' });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

// POST /api/workflows/:id/execute
router.post('/:id/execute', async (req: AuthenticatedRequest, res) => {
 try {
   const { WorkflowEngine } = await import('../../../packages/automation/dist/index.js');
   const workflows = await getWorkflows(req.user.id);
   const workflow = workflows.find(w => w.id === req.params.id);

   if (!workflow) {
     return res.status(404).json({ error: 'Workflow not found' });
   }

   const engine = new WorkflowEngine();

   engine.on('workflow:complete', async (execution: WorkflowExecution) => {
     await saveExecution(execution);
   });

   const execution = await engine.execute(workflow, req.body.triggerData || {});
   res.json({ execution });
 } catch (error: any) {
   res.status(500).json({ error: error.message });
 }
});

export default router;