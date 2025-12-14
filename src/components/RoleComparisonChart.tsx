import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { JobRoleImpact } from '../types';
import { JOB_ROLES, RISK_LEVELS } from '../utils/constants';
import { formatPercentage } from '../utils';
import './RoleComparisonChart.css';

interface RoleComparisonChartProps {
  primaryRole: JobRoleImpact;
  secondaryRole?: JobRoleImpact;
  chartType?: 'radar' | 'bar';
}

export const RoleComparisonChart: React.FC<RoleComparisonChartProps> = ({
  primaryRole,
  secondaryRole,
  chartType = 'radar'
}) => {
  // Prepare data for radar chart
  const radarData = [
    {
      metric: 'AI Growth Impact',
      primary: Math.abs(primaryRole.aiGrowthRate),
      secondary: secondaryRole ? Math.abs(secondaryRole.aiGrowthRate) : 0,
      max: 100
    },
    {
      metric: 'Job Demand Change',
      primary: primaryRole.jobDemandChange + 50, // Normalize to positive scale
      secondary: secondaryRole ? secondaryRole.jobDemandChange + 50 : 0,
      max: 100
    },
    {
      metric: 'Impact Score',
      primary: Math.abs(primaryRole.impactScore),
      secondary: secondaryRole ? Math.abs(secondaryRole.impactScore) : 0,
      max: 100
    },
    {
      metric: 'Market Stability',
      primary: primaryRole.riskLevel === 'low' ? 80 : primaryRole.riskLevel === 'medium' ? 50 : 20,
      secondary: secondaryRole 
        ? (secondaryRole.riskLevel === 'low' ? 80 : secondaryRole.riskLevel === 'medium' ? 50 : 20)
        : 0,
      max: 100
    },
    {
      metric: 'Growth Potential',
      primary: primaryRole.classification === 'growth' ? 90 : primaryRole.classification === 'transition' ? 60 : 30,
      secondary: secondaryRole 
        ? (secondaryRole.classification === 'growth' ? 90 : secondaryRole.classification === 'transition' ? 60 : 30)
        : 0,
      max: 100
    }
  ];

  // Prepare data for bar chart
  const barData = [
    {
      name: 'AI Growth Rate',
      primary: primaryRole.aiGrowthRate,
      secondary: secondaryRole?.aiGrowthRate || 0,
      unit: '%'
    },
    {
      name: 'Job Demand Change',
      primary: primaryRole.jobDemandChange,
      secondary: secondaryRole?.jobDemandChange || 0,
      unit: '%'
    },
    {
      name: 'Impact Score',
      primary: primaryRole.impactScore,
      secondary: secondaryRole?.impactScore || 0,
      unit: ''
    }
  ];

  const primaryRoleInfo = JOB_ROLES.find(r => r.id === primaryRole.roleId);
  const secondaryRoleInfo = secondaryRole ? JOB_ROLES.find(r => r.id === secondaryRole.roleId) : null;

  const primaryColor = '#3B82F6';
  const secondaryColor = '#8B5CF6';

  // Custom tooltip for radar chart
  const RadarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="comparison-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-metric">{label}</span>
        </div>
        <div className="tooltip-content">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="tooltip-item">
              <div 
                className="tooltip-color"
                style={{ backgroundColor: entry.color }}
              />
              <span className="tooltip-label">
                {entry.dataKey === 'primary' ? primaryRoleInfo?.name : secondaryRoleInfo?.name}:
              </span>
              <span className="tooltip-value">
                {entry.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="comparison-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-metric">{label}</span>
        </div>
        <div className="tooltip-content">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="tooltip-item">
              <div 
                className="tooltip-color"
                style={{ backgroundColor: entry.color }}
              />
              <span className="tooltip-label">
                {entry.dataKey === 'primary' ? primaryRoleInfo?.name : secondaryRoleInfo?.name}:
              </span>
              <span className="tooltip-value">
                {entry.value.toFixed(1)}{data.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
        <PolarGrid 
          stroke="rgba(255, 255, 255, 0.2)"
          gridType="polygon"
        />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.8)' }}
          className="radar-axis"
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.6)' }}
          tickCount={5}
        />
        <Radar
          name={primaryRoleInfo?.name || 'Primary Role'}
          dataKey="primary"
          stroke={primaryColor}
          fill={primaryColor}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
        />
        {secondaryRole && (
          <Radar
            name={secondaryRoleInfo?.name || 'Secondary Role'}
            dataKey="secondary"
            stroke={secondaryColor}
            fill={secondaryColor}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
          />
        )}
        <Tooltip content={<RadarTooltip />} />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={barData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255, 255, 255, 0.1)"
          horizontal={true}
          vertical={false}
        />
        <XAxis 
          dataKey="name" 
          stroke="rgba(255, 255, 255, 0.7)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="rgba(255, 255, 255, 0.7)"
          fontSize={12}
        />
        <Tooltip content={<BarTooltip />} />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}
        />
        <Bar 
          dataKey="primary" 
          name={primaryRoleInfo?.name || 'Primary Role'}
          fill={primaryColor}
          radius={[4, 4, 0, 0]}
        />
        {secondaryRole && (
          <Bar 
            dataKey="secondary" 
            name={secondaryRoleInfo?.name || 'Secondary Role'}
            fill={secondaryColor}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="role-comparison-chart">
      <div className="chart-header">
        <div className="header-content">
          <h3>Role Comparison Analysis</h3>
          <p>
            {secondaryRole 
              ? `Comparing ${primaryRoleInfo?.name} vs ${secondaryRoleInfo?.name}`
              : `Analysis for ${primaryRoleInfo?.name}`
            }
          </p>
        </div>
        
        <div className="chart-type-selector">
          <button 
            className={`type-button ${chartType === 'radar' ? 'active' : ''}`}
            onClick={() => {/* Switch to radar chart */}}
            title="Radar Chart View"
          >
            🎯 Radar
          </button>
          <button 
            className={`type-button ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => {/* Switch to bar chart */}}
            title="Bar Chart View"
          >
            📊 Bars
          </button>
        </div>
      </div>

      <div className="chart-content">
        {chartType === 'radar' ? renderRadarChart() : renderBarChart()}
      </div>

      <div className="chart-summary">
        <div className="role-summaries">
          <div className="role-summary primary">
            <div className="summary-header">
              <h4>{primaryRoleInfo?.name}</h4>
              <div className={`risk-indicator ${primaryRole.riskLevel}`}>
                {RISK_LEVELS[primaryRole.riskLevel].emoji} {RISK_LEVELS[primaryRole.riskLevel].label}
              </div>
            </div>
            <div className="summary-metrics">
              <div className="metric">
                <span className="metric-label">AI Impact:</span>
                <span className="metric-value">{formatPercentage(primaryRole.aiGrowthRate, 1)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Job Demand:</span>
                <span className={`metric-value ${primaryRole.jobDemandChange >= 0 ? 'positive' : 'negative'}`}>
                  {primaryRole.jobDemandChange >= 0 ? '+' : ''}{formatPercentage(primaryRole.jobDemandChange, 1)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Impact Score:</span>
                <span className="metric-value">{primaryRole.impactScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {secondaryRole && secondaryRoleInfo && (
            <div className="role-summary secondary">
              <div className="summary-header">
                <h4>{secondaryRoleInfo.name}</h4>
                <div className={`risk-indicator ${secondaryRole.riskLevel}`}>
                  {RISK_LEVELS[secondaryRole.riskLevel].emoji} {RISK_LEVELS[secondaryRole.riskLevel].label}
                </div>
              </div>
              <div className="summary-metrics">
                <div className="metric">
                  <span className="metric-label">AI Impact:</span>
                  <span className="metric-value">{formatPercentage(secondaryRole.aiGrowthRate, 1)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Job Demand:</span>
                  <span className={`metric-value ${secondaryRole.jobDemandChange >= 0 ? 'positive' : 'negative'}`}>
                    {secondaryRole.jobDemandChange >= 0 ? '+' : ''}{formatPercentage(secondaryRole.jobDemandChange, 1)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Impact Score:</span>
                  <span className="metric-value">{secondaryRole.impactScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {secondaryRole && (
          <div className="comparison-insights">
            <h4>Key Differences</h4>
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-label">Impact Score Difference:</span>
                <span className="insight-value">
                  {Math.abs(primaryRole.impactScore - secondaryRole.impactScore).toFixed(1)} points
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Job Demand Gap:</span>
                <span className="insight-value">
                  {formatPercentage(Math.abs(primaryRole.jobDemandChange - secondaryRole.jobDemandChange), 1)}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Risk Level Comparison:</span>
                <span className="insight-value">
                  {primaryRole.riskLevel === secondaryRole.riskLevel 
                    ? 'Similar risk levels' 
                    : `${primaryRole.riskLevel} vs ${secondaryRole.riskLevel}`
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleComparisonChart;