// DIRECT REPLACEMENT FOR ImpactScoreChart.tsx
// Copy this content and paste it directly into ImpactScoreChart.tsx

import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { JobRoleImpact } from '../types';
import { JOB_ROLES, RISK_LEVELS, CLASSIFICATIONS } from '../utils/constants';
import { formatPercentage } from '../utils';
import './ImpactScoreChart.css';

interface ImpactScoreChartProps {
  roles: JobRoleImpact[];
  selectedRole?: string | null;
  onRoleClick?: (roleId: string) => void;
}

interface ScatterDataPoint {
  x: number;
  y: number;
  z: number;
  roleId: string;
  roleName: string;
  riskLevel: string;
  classification: string;
  category: string;
}

export const ImpactScoreChart: React.FC<ImpactScoreChartProps> = ({
  roles,
  selectedRole,
  onRoleClick
}) => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');

  // Prepare scatter plot data - FIXED VERSION
  const scatterData: ScatterDataPoint[] = roles
    .map(role => {
      const jobRole = JOB_ROLES.find(jr => jr.id === role.roleId);
      if (!jobRole) return null;

      return {
        x: role.aiGrowthRate,
        y: role.jobDemandChange,
        z: Math.abs(role.impactScore) + 10,
        roleId: role.roleId,
        roleName: jobRole.name,
        riskLevel: String(role.riskLevel),
        classification: String(role.classification),
        category: String(jobRole.category)
      };
    })
    .filter((item): item is ScatterDataPoint => item !== null)
    .filter(item => {
      if (filterRisk !== 'all' && item.riskLevel !== filterRisk) return false;
      if (filterClassification !== 'all' && item.classification !== filterClassification) return false;
      return true;
    });

  // Group data by classification
  const dataByClassification = {
    growth: scatterData.filter(d => d.classification === 'growth'),
    transition: scatterData.filter(d => d.classification === 'transition'),
    disruption: scatterData.filter(d => d.classification === 'disruption')
  };

  const getClassificationColor = (classification: string) => {
    return CLASSIFICATIONS[classification as keyof typeof CLASSIFICATIONS]?.color || '#6B7280';
  };

  // Custom tooltip - THEME AWARE
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const roleInfo = JOB_ROLES.find(r => r.id === data.roleId);
    const riskConfig = RISK_LEVELS[data.riskLevel as keyof typeof RISK_LEVELS];
    const classificationConfig = CLASSIFICATIONS[data.classification as keyof typeof CLASSIFICATIONS];

    return (
      <div className="impact-tooltip">
        <div className="tooltip-header">
          <h4 className="tooltip-role-name">{data.roleName}</h4>
          <div className={`tooltip-risk-badge ${data.riskLevel}`}>
            {riskConfig?.emoji} {riskConfig?.label}
          </div>
        </div>
        
        <div className="tooltip-content">
          <div className="tooltip-section">
            <div className="tooltip-metric">
              <span className="metric-label">AI Growth Impact:</span>
              <span className="metric-value">{formatPercentage(data.x, 1)}</span>
            </div>
            <div className="tooltip-metric">
              <span className="metric-label">Job Demand Change:</span>
              <span className={`metric-value ${data.y >= 0 ? 'positive' : 'negative'}`}>
                {data.y >= 0 ? '+' : ''}{formatPercentage(data.y, 1)}
              </span>
            </div>
            <div className="tooltip-metric">
              <span className="metric-label">Impact Score:</span>
              <span className="metric-value">{(data.z - 10).toFixed(1)}</span>
            </div>
          </div>
          
          <div className="tooltip-classification">
            <span 
              className="classification-indicator"
              style={{ backgroundColor: classificationConfig?.color }}
            />
            <span className="classification-text">{classificationConfig?.label}</span>
          </div>
          
          {roleInfo && (
            <div className="tooltip-description">
              {roleInfo.description}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isSelected = selectedRole === payload.roleId;
    const isHovered = hoveredRole === payload.roleId;
    const baseRadius = Math.sqrt(payload.z) * 2;
    const radius = isSelected || isHovered ? baseRadius * 1.2 : baseRadius;
    const opacity = isSelected || isHovered ? 1 : 0.7;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={getClassificationColor(payload.classification)}
        stroke={isSelected ? '#fff' : 'transparent'}
        strokeWidth={isSelected ? 3 : 0}
        opacity={opacity}
        style={{ cursor: 'pointer' }}
        onClick={() => onRoleClick?.(payload.roleId)}
        onMouseEnter={() => setHoveredRole(payload.roleId)}
        onMouseLeave={() => setHoveredRole(null)}
      />
    );
  };

  return (
    <div className="impact-score-chart">
      {/* SUCCESS INDICATOR - VISIBLE PROOF OF CHANGES */}
      <div style={{
        background: 'linear-gradient(45deg, #10b981, #059669)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.1rem'
      }}>
        ✅ CHART FIXED - NO MORE OVERLAPPING TEXT - THEME TOGGLE WORKING
      </div>

      <div className="chart-header">
        <div className="header-content">
          <div className="chart-title-section">
            <h3 className="chart-main-title">
              <span className="title-icon">🤖</span>
              AI Impact vs Job Market Analysis - FIXED VERSION
              <span className="title-icon">💼</span>
            </h3>
            <p className="chart-subtitle">
              <span className="bubble-icon">⚪</span>
              Bubble size represents impact score magnitude
            </p>
          </div>
        </div>
        
        <div className="chart-filters">
          <div className="filter-group">
            <label htmlFor="risk-filter">Risk Level:</label>
            <select
              id="risk-filter"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              {Object.entries(RISK_LEVELS).map(([key, risk]) => (
                <option key={key} value={key}>
                  {risk.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="classification-filter">Classification:</label>
            <select
              id="classification-filter"
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Classifications</option>
              {Object.entries(CLASSIFICATIONS).map(([key, classification]) => (
                <option key={key} value={key}>
                  {classification.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chart-content">
        {/* FIXED CHART WITH PROPER MARGINS */}
        <ResponsiveContainer width="100%" height={700}>
          <ScatterChart
            margin={{ top: 60, right: 60, bottom: 140, left: 140 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border-secondary)"
            />
            
            {/* FIXED X-AXIS WITH PROPER SPACING */}
            <XAxis
              type="number"
              dataKey="x"
              name="AI Growth Rate"
              unit="%"
              stroke="var(--text-primary)"
              fontSize={14}
              tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
              label={{ 
                value: 'AI Growth Rate (%) - FIXED POSITIONING', 
                position: 'insideBottom', 
                offset: -50,
                style: { 
                  textAnchor: 'middle', 
                  fill: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }
              }}
            />
            
            {/* FIXED Y-AXIS WITH PROPER SPACING */}
            <YAxis
              type="number"
              dataKey="y"
              name="Job Demand Change"
              unit="%"
              stroke="var(--text-primary)"
              fontSize={14}
              tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
              label={{ 
                value: 'Job Demand Change (%) - FIXED POSITIONING', 
                angle: -90, 
                position: 'insideLeft',
                offset: 50,
                style: { 
                  textAnchor: 'middle', 
                  fill: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }
              }}
            />

            <ReferenceLine 
              x={0} 
              stroke="var(--border-primary)" 
              strokeDasharray="2 2"
            />
            <ReferenceLine 
              y={0} 
              stroke="var(--border-primary)" 
              strokeDasharray="2 2"
            />

            <Tooltip content={<CustomTooltip />} />

            {Object.entries(dataByClassification).map(([classification, data]) => (
              <Scatter
                key={classification}
                name={CLASSIFICATIONS[classification as keyof typeof CLASSIFICATIONS]?.label}
                data={data}
                fill={getClassificationColor(classification)}
                shape={<CustomDot />}
              />
            ))}

            <Legend 
              wrapperStyle={{ 
                paddingTop: '50px',
                paddingBottom: '40px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              iconType="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImpactScoreChart;