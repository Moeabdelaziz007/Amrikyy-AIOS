/**
 * Base MCP Server
 * Abstract base class for all MCP servers in AuraOS
 */

import { IMCPServer, Tool, ToolResponse } from './types';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});

export abstract class BaseMCPServer implements IMCPServer {
  abstract name: string;
  abstract version: string;
  abstract description?: string;
  abstract tools: Tool[];

  private initialized = false;

  /**
   * Initialize the MCP server
   * Override this method to perform setup tasks
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.info(`[MCP] Initializing server: ${this.name} v${this.version}`);
    await this.onInitialize();
    this.initialized = true;
    logger.info(`[MCP] Server ${this.name} initialized successfully`);
  }

  /**
   * Execute a tool
   */
  async executeTool(toolName: string, input: Record<string, any>): Promise<ToolResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // Find the tool
      const tool = this.tools.find((t) => t.name === toolName);
      if (!tool) {
        return {
          success: false,
          error: `Tool '${toolName}' not found in server '${this.name}'`,
        };
      }

      // Validate input
      const validationResult = this.validateInput(tool, input);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Invalid input: ${validationResult.error}`,
        };
      }

      // Execute the tool
      const result = await this.handleToolExecution(toolName, input);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Shutdown the server
   */
  async shutdown(): Promise<void> {
    logger.info(`[MCP] Shutting down server: ${this.name}`);
    await this.onShutdown();
    this.initialized = false;
  }

  /**
   * Get all available tools
   */
  getTools(): Tool[] {
    return this.tools;
  }

  /**
   * Check if server is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  // Protected methods to be overridden by subclasses

  /**
   * Called during initialization
   * Override to perform custom setup
   */
  protected async onInitialize(): Promise<void> {
    // Default: no-op
  }

  /**
   * Called during shutdown
   * Override to perform cleanup
   */
  protected async onShutdown(): Promise<void> {
    // Default: no-op
  }

  /**
   * Handle tool execution
   * Must be implemented by subclasses
   */
  protected abstract handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any>;

  /**
   * Validate tool input against schema
   */
  private validateInput(
    tool: Tool,
    input: Record<string, any>
  ): { valid: boolean; error?: string } {
    const { required = [], properties } = tool.inputSchema;

    // Check required fields
    for (const field of required) {
      if (!(field in input)) {
        return {
          valid: false,
          error: `Missing required field: ${field}`,
        };
      }
    }

    // Check field types (basic validation)
    for (const [key, _value] of Object.entries(input)) {
      if (!(key in properties)) {
        return {
          valid: false,
          error: `Unknown field: ${key}`,
        };
      }
    }

    return { valid: true };
  }
}
