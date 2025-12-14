// Service layer exports

export { GitHubApiClient } from './githubApi';
export { JobMarketApiClient } from './jobMarketApi';
export { CacheService, cacheService } from './cacheService';
export { DataService, dataService } from './dataService';
export { AnalysisEngine, analysisEngine } from './analysisEngine';

// Re-export types for convenience
export type { ApiError, CacheEntry } from '../types';