import os
import pandas as pd
import numpy as np

MASTER_FILE = "data/master_funds.csv"
METRICS_FILE = "data/fund_metrics.csv"
NAV_FOLDER = "data/nav_processed"
OUTPUT_FILE = "data/fund_quality_report.csv"


EQUITY_CATEGORIES = {
    "large_cap",
    "flexi_cap",
    "multi_cap",
    "mid_cap",
    "small_cap",
    "elss",
}

MODERATE_CATEGORIES = {
    "hybrid",
    "multi_asset",
}

LOW_RISK_CATEGORIES = {
    "debt",
    "liquid",
}


def get_file_name_from_fund_name(fund_name: str) -> str:
    """
    Recreate the same safe filename logic used in store.py
    """
    return (
        fund_name.replace(" ", "_")
        .replace("-", "")
        .replace("&", "")
    )


def classify_status(row):
    """
    Assigns VALID / REVIEW / REJECT based on sanity checks
    """
    category = str(row.get("category", "")).strip().lower()
    years_covered = row.get("years_covered", np.nan)
    num_rows = row.get("num_rows", np.nan)
    cagr = row.get("cagr", np.nan)
    volatility = row.get("volatility", np.nan)
    sharpe = row.get("sharpe_ratio", np.nan)
    max_dd = row.get("max_drawdown", np.nan)

    remarks = []

    if pd.isna(num_rows) or num_rows < 200:
        remarks.append("too_few_rows")

    if pd.isna(years_covered) or years_covered < 2.0:
        remarks.append("short_history")

    if pd.isna(cagr):
        remarks.append("missing_cagr")

    if pd.isna(volatility):
        remarks.append("missing_volatility")

    if pd.isna(sharpe):
        remarks.append("missing_sharpe")

    if pd.isna(max_dd):
        remarks.append("missing_drawdown")

    # Category-specific sanity checks
    if category in EQUITY_CATEGORIES:
        if pd.notna(volatility) and volatility < 0.05:
            remarks.append("equity_vol_too_low")
        if pd.notna(cagr) and cagr < 0.02:
            remarks.append("equity_cagr_too_low")
        if pd.notna(max_dd) and max_dd > -0.03:
            remarks.append("equity_drawdown_too_small")

    elif category in MODERATE_CATEGORIES:
        if pd.notna(volatility) and volatility < 0.01:
            remarks.append("moderate_vol_too_low")
        if pd.notna(sharpe) and abs(sharpe) > 5:
            remarks.append("moderate_sharpe_extreme")

    elif category in LOW_RISK_CATEGORIES:
        if pd.notna(volatility) and volatility > 0.08:
            remarks.append("low_risk_vol_too_high")

    # General extreme checks
    if pd.notna(sharpe) and abs(sharpe) > 5:
        remarks.append("sharpe_extreme")

    if pd.notna(cagr) and cagr > 0.5:
        remarks.append("cagr_too_high")

    if pd.notna(max_dd) and max_dd < -0.5:
        remarks.append("drawdown_too_deep")

    # Status rules
    reject_flags = {
        "too_few_rows",
        "short_history",
        "missing_cagr",
        "missing_volatility",
        "missing_sharpe",
        "missing_drawdown",
    }

    review_flags = {
        "equity_vol_too_low",
        "equity_cagr_too_low",
        "equity_drawdown_too_small",
        "moderate_vol_too_low",
        "moderate_sharpe_extreme",
        "low_risk_vol_too_high",
        "sharpe_extreme",
        "cagr_too_high",
        "drawdown_too_deep",
    }

    if any(flag in remarks for flag in reject_flags):
        status = "REJECT"
    elif any(flag in remarks for flag in review_flags):
        status = "REVIEW"
    else:
        status = "VALID"

    return status, ", ".join(remarks) if remarks else "looks_good"


def generate_quality_report():
    print("Generating fund quality report...")

    if not os.path.exists(MASTER_FILE):
        print(f"Master file not found: {MASTER_FILE}")
        return

    if not os.path.exists(METRICS_FILE):
        print(f"Metrics file not found: {METRICS_FILE}")
        return

    master_df = pd.read_csv(MASTER_FILE)
    metrics_df = pd.read_csv(METRICS_FILE)

    if metrics_df.empty:
        print("Metrics file is empty.")
        return

    report_rows = []

    for _, fund in master_df.iterrows():
        fund_name = fund["fund_name"]
        scheme_code = fund["scheme_code"]
        category = fund["category"]

        safe_name = get_file_name_from_fund_name(fund_name)
        parquet_path = os.path.join(NAV_FOLDER, f"{safe_name}.parquet")

        num_rows = np.nan
        start_date = pd.NaT
        end_date = pd.NaT
        years_covered = np.nan
        missing_returns = np.nan

        if os.path.exists(parquet_path):
            try:
                nav_df = pd.read_parquet(parquet_path)

                if not nav_df.empty:
                    nav_df["date"] = pd.to_datetime(nav_df["date"])
                    nav_df = nav_df.sort_values("date")

                    num_rows = len(nav_df)
                    start_date = nav_df["date"].min()
                    end_date = nav_df["date"].max()
                    years_covered = (end_date - start_date).days / 365.25 if pd.notna(start_date) and pd.notna(end_date) else np.nan
                    missing_returns = nav_df["daily_return"].isna().sum() if "daily_return" in nav_df.columns else np.nan

            except Exception as e:
                print(f"Error reading {parquet_path}: {e}")

        metric_match = metrics_df[metrics_df["fund_name"].str.strip().str.lower() == fund_name.strip().lower()]

        if not metric_match.empty:
            metric_row = metric_match.iloc[0]
            cagr = metric_row.get("cagr", np.nan)
            volatility = metric_row.get("volatility", np.nan)
            sharpe_ratio = metric_row.get("sharpe_ratio", np.nan)
            max_drawdown = metric_row.get("max_drawdown", np.nan)
        else:
            cagr = np.nan
            volatility = np.nan
            sharpe_ratio = np.nan
            max_drawdown = np.nan

        row = {
            "fund_name": fund_name,
            "scheme_code": scheme_code,
            "category": category,
            "num_rows": num_rows,
            "start_date": start_date,
            "end_date": end_date,
            "years_covered": round(years_covered, 2) if pd.notna(years_covered) else np.nan,
            "missing_returns": missing_returns,
            "cagr": cagr,
            "volatility": volatility,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
        }

        status, remarks = classify_status(row)
        row["status"] = status
        row["remarks"] = remarks

        report_rows.append(row)

    report_df = pd.DataFrame(report_rows)

    # Sort so rejected/review items come first
    status_order = {"REJECT": 0, "REVIEW": 1, "VALID": 2}
    report_df["status_order"] = report_df["status"].map(status_order)
    report_df = report_df.sort_values(["status_order", "category", "fund_name"]).drop(columns=["status_order"])

    report_df.to_csv(OUTPUT_FILE, index=False)

    print(f"Quality report saved to: {OUTPUT_FILE}")
    print(report_df["status"].value_counts(dropna=False))


if __name__ == "__main__":
    generate_quality_report()