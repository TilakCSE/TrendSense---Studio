// =============================================================================
// Backend API Types - FastAPI Integration
// =============================================================================

/**
 * Request payload sent to FastAPI /predict endpoint
 */
export interface BackendPredictRequest {
  post_text: string;
  simulated_hour?: number; // Optional: 0-23 hour simulation
}

/**
 * Response received from FastAPI /predict endpoint
 */
export interface BackendPredictResponse {
  virality_index: number;        // 0-100 virality score
  sentiment_score: number;        // -1 to 1 sentiment rating
  top_features: [string, number][]; // Array of [feature_name, influence_score] tuples
  ai_suggestion: string;          // Oracle's AI-generated advice
}

/**
 * UI state for prediction flow
 */
export type PredictionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PredictionError {
  message: string;
  code?: string;
}

export interface PredictionState {
  status: PredictionStatus;
  data: BackendPredictResponse | null;
  error: PredictionError | null;
}
