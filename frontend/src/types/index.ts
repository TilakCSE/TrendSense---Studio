// =============================================================================
// TrendSense Type Definitions
// =============================================================================

// API Response Types
export interface PredictResponse {
  score: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface ApiError {
  message: string;
  code?: string;
}

// UI State Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PredictionState {
  status: LoadingState;
  data: PredictResponse | null;
  error: ApiError | null;
}

// Sentiment Types
export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface SentimentInfo {
  type: SentimentType;
  label: string;
  color: string;
  glow: string;
}

// 3D Scene Types
export interface PhysicsObjectProps {
  position?: [number, number, number];
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}

// Component Props Types
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CharacterCounterProps {
  current: number;
  max: number;
  animated?: boolean;
}

export interface ScoreDisplayProps {
  score: number;
  animated?: boolean;
}

export interface SentimentIndicatorProps {
  sentiment: SentimentType;
  animated?: boolean;
}

export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}
