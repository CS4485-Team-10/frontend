export interface ExecutiveOverviewResponse {
  ok: boolean;
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
  topic_trends_meta: { window_days: number; confidence_score_pct: number };
  topic_trends: Array<Record<string, string | number>>;
}

export interface TopicCluster {
  label: string;
  size: number;
  x: number;
  y: number;
}

export interface TopicClustersResponse {
  ok: boolean;
  clusters: TopicCluster[];
}
