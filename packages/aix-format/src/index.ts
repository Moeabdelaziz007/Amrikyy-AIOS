/**
 * @Moeabdelaziz007/aix-format
 * AIX (Agent Intelligence eXchange) Format - All-in-One
 * 
 * Created by Mohamed Hossameldin Abdelaziz
 * Part of Amrikyy AI OS
 * 
 * Complete AIX format implementation with:
 * - Parser & Generator
 * - Easy Builder API
 * - Templates & Presets
 * - Validation
 * - All utilities in one file
 */

import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import { z } from 'zod';

// ============================================
// CONSTANTS & PRESETS
// ============================================

export const MCP_PRESETS = {
  'content-creator': ['text_generation', 'image_analysis', 'content_planning', 'seo_optimization', 'social_media'],
  'data-analyst': ['data_analysis', 'visualization', 'statistical_computing', 'spreadsheet_processing', 'report_generation'],
  'developer': ['code_generation', 'code_analysis', 'debugging', 'documentation', 'git_operations'],
  'researcher': ['web_search', 'document_analysis', 'data_extraction', 'summarization', 'citation_management'],
  'creative': ['image_generation', 'music_composition', 'creative_writing', 'brainstorming', 'style_transfer'],
  'support': ['conversation', 'problem_solving', 'knowledge_base', 'ticket_management', 'sentiment_analysis'],
  'travel': ['flight_search', 'hotel_booking', 'itinerary_planning', 'maps_navigation', 'translation'],
  'finance': ['budget_analysis', 'expense_tracking', 'investment_advice', 'market_analysis', 'reporting'],
} as const;

export const PERSONA_PRESETS = {
  friendly: 'You are a warm, approachable AI assistant. Use casual language, emoji when appropriate, and maintain a positive, encouraging tone.',
  professional: 'You are a professional AI assistant. Maintain a formal tone, provide structured responses, and focus on efficiency and accuracy.',
  creative: 'You are a creative AI assistant. Think outside the box, suggest innovative ideas, and embrace experimentation and artistic expression.',
  technical: 'You are a technical AI expert. Provide detailed, precise information with technical accuracy. Include code examples and best practices.',
  analytical: 'You are an analytical AI assistant. Break down complex problems systematically, provide data-driven insights, and explain reasoning clearly.',
  empathetic: 'You are an empathetic AI assistant. Show understanding and compassion, actively listen, and provide supportive, thoughtful responses.',
} as const;

export const GENE_PRESETS = {
  balanced: [
    { id: 'responsiveness', name: 'Response Speed', value: 0.8, weight: 0.8 },
    { id: 'creativity', name: 'Creative Thinking', value: 0.7, weight: 0.7 },
    { id: 'precision', name: 'Accuracy', value: 0.8, weight: 0.8 },
    { id: 'adaptability', name: 'Adaptability', value: 0.7, weight: 0.7 },
  ],
  fast: [
    { id: 'responsiveness', name: 'Response Speed', value: 0.95, weight: 0.9 },
    { id: 'creativity', name: 'Creative Thinking', value: 0.5, weight: 0.5 },
    { id: 'precision', name: 'Accuracy', value: 0.7, weight: 0.6 },
    { id: 'adaptability', name: 'Adaptability', value: 0.8, weight: 0.7 },
  ],
  creative: [
    { id: 'responsiveness', name: 'Response Speed', value: 0.7, weight: 0.6 },
    { id: 'creativity', name: 'Creative Thinking', value: 0.95, weight: 0.9 },
    { id: 'precision', name: 'Accuracy', value: 0.6, weight: 0.5 },
    { id: 'adaptability', name: 'Adaptability', value: 0.9, weight: 0.8 },
  ],
  precise: [
    { id: 'responsiveness', name: 'Response Speed', value: 0.6, weight: 0.6 },
    { id: 'creativity', name: 'Creative Thinking', value: 0.5, weight: 0.5 },
    { id: 'precision', name: 'Accuracy', value: 0.95, weight: 0.95 },
    { id: 'adaptability', name: 'Adaptability', value: 0.7, weight: 0.7 },
  ],
} as const;

// ============================================
// SCHEMA DEFINITIONS
// ============================================

const MetaSchema = z.object({
  version: z.string(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  created: z.string(),
  updated: z.string().optional(),
  author: z.string(),
  tags: z.array(z.string()),
  license: z.string(),
  homepage: z.string().optional(),
  language: z.string(),
  framework: z.string(),
});

const PersonaSchema = z.object({
  role: z.string(),
  tone: z.string(),
  style: z.string(),
  instructions: z.string(),
  constraints: z.array(z.string()).optional(),
  personality_traits: z.record(z.string()).optional(),
  temperature: z.number().optional(),
  context_window: z.number().optional(),
  response_format: z.string().optional(),
});

const SkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  parameters: z.record(z.any()).optional(),
  priority: z.number().optional(),
});

const GeneSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  weight: z.number(),
});

const EvolutionSchema = z.object({
  enabled: z.boolean(),
  genes: z.array(GeneSchema),
  learning_rate: z.number().optional(),
  mutation_rate: z.number().optional(),
  fitness_function: z.string().optional(),
});

const MemorySchema = z.object({
  episodic: z.object({
    enabled: z.boolean(),
    max_messages: z.number(),
    retention_days: z.number(),
    storage: z.string(),
  }).optional(),
  semantic: z.object({
    enabled: z.boolean(),
    embedding_model: z.string(),
    vector_db: z.string(),
    max_results: z.number(),
  }).optional(),
  procedural: z.object({
    enabled: z.boolean(),
    max_workflows: z.number(),
  }).optional(),
});

const APISchema = z.object({
  name: z.string(),
  endpoint: z.string(),
  auth_type: z.string(),
  rate_limit: z.number(),
  timeout: z.number().optional(),
  services: z.array(z.string()).optional(),
});

const SecuritySchema = z.object({
  checksum: z.object({
    algorithm: z.string(),
    value: z.string(),
    scope: z.string(),
  }).optional(),
  capabilities: z.object({
    allowed_operations: z.array(z.string()),
    max_api_calls_per_minute: z.number(),
    max_memory_mb: z.number().optional(),
  }),
});

