#!/bin/bash

# Quality Assurance Test Execution Script
set -e

echo "🧪 Starting Quality Assurance Test Suite..."
echo "========================================"

# Configuration
PROJECT_ROOT=$(pwd)
RESULTS_DIR="qa-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create results directory
mkdir -p $RESULTS_DIR

echo "📋 Test Configuration:"
echo "  Project Root: $PROJECT_ROOT"
echo "  Results Dir: $RESULTS_DIR"
echo "  Timestamp: $TIMESTAMP"
echo ""

# Function to log test results
log_result() {
    local test_name=$1
    local status=$2
    local details=$3
    
    echo "[$status] $test_name"
    if [ "$details" != "" ]; then
        echo "    $details"
    fi
    echo "$TIMESTAMP,$test_name,$status,$details" >> $RESULTS_DIR/test_results.csv
}

# Initialize results file
echo "timestamp,test_name,status,details" > $RESULTS_DIR/test_results.csv

echo "🔍 1. Code Quality Checks"
echo "========================"

# TypeScript compilation
echo "Checking TypeScript compilation..."
if npx tsc --noEmit > $RESULTS_DIR/typescript_check.log 2>&1; then
    log_result "TypeScript Compilation" "PASS" "No type errors found"
else
    log_result "TypeScript Compilation" "FAIL" "Type errors detected - see typescript_check.log"
fi

# ESLint checks
echo "Running ESLint..."
if npm run lint > $RESULTS_DIR/eslint_check.log 2>&1; then
    log_result "ESLint" "PASS" "No linting errors"
else
    log_result "ESLint" "FAIL" "Linting errors found - see eslint_check.log"
fi

# Prettier formatting check
echo "Checking code formatting..."
if npx prettier --check src/ > $RESULTS_DIR/prettier_check.log 2>&1; then
    log_result "Code Formatting" "PASS" "All files properly formatted"
else
    log_result "Code Formatting" "FAIL" "Formatting issues found - see prettier_check.log"
fi

echo ""
echo "🧪 2. Test Suite Execution"
echo "=========================="

# Unit and Property Tests
echo "Running test suite..."
if npm test -- --coverage --watchAll=false > $RESULTS_DIR/test_results.log 2>&1; then
    # Extract coverage percentage
    COVERAGE=$(grep -o "All files.*[0-9]\+\.[0-9]\+" $RESULTS_DIR/test_results.log | tail -1 | grep -o "[0-9]\+\.[0-9]\+")
    if [ "$COVERAGE" != "" ]; then
        log_result "Test Coverage" "PASS" "Coverage: ${COVERAGE}%"
    else
        log_result "Test Coverage" "PASS" "Tests passed, coverage data unavailable"
    fi
    log_result "Unit Tests" "PASS" "All tests passed"
else
    log_result "Unit Tests" "FAIL" "Some tests failed - see test_results.log"
fi

echo ""
echo "🏗️ 3. Build Verification"
echo "======================="

# Production build
echo "Testing production build..."
if npm run build > $RESULTS_DIR/build_check.log 2>&1; then
    # Check if dist directory was created
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        log_result "Production Build" "PASS" "Build successful, size: $DIST_SIZE"
    else
        log_result "Production Build" "FAIL" "Build completed but dist directory not found"
    fi
else
    log_result "Production Build" "FAIL" "Build failed - see build_check.log"
fi

# Bundle analysis (if build succeeded)
if [ -d "dist" ]; then
    echo "Analyzing bundle size..."
    
    # Check main bundle size
    if [ -f "dist/assets/index-*.js" ]; then
        MAIN_BUNDLE_SIZE=$(ls -lah dist/assets/index-*.js | awk '{print $5}')
        log_result "Bundle Size Check" "PASS" "Main bundle: $MAIN_BUNDLE_SIZE"
    else
        log_result "Bundle Size Check" "WARN" "Main bundle file not found"
    fi
    
    # Count total assets
    ASSET_COUNT=$(find dist/assets -name "*.js" -o -name "*.css" | wc -l)
    log_result "Asset Count" "INFO" "Total assets: $ASSET_COUNT"
fi

echo ""
echo "🔒 4. Security Checks"
echo "==================="

# Dependency vulnerability scan
echo "Scanning for vulnerabilities..."
if npm audit --audit-level=high > $RESULTS_DIR/security_audit.log 2>&1; then
    log_result "Security Audit" "PASS" "No high/critical vulnerabilities found"
else
    VULN_COUNT=$(grep -c "vulnerabilities" $RESULTS_DIR/security_audit.log || echo "0")
    log_result "Security Audit" "WARN" "Vulnerabilities found - see security_audit.log"
fi

# Check for sensitive data in build
echo "Checking for sensitive data exposure..."
if [ -d "dist" ]; then
    # Look for potential API keys or secrets in built files
    if grep -r "sk_\|pk_\|secret\|password\|token" dist/ > $RESULTS_DIR/sensitive_data_check.log 2>&1; then
        log_result "Sensitive Data Check" "WARN" "Potential sensitive data found - see sensitive_data_check.log"
    else
        log_result "Sensitive Data Check" "PASS" "No sensitive data detected in build"
    fi
fi

echo ""
echo "📊 5. Performance Analysis"
echo "========================"

# Check package.json for performance-related configs
echo "Analyzing performance configuration..."

# Check if source maps are disabled for production
if grep -q '"sourcemap": false' vite.config.ts || grep -q 'sourcemap: false' vite.config.ts; then
    log_result "Source Maps Config" "PASS" "Source maps disabled for production"
else
    log_result "Source Maps Config" "WARN" "Source maps may be enabled for production"
fi

# Check for code splitting configuration
if grep -q "manualChunks" vite.config.ts; then
    log_result "Code Splitting" "PASS" "Manual chunks configured"
