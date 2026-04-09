from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from statistics import mean
from typing import Any

from backend.services.fund_classifier import classify_fund_segment
from backend.services.recommendation_engine import _to_frontend_fund

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={range}&interval={interval}"


def _fetch_close_prices(symbol: str = "^NSEI", range_: str = "1mo", interval: str = "1d") -> list[float]:
    encoded_symbol = urllib.parse.quote(symbol, safe="")
    url = YAHOO_CHART_URL.format(symbol=encoded_symbol, range=range_, interval=interval)
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 IntelliFundAdvisor/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        raise RuntimeError(f"Failed to fetch market data: {exc}") from exc

    result = payload.get("chart", {}).get("result", [])
    if not result:
        raise RuntimeError("Market API returned no results")
    closes = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
    return [float(v) for v in closes if isinstance(v, (float, int))]


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

