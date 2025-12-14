import React, { useState, useEffect } from 'react';
import { ComparisonPanelProps, JobRoleImpact, JobRoleData, AIGrowthData } from '../types';
import { JOB_ROLES, RISK_LEVELS, CLASSIFICATIONS } from '../utils/constants';
import { dataService } from '../services';
import { formatPercentage } from '../utils';
import { LoadingSpinner } from './LoadingSpinner';
import { RoleComparisonChart } from './RoleComparisonChart';
import { TimeSeriesChart } from './TimeSeriesChart';
import './ComparisonPanel.css';

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  primaryRole,
  secondaryRole,
  onSecondaryRoleSelect,
  timeRange
}) => {
  const [comparisonData, setComparisonData] = useState<{
    primaryImpact: JobRoleImpact | null;
    secondaryImpact: JobRoleImpact | null;
    aiData: AIGrowthData | null;
    isLoading: boolean;
    error: string | null;
  }>({
    primaryImpact: null,
    secondaryImpact: null,
    aiData: null,
    isLoading: false,
    error: null
  });

  // Load comparison data when roles change
  useEffect(() => {
    if (primaryRole && secondaryRole) {
      loadComparisonData();
    }
  }, [primaryRole.id, secondaryRole?.id, timeRange]);

  const loadComparisonData = async () => {
    if (!primaryRole || !secondaryRole) return;

    setComparisonData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch data for both roles
      const [aiData, jobDataArray] = await Promise.all([
        dataService.fetchAIGrowthData(timeRange),
        dataService.fetchJobMarketData([primaryRole.id, secondaryRole.id], timeRange)
      ]);

      // Calculate impact scores
      const impactScores = dataService.calculateImpactScores(aiData, jobDataArray);
      
      const primaryImpact = impactScores.find(impact => impact.roleId === primaryRole.id);
      const secondaryImpact = impactScores.find(impact => impact.roleId === secondaryRole.id);

      setComparisonData({
        primaryImpact: primaryImpact || null,
        secondaryImpact: secondaryImpact || null,
        aiData,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load comparison data:', error);
      setComparisonData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load comparison data'
      }));
    }
  };

  const availableRoles = JOB_ROLES.filter(role => role.id !== primaryRole.id);

  const renderRoleCard = (
    role: typeof primaryRole,
    impact: JobRoleImpact | null,
    isPrimary: boolean
  ) => {
    const riskConfig = impact ? RISK_LEVELS[impact.riskLevel] : null;
    const classificationConfig = impact ? CLASSIFICATIONS[impact.classification] : null;

    return (
      <div className={`role-card ${isPrimary ? 'primary' : 'secondary'}`}>
        <div className="role-header">
          <div className="role-info">
            <h3 className="role-name">{role.name}</h3>
            <span className="role-category">{role.category}</span>
          </div>
          {impact && riskConfig && (
            <div className={`risk-indicator ${impact.riskLevel}`}>
              <span className="risk-emoji">{riskConfig.emoji}</span>
              <span className="risk-label">{riskConfig.label}</span>
            </div>
          )}
        </div>

        <div className="role-description">
          {role.description}
        </div>

        {impact ? (
          <div className="impact-metrics">
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">AI Growth Impact</span>
                <span className="metric-value">
                  {formatPercentage(impact.aiGrowthRate, 1)}
                </span>
              </div>
              
              <div className="metric-item">
                <span className="metric-label">Job Demand Change</span>
                <span className={`metric-value ${impact.jobDemandChange >= 0 ? 'positive' : 'negative'}`}>
                  {impact.jobDemandChange >= 0 ? '+' : ''}{formatPercentage(impact.jobDemandChange, 1)}
                </span>
              </div>
              
              <div className="metric-item">
                <span className="metric-label">Impact Score</span>
                <span className="metric-value impact-score">
                  {impact.impactScore.toFixed(1)}
                </span>
              </div>
            </div>

            {classificationConfig && (
              <div className={`classification-badge ${impact.classification}`}>
                <span className="classification-text">{classificationConfig.label}</span>
                <span className="classification-description">{classificationConfig.description}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data">
            <span>No impact data available</span>
          </div>
        )}
      </div>
    );
  };

  const renderComparison = () => {
    const { primaryImpact, secondaryImpact } = comparisonData;
    
    if (!primaryImpact || !secondaryImpact) {
      return null;
    }

    const scoreDiff = Math.abs(primaryImpact.impactScore - secondaryImpact.impactScore);
    const demandDiff = Math.abs(primaryImpact.jobDemandChange - secondaryImpact.jobDemandChange);
    const aiDiff = Math.abs(primaryImpact.aiGrowthRate - secondaryImpact.aiGrowthRate);

    const higherImpactRole = primaryImpact.impactScore > secondaryImpact.impactScore ? primaryRole : secondaryRole;
    const higherDemandRole = primaryImpact.jobDemandChange > secondaryImpact.jobDemandChange ? primaryRole : secondaryRole;

    return (
      <div className="comparison-analysis">
        <h4>Comparison Analysis</h4>
        
        <div className="comparison-insights">
          <div className="insight-item">
            <span className="insight-label">Impact Score Difference:</span>
            <span className="insight-value">{scoreDiff.toFixed(1)} points</span>
            <span className="insight-detail">
              {higherImpactRole.name} has higher transformation pressure
            </span>
          </div>
          
          <div className="insight-item">
            <span className="insight-label">Job Demand Difference:</span>
            <span className="insight-value">{formatPercentage(demandDiff, 1)}</span>
            <span className="insight-detail">
              {higherDemandRole.name} shows stronger job market growth
            </span>
          </div>
          
          <div className="insight-item">
            <span className="insight-label">AI Growth Exposure:</span>
            <span className="insight-value">{formatPercentage(aiDiff, 1)}</span>
            <span className="insight-detail">
              Difference in AI technology impact exposure
            </span>
          </div>
        </div>

        <div className="comparison-recommendation">
          <h5>Strategic Recommendation</h5>
          <p>
            {primaryImpact.riskLevel === 'high' && secondaryImpact.riskLevel !== 'high' ? (
              `Consider transitioning from ${primaryRole.name} to ${secondaryRole.name} for better career resilience.`
            ) : secondaryImpact.riskLevel === 'high' && primaryImpact.riskLevel !== 'high' ? (
              `${primaryRole.name} offers better long-term prospects compared to ${secondaryRole.name}.`
            ) : primaryImpact.classification === 'growth' || secondaryImpact.classification === 'growth' ? (
              `Both roles show potential, but focus on AI collaboration skills for future-proofing.`
            ) : (
              `Both roles face similar challenges. Consider upskilling in AI-adjacent technologies.`
            )}
          </p>
        </div>
      </div>
    );
  };

  if (comparisonData.error) {
    return (
      <div className="comparison-panel error">
        <div className="error-message">
          <h3>Unable to Load Comparison</h3>
          <p>{comparisonData.error}</p>
          <button onClick={loadComparisonData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-panel">
      <div className="panel-header">
        <h2>Role Comparison</h2>
        <p>Compare job roles to understand relative market dynamics and AI impact</p>
      </div>

      <div className="role-selection">
        <div className="primary-role-section">
          <label>Primary Role (Selected)</label>
          <div className="selected-role-display">
            {primaryRole.name}
          </div>
        </div>

        <div className="secondary-role-section">
          <label htmlFor="secondary-role-select">Compare With</label>
          <select
            id="secondary-role-select"
            value={secondaryRole?.id || ''}
            onChange={(e) => {
              const selectedRole = availableRoles.find(role => role.id === e.target.value);
              if (selectedRole) {
                onSecondaryRoleSelect(selectedRole.id);
              }
            }}
            className="role-select"
          >
            <option value="">Select a role to compare...</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {comparisonData.isLoading ? (
        <div className="loading-section">
          <LoadingSpinner message="Loading comparison data..." />
        </div>
      ) : secondaryRole ? (
        <div className="comparison-content">
          {/* Comparison Charts */}
          {comparisonData.primaryImpact && comparisonData.secondaryImpact && (
            <div className="comparison-charts">
              <div className="chart-section">
                <RoleComparisonChart
                  primaryRole={comparisonData.primaryImpact}
                  secondaryRole={comparisonData.secondaryImpact}
                  chartType="radar"
                />
              </div>
              
              <div className="chart-section">
                <TimeSeriesChart
                  aiData={comparisonData.aiData}
                  jobData={[]} // Will be populated with both roles' data
                  selectedRoles={[primaryRole.id, secondaryRole.id]}
                  timeRange={timeRange}
                  showAIData={true}
                  showJobData={true}
                  height={350}
                  syncId="comparison"
                />
              </div>
            </div>
          )}

          {/* Role Cards Comparison */}
          <div className="roles-comparison">
            {renderRoleCard(primaryRole, comparisonData.primaryImpact, true)}
            
            <div className="vs-divider">
              <span className="vs-text">VS</span>
            </div>
            
            {renderRoleCard(secondaryRole, comparisonData.secondaryImpact, false)}
          </div>

          {renderComparison()}
        </div>
      ) : (
        <div className="no-comparison">
          <div className="placeholder-content">
            <div className="placeholder-icon">⚖️</div>
            <h3>Select a Role to Compare</h3>
            <p>Choose a second role from the dropdown above to see a detailed side-by-side comparison of AI impact and job market trends.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonPanel;