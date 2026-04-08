"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { useTheme } from "@/components/layout/ThemeContext";

// --- 1. ADD INTERFACES TO KILL 'ANY' ---
interface TopicTrend {
  date: string;
  [key: string]: string | number; // Allows dynamic keys like "Nutrition", "AI"
}

interface Cluster {
  label: string;
  size: number;
  x: number;
  y: number;
}

interface ExecutiveData {
  total_videos_scoped: number;
  active_narratives: number;
  verified_claims: number;
  high_risk_alerts: number;
  overview_metrics_meta: {
    total_videos_scoped: { delta_pct: number; delta_period_label: string };
    active_narratives: { delta_new: number; delta_period_label: string };
    verified_claims: { accuracy_pct: number; accuracy_label: string };
    high_risk_alerts: { status_label: string };
  };
  topic_trends: TopicTrend[];
  sentiment: { positive: number; neutral: number; negative: number };
  topic_cluster_positions: Record<string, { x: number; y: number }>;
}

/** Derive clusters from topic_trends so they always stay in sync with the chart */
function buildClusters(
  trends: TopicTrend[],
  positions: Record<string, { x: number; y: number }>
): Cluster[] {
  if (trends.length === 0) return [];
  // Collect every topic key dynamically (same keys the AreaChart uses)
  const keys = new Set<string>();
  for (const point of trends) {
    for (const k of Object.keys(point)) {
      if (k !== "date") keys.add(k);
    }
  }
  // Sum each topic's values across all time points → relative activity volume
  const totals: Record<string, number> = {};
  for (const k of keys) {
    totals[k] = trends.reduce((acc, p) => acc + (Number(p[k]) || 0), 0);
  }
  const maxTotal = Math.max(...Object.values(totals), 1);
  // Map to Cluster objects; fall back to auto-spread positions for unknown topics
  return Array.from(keys).map((label, i) => {
    const pos = positions[label] ?? {
      x: 0.15 + (i * 0.22) % 0.75,
      y: 0.2 + (i * 0.31) % 0.65,
    };
    return {
      label,
      size: Math.round((totals[label] / maxTotal) * 60) + 10, // 10–70 range
      x: pos.x,
      y: pos.y,
    };
  });
}

interface Claim {
  claim_id: string;
  text: string;
  views: string;
  confidence: string;
  associated_narrative: string;
  risk_level: string;
}

type RiskLevel = "High" | "Medium" | "Low";

function riskBadgeClasses(level: string) {
  if (level === "High")   return "bg-red-50 text-red-700 ring-1 ring-red-100";
  if (level === "Medium") return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
}

function parseViews(v: string) {
  const t = v.trim().toUpperCase();
  const n = parseFloat(t.replace(/[MK]/g, ""));
  if (t.endsWith("M")) return n * 1_000_000;
  if (t.endsWith("K")) return n * 1_000;
  return n;
}

function formatNumber(value: number) {
  return Intl.NumberFormat("en-US").format(value);
}

type MetricKey =
  | "total_videos_scoped"
  | "active_narratives"
  | "verified_claims"
  | "high_risk_alerts";

type OverviewMetricCard = {
  key: MetricKey;
  title: string;
  value: number;
  subLabel: string;
  icon: "video" | "narratives" | "claims" | "alerts";
};

const metricLinks: Partial<Record<MetricKey, string>> = {
  active_narratives: "/narrative-discovery",
  verified_claims: "/claim-validation",
  high_risk_alerts: "/alerts-settings",
};

function MetricIcon({ kind }: { kind: OverviewMetricCard["icon"] }) {
  const common = "size-5 text-white";
  switch (kind) {
    case "video":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M4 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.4l2.8-1.6A1 1 0 0 1 22 6.67v10.66a1 1 0 0 1-1.2.98L16 16.6V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
        </svg>
      );
    case "narratives":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M6 2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 5h7v2H8V7zm0 4h7v2H8v-2zm0 4h5v2H8v-2z" />
        </svg>
      );
    case "claims":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M9 2h6a2 2 0 0 1 2 2v2h2a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h2V4a2 2 0 0 1 2-2zm0 4h6V4H9v2zm2.2 11.2 5.1-5.1-1.4-1.4-3.7 3.7-1.7-1.7-1.4 1.4 3.1 3.1z" />
        </svg>
      );
    case "alerts":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M12 2a9 9 0 0 1 9 9v4l2 2v1H1v-1l2-2v-4a9 9 0 0 1 9-9zm0 20a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22z" />
        </svg>
      );
  }
}

