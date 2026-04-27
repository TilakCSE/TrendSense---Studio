// =============================================================================
// TrendSense — API configuration
// Override endpoint via NEXT_PUBLIC_API_URL env var for staging/prod.
// =============================================================================

export interface ApiConfig {
    endpoint: string;
    timeout: number;
}

export const apiConfig: ApiConfig = {
    // Pointing directly to your live Hugging Face cloud engine!
    endpoint: process.env.NEXT_PUBLIC_API_URL ?? "https://tilakcse-trendsense-api.hf.space/api/predict",
    timeout: 30_000, // INCREASED to 30s to give the cloud CPU time to process the neural net
};