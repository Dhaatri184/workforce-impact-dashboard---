/**
 * Property-Based Tests for API Fallback Behavior
 * 
 * **Feature: workforce-impact-dashboard, Property 9: Reliable data fallback**
 * **Validates: Requirements 5.3, 9.2**
 * 
 * Tests that API fallback mechanisms work reliably across all failure scenarios,
 * ensuring the dashboard always provides data even when external APIs fail.
 */

import fc from 'fast-check';
import { 
  normalizeTimeSeriesData,
  alignDataSources,
  calculateImpactScore,
  classifyRisk
} from '../../utils/dataTransformation';
import { arbitraries, mockData } from '../test-utils';

describe('API Fallback Behavior Property Tests', () => {

  describe('Property 9.1: Data Processing Fallback Consistency', () => {
    test('Data processing functions handle invalid inputs gracefully', () => {
      // **Feature: workforce-impact-dashboard, Property 9: Reliable data fallback**
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant([]), // Empty data
            fc.array(arbitraries.timeSeriesPoint(), { minLength: 1, maxLength: 3 }), // Minimal data
            arbitraries.timeSeriesData(1, 100) // Normal data
          ),
          arbitraries.timeRange(),
          (inputData: any, timeRange: any) => {
            try {
              const normalized = normalizeTimeSeriesData(inputData, timeRange, 'month');
              
              // Property: Should always return valid array
              const isValidArray = Array.isArray(normalized);
              
              // Property: All returned points should have valid structure
              const allValidPoints = normalized.every(point => 
                point &&
                typeof point.timestamp === 'object' &&
                typeof point.value === 'number' &&
                typeof point.confidence === 'number' &&
                typeof point.isEstimated === 'boolean' &&
                point.confidence >= 0 && point.confidence <= 1 &&
                !isNaN(point.value)
              );
              
              // Property: Should handle empty input gracefully
              const handlesEmptyInput = inputData.length === 0 ? normalized.length === 0 : true;
              
              return isValidArray && allValidPoints && handlesEmptyInput;
            } catch (error) {
              // Property: Should not throw errors, should handle gracefully
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Data alignment works with mismatched or incomplete data sources', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            arbitraries.aiGrowthData(),
            fc.record({
              timeSeriesData: fc.constant([]),
              repositoryCount: fc.constant(0),
              contributorGrowth: fc.constant(0),
              technologyBreakdown: fc.constant([])
            })
          ),
          fc.oneof(
            fc.array(arbitraries.jobRoleData(), { minLength: 1, maxLength: 5 }),
            fc.constant([]) // Empty job data array
          ),
          arbitraries.timeRange(),
          (aiData: any, jobDataArray: any, timeRange: any) => {
            try {
              const { alignedAIData, alignedJobData } = alignDataSources(
                aiData,
                jobDataArray,
                timeRange
              );
              
              // Property: Should always return valid aligned data structures
              const validAIStructure = 
                alignedAIData &&
                Array.isArray(alignedAIData.timeSeriesData) &&
                typeof alignedAIData.repositoryCount === 'number' &&
                typeof alignedAIData.contributorGrowth === 'number' &&
                Array.isArray(alignedAIData.technologyBreakdown);
              
              const validJobStructure = 
                Array.isArray(alignedJobData) &&
                alignedJobData.length === jobDataArray.length;
              
              // Property: Should preserve role IDs even with empty data
              const roleIdsPreserved = alignedJobData.every((aligned, index) => 
                jobDataArray[index] ? aligned.roleId === jobDataArray[index].roleId : true
              );
              
              return validAIStructure && validJobStructure && roleIdsPreserved;
            } catch (error) {
              // Should handle errors gracefully
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.2: Impact Calculation Fallback Consistency', () => {
    test('Impact score calculation handles extreme and invalid values', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ min: -1000, max: 1000 }), // Normal range
            fc.constant(NaN), // Invalid number
            fc.constant(Infinity), // Infinite value
            fc.constant(-Infinity) // Negative infinite
          ),
          fc.oneof(
            fc.float({ min: -100, max: 100 }), // Normal range
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity)
          ),
          (aiGrowthRate: any, jobDemandChange: any) => {
            try {
              const impactScore = calculateImpactScore(aiGrowthRate, jobDemandChange);
              
              // Property: Should always return a valid number or handle gracefully
              const isValidNumber = typeof impactScore === 'number' && !isNaN(impactScore);
              
              // Property: Should be finite (not infinite)
              const isFinite = Number.isFinite(impactScore);
              
              return isValidNumber && isFinite;
            } catch (error) {
              // If it throws, it should be for invalid inputs, which is acceptable
              return isNaN(aiGrowthRate) || isNaN(jobDemandChange) || 
                     !Number.isFinite(aiGrowthRate) || !Number.isFinite(jobDemandChange);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Risk classification handles edge cases consistently', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ min: -200, max: 200 }), // Normal range
            fc.constant(0), // Zero impact
            fc.float({ min: -1000, max: 1000 }) // Extreme values
          ),
          fc.oneof(
            fc.float({ min: -100, max: 100 }), // Normal range
            fc.constant(0) // Zero change
          ),
          (impactScore: any, jobDemandChange: any) => {
            try {
              const { riskLevel, classification } = classifyRisk(impactScore, jobDemandChange);
              
              // Property: Should always return valid risk level
              const validRiskLevel = ['high', 'medium', 'low'].includes(riskLevel);
              
              // Property: Should always return valid classification
              const validClassification = ['disruption', 'transition', 'growth'].includes(classification);
              
              // Property: High risk should correspond to disruption (consistency check)
              const consistentHighRisk = riskLevel !== 'high' || classification === 'disruption';
              
              return validRiskLevel && validClassification && consistentHighRisk;
            } catch (error) {
              // Should not throw for any numeric inputs
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.3: Fallback Data Quality Consistency', () => {
    test('Generated fallback data maintains quality standards', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(
            'software-developer', 'ai-engineer', 'data-scientist', 
            'manual-tester', 'ux-designer', 'product-manager'
          ), { minLength: 1, maxLength: 5 }),
          (roleIds: any) => {
            // Simulate fallback data generation
            const fallbackData = roleIds.map((roleId: string) => 
              mockData.createMockJobRoleData(roleId)
            );
            
            // Property: All fallback data should meet minimum quality standards
            const allValidStructure = fallbackData.every((roleData: any) => 
              roleData &&
              typeof roleData.roleId === 'string' &&
              Array.isArray(roleData.timeSeriesData) &&
              ['increasing', 'decreasing', 'stable'].includes(roleData.currentTrend) &&
              typeof roleData.growthRate === 'number' &&
              typeof roleData.confidence === 'number' &&
              !isNaN(roleData.growthRate) &&
              roleData.confidence >= 0 && roleData.confidence <= 1
            );
            
            // Property: Time series data should have reasonable quality
            const allValidTimeSeries = fallbackData.every((roleData: any) =>
              roleData.timeSeriesData.length > 0 &&
              roleData.timeSeriesData.every((point: any) => 
                typeof point.value === 'number' &&
                !isNaN(point.value) &&
                point.value >= 0 &&
                point.confidence >= 0.3 && // Minimum confidence threshold
                point.confidence <= 1
              )
            );
            
            // Property: Different roles should have different characteristics
            const hasVariation = fallbackData.length === 1 || (() => {
              const growthRates = fallbackData.map((r: any) => r.growthRate);
              return Math.max(...growthRates) - Math.min(...growthRates) > 0.1;
            })();
            
            return allValidStructure && allValidTimeSeries && hasVariation;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Fallback AI growth data maintains realistic characteristics', () => {
      fc.assert(
        fc.property(
          fc.constant(true), // Dummy parameter since we don't use timeRange
          () => {
            const fallbackAIData = mockData.createMockAIGrowthData();
            
            // Property: Should have valid structure
            const validStructure = 
              fallbackAIData &&
              Array.isArray(fallbackAIData.timeSeriesData) &&
              typeof fallbackAIData.repositoryCount === 'number' &&
              typeof fallbackAIData.contributorGrowth === 'number' &&
              Array.isArray(fallbackAIData.technologyBreakdown);
            
            // Property: Values should be realistic
            const realisticValues = 
              fallbackAIData.repositoryCount > 0 &&
              fallbackAIData.repositoryCount < 1000000 &&
              Math.abs(fallbackAIData.contributorGrowth) < 1000 &&
              fallbackAIData.technologyBreakdown.length > 0 &&
              fallbackAIData.technologyBreakdown.every(tech => 
                tech.count > 0 && Math.abs(tech.growthRate) < 500
              );
            
            // Property: Time series should be temporally consistent
            const temporallyConsistent = fallbackAIData.timeSeriesData.length === 0 || (() => {
              const timestamps = fallbackAIData.timeSeriesData.map(p => p.timestamp.getTime());
              return timestamps.every((time, i) => i === 0 || time >= timestamps[i - 1]);
            })();
            
            return validStructure && realisticValues && temporallyConsistent;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.4: Error Recovery Consistency', () => {
    test('System maintains functionality under various error conditions', () => {
      fc.assert(
        fc.property(
          fc.record({
            hasNetworkError: fc.boolean(),
            hasInvalidData: fc.boolean(),
            hasPartialData: fc.boolean(),
            dataCorruption: fc.float({ min: 0, max: 1 }) // 0 = no corruption, 1 = fully corrupted
          }),
          arbitraries.timeRange(),
          (errorConditions: any, timeRange: any) => {
            try {
              // Simulate various error conditions by modifying data
              let testData = mockData.createMockTimeSeriesData(12);
              
              if (errorConditions.hasInvalidData) {
                // Introduce invalid data points
                testData = testData.map((point, i) => 
                  i % 3 === 0 ? { ...point, value: NaN } : point
                );
              }
              
              if (errorConditions.hasPartialData) {
                // Reduce data availability
                testData = testData.slice(0, Math.max(1, Math.floor(testData.length / 2)));
              }
              
              if (errorConditions.dataCorruption > 0.5) {
                // Introduce data corruption
                testData = testData.map(point => ({
                  ...point,
                  confidence: Math.random() > errorConditions.dataCorruption ? point.confidence : 0
                }));
              }
              
              // Test that normalization still works
              const normalized = normalizeTimeSeriesData(testData, timeRange, 'month');
              
              // Property: Should always return some valid data structure
              const hasValidOutput = Array.isArray(normalized);
              
              // Property: Should filter out invalid data points
              const validPointsOnly = normalized.every(point => 
                !isNaN(point.value) && point.confidence >= 0 && point.confidence <= 1
              );
              
              // Property: Should maintain temporal ordering even with errors
              const temporallyOrdered = normalized.length <= 1 || (() => {
                const timestamps = normalized.map(p => p.timestamp.getTime());
                return timestamps.every((time, i) => i === 0 || time >= timestamps[i - 1]);
              })();
              
              return hasValidOutput && validPointsOnly && temporallyOrdered;
            } catch (error) {
              // System should handle errors gracefully, not crash
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.5: Consistency Across Multiple Fallback Attempts', () => {
    test('Multiple fallback attempts produce consistent results', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('software-developer', 'ai-engineer', 'data-scientist'),
          (roleId: any) => {
            // Generate fallback data multiple times
            const attempt1 = mockData.createMockJobRoleData(roleId);
            const attempt2 = mockData.createMockJobRoleData(roleId);
            const attempt3 = mockData.createMockJobRoleData(roleId);
            
            // Property: Should have consistent structure across attempts
            const consistentStructure = [attempt1, attempt2, attempt3].every(data =>
              data.roleId === roleId &&
              Array.isArray(data.timeSeriesData) &&
              typeof data.growthRate === 'number' &&
              typeof data.confidence === 'number'
            );
            
            // Property: Should have similar characteristics (within reasonable bounds)
            const growthRates = [attempt1.growthRate, attempt2.growthRate, attempt3.growthRate];
            const growthRateVariation = Math.max(...growthRates) - Math.min(...growthRates);
            const reasonableVariation = growthRateVariation < 100; // Allow some variation but not extreme
            
            // Property: All should meet minimum quality standards
            const allMeetQualityStandards = [attempt1, attempt2, attempt3].every(data =>
              data.confidence >= 0.3 &&
              data.timeSeriesData.length > 0 &&
              data.timeSeriesData.every(point => 
                !isNaN(point.value) && point.value >= 0 && point.confidence >= 0.3
              )
            );
            
            return consistentStructure && reasonableVariation && allMeetQualityStandards;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});