import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TimeSliderProps } from '../types';
import { formatDate } from '../utils';
import './TimeSliderClean.css';
// Force browser refresh - timestamp: 2024-12-13-15:30

export const TimeSlider: React.FC<TimeSliderProps> = ({
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
      // Ensure start doesn't go past end
      const maxStartDate = new Date(selectedPeriod[1].getTime() - 24 * 60 * 60 * 1000); // At least 1 day before end
      const clampedStartDate = new Date(Math.min(newDate.getTime(), maxStartDate.getTime()));
      newPeriod = [clampedStartDate, selectedPeriod[1]];
    } else {
      // Ensure end doesn't go before start
      const minEndDate = new Date(selectedPeriod[0].getTime() + 24 * 60 * 60 * 1000); // At least 1 day after start
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

  // Set up global event listeners for dragging
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

  // ULTRA SIMPLE: No dynamic generation, just fixed years
  const timeMarkers = [
    { year: '2022', position: 0 },
    { year: '2023', position: 33.33 },
    { year: '2024', position: 66.66 },
    { year: '2025', position: 100 }
  ];
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
    
    // Ensure start date doesn't go before the minimum
    const clampedStartDate = new Date(Math.max(startDate.getTime(), timeRange[0].getTime()));
    
    onPeriodChange([clampedStartDate, endDate]);
  };

  return (
    <div className="time-slider">
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
        {/* ULTRA SIMPLE Time markers - GUARANTEED NO OVERLAPPING */}
        <div className="time-markers-simple">
          {timeMarkers.map((marker, index) => (
            <div 
              key={marker.year}
              className="time-marker-simple"
              style={{ left: `${marker.position}%` }}
            >
              <div className="marker-line-simple" />
              <div className="marker-label-simple">{marker.year}</div>
            </div>
          ))}
        </div>

        {/* Slider track */}
        <div className="slider-track">
          {/* Selected range */}
          <div
            className="selected-range"
            style={{
              left: `${Math.min(startPosition, endPosition)}%`,
              width: `${Math.abs(endPosition - startPosition)}%`
            }}
          />
          
          {/* Start handle */}
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
          
          {/* End handle */}
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

      {/* Range validation feedback */}
      {displayPeriod[1].getTime() - displayPeriod[0].getTime() < 30 * 24 * 60 * 60 * 1000 && (
        <div className="validation-warning">
          ⚠️ Selected period is less than 1 month. Consider selecting a longer range for better analysis.
        </div>
      )}
    </div>
  );
};

export default TimeSlider;