import numpy as np


def calculate_daily_return(df):
    """
    Adds daily_return column
    Assumes scheme_code column already exists
    """

    df = df.sort_values(["scheme_code", "date"])
    df["daily_return"] = df.groupby("scheme_code")["nav"].pct_change()

    return df


def calculate_annual_volatility(df):
    """
    Calculates annualized volatility (252 trading days)
    Returns float
    """

    daily_std = df["daily_return"].std()
    annual_volatility = daily_std * np.sqrt(252)

    return annual_volatility