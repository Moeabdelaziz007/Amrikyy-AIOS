/**
 * Agent Evolution Service - Self-Improving AI using Evolutionary Algorithms
 * 
 * This service implements a Darwinian evolution system for AI agents, enabling them to:
 * 1. Learn from user interactions and feedback
 * 2. Evolve their behavior over time using genetic algorithms
 * 3. Improve performance through natural selection
 * 4. Adapt to user preferences and patterns
 * 
 * Created by: Mohamed Hossameldin Abdelaziz
 */

 updates
import { generateResponse } from './geminiService';
=======
import { geminiService } from '../packages/ai/src/index';
 main

/**
 * Represents a gene in an agent's behavioral DNA
 * Each gene controls a specific aspect of agent behavior
 */
export interface AgentGene {
  id: string;
  name: string;
  value: number; // 0-1 scale
  weight: number; // How important this gene is
  description: string;
}

/**
 * Agent's complete genetic makeup
 */
export interface AgentGenome {
  agentId: string;
  generation: number;
  genes: AgentGene[];
  fitness: number; // Overall performance score
  birthTimestamp: number;
  parentGenomes?: string[]; // IDs of parent genomes if evolved
}

/**
 * User interaction data for learning
 */
export interface InteractionData {
  agentId: string;
  timestamp: number;
  action: string;
  userSatisfaction: number; // -1 to 1
  contextData: Record<string, any>;
  outcome: 'success' | 'failure' | 'partial';
}

/**
 * Performance metrics for an agent
 */
export interface AgentPerformance {
  agentId: string;
  totalInteractions: number;
  successRate: number;
  averageUserSatisfaction: number;
  responseTime: number;
  taskCompletionRate: number;
  userRetentionRate: number;
  evolutionScore: number; // How much the agent has improved
}

/**
 * Evolutionary Learning Engine
 * Implements genetic algorithms for agent self-improvement
 */
class AgentEvolutionEngine {
  private genomes: Map<string, AgentGenome> = new Map();
  private interactions: InteractionData[] = [];
  private performances: Map<string, AgentPerformance> = new Map();
  
  // Evolution parameters
  private readonly MUTATION_RATE = 0.1;
  private readonly CROSSOVER_RATE = 0.7;
  private readonly POPULATION_SIZE = 5; // Number of genome variants per agent
  private readonly ELITE_SIZE = 2; // Top performers to preserve
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Initialize genome for a new agent
   */
  initializeAgent(agentId: string, initialTraits: Record<string, number>): AgentGenome {
    const genes: AgentGene[] = [
      {
        id: 'responsiveness',
        name: 'Response Speed',
        value: initialTraits.responsiveness || 0.7,
        weight: 0.8,
        description: 'How quickly the agent responds to requests'
      },
      {
        id: 'creativity',
        name: 'Creative Thinking',
        value: initialTraits.creativity || 0.5,
        weight: 0.6,
        description: 'Level of creative and innovative suggestions'
      },
      {
        id: 'precision',
        name: 'Accuracy & Precision',
        value: initialTraits.precision || 0.8,
        weight: 0.9,
        description: 'Accuracy of information and task execution'
      },
      {
        id: 'empathy',
        name: 'User Empathy',
        value: initialTraits.empathy || 0.6,
        weight: 0.7,
        description: 'Understanding and responding to user emotions'
      },
      {
        id: 'proactivity',
        name: 'Proactive Assistance',
        value: initialTraits.proactivity || 0.5,
        weight: 0.5,
        description: 'Anticipating user needs before being asked'
      },
      {
        id: 'adaptability',
        name: 'Adaptability',
        value: initialTraits.adaptability || 0.6,
        weight: 0.7,
        description: 'Ability to adapt to different user styles'
      },
      {
        id: 'efficiency',
        name: 'Resource Efficiency',
        value: initialTraits.efficiency || 0.7,
        weight: 0.6,
        description: 'Optimal use of computational resources'
      },
      {
        id: 'collaboration',
        name: 'Agent Collaboration',
        value: initialTraits.collaboration || 0.6,
        weight: 0.5,
        description: 'Effectiveness in multi-agent scenarios'
      }
    ];
    
    const genome: AgentGenome = {
      agentId,
      generation: 1,
      genes,
      fitness: 0.5,
      birthTimestamp: Date.now()
    };
    
    this.genomes.set(`${agentId}-gen1`, genome);
    this.saveToStorage();
    
    return genome;
  }
  
  /**
   * Record user interaction for learning
   */
  recordInteraction(interaction: InteractionData): void {
    this.interactions.push(interaction);
    
    // Update performance metrics
    this.updatePerformanceMetrics(interaction);
    
    // Trigger evolution if enough data collected
    if (this.interactions.length % 100 === 0) {
      this.evolveAgent(interaction.agentId);
    }
    
    this.saveToStorage();
  }
  
