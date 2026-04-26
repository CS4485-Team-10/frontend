export interface ClaimItem {
  claim_id: string;
  text: string;
  source: string;
  /** Backend may return additional values (e.g. Unverifiable). */
  status: string;
  confidence: string;
  views: string;
  date: string;
}

export interface ClaimStats {
  total: number;
  verified: number;
  disputed: number;
  under_review: number;
}

/** Optional facet lists returned by GET /claims; UI falls back to deriving from `data` if omitted. */
export interface ClaimFilterOptions {
  statuses?: string[];
  confidences?: string[];
}

export interface ClaimListResponse {
  ok: boolean;
  data: ClaimItem[];
  stats: ClaimStats;
  count: number;
  filter_options?: ClaimFilterOptions;
}
