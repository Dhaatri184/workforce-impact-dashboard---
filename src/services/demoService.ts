/**
 * Demo Service
 * 
 * Manages demo mode functionality including guided tours,
 * sample data scenarios, and demo state management.
 */

import { 
  SAMPLE_AI_GROWTH_DATA,
  SAMPLE_JOB_ROLE_DATA,
  SAMPLE_IMPACT_SCORES,
  SAMPLE_INSIGHTS,
  DEMO_SCENARIOS,
  EXTENDED_SAMPLE_DATA
} from '../data/sampleData';
import { 
  AIGrowthData, 
  JobRoleData, 
  JobRoleImpact, 
  GeneratedInsight,
  AnalysisContext 
} from '../types';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  selectedRole: string;
  secondaryRole?: string;
  timeRange: [Date, Date];
  viewMode: 'overview' | 'comparison' | 'matrix';
  highlights: string[];
}

export interface DemoState {
  isActive: boolean;
  currentScenario: DemoScenario | null;
  tourStep: number;
  autoAdvance: boolean;
}

class DemoService {
  private demoState: DemoState = {
    isActive: false,
    currentScenario: null,
    tourStep: 0,
    autoAdvance: true
  };

  private listeners: ((state: DemoState) => void)[] = [];

  /**
   * Initialize demo mode
   */
  startDemo(scenarioId?: string): void {
    const scenario = scenarioId 
      ? DEMO_SCENARIOS.find(s => s.id === scenarioId) || DEMO_SCENARIOS[0]
      : DEMO_SCENARIOS[0];

    this.demoState = {
      isActive: true,
      currentScenario: scenario,
      tourStep: 0,
      autoAdvance: true
    };

    this.notifyListeners();
  }

  /**
   * Stop demo mode
   */
  stopDemo(): void {
    this.demoState = {
      isActive: false,
      currentScenario: null,
      tourStep: 0,
      autoAdvance: true
    };

    this.notifyListeners();
  }

  /**
   * Switch to a different demo scenario
   */
  switchScenario(scenarioId: string): void {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      this.demoState.currentScenario = scenario;
      this.demoState.tourStep = 0;
      this.notifyListeners();
    }
  }

  /**
   * Get current demo state
   */
  getDemoState(): DemoState {
    return { ...this.demoState };
  }

  /**
   * Get available demo scenarios
   */
  getScenarios(): DemoScenario[] {
    return DEMO_SCENARIOS;
  }

  /**
   * Get sample data for demo mode
   */
  getSampleData(): {
    aiData: AIGrowthData;
    jobData: JobRoleData[];
    impactScores: JobRoleImpact[];
    insights: GeneratedInsight[];
  } {
    return {
      aiData: SAMPLE_AI_GROWTH_DATA,
      jobData: SAMPLE_JOB_ROLE_DATA,
      impactScores: SAMPLE_IMPACT_SCORES,
      insights: SAMPLE_INSIGHTS
    };
  }

  /**
   * Get filtered sample data based on current scenario
   */
  getScenarioData(scenario: DemoScenario): {
    aiData: AIGrowthData;
    jobData: JobRoleData[];
    impactScores: JobRoleImpact[];
    insights: GeneratedInsight[];
  } {
    const allData = this.getSampleData();
    
    // Filter job data for selected roles
    const selectedRoles = [scenario.selectedRole];
    if (scenario.secondaryRole) {
      selectedRoles.push(scenario.secondaryRole);
    }
    
    const filteredJobData = allData.jobData.filter(job => 
      selectedRoles.includes(job.roleId)
    );
    
    const filteredImpactScores = allData.impactScores.filter(impact => 
      selectedRoles.includes(impact.roleId)
    );
    
    // Filter insights relevant to selected roles
    const filteredInsights = allData.insights.filter(insight =>
      insight.relevantData.some(roleId => selectedRoles.includes(roleId))
    );

    return {
      aiData: allData.aiData,
      jobData: filteredJobData,
      impactScores: filteredImpactScores,
      insights: filteredInsights
    };
  }

  /**
   * Generate contextual insights for demo scenario
   */
  generateScenarioInsights(scenario: DemoScenario): GeneratedInsight[] {
    const baseInsights = this.getScenarioData(scenario).insights;
    
    // Add scenario-specific insights
    const scenarioInsight: GeneratedInsight = {
      id: `scenario-${scenario.id}`,
      type: 'trend',
      title: `Demo Scenario: ${scenario.name}`,
      description: scenario.description + ' ' + scenario.highlights.join('. '),
      confidence: 1.0,
      relevantData: [scenario.selectedRole],
      actionable: true
    };

    return [scenarioInsight, ...baseInsights];
  }

  /**
   * Get extended market data for comprehensive analysis
   */
  getExtendedData() {
    return EXTENDED_SAMPLE_DATA;
  }

  /**
   * Subscribe to demo state changes
   */
  subscribe(listener: (state: DemoState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update tour step
   */
  setTourStep(step: number): void {
    this.demoState.tourStep = step;
    this.notifyListeners();
  }

  /**
   * Toggle auto-advance
   */
  toggleAutoAdvance(): void {
    this.demoState.autoAdvance = !this.demoState.autoAdvance;
    this.notifyListeners();
  }

  /**
   * Check if demo mode is active
   */
  isActive(): boolean {
    return this.demoState.isActive;
  }

  /**
   * Get demo statistics for analytics
   */
  getDemoStats() {
    const sampleData = this.getSampleData();
    
    return {
      totalRoles: sampleData.jobData.length,
      highRiskRoles: sampleData.impactScores.filter(i => i.riskLevel === 'high').length,
      growthOpportunities: sampleData.impactScores.filter(i => i.classification === 'growth').length,
      averageAIGrowth: sampleData.impactScores.reduce((sum, i) => sum + i.aiGrowthRate, 0) / sampleData.impactScores.length,
      averageJobGrowth: sampleData.impactScores.reduce((sum, i) => sum + i.jobDemandChange, 0) / sampleData.impactScores.length,
      totalInsights: sampleData.insights.length,
      actionableInsights: sampleData.insights.filter(i => i.actionable).length
    };
  }

  /**
   * Generate demo report
   */
  generateDemoReport() {
    const stats = this.getDemoStats();
    const extendedData = this.getExtendedData();
    
    return {
      summary: {
        title: 'Workforce Impact Dashboard - Demo Analysis',
        generatedAt: new Date().toISOString(),
        ...stats
      },
      marketTrends: extendedData.technologyTrends,
      segments: extendedData.marketSegments,
      geographic: extendedData.geographicData,
      scenarios: DEMO_SCENARIOS.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        highlights: scenario.highlights
      }))
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.demoState));
  }
}

// Export singleton instance
export const demoService = new DemoService();

// Export types
export type { DemoScenario, DemoState };