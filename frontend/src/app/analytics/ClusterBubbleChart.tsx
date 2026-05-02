"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { BRAND, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE, CLUSTER_COLORS } from "@/lib/chartTheme";

interface ClusterData {
  topic_id: number;
  name: string;
  post_count: number;
  velocity_score: number;
}

const MOCK_CLUSTER_DATA: ClusterData[] = [
  { topic_id: 1, name: "AI + Models + ChatGPT", post_count: 1450, velocity_score: 92 },
  { topic_id: 2, name: "React + Next.js + Tailwind", post_count: 850, velocity_score: 75 },
  { topic_id: 3, name: "Gaming + GTA + Trailer", post_count: 2100, velocity_score: 88 },
  { topic_id: 4, name: "Crypto + Bitcoin + ETF", post_count: 620, velocity_score: 65 },
  { topic_id: 5, name: "Music + Taylor + Tour", post_count: 3200, velocity_score: 95 },
  { topic_id: 6, name: "Fitness + Diet + Gym", post_count: 1100, velocity_score: 55 },
  { topic_id: 7, name: "Travel + Japan + Vlog", post_count: 950, velocity_score: 70 },
  { topic_id: 8, name: "Tech + Apple + Vision", post_count: 1800, velocity_score: 82 },
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ClusterData;
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="p-3 min-w-[180px]">
      <p style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: "8px" }}>
        {d.name}
      </p>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-4">
          <span style={{ color: BRAND.artichoke }}>Velocity</span>
          <span style={{ color: BRAND.mulledWine, fontWeight: 600 }}>{d.velocity_score}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: BRAND.artichoke }}>Volume</span>
          <span style={{ color: BRAND.mulledWine, fontWeight: 600 }}>{d.post_count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function ClusterBubbleChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 shadow-lg h-full flex flex-col"
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl text-mulled-wine leading-tight">
            Cluster Momentum
          </h2>
          <p className="text-xs text-artichoke uppercase tracking-widest font-mono mt-1">
            Volume × Velocity · BERTopic
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
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid
              stroke={GRID_STYLE.stroke}
              strokeOpacity={GRID_STYLE.strokeOpacity}
              strokeDasharray={GRID_STYLE.strokeDasharray}
            />
            <XAxis
              type="number"
              dataKey="post_count"
              name="Volume"
              tick={AXIS_STYLE.tick}
              axisLine={false}
              tickLine={false}
              label={{ value: "Post Volume", position: "insideBottom", offset: -5, style: { ...AXIS_STYLE.label, fontSize: 10 } }}
            />
            <YAxis
              type="number"
              dataKey="velocity_score"
              name="Velocity"
              tick={AXIS_STYLE.tick}
              axisLine={false}
              tickLine={false}
              label={{ value: "Velocity Score", angle: -90, position: "insideLeft", offset: 15, style: { ...AXIS_STYLE.label, fontSize: 10 } }}
            />
            <ZAxis type="number" dataKey="velocity_score" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={MOCK_CLUSTER_DATA} fill={BRAND.cranberry}>
              {MOCK_CLUSTER_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
