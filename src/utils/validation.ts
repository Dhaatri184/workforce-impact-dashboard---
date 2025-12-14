import { 
  JobRole, 
  JobRoleData, 
  AIGrowthData, 
  TimeSeriesPoint, 
  JobRoleImpact,
  AnalysisContext,
  GeneratedInsight,
  JobCategory,
  RiskLevel,
  TrendDirection,
  Classification,
  InsightType
} from '../types';

// Type guards for runtime validation
export function isJobCategory(value: string): value is JobCategory {
  const validCategories: JobCategory[] = [
    'software-development',
    'data-science', 
    'design',
    'management',
    'testing',
    'support',
    'devops',
    'ai-ml'
  ];
  return validCategories.includes(value as JobCategory);
}

export function isRiskLevel(value: string): value is RiskLevel {
  return ['high', 'medium', 'low'].includes(value);
}

export function isTrendDirection(value: string): value is TrendDirection {
  return ['increasing', 'decreasing', 'stable'].includes(value);
}

export function isClassification(value: string): value is Classification {
  return ['disruption', 'transition', 'growth'].includes(value);
}

export function isInsightType(value: string): value is InsightType {
  return ['trend', 'comparison', 'prediction', 'correlation'].includes(value);
}

// Data validation functions
export function validateTimeSeriesPoint(point: any): point is TimeSeriesPoint {
  return (
    point &&
    typeof point === 'object' &&
    point.timestamp instanceof Date &&
    typeof point.value === 'number' &&
    typeof point.confidence === 'number' &&
    typeof point.isEstimated === 'boolean' &&
    point.confidence >= 0 &&
    point.confidence <= 1
  );
}

export function validateJobRole(role: any): role is JobRole {
  return (
    role &&
    typeof role === 'object' &&
    typeof role.id === 'string' &&
    typeof role.name === 'string' &&
    typeof role.description === 'string' &&
    isJobCategory(role.category) &&
    Array.isArray(role.aliases) &&
    role.aliases.every((alias: any) => typeof alias === 'string') &&
    role.id.length > 0 &&
    role.name.length > 0
  );
}

export function validateJobRoleData(data: any): data is JobRoleData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.roleId === 'string' &&
    Array.isArray(data.timeSeriesData) &&
    data.timeSeriesData.every(validateTimeSeriesPoint) &&
    isTrendDirection(data.currentTrend) &&
    typeof data.growthRate === 'number' &&
    typeof data.confidence === 'number' &&
    data.confidence >= 0 &&
    data.confidence <= 1 &&
    data.roleId.length > 0
  );
}

export function validateAIGrowthData(data: any): data is AIGrowthData {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.timeSeriesData) &&
    data.timeSeriesData.every(validateTimeSeriesPoint) &&
    typeof data.repositoryCount === 'number' &&
    typeof data.contributorGrowth === 'number' &&
    Array.isArray(data.technologyBreakdown) &&
    data.technologyBreakdown.every((tech: any) => 
      tech &&
      typeof tech.name === 'string' &&
      typeof tech.count === 'number' &&
      typeof tech.growthRate === 'number' &&
      tech.count >= 0
    ) &&
    data.repositoryCount >= 0 &&
    data.timeSeriesData.length > 0
  );
}

export function validateJobRoleImpact(impact: any): impact is JobRoleImpact {
  return (
    impact &&
    typeof impact === 'object' &&
    typeof impact.roleId === 'string' &&
    typeof impact.aiGrowthRate === 'number' &&
    typeof impact.jobDemandChange === 'number' &&
    typeof impact.impactScore === 'number' &&
    isRiskLevel(impact.riskLevel) &&
    isClassification(impact.classification) &&
    impact.roleId.length > 0
  );
}

