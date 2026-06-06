"use client"
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

// Types for theme
type Theme = "light" | "dark";

// Interface for Theme Context
interface ThemeContextType {
  theme: Theme | undefined;
  toggleTheme: () => void;
}

// Create context with a default value.
// Default value should match the shape of context type.
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// custom hook to use the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Define the props for your ThemeProvider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem("theme") as Theme | null;
}

function getServerSnapshot() {
  return undefined;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const storedTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  // Use a fallback for the theme value
  const theme = storedTheme || "light";

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    // useSyncExternalStore won't see local changes unless we dispatch an event
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
