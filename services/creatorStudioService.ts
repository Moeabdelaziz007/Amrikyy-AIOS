// services/creatorStudioService.ts
import { supabase } from './supabaseClient'; // Assuming you have a supabase client setup for frontend
import { Project, Task } from '../types';

const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return `Bearer ${session?.access_token}`;
};

// --- Projects API ---

export const getProjects = async (): Promise<Project[]> => {
    const response = await fetch('/api/projects', {
        headers: { 'Authorization': await getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    const { projects } = await response.json();
    return projects;
};

export const createProject = async (project: { name: string; description: string }): Promise<Project> => {
    const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': await getAuthHeader()
        },
        body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error('Failed to create project');
    const { project: newProject } = await response.json();
    return newProject;
};

// --- Tasks API ---

export const getTasks = async (projectId: string): Promise<Task[]> => {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { 'Authorization': await getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const { tasks } = await response.json();
    return tasks;
};

export const createTask = async (projectId: string, task: { title: string }): Promise<Task> => {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': await getAuthHeader()
        },
        body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    const { task: newTask } = await response.json();
    return newTask;
};

export const updateTask = async (taskId: string, updates: { title?: string; completed?: boolean }): Promise<Task> => {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': await getAuthHeader()
        },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update task');
    const { task: updatedTask } = await response.json();
    return updatedTask;
};

export const deleteTask = async (taskId: string): Promise<void> => {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': await getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to delete task');
};
