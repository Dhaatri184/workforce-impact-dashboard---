import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'spinner'
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`loading-dots ${size}`}>
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`loading-pulse ${size}`}>
            <div className="pulse-circle" />
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <div className={`loading-spinner ${size}`}>
            <div className="spinner-circle">
              <div className="spinner-path" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="loading-container">
      {renderSpinner()}
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;