"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type RiskLevel = "High" | "Medium" | "Low";

interface Narrative {
  id: string | number;
  title: string;
  description?: string;
  detail?: string;
  category: string;
  risk_level: RiskLevel;
  risk_score: number;
  videos_analyzed: number;
  total_views: string;
  time_window: string;
}

// Helpers
function riskBadgeClasses(level: RiskLevel) {
  switch (level) {
    case "High":   return "bg-red-50 text-red-700 ring-1 ring-red-100";
    case "Medium": return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    case "Low":    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    default:       return "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100";
  }
}

function parseViews(value: string) {
  if (!value) return 0;
  const t = value.trim().toUpperCase();
  const multiplier = t.endsWith("M") ? 1_000_000 : t.endsWith("K") ? 1_000 : 1;
  const num = parseFloat(t.replace(/[MK,]/g, ""));
  return Number.isNaN(num) ? 0 : num * multiplier;
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

  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [activeNarrative, setActiveNarrative] = useState<Narrative | null>(null);

  // Fetch Logic
  useEffect(() => {
    fetch("/mock/mockdata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not find mockdata.json");
        return res.json();
      })
      .then((fullData) => {
        setNarratives(fullData.narrative_discovery || []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // FIXED: DEEP-LINK LOGIC
  // Wrapped in setTimeout to resolve the "cascading renders" lint error
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || narratives.length === 0) return;

    const found = narratives.find((n) => String(n.id) === String(id)) ?? null;
    
    if (found?.id !== activeNarrative?.id) {
      const timer = setTimeout(() => {
        setActiveNarrative(found);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, narratives, activeNarrative]);

  function openNarrative(n: Narrative) {
    setActiveNarrative(n);
    router.replace(`/narrative-discovery?id=${n.id}`, { scroll: false });
  }

  function closeNarrative() {
    setActiveNarrative(null);
    router.replace("/narrative-discovery", { scroll: false });
  }

  const visibleNarratives = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = [...narratives];
    
    if (term) {
      return result.filter((n) =>
        `${n.title} ${n.description ?? ""}`.toLowerCase().includes(term)
      );
    }

    if (sortBy === "risk") {
      result.sort((a, b) => b.risk_score - a.risk_score);
    } else if (sortBy === "views") {
      result.sort((a, b) => parseViews(b.total_views) - parseViews(a.total_views));
    }
    
    return result;
  }, [search, sortBy, narratives]);

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
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Narrative Discovery
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
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
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">Sort by</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="trending">Trending</option>
              <option value="risk">Risk Score</option>
              <option value="views">Total Views</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-zinc-500 animate-pulse">Scanning social data...</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleNarratives.map((narrative) => (
            <article
              key={narrative.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{narrative.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{narrative.description}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${riskBadgeClasses(narrative.risk_level)}`}>
                    {narrative.risk_level}
                  </span>
                </div>

                <dl className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Videos:</dt>
                    <dd className="font-medium text-zinc-900">{narrative.videos_analyzed?.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Total Views:</dt>
                    <dd className="font-medium text-zinc-900">{narrative.total_views}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Risk Score:</dt>
                    <dd className="font-medium text-zinc-900">{narrative.risk_score}/10</dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={() => openNarrative(narrative)}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
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

function NarrativeDetailDialog({ narrative, onClose }: { narrative: Narrative; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{narrative.title}</h2>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">{narrative.category}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${riskBadgeClasses(narrative.risk_level)}`}>
            {narrative.risk_level} RISK
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600">{narrative.detail || narrative.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div>
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">Analyzed</dt>
            <dd className="text-sm font-semibold text-zinc-900">{narrative.videos_analyzed?.toLocaleString()} Videos</dd>
          </div>
          <div>
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">Views</dt>
            <dd className="text-sm font-semibold text-zinc-900">{narrative.total_views}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">Risk Score</dt>
            <dd className="text-sm font-semibold text-zinc-900">{narrative.risk_score}/10</dd>
          </div>
          <div>
            <dt className="text-[10px] text-zinc-400 uppercase font-bold">Window</dt>
            <dd className="text-sm font-semibold text-zinc-900">{narrative.time_window}</dd>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full h-10 bg-zinc-100 text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}