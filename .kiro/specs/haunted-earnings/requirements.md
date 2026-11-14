# Requirements Document — Haunted Earnings

## Introduction

Haunted Earnings is a Halloween-themed interactive dashboard for the Kiroween 2026
Costume Contest. It turns quarter-over-quarter diffs extracted from SEC 10-Q filings
into a polished, explorable web experience: each ticker is a card, each change is a
finding with a verbatim source quote. The dataset is real — 449 quote-verified
findings across 20 tickers, derived from a 23-pair extraction run (1,557 findings
scored, 2,001 claims verified, 0 digital errors). The app is a static site: no
backend, no login, no API keys.

## Glossary

- **Finding**: one quarter-over-quarter change, with `finding` text, `category`,
  `section`, `claim_ids`, verbatim `quote`, `accession`, `char_offset`,
  `numbers_covered`.
- **Ticker card**: the per-ticker summary (counts, top categories, analyst name).
- **Display set**: the 449 trimmed findings in `data/findings.json`. The full
  1,557-finding set is reference only and is NOT shipped in the app.
- **Kiroween**: the hackathon. Submission deadline Dec 4, 2026, 2:00 PM PT.

## Requirements

### Requirement 1 — Ticker index

**User Story:** As a visitor, I want to see all covered tickers at a glance, so I
can pick one to explore.

#### Acceptance Criteria

1. WHEN the app loads, THE SYSTEM SHALL render one card per ticker (20 cards)
   showing ticker symbol, analyst name where known, display finding count, and
   total scored findings.
2. WHEN a ticker has removed-side findings, THE SYSTEM SHALL show the removed
   count separately from the display count, labelled as removed disclosures.
3. WHEN the page loads, THE SYSTEM SHALL display the dataset meta line: 449
   findings, 20 tickers, Q3 2026 10-Q vs prior quarter, and the
   "not investment advice" disclaimer.

### Requirement 2 — Finding browser

**User Story:** As a visitor, I want to read the actual changes for a ticker, so I
can judge what moved quarter over quarter.

#### Acceptance Criteria

1. WHEN a ticker card is selected, THE SYSTEM SHALL list that ticker's findings
   as cards, grouped by category.
2. WHEN a finding card is rendered, THE SYSTEM SHALL show the finding text, its
   category, its section (notes / MD&A / other), and every number from
   `numbers_covered`.
3. WHEN a finding card is expanded, THE SYSTEM SHALL show the verbatim `quote`
   plus the source `accession` and `char_offset`.
4. THE SYSTEM SHALL NOT display any number that is not in the finding's
   `numbers_covered` list, and SHALL NOT paraphrase or alter quote text.

### Requirement 3 — Search and filter

**User Story:** As a visitor, I want to filter by category or search text, so I can
find the changes I care about without scrolling.

#### Acceptance Criteria

1. WHEN a category is selected from the filter, THE SYSTEM SHALL show only
   findings in that category across all tickers, with a visible result count.
2. WHEN a search term is entered, THE SYSTEM SHALL match it against finding
   text, category, and ticker symbol, case-insensitively.
3. WHEN a filter produces zero results, THE SYSTEM SHALL show an explicit
   empty state instead of a blank page.

### Requirement 4 — Costume Contest presentation

**User Story:** As a judge, I want the app to look unmistakably Halloween and
polished, so the Costume Contest theme is obvious in the first five seconds.

#### Acceptance Criteria

1. THE SYSTEM SHALL use a dark haunted theme (dark background, purple/orange
   accents) consistently across all views.
2. THE SYSTEM SHALL include a Halloween hero header naming the project
   "Haunted Earnings" and the Kiroween 2026 event.
3. THE SYSTEM SHALL NOT use copyrighted images, music, or third-party
   trademarks; all visuals SHALL be original CSS/SVG.
4. THE SYSTEM SHALL be responsive: usable at 360px mobile width and 1440px
   desktop width with no horizontal scrolling.

### Requirement 5 — Static deployment

**User Story:** As the developer, I want the app to deploy as a static site, so
judges can open a public URL with no setup.

#### Acceptance Criteria

1. THE SYSTEM SHALL run entirely client-side from static files; it SHALL
   require no server, database, or API key.
2. THE SYSTEM SHALL load `data/findings.json` at runtime and render from it;
   no finding text SHALL be hard-coded in HTML.
3. THE SYSTEM SHALL include a `data/DATA-README.md` documenting provenance,
   coverage, and the disclaimer.
4. THE SYSTEM SHALL be deployable to GitHub Pages from the repository root
   with no build step.

### Requirement 6 — Kiro usage evidence

**User Story:** As a judge, I want to see that the app was built with Kiro, so
the Technological Implementation criterion can be scored.

#### Acceptance Criteria

1. THE REPOSITORY SHALL contain this spec (requirements, design, tasks) under
   `.kiro/specs/haunted-earnings/`.
2. THE REPOSITORY SHALL contain a steering document under `.kiro/steering/`
   stating the product and data-integrity rules.
3. THE REPOSITORY SHALL contain at least one Kiro hook that validates
   `data/findings.json` against its schema (required fields present, counts
   consistent with meta).
4. THE `.kiro` DIRECTORY SHALL NOT be listed in `.gitignore`.
