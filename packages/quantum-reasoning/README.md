# @amrikyy/quantum-reasoning

Quantum-inspired reasoning helper library used by Amrikyy-AIOS.

Features
- Generate multiple diverse hypotheses for a user query.
- Evaluate hypotheses against evidence/context.
- Validate hypothesis topology (nodes/edges) to identify connections and gaps.
- Quick helper `quickQuantumReasoning` for one-shot use.

API

- createQuantumReasoningEngine(config: QuantumReasoningConfig): QuantumReasoningEngine
  - config: { apiKey: string, model?: string, maxHypotheses?: number, temperature?: number }
  - Returns an engine with methods:
    - generateHypotheses(query: string, context?: string[]): Promise<QuantumHypothesis[]>
    - evaluateHypothesis(hypothesis, evidence): Promise<number>
    - validateTopology(hypotheses): Promise<{ nodes: string[]; edges: Array<{ from, to, weight }> }>
    - reason(query, context?): Promise<QuantumReasoningResult>

- quickQuantumReasoning(query: string, apiKey: string, context?: string[]): Promise<QuantumReasoningResult>
  - Convenience wrapper that constructs an engine and runs `.reason`.

Usage

1. Install via workspace (monorepo):
   - The package is part of the monorepo. From repo root run `pnpm install`.

2. Build:

```
cd packages/quantum-reasoning
pnpm build
```

3. Quick example

See `examples/quick-run.ts` for a small script demonstrating quickQuantumReasoning. Note: the script uses a dummy API key in the example; replace with a valid key before running in production.

Try the Forge Agent example

A small example that runs quick quantum reasoning and generates a suggested AIX agent is included at `examples/forge-agent-example.ts`.

To run it locally:

1. Build the packages so TypeScript sources are compiled:

```bash
pnpm install
pnpm -w build
```

2. Run the example (replace with a real API key to call the generative API):

```bash
# from repo root
GENERATIVE_API_KEY=your_key_here node ./packages/quantum-reasoning/dist/examples/forge-agent-example.js
```

If you prefer to run with ts-node for quick iteration:

```bash
pnpm add -w ts-node typescript @types/node
pnpm -w ts-node packages/quantum-reasoning/examples/forge-agent-example.ts
```

Note: The example uses the AIX format builder from `packages/aix-format` to produce a `.aix` YAML agent definition.

Development notes
- The package targets Node.js (CommonJS) for backend usage.
- Type declarations are emitted to `dist/` during `pnpm build`.
- The package uses `@google/generative-ai` SDK; ensure credentials and environment variables are set when calling real APIs.

License: MIT
