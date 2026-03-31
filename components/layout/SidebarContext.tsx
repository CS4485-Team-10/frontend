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
  const [collapsed,   setCollapsed]   = useState(false);
  const [compactMode, setCompactModeState] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedCompact = window.localStorage.getItem(COMPACT_STORAGE_KEY);
      if (savedCompact === "true") {
        setCompactModeState(true);
        setCollapsed(true);
        return;
      }
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "true")       setCollapsed(true);
      else if (saved === "false") setCollapsed(false);
      else if (window.matchMedia("(max-width: 767px)").matches) setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  // When compactMode turns on, force-collapse and lock; when off, restore
  const setCompactMode = useCallback((v: boolean) => {
    setCompactModeState(v);
    try { window.localStorage.setItem(COMPACT_STORAGE_KEY, String(v)); } catch { /* ignore */ }
    if (v) {
      setCollapsed(true);
      try { window.localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
    }
  }, []);

  // toggle is a no-op while compactMode is active
  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try { window.localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ collapsed, compactMode, toggle: compactMode ? () => {} : toggle, setCompactMode }),
    [collapsed, compactMode, toggle, setCompactMode],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}