  /**
   * Update agent performance metrics based on interaction
   */
  private updatePerformanceMetrics(interaction: InteractionData): void {
    const perf = this.performances.get(interaction.agentId) || {
      agentId: interaction.agentId,
      totalInteractions: 0,
      successRate: 0,
      averageUserSatisfaction: 0,
      responseTime: 0,
      taskCompletionRate: 0,
      userRetentionRate: 0,
      evolutionScore: 0
    };
    
    // Update metrics
    perf.totalInteractions++;
    
    const successValue = interaction.outcome === 'success' ? 1 : 
                        interaction.outcome === 'partial' ? 0.5 : 0;
    perf.successRate = (perf.successRate * (perf.totalInteractions - 1) + successValue) / perf.totalInteractions;
    
    perf.averageUserSatisfaction = 
      (perf.averageUserSatisfaction * (perf.totalInteractions - 1) + interaction.userSatisfaction) / 
      perf.totalInteractions;
    
    perf.taskCompletionRate = 
      (perf.taskCompletionRate * (perf.totalInteractions - 1) + successValue) / 
      perf.totalInteractions;
    
    this.performances.set(interaction.agentId, perf);
  }
  
  /**
   * Calculate fitness score for a genome based on performance
   */
  private calculateFitness(agentId: string, genome: AgentGenome): number {
    const perf = this.performances.get(agentId);
    if (!perf) return 0.5;
    
    // Weighted fitness calculation
    let fitness = 0;
    
    // User satisfaction (40% weight)
    fitness += (perf.averageUserSatisfaction + 1) / 2 * 0.4;
    
    // Success rate (30% weight)
    fitness += perf.successRate * 0.3;
    
    // Task completion (20% weight)
    fitness += perf.taskCompletionRate * 0.2;
    
    // Gene-specific performance (10% weight)
    const geneBonus = genome.genes.reduce((sum, gene) => {
      return sum + (gene.value * gene.weight);
    }, 0) / genome.genes.length * 0.1;
    
    fitness += geneBonus;
    
    return Math.min(1, Math.max(0, fitness));
  }
  
  /**
   * Evolve agent using genetic algorithm
   */
  private evolveAgent(agentId: string): void {
    // Get current genome population for this agent
    const population = Array.from(this.genomes.values())
      .filter(g => g.agentId === agentId)
      .sort((a, b) => b.fitness - a.fitness);
    
    if (population.length === 0) return;
    
    // Calculate fitness for all genomes
    population.forEach(genome => {
      genome.fitness = this.calculateFitness(agentId, genome);
    });
    
    // Keep elite performers
    const elites = population.slice(0, this.ELITE_SIZE);
    
    // Generate new population through crossover and mutation
    const newGeneration: AgentGenome[] = [...elites];
    const maxGeneration = Math.max(...population.map(g => g.generation));
    
    while (newGeneration.length < this.POPULATION_SIZE) {
      // Selection: Tournament selection
      const parent1 = this.tournamentSelection(population);
      const parent2 = this.tournamentSelection(population);
      
      // Crossover
      let offspring = Math.random() < this.CROSSOVER_RATE
        ? this.crossover(parent1, parent2)
        : { ...parent1 };
      
      // Mutation
      offspring = this.mutate(offspring);
      
      // Update metadata
      offspring.generation = maxGeneration + 1;
      offspring.birthTimestamp = Date.now();
      offspring.parentGenomes = [
        `${parent1.agentId}-gen${parent1.generation}`,
        `${parent2.agentId}-gen${parent2.generation}`
      ];
      
      newGeneration.push(offspring);
    }
    
    // Replace old population with new generation
    // Keep only the latest generation plus elites
    const toKeep = new Set(newGeneration.map(g => 
      `${g.agentId}-gen${g.generation}`
    ));
    
    for (const [key, genome] of this.genomes.entries()) {
      if (genome.agentId === agentId && !toKeep.has(key)) {
        this.genomes.delete(key);
      }
    }
    
    // Add new generation
    newGeneration.forEach(genome => {
      this.genomes.set(`${genome.agentId}-gen${genome.generation}`, genome);
    });
    
    // Update evolution score
    const perf = this.performances.get(agentId);
    if (perf) {
      perf.evolutionScore = (maxGeneration - 1) / 10; // Score based on generations
      this.performances.set(agentId, perf);
    }
    
    this.saveToStorage();
    
    console.log(`🧬 Agent ${agentId} evolved to generation ${maxGeneration + 1}`);
  }
  
  /**
   * Tournament selection for parent selection
   */
  private tournamentSelection(population: AgentGenome[], tournamentSize: number = 3): AgentGenome {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }
  
  /**
   * Crossover two genomes to create offspring
   */
  private crossover(parent1: AgentGenome, parent2: AgentGenome): AgentGenome {
    const offspring: AgentGenome = {
      ...parent1,
      genes: parent1.genes.map((gene, index) => {
        // Single-point crossover for each gene
        return Math.random() < 0.5 
          ? { ...gene }
          : { ...parent2.genes[index] };
      })
    };
    
    return offspring;
  }
  
