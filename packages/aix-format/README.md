# @Moeabdelaziz007/aix-format

**AIX (Agent Intelligence eXchange) Format** - A standardized YAML-based format for defining AI agents in Amrikyy AI OS.

Created by Mohamed Hossameldin Abdelaziz

## Overview

AIX is a comprehensive format for defining AI agents with:
- **Metadata & Versioning** - Track agent identity, version, and authorship
- **Persona Configuration** - Define behavior, tone, and personality
- **Skills & Capabilities** - Specify what the agent can do
- **Evolutionary Learning** - Configure adaptive learning parameters
- **Memory Management** - Control episodic, semantic, and procedural memory
- **API Integrations** - Connect to external services
- **Security Constraints** - Define permissions and limits

## Installation

```bash
npm install @Moeabdelaziz007/aix-format
```

## Usage

### Parsing AIX Files

```typescript
import { parseAIX, parseAIXFile } from '@Moeabdelaziz007/aix-format';

// Parse from string
const content = `
meta:
  name: "My Agent"
  ...
`;
const agent = parseAIX(content);

// Parse from File object
const file = new File([content], 'agent.aix');
const agent = await parseAIXFile(file);
```

### Generating AIX Files

```typescript
import { generateAIX, downloadAIX, createAIXFilename } from '@Moeabdelaziz007/aix-format';

const config = {
  name: 'ContentBot',
  role: 'Content Creator',
  skillIDs: ['text_generation', 'image_analysis', 'code_generation'],
  persona: 'You are a creative content generation specialist...',
  temperature: 0.8,
  author: 'Your Name',
};

// Generate AIX format
const aixContent = generateAIX(config);

// Download as file
const filename = createAIXFilename(config.name);
downloadAIX(aixContent, filename);
```

### Validating AIX

```typescript
import { validateAIX } from '@Moeabdelaziz007/aix-format';

const result = validateAIX(agentData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## AIX Format Structure

```yaml
meta:
  version: "1.0"
  id: "unique-agent-id"
  name: "Agent Name"
  description: "What this agent does"
  created: "2025-11-04T00:00:00Z"
  author: "Creator Name"
  tags: ["tag1", "tag2"]
  license: "MIT"
  framework: "google-gemini"

persona:
  role: "Agent's primary role"
  tone: "professional and helpful"
  style: "clear and efficient"
  instructions: |
    Detailed instructions for agent behavior...
  constraints:
    - "Constraint 1"
    - "Constraint 2"
  personality_traits:
    intelligence: "high"
    creativity: "medium"
  temperature: 0.7
  context_window: 32768

skills:
  - name: "skill_name"
    description: "What this skill does"
    enabled: true
    priority: 10

evolution:
  enabled: true
  genes:
    - id: "responsiveness"
      name: "Response Speed"
      value: 0.8
      weight: 0.8
  learning_rate: 0.1
  mutation_rate: 0.1

memory:
  episodic:
    enabled: true
    max_messages: 100
    retention_days: 90
  semantic:
    enabled: true
    embedding_model: "text-embedding-3-small"
    vector_db: "chromadb"

api:
  - name: "gemini_flash"
    endpoint: "https://..."
    auth_type: "api_key"
    rate_limit: 60

security:
  capabilities:
    allowed_operations:
      - "operation1"
      - "operation2"
    max_api_calls_per_minute: 60
```

## API Reference

### Types

- `AIXAgent` - Complete agent configuration
- `AIXMeta` - Metadata section
- `AIXPersona` - Persona configuration
- `AIXSkill` - Skill definition
- `AIXEvolution` - Evolution settings
- `AIXMemory` - Memory configuration
- `AIXAPI` - API integration
- `AIXSecurity` - Security constraints

### Functions

- `parseAIX(content: string): AIXAgent` - Parse AIX from string
- `parseAIXFile(file: File): Promise<AIXAgent>` - Parse AIX from file
- `generateAIX(config: AIXGeneratorConfig): string` - Generate AIX content
- `validateAIX(agent: unknown): { valid: boolean; errors: string[] }` - Validate agent
- `downloadAIX(content: string, filename: string): void` - Download AIX file
- `createAIXFilename(agentName: string): string` - Create filename
- `extractMeta(content: string): Partial<AIXMeta>` - Extract metadata

## Examples

See the `/src/aix` directory in Amrikyy AI OS for example AIX files:
- `gemini-pro.aix` - Advanced reasoning agent
- `google-maps.aix` - Location services agent
- And more...

## License

MIT License - Created by Mohamed Hossameldin Abdelaziz

Part of [Amrikyy AI OS](https://github.com/Moeabdelaziz007/Amrikyy-AIOS)
