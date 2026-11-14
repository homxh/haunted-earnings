const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const base = process.env.BASE_URL || 'http://localhost:8123/';
const data = JSON.parse(fs.readFileSync(REPO + '/data/findings.json'));
const removed = JSON.parse(fs.readFileSync(REPO + '/data/removed.json'));
const rAll = removed.tickers.flatMap(t => t.findings.map(f => ({ ticker: t.ticker, f })));
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
  // ---- Graveyard (Requirement 7) ----
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(base); await p.waitForSelector('.ticker-card');
  await p.click('#nav-graveyard'); await p.waitForSelector('#graveyard .grave');
  ok('R7.1 nav to #/graveyard', (await p.evaluate(() => location.hash)) === '#/graveyard' && await p.isVisible('#graveyard') && !(await p.isVisible('#ticker-grid')));
  const gc = await p.locator('#graveyard .grave').count();
  const gct = await p.textContent('#result-count');
  ok('R7.1 717 entries + count', gc === 717 && gct.startsWith('717 removed disclosures') && gct.includes('71 true ghosts'), gc + ' | ' + gct);
  const ghosts = await p.locator('#graveyard .afterlife.ghost').count();
  const afters = await p.locator('#graveyard .afterlife:not(.ghost)').count();
  ok('R7.3/7.4 ghosts 71, afterlives 646', ghosts === 71 && afters === 646, ghosts + '/' + afters);
  // spot-check an entry with a counterpart, and one ghost
  const withCc = rAll.find(e => e.f.closest_current);
  const ghost = rAll.find(e => !e.f.closest_current);
  const cardFor = e => p.locator('#graveyard .grave', { has: p.locator('blockquote') }).filter({ hasText: e.f.accession }).filter({ hasText: e.f.finding.slice(0, 60) }).first();
  let c1 = cardFor(withCc);
  ok('R7.2 prior text + verbatim quote', (await c1.locator('blockquote').textContent()) === withCc.f.quote && (await c1.locator('.finding-text').first().textContent()) === withCc.f.finding);
  const dl1 = await c1.locator('dl').textContent();
  ok('R7.2 accession/offset', dl1.includes(withCc.f.accession) && dl1.includes(String(withCc.f.char_offset)), dl1);
  ok('R7.3 afterlife text', (await c1.locator('.afterlife .finding-text').textContent()) === withCc.f.closest_current.finding && (await c1.locator('.afterlife .label').textContent()).includes('closest current-quarter'));
  let c2 = cardFor(ghost);
  const gtxt = await c2.locator('.afterlife').textContent();
  ok('R7.4 true ghost label', (await c2.locator('.afterlife.ghost').count()) === 1 && gtxt.includes('True ghost') && gtxt.includes('no counterpart'), gtxt);
  // category filter: counts per category
  const rcats = {}; rAll.forEach(e => { rcats[e.f.category] = (rcats[e.f.category] || 0) + 1; });
  const badg = [];
  for (const [c, n] of Object.entries(rcats)) {
    await p.selectOption('#category', c); await p.waitForTimeout(50);
    const cnt = await p.locator('#graveyard .grave').count(); const rc = await p.textContent('#result-count');
    if (!(cnt === n && rc.startsWith(n + ' removed disclosure'))) badg.push(c + ':' + cnt + '/' + rc);
  }
  ok('R7.5 graveyard categories', badg.length === 0 && Object.keys(rcats).length === 12, badg.join(' ; '));
  await p.click('#clear'); await p.waitForTimeout(100);
  ok('R7.5 clear stays in graveyard', (await p.evaluate(() => location.hash)) === '#/graveyard' && (await p.locator('#graveyard .grave').count()) === 717);
  await p.fill('#search', 'ACMR'); await p.waitForTimeout(100);
  const expG = rAll.filter(e => e.ticker.toLowerCase().includes('acmr') || e.f.finding.toLowerCase().includes('acmr') || e.f.category.toLowerCase().includes('acmr')).length;
  const gs = await p.locator('#graveyard .grave').count();
  ok('R7.5 graveyard search ACMR', gs === expG && gs >= 23, gs + ' expected ' + expG + ' hash ' + await p.evaluate(() => location.hash));
  await p.fill('#search', 'acmr'); await p.waitForTimeout(100);
  ok('R7.5 graveyard search case-insensitive', (await p.locator('#graveyard .grave').count()) === gs);
  await p.fill('#search', 'zzzznope'); await p.waitForTimeout(100);
  ok('R7.5 graveyard empty state', await p.isVisible('#empty') && (await p.textContent('#result-count')).startsWith('0 '));
  await p.click('#clear'); await p.waitForTimeout(100);
  await p.goto(base + '#/graveyard?q=lease&cat=leases'); await p.waitForSelector('#graveyard .grave');
  const dlN = rAll.filter(e => e.f.category === 'leases' && (e.ticker.toLowerCase().includes('lease') || e.f.finding.toLowerCase().includes('lease') || e.f.category.toLowerCase().includes('lease'))).length;
  ok('R7.5 graveyard deep link', (await p.inputValue('#search')) === 'lease' && (await p.inputValue('#category')) === 'leases' && (await p.locator('#graveyard .grave').count()) === dlN, dlN + '');
  await p.click('#nav-tickers'); await p.waitForSelector('.ticker-card');
  ok('R7.1 nav back to tickers keeps 12 cats', (await p.locator('#category option').count()) === 13 && await p.isVisible('#ticker-grid'));
  await p.goto(base + '#/graveyard'); await p.waitForSelector('#graveyard .grave');
  for (const w of [1000, 360]) {
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(100);
    const sw2 = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    ok('R7 ' + w + ' graveyard no hscroll', sw2[0] <= sw2[1], sw2 + '');
  }
  await p.setViewportSize({ width: 1440, height: 900 });
  ok('no console errors', errs.length === 0, errs.join('|'));
  fs.renameSync(REPO + '/data/findings.json', REPO + '/data/findings.json.bak');
  try {
    const q2 = await b.newPage(); await q2.goto(base); await q2.waitForSelector('#error:not([hidden])');
    const t = await q2.textContent('#error');
    ok('7.4 error state', t.includes('data/findings.json'), t);
  } finally { fs.renameSync(REPO + '/data/findings.json.bak', REPO + '/data/findings.json'); }
  fs.renameSync(REPO + '/data/removed.json', REPO + '/data/removed.json.bak');
  try {
    const q3 = await b.newPage(); await q3.goto(base); await q3.waitForSelector('.ticker-card');
    ok('R7.7 tickers still work without removed.json', await q3.locator('.ticker-card').count() === 20);
    await q3.goto(base + '#/graveyard'); await q3.waitForSelector('#error:not([hidden])');
    const t3 = await q3.textContent('#error');
    ok('R7.7 graveyard error state', t3.includes('data/removed.json'), t3);
    await q3.click('#nav-tickers'); await q3.waitForTimeout(100);
    ok('R7.7 error hides on tickers view', !(await q3.isVisible('#error')) && await q3.isVisible('#ticker-grid'));
  } finally { fs.renameSync(REPO + '/data/removed.json.bak', REPO + '/data/removed.json'); }
  console.log(out.join('\n')); await b.close();
})();
