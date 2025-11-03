/**
 * AuraOS AI Engine
 * AI services and MCP integration.
 */

// Export MCP types and classes
export { BaseMCPServer } from './mcp/server';
export { MCPGateway } from './mcp/gateway';
export { MCPClient } from './mcp/client';
export type { Tool, ToolResponse, IMCPServer } from './mcp/types';

// Export AI services
export { geminiService } from './services/gemini.service';
export { zaiService } from './services/zai.service';
export { aiService, getAIService, getAIServiceForFeature } from './services/index';