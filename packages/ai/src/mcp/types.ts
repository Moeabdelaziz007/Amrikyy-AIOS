/**
 * MCP Types for AuraOS
 * Core type definitions for Model Context Protocol integration
 */

import { z } from 'zod';

// Tool definition schema
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.any()),
    required: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.any()),
  }).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;

// Tool execution request
export interface ToolRequest {
  tool: string;
  input: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

// Tool execution response
export interface ToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    timestamp?: string;
  };
}

// MCP Server interface
export interface IMCPServer {
  name: string;
  version: string;
  description?: string;
  tools: Tool[];
  
  initialize(): Promise<void>;
  executeTool(toolName: string, input: Record<string, any>): Promise<ToolResponse>;
  shutdown(): Promise<void>;
}

// MCP Gateway configuration
export interface MCPGatewayConfig {
  enableAuth?: boolean;
  enableLogging?: boolean;
  maxConcurrentRequests?: number;
  timeout?: number;
}

// Authentication context
export interface AuthContext {
  userId: string;
  sessionId: string;
  permissions: string[];
}

// Log entry
export interface LogEntry {
  timestamp: string;
  serverId: string;
  toolName: string;
  input: Record<string, any>;
  output: ToolResponse;
  duration: number;
  userId?: string;
}

// Server registry entry
export interface ServerRegistryEntry {
  server: IMCPServer;
  registeredAt: Date;
  lastUsed?: Date;
  callCount: number;
}
