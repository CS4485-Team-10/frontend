"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTheme } from "@/components/layout/ThemeContext";
import { apiFetch } from "@/lib/api";
import type { ExecutiveOverviewResponse } from "@/lib/types/executive-overview";
import type { NarrativeListResponse, NarrativeItem } from "@/lib/types/narrative";
import type { SentimentShiftResponse } from "@/lib/types/sentiment";

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
  const { isDark } = useTheme();
  const [execData, setExecData] = useState<ExecutiveOverviewResponse | null>(null);
  const [narratives, setNarratives] = useState<NarrativeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("6m");
  const [sentimentData, setSentimentData] = useState<SentimentShiftResponse | null>(null);

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

  useEffect(() => {
    apiFetch<SentimentShiftResponse>("/overview/sentiment-shift", { range })
      .then((data) => setSentimentData(data))
      .catch(() => setSentimentData(null));
  }, [range]);

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

  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const axisTick = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#18181b";

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load: {error}</p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-400/80">Check that the backend API is running.</p>
        </div>
      </div>
    );
  }
  if (loading || !execData) {
    return <div className="p-8 text-zinc-500 dark:text-zinc-400">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Trend Analytics</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Monitor narrative growth patterns and sentiment shifts over time</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Time Range:</span>
        {["7d", "30d", "6m", "1y"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded border px-3 py-1 text-sm transition-colors ${
              range === r
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100">Narrative Volume</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: axisTick, fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: axisTick, fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    color: tooltipText,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ color: axisTick, fontSize: 12 }} />
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

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">Sentiment Shift</h3>
          {sentimentData && (
            <div className="mb-3 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Positive {sentimentData.totals.positive}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-zinc-400" />
                Neutral {sentimentData.totals.neutral}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                Negative {sentimentData.totals.negative}
              </span>
            </div>
          )}
          <div className="h-60">
            {!sentimentData ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
                Loading…
              </div>
            ) : sentimentData.buckets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData.buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fill: axisTick, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: axisTick, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 8,
                      color: tooltipText,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ color: axisTick, fontSize: 12 }} />
                  <Bar dataKey="positive" stackId="s" fill="#10b981" name="Positive" />
                  <Bar dataKey="neutral" stackId="s" fill="#9ca3af" name="Neutral" />
                  <Bar dataKey="negative" stackId="s" fill="#ef4444" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
                No sentiment data for this range.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100">Trending Narratives</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="pb-3 pr-4">Narrative</th>
              <th className="pb-3 pr-4">Risk Level</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Views</th>
              <th className="pb-3">Videos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
            {narratives.map((n) => (
              <tr key={n.id} className="text-zinc-800 dark:text-zinc-200">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{execData.verified_claims}</div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Claims</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Individual statements</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{execData.active_narratives}</div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Narratives</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Grouped claims</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{filteredTrends.length}</div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Trend Points</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Tracked over time</p>
        </div>
      </div>
    </div>
  );
}
