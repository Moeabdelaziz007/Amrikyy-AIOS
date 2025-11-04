/**
 * AIX Builder - Easy-to-use builder for creating AIX agents
 * @Moeabdelaziz007/aix-format
 * 
 * Simplifies creation of AIX agents with a fluent API
 */

import { generateAIX, type AIXGeneratorConfig, type AIXAgent, type AIXSkill, type AIXGene } from './index';

export class AIXBuilder {
  private config: Partial<AIXGeneratorConfig> = {
    skillIDs: [],
    tags: [],
  };
  private skills: AIXSkill[] = [];
  private genes: AIXGene[] = [];
  private customMeta: Record<string, any> = {};
  private customPersona: Record<string, any> = {};

  /**
   * Set agent name (required)
   */
  name(name: string): this {
    this.config.name = name;
    return this;
  }

  /**
   * Set agent role (required)
   */
  role(role: string): this {
    this.config.role = role;
    return this;
  }

  /**
   * Set agent description
   */
  description(description: string): this {
    this.config.description = description;
    return this;
  }

  /**
   * Set agent icon emoji
   */
  icon(icon: string): this {
    this.config.icon = icon;
    return this;
  }

  /**
   * Set persona/system instructions
   */
  persona(instructions: string): this {
    this.config.persona = instructions;
    return this;
  }

  /**
   * Quick persona setup with common patterns
   */
  quickPersona(type: 'friendly' | 'professional' | 'creative' | 'technical' | 'analytical'): this {
    const personas = {
      friendly: 'You are a warm, approachable AI assistant. Use casual language, emoji when appropriate, and maintain a positive, encouraging tone.',
      professional: 'You are a professional AI assistant. Maintain a formal tone, provide structured responses, and focus on efficiency and accuracy.',
      creative: 'You are a creative AI assistant. Think outside the box, suggest innovative ideas, and embrace experimentation and artistic expression.',
      technical: 'You are a technical AI expert. Provide detailed, precise information with technical accuracy. Include code examples and best practices.',
      analytical: 'You are an analytical AI assistant. Break down complex problems systematically, provide data-driven insights, and explain reasoning clearly.',
    };
    this.config.persona = personas[type];
    return this;
  }

  /**
   * Set AI model
   */
  model(model: 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash' | string): this {
    this.config.model = model;
    return this;
  }

  /**
   * Set temperature (0-2)
   */
  temperature(temp: number): this {
    this.config.temperature = Math.max(0, Math.min(2, temp));
    return this;
  }

  /**
   * Quick temperature presets
   */
  creativity(level: 'low' | 'medium' | 'high' | 'maximum'): this {
    const temps = { low: 0.3, medium: 0.7, high: 1.2, maximum: 2.0 };
    this.config.temperature = temps[level];
    return this;
  }

  /**
   * Set author
   */
  author(author: string): this {
    this.config.author = author;
    return this;
  }

  /**
   * Set framework
   */
  framework(framework: string): this {
    this.config.framework = framework;
    return this;
  }

  /**
   * Add a single MCP tool/skill
   */
  addMCP(tool: string, description?: string, priority?: number): this {
    if (!this.config.skillIDs) this.config.skillIDs = [];
    this.config.skillIDs.push(tool);
    
    this.skills.push({
      name: tool,
      description: description || tool.replace(/_/g, ' '),
      enabled: true,
      priority: priority,
    });
    
    return this;
  }

  /**
   * Add multiple MCP tools at once
   */
  addMCPs(tools: string[]): this {
    tools.forEach(tool => this.addMCP(tool));
    return this;
  }

  /**
   * Quick MCP presets for common use cases
   */
  mcpPreset(preset: 'content-creator' | 'data-analyst' | 'developer' | 'researcher' | 'creative'): this {
    const presets = {
      'content-creator': [
        'text_generation',
        'image_analysis',
        'content_planning',
        'seo_optimization',
        'social_media',
      ],
      'data-analyst': [
        'data_analysis',
        'visualization',
        'statistical_computing',
        'spreadsheet_processing',
        'report_generation',
      ],
      'developer': [
        'code_generation',
        'code_analysis',
        'debugging',
        'documentation',
        'git_operations',
      ],
      'researcher': [
        'web_search',
        'document_analysis',
        'data_extraction',
        'summarization',
        'citation_management',
      ],
      'creative': [
        'image_generation',
        'music_composition',
        'creative_writing',
        'brainstorming',
        'style_transfer',
      ],
    };
    
    return this.addMCPs(presets[preset]);
  }

