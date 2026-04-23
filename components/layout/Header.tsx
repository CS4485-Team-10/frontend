"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AlertListResponse, AlertItem } from "@/lib/types/alert";
import { useSidebar } from "./SidebarContext";
import { useNotifications } from "./NotificationContext";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { User, Settings, LogOut, ChevronDown, Bell } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const { compactMode, toggle } = useSidebar();
  const { notifHighRisk, notifMediumRisk } = useNotifications();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [allAlerts, setAllAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    apiFetch<AlertListResponse>("/alerts")
      .then((res) => setAllAlerts(res.data))
      .catch(() => {});
  }, []);

  function handleGoToAlerts() {
    setIsBellOpen(false);
    router.push("/alerts-settings");
  }

  const visibleNarratives = useMemo(() => {
    return allAlerts.filter((n) => {
      if (n.risk_level === "High" && notifHighRisk) return true;
      if (n.risk_level === "Medium" && notifMediumRisk) return true;
      return false;
    });
  }, [allAlerts, notifHighRisk, notifMediumRisk]);

  const badgeCount = visibleNarratives.length;

  const profileWrapRef = useRef<HTMLDivElement | null>(null);
  const bellWrapRef     = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (profileWrapRef.current && e.target instanceof Node && !profileWrapRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (bellWrapRef.current && e.target instanceof Node && !bellWrapRef.current.contains(e.target)) {
        setIsBellOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#1A1A1A] px-4 font-sans">
      {/* Left: Hamburger & Logo */}
      <div className="flex items-center gap-2">
        {!compactMode && (
          <button
            type="button"
            onClick={toggle}
            className="cursor-pointer rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <Link href="/executive-overview" className="flex items-center gap-3 rounded px-2 py-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
          <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#2D2D2D]">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
                <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
             </svg>
          </div>
          <h1 className="text-lg font-medium text-white">YouTube Intelligence</h1>
        </Link>
      </div>

      {/* Right: Theme toggle + Notifications + Profile */}
      <div className="flex items-center gap-4">

        {/* Sun / Moon toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="cursor-pointer rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {isDark ? (
            /* Sun icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
              <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zM2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2zM11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0zm0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0zM5.99 4.58a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06z"/>
            </svg>
          ) : (
            /* Moon icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          )}
        </button>

        <div className="relative" ref={bellWrapRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen((v) => !v)}
            className="relative cursor-pointer rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Bell className="size-5" />
            {badgeCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {badgeCount}
              </span>
            )}
          </button>

          {isBellOpen && (
            <div className="dropdown-enter absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notifications</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{badgeCount} narrative alert{badgeCount !== 1 ? "s" : ""} detected</p>
              </div>
              <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-700">
                {visibleNarratives.length === 0 ? (
                  <p className="px-4 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">No active alerts</p>
                ) : visibleNarratives.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <span className={`mt-1 size-2 shrink-0 rounded-full ${n.risk_level === "High" ? "bg-red-500" : "bg-amber-400"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 line-clamp-1 dark:text-zinc-100">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-700">
                <button onClick={handleGoToAlerts} className="w-full rounded-lg bg-zinc-900 py-2 text-center text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileWrapRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-3 hover:bg-white/10 p-1.5 rounded-lg transition-colors group"
          >
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-semibold text-white leading-none">UTDesign</span>
              <span className="text-[10px] text-white/60">UT Dallas</span>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-zinc-700 border border-zinc-500 group-hover:border-white transition-all overflow-hidden">
              <User className="text-white w-5 h-5" />
            </div>
            <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="dropdown-enter absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl z-[100] dark:border-zinc-700 dark:bg-zinc-900">
              <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Signed in as</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">admin@cs4485.com</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { setIsProfileOpen(false); router.push('/alerts-settings'); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Settings className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                  System Settings
                </button>
              </div>

              <div className="mx-2 h-px bg-zinc-100 dark:bg-zinc-700" />

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { logout(); router.push("/"); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="size-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}