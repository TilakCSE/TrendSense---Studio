// =============================================================================
// Chart Theme & Brand Palette
// Single source of truth for all Recharts / Nivo colour usage.
// Import this wherever you render a chart.
// =============================================================================

export const BRAND = {
  cranberry:      "#734141",
  greenBean:      "#052102",
  artichoke:      "#586357",
  mashedPotatoes: "#fff2e6",
  mulledWine:     "#280d08",
  cabernet:       "#3d0000",
} as const;

/** 10-color ring used for cluster bubbles, scatter quartiles, etc. */
export const CLUSTER_COLORS = [
  "#734141",
  "#052102",
  "#586357",
  "#9B6B6B",
  "#1a4318",
  "#8B8B6B",
  "#3d0000",
  "#2d5a2a",
  "#a05555",
  "#4a7a47",
] as const;

/** Comment-quartile colours for the scatter chart */
export const QUARTILE_COLORS: Record<string, string> = {
  Low:       "#586357",
  Medium:    "#9B6B6B",
  High:      "#734141",
  "Very High": "#3d0000",
};

/**
 * Histogram bar fill: gradient from muted artichoke → deep cranberry
 * as buckets go from low to high virality.
 * Returns a hex colour for the given 0-indexed bucket (0–9).
 */
export function histogramBucketColor(index: number, isViral: boolean): string {
  if (isViral) return BRAND.cranberry;
  // interpolate from artichoke to a lighter cranberry
  const t = index / 9;
  // Simple lerp on the red channel
  const r = Math.round(0x58 + t * (0x73 - 0x58));
  const g = Math.round(0x63 + t * (0x41 - 0x63));
  const b = Math.round(0x57 + t * (0x41 - 0x57));
  return `rgb(${r},${g},${b})`;
}

/** Shared Recharts axis / grid props — keeps all charts visually consistent. */
export const AXIS_STYLE = {
  tick:   { fill: BRAND.artichoke, fontSize: 11, fontFamily: "var(--font-body)" },
  label:  { fill: BRAND.mulledWine, fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600 },
} as const;

export const GRID_STYLE = {
  stroke:        BRAND.artichoke,
  strokeOpacity: 0.15,
  strokeDasharray: "4 4",
} as const;

export const TOOLTIP_STYLE = {
  contentStyle: {
    background:   BRAND.mashedPotatoes,
    border:       `1px solid ${BRAND.artichoke}44`,
    borderRadius: "10px",
    boxShadow:    "0 4px 24px rgba(40,13,8,0.12)",
    fontFamily:   "var(--font-body)",
    fontSize:     "12px",
    color:        BRAND.mulledWine,
  },
  labelStyle: {
    color:      BRAND.mulledWine,
    fontWeight: 600,
    marginBottom: "4px",
  },
  cursor: { fill: `${BRAND.artichoke}18` },
} as const;
