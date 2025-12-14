// Core data types for the Workforce Impact Dashboard

export type JobCategory = 
  | 'software-development'
  | 'data-science'
  | 'design'
  | 'management'
  | 'testing'
  | 'support'
  | 'devops'
  | 'ai-ml';

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export type RiskLevel = 'high' | 'medium' | 'low';

export type Classification = 'disruption' | 'transition' | 'growth';

export type InsightType = 'trend' | 'comparison' | 'prediction' | 'correlation';

export type Granularity = 'month' | 'quarter' | 'year';

export type SortBy = 'aiGrowth' | 'jobTrend' | 'impactScore';

export type SortOrder = 'asc' | 'desc';

// Time Series Data
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  confidence: number;
  isEstimated: boolean;
  metadata?: Record<string, any>;
}

// Job Role Models
export interface JobRole {
  id: string;
  name: string;
  category: JobCategory;
  description: string;
  aliases: string[];
}

export interface JobRoleData {
  roleId: string;
  timeSeriesData: TimeSeriesPoint[];
  currentTrend: TrendDirection;
  growthRate: number;
  confidence: number;
}

// AI Growth Data
export interface TechCategory {
  name: string;
  count: number;
  growthRate: number;
}

export interface AIGrowthData {
  timeSeriesData: TimeSeriesPoint[];
  repositoryCount: number;
  contributorGrowth: number;
  technologyBreakdown: TechCategory[];
}

// Impact Analysis
export interface JobRoleImpact {
  roleId: string;
  aiGrowthRate: number;
  jobDemandChange: number;
  impactScore: number;
  riskLevel: RiskLevel;
  classification: Classification;
}

// Analysis Context
export interface AnalysisFilters {
  categories?: JobCategory[];
  riskLevels?: RiskLevel[];
  minConfidence?: number;
}

export interface AnalysisContext {
  selectedRoles: string[];
  timeRange: [Date, Date];
  comparisonMode: boolean;
  filters: AnalysisFilters;
}

// Generated Insights
export interface GeneratedInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevantData: string[];
  actionable: boolean;
}

// Component Props Interfaces
export interface RoleExplorerProps {
  roles: JobRole[];
  selectedRole: string | null;
  onRoleSelect: (roleId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface TimeSliderProps {
  timeRange: [Date, Date];
  selectedPeriod: [Date, Date];
  onPeriodChange: (period: [Date, Date]) => void;
  granularity: Granularity;
}

export interface ComparisonPanelProps {
  primaryRole: JobRole;
  secondaryRole: JobRole | null;
  onSecondaryRoleSelect: (roleId: string) => void;
  timeRange: [Date, Date];
}

export interface ImpactMatrixProps {
  roles: JobRoleImpact[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  onRoleClick: (roleId: string) => void;
}

export interface InsightPanelProps {
  insights: GeneratedInsight[];
  context: AnalysisContext;
  onInsightClick: (insightId: string) => void;
}

// API Response Types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  language: string;
  topics: string[];
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface JobMarketDataPoint {
  date: string;
  role: string;
  postings: number;
  location?: string;
  source: string;
}

// Service Interfaces
export interface DataService {
  fetchAIGrowthData(timeRange: [Date, Date]): Promise<AIGrowthData>;
  fetchJobMarketData(roles: string[], timeRange: [Date, Date]): Promise<JobRoleData[]>;
  calculateImpactScores(aiData: AIGrowthData, jobData: JobRoleData[]): JobRoleImpact[];
  generateInsights(context: AnalysisContext): GeneratedInsight[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  retryAfter?: number;
}