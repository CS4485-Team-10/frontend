"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import mock from "@/public/mock/mockdata.json";
import { useSidebar } from "./SidebarContext";
import { useNotifications } from "./NotificationContext";
import { useAuth } from "./AuthContext";
import { User, Settings, LogOut, Info, ChevronDown, Bell } from "lucide-react";

// --- TYPES ---
interface Narrative {
  id: string | number;
  title: string;
  description?: string;
  risk_level: "High" | "Medium" | "Low";
}

const allNarratives = mock.narrative_discovery as Narrative[];

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const { compactMode, toggle } = useSidebar();
  const { notifHighRisk, notifMediumRisk } = useNotifications();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);

  function handleGoToAlerts() {
    setIsBellOpen(false);
    router.push("/alerts-settings");
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

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        
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
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg animate-in fade-in zoom-in duration-150">
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">Notifications</p>
                <p className="text-xs text-zinc-500">{badgeCount} narrative alert{badgeCount !== 1 ? "s" : ""} detected</p>
              </div>
              <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
                {visibleNarratives.length === 0 ? (
                  <p className="px-4 py-4 text-center text-xs text-zinc-400">No active alerts</p>
                ) : visibleNarratives.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-50">
                    <span className={`mt-1 size-2 shrink-0 rounded-full ${n.risk_level === "High" ? "bg-red-500" : "bg-amber-400"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 line-clamp-1">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-100 px-4 py-2.5">
                <button onClick={handleGoToAlerts} className="w-full rounded-lg bg-zinc-900 py-2 text-center text-xs font-medium text-white hover:bg-zinc-800">
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
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl z-[100] animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Signed in as</p>
                <p className="text-sm font-bold text-zinc-900">admin@cs4485.com</p>
              </div>

              <div className="py-1">
                <button 
                  onClick={() => { setIsProfileOpen(false); router.push('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <User className="w-4 h-4 text-zinc-500" />
                  Account Information
                </button>

                <button 
                  onClick={() => { setIsProfileOpen(false); router.push('/alerts-settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-zinc-500" />
                  System Settings
                </button>
              </div>

              <div className="h-px bg-zinc-100 mx-2" />

              <div className="py-1">
                <button 
                  onClick={() => { setIsProfileOpen(false); router.push('/help'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Info className="w-4 h-4 text-zinc-500" />
                  Help & Support
                </button>

                <button 
                  onClick={() => { logout(); router.push("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
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