import {
  Fund,
  MarketInsightsResponse,
  RecommendationsRequest,
  RecommendationsResponse,
} from "@/types/fund";
import { calculatePortfolioMetrics } from "@/utils/portfolio";

const API_BASE = import.meta.env.VITE_BACKEND_API_BASE || "http://localhost:8000";

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchRecommendations(payload: RecommendationsRequest): Promise<RecommendationsResponse> {
  const res = await fetch(`${API_BASE}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<RecommendationsResponse>(res);
}

export async function fetchMarketInsights(): Promise<MarketInsightsResponse> {
  const res = await fetch(`${API_BASE}/api/market-insights`);
  return parseResponse<MarketInsightsResponse>(res);
}

export async function fetchFunds(): Promise<Fund[]> {
  const res = await fetch(`${API_BASE}/api/funds`);
  return parseResponse<Fund[]>(res);
}

export async function fetchPortfolioMetrics(
  funds: Fund[],
  weights: number[],
): Promise<{ portfolioReturn: number; volatility: number; sharpeRatio: number; maxDrawdown: number }> {
  return calculatePortfolioMetrics(funds, weights);
}
