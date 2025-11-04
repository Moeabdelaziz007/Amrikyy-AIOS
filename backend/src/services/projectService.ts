// backend/src/services/projectService.ts
import { supabase } from './supabase.js';

// --- Projects ---

export const getProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createProject = async (userId: string, projectData: { name: string; description: string }) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, ...projectData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProject = async (userId: string, projectId: string, projectData: { name?: string; description?: string; status?: string }) => {
    const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteProject = async (userId: string, projectId: string) => {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);
    if (error) throw error;
    return { message: 'Project deleted successfully' };
};


// --- Tasks ---

export const getTasksForProject = async (userId: string, projectId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const createTask = async (userId: string, projectId: string, taskData: { title: string }) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, project_id: projectId, ...taskData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTask = async (userId: string, taskId: string, taskData: { title?: string; completed?: boolean }) => {
    const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteTask = async (userId: string, taskId: string) => {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);
    if (error) throw error;
    return { message: 'Task deleted successfully' };
};
