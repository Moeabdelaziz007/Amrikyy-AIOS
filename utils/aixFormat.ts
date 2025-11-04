/**
 * AIX (Agent Intelligence eXchange) Format Parser and Generator
 * For Amrikyy AI OS Agent Forge
 */

export interface AIXMeta {
  version: string;
  id: string;
  name: string;
  description: string;
  created: string;
  updated?: string;
  author: string;
  tags: string[];
  license: string;
  homepage?: string;
  language: string;
  framework: string;
}

export interface AIXPersona {
  role: string;
  tone: string;
  style: string;
  instructions: string;
  constraints?: string[];
  personality_traits?: Record<string, string>;
  temperature?: number;
  context_window?: number;
  response_format?: string;
}

export interface AIXSkill {
  name: string;
  description: string;
  enabled: boolean;
  parameters?: Record<string, any>;
  priority?: number;
}

export interface AIXGene {
  id: string;
  name: string;
  value: number;
  weight: number;
}

export interface AIXEvolution {
  enabled: boolean;
  genes: AIXGene[];
  learning_rate?: number;
  mutation_rate?: number;
  fitness_function?: string;
}

export interface AIXMemory {
  episodic?: {
    enabled: boolean;
    max_messages: number;
    retention_days: number;
    storage: string;
  };
  semantic?: {
    enabled: boolean;
    embedding_model: string;
    vector_db: string;
    max_results: number;
  };
  procedural?: {
    enabled: boolean;
    max_workflows: number;
  };
}

export interface AIXAPI {
  name: string;
  endpoint: string;
  auth_type: string;
  rate_limit: number;
  timeout?: number;
  services?: string[];
}

export interface AIXSecurity {
  checksum?: {
    algorithm: string;
    value: string;
    scope: string;
  };
  capabilities: {
    allowed_operations: string[];
    max_api_calls_per_minute: number;
    max_memory_mb?: number;
  };
}

export interface AIXAgent {
  meta: AIXMeta;
  persona: AIXPersona;
  skills: AIXSkill[];
  evolution?: AIXEvolution;
  memory?: AIXMemory;
  api?: AIXAPI[];
  security?: AIXSecurity;
}

/**
 * Parse AIX format string to AIXAgent object
 */
export function parseAIX(content: string): AIXAgent {
  // Simple YAML-like parser for AIX format
  // In production, use a proper YAML parser
  const lines = content.split('\n');
  const agent: Partial<AIXAgent> = {
    meta: {} as AIXMeta,
    persona: {} as AIXPersona,
    skills: [],
  };

  // This is a simplified parser - you would use a proper YAML library
  // For now, returning a basic structure
  return agent as AIXAgent;
}

/**
 * Generate AIX format string from agent configuration
 */
export function generateAIX(config: {
  name: string;
  role: string;
  icon: string;
  skillIDs: string[];
  persona?: string;
  model?: string;
  temperature?: number;
}): string {
  const timestamp = new Date().toISOString();
  const agentId = `amrikyy-${config.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  const aix = `# ${config.name} - AI Agent Configuration
# Part of Amrikyy AI OS - Multi-Agent System
# Created on ${new Date().toLocaleDateString()}

meta:
  version: "1.0"
  id: "${agentId}"
  name: "${config.name}"
  description: "${config.role}"
  created: "${timestamp}"
  updated: "${timestamp}"
  author: "Amrikyy AI OS User"
  tags: ${JSON.stringify(config.skillIDs.slice(0, 5))}
  license: "MIT"
  homepage: "https://github.com/Moeabdelaziz007/Amrikyy-AIOS"
  language: "en"
  framework: "google-gemini"

persona:
  role: "${config.role}"
  tone: "professional and helpful"
  style: "clear and efficient"
  instructions: |
    ${config.persona || `You are ${config.name}, a specialized AI agent for ${config.role}.
    
    Your capabilities include:
    ${config.skillIDs.map((skill, i) => `${i + 1}. ${skill.replace(/_/g, ' ')}`).join('\n    ')}
    
    You provide accurate, helpful responses and continuously improve
    through user interactions.`}
  
  constraints:
    - "Maintain factual accuracy"
    - "Respect user privacy"
    - "Avoid harmful content"
  
  personality_traits:
    intelligence: "high"
    creativity: "medium"
    precision: "high"
    adaptability: "high"
  
  temperature: ${config.temperature || 0.7}
  context_window: 32768
  response_format: "markdown"

skills:
${config.skillIDs.map((skillId, index) => `  - name: "${skillId}"
    description: "${skillId.replace(/_/g, ' ')}"
    enabled: true
    priority: ${10 - index}`).join('\n')}

evolution:
  enabled: true
  genes:
    - id: "responsiveness"
      name: "Response Speed"
      value: 0.8
      weight: 0.8
    - id: "creativity"
      name: "Creative Thinking"
      value: 0.7
      weight: 0.6
    - id: "precision"
      name: "Accuracy & Precision"
      value: 0.9
      weight: 0.9
    - id: "adaptability"
      name: "Adaptability"
      value: 0.8
      weight: 0.7
  
  learning_rate: 0.1
  mutation_rate: 0.1
  fitness_function: "user_satisfaction_weighted"

memory:
  episodic:
    enabled: true
    max_messages: 100
    retention_days: 90
    storage: "local"
  
  semantic:
    enabled: true
    embedding_model: "text-embedding-3-small"
    vector_db: "chromadb"
    max_results: 5
  
  procedural:
    enabled: true
    max_workflows: 50

api:
  - name: "${config.model || 'gemini_flash'}"
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.0-flash'}"
    auth_type: "api_key"
    rate_limit: 60
    timeout: 30

security:
  checksum:
    algorithm: "sha256"
    value: "will_be_calculated"
    scope: "content"
  
  capabilities:
    allowed_operations:
${config.skillIDs.map(skill => `      - "${skill}"`).join('\n')}
    max_api_calls_per_minute: 60
    max_memory_mb: 512
`;

  return aix;
}

/**
 * Download AIX file
 */
export function downloadAIX(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate AIX configuration
 */
export function validateAIX(agent: Partial<AIXAgent>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!agent.meta?.name) errors.push('Agent name is required');
  if (!agent.meta?.id) errors.push('Agent ID is required');
  if (!agent.persona?.role) errors.push('Agent role is required');
  if (!agent.skills || agent.skills.length === 0) errors.push('At least one skill is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}
