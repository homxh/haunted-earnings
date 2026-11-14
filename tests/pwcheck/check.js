const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const base = process.env.BASE_URL || 'http://localhost:8123/';
const data = JSON.parse(fs.readFileSync(REPO + '/data/findings.json'));
(async () => {
  const b = await chromium.launch();
  const out = [];
  const ok = (n, c, x = '') => { out.push((c ? 'PASS ' : 'FAIL ') + n + ' ' + x); };
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(base); await p.waitForSelector('.ticker-card');
  const nCards = await p.locator('.ticker-card').count();
  const meta = await p.textContent('#meta-line');
  const sumShown = await p.$$eval('.ticker-card .counts li:first-child strong', e => e.reduce((a, x) => a + +x.textContent, 0));
  ok('7 cards', nCards === 20, nCards + ' | ' + meta + ' | sum shown ' + sumShown);
  ok('7 counts match meta', sumShown === 449 && meta.includes('449 findings') && meta.includes('20 tickers'));
  const bad = [];
  for (const t of data.tickers) {
    const txt = await p.locator('.ticker-card', { hasText: t.ticker }).first().textContent();
    if (!(txt.includes(t.display_count + ' findings shown') && txt.includes(t.findings_scored + ' scored') && txt.includes(t.removed_deduped + ' removed disclosures'))) bad.push(t.ticker);
  }
  ok('7 per-card counts', bad.length === 0, bad.join(','));
  const cats = data.meta.categories; const badc = [];
  for (const [c, n] of Object.entries(cats)) {
    await p.selectOption('#category', c);
    await p.waitForTimeout(50);
    const rc = await p.textContent('#result-count'); const cards = await p.locator('#results .finding').count();
    if (!(cards === n && rc.startsWith(n + ' finding'))) badc.push(c + ':' + cards + '/' + rc);
  }
  ok('7.1 categories (12)', badc.length === 0 && Object.keys(cats).length === 12, badc.join(' ; '));
  await p.click('#clear');
  await p.fill('#search', 'ACMR'); await p.waitForTimeout(100);
  const acmr = data.tickers.find(t => t.ticker === 'ACMR');
  const sc = await p.locator('#results .finding').count();
  const expected = data.tickers.reduce((a, t) => a + t.findings.filter(f => t.ticker.toLowerCase().includes('acmr') || f.finding.toLowerCase().includes('acmr') || f.category.toLowerCase().includes('acmr')).length, 0);
  ok('7.1 search ACMR', sc === expected && sc >= acmr.display_count, sc + ' expected ' + expected + ' ticker ' + acmr.display_count + ' hash ' + await p.evaluate(() => location.hash));
  await p.fill('#search', 'acmr'); await p.waitForTimeout(100);
  ok('7.1 search case-insensitive', (await p.locator('#results .finding').count()) === sc);
  await p.fill('#search', 'zzzznope'); await p.waitForTimeout(100);
  ok('empty state', await p.isVisible('#empty') && (await p.textContent('#result-count')).startsWith('0 '));
  await p.click('#clear'); await p.waitForTimeout(100);
  ok('clear resets', await p.locator('.ticker-card').count() === 20 && (await p.inputValue('#search')) === '');
  await p.locator('.ticker-card', { hasText: 'ACMR' }).click(); await p.waitForSelector('.finding');
  ok('hash route', await p.evaluate(() => location.hash) === '#/ACMR');
  const first = acmr.findings[0];
  const card = p.locator('.finding', { hasText: first.finding.slice(0, 40) }).first();
  await card.locator('.expand').click();
  const q = await card.locator('blockquote').textContent(); const dl = await card.locator('dl').textContent();
  ok('7.2 quote verbatim', q === first.quote);
  ok('7.2 accession/offset', dl.includes(first.accession) && dl.includes(String(first.char_offset)), dl);
  const groups = await p.locator('details.group').count();
  ok('grouped by category', groups === new Set(acmr.findings.map(f => f.category)).size, groups + '');
  await p.goBack(); await p.waitForTimeout(100);
  ok('back restores index', await p.locator('.ticker-card').count() === 20 && await p.isVisible('#ticker-grid'));
  await p.goForward(); await p.waitForTimeout(100);
  ok('forward restores detail', await p.isVisible('#detail'));
  ok('detail finding cards', (await p.locator('#detail .finding').count()) === acmr.display_count);
  await p.goto(base + '#/?q=lease&cat=leases'); await p.waitForSelector('#results .finding');
  ok('deep link filter', (await p.inputValue('#search')) === 'lease' && (await p.inputValue('#category')) === 'leases');
  await p.goto(base); await p.waitForSelector('.ticker-card');
  const cols = await p.$eval('#ticker-grid', e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  ok('7.3 1440 4 cols', cols === 4, cols + '');
  for (const [w, exp] of [[1000, 2], [360, 1]]) {
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(100);
    const c = await p.$eval('#ticker-grid', e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    ok('7.3 ' + w + ' cols ' + exp + ' no hscroll', c === exp && sw[0] <= sw[1], c + ' ' + sw);
  }
  await p.goto(base + '#/ACMR'); await p.waitForSelector('.finding'); await p.locator('.expand').first().click();
  let sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  ok('7.3 360 detail no hscroll', sw[0] <= sw[1], sw + '');
  await p.goto(base + '#/?q=a'); await p.waitForSelector('#results .finding');
  sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  ok('7.3 360 results no hscroll', sw[0] <= sw[1], sw + '');
  ok('no console errors', errs.length === 0, errs.join('|'));
  fs.renameSync(REPO + '/data/findings.json', REPO + '/data/findings.json.bak');
  try {
    const q2 = await b.newPage(); await q2.goto(base); await q2.waitForSelector('#error:not([hidden])');
    const t = await q2.textContent('#error');
    ok('7.4 error state', t.includes('data/findings.json'), t);
  } finally { fs.renameSync(REPO + '/data/findings.json.bak', REPO + '/data/findings.json'); }
  console.log(out.join('\n')); await b.close();
})();