const AIXSchema = z.object({
  meta: MetaSchema,
  persona: PersonaSchema,
  skills: z.array(SkillSchema),
  evolution: EvolutionSchema.optional(),
  memory: MemorySchema.optional(),
  api: z.array(APISchema).optional(),
  security: SecuritySchema.optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type AIXMeta = z.infer<typeof MetaSchema>;
export type AIXPersona = z.infer<typeof PersonaSchema>;
export type AIXSkill = z.infer<typeof SkillSchema>;
export type AIXGene = z.infer<typeof GeneSchema>;
export type AIXEvolution = z.infer<typeof EvolutionSchema>;
export type AIXMemory = z.infer<typeof MemorySchema>;
export type AIXAPI = z.infer<typeof APISchema>;
export type AIXSecurity = z.infer<typeof SecuritySchema>;
export type AIXAgent = z.infer<typeof AIXSchema>;

// ============================================
// PARSER
// ============================================

/**
 * Parse AIX format string to AIXAgent object
 * @param content - AIX format string (YAML)
 * @returns Parsed and validated AIXAgent object
 */
export function parseAIX(content: string): AIXAgent {
  try {
    // Remove comments and parse YAML
    const data = parseYAML(content);
    
    // Validate against schema
    const validated = AIXSchema.parse(data);
    
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`AIX validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw new Error(`Failed to parse AIX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse AIX file from File object
 */
export async function parseAIXFile(file: File): Promise<AIXAgent> {
  const content = await file.text();
  return parseAIX(content);
}

// ============================================
// GENERATOR
// ============================================

export interface AIXGeneratorConfig {
  name: string;
  role: string;
  description?: string;
  skillIDs: string[];
  icon?: string;
  persona?: string;
  model?: string;
  temperature?: number;
  author?: string;
  tags?: string[];
  framework?: string;
}

/**
 * Generate AIX format string from configuration
 * @param config - Agent configuration
 * @returns AIX format string (YAML)
 */
export function generateAIX(config: AIXGeneratorConfig): string {
  const timestamp = new Date().toISOString();
  const agentId = `amrikyy-${config.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  const agent: AIXAgent = {
    meta: {
      version: '1.0',
      id: agentId,
      name: config.name,
      description: config.description || config.role,
      created: timestamp,
      updated: timestamp,
      author: config.author || 'Amrikyy AI OS User',
      tags: config.tags || config.skillIDs.slice(0, 5),
      license: 'MIT',
      homepage: 'https://github.com/Moeabdelaziz007/Amrikyy-AIOS',
      language: 'en',
      framework: config.framework || 'google-gemini',
    },
    persona: {
      role: config.role,
      tone: 'professional and helpful',
      style: 'clear and efficient',
      instructions: config.persona || `You are ${config.name}, a specialized AI agent for ${config.role}.

Your capabilities include:
${config.skillIDs.map((skill, i) => `${i + 1}. ${skill.replace(/_/g, ' ')}`).join('\n')}

You provide accurate, helpful responses and continuously improve through user interactions.`,
      constraints: [
        'Maintain factual accuracy',
        'Respect user privacy',
        'Avoid harmful content',
      ],
      personality_traits: {
        intelligence: 'high',
        creativity: 'medium',
        precision: 'high',
        adaptability: 'high',
      },
      temperature: config.temperature || 0.7,
      context_window: 32768,
      response_format: 'markdown',
    },
    skills: config.skillIDs.map((skillId, index) => ({
      name: skillId,
      description: skillId.replace(/_/g, ' '),
      enabled: true,
      priority: 10 - index,
    })),
    evolution: {
      enabled: true,
      genes: [
        { id: 'responsiveness', name: 'Response Speed', value: 0.8, weight: 0.8 },
        { id: 'creativity', name: 'Creative Thinking', value: 0.7, weight: 0.6 },
        { id: 'precision', name: 'Accuracy & Precision', value: 0.9, weight: 0.9 },
        { id: 'adaptability', name: 'Adaptability', value: 0.8, weight: 0.7 },
      ],
      learning_rate: 0.1,
      mutation_rate: 0.1,
      fitness_function: 'user_satisfaction_weighted',
    },
    memory: {
      episodic: {
        enabled: true,
        max_messages: 100,
        retention_days: 90,
        storage: 'local',
      },
      semantic: {
        enabled: true,
        embedding_model: 'text-embedding-3-small',
        vector_db: 'chromadb',
        max_results: 5,
      },
      procedural: {
        enabled: true,
        max_workflows: 50,
      },
    },
    api: [
      {
        name: config.model || 'gemini_flash',
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.0-flash'}`,
        auth_type: 'api_key',
        rate_limit: 60,
        timeout: 30,
      },
    ],
    security: {
      checksum: {
        algorithm: 'sha256',
        value: 'will_be_calculated',
        scope: 'content',
      },
      capabilities: {
        allowed_operations: config.skillIDs,
        max_api_calls_per_minute: 60,
        max_memory_mb: 512,
      },
    },
  };

  // Generate YAML with comments
  const yaml = stringifyYAML(agent);
  const header = `# ${config.name} - AI Agent Configuration
# Part of Amrikyy AI OS - Multi-Agent System
# Created by ${config.author || 'Amrikyy AI OS User'}
# Created on ${new Date().toLocaleDateString()}
#
# This agent provides ${config.role}

`;

  return header + yaml;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Validate AIX agent configuration
 */
export function validateAIX(agent: unknown): { valid: boolean; errors: string[] } {
  try {
    AIXSchema.parse(agent);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Download AIX file to user's computer
 */
export function downloadAIX(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.aix') ? filename : `${filename}.aix`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create filename from agent name
 */
export function createAIXFilename(agentName: string): string {
  return `${agentName.toLowerCase().replace(/\s+/g, '-')}.aix`;
}

/**
 * Extract metadata from AIX content without full parsing
 */
export function extractMeta(content: string): Partial<AIXMeta> {
  try {
    const data = parseYAML(content);
    return data.meta || {};
  } catch {
    return {};
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  parse: parseAIX,
  parseFile: parseAIXFile,
  generate: generateAIX,
  validate: validateAIX,
  download: downloadAIX,
  createFilename: createAIXFilename,
  extractMeta,
};

// ============================================
// BUILDER API - Easy Agent Creation
// ============================================

export class AIXBuilder {
  private config: Partial<AIXGeneratorConfig> = {
    skillIDs: [],
    tags: [],
  };

  /** Set agent name (required) */
  name(name: string): this {
    this.config.name = name;
    return this;
  }

  /** Set agent role (required) */
  role(role: string): this {
    this.config.role = role;
    return this;
  }

  /** Set description */
  description(description: string): this {
    this.config.description = description;
    return this;
  }

  /** Set icon emoji */
  icon(icon: string): this {
    this.config.icon = icon;
    return this;
  }

  /** Set custom persona instructions */
  persona(instructions: string): this {
    this.config.persona = instructions;
    return this;
  }

  /** Use preset persona */
  quickPersona(type: keyof typeof PERSONA_PRESETS): this {
    this.config.persona = PERSONA_PRESETS[type];
    return this;
  }

  /** Set AI model */
  model(model: string): this {
    this.config.model = model;
    return this;
  }

  /** Set temperature (0-2) */
  temperature(temp: number): this {
    this.config.temperature = Math.max(0, Math.min(2, temp));
    return this;
  }

  /** Quick creativity presets */
  creativity(level: 'low' | 'medium' | 'high' | 'maximum'): this {
    const temps = { low: 0.3, medium: 0.7, high: 1.2, maximum: 2.0 };
    this.config.temperature = temps[level];
    return this;
  }

  /** Set author */
  author(author: string): this {
    this.config.author = author;
    return this;
  }

  /** Set framework */
  framework(framework: string): this {
    this.config.framework = framework;
    return this;
  }

  /** Add single MCP tool */
  mcp(tool: string): this {
    if (!this.config.skillIDs) this.config.skillIDs = [];
    this.config.skillIDs.push(tool);
    return this;
  }

  /** Add multiple MCP tools */
  mcps(...tools: string[]): this {
    tools.forEach(tool => this.mcp(tool));
    return this;
  }

  /** Use MCP preset */
  mcpPreset(preset: keyof typeof MCP_PRESETS): this {
    return this.mcps(...MCP_PRESETS[preset]);
  }

  /** Add tag */
  tag(tag: string): this {
    if (!this.config.tags) this.config.tags = [];
    this.config.tags.push(tag);
    return this;
  }

  /** Add multiple tags */
  tags(...tags: string[]): this {
    tags.forEach(t => this.tag(t));
    return this;
  }

  /** Validate configuration */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.config.name) errors.push('Name required');
    if (!this.config.role) errors.push('Role required');
    if (!this.config.skillIDs?.length) errors.push('At least one MCP tool required');
    return { valid: errors.length === 0, errors };
  }

  /** Build AIX content */
  build(): string {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`AIX validation failed: ${validation.errors.join(', ')}`);
    }
    return generateAIX(this.config as AIXGeneratorConfig);
  }

  /** Get configuration object */
  getConfig(): AIXGeneratorConfig {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`AIX validation failed: ${validation.errors.join(', ')}`);
    }
    return this.config as AIXGeneratorConfig;
  }
}

