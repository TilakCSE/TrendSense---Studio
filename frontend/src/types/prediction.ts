// =============================================================================
// Backend API Types — FastAPI /predict contract
// Kept in strict 1-to-1 sync with FastAPI response schema.
// =============================================================================

/**
 * POST /predict — request body
 */
export interface BackendPredictRequest {
    post_text: string;
    simulated_hour?: number; // 0-23, optional
}

/**
 * POST /predict — response body
 */
export interface BackendPredictResponse {
    virality_index: number;             // 0-100 virality score
    sentiment_score: number;            // -1 to 1
    top_features: [string, number][];   // [feature_name, influence_score]
    ai_suggestion: string;              // Oracle-generated advice
}

// -- UI state -----------------------------------------------------------------

export type PredictionStatus = "idle" | "loading" | "success" | "error";

export interface PredictionError {
    message: string;
    code?: string;
}

export interface PredictionState {
    status: PredictionStatus;
    data: BackendPredictResponse | null;
    error: PredictionError | null;
}
