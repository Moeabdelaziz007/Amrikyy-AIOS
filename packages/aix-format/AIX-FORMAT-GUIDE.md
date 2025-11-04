# AIX Format - All-in-One Agent Definition

## 🎯 What is AIX?

**AIX (Agent Intelligence eXchange)** is Mohamed Abdelaziz's format for defining AI agents in a single, comprehensive file. 

**Everything about an agent in ONE place:**
- ✅ Who the agent is (identity)
- ✅ How it behaves (persona) 
- ✅ What it can do (MCP tools/skills)
- ✅ How it learns (evolution)
- ✅ What it remembers (memory)
- ✅ How it connects (APIs)
- ✅ What it's allowed to do (security)

## 📄 The AIX File - Complete Agent in One File

```yaml
# agent-name.aix - Everything in one file!

meta:              # WHO is this agent?
  name: "AgentName"
  role: "What it does"
  
persona:           # HOW does it behave?
  instructions: |
    Detailed behavior...
  tone: "professional"
  
skills:            # WHAT can it do? (MCP Tools)
  - name: "tool1"
    mcp_tool: true
  - name: "tool2"
    mcp_tool: true
    
evolution:         # HOW does it learn?
  genes: [...]
  
memory:            # WHAT does it remember?
  episodic: {...}
  semantic: {...}
  
api:               # HOW does it connect?
  - name: "gemini"
    endpoint: "..."
    
security:          # WHAT is it allowed to do?
  capabilities:
    allowed_operations: [...]
```

## 🚀 Quick Start

### Using the Builder (Easy Way)

```typescript
import { aix, quick } from '@Moeabdelaziz007/aix-format';

// Method 1: Use quick templates
const agent = quick.contentCreator('ContentBot').build();

// Method 2: Custom builder
const agent = aix()
  .name('MyAgent')
  .role('Content Creator')
  .icon('✍️')
  .quickPersona('creative')
  .mcpPreset('content-creator')
  .creativity('high')
  .build();

// Save as .aix file
downloadAIX(agent, 'my-agent.aix');
```

### Manual Creation

Create a `.aix` file:

```yaml
meta:
  name: "ContentBot"
  role: "Content Creator"
  
persona:
  role: "Content Creator & Writer"
  instructions: |
    You are an expert content creator...
  temperature: 0.9

skills:
  - name: "text_generation"
    mcp_tool: true
    enabled: true
  - name: "seo_optimization"
    mcp_tool: true
    enabled: true
```

## 📋 Complete AIX Structure

### 1. Meta (Agent Identity)
```yaml
meta:
  version: "1.0"
  id: "unique-agent-id"
  name: "Agent Name"
  description: "What this agent does"
  author: "Your Name"
  tags: ["tag1", "tag2"]
  framework: "google-gemini"
```

### 2. Persona (Agent Behavior)
```yaml
persona:
  role: "Primary role"
  tone: "professional/friendly/creative"
  style: "How it communicates"
  
  instructions: |
    EXACTLY how this agent should behave.
    Step by step instructions.
  
  constraints:
    - "What it CANNOT do"
  
  personality_traits:
    creativity: "high"
    precision: "high"
  
  temperature: 0.7
```

### 3. Skills (MCP Tools)
```yaml
skills:
  - name: "text_generation"
    description: "What this tool does"
    enabled: true
    mcp_tool: true          # Mark as MCP tool
    parameters:
      max_tokens: 4096
    priority: 10
  
  - name: "web_search"
    mcp_tool: true
    enabled: true
```

### 4. Evolution (Learning)
```yaml
evolution:
  enabled: true
  genes:
    - id: "creativity"
      value: 0.9
      weight: 0.8
  learning_rate: 0.1
```

### 5. Memory
```yaml
memory:
  episodic:              # Short-term
    enabled: true
    max_messages: 100
  semantic:              # Long-term knowledge
    enabled: true
    vector_db: "chromadb"
```

### 6. API Connections
```yaml
api:
  - name: "gemini_flash"
    endpoint: "https://..."
    auth_type: "api_key"
    rate_limit: 60
```

