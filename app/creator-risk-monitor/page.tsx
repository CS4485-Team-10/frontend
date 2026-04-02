"use client";

import React, { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

const CreatorRiskMonitor = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [sort, setSort] = useState("risk_desc");

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sort });
      if (narrative.trim()) params.set("narrative", narrative.trim());

      const res = await fetch(`${API_URL}/creators/risk?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Request failed (${res.status})`);
      }
      const json = await res.json();
      setCreators(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load creators");
    } finally {
      setLoading(false);
    }
  }, [narrative, sort]);

  useEffect(() => {
    const id = setTimeout(fetchCreators, narrative ? 300 : 0);
    return () => clearTimeout(id);
  }, [fetchCreators, narrative]);

  return (
    <div className="p-8 bg-zinc-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Creator Risk Monitor</h1>
          <p className="text-zinc-500 mt-1">Assess and track high-risk content creators based on flagged health claims.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1 mb-1">Filter by Narrative</label>
            <input
              type="text"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="e.g. Ozempic, COVID…"
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 w-52"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1 mb-1">Sort Order</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading creators</p>
          <p className="text-zinc-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchCreators}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all"
          >
            Retry
          </button>
        </div>
      ) : creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-zinc-500 font-medium">No creators found</p>
          {narrative && (
            <p className="text-zinc-400 text-sm mt-1">Try a different narrative filter</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator.handle} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
};

const CreatorCard = ({ creator }: { creator: Creator }) => {
  const scorePercent = creator.risk_score * 10;

  const getRiskStatus = (score: number) => {
    if (score >= 8) return { label: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" };
    if (score >= 5) return { label: "Medium Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
    return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
  };

  const status = getRiskStatus(creator.risk_score);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
              <span className="text-zinc-400 font-bold text-xl">{creator.handle[1]?.toUpperCase() ?? "?"}</span>
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 leading-tight">{creator.handle}</h3>
              <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${status.bg} ${status.color} ${status.border}`}>
                {status.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Reach</p>
            <p className="text-sm font-bold text-zinc-900">{creator.reach}</p>
          </div>
        </div>

        {/* Risk Gauge Visual */}
        <div className="relative flex flex-col items-center py-4 bg-zinc-50 rounded-lg mb-6 border border-zinc-100">
          <div className="relative w-36 h-20 overflow-hidden">
            <div className="absolute top-0 w-36 h-36 border-[14px] border-zinc-200 rounded-full"></div>
            <div
              className="absolute top-0 w-36 h-36 border-[14px] rounded-full border-transparent border-t-current border-l-current transition-all duration-1000 ease-out"
              style={{
                color: creator.risk_score >= 8 ? "#ef4444" : creator.risk_score >= 5 ? "#f59e0b" : "#10b981",
                transform: `rotate(${(scorePercent / 100) * 180 - 45}deg)`,
              }}
            ></div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-3xl font-black text-zinc-900">{creator.risk_score}</span>
            <span className="text-zinc-400 font-medium ml-1">/ 10</span>
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
            <span className="text-xs text-zinc-500 font-medium">Flagged Claims</span>
            <span className="text-sm font-bold text-zinc-900">{creator.flagged_claims}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
            <span className="text-xs text-zinc-500 font-medium">Verification Status</span>
            <span className="text-xs font-bold text-zinc-400 uppercase">Awaiting Manual Audit</span>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-all active:scale-[0.98]">
        View Detailed Audit
      </button>
    </div>
  );
};

export default CreatorRiskMonitor;
