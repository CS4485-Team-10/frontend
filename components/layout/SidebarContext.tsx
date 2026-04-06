"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY         = "yt-sidebar-collapsed";
const COMPACT_STORAGE_KEY = "yt-sidebar-compact";

type SidebarCtx = {
  collapsed:        boolean;
  compactMode:      boolean;
  toggle:           () => void;
  setCompactMode:   (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // 1. Initialize state directly from localStorage to prevent "cascading renders"
  const [compactMode, setCompactModeState] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(COMPACT_STORAGE_KEY) === "true";
    }
    return false;
  });

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCompact = window.localStorage.getItem(COMPACT_STORAGE_KEY);
      if (savedCompact === "true") return true;
      
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === "true";
      
      return window.matchMedia("(max-width: 767px)").matches;
    }
    return false;
  });

  // 2. This useEffect is now only for edge cases or syncing, 
  // but since we initialize in useState, we can often remove the sync calls here.
  useEffect(() => {
    // Keep this empty or use it only for window resize listeners
  }, []);

  const setCompactMode = useCallback((v: boolean) => {
    setCompactModeState(v);
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem(COMPACT_STORAGE_KEY, String(v)); } catch { /* ignore */ }
    }
    if (v) {
      setCollapsed(true);
      if (typeof window !== "undefined") {
        try { window.localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (compactMode) return; // Prevent toggle if in compact mode
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") {
        try { window.localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      }
      return next;
    });
  }, [compactMode]);

  const value = useMemo(
    () => ({ 
        collapsed, 
        compactMode, 
        toggle, 
        setCompactMode 
    }),
    [collapsed, compactMode, toggle, setCompactMode],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}