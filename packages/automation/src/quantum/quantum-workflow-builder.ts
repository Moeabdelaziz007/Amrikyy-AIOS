/**
 * Quantum Workflow Builder
 * Fluent API for building complex automation workflows
 */

import { WorkflowStep, WorkflowDefinition, WorkflowInput, WorkflowOutput, WorkflowPermissions, WorkflowRateLimits, WorkflowErrorHandling } from './types';

export class QuantumWorkflowBuilder {
  private workflow: Partial<WorkflowDefinition> = {
    steps: [],
    inputs: [],
    outputs: [],
    permissions: {
      required: [],
      optional: [],
    },
    rateLimits: {
      maxExecutionsPerHour: 10,
      maxExecutionsPerDay: 100,
    },
    errorHandling: {
      onFailure: 'retry',
      maxRetries: 3,
      retryDelay: 1000,
    },
  };

  /**
   * Set workflow metadata
   */
  setName(name: string): this {
    this.workflow.name = name;
    return this;
  }

  setDisplayName(displayName: string): this {
    this.workflow.displayName = displayName;
    return this;
  }

  setDescription(description: string): this {
    this.workflow.description = description;
    return this;
  }

  setVersion(version: string): this {
    this.workflow.version = version;
    return this;
  }

  setCategory(category: string): this {
    this.workflow.category = category;
    return this;
  }

  setTags(tags: string[]): this {
    this.workflow.tags = tags;
    return this;
  }

  /**
   * Add a workflow step
   */
  addStep(step: WorkflowStep): this {
    if (!this.workflow.steps) {
      this.workflow.steps = [];
    }
    this.workflow.steps.push(step);
    return this;
  }

  /**
   * Add multiple steps
   */
  addSteps(steps: WorkflowStep[]): this {
    if (!this.workflow.steps) {
      this.workflow.steps = [];
    }
    this.workflow.steps.push(...steps);
    return this;
  }

  /**
   * Add workflow input
   */
  addInput(input: WorkflowInput): this {
    if (!this.workflow.inputs) {
      this.workflow.inputs = [];
    }
    this.workflow.inputs.push(input);
    return this;
  }

  /**
   * Add workflow output
   */
  addOutput(output: WorkflowOutput): this {
    if (!this.workflow.outputs) {
      this.workflow.outputs = [];
    }
    this.workflow.outputs.push(output);
    return this;
  }

  /**
   * Set permissions
   */
  setPermissions(permissions: WorkflowPermissions): this {
    this.workflow.permissions = permissions;
    return this;
  }

  /**
   * Set rate limits
   */
  setRateLimits(rateLimits: WorkflowRateLimits): this {
    this.workflow.rateLimits = rateLimits;
    return this;
  }

  /**
   * Set error handling
   */
  setErrorHandling(errorHandling: WorkflowErrorHandling): this {
    this.workflow.errorHandling = errorHandling;
    return this;
  }

  /**
   * Add conditional step
   */
  addConditionalStep(step: WorkflowStep, condition: string): this {
    const conditionalStep = {
      ...step,
      condition,
    };
    return this.addStep(conditionalStep);
  }

  /**
   * Add parallel steps
   */
  addParallelSteps(steps: WorkflowStep[]): this {
    const parallelSteps = steps.map(step => ({
      ...step,
      parallel: true,
    }));
    return this.addSteps(parallelSteps);
  }

  /**
   * Add error handling step
   */
  addErrorHandler(step: WorkflowStep): this {
    const errorStep = {
      ...step,
      condition: '{{error}}',
    };
    return this.addStep(errorStep);
  }

  /**
   * Add notification step
   */
  addNotification(step: WorkflowStep): this {
    const notificationStep = {
      ...step,
      condition: '{{completed}}',
    };
    return this.addStep(notificationStep);
  }

  /**
   * Build the workflow
   */
  build(): WorkflowStep[] {
    if (!this.workflow.steps) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate workflow
    this.validateWorkflow();

    return this.workflow.steps;
  }

  /**
   * Get workflow definition
   */
  getDefinition(): WorkflowDefinition {
    if (!this.workflow.name || !this.workflow.steps) {
      throw new Error('Workflow must have a name and steps');
    }

    return {
      name: this.workflow.name,
      displayName: this.workflow.displayName || this.workflow.name,
      description: this.workflow.description || '',
      version: this.workflow.version || '1.0.0',
      category: this.workflow.category || 'general',
      tags: this.workflow.tags || [],
      steps: this.workflow.steps,
      inputs: this.workflow.inputs || [],
      outputs: this.workflow.outputs || [],
      permissions: this.workflow.permissions || {
        required: [],
        optional: [],
      },
      rateLimits: this.workflow.rateLimits || {
        maxExecutionsPerHour: 10,
        maxExecutionsPerDay: 100,
      },
      errorHandling: this.workflow.errorHandling || {
        onFailure: 'retry',
        maxRetries: 3,
        retryDelay: 1000,
      },
    };
  }

  /**
   * Validate workflow
   */
  private validateWorkflow(): void {
    if (!this.workflow.steps || this.workflow.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Check for duplicate step IDs
    const stepIds = this.workflow.steps.map(step => step.id);
    const duplicateIds = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      throw new Error(`Duplicate step IDs found: ${duplicateIds.join(', ')}`);
    }

    // Check dependencies
    for (const step of this.workflow.steps) {
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          if (!stepIds.includes(depId)) {
            throw new Error(`Step '${step.id}' depends on non-existent step '${depId}'`);
          }
        }
      }
    }

    // Check for circular dependencies
    this.checkCircularDependencies();
  }

  /**
   * Check for circular dependencies
   */
  private checkCircularDependencies(): void {
    if (!this.workflow.steps) return;

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const visit = (stepId: string): void => {
      if (recursionStack.has(stepId)) {
        throw new Error(`Circular dependency detected involving step '${stepId}'`);
      }

      if (visited.has(stepId)) {
        return;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = this.workflow.steps!.find(s => s.id === stepId);
      if (step?.dependencies) {
        for (const depId of step.dependencies) {
          visit(depId);
        }
      }

      recursionStack.delete(stepId);
    };

    for (const step of this.workflow.steps) {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    }
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.workflow = {
      steps: [],
      inputs: [],
      outputs: [],
      permissions: {
        required: [],
        optional: [],
      },
      rateLimits: {
        maxExecutionsPerHour: 10,
        maxExecutionsPerDay: 100,
      },
      errorHandling: {
        onFailure: 'retry',
        maxRetries: 3,
        retryDelay: 1000,
      },
    };
    return this;
  }
}
