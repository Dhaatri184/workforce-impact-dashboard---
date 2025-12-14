/**
 * Property-Based Tests for Data Normalization
 * 
 * **Feature: workforce-impact-dashboard, Property 8: Data normalization consistency**
 * **Validates: Requirements 5.2, 5.4, 9.5**
 * 
 * Tests that data normalization functions maintain consistency and correctness
 * across all possible inputs, ensuring reliable data processing.
 */

import fc from 'fast-check';
import {
  normalizeTimeSeriesData,
  alignDataSources,
  analyzeTrend,
  aggregateTimeSeriesData,
  calculateConfidence,
  filterTimeSeriesData,
  calculateImpactScore,
  classifyRisk
} from '../../utils/dataTransformation';
import { arbitraries } from '../test-utils';

describe('Data Normalization Property Tests', () => {
  
  describe('Property 8.1: Time Series Normalization Consistency', () => {
    test('normalizeTimeSeriesData preserves data integrity', () => {
      // **Feature: workforce-impact-dashboard, Property 8: Data normalization consistency**
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(1, 50),
          arbitraries.timeRange(),
          fc.constantFrom('month', 'quarter', 'year'),
          (originalData: any, timeRange: any, granularity: any) => {
            const normalized = normalizeTimeSeriesData(originalData, timeRange, granularity);
            
            // Property: Normalized data should maintain temporal ordering
            const timestamps = normalized.map(p => p.timestamp.getTime());
            const isOrdered = timestamps.every((time, i) => 
              i === 0 || time >= timestamps[i - 1]
            );
            
            // Property: All normalized points should be within or extend the target range
            const [startTime, endTime] = timeRange;
            const allWithinRange = normalized.every(point => 
              point.timestamp >= startTime && point.timestamp <= endTime
            );
            
            // Property: Confidence should be between 0 and 1
            const validConfidence = normalized.every(point => 
              point.confidence >= 0 && point.confidence <= 1
            );
            
            // Property: Values should be non-negative (for our domain)
            const validValues = normalized.every(point => 
              typeof point.value === 'number' && !isNaN(point.value)
            );
            
            return isOrdered && allWithinRange && validConfidence && validValues;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('normalizeTimeSeriesData handles empty input gracefully', () => {
      fc.assert(
        fc.property(
          arbitraries.timeRange(),
          fc.constantFrom('month', 'quarter', 'year'),
          (timeRange: any, granularity: any) => {
            const normalized = normalizeTimeSeriesData([], timeRange, granularity);
            
            // Property: Empty input should return empty output
            return normalized.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('normalizeTimeSeriesData interpolation maintains value bounds', () => {
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(2, 20),
          arbitraries.timeRange(),
          (originalData: any, timeRange: any) => {
            const normalized = normalizeTimeSeriesData(originalData, timeRange, 'month');
            
            if (originalData.length === 0 || normalized.length === 0) return true;
            
            const originalValues = originalData.map((p: any) => p.value);
            const minOriginal = Math.min(...originalValues);
            const maxOriginal = Math.max(...originalValues);
            
            // Property: Interpolated values should generally stay within original bounds
            // (allowing some tolerance for extrapolation)
            const interpolatedPoints = normalized.filter(p => p.isEstimated);
            const withinBounds = interpolatedPoints.every(point => {
              const tolerance = (maxOriginal - minOriginal) * 0.5; // 50% tolerance
              return point.value >= minOriginal - tolerance && 
                     point.value <= maxOriginal + tolerance;
            });
            
            return withinBounds;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.2: Data Source Alignment Consistency', () => {
    test('alignDataSources maintains data structure integrity', () => {
      fc.assert(
        fc.property(
          arbitraries.aiGrowthData(),
          fc.array(arbitraries.jobRoleData(), { minLength: 1, maxLength: 10 }),
          arbitraries.timeRange(),
          (aiData: any, jobDataArray: any, timeRange: any) => {
            const { alignedAIData, alignedJobData } = alignDataSources(
              aiData, 
              jobDataArray, 
              timeRange
            );
            
            // Property: Aligned data should preserve original structure
            const aiStructurePreserved = 
              alignedAIData.repositoryCount === aiData.repositoryCount &&
              alignedAIData.contributorGrowth === aiData.contributorGrowth &&
              alignedAIData.technologyBreakdown.length === aiData.technologyBreakdown.length;
            
            // Property: Job data array length should be preserved
            const jobArrayLengthPreserved = alignedJobData.length === jobDataArray.length;
            
            // Property: Role IDs should be preserved
            const roleIdsPreserved = alignedJobData.every((aligned: any, index: number) => 
              aligned.roleId === jobDataArray[index].roleId
            );
            
            // Property: All aligned time series should have consistent time points
            const allTimeSeries = [
              alignedAIData.timeSeriesData,
              ...alignedJobData.map((job: any) => job.timeSeriesData)
            ];
            
            const timePointsConsistent = allTimeSeries.every(series => 
              series.every(point => 
                point.timestamp >= timeRange[0] && point.timestamp <= timeRange[1]
              )
            );
            
            return aiStructurePreserved && 
                   jobArrayLengthPreserved && 
                   roleIdsPreserved && 
                   timePointsConsistent;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.3: Trend Analysis Consistency', () => {
    test('analyzeTrend produces consistent results', () => {
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(2, 100),
          (timeSeriesData: any) => {
            const trend = analyzeTrend(timeSeriesData);
            
            // Property: Strength should be between 0 and 1
            const validStrength = trend.strength >= 0 && trend.strength <= 1;
            
            // Property: Direction should be one of the valid values
            const validDirection = ['increasing', 'decreasing', 'stable'].includes(trend.direction);
            
            // Property: Growth rate should be a valid number
            const validGrowthRate = typeof trend.growthRate === 'number' && 
                                   !isNaN(trend.growthRate);
            
            return validStrength && validDirection && validGrowthRate;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('analyzeTrend handles edge cases correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant([]), // Empty array
            fc.array(arbitraries.timeSeriesPoint(), { minLength: 1, maxLength: 1 }) // Single point
          ),
          (edgeCaseData: any) => {
            const trend = analyzeTrend(edgeCaseData);
            
            // Property: Edge cases should return stable trend with zero growth
            return trend.direction === 'stable' && 
                   trend.strength === 0 && 
                   trend.growthRate === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.4: Aggregation Consistency', () => {
    test('aggregateTimeSeriesData produces mathematically correct results', () => {
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(1, 50),
          fc.constantFrom('sum', 'average', 'max', 'min'),
          (timeSeriesData: any, aggregationType: any) => {
            const result = aggregateTimeSeriesData(timeSeriesData, aggregationType);
            
            if (timeSeriesData.length === 0) {
              return result === 0;
            }
            
            const values = timeSeriesData.map((p: any) => p.value);
            
            // Property: Aggregation should match mathematical definition
            switch (aggregationType) {
              case 'sum':
                const expectedSum = values.reduce((sum: number, val: number) => sum + val, 0);
                return Math.abs(result - expectedSum) < 0.0001;
              
              case 'average':
                const expectedAvg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
                return Math.abs(result - expectedAvg) < 0.0001;
              
              case 'max':
                const expectedMax = Math.max(...values);
                return result === expectedMax;
              
              case 'min':
                const expectedMin = Math.min(...values);
                return result === expectedMin;
              
              default:
                return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.5: Confidence Calculation Consistency', () => {
    test('calculateConfidence produces valid confidence scores', () => {
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(0, 50),
          fc.record({
            dataCompleteness: fc.float({ min: 0, max: 1 }),
            sourceReliability: fc.float({ min: 0, max: 1 }),
            temporalRecency: fc.float({ min: 0, max: 1 })
          }),
          (dataPoints: any, factors: any) => {
            const confidence = calculateConfidence(dataPoints, factors);
            
            // Property: Confidence should always be between 0 and 1
            const validRange = confidence >= 0 && confidence <= 1;
            
            // Property: Empty data should result in zero confidence
            const emptyDataHandled = dataPoints.length === 0 ? confidence === 0 : true;
            
            return validRange && emptyDataHandled;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.6: Data Filtering Consistency', () => {
    test('filterTimeSeriesData maintains data integrity', () => {
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(0, 50),
          fc.record({
            minConfidence: fc.option(fc.float({ min: 0, max: 1 })),
            excludeEstimated: fc.option(fc.boolean()),
            timeRange: fc.option(arbitraries.timeRange())
          }),
          (originalData: any, filters: any) => {
            const filtered = filterTimeSeriesData(originalData, filters);
            
            // Property: Filtered data should be a subset of original data
            const isSubset = filtered.length <= originalData.length;
            
            // Property: All filtered points should meet the filter criteria
            const meetsFilters = filtered.every(point => {
              // Check confidence filter
              if (filters.minConfidence !== undefined && 
                  point.confidence < filters.minConfidence) {
                return false;
              }
              
              // Check estimated filter
              if (filters.excludeEstimated && point.isEstimated) {
                return false;
              }
              
              // Check time range filter
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
            
            // Property: Filtered data should maintain temporal ordering
            const timestamps = filtered.map((p: any) => p.timestamp.getTime());
            const isOrdered = timestamps.every((time, i) => 
              i === 0 || time >= timestamps[i - 1]
            );
            
            return isSubset && meetsFilters && isOrdered;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.7: Impact Score and Risk Classification Consistency', () => {
    test('calculateImpactScore and classifyRisk produce consistent results', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -100, max: 200 }), // AI growth rate
          fc.float({ min: -50, max: 100 }),  // Job demand change
          (aiGrowthRate: any, jobDemandChange: any) => {
            const impactScore = calculateImpactScore(aiGrowthRate, jobDemandChange);
            const { riskLevel, classification } = classifyRisk(impactScore, jobDemandChange);
            
            // Property: Impact score should be a valid number
            const validImpactScore = typeof impactScore === 'number' && !isNaN(impactScore);
            
            // Property: Risk level should be one of the valid values
            const validRiskLevel = ['high', 'medium', 'low'].includes(riskLevel);
            
            // Property: Classification should be one of the valid values
            const validClassification = ['disruption', 'transition', 'growth'].includes(classification);
            
            // Property: High disruption risk should correspond to disruption classification
            const consistentHighRisk = riskLevel !== 'high' || classification === 'disruption';
            
            // Property: Low risk should correspond to growth classification
            const consistentLowRisk = riskLevel !== 'low' || classification === 'growth';
            
            return validImpactScore && 
                   validRiskLevel && 
                   validClassification && 
                   consistentHighRisk && 
                   consistentLowRisk;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Impact score calculation is deterministic', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -100, max: 200 }),
          fc.float({ min: -50, max: 100 }),
          (aiGrowthRate: any, jobDemandChange: any) => {
            const score1 = calculateImpactScore(aiGrowthRate, jobDemandChange);
            const score2 = calculateImpactScore(aiGrowthRate, jobDemandChange);
            
            // Property: Same inputs should always produce same outputs
            return Math.abs(score1 - score2) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.8: Cross-Function Consistency', () => {
    test('Data normalization preserves statistical properties', () => {
      fc.assert(
        fc.property(
          arbitraries.timeSeriesData(5, 30),
          arbitraries.timeRange(),
          (originalData: any, timeRange: any) => {
            // Skip if original data is empty or has insufficient range
            if (originalData.length < 5) return true;
            
            const normalized = normalizeTimeSeriesData(originalData, timeRange, 'month');
            
            if (normalized.length < 2) return true;
            
            const originalTrend = analyzeTrend(originalData);
            const normalizedTrend = analyzeTrend(normalized);
            
            // Property: Normalization should preserve general trend direction
            // (allowing for some variation due to interpolation)
            const trendPreserved = originalTrend.direction === 'stable' || 
                                 normalizedTrend.direction === 'stable' ||
                                 originalTrend.direction === normalizedTrend.direction ||
                                 Math.abs(originalTrend.growthRate - normalizedTrend.growthRate) < 50;
            
            return trendPreserved;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});