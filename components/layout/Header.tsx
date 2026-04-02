"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import mock from "@/public/mock/mockdata.json";
import { useSidebar } from "./SidebarContext";
import { useNotifications } from "./NotificationContext";

const allNarratives = mock.narrative_discovery;

function riskBadgeClasses(level: string) {
  if (level === "High")   return "bg-red-50 text-red-700 ring-1 ring-red-100";
  if (level === "Medium") return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
}

export function Header() {
  const router = useRouter();
  const { collapsed, compactMode, toggle } = useSidebar();
  const { notifHighRisk, notifMediumRisk } = useNotifications();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isNavBtnAnimating, setIsNavBtnAnimating] = useState(false);

  function handleGoToAlerts() {
    setIsNavBtnAnimating(true);
    // Let the press animation play (280 ms) then navigate
    setTimeout(() => {
      setIsBellOpen(false);
      setIsNavBtnAnimating(false);
      router.push("/alerts-settings");
    }, 300);
  }

  const visibleNarratives = useMemo(() => {
    return allNarratives.filter((n) => {
      if (n.risk_level === "High" && notifHighRisk) return true;
      if (n.risk_level === "Medium" && notifMediumRisk) return true;
      return false;
    });
  }, [notifHighRisk, notifMediumRisk]);

  const badgeCount = visibleNarratives.length;

  const profileWrapRef = useRef<HTMLDivElement | null>(null);
  const bellWrapRef    = useRef<HTMLDivElement | null>(null);

  const logoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
      <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
    </svg>
  );

  // Close dropdowns when clicking outside
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
      {/* Left: hamburger (hidden in compact mode) + logo */}
      <div className="flex items-center gap-2">
        {!compactMode && (
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="cursor-pointer rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-3 rounded px-2 py-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Go to Executive Overview"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#2D2D2D]" aria-hidden>
            {logoIcon}
          </div>
          <h1 className="text-lg font-medium text-white">YouTube Intelligence</h1>
        </Link>
      </div>

      {/* Right: UTDesign, bell, profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded bg-[#2D2D2D] text-xs font-semibold text-white">
            UT
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-white">UTDesign</span>
            <span className="text-xs text-white/80">UT Dallas</span>
          </div>
        </div>

        {/* Bell notification dropdown */}
        <div className="relative" ref={bellWrapRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen((v) => !v)}
            aria-label={`Notifications — ${badgeCount} alert${badgeCount !== 1 ? "s" : ""}`}
            aria-haspopup="true"
            aria-expanded={isBellOpen}
            className="relative cursor-pointer rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {badgeCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {badgeCount}
              </span>
            )}
          </button>

          {isBellOpen && (
            <div className="dropdown-enter absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
              {/* Header */}
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">Notifications</p>
                <p className="text-xs text-zinc-500">{badgeCount} narrative alert{badgeCount !== 1 ? "s" : ""} detected</p>
              </div>

              {/* Risk rows */}
              <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
                {visibleNarratives.length === 0 ? (
                  <p className="px-4 py-4 text-center text-xs text-zinc-400">No active alerts</p>
                ) : visibleNarratives.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-50">
                    <span className={`mt-1 size-2 shrink-0 rounded-full ${n.risk_level === "High" ? "bg-red-500" : "bg-amber-400"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${riskBadgeClasses(n.risk_level)}`}>
                          {n.risk_level} Risk
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{n.description}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Score: <span className="font-medium text-zinc-600">{n.risk_score.toFixed(1)}/10</span>
                        <span className="mx-1.5">·</span>
                        Views: <span className="font-medium text-zinc-600">{n.total_views}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-100 px-4 py-2.5">
                <button
                  type="button"
                  onClick={handleGoToAlerts}
                  disabled={isNavBtnAnimating}
                  className={`block w-full cursor-pointer rounded-lg bg-zinc-900 py-2 text-center text-xs font-medium text-white hover:bg-zinc-800 ${isNavBtnAnimating ? "btn-confirm pointer-events-none" : ""}`}
                >
                  Go to Alerts &amp; Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative" ref={profileWrapRef}>
          <button
            type="button"
            className="cursor-pointer rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            aria-label="User menu"
            onClick={() => setIsProfileOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {isProfileOpen && (
            <div
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
            >
              <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50" onClick={() => setIsProfileOpen(false)}>Profile</button>
              <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50" onClick={() => setIsProfileOpen(false)}>Settings</button>
              <div className="h-px bg-zinc-100" />
              <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50" onClick={() => setIsProfileOpen(false)}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
