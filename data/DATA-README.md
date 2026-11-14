# Data — Haunted Earnings

## What is in `findings.json`

The display dataset for the dashboard: **449 findings across 20 tickers**,
consolidated from the trimmed per-ticker files of the Gate 2 sample run.

- **Source run**: 2026-11-11, telecom DeepSeek `deepseek-v4.1-flash`,
  23 ticker pairs, 92 calls, 2,001 claims verified with 0 digital errors.
- **Coverage**: Q3 2026 10-Q vs prior-quarter 10-Q, quarter-over-quarter
  footnote / MD&A diffs.
- **Per finding**: `finding` text, `category`, `section`, `claim_ids`,
  verbatim `quote`, `accession`, `char_offset`, `numbers_covered`,
  `numbers_missing`.
- **Per ticker**: analyst name, claims counts, `findings_scored`,
  `removed_deduped`, `display_count`.

## Display set vs full set

- Display set (this file): 449 trimmed, quote-verified current-side
  findings — the same findings approved for the Gate 2 outreach emails.
- Full set (reference only, NOT shipped): 1,557 findings scored
  (840 current-side + 717 removed) across 23 pairs, in
  `track-d-gate1/sample-diffs/work/system_diff_findings.json` (2.6 MB).
  Removed-side findings are counted in per-ticker meta here and listed
  separately in `removed.json` (see below).
- 3 of the 23 pairs (EQPT, PLTR, TSLA) have no trimmed file and are not in
  the display set.

## What is in `removed.json`

The dataset behind the Graveyard view: **717 removed disclosures across 23
tickers** (the 20 display tickers plus EQPT, PLTR, TSLA). These are the
removed side of the same Gate 2 run: prior-quarter disclosures that vanished
in Q3 2026. They are never current-quarter facts.

- **Structure**: `meta` (`removed_findings` 717, `no_counterpart` 71,
  `unjoined` 0) and `tickers[]` with `ticker`, `removed_count`, `findings[]`.
- **Per finding**: `finding` (prior-quarter text), `category` (same 12 as
  above), `section`, `claim_ids`, verbatim `quote`, `accession`,
  `char_offset`, `numbers_covered`, and `closest_current`.
- **`closest_current`**: the nearest current-quarter text, as an object with
  `finding`, `similarity`, `numbers_equal`. It is a nearest match, not a
  confirmed restatement. The app shows only its `finding` text.
- **`closest_current: null`** means the disclosure disappeared with no
  counterpart in the current quarter: a true ghost (71 of 717). The app
  labels these "True ghost".
- **Quote join**: each quote was joined from the verified claims file
  (2,001 claims, 0 digital errors) by `claim_id` plus finding text; 0 entries
  are unjoined.
- Per-ticker `removed_deduped` in `findings.json` equals `removed_count`
  here for the 20 display tickers.
- Check with `python3 scripts/validate_data.py` (validates both files).

## Categories (12)

debt and covenants 89 · revenue recognition 62 · equity comp and dilution
54 · contingent liabilities and litigation 44 · impairments and
restructuring 40 · income taxes 40 · subsequent events, going concern,
material weaknesses 37 · acquisitions, divestitures and discontinued ops
32 · related parties 21 · leases 16 · segment changes 13 · pensions 1.

## Rules

- Numbers shown in the app must come only from `numbers_covered`.
- Quotes are verbatim; do not edit them.
- Sign audit: 37 negative `numbers_covered` values in `removed.json` were checked against their quotes. Kept a minus only for accounting negatives (parenthesized or negative figures in financial statements or tax-rate text, 15 values). Removed the minus from 4 plain amounts (ACMR, CHMX) and dropped 18 fragments of case numbers, ASU/note/series labels and ranges (e.g. `26-2-02879-6`, `ASU 2023-09`). `findings.json` has no negative values.
- Footnote-diff data for research use — not investment advice.
