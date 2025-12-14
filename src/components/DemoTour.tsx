import React, { useState, useEffect, useRef } from 'react';
import { DEMO_TOUR_STEPS, DemoModeManager } from '../data/sampleData';
import './DemoTour.css';

interface DemoTourProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onStepChange: (step: number) => void;
  currentViewMode: string;
  onViewModeChange: (mode: 'overview' | 'comparison' | 'matrix') => void;
}

export const DemoTour: React.FC<DemoTourProps> = ({
  isActive,
  onStart,
  onStop,
  onStepChange,
  currentViewMode,
  onViewModeChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const demoManagerRef = useRef<DemoModeManager | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && !demoManagerRef.current) {
      demoManagerRef.current = new DemoModeManager((step) => {
        setCurrentStep(step);
        onStepChange(step);
        
        // Handle view mode changes required by certain steps
        const stepData = DEMO_TOUR_STEPS[step];
        if (stepData.requiresViewMode && stepData.requiresViewMode !== currentViewMode) {
          onViewModeChange(stepData.requiresViewMode as 'overview' | 'comparison' | 'matrix');
        }
        
        // Position tooltip
        positionTooltip(stepData.target);
      });
      
      demoManagerRef.current.start();
      setIsVisible(true);
    } else if (!isActive && demoManagerRef.current) {
      demoManagerRef.current.stop();
      demoManagerRef.current = null;
      setIsVisible(false);
    }
  }, [isActive, onStepChange, currentViewMode, onViewModeChange]);

  const positionTooltip = (targetSelector: string) => {
    const targetElement = document.querySelector(targetSelector);
    const tooltip = tooltipRef.current;
    
    if (!targetElement || !tooltip) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Calculate position
    let top = targetRect.bottom + 10;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    
    // Adjust if tooltip would go off screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = targetRect.top - tooltipRect.height - 10;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    
    // Add highlight to target element
    document.querySelectorAll('.demo-highlight').forEach(el => {
      el.classList.remove('demo-highlight');
    });
    targetElement.classList.add('demo-highlight');
  };

  const handleNext = () => {
    if (demoManagerRef.current && !demoManagerRef.current.isLastStep()) {
      demoManagerRef.current.nextStep();
    } else {
      handleStop();
    }
  };

  const handlePrevious = () => {
    if (demoManagerRef.current && !demoManagerRef.current.isFirstStep()) {
      demoManagerRef.current.previousStep();
    }
  };

  const handleStop = () => {
    // Clean up highlights
    document.querySelectorAll('.demo-highlight').forEach(el => {
      el.classList.remove('demo-highlight');
    });
    onStop();
  };

  const handleSkip = () => {
    handleStop();
  };

  if (!isVisible || !isActive) {
    return null; // Remove duplicate tour button - using MovableTourButton instead
  }

  const stepData = DEMO_TOUR_STEPS[currentStep];
  const isLastStep = currentStep === DEMO_TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay */}
      <div className="demo-overlay" onClick={handleStop} />
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="demo-tooltip"
        role="dialog"
        aria-labelledby="demo-title"
        aria-describedby="demo-description"
      >
        <div className="demo-tooltip-header">
          <h3 id="demo-title">{stepData.title}</h3>
          <button 
            className="demo-close-button"
            onClick={handleStop}
            aria-label="Close tour"
          >
            ×
          </button>
        </div>
        
        <div className="demo-tooltip-body">
          <p id="demo-description">{stepData.description}</p>
        </div>
        
        <div className="demo-tooltip-footer">
          <div className="demo-progress">
            <span className="demo-step-counter">
              {currentStep + 1} of {DEMO_TOUR_STEPS.length}
            </span>
            <div className="demo-progress-bar">
              <div 
                className="demo-progress-fill"
                style={{ width: `${((currentStep + 1) / DEMO_TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="demo-controls">
            <button 
              className="demo-button demo-button-secondary"
              onClick={handleSkip}
            >
              Skip Tour
            </button>
            
            <div className="demo-navigation">
              <button 
                className="demo-button demo-button-secondary"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                Previous
              </button>
              
              <button 
                className="demo-button demo-button-primary"
                onClick={handleNext}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoTour;