/**
 * Sample Data for Demo Mode
 * 
 * Provides realistic sample datasets for demonstration purposes,
 * ensuring the dashboard works even without API access.
 */

import { 
  AIGrowthData, 
  JobRoleData, 
  JobRoleImpact, 
  GeneratedInsight,
  TimeSeriesPoint,
  TechCategory 
} from '../types';
import { JOB_ROLES } from '../utils/constants';
import { generateId } from '../utils';

// Generate realistic time series data
function generateTimeSeriesData(
  startDate: Date,
  endDate: Date,
  baseValue: number,
  trendSlope: number,
  volatility: number,
  seasonality: number = 0
): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthsFromStart = (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Trend component
    const trendValue = trendSlope * monthsFromStart;
    
    // Seasonal component
    const seasonalValue = seasonality * Math.sin((current.getMonth() / 12) * 2 * Math.PI);
    
    // Random noise
    const noise = (Math.random() - 0.5) * volatility;
    
    // Calculate final value
    const value = Math.max(0, baseValue + trendValue + seasonalValue + noise);
    
    data.push({
      timestamp: new Date(current),
      value: Math.round(value),
      confidence: 0.8 + Math.random() * 0.15, // 0.8-0.95 confidence
      isEstimated: Math.random() < 0.1, // 10% estimated data
      metadata: {
        source: 'sample-data',
        trend: trendSlope > 0 ? 'positive' : trendSlope < 0 ? 'negative' : 'stable',
        seasonalComponent: seasonalValue,
        noiseComponent: noise
      }
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return data;
}

// Sample AI Growth Data
export const SAMPLE_AI_GROWTH_DATA: AIGrowthData = {
  timeSeriesData: generateTimeSeriesData(
    new Date('2022-01-01'),
    new Date(),
    5000, // Base repository count
    150,  // Strong positive trend
    300,  // Moderate volatility
    200   // Some seasonality
  ),
  repositoryCount: 47500,
  contributorGrowth: 68.5,
  technologyBreakdown: [
    { name: 'Python', count: 15200, growthRate: 45.3 },
    { name: 'JavaScript', count: 12800, growthRate: 32.1 },
    { name: 'TypeScript', count: 9600, growthRate: 58.7 },
    { name: 'Jupyter Notebook', count: 8400, growthRate: 72.4 },
    { name: 'R', count: 4200, growthRate: 28.9 },
    { name: 'C++', count: 3800, growthRate: 15.6 },
    { name: 'Java', count: 3200, growthRate: 12.3 },
    { name: 'Go', count: 2100, growthRate: 41.2 },
    { name: 'Rust', count: 1800, growthRate: 89.5 },
    { name: 'Swift', count: 1200, growthRate: 23.7 }
  ]
};

// Sample Job Role Data
export const SAMPLE_JOB_ROLE_DATA: JobRoleData[] = [
  // AI/ML Roles - High growth
  {
    roleId: 'ai-engineer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      800,  // Base job postings
      25,   // Strong positive trend
      120,  // Moderate volatility
      50    // Slight seasonality
    ),
    currentTrend: 'increasing',
    growthRate: 78.5,
    confidence: 0.92
  },
  {
    roleId: 'data-scientist',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1200,
      18,
      150,
      80
    ),
    currentTrend: 'increasing',
    growthRate: 45.2,
    confidence: 0.88
  },
  {
    roleId: 'ml-researcher',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      300,
      12,
      80,
      30
    ),
    currentTrend: 'increasing',
    growthRate: 92.3,
    confidence: 0.85
  },

  // Software Development - Moderate growth
  {
    roleId: 'software-developer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      3500,
      8,
      200,
      150
    ),
    currentTrend: 'increasing',
    growthRate: 15.7,
    confidence: 0.91
  },
  {
    roleId: 'frontend-developer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      2200,
      6,
      180,
      120
    ),
    currentTrend: 'increasing',
    growthRate: 12.4,
    confidence: 0.87
  },
  {
    roleId: 'backend-developer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      2800,
      10,
      190,
      100
    ),
    currentTrend: 'increasing',
    growthRate: 22.1,
    confidence: 0.89
  },
  {
    roleId: 'fullstack-developer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1800,
      12,
      160,
      90
    ),
    currentTrend: 'increasing',
    growthRate: 28.3,
    confidence: 0.86
  },

  // DevOps - Strong growth
  {
    roleId: 'devops-engineer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1500,
      15,
      140,
      70
    ),
    currentTrend: 'increasing',
    growthRate: 35.8,
    confidence: 0.90
  },
  {
    roleId: 'cloud-architect',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      600,
      8,
      80,
      40
    ),
    currentTrend: 'increasing',
    growthRate: 42.6,
    confidence: 0.84
  },

  // Testing - Declining due to automation
  {
    roleId: 'manual-tester',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1200,
      -3,   // Negative trend
      100,
      60
    ),
    currentTrend: 'decreasing',
    growthRate: -8.5,
    confidence: 0.83
  },
  {
    roleId: 'automation-engineer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      400,
      5,
      60,
      30
    ),
    currentTrend: 'increasing',
    growthRate: 31.2,
    confidence: 0.87
  },

  // Design - Stable with AI integration
  {
    roleId: 'ux-designer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1000,
      4,
      120,
      80
    ),
    currentTrend: 'increasing',
    growthRate: 18.9,
    confidence: 0.85
  },
  {
    roleId: 'ui-designer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      800,
      2,
      100,
      70
    ),
    currentTrend: 'stable',
    growthRate: 8.3,
    confidence: 0.82
  },

  // Management - Steady growth
  {
    roleId: 'product-manager',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      900,
      6,
      90,
      50
    ),
    currentTrend: 'increasing',
    growthRate: 25.4,
    confidence: 0.88
  },
  {
    roleId: 'engineering-manager',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      500,
      4,
      60,
      30
    ),
    currentTrend: 'increasing',
    growthRate: 19.7,
    confidence: 0.86
  },

  // Support - Mixed trends
  {
    roleId: 'support-engineer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1400,
      -1,   // Slight decline
      130,
      90
    ),
    currentTrend: 'decreasing',
    growthRate: -3.2,
    confidence: 0.81
  },
  {
    roleId: 'technical-writer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      600,
      3,
      70,
      40
    ),
    currentTrend: 'increasing',
    growthRate: 14.6,
    confidence: 0.83
  },

  // Data roles
  {
    roleId: 'data-analyst',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      1600,
      10,
      140,
      100
    ),
    currentTrend: 'increasing',
    growthRate: 32.8,
    confidence: 0.89
  },
  {
    roleId: 'data-engineer',
    timeSeriesData: generateTimeSeriesData(
      new Date('2022-01-01'),
      new Date(),
      800,
      14,
      100,
      60
    ),
    currentTrend: 'increasing',
    growthRate: 52.1,
    confidence: 0.91
  }
];

