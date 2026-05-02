"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { BRAND, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/lib/chartTheme";

interface TrendData {
  name: string;
  velocity_score: number;
}

const MOCK_TREND_DATA: TrendData[] = [
  { name: "Music + Taylor + Tour", velocity_score: 95 },
  { name: "AI + Models + ChatGPT", velocity_score: 92 },
  { name: "Gaming + GTA + Trailer", velocity_score: 88 },
  { name: "Tech + Apple + Vision", velocity_score: 82 },
  { name: "React + Next.js + Tailwind", velocity_score: 75 },
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TrendData;
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="p-3 min-w-[150px]">
      <p style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: "4px" }}>
        {d.name}
      </p>
      <div className="flex justify-between gap-4 text-[11px]">
        <span style={{ color: BRAND.artichoke }}>Velocity</span>
        <span style={{ color: BRAND.cranberry, fontWeight: 700 }}>{d.velocity_score}</span>
      </div>
    </div>
  );
}

export default function TrendLeaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 shadow-lg h-full flex flex-col"
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl text-mulled-wine leading-tight">
            Trend Leaderboard
          </h2>
          <p className="text-xs text-artichoke uppercase tracking-widest font-mono mt-1">
            Top 5 High Velocity Clusters
          </p>
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border font-semibold"
          style={{ color: BRAND.cranberry, background: `${BRAND.cranberry}10`, borderColor: `${BRAND.cranberry}30` }}
        >
          Phase 2
        </span>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={MOCK_TREND_DATA}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke={GRID_STYLE.stroke}
              strokeOpacity={GRID_STYLE.strokeOpacity}
              strokeDasharray={GRID_STYLE.strokeDasharray}
            />
            <XAxis
              type="number"
              hide
              domain={[0, 'dataMax + 10']}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ ...AXIS_STYLE.tick, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${BRAND.artichoke}14` }} />
            <Bar dataKey="velocity_score" radius={[0, 4, 4, 0]} barSize={24}>
              {MOCK_TREND_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BRAND.cranberry} fillOpacity={0.8 - index * 0.1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
