"use client"
import { createContext, useContext, useEffect, useState } from "react";

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

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    // Correctly handle the potential undefined state
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    if (!theme) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
