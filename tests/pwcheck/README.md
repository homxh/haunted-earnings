# Playwright checks

Headless Chromium checks for the section 7 verification pass in
`.kiro/specs/haunted-earnings/tasks.md`: ticker cards and counts, category
filters, search, detail view and quotes, back/forward, deep links, responsive
columns (1440, 1000, 360 px) and the load error state.

## Run

From the repo root, serve the site:

```
python3 -m http.server 8123
```

In a second terminal:

```
cd tests/pwcheck
npm install
npx playwright install chromium
npm test
```

Each line is printed as `PASS` or `FAIL`. Set `BASE_URL` (with trailing slash)
if you serve on another port, for example `BASE_URL=http://localhost:8000/ npm test`.

The error-state check temporarily renames `data/findings.json` to
`findings.json.bak` and restores it afterwards. If the run is killed mid-check,
rename the file back.
