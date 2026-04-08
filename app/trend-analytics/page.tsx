"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

// --- 1. DEFINE INTERFACES ---
type TopicTrend = {
  date: string;
  AI: number;
  Health: number;
  Crypto: number;
  Nutrition: number;
};

type Narrative = {
  id: string;
  title: string;
  risk_level: string;
  risk_score: number;
  videos_analyzed: number;
  total_views: string;
  category: string;
};

interface FullMockData {
  executive_overview: {
    topic_trends: TopicTrend[];
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    verified_claims: number;
    active_narratives: number;
  };
  narrative_discovery: Narrative[];
}

export default function TrendAnalyticsPage() {
  // --- 2. UPDATE STATE TYPE ---
  const [data, setData] = useState<FullMockData | null>(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetch("/mock/mockdata.json")
      .then((res) => res.json())
      .then((json: FullMockData) => setData(json));
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const trends: TopicTrend[] = data.executive_overview.topic_trends;
  const sentiment = data.executive_overview.sentiment;
  const narratives: Narrative[] = data.narrative_discovery;

  const sentimentData = [
    { name: "Positive", value: sentiment.positive },
    { name: "Neutral", value: sentiment.neutral },
    { name: "Negative", value: sentiment.negative },
  ];

  const filteredTrends = (() => {
    if (trends.length === 0) return trends;
    // 6m and 1y always show the full dataset — mock data doesn't span that long.
    // When the backend is connected with real data these ranges will work naturally.
    if (range === "6m" || range === "1y") return trends;
    const days = range === "7d" ? 7 : 30;
    // Anchor to the newest date in the dataset so filters work with historical mock data
    const maxMs = Math.max(...trends.map((d) => new Date(d.date).getTime()));
    const cutoff = new Date(maxMs);
    cutoff.setDate(cutoff.getDate() - days);
    return trends.filter((item) => new Date(item.date) >= cutoff);
  })();

  return (
    <div className="mx-auto w-full max-w-6xl p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Trend Analytics</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Monitor narrative growth patterns and sentiment shifts over time
        </p>
      </div>

      {/* TIME RANGE */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Time Range:</span>
        {["7d", "30d", "6m", "1y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              range === r
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 dark:bg-zinc-800 dark:border-zinc-700">
          <h3 className="font-medium mb-4 text-zinc-900 dark:text-zinc-100">Narrative Volume</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="AI" stackId="1" stroke="#6366f1" fill="#6366f1" />
                <Area type="monotone" dataKey="Health" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="Crypto" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="Nutrition" stackId="1" stroke="#ef4444" fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 dark:bg-zinc-800 dark:border-zinc-700">
          <h3 className="font-medium mb-4 text-zinc-900 dark:text-zinc-100">Sentiment Shift</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TRENDING NARRATIVES */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 overflow-x-auto dark:bg-zinc-800 dark:border-zinc-700">
        <h3 className="font-medium mb-4 text-zinc-900 dark:text-zinc-100">Trending Narratives</h3>
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

      {/* DATA HIERARCHY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { value: data.executive_overview.verified_claims, label: "Claims", sub: "Individual statements" },
          { value: data.executive_overview.active_narratives, label: "Narratives", sub: "Grouped claims" },
          { value: filteredTrends.length, label: "Trend Points", sub: "Tracked over time" },
        ].map(({ value, label, sub }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-xl p-6 text-center dark:bg-zinc-800 dark:border-zinc-700">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}