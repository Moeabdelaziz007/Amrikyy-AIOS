export type AgentFeelings = {
  valence: number;
  arousal: number;
  motivation: number;
  decayRate?: number;
  lastUpdated?: string;
};

export const aixGeneratorService = {
  updateFeelings(feelings: AgentFeelings, event: 'success' | 'failure' | 'idle', minutesIdle = 0): AgentFeelings {
    const f = { ...feelings };
    const decay = f.decayRate ?? 0.01;

    if (event === 'success') {
      f.valence = Math.min(1, f.valence + 0.1);
      f.motivation = Math.min(1, f.motivation + 0.05);
      f.arousal = Math.min(1, f.arousal + 0.03);
    } else if (event === 'failure') {
      f.valence = Math.max(-1, f.valence - 0.2);
      f.motivation = Math.max(0, f.motivation - 0.1);
      f.arousal = Math.max(0, f.arousal - 0.05);
    } else if (event === 'idle') {
      // apply time decay proportional to minutesIdle
      const factor = Math.pow(1 - decay, minutesIdle);
      f.valence = f.valence * factor;
      f.motivation = f.motivation * factor;
      f.arousal = f.arousal * factor;
    }

    f.lastUpdated = new Date().toISOString();
    return f;
  },

  getToneModifier(feelings: AgentFeelings): string {
    const { valence, arousal, motivation } = feelings;
    if (valence >= 0.7 && motivation >= 0.7) return 'enthusiastic, energetic, confident';
    if (valence >= 0.2 && motivation >= 0.5) return 'positive, helpful, encouraging';
    if (valence < -0.2) return 'cautious, conservative, risk-averse';
    return 'neutral, professional';
  },

  generateEmbeddingText(aix: any): string {
    // create a short embedding text based on embeddingHints
    const meta = aix.metadata || {};
    const dna = aix.dna || {};
    const hint = dna.embeddingHints?.textForEmbed || 'short';

    if (hint === 'short') {
      return `${meta.name || ''} - ${dna.role || ''}`.trim().slice(0, 200);
    }

    if (hint === 'name+role+skills') {
      const skills = Array.isArray(dna.skills) ? dna.skills.join(', ') : dna.skills || '';
      return `${meta.name || ''} - ${dna.role || ''} - Skills: ${skills}`.trim().slice(0, 500);
    }

    // default: serialize a compact version
    const text = `${meta.name || ''} ${meta.description || ''} ${dna.role || ''}`;
    return text.trim().slice(0, 512);
  }
};

