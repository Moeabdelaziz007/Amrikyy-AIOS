import { quickQuantumReasoning } from '../src/index';
import { quick as aixQuick } from '../../aix-format/src/index';
import { stringify as stringifyYAML } from 'yaml';

async function runExample() {
  const apiKey = process.env.GENERATIVE_API_KEY || 'DUMMY_KEY';
  console.log('Running quick quantum reasoning (this example uses a dummy key and may fallback)...');

  try {
    const reasoning = await quickQuantumReasoning(
      'User reports a server crash under high load. Provide likely causes and remediation steps.',
      apiKey,
      ['High CPU utilization', 'Recent deployment changed caching layer']
    );

    console.log('Quantum reasoning finished. Summary:');
    console.log('Overall confidence:', reasoning.confidence);
    console.log('Top hypothesis:', reasoning.hypotheses[0]);

    // Build an AIX agent suggestion using the AIX builder quick template
    const suggestedAgentName = 'IncidentResponder';
    const aixBuilder = aixQuick.developer(suggestedAgentName);

    // Give the agent the quantum reasoning skill and some incident-related tools
    aixBuilder.mcp('incident_response');
    aixBuilder.mcp('log_analysis');
    aixBuilder.mcp('quantum_reasoning');

    // Add a memory-style snapshot into the persona instructions so the agent 'remembers' the reasoning output
    const memorySnapshot = {
      last_run: new Date().toISOString(),
      overall_confidence: reasoning.confidence,
      top_hypothesis: reasoning.hypotheses[0] || null,
      topology_summary: reasoning.topology || null,
      processing_time_ms: reasoning.processingTime || reasoning.processing_time || 0,
    };

    const extraPersona = `\n\nMemory Snapshot (quantum_reasoning): ${JSON.stringify(memorySnapshot, null, 2)}`;
    aixBuilder.persona((aixBuilder as any).config.persona + extraPersona);

    const aixContent = aixBuilder.build();

    // Pretty-print the final AIX YAML and also show the memory snapshot separately
    console.log('\nGenerated AIX agent (YAML):\n');
    console.log(aixContent);

    console.log('\nMemory snapshot used for agent:');
    console.log(stringifyYAML(memorySnapshot));

  } catch (err) {
    console.error('Example failed:', err);
  }
}

runExample();
