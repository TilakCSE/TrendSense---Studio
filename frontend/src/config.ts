// =============================================================================
// TrendSense - Virality Predictor Configuration
// =============================================================================

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "TrendSense | AI Virality Predictor",
  description: "Predict the viral potential of your content with AI-powered analysis",
  language: "en",
};

// -- API Configuration --------------------------------------------------------
export interface ApiConfig {
  endpoint: string;
  timeout: number;
}

export const apiConfig: ApiConfig = {
  endpoint: "http://localhost:8000/predict",
  timeout: 10000,
};

// -- Hero Configuration -------------------------------------------------------
export interface HeroConfig {
  brandName: string;
  tagline: string;
  subtitle: string;
  cornerLabel: string;
  cornerValue: string;
}

export const heroConfig: HeroConfig = {
  brandName: "TrendSense",
  tagline: "Predict Virality",
  subtitle: "AI-powered content analysis for the next generation of creators",
  cornerLabel: "AI Model",
  cornerValue: "v2.4.1",
};

// -- Input Panel Configuration ------------------------------------------------
export interface InputConfig {
  label: string;
  placeholder: string;
  maxLength: number;
  buttonText: string;
  buttonTextLoading: string;
}

export const inputConfig: InputConfig = {
  label: "Post Draft",
  placeholder: "Type or paste your content here to analyze its viral potential...",
  maxLength: 500,
  buttonText: "Predict Virality",
  buttonTextLoading: "Analyzing...",
};

// -- Results Panel Configuration ----------------------------------------------
export interface ResultsConfig {
  scoreLabel: string;
  sentimentLabel: string;
  scoreUnit: string;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
}

export const resultsConfig: ResultsConfig = {
  scoreLabel: "Virality Score",
  sentimentLabel: "Sentiment Analysis",
  scoreUnit: "/100",
  emptyStateTitle: "Ready to Analyze",
  emptyStateSubtitle: "Enter your content and click predict to see results",
};

// -- 3D Scene Configuration ---------------------------------------------------
export interface Scene3DConfig {
  sphereColor: string;
  sphereEmissive: string;
  floorColor: string;
  ambientLightIntensity: number;
  rimLightIntensity: number;
}

export const scene3DConfig: Scene3DConfig = {
  sphereColor: "#00FF88",
  sphereEmissive: "#00FF88",
  floorColor: "#0a0a0a",
  ambientLightIntensity: 0.3,
  rimLightIntensity: 1.5,
};

// -- Sentiment Configuration --------------------------------------------------
export interface SentimentConfig {
  positive: {
    label: string;
    color: string;
    glow: string;
  };
  neutral: {
    label: string;
    color: string;
    glow: string;
  };
  negative: {
    label: string;
    color: string;
    glow: string;
  };
}

export const sentimentConfig: SentimentConfig = {
  positive: {
    label: "Positive",
    color: "#00FF88",
    glow: "rgba(0, 255, 136, 0.5)",
  },
  neutral: {
    label: "Neutral",
    color: "#FFD700",
    glow: "rgba(255, 215, 0, 0.5)",
  },
  negative: {
    label: "Negative",
    color: "#FF4444",
    glow: "rgba(255, 68, 68, 0.5)",
  },
};
