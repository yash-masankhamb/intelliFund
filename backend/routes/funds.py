from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException

from backend.schemas import MarketInsightsResponse, RecommendationsRequest, RecommendationsResponse
from backend.services.csv_reader import read_valid_funds
from backend.services.market_service import get_market_insights
from backend.services.recommendation_engine import recommend_funds


router = APIRouter()


def _valid_funds_csv_path() -> Path:
    return Path(__file__).resolve().parents[2] / "backendPipeline" / "data" / "valid_funds.csv"


@router.get("/api/funds")
def get_all_funds():
    """
    Return all funds from valid_funds.csv as JSON.
    """
    # Default location: keep using the pipeline output file.
    csv_path = _valid_funds_csv_path()

    try:
        return read_valid_funds(csv_path)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"valid_funds.csv not found at '{csv_path}'. Run the pipeline or place the file there.",
        )


@router.get("/api/market-insights", response_model=MarketInsightsResponse)
def market_insights():
    csv_path = _valid_funds_csv_path()
    try:
        funds = read_valid_funds(csv_path, use_cache=True)
        return get_market_insights(funds=funds, symbol="^NSEI")
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"valid_funds.csv not found at '{csv_path}'. Run the pipeline or place the file there.",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/api/recommendations", response_model=RecommendationsResponse)
def get_recommendations(payload: RecommendationsRequest):
    csv_path = _valid_funds_csv_path()
    try:
        funds = read_valid_funds(csv_path, use_cache=True)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"valid_funds.csv not found at '{csv_path}'. Run the pipeline or place the file there.",
        )

    recommended_funds, reasoning = recommend_funds(
        funds=funds,
        risk_level=payload.risk_level,
        investment_goal=payload.investment_goal,
        time_horizon=payload.time_horizon,
        monthly_investment=payload.monthly_investment,
    )
    return {"recommended_funds": recommended_funds, "reasoning": reasoning}