# Haunted Earnings — Kiroween 2026 Costume Contest

A Halloween-themed interactive dashboard for SEC 10-Q quarter-over-quarter
diffs. 449 quote-verified findings across 20 tickers, each with its verbatim
source quote, accession, and character offset. Static site — no backend, no
login, no API keys.

Live demo: _(add the GitHub Pages URL after deploy)_
Devpost submission: _(add after submitting)_

## Quick start

1. Create a **public** GitHub repo named `haunted-earnings` with an MIT
   license. Do NOT add `.kiro` to `.gitignore` — judges check for it.
2. Copy this starter pack into the repo root and commit.
3. Open the repo in **Kiro** (IDE). Your 4,000 Kiroween credits
   (`kiroween-20-26`, expire Dec 31, 2026) fund the build.
4. In Kiro, open the spec at `.kiro/specs/haunted-earnings/` and execute
   `tasks.md` top to bottom (requirements → design → tasks is already
   written; the steering doc in `.kiro/steering/product.md` states the
   data-integrity rules).
5. Enable **GitHub Pages** from the repo root. No build step.
6. Record the under-3-minute demo video, upload to YouTube (public),
   submit on Devpost before **Dec 4, 2026, 2:00 PM PT**.

## What's in here

| Path | What it is |
| --- | --- |
| `data/findings.json` | Display dataset: 20 tickers, 449 findings (399 KB) |
| `data/DATA-README.md` | Provenance, coverage, categories, data rules |
| `.kiro/specs/haunted-earnings/requirements.md` | EARS-style requirements (6 requirements) |
| `.kiro/specs/haunted-earnings/design.md` | Architecture, data model, visual design, testing |
| `.kiro/specs/haunted-earnings/tasks.md` | Implementation plan, 8 sections, checkboxed |
| `.kiro/steering/product.md` | Product + data-integrity steering for Kiro |

## Credits budget (rough)

- 4,000 Kiroween credits + 500 trial credits on the account.
- At ~10 credits per medium Auto task, the 8 task sections are on the
  order of a few hundred credits. Use Auto (1.0x), not pinned Sonnet
  (1.3x); use Haiku 5.5 (0.06x) for small edits.

## Submission checklist

- [ ] Public GitHub repo, MIT license, `.kiro` present at root
- [ ] Live app URL (GitHub Pages)
- [ ] Demo video < 3 min, public on YouTube
- [ ] Devpost form: category **Costume Contest**, app URL, repo URL, video URL
- [ ] Startup bonus: founder + LinkedIn + domsect.io (Best Startup Project, $10,000)
- [ ] Blog post mentioning Kiroween 2026 (Bonus Blog, 2,000 credits)
- [ ] Social post starting with `#KiroweenHackathon26` (Social Blitz, 3-month Pro+)
- [ ] Submit before Dec 4, 2026, 2:00 PM PT

## Prizes at stake

Best Costume Contest $5,000 · Best Startup Project $10,000 · Best Demo
$1,000 · Bonus Blog 2,000 credits · Social Blitz 3-month Pro+. One Overall
OR one Category prize, plus any number of Bonus prizes. Theoretical ceiling
for this project: $16,000.

Footnote-diff data for research use — not investment advice.