// ============================================
// QUICK HELPERS
// ============================================

/** Create new agent builder */
export function aix() {
  return new AIXBuilder();
}

/** Quick agent templates */
export const quick = {
  /** Content creator */
  contentCreator: (name: string) =>
    aix()
      .name(name)
      .role('Content Creator & Writer')
      .icon('✍️')
      .quickPersona('creative')
      .mcpPreset('content-creator')
      .creativity('high')
      .tags('content', 'writing', 'creative'),

  /** Data analyst */
  dataAnalyst: (name: string) =>
    aix()
      .name(name)
      .role('Data Analyst & Insights Expert')
      .icon('📊')
      .quickPersona('analytical')
      .mcpPreset('data-analyst')
      .creativity('low')
      .tags('data', 'analytics', 'insights'),

  /** Developer */
  developer: (name: string) =>
    aix()
      .name(name)
      .role('Software Development Assistant')
      .icon('👨‍💻')
      .quickPersona('technical')
      .mcpPreset('developer')
      .creativity('medium')
      .tags('coding', 'development', 'programming'),

  /** Researcher */
  researcher: (name: string) =>
    aix()
      .name(name)
      .role('Research & Information Specialist')
      .icon('🔬')
      .quickPersona('analytical')
      .mcpPreset('researcher')
      .creativity('medium')
      .tags('research', 'information', 'analysis'),

  /** Creative */
  creative: (name: string) =>
    aix()
      .name(name)
      .role('Creative & Artistic Assistant')
      .icon('🎨')
      .quickPersona('creative')
      .mcpPreset('creative')
      .creativity('maximum')
      .tags('creative', 'art', 'design'),

  /** Support */
  support: (name: string) =>
    aix()
      .name(name)
      .role('Customer Support Specialist')
      .icon('💬')
      .quickPersona('empathetic')
      .mcpPreset('support')
      .creativity('medium')
      .tags('support', 'customer-service', 'help'),

  /** Travel */
  travel: (name: string) =>
    aix()
      .name(name)
      .role('Travel Planning Specialist')
      .icon('✈️')
      .quickPersona('friendly')
      .mcpPreset('travel')
      .creativity('medium')
      .tags('travel', 'planning', 'destinations'),

  /** Finance */
  finance: (name: string) =>
    aix()
      .name(name)
      .role('Financial Advisor & Budget Expert')
      .icon('💰')
      .quickPersona('professional')
      .mcpPreset('finance')
      .creativity('low')
      .tags('finance', 'budget', 'money'),
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Core functions
  parse: parseAIX,
  parseFile: parseAIXFile,
  generate: generateAIX,
  validate: validateAIX,
  download: downloadAIX,
  
  // Builder
  aix,
  builder: AIXBuilder,
  
  // Quick templates
  quick,
  
  // Presets
  presets: {
    mcp: MCP_PRESETS,
    persona: PERSONA_PRESETS,
    genes: GENE_PRESETS,
  },
  
  // Utilities
  createFilename,
  extractMeta,
};
