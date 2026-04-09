from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class FundOut(BaseModel):
    id: str
    name: str
    category: str
    cagr: float
    risk: Literal["Low", "Moderate", "High"]
    volatility: float
    sharpeRatio: float
    maxDrawdown: float


class RecommendationsRequest(BaseModel):
    risk_level: Literal["low", "medium", "high"]
    investment_goal: str = Field(min_length=2, max_length=120)
    time_horizon: int = Field(ge=1, le=40)
    monthly_investment: float = Field(gt=0, le=10_000_000)


class RecommendationsResponse(BaseModel):
    recommended_funds: list[FundOut]
    reasoning: list[str]


class MarketInsightsResponse(BaseModel):
    sentiment: Literal["bullish", "bearish", "sideways"]
    trend_score: float
    index_symbol: str
    recent_closes: list[float]
    recommended_funds: list[FundOut]

