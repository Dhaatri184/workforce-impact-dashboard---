import React, { useEffect, useRef } from 'react';
import { formatDate, formatNumber, formatPercentage } from '../utils';
import { animateTooltip } from '../utils/animations';
import './ChartTooltip.css';

export interface TooltipData {
  label?: string;
  value?: number | string;
  color?: string;
  unit?: string;
  confidence?: number;
  isEstimated?: boolean;
  metadata?: Record<string, any>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  coordinate?: { x: number; y: number };
  data?: any;
  formatter?: (value: any, name: string, props: any) => [React.ReactNode, string];
  labelFormatter?: (label: any) => React.ReactNode;
  separator?: string;
  wrapperStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  cursor?: boolean;
  isAnimationActive?: boolean;
  animationDuration?: number;
  position?: { x?: number; y?: number };
  allowEscapeViewBox?: { x?: boolean; y?: boolean };
  offset?: number;
  filterNull?: boolean;
  useTranslate3d?: boolean;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active = false,
  payload = [],
  label,
  data,
  formatter,
  labelFormatter,
  separator = ' : ',
  isAnimationActive = true,
  animationDuration = 150
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipRef.current && isAnimationActive) {
      animateTooltip(tooltipRef.current, active);
    }
  }, [active, isAnimationActive]);

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const renderLabel = () => {
    if (labelFormatter) {
      return labelFormatter(label);
    }
    
    if (label) {
      // Try to parse as date first
      const date = new Date(label);
      if (!isNaN(date.getTime()) && typeof label === 'string' && label.includes('-')) {
        return formatDate(date, 'medium');
      }
      return label;
    }
    
    return null;
  };

  const renderPayloadItem = (entry: any, index: number) => {
    const { value, name, color, payload: itemPayload } = entry;
    
    if (formatter) {
      const [formattedValue, formattedName] = formatter(value, name, entry);
      return (
        <div key={index} className="tooltip-item">
          <div className="tooltip-color" style={{ backgroundColor: color }} />
          <span className="tooltip-name">{formattedName}</span>
          <span className="tooltip-separator">{separator}</span>
          <span className="tooltip-value">{formattedValue}</span>
        </div>
      );
    }

    // Default formatting
    let formattedValue: string;
    let unit = '';
    
    if (typeof value === 'number') {
      if (name.toLowerCase().includes('percentage') || name.toLowerCase().includes('rate') || name.toLowerCase().includes('change')) {
        formattedValue = formatPercentage(value, 1);
      } else if (name.toLowerCase().includes('score')) {
        formattedValue = value.toFixed(1);
      } else {
        formattedValue = formatNumber(value);
      }
    } else {
      formattedValue = String(value);
    }

    // Check for confidence and estimation indicators
    const confidence = itemPayload?.confidence;
    const isEstimated = itemPayload?.isEstimated;

    return (
      <div key={index} className="tooltip-item">
        <div className="tooltip-color" style={{ backgroundColor: color }} />
        <span className="tooltip-name">{name}</span>
        <span className="tooltip-separator">{separator}</span>
        <span className="tooltip-value">
          {formattedValue}{unit}
          {isEstimated && <span className="estimated-indicator" title="Estimated value">*</span>}
        </span>
        {confidence && (
          <span className="confidence-indicator" title={`${Math.round(confidence * 100)}% confidence`}>
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </div>
    );
  };

  const renderInsights = () => {
    if (!data || !data.insights) return null;

    return (
      <div className="tooltip-insights">
        <div className="insights-header">Key Insights</div>
        {data.insights.slice(0, 2).map((insight: string, index: number) => (
          <div key={index} className="insight-item">
            <span className="insight-bullet">•</span>
            <span className="insight-text">{insight}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderMetadata = () => {
    if (!data || !data.metadata) return null;

    const { lastUpdated, dataSource, quality } = data.metadata;

    return (
      <div className="tooltip-metadata">
        {lastUpdated && (
          <div className="metadata-item">
            <span className="metadata-label">Updated:</span>
            <span className="metadata-value">{formatDate(new Date(lastUpdated), 'short')}</span>
          </div>
        )}
        {dataSource && (
          <div className="metadata-item">
            <span className="metadata-label">Source:</span>
            <span className="metadata-value">{dataSource}</span>
          </div>
        )}
        {quality && (
          <div className="metadata-item">
            <span className="metadata-label">Quality:</span>
            <span className={`metadata-value quality-${quality.toLowerCase()}`}>
              {quality}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={tooltipRef} className="chart-tooltip">
      <div className="tooltip-content">
        {renderLabel() && (
          <div className="tooltip-header">
            <span className="tooltip-label">{renderLabel()}</span>
          </div>
        )}
        
        <div className="tooltip-body">
          {payload.map((entry, index) => renderPayloadItem(entry, index))}
        </div>

        {renderInsights()}
        {renderMetadata()}

        {payload.some(entry => entry.payload?.isEstimated) && (
          <div className="tooltip-footer">
            <span className="estimated-note">* Estimated values based on available data</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized tooltip components for different chart types

export const TimeSeriesTooltip: React.FC<ChartTooltipProps> = (props) => {
  const timeFormatter = (label: any) => {
    const date = new Date(label);
    return formatDate(date, 'medium');
  };

  const valueFormatter = (value: any, name: string) => {
    if (name.includes('Growth') || name.includes('Change')) {
      return [formatPercentage(value, 1), name];
    }
    return [formatNumber(value), name];
  };

  return (
    <ChartTooltip
      {...props}
      labelFormatter={timeFormatter}
      formatter={valueFormatter}
    />
  );
};

export const ImpactScoreTooltip: React.FC<ChartTooltipProps> = (props) => {
  const valueFormatter = (value: any, name: string) => {
    if (name.includes('Rate') || name.includes('Change')) {
      return [formatPercentage(value, 1), name];
    }
    if (name.includes('Score')) {
      return [value.toFixed(1), name];
    }
    return [formatNumber(value), name];
  };

  return (
    <ChartTooltip
      {...props}
      formatter={valueFormatter}
    />
  );
};

export const ComparisonTooltip: React.FC<ChartTooltipProps> = (props) => {
  const valueFormatter = (value: any, name: string) => {
    // Handle different metric types
    if (name.includes('Impact') || name.includes('Growth')) {
      return [formatPercentage(value, 1), name];
    }
    if (name.includes('Score')) {
      return [value.toFixed(1), name];
    }
    if (name.includes('Stability') || name.includes('Potential')) {
      return [`${value}/100`, name];
    }
    return [formatNumber(value), name];
  };

  return (
    <ChartTooltip
      {...props}
      formatter={valueFormatter}
    />
  );
};

export default ChartTooltip;