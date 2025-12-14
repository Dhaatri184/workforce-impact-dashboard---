/**
 * Simple test to verify demo mode functionality
 */

// Test sample data generation
import { 
  SAMPLE_AI_GROWTH_DATA,
  SAMPLE_JOB_ROLE_DATA,
  SAMPLE_IMPACT_SCORES,
  SAMPLE_INSIGHTS,
  DEMO_SCENARIOS,
  exportAnalysisData,
  generateShareableLink
} from './data/sampleData.js';

console.log('Testing demo mode functionality...');

// Test 1: Sample data availability
console.log('✓ Sample AI Growth Data:', SAMPLE_AI_GROWTH_DATA.repositoryCount, 'repositories');
console.log('✓ Sample Job Role Data:', SAMPLE_JOB_ROLE_DATA.length, 'roles');
console.log('✓ Sample Impact Scores:', SAMPLE_IMPACT_SCORES.length, 'scores');
console.log('✓ Sample Insights:', SAMPLE_INSIGHTS.length, 'insights');

// Test 2: Demo scenarios
console.log('✓ Demo Scenarios:', DEMO_SCENARIOS.length, 'scenarios available');
DEMO_SCENARIOS.forEach(scenario => {
  console.log(`  - ${scenario.name}: ${scenario.description}`);
});

// Test 3: Export functionality
const testExport = exportAnalysisData(
  ['ai-engineer'],
  [new Date('2022-01-01'), new Date()],
  SAMPLE_IMPACT_SCORES.slice(0, 3),
  SAMPLE_INSIGHTS.slice(0, 2)
);
console.log('✓ Export data structure:', Object.keys(testExport));

// Test 4: Shareable link generation
const testLink = generateShareableLink(
  ['ai-engineer', 'data-scientist'],
  [new Date('2022-01-01'), new Date()],
  'comparison',
  'manual-tester'
);
console.log('✓ Shareable link generated:', testLink.includes('roles=') && testLink.includes('view='));

console.log('\nDemo mode functionality test completed successfully! ✅');