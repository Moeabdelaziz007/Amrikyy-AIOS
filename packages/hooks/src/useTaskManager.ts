import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface UseTaskManagerOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseTaskManagerReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  filterTasks: (filter: 'all' | 'pending' | 'completed' | 'high-priority') => Task[];
  clearCompleted: () => void;
  getTaskStats: () => {
    total: number;
    pending: number;
    completed: number;
    highPriority: number;
  };
}

/**
 * Hook for intelligent task management with local state
 * Provides CRUD operations and filtering capabilities
 */
export function useTaskManager(options: UseTaskManagerOptions = {}): UseTaskManagerReturn {
  const { autoRefresh = false, refreshInterval = 60000 } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID
  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new task
  const addTask = useCallback((task: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  // Update an existing task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }, []);

  // Delete a task
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  // Toggle task between pending and completed
  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newStatus = task.status === 'completed' ? 'pending' : 'completed';
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  }, []);

  // Filter tasks
  const filterTasks = useCallback(
    (filter: 'all' | 'pending' | 'completed' | 'high-priority') => {
      switch (filter) {
        case 'pending':
          return tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
        case 'completed':
          return tasks.filter((t) => t.status === 'completed');
        case 'high-priority':
          return tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent');
        default:
          return tasks;
      }
    },
    [tasks]
  );

  // Clear all completed tasks
  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => task.status !== 'completed'));
  }, []);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      highPriority: tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').length,
    };
  }, [tasks]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('amrikyy_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (err) {
      console.error('Failed to load tasks from localStorage:', err);
    }
  }, []);

  // Save tasks to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('amrikyy_tasks', JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
    }
  }, [tasks]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger any refresh logic here
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    filterTasks,
    clearCompleted,
    getTaskStats,
  };
}
