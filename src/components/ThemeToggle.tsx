// src/components/ThemeToggle.tsx
// Komponen switch tema (Light/Dark) pill-toggle dengan efek transisi spring

import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle" 
      aria-label="Toggle theme mode"
    >
      <div className="theme-toggle-thumb">
        {theme === 'light' ? '☀️' : '🌙'}
      </div>
      <div className="theme-toggle-icons">
        <span>☀️</span>
        <span>🌙</span>
      </div>
    </button>
  );
};
