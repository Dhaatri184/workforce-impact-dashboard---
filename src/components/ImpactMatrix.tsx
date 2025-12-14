import React, { useState, useMemo } from 'react';
import { ImpactMatrixProps } from '../types';
import { JOB_ROLES, RISK_LEVELS, CLASSIFICATIONS, JOB_CATEGORIES } from '../utils/constants';
import { formatPercentage } from '../utils';
import './ImpactMatrix.css';

export const ImpactMatrix: React.FC<ImpactMatrixProps> = ({
  roles,
  sortBy,
  sortOrder,
  onRoleClick
}) => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  // Filter and sort roles
  const processedRoles = useMemo(() => {
    let filtered = roles.filter(role => {
      const jobRole = JOB_ROLES.find(jr => jr.id === role.roleId);
      if (!jobRole) return false;

      // Category filter
      if (filterCategory !== 'all' && jobRole.category !== filterCategory) {
        return false;
      }

      // Risk filter
      if (filterRisk !== 'all' && role.riskLevel !== filterRisk) {
        return false;
      }

      return true;
    });

    // Sort roles
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'aiGrowth':
          aValue = a.aiGrowthRate;
          bValue = b.aiGrowthRate;
          break;
        case 'jobTrend':
          aValue = a.jobDemandChange;
          bValue = b.jobDemandChange;
          break;
        case 'impactScore':
        default:
          aValue = a.impactScore;
          bValue = b.impactScore;
          break;
      }

      const comparison = sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      
      // Secondary sort by role name for consistency
      if (Math.abs(comparison) < 0.01) {
        const roleA = JOB_ROLES.find(jr => jr.id === a.roleId);
        const roleB = JOB_ROLES.find(jr => jr.id === b.roleId);
        return (roleA?.name || '').localeCompare(roleB?.name || '');
      }
      
      return comparison;
    });

    return filtered;
  }, [roles, sortBy, sortOrder, filterCategory, filterRisk]);

  const getColumnHeader = (column: string) => {
    const headers = {
      role: 'Role',
      category: 'Category',
      aiGrowth: 'AI Growth Impact',
      jobTrend: 'Job Demand Change',
      impactScore: 'Impact Score',
      classification: 'Classification'
    };
    return headers[column as keyof typeof headers] || column;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSort = (column: typeof sortBy) => {
    // This would typically be handled by parent component
    // For now, we'll just show the current sort state
    console.log(`Sort by ${column} ${sortOrder}`);
  };

  const renderRoleRow = (roleImpact: typeof roles[0], index: number) => {
    const jobRole = JOB_ROLES.find(jr => jr.id === roleImpact.roleId);
    if (!jobRole) return null;

    const riskConfig = RISK_LEVELS[roleImpact.riskLevel];
    const classificationConfig = CLASSIFICATIONS[roleImpact.classification];
    const categoryConfig = JOB_CATEGORIES[jobRole.category];
    const isHovered = hoveredRole === roleImpact.roleId;

    return (
      <tr
        key={roleImpact.roleId}
        className={`matrix-row ${isHovered ? 'hovered' : ''} risk-${roleImpact.riskLevel}`}
        onClick={() => onRoleClick(roleImpact.roleId)}
        onMouseEnter={() => setHoveredRole(roleImpact.roleId)}
        onMouseLeave={() => setHoveredRole(null)}
      >
        <td className="role-cell">
          <div className="role-info">
            <span className="role-name">{jobRole.name}</span>
            <span className="role-aliases">
              {jobRole.aliases.slice(0, 2).join(', ')}
            </span>
          </div>
        </td>
        
        <td className="category-cell">
          <div 
            className="category-badge"
            style={{ backgroundColor: categoryConfig.color + '20', color: categoryConfig.color }}
          >
            {categoryConfig.name}
          </div>
        </td>
        
        <td className="metric-cell ai-growth">
          <div className="metric-value">
            {formatPercentage(roleImpact.aiGrowthRate, 1)}
          </div>
          <div className="metric-bar">
            <div 
              className="bar-fill ai-growth-bar"
              style={{ width: `${Math.min(100, Math.abs(roleImpact.aiGrowthRate))}%` }}
            />
          </div>
        </td>
        
        <td className="metric-cell job-trend">
          <div className={`metric-value ${roleImpact.jobDemandChange >= 0 ? 'positive' : 'negative'}`}>
            {roleImpact.jobDemandChange >= 0 ? '+' : ''}{formatPercentage(roleImpact.jobDemandChange, 1)}
          </div>
          <div className="metric-bar">
            <div 
              className={`bar-fill ${roleImpact.jobDemandChange >= 0 ? 'positive-bar' : 'negative-bar'}`}
              style={{ width: `${Math.min(100, Math.abs(roleImpact.jobDemandChange))}%` }}
            />
          </div>
        </td>
        
        <td className="metric-cell impact-score">
          <div className="metric-value impact-value">
            {roleImpact.impactScore.toFixed(1)}
          </div>
          <div className="metric-bar">
            <div 
              className="bar-fill impact-bar"
              style={{ 
                width: `${Math.min(100, Math.abs(roleImpact.impactScore) * 2)}%`,
                backgroundColor: riskConfig.color + '80'
              }}
            />
          </div>
        </td>
        
        <td className="classification-cell">
          <div className={`classification-badge ${roleImpact.classification}`}>
            <span className="classification-icon">
              {roleImpact.classification === 'growth' ? '📈' : 
               roleImpact.classification === 'disruption' ? '⚠️' : '🔄'}
            </span>
            <span className="classification-text">{classificationConfig.label}</span>
          </div>
        </td>
        
        <td className="risk-cell">
          <div className={`risk-badge ${roleImpact.riskLevel}`}>
            <span className="risk-emoji">{riskConfig.emoji}</span>
            <span className="risk-text">{riskConfig.label}</span>
          </div>
        </td>
      </tr>
    );
  };

  const categoryOptions = Object.entries(JOB_CATEGORIES).map(([key, category]) => ({
    value: key,
    label: category.name
  }));

  const riskOptions = Object.entries(RISK_LEVELS).map(([key, risk]) => ({
    value: key,
    label: risk.label
  }));

  return (
    <div className="impact-matrix">
      <div className="matrix-header">
        <div className="header-content">
          <h2>Workforce Impact Matrix</h2>
          <p>Comprehensive view of all roles categorized by AI impact and risk levels</p>
        </div>
        
        <div className="matrix-stats">
          <div className="stat-item">
            <span className="stat-value">{processedRoles.length}</span>
            <span className="stat-label">Roles Analyzed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {processedRoles.filter(r => r.riskLevel === 'high').length}
            </span>
            <span className="stat-label">High Risk</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {processedRoles.filter(r => r.classification === 'growth').length}
            </span>
            <span className="stat-label">Growth Opportunities</span>
          </div>
        </div>
      </div>

      <div className="matrix-controls">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="risk-filter">Risk Level:</label>
            <select
              id="risk-filter"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              {riskOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-options">
          <span className="results-count">
            Showing {processedRoles.length} of {roles.length} roles
          </span>
        </div>
      </div>

      <div className="matrix-table-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="role-header">
                <button 
                  className="sort-button"
                  onClick={() => handleSort('impactScore')}
                  title="Sort by role name"
                >
                  {getColumnHeader('role')}
                </button>
              </th>
              <th className="category-header">
                {getColumnHeader('category')}
              </th>
              <th className="metric-header">
                <button 
                  className={`sort-button ${sortBy === 'aiGrowth' ? 'active' : ''}`}
                  onClick={() => handleSort('aiGrowth')}
                  title="Sort by AI growth impact"
                >
                  {getColumnHeader('aiGrowth')} {getSortIcon('aiGrowth')}
                </button>
              </th>
              <th className="metric-header">
                <button 
                  className={`sort-button ${sortBy === 'jobTrend' ? 'active' : ''}`}
                  onClick={() => handleSort('jobTrend')}
                  title="Sort by job demand change"
                >
                  {getColumnHeader('jobTrend')} {getSortIcon('jobTrend')}
                </button>
              </th>
              <th className="metric-header">
                <button 
                  className={`sort-button ${sortBy === 'impactScore' ? 'active' : ''}`}
                  onClick={() => handleSort('impactScore')}
                  title="Sort by impact score"
                >
                  {getColumnHeader('impactScore')} {getSortIcon('impactScore')}
                </button>
              </th>
              <th className="classification-header">
                {getColumnHeader('classification')}
              </th>
              <th className="risk-header">
                Risk Level
              </th>
            </tr>
          </thead>
          <tbody>
            {processedRoles.map((roleImpact, index) => 
              renderRoleRow(roleImpact, index)
            )}
          </tbody>
        </table>
      </div>

      {processedRoles.length === 0 && (
        <div className="no-results">
          <div className="no-results-content">
            <span className="no-results-icon">🔍</span>
            <h3>No roles match your filters</h3>
            <p>Try adjusting the category or risk level filters to see more results.</p>
            <button 
              onClick={() => {
                setFilterCategory('all');
                setFilterRisk('all');
              }}
              className="clear-filters-button"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="matrix-legend">
        <div className="legend-section">
          <h4>Risk Levels</h4>
          <div className="legend-items">
            {Object.entries(RISK_LEVELS).map(([key, risk]) => (
              <div key={key} className="legend-item">
                <span className="legend-icon">{risk.emoji}</span>
                <span className="legend-text">{risk.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="legend-section">
          <h4>Classifications</h4>
          <div className="legend-items">
            {Object.entries(CLASSIFICATIONS).map(([key, classification]) => (
              <div key={key} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: classification.color }}
                />
                <span className="legend-text">{classification.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactMatrix;