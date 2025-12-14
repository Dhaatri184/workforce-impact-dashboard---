import React, { useState, useEffect, useCallback } from 'react';
import { 
  AnalysisContext, 
  JobRoleData, 
  AIGrowthData, 
  JobRoleImpact,
  GeneratedInsight 
} from '../types';
import { dataService } from '../services';
import { demoService, DemoScenario } from '../services/demoService';
import { JOB_ROLES, DEFAULTS } from '../utils/constants';
import { RoleExplorer } from './RoleExplorer';
import { TimeSliderFixed as TimeSlider } from './TimeSliderFixed';
import { OverviewCards } from './OverviewCards';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { TimeSeriesChart } from './TimeSeriesChart';
import { ImpactScoreChart } from './ImpactScoreChart';
import { ComparisonPanel } from './ComparisonPanel';
import { ImpactMatrix } from './ImpactMatrix';
import { InsightPanel } from './InsightPanel';
import { DemoTour } from './DemoTour';
import { DemoModeSelector } from './DemoModeSelector';
import { DataExport } from './DataExport';
import { MovableTourButton } from './MovableTourButton';
import { SimpleThemeToggle } from './SimpleThemeToggle';
import './Dashboard.css';

interface DashboardState {
  selectedRole: string | null;
  secondaryRole: string | null;
  timeRange: [Date, Date];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  aiData: AIGrowthData | null;
  jobData: JobRoleData[];
  impactScores: JobRoleImpact[];
  insights: GeneratedInsight[];
  viewMode: 'overview' | 'comparison' | 'matrix';
  showCharts: boolean;
  isDemoMode: boolean;
  demoTourActive: boolean;
}

