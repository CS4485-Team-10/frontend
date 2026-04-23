"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Creator = {
  handle: string;
  risk_score: number;
  flagged_claims: number;
  reach: string;
};

const SORT_OPTIONS = [
  { label: "Risk Score: High to Low", value: "risk_desc" },
  { label: "Risk Score: Low to High", value: "risk_asc" },
  { label: "Reach: High to Low", value: "reach_desc" },
] as const;

/** Four cards per row × three rows per page */
const CREATORS_PER_PAGE = 12;

const CreatorRiskMonitor = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorSearch, setCreatorSearch] = useState("");
  const [sort, setSort] = useState("risk_desc");
  const [page, setPage] = useState(1);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch<{ ok: boolean; data: Creator[] }>("/creators/risk", {
        sort,
      });
      setCreators(json.data ?? []);
      setPage(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load creators");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    void fetchCreators();
  }, [fetchCreators]);

  const filteredCreators = useMemo(() => {
    const q = creatorSearch.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter((c) => c.handle.toLowerCase().includes(q));
  }, [creators, creatorSearch]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl space-y-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Creator Risk Monitor</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Assess and track high-risk content creators based on flagged health claims.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500" htmlFor="creator-risk-search">
              Search by creator
            </label>
            <input
              id="creator-risk-search"
              type="search"
              value={creatorSearch}
              onChange={(e) => {
                setCreatorSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or handle…"
              autoComplete="off"
              className="w-56 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase ml-1 mb-1">Sort Order</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:ring-zinc-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="mb-2 font-semibold text-red-600 dark:text-red-400">Error loading creators</p>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            type="button"
            onClick={fetchCreators}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Retry
          </button>
        </div>
      ) : creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-medium text-zinc-500 dark:text-zinc-400">No creators found</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-medium text-zinc-500 dark:text-zinc-400">No creators match your search</p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Try a different spelling or clear the search box.</p>
        </div>
      ) : (
        <CreatorGridSection creators={filteredCreators} page={page} setPage={setPage} />
      )}
      </div>
    </div>
  );
};

function CreatorGridSection({
  creators,
  page,
  setPage,
}: {
  creators: Creator[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const totalPages = Math.max(1, Math.ceil(creators.length / CREATORS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * CREATORS_PER_PAGE;
  const pageCreators = creators.slice(start, start + CREATORS_PER_PAGE);
  const rangeStart = creators.length === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(creators.length, start + pageCreators.length);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pageCreators.map((creator) => (
          <CreatorCard key={creator.handle} creator={creator} />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{rangeStart}</span>
          {"–"}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{rangeEnd}</span>
          {" of "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{creators.length}</span> creators
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-600 dark:bg-zinc-800">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() =>
                setPage((p) => {
                  const total = Math.max(1, Math.ceil(creators.length / CREATORS_PER_PAGE));
                  const current = Math.min(Math.max(1, p), total);
                  return Math.max(1, current - 1);
                })
              }
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Previous
            </button>
            <span className="border-l border-r border-zinc-100 px-3 py-1 text-xs tabular-nums text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
              Page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{safePage}</span> / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPage((p) => {
                  const total = Math.max(1, Math.ceil(creators.length / CREATORS_PER_PAGE));
                  const current = Math.min(Math.max(1, p), total);
                  return Math.min(total, current + 1);
                })
              }
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRiskStroke(score: number): string {
  if (score >= 8) return "#ef4444"; // red-500
  if (score >= 5) return "#eab308"; // yellow-500
  return "#22c55e"; // green-500
}

/** Semicircle arc length = πr; filled segment scales with score / 10 */
function RiskGauge({ score }: { score: number }) {
  const r = 34;
  const cx = 46;
  const cy = 46;
  const vbW = 92;
  const vbH = 50;
  const arcLen = Math.PI * r;
  const t = Math.min(10, Math.max(0, score)) / 10;
  const dash = arcLen * t;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const stroke = getRiskStroke(score);

  return (
    <svg
      width={vbW}
      height={vbH}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="mx-auto block"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        className="text-zinc-200 dark:text-zinc-600"
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${arcLen}`}
        className="transition-[stroke-dasharray] duration-700 ease-out"
      />
    </svg>
  );
}

const CreatorCard = ({ creator }: { creator: Creator }) => {
  const getRiskStatus = (score: number) => {
    if (score >= 8) return { label: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" };
    if (score >= 5) return { label: "Medium Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
    return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
  };

  const status = getRiskStatus(creator.risk_score);
  const initial =
    creator.handle.replace(/^@/, "").charAt(0).toUpperCase() || creator.handle.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex aspect-square w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex shrink-0 items-start gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700">
            <span className="text-lg font-bold text-zinc-500 dark:text-zinc-300">{initial}</span>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-sm font-bold leading-tight text-zinc-900 dark:text-zinc-100">{creator.handle}</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Reach</span>
              <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{creator.reach}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div
          className={`absolute right-3 top-3 rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${status.bg} ${status.color} ${status.border}`}
        >
          {status.label}
        </div>
        <RiskGauge score={creator.risk_score} />
        <div className="-mt-0.5 text-center leading-none">
          <span className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{creator.risk_score}</span>
          <span className="ml-0.5 text-sm font-medium text-zinc-400 dark:text-zinc-500">/10</span>
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Flagged Claims</span>
          <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{creator.flagged_claims}</span>
        </div>
      </div>
    </div>
  );
};

export default CreatorRiskMonitor;
