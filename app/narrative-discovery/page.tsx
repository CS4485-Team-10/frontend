"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { NarrativeItem, NarrativeListResponse } from "@/lib/types/narrative";

type RiskLevel = "High" | "Medium" | "Low";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function riskBadgeClasses(level: RiskLevel) {
  switch (level) {
    case "High":   return "bg-red-50 text-red-700 ring-1 ring-red-100";
    case "Medium": return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    case "Low":    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }
}

function parseViews(value: string) {
  const t = value.trim().toUpperCase();
  const multiplier = t.endsWith("M") ? 1_000_000 : t.endsWith("K") ? 1_000 : 1;
  const num = parseFloat(t.replace(/[MK]/g, ""));
  return Number.isNaN(num) ? 0 : num * multiplier;
}

type SortOption = "trending" | "risk" | "views";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NarrativeDiscoveryPage() {
  return (
    <Suspense>
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
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [activeNarrative, setActiveNarrative] = useState<NarrativeItem | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch<NarrativeListResponse>(`/narratives?sort_by=${sortBy}`)
      .then((res) => {
        setNarratives(res.data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sortBy]);

  // Deep-link: open modal if ?id=<narrativeId> is present in the URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const found = narratives.find((n) => n.id === id) ?? null;
    setActiveNarrative(found);
  }, [searchParams, narratives]);

  function openNarrative(n: NarrativeItem) {
    setActiveNarrative(n);
    // Keep URL in sync so the link is shareable / back-navigable
    router.replace(`/narrative-discovery?id=${n.id}`, { scroll: false });
  }

  function closeNarrative() {
    setActiveNarrative(null);
    router.replace("/narrative-discovery", { scroll: false });
  }

  const visibleNarratives = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = narratives;
    if (term) {
      result = result.filter((n) =>
        `${n.title} ${n.description ?? ""}`.toLowerCase().includes(term),
      );
    }
    const sorted = [...result];
    if (sortBy === "risk") sorted.sort((a, b) => b.risk_score - a.risk_score);
    if (sortBy === "views") sorted.sort((a, b) => parseViews(b.total_views) - parseViews(a.total_views));
    return sorted;
  }, [search, sortBy, narratives]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl p-8">
        <p className="text-sm text-red-600">Failed to load narratives: {error}</p>
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

      {/* Filter bar */}
      <section
        aria-label="Narrative filters"
        className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 3.5 3.5" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search narratives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-xs font-medium text-zinc-500">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                className="h-10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                defaultValue="all"
              >
                <option value="all">All Categories</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Sort by</span>
            <div className="relative">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="trending">Trending</option>
                <option value="risk">Risk Score</option>
                <option value="views">Total Views</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : (
        <section aria-label="Narrative cards" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleNarratives.map((narrative) => (
            <article
              key={narrative.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{narrative.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{narrative.description}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${riskBadgeClasses(narrative.risk_level)}`}>
                    {narrative.risk_level} Risk
                  </span>
                </div>

                <dl className="mt-4 space-y-1.5 text-xs text-zinc-600">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-zinc-500">Videos Analyzed:</dt>
                    <dd className="font-medium text-zinc-900">{narrative.videos_analyzed.toLocaleString("en-US")}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-zinc-500">Total Views:</dt>
                    <dd className="font-medium text-zinc-900">{narrative.total_views}</dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-zinc-500">Risk Score:</dt>
                    <dd className="font-medium text-zinc-900">{narrative.risk_score.toFixed(1)}/10</dd>
                  </div>
                </dl>
              </div>

              <button
                type="button"
                onClick={() => openNarrative(narrative)}
                className="mt-4 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2"
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

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
type NarrativeDetailDialogProps = {
  narrative: NarrativeItem;
  onClose: () => void;
};

function NarrativeDetailDialog({ narrative, onClose }: NarrativeDetailDialogProps) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="backdrop-enter fixed inset-0 z-40 flex cursor-pointer items-center justify-center bg-black/40 px-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="narrative-detail-title"
      onClick={onClose}
    >
      <div
        className="dialog-enter w-full max-w-lg cursor-default rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="narrative-detail-title" className="text-base font-semibold text-zinc-900">
              {narrative.title}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{narrative.category}</p>
          </div>
          <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${riskBadgeClasses(narrative.risk_level)}`}>
            {narrative.risk_level} Risk
          </span>
        </div>

        <p className="mt-4 text-sm text-zinc-700">{narrative.detail}</p>

        <div className="mt-4 rounded-lg bg-zinc-50 p-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-zinc-600">
            <div>
              <dt className="text-zinc-500">Videos Analyzed</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{narrative.videos_analyzed.toLocaleString("en-US")}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Total Views</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{narrative.total_views}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Risk Score</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{narrative.risk_score.toFixed(1)}/10</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Monitoring Window</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{narrative.time_window}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-xs text-zinc-600">
            <div className="font-medium text-zinc-700">Narrative Workspace</div>
            <div className="mt-0.5 text-zinc-500">{narrative.primary_link ?? "—"}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