export function validateAnalysisContext(context: any): context is AnalysisContext {
  return (
    context &&
    typeof context === 'object' &&
    Array.isArray(context.selectedRoles) &&
    context.selectedRoles.every((role: any) => typeof role === 'string') &&
    Array.isArray(context.timeRange) &&
    context.timeRange.length === 2 &&
    context.timeRange.every((date: any) => date instanceof Date) &&
    typeof context.comparisonMode === 'boolean' &&
    context.filters &&
    typeof context.filters === 'object' &&
    context.timeRange[0] <= context.timeRange[1]
  );
}

export function validateGeneratedInsight(insight: any): insight is GeneratedInsight {
  return (
    insight &&
    typeof insight === 'object' &&
    typeof insight.id === 'string' &&
    isInsightType(insight.type) &&
    typeof insight.title === 'string' &&
    typeof insight.description === 'string' &&
    typeof insight.confidence === 'number' &&
    Array.isArray(insight.relevantData) &&
    insight.relevantData.every((data: any) => typeof data === 'string') &&
    typeof insight.actionable === 'boolean' &&
    insight.confidence >= 0 &&
    insight.confidence <= 1 &&
    insight.id.length > 0 &&
    insight.title.length > 0 &&
    insight.description.length > 0
  );
}

// Data quality validation
export function validateDataQuality<T>(
  data: T[], 
  validator: (item: any) => item is T,
  minItems = 1
): { isValid: boolean; errors: string[]; validItems: T[] } {
  const errors: string[] = [];
  const validItems: T[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors, validItems };
  }

  if (data.length < minItems) {
    errors.push(`Minimum ${minItems} items required, got ${data.length}`);
  }

  data.forEach((item, index) => {
    if (validator(item)) {
      validItems.push(item);
    } else {
      errors.push(`Invalid item at index ${index}`);
    }
  });

  const isValid = errors.length === 0 && validItems.length >= minItems;
  return { isValid, errors, validItems };
}

// Completeness validation
export function validateDataCompleteness(
  timeSeriesData: TimeSeriesPoint[],
  expectedTimeRange: [Date, Date],
  granularity: 'month' | 'quarter' | 'year' = 'month'
): { completeness: number; missingPeriods: Date[]; estimatedCount: number } {
  if (timeSeriesData.length === 0) {
    return { completeness: 0, missingPeriods: [], estimatedCount: 0 };
  }

  // Generate expected time points based on granularity
  const expectedPoints: Date[] = [];
  const current = new Date(expectedTimeRange[0]);
  const end = new Date(expectedTimeRange[1]);

  while (current <= end) {
    expectedPoints.push(new Date(current));
    
    switch (granularity) {
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarter':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'year':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }

  // Check which expected points are missing
  const actualTimestamps = new Set(
    timeSeriesData.map(point => point.timestamp.getTime())
  );

  const missingPeriods = expectedPoints.filter(
    expected => !actualTimestamps.has(expected.getTime())
  );

  const estimatedCount = timeSeriesData.filter(point => point.isEstimated).length;
  const completeness = (expectedPoints.length - missingPeriods.length) / expectedPoints.length;

  return { completeness, missingPeriods, estimatedCount };
}

// Range validation
export function validateNumericRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity,
  fieldName = 'value'
): { isValid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (value < min) {
    return { isValid: false, error: `${fieldName} must be >= ${min}` };
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName} must be <= ${max}` };
  }

  return { isValid: true };
}

// Date range validation
export function validateDateRange(
  startDate: Date,
  endDate: Date
): { isValid: boolean; error?: string } {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return { isValid: false, error: 'Both dates must be valid Date objects' };
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { isValid: false, error: 'Both dates must be valid' };
  }

  if (startDate > endDate) {
    return { isValid: false, error: 'Start date must be before or equal to end date' };
  }

  const now = new Date();
  const minDate = new Date('2020-01-01');
  
  if (startDate < minDate) {
    return { isValid: false, error: 'Start date cannot be before 2020' };
  }

  if (endDate > now) {
    return { isValid: false, error: 'End date cannot be in the future' };
  }

  return { isValid: true };
}