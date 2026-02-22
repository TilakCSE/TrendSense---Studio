import { useState, useCallback } from 'react';
import type { PredictResponse, PredictionState } from '@/types';
import { apiConfig } from '@/config';

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const predict = useCallback(async (content: string): Promise<void> => {
    if (!content.trim()) {
      setState({
        status: 'error',
        data: null,
        error: { message: 'Please enter some content to analyze' },
      });
      return;
    }

    setState({
      status: 'loading',
      data: null,
      error: null,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

      const response = await fetch(apiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictResponse = await response.json();

      // Validate response data
      if (typeof data.score !== 'number' || !data.sentiment) {
        throw new Error('Invalid response format from server');
      }

      setState({
        status: 'success',
        data,
        error: null,
      });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      let errorCode = 'UNKNOWN_ERROR';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
          errorCode = 'TIMEOUT_ERROR';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to prediction server. Please ensure the API is running.';
          errorCode = 'CONNECTION_ERROR';
        } else {
          errorMessage = error.message;
          errorCode = 'API_ERROR';
        }
      }

      setState({
        status: 'error',
        data: null,
        error: { message: errorMessage, code: errorCode },
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    predict,
    reset,
  };
}
