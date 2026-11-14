# Design Document — Haunted Earnings

## Overview

A static single-page app. No framework, no build step, no backend: plain
HTML + CSS + vanilla JavaScript, data loaded at runtime from
`data/findings.json` (399 KB, 20 tickers, 449 findings). Deploys to GitHub
Pages from the repository root. The whole point is polish and data integrity:
every number on screen traces to a verified finding, every quote is verbatim.

## Architecture

```
index.html          — shell: header, ticker grid, detail view, footer
assets/style.css    — haunted theme (dark, purple/orange), responsive
assets/app.js       — fetch findings.json, render, filter/search, expand
data/findings.json  — the display dataset (see data/DATA-README.md)
```

- **Rendering**: client-side render from JSON. No finding text is hard-coded
  in HTML, so the dataset can be refreshed without touching markup.
- **State**: URL hash carries the selected view (`#/` index, `#/ACMR`
  ticker detail, `#/?q=...&cat=...` for search/filter), so a view is
  linkable and survives reload.
- **Graveyard**: `#/graveyard` and `#/graveyard?q=...&cat=...` show the
  removed-disclosure list from `data/removed.json`.
- **No dependencies**: zero npm packages. This keeps the repo auditable and
  the GitHub Pages deploy trivial.

## Data Model

`data/findings.json`:

```json
{
  "meta": {
    "display_findings": 449,
    "display_tickers": 20,
    "full_findings_scored": 1557,
    "categories": { "debt and covenants": 89, "...": "..." }
  },
  "tickers": [
    {
      "ticker": "ACMR",
      "analyst": "Sahm Adrangi — Kerrisdale Capital",
      "claims_total": 78,
      "findings_scored": 56,
      "removed_deduped": 23,
      "display_count": 26,
      "findings": [
        {
          "finding": "...",
          "category": "equity comp and dilution",
          "section": "notes",
          "claim_ids": ["ACMR-1-02"],
          "quote": "...",
          "accession": "0001628280-26-071670",
          "char_offset": 3234,
          "numbers_covered": ["2431900", "2669625", "30"],
          "numbers_missing": []
        }
      ]
    }
  ]
}
```

Rules enforced by the validation hook (`scripts/validate_data.py`, run by a
Kiro hook on data changes):

- Every finding has non-empty `finding`, `category`, `quote`, `accession`,
  and integer `char_offset`.
- `numbers_covered` is a list; the UI builds derived number displays (number
  chips) only from it. `numbers_missing` only means a figure is not inside the
  trimmed quote snippet.
- Per-ticker `display_count` equals `len(findings)`; top-level
  `display_findings` equals the sum across tickers.

## Components

- **Hero header**: project name, event line, dataset meta line, disclaimer.
  Pure CSS/SVG decoration (pumpkin/ghost silhouettes drawn inline, no
  external images).
- **Ticker grid**: 20 cards. Each shows ticker, analyst, display count,
  scored total, removed count, top 2 categories.
- **Ticker detail**: category groups, each a collapsible section; finding
  cards with text, category chip, section label, numbers; click to expand
  the verbatim quote + accession + char offset.
- **Graveyard view** (`#/graveyard`): lazily fetches `data/removed.json` on
  first visit. One card per removed disclosure: prior-quarter text, verbatim
  quote with accession and char offset, then an afterlife block (closest
  current-quarter text) or a "True ghost" block when `closest_current` is
  null. Uses the same filter bar; category option counts switch to the
  Graveyard counts while in this view. A load failure shows the error state
  naming `data/removed.json`.
- **Filter bar**: category dropdown (12 categories), text search input,
  result count, clear button, empty state.
- **Footer**: data provenance, "not investment advice", link to the
  GitHub repo.

## Visual Design

- Palette: background near-black purple (`#12081f`), panels `#1e1030`,
  accent pumpkin orange (`#ff7a1a`), secondary violet (`#a78bfa`),
  text `#f3eefc`, muted `#b9a8d9`.
- Typography: system stack only (no webfont downloads, keeps load instant).
- Cards: rounded, subtle border, hover lift. Category chips color-coded by
  category, same mapping in grid and detail.
- Responsive: grid collapses 4 → 2 → 1 columns at 1024px / 640px;
  detail view stacks; no horizontal scroll at 360px.

## Correctness

- Quotes are rendered verbatim from JSON; the app never edits or truncates
  quote text (CSS may clamp with an explicit "show full quote" control).
- Derived number displays (number chips) on a finding card come only from
  `numbers_covered`. Finding prose is shown verbatim; its figures are verified
  at claim level (2,001 claims, 0 digital errors).
- If `findings.json` fails to load, the app shows an error state naming
  the file instead of rendering an empty page.

## Testing Strategy

- **Data validation**: `scripts/validate_data.py` — schema + count checks;
  wired to a Kiro hook so it runs whenever the data file changes.
- **Graveyard data**: the same validator also checks `data/removed.json`
  (fields, `removed_count`, meta totals, ghost count).
- **Manual checks** (no test framework; this is a static UI):
  1. All 20 ticker cards render; counts match meta.
  2. Every category filter returns the meta count for that category.
  3. Search for a known string (e.g. a ticker) returns its findings.
  4. Expand a finding: quote, accession, char offset visible.
  5. 360px viewport: no horizontal scroll; 1440px: grid is 4 columns.
  6. `findings.json` renamed away: error state appears.
- **Judging support**: the repo README links the live URL, the 3-minute
  demo video, and the Devpost submission; the demo video walks the
  index → ticker → expanded-quote flow end to end.