type RangeOption = "7d" | "30d" | "6m" | "1y";
const RANGE_OPTIONS: RangeOption[] = ["7d", "30d", "6m", "1y"];
const RANGE_DAYS: Record<RangeOption, number> = { "7d": 7, "30d": 30, "6m": 180, "1y": 365 };

function filterByRange(data: TopicTrend[], range: RangeOption): TopicTrend[] {
  if (data.length === 0) return data;
  // 6m and 1y always show the full dataset — the mock data doesn't span that long
  // so there's no point cutting it further. When connected to a real backend this
  // will naturally show the right window since the data will cover those periods.
  if (range === "6m" || range === "1y") return data;
  // For shorter windows, anchor to the newest date in the dataset
  const maxMs = Math.max(...data.map((d) => new Date(d.date).getTime()));
  const cutoff = new Date(maxMs);
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range]);
  return data.filter((d) => new Date(d.date) >= cutoff);
}

function TopicTrendsAreaChart({ topicTrends }: { topicTrends: TopicTrend[] }) {
  const { isDark } = useTheme();
  const [range, setRange] = useState<RangeOption>("30d");

  const filtered = filterByRange(topicTrends, range);

  const gridColor   = isDark ? "#374151" : "#e5e7eb";
  const textColor   = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg   = isDark ? "#1f2937" : "#ffffff";
  const tooltipBdr  = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#18181b";

  return (
    <div>
      {/* Range filter — same style as Trend Analytics */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Range:</span>
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
              range === r
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200"
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-600"
            }`}
          >
            {r}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
          {filtered.length} data point{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={filtered} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBdr}`,
              borderRadius: 8,
              color: tooltipText,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />
          <Area type="monotone" dataKey="AI"        stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.75} />
          <Area type="monotone" dataKey="Health"    stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.75} />
          <Area type="monotone" dataKey="Crypto"    stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.75} />
          <Area type="monotone" dataKey="Nutrition" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.75} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Same color palette as the AreaChart so topics are visually consistent
const TOPIC_COLORS: Record<string, string> = {
  AI:        "#6366f1",
  Health:    "#10b981",
  Crypto:    "#f59e0b",
  Nutrition: "#ef4444",
};
const FALLBACK_COLORS = ["#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function BubbleChart({ clusters }: { clusters: Cluster[] }) {
  const { isDark } = useTheme();
  const width  = 340;
  const height = 220;
  const labelFill = isDark ? "#9ca3af" : "#6b7280";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="Topic clusters bubble chart">
      {clusters.map((c, i) => {
        const color = TOPIC_COLORS[c.label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
        const r = 10 + (c.size / 70) * 30; // radius scaled to size range 10–70
        return (
          <g key={c.label}>
            <circle
              cx={c.x * width}
              cy={c.y * height}
              r={r}
              fill={color}
              opacity={isDark ? 0.55 : 0.35}
            />
            <circle
              cx={c.x * width}
              cy={c.y * height}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              opacity={0.8}
            />
            <text
              x={c.x * width}
              y={c.y * height + r + 11}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill={labelFill}
            >
              {c.label}
            </text>
            <text
              x={c.x * width}
              y={c.y * height + 4}
              textAnchor="middle"
              fontSize="8"
              fill={color}
              opacity={0.9}
            >
              {c.size}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ExecutiveOverviewPage() {
  // --- 3. TYPED STATE ---
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/mock/mockdata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not find mockdata.json in /public/mock/");
        return res.json();
      })
      .then((fullData) => {
        setData(fullData.executive_overview);
        // Sort claims by view count descending — same data source as Claim Validation tab
        const sorted = [...(fullData.claim_validation as Claim[])].sort(
          (a, b) => parseViews(b.views) - parseViews(a.views)
        );
        setClaims(sorted);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="p-8 text-red-600">Failed to load: {error}</div>;
  if (!data) return <div className="p-8 text-zinc-500">Loading...</div>;

  const meta = data.overview_metrics_meta;
  const overviewMetrics: OverviewMetricCard[] = [
    {
      key: "total_videos_scoped",
      title: "Total Videos Scoped",
      value: data.total_videos_scoped,
      subLabel: `+${meta.total_videos_scoped.delta_pct}% ${meta.total_videos_scoped.delta_period_label}`,
      icon: "video",
    },
    {
      key: "active_narratives",
      title: "Active Narratives",
      value: data.active_narratives,
      subLabel: `+${meta.active_narratives.delta_new} ${meta.active_narratives.delta_period_label}`,
      icon: "narratives",
    },
    {
      key: "verified_claims",
      title: "Verified Claims",
      value: data.verified_claims,
      subLabel: `${meta.verified_claims.accuracy_pct}% ${meta.verified_claims.accuracy_label}`,
      icon: "claims",
    },
    {
      key: "high_risk_alerts",
      title: "High-Risk Alerts",
      value: data.high_risk_alerts,
      subLabel: meta.high_risk_alerts.status_label,
      icon: "alerts",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Executive Overview</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Real-time intelligence dashboard for health narrative analysis</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((m) => {
          const href = metricLinks[m.key];
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-700"><MetricIcon kind={m.icon} /></div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{m.subLabel}</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{formatNumber(m.value)}</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{m.title}</div>
              </div>
            </>
          );
          const cardCls = "rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800";
          return href ? (
            <Link key={m.key} href={href} className={`${cardCls} hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-700/60`}>{content}</Link>
          ) : (
            <div key={m.key} className={cardCls}>{content}</div>
          );
        })}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Topic Trends Over Time</h3>
          <div className="mt-4">
            <TopicTrendsAreaChart topicTrends={data.topic_trends} />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Topic Clusters</h3>
          <div className="mt-4">
            <BubbleChart clusters={buildClusters(data.topic_trends, data.topic_cluster_positions)} />
          </div>
        </div>
      </section>

      {/* Frequent Claims & Risks + Sentiment Analysis */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Claims table */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Frequent Claims &amp; Risks</h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Sorted by view count • LLM transparency enabled</p>
            </div>
            <Link
              href="/claim-validation"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden>
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              Export
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <th className="px-6 py-3 text-left">Claim Text</th>
                  <th className="px-4 py-3 text-left">Associated Narrative</th>
                  <th className="px-4 py-3 text-right">View Count</th>
                  <th className="px-4 py-3 text-center">Risk Level</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                {claims.map((claim) => (
                  <tr key={claim.claim_id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/40">
                    <td className="max-w-[220px] px-6 py-3.5 text-xs text-zinc-700 dark:text-zinc-300">{claim.text}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{claim.associated_narrative}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-medium text-zinc-900 dark:text-zinc-100">{claim.views}</td>
                    <td className="px-4 py-3.5 text-center">
                      {claim.risk_level && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${riskBadgeClasses(claim.risk_level as RiskLevel)}`}>
                          {claim.risk_level}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-transparent">
                          <div className="h-full rounded-full bg-zinc-600 dark:bg-zinc-500" style={{ width: claim.confidence }} />
                        </div>
                        <span className="w-8 text-right text-xs text-zinc-500 dark:text-zinc-400">{claim.confidence}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sentiment Analysis</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Health domain overview</p>

          <div className="mt-5 space-y-4">
            {(
              [
                { label: "Positive", value: data.sentiment.positive, color: "bg-zinc-900 dark:bg-zinc-200" },
                { label: "Neutral",  value: data.sentiment.neutral,  color: "bg-zinc-400 dark:bg-zinc-500" },
                { label: "Negative", value: data.sentiment.negative, color: "bg-zinc-300 dark:bg-zinc-600" },
              ] as const
            ).map(({ label, value, color }) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Overall Signal</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {data.sentiment.positive > 50 ? "Predominantly Positive"
                : data.sentiment.negative > 35 ? "High Negative Signal"
                : "Mixed — Monitor Closely"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              Based on {formatNumber(data.verified_claims)} verified claims
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}