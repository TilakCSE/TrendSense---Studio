// =============================================================================
// Analytics Server Actions
// These run server-side (no CORS issues, no API key exposure).
// Data is fetched from the FastAPI backend at http://localhost:8000
// =============================================================================
"use server";

import type {
  AnalyticsSummaryResponse,
  AnalyticsDistributionsResponse,
} from "@/types/analytics";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://tilakcse-trendsense-api.hf.space";

/**
 * Fetches KPI card metrics from /api/analytics/summary.
 * Revalidates every 10 minutes (matches FastAPI pulse cache TTL).
 */
export async function fetchAnalyticsSummary(): Promise<AnalyticsSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/analytics/summary`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(
      `Analytics summary fetch failed: ${res.status} ${res.statusText}. ` +
      `Have you run generate_static_analytics.py yet?`
    );
  }

  return res.json() as Promise<AnalyticsSummaryResponse>;
}

/**
 * Fetches distribution data (histogram, correlations, box-plot, scatter)
 * from /api/analytics/distributions.
 * Revalidates every 10 minutes.
 */
export async function fetchAnalyticsDistributions(): Promise<AnalyticsDistributionsResponse> {
  const res = await fetch(`${API_BASE}/api/analytics/distributions`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(
      `Analytics distributions fetch failed: ${res.status} ${res.statusText}. ` +
      `Have you run generate_static_analytics.py yet?`
    );
  }

  return res.json() as Promise<AnalyticsDistributionsResponse>;
}