// Sample Impact Scores (calculated from the above data)
export const SAMPLE_IMPACT_SCORES: JobRoleImpact[] = [
  { roleId: 'ai-engineer', aiGrowthRate: 68.5, jobDemandChange: 78.5, impactScore: -10.0, riskLevel: 'low', classification: 'growth' },
  { roleId: 'data-scientist', aiGrowthRate: 68.5, jobDemandChange: 45.2, impactScore: 23.3, riskLevel: 'medium', classification: 'transition' },
  { roleId: 'ml-researcher', aiGrowthRate: 68.5, jobDemandChange: 92.3, impactScore: -23.8, riskLevel: 'low', classification: 'growth' },
  { roleId: 'software-developer', aiGrowthRate: 68.5, jobDemandChange: 15.7, impactScore: 52.8, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'frontend-developer', aiGrowthRate: 68.5, jobDemandChange: 12.4, impactScore: 56.1, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'backend-developer', aiGrowthRate: 68.5, jobDemandChange: 22.1, impactScore: 46.4, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'fullstack-developer', aiGrowthRate: 68.5, jobDemandChange: 28.3, impactScore: 40.2, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'devops-engineer', aiGrowthRate: 68.5, jobDemandChange: 35.8, impactScore: 32.7, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'cloud-architect', aiGrowthRate: 68.5, jobDemandChange: 42.6, impactScore: 25.9, riskLevel: 'medium', classification: 'transition' },
  { roleId: 'manual-tester', aiGrowthRate: 68.5, jobDemandChange: -8.5, impactScore: 77.0, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'automation-engineer', aiGrowthRate: 68.5, jobDemandChange: 31.2, impactScore: 37.3, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'ux-designer', aiGrowthRate: 68.5, jobDemandChange: 18.9, impactScore: 49.6, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'ui-designer', aiGrowthRate: 68.5, jobDemandChange: 8.3, impactScore: 60.2, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'product-manager', aiGrowthRate: 68.5, jobDemandChange: 25.4, impactScore: 43.1, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'engineering-manager', aiGrowthRate: 68.5, jobDemandChange: 19.7, impactScore: 48.8, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'support-engineer', aiGrowthRate: 68.5, jobDemandChange: -3.2, impactScore: 71.7, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'technical-writer', aiGrowthRate: 68.5, jobDemandChange: 14.6, impactScore: 53.9, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'data-analyst', aiGrowthRate: 68.5, jobDemandChange: 32.8, impactScore: 35.7, riskLevel: 'high', classification: 'disruption' },
  { roleId: 'data-engineer', aiGrowthRate: 68.5, jobDemandChange: 52.1, impactScore: 16.4, riskLevel: 'medium', classification: 'transition' }
];

