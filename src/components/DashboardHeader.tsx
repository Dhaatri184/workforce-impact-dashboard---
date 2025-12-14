import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { DemoModeSelector } from './DemoModeSelector';
import { DemoScenario } from '../services/demoService';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  selectedRole: string | null;
  timeRange: [Date, Date];
  onScenarioSelect: (scenario: DemoScenario) => void;
  onDemoToggle: (isActive: boolean) => void;
  isDemoMode: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedRole,
  timeRange,
  onScenarioSelect,
  onDemoToggle,
  isDemoMode
}) => {
  const formatDateRange = (range: [Date, Date]) => {
    const [start, end] = range;
    const startStr = start.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    const endStr = end.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    return `${startStr} - ${endStr}`;
  };

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return 'No role selected';
    // This would typically come from a roles lookup
    const roleNames: { [key: string]: string } = {
      'software-engineer': 'Software Engineer',
      'data-scientist': 'Data Scientist',
      'product-manager': 'Product Manager',
      'designer': 'UX/UI Designer',
      'marketing-specialist': 'Marketing Specialist',
      'sales-representative': 'Sales Representative',
      'customer-support': 'Customer Support',
      'hr-specialist': 'HR Specialist',
      'financial-analyst': 'Financial Analyst',
      'operations-manager': 'Operations Manager'
    };
    return roleNames[roleId] || roleId;
  };

  return (
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
          <ThemeToggle />
          <DemoModeSelector
            onScenarioSelect={onScenarioSelect}
            onDemoToggle={onDemoToggle}
          />
        </div>
      </div>
      
      <div className="header-status">
        <div className="status-cards">
          <div className="status-card">
            <div className="status-label">Selected Role</div>
            <div className="status-value">
              <span className="role-icon">👤</span>
              {getRoleName(selectedRole)}
            </div>
          </div>
          
          <div className="status-card">
            <div className="status-label">Analysis Period</div>
            <div className="status-value">
              <span className="period-icon">📅</span>
              {formatDateRange(timeRange)}
            </div>
          </div>
          
          {isDemoMode && (
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
  );
};