import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { TimeSeriesPoint, AIGrowthData, JobRoleData } from '../types';
import { formatDate, formatNumber, formatPercentage, animateChartEntry, animateDataUpdate } from '../utils';
import { TimeSeriesTooltip } from './ChartTooltip';
import './TimeSeriesChart.css';

interface TimeSeriesChartProps {
  aiData?: AIGrowthData | null;
  jobData?: JobRoleData[];
  selectedRoles?: string[];
  timeRange: [Date, Date];
  showAIData?: boolean;
  showJobData?: boolean;
  height?: number;
  syncId?: string;
}

interface ChartDataPoint {
  timestamp: number;
  date: string;
  aiGrowth?: number;
  aiConfidence?: number;
  [key: string]: any; // For dynamic job role data
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  aiData,
  jobData = [],
  selectedRoles = [],
  timeRange,
  showAIData = true,
  showJobData = true,
  height = 400,
  syncId
}) => {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Animate chart entry
  React.useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      animateChartEntry(chartRef.current);
    }
  }, []);

  // Animate data updates
  React.useEffect(() => {
    if (chartRef.current) {
      animateDataUpdate(chartRef.current);
    }
  }, [aiData, jobData, selectedRoles]);

  // Process and combine data for the chart
  const chartData = useMemo(() => {
    const dataMap = new Map<number, ChartDataPoint>();

    // Add AI data
    if (showAIData && aiData) {
      aiData.timeSeriesData.forEach(point => {
        const timestamp = point.timestamp.getTime();
        const existing = dataMap.get(timestamp) || {
          timestamp,
          date: formatDate(point.timestamp, 'short')
        };
        
        existing.aiGrowth = point.value;
        existing.aiConfidence = point.confidence;
        existing.aiEstimated = point.isEstimated;
        
        dataMap.set(timestamp, existing);
      });
    }

    // Add job data for selected roles
    if (showJobData && jobData.length > 0) {
      jobData.forEach(roleData => {
        if (selectedRoles.length === 0 || selectedRoles.includes(roleData.roleId)) {
          roleData.timeSeriesData.forEach(point => {
            const timestamp = point.timestamp.getTime();
            const existing = dataMap.get(timestamp) || {
              timestamp,
              date: formatDate(point.timestamp, 'short')
            };
            
            existing[`job_${roleData.roleId}`] = point.value;
            existing[`job_${roleData.roleId}_confidence`] = point.confidence;
            existing[`job_${roleData.roleId}_estimated`] = point.isEstimated;
            
            dataMap.set(timestamp, existing);
          });
        }
      });
    }

    // Convert to array and sort by timestamp
    return Array.from(dataMap.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [aiData, jobData, selectedRoles, showAIData, showJobData]);

  // Generate colors for different lines
  const getLineColor = (key: string, index: number) => {
    const colors = [
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#10B981', // Green
      '#F59E0B', // Orange
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#EC4899', // Pink
    ];
    
    if (key === 'aiGrowth') return '#8B5CF6';
    return colors[index % colors.length];
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const date = new Date(data.timestamp);

    return (
      <div className="chart-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-date">{formatDate(date, 'medium')}</span>
        </div>
        <div className="tooltip-content">
          {payload.map((entry: any, index: number) => {
            const isEstimated = data[`${entry.dataKey}_estimated`];
            const confidence = data[`${entry.dataKey}_confidence`];
            
            return (
              <div key={index} className="tooltip-item">
                <div 
                  className="tooltip-color"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="tooltip-label">{entry.name}:</span>
                <span className="tooltip-value">
                  {entry.dataKey === 'aiGrowth' 
                    ? formatNumber(entry.value)
                    : formatNumber(entry.value)
                  }
                  {isEstimated && <span className="estimated-indicator">*</span>}
                </span>
                {confidence && (
                  <span className="confidence-indicator">
                    ({Math.round(confidence * 100)}% confidence)
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="tooltip-footer">
          <span className="estimated-note">* Estimated values</span>
        </div>
      </div>
    );
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <div className="chart-legend">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenLines.has(entry.dataKey);
          const isHovered = hoveredLine === entry.dataKey;
          
          return (
            <div
              key={index}
              className={`legend-item ${isHidden ? 'hidden' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => {
                const newHidden = new Set(hiddenLines);
                if (isHidden) {
                  newHidden.delete(entry.dataKey);
                } else {
                  newHidden.add(entry.dataKey);
                }
                setHiddenLines(newHidden);
              }}
              onMouseEnter={() => setHoveredLine(entry.dataKey)}
              onMouseLeave={() => setHoveredLine(null)}
            >
              <div 
                className="legend-color"
                style={{ backgroundColor: entry.color }}
              />
              <span className="legend-text">{entry.value}</span>
              <span className="legend-toggle">
                {isHidden ? '👁️‍🗨️' : '👁️'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return formatNumber(value);
  };

  // Format X-axis ticks
  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    return formatDate(date, 'short');
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container empty">
        <div className="empty-chart">
          <div className="empty-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Select roles and time periods to view trend analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="chart-container">
      <div className="chart-header">
        <h3>Workforce Trends Over Time</h3>
        <div className="chart-controls">
          <button
            className={`control-button ${showAIData ? 'active' : ''}`}
            onClick={() => {/* Toggle AI data visibility */}}
            title="Toggle AI Growth Data"
          >
            AI Growth
          </button>
          <button
            className={`control-button ${showJobData ? 'active' : ''}`}
            onClick={() => {/* Toggle Job data visibility */}}
            title="Toggle Job Market Data"
          >
            Job Market
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            syncId={syncId}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)"
              horizontal={true}
              vertical={false}
            />
            
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxis}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis
              tickFormatter={formatYAxis}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
            />
            
            <Tooltip content={<TimeSeriesTooltip />} />
            
            <Legend content={<CustomLegend />} />

            {/* Zero reference line */}
            <ReferenceLine 
              y={0} 
              stroke="rgba(255, 255, 255, 0.3)" 
              strokeDasharray="2 2"
            />

            {/* AI Growth Line */}
            {showAIData && aiData && !hiddenLines.has('aiGrowth') && (
              <Line
                type="monotone"
                dataKey="aiGrowth"
                name="AI Repository Growth"
                stroke={getLineColor('aiGrowth', 0)}
                strokeWidth={hoveredLine === 'aiGrowth' ? 3 : 2}
                dot={{ fill: getLineColor('aiGrowth', 0), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getLineColor('aiGrowth', 0), strokeWidth: 2 }}
                connectNulls={false}
                opacity={hoveredLine && hoveredLine !== 'aiGrowth' ? 0.3 : 1}
              />
            )}

            {/* Job Market Lines */}
            {showJobData && jobData.map((roleData, index) => {
              if (selectedRoles.length > 0 && !selectedRoles.includes(roleData.roleId)) {
                return null;
              }
              
              const dataKey = `job_${roleData.roleId}`;
              if (hiddenLines.has(dataKey)) return null;

              return (
                <Line
                  key={roleData.roleId}
                  type="monotone"
                  dataKey={dataKey}
                  name={roleData.roleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  stroke={getLineColor(dataKey, index + 1)}
                  strokeWidth={hoveredLine === dataKey ? 3 : 2}
                  dot={{ fill: getLineColor(dataKey, index + 1), strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: getLineColor(dataKey, index + 1), strokeWidth: 2 }}
                  connectNulls={false}
                  opacity={hoveredLine && hoveredLine !== dataKey ? 0.3 : 1}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer">
        <div className="chart-info">
          <span className="data-points">
            {chartData.length} data points from {formatDate(new Date(chartData[0]?.timestamp), 'short')} to {formatDate(new Date(chartData[chartData.length - 1]?.timestamp), 'short')}
          </span>
        </div>
        <div className="chart-actions">
          <button 
            className="action-button"
            onClick={() => setHiddenLines(new Set())}
            title="Show all lines"
          >
            Show All
          </button>
          <button 
            className="action-button"
            onClick={() => {/* Export chart */}}
            title="Export chart data"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;