// Sample Generated Insights
export const SAMPLE_INSIGHTS: GeneratedInsight[] = [
  {
    id: generateId(),
    type: 'trend',
    title: 'AI Development Acceleration Reshaping Tech Workforce',
    description: 'AI repository growth has accelerated to 68.5% annually, creating unprecedented transformation pressure across technology roles. Traditional development roles face the highest disruption risk, while AI-native positions show explosive growth opportunities.',
    confidence: 0.92,
    relevantData: ['ai-engineer', 'software-developer', 'data-scientist'],
    actionable: true
  },
  {
    id: generateId(),
    type: 'prediction',
    title: 'Manual Testing Roles Face Critical Transition Period',
    description: 'Manual testing positions show -8.5% job demand decline while AI testing tools grow 68.5%. Organizations should prioritize retraining manual testers in automation and AI-assisted testing methodologies within the next 12 months.',
    confidence: 0.87,
    relevantData: ['manual-tester', 'automation-engineer'],
    actionable: true
  },
  {
    id: generateId(),
    type: 'correlation',
    title: 'Strong Inverse Correlation Between AI Growth and Traditional Roles',
    description: 'Statistical analysis reveals -0.73 correlation between AI development growth and traditional software roles, while AI-adjacent positions show +0.85 correlation. This indicates systematic workforce transformation rather than random market fluctuation.',
    confidence: 0.89,
    relevantData: ['software-developer', 'ai-engineer', 'data-scientist'],
    actionable: false
  },
  {
    id: generateId(),
    type: 'comparison',
    title: 'Data Engineers vs Data Scientists: Complementary Growth Patterns',
    description: 'Data Engineers (52.1% growth) and Data Scientists (45.2% growth) both benefit from AI expansion, but Data Engineers show higher resilience due to infrastructure focus. Both roles demonstrate strong AI complementarity rather than replacement risk.',
    confidence: 0.84,
    relevantData: ['data-engineer', 'data-scientist'],
    actionable: true
  },
  {
    id: generateId(),
    type: 'trend',
    title: 'DevOps and Cloud Roles Show Transition Characteristics',
    description: 'DevOps Engineers (35.8% growth) and Cloud Architects (42.6% growth) occupy the transition zone, requiring AI integration skills while maintaining core infrastructure expertise. These roles are evolving rather than disappearing.',
    confidence: 0.81,
    relevantData: ['devops-engineer', 'cloud-architect'],
    actionable: true
  },
  {
    id: generateId(),
    type: 'prediction',
    title: 'Design Roles Require AI Collaboration Skills',
    description: 'UX Designers (18.9% growth) and UI Designers (8.3% growth) face moderate disruption pressure. Success will depend on integrating AI design tools while emphasizing human-centered design thinking and creative problem-solving.',
    confidence: 0.78,
    relevantData: ['ux-designer', 'ui-designer'],
    actionable: true
  },
  {
    id: generateId(),
    type: 'correlation',
    title: 'Management Roles Show Resilience Through Human Skills',
    description: 'Product Managers (25.4% growth) and Engineering Managers (19.7% growth) demonstrate moderate growth despite AI advancement. Leadership, strategic thinking, and cross-functional collaboration remain distinctly human capabilities.',
    confidence: 0.83,
    relevantData: ['product-manager', 'engineering-manager'],
    actionable: false
  }
];

// Demo Mode Configuration
export const DEMO_CONFIG = {
  autoAdvance: true,
  stepDuration: 5000, // 5 seconds per step
  highlightElements: true,
  showTooltips: true,
  pauseOnInteraction: true
};

// Demo Tour Steps
export const DEMO_TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to the Workforce Impact Dashboard',
    description: 'This dashboard analyzes how AI development growth correlates with job market changes across different technology roles.',
    target: '.dashboard-header',
    position: 'bottom'
  },
  {
    id: 'role-selection',
    title: 'Select a Job Role',
    description: 'Choose from 18+ technology roles to see detailed impact analysis. Try searching or browsing by category.',
    target: '.control-group:first-child',
    position: 'bottom'
  },
  {
    id: 'time-range',
    title: 'Adjust Time Range',
    description: 'Use the time slider to explore trends over different periods. See how AI impact has evolved over time.',
    target: '.control-group:last-child',
    position: 'bottom'
  },
  {
    id: 'overview-metrics',
    title: 'Overview Metrics',
    description: 'Get a quick snapshot of AI growth percentage, roles at risk, and growth opportunities.',
    target: '.dashboard-overview',
    position: 'bottom'
  },
  {
    id: 'view-modes',
    title: 'Multiple View Modes',
    description: 'Switch between Overview, Comparison, and Matrix views to analyze data from different perspectives.',
    target: '.view-mode-selector',
    position: 'bottom'
  },
  {
    id: 'charts',
    title: 'Interactive Visualizations',
    description: 'Explore time series charts and impact visualizations. Hover for detailed information.',
    target: '.charts-section',
    position: 'top'
  },
  {
    id: 'insights',
    title: 'AI-Generated Insights',
    description: 'Get contextual insights and recommendations based on your selected roles and time periods.',
    target: '.content-card:last-child',
    position: 'top'
  },
  {
    id: 'comparison-mode',
    title: 'Compare Roles Side-by-Side',
    description: 'Switch to comparison mode to analyze two roles simultaneously and understand relative market dynamics.',
    target: '.comparison-content',
    position: 'top',
    requiresViewMode: 'comparison'
  },
  {
    id: 'matrix-view',
    title: 'Impact Matrix Overview',
    description: 'View all roles in a sortable matrix to identify patterns and outliers across the entire dataset.',
    target: '.matrix-content',
    position: 'top',
    requiresViewMode: 'matrix'
  }
];

// Additional sample datasets for comprehensive demo
export const EXTENDED_SAMPLE_DATA = {
  // Technology trends over time
  technologyTrends: [
    { name: 'Artificial Intelligence', growth: 68.5, category: 'emerging' },
    { name: 'Machine Learning', growth: 72.3, category: 'emerging' },
    { name: 'Cloud Computing', growth: 45.2, category: 'established' },
    { name: 'DevOps', growth: 38.7, category: 'established' },
    { name: 'Blockchain', growth: 25.4, category: 'emerging' },
    { name: 'IoT', growth: 31.8, category: 'emerging' },
    { name: 'Cybersecurity', growth: 42.1, category: 'established' },
    { name: 'Data Science', growth: 55.9, category: 'established' }
  ],
  
  // Market segments
  marketSegments: [
    { name: 'Enterprise Software', impact: 'high', growth: 34.2 },
    { name: 'Startups', impact: 'very-high', growth: 67.8 },
    { name: 'Government', impact: 'medium', growth: 18.5 },
    { name: 'Healthcare', impact: 'high', growth: 41.3 },
    { name: 'Finance', impact: 'very-high', growth: 52.7 },
    { name: 'Education', impact: 'medium', growth: 28.9 }
  ],
  
  // Geographic distribution
  geographicData: [
    { region: 'North America', aiGrowth: 71.2, jobGrowth: 23.4 },
    { region: 'Europe', aiGrowth: 58.7, jobGrowth: 19.8 },
    { region: 'Asia Pacific', aiGrowth: 89.3, jobGrowth: 45.6 },
    { region: 'Latin America', aiGrowth: 34.5, jobGrowth: 12.1 },
    { region: 'Middle East & Africa', aiGrowth: 42.8, jobGrowth: 15.7 }
  ]
};

// Demo scenarios for guided tour
export const DEMO_SCENARIOS = [
  {
    id: 'ai-engineer-growth',
    name: 'AI Engineer Career Path',
    description: 'Explore the explosive growth in AI engineering roles',
    selectedRole: 'ai-engineer',
    timeRange: [new Date('2022-01-01'), new Date()] as [Date, Date],
    viewMode: 'overview',
    highlights: [
      'AI Engineer roles show 78.5% growth',
      'Classified as Growth Opportunity (🟢)',
      'High demand across all market segments'
    ]
  },
  {
    id: 'manual-testing-decline',
    name: 'Manual Testing Disruption',
    description: 'See how AI automation affects traditional testing roles',
    selectedRole: 'manual-tester',
    timeRange: [new Date('2022-01-01'), new Date()] as [Date, Date],
    viewMode: 'overview',
    highlights: [
      'Manual testing shows -8.5% decline',
      'High Disruption Risk (🔴)',
      'Transition to automation recommended'
    ]
  },
  {
    id: 'role-comparison',
    name: 'Data Roles Comparison',
    description: 'Compare Data Scientist vs Data Engineer opportunities',
    selectedRole: 'data-scientist',
    secondaryRole: 'data-engineer',
    timeRange: [new Date('2022-01-01'), new Date()] as [Date, Date],
    viewMode: 'comparison',
    highlights: [
      'Both roles show strong growth',
      'Data Engineers have slight advantage',
      'Complementary skill sets'
    ]
  }
];

// Export utilities for demo mode
export class DemoModeManager {
  private currentStep = 0;
  private isActive = false;
  private stepTimer: NodeJS.Timeout | null = null;
  private onStepChange?: (step: number) => void;

  constructor(onStepChange?: (step: number) => void) {
    this.onStepChange = onStepChange;
  }

  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.nextStep();
  }

  stop() {
    this.isActive = false;
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
  }

  nextStep() {
    if (!this.isActive) return;

    if (this.currentStep < DEMO_TOUR_STEPS.length) {
      this.onStepChange?.(this.currentStep);
      
      if (DEMO_CONFIG.autoAdvance) {
        this.stepTimer = setTimeout(() => {
          this.currentStep++;
          this.nextStep();
        }, DEMO_CONFIG.stepDuration);
      }
    } else {
      this.stop();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.onStepChange?.(this.currentStep);
    }
  }

  goToStep(step: number) {
    if (step >= 0 && step < DEMO_TOUR_STEPS.length) {
      this.currentStep = step;
      this.onStepChange?.(this.currentStep);
    }
  }

  getCurrentStep() {
    return DEMO_TOUR_STEPS[this.currentStep];
  }

  isLastStep() {
    return this.currentStep === DEMO_TOUR_STEPS.length - 1;
  }

  isFirstStep() {
    return this.currentStep === 0;
  }
}

// Data export utilities
export function exportAnalysisData(
  selectedRoles: string[],
  timeRange: [Date, Date],
  impactScores: JobRoleImpact[],
  insights: GeneratedInsight[]
) {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      selectedRoles,
      timeRange: {
        start: timeRange[0].toISOString(),
        end: timeRange[1].toISOString()
      },
      totalRoles: impactScores.length
    },
    impactAnalysis: impactScores,
    insights: insights,
    summary: {
      highRiskRoles: impactScores.filter(i => i.riskLevel === 'high').length,
      growthOpportunities: impactScores.filter(i => i.classification === 'growth').length,
      averageImpactScore: impactScores.reduce((sum, i) => sum + i.impactScore, 0) / impactScores.length
    }
  };

  return exportData;
}

// Shareable link generation
export function generateShareableLink(
  selectedRoles: string[],
  timeRange: [Date, Date],
  viewMode: string,
  comparisonRole?: string
): string {
  const params = new URLSearchParams({
    roles: selectedRoles.join(','),
    start: timeRange[0].toISOString().split('T')[0],
    end: timeRange[1].toISOString().split('T')[0],
    view: viewMode,
    ...(comparisonRole && { compare: comparisonRole })
  });

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}