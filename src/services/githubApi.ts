import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { GitHubSearchResponse, GitHubRepository, AIGrowthData, TimeSeriesPoint, ApiError } from '../types';
import { API_CONFIG } from '../utils/constants';

export class GitHubApiClient {
  private client: AxiosInstance;
  private rateLimitRemaining: number = API_CONFIG.github.rateLimit;
  private rateLimitReset: number = Date.now() + 3600000; // 1 hour from now
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: API_CONFIG.github.baseUrl,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Workforce-Impact-Dashboard/1.0',
        ...(token && { 'Authorization': `token ${token}` })
      },
      timeout: 10000
    });

    // Response interceptor to handle rate limiting
    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimit(response);
        return response;
      },
      (error) => {
        if (error.response?.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
          const waitTime = resetTime - Date.now();
          
          throw new Error(`Rate limit exceeded. Reset in ${Math.ceil(waitTime / 1000)} seconds`);
        }
        throw error;
      }
    );
  }

  private updateRateLimit(response: AxiosResponse) {
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];
    
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset) * 1000;
  }

  private async waitForRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 10) { // Conservative threshold
      const waitTime = this.rateLimitReset - Date.now();
      if (waitTime > 0) {
        console.log(`Rate limit low, waiting ${Math.ceil(waitTime / 1000)} seconds`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  private async executeWithRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    await this.waitForRateLimit();
    return operation();
  }

  async searchRepositories(
    query: string,
    options: {
      sort?: 'stars' | 'forks' | 'updated';
      order?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubSearchResponse> {
    const params = {
      q: query,
      sort: options.sort || 'updated',
      order: options.order || 'desc',
      per_page: Math.min(options.per_page || 100, 100),
      page: options.page || 1
    };

    try {
      const response = await this.executeWithRateLimit(() =>
        this.client.get<GitHubSearchResponse>('/search/repositories', { params })
      );
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to search repositories');
    }
  }

  async getAIRepositoryGrowth(timeRange: [Date, Date]): Promise<AIGrowthData> {
    const aiKeywords = API_CONFIG.github.aiKeywords;
    const timeSeriesData: TimeSeriesPoint[] = [];
    let totalRepositories = 0;
    const technologyBreakdown: Record<string, number> = {};

    try {
      // Search for AI-related repositories with different time periods
      const monthlyData = await this.getMonthlyAIGrowth(timeRange, aiKeywords);
      
      // Process the data to create time series
      for (const [month, data] of monthlyData.entries()) {
        timeSeriesData.push({
          timestamp: new Date(month),
          value: data.count,
          confidence: data.confidence,
          isEstimated: data.isEstimated,
          metadata: {
            searchQueries: data.queries,
            totalResults: data.totalResults
          }
        });

        totalRepositories += data.count;
        
        // Aggregate technology breakdown
        for (const [tech, count] of Object.entries(data.technologies)) {
          technologyBreakdown[tech] = (technologyBreakdown[tech] || 0) + count;
        }
      }

      // Calculate contributor growth (simplified estimation)
      const contributorGrowth = this.estimateContributorGrowth(timeSeriesData);

      // Convert technology breakdown to required format
      const technologyBreakdownArray = Object.entries(technologyBreakdown)
        .map(([name, count]) => ({
          name,
          count,
          growthRate: this.calculateTechGrowthRate(name, timeSeriesData)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 technologies

      return {
        timeSeriesData: timeSeriesData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        repositoryCount: totalRepositories,
        contributorGrowth,
        technologyBreakdown: technologyBreakdownArray
      };

    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch AI repository growth data');
    }
  }

  private async getMonthlyAIGrowth(
    timeRange: [Date, Date],
    keywords: string[]
  ): Promise<Map<string, {
    count: number;
    confidence: number;
    isEstimated: boolean;
    queries: string[];
    totalResults: number;
    technologies: Record<string, number>;
  }>> {
    const monthlyData = new Map();
    const startDate = new Date(timeRange[0]);
    const endDate = new Date(timeRange[1]);
    
    // Generate monthly queries
    const current = new Date(startDate);
    while (current <= endDate) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      try {
        // Create date range query for this month
        const dateQuery = `created:${current.toISOString().split('T')[0]}..${nextMonth.toISOString().split('T')[0]}`;
        
        let monthlyCount = 0;
        let totalResults = 0;
        const queries: string[] = [];
        const technologies: Record<string, number> = {};

        // Search with different AI keyword combinations
        for (let i = 0; i < keywords.length; i += 3) { // Batch keywords to avoid query length limits
          const keywordBatch = keywords.slice(i, i + 3);
          const keywordQuery = keywordBatch.map(k => `topic:${k}`).join(' OR ');
          const fullQuery = `${keywordQuery} ${dateQuery}`;
          
          queries.push(fullQuery);
          
          try {
            const result = await this.searchRepositories(fullQuery, { per_page: 100 });
            monthlyCount += Math.min(result.total_count, 100); // GitHub API limits
            totalResults += result.total_count;
            
            // Count technologies/languages
            result.items.forEach(repo => {
              if (repo.language) {
                technologies[repo.language] = (technologies[repo.language] || 0) + 1;
              }
            });
            
            // Add small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.warn(`Failed to fetch data for query: ${fullQuery}`, error);
          }
        }

        monthlyData.set(monthKey, {
          count: monthlyCount,
          confidence: monthlyCount > 0 ? 0.8 : 0.3, // Higher confidence with actual data
          isEstimated: monthlyCount === 0,
          queries,
          totalResults,
          technologies
        });

      } catch (error) {
        console.warn(`Failed to fetch data for month: ${monthKey}`, error);
        
        // Add estimated data point
        monthlyData.set(monthKey, {
          count: 0,
          confidence: 0.2,
          isEstimated: true,
          queries: [],
          totalResults: 0,
          technologies: {}
        });
      }

      current.setMonth(current.getMonth() + 1);
    }

    return monthlyData;
  }

  private estimateContributorGrowth(timeSeriesData: TimeSeriesPoint[]): number {
    if (timeSeriesData.length < 2) return 0;
    
    // Simple estimation: assume 3-5 contributors per repository on average
    const avgContributorsPerRepo = 4;
    const firstPeriod = timeSeriesData[0].value * avgContributorsPerRepo;
    const lastPeriod = timeSeriesData[timeSeriesData.length - 1].value * avgContributorsPerRepo;
    
    return firstPeriod === 0 ? 0 : ((lastPeriod - firstPeriod) / firstPeriod) * 100;
  }

  private calculateTechGrowthRate(technology: string, timeSeriesData: TimeSeriesPoint[]): number {
    // Simplified growth rate calculation
    // In a real implementation, this would track technology-specific data over time
    const totalGrowth = timeSeriesData.length > 1 
      ? ((timeSeriesData[timeSeriesData.length - 1].value - timeSeriesData[0].value) / timeSeriesData[0].value) * 100
      : 0;
    
    // Apply technology-specific multipliers based on AI relevance
    const aiRelevanceMultipliers: Record<string, number> = {
      'Python': 1.5,
      'JavaScript': 1.2,
      'TypeScript': 1.3,
      'Jupyter Notebook': 1.8,
      'R': 1.4,
      'C++': 1.1,
      'Java': 1.0,
      'Go': 1.2,
      'Rust': 1.3
    };
    
    const multiplier = aiRelevanceMultipliers[technology] || 1.0;
    return totalGrowth * multiplier;
  }

  private handleApiError(error: any, message: string): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: `${message}: ${error.message}`,
        status: error.response?.status,
        code: error.code,
        retryAfter: error.response?.headers['retry-after'] 
          ? parseInt(error.response.headers['retry-after']) * 1000 
          : undefined
      };
    }
    
    return {
      message: `${message}: ${error.message || 'Unknown error'}`,
      code: 'UNKNOWN_ERROR'
    };
  }

  // Health check method
  async checkApiHealth(): Promise<{ healthy: boolean; rateLimitRemaining: number; message?: string }> {
    try {
      await this.executeWithRateLimit(() => 
        this.client.get('/rate_limit')
      );
      
      return {
        healthy: true,
        rateLimitRemaining: this.rateLimitRemaining
      };
    } catch (error) {
      return {
        healthy: false,
        rateLimitRemaining: this.rateLimitRemaining,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}