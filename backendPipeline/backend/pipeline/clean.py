import pandas as pd
from datetime import datetime, timedelta


def clean_historical_nav(json_data, years=3):
    """
    Cleans historical NAV JSON and filters last N years.
    Returns DataFrame with columns: date, nav
    """

    if not json_data or "data" not in json_data:
        return pd.DataFrame()

    cutoff_date = datetime.today() - timedelta(days=years * 365)

    rows = []

    for entry in json_data["data"]:
        try:
            date_obj = datetime.strptime(entry["date"], "%d-%m-%Y")
            nav_value = float(entry["nav"])

            if date_obj >= cutoff_date:
                rows.append({
                    "date": date_obj,
                    "nav": nav_value
                })

        except (ValueError, KeyError):
            continue

    df = pd.DataFrame(rows)

    if df.empty:
        return df
    

    df = df.sort_values("date")
    df = df.reset_index(drop=True)

    return df