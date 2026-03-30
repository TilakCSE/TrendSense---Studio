// =============================================================================
// TrendSense — Keyword Analyzer
// Converts raw top_features from FastAPI into display-ready results.
// Pure client-side utility — no Node APIs, safe anywhere.
// =============================================================================

/** A single extracted keyword with its display weight. */
export interface KeywordResult {
    keyword: string;
    score: number;
    weight: "high" | "medium" | "low";
}

/**
 * ML model feature names often carry library prefixes like `tfidf__word` or
 * `count__phrase`. Strip them so the UI shows clean terms.
 */
const ML_PREFIX_RE = /^(tfidf__|count__|bow__|ngram__|hashing__|text__)/i;

function cleanFeatureName(raw: string): string {
    return raw.replace(ML_PREFIX_RE, "").replace(/_/g, " ").trim();
}

function classifyWeight(score: number): KeywordResult["weight"] {
    if (score >= 0.3) return "high";
    if (score >= 0.1) return "medium";
    return "low";
}

/**
 * Convert `top_features` from `BackendPredictResponse` into display-ready
 * `KeywordResult[]`, sorted highest influence first (top 10 max).
 *
 * @example
 * const keywords = extractKeywords(data.top_features);
 */
export function extractKeywords(
    topFeatures: [string, number][]
): KeywordResult[] {
    return topFeatures
        .map(([raw, rawScore]) => {
            const score = Math.abs(rawScore); // Model may emit signed influence
            return {
                keyword: cleanFeatureName(raw),
                score,
                weight: classifyWeight(score),
            };
        })
        .filter((k) => k.keyword.length > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

/**
 * A lightweight content preview: extracts the most distinctive words
 * (length ≥ 5, lowercased, deduplicated) from raw post text.
 * Useful as a subtitle or tooltip when displaying results.
 */
export function summarizeText(text: string): string {
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length >= 5);

    const unique = [...new Set(words)].slice(0, 8);
    return unique.join(", ");
}
