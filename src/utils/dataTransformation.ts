import { 
  TimeSeriesPoint, 
  JobRoleData, 
  AIGrowthData, 
  JobRoleImpact,
  TrendDirection,
  RiskLevel,
  Classification
} from '../types';
import { validateTimeSeriesPoint } from './validation';

// Time series normalization and interpolation
export function normalizeTimeSeriesData(
  data: TimeSeriesPoint[],
  targetTimeRange: [Date, Date],
  granularity: 'month' | 'quarter' | 'year' = 'month'
): TimeSeriesPoint[] {
  if (data.length === 0) return [];

  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Generate target time points
  const targetPoints = generateTimePoints(targetTimeRange, granularity);
  const normalizedData: TimeSeriesPoint[] = [];

  for (const targetTime of targetPoints) {
    const existingPoint = sortedData.find(
      point => Math.abs(point.timestamp.getTime() - targetTime.getTime()) < 24 * 60 * 60 * 1000 // Within 1 day
    );

    if (existingPoint) {
      normalizedData.push(existingPoint);
    } else {
      // Interpolate missing value
      const interpolatedPoint = interpolateValue(sortedData, targetTime);
      normalizedData.push(interpolatedPoint);
    }
  }

  return normalizedData;
}

function generateTimePoints(
  timeRange: [Date, Date],
  granularity: 'month' | 'quarter' | 'year'
): Date[] {
  const points: Date[] = [];
  const current = new Date(timeRange[0]);
  const end = new Date(timeRange[1]);

  while (current <= end) {
    points.push(new Date(current));
    
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

  return points;
}

function interpolateValue(data: TimeSeriesPoint[], targetTime: Date): TimeSeriesPoint {
  if (data.length === 0) {
    return {
      timestamp: targetTime,
      value: 0,
      confidence: 0,
      isEstimated: true,
      metadata: { interpolationMethod: 'zero-fill' }
    };
  }

  if (data.length === 1) {
    return {
      timestamp: targetTime,
      value: data[0].value,
      confidence: Math.max(0, data[0].confidence - 0.2), // Reduce confidence for interpolation
      isEstimated: true,
      metadata: { interpolationMethod: 'constant', sourcePoint: data[0].timestamp }
    };
  }

  // Find surrounding points
  const targetTimestamp = targetTime.getTime();
  let beforePoint: TimeSeriesPoint | null = null;
  let afterPoint: TimeSeriesPoint | null = null;

  for (const point of data) {
    const pointTimestamp = point.timestamp.getTime();
    
    if (pointTimestamp <= targetTimestamp) {
      if (!beforePoint || pointTimestamp > beforePoint.timestamp.getTime()) {
        beforePoint = point;
      }
    }
    
    if (pointTimestamp >= targetTimestamp) {
      if (!afterPoint || pointTimestamp < afterPoint.timestamp.getTime()) {
        afterPoint = point;
      }
    }
  }

  // Linear interpolation
  if (beforePoint && afterPoint && beforePoint !== afterPoint) {
    const timeDiff = afterPoint.timestamp.getTime() - beforePoint.timestamp.getTime();
    const targetDiff = targetTimestamp - beforePoint.timestamp.getTime();
    const ratio = targetDiff / timeDiff;

    const interpolatedValue = beforePoint.value + (afterPoint.value - beforePoint.value) * ratio;
    const interpolatedConfidence = Math.min(beforePoint.confidence, afterPoint.confidence) * 0.8; // Reduce confidence

    return {
      timestamp: targetTime,
      value: interpolatedValue,
      confidence: interpolatedConfidence,
      isEstimated: true,
      metadata: {
        interpolationMethod: 'linear',
        beforePoint: beforePoint.timestamp,
        afterPoint: afterPoint.timestamp,
        ratio
      }
    };
  }

  // Extrapolation (less reliable)
  const referencePoint = beforePoint || afterPoint!;
  return {
    timestamp: targetTime,
    value: referencePoint.value,
    confidence: Math.max(0, referencePoint.confidence - 0.3), // Significantly reduce confidence
    isEstimated: true,
    metadata: { interpolationMethod: 'extrapolation', sourcePoint: referencePoint.timestamp }
  };
}

// Data alignment across different sources
export function alignDataSources(
  aiData: AIGrowthData,
  jobData: JobRoleData[],
  targetTimeRange: [Date, Date]
): { alignedAIData: AIGrowthData; alignedJobData: JobRoleData[] } {
  const normalizedAITimeSeries = normalizeTimeSeriesData(
    aiData.timeSeriesData,
    targetTimeRange
  );

  const alignedJobData = jobData.map(roleData => ({
    ...roleData,
    timeSeriesData: normalizeTimeSeriesData(
      roleData.timeSeriesData,
      targetTimeRange
    )
  }));

  return {
    alignedAIData: {
      ...aiData,
      timeSeriesData: normalizedAITimeSeries
    },
    alignedJobData
  };
}

// Impact score calculation
export function calculateImpactScore(aiGrowthRate: number, jobDemandChange: number): number {
  const baseScore = aiGrowthRate - jobDemandChange;
  const volatilityAdjustment = calculateVolatility(aiGrowthRate, jobDemandChange);
  return baseScore * (1 - volatilityAdjustment * 0.1);
}

function calculateVolatility(aiGrowthRate: number, jobDemandChange: number): number {
  // Simple volatility measure based on the magnitude of changes
  const aiVolatility = Math.abs(aiGrowthRate) / 100; // Normalize to 0-1 range
  const jobVolatility = Math.abs(jobDemandChange) / 100;
  return Math.min(1, (aiVolatility + jobVolatility) / 2);
}

// Risk classification
export function classifyRisk(impactScore: number, jobDemandChange: number): {
  riskLevel: RiskLevel;
  classification: Classification;
} {
  let riskLevel: RiskLevel;
  let classification: Classification;

  // High Disruption Risk: Impact Score > 30 and Job Demand Change < -15%
  if (impactScore > 30 && jobDemandChange < -15) {
    riskLevel = 'high';
    classification = 'disruption';
  }
  // Growth Opportunity: Impact Score < -10 and Job Demand Change > 10%
  else if (impactScore < -10 && jobDemandChange > 10) {
    riskLevel = 'low';
    classification = 'growth';
  }
  // Transition Role: Impact Score between -10 and 30
  else if (impactScore >= -10 && impactScore <= 30) {
    riskLevel = 'medium';
    classification = 'transition';
  }
  // Additional logic for edge cases
  else if (impactScore > 30) {
    riskLevel = 'high';
    classification = 'disruption';
  }
  else if (impactScore < -10) {
    riskLevel = 'low';
    classification = 'growth';
  }
  else {
    riskLevel = 'medium';
    classification = 'transition';
  }

  return { riskLevel, classification };
}

// Trend analysis
export function analyzeTrend(timeSeriesData: TimeSeriesPoint[]): {
  direction: TrendDirection;
  strength: number;
  growthRate: number;
} {
  if (timeSeriesData.length < 2) {
    return { direction: 'stable', strength: 0, growthRate: 0 };
  }

  // Sort by timestamp
  const sortedData = [...timeSeriesData].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Calculate linear regression slope
  const n = sortedData.length;
  const xValues = sortedData.map((_, index) => index);
  const yValues = sortedData.map(point => point.value);

  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Calculate correlation coefficient for trend strength
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  const numerator = xValues.reduce((sum, x, i) => sum + (x - meanX) * (yValues[i] - meanY), 0);
  const denomX = Math.sqrt(xValues.reduce((sum, x) => sum + (x - meanX) ** 2, 0));
  const denomY = Math.sqrt(yValues.reduce((sum, y) => sum + (y - meanY) ** 2, 0));
  
  const correlation = denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);
  const strength = Math.abs(correlation);

  // Determine trend direction
  let direction: TrendDirection;
  if (Math.abs(slope) < 0.1) {
    direction = 'stable';
  } else if (slope > 0) {
    direction = 'increasing';
  } else {
    direction = 'decreasing';
  }

  // Calculate growth rate (percentage change from first to last)
  const firstValue = sortedData[0].value;
  const lastValue = sortedData[n - 1].value;
  const growthRate = firstValue === 0 ? 0 : ((lastValue - firstValue) / firstValue) * 100;

  return { direction, strength, growthRate };
}

