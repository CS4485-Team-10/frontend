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

export default function TrendAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetch("/mock/mockdata.json")
      .then((res) => res.json())
      .then((json) => setData(json));
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

  // Filter trend data based on selected range
  const filterTrends = () => {
    const now = new Date();
    let days = 30;

    if (range === "7d") days = 7;
    if (range === "30d") days = 30;
    if (range === "6m") days = 180;
    if (range === "1y") days = 365;

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    return trends.filter((item: any) => {
      return new Date(item.date) >= cutoff;
    });
  };

  const filteredTrends = filterTrends();

  return (
    <div className="mx-auto w-full max-w-6xl p-8 space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Trend Analytics
        </h2>
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
      <div className="grid grid-cols-2 gap-6">

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

                <Area
                  type="monotone"
                  dataKey="AI"
                  stackId="1"
                  stroke="#6366f1"
                  fill="#6366f1"
                />
                <Area
                  type="monotone"
                  dataKey="Health"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                />
                <Area
                  type="monotone"
                  dataKey="Crypto"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                />
                <Area
                  type="monotone"
                  dataKey="Nutrition"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Shift */}
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-medium mb-4">Sentiment Shift</h3>

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
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-medium mb-4">Trending Narratives</h3>

        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="pb-3">Narrative</th>
              <th>Risk Level</th>
              <th>Category</th>
              <th>Views</th>
              <th>Videos</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {narratives.map((n) => (
              <tr key={n.id}>
                <td className="py-3">{n.title}</td>
                <td>{n.risk_level}</td>
                <td>{n.category}</td>
                <td>{n.total_views}</td>
                <td>{n.videos_analyzed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DATA HIERARCHY */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold">
            {data.executive_overview.verified_claims}
          </div>
          <p className="text-sm text-zinc-500">Claims</p>
          <p className="text-xs text-zinc-400">Individual statements</p>
        </div>

        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold">
            {data.executive_overview.active_narratives}
          </div>
          <p className="text-sm text-zinc-500">Narratives</p>
          <p className="text-xs text-zinc-400">Grouped claims</p>
        </div>

        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-2xl font-semibold">
            {filteredTrends.length}
          </div>
          <p className="text-sm text-zinc-500">Trend Points</p>
          <p className="text-xs text-zinc-400">Tracked over time</p>
        </div>

      </div>

    </div>
  );
}