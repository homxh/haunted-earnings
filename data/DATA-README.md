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
  Removed-side findings are counted in per-ticker meta, not listed.
- 3 of the 23 pairs (EQPT, PLTR, TSLA) have no trimmed file and are not in
  the display set.

## Categories (12)

debt and covenants 89 · revenue recognition 62 · equity comp and dilution
54 · contingent liabilities and litigation 44 · impairments and
restructuring 40 · income taxes 40 · subsequent events, going concern,
material weaknesses 37 · acquisitions, divestitures and discontinued ops
32 · related parties 21 · leases 16 · segment changes 13 · pensions 1.

## Rules

- Numbers shown in the app must come only from `numbers_covered`.
- Quotes are verbatim; do not edit them.
- Footnote-diff data for research use — not investment advice.
