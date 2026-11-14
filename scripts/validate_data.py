#!/usr/bin/env python3
"""Validate data/findings.json: required fields and count consistency.

Exits 0 when valid, 1 on any failure (printing ticker and claim id).
Usage: python3 scripts/validate_data.py [path/to/findings.json]
"""
import json
import sys
from pathlib import Path

DEFAULT = Path(__file__).resolve().parent.parent / "data" / "findings.json"
REQUIRED_STR = ("finding", "category", "quote", "accession")


def validate(data):
    errors = []
    tickers = data.get("tickers")
    if not isinstance(tickers, list):
        return ["top level: 'tickers' is missing or not a list"]
    total = 0
    for t in tickers:
        sym = t.get("ticker", "?")
        findings = t.get("findings")
        if not isinstance(findings, list):
            errors.append(f"{sym}: 'findings' is missing or not a list")
            continue
        total += len(findings)
        for i, f in enumerate(findings):
            ids = f.get("claim_ids")
            cid = ",".join(ids) if isinstance(ids, list) and ids else f"index {i}"
            where = f"{sym} {cid}"
            for key in REQUIRED_STR:
                v = f.get(key)
                if not isinstance(v, str) or not v.strip():
                    errors.append(f"{where}: '{key}' missing or empty")
            off = f.get("char_offset")
            if not isinstance(off, int) or isinstance(off, bool):
                errors.append(f"{where}: 'char_offset' is not an integer")
            if not isinstance(f.get("numbers_covered"), list):
                errors.append(f"{where}: 'numbers_covered' is not a list")
        if t.get("display_count") != len(findings):
            errors.append(
                f"{sym}: display_count {t.get('display_count')} != {len(findings)} findings"
            )
    meta = data.get("meta", {})
    if meta.get("display_findings") != total:
        errors.append(f"meta: display_findings {meta.get('display_findings')} != sum {total}")
    if meta.get("display_tickers") != len(tickers):
        errors.append(f"meta: display_tickers {meta.get('display_tickers')} != {len(tickers)}")
    return errors


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        print(f"FAIL: cannot load {path}: {e}")
        return 1
    errors = validate(data)
    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        print(f"{len(errors)} problem(s) in {path}")
        return 1
    n = sum(len(t["findings"]) for t in data["tickers"])
    print(f"OK: {len(data['tickers'])} tickers, {n} findings")
    return 0


if __name__ == "__main__":
    sys.exit(main())
