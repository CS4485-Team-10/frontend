"use client";

/**
 * Drop-in card for the Trend Analytics page that renders the real
 * sentiment-shift time series from GET /overview/sentiment-shift.
 *
 * Self-contained — imports its own types (lib/types/sentiment) and does
 * not require any edits to existing shared modules.
 *
 * Usage (from frontend/app/trend-analytics/page.tsx):
 *
 *   import SentimentShiftCard from "@/components/trend-analytics/SentimentShiftCard";
 *   ...
 *   <SentimentShiftCard range={range} />
 */

import { useEffect, useState } from "react";
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
import type {
  SentimentRange,
  SentimentShiftResponse,
} from "@/lib/types/sentiment";

interface Props {
  range: SentimentRange;
}

export default function SentimentShiftCard({ range }: Props) {
  const [shift, setShift] = useState<SentimentShiftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<SentimentShiftResponse>(
      `/overview/sentiment-shift?range=${range}`
    )
      .then((res) => {
        if (cancelled) return;
        setError(null);
        setShift(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const buckets = shift?.buckets ?? [];
  const totals = shift?.totals;
  const loading = !error && (shift === null || shift.range !== range);

  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-medium">Sentiment Shift</h3>
        {totals && (
          <span className="text-xs text-zinc-500">
            {totals.total} claims
            {totals.avg_score !== null &&
              ` · avg ${totals.avg_score.toFixed(2)}`}
          </span>
        )}
      </div>

      <div className="h-60">
        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-500">
            Failed to load sentiment: {error}
          </div>
        ) : loading && buckets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            Loading sentiment shift...
          </div>
        ) : buckets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No sentiment data in this window.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="s"
                stroke="#10b981"
                fill="#10b981"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="s"
                stroke="#a1a1aa"
                fill="#a1a1aa"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="s"
                stroke="#ef4444"
                fill="#ef4444"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