### 7. Security
```yaml
security:
  capabilities:
    allowed_operations:
      - "text_generation"
      - "web_search"
    max_api_calls_per_minute: 60
```

## 🛠️ MCP Tools in AIX

AIX integrates MCP (Model Context Protocol) tools directly:

```yaml
skills:
  # Each skill can be an MCP tool
  - name: "file_operations"
    mcp_tool: true
    enabled: true
    parameters:
      allowed_paths: ["/workspace"]
  
  - name: "web_search"
    mcp_tool: true
    enabled: true
    parameters:
      max_results: 10
```

### Available MCP Presets

```typescript
// Use in builder
aix()
  .mcpPreset('content-creator')  // Adds text_generation, seo, social_media...
  .mcpPreset('developer')         // Adds code_generation, debugging...
  .mcpPreset('researcher')        // Adds web_search, analysis...
```

## 💡 Why AIX is All-in-One

### Traditional Approach ❌
```
config.json          → Basic settings
persona.txt          → Behavior instructions  
tools.yaml           → What it can do
memory-config.json   → Memory settings
api-keys.env         → API connections
permissions.json     → Security rules
```

### AIX Approach ✅
```
agent-name.aix       → EVERYTHING in one file!
```

## 📦 Example: Complete Agent

```yaml
# contentbot.aix - Complete content creator agent

meta:
  name: "ContentBot"
  role: "Content Creator & SEO Expert"
  tags: ["content", "seo", "writing"]

persona:
  role: "Content Creator & Writer"
  tone: "creative and engaging"
  instructions: |
    You are an expert content creator.
    Create engaging, SEO-optimized content.
  temperature: 0.9

skills:
  - name: "text_generation"
    mcp_tool: true
    priority: 10
  - name: "seo_optimization"
    mcp_tool: true
    priority: 9
  - name: "image_analysis"
    mcp_tool: true
    priority: 7

evolution:
  enabled: true
  genes:
    - id: "creativity"
      value: 0.95
      weight: 0.9

memory:
  episodic:
    enabled: true
    max_messages: 100
  semantic:
    enabled: true
    vector_db: "chromadb"

api:
  - name: "gemini_flash"
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash"

security:
  capabilities:
    allowed_operations:
      - "text_generation"
      - "seo_optimization"
```

## 🎨 Quick Templates

```typescript
import { quick } from '@Moeabdelaziz007/aix-format';

// Instant agents with everything configured
const contentAgent = quick.contentCreator('ContentBot').build();
const dataAgent = quick.dataAnalyst('DataPro').build();
const devAgent = quick.developer('CodeMaster').build();
const supportAgent = quick.support('HelpBot').build();
```

## 📚 Benefits

1. **Single Source of Truth** - Everything in one file
2. **Easy Sharing** - Send one .aix file, not 10 files
3. **Version Control** - Git tracks one file changes
4. **Portable** - Works anywhere AIX is supported
5. **Complete** - Nothing missing, everything defined
6. **Readable** - YAML is human-friendly
7. **Extensible** - Add custom sections easily

## 🔄 Using AIX Files

### In Agent Forge
1. Create agent with UI
2. Configure all settings
3. Download as `.aix` file
4. Share or deploy anywhere

### Programmatically
```typescript
import { parseAIX, generateAIX } from '@Moeabdelaziz007/aix-format';

// Load agent
const agent = parseAIX(fileContent);

// Use agent properties
console.log(agent.persona.instructions);
console.log(agent.skills.map(s => s.name));

// Modify and save
const modified = generateAIX({
  ...agent.meta,
  temperature: 0.8,
});
```

## 🎯 Real-World Example

See `examples/contentbot-complete.aix` for a full example showing:
- Complete persona definition
- All MCP tools configured
- Evolution parameters set
- Memory management
- API integrations
- Security rules

## 📞 Support

Created by Mohamed Hossameldin Abdelaziz  
Part of Amrikyy AI OS  
GitHub: [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)

---

**AIX Format** - Because an agent's definition should be simple: **One file. Everything. Done.**
