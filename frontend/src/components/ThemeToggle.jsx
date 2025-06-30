// frontend/src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <button 
      className={`theme-toggle ${darkMode ? 'dark' : ''}`}
      onClick={toggleDarkMode}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="toggle-icon">
        {darkMode ? <Moon size={16} /> : <Sun size={16} />}
      </div>
    </button>
  );
};

export default ThemeToggle;