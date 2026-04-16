"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "yt-intel-theme";

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Read persisted preference once on mount; defer setState so it is not synchronous in the effect body.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark") {
        queueMicrotask(() => setIsDark(true));
      }
    } catch {
      // localStorage unavailable — ignore
    }
  }, []);

  // Keep the .dark class on <html> in sync with state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggle = useCallback(() => {
    // Briefly add the transition class so colors fade instead of flashing
    document.documentElement.classList.add("theme-transitioning");
    setIsDark((v) => !v);
    // Remove after transition finishes (matches longest duration: 0.8s)
    const id = setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
