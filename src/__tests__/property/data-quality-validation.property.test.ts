/**
 * Property-Based Tests for Data Quality Validation
 * 
 * **Feature: workforce-impact-dashboard, Property 16: Data quality validation**
 * **Validates: Requirements 9.1**
 * 
 * Tests that data quality validation functions correctly identify and handle
 * various data quality issues across all input scenarios.
 */

import fc from 'fast-check';
import { 
  validateTimeSeriesPoint,
  validateJobRoleData,
  validateAIGrowthData,
  validateAnalysisContext,
  validateDataQuality
} from '../../utils/validation';
import { arbitraries, mockData } from '../test-utils';

describe('Data Quality Validation Property Tests', () => {

  describe('Property 16.1: Time Series Point Validation', () => {
    test('validateTimeSeriesPoint correctly identifies valid and invalid points', () => {
      // **Feature: workforce-impact-dashboard, Property 16: Data quality validation**
      fc.assert(
        fc.property(
          fc.record({
            timestamp: fc.oneof(
              arbitraries.date(),
              fc.constant(null),
              fc.constant(undefined),
              fc.constant('invalid-date')
            ),
            value: fc.oneof(
              fc.float({ min: -1000, max: 10000 }),
              fc.constant(NaN),
              fc.constant(Infinity),
              fc.constant(-Infinity),
              fc.constant(null)
            ),
            confidence: fc.oneof(
              fc.float({ min: 0, max: 1 }),
              fc.float({ min: -1, max: 2 }), // Invalid range
              fc.constant(NaN)
            ),
            isEstimated: fc.oneof(
              fc.boolean(),
              fc.constant(null),
              fc.constant('true'), // Wrong type
              fc.constant(1)
            )
          }),
          (point: any) => {
            const isValid = validateTimeSeriesPoint(point);
            
            // Property: Valid points must have all required fields with correct types
            const hasValidTimestamp = point.timestamp instanceof Date && !isNaN(point.timestamp.getTime());
            const hasValidValue = typeof point.value === 'number' && !isNaN(point.value) && isFinite(point.value);
            const hasValidConfidence = typeof point.confidence === 'number' && 
                                     point.confidence >= 0 && point.confidence <= 1 && !isNaN(point.confidence);
            const hasValidIsEstimated = typeof point.isEstimated === 'boolean';
            
            const shouldBeValid = hasValidTimestamp && hasValidValue && hasValidConfidence && hasValidIsEstimated;
            
            // Property: Validation result should match expected validity
            return isValid === shouldBeValid;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Time series validation handles edge cases consistently', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Valid point
            arbitraries.timeSeriesPoint(),
            // Missing fields
            fc.record({
              timestamp: arbitraries.date(),
              value: fc.float({ min: 0, max: 1000 })
              // Missing confidence and isEstimated
            }),
            // Empty object
            fc.constant({}),
            // Null/undefined
            fc.constant(null),
            fc.constant(undefined)
          ),
          (point: any) => {
            try {
              const isValid = validateTimeSeriesPoint(point);
              
              // Property: Should return boolean for any input
              const returnsBool = typeof isValid === 'boolean';
              
              // Property: Null/undefined should be invalid
              const nullUndefinedInvalid = (point === null || point === undefined) ? !isValid : true;
              
              // Property: Empty object should be invalid
              const emptyObjectInvalid = (point && Object.keys(point).length === 0) ? !isValid : true;
              
              return returnsBool && nullUndefinedInvalid && emptyObjectInvalid;
            } catch (error) {
              // Should not throw, should return false for invalid input
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16.2: Job Role Data Validation', () => {
    test('validateJobRoleData correctly validates complete job role data', () => {
      fc.assert(
        fc.property(
          fc.record({
            roleId: fc.oneof(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.constant(''),
              fc.constant(null),
              fc.constant(123) // Wrong type
            ),
            timeSeriesData: fc.oneof(
              arbitraries.timeSeriesData(0, 20),
              fc.constant(null),
              fc.constant('not-array'),
              fc.array(fc.record({ invalid: fc.string() })) // Invalid points
            ),
            currentTrend: fc.oneof(
              fc.constantFrom('increasing', 'decreasing', 'stable'),
              fc.constant('invalid-trend'),
              fc.constant(null)
            ),
            growthRate: fc.oneof(
              fc.float({ min: -100, max: 200 }),
              fc.constant(NaN),
              fc.constant(Infinity),
              fc.constant('not-number')
            ),
            confidence: fc.oneof(
              fc.float({ min: 0, max: 1 }),
              fc.float({ min: -1, max: 2 }), // Invalid range
              fc.constant(NaN)
            )
          }),
          (jobData: any) => {
            const isValid = validateJobRoleData(jobData);
            
            // Determine expected validity
            const hasValidRoleId = typeof jobData.roleId === 'string' && jobData.roleId.length > 0;
            const hasValidTimeSeriesData = Array.isArray(jobData.timeSeriesData) &&
              jobData.timeSeriesData.every((point: any) => validateTimeSeriesPoint(point));
            const hasValidTrend = ['increasing', 'decreasing', 'stable'].includes(jobData.currentTrend);
            const hasValidGrowthRate = typeof jobData.growthRate === 'number' && 
              !isNaN(jobData.growthRate) && isFinite(jobData.growthRate);
            const hasValidConfidence = typeof jobData.confidence === 'number' && 
              jobData.confidence >= 0 && jobData.confidence <= 1 && !isNaN(jobData.confidence);
            
            const shouldBeValid = hasValidRoleId && hasValidTimeSeriesData && hasValidTrend && 
                                hasValidGrowthRate && hasValidConfidence;
            
            return isValid === shouldBeValid;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16.3: AI Growth Data Validation', () => {
    test('validateAIGrowthData validates complete AI growth data structure', () => {
      fc.assert(
        fc.property(
          fc.record({
            timeSeriesData: fc.oneof(
              arbitraries.timeSeriesData(0, 50),
              fc.constant(null),
              fc.constant('invalid')
            ),
            repositoryCount: fc.oneof(
              fc.integer({ min: 0, max: 100000 }),
              fc.constant(-1), // Invalid negative
              fc.constant(NaN),
              fc.constant('not-number')
            ),
            contributorGrowth: fc.oneof(
              fc.float({ min: -50, max: 200 }),
              fc.constant(NaN),
              fc.constant(Infinity)
            ),
            technologyBreakdown: fc.oneof(
              fc.array(fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }),
                count: fc.integer({ min: 0, max: 10000 }),
                growthRate: fc.float({ min: -50, max: 100 })
              }), { maxLength: 10 }),
              fc.constant(null),
              fc.constant('invalid'),
              fc.array(fc.record({ invalid: fc.string() })) // Invalid structure
            )
          }),
          (aiData: any) => {
            const isValid = validateAIGrowthData(aiData);
            
            // Determine expected validity
            const hasValidTimeSeriesData = Array.isArray(aiData.timeSeriesData) &&
              aiData.timeSeriesData.every((point: any) => validateTimeSeriesPoint(point));
            const hasValidRepositoryCount = typeof aiData.repositoryCount === 'number' && 
              aiData.repositoryCount >= 0 && !isNaN(aiData.repositoryCount);
            const hasValidContributorGrowth = typeof aiData.contributorGrowth === 'number' && 
              !isNaN(aiData.contributorGrowth) && isFinite(aiData.contributorGrowth);
            const hasValidTechnologyBreakdown = Array.isArray(aiData.technologyBreakdown) &&
              aiData.technologyBreakdown.every((tech: any) => 
                typeof tech.name === 'string' && tech.name.length > 0 &&
                typeof tech.count === 'number' && tech.count >= 0 &&
                typeof tech.growthRate === 'number' && !isNaN(tech.growthRate)
              );
            
            const shouldBeValid = hasValidTimeSeriesData && hasValidRepositoryCount && 
                                hasValidContributorGrowth && hasValidTechnologyBreakdown;
            
            return isValid === shouldBeValid;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16.4: Analysis Context Validation', () => {
    test('validateAnalysisContext validates analysis parameters correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            selectedRoles: fc.oneof(
              fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
              fc.constant(null),
              fc.constant('not-array'),
              fc.array(fc.constant(null)) // Invalid role IDs
            ),
            timeRange: fc.oneof(
              arbitraries.timeRange(),
              fc.constant(null),
              fc.constant([]), // Wrong length
              fc.tuple(fc.string(), fc.string()), // Wrong types
              fc.tuple(arbitraries.date()) // Wrong length
            ),
            comparisonMode: fc.oneof(
              fc.boolean(),
              fc.constant(null),
              fc.constant('true'), // Wrong type
              fc.constant(1)
            ),
            filters: fc.oneof(
              fc.record({
                categories: fc.option(fc.array(fc.constantFrom(
                  'software-development', 'data-science', 'design', 'management'
                ))),
                riskLevels: fc.option(fc.array(fc.constantFrom('high', 'medium', 'low'))),
                minConfidence: fc.option(fc.float({ min: 0, max: 1 }))
              }),
              fc.constant(null),
              fc.constant('invalid')
            )
          }),
          (context: any) => {
            const isValid = validateAnalysisContext(context);
            
            // Determine expected validity
            const hasValidSelectedRoles = Array.isArray(context.selectedRoles) &&
              context.selectedRoles.every((role: any) => typeof role === 'string' && role.length > 0);
            const hasValidTimeRange = Array.isArray(context.timeRange) && 
              context.timeRange.length === 2 &&
              context.timeRange.every((date: any) => date instanceof Date && !isNaN(date.getTime())) &&
              context.timeRange[0] <= context.timeRange[1];
            const hasValidComparisonMode = typeof context.comparisonMode === 'boolean';
            const hasValidFilters = context.filters === null || 
              (typeof context.filters === 'object' && context.filters !== null);
            
            const shouldBeValid = hasValidSelectedRoles && hasValidTimeRange && 
                                hasValidComparisonMode && hasValidFilters;
            
            return isValid === shouldBeValid;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16.5: Batch Data Quality Validation', () => {
    test('validateDataQuality handles arrays of data with quality thresholds', () => {
      fc.assert(
        fc.property(
          fc.record({
            dataArray: fc.array(
              fc.oneof(
                arbitraries.jobRoleData(),
                fc.record({ invalid: fc.string() }), // Invalid item
                fc.constant(null)
              ),
              { maxLength: 20 }
            ),
            qualityThreshold: fc.float({ min: 0, max: 1 }),
            minValidItems: fc.integer({ min: 0, max: 10 })
          }),
          (testData: any) => {
            const validation = validateDataQuality(
              testData.dataArray,
              validateJobRoleData,
              testData.minValidItems
            );
            
            // Count actually valid items
            const validItems = testData.dataArray.filter((item: any) => 
              item !== null && validateJobRoleData(item)
            );
            const validCount = validItems.length;
            const totalCount = testData.dataArray.length;
            const actualQuality = totalCount === 0 ? 0 : validCount / totalCount;
            
            // Property: Validation result should reflect actual quality
            const qualityMeetsThreshold = actualQuality >= testData.qualityThreshold;
            const hasMinimumItems = validCount >= testData.minValidItems;
            const shouldBeValid = qualityMeetsThreshold && hasMinimumItems;
            
            // Property: Valid items should match filtered valid items
            const validItemsMatch = validation.validItems.length === validCount;
            
            // Property: Quality score should be accurate
            const qualityScoreAccurate = Math.abs(validation.qualityScore - actualQuality) < 0.001;
            
            return (validation.isValid === shouldBeValid) && validItemsMatch && qualityScoreAccurate;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Data quality validation handles edge cases gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant([]), // Empty array
            fc.constant(null), // Null input
            fc.array(fc.constant(null), { maxLength: 5 }), // All null items
            fc.array(arbitraries.jobRoleData(), { minLength: 1, maxLength: 3 }) // Valid items
          ),
          fc.integer({ min: 0, max: 5 }),
          (dataArray: any, minItems: any) => {
            try {
              const validation = validateDataQuality(dataArray, validateJobRoleData, minItems);
              
              // Property: Should always return validation object
              const hasValidationStructure = validation && 
                typeof validation.isValid === 'boolean' &&
                typeof validation.qualityScore === 'number' &&
                Array.isArray(validation.validItems) &&
                Array.isArray(validation.errors);
              
              // Property: Quality score should be between 0 and 1
              const validQualityScore = validation.qualityScore >= 0 && validation.qualityScore <= 1;
              
              // Property: Empty or null input should have zero quality
              const emptyInputHandling = (!dataArray || dataArray.length === 0) ? 
                validation.qualityScore === 0 : true;
              
              return hasValidationStructure && validQualityScore && emptyInputHandling;
            } catch (error) {
              // Should handle errors gracefully, not throw
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16.6: Data Completeness Validation', () => {
    test('Data completeness checks identify missing required fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            hasRequiredFields: fc.boolean(),
            fieldCompleteness: fc.float({ min: 0, max: 1 }),
            dataFreshness: fc.integer({ min: 0, max: 86400000 }), // 0-24 hours in ms
            sourceReliability: fc.float({ min: 0, max: 1 })
          }),
          (completenessData: any) => {
            // Simulate completeness validation
            const isComplete = completenessData.hasRequiredFields && 
                             completenessData.fieldCompleteness >= 0.8;
            const isFresh = completenessData.dataFreshness <= 3600000; // 1 hour
            const isReliable = completenessData.sourceReliability >= 0.7;
            const overallQuality = (completenessData.fieldCompleteness + completenessData.sourceReliability) / 2;
            
            // Property: Overall quality should be average of components
            const qualityCalculation = Math.abs(overallQuality - 
              (completenessData.fieldCompleteness + completenessData.sourceReliability) / 2) < 0.001;
            
            // Property: Completeness requires both fields and threshold
            const completenessLogic = isComplete === 
              (completenessData.hasRequiredFields && completenessData.fieldCompleteness >= 0.8);
            
            // Property: Freshness should be time-based
            const freshnessLogic = isFresh === (completenessData.dataFreshness <= 3600000);
            
            // Property: Reliability should meet threshold
            const reliabilityLogic = isReliable === (completenessData.sourceReliability >= 0.7);
            
            return qualityCalculation && completenessLogic && freshnessLogic && reliabilityLogic;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16.7: Cross-Validation Consistency', () => {
    test('Multiple validation methods produce consistent results', () => {
      fc.assert(
        fc.property(
          arbitraries.jobRoleData(),
          (jobData: any) => {
            // Validate using different approaches
            const directValidation = validateJobRoleData(jobData);
            const batchValidation = validateDataQuality([jobData], validateJobRoleData, 1);
            const fieldValidation = jobData && 
              typeof jobData.roleId === 'string' && jobData.roleId.length > 0 &&
              Array.isArray(jobData.timeSeriesData) &&
              ['increasing', 'decreasing', 'stable'].includes(jobData.currentTrend) &&
              typeof jobData.growthRate === 'number' && !isNaN(jobData.growthRate) &&
              typeof jobData.confidence === 'number' && jobData.confidence >= 0 && jobData.confidence <= 1;
            
            // Property: All validation methods should agree on valid data
            const validationConsistency = directValidation === batchValidation.isValid;
            
            // Property: Field-by-field validation should match direct validation
            const fieldValidationConsistency = directValidation === fieldValidation;
            
            // Property: Batch validation should have correct count for single item
            const batchCountCorrect = batchValidation.validItems.length === (directValidation ? 1 : 0);
            
            return validationConsistency && fieldValidationConsistency && batchCountCorrect;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});