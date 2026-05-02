// =============================================================================
// /analytics — Data Telemetry & Analytics Page
// Server Component: fetches real data from FastAPI, passes to 'use client' charts
// =============================================================================

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";

import { fetchAnalyticsSummary, fetchAnalyticsDistributions } from "./actions";

// Lazy-loaded client chart components
import KpiCardsRow from "./KpiCardsRow";
import ViralityHistogram from "./ViralityHistogram";
import CorrelationHeatmap from "./CorrelationHeatmap";

// Phase 2 components
import ClusterBubbleChart from "./ClusterBubbleChart";
import TrendLeaderboard from "./TrendLeaderboard";
import TwoStreamRadar from "./TwoStreamRadar";

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Data Telemetry & Analytics | TrendSense",
  description:
    "Real-time Big Data dashboard for TrendSense: 219k training records, virality distribution, feature correlations, and multi-modal AI inference breakdown.",
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div
      className={`${height} w-full rounded-2xl border border-artichoke/20 bg-artichoke/5 animate-pulse`}
    />
  );
}

// ─── Error state shown when backend is unavailable ───────────────────────────

function AnalyticsOffline({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 p-8 text-center">
      <AlertTriangle className="w-8 h-8 text-cranberry mx-auto mb-3" />
      <h3 className="font-heading text-xl text-mulled-wine mb-2">
        Analytics Unavailable
      </h3>
      <p className="text-sm text-artichoke font-mono mb-4 max-w-lg mx-auto leading-relaxed">
        {message}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-artichoke/10 border border-artichoke/20">
        <code className="text-xs font-mono text-mulled-wine">
          cd data &amp;&amp; python generate_static_analytics.py
        </code>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  // Fetch both endpoints in parallel — if either fails, we show a graceful error.
  let summaryData;
  let distributionData;
  let fetchError: string | null = null;

  try {
    [summaryData, distributionData] = await Promise.all([
      fetchAnalyticsSummary(),
      fetchAnalyticsDistributions(),
    ]);
  } catch (err: unknown) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Could not connect to the TrendSense FastAPI backend.";
  }

  return (
    <main className="min-h-screen bg-mashed-potatoes text-mulled-wine font-body flex flex-col selection:bg-cranberry selection:text-mashed-potatoes">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="w-full flex items-center justify-between px-6 py-6 border-b border-artichoke/15 sticky top-0 z-50 bg-mashed-potatoes/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-artichoke hover:text-cranberry transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
        <div className="font-heading text-xl tracking-wide text-green-bean">
          TrendSense<span className="text-cranberry">.</span>
        </div>
        {/* Generated-at badge */}
        {summaryData && (
          <p className="hidden md:block text-[10px] font-mono text-artichoke/60 uppercase tracking-widest">
            Dataset snapshot ·{" "}
            {new Date(summaryData.generated_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </nav>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto pt-16 pb-8 px-4 md:px-8">
        <div className="mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cranberry border border-cranberry/30 bg-cranberry/5 px-3 py-1 rounded-full">
            Big Data Dashboard
          </span>
        </div>
        <h1 className="font-heading text-5xl md:text-6xl text-green-bean mt-4 mb-3">
          Data Telemetry{" "}
          <span className="italic text-cranberry">&amp; Analytics</span>
        </h1>
        <p className="text-artichoke font-mono text-sm max-w-2xl leading-relaxed">
          Live read-out from the TrendSense v2 archive and v3 training corpus. All metrics are
          computed from the real Parquet datasets.
        </p>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto flex-1 px-4 md:px-8 pb-20 space-y-12">

        {/* Error state */}
        {fetchError && <AnalyticsOffline message={fetchError} />}

        {/* ── Section: v3 Training Analytics ─────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl text-mulled-wine">v3 Smart Training Dataset</h2>
            <p className="text-sm text-artichoke font-mono">High-signal, multi-modal features ready for ML.</p>
          </div>
          
          {summaryData?.v3?.summary && summaryData?.v2?.summary && (
            <Suspense
              fallback={
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ChartSkeleton key={i} height="h-36" />
                  ))}
                </div>
              }
            >
              <KpiCardsRow v2Summary={summaryData.v2.summary} v3Summary={summaryData.v3.summary} />
            </Suspense>
          )}

          {distributionData?.v3?.histogram && summaryData?.v3?.summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ChartSkeleton height="h-[420px]" />}>
                <ViralityHistogram
                  buckets={distributionData.v3.histogram}
                  summary={summaryData.v3.summary}
                />
              </Suspense>

              {distributionData?.v3?.correlation_matrix && (
                <Suspense fallback={<ChartSkeleton height="h-[420px]" />}>
                  <CorrelationHeatmap cells={distributionData.v3.correlation_matrix} />
                </Suspense>
              )}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-artichoke/20" />

        {/* ── Section: v2 Corpus Analytics ───────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl text-mulled-wine">v2 Cleaned Trends Archive</h2>
            <p className="text-sm text-artichoke font-mono">Raw engagement signals across the entire processed corpus.</p>
          </div>
          
          {distributionData?.v2?.correlation_matrix && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<ChartSkeleton height="h-[420px]" />}>
                <CorrelationHeatmap cells={distributionData.v2.correlation_matrix} />
              </Suspense>
              
              {/* Note: In a real implementation we would render engagement box-plots here. 
                  For now we show a placeholder for the v2 engagement distribution. */}
              <div className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
                 <h3 className="font-heading text-xl text-mulled-wine mb-2">Engagement Distributions</h3>
                 <p className="text-sm text-artichoke font-mono">Box Plots (Views, Likes, Comments) coming soon.</p>
                 <div className="mt-4 text-[10px] uppercase tracking-widest text-cranberry bg-cranberry/10 px-3 py-1 rounded-full border border-cranberry/20">
                   Phase 2
                 </div>
              </div>
            </div>
          )}
        </section>

        <div className="h-px w-full bg-artichoke/20" />

        {/* ── Section: Phase 2 Charts (Live Pulse / Multi-modal) ─────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl text-mulled-wine">Live Pulse & Inference Breakdown</h2>
            <p className="text-sm text-artichoke font-mono">Phase 2: Live trend velocity and multi-modal AI attribution.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
              <ClusterBubbleChart />
            </Suspense>
            <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
              <TrendLeaderboard />
            </Suspense>
            <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
              <TwoStreamRadar />
            </Suspense>
          </div>
        </section>

        {/* ── Data provenance footer strip ───────────────────────────────── */}
        <div
          className="rounded-2xl border border-artichoke/15 bg-artichoke/5 p-5 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-8"
        >
          <div className="text-xs font-mono text-artichoke leading-relaxed">
            <span className="text-mulled-wine font-semibold">Data Sources: </span>
            YouTube Data API v3 (6.01 GB raw corpus) ·
            Spark Out-of-Core ETL (96 chunks) ·
            IQR outlier rejection · Global deduplication
          </div>
          <div className="shrink-0 h-px w-full md:h-8 md:w-px bg-artichoke/15" />
          <div className="text-xs font-mono text-artichoke leading-relaxed">
            <span className="text-mulled-wine font-semibold">Model: </span>
            TrendSenseMultiModal v2 · SBERT (384d) + ViT (768d) + Tabular (3d)
            → 1,155-dim fused → FC(512) → FC(128) → Virality Score
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
