# Test Configuration and Setup

## Overview

This directory contains the test configuration and utilities for the Workforce Impact Dashboard. The testing setup includes:

- **Jest** for test running and assertions
- **React Testing Library** for component testing
- **fast-check** for property-based testing
- **jsdom** for DOM simulation

## Configuration Files

### Jest Configuration (`jest.config.js`)
- Configured for TypeScript and ESM modules
- Set up with jsdom environment for React components
- Path aliases configured to match Vite configuration
- Transform ignore patterns for external libraries

### Setup File (`setupTests.ts`)
- Imports jest-dom matchers
- Mocks environment variables for testing
- Global test configuration

### Test Utilities (`test-utils.tsx`)
- Custom render function for React components
- Property-based test generators (arbitraries)
- Mock data generators
- Test helper functions

## Property-Based Testing

The project uses fast-check for property-based testing with custom generators for domain types:

- `arbitraries.jobRole()` - Generates valid JobRole objects
- `arbitraries.timeSeriesData()` - Generates time series data arrays
- `arbitraries.aiGrowthData()` - Generates AI growth data
- `arbitraries.jobRoleData()` - Generates job role data
- `arbitraries.jobRoleImpact()` - Generates impact analysis data

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only property-based tests
npm run test:property

# Run specific test file
npm test -- --testPathPattern=filename.test.ts
```

## Test Structure

Tests should be organized as follows:

```
src/__tests__/
├── setup.test.ts           # Configuration verification
├── test-utils.tsx          # Shared utilities and generators
├── unit/                   # Unit tests
│   ├── services/          # Service layer tests
│   ├── utils/             # Utility function tests
│   └── components/        # Component tests
└── property/              # Property-based tests
    ├── data-normalization.property.test.ts
    ├── api-fallback.property.test.ts
    └── ...
```

## Property Test Guidelines

Each property test should:

1. Reference the corresponding design property using the format:
   ```typescript
   // **Feature: workforce-impact-dashboard, Property 1: Complete role data display**
   ```

2. Run at least 100 iterations:
   ```typescript
   fc.assert(fc.property(...), { numRuns: 100 });
   ```

3. Use appropriate generators from `test-utils.tsx`

4. Validate the correctness property across all generated inputs

## Mock Data

Use the `mockData` generators for creating test fixtures:

```typescript
import { mockData } from '../test-utils';

const role = mockData.createMockJobRole();
const aiData = mockData.createMockAIGrowthData();
```

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Ensure path aliases in `jest.config.js` match `tsconfig.json`
2. **ESM import errors**: Check `transformIgnorePatterns` for external libraries
3. **React component errors**: Use the custom `render` function from `test-utils.tsx`

### Dependencies

Required testing dependencies:
- `jest`
- `ts-jest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jest-environment-jsdom`
- `fast-check`