from __future__ import annotations

import json
import logging
import urllib.error
import urllib.parse
import urllib.request
from statistics import mean
from typing import Any

from backend.services.fund_classifier import classify_fund_segment
from backend.services.recommendation_engine import _to_frontend_fund

logger = logging.getLogger(__name__)

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={range}&interval={interval}"

def _fetch_close_prices(symbol: str = "^NSEI", range_: str = "1mo", interval: str = "1d") -> list[float]:
    logger.info(f"Fetching market data for symbol: {symbol}")
    encoded_symbol = urllib.parse.quote(symbol, safe="")
    url = YAHOO_CHART_URL.format(symbol=encoded_symbol, range=range_, interval=interval)
    
    # Use a more realistic browser User-Agent to avoid being blocked/404'd
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        logger.error(f"Failed to fetch market data for {symbol}. URL: {url}. Error: {exc}")
        # If it fails, we raise an error which will be caught by the service layer
        raise RuntimeError(f"Failed to fetch market data: {exc}") from exc

    result = payload.get("chart", {}).get("result", [])
    if not result:
        logger.error(f"Market API returned no results for {symbol}. Response: {json.dumps(payload)}")
        raise RuntimeError("Market API returned no results")
    
    closes = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
    valid_closes = [float(v) for v in closes if isinstance(v, (float, int))]
    
    if not valid_closes:
        logger.warning(f"No valid close prices found for {symbol}")
        raise RuntimeError(f"No valid close prices found for {symbol}")
        
    return valid_closes


def compute_market_sentiment(closes: list[float]) -> tuple[str, float]:
    if len(closes) < 5:
        return "sideways", 0.0

    first = closes[0]
    last = closes[-1]
    pct_change = ((last - first) / first) * 100 if first else 0.0

    short_ma = mean(closes[-5:])
    long_ma = mean(closes[-20:]) if len(closes) >= 20 else mean(closes)
    ma_gap = ((short_ma - long_ma) / long_ma) * 100 if long_ma else 0.0
    trend_score = round((pct_change * 0.7) + (ma_gap * 0.3), 2)

    if trend_score >= 1.0:
        return "bullish", trend_score
    if trend_score <= -1.0:
        return "bearish", trend_score
    return "sideways", trend_score


def funds_for_market_sentiment(funds: list[dict[str, Any]], sentiment: str, limit: int = 5) -> list[dict[str, Any]]:
    if sentiment == "bullish":
        filtered = [f for f in funds if classify_fund_segment(f) == "equity"]
    elif sentiment == "bearish":
        filtered = [f for f in funds if classify_fund_segment(f) == "stable"]
    else:
        filtered = [f for f in funds if classify_fund_segment(f) in {"balanced", "stable"}]

    ranked = sorted(
        filtered,
        key=lambda f: (
            float(f.get("sharpe_ratio", -999)),
            float(f.get("cagr", -999)),
            -float(f.get("volatility", 999)),
        ),
        reverse=True,
    )
    return [_to_frontend_fund(f) for f in ranked[:limit]]


def get_market_insights(funds: list[dict[str, Any]], symbol: str = "^NSEI") -> dict[str, Any]:
    try:
        closes = _fetch_close_prices(symbol=symbol)
        sentiment, trend_score = compute_market_sentiment(closes)
        recommendations = funds_for_market_sentiment(funds, sentiment=sentiment, limit=5)
        return {
            "sentiment": sentiment,
            "trend_score": trend_score,
            "index_symbol": symbol,
            "recent_closes": [round(v, 2) for v in closes[-15:]],
            "recommended_funds": recommendations,
        }
    except Exception as e:
        logger.error(f"Market Insight Fallback triggered for {symbol}: {e}")
        # Fallback response instead of crashing
        return {
            "sentiment": "neutral",
            "trend_score": 0.0,
            "index_symbol": symbol,
            "recent_closes": [],
            "recommended_funds": [],
            "error": "Market data currently unavailable. Showing neutral sentiment."
        }

