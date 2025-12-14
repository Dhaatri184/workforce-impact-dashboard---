import React, { useState, useRef, useEffect } from 'react';
import './MovableTourButton.css';

interface MovableTourButtonProps {
  onStartTour: () => void;
  isVisible?: boolean;
}

interface Position {
  x: number;
  y: number;
}

export const MovableTourButton: React.FC<MovableTourButtonProps> = ({
  onStartTour,
  isVisible = true
}) => {
  const [position, setPosition] = useState<Position>(() => {
    // Get saved position from localStorage or use default
    const saved = localStorage.getItem('tour-button-position');
    if (saved) {
      return JSON.parse(saved);
    }
    return { x: 20, y: 20 }; // Default top-left position
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tour-button-position', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep button within viewport bounds
    const maxX = window.innerWidth - 200; // Button width
    const maxY = window.innerHeight - 60; // Button height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleTourClick = () => {
    if (!isDragging) {
      onStartTour();
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition({ x: 20, y: 20 });
  };

  const moveToCorner = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const padding = 20;
    const buttonWidth = 200;
    const buttonHeight = 80;
    
    let newPosition: Position;
    
    switch (corner) {
      case 'top-left':
        newPosition = { x: padding, y: padding };
        break;
      case 'top-right':
        newPosition = { x: window.innerWidth - buttonWidth - padding, y: padding };
        break;
      case 'bottom-left':
        newPosition = { x: padding, y: window.innerHeight - buttonHeight - padding };
        break;
      case 'bottom-right':
        newPosition = { x: window.innerWidth - buttonWidth - padding, y: window.innerHeight - buttonHeight - padding };
        break;
    }
    
    setPosition(newPosition);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={buttonRef}
      className={`movable-tour-button ${isDragging ? 'dragging' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleTourClick}
    >
      {/* Drag Handle */}
      <div className="drag-handle">
        <span className="drag-dots">⋮⋮</span>
      </div>
      
      {/* Main Button Content */}
      <div className="button-content">
        {!isMinimized ? (
          <>
            <div className="tour-icon">🎯</div>
            <div className="tour-text">
              <span className="tour-title">Take a Tour</span>
              <span className="tour-subtitle">Learn the dashboard</span>
            </div>
          </>
        ) : (
          <div className="tour-icon-mini">🎯</div>
        )}
      </div>
      
      {/* Control Buttons */}
      <div className="control-buttons">
        <button
          className="control-btn minimize-btn"
          onClick={toggleMinimize}
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? '⬆' : '⬇'}
        </button>
        
        <button
          className="control-btn reset-btn"
          onClick={resetPosition}
          title="Reset to top-left"
        >
          🏠
        </button>
      </div>
      
      {/* Quick Position Menu */}
      {!isMinimized && (
        <div className="quick-positions">
          <div className="position-grid">
            <button 
              className="position-btn" 
              onClick={() => moveToCorner('top-left')}
              title="Move to top-left"
            >
              ↖
            </button>
            <button 
              className="position-btn" 
              onClick={() => moveToCorner('top-right')}
              title="Move to top-right"
            >
              ↗
            </button>
            <button 
              className="position-btn" 
              onClick={() => moveToCorner('bottom-left')}
              title="Move to bottom-left"
            >
              ↙
            </button>
            <button 
              className="position-btn" 
              onClick={() => moveToCorner('bottom-right')}
              title="Move to bottom-right"
            >
              ↘
            </button>
          </div>
        </div>
      )}
      
      {/* Position Indicator */}
      <div className="position-indicator">
        Drag me anywhere!
      </div>
    </div>
  );
};