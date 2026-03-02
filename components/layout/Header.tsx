"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement | null>(null);

  const logoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
      <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
    </svg>
  );

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const el = profileWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setIsProfileOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#1A1A1A] px-6 font-sans">
      <Link
        href="/"
        className="flex items-center gap-3 rounded px-2 py-1 -ml-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label="Go to Executive Overview"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#2D2D2D]" aria-hidden>
          {logoIcon}
        </div>
        <h1 className="text-lg font-medium text-white">YouTube Intelligence</h1>
      </Link>

      <div className="flex items-center gap-6">
        {/* UTDesign / UT Dallas */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded bg-[#2D2D2D] text-xs font-semibold text-white">
            UT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">UTDesign</span>
            <span className="text-xs text-white/80">UT Dallas</span>
          </div>
        </div>

        {/* Notifications */}
        <Link
          href="/alerts-settings"
          className="rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </Link>

        {/* User profile */}
        <div className="relative" ref={profileWrapRef}>
          <button
            type="button"
            className="rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                onClick={() => setIsProfileOpen(false)}
              >
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                onClick={() => setIsProfileOpen(false)}
              >
                Settings
              </button>
              <div className="h-px bg-zinc-100" />
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                onClick={() => setIsProfileOpen(false)}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
