import {
  AIGrowthData,
  JobRoleData,
  JobRoleImpact,
  GeneratedInsight,
  AnalysisContext,
  TimeSeriesPoint,
  TrendDirection,
  RiskLevel,
  Classification,
  JobRole
} from '../types';
import {
  calculateImpactScore,
  classifyRisk,
  analyzeTrend,
  aggregateTimeSeriesData,
  calculateConfidence
} from '../utils/dataTransformation';
import { JOB_ROLES, RISK_LEVELS, CLASSIFICATIONS } from '../utils/constants';
import { generateId } from '../utils';

export class AnalysisEngine {
  
  /**
   * Enhanced impact score calculation with multiple factors
   */
  calculateAdvancedImpactScore(
    aiGrowthRate: number,
    jobDemandChange: number,
    additionalFactors: {
      skillOverlap?: number; // 0-1, how much the role overlaps with AI capabilities
      automationRisk?: number; // 0-1, risk of automation
      complementarity?: number; // 0-1, how well the role complements AI
      marketVolatility?: number; // 0-1, market volatility factor
    } = {}
  ): {
    baseScore: number;
    adjustedScore: number;
    factors: Record<string, number>;
    confidence: number;
  } {
    // Base impact score
    const baseScore = calculateImpactScore(aiGrowthRate, jobDemandChange);
    
    // Factor weights
    const weights = {
      skillOverlap: 0.25,
      automationRisk: 0.30,
      complementarity: 0.20,
      marketVolatility: 0.15,
      baseline: 0.10
    };
    
    // Calculate factor adjustments
    const factors = {
      skillOverlap: (additionalFactors.skillOverlap || 0.5) * weights.skillOverlap,
      automationRisk: (additionalFactors.automationRisk || 0.5) * weights.automationRisk,
      complementarity: (1 - (additionalFactors.complementarity || 0.5)) * weights.complementarity,
      marketVolatility: (additionalFactors.marketVolatility || 0.3) * weights.marketVolatility
    };
    
    // Adjusted score calculation
    const adjustmentFactor = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    const adjustedScore = baseScore * (1 + adjustmentFactor - 0.5); // Center around 0.5
    
    // Calculate confidence based on data quality
    const confidence = this.calculateScoreConfidence(aiGrowthRate, jobDemandChange, additionalFactors);
    
    return {
      baseScore,
      adjustedScore,
      factors,
      confidence
    };
  }

  /**
   * Comprehensive role impact analysis
   */
  analyzeRoleImpact(
    roleId: string,
    aiData: AIGrowthData,
    jobData: JobRoleData
  ): JobRoleImpact & {
    detailedAnalysis: {
      trendStrength: number;
      seasonality: number;
      volatility: number;
      dataQuality: number;
      futureProjection: {
        sixMonths: number;
        oneYear: number;
        twoYears: number;
      };
    };
  } {
    const role = JOB_ROLES.find(r => r.id === roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    // Analyze trends
    const aiTrend = analyzeTrend(aiData.timeSeriesData);
    const jobTrend = analyzeTrend(jobData.timeSeriesData);
    
    // Get role-specific factors
    const roleFactors = this.getRoleSpecificFactors(role);
    
    // Calculate enhanced impact score
    const impactAnalysis = this.calculateAdvancedImpactScore(
      aiTrend.growthRate,
      jobTrend.growthRate,
      roleFactors
    );
    
    // Classify risk and impact
    const { riskLevel, classification } = classifyRisk(
      impactAnalysis.adjustedScore,
      jobTrend.growthRate
    );
    
    // Calculate detailed metrics
    const detailedAnalysis = {
      trendStrength: Math.max(aiTrend.strength, jobTrend.strength),
      seasonality: this.calculateSeasonality(jobData.timeSeriesData),
      volatility: this.calculateVolatility(jobData.timeSeriesData),
      dataQuality: this.assessDataQuality(jobData.timeSeriesData),
      futureProjection: this.projectFutureTrends(jobData.timeSeriesData, aiTrend.growthRate)
    };

    return {
      roleId,
      aiGrowthRate: aiTrend.growthRate,
      jobDemandChange: jobTrend.growthRate,
      impactScore: impactAnalysis.adjustedScore,
      riskLevel,
      classification,
      detailedAnalysis
    };
  }

  /**
   * Generate comprehensive insights from analysis context
   */
  generateAdvancedInsights(
    context: AnalysisContext,
    aiData: AIGrowthData,
    jobDataArray: JobRoleData[],
    impactScores: JobRoleImpact[]
  ): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];

    // Market overview insights
    insights.push(...this.generateMarketOverviewInsights(aiData, impactScores));
    
