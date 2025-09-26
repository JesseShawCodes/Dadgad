
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides a default theme of "light"', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggles the theme from "light" to "dark"', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const button = screen.getByText('Toggle Theme');
    fireEvent.click(button);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('toggles the theme from "dark" to "light"', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const button = screen.getByText('Toggle Theme');
    fireEvent.click(button);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('loads the theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('sets the data-bs-theme attribute on the body', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(document.body).toHaveAttribute('data-bs-theme', 'light');
    const button = screen.getByText('Toggle Theme');
    fireEvent.click(button);
    expect(document.body).toHaveAttribute('data-bs-theme', 'dark');
  });
});
