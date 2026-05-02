"use client";

import { motion } from "framer-motion";
import type { CorrelationCell } from "@/types/analytics";
import { BRAND } from "@/lib/chartTheme";

// ─── Colour interpolation for Pearson r (-1 → 0 → +1) ───────────────────────

function rToColor(r: number): string {
  if (r === null || r === undefined) return "#ccc";
  // -1.0 → cranberry (#734141)
  //  0.0 → mashed-potatoes (#fff2e6)
  // +1.0 → green-bean (#052102)

  if (r >= 0) {
    // interpolate from mashed-potatoes → green-bean
    const t = r;
    const rC = Math.round(0xff + t * (0x05 - 0xff));
    const gC = Math.round(0xf2 + t * (0x21 - 0xf2));
    const bC = Math.round(0xe6 + t * (0x02 - 0xe6));
    return `rgb(${rC},${gC},${bC})`;
  } else {
    // interpolate from mashed-potatoes → cranberry
    const t = -r;
    const rC = Math.round(0xff + t * (0x73 - 0xff));
    const gC = Math.round(0xf2 + t * (0x41 - 0xf2));
    const bC = Math.round(0xe6 + t * (0x41 - 0xe6));
    return `rgb(${rC},${gC},${bC})`;
  }
}

function textColorForBg(r: number): string {
  // Use white text on dark cells, dark text on light cells
  return Math.abs(r) > 0.55 ? "#fff2e6" : BRAND.mulledWine;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CorrelationHeatmapProps {
  cells: CorrelationCell[];
}

export default function CorrelationHeatmap({ cells }: CorrelationHeatmapProps) {
  if (!cells || !Array.isArray(cells)) {
    return <div className="animate-pulse bg-artichoke/20 h-64 w-full rounded-2xl" />;
  }

  // Extract unique labels dynamically from cells
  const uniqueLabels = Array.from(new Set(cells.map(c => c.x)));
  const LABELS = uniqueLabels.length > 0 ? uniqueLabels : ["Views", "Likes", "Comments", "Virality"];

  // Build a lookup map: `${x}|${y}` → value
  const lookup = new Map<string, number>(
    cells.map((c) => [`${c.x}|${c.y}`, c.value])
  );

  const getValue = (x: string, y: string) =>
    lookup.get(`${x}|${y}`) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-artichoke/20 bg-mashed-potatoes/60 backdrop-blur-sm p-6 shadow-lg"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-mulled-wine">
          Feature Correlation Matrix
        </h2>
        <p className="text-xs text-artichoke uppercase tracking-widest font-mono mt-1">
          Pearson r · v3 training dataset · {LABELS.length}×{LABELS.length} grid
        </p>
      </div>

      {/* Colour legend */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] font-mono uppercase text-artichoke">Strong negative</span>
        <div className="flex gap-0.5">
          {[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((v) => (
            <div
              key={v}
              className="w-5 h-3 rounded-[2px]"
              style={{ background: rToColor(v) }}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono uppercase text-artichoke">Strong positive</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1 mx-auto">
          <thead>
            <tr>
              {/* empty top-left corner */}
              <th className="w-20" />
              {LABELS.map((col) => (
                <th
                  key={col}
                  className="text-[10px] font-mono uppercase tracking-widest pb-1 text-center min-w-[72px]"
                  style={{ color: BRAND.artichoke }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LABELS.map((row) => (
              <tr key={row}>
                {/* Row label */}
                <td
                  className="text-[10px] font-mono uppercase tracking-widest pr-2 text-right"
                  style={{ color: BRAND.artichoke }}
                >
                  {row}
                </td>
                {LABELS.map((col) => {
                  const val = getValue(col, row);
                  const isDiagonal = row === col;
                  return (
                    <td key={col} className="p-0">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 * (LABELS.indexOf(row) + LABELS.indexOf(col)) }}
                        title={`${row} × ${col}: r = ${val.toFixed(3)}`}
                        className="w-[72px] h-[52px] rounded-lg flex flex-col items-center justify-center cursor-default relative group"
                        style={{
                          background: isDiagonal
                            ? BRAND.mulledWine
                            : rToColor(val),
                          border: isDiagonal
                            ? `2px solid ${BRAND.cranberry}60`
                            : "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <span
                          className="text-[13px] font-heading font-bold"
                          style={{
                            color: isDiagonal ? BRAND.mashedPotatoes : textColorForBg(val),
                          }}
                        >
                          {isDiagonal ? "—" : val.toFixed(2)}
                        </span>
                        {!isDiagonal && (
                          <span
                            className="text-[8px] font-mono uppercase"
                            style={{
                              color: isDiagonal
                                ? BRAND.mashedPotatoes
                                : `${textColorForBg(val)}88`,
                            }}
                          >
                            {val > 0.7
                              ? "Strong"
                              : val > 0.4
                              ? "Moderate"
                              : val > 0.1
                              ? "Weak"
                              : "None"}
                          </span>
                        )}

                        {/* Hover tooltip */}
                        <div
                          className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex
                                     items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono whitespace-nowrap z-20"
                          style={{
                            background: BRAND.mulledWine,
                            color: BRAND.mashedPotatoes,
                          }}
                        >
                          r = {val.toFixed(4)}
                        </div>
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insight callout */}
      {LABELS.includes("Virality") && (
        <div
          className="mt-5 p-3 rounded-xl border text-[11px] font-mono leading-relaxed"
          style={{
            background: `${BRAND.cranberry}08`,
            borderColor: `${BRAND.cranberry}25`,
            color: BRAND.artichoke,
          }}
        >
          <span style={{ color: BRAND.cranberry, fontWeight: 700 }}>Key insight: </span>
          The Likes ↔ Virality cell reveals how strongly engagement signals drive the model&apos;s
          final prediction — a high r here validates the tabular stream&apos;s contribution.
        </div>
      )}
    </motion.div>
  );
}
