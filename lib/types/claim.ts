export interface ClaimItem {
  claim_id: string;
  text: string;
  source: string;
  status: "Verified" | "Disputed" | "Under Review";
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

export interface ClaimListResponse {
  ok: boolean;
  data: ClaimItem[];
  stats: ClaimStats;
  count: number;
}
