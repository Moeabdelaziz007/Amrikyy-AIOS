// backend/src/routes/projects.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as projectService from '../services/projectService.js';

const router = Router();
router.use(verifyAuth);

// --- Project Routes ---

// GET /api/projects
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const projects = await projectService.getProjects(req.user.id);
        res.json({ projects });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/projects
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const project = await projectService.createProject(req.user.id, req.body);
        res.status(201).json({ project });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/projects/:id
router.put('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
        res.json({ project });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        await projectService.deleteProject(req.user.id, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


// --- Task Routes ---

// GET /api/projects/:projectId/tasks
router.get('/:projectId/tasks', async (req: AuthenticatedRequest, res) => {
    try {
        const tasks = await projectService.getTasksForProject(req.user.id, req.params.projectId);
        res.json({ tasks });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/projects/:projectId/tasks
router.post('/:projectId/tasks', async (req: AuthenticatedRequest, res) => {
    try {
        const task = await projectService.createTask(req.user.id, req.params.projectId, req.body);
        res.status(201).json({ task });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/tasks/:taskId
router.put('/tasks/:taskId', async (req: AuthenticatedRequest, res) => {
    try {
        const task = await projectService.updateTask(req.user.id, req.params.taskId, req.body);
        res.json({ task });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/tasks/:taskId
router.delete('/tasks/:taskId', async (req: AuthenticatedRequest, res) => {
    try {
        await projectService.deleteTask(req.user.id, req.params.taskId);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
