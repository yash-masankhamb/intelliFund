import pandas as pd

QUALITY_REPORT = "data/fund_quality_report.csv"
OUTPUT_FILE = "data/valid_funds.csv"


def map_risk_bucket(category):
    """
    Convert fund category into risk buckets
    """

    category = str(category).strip().lower()

    if category in ["liquid", "debt"]:
        return "safe"

    elif category in ["hybrid", "multi_asset", "large_cap"]:
        return "moderate"

    elif category in ["flexi_cap", "multi_cap", "mid_cap", "small_cap", "elss"]:
        return "aggressive"

    return "unknown"


def build_valid_funds_dataset():

    print("Building valid funds dataset...")

    df = pd.read_csv(QUALITY_REPORT)

    # keep only VALID funds
    valid_funds = df[df["status"] == "VALID"].copy()

    # add risk bucket column
    valid_funds["risk_bucket"] = valid_funds["category"].apply(map_risk_bucket)

    # select only useful columns
    valid_funds = valid_funds[
        [
            "fund_name",
            "scheme_code",
            "category",
            "risk_bucket",
            "cagr",
            "volatility",
            "sharpe_ratio",
            "max_drawdown"
        ]
    ]

    # sort by sharpe ratio (best funds first)
    valid_funds = valid_funds.sort_values(by="sharpe_ratio", ascending=False)

    # save dataset
    valid_funds.to_csv(OUTPUT_FILE, index=False)

    print(f"Valid funds dataset saved to {OUTPUT_FILE}")
    print(f"Total usable funds: {len(valid_funds)}")


if __name__ == "__main__":
    build_valid_funds_dataset()