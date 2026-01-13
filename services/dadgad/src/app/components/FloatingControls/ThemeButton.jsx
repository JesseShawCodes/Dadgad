"use client"
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../ThemeContext';

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div id="theme-container">
      <button
        aria-label="Change Theme"
        id="change-theme"
        data-testid="theme-button"
        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all"
        onClick={toggleTheme}
        type="button"
      >
        {/* Sun Icon for Light Theme */}
        <div className={`${theme === 'dark' ? 'hidden' : ''}`} >
        <FontAwesomeIcon 
          icon={faSun} 
          className={`text-white sun-icon ${theme === 'light' ? 'active' : ''}`} 
        />
        </div>
        {/* Moon Icon for Dark Theme */}
        <div className={`${theme === 'light' ? 'hidden' : ''}`} >
        <FontAwesomeIcon 
          icon={faMoon} 
          className={`text-white moon-icon ${theme === 'dark' ? 'active' : ''}`} 
        />
        </div>
      </button>
    </div>
  );
}

export default ThemeButton;
