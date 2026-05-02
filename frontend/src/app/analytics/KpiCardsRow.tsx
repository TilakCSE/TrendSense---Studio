"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import type { V2Summary, V3Summary } from "@/types/analytics";
import { BRAND } from "@/lib/chartTheme";
import {
  Database,
  Zap,
  BrainCircuit,
  Layers,
  TrendingUp,
  Activity,
} from "lucide-react";

// ─── Individual KPI Card ──────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  subLabel?: string;
  isLive?: boolean;
  accentColor?: string;
  delay?: number;
}

function KpiCard({
  icon,
  label,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  subLabel,
  isLive = false,
  accentColor = BRAND.cranberry,
  delay = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 shadow-lg group"
    >
      {/* Subtle top-edge accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: accentColor }}
      />

      <div className="flex items-start justify-between mb-4">
        {/* Icon badge */}
        <div
          className="p-2.5 rounded-xl border"
          style={{
            background: `${accentColor}14`,
            borderColor: `${accentColor}30`,
          }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>

        {/* Live badge */}
        {isLive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cranberry/10 border border-cranberry/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cranberry opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cranberry" />
            </span>
            <span className="text-[10px] font-mono text-cranberry uppercase tracking-widest font-semibold">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Main metric */}
      <div className="mb-1">
        <span className="text-3xl font-heading text-mulled-wine tracking-tight">
          {prefix}
          <CountUp
            end={value}
            duration={1.8}
            decimals={decimals}
            separator=","
            delay={delay}
          />
          {suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-xs uppercase tracking-widest text-artichoke font-semibold font-mono">
        {label}
      </p>

      {/* Sub-label */}
      {subLabel && (
        <p className="mt-2 text-[11px] text-artichoke/70 font-mono leading-relaxed border-t border-artichoke/10 pt-2">
          {subLabel}
        </p>
      )}
    </motion.div>
  );
}

// ─── KPI Cards Row ────────────────────────────────────────────────────────────

interface KpiCardsRowProps {
  v2Summary: V2Summary;
  v3Summary: V3Summary;
}

export default function KpiCardsRow({ v2Summary, v3Summary }: KpiCardsRowProps) {
  if (!v2Summary || !v3Summary) {
    return <div className="animate-pulse bg-artichoke/20 h-36 w-full rounded-2xl" />;
  }

  const cards: KpiCardProps[] = [
    {
      icon:       <Database className="w-5 h-5" />,
      label:      "Distilled Training Rows",
      value:      v3Summary.total_training_rows,
      suffix:     "",
      subLabel:   `From ${(v2Summary.total_corpus_rows / 1_000_000).toFixed(1)}M raw corpus records`,
      accentColor: BRAND.greenBean,
      delay:      0,
    },
    {
      icon:       <Layers className="w-5 h-5" />,
      label:      "Raw Archive Ingested",
      value:      v2Summary.raw_archive_gb,
      suffix:     " GB",
      decimals:   2,
      subLabel:   `${v2Summary.etl_chunks} out-of-core ETL chunks`,
      accentColor: BRAND.artichoke,
      delay:      0.08,
    },
    {
      icon:       <BrainCircuit className="w-5 h-5" />,
      label:      "Input Modalities",
      value:      v3Summary.modalities,
      suffix:     "",
      subLabel:   "Text (SBERT) · Vision (ViT) · Tabular",
      accentColor: BRAND.cranberry,
      delay:      0.16,
    },
    {
      icon:       <TrendingUp className="w-5 h-5" />,
      label:      "Mean Virality Score",
      value:      v3Summary.virality_mean,
      suffix:     "/100",
      decimals:   1,
      subLabel:   `Median ${v3Summary.virality_median.toFixed(1)} · Std ±${v3Summary.virality_std.toFixed(1)}`,
      accentColor: BRAND.cranberry,
      delay:      0.24,
    },
    {
      icon:       <TrendingUp className="w-5 h-5" />,
      label:      "Viral Content Rate",
      value:      v3Summary.viral_threshold_pct,
      suffix:     "%",
      decimals:   1,
      subLabel:   "Content scoring ≥ 70/100 on Virality Index",
      accentColor: BRAND.cabernet,
      delay:      0.32,
    },
    {
      icon:       <Activity className="w-5 h-5" />,
      label:      "Live Records / Day",
      value:      v3Summary.live_records_per_day,
      suffix:     "",
      subLabel:   "Reddit velocity stream via MongoDB",
      isLive:     true,
      accentColor: BRAND.cranberry,
      delay:      0.40,
    },
    {
      icon:       <Zap className="w-5 h-5" />,
      label:      "Avg. Views per Video",
      value:      v3Summary.median_views,
      suffix:     "",
      subLabel:   `Mean ${(v3Summary.avg_views / 1000).toFixed(0)}K · Median values shown (IQR-cleaned)`,
      accentColor: BRAND.artichoke,
      delay:      0.48,
    },
    {
      icon:       <Zap className="w-5 h-5" />,
      label:      "Avg. Likes per Video",
      value:      v3Summary.median_likes,
      suffix:     "",
      subLabel:   `Mean ${(v3Summary.avg_likes / 1000).toFixed(1)}K · IQR outliers removed during ETL`,
      accentColor: BRAND.artichoke,
      delay:      0.56,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
