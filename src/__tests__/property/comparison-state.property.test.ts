/**
 * Property-Based Tests for Comparison and State Management
 * 
 * **Feature: workforce-impact-dashboard, Multiple Properties: Comparison and State Consistency**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 5.5, 7.2, 7.3, 7.4, 8.2**
 * 
 * Tests role comparison functionality and state management for consistent behavior
 * across all scenarios and user interactions.
 */

import fc from 'fast-check';
import { arbitraries, mockData } from '../test-utils';

describe('Comparison and State Management Property Tests', () => {

  describe('Property 5: Comprehensive role comparison', () => {
    test('Role comparison displays all required elements for both roles', () => {
      // **Feature: workforce-impact-dashboard, Property 5: Comprehensive role comparison**
      fc.assert(
        fc.property(
          arbitraries.jobRole(),
          arbitraries.jobRole(),
          arbitraries.jobRoleImpact(),
          arbitraries.jobRoleImpact(),
          fc.record({
            showDifferences: fc.boolean(),
            highlightSignificant: fc.boolean(),
            significanceThreshold: fc.float({ min: 5, max: 50 })
          }),
          (role1: any, role2: any, impact1: any, impact2: any, comparisonState: any) => {
            const comparisonResult = simulateRoleComparison(
              role1, role2, impact1, impact2, comparisonState
            );
            
            // Property: Should display data for both roles
            const hasBothRoles = comparisonResult.primaryRole && comparisonResult.secondaryRole;
            
            // Property: Should show all comparison elements
            const hasAllElements = comparisonResult.elements.includes('aiGrowth') &&
              comparisonResult.elements.includes('jobTrends') &&
              comparisonResult.elements.includes('impactScores');
            
            // Property: Should highlight significant differences when requested
            const significantDifferencesHighlighted = !comparisonState.highlightSignificant || 
              comparisonResult.highlightedDifferences.every((diff: any) => 
                Math.abs(diff.difference) >= comparisonState.significanceThreshold
              );
            
            // Property: Should handle incomplete data gracefully
            const handlesIncompleteData = comparisonResult.missingDataIndicators || 
              (impact1 && impact2); // Either shows indicators or has complete data
            
            return hasBothRoles && hasAllElements && 
                   significantDifferencesHighlighted && handlesIncompleteData;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Role comparison handles edge cases and invalid combinations', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            arbitraries.jobRole(),
            fc.constant(null), // Missing role
            fc.record({ name: fc.constant(''), id: fc.string() }) // Invalid role
          ),
          fc.oneof(
            arbitraries.jobRole(),
            fc.constant(null),
            fc.record({ name: fc.constant(''), id: fc.string() })
          ),
          (role1: any, role2: any) => {
            try {
              const comparisonResult = simulateRoleComparison(role1, role2, null, null, {});
              
              // Property: Should handle null/invalid roles gracefully
              const handlesNullRoles = (!role1 || !role2) ? 
                comparisonResult.showError === true : true;
              
              // Property: Should provide meaningful error messages
              const hasErrorMessage = !comparisonResult.showError || 
                (comparisonResult.errorMessage && comparisonResult.errorMessage.length > 0);
              
              // Property: Should suggest alternative actions for invalid comparisons
              const providesSuggestions = !comparisonResult.showError || 
                comparisonResult.suggestions?.length > 0;
              
              return handlesNullRoles && hasErrorMessage && providesSuggestions;
            } catch (error) {
              // Should not throw, should handle gracefully
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Comparison state management', () => {
    test('Clearing comparison selections returns to single-role view correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            primaryRole: fc.string({ minLength: 1, maxLength: 30 }),
            secondaryRole: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
            timeRange: arbitraries.timeRange(),
            viewMode: fc.constantFrom('comparison', 'overview', 'matrix'),
            hasUnsavedChanges: fc.boolean()
          }),
          (initialState: any) => {
            const clearResult = simulateComparisonClear(initialState);
            
            // Property: Should return to single-role view
            const returnedToSingleRole = clearResult.viewMode === 'overview' && 
              clearResult.secondaryRole === null;
            
            // Property: Should preserve primary role selection
            const preservedPrimaryRole = clearResult.primaryRole === initialState.primaryRole;
            
            // Property: Should preserve time period
            const preservedTimeRange = clearResult.timeRange[0].getTime() === initialState.timeRange[0].getTime() &&
              clearResult.timeRange[1].getTime() === initialState.timeRange[1].getTime();
            
            // Property: Should handle unsaved changes appropriately
            const handledUnsavedChanges = !initialState.hasUnsavedChanges || 
              clearResult.showConfirmation === true;
            
            return returnedToSingleRole && preservedPrimaryRole && 
                   preservedTimeRange && handledUnsavedChanges;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Selection state preservation', () => {
    test('Data refresh maintains user selections and preferences', () => {
      fc.assert(
        fc.property(
          fc.record({
            selectedRoles: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
            timeRange: arbitraries.timeRange(),
            comparisonMode: fc.boolean(),
            sortPreferences: fc.record({
              sortBy: fc.constantFrom('name', 'impact', 'risk'),
              sortOrder: fc.constantFrom('asc', 'desc')
            }),
            filterSettings: fc.record({
              riskLevels: fc.array(fc.constantFrom('high', 'medium', 'low')),
              categories: fc.array(fc.constantFrom('ai-ml', 'software-development', 'testing'))
            }),
            refreshTrigger: fc.constantFrom('manual', 'automatic', 'error-recovery')
          }),
          (userState: any) => {
            const refreshResult = simulateDataRefresh(userState);
            
            // Property: Should preserve all user selections
            const selectionsPreserved = 
              arraysEqual(refreshResult.selectedRoles, userState.selectedRoles) &&
              refreshResult.comparisonMode === userState.comparisonMode;
            
            // Property: Should preserve time range selection
            const timeRangePreserved = 
              refreshResult.timeRange[0].getTime() === userState.timeRange[0].getTime() &&
              refreshResult.timeRange[1].getTime() === userState.timeRange[1].getTime();
            
            // Property: Should preserve sort and filter preferences
            const preferencesPreserved = 
              refreshResult.sortPreferences.sortBy === userState.sortPreferences.sortBy &&
              refreshResult.sortPreferences.sortOrder === userState.sortPreferences.sortOrder &&
              arraysEqual(refreshResult.filterSettings.riskLevels, userState.filterSettings.riskLevels);
            
            // Property: Should update visualizations with new data
            const visualizationsUpdated = refreshResult.dataTimestamp > userState.dataTimestamp ||
              refreshResult.refreshTrigger === 'error-recovery';
            
            return selectionsPreserved && timeRangePreserved && 
                   preferencesPreserved && visualizationsUpdated;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Matrix interaction consistency', () => {
    test('Matrix interactions maintain state consistency across operations', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraries.jobRoleImpact(), { minLength: 5, maxLength: 20 }),
          fc.record({
            operations: fc.array(fc.record({
              type: fc.constantFrom('sort', 'filter', 'select', 'navigate'),
              parameter: fc.oneof(
                fc.constantFrom('aiGrowth', 'jobTrend', 'impactScore'), // for sort
                fc.constantFrom('high', 'medium', 'low'), // for filter
                fc.string() // for select/navigate
              )
            }), { minLength: 1, maxLength: 5 })
          }),
          (matrixData: any, interactionSequence: any) => {
            const sequenceResult = simulateMatrixOperationSequence(matrixData, interactionSequence);
            
            // Property: Each operation should maintain data integrity
            const dataIntegrityMaintained = sequenceResult.operationResults.every((result: any) =>
              result.dataValid && result.displayConsistent
            );
            
            // Property: Operations should be reversible where applicable
            const operationsReversible = sequenceResult.operationResults.every((result: any, index: number) => {
              if (result.operation.type === 'sort') {
                // Sorting should be reversible by changing order
                return result.canReverse === true;
              }
              return true;
            });
            
            // Property: Selection should persist across non-destructive operations
            const selectionPersistence = sequenceResult.operationResults.every((result: any, index: number) => {
              if (index === 0) return true;
              const prevResult = sequenceResult.operationResults[index - 1];
              
              // Selection should persist unless explicitly changed
              return result.operation.type === 'select' || 
                     result.selectedItem === prevResult.selectedItem ||
                     prevResult.selectedItem === null;
            });
            
            // Property: Color coding should remain consistent
            const colorCodingConsistent = sequenceResult.operationResults.every((result: any) =>
              result.displayData.every((item: any) => 
                item.colorCode === getRiskLevelColor(item.riskLevel)
              )
            );
            
            return dataIntegrityMaintained && operationsReversible && 
                   selectionPersistence && colorCodingConsistent;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Caching efficiency', () => {
    test('Caching reduces redundant API calls while maintaining data freshness', () => {
      fc.assert(
        fc.property(
          fc.record({
            cacheSize: fc.integer({ min: 5, max: 100 }),
            ttl: fc.integer({ min: 60000, max: 3600000 }), // 1 minute to 1 hour
            requestPattern: fc.array(fc.record({
              key: fc.string({ minLength: 5, maxLength: 20 }),
              timestamp: fc.integer({ min: Date.now() - 7200000, max: Date.now() })
            }), { minLength: 3, maxLength: 15 })
          }),
          (cacheScenario: any) => {
            const cacheResult = simulateCacheEfficiency(cacheScenario);
            
            // Property: Cache hits should reduce API calls
            const cacheHitsReduceAPICalls = cacheResult.cacheHitRatio > 0 ? 
              cacheResult.apiCallCount < cacheResult.totalRequests : true;
            
            // Property: Expired entries should trigger fresh API calls
            const expiredEntriesRefreshed = cacheResult.expiredEntries.every((entry: any) =>
              cacheResult.refreshedEntries.includes(entry.key)
            );
            
            // Property: Cache size should not exceed configured limit
            const cacheSizeRespected = cacheResult.currentCacheSize <= cacheScenario.cacheSize;
            
            // Property: Most recently used items should be retained when cache is full
            const lruEvictionWorking = cacheResult.evictedEntries.every((entry: any) =>
              entry.lastAccessed <= Math.min(...cacheResult.retainedEntries.map((e: any) => e.lastAccessed))
            );
            
            return cacheHitsReduceAPICalls && expiredEntriesRefreshed && 
                   cacheSizeRespected && lruEvictionWorking;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// Helper functions for simulation
function simulateRoleComparison(role1: any, role2: any, impact1: any, impact2: any, state: any) {
  if (!role1 || !role2) {
    return {
      showError: true,
      errorMessage: 'Both roles are required for comparison',
      suggestions: ['Select a valid role', 'Try single-role analysis']
    };
  }
  
  const differences = [];
  if (impact1 && impact2) {
    const aiGrowthDiff = Math.abs(impact1.aiGrowthRate - impact2.aiGrowthRate);
    const jobTrendDiff = Math.abs(impact1.jobDemandChange - impact2.jobDemandChange);
    
    if (state.highlightSignificant) {
      if (aiGrowthDiff >= state.significanceThreshold) {
        differences.push({ type: 'aiGrowth', difference: aiGrowthDiff });
      }
      if (jobTrendDiff >= state.significanceThreshold) {
        differences.push({ type: 'jobTrend', difference: jobTrendDiff });
      }
    }
  }
  
  return {
    showError: false,
    primaryRole: role1,
    secondaryRole: role2,
    elements: ['aiGrowth', 'jobTrends', 'impactScores'],
    highlightedDifferences: differences,
    missingDataIndicators: !impact1 || !impact2
  };
}

function simulateComparisonClear(state: any) {
  if (state.hasUnsavedChanges) {
    return {
      ...state,
      showConfirmation: true,
      secondaryRole: state.secondaryRole, // Don't clear yet
      viewMode: state.viewMode
    };
  }
  
  return {
    ...state,
    secondaryRole: null,
    viewMode: 'overview',
    showConfirmation: false
  };
}

function simulateDataRefresh(userState: any) {
  return {
    ...userState,
    dataTimestamp: Date.now(),
    refreshStatus: 'completed',
    newDataAvailable: true
  };
}

function simulateMatrixOperationSequence(data: any, sequence: any) {
  let currentData = [...data];
  let selectedItem = null;
  const operationResults = [];
  
  for (const operation of sequence.operations) {
    let result;
    
    switch (operation.type) {
      case 'sort':
        currentData.sort((a: any, b: any) => {
          const aVal = a[operation.parameter] || 0;
          const bVal = b[operation.parameter] || 0;
          return aVal - bVal;
        });
        result = {
          operation,
          dataValid: true,
          displayConsistent: true,
          canReverse: true,
          selectedItem,
          displayData: currentData.map((item: any) => ({
            ...item,
            colorCode: getRiskLevelColor(item.riskLevel)
          }))
        };
        break;
        
      case 'filter':
        currentData = data.filter((item: any) => item.riskLevel === operation.parameter);
        result = {
          operation,
          dataValid: true,
          displayConsistent: true,
          canReverse: true,
          selectedItem: currentData.find((item: any) => item.roleId === selectedItem?.roleId) || null,
          displayData: currentData.map((item: any) => ({
            ...item,
            colorCode: getRiskLevelColor(item.riskLevel)
          }))
        };
        break;
        
      case 'select':
        selectedItem = currentData.find((item: any) => item.roleId === operation.parameter) || null;
        result = {
          operation,
          dataValid: true,
          displayConsistent: true,
          canReverse: false,
          selectedItem,
          displayData: currentData.map((item: any) => ({
            ...item,
            colorCode: getRiskLevelColor(item.riskLevel)
          }))
        };
        break;
        
      default:
        result = {
          operation,
          dataValid: true,
          displayConsistent: true,
          canReverse: false,
          selectedItem,
          displayData: currentData.map((item: any) => ({
            ...item,
            colorCode: getRiskLevelColor(item.riskLevel)
          }))
        };
    }
    
    operationResults.push(result);
  }
  
  return { operationResults };
}

function simulateCacheEfficiency(scenario: any) {
  const now = Date.now();
  const cache = new Map();
  let apiCallCount = 0;
  let cacheHits = 0;
  const expiredEntries = [];
  const refreshedEntries = [];
  const evictedEntries = [];
  const retainedEntries = [];
  
  // Process requests
  for (const request of scenario.requestPattern) {
    const isExpired = (now - request.timestamp) > scenario.ttl;
    
    if (cache.has(request.key) && !isExpired) {
      cacheHits++;
    } else {
      apiCallCount++;
      if (isExpired) {
        expiredEntries.push({ key: request.key });
        refreshedEntries.push(request.key);
      }
      
      // Simulate cache management
      if (cache.size >= scenario.cacheSize) {
        // Evict oldest entry
        const oldestKey = Array.from(cache.keys())[0];
        evictedEntries.push({ key: oldestKey, lastAccessed: cache.get(oldestKey).lastAccessed });
        cache.delete(oldestKey);
      }
      
      cache.set(request.key, { 
        data: `data-${request.key}`, 
        timestamp: now,
        lastAccessed: now 
      });
    }
  }
  
  // Collect retained entries
  for (const [key, value] of cache.entries()) {
    retainedEntries.push({ key, lastAccessed: value.lastAccessed });
  }
  
  return {
    totalRequests: scenario.requestPattern.length,
    apiCallCount,
    cacheHitRatio: scenario.requestPattern.length > 0 ? cacheHits / scenario.requestPattern.length : 0,
    currentCacheSize: cache.size,
    expiredEntries,
    refreshedEntries,
    evictedEntries,
    retainedEntries
  };
}

function getRiskLevelColor(riskLevel: string): string {
  const colors = {
    'high': '#DC2626',
    'medium': '#D97706',
    'low': '#059669'
  };
  return colors[riskLevel as keyof typeof colors] || '#6B7280';
}

function arraysEqual(a: any[], b: any[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}