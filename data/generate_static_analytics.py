"""
generate_static_analytics.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run this script ONCE locally to pre-compute all analytics metrics from
the raw Parquet datasets. It writes a single `static_analytics.json` file
that the FastAPI server serves instantly — no runtime Parquet I/O needed.

Usage:
    cd d:/Development/Projects/TrendSense---Studio/data
    python generate_static_analytics.py

Output:
    data/static_analytics.json
"""

import os
import json
import math
import numpy as np
import pandas as pd

# ─── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))

# v2: Spark-partitioned directory (contains part-00000-*.snappy.parquet)
V2_PARQUET   = os.path.join(SCRIPT_DIR, "v2_cleaned_trends.parquet")

# v3: Single-file multimodal training set (with text/vision embeddings + virality_score)
V3_PARQUET   = os.path.join(SCRIPT_DIR, "v3_smart_training_data.parquet")

OUTPUT_JSON  = os.path.join(SCRIPT_DIR, "static_analytics.json")

# ─── Helpers ──────────────────────────────────────────────────────────────────

def safe_float(val):
    """Convert numpy types / NaN to plain Python floats safely."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    return round(float(val), 4)

def safe_int(val):
    """Convert numpy int types to plain Python int."""
    return int(val)

def box_stats(series, label):
    s = series.dropna()
    if len(s) == 0:
        return {
            "metric": label,
            "min": 0.0, "q1": 0.0, "median": 0.0, "q3": 0.0, "max": 0.0, "mean": 0.0
        }
    q1, median, q3 = s.quantile([0.25, 0.50, 0.75])
    iqr = q3 - q1
    lower_whisker = max(s.min(), q1 - 1.5 * iqr)
    upper_whisker = min(s.max(), q3 + 1.5 * iqr)
    return {
        "metric":        label,
        "min":           safe_float(lower_whisker),
        "q1":            safe_float(q1),
        "median":        safe_float(median),
        "q3":            safe_float(q3),
        "max":           safe_float(upper_whisker),
        "mean":          safe_float(s.mean()),
    }

def calculate_correlations(df, labels, cols):
    corr_df = df[cols].copy()
    corr_matrix_raw = corr_df.corr(method="pearson")
    correlation_matrix = []
    for i, row_label in enumerate(labels):
        for j, col_label in enumerate(labels):
            correlation_matrix.append({
                "x": col_label,
                "y": row_label,
                "value": safe_float(corr_matrix_raw.iloc[i, j])
            })
    return correlation_matrix

# ─── Load datasets ────────────────────────────────────────────────────────────

print("=" * 60)
print("  TrendSense — Static Analytics Generator (v2 + v3)")
print("=" * 60)

# -- v2 cleaned trends (broader YouTube corpus) -------------------------------
print(f"\n[1/4] Loading v2 cleaned trends from:\n      {V2_PARQUET}")
v2_df = pd.read_parquet(V2_PARQUET)
v2_rows = len(v2_df)
print(f"      Loaded {v2_rows:,} rows  |  Columns: {list(v2_df.columns)}")

# -- v3 multimodal training data (primary analytics source) -------------------
print(f"\n[2/4] Loading v3 training data from:\n      {V3_PARQUET}")
v3_df = pd.read_parquet(
    V3_PARQUET,
    columns=["view_count", "like_count", "comment_count", "virality_score"]
)
v3_rows = len(v3_df)
print(f"      Loaded {v3_rows:,} rows  |  Columns: {list(v3_df.columns)}")

# ─── BLOCK 1: v2 Analytics (Corpus without Virality) ──────────────────────────
print("\n[3/4] Computing v2 metrics...")
v2_summary = {
    "total_corpus_rows":    safe_int(v2_rows),
    "raw_archive_gb":       6.01,
    "etl_chunks":           96,
    "avg_views":            safe_float(v2_df["view_count"].mean()),
    "avg_likes":            safe_float(v2_df["like_count"].mean()),
    "avg_comments":         safe_float(v2_df["comment_count"].mean()),
    "median_views":         safe_float(v2_df["view_count"].median()),
    "median_likes":         safe_float(v2_df["like_count"].median()),
    "median_comments":      safe_float(v2_df["comment_count"].median()),
}

v2_correlations = calculate_correlations(
    v2_df,
    ["Views", "Likes", "Comments"],
    ["view_count", "like_count", "comment_count"]
)

v2_engagement_stats = [
    box_stats(v2_df["view_count"],    "Views"),
    box_stats(v2_df["like_count"],    "Likes"),
    box_stats(v2_df["comment_count"], "Comments"),
]

# ─── BLOCK 2: v3 Analytics (Training Dataset with Virality) ───────────────────
print("\n[4/4] Computing v3 metrics...")
virality = v3_df["virality_score"].dropna()
virality_ui = virality * 10.0

v3_summary = {
    "total_training_rows":  safe_int(v3_rows),
    "modalities":           3,
    "live_records_per_day": 1200,

    "virality_mean":        safe_float(virality_ui.mean()),
    "virality_median":      safe_float(virality_ui.median()),
    "virality_std":         safe_float(virality_ui.std()),
    "virality_p25":         safe_float(virality_ui.quantile(0.25)),
    "virality_p75":         safe_float(virality_ui.quantile(0.75)),
    "virality_max":         safe_float(virality_ui.max()),
    "viral_threshold_pct":  safe_float((virality_ui >= 70).sum() / len(virality_ui) * 100),

    "avg_views":            safe_float(v3_df["view_count"].mean()),
    "avg_likes":            safe_float(v3_df["like_count"].mean()),
    "avg_comments":         safe_float(v3_df["comment_count"].mean()),
    "median_views":         safe_float(v3_df["view_count"].median()),
    "median_likes":         safe_float(v3_df["like_count"].median()),
    "median_comments":      safe_float(v3_df["comment_count"].median()),
}

v3_df_corr = v3_df.copy()
v3_df_corr["virality_score"] = v3_df_corr["virality_score"] * 10.0
v3_correlations = calculate_correlations(
    v3_df_corr,
    ["Views", "Likes", "Comments", "Virality"],
    ["view_count", "like_count", "comment_count", "virality_score"]
)

v3_engagement_stats = [
    box_stats(v3_df["view_count"],    "Views"),
    box_stats(v3_df["like_count"],    "Likes"),
    box_stats(v3_df["comment_count"], "Comments"),
]

bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
labels = ["0–10", "10–20", "20–30", "30–40", "40–50",
          "50–60", "60–70", "70–80", "80–90", "90–100"]

counts, _ = np.histogram(virality_ui.clip(0, 100), bins=bins)
v3_histogram = [
    {
        "bucket":     labels[i],
        "count":      safe_int(counts[i]),
        "pct":        safe_float(counts[i] / len(virality_ui) * 100),
        "isViral":    i >= 7
    }
    for i in range(len(labels))
]

sample_n = min(2000, len(v3_df))
scatter_df = v3_df[["like_count", "virality_score", "comment_count"]].dropna()
scatter_df["virality_ui"] = scatter_df["virality_score"] * 10.0
scatter_sample = (
    scatter_df
    .groupby(pd.cut(scatter_df["virality_ui"], bins=4), observed=True)
    .apply(lambda g: g.sample(min(len(g), sample_n // 4), random_state=42))
    .reset_index(drop=True)
)
scatter_sample = scatter_sample.head(sample_n)
q_labels = ["Low", "Medium", "High", "Very High"]
scatter_sample["comment_quartile"] = pd.qcut(
    scatter_sample["comment_count"], q=4, labels=q_labels, duplicates="drop"
)
v3_scatter = [
    {
        "likes":            safe_int(row["like_count"]),
        "virality":         safe_float(row["virality_ui"]),
        "commentQuartile":  str(row["comment_quartile"]),
    }
    for _, row in scatter_sample.iterrows()
]

# ─── Assemble & Write ─────────────────────────────────────────────────────────
output = {
    "generated_at": pd.Timestamp.now().isoformat(),
    "v2": {
        "summary": v2_summary,
        "correlation_matrix": v2_correlations,
        "engagement_stats": v2_engagement_stats,
    },
    "v3": {
        "summary": v3_summary,
        "histogram": v3_histogram,
        "correlation_matrix": v3_correlations,
        "engagement_stats": v3_engagement_stats,
        "scatter_sample": v3_scatter,
    }
}

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\nDone! Written to: {OUTPUT_JSON}")
