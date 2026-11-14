(function () {
  'use strict';

  var DATA_URL = 'data/findings.json';
  var state = { data: null, byTicker: {} };
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    meta: $('meta-line'), search: $('search'), category: $('category'), clear: $('clear'),
    count: $('result-count'), error: $('error'), grid: $('ticker-grid'),
    results: $('results'), detail: $('detail'), empty: $('empty')
  };

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  var catColor = {};
  function colorFor(cat) { return catColor[cat] || '#a78bfa'; }
  function assignColors(cats) {
    cats.forEach(function (c, i) {
      catColor[c] = 'hsl(' + Math.round((i * 360) / cats.length + 20) + ' 80% 70%)';
    });
  }
  function chip(cat) {
    var c = h('span', 'chip', cat);
    c.style.setProperty('--chip', colorFor(cat));
    return c;
  }

  function sectionLabel(s) {
    return s === 'mda' ? 'MD&A' : s === 'notes' ? 'Notes' : 'Other';
  }

  // ---- routing ----
  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, '');
    var qi = raw.indexOf('?');
    var path = qi === -1 ? raw : raw.slice(0, qi);
    var params = new URLSearchParams(qi === -1 ? '' : raw.slice(qi + 1));
    return { ticker: decodeURIComponent(path).toUpperCase(), q: params.get('q') || '', cat: params.get('cat') || '' };
  }
  function buildHash(q, cat) {
    var p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cat) p.set('cat', cat);
    var s = p.toString();
    return '#/' + (s ? '?' + s : '');
  }

  // ---- rendering ----
  function renderMeta(meta) {
    els.meta.textContent = meta.display_findings + ' findings \u00b7 ' + meta.display_tickers +
      ' tickers \u00b7 Q3 2026 10-Q vs prior quarter \u00b7 ' + meta.disclaimer;
    var fd = $('footer-disclaimer');
    if (meta.disclaimer) fd.textContent = meta.disclaimer;
  }

  function topCategories(t) {
    var counts = {};
    t.findings.forEach(function (f) { counts[f.category] = (counts[f.category] || 0) + 1; });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).slice(0, 2);
  }

  function renderGrid() {
    els.grid.textContent = '';
    state.data.tickers.forEach(function (t) {
      var card = h('a', 'ticker-card');
      card.href = '#/' + encodeURIComponent(t.ticker);
      card.appendChild(h('span', 'ticker-sym', t.ticker));
      card.appendChild(h('span', 'ticker-analyst', t.analyst || ''));
      var ul = h('ul', 'counts');
      var li1 = h('li'); li1.appendChild(h('strong', null, String(t.display_count))); li1.appendChild(document.createTextNode(' findings shown'));
      var li2 = h('li'); li2.appendChild(h('strong', null, String(t.findings_scored))); li2.appendChild(document.createTextNode(' scored'));
      ul.appendChild(li1); ul.appendChild(li2);
      if (t.removed_deduped) {
        var li3 = h('li'); li3.appendChild(h('strong', null, String(t.removed_deduped)));
        li3.appendChild(document.createTextNode(' removed disclosures'));
        ul.appendChild(li3);
      }
      card.appendChild(ul);
      var chips = h('div', 'chips');
      topCategories(t).forEach(function (c) { chips.appendChild(chip(c)); });
      card.appendChild(chips);
      els.grid.appendChild(card);
    });
  }

  function findingCard(f, ticker, withTicker) {
    var card = h('article', 'finding');
    var top = h('div', 'finding-top');
    if (withTicker) {
      var a = h('a', 'ticker-tag', ticker);
      a.href = '#/' + encodeURIComponent(ticker);
      top.appendChild(a);
    }
    top.appendChild(chip(f.category));
    top.appendChild(h('span', null, sectionLabel(f.section)));
    card.appendChild(top);
    card.appendChild(h('p', 'finding-text', f.finding));
    if (f.numbers_covered && f.numbers_covered.length) {
      var ul = h('ul', 'numbers');
      ul.setAttribute('aria-label', 'Numbers covered');
      f.numbers_covered.forEach(function (n) { ul.appendChild(h('li', null, String(n))); });
      card.appendChild(ul);
    }
    var btn = h('button', 'expand', 'Show source quote');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    var proof = null;
    btn.addEventListener('click', function () {
      if (proof) {
        proof.remove(); proof = null;
        btn.textContent = 'Show source quote';
        btn.setAttribute('aria-expanded', 'false');
        return;
      }
      proof = h('div', 'proof');
      proof.appendChild(h('blockquote', null, f.quote));
      var dl = h('dl');
      dl.appendChild(h('dt', null, 'Accession')); dl.appendChild(h('dd', null, f.accession));
      dl.appendChild(h('dt', null, 'Char offset')); dl.appendChild(h('dd', null, String(f.char_offset)));
      proof.appendChild(dl);
      card.appendChild(proof);
      btn.textContent = 'Hide source quote';
      btn.setAttribute('aria-expanded', 'true');
    });
    card.appendChild(btn);
    return card;
  }

  function renderDetail(t) {
    els.detail.textContent = '';
    var back = h('a', 'back', '\u2190 All tickers');
    back.href = '#/';
    els.detail.appendChild(back);
    var head = h('div', 'detail-head');
    head.appendChild(h('h2', null, t.ticker));
    head.appendChild(h('span', 'ticker-analyst', t.analyst || ''));
    els.detail.appendChild(head);
    var stats = t.display_count + ' findings shown, ' + t.findings_scored + ' scored';
    if (t.removed_deduped) stats += ', ' + t.removed_deduped + ' removed disclosures (counted, not listed)';
    els.detail.appendChild(h('p', 'detail-stats', stats));

    var groups = {};
    t.findings.forEach(function (f) { (groups[f.category] = groups[f.category] || []).push(f); });
    Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length || a.localeCompare(b); })
      .forEach(function (cat) {
        var d = h('details', 'group');
        d.open = true;
        var s = h('summary');
        s.appendChild(chip(cat));
        s.appendChild(h('span', 'count', '(' + groups[cat].length + ')'));
        d.appendChild(s);
        var body = h('div', 'group-body');
        groups[cat].forEach(function (f) { body.appendChild(findingCard(f, t.ticker, false)); });
        d.appendChild(body);
        els.detail.appendChild(d);
      });
  }

  function matches(f, ticker, q, cat) {
    if (cat && f.category !== cat) return false;
    if (!q) return true;
    var needle = q.toLowerCase();
    return f.finding.toLowerCase().indexOf(needle) !== -1 ||
      f.category.toLowerCase().indexOf(needle) !== -1 ||
      ticker.toLowerCase().indexOf(needle) !== -1;
  }

  function renderResults(q, cat) {
    els.results.textContent = '';
    var n = 0;
    state.data.tickers.forEach(function (t) {
      t.findings.forEach(function (f) {
        if (matches(f, t.ticker, q, cat)) { n++; els.results.appendChild(findingCard(f, t.ticker, true)); }
      });
    });
    return n;
  }

  function show(which) {
    ['grid', 'results', 'detail', 'empty'].forEach(function (k) { els[k].hidden = k !== which; });
  }

  function route() {
    if (!state.data) return;
    var r = parseHash();
    var t = r.ticker && state.byTicker[r.ticker];
    if (t) { r.q = ''; r.cat = ''; }
    if (els.search.value.trim() !== r.q) els.search.value = r.q;
    if (r.cat && Object.keys(state.data.meta.categories).indexOf(r.cat) === -1) r.cat = '';
    els.category.value = r.cat;
    if (t) {
      els.count.textContent = '';
      renderDetail(t);
      show('detail');
      window.scrollTo(0, 0);
    } else if (r.q || r.cat) {
      var n = renderResults(r.q, r.cat);
      els.count.textContent = plural(n, 'finding', 'findings') + ' across all tickers';
      show(n ? 'results' : 'empty');
    } else {
      els.count.textContent = plural(state.data.meta.display_findings, 'finding', 'findings') +
        ' across ' + plural(state.data.meta.display_tickers, 'ticker', 'tickers');
      show('grid');
    }
  }

  function onFilterChange(ev) {
    var h2 = buildHash(els.search.value.trim(), els.category.value);
    var current = parseHash();
    var onList = !(current.ticker && state.byTicker[current.ticker]);
    if (location.hash === h2 || (h2 === '#/' && (location.hash === '' || location.hash === '#'))) {
      route();
    } else if (ev && ev.type === 'input' && onList) {
      // Typing replaces the current entry so Back does not step through keystrokes.
      history.replaceState(null, '', h2);
      route();
    } else {
      location.hash = h2;
    }
  }

  function init(data) {
    state.data = data;
    data.tickers.forEach(function (t) { state.byTicker[t.ticker.toUpperCase()] = t; });
    var cats = Object.keys(data.meta.categories).sort(function (a, b) {
      return data.meta.categories[b] - data.meta.categories[a] || a.localeCompare(b);
    });
    assignColors(cats);
    cats.forEach(function (c) {
      var o = h('option', null, c + ' (' + data.meta.categories[c] + ')');
      o.value = c;
      els.category.appendChild(o);
    });
    renderMeta(data.meta);
    renderGrid();
    els.search.addEventListener('input', onFilterChange);
    els.category.addEventListener('change', onFilterChange);
    els.clear.addEventListener('click', function () {
      els.search.value = ''; els.category.value = '';
      if (location.hash !== '#/' && location.hash !== '') location.hash = '#/'; else route();
    });
    window.addEventListener('hashchange', route);
    route();
  }

  function fail(err) {
    els.meta.textContent = 'Dataset unavailable.';
    els.error.hidden = false;
    els.error.textContent = '';
    els.error.appendChild(h('p', 'empty-title', 'The spirits swallowed the data.'));
    els.error.appendChild(h('p', null, 'Could not load ' + DATA_URL + ' (' + (err && err.message ? err.message : err) + ').'));
  }

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(init)
    .catch(fail);
})();
