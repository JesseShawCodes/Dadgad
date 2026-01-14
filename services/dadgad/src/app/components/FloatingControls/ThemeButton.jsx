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
        className="bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center transition-all"
        onClick={toggleTheme}
        type="button"
      >
        <FontAwesomeIcon
          icon={faSun}
          className={`theme-icon text-white sun-icon ${theme === 'light' ? 'active' : ''} ${theme === 'dark' ? 'hidden' : ''}`}
        />
        <FontAwesomeIcon
          icon={faMoon}
          className={`theme-icon text-white moon-icon ${theme === 'dark' ? 'active' : ''} ${theme === 'light' ? 'hidden' : ''}`}
        />
      </button>    
    </div>
  );
}

export default ThemeButton;