    // Role-specific insights
    if (context.selectedRoles.length === 1) {
      insights.push(...this.generateSingleRoleInsights(context.selectedRoles[0], aiData, jobDataArray, impactScores));
    } else if (context.selectedRoles.length === 2 && context.comparisonMode) {
      insights.push(...this.generateComparisonInsights(context.selectedRoles, aiData, jobDataArray, impactScores));
    }
    
    // Trend insights
    insights.push(...this.generateTrendInsights(aiData, jobDataArray));
    
    // Risk insights
    insights.push(...this.generateRiskInsights(impactScores));
    
    // Opportunity insights
    insights.push(...this.generateOpportunityInsights(impactScores));
    
    // Correlation insights
    insights.push(...this.generateCorrelationInsights(aiData, jobDataArray));

    // Sort by confidence and actionability
    return insights
      .sort((a, b) => {
        if (a.actionable !== b.actionable) {
          return a.actionable ? -1 : 1; // Actionable insights first
        }
        return b.confidence - a.confidence; // Then by confidence
      })
      .slice(0, 10); // Limit to top 10 insights
  }

  private getRoleSpecificFactors(role: JobRole): {
    skillOverlap: number;
    automationRisk: number;
    complementarity: number;
    marketVolatility: number;
  } {
    // Define role-specific factors based on category and role characteristics
    const categoryFactors: Record<string, any> = {
      'ai-ml': {
        skillOverlap: 0.9,
        automationRisk: 0.2,
        complementarity: 0.8,
        marketVolatility: 0.4
      },
      'software-development': {
        skillOverlap: 0.6,
        automationRisk: 0.4,
        complementarity: 0.7,
        marketVolatility: 0.3
      },
      'data-science': {
        skillOverlap: 0.8,
        automationRisk: 0.3,
        complementarity: 0.8,
        marketVolatility: 0.3
      },
      'testing': {
        skillOverlap: 0.4,
        automationRisk: 0.8,
        complementarity: 0.3,
        marketVolatility: 0.5
      },
      'design': {
        skillOverlap: 0.3,
        automationRisk: 0.4,
        complementarity: 0.6,
        marketVolatility: 0.4
      },
      'management': {
        skillOverlap: 0.2,
        automationRisk: 0.2,
        complementarity: 0.7,
        marketVolatility: 0.2
      },
      'support': {
        skillOverlap: 0.3,
        automationRisk: 0.7,
        complementarity: 0.4,
        marketVolatility: 0.4
      },
      'devops': {
        skillOverlap: 0.5,
        automationRisk: 0.5,
        complementarity: 0.6,
        marketVolatility: 0.3
      }
    };

    return categoryFactors[role.category] || {
      skillOverlap: 0.5,
      automationRisk: 0.5,
      complementarity: 0.5,
      marketVolatility: 0.4
    };
  }

  private calculateScoreConfidence(
    aiGrowthRate: number,
    jobDemandChange: number,
    factors: Record<string, number | undefined>
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on data availability
    const factorCount = Object.values(factors).filter(f => f !== undefined).length;
    confidence += (factorCount / 4) * 0.2; // Up to 0.2 bonus for complete factors
    
    // Adjust based on magnitude (more extreme values are less certain)
    const magnitudePenalty = Math.min(0.2, (Math.abs(aiGrowthRate) + Math.abs(jobDemandChange)) / 1000);
    confidence -= magnitudePenalty;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private calculateSeasonality(data: TimeSeriesPoint[]): number {
    if (data.length < 12) return 0; // Need at least a year of data
    
    // Simple seasonality detection using month-over-month variance
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);
    
    data.forEach(point => {
      const month = point.timestamp.getMonth();
      monthlyAverages[month] += point.value;
      monthlyCounts[month]++;
    });
    
    // Calculate averages
    for (let i = 0; i < 12; i++) {
      if (monthlyCounts[i] > 0) {
        monthlyAverages[i] /= monthlyCounts[i];
      }
    }
    
    // Calculate coefficient of variation
    const mean = monthlyAverages.reduce((sum, val) => sum + val, 0) / 12;
    const variance = monthlyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 12;
    const stdDev = Math.sqrt(variance);
    
    return mean === 0 ? 0 : stdDev / mean;
  }

  private calculateVolatility(data: TimeSeriesPoint[]): number {
    if (data.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1].value !== 0) {
        const returnRate = (data[i].value - data[i - 1].value) / data[i - 1].value;
        returns.push(returnRate);
      }
    }
    
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private assessDataQuality(data: TimeSeriesPoint[]): number {
    if (data.length === 0) return 0;
    
    let quality = 1.0;
    
    // Penalize for estimated data
    const estimatedRatio = data.filter(p => p.isEstimated).length / data.length;
    quality -= estimatedRatio * 0.3;
    
    // Penalize for low confidence
    const avgConfidence = data.reduce((sum, p) => sum + p.confidence, 0) / data.length;
    quality *= avgConfidence;
    
    // Penalize for gaps (simplified check)
    const expectedPoints = Math.floor((data[data.length - 1].timestamp.getTime() - data[0].timestamp.getTime()) / (30 * 24 * 60 * 60 * 1000)) + 1;
    const completeness = data.length / expectedPoints;
    quality *= Math.min(1, completeness);
    
    return Math.max(0, Math.min(1, quality));
  }

  private projectFutureTrends(data: TimeSeriesPoint[], aiGrowthRate: number): {
    sixMonths: number;
    oneYear: number;
    twoYears: number;
  } {
    if (data.length === 0) {
      return { sixMonths: 0, oneYear: 0, twoYears: 0 };
    }
    
    const trend = analyzeTrend(data);
    const lastValue = data[data.length - 1].value;
    const monthlyGrowthRate = trend.growthRate / 12; // Convert annual to monthly
    
    // Factor in AI impact on projections
    const aiImpactFactor = 1 + (aiGrowthRate / 100) * 0.1; // 10% of AI growth rate affects job trends
    
    return {
      sixMonths: lastValue * Math.pow(1 + monthlyGrowthRate / 100, 6) * Math.pow(aiImpactFactor, 0.5),
      oneYear: lastValue * Math.pow(1 + monthlyGrowthRate / 100, 12) * aiImpactFactor,
      twoYears: lastValue * Math.pow(1 + monthlyGrowthRate / 100, 24) * Math.pow(aiImpactFactor, 2)
    };
  }

  private generateMarketOverviewInsights(aiData: AIGrowthData, impacts: JobRoleImpact[]): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    
    const highRiskRoles = impacts.filter(i => i.riskLevel === 'high').length;
    const growthRoles = impacts.filter(i => i.classification === 'growth').length;
    const aiGrowthTrend = analyzeTrend(aiData.timeSeriesData);
    
    insights.push({
      id: generateId(),
      type: 'trend',
      title: 'AI Development Acceleration Impact',
      description: `AI repository growth has accelerated to ${aiGrowthTrend.growthRate.toFixed(1)}% annually, affecting ${impacts.length} analyzed roles. ${highRiskRoles} roles face high disruption risk while ${growthRoles} roles show growth opportunities.`,
      confidence: 0.85,
      relevantData: impacts.map(i => i.roleId),
      actionable: true
    });
    
    return insights;
  }

  private generateSingleRoleInsights(
    roleId: string,
    aiData: AIGrowthData,
    jobDataArray: JobRoleData[],
    impacts: JobRoleImpact[]
  ): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    const role = JOB_ROLES.find(r => r.id === roleId);
    const impact = impacts.find(i => i.roleId === roleId);
    const jobData = jobDataArray.find(j => j.roleId === roleId);
    
    if (!role || !impact || !jobData) return insights;
    
    const riskConfig = RISK_LEVELS[impact.riskLevel];
    const classificationConfig = CLASSIFICATIONS[impact.classification];
    
    insights.push({
      id: generateId(),
      type: 'trend',
      title: `${role.name}: ${classificationConfig.label} Analysis`,
      description: `${role.name} positions are classified as ${classificationConfig.description.toLowerCase()}. With ${impact.jobDemandChange.toFixed(1)}% job market change and AI impact score of ${impact.impactScore.toFixed(1)}, this role shows ${riskConfig.label.toLowerCase()} characteristics.`,
      confidence: 0.82,
      relevantData: [roleId],
      actionable: true
    });
    
    return insights;
  }

  private generateComparisonInsights(
    roleIds: string[],
    aiData: AIGrowthData,
    jobDataArray: JobRoleData[],
    impacts: JobRoleImpact[]
  ): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    const [role1Id, role2Id] = roleIds;
    
    const role1 = JOB_ROLES.find(r => r.id === role1Id);
    const role2 = JOB_ROLES.find(r => r.id === role2Id);
    const impact1 = impacts.find(i => i.roleId === role1Id);
    const impact2 = impacts.find(i => i.roleId === role2Id);
    
    if (!role1 || !role2 || !impact1 || !impact2) return insights;
    
    const scoreDiff = Math.abs(impact1.impactScore - impact2.impactScore);
    const demandDiff = Math.abs(impact1.jobDemandChange - impact2.jobDemandChange);
    
    insights.push({
      id: generateId(),
      type: 'comparison',
      title: `${role1.name} vs ${role2.name}: Strategic Comparison`,
      description: `Comparing ${role1.name} (${impact1.classification}) and ${role2.name} (${impact2.classification}) reveals ${scoreDiff.toFixed(1)} point difference in AI impact scores and ${demandDiff.toFixed(1)}% difference in job demand trends. ${impact1.impactScore > impact2.impactScore ? role1.name : role2.name} shows higher transformation pressure.`,
      confidence: 0.78,
      relevantData: roleIds,
      actionable: true
    });
    
    return insights;
  }

  private generateTrendInsights(aiData: AIGrowthData, jobDataArray: JobRoleData[]): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    
    const avgJobGrowth = jobDataArray.reduce((sum, job) => {
      const trend = analyzeTrend(job.timeSeriesData);
      return sum + trend.growthRate;
    }, 0) / jobDataArray.length;
    
    const aiTrend = analyzeTrend(aiData.timeSeriesData);
    
    insights.push({
      id: generateId(),
      type: 'correlation',
      title: 'AI-Job Market Correlation Patterns',
      description: `AI development growth (${aiTrend.growthRate.toFixed(1)}%) significantly outpaces average job market growth (${avgJobGrowth.toFixed(1)}%), indicating accelerating workforce transformation. This gap suggests increasing automation pressure across traditional roles.`,
      confidence: 0.75,
      relevantData: jobDataArray.map(j => j.roleId),
      actionable: false
    });
    
    return insights;
  }

  private generateRiskInsights(impacts: JobRoleImpact[]): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    
    const highRiskRoles = impacts.filter(i => i.riskLevel === 'high');
    if (highRiskRoles.length > 0) {
      const roleNames = highRiskRoles.map(i => {
        const role = JOB_ROLES.find(r => r.id === i.roleId);
        return role?.name || i.roleId;
      }).join(', ');
      
      insights.push({
        id: generateId(),
        type: 'prediction',
        title: 'High-Risk Role Alert',
        description: `${highRiskRoles.length} roles (${roleNames}) face high disruption risk from AI advancement. These positions require immediate upskilling focus on AI collaboration and human-centric skills to maintain relevance.`,
        confidence: 0.88,
        relevantData: highRiskRoles.map(r => r.roleId),
        actionable: true
      });
    }
    
    return insights;
  }

  private generateOpportunityInsights(impacts: JobRoleImpact[]): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    
    const growthRoles = impacts.filter(i => i.classification === 'growth');
    if (growthRoles.length > 0) {
      const topGrowthRole = growthRoles.reduce((max, role) => 
        role.impactScore < max.impactScore ? role : max
      );
      
      const role = JOB_ROLES.find(r => r.id === topGrowthRole.roleId);
      
      insights.push({
        id: generateId(),
        type: 'prediction',
        title: 'Growth Opportunity Spotlight',
        description: `${role?.name || topGrowthRole.roleId} shows the strongest growth potential with ${topGrowthRole.jobDemandChange.toFixed(1)}% demand increase. This role benefits from AI complementarity rather than replacement, making it an excellent career transition target.`,
        confidence: 0.83,
        relevantData: [topGrowthRole.roleId],
        actionable: true
      });
    }
    
    return insights;
  }

  private generateCorrelationInsights(aiData: AIGrowthData, jobDataArray: JobRoleData[]): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    
    // Calculate correlation between AI growth and job trends
    const aiValues = aiData.timeSeriesData.map(p => p.value);
    const correlations = jobDataArray.map(jobData => {
      const jobValues = jobData.timeSeriesData.map(p => p.value);
      return this.calculateCorrelation(aiValues, jobValues);
    });
    
    const avgCorrelation = correlations.reduce((sum, corr) => sum + corr, 0) / correlations.length;
    
    insights.push({
      id: generateId(),
      type: 'correlation',
      title: 'AI-Employment Correlation Analysis',
      description: `Statistical analysis reveals ${avgCorrelation > 0 ? 'positive' : 'negative'} correlation (r=${avgCorrelation.toFixed(2)}) between AI development and job market trends. This ${Math.abs(avgCorrelation) > 0.5 ? 'strong' : 'moderate'} relationship indicates ${avgCorrelation > 0 ? 'complementary' : 'competitive'} dynamics between AI growth and employment.`,
      confidence: 0.72,
      relevantData: jobDataArray.map(j => j.roleId),
      actionable: false
    });
    
    return insights;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);
    
    const meanX = xSlice.reduce((sum, val) => sum + val, 0) / n;
    const meanY = ySlice.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = xSlice[i] - meanX;
      const yDiff = ySlice[i] - meanY;
      
      numerator += xDiff * yDiff;
      sumXSquared += xDiff * xDiff;
      sumYSquared += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Export singleton instance
export const analysisEngine = new AnalysisEngine();