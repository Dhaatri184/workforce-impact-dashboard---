import React, { useState, useEffect } from 'react';
import { demoService, DemoScenario, DemoState } from '../services/demoService';
import './DemoModeSelector.css';

interface DemoModeSelectorProps {
  onScenarioSelect: (scenario: DemoScenario) => void;
  onDemoToggle: (isActive: boolean) => void;
}

export const DemoModeSelector: React.FC<DemoModeSelectorProps> = ({
  onScenarioSelect,
  onDemoToggle
}) => {
  const [demoState, setDemoState] = useState<DemoState>(demoService.getDemoState());
  const [isExpanded, setIsExpanded] = useState(false);
  const scenarios = demoService.getScenarios();

  useEffect(() => {
    const unsubscribe = demoService.subscribe(setDemoState);
    return unsubscribe;
  }, []);

  const handleStartDemo = (scenarioId?: string) => {
    demoService.startDemo(scenarioId);
    onDemoToggle(true);
    
    if (scenarioId) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        onScenarioSelect(scenario);
      }
    }
    setIsExpanded(false);
  };

  const handleStopDemo = () => {
    demoService.stopDemo();
    onDemoToggle(false);
    setIsExpanded(false);
  };

  const handleScenarioChange = (scenarioId: string) => {
    demoService.switchScenario(scenarioId);
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      onScenarioSelect(scenario);
    }
  };

  if (!demoState.isActive) {
    return (
      <div className="demo-mode-selector">
        <div className="demo-trigger">
          <button
            className="demo-mode-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label="Demo mode options"
          >
            <span aria-hidden="true">🎯</span> Demo Mode
            <span className={`demo-chevron ${isExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          
          {isExpanded && (
            <div className="demo-dropdown" role="menu">
              <div className="demo-dropdown-header">
                <h4>Try Demo Scenarios</h4>
                <p>Explore pre-configured analysis scenarios</p>
              </div>
              
              <div className="demo-scenarios">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className="demo-scenario-button"
                    onClick={() => handleStartDemo(scenario.id)}
                    role="menuitem"
                  >
                    <div className="scenario-content">
                      <h5>{scenario.name}</h5>
                      <p>{scenario.description}</p>
                      <div className="scenario-highlights">
                        {scenario.highlights.slice(0, 2).map((highlight, index) => (
                          <span key={index} className="highlight-tag">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="demo-dropdown-footer">
                <button
                  className="demo-quick-start"
                  onClick={() => handleStartDemo()}
                >
                  Quick Start Demo
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Click outside to close */}
        {isExpanded && (
          <div 
            className="demo-backdrop"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="demo-mode-active">
      <div className="demo-status">
        <div className="demo-indicator">
          <span className="demo-pulse" aria-hidden="true">●</span>
          <span className="demo-label">Demo Mode</span>
        </div>
        
        {demoState.currentScenario && (
          <div className="current-scenario">
            <select
              value={demoState.currentScenario.id}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="scenario-selector"
              aria-label="Select demo scenario"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <button
          className="demo-stop-button"
          onClick={handleStopDemo}
          aria-label="Exit demo mode"
        >
          Exit Demo
        </button>
      </div>
      
      {demoState.currentScenario && (
        <div className="scenario-info">
          <div className="scenario-details">
            <h4>{demoState.currentScenario.name}</h4>
            <p>{demoState.currentScenario.description}</p>
          </div>
          
          <div className="scenario-highlights">
            {demoState.currentScenario.highlights.map((highlight, index) => (
              <div key={index} className="highlight-item">
                <span className="highlight-bullet" aria-hidden="true">•</span>
                {highlight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoModeSelector;