import requests


def fetch_nav_data(scheme_code):
    """
    Fetch full historical NAV data for a given scheme code
    Returns JSON if successful, else None
    """
    url = f"https://api.mfapi.in/mf/{scheme_code}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        if "data" not in data:
            print(f"No NAV data found for scheme {scheme_code}")
            return None

        return data

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for scheme {scheme_code}: {e}")
        return None