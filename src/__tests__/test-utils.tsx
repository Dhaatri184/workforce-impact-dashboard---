import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { JobRole, TimeSeriesPoint, AIGrowthData, JobRoleData, JobRoleImpact } from '../types';
import * as fc from 'fast-check';

// Custom render function for components that need providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Property-based test generators for domain types
export const arbitraries = {
  // Generate valid dates within a reasonable range
  date: () => fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  
  // Generate time series points
  timeSeriesPoint: (): fc.Arbitrary<TimeSeriesPoint> => fc.record({
    timestamp: arbitraries.date(),
    value: fc.float({ min: 0, max: 10000 }),
    confidence: fc.float({ min: 0, max: 1 }),
    isEstimated: fc.boolean(),
    metadata: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined })
  }),
  
  // Generate arrays of time series data
  timeSeriesData: (minLength = 1, maxLength = 100) => 
    fc.array(arbitraries.timeSeriesPoint(), { minLength, maxLength })
      .map(points => points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())),
  
  // Generate job roles
  jobRole: (): fc.Arbitrary<JobRole> => fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    category: fc.constantFrom(
      'software-development', 'data-science', 'design', 'management', 
      'testing', 'support', 'devops', 'ai-ml'
    ),
    description: fc.string({ minLength: 10, maxLength: 500 }),
    aliases: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 })
  }),
  
  // Generate AI growth data
  aiGrowthData: (): fc.Arbitrary<AIGrowthData> => fc.record({
    timeSeriesData: arbitraries.timeSeriesData(12, 60), // 1-5 years of monthly data
    repositoryCount: fc.integer({ min: 100, max: 100000 }),
    contributorGrowth: fc.float({ min: -50, max: 200 }),
    technologyBreakdown: fc.array(fc.record({
      name: fc.constantFrom('Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'R'),
      count: fc.integer({ min: 10, max: 10000 }),
      growthRate: fc.float({ min: -30, max: 100 })
    }), { minLength: 1, maxLength: 10 })
  }),
  
  // Generate job role data
  jobRoleData: (): fc.Arbitrary<JobRoleData> => fc.record({
    roleId: fc.string({ minLength: 1, maxLength: 50 }),
    timeSeriesData: arbitraries.timeSeriesData(6, 60),
    currentTrend: fc.constantFrom('increasing', 'decreasing', 'stable'),
    growthRate: fc.float({ min: -50, max: 100 }),
    confidence: fc.float({ min: 0, max: 1 })
  }),
  
  // Generate job role impact data
  jobRoleImpact: (): fc.Arbitrary<JobRoleImpact> => fc.record({
    roleId: fc.string({ minLength: 1, maxLength: 50 }),
    aiGrowthRate: fc.float({ min: -20, max: 200 }),
    jobDemandChange: fc.float({ min: -50, max: 100 }),
    impactScore: fc.float({ min: -100, max: 100 }),
    riskLevel: fc.constantFrom('high', 'medium', 'low'),
    classification: fc.constantFrom('disruption', 'transition', 'growth')
  }),
  
  // Generate time ranges
  timeRange: (): fc.Arbitrary<[Date, Date]> => 
    fc.tuple(arbitraries.date(), arbitraries.date())
      .map(([d1, d2]) => d1.getTime() <= d2.getTime() ? [d1, d2] : [d2, d1] as [Date, Date]),
  
  // Generate non-empty strings
  nonEmptyString: () => fc.string({ minLength: 1 }),
  
  // Generate positive numbers
  positiveNumber: () => fc.float({ min: 0.001, max: 1000000 }),
  
  // Generate percentages
  percentage: () => fc.float({ min: -100, max: 100 }),
};

// Mock data generators for testing
export const mockData = {
  createMockJobRole: (overrides: Partial<JobRole> = {}): JobRole => ({
    id: 'software-developer',
    name: 'Software Developer',
    category: 'software-development',
    description: 'Develops software applications',
    aliases: ['programmer', 'developer'],
    ...overrides
  }),
  
  createMockTimeSeriesData: (length = 12): TimeSeriesPoint[] => {
    const now = new Date();
    return Array.from({ length }, (_, i) => ({
      timestamp: new Date(now.getFullYear(), now.getMonth() - length + i + 1, 1),
      value: Math.random() * 1000 + 500,
      confidence: 0.8 + Math.random() * 0.2,
      isEstimated: Math.random() < 0.1,
    }));
  },
  
  createMockAIGrowthData: (): AIGrowthData => ({
    timeSeriesData: mockData.createMockTimeSeriesData(24),
    repositoryCount: 15000,
    contributorGrowth: 45.2,
    technologyBreakdown: [
      { name: 'Python', count: 5000, growthRate: 25.3 },
      { name: 'JavaScript', count: 3200, growthRate: 18.7 },
      { name: 'TypeScript', count: 2800, growthRate: 32.1 }
    ]
  }),
  
  createMockJobRoleData: (roleId = 'software-developer'): JobRoleData => ({
    roleId,
    timeSeriesData: mockData.createMockTimeSeriesData(24),
    currentTrend: 'increasing',
    growthRate: 15.5,
    confidence: 0.85
  }),
  
  createMockJobRoleImpact: (roleId = 'software-developer'): JobRoleImpact => ({
    roleId,
    aiGrowthRate: 45.2,
    jobDemandChange: 15.5,
    impactScore: 29.7,
    riskLevel: 'medium',
    classification: 'transition'
  })
};

// Test helpers
export const testHelpers = {
  // Wait for async operations to complete
  waitForAsync: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Create a mock function with TypeScript support
  createMockFn: <T extends (...args: any[]) => any>(): jest.MockedFunction<T> => 
    jest.fn() as jest.MockedFunction<T>,
  
  // Assert that arrays are approximately equal (useful for floating point comparisons)
  expectArraysToBeApproximatelyEqual: (actual: number[], expected: number[], precision = 2) => {
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      expect(value).toBeCloseTo(expected[index], precision);
    });
  },
  
  // Assert that dates are approximately equal (within a tolerance)
  expectDatesToBeApproximatelyEqual: (actual: Date, expected: Date, toleranceMs = 1000) => {
    const diff = Math.abs(actual.getTime() - expected.getTime());
    expect(diff).toBeLessThanOrEqual(toleranceMs);
  }
};