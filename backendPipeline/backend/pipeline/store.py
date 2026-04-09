import os


def store_data(df, fund_name):
    """
    Store cleaned NAV data per fund as parquet
    """

    output_folder = "data/nav_processed"
    os.makedirs(output_folder, exist_ok=True)

    safe_name = (
        fund_name.replace(" ", "_")
        .replace("-", "")
        .replace("&", "")
    )

    file_path = f"{output_folder}/{safe_name}.parquet"

    df.to_parquet(file_path, index=False)

    print(f"{fund_name} stored successfully at {file_path}")