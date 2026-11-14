# Product Steering — Haunted Earnings

## What this is

A Halloween-themed dashboard that makes SEC 10-Q quarter-over-quarter diffs
readable. The audience is financial analysts and curious investors: people who
want to see what actually changed in a filing, with proof attached. The product
behind the data is an extraction pipeline (DomSect Extract API); this app is its
demo-grade viewer, built for the Kiroween 2026 Costume Contest.

## Data integrity rules (non-negotiable)

- **Never invent a number.** Every number shown comes from a finding's
  `numbers_covered` list. If a number is not in that list, it does not appear.
- **Quotes are verbatim.** Never paraphrase, shorten, or "clean up" quote text.
  Truncation in the UI is only allowed behind an explicit "show full quote"
  control.
- **Every finding carries its proof.** Finding card → verbatim quote →
  accession + char offset. No finding is shown without its source.
- **Removed is not deleted.** Removed-side findings are counted and labelled
  as removed disclosures; they are never presented as current-quarter facts.
- **Disclaimer always visible.** "Footnote-diff data for research use — not
  investment advice." appears in the hero meta line and the footer.

## Scope guardrails

- Static site only. No backend, no login, no API keys, no npm dependencies.
- The display dataset (`data/findings.json`) is fixed: 449 trimmed findings.
  Do not add findings from other sources without re-running the verifier
  pipeline and updating the meta counts.
- Halloween theme must be original CSS/SVG. No copyrighted images, music,
  or third-party trademarks.
