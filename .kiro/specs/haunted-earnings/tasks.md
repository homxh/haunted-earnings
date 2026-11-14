# Implementation Plan — Haunted Earnings

## 1. Repository setup

- [ ] 1. Create a public GitHub repo named `haunted-earnings` with an
  open-source license (MIT). Do NOT add `.kiro` to `.gitignore`.
  _Requirements: 6.4_
  _Note: MIT LICENSE is in the repo and `.kiro` is not ignored, but the GitHub repo must be created by the owner; not done from the build sandbox._
- [x] 1.1 Copy this starter pack into the repo root (`.kiro/`, `data/`,
  `README.md`). Commit.
  _Requirements: 6.1, 6.2_
- [ ] 1.2 Enable GitHub Pages from the repository root (main branch).
  _Requirements: 5.4_
  _Note: needs repo admin access; not done from the build sandbox._

## 2. Data validation

- [x] 2. Write `scripts/validate_data.py`: load `data/findings.json`,
  check every finding has non-empty `finding`, `category`, `quote`,
  `accession`, integer `char_offset`; check per-ticker `display_count`
  equals `len(findings)` and top-level `display_findings` equals the sum.
  Exit non-zero on any failure and print the offending ticker/claim id.
  _Requirements: 6.3, 2.4_
- [ ] 2.1 Add a Kiro hook that runs the validator whenever
  `data/findings.json` changes. Record the hook in `.kiro/hooks/` and
  verify it fires on a test edit, then revert the edit.
  _Requirements: 6.3_
  _Note: hook is in `.kiro/hooks/validate-findings.kiro.hook`. Firing inside the Kiro IDE could not be verified from the sandbox, so this stays unchecked. The validator it runs was checked against a corrupted copy and fails with ticker and claim id._
- [x] 2.2 Run the validator against the shipped dataset; it must pass
  (20 tickers, 449 findings).
  _Requirements: 6.3_

## 3. App shell and theme

- [x] 3. Write `index.html` skeleton: hero header, filter bar, ticker
  grid container, ticker detail container, footer with provenance and
  disclaimer.
  _Requirements: 1.3, 4.2, 5.1_
- [x] 3.1 Write `assets/style.css`: haunted theme (dark purple background,
  pumpkin orange + violet accents), card style, category chip colors,
  responsive breakpoints at 1024px and 640px.
  _Requirements: 4.1, 4.4_
- [x] 3.2 Add inline SVG Halloween decoration to the hero (no external
  images, no copyrighted assets).
  _Requirements: 4.3_

## 4. Ticker index

- [x] 4. Write `assets/app.js` data loading: fetch `data/findings.json`,
  render the meta line (449 findings, 20 tickers, Q3 2026 10-Q vs prior
  quarter, disclaimer). On load failure, show an error state naming the
  file.
  _Requirements: 1.3, 5.2, 5.3_
- [x] 4.1 Render the ticker grid: one card per ticker with symbol, analyst
  name, display count, scored total, removed count (labelled as removed
  disclosures), top 2 categories.
  _Requirements: 1.1, 1.2_
- [x] 4.2 Wire card click to the detail view and update the URL hash
  (`#/ACMR`); back/forward navigation must restore the view.
  _Requirements: 2.1_

## 5. Finding browser

- [x] 5. Render the ticker detail view: findings grouped by category in
  collapsible sections.
  _Requirements: 2.1_
- [x] 5.1 Render finding cards: finding text, category chip, section label,
  numbers from `numbers_covered` only.
  _Requirements: 2.2, 2.4_
- [x] 5.2 Add expand control per card: shows the verbatim `quote` plus
  source `accession` and `char_offset`.
  _Requirements: 2.3_

## 6. Search and filter

- [x] 6. Add the category filter (12 categories from meta) with a visible
  result count; selecting one filters across all tickers.
  _Requirements: 3.1_
- [x] 6.1 Add text search matching finding text, category, and ticker
  symbol, case-insensitively; combine with the category filter.
  _Requirements: 3.2_
- [x] 6.2 Add an explicit empty state for zero results, plus a clear
  button that resets filter and search.
  _Requirements: 3.3_

## 7. Verification pass

- [ ] 7. Manual check: all 20 ticker cards render and counts match meta.
  _Requirements: 1.1_
- [ ] 7.1 Manual check: each category filter returns the meta count for
  that category; search for a known ticker returns its findings.
  _Requirements: 3.1, 3.2_
- [ ] 7.2 Manual check: expand a finding and confirm quote, accession,
  and char offset are visible and verbatim.
  _Requirements: 2.3_
- [ ] 7.3 Manual check: 360px viewport has no horizontal scroll; 1440px
  viewport shows a 4-column grid.
  _Requirements: 4.4_
- [ ] 7.4 Manual check: with `findings.json` temporarily renamed, the app
  shows the error state; restore the file.
  _Requirements: 5.2_

## 8. Submission package

- [ ] 8. Record the under-3-minute demo video (index → ticker → expanded
  quote flow) and upload it to YouTube as public.
  _Requirements: 4.2_
- [ ] 8.1 Fill the Devpost submission form: category Costume Contest,
  live app URL, repo URL, video URL, text description. Add the startup
  bonus details (founder, LinkedIn profile, domsect.io) for the Best
  Startup Project bonus.
  _Requirements: 1.3_
- [ ] 8.2 Publish the blog post about the build (mentions Kiroween 2026)
  for the Bonus Blog prize, and post on social with the hashtag
  #KiroweenHackathon26 at the start for the Social Blitz prize. Link
  both in the submission form.
- [ ] 8.3 Submit on Devpost before Dec 4, 2026, 2:00 PM PT.