// Data aggregation utilities
export function aggregateTimeSeriesData(
  data: TimeSeriesPoint[],
  aggregationType: 'sum' | 'average' | 'max' | 'min' = 'average'
): number {
  if (data.length === 0) return 0;

  const values = data.map(point => point.value);

  switch (aggregationType) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'average':
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    default:
      return 0;
  }
}

// Confidence calculation
export function calculateConfidence(
  dataPoints: TimeSeriesPoint[],
  factors: {
    dataCompleteness: number;
    sourceReliability: number;
    temporalRecency: number;
  }
): number {
  if (dataPoints.length === 0) return 0;

  // Base confidence from individual data points
  const avgPointConfidence = dataPoints.reduce(
    (sum, point) => sum + point.confidence, 0
  ) / dataPoints.length;

  // Weighted combination of factors
  const weights = {
    pointConfidence: 0.4,
    completeness: 0.3,
    reliability: 0.2,
    recency: 0.1
  };

  const overallConfidence = 
    avgPointConfidence * weights.pointConfidence +
    factors.dataCompleteness * weights.completeness +
    factors.sourceReliability * weights.reliability +
    factors.temporalRecency * weights.recency;

  return Math.max(0, Math.min(1, overallConfidence));
}

// Data filtering utilities
export function filterTimeSeriesData(
  data: TimeSeriesPoint[],
  filters: {
    minConfidence?: number;
    excludeEstimated?: boolean;
    timeRange?: [Date, Date];
  }
): TimeSeriesPoint[] {
  return data.filter(point => {
    // Confidence filter
    if (filters.minConfidence !== undefined && point.confidence < filters.minConfidence) {
      return false;
    }

    // Estimated data filter
    if (filters.excludeEstimated && point.isEstimated) {
      return false;
    }

    // Time range filter
    if (filters.timeRange) {
      const timestamp = point.timestamp.getTime();
      const startTime = filters.timeRange[0].getTime();
      const endTime = filters.timeRange[1].getTime();
      
      if (timestamp < startTime || timestamp > endTime) {
        return false;
      }
    }

    return true;
  });
}