import React, { useState } from 'react';
import { InsightPanelProps } from '../types';
import './InsightPanel.css';

export const InsightPanel: React.FC<InsightPanelProps> = ({
  insights,
  context,
  onInsightClick
}) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showActionableOnly, setShowActionableOnly] = useState(false);

  // Filter insights based on current filters
  const filteredInsights = insights.filter(insight => {
    if (filterType !== 'all' && insight.type !== filterType) {
      return false;
    }
    
    if (showActionableOnly && !insight.actionable) {
      return false;
    }
    
    return true;
  });

  // Sort insights by confidence and actionability
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    // Actionable insights first
    if (a.actionable !== b.actionable) {
      return a.actionable ? -1 : 1;
    }
    // Then by confidence
    return b.confidence - a.confidence;
  });

  const getInsightIcon = (type: string) => {
    const icons = {
      trend: '📈',
      comparison: '⚖️',
      prediction: '🔮',
      correlation: '🔗'
    };
    return icons[type as keyof typeof icons] || '💡';
  };

  const getInsightTypeColor = (type: string) => {
    const colors = {
      trend: '#3B82F6',
      comparison: '#8B5CF6',
      prediction: '#10B981',
      correlation: '#F59E0B'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { level: 'High', color: '#10B981' };
    if (confidence >= 0.6) return { level: 'Medium', color: '#F59E0B' };
    return { level: 'Low', color: '#EF4444' };
  };

  const handleInsightClick = (insightId: string) => {
    setExpandedInsight(expandedInsight === insightId ? null : insightId);
    onInsightClick(insightId);
  };

  const renderInsightCard = (insight: typeof insights[0]) => {
    const isExpanded = expandedInsight === insight.id;
    const confidenceInfo = getConfidenceLevel(insight.confidence);
    const typeColor = getInsightTypeColor(insight.type);

    return (
      <div
        key={insight.id}
        className={`insight-card ${isExpanded ? 'expanded' : ''} ${insight.actionable ? 'actionable' : ''}`}
        onClick={() => handleInsightClick(insight.id)}
      >
        <div className="insight-header">
          <div className="insight-meta">
            <span 
              className="insight-type-badge"
              style={{ backgroundColor: typeColor + '20', color: typeColor }}
            >
              <span className="type-icon">{getInsightIcon(insight.type)}</span>
              <span className="type-text">{insight.type.toUpperCase()}</span>
            </span>
            
            <div className="confidence-indicator">
              <span 
                className="confidence-badge"
                style={{ backgroundColor: confidenceInfo.color + '20', color: confidenceInfo.color }}
              >
                {Math.round(insight.confidence * 100)}% {confidenceInfo.level}
              </span>
            </div>
          </div>

          {insight.actionable && (
            <div className="actionable-indicator">
              <span className="actionable-badge">Actionable</span>
            </div>
          )}
        </div>

        <div className="insight-content">
          <h3 className="insight-title">{insight.title}</h3>
          <p className="insight-description">{insight.description}</p>

          {isExpanded && (
            <div className="insight-details">
              <div className="relevant-data">
                <h4>Related Data Points</h4>
                <div className="data-tags">
                  {insight.relevantData.map((dataPoint, index) => (
                    <span key={index} className="data-tag">
                      {dataPoint}
                    </span>
                  ))}
                </div>
              </div>

              <div className="insight-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Confidence Level:</span>
                  <span className="metadata-value">{confidenceInfo.level} ({Math.round(insight.confidence * 100)}%)</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Insight Type:</span>
                  <span className="metadata-value">{insight.type}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Actionable:</span>
                  <span className="metadata-value">{insight.actionable ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {insight.actionable && (
                <div className="action-suggestions">
                  <h4>Recommended Actions</h4>
                  <ul className="action-list">
                    {insight.type === 'trend' && (
                      <li>Monitor this trend closely for strategic planning</li>
                    )}
                    {insight.type === 'comparison' && (
                      <li>Consider the implications for role selection and career planning</li>
                    )}
                    {insight.type === 'prediction' && (
                      <li>Prepare for anticipated changes through upskilling or role transition</li>
                    )}
                    {insight.type === 'correlation' && (
                      <li>Use this relationship to inform decision-making processes</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="insight-footer">
          <button className="expand-button">
            {isExpanded ? 'Show Less' : 'Show More'}
            <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
          </button>
        </div>
      </div>
    );
  };

  const insightTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'trend', label: 'Trends' },
    { value: 'comparison', label: 'Comparisons' },
    { value: 'prediction', label: 'Predictions' },
    { value: 'correlation', label: 'Correlations' }
  ];

  return (
    <div className="insight-panel">
      <div className="panel-header">
        <div className="header-content">
          <h2>AI Workforce Insights</h2>
          <p>Data-driven insights and recommendations based on current analysis</p>
        </div>
        
        <div className="insight-stats">
          <div className="stat-item">
            <span className="stat-value">{insights.length}</span>
            <span className="stat-label">Total Insights</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {insights.filter(i => i.actionable).length}
            </span>
            <span className="stat-label">Actionable</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {insights.filter(i => i.confidence >= 0.8).length}
            </span>
            <span className="stat-label">High Confidence</span>
          </div>
        </div>
      </div>

      <div className="panel-controls">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="type-filter">Type:</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {insightTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showActionableOnly}
                onChange={(e) => setShowActionableOnly(e.target.checked)}
                className="filter-checkbox"
              />
              <span className="checkbox-text">Actionable Only</span>
            </label>
          </div>
        </div>

        <div className="view-options">
          <span className="results-count">
            Showing {sortedInsights.length} of {insights.length} insights
          </span>
        </div>
      </div>

      <div className="insights-container">
        {sortedInsights.length > 0 ? (
          <div className="insights-list">
            {sortedInsights.map(renderInsightCard)}
          </div>
        ) : (
          <div className="no-insights">
            <div className="no-insights-content">
              <span className="no-insights-icon">🔍</span>
              <h3>No insights match your filters</h3>
              <p>
                {insights.length === 0 
                  ? 'No insights available for the current selection. Try selecting different roles or time periods.'
                  : 'Try adjusting your filters to see more insights.'
                }
              </p>
              {insights.length > 0 && (
                <button 
                  onClick={() => {
                    setFilterType('all');
                    setShowActionableOnly(false);
                  }}
                  className="clear-filters-button"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {context.comparisonMode && (
        <div className="context-info">
          <div className="context-badge">
            <span className="context-icon">⚖️</span>
            <span className="context-text">
              Comparison Mode: Insights based on {context.selectedRoles.length} selected roles
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightPanel;