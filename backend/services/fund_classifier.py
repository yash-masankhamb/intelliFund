from __future__ import annotations

from typing import Any


EQUITY_CATEGORIES = {
    "large_cap",
    "mid_cap",
    "small_cap",
    "flexi_cap",
    "multi_cap",
    "elss",
}
STABLE_CATEGORIES = {"debt", "liquid", "hybrid", "multi_asset"}


def normalize_risk_bucket(risk_bucket: str) -> str:
    bucket = (risk_bucket or "").strip().lower()
    if bucket in {"safe", "low"}:
        return "Low"
    if bucket in {"moderate", "medium"}:
        return "Moderate"
    return "High"


def classify_fund_segment(fund: dict[str, Any]) -> str:
    category = str(fund.get("category", "")).strip().lower()
    risk_bucket = str(fund.get("risk_bucket", "")).strip().lower()

    if category in EQUITY_CATEGORIES or risk_bucket == "aggressive":
        return "equity"
    if category in STABLE_CATEGORIES or risk_bucket == "safe":
        return "stable"
    return "balanced"

