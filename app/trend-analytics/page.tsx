"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";
import type { ExecutiveOverviewResponse } from "@/lib/types/executive-overview";
import type { NarrativeListResponse, NarrativeItem } from "@/lib/types/narrative";

type TopicTrend = Record<string, string | number>;

const AREA_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function topicKeys(trends: TopicTrend[]): string[] {
  const keys = new Set<string>();
  for (const point of trends) {
    for (const k of Object.keys(point)) {
      if (k !== "date") keys.add(k);
    }
  }
  return Array.from(keys);
}

export default function TrendAnalyticsPage() {
  const [execData, setExecData] = useState<ExecutiveOverviewResponse | null>(null);
  const [narratives, setNarratives] = useState<NarrativeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    Promise.all([
      apiFetch<ExecutiveOverviewResponse>("/overview/executive"),
      apiFetch<NarrativeListResponse>("/narratives", { sort_by: "trending" }),
    ])
      .then(([exec, narr]) => {
        setExecData(exec);
        setNarratives(narr.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredTrends = useMemo(() => {
    if (!execData) return [];
    const trends = execData.topic_trends;
    const now = new Date();
    let days = 30;
    if (range === "7d") days = 7;
    if (range === "30d") days = 30;
    if (range === "6m") days = 180;
    if (range === "1y") days = 365;
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);
    return trends.filter((item) => new Date(item.date as string) >= cutoff);
  }, [execData, range]);

  const series = useMemo(() => topicKeys(filteredTrends), [filteredTrends]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Failed to load: {error}</p>
          <p className="text-xs text-red-500 mt-1">Check that the backend API is running.</p>
        </div>
      </div>
    );
  }
  if (loading || !execData) return <div className="p-8 text-zinc-500">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-6xl p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Trend Analytics</h2>
        <p className="text-sm text-zinc-500">
          Monitor narrative growth patterns and sentiment shifts over time
        </p>
      </div>

      {/* TIME RANGE */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600">Time Range:</span>
        {["7d", "30d", "6m", "1y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-sm rounded border ${
              range === r ? "bg-black text-white" : "bg-white"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Narrative Volume */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-medium mb-4">Narrative Volume</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {series.map((key, i) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={AREA_COLORS[i % AREA_COLORS.length]}
                    fill={AREA_COLORS[i % AREA_COLORS.length]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Shift — API not yet available */}
        <div className="bg-white border rounded-xl p-5 flex flex-col items-center justify-center">
          <h3 className="font-medium mb-2">Sentiment Shift</h3>
          <p className="text-sm text-zinc-400">Sentiment analysis endpoint coming soon.</p>
          <p className="text-xs text-zinc-300 mt-1">See docs/MISSING_APIS.md for details.</p>
        </div>
      </div>

      {/* TRENDING NARRATIVES */}
      <div className="bg-white border rounded-xl p-6 overflow-x-auto">
        <h3 className="font-medium mb-4">Trending Narratives</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="pb-3 pr-4">Narrative</th>
              <th className="pb-3 pr-4">Risk Level</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Views</th>
              <th className="pb-3">Videos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {narratives.map((n) => (
              <tr key={n.id}>
                <td className="py-3 pr-4">{n.title}</td>
                <td className="pr-4">{n.risk_level}</td>
                <td className="pr-4">{n.category}</td>
                <td className="pr-4">{n.total_views}</td>
                <td>{n.videos_analyzed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DATA HIERARCHY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold">{execData.verified_claims}</div>
          <p className="text-sm text-zinc-500">Claims</p>
          <p className="text-xs text-zinc-400">Individual statements</p>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold">{execData.active_narratives}</div>
          <p className="text-sm text-zinc-500">Narratives</p>
          <p className="text-xs text-zinc-400">Grouped claims</p>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold">{filteredTrends.length}</div>
          <p className="text-sm text-zinc-500">Trend Points</p>
          <p className="text-xs text-zinc-400">Tracked over time</p>
        </div>
      </div>
    </div>
  );
}