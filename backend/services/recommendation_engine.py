from typing import Any
from backend.services.fund_classifier import classify_fund_segment, normalize_risk_bucket


def _to_frontend_fund(row: dict[str, Any]) -> dict[str, Any]:
    scheme_code = row.get("scheme_code")
    fund_id = str(int(scheme_code)) if isinstance(scheme_code, float) else str(scheme_code)

    return {
        "id": fund_id,
        "name": str(row.get("fund_name", "")),
        "category": str(row.get("category", "")),
        "cagr": round(float(row.get("cagr", 0.0)) * 100, 2),
        "risk": normalize_risk_bucket(str(row.get("risk_bucket", ""))),
        "volatility": round(float(row.get("volatility", 0.0)) * 100, 2),
        "sharpeRatio": round(float(row.get("sharpe_ratio", 0.0)), 2),
        "maxDrawdown": round(abs(float(row.get("max_drawdown", 0.0))) * 100, 2),
    }


# 🔥 Better risk + horizon logic
def _profile_to_target_mix(risk_level: str, time_horizon: int) -> tuple[float, float]:
    risk = risk_level.lower()

    if risk == "high":
        equity = 0.8
    elif risk == "medium-high":
        equity = 0.7
    elif risk == "medium":
        equity = 0.55
    else:
        equity = 0.3

    # Time horizon adjustment
    if time_horizon >= 10:
        equity += 0.1
    elif time_horizon >= 5:
        equity += 0.05
    elif time_horizon <= 3:
        equity -= 0.1

    equity = min(max(equity, 0.2), 0.9)
    return equity, 1 - equity


# 🔥 Smart equity preference (growth-aware)
def _equity_score(fund: dict[str, Any]) -> float:
    category = fund.get("category", "").lower()

    bonus = 0
    if "mid" in category:
        bonus += 2
    elif "flexi" in category:
        bonus += 1.8
    elif "multi" in category:
        bonus += 1.5
    elif "large" in category:
        bonus += 1

    return (
        bonus * 2 +
        float(fund.get("sharpe_ratio", 0)) * 3 +
        float(fund.get("cagr", 0)) * 2 -
        float(fund.get("volatility", 0))
    )


def _stable_score(fund: dict[str, Any]) -> float:
    return (
        float(fund.get("sharpe_ratio", 0)) * 3 +
        float(fund.get("cagr", 0)) * 1.5 -
        float(fund.get("volatility", 0)) * 2
    )


def recommend_funds(
    funds: list[dict[str, Any]],
    risk_level: str,
    investment_goal: str,
    time_horizon: int,
    monthly_investment: float,
    top_k: int = 5,
) -> tuple[list[dict[str, Any]], list[str]]:

    equity_target, stable_target = _profile_to_target_mix(risk_level, time_horizon)

    equity, stable, balanced = [], [], []

    for fund in funds:
        segment = classify_fund_segment(fund)
        if segment == "equity":
            equity.append(fund)
        elif segment == "stable":
            stable.append(fund)
        else:
            balanced.append(fund)

    # 🔥 Smart sorting
    equity_sorted = sorted(equity, key=_equity_score, reverse=True)
    stable_sorted = sorted(stable, key=_stable_score, reverse=True)
    balanced_sorted = sorted(balanced, key=_equity_score, reverse=True)

    # 🔥 Dynamic allocation
    equity_count = round(top_k * equity_target)
    stable_count = round(top_k * stable_target)

    # Avoid forcing unnecessary debt
    if risk_level.lower() in ["high", "medium-high"]:
        stable_count = min(stable_count, 1)

    picks = []

    # Add equity first
    picks.extend(equity_sorted[:equity_count])

    # Add balanced funds (important for moderation)
    if len(picks) < top_k:
        picks.extend(balanced_sorted[: max(1, top_k - len(picks) - stable_count)])

    # Add stable only if needed
    if len(picks) < top_k:
        picks.extend(stable_sorted[: top_k - len(picks)])

    # Remove duplicates (safety)
    seen = set()
    unique_picks = []
    for f in picks:
        fid = f.get("scheme_code")
        if fid not in seen:
            seen.add(fid)
            unique_picks.append(f)

    final_picks = unique_picks[:top_k]

    reasoning = [
        f"Designed a {int(equity_target*100)}:{int(stable_target*100)} growth-oriented portfolio based on your {risk_level} profile.",
        f"Selected funds using Sharpe ratio, CAGR, and volatility for optimal risk-adjusted returns.",
        f"Adjusted allocation for a {time_horizon}-year horizon and SIP of ₹{int(monthly_investment):,}.",
    ]

    return [_to_frontend_fund(f) for f in final_picks], reasoning