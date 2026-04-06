"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const SERIES_COLORS = ["#111827", "#A3A3A3", "#D4D4D4", "#6B7280"];

function seriesFromData(topicTrends: TopicTrend[]) {
  const keys = new Set<string>();
  for (const point of topicTrends) {
    for (const k of Object.keys(point)) {
      if (k !== "date") keys.add(k);
    }
  }
  return Array.from(keys).map((key, i) => ({
    key,
    label: key,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }));
}

function SimpleLineChart({ topicTrends }: { topicTrends: TopicTrend[] }) {
  const width = 560;
  const height = 220;
  const padding = 18;
  const series = seriesFromData(topicTrends);
  const values = topicTrends.flatMap((p) => series.map((s) => Number(p[s.key] ?? 0)));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const xFor = (i: number) => padding + (i * (width - padding * 2)) / Math.max(1, topicTrends.length - 1);
  const yFor = (v: number) => height - padding - ((v - min) * (height - padding * 2)) / range;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img">
      <rect x="0" y="0" width={width} height={height} rx="10" fill="#ffffff" />
      <g opacity="0.6">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" />
      </g>
      {series.map((s) => {
        const coords = topicTrends.map((p, i) => ({ x: xFor(i), y: yFor(Number(p[s.key] ?? 0)) }));
        return (
          <polyline
            key={s.key}
            points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

// --- 2. TYPED COMPONENT ---
function BubbleChart({ clusters }: { clusters: Cluster[] }) {
  const width = 340;
  const height = 220;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img">
      <rect x="0" y="0" width={width} height={height} rx="10" fill="#ffffff" />
      {clusters.map((c, i) => (
        <g key={i}>
          <circle cx={c.x * width} cy={c.y * height} r={12 + (c.size / 50) * 20} fill="#D4D4D4" opacity={0.65} />
          <text x={c.x * width} y={c.y * height + 25} textAnchor="middle" fontSize="9" fill="#737373">{c.label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function ExecutiveOverviewPage() {
  // --- 3. TYPED STATE ---
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/mock/mockdata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not find mockdata.json in /public/mock/");
        return res.json();
      })
      .then((fullData) => {
        setData(fullData.executive_overview);
        setClusters([
          { label: "AI", size: 40, x: 0.2, y: 0.3 },
          { label: "Health", size: 30, x: 0.7, y: 0.5 },
          { label: "Crypto", size: 25, x: 0.4, y: 0.8 },
          { label: "Nutrition", size: 20, x: 0.8, y: 0.2 }
        ]);
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
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Executive Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">Real-time intelligence dashboard for health narrative analysis</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((m) => {
          const href = metricLinks[m.key];
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900"><MetricIcon kind={m.icon} /></div>
                <span className="text-xs font-medium text-zinc-500">{m.subLabel}</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-semibold tracking-tight text-zinc-900">{formatNumber(m.value)}</div>
                <div className="mt-1 text-sm text-zinc-500">{m.title}</div>
              </div>
            </>
          );
          const className = "rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]";
          return href ? (
            <Link key={m.key} href={href} className={`${className} hover:bg-zinc-50 transition-colors`}>{content}</Link>
          ) : (
            <div key={m.key} className={className}>{content}</div>
          );
        })}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Topic Trends Over Time</h3>
          <div className="mt-4 rounded-lg bg-zinc-50 p-3"><SimpleLineChart topicTrends={data.topic_trends} /></div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Topic Clusters</h3>
          <div className="mt-4 rounded-lg bg-zinc-50 p-3"><BubbleChart clusters={clusters} /></div>
        </div>
      </section>
    </div>
  );
}