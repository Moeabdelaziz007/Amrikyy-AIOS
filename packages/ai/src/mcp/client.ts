/**
 * MCP Client
 * Client for interacting with MCP Gateway
 */

import { ToolRequest, ToolResponse, Tool } from './types';
import { MCPGateway } from './gateway';

export class MCPClient {
  private gateway: MCPGateway;
  private userId?: string;
  private sessionId?: string;

  constructor(gateway: MCPGateway, userId?: string, sessionId?: string) {
    this.gateway = gateway;
    this.userId = userId;
    this.sessionId = sessionId;
  }

  /**
   * Execute a tool
   */
  async executeTool(toolName: string, input: Record<string, any>): Promise<ToolResponse> {
    const request: ToolRequest = {
      tool: toolName,
      input,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    return this.gateway.handleRequest(request, {
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId || 'default',
      permissions: [],
    });
  }

  /**
   * Get all available tools
   */
  getAvailableTools(): Tool[] {
    return this.gateway.getToolDefinitions();
  }

  /**
   * Get tools by category/server
   */
  getToolsByServer(serverName: string): Tool[] {
    return this.gateway
      .getAllTools()
      .filter((t) => t.serverName === serverName)
      .map(({ serverName, ...tool }) => tool);
  }

  /**
   * Search for tools by name or description
   */
  searchTools(query: string): Tool[] {
    const lowerQuery = query.toLowerCase();
    return this.gateway.getToolDefinitions().filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get gateway statistics
   */
  getStats() {
    return this.gateway.getStats();
  }

  /**
   * Set user context
   */
  setUser(userId: string, sessionId?: string): void {
    this.userId = userId;
    this.sessionId = sessionId;
  }
}
