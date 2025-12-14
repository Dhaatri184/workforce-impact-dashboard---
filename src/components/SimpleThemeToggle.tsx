import React, { useState, useEffect } from 'react';
import './SimpleThemeToggle.css';

export const SimpleThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('workforce-dashboard-theme') || 'dark';
    const isDarkMode = savedTheme === 'dark';
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
  }, []);

  const applyTheme = (darkMode: boolean) => {
    const theme = darkMode ? 'dark' : 'light';
    
    // NUCLEAR THEME APPLICATION - FORCE ALL ELEMENTS
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#ffffff';
    document.body.style.color = darkMode ? '#f8fafc' : '#0f172a';
    
    // Force root element
    const root = document.getElementById('root');
    if (root) {
      root.style.backgroundColor = darkMode ? '#0f172a' : '#ffffff';
      root.style.color = darkMode ? '#f8fafc' : '#0f172a';
    }
    
    // Save to localStorage
    localStorage.setItem('workforce-dashboard-theme', theme);
    
    // Force a style recalculation
    document.body.offsetHeight;
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setClickCount(prev => prev + 1);
    applyTheme(newIsDark);
    
    // Show visual feedback
    console.log(`🎨 THEME SWITCHED TO ${newIsDark ? 'DARK' : 'LIGHT'} MODE - Click #${clickCount + 1}`);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* NUCLEAR SUCCESS INDICATOR */}
      {clickCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          zIndex: 10000,
          animation: 'fadeOut 2s forwards'
        }}>
          THEME CHANGED #{clickCount}
        </div>
      )}
      
      <button 
        className="simple-theme-toggle nuclear-theme-button"
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{
          background: isDark ? '#fbbf24' : '#1e293b',
          color: isDark ? '#000000' : '#ffffff',
          border: '3px solid ' + (isDark ? '#f59e0b' : '#60a5fa'),
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '20px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transform: clickCount > 0 ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <span className="theme-icon" style={{ fontSize: '24px' }}>
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  );
};

export default SimpleThemeToggle;