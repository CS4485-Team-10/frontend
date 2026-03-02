"use client";

import Link from "next/link";
import mock from "@/public/mock/mockdata.json";

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

type ExecutiveOverview = typeof mock.executive_overview;

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

function SimpleLineChart({ topicTrends }: { topicTrends: Array<Record<string, string | number>> }) {
  const width = 560;
  const height = 220;
  const padding = 18;

  const series = [
    { key: "AI", label: "AI", color: "#111827" },
    { key: "Health", label: "Health", color: "#A3A3A3" },
    { key: "Crypto", label: "Crypto", color: "#D4D4D4" },
  ] as const;

  const values = topicTrends.flatMap((p) =>
    series.map((s) => Number(p[s.key] ?? 0)),
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const xFor = (i: number) =>
    padding + (i * (width - padding * 2)) / Math.max(1, topicTrends.length - 1);
  const yFor = (v: number) =>
    height - padding - ((v - min) * (height - padding * 2)) / range;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[260px] w-full"
      role="img"
      aria-label="Topic trends line chart placeholder"
    >
      <rect x="0" y="0" width={width} height={height} rx="10" fill="#ffffff" />
      <g opacity="0.6">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" />
      </g>

      {series.map((s) => {
        const points = topicTrends
          .map((p, i) => {
            const v = Number(p[s.key] ?? 0);
            return `${xFor(i)},${yFor(v)}`;
          })
          .join(" ");
        return (
          <polyline
            key={s.key}
            points={points}
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

function SimpleBubbleChart() {
  return (
    <svg viewBox="0 0 340 220" className="h-[260px] w-full" role="img" aria-label="Topic cluster bubble chart placeholder">
      <rect x="0" y="0" width="340" height="220" rx="10" fill="#ffffff" />
      <g opacity="0.65" fill="#D4D4D4">
        <circle cx="110" cy="120" r="42" />
        <circle cx="175" cy="90" r="28" />
        <circle cx="215" cy="145" r="34" />
        <circle cx="260" cy="105" r="18" />
      </g>
      <g opacity="0.85" stroke="#BDBDBD" strokeWidth="3" fill="none">
        <path d="M132 108 L160 98 L198 132 L244 112" />
      </g>
    </svg>
  );
}

export function ExecutiveOverviewPage() {
  const data = mock.executive_overview as ExecutiveOverview;

  const overviewMetrics: OverviewMetricCard[] = [
    {
      key: "total_videos_scoped",
      title: "Total Videos Scoped",
      value: data.total_videos_scoped,
      subLabel: `+${data.overview_metrics_meta.total_videos_scoped.delta_pct}% ${data.overview_metrics_meta.total_videos_scoped.delta_period_label}`,
      icon: "video",
    },
    {
      key: "active_narratives",
      title: "Active Narratives",
      value: data.active_narratives,
      subLabel: `+${data.overview_metrics_meta.active_narratives.delta_new} ${data.overview_metrics_meta.active_narratives.delta_period_label}`,
      icon: "narratives",
    },
    {
      key: "verified_claims",
      title: "Verified Claims",
      value: data.verified_claims,
      subLabel: `${data.overview_metrics_meta.verified_claims.accuracy_pct}% ${data.overview_metrics_meta.verified_claims.accuracy_label}`,
      icon: "claims",
    },
    {
      key: "high_risk_alerts",
      title: "High-Risk Alerts",
      value: data.high_risk_alerts,
      subLabel: data.overview_metrics_meta.high_risk_alerts.status_label,
      icon: "alerts",
    },
  ];

  const topicTrends = data.topic_trends as Array<Record<string, string | number>>;
  const topicTrendsMeta = data.topic_trends_meta;

  return (
    <div className="mx-auto w-full max-w-6xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Executive Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Real-time intelligence dashboard for health narrative analysis
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((m) => {
          const href = metricLinks[m.key];
          const cardClassName =
            "rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors";
          const interactiveClassName =
            "hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F5]";

          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900">
                  <MetricIcon kind={m.icon} />
                </div>
                <span className="text-xs font-medium text-zinc-500">{m.subLabel}</span>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-semibold tracking-tight text-zinc-900">
                  {formatNumber(m.value)}
                </div>
                <div className="mt-1 text-sm text-zinc-500">{m.title}</div>
              </div>
            </>
          );

          return href ? (
            <Link
              key={m.key}
              href={href}
              className={`${cardClassName} ${interactiveClassName}`}
              aria-label={`Go to ${m.title}`}
            >
              {content}
            </Link>
          ) : (
            <div key={m.key} className={cardClassName}>
              {content}
            </div>
          );
        })}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Link
          href="/trend-analytics"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F5] lg:col-span-2"
          aria-label="Go to Trend Analytics"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Topic Trends Over Time</h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Last {topicTrendsMeta.window_days} days • Confidence Score: {topicTrendsMeta.confidence_score_pct}%
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-900" /> AI
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-400" /> Health
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-300" /> Crypto
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-zinc-50 p-3">
            <SimpleLineChart topicTrends={topicTrends} />
            <div className="mt-2 text-center text-xs text-zinc-400">
              Line Chart: Topic Trends Visualization
            </div>
          </div>
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Topic Cluster</h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Semantic relationships • Source tracing enabled
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-zinc-50 p-3">
            <SimpleBubbleChart />
            <div className="mt-2 text-center text-xs text-zinc-400">
              Bubble Chart: Topic Clusters
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

