// =============================================================================
// TrendSense — API configuration
// Override endpoint via NEXT_PUBLIC_API_URL env var for staging/prod.
// =============================================================================

export interface ApiConfig {
    endpoint: string;
    timeout: number;
}

export const apiConfig: ApiConfig = {
    endpoint: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/predict",
    timeout: 10_000,
};
