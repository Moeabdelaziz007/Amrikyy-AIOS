import { quickQuantumReasoning } from '../src/index';

async function main() {
  const apiKey = process.env.GENERATIVE_API_KEY || 'DUMMY_KEY_FOR_EXAMPLE';
  try {
    const result = await quickQuantumReasoning('Why did the server crash during high load?', apiKey, [
      'Server logs show increased latency',
      'Recent deploy included caching changes'
    ]);

    console.log('Quick quantum reasoning result:');
    console.log('Overall confidence:', result.confidence);
    console.log('Processing time (ms):', result.processingTime);
    console.log('Top hypothesis:', result.hypotheses[0]);
  } catch (err) {
    console.error('Example run failed (this may be normal without real API keys):', err);
  }
}

main();
