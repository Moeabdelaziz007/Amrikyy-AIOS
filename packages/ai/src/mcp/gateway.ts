/**
 * MCP Gateway
 * Central router for all MCP servers in AuraOS
 */

import {
  IMCPServer,
  ToolRequest,
  ToolResponse,
  MCPGatewayConfig,
  AuthContext,
  LogEntry,
  ServerRegistryEntry,
  Tool,
} from './types';
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

export class MCPGateway {
  private servers: Map<string, ServerRegistryEntry> = new Map();
  private config: MCPGatewayConfig;
  private logs: LogEntry[] = [];

  constructor(config: MCPGatewayConfig = {}) {
    this.config = {
      enableAuth: false,
      enableLogging: true,
      maxConcurrentRequests: 100,
      timeout: 30000,
      ...config,
    };

    logger.info('[MCP Gateway] Initialized with config:', this.config);
  }

  /**
   * Register an MCP server
   */
  async registerServer(server: IMCPServer): Promise<void> {
    if (this.servers.has(server.name)) {
      throw new Error(`Server '${server.name}' is already registered`);
    }

    // Initialize the server
    await server.initialize();

    this.servers.set(server.name, {
      server,
      registeredAt: new Date(),
      callCount: 0,
    });

    logger.info(`[MCP Gateway] Registered server: ${server.name} v${server.version}`);
    logger.info(`[MCP Gateway] Available tools: ${server.tools.map((t) => t.name).join(', ')}`);
  }

  /**
   * Unregister an MCP server
   */
  async unregisterServer(serverName: string): Promise<void> {
    const entry = this.servers.get(serverName);
    if (!entry) {
      throw new Error(`Server '${serverName}' is not registered`);
    }

    await entry.server.shutdown();
    this.servers.delete(serverName);

    logger.info(`[MCP Gateway] Unregistered server: ${serverName}`);
  }

  /**
   * Handle a tool execution request
   */
  async handleRequest(request: ToolRequest, auth?: AuthContext): Promise<ToolResponse> {
    const startTime = Date.now();

    try {
      // Authenticate if enabled
      if (this.config.enableAuth && !auth) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Find the server that has this tool
      const { server, serverName } = this.findServerForTool(request.tool);
      if (!server) {
        return {
          success: false,
          error: `Tool '${request.tool}' not found in any registered server`,
        };
      }

      // Update server stats
      const entry = this.servers.get(serverName)!;
      entry.callCount++;
      entry.lastUsed = new Date();

      // Execute the tool with timeout
      const result = await this.executeWithTimeout(
        server.executeTool(request.tool, request.input),
        this.config.timeout!
      );

      // Log the interaction
      if (this.config.enableLogging) {
        this.logInteraction({
          timestamp: new Date().toISOString(),
          serverId: serverName,
          toolName: request.tool,
          input: request.input,
          output: result,
          duration: Date.now() - startTime,
          userId: auth?.userId,
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get all available tools from all servers
   */
  getAllTools(): Array<Tool & { serverName: string }> {
    const tools: Array<Tool & { serverName: string }> = [];

    for (const [serverName, entry] of this.servers.entries()) {
      for (const tool of entry.server.tools) {
        tools.push({
          ...tool,
          serverName,
        });
      }
    }

    return tools;
  }

  /**
   * Get tool definitions for AI models
   */
  getToolDefinitions(): Tool[] {
    return this.getAllTools().map(({ serverName, ...tool }) => tool);
  }

  /**
   * Get server statistics
   */
  getStats() {
    const stats = {
      totalServers: this.servers.size,
      totalTools: this.getAllTools().length,
      servers: [] as Array<{
        name: string;
        version: string;
        toolCount: number;
        callCount: number;
        lastUsed?: string;
      }>,
    };

    for (const [name, entry] of this.servers.entries()) {
      stats.servers.push({
        name,
        version: entry.server.version,
        toolCount: entry.server.tools.length,
        callCount: entry.callCount,
        lastUsed: entry.lastUsed?.toISOString(),
      });
    }

    return stats;
  }

  /**
   * Get recent logs
   */
  getLogs(limit = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Shutdown all servers
   */
  async shutdown(): Promise<void> {
    logger.info('[MCP Gateway] Shutting down all servers...');

    for (const [name, entry] of this.servers.entries()) {
      await entry.server.shutdown();
      logger.info(`[MCP Gateway] Shut down server: ${name}`);
    }

    this.servers.clear();
    logger.info('[MCP Gateway] All servers shut down');
  }

  // Private methods

  private findServerForTool(toolName: string): {
    server: IMCPServer | null;
    serverName: string;
  } {
    for (const [serverName, entry] of this.servers.entries()) {
      const hasTool = entry.server.tools.some((t) => t.name === toolName);
      if (hasTool) {
        return { server: entry.server, serverName };
      }
    }

    return { server: null, serverName: '' };
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Tool execution timeout')), timeout)
      ),
    ]);
  }

  private logInteraction(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }
}
