export type SentimentRange = "7d" | "30d" | "6m" | "1y";

export interface SentimentBucket {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  avg_score: number | null;
}

export interface SentimentTotals {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  avg_score: number | null;
}

export interface SentimentShiftResponse {
  ok: boolean;
  range: SentimentRange;
  bucket_size_days: number;
  window_days: number;
  totals: SentimentTotals;
  buckets: SentimentBucket[];
}
