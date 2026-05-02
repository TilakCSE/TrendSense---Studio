"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";
import type { HistogramBucket, V3Summary } from "@/types/analytics";
import {
  BRAND,
  AXIS_STYLE,
  GRID_STYLE,
  TOOLTIP_STYLE,
  histogramBucketColor,
} from "@/lib/chartTheme";

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayload {
  payload: HistogramBucket;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="p-3 min-w-[160px]">
      <p style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: "8px" }}>
        Virality: <span className="font-heading">{d.bucket}</span>
      </p>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-4">
          <span style={{ color: BRAND.artichoke }}>Count</span>
          <span style={{ color: BRAND.mulledWine, fontWeight: 600 }}>
            {d.count.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: BRAND.artichoke }}>Share</span>
          <span style={{ color: BRAND.mulledWine, fontWeight: 600 }}>
            {d.pct.toFixed(2)}%
          </span>
        </div>
        {d.isViral && (
          <div
            className="mt-2 text-center text-[10px] uppercase tracking-widest font-semibold rounded px-2 py-0.5"
            style={{
              background: `${BRAND.cranberry}18`,
              color: BRAND.cranberry,
              border: `1px solid ${BRAND.cranberry}30`,
            }}
          >
            🔥 Viral Zone
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart Section Header ─────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-heading text-2xl text-mulled-wine leading-tight">
          {title}
        </h2>
        <p className="text-xs text-artichoke uppercase tracking-widest font-mono mt-1">
          {subtitle}
        </p>
      </div>
      {badge && (
        <span
          className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border font-semibold"
          style={{
            color: BRAND.cranberry,
            background: `${BRAND.cranberry}10`,
            borderColor: `${BRAND.cranberry}30`,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Virality Histogram ────────────────────────────────────────────────────────

interface ViralityHistogramProps {
  buckets: HistogramBucket[];
  summary: Pick<
    V3Summary,
    "virality_mean" | "virality_median" | "viral_threshold_pct"
  >;
}

export default function ViralityHistogram({
  buckets,
  summary,
}: ViralityHistogramProps) {
  if (!buckets || !summary) {
    return <div className="animate-pulse bg-artichoke/20 h-64 w-full rounded-2xl" />;
  }

  // Recharts needs a numeric X domain; map bucket index → label
  const safeBuckets = Array.isArray(buckets) ? buckets : [];
  const data = safeBuckets.map((b, i) => ({ ...b, index: i }));

  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 shadow-lg"
    >
      <SectionHeader
        title="Virality Score Distribution"
        subtitle={`${buckets.reduce((s, b) => s + b.count, 0).toLocaleString()} training records · 10-bucket histogram`}
        badge="v3 Dataset"
      />

      {/* Stat trio above chart */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Mean Score", value: `${summary.virality_mean.toFixed(1)}/100` },
          { label: "Median Score", value: `${summary.virality_median.toFixed(1)}/100` },
          { label: "Viral Rate (≥70)", value: `${summary.viral_threshold_pct.toFixed(1)}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="text-center p-3 rounded-xl border border-artichoke/15 bg-mashed-potatoes/40"
          >
            <p className="text-lg font-heading text-mulled-wine">{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-artichoke font-mono mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* The Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 8, left: 0, bottom: 8 }}
            barCategoryGap="12%"
          >
            <CartesianGrid
              vertical={false}
              stroke={GRID_STYLE.stroke}
              strokeOpacity={GRID_STYLE.strokeOpacity}
              strokeDasharray={GRID_STYLE.strokeDasharray}
            />
            <XAxis
              dataKey="bucket"
              tick={{ ...AXIS_STYLE.tick, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={42}
            />
            <YAxis
              tick={AXIS_STYLE.tick}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
              width={42}
              label={{
                value: "Record Count",
                angle: -90,
                position: "insideLeft",
                offset: 12,
                style: { ...AXIS_STYLE.label, fontSize: 11 },
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: `${BRAND.artichoke}14` }}
            />

            {/* Mean reference line */}
            <ReferenceLine
              x={
                data.find(
                  (d) =>
                    d.index ===
                    Math.floor(summary.virality_mean / 10)
                )?.bucket
              }
              stroke={BRAND.artichoke}
              strokeDasharray="6 3"
              label={{
                value: `Mean ${summary.virality_mean.toFixed(1)}`,
                position: "insideTopRight",
                style: { ...AXIS_STYLE.label, fontSize: 10 },
              }}
            />

            {/* Viral zone threshold */}
            <ReferenceLine
              x="70–80"
              stroke={BRAND.cranberry}
              strokeDasharray="4 4"
              label={{
                value: "Viral ≥70",
                position: "insideTopLeft",
                style: { fill: BRAND.cranberry, fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 600 },
              }}
            />

            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={histogramBucketColor(index, entry.isViral)}
                  fillOpacity={0.9}
                />
              ))}
              {/* Show percentage label on top of the tallest bar only */}
              <LabelList
                dataKey="pct"
                position="top"
                formatter={(v: any) => (Number(v) > 10 ? `${Number(v).toFixed(0)}%` : "")}
                style={{ fill: BRAND.artichoke, fontSize: 10, fontFamily: "var(--font-body)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Viral zone legend pill */}
      <div className="mt-4 flex items-center gap-2 justify-end">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ background: BRAND.cranberry }}
        />
        <span className="text-[10px] text-artichoke font-mono uppercase tracking-widest">
          Viral Zone (Score ≥ 70)
        </span>
        <div
          className="w-3 h-3 rounded-sm ml-3"
          style={{ background: BRAND.artichoke }}
        />
        <span className="text-[10px] text-artichoke font-mono uppercase tracking-widest">
          Sub-viral
        </span>
      </div>
    </motion.div>
  );
}