export const Dashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    selectedRole: DEFAULTS.selectedRole,
    secondaryRole: null,
    timeRange: DEFAULTS.timeRange,
    searchQuery: '',
    isLoading: true,
    error: null,
    aiData: null,
    jobData: [],
    impactScores: [],
    insights: [],
    viewMode: 'overview',
    showCharts: true,
    isDemoMode: false,
    demoTourActive: false
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when time range or selected role changes
  useEffect(() => {
    if (state.selectedRole) {
      loadDashboardData();
    }
  }, [state.selectedRole, state.timeRange]);

  const loadDashboardData = useCallback(async () => {
    if (!state.selectedRole) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let aiGrowthData: AIGrowthData;
      let jobMarketData: JobRoleData[];
      let impactScores: JobRoleImpact[];
      let insights: GeneratedInsight[];

      if (state.isDemoMode) {
        // Use sample data in demo mode
        const sampleData = demoService.getSampleData();
        aiGrowthData = sampleData.aiData;
        jobMarketData = sampleData.jobData.filter(job => job.roleId === state.selectedRole);
        impactScores = sampleData.impactScores.filter(impact => impact.roleId === state.selectedRole);
        insights = sampleData.insights.filter(insight => 
          insight.relevantData.includes(state.selectedRole!)
        );
      } else {
        // Fetch real data
        const [aiData, jobData] = await Promise.all([
          dataService.fetchAIGrowthData(state.timeRange),
          dataService.fetchJobMarketData([state.selectedRole], state.timeRange)
        ]);

        aiGrowthData = aiData;
        jobMarketData = jobData;
        impactScores = dataService.calculateImpactScores(aiGrowthData, jobMarketData);

        const analysisContext: AnalysisContext = {
          selectedRoles: [state.selectedRole],
          timeRange: state.timeRange,
          comparisonMode: false,
          filters: {}
        };

        insights = dataService.generateInsights(analysisContext);
      }

      setState(prev => ({
        ...prev,
        aiData: aiGrowthData,
        jobData: jobMarketData,
        impactScores,
        insights,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false
      }));
    }
  }, [state.selectedRole, state.timeRange, state.isDemoMode]);

  const handleRoleSelect = useCallback((roleId: string) => {
    setState(prev => ({ ...prev, selectedRole: roleId }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleTimeRangeChange = useCallback((newTimeRange: [Date, Date]) => {
    setState(prev => ({ ...prev, timeRange: newTimeRange }));
  }, []);

  const handleRetry = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSecondaryRoleSelect = useCallback((roleId: string) => {
    setState(prev => ({ ...prev, secondaryRole: roleId }));
  }, []);

  const handleViewModeChange = useCallback((mode: 'overview' | 'comparison' | 'matrix') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleCharts = useCallback(() => {
    setState(prev => ({ ...prev, showCharts: !prev.showCharts }));
  }, []);

  const handleDemoToggle = useCallback((isActive: boolean) => {
    setState(prev => ({ ...prev, isDemoMode: isActive }));
    if (isActive) {
      // Load demo data immediately
      loadDashboardData();
    }
  }, [loadDashboardData]);

  const handleScenarioSelect = useCallback((scenario: DemoScenario) => {
    setState(prev => ({
      ...prev,
      selectedRole: scenario.selectedRole,
      secondaryRole: scenario.secondaryRole || null,
      timeRange: scenario.timeRange,
      viewMode: scenario.viewMode
    }));
  }, []);

  const handleDemoTourStart = useCallback(() => {
    setState(prev => ({ ...prev, demoTourActive: true }));
  }, []);

  const handleDemoTourStop = useCallback(() => {
    setState(prev => ({ ...prev, demoTourActive: false }));
  }, []);

  const handleDemoTourStep = useCallback((step: number) => {
    // Handle tour step changes if needed
    console.log('Demo tour step:', step);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          handleViewModeChange('overview');
          break;
        case '2':
          event.preventDefault();
          handleViewModeChange('comparison');
          break;
        case '3':
          event.preventDefault();
          handleViewModeChange('matrix');
          break;
        case 'r':
          event.preventDefault();
          loadDashboardData();
          break;
      }
    }
    
    // Handle escape key to clear selections
    if (event.key === 'Escape') {
      if (state.secondaryRole) {
        setState(prev => ({ ...prev, secondaryRole: null, viewMode: 'overview' }));
      }
    }
  }, [handleViewModeChange, loadDashboardData, state.secondaryRole]);

  // Filter roles based on search query
  const filteredRoles = JOB_ROLES.filter(role => 
    role.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    role.aliases.some(alias => alias.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
    role.category.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  if (state.error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <h2>Unable to Load Dashboard</h2>
          <p>{state.error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="dashboard" onKeyDown={handleKeyDown}>
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        {/* Screen reader announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="status-announcements"
        >
          {state.isLoading && "Loading dashboard data..."}
          {state.error && `Error: ${state.error}`}
        </div>
        
        {/* Enhanced Header with Theme Toggle */}
        <header className="dashboard-header-enhanced" role="banner">
          <div className="header-main">
            <div className="header-branding">
              <div className="header-icon">
                <span className="icon-ai">🤖</span>
                <span className="icon-vs">⚡</span>
                <span className="icon-job">💼</span>
              </div>
              <div className="header-text">
                <h1 className="header-title">
                  AI Impact vs Job Market Analysis
                </h1>
                <p className="header-subtitle">
                  Interactive Workforce Impact Dashboard
                </p>
              </div>
            </div>
            
            <div className="header-controls">
              {/* Simple Theme Toggle - Just Sun and Moon */}
              <SimpleThemeToggle />
              
              <DemoModeSelector
                onScenarioSelect={handleScenarioSelect}
                onDemoToggle={handleDemoToggle}
              />
            </div>
          </div>
          
          <div className="header-status">
            <div className="status-cards">
              <div className="status-card">
                <div className="status-label">Selected Role</div>
                <div className="status-value">
                  <span className="role-icon">👤</span>
                  {state.selectedRole ? JOB_ROLES.find(r => r.id === state.selectedRole)?.name || state.selectedRole : 'No role selected'}
                </div>
              </div>
              
              <div className="status-card">
                <div className="status-label">Analysis Period</div>
                <div className="status-value">
                  <span className="period-icon">📅</span>
                  {state.timeRange[0].toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {state.timeRange[1].toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
              </div>
              
              {state.isDemoMode && (
                <div className="status-card demo-indicator">
                  <div className="status-label">Mode</div>
                  <div className="status-value">
                    <span className="demo-icon">🎯</span>
                    Demo Mode
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Demo Mode Indicator */}
          {state.isDemoMode && (
            <DemoModeSelector
              onScenarioSelect={handleScenarioSelect}
              onDemoToggle={handleDemoToggle}
            />
          )}
          
          {/* Controls Section */}
          <section className="dashboard-controls" role="region" aria-label="Dashboard Controls">
            <div className="controls-grid">
              <div className="control-group">
                <label htmlFor="role-explorer">Select Job Role</label>
                <RoleExplorer
                  roles={filteredRoles}
                  selectedRole={state.selectedRole}
                  onRoleSelect={handleRoleSelect}
                  searchQuery={state.searchQuery}
                  onSearchChange={handleSearchChange}
                />
              </div>

              <div className="control-group">
                <label htmlFor="time-slider">Time Range</label>
                <TimeSlider
                  timeRange={[new Date('2020-01-01'), new Date()]}
                  selectedPeriod={state.timeRange}
                  onPeriodChange={handleTimeRangeChange}
                  granularity="month"
                />
              </div>
            </div>
          </section>

          {/* Overview Section */}
          <section className="dashboard-overview" role="region" aria-label="Overview Metrics">
            {state.isLoading ? (
              <LoadingSpinner message="Loading workforce impact data..." />
            ) : (
              <OverviewCards
                aiData={state.aiData}
                impactScores={state.impactScores}
                selectedRole={state.selectedRole}
                isLoading={state.isLoading}
              />
            )}
          </section>

          {/* View Mode Controls */}
          <nav className="dashboard-navigation" role="navigation" aria-label="View Mode Selection">
            <div className="nav-controls">
              <div className="view-mode-selector" role="tablist" aria-label="Dashboard Views">
                <button 
                  className={`mode-button ${state.viewMode === 'overview' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('overview')}
                  role="tab"
                  aria-selected={state.viewMode === 'overview'}
                  aria-controls="main-content"
                  id="overview-tab"
                >
                  <span aria-hidden="true">📊</span> Overview
                </button>
                <button 
                  className={`mode-button ${state.viewMode === 'comparison' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('comparison')}
                  role="tab"
                  aria-selected={state.viewMode === 'comparison'}
                  aria-controls="main-content"
                  id="comparison-tab"
                >
                  <span aria-hidden="true">⚖️</span> Compare
                </button>
                <button 
                  className={`mode-button ${state.viewMode === 'matrix' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('matrix')}
                  role="tab"
                  aria-selected={state.viewMode === 'matrix'}
                  aria-controls="main-content"
                  id="matrix-tab"
                >
                  <span aria-hidden="true">🔢</span> Matrix
                </button>
              </div>
              
              <div className="display-controls">
                <button 
                  className={`control-button ${state.showCharts ? 'active' : ''}`}
                  onClick={toggleCharts}
                  aria-label={`${state.showCharts ? 'Hide' : 'Show'} chart visualizations`}
                  aria-pressed={state.showCharts}
                >
                  <span aria-hidden="true">📈</span> Charts
                </button>
                
                <DataExport
                  selectedRoles={state.selectedRole ? [state.selectedRole] : []}
                  timeRange={state.timeRange}
                  impactScores={state.impactScores}
                  insights={state.insights}
                  viewMode={state.viewMode}
                  comparisonRole={state.secondaryRole || undefined}
                />
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="dashboard-main" id="main-content" role="main">
            <div 
              className="main-content"
              role="tabpanel"
              aria-labelledby={`${state.viewMode}-tab`}
            >
              {state.isLoading ? (
                <div className="loading-placeholder">
                  <LoadingSpinner message="Analyzing data..." />
                </div>
              ) : (
                <>
                  {/* Overview Mode */}
                  {state.viewMode === 'overview' && (
                    <div className="overview-content">
                      {/* Charts Section */}
                      {state.showCharts && (
                        <div className="charts-section">
                          <div className="charts-grid">
                            {/* Time Series Chart */}
                            <div className="chart-container">
                              <TimeSeriesChart
                                aiData={state.aiData}
                                jobData={state.jobData}
                                selectedRoles={state.selectedRole ? [state.selectedRole] : []}
                                timeRange={state.timeRange}
                                showAIData={true}
                                showJobData={true}
                                height={400}
                                syncId="dashboard"
                              />
                            </div>

                            {/* Impact Score Chart */}
                            <div className="chart-container">
                              <ImpactScoreChart
                                roles={state.impactScores}
                                selectedRole={state.selectedRole}
                                onRoleClick={handleRoleSelect}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analysis Cards */}
                      <div className="analysis-section">
                        <div className="content-grid">
                          {/* Role Analysis Card */}
                          <div className="content-card">
                            <h3>Role Analysis</h3>
                            {state.selectedRole && state.impactScores.length > 0 ? (
                              <div className="role-analysis">
                                {(() => {
                                  const role = JOB_ROLES.find(r => r.id === state.selectedRole);
                                  const impact = state.impactScores.find(i => i.roleId === state.selectedRole);
                                  
                                  if (!role || !impact) return <p>No data available</p>;
                                  
                                  return (
                                    <div className="analysis-content">
                                      <div className="role-header">
                                        <h4>{role.name}</h4>
                                        <span className={`risk-badge risk-${impact.riskLevel}`}>
                                          {impact.riskLevel.toUpperCase()} RISK
                                        </span>
                                      </div>
                                      <div className="metrics-grid">
                                        <div className="metric">
                                          <span className="metric-label">AI Growth Impact</span>
                                          <span className="metric-value">
                                            {impact.aiGrowthRate.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="metric">
                                          <span className="metric-label">Job Demand Change</span>
                                          <span className={`metric-value ${impact.jobDemandChange >= 0 ? 'positive' : 'negative'}`}>
                                            {impact.jobDemandChange >= 0 ? '+' : ''}{impact.jobDemandChange.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="metric">
                                          <span className="metric-label">Impact Score</span>
                                          <span className="metric-value">
                                            {impact.impactScore.toFixed(1)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="classification">
                                        <span className="classification-label">Classification:</span>
                                        <span className={`classification-value ${impact.classification}`}>
                                          {impact.classification.charAt(0).toUpperCase() + impact.classification.slice(1)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <p>Select a role to see detailed analysis</p>
                            )}
                          </div>

                          {/* Insights Panel */}
                          <div className="content-card">
                            <InsightPanel
                              insights={state.insights}
                              context={{
                                selectedRoles: state.selectedRole ? [state.selectedRole] : [],
                                timeRange: state.timeRange,
                                comparisonMode: false,
                                filters: {}
                              }}
                              onInsightClick={(insightId) => {
                                // Handle insight click - could navigate to relevant chart section
                                console.log('Insight clicked:', insightId);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparison Mode */}
                  {state.viewMode === 'comparison' && (
                    <div className="comparison-content">
                      {state.selectedRole ? (
                        <ComparisonPanel
                          primaryRole={JOB_ROLES.find(r => r.id === state.selectedRole)!}
                          secondaryRole={state.secondaryRole ? JOB_ROLES.find(r => r.id === state.secondaryRole) || null : null}
                          onSecondaryRoleSelect={handleSecondaryRoleSelect}
                          timeRange={state.timeRange}
                        />
                      ) : (
                        <div className="no-selection">
                          <h3>Select a Primary Role</h3>
                          <p>Choose a role from the explorer above to start comparing roles.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Matrix Mode */}
                  {state.viewMode === 'matrix' && (
                    <div className="matrix-content">
                      <ImpactMatrix
                        roles={state.impactScores}
                        sortBy="impactScore"
                        sortOrder="desc"
                        onRoleClick={handleRoleSelect}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer" role="contentinfo">
          <div className="footer-content">
            <p>
              Data sources: GitHub API, Job Market APIs | 
              Last updated: <time dateTime={new Date().toISOString()}>{new Date().toLocaleString()}</time>
            </p>
            <div className="footer-links">
              <button 
                onClick={() => dataService.clearCache()} 
                className="link-button"
                aria-label="Refresh all cached data"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </footer>
        
        {/* Movable Tour Button */}
        <MovableTourButton
          onStartTour={handleDemoTourStart}
          isVisible={!state.demoTourActive}
        />
        
        {/* Demo Tour */}
        <DemoTour
          isActive={state.demoTourActive}
          onStart={handleDemoTourStart}
          onStop={handleDemoTourStop}
          onStepChange={handleDemoTourStep}
          currentViewMode={state.viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;