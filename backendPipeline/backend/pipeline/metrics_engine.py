import os
import pandas as pd
import numpy as np

NAV_FOLDER = "data/nav_processed"
OUTPUT_FILE = "data/fund_metrics.csv"
MASTER_FILE = "data/master_funds.csv"

RISK_FREE_RATE = 0.06


def calculate_cagr(df):
    start_value = df["nav"].iloc[0]
    end_value = df["nav"].iloc[-1]
    num_years = (df["date"].iloc[-1] - df["date"].iloc[0]).days / 365.25

    if num_years <= 0:
        return np.nan

    return (end_value / start_value) ** (1 / num_years) - 1


def calculate_annual_volatility(df):
    daily_std = df["daily_return"].std()
    return daily_std * np.sqrt(252)


def calculate_sharpe(cagr, volatility):
    if pd.isna(volatility) or volatility == 0:
        return np.nan
    return (cagr - RISK_FREE_RATE) / volatility


def calculate_max_drawdown(df):
    wealth_index = (1 + df["daily_return"]).cumprod()
    previous_peaks = wealth_index.cummax()
    drawdowns = wealth_index / previous_peaks - 1
    return drawdowns.min()


def run_metrics_engine():
    print("Running Metrics Engine...")
    results = []

    master_df = pd.read_csv(MASTER_FILE)

    for file in os.listdir(NAV_FOLDER):
        if not file.endswith(".parquet"):
            continue

        file_path = os.path.join(NAV_FOLDER, file)
        df = pd.read_parquet(file_path)

        if df.empty or "daily_return" not in df.columns:
            continue

        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
        df = df.dropna(subset=["daily_return"]).copy()

        if df.empty:
            continue

        num_rows = len(df)
        years_covered = (df["date"].iloc[-1] - df["date"].iloc[0]).days / 365.25

        if num_rows < 200 or years_covered < 2:
            print(f"Skipping {file}: insufficient history")
            continue

        scheme_code = int(df["scheme_code"].iloc[0])

        cagr = calculate_cagr(df)
        volatility = calculate_annual_volatility(df)
        sharpe = calculate_sharpe(cagr, volatility)
        max_dd = calculate_max_drawdown(df)

        results.append({
            "scheme_code": scheme_code,
            "file_name": file.replace(".parquet", ""),
            "num_rows": num_rows,
            "years_covered": round(years_covered, 2),
            "cagr": round(cagr, 4),
            "volatility": round(volatility, 4),
            "sharpe_ratio": round(sharpe, 4) if pd.notna(sharpe) else np.nan,
            "max_drawdown": round(max_dd, 4)
        })

        print(f"Processed metrics for {file}")

    metrics_df = pd.DataFrame(results)
    final_df = metrics_df.merge(master_df, on="scheme_code", how="left")

    final_df.to_csv(OUTPUT_FILE, index=False)
    print(f"Metrics file generated at {OUTPUT_FILE}")


if __name__ == "__main__":
    run_metrics_engine()