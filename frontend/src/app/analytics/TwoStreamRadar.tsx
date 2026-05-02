"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { BRAND, TOOLTIP_STYLE } from "@/lib/chartTheme";

interface StreamData {
  subject: string;
  A: number;
  fullMark: number;
}

const MOCK_STREAM_DATA: StreamData[] = [
  { subject: "Text (SBERT)", A: 92, fullMark: 100 },
  { subject: "Vision (ViT)", A: 85, fullMark: 100 },
  { subject: "Tabular", A: 45, fullMark: 100 },
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as StreamData;
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="p-3 min-w-[150px]">
      <p style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: "4px" }}>
        {d.subject}
      </p>
      <div className="flex justify-between gap-4 text-[11px]">
        <span style={{ color: BRAND.artichoke }}>Contribution</span>
        <span style={{ color: BRAND.cranberry, fontWeight: 700 }}>{d.A}%</span>
      </div>
    </div>
  );
}

export default function TwoStreamRadar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
      className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 shadow-lg h-full flex flex-col"
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl text-mulled-wine leading-tight">
            Inference Breakdown
          </h2>
          <p className="text-xs text-artichoke uppercase tracking-widest font-mono mt-1">
            Two-Stream AI Attribution
          </p>
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border font-semibold"
          style={{ color: BRAND.cranberry, background: `${BRAND.cranberry}10`, borderColor: `${BRAND.cranberry}30` }}
        >
          Phase 2
        </span>
      </div>

      <div className="flex-1 min-h-[250px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_STREAM_DATA}>
            <PolarGrid stroke={`${BRAND.artichoke}40`} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: BRAND.mulledWine, fontSize: 11, fontFamily: "var(--font-body)", fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Viral Prediction"
              dataKey="A"
              stroke={BRAND.cabernet}
              strokeWidth={2}
              fill={BRAND.cranberry}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
