import axios, { AxiosInstance } from 'axios';
import { JobRoleData, JobMarketDataPoint, TimeSeriesPoint, ApiError, JobRole } from '../types';
import { JOB_ROLES } from '../utils/constants';
import { analyzeTrend } from '../utils/dataTransformation';

export class JobMarketApiClient {
  private client: AxiosInstance;
  private fallbackData: Map<string, JobRoleData> = new Map();

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Workforce-Impact-Dashboard/1.0'
      }
    });

    // Initialize fallback data
    this.initializeFallbackData();
  }

  async fetchJobMarketData(
    roles: string[],
    timeRange: [Date, Date]
  ): Promise<JobRoleData[]> {
    const results: JobRoleData[] = [];

    for (const roleId of roles) {
      try {
        // Try primary data sources first
        let roleData = await this.fetchFromPrimarySources(roleId, timeRange);
        
        if (!roleData) {
          // Fall back to secondary sources
          roleData = await this.fetchFromSecondarySources(roleId, timeRange);
        }
        
        if (!roleData) {
          // Use fallback/sample data
          roleData = this.getFallbackData(roleId, timeRange);
        }

        if (roleData) {
          results.push(roleData);
        }
      } catch (error) {
        console.warn(`Failed to fetch data for role ${roleId}:`, error);
        
        // Always provide fallback data to ensure the dashboard works
        const fallbackData = this.getFallbackData(roleId, timeRange);
        if (fallbackData) {
          results.push(fallbackData);
        }
      }
    }

    return results;
  }

  private async fetchFromPrimarySources(
    roleId: string,
    timeRange: [Date, Date]
  ): Promise<JobRoleData | null> {
    // In a real implementation, this would call actual job market APIs
    // For now, we'll simulate API calls and return null to trigger fallback
    
    try {
      // Simulate Indeed API call
      const indeedData = await this.fetchFromIndeed(roleId, timeRange);
      if (indeedData) return indeedData;

      // Simulate LinkedIn API call
      const linkedinData = await this.fetchFromLinkedIn(roleId, timeRange);
      if (linkedinData) return linkedinData;

    } catch (error) {
      console.warn('Primary sources failed:', error);
    }

    return null;
  }

  private async fetchFromSecondarySources(
    roleId: string,
    timeRange: [Date, Date]
  ): Promise<JobRoleData | null> {
    try {
      // Simulate government labor statistics API
      const govData = await this.fetchFromGovernmentData(roleId, timeRange);
      if (govData) return govData;

      // Simulate Kaggle dataset
      const kaggleData = await this.fetchFromKaggleDataset(roleId, timeRange);
      if (kaggleData) return kaggleData;

    } catch (error) {
      console.warn('Secondary sources failed:', error);
    }

    return null;
  }

  // Simulated API calls (in real implementation, these would make actual HTTP requests)
  private async fetchFromIndeed(roleId: string, timeRange: [Date, Date]): Promise<JobRoleData | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For demo purposes, return null to trigger fallback data
    // In real implementation: return this.processIndeedResponse(response, roleId);
    return null;
  }

  private async fetchFromLinkedIn(roleId: string, timeRange: [Date, Date]): Promise<JobRoleData | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }

  private async fetchFromGovernmentData(roleId: string, timeRange: [Date, Date]): Promise<JobRoleData | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }

  private async fetchFromKaggleDataset(roleId: string, timeRange: [Date, Date]): Promise<JobRoleData | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }

  private getFallbackData(roleId: string, timeRange: [Date, Date]): JobRoleData | null {
    const role = JOB_ROLES.find(r => r.id === roleId);
    if (!role) return null;

    // Generate realistic sample data based on role characteristics
    const timeSeriesData = this.generateSampleTimeSeriesData(role, timeRange);
    const trendAnalysis = analyzeTrend(timeSeriesData);

    return {
      roleId,
      timeSeriesData,
      currentTrend: trendAnalysis.direction,
      growthRate: trendAnalysis.growthRate,
      confidence: 0.7 // Moderate confidence for sample data
    };
  }

  private generateSampleTimeSeriesData(role: JobRole, timeRange: [Date, Date]): TimeSeriesPoint[] {
    const data: TimeSeriesPoint[] = [];
    const startDate = new Date(timeRange[0]);
    const endDate = new Date(timeRange[1]);
    
    // Role-specific baseline and trend parameters
    const roleCharacteristics = this.getRoleCharacteristics(role);
    
    const current = new Date(startDate);
    let baseValue = roleCharacteristics.baseJobPostings;
    
    while (current <= endDate) {
      // Add trend and some randomness
      const monthsFromStart = (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const trendEffect = roleCharacteristics.trendSlope * monthsFromStart;
      const seasonalEffect = Math.sin((current.getMonth() / 12) * 2 * Math.PI) * roleCharacteristics.seasonality;
      const randomNoise = (Math.random() - 0.5) * roleCharacteristics.volatility;
      
      const value = Math.max(0, baseValue + trendEffect + seasonalEffect + randomNoise);
      
      data.push({
        timestamp: new Date(current),
        value: Math.round(value),
        confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
        isEstimated: false, // Sample data, but not interpolated
        metadata: {
          source: 'sample-data',
          roleCategory: role.category,
          generatedAt: new Date().toISOString()
        }
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return data;
  }

  private getRoleCharacteristics(role: JobRole): {
    baseJobPostings: number;
    trendSlope: number;
    seasonality: number;
    volatility: number;
  } {
    // Define characteristics based on role category and current market trends
    const characteristics: Record<string, any> = {
      'ai-ml': {
        baseJobPostings: 1200,
        trendSlope: 15, // Strong positive trend
        seasonality: 100,
        volatility: 200
      },
      'software-development': {
        baseJobPostings: 3000,
        trendSlope: 8, // Moderate positive trend
        seasonality: 200,
        volatility: 300
      },
      'data-science': {
        baseJobPostings: 1500,
        trendSlope: 12, // Strong positive trend
        seasonality: 150,
        volatility: 250
      },
      'devops': {
        baseJobPostings: 1800,
        trendSlope: 10, // Positive trend
        seasonality: 120,
        volatility: 180
      },
      'testing': {
        baseJobPostings: 800,
        trendSlope: -2, // Slight negative trend (automation impact)
        seasonality: 80,
        volatility: 120
      },
      'design': {
        baseJobPostings: 1000,
        trendSlope: 5, // Moderate positive trend
        seasonality: 100,
        volatility: 150
      },
      'management': {
        baseJobPostings: 600,
        trendSlope: 3, // Slow positive trend
        seasonality: 50,
        volatility: 80
      },
      'support': {
        baseJobPostings: 1200,
        trendSlope: -1, // Slight negative trend (automation impact)
        seasonality: 100,
        volatility: 150
      }
    };

    return characteristics[role.category] || {
      baseJobPostings: 1000,
      trendSlope: 0,
      seasonality: 100,
      volatility: 150
    };
  }

  private initializeFallbackData(): void {
    // Pre-generate some cached fallback data for common scenarios
    const commonTimeRange: [Date, Date] = [new Date('2022-01-01'), new Date()];
    
    JOB_ROLES.forEach(role => {
      const fallbackData = this.getFallbackData(role.id, commonTimeRange);
      if (fallbackData) {
        this.fallbackData.set(role.id, fallbackData);
      }
    });
  }

  // Process real API responses (for when actual APIs are integrated)
  private processIndeedResponse(response: any, roleId: string): JobRoleData {
    // This would process actual Indeed API response
    // For now, return sample structure
    return {
      roleId,
      timeSeriesData: [],
      currentTrend: 'stable',
      growthRate: 0,
      confidence: 0.8
    };
  }

  private processLinkedInResponse(response: any, roleId: string): JobRoleData {
    // This would process actual LinkedIn API response
    return {
      roleId,
      timeSeriesData: [],
      currentTrend: 'stable',
      growthRate: 0,
      confidence: 0.8
    };
  }

  private processGovernmentDataResponse(response: any, roleId: string): JobRoleData {
    // This would process government labor statistics
    return {
      roleId,
      timeSeriesData: [],
      currentTrend: 'stable',
      growthRate: 0,
      confidence: 0.9
    };
  }

  // Utility methods for API integration
  async validateApiKeys(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    // Check Indeed API
    try {
      // In real implementation: await this.client.get(indeedHealthEndpoint)
      results.indeed = false; // Set to false since we're using sample data
    } catch {
      results.indeed = false;
    }
    
    // Check LinkedIn API
    try {
      // In real implementation: await this.client.get(linkedinHealthEndpoint)
      results.linkedin = false;
    } catch {
      results.linkedin = false;
    }
    
    return results;
  }

  async getDataSourceStatus(): Promise<{
    primary: { available: boolean; sources: string[] };
    secondary: { available: boolean; sources: string[] };
    fallback: { available: boolean; roles: number };
  }> {
    return {
      primary: {
        available: false, // Set to false since we're using sample data
        sources: ['Indeed API', 'LinkedIn Jobs API']
      },
      secondary: {
        available: false,
        sources: ['Government Labor Statistics', 'Kaggle Datasets']
      },
      fallback: {
        available: true,
        roles: this.fallbackData.size
      }
    };
  }

  private handleApiError(error: any, source: string): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: `${source} API error: ${error.message}`,
        status: error.response?.status,
        code: error.code,
        retryAfter: error.response?.headers['retry-after'] 
          ? parseInt(error.response.headers['retry-after']) * 1000 
          : undefined
      };
    }
    
    return {
      message: `${source} error: ${error.message || 'Unknown error'}`,
      code: 'UNKNOWN_ERROR'
    };
  }
}