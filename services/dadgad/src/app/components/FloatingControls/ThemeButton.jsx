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
        <FontAwesomeIcon 
          icon={faSun} 
          className={`text-yellow-500 ${theme === 'dark' ? 'hidden' : ''}`} 
        />
        {/* Moon Icon for Dark Theme */}
        <FontAwesomeIcon 
          icon={faMoon} 
          className={`text-white ${theme === 'light' ? 'hidden' : ''}`} 
        />
      </button>
    </div>
  );
}

export default ThemeButton;