  /**
   * Add tags
   */
  addTag(tag: string): this {
    if (!this.config.tags) this.config.tags = [];
    this.config.tags.push(tag);
    return this;
  }

  /**
   * Add multiple tags
   */
  addTags(tags: string[]): this {
    tags.forEach(tag => this.addTag(tag));
    return this;
  }

  /**
   * Add evolutionary gene
   */
  addGene(id: string, name: string, value: number, weight: number = 1.0): this {
    this.genes.push({ id, name, value, weight });
    return this;
  }

  /**
   * Quick gene presets
   */
  genePreset(preset: 'balanced' | 'fast' | 'creative' | 'precise'): this {
    const presets = {
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
    };
    
    presets[preset].forEach(gene => this.genes.push(gene));
    return this;
  }

  /**
   * Validate the configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.name) errors.push('Agent name is required');
    if (!this.config.role) errors.push('Agent role is required');
    if (!this.config.skillIDs || this.config.skillIDs.length === 0) {
      errors.push('At least one MCP tool/skill is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build and return AIX content
   */
  build(): string {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`AIX validation failed: ${validation.errors.join(', ')}`);
    }
    
    return generateAIX(this.config as AIXGeneratorConfig);
  }

  /**
   * Build and get the configuration object
   */
  getConfig(): AIXGeneratorConfig {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`AIX validation failed: ${validation.errors.join(', ')}`);
    }
    
    return this.config as AIXGeneratorConfig;
  }
}

/**
 * Quick helper function to create AIX builder
 */
export function createAgent(): AIXBuilder {
  return new AIXBuilder();
}

/**
 * Quick templates for common agent types
 */
export const templates = {
  /**
   * Content creator agent
   */
  contentCreator: (name: string) =>
    createAgent()
      .name(name)
      .role('Content Creator & Writer')
      .icon('✍️')
      .quickPersona('creative')
      .mcpPreset('content-creator')
      .creativity('high')
      .genePreset('creative')
      .addTags(['content', 'writing', 'creative']),

  /**
   * Data analyst agent
   */
  dataAnalyst: (name: string) =>
    createAgent()
      .name(name)
      .role('Data Analyst & Insights Expert')
      .icon('📊')
      .quickPersona('analytical')
      .mcpPreset('data-analyst')
      .creativity('low')
      .genePreset('precise')
      .addTags(['data', 'analytics', 'insights']),

  /**
   * Software developer agent
   */
  developer: (name: string) =>
    createAgent()
      .name(name)
      .role('Software Development Assistant')
      .icon('👨‍💻')
      .quickPersona('technical')
      .mcpPreset('developer')
      .creativity('medium')
      .genePreset('balanced')
      .addTags(['coding', 'development', 'programming']),

  /**
   * Research assistant agent
   */
  researcher: (name: string) =>
    createAgent()
      .name(name)
      .role('Research & Information Specialist')
      .icon('🔬')
      .quickPersona('analytical')
      .mcpPreset('researcher')
      .creativity('medium')
      .genePreset('precise')
      .addTags(['research', 'information', 'analysis']),

  /**
   * Creative assistant agent
   */
  creative: (name: string) =>
    createAgent()
      .name(name)
      .role('Creative & Artistic Assistant')
      .icon('🎨')
      .quickPersona('creative')
      .mcpPreset('creative')
      .creativity('maximum')
      .genePreset('creative')
      .addTags(['creative', 'art', 'design']),

  /**
   * Customer support agent
   */
  support: (name: string) =>
    createAgent()
      .name(name)
      .role('Customer Support Specialist')
      .icon('💬')
      .quickPersona('friendly')
      .addMCPs(['conversation', 'problem_solving', 'knowledge_base', 'ticket_management'])
      .creativity('medium')
      .genePreset('balanced')
      .addTags(['support', 'customer-service', 'help']),
};

export default AIXBuilder;
