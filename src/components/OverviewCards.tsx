import React, { useState } from 'react';
import { AIGrowthData, JobRoleImpact } from '../types';
import { JOB_ROLES, RISK_LEVELS } from '../utils/constants';
import { formatNumber, formatPercentage } from '../utils';
import './OverviewCards.css';

interface OverviewCardsProps {
  aiData: AIGrowthData | null;
  impactScores: JobRoleImpact[];
  selectedRole: string | null;
  isLoading: boolean;
}

interface CardData {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
  icon: string;
  tooltip: string;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  aiData,
  impactScores,
  selectedRole,
  isLoading
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="overview-cards loading">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="overview-card skeleton">
            <div className="card-content">
              <div className="skeleton-line title" />
              <div className="skeleton-line value" />
              <div className="skeleton-line subtitle" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate overview metrics
  const calculateOverviewMetrics = (): CardData[] => {
    const cards: CardData[] = [];

    // AI Growth Rate
    if (aiData) {
      const aiGrowthRate = aiData.contributorGrowth || 0;
      cards.push({
        id: 'ai-growth',
        title: 'AI Development Growth',
        value: formatPercentage(aiGrowthRate, 1),
        subtitle: `${formatNumber(aiData.repositoryCount)} repositories`,
        trend: aiGrowthRate > 0 ? 'up' : aiGrowthRate < 0 ? 'down' : 'stable',
        trendValue: `+${formatNumber(aiData.repositoryCount)} this period`,
        color: '#8B5CF6',
        icon: '🤖',
        tooltip: `AI repository growth rate based on ${aiData.repositoryCount} repositories. Includes machine learning, deep learning, and AI-related projects.`
      });
    }

    // Roles at Risk
    const highRiskRoles = impactScores.filter(score => score.riskLevel === 'high');
    cards.push({
      id: 'roles-at-risk',
      title: 'Roles at High Risk',
      value: highRiskRoles.length,
      subtitle: `of ${impactScores.length} analyzed roles`,
      trend: highRiskRoles.length > impactScores.length * 0.3 ? 'up' : 'down',
      trendValue: `${Math.round((highRiskRoles.length / impactScores.length) * 100)}% of total`,
      color: '#EF4444',
      icon: '⚠️',
      tooltip: 'Roles with high disruption risk from AI advancement. These positions face significant automation pressure and require immediate attention.'
    });

    // Growth Opportunities
    const growthRoles = impactScores.filter(score => score.classification === 'growth');
    cards.push({
      id: 'growth-opportunities',
      title: 'Growth Opportunities',
      value: growthRoles.length,
      subtitle: `roles showing positive trends`,
      trend: growthRoles.length > 0 ? 'up' : 'stable',
      trendValue: `${Math.round((growthRoles.length / impactScores.length) * 100)}% of total`,
      color: '#10B981',
      icon: '📈',
      tooltip: 'Roles with strong growth potential that benefit from AI complementarity rather than replacement.'
    });

    // Selected Role Impact (if a role is selected)
    if (selectedRole) {
      const roleImpact = impactScores.find(score => score.roleId === selectedRole);
      const role = JOB_ROLES.find(r => r.id === selectedRole);
      
      if (roleImpact && role) {
        const riskConfig = RISK_LEVELS[roleImpact.riskLevel];
        cards.push({
          id: 'selected-role',
          title: `${role.name} Impact`,
          value: roleImpact.impactScore.toFixed(1),
          subtitle: `${riskConfig.label}`,
          trend: roleImpact.jobDemandChange > 0 ? 'up' : roleImpact.jobDemandChange < 0 ? 'down' : 'stable',
          trendValue: `${roleImpact.jobDemandChange >= 0 ? '+' : ''}${roleImpact.jobDemandChange.toFixed(1)}% job demand`,
          color: riskConfig.color,
          icon: riskConfig.emoji,
          tooltip: `Impact analysis for ${role.name}. Score combines AI growth rate (${roleImpact.aiGrowthRate.toFixed(1)}%) and job demand change (${roleImpact.jobDemandChange.toFixed(1)}%).`
        });
      }
    } else {
      // Average Impact Score
      const avgImpactScore = impactScores.length > 0 
        ? impactScores.reduce((sum, score) => sum + score.impactScore, 0) / impactScores.length 
        : 0;
      
      cards.push({
        id: 'average-impact',
        title: 'Average Impact Score',
        value: avgImpactScore.toFixed(1),
        subtitle: 'across all analyzed roles',
        trend: avgImpactScore > 0 ? 'up' : avgImpactScore < 0 ? 'down' : 'stable',
        trendValue: `Range: ${Math.min(...impactScores.map(s => s.impactScore)).toFixed(1)} to ${Math.max(...impactScores.map(s => s.impactScore)).toFixed(1)}`,
        color: '#6366F1',
        icon: '📊',
        tooltip: 'Average impact score across all analyzed roles. Higher scores indicate greater transformation pressure from AI advancement.'
      });
    }

    return cards;
  };

  const cards = calculateOverviewMetrics();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendClass = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-stable';
    }
  };

  return (
    <div className="overview-cards">
      {cards.map(card => (
        <div
          key={card.id}
          className={`overview-card ${hoveredCard === card.id ? 'hovered' : ''}`}
          style={{ '--card-color': card.color } as React.CSSProperties}
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          title={card.tooltip}
        >
          <div className="card-content">
            <div className="card-header">
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
            </div>
            
            <div className="card-value">
              {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
            </div>
            
            {card.subtitle && (
              <div className="card-subtitle">{card.subtitle}</div>
            )}
            
            {card.trend && card.trendValue && (
              <div className={`card-trend ${getTrendClass(card.trend)}`}>
                <span className="trend-icon">{getTrendIcon(card.trend)}</span>
                <span className="trend-text">{card.trendValue}</span>
              </div>
            )}
          </div>
          
          <div className="card-indicator" />
          
          {hoveredCard === card.id && (
            <div className="card-tooltip">
              <div className="tooltip-content">
                {card.tooltip}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;