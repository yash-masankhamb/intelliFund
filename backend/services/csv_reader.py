from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

_CACHE: dict[str, Any] = {
    "path": None,
    "mtime": None,
    "rows": [],
}


def _parse_number(value: str) -> float | str:
    """
    Try to parse numeric fields from the CSV.
    Keeps strings (like fund_name/category/risk_bucket) as-is.
    """
    try:
        return float(value)
    except (TypeError, ValueError):
        return value


def _read_csv_rows(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows: list[dict[str, Any]] = []
        for row in reader:
            parsed = {k: _parse_number(v) for k, v in row.items()}
            rows.append(parsed)
        return rows


def read_valid_funds(csv_path: str | Path, use_cache: bool = True) -> list[dict[str, Any]]:
    """
    Read valid funds from a CSV file and return a list of dicts.
    Raises FileNotFoundError if the file does not exist.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(str(path))

    if not use_cache:
        return _read_csv_rows(path)

    mtime = path.stat().st_mtime
    if _CACHE["path"] == str(path) and _CACHE["mtime"] == mtime:
        return _CACHE["rows"]

    rows = _read_csv_rows(path)
    _CACHE["path"] = str(path)
    _CACHE["mtime"] = mtime
    _CACHE["rows"] = rows
    return rows