  /**
   * Mutate a genome
   */
  private mutate(genome: AgentGenome): AgentGenome {
    return {
      ...genome,
      genes: genome.genes.map(gene => {
        if (Math.random() < this.MUTATION_RATE) {
          // Gaussian mutation
          const mutation = (Math.random() - 0.5) * 0.2;
          return {
            ...gene,
            value: Math.min(1, Math.max(0, gene.value + mutation))
          };
        }
        return gene;
      })
    };
  }
  
  /**
   * Get the best genome for an agent
   */
  getBestGenome(agentId: string): AgentGenome | null {
    const agentGenomes = Array.from(this.genomes.values())
      .filter(g => g.agentId === agentId)
      .sort((a, b) => b.fitness - a.fitness);
    
    return agentGenomes[0] || null;
  }
  
  /**
   * Get agent performance metrics
   */
  getPerformanceMetrics(agentId: string): AgentPerformance | null {
    return this.performances.get(agentId) || null;
  }
  
  /**
   * Get evolution history for an agent
   */
  getEvolutionHistory(agentId: string): AgentGenome[] {
    return Array.from(this.genomes.values())
      .filter(g => g.agentId === agentId)
      .sort((a, b) => a.generation - b.generation);
  }
  
  /**
   * Generate AI-powered insights about agent evolution
   */
  async generateEvolutionInsights(agentId: string): Promise<string> {
    const history = this.getEvolutionHistory(agentId);
    const perf = this.getPerformanceMetrics(agentId);
    
    if (!history.length || !perf) {
      return 'Insufficient data for evolution insights.';
    }
    
    const latestGenome = history[history.length - 1];
    
    const prompt = `Analyze this AI agent's evolution:
Agent ID: ${agentId}
Current Generation: ${latestGenome.generation}
Fitness Score: ${latestGenome.fitness.toFixed(2)}
Success Rate: ${(perf.successRate * 100).toFixed(1)}%
User Satisfaction: ${(perf.averageUserSatisfaction * 100).toFixed(1)}%

Top Genes:
${latestGenome.genes
  .sort((a, b) => b.value - a.value)
  .slice(0, 3)
  .map(g => `- ${g.name}: ${(g.value * 100).toFixed(0)}%`)
  .join('\n')}

Provide a brief, insightful analysis of:
1. Key strengths
2. Areas for improvement
3. Evolution trajectory
4. Recommendations for optimization

Keep it concise (3-4 sentences).`;
    
    try {
      const insights = await generateResponse(agentId, prompt, []);
      const insights = await geminiService.generateText(prompt, []);
      return insights;
    } catch (error) {
      return 'Evolution analysis temporarily unavailable.';
    }
  }
  
  /**
   * Save state to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('agentGenomes', JSON.stringify(Array.from(this.genomes.entries())));
        localStorage.setItem('agentPerformances', JSON.stringify(Array.from(this.performances.entries())));
        localStorage.setItem('agentInteractions', JSON.stringify(this.interactions.slice(-1000))); // Keep last 1000
      } catch (e) {
        console.error('Failed to save evolution data:', e);
      }
    }
  }
  
  /**
   * Load state from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const genomesData = localStorage.getItem('agentGenomes');
        if (genomesData) {
          this.genomes = new Map(JSON.parse(genomesData));
        }
        
        const performancesData = localStorage.getItem('agentPerformances');
        if (performancesData) {
          this.performances = new Map(JSON.parse(performancesData));
        }
        
        const interactionsData = localStorage.getItem('agentInteractions');
        if (interactionsData) {
          this.interactions = JSON.parse(interactionsData);
        }
      } catch (e) {
        console.error('Failed to load evolution data:', e);
      }
    }
  }
  
  /**
   * Reset agent evolution (for testing or hard reset)
   */
  resetAgent(agentId: string): void {
    for (const [key, genome] of this.genomes.entries()) {
      if (genome.agentId === agentId) {
        this.genomes.delete(key);
      }
    }
    this.performances.delete(agentId);
    this.interactions = this.interactions.filter(i => i.agentId !== agentId);
    this.saveToStorage();
  }
}

// Singleton instance
export const evolutionEngine = new AgentEvolutionEngine();

/**
 * Helper function to record positive user feedback
 */
export function recordPositiveFeedback(agentId: string, action: string, contextData: Record<string, any> = {}): void {
  evolutionEngine.recordInteraction({
    agentId,
    timestamp: Date.now(),
    action,
    userSatisfaction: 0.8,
    contextData,
    outcome: 'success'
  });
}

/**
 * Helper function to record negative user feedback
 */
export function recordNegativeFeedback(agentId: string, action: string, contextData: Record<string, any> = {}): void {
  evolutionEngine.recordInteraction({
    agentId,
    timestamp: Date.now(),
    action,
    userSatisfaction: -0.5,
    contextData,
    outcome: 'failure'
  });
}

/**
 * Helper function to record neutral interaction
 */
export function recordInteraction(agentId: string, action: string, satisfaction: number = 0, outcome: 'success' | 'failure' | 'partial' = 'partial'): void {
  evolutionEngine.recordInteraction({
    agentId,
    timestamp: Date.now(),
    action,
    userSatisfaction: satisfaction,
    contextData: {},
    outcome
  });
}
