// =============================================================================
// Analytics API Types — FastAPI /api/analytics/* contract
// Kept in strict 1-to-1 sync with static_analytics.json schema.
// =============================================================================

export interface V2Summary {
  total_corpus_rows: number;
  raw_archive_gb: number;
  etl_chunks: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  median_views: number;
  median_likes: number;
  median_comments: number;
}

export interface V3Summary {
  total_training_rows: number;
  modalities: number;
  live_records_per_day: number;
  virality_mean: number;
  virality_median: number;
  virality_std: number;
  virality_p25: number;
  virality_p75: number;
  virality_max: number;
  viral_threshold_pct: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  median_views: number;
  median_likes: number;
  median_comments: number;
}

export interface AnalyticsSummaryResponse {
  status: "success";
  generated_at: string;
  v2: { summary: V2Summary };
  v3: { summary: V3Summary };
}

export interface HistogramBucket {
  bucket: string;
  count: number;
  pct: number;
  isViral: boolean;
}

export interface CorrelationCell {
  x: string;
  y: string;
  value: number;
}

export interface EngagementBoxStats {
  metric: "Views" | "Likes" | "Comments";
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
}

export interface ScatterPoint {
  likes: number;
  virality: number;
  commentQuartile: "Low" | "Medium" | "High" | "Very High";
}

export interface AnalyticsDistributionsResponse {
  status: "success";
  v2: {
    correlation_matrix: CorrelationCell[];
    engagement_stats: EngagementBoxStats[];
  };
  v3: {
    histogram: HistogramBucket[];
    correlation_matrix: CorrelationCell[];
    engagement_stats: EngagementBoxStats[];
    scatter_sample: ScatterPoint[];
  };
}
