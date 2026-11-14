#!/usr/bin/env python3
"""Validate data/findings.json and data/removed.json: required fields and count consistency.

Exits 0 when valid, 1 on any failure (printing ticker and claim id).
Usage: python3 scripts/validate_data.py [path/to/findings.json [path/to/removed.json]]
With no arguments both shipped files are checked. With only a findings path,
removed.json is skipped.
"""
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT = DATA_DIR / "findings.json"
DEFAULT_REMOVED = DATA_DIR / "removed.json"
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


def validate_removed(data, categories=None):
    """Check the Graveyard dataset. `categories` (optional) is the set of
    category names from findings.json meta; removed entries must use them."""
    errors = []
    tickers = data.get("tickers")
    if not isinstance(tickers, list):
        return ["removed top level: 'tickers' is missing or not a list"]
    total = 0
    ghosts = 0
    for t in tickers:
        sym = t.get("ticker", "?")
        findings = t.get("findings")
        if not isinstance(findings, list):
            errors.append(f"{sym}: removed 'findings' is missing or not a list")
            continue
        total += len(findings)
        for i, f in enumerate(findings):
            ids = f.get("claim_ids")
            cid = ",".join(ids) if isinstance(ids, list) and ids else f"index {i}"
            where = f"{sym} {cid} (removed)"
            for key in REQUIRED_STR:
                v = f.get(key)
                if not isinstance(v, str) or not v.strip():
                    errors.append(f"{where}: '{key}' missing or empty")
            off = f.get("char_offset")
            if not isinstance(off, int) or isinstance(off, bool):
                errors.append(f"{where}: 'char_offset' is not an integer")
            if not isinstance(f.get("numbers_covered"), list):
                errors.append(f"{where}: 'numbers_covered' is not a list")
            if categories is not None and f.get("category") not in categories:
                errors.append(f"{where}: category {f.get('category')!r} not in findings.json categories")
            if "closest_current" not in f:
                errors.append(f"{where}: 'closest_current' key missing (use null for a true ghost)")
                continue
            cc = f["closest_current"]
            if cc is None:
                ghosts += 1
            elif not isinstance(cc, dict) or not isinstance(cc.get("finding"), str) or not cc["finding"].strip():
                errors.append(f"{where}: 'closest_current' must be null or an object with non-empty 'finding'")
        if t.get("removed_count") != len(findings):
            errors.append(f"{sym}: removed_count {t.get('removed_count')} != {len(findings)} findings")
    meta = data.get("meta", {})
    if meta.get("removed_findings") != total:
        errors.append(f"removed meta: removed_findings {meta.get('removed_findings')} != sum {total}")
    if meta.get("no_counterpart") != ghosts:
        errors.append(f"removed meta: no_counterpart {meta.get('no_counterpart')} != {ghosts} null closest_current")
    return errors


def load(path):
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except (OSError, ValueError) as e:
        return None, f"FAIL: cannot load {path}: {e}"


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    if len(sys.argv) > 2:
        rpath = Path(sys.argv[2])
    else:
        rpath = DEFAULT_REMOVED if len(sys.argv) <= 1 else None
    data, err = load(path)
    if err:
        print(err)
        return 1
    errors = validate(data)
    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        print(f"{len(errors)} problem(s) in {path}")
        return 1
    n = sum(len(t["findings"]) for t in data["tickers"])
    print(f"OK: {len(data['tickers'])} tickers, {n} findings")
    if rpath is None:
        return 0
    rdata, err = load(rpath)
    if err:
        print(err)
        return 1
    errors = validate_removed(rdata, set(data.get("meta", {}).get("categories", {})) or None)
    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        print(f"{len(errors)} problem(s) in {rpath}")
        return 1
    rn = sum(len(t["findings"]) for t in rdata["tickers"])
    g = sum(1 for t in rdata["tickers"] for f in t["findings"] if f["closest_current"] is None)
    print(f"OK: {len(rdata['tickers'])} tickers, {rn} removed disclosures ({g} true ghosts)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
