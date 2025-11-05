import { generateContent } from './gemini.js';

interface HealthDataPoint {
  type: 'error' | 'performance' | 'ux';
  timestamp: string;
  payload: any;
}

interface ProblemReport {
  reportId: string;
  timestamp: string;
  osEfficiencyScore: number;
  suspectedArea: string;
  supportingData: any;
  summary: string;
}

class SystemHealthService {
  private dataStore: HealthDataPoint[] = [];
  private score: number = 100.0;

  constructor() {
    // Periodically analyze data and update the score
    setInterval(() => this.analyzeData(), 60000); // Analyze every minute
  }

  public logData(type: 'error' | 'performance' | 'ux', payload: any) {
    const dataPoint: HealthDataPoint = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.dataStore.push(dataPoint);
    
    // Immediate score reduction for critical errors
    if (type === 'error') {
      this.score = Math.max(0, this.score - 5); // Deduct 5 points for each error
    }
  }

  private async analyzeData() {
    if (this.dataStore.length === 0) {
        // Slowly regenerate score if no new issues
        this.score = Math.min(100, this.score + 1);
        return;
    }

    // Simple analysis for now: score is based on number of errors
    const errorCount = this.dataStore.filter(d => d.type === 'error').length;
    this.score = Math.max(0, 100 - (errorCount * 5));

    console.log(`[SystemHealthService] Current OS Efficiency Score: ${this.score.toFixed(2)}%`);

    if (this.score < 85) {
      await this.generateProblemReport();
    }

    // Clear store after analysis
    this.dataStore = [];
  }

  private async generateProblemReport(): Promise<void> {
    const reportId = `report-${Date.now()}`;
    const relevantData = this.dataStore.slice(-50); // Get last 50 data points

    const prompt = `The following is a series of health data points from an operating system. The OS Efficiency Score has dropped to ${this.score.toFixed(2)}%. Analyze these data points to identify the most likely root cause and suspected component. Provide a brief, one-sentence summary of the problem.\n\nData:\n${JSON.stringify(relevantData, null, 2)}`;

    try {
      const summary = await generateContent(prompt);
      
      const report: ProblemReport = {
        reportId,
        timestamp: new Date().toISOString(),
        osEfficiencyScore: this.score,
        suspectedArea: 'Unknown', // More advanced analysis would determine this
        supportingData: relevantData,
        summary: summary.trim(),
      };

      console.log(`[SystemHealthService] Generated Problem Report: ${reportId}`, report);
      // In a real implementation, this would be sent to the Nexus agent.

    } catch (error) {
      console.error('[SystemHealthService] Failed to generate problem report:', error);
    }
  }

  public getScore() {
    return this.score;
  }
}

export const systemHealthService = new SystemHealthService();
