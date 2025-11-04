/**
 * Jules Journal Service
 * Integrates private-journal-mcp for Jules AI agent memory and learning
 */
import { JournalManager } from 'private-journal-mcp/dist/journal.js';
import { SearchService, SearchResult } from 'private-journal-mcp/dist/search.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class JulesJournalService {
  private journal: JournalManager;
  private search: SearchService;
  private projectPath: string;
  private userPath: string;
  
  constructor() {
    this.projectPath = path.join(__dirname, '../../data/jules-journal');
    this.userPath = path.join(process.env.HOME || process.env.USERPROFILE || '~', '.jules-journal');
    
    this.journal = new JournalManager(this.projectPath, this.userPath);
    this.search = new SearchService(this.projectPath, this.userPath);
  }
  
  /**
   * Log a debug session
   */
  async logDebugSession(data: {
    issue: string;
    diagnosis?: string;
    solution: string;
    confidence: number;
    userId?: string;
  }): Promise<void> {
    await this.journal.writeThoughts({
      project_notes: `Issue: ${data.issue}\n${data.diagnosis ? `Diagnosis: ${data.diagnosis}\n` : ''}Solution: ${data.solution}`,
      feelings: `Confidence: ${data.confidence}%`,
      user_context: data.userId ? `User: ${data.userId}` : undefined
    });
  }
  
  /**
   * Log technical insight
   */
  async logInsight(data: {
    category: string;
    insight: string;
    context?: string;
  }): Promise<void> {
    await this.journal.writeThoughts({
      technical_insights: `[${data.category}] ${data.insight}`,
      world_knowledge: data.context
    });
  }
  
  /**
   * Search similar past issues using semantic search
   */
  async searchSimilarIssues(query: string, options?: { limit?: number }): Promise<SearchResult[]> {
    const limit = options?.limit || 10;
    return await this.search.search(query, { limit, type: 'both' });
  }
  
  /**
   * List recent journal entries
   */
  async listRecent(options?: { days?: number; limit?: number }): Promise<SearchResult[]> {
    const limit = options?.limit || 50;
    const days = options?.days || 7;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.search.listRecent({
      limit,
      type: 'both',
      dateRange: { start: startDate, end: endDate }
    });
  }
  
  /**
   * Get pattern analysis from journal entries
   */
  async analyzePatterns(timeframe = 30): Promise<{
    totalEntries: number;
    timeframeDays: number;
    commonIssues: Array<[string, number]>;
    trends: Array<{ week: number; successRate: number }>;
  }> {
    const entries = await this.listRecent({ days: timeframe, limit: 1000 });
    
    // Analyze common issues
    const issueTypes = new Map<string, number>();
    entries.forEach((entry: SearchResult) => {
      // Extract issue types from entries
      const matches = entry.text?.match(/Issue: (.+?)(?:\n|$)/);
      if (matches && matches[1]) {
        const issue = matches[1].trim();
        issueTypes.set(issue, (issueTypes.get(issue) || 0) + 1);
      }
    });
    
    return {
      totalEntries: entries.length,
      timeframeDays: timeframe,
      commonIssues: Array.from(issueTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      trends: this.calculateTrends(entries)
    };
  }
  
  /**
   * Calculate success rate trends over time
   */
  private calculateTrends(entries: SearchResult[]): Array<{ week: number; successRate: number }> {
    const byWeek = new Map<number, { total: number; successful: number }>();
    
    entries.forEach((entry: SearchResult) => {
      const week = this.getWeek(new Date(entry.timestamp));
      if (!byWeek.has(week)) {
        byWeek.set(week, { total: 0, successful: 0 });
      }
      const stats = byWeek.get(week)!;
      stats.total++;
      
      // Consider confidence > 80% as successful
      const confidenceMatch = entry.text?.match(/Confidence: (\d+)%/);
      if (confidenceMatch && parseInt(confidenceMatch[1]) > 80) {
        stats.successful++;
      }
    });
    
    return Array.from(byWeek.entries()).map(([week, stats]) => ({
      week,
      successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0
    }));
  }
  
  /**
   * Get week number of year for a given date
   */
  private getWeek(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  }
}

// Export singleton instance
export const julesJournalService = new JulesJournalService();
