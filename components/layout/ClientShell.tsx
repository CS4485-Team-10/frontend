"use client";

import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";
import type { ReactNode } from "react";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main
          className="min-w-0 flex-1 overflow-auto bg-[#F5F5F5] dark:bg-zinc-950 flex flex-col"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="flex-1">
            <PageTransition>{children}</PageTransition>
          </div>

          {/* ── Site Footer ───────────────────────────────────────────────── */}
          <footer className="border-t border-zinc-200 bg-white px-8 py-10 dark:border-zinc-800 dark:bg-zinc-900 font-sans">
            <div className="mx-auto max-w-6xl">
              {/* Top row: brand + columns */}
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* 1. Brand Column */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-white" aria-hidden>
                        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
                        <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">YouTube Intelligence</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Narrative monitoring and claim validation for YouTube content.
                  </p>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    Senior Design Team 10 · CS 4485 · UT Dallas
                  </p>
                </div>

                {/* 2. Contact Column */}
                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Contact</h4>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <li>team10@utdallas.edu</li>
                    <li>+1 (972) 111-1111</li>
                    <li>800 W Campbell Rd, Richardson, TX 75080</li>
                  </ul>
                </div>

                {/* 3. Platform Column (With working Links) */}
                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Platform</h4>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <li><Link href="/executive-overview" className="hover:underline">Executive Overview</Link></li>
                    <li><Link href="/narrative-discovery" className="hover:underline">Narrative Discovery</Link></li>
                    <li><Link href="/claim-validation" className="hover:underline">Claim Validation</Link></li>
                    <li><Link href="/trend-analytics" className="hover:underline">Trend Analytics</Link></li>
                    <li><Link href="/creator-risk-monitor" className="hover:underline">Creator Risk Monitor</Link></li>
                  </ul>
                </div>

                {/* 4. Project Column */}
                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Project</h4>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <li>CS 4485 — Senior Design</li>
                    <li>Spring 2026</li>
                    <li>UT Dallas</li>
                    <li>Team 10</li>
                  </ul>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:flex-row">
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  © 2026 YouTube Intelligence · CS 4485 Senior Design · UT Dallas
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}