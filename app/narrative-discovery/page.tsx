"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { NarrativeListResponse, NarrativeItem } from "@/lib/types/narrative";

type RiskLevel = "High" | "Medium" | "Low";

// Helpers
function riskBadgeClasses(level: RiskLevel) {
  switch (level) {
    case "High":   return "bg-red-50 text-red-700 ring-1 ring-red-100";
    case "Medium": return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    case "Low":    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    default:       return "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100";
  }
}

type SortOption = "trending" | "risk" | "views";

export default function NarrativeDiscoveryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500 text-sm">Loading components...</div>}>
      <NarrativeDiscoveryInner />
    </Suspense>
  );
}

function NarrativeDiscoveryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [narratives, setNarratives] = useState<NarrativeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Fetch from API when sort or debounced search changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await apiFetch<NarrativeListResponse>("/narratives", {
          sort_by: sortBy,
          search: debouncedSearch.trim() || undefined,
        });
        if (!cancelled) {
          setNarratives(response.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sortBy, debouncedSearch]);

  // URL + loaded data determine which narrative is open (derived state — no effect).
  const activeNarrative = useMemo(() => {
    const id = searchParams.get("id");
    if (!id || narratives.length === 0) return null;
    return narratives.find((n) => String(n.id) === String(id)) ?? null;
  }, [searchParams, narratives]);

  function openNarrative(n: NarrativeItem) {
    router.replace(`/narrative-discovery?id=${n.id}`, { scroll: false });
  }

  function closeNarrative() {
    router.replace("/narrative-discovery", { scroll: false });
  }

  const visibleNarratives = narratives;

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl p-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Failed to load narratives: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-8">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Narrative Discovery
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Explore emerging narratives and trending stories across YouTube content.
        </p>
      </header>

      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 3.5 3.5" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search narratives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
          >
            <option value="trending">Trending</option>
            <option value="risk">Risk Score</option>
            <option value="views">Total Views</option>
          </select>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">Scanning social data...</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleNarratives.map((narrative) => (
            <article
              key={narrative.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{narrative.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{narrative.description}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${riskBadgeClasses(narrative.risk_level)}`}>
                    {narrative.risk_level}
                  </span>
                </div>

                <dl className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Videos:</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">{narrative.videos_analyzed?.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Total Views:</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">{narrative.total_views}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">Risk Score:</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">{narrative.risk_score}/10</dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={() => openNarrative(narrative)}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Explore Narrative
              </button>
            </article>
          ))}
        </section>
      )}

      {activeNarrative && (
        <NarrativeDetailDialog narrative={activeNarrative} onClose={closeNarrative} />
      )}
    </div>
  );
}

function NarrativeDetailDialog({ narrative, onClose }: { narrative: NarrativeItem; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="backdrop-enter fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 px-4 pb-10 pt-16 backdrop-blur-sm sm:pt-20"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="dialog-enter my-2 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="narrative-dialog-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="narrative-dialog-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {narrative.title}
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{narrative.category}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${riskBadgeClasses(narrative.risk_level)}`}>
            {narrative.risk_level} RISK
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{narrative.detail || narrative.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          <div>
            <dt className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Analyzed</dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{narrative.videos_analyzed?.toLocaleString()} Videos</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Views</dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{narrative.total_views}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Risk Score</dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{narrative.risk_score}/10</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Window</dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{narrative.time_window}</dd>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-10 w-full rounded-lg bg-zinc-100 font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
