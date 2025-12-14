# API Documentation

## Overview

The Workforce Impact Dashboard integrates with multiple external APIs to provide comprehensive workforce analysis. This document covers API integration, data sources, and usage patterns.

## 🔗 Data Sources

### 1. GitHub API Integration

**Purpose**: Fetch AI-related repository growth metrics and technology trends.

**Endpoints Used**:
- `/search/repositories` - Search for AI-related repositories
- `/repos/{owner}/{repo}` - Get repository details
- `/repos/{owner}/{repo}/stats/contributors` - Get contributor statistics

**Authentication**: 
```typescript
headers: {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json'
}
```

**Rate Limiting**:
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour
- Implemented exponential backoff and caching

**Example Request**:
```typescript
const response = await fetch(
  'https://api.github.com/search/repositories?q=machine-learning+created:>2022-01-01',
  {
    headers: {
      'Authorization': `token ${process.env.VITE_GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  }
);
```

### 2. Job Market APIs

**Supported Sources**:
- Indeed API (primary)
- LinkedIn Jobs API (secondary)
- Government Labor Statistics
- Kaggle datasets (fallback)

**Data Points**:
- Job posting counts by role
- Salary trends
- Geographic distribution
- Skill requirements

**Example Integration**:
```typescript
interface JobMarketResponse {
  role: string;
  postings: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeRange: [Date, Date];
}
```

## 📊 Data Processing Pipeline

### 1. Data Fetching

```typescript
class DataService {
  async fetchAIGrowthData(timeRange: [Date, Date]): Promise<AIGrowthData> {
    // Fetch from GitHub API
    // Apply rate limiting
    // Cache results
  }

  async fetchJobMarketData(roles: string[], timeRange: [Date, Date]): Promise<JobRoleData[]> {
    // Fetch from multiple job APIs
    // Normalize data formats
    // Handle missing data
  }
}
```

### 2. Data Normalization

```typescript
function normalizeTimeSeriesData(
  data: RawTimeSeriesPoint[],
  timeRange: [Date, Date],
  granularity: 'month' | 'quarter' | 'year'
): TimeSeriesPoint[] {
  // Align time periods
  // Interpolate missing values
  // Calculate confidence scores
  // Apply smoothing algorithms
}
```

### 3. Impact Score Calculation

```typescript
function calculateImpactScore(
  aiGrowthRate: number,
  jobDemandChange: number
): number {
  const baseScore = aiGrowthRate - jobDemandChange;
  const volatilityAdjustment = calculateVolatility(aiGrowthRate, jobDemandChange);
  return baseScore * (1 - volatilityAdjustment * 0.1);
}
```

## 🔄 Caching Strategy

### Multi-Level Caching

1. **Browser Cache**: Static assets and API responses
2. **Memory Cache**: Processed data and calculations
3. **Local Storage**: User preferences and session data

### Cache Implementation

```typescript
class CacheService {
  private cache = new Map<string, CacheEntry>();
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    return null;
  }
  
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });
  }
}
```

## 🚨 Error Handling

### API Error Types

```typescript
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  retryAfter?: number;
}
```

### Fallback Strategies

1. **Primary API Failure**: Switch to secondary data source
2. **Rate Limiting**: Implement exponential backoff
3. **Network Issues**: Use cached data with staleness indicators
4. **Data Quality Issues**: Apply validation and filtering

### Error Recovery

```typescript
async function fetchWithFallback<T>(
  primaryFetch: () => Promise<T>,
  fallbackFetch: () => Promise<T>
): Promise<T> {
  try {
    return await primaryFetch();
  } catch (error) {
    console.warn('Primary API failed, using fallback:', error);
    return await fallbackFetch();
  }
}
```

## 📈 Performance Optimization

### Request Optimization

- **Batch Requests**: Combine multiple API calls
- **Parallel Processing**: Fetch data concurrently
- **Request Deduplication**: Avoid duplicate API calls
- **Compression**: Use gzip for large responses

### Data Processing

- **Lazy Loading**: Load data on demand
- **Memoization**: Cache expensive calculations
- **Web Workers**: Offload heavy processing
- **Streaming**: Process large datasets incrementally

## 🔒 Security Considerations

### API Key Management

- Environment variables for sensitive data
- No API keys in client-side code
- Rotation and expiration policies
- Rate limiting and abuse prevention

### Data Privacy

- No personal information stored
- Anonymized usage analytics
- GDPR compliance for EU users
- Secure data transmission (HTTPS)

## 📊 Monitoring and Analytics

### API Metrics

- Request success/failure rates
- Response times and latency
- Rate limit utilization
- Error patterns and trends

### Data Quality Metrics

- Data completeness scores
- Confidence intervals
- Anomaly detection
- Trend validation

## 🧪 Testing API Integration

### Mock Data for Testing

```typescript
const mockGitHubResponse = {
  total_count: 1000,
  items: [
    {
      id: 123,
      name: 'awesome-ai-project',
      stargazers_count: 500,
      created_at: '2023-01-01T00:00:00Z'
    }
  ]
};
```

### Integration Tests

```typescript
describe('GitHub API Integration', () => {
  test('fetches AI repository data', async () => {
    const data = await githubApi.fetchAIRepositories({
      timeRange: [new Date('2023-01-01'), new Date('2023-12-31')]
    });
    
    expect(data.repositoryCount).toBeGreaterThan(0);
    expect(data.timeSeriesData).toHaveLength(12); // Monthly data
  });
});
```

## 📝 API Usage Examples

### Fetching AI Growth Data

```typescript
const aiData = await dataService.fetchAIGrowthData([
  new Date('2022-01-01'),
  new Date('2024-01-01')
]);

console.log(`Total AI repositories: ${aiData.repositoryCount}`);
console.log(`Growth rate: ${aiData.contributorGrowth}%`);
```

### Analyzing Job Market Trends

```typescript
const jobData = await dataService.fetchJobMarketData(
  ['software-developer', 'ai-engineer'],
  [new Date('2022-01-01'), new Date('2024-01-01')]
);

jobData.forEach(role => {
  console.log(`${role.roleId}: ${role.growthRate}% growth`);
});
```

### Calculating Impact Scores

```typescript
const impactScores = dataService.calculateImpactScores(aiData, jobData);

impactScores.forEach(score => {
  console.log(`${score.roleId}: ${score.impactScore} (${score.riskLevel} risk)`);
});
```

## 🔧 Configuration

### Environment Variables

```bash
# GitHub API
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
VITE_GITHUB_API_URL=https://api.github.com

# Job Market APIs
VITE_INDEED_API_KEY=xxxxxxxxxx
VITE_LINKEDIN_API_KEY=xxxxxxxxxx

# Performance
VITE_CACHE_TTL=3600
VITE_API_TIMEOUT=10000
```

### API Client Configuration

```typescript
const apiConfig = {
  github: {
    baseURL: process.env.VITE_GITHUB_API_URL,
    timeout: 10000,
    retries: 3
  },
  jobMarket: {
    timeout: 15000,
    retries: 2,
    fallbackEnabled: true
  }
};
```

## 📞 Support and Troubleshooting

### Common Issues

1. **Rate Limiting**: Implement proper delays and caching
2. **API Timeouts**: Increase timeout values or implement retries
3. **Data Quality**: Validate and filter incoming data
4. **Authentication**: Verify API keys and permissions

### Debug Mode

Enable debug logging:
```typescript
localStorage.setItem('debug', 'api:*');
```

### Contact Information

- **API Issues**: api-support@yourdomain.com
- **Data Quality**: data-team@yourdomain.com
- **General Support**: support@yourdomain.com