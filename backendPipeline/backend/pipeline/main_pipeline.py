import pandas as pd
from backend.pipeline.fetch import fetch_nav_data
from backend.pipeline.clean import clean_historical_nav
from backend.pipeline.store import store_data
from backend.pipeline.risk import calculate_daily_return


def run_historical_pipeline():
    print("Historical pipeline starting...")

    funds = pd.read_csv("data/master_funds.csv")

    for _, row in funds.iterrows():
        scheme_code = row["scheme_code"]
        fund_name = row["fund_name"]

        print(f"Processing {fund_name}")

        raw_data = fetch_nav_data(scheme_code)

        if raw_data is None:
            continue

        df = clean_historical_nav(raw_data, years=3)

        if df.empty:
            continue

        df["scheme_code"] = scheme_code
        df = calculate_daily_return(df)

        store_data(df, fund_name)

        print(f"{fund_name} completed\n")


if __name__ == "__main__":
    run_historical_pipeline()