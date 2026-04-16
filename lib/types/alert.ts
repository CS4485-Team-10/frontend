export interface AlertItem {
  id: string;
  title: string;
  risk_level: "High" | "Medium" | "Low";
  risk_score: number;
  videos_analyzed: number;
  total_views: string;
  description: string;
  time_window: string;
}

export interface AlertListResponse {
  ok: boolean;
  data: AlertItem[];
  count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}
