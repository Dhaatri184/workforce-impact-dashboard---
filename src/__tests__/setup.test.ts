/**
 * Basic test to verify Jest configuration is working correctly
 */

import * as fc from 'fast-check';
import { arbitraries, mockData } from './test-utils';

describe('Test Configuration', () => {
  test('Jest is configured correctly', () => {
    expect(true).toBe(true);
  });

  test('Fast-check is working', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      })
    );
  });

  test('Test utilities are working', () => {
    const mockRole = mockData.createMockJobRole();
    expect(mockRole).toHaveProperty('id');
    expect(mockRole).toHaveProperty('name');
    expect(mockRole).toHaveProperty('category');
  });

  test('Arbitraries generate valid data', () => {
    fc.assert(
      fc.property(arbitraries.jobRole(), (role) => {
        return (
          typeof role.id === 'string' &&
          role.id.length > 0 &&
          typeof role.name === 'string' &&
          role.name.length > 0 &&
          Array.isArray(role.aliases)
        );
      }),
      { numRuns: 10 } // Reduced runs for setup test
    );
  });

  test('Environment variables are mocked', () => {
    expect(process.env.VITE_GITHUB_TOKEN).toBe('test-github-token');
  });
});