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
  x: number; // AI Growth Rate
  y: number; // Job Demand Change
  z: number; // Impact Score (for bubble size)
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

  // Prepare scatter plot data
  const scatterData: ScatterDataPoint[] = roles
    .map(role => {
      const jobRole = JOB_ROLES.find(jr => jr.id === role.roleId);
      if (!jobRole) return null;

      return {
        x: role.aiGrowthRate,
        y: role.jobDemandChange,
        z: Math.abs(role.impactScore) + 10, // Bubble size (min 10 for visibility)
        roleId: role.roleId,
        roleName: jobRole.name,
        riskLevel: role.riskLevel as string,
        classification: role.classification as string,
        category: jobRole.category as string
      };
    })
    .filter((item): item is ScatterDataPoint => item !== null)
    .filter(item => {
      if (filterRisk !== 'all' && item.riskLevel !== filterRisk) return false;
      if (filterClassification !== 'all' && item.classification !== filterClassification) return false;
      return true;
    });

  // Group data by classification for different scatter series
  const dataByClassification = {
    growth: scatterData.filter(d => d.classification === 'growth'),
    transition: scatterData.filter(d => d.classification === 'transition'),
    disruption: scatterData.filter(d => d.classification === 'disruption')
  };

  // Get color for classification
  const getClassificationColor = (classification: string) => {
    return CLASSIFICATIONS[classification as keyof typeof CLASSIFICATIONS]?.color || '#6B7280';
  };

  // Custom tooltip
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
            {riskConfig.emoji} {riskConfig.label}
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
              style={{ backgroundColor: classificationConfig.color }}
            />
            <span className="classification-text">{classificationConfig.label}</span>
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

  // Calculate quadrant statistics
  const quadrantStats = {
    highGrowthHighDemand: scatterData.filter(d => d.x > 0 && d.y > 0).length,
    highGrowthLowDemand: scatterData.filter(d => d.x > 0 && d.y <= 0).length,
    lowGrowthHighDemand: scatterData.filter(d => d.x <= 0 && d.y > 0).length,
    lowGrowthLowDemand: scatterData.filter(d => d.x <= 0 && d.y <= 0).length
  };

  return (
    <div className="impact-score-chart">
      {/* NUCLEAR SUCCESS INDICATOR - FORCE VISIBLE CHANGES */}
      <div style={{
        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.3rem',
        border: '3px solid #ffffff',
        boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
        animation: 'pulse 2s infinite',
        zIndex: 9999,
        position: 'relative'
      }}>
        🚀 NUCLEAR FIX APPLIED - CHART COMPLETELY REBUILT - {new Date().toLocaleTimeString()}
      </div>

      <div className="chart-header">
        <div className="header-content">
          <div className="chart-title-section">
            <h3 className="chart-main-title">
              <span className="title-icon">🤖</span>
              AI Impact vs Job Market Analysis
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
        <ResponsiveContainer width="100%" height={800}>
          <ScatterChart
            margin={{ top: 80, right: 80, bottom: 180, left: 180 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border-secondary)"
            />
            
            <XAxis
              type="number"
              dataKey="x"
              name="AI Growth Rate"
              unit="%"
              stroke="#000000"
              fontSize={16}
              tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
              label={{ 
                value: '🤖 AI GROWTH RATE (%) - NUCLEAR FIXED 🤖', 
                position: 'insideBottom', 
                offset: -80,
                style: { 
                  textAnchor: 'middle', 
                  fill: '#000000',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }
              }}
            />
            
            <YAxis
              type="number"
              dataKey="y"
              name="Job Demand Change"
              unit="%"
              stroke="#000000"
              fontSize={16}
              tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
              label={{ 
                value: '💼 JOB DEMAND CHANGE (%) - NUCLEAR FIXED 💼', 
                angle: -90, 
                position: 'insideLeft',
                offset: 80,
                style: { 
                  textAnchor: 'middle', 
                  fill: '#000000',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }
              }}
            />

            {/* Reference lines for quadrants */}
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

            {/* Scatter plots by classification */}
            {Object.entries(dataByClassification).map(([classification, data]) => (
              <Scatter
                key={classification}
                name={CLASSIFICATIONS[classification as keyof typeof CLASSIFICATIONS].label}
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

      <div className="chart-analysis">
        <div className="quadrant-analysis">
          <h4>Quadrant Analysis</h4>
          <div className="quadrants-grid">
            <div className="quadrant high-ai-high-job">
              <div className="quadrant-header">
                <span className="quadrant-title">High AI + High Job Demand</span>
                <span className="quadrant-count">{quadrantStats.highGrowthHighDemand}</span>
              </div>
              <p className="quadrant-description">
                Roles benefiting from AI growth with strong job market demand
              </p>
            </div>
            
            <div className="quadrant high-ai-low-job">
              <div className="quadrant-header">
                <span className="quadrant-title">High AI + Low Job Demand</span>
                <span className="quadrant-count">{quadrantStats.highGrowthLowDemand}</span>
              </div>
              <p className="quadrant-description">
                Roles facing potential disruption from AI advancement
              </p>
            </div>
            
            <div className="quadrant low-ai-high-job">
              <div className="quadrant-header">
                <span className="quadrant-title">Low AI + High Job Demand</span>
                <span className="quadrant-count">{quadrantStats.lowGrowthHighDemand}</span>
              </div>
              <p className="quadrant-description">
                Traditional roles with growing demand, less AI impact
              </p>
            </div>
            
            <div className="quadrant low-ai-low-job">
              <div className="quadrant-header">
                <span className="quadrant-title">Low AI + Low Job Demand</span>
                <span className="quadrant-count">{quadrantStats.lowGrowthLowDemand}</span>
              </div>
              <p className="quadrant-description">
                Roles with declining demand and minimal AI influence
              </p>
            </div>
          </div>
        </div>

        <div className="chart-legend-extended">
          <h4>Classification Legend</h4>
          <div className="legend-items">
            {Object.entries(CLASSIFICATIONS).map(([key, classification]) => (
              <div key={key} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: classification.color }}
                />
                <div className="legend-content">
                  <span className="legend-title">{classification.label}</span>
                  <span className="legend-description">{classification.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactScoreChart;