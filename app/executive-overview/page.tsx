"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import type { ExecutiveOverviewResponse, TopicClustersResponse, TopicCluster } from "@/lib/types/executive-overview";
import type { ClaimListResponse, ClaimItem } from "@/lib/types/claim";
import type { SentimentShiftResponse } from "@/lib/types/sentiment";

type TopicTrend = Record<string, string | number>;

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

function claimStatusBadgeClasses(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "verified" || normalized === "verified_true") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800";
  }
  if (normalized === "disputed") {
    return "bg-red-50 text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800";
  }
  if (normalized === "unverifiable") {
    return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600";
  }
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800";
}

function formatClaimStatus(status: string) {
  return status.replace(/_/g, " ");
}

function isVerifiedClaimStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  return normalized === "verified" || normalized === "verified_true";
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

const AREA_SERIES_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function topicKeysFromTrends(trends: TopicTrend[]): string[] {
  const keys = new Set<string>();
  for (const point of trends) {
    for (const k of Object.keys(point)) {
      if (k !== "date") keys.add(k);
    }
  }
  return Array.from(keys);
}

function filterByRange(data: TopicTrend[], range: RangeOption): TopicTrend[] {
  if (data.length === 0) return data;
  if (range === "6m" || range === "1y") return data;
  const maxMs = Math.max(...data.map((d) => new Date(String(d.date)).getTime()));
  const cutoff = new Date(maxMs);
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range]);
  return data.filter((d) => new Date(String(d.date)) >= cutoff);
}

function TopicTrendsAreaChart({ topicTrends }: { topicTrends: TopicTrend[] }) {
  const { isDark } = useTheme();
  const [range, setRange] = useState<RangeOption>("30d");

  const filtered = useMemo(() => filterByRange(topicTrends, range), [topicTrends, range]);
  const seriesKeys = useMemo(() => topicKeysFromTrends(filtered), [filtered]);

  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBdr = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#18181b";

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="mr-1 text-xs text-zinc-500 dark:text-zinc-400">Range:</span>
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors ${
              range === r
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
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
          <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
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
          {seriesKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={AREA_SERIES_COLORS[i % AREA_SERIES_COLORS.length]}
              fill={AREA_SERIES_COLORS[i % AREA_SERIES_COLORS.length]}
              fillOpacity={0.75}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const TOPIC_COLORS: Record<string, string> = {
  AI: "#6366f1",
  Health: "#10b981",
  Crypto: "#f59e0b",
  Nutrition: "#ef4444",
};
const FALLBACK_COLORS = ["#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function BubbleChart({ clusters }: { clusters: TopicCluster[] }) {
  const { isDark } = useTheme();
  const width = 340;
  const height = 220;
  const labelFill = isDark ? "#9ca3af" : "#6b7280";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="Topic clusters bubble chart">
      {clusters.map((c, i) => {
        const color = TOPIC_COLORS[c.label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
        const r = 10 + (c.size / 70) * 30;
        return (
          <g key={c.label}>
            <circle cx={c.x * width} cy={c.y * height} r={r} fill={color} opacity={isDark ? 0.55 : 0.35} />
            <circle cx={c.x * width} cy={c.y * height} r={r} fill="none" stroke={color} strokeWidth="1.5" opacity={0.8} />
            <text x={c.x * width} y={c.y * height + r + 11} textAnchor="middle" fontSize="9" fontWeight="600" fill={labelFill}>
              {c.label}
            </text>
            <text x={c.x * width} y={c.y * height + 4} textAnchor="middle" fontSize="8" fill={color} opacity={0.9}>
              {c.size}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ExecutiveOverviewPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState<ExecutiveOverviewResponse | null>(null);
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [allClaims, setAllClaims] = useState<ClaimItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentShiftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimStatusFilter, setClaimStatusFilter] = useState<"all" | "verified" | "unverifiable">("all");
  const [claimsLoading, setClaimsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<ExecutiveOverviewResponse>("/overview/executive"),
      apiFetch<TopicClustersResponse>("/overview/topic-clusters"),
      apiFetch<ClaimListResponse>("/claims"),
      apiFetch<SentimentShiftResponse>("/overview/sentiment-shift", { range: "30d" }),
    ])
      .then(([execData, clusterData, allClaimData, sentimentData]) => {
        setData(execData);
        setClusters(clusterData.clusters);
        setAllClaims(allClaimData.data);
        setSentiment(sentimentData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    const statusParam =
      claimStatusFilter === "all" ? undefined : claimStatusFilter === "verified" ? "verified_true" : "unverifiable";

    apiFetch<ClaimListResponse>("/claims", {
      limit: 20,
      status: statusParam,
    })
      .then((claimData) => {
        const sorted = [...claimData.data].sort((a, b) => parseViews(b.views) - parseViews(a.views));
        setClaims(sorted);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setClaimsLoading(false));
  }, [claimStatusFilter]);

  if (error) return <div className="p-8 text-red-600 dark:text-red-400">Failed to load: {error}</div>;
  if (!data) return <div className="p-8 text-zinc-500 dark:text-zinc-400">Loading...</div>;

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
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-700">
                  <MetricIcon kind={m.icon} />
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{m.subLabel}</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{formatNumber(m.value)}</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{m.title}</div>
              </div>
            </>
          );
          const cardCls =
            "rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800";
          return href ? (
            <Link key={m.key} href={href} className={`${cardCls} transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/60`}>
              {content}
            </Link>
          ) : (
            <div key={m.key} className={cardCls}>
              {content}
            </div>
          );
        })}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Topic Trends Over Time</h3>
          <div className="mt-4">
            <TopicTrendsAreaChart topicTrends={data.topic_trends} />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Topic Clusters</h3>
          <div className="mt-4">
            <BubbleChart clusters={clusters} />
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Frequent Claims &amp; Risks</h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Sorted by view count • LLM transparency enabled</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={claimStatusFilter}
                onChange={(e) => {
                  setClaimsLoading(true);
                  setClaims([]);
                  setClaimStatusFilter(e.target.value as "all" | "verified" | "unverifiable");
                }}
                disabled={claimsLoading}
                className="h-9 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
                aria-label="Filter claims by verification status"
              >
                <option value="all">All statuses</option>
                <option value="verified">Verified</option>
                <option value="unverifiable">Unverifiable</option>
              </select>
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <th className="px-6 py-3 text-left">Claim Text</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-right">View Count</th>
                  <th className="px-4 py-3 text-center">Status</th>
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
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">{claim.source}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-medium text-zinc-900 dark:text-zinc-100">{claim.views}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${claimStatusBadgeClasses(claim.status)}`}
                      >
                        {formatClaimStatus(claim.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-600">
                          <div className="h-full rounded-full bg-zinc-600 dark:bg-zinc-400" style={{ width: claim.confidence }} />
                        </div>
                        <span className="w-8 text-right text-xs text-zinc-500 dark:text-zinc-400">{claim.confidence}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {claimsLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      Loading claims...
                    </td>
                  </tr>
                )}
                {!claimsLoading && claims.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      No claims match this status filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sentiment Analysis</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Last 30 days · health domain</p>
          {sentiment && (
            <div className="mt-3 flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                {sentiment.totals.positive} positive
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-zinc-400" />
                {sentiment.totals.neutral} neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                {sentiment.totals.negative} negative
              </span>
            </div>
          )}
          <div className="mt-3 h-[200px]">
            {!sentiment ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
                Loading…
              </div>
            ) : sentiment.buckets.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
                No sentiment data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentiment.buckets} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="date" tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: 8,
                      color: isDark ? "#f4f4f5" : "#18181b",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280" }} />
                  <Bar dataKey="positive" stackId="s" fill="#10b981" name="Positive" />
                  <Bar dataKey="neutral" stackId="s" fill="#9ca3af" name="Neutral" />
                  <Bar dataKey="negative" stackId="s" fill="#ef4444" name="Negative" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
