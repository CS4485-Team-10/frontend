export interface NarrativeItem {
  id: string;
  title: string;
  description: string | null;
  detail: string | null;
  category: string;
  risk_level: "High" | "Medium" | "Low";
  risk_score: number;
  videos_analyzed: number;
  total_views: string;
  time_window: string;
  primary_link: string | null;
}

export interface NarrativeListResponse {
  ok: boolean;
  data: NarrativeItem[];
  count: number;
}