else
    log_result "Code Splitting" "WARN" "Manual chunk splitting not configured"
fi

echo ""
echo "📱 6. Accessibility Validation"
echo "============================="

# Check for accessibility-related dependencies
echo "Validating accessibility setup..."

if grep -q "@testing-library" package.json; then
    log_result "A11y Testing Tools" "PASS" "Testing library available for accessibility testing"
else
    log_result "A11y Testing Tools" "WARN" "Accessibility testing tools not found"
fi

# Check for accessibility CSS
if [ -f "src/styles/accessibility.css" ]; then
    log_result "A11y Styles" "PASS" "Accessibility styles file found"
else
    log_result "A11y Styles" "WARN" "Accessibility styles file not found"
fi

echo ""
echo "📋 7. Documentation Validation"
echo "============================="

# Check for required documentation files
REQUIRED_DOCS=("README.md" "CONTRIBUTING.md" "LICENSE" "CHANGELOG.md")

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        log_result "Documentation: $doc" "PASS" "File exists"
    else
        log_result "Documentation: $doc" "FAIL" "Required file missing"
    fi
done

# Check documentation completeness
if [ -f "README.md" ]; then
    if grep -q "Getting Started" README.md && grep -q "Installation" README.md; then
        log_result "README Completeness" "PASS" "README contains essential sections"
    else
        log_result "README Completeness" "WARN" "README may be missing essential sections"
    fi
fi

echo ""
echo "🐳 8. Docker Configuration"
echo "========================="

# Check Docker files
if [ -f "Dockerfile" ]; then
    log_result "Docker Configuration" "PASS" "Dockerfile found"
    
    # Check for security best practices in Dockerfile
    if grep -q "USER" Dockerfile; then
        log_result "Docker Security" "PASS" "Non-root user configured"
    else
        log_result "Docker Security" "WARN" "Consider adding non-root user to Dockerfile"
    fi
else
    log_result "Docker Configuration" "WARN" "Dockerfile not found"
fi

if [ -f "docker-compose.yml" ]; then
    log_result "Docker Compose" "PASS" "Docker Compose configuration found"
else
    log_result "Docker Compose" "WARN" "Docker Compose configuration not found"
fi

echo ""
echo "☸️ 9. Kubernetes Configuration"
echo "============================="

if [ -d "k8s" ]; then
    K8S_FILES=$(find k8s -name "*.yml" -o -name "*.yaml" | wc -l)
    log_result "Kubernetes Config" "PASS" "Found $K8S_FILES Kubernetes manifest files"
else
    log_result "Kubernetes Config" "WARN" "Kubernetes manifests not found"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"

# Generate summary
TOTAL_TESTS=$(wc -l < $RESULTS_DIR/test_results.csv)
TOTAL_TESTS=$((TOTAL_TESTS - 1)) # Subtract header row

PASSED_TESTS=$(grep ",PASS," $RESULTS_DIR/test_results.csv | wc -l)
FAILED_TESTS=$(grep ",FAIL," $RESULTS_DIR/test_results.csv | wc -l)
WARNED_TESTS=$(grep ",WARN," $RESULTS_DIR/test_results.csv | wc -l)

echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Warnings: $WARNED_TESTS"

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Pass Rate: ${PASS_RATE}%"
else
    PASS_RATE=0
fi

# Generate final report
cat > $RESULTS_DIR/qa_summary_$TIMESTAMP.md << EOF
# QA Test Results Summary

**Date**: $(date)
**Total Tests**: $TOTAL_TESTS
**Pass Rate**: ${PASS_RATE}%

## Results Breakdown
- ✅ **Passed**: $PASSED_TESTS
- ❌ **Failed**: $FAILED_TESTS  
- ⚠️ **Warnings**: $WARNED_TESTS

## Detailed Results
See \`test_results.csv\` for complete test results.

## Log Files
- TypeScript: \`typescript_check.log\`
- ESLint: \`eslint_check.log\`
- Tests: \`test_results.log\`
- Build: \`build_check.log\`
- Security: \`security_audit.log\`

## Recommendations
EOF

# Add recommendations based on results
if [ $FAILED_TESTS -gt 0 ]; then
    echo "- 🚨 **Critical**: Fix all failing tests before release" >> $RESULTS_DIR/qa_summary_$TIMESTAMP.md
fi

if [ $WARNED_TESTS -gt 3 ]; then
    echo "- ⚠️ **Important**: Address warnings to improve quality" >> $RESULTS_DIR/qa_summary_$TIMESTAMP.md
fi

if [ $PASS_RATE -ge 90 ]; then
    echo "- ✅ **Good**: Quality standards met for release" >> $RESULTS_DIR/qa_summary_$TIMESTAMP.md
elif [ $PASS_RATE -ge 80 ]; then
    echo "- 📋 **Review**: Consider addressing issues before release" >> $RESULTS_DIR/qa_summary_$TIMESTAMP.md
else
    echo "- 🚫 **Block**: Quality standards not met - do not release" >> $RESULTS_DIR/qa_summary_$TIMESTAMP.md
fi

echo ""
echo "📁 Results saved to: $RESULTS_DIR/"
echo "📊 Summary report: $RESULTS_DIR/qa_summary_$TIMESTAMP.md"

# Set exit code based on results
if [ $FAILED_TESTS -gt 0 ]; then
    echo ""
    echo "❌ QA Tests FAILED - $FAILED_TESTS test(s) failed"
    exit 1
elif [ $PASS_RATE -lt 80 ]; then
    echo ""
    echo "⚠️ QA Tests INCOMPLETE - Pass rate below 80%"
    exit 1
else
    echo ""
    echo "✅ QA Tests PASSED - Ready for release!"
    exit 0
fi