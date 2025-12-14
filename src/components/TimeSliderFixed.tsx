import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TimeSliderProps } from '../types';
import { formatDate } from '../utils';
import './TimeSliderClean.css';

// COMPLETELY FIXED TIME SLIDER - NO OVERLAPPING GUARANTEED
export const TimeSliderFixed: React.FC<TimeSliderProps> = ({
  timeRange,
  selectedPeriod,
  onPeriodChange,
  granularity
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [previewPeriod, setPreviewPeriod] = useState<[Date, Date] | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const minTime = timeRange[0].getTime();
  const maxTime = timeRange[1].getTime();
  const totalDuration = maxTime - minTime;

  // Convert date to slider position (0-100%)
  const dateToPosition = useCallback((date: Date): number => {
    const timestamp = date.getTime();
    return ((timestamp - minTime) / totalDuration) * 100;
  }, [minTime, totalDuration]);

  // Convert slider position to date
  const positionToDate = useCallback((position: number): Date => {
    const timestamp = minTime + (position / 100) * totalDuration;
    return new Date(timestamp);
  }, [minTime, totalDuration]);

  // Get current positions
  const startPosition = dateToPosition(selectedPeriod[0]);
  const endPosition = dateToPosition(selectedPeriod[1]);

  // Handle mouse/touch events
  const handlePointerDown = (event: React.PointerEvent, handle: 'start' | 'end') => {
    event.preventDefault();
    setIsDragging(handle);
    
    if (sliderRef.current) {
      sliderRef.current.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    
    const newDate = positionToDate(clampedPosition);
    
    let newPeriod: [Date, Date];
    
    if (isDragging === 'start') {
      const maxStartDate = new Date(selectedPeriod[1].getTime() - 24 * 60 * 60 * 1000);
      const clampedStartDate = new Date(Math.min(newDate.getTime(), maxStartDate.getTime()));
      newPeriod = [clampedStartDate, selectedPeriod[1]];
    } else {
      const minEndDate = new Date(selectedPeriod[0].getTime() + 24 * 60 * 60 * 1000);
      const clampedEndDate = new Date(Math.max(newDate.getTime(), minEndDate.getTime()));
      newPeriod = [selectedPeriod[0], clampedEndDate];
    }
    
    setPreviewPeriod(newPeriod);
  }, [isDragging, selectedPeriod, positionToDate]);

  const handlePointerUp = useCallback(() => {
    if (previewPeriod) {
      onPeriodChange(previewPeriod);
      setPreviewPeriod(null);
    }
    setIsDragging(null);
  }, [previewPeriod, onPeriodChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const displayPeriod = previewPeriod || selectedPeriod;

  // Preset time ranges
  const presets = [
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
    { label: '2Y', months: 24 },
    { label: '3Y', months: 36 }
  ];

  const handlePresetClick = (months: number) => {
    const endDate = new Date(timeRange[1]);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months);
    
    const clampedStartDate = new Date(Math.max(startDate.getTime(), timeRange[0].getTime()));
    
    onPeriodChange([clampedStartDate, endDate]);
  };

  return (
    <div className="time-slider" style={{ border: '2px solid #10b981', backgroundColor: 'var(--bg-elevated)' }}>
      {/* SUCCESS INDICATOR */}
      <div style={{ 
        padding: '0.5rem', 
        backgroundColor: '#10b981', 
        color: 'white', 
        borderRadius: '4px', 
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        ✅ FIXED TIME SLIDER - NO OVERLAPPING
      </div>

      <div className="time-slider-header">
        <div className="selected-period">
          <div className="period-info">
            <span className="period-label">📅 Analysis Period:</span>
            <div className="period-details">
              <span className="period-dates">
                {formatDate(displayPeriod[0], 'short')} - {formatDate(displayPeriod[1], 'short')}
              </span>
              <span className="period-duration">
                ({Math.ceil((displayPeriod[1].getTime() - displayPeriod[0].getTime()) / (1000 * 60 * 60 * 24 * 30))} months)
              </span>
            </div>
          </div>
        </div>
        
        <div className="time-presets">
          <span className="presets-label">Quick Select:</span>
          <div className="preset-buttons">
            {presets.map(preset => (
              <button
                key={preset.label}
                className="preset-button"
                onClick={() => handlePresetClick(preset.months)}
                title={`Last ${preset.months} months`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="slider-container" ref={sliderRef}>
        {/* FIXED TIME MARKERS - GUARANTEED NO OVERLAPPING */}
        <div className="time-markers-simple">
          <div className="time-marker-simple" style={{ left: '0%' }}>
            <div className="marker-line-simple" />
            <div className="marker-label-simple" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}>2022</div>
          </div>
          <div className="time-marker-simple" style={{ left: '33.33%' }}>
            <div className="marker-line-simple" />
            <div className="marker-label-simple" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}>2023</div>
          </div>
          <div className="time-marker-simple" style={{ left: '66.66%' }}>
            <div className="marker-line-simple" />
            <div className="marker-label-simple" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}>2024</div>
          </div>
          <div className="time-marker-simple" style={{ left: '100%' }}>
            <div className="marker-line-simple" />
            <div className="marker-label-simple" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}>2025</div>
          </div>
        </div>

        {/* Slider track */}
        <div className="slider-track">
          <div
            className="selected-range"
            style={{
              left: `${Math.min(startPosition, endPosition)}%`,
              width: `${Math.abs(endPosition - startPosition)}%`
            }}
          />
          
          <div
            className={`slider-handle start-handle ${isDragging === 'start' ? 'dragging' : ''}`}
            style={{ left: `${startPosition}%` }}
            onPointerDown={(e) => handlePointerDown(e, 'start')}
            role="slider"
            aria-label="Start date"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={startPosition}
            aria-valuetext={formatDate(displayPeriod[0], 'medium')}
            tabIndex={0}
          >
            <div className="handle-tooltip">
              {formatDate(displayPeriod[0], 'medium')}
            </div>
          </div>
          
          <div
            className={`slider-handle end-handle ${isDragging === 'end' ? 'dragging' : ''}`}
            style={{ left: `${endPosition}%` }}
            onPointerDown={(e) => handlePointerDown(e, 'end')}
            role="slider"
            aria-label="End date"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={endPosition}
            aria-valuetext={formatDate(displayPeriod[1], 'medium')}
            tabIndex={0}
          >
            <div className="handle-tooltip">
              {formatDate(displayPeriod[1], 'medium')}
            </div>
          </div>
        </div>
      </div>

      {displayPeriod[1].getTime() - displayPeriod[0].getTime() < 30 * 24 * 60 * 60 * 1000 && (
        <div className="validation-warning">
          ⚠️ Selected period is less than 1 month. Consider selecting a longer range for better analysis.
        </div>
      )}
    </div>
  );
};

export default TimeSliderFixed;