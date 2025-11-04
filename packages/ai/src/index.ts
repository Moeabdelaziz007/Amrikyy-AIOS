/**
 * AuraOS AI Engine
 * AI services and MCP integration.
 */

// Export only client-safe MCP types and classes
// export { BaseMCPServer } from './mcp/server';  // Server-side
// export { MCPGateway } from './mcp/gateway';    // Server-side
export { MCPClient } from './mcp/client';
export type { Tool, ToolResponse, IMCPServer } from './mcp/types';

// Export AI services
export { geminiService } from './services/gemini.service';
export { zaiService } from './services/zai.service';
export { aiService, getAIService, getAIServiceForFeature } from './services/index';