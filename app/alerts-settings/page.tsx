"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import mock from "@/public/mock/mockdata.json";
import { useNotifications } from "@/components/layout/NotificationContext";
import { useSidebar } from "@/components/layout/SidebarContext";

type RiskLevel = "High" | "Medium" | "Low";
type SortFilter = "All" | RiskLevel;

const narratives = mock.narrative_discovery;

function riskBadgeClasses(level: RiskLevel) {
  switch (level) {
    case "High":   return "bg-red-50 text-red-700 ring-1 ring-red-100";
    case "Medium": return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    case "Low":    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }
}

function riskDot(level: RiskLevel) {
  switch (level) {
    case "High":   return "bg-red-500";
    case "Medium": return "bg-amber-400";
    case "Low":    return "bg-emerald-500";
  }
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 ${
        enabled ? "bg-zinc-900" : "bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-1 text-base font-semibold text-zinc-900">{title}</h3>
      <div className="mt-3 divide-y divide-zinc-100">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AlertsSettingsPage() {
  const router = useRouter();
  const [sortFilter, setSortFilter] = useState<SortFilter>("All");
  const { notifHighRisk, notifMediumRisk, setNotifHighRisk, setNotifMediumRisk } = useNotifications();
  const { compactMode, setCompactMode } = useSidebar();


  const filterOptions: SortFilter[] = ["All", "High", "Medium", "Low"];

  const filtered = useMemo(() => {
    const base =
      sortFilter === "All"
        ? [...narratives]
        : narratives.filter((n) => n.risk_level === sortFilter);
    return base.sort((a, b) => b.risk_score - a.risk_score);
  }, [sortFilter]);

  const highCount = narratives.filter((n) => n.risk_level === "High").length;
  const medCount  = narratives.filter((n) => n.risk_level === "Medium").length;
  const lowCount  = narratives.filter((n) => n.risk_level === "Low").length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Alerts &amp; Settings
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review risk alerts and configure notifications and preferences.
        </p>
      </div>

      {/* Summary stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["High", "Medium", "Low"] as RiskLevel[]).map((level) => {
          const count = level === "High" ? highCount : level === "Medium" ? medCount : lowCount;
          const sub   = level === "High" ? "Requires immediate review" : level === "Medium" ? "Monitor closely" : "Low priority";
          const active = sortFilter === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setSortFilter(active ? "All" : level)}
              className={`cursor-pointer rounded-xl border p-5 text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors ${
                active
                  ? "border-zinc-300 bg-zinc-50 ring-2 ring-zinc-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${riskBadgeClasses(level)}`}
              >
                {level} Risk
              </span>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {count}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{sub}</p>
            </button>
          );
        })}
      </section>

      {/* Alerts History */}
      <section className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4">
          <h3 className="text-base font-semibold text-zinc-900">Alerts History</h3>

          {/* Filter pills */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSortFilter(opt)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortFilter === opt
                    ? "bg-zinc-900 text-white shadow"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable rows */}
        <div className="max-h-[400px] divide-y divide-zinc-100 overflow-y-auto">
          {filtered.map((n) => {
            const level = n.risk_level as RiskLevel;
            return (
              <div
                key={n.id}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-zinc-50"
              >
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${riskDot(level)}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${riskBadgeClasses(level)}`}
                    >
                      {level} Risk
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{n.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-zinc-400">
                    <span>Score: <span className="font-medium text-zinc-600">{n.risk_score.toFixed(1)}/10</span></span>
                    <span>Videos: <span className="font-medium text-zinc-600">{n.videos_analyzed.toLocaleString()}</span></span>
                    <span>Views: <span className="font-medium text-zinc-600">{n.total_views}</span></span>
                    <span>Window: <span className="font-medium text-zinc-600">{n.time_window}</span></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/narrative-discovery?id=${n.id}`)}
                  className="shrink-0 cursor-pointer rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  View
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Settings grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <SectionCard title="Appearance">
          <SettingRow label="Theme" description="Coming in a future release">
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              {(["Light", "Dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={t === "Dark"}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    t === "Light"
                      ? "bg-zinc-900 text-white shadow"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Compact sidebar" description="Lock sidebar to icon-only mode">
            <Toggle enabled={compactMode} onChange={setCompactMode} />
          </SettingRow>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications">
          <SettingRow
            label="High-Risk popup"
            description="Show banner when High-Risk narratives are detected"
          >
            <Toggle enabled={notifHighRisk} onChange={setNotifHighRisk} />
          </SettingRow>
          <SettingRow
            label="Medium-Risk alerts"
            description="Notify on Medium-Risk narrative changes"
          >
            <Toggle enabled={notifMediumRisk} onChange={setNotifMediumRisk} />
          </SettingRow>
        </SectionCard>
      </div>
    </div>
  );
}
