#!/usr/bin/env node

/**
 * Test Configuration Validation Script
 * 
 * This script validates that the Jest configuration is properly set up
 * and all required dependencies are available.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Validating Test Configuration...\n');

// Check if required files exist
const requiredFiles = [
  'jest.config.js',
  'src/setupTests.ts',
  'src/__tests__/test-utils.tsx',
  'src/__tests__/setup.test.ts',
  'src/__tests__/README.md'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'jest',
  'ts-jest',
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@testing-library/user-event',
  'jest-environment-jsdom',
  'fast-check'
];

console.log('\n📦 Checking Dependencies:');
let allDepsPresent = true;

requiredDeps.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} (${packageJson.devDependencies[dep]})`);
  } else {
    console.log(`❌ ${dep} missing`);
    allDepsPresent = false;
  }
});

// Check Jest configuration
console.log('\n⚙️  Checking Jest Configuration:');
try {
  const jestConfig = require('./jest.config.js');
  
  const requiredConfigKeys = [
    'testEnvironment',
    'setupFilesAfterEnv',
    'moduleNameMapping',
    'transform'
  ];
  
  requiredConfigKeys.forEach(key => {
    if (jestConfig.default && jestConfig.default[key]) {
      console.log(`✅ ${key} configured`);
    } else if (jestConfig[key]) {
      console.log(`✅ ${key} configured`);
    } else {
      console.log(`❌ ${key} missing`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log(`❌ Jest config error: ${error.message}`);
  allFilesExist = false;
}

// Check TypeScript configuration
console.log('\n📝 Checking TypeScript Configuration:');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.paths) {
    console.log('✅ Path aliases configured');
  } else {
    console.log('❌ Path aliases missing');
  }
  
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.jsx) {
    console.log('✅ JSX configuration present');
  } else {
    console.log('❌ JSX configuration missing');
  }
} catch (error) {
  console.log(`❌ TypeScript config error: ${error.message}`);
}

// Summary
console.log('\n📊 Summary:');
if (allFilesExist && allDepsPresent) {
  console.log('🎉 Test configuration is complete!');
  console.log('\nNext steps:');
  console.log('1. Run `npm install` to install dependencies');
  console.log('2. Run `npm test` to execute tests');
  console.log('3. Start implementing property-based tests');
  process.exit(0);
} else {
  console.log('⚠️  Test configuration needs attention');
  console.log('\nPlease fix the issues above before running tests.');
  process.exit(1);
}