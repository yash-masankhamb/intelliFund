export interface Fund {
  id: string;
  name: string;
  category: string;
  cagr: number;
  risk: "High" | "Moderate" | "Low";
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface RecommendationsRequest {
  risk_level: "low" | "medium" | "high";
  investment_goal: string;
  time_horizon: number;
  monthly_investment: number;
}

export interface RecommendationsResponse {
  recommended_funds: Fund[];
  reasoning: string[];
}

export interface MarketInsightsResponse {
  sentiment: "bullish" | "bearish" | "sideways";
  trend_score: number;
  index_symbol: string;
  recent_closes: number[];
  recommended_funds: Fund[];
}

