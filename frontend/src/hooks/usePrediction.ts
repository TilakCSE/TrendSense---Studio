"use client";
import { useState, useCallback } from "react";
import type {
    BackendPredictRequest,
    BackendPredictResponse,
    PredictionState,
} from "@/types/prediction";
import { apiConfig } from "@/lib/config";

export function usePrediction() {
    const [state, setState] = useState<PredictionState>({
        status: "idle",
        data: null,
        error: null,
    });

    const predict = useCallback(
        async (postText: string, simulatedHour?: number): Promise<void> => {
            if (!postText.trim()) {
                setState({
                    status: "error",
                    data: null,
                    error: { message: "Please enter some content to analyze" },
                });
                return;
            }

            setState({ status: "loading", data: null, error: null });

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(
                    () => controller.abort(),
                    apiConfig.timeout
                );

                const payload: BackendPredictRequest = {
                    post_text: postText,
                    ...(simulatedHour !== undefined && {
                        simulated_hour: simulatedHour,
                    }),
                };

                const response = await fetch(apiConfig.endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data: BackendPredictResponse = await response.json();

                // Validate response strictly against FastAPI contract
                if (
                    typeof data.virality_index !== "number" ||
                    typeof data.sentiment_score !== "number" ||
                    !Array.isArray(data.top_features) ||
                    typeof data.ai_suggestion !== "string"
                ) {
                    throw new Error("Invalid response format from server");
                }

                setState({ status: "success", data, error: null });
            } catch (error) {
                let message = "An unexpected error occurred";
                let code = "UNKNOWN_ERROR";

                if (error instanceof Error) {
                    if (error.name === "AbortError") {
                        message = "Request timed out. Please try again.";
                        code = "TIMEOUT_ERROR";
                    } else if (
                        error.message.includes("Failed to fetch") ||
                        error.message.includes("NetworkError")
                    ) {
                        message =
                            "Cannot connect to the prediction server. Please check your internet connection or try again later.";
                        code = "CONNECTION_ERROR";
                    } else {
                        message = error.message;
                        code = "API_ERROR";
                    }
                }

                setState({ status: "error", data: null, error: { message, code } });
            }
        },
        []
    );

    const reset = useCallback(() => {
        setState({ status: "idle", data: null, error: null });
    }, []);

    return { ...state, predict, reset };
}
