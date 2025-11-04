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
