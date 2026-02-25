"use client"
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../ThemeContext';

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const resolvedTheme = theme ?? "light";

  return (
    <div id="theme-container">
      <button
        aria-label="Change Theme"
        id="change-theme"
        data-testid="theme-button"
        className="bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-slate-50 font-bold rounded-full w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={toggleTheme}
        type="button"
      >
        <FontAwesomeIcon
          icon={faSun}
          className={`theme-icon sun-icon text-yellow-400 ${resolvedTheme === "light" ? "active" : ""} ${resolvedTheme === "dark" ? "hidden" : ""}`}
        />
        <FontAwesomeIcon
          icon={faMoon}
          className={`theme-icon moon-icon text-slate-200 ${resolvedTheme === "dark" ? "active" : ""} ${resolvedTheme === "light" ? "hidden" : ""}`}
        />
      </button>    
    </div>
  );
}

export default ThemeButton;
