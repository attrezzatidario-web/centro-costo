/* Centro di Costo — Soluzione Veicolare — app.js */
(() => {
  'use strict';

  /* ================= Storage ================= */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const SOC = ['Soluzione Veicolare', 'Attrezzati'];
  const CENTRI_DEF = ['SAN CESAREO', 'FERENTINO', 'BOLOGNA', 'PIACENZA', 'ATTREZZATI'];
  const UM = ['PZ', 'CONF', 'PA', 'KG', 'LT', 'ML', 'MT', 'BL', 'SCA', 'H'];

  // categorie automatiche: la prima regola che trova una parola vince
  const RULES = [
    ['Trasporti e servizi', ['SPESE DI TRASPORTO', 'TRASPORTO', 'SPEDIZIONE', 'MANODOPERA', 'SERVIZIO']],
    ['Abbigliamento da lavoro', ['PAYPER', 'FELPA', 'T-SHIRT', 'TSHIRT', 'PANTALON', 'GIUBB', 'GILET', 'CAMICIA', 'BERMUDA', 'CAPPELLIN', 'SOFT SHELL', 'SOFT-SHELL', ' PILE', 'TRANSFER DTF', 'DAVENPORT', 'POLO ', 'GIACCA', 'TUTA ', 'PORTWEST', 'HEAVY MAN', 'GABARDINE', 'K-WAY', 'SALOPETTE']],
    ['DPI e sicurezza', ['SCARPE', 'SCARPA', 'GUANT', 'OCCHIAL', 'ELMETT', 'VISIERA', 'MASCHER', 'FILTRO BLS', 'BLS ', 'CUFFI', 'ALTA VISIBILIT', 'PRONTO SOCCORSO', 'EV-0', 'EV-1', 'TAPPI AURIC', 'U-POWER', 'COFRA', 'IMBRACATURA', 'ESTINTORE', 'CARTELLO']],
    ['Imballaggio', ['SCATOLA', 'FILM ', 'PLURIBALL', 'NASTRO IMBALLAGGIO', 'NASTRO CARTA', 'COPERTA TRASLOCHI', 'REGGIA', 'ETICHETT', 'BUSTE']],
    ['Pulizia e igiene', ['CARTA MANI', 'CARTA IGIENICA', 'PEZZAME', 'SCOPA', 'MANICO', 'LENZUOLA', 'DETERG', 'SACCO NERO', 'PATTUMIERA', 'SAPONE', 'SGRASSATORE', 'SEPPIOLITE', 'ASSORBENTE', 'SPUGN', 'MOCIO', 'SECCHIO', 'INSETTICIDA', 'LAVAPAVIMENTI']],
    ['Ufficio e informatica', ['CARTA PER STAMPANTE', 'CARTA BIANCA', 'RISMA', 'PENNARELLO', 'PENNA ', 'SEDIA', 'TABLET', 'PROIETTORE', 'UPS ', 'MONITOR', 'TONER', 'STAMPANTE', 'NOTEBOOK', 'MOUSE', 'TASTIERA', 'CANCELLERIA', 'RACCOGLITOR']],
    ['Accessori per utensili', ['INSERTO', 'INSERTI', 'PUNTA ', 'PUNTE ', 'LAMA ', 'LAME ', 'DISCO', 'DISCHI', 'FRESA', 'BUSSOL', 'PORTAINSERTO', 'PORTA INSERTO', 'ELETTRODO', 'SEGA A TAZZA', 'SEGHE A TAZZA', 'CORONA', 'MOLA', 'SPAZZOLA', 'ABRASIV']],
    ['Elettroutensili e batterie', ['MILWAUKEE M18', 'M18', 'M12', 'FUEL', 'DEWALT', 'AVVITATORE', 'TRAPANO', 'SMERIGLIATRICE', 'SEGA CIRCOLARE', 'SEGHETTO', 'RIVETTATRICE', 'BATTERI', 'BATTIERA', 'CARICABATT', 'MOTOSEGA', 'DECESPUGLIATORE', 'BIOTRITURATORE', 'LIVELLA LASER', 'TASSELLATORE', 'IDROPULITRICE', 'LAVORWASH', 'ASPIRATORE', 'SALDATRICE', 'MOTORE', 'ENGINEAIR', 'GENERATORE', 'COMPRESSORE']],
    ['Minuteria e fissaggio', ['VITI', 'VITE ', 'DADI', 'DADO', 'RONDELL', 'RIVETT', 'TASSELL', 'STOP ', 'BULLON', 'BARRA FILETTATA', 'ANCORANTE', 'FASCETT', 'GIUNZIONE', 'CHIODI', 'GOLFAR', 'MOSCHETTON', 'CATENA']],
    ['Chimici e sigillanti', ['SILICONE', 'SIGILL', 'MASTICE', 'COLLA', 'LOCTITE', 'SPRAY', 'ULTRA ', 'VERNICE', 'PITTURA', 'OLIO', 'SBLOCK', 'GRASSO', 'LUBRIFIC', 'ANTIRUGGINE', 'SOLVENTE', 'DILUENTE', 'AD BLUE', 'ADBLUE', 'LIQUIDO']],
    ['Elettrico e illuminazione', ['CAVO', 'NASTRO ISOLANTE', 'NASTRO TELATO', 'LAMPION', 'FARO', 'PRESA', 'SPINA', 'PROLUNGA', 'AVVOLGICAVO', 'LED', 'INTERRUTTORE', 'MULTIPRESA', 'CAPICORDA']],
    ['Utensili e attrezzature', ['CHIAVE', 'CHIAVI', 'PINZA', 'CACCIAVITE', 'MARTELLO', 'MAZZETTA', 'CRICCHETTO', 'SET ', 'CASSETTA', 'VALIGETTA', 'CARRELLO', 'CAVALLETTO', 'MARTINETTO', 'SOLLEVATORE', 'TRANSPALLET', 'AVVOLGITUBO', 'TUBO', 'PISTOLA', 'TAGLIERINA', 'TAGLIERNI', 'CUTTER', 'FLESSOMETRO', 'METRO', 'LUCCHETTO', 'INGRASSATORE', 'ARRETRATORE', 'ESTRATTORE', 'TAGLIATUBI', 'COLTELLO', 'USAG', 'BGS', 'KOKEN', 'BENMAN', 'FF GROUP', 'LAMPADA', 'SCALA', 'VASCA', 'TANICA', 'TRAPPOLA', 'SGABELLO', 'BANCO', 'MORSA', 'LIVELLA', 'SPELAFILI', 'ASSORTIMENTO', 'DINAMOMETRICA']]
  ];
  const CAT_DEF = [...RULES.map(r => r[0]), 'Altro'];
  function autoCat(desc) {
    const d = ' ' + String(desc || '').toUpperCase().replace(/\s+/g, ' ') + ' ';
    for (const [c, keys] of RULES) if (keys.some(k => d.includes(k))) return c;
    return 'Altro';
  }

  // collegamento fisso al Foglio Google: niente schermata iniziale
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxExGwxVNa08xHz1zp2BmoGkvT1LX7jj-yfdbzbWckqOBsMxPsISmDdKgDmx4uqwRiW/exec';
  let url = SCRIPT_URL;
  LS.set('cdc_url', url);
  let db = LS.get('cdc_data', { movimenti: [], config: {}, ai: false });
  if (!db.gls) db.gls = [];
  if (!db.gasolio) db.gasolio = [];
  let queue = LS.get('cdc_queue', []);
  let syncing = false, online = navigator.onLine;
  const isLocal = () => url === 'local';
  const save = () => { prodIdx = null; LS.set('cdc_data', db); LS.set('cdc_queue', queue); };

  /* ================= Utils ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtNum = (n, dec) => {
    const v = Number(n) || 0, neg = v < 0;
    const [i, d] = Math.abs(v).toFixed(dec).split('.');
    return (neg ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
  };
  const eur = n => fmtNum(n, 2) + ' €';
  const eur0 = n => fmtNum(Math.round(Number(n) || 0), 0) + ' €';
  const eurP = n => { const v = Number(n) || 0; return fmtNum(v, Math.abs(v * 100 - Math.round(v * 100)) > 1e-6 ? 3 : 2) + ' €'; };
  const qtyFmt = n => { const v = Number(n) || 0; return Number.isInteger(v) ? fmtNum(v, 0) : fmtNum(v, 2); };
  const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
  const isDesk = () => matchMedia('(min-width: 900px)').matches;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  const ymOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const parseD = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const validD = s => /^\d{4}-\d{2}-\d{2}/.test(String(s || ''));
  const monthName = key => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }); };
  const monthShort = key => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('it-IT', { month: 'short' }).replace('.', ''); };
  const shortDate = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const num = v => { if (typeof v === 'number') return v; const n = parseFloat(String(v ?? '').replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };
  const r2 = n => Math.round(n * 100) / 100;
  // IVA: i dati restano sempre IVA esclusa; l'interruttore cambia solo la visualizzazione
  let ivaOn = (() => { try { return localStorage.getItem('cdc_iva') === '1'; } catch { return false; } })();
  const ivaRate = r => { const v = r && r.iva !== '' && r.iva != null ? num(r.iva) : 0.22; return v > 1 ? v / 100 : v; };
  const mul = r => ivaOn ? 1 + ivaRate(r) : 1;
  const totN = r => r2(num(r.quantita) * num(r.prezzo));
  const tot = r => r2(num(r.quantita) * num(r.prezzo) * mul(r));
  const pu = r => num(r.prezzo) * mul(r);
  const sumN = arr => r2(arr.reduce((a, r) => a + totN(r), 0));
  const sumI = arr => r2(arr.reduce((a, r) => a + r2(num(r.quantita) * num(r.prezzo) * (1 + ivaRate(r))), 0));
  const budV = c => num((db.config.budget || {})[c]) * (ivaOn ? 1.22 : 1);
  const netMode = fn => { const p = ivaOn; ivaOn = false; try { return fn(); } finally { ivaOn = p; } };
  const ivaLbl = () => ivaOn ? 'IVA inclusa' : 'IVA esclusa';
  const sumT = arr => r2(arr.reduce((a, r) => a + tot(r), 0));
  const ccAbbr = s => { const w = String(s || '?').trim().split(/\s+/); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };
  const ccIc = c => `<span class="ic cc${String(c).toUpperCase() === 'ATTREZZATI' ? ' cc-att' : ''}">${esc(ccAbbr(c))}</span>`;
  const groupBy = (arr, fn) => { const m = new Map(); arr.forEach(x => { const k = fn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); }); return m; };
  // un prodotto = tutte le righe con lo stesso codice o la stessa descrizione (taglie e varianti incluse)
  let prodIdx = null;
  const dKey = r => 'd:' + String(r.descrizione || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const cKey = r => { const c = String(r.codice || '').trim(); return c ? 'c:' + c : ''; };
  function buildProd() {
    const par = new Map();
    const find = x => { if (!par.has(x)) par.set(x, x); let r = x; while (par.get(r) !== r) r = par.get(r); while (par.get(x) !== r) { const n = par.get(x); par.set(x, r); x = n; } return r; };
    const uni = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) par.set(ra < rb ? rb : ra, ra < rb ? ra : rb); };
    db.movimenti.forEach(r => { const d = dKey(r), c = cKey(r); find(d); if (c) uni(c, d); });
    prodIdx = { find, par };
  }
  const prodKey = r => { if (!prodIdx) buildProd(); const d = dKey(r), c = cKey(r); if (prodIdx.par.has(d)) return prodIdx.find(d); if (c && prodIdx.par.has(c)) return prodIdx.find(c); return c || d; };
  const artKey = r => String(r.codice || '').trim() ? 'c:' + String(r.codice).trim() : 'd:' + String(r.descrizione || '').trim().toUpperCase().replace(/\s+/g, ' ');

  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = `<svg viewBox="0 0 24 24" class="t-ic"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 10"/></svg><span>${esc(msg)}</span>`;
    t.hidden = false; t.classList.remove('out'); void t.offsetWidth; t.classList.add('in');
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.classList.add('out'); setTimeout(() => (t.hidden = true), 250); }, 2600);
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countTo(el, value, fmt = eur) {
    if (!el) return;
    const to = Number(value) || 0, from = el._v != null ? el._v : 0;
    el._v = to;
    if (reduced() || Math.abs(to - from) < 0.005) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 750;
    cancelAnimationFrame(el._raf);
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }
  function busy(txt) {
    let el = $('#busy');
    if (!txt) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement('div'); el.id = 'busy'; el.className = 'busy'; document.body.appendChild(el); }
    el.innerHTML = `<div class="busy-box"><div class="spin"></div><span>${esc(txt)}</span></div>`;
    el.hidden = false;
  }

  /* ================= Config ================= */
  const cfg = k => (db.config || {})[k];
  const centri = () => {
    const list = Array.isArray(cfg('centri')) && cfg('centri').length ? [...cfg('centri')] : [...CENTRI_DEF];
    db.movimenti.forEach(r => { const c = String(r.centro || '').trim(); if (c && !list.includes(c)) list.push(c); });
    return list;
  };
  const categorie = () => {
    const list = Array.isArray(cfg('categorie')) && cfg('categorie').length ? [...cfg('categorie')] : [...CAT_DEF];
    db.movimenti.forEach(r => { const c = String(r.categoria || '').trim(); if (c && !list.includes(c)) list.push(c); });
    return list;
  };
  const budget = () => cfg('budget') || {};

  /* ================= Sync ================= */
  const KEY = { Movimenti: 'movimenti', GLS: 'gls', Gasolio: 'gasolio' };
  function applyLocal(op) {
    if (op.sheet === 'Config') {
      if (op.action === 'delete') delete db.config[op.id];
      else { try { db.config[op.row.chiave] = JSON.parse(op.row.valore); } catch { db.config[op.row.chiave] = op.row.valore; } }
      return;
    }
    const k = KEY[op.sheet];
    if (!db[k]) db[k] = [];
    if (op.action === 'delete') { db[k] = db[k].filter(r => String(r.id) !== String(op.id)); return; }
    const i = db[k].findIndex(r => String(r.id) === String(op.row.id));
    if (i >= 0) db[k][i] = op.row; else db[k].push(op.row);
  }
  function applyMany(ops) {
    // versione veloce per molte righe
    const idx = new Map(db.movimenti.map((r, i) => [String(r.id), i]));
    const del = new Set();
    ops.forEach(op => {
      if (op.sheet !== 'Movimenti') return applyLocal(op);
      if (op.action === 'delete') { del.add(String(op.id)); return; }
      const i = idx.get(String(op.row.id));
      if (i != null) db.movimenti[i] = op.row; else { idx.set(String(op.row.id), db.movimenti.length); db.movimenti.push(op.row); }
    });
    if (del.size) db.movimenti = db.movimenti.filter(r => !del.has(String(r.id)));
  }
  function write(ops) {
    applyMany(ops);
    if (!isLocal()) queue.push(...ops);
    save(); render(); flush();
  }
  const setConfig = (chiave, value) => write([{ action: 'upsert', sheet: 'Config', row: { chiave, valore: JSON.stringify(value) } }]);

  async function api(action, extra) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, ...extra }) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Errore');
    return j.result;
  }
  async function flush() {
    if (isLocal() || syncing || !queue.length || !url) return setSync();
    syncing = true; setSync();
    const batch = queue.slice();
    try {
      await api('batch', { ops: batch });
      queue = queue.slice(batch.length); save(); online = true;
    } catch (e) {
      if (e instanceof TypeError) online = false; else toast('Errore salvataggio: ' + e.message);
    } finally { syncing = false; setSync(); }
    if (queue.length && online) setTimeout(flush, 4000);
  }
  async function pull(showToast) {
    if (isLocal()) { if (showToast) toast('Modalità solo dispositivo'); return; }
    try {
      setSync('Aggiorno…');
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=all&t=' + Date.now());
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      db = { movimenti: j.data.movimenti || [], config: j.data.config || {}, ai: !!j.data.ai, v: j.v, gls: j.data.gls || (j.v >= 'cdc-1.1' ? [] : db.gls || []), gasolio: j.data.gasolio || (j.v >= 'cdc-1.2' ? [] : db.gasolio || []) };
      applyMany(queue);
      online = true; save(); render();
      if (showToast) toast('Dati aggiornati');
    } catch (e) {
      online = false;
      if (showToast) toast('Impossibile collegarsi');
    }
    setSync(); flush();
  }
  function setSync(txt) {
    ['#sync', '#sync-side'].forEach(s => {
      const el = $(s); if (!el) return;
      el.className = 'sync';
      if (txt) { el.textContent = txt; return; }
      if (isLocal()) { el.textContent = 'Solo dispositivo'; el.classList.add('offline'); return; }
      if (syncing) { el.textContent = 'Salvo…'; el.classList.add('pending'); return; }
      if (queue.length) { el.textContent = `${queue.length} da inviare`; el.classList.add('pending'); return; }
      if (!online) { el.textContent = 'Offline'; el.classList.add('offline'); return; }
      el.textContent = 'Sincronizzato';
    });
  }

  /* ================= State ================= */
  let view = 'home';
  let soc = LS.get('cdc_soc', '');
  const f = { q: '', centro: '', cat: '', per: '', zero: false };
  const a = { q: '', sort: 'tot', centro: '' };
  let mLimit = 150, aLimit = 120;
  const sel = new Set(); let selMode = false;

  const rowsSoc = () => soc ? db.movimenti.filter(r => (r.societa || 'Soluzione Veicolare') === soc) : db.movimenti;

  /* ================= Router ================= */
  const TITLES = { home: 'Home', movimenti: 'Movimenti', articoli: 'Articoli', gls: 'GLS Attrezzati', gasolio: 'Gasolio', impostazioni: 'Impostazioni' };
  function go() {
    const h = location.hash.slice(1) || 'home';
    view = TITLES[h] ? h : 'home';
    if (view === 'centri' || view === 'home') ccAnim = true;
    if (view === 'gls') glsAnim = true;
    if (view === 'gasolio') gasAnim = true;
    $$('.view').forEach(v => (v.hidden = v.dataset.v !== view));
    $$('.nav a').forEach(x => x.classList.toggle('active', x.dataset.view === view));
    $('#title').textContent = TITLES[view];
    $('#fab').hidden = view === 'impostazioni' || view === 'gls';
    $('#add-top').style.visibility = view === 'gls' || view === 'gasolio' ? 'hidden' : '';
    if (view !== 'movimenti') { sel.clear(); selMode = false; $('#selbar').hidden = true; document.body.classList.remove('has-sel'); }
    render();
    window.scrollTo(0, 0);
  }
  /* ---------- Tema: automatico / chiaro / scuro ---------- */
  const getTheme = () => { try { return localStorage.getItem('cdc_theme') || 'auto'; } catch { return 'auto'; } };
  function applyTheme(t, anim) {
    const root = document.documentElement;
    const go = () => {
      if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
      const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
      $$('meta[name="theme-color"]').forEach(m => { m.setAttribute('content', dark ? '#0f1115' : '#f4f5f7'); m.removeAttribute('media'); });
      themeUI();
    };
    if (anim && !reduced() && document.startViewTransition) document.startViewTransition(go); else go();
  }
  function themeUI() {
    const t = getTheme(), seg = $('#s-theme'); if (!seg) return;
    const btns = $$('[data-theme-set]', seg), i = btns.findIndex(b => b.dataset.themeSet === t);
    btns.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-checked', j === i); });
    seg.style.setProperty('--i', Math.max(0, i));
  }
  function ivaUI() {
    $$('.iva-tg').forEach(b => { b.classList.toggle('on', ivaOn); b.setAttribute('aria-pressed', ivaOn); });
    document.body.classList.toggle('iva-on', ivaOn);
  }
  function render() {
    ivaUI();
    const fn = { home: renderHome, movimenti: renderMov, articoli: renderArt, gls: renderGls, gasolio: renderGas, impostazioni: renderSettings }[view];
    fn && fn();
  }
  const sub = t => { $('#subtitle').textContent = t || ''; };

  /* ================= HOME ================= */
  function socBar() {
    const opts = [['', 'Tutte'], ['Soluzione Veicolare', 'Soluzione Veicolare'], ['Attrezzati', 'Attrezzati']];
    $('#h-soc').innerHTML = opts.map(([v, l]) => `<button data-soc="${esc(v)}" class="${soc === v ? 'on' : ''}">${esc(l)}</button>`).join('');
  }
  function barRows(list, total, opts = {}) {
    if (!list.length) return '<div class="empty">Nessun dato</div>';
    const max = Math.max(...list.map(x => Math.max(x.v, x.bud || 0)), 1);
    return list.map(x => {
      const over = x.bud && x.v > x.bud;
      return `<div class="bar-row${opts.click ? ' click' : ''}" ${opts.click ? `data-${opts.click}="${esc(x.k)}"` : ''}>
        <div class="bar-top"><span>${esc(x.k)}<em>${fmtNum(pct(x.v, total), 1)}%</em></span><span>${eur0(x.v)}</span></div>
        <div class="bar-track"><div class="bar-fill${over ? ' over' : ''}" style="width:${(x.v / max * 100).toFixed(2)}%"></div>${x.bud ? `<i class="bar-bud" style="left:${(x.bud / max * 100).toFixed(2)}%" title="Budget ${esc(eur0(x.bud))}"></i>` : ''}</div>
      </div>`;
    }).join('');
  }
  function renderHome() {
    socBar();
    const rows = rowsSoc();
    const T = sumT(rows);
    sub(rows.length ? `${fmtNum(rows.length, 0)} righe di acquisto` : 'Nessun dato: importa il file Excel da Impostazioni');
    countTo($('#k-tot'), T, eur0);
    const noDate = rows.filter(r => !validD(r.data)).length;
    $('#k-tot-s').innerHTML = ivaOn ? `IVA inclusa · imponibile ${eur0(sumN(rows))}` : `IVA esclusa · con IVA ${eur0(sumI(rows))}`;

    const byC = [...groupBy(rows, r => r.centro || '—')].map(([k, v]) => ({ k, v: sumT(v), n: v.length })).sort((x, y) => y.v - x.v);
    $('#k-top').textContent = byC[0] ? byC[0].k : '—';
    $('#k-top-s').textContent = byC[0] ? `${eur0(byC[0].v)} · ${fmtNum(pct(byC[0].v, T), 1)}%` : '';

    const arts = new Set(rows.map(prodKey));
    countTo($('#k-art'), arts.size, v => fmtNum(Math.round(v), 0));
    $('#k-art-s').textContent = 'prodotti unici, varianti incluse';
    const zero = rows.filter(r => !num(r.prezzo)).length;
    countTo($('#k-zero'), zero, v => fmtNum(Math.round(v), 0));
    { const n = priceSuggest().out.length; $('#k-zero-s').textContent = n ? `${n} completabili in automatico` : 'da completare'; }

    renderDash($('#v-home'), { matrix: true });
    $$('.k-ivalbl').forEach(e => (e.textContent = ivaLbl()));

    const byK = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => ({ k, v: sumT(v) })).sort((x, y) => y.v - x.v);
    $('#h-cat').innerHTML = barRows(byK, T, { click: 'cat' });
    $('#h-cat-n').textContent = `${byK.length} categorie`;

    // andamento mensile (solo righe con data)
    const dated = rows.filter(r => validD(r.data));
    const byM = groupBy(dated, r => String(r.data).slice(0, 7));
    const card = $('#h-trend-card');
    card.hidden = !byM.size;
    if (byM.size) {
      const keys = [...byM.keys()].sort();
      let [y, m] = keys[0].split('-').map(Number);
      const last = keys[keys.length - 1], months = [];
      while (months.length < 24) { const k = `${y}-${pad(m)}`; months.push(k); if (k >= last) break; m++; if (m > 12) { m = 1; y++; } }
      const ms = months.slice(-12), vals = ms.map(k => sumT(byM.get(k) || []));
      const mx = Math.max(...vals, 1);
      $('#h-trend').innerHTML = ms.map((k, i) => `<div class="mb" title="${esc(monthName(k))}: ${esc(eur(vals[i]))}"><span class="mbv">${vals[i] ? esc(eur0(vals[i])) : ''}</span><i class="${i === ms.length - 1 ? 'cur' : ''}" style="height:${vals[i] ? Math.max(3, vals[i] / mx * 100) : 0}%;animation-delay:${i * 35}ms"></i><span class="mbl">${esc(monthShort(k))}</span></div>`).join('');
      $('#h-trend-s').textContent = noDate ? `${fmtNum(noDate, 0)} righe senza data escluse` : '';
    }

    // top voci
    const top = [...rows].sort((x, y) => tot(y) - tot(x)).slice(0, 8);
    $('#h-top').innerHTML = top.length ? top.map(r => itemHtml(r)).join('') : '<div class="empty">Nessun movimento</div>';

    renderAiCard();
  }
  function itemHtml(r) {
    const z = !num(r.prezzo);
    return `<div class="item" data-id="${esc(r.id)}">${ccIc(r.centro)}<div class="main"><div class="t">${esc(r.descrizione)}</div><div class="s">${esc(r.centro || '—')} · ${esc(r.categoria || 'Altro')} · ${qtyFmt(r.quantita)} ${esc(r.um || '')} × ${z ? 'prezzo mancante' : eurP(pu(r))}</div></div><div class="amt${z ? ' zero' : ''}">${eur(tot(r))}</div></div>`;
  }

  /* ---------- Analisi IA ---------- */
  const IC = {
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>'
  };
  const aiReady = () => !isLocal() && !!db.ai;
  async function aiCall(task, extra) {
    if (!aiReady()) throw new Error('Imposta la chiave Gemini in Impostazioni');
    return api('ai', { task, oggi: today(), categorie: categorie(), ...extra });
  }
  function renderAiCard() {
    const el = $('#h-ai');
    const ins = cfg('insights');
    const head = `<div class="card-h"><h3 class="ai-title">${IC.spark}Analisi IA</h3>${aiReady() ? `<button class="btn sm" id="ai-gen">${ins ? 'Aggiorna' : 'Genera'}</button>` : ''}</div>`;
    if (!aiReady()) { el.innerHTML = head + `<p class="muted small" style="margin:0">Collega il Foglio Google e salva la chiave Gemini in <a class="link" href="#impostazioni">Impostazioni</a> per avere l'analisi automatica dei costi.</p>`; return; }
    if (!ins) { el.innerHTML = head + '<p class="muted small" style="margin:0">Genera un\'analisi dei costi: concentrazioni di spesa, aumenti di prezzo, possibili risparmi.</p>'; return; }
    el.innerHTML = head + `<p class="ins-sum">${esc(ins.sintesi || '')}</p><ul class="ins">${(ins.punti || []).map(p => `<li class="${esc(p.tipo || '')}"><i></i><span>${esc(p.testo)}</span></li>`).join('')}</ul><div class="ins-date">Aggiornata il ${esc(shortDate(ins.data))}${ins.soc ? ' · ' + esc(ins.soc) : ''}</div>`;
  }
  function summary(rows) { return netMode(() => summary0(rows)); }
  function summary0(rows) {
    const T = sumT(rows);
    const byC = [...groupBy(rows, r => r.centro || '—')].map(([k, v]) => ({ centro: k, totale: sumT(v), righe: v.length }));
    const byK = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => ({ categoria: k, totale: sumT(v) })).sort((x, y) => y.totale - x.totale);
    const mx = {};
    rows.forEach(r => { const k = (r.centro || '—') + ' | ' + (r.categoria || 'Altro'); mx[k] = r2((mx[k] || 0) + tot(r)); });
    const arts = articoli(rows);
    return {
      totale: T, righe: rows.length, societa: soc || 'tutte',
      perCentro: byC, perCategoria: byK,
      centroPerCategoria: Object.entries(mx).sort((x, y) => y[1] - x[1]).slice(0, 25),
      articoliPiuCostosi: arts.slice(0, 12).map(x => ({ articolo: x.desc, quantita: x.qty, totale: x.tot, prezzoMedio: r2(x.avg) })),
      prezziVariati: arts.filter(x => x.var > 0.02).sort((x, y) => y.var * y.tot - x.var * x.tot).slice(0, 12).map(x => ({ articolo: x.desc, min: x.min, max: x.max, aumentoPct: Math.round(x.var * 100) })),
      righeSenzaPrezzo: rows.filter(r => !num(r.prezzo)).length,
      righeSenzaData: rows.filter(r => !validD(r.data)).length,
      budgetAnnuale: budget()
    };
  }
  async function genInsights() {
    const rows = rowsSoc();
    if (!rows.length) return toast('Nessun dato da analizzare');
    try {
      busy('Analizzo i costi…');
      const r = await aiCall('insights', { summary: summary(rows) });
      setConfig('insights', { data: today(), soc: soc || '', sintesi: r.sintesi || '', punti: (r.punti || []).slice(0, 6) });
      toast('Analisi aggiornata');
    } catch (e) { toast(e.message); } finally { busy(); }
  }

  /* ================= MOVIMENTI ================= */
  function fillFilters() {
    const rows = db.movimenti;
    $('#f-centro').innerHTML = `<option value="">Tutti i centri</option>` + centri().map(c => `<option${c === f.centro ? ' selected' : ''}>${esc(c)}</option>`).join('');
    $('#f-cat').innerHTML = `<option value="">Tutte le categorie</option>` + categorie().map(c => `<option${c === f.cat ? ' selected' : ''}>${esc(c)}</option>`).join('');
    const months = [...new Set(rows.filter(r => validD(r.data)).map(r => String(r.data).slice(0, 7)))].sort().reverse();
    const years = [...new Set(months.map(m => m.slice(0, 4)))];
    const o = [['', 'Tutto il periodo'], ['nd', 'Senza data'], ['zero', 'Senza prezzo'], ...years.map(y => ['y' + y, 'Anno ' + y]), ...months.map(m => ['m' + m, monthName(m)])];
    $('#f-per').innerHTML = o.map(([v, l]) => `<option value="${v}"${v === f.per ? ' selected' : ''}>${esc(l.charAt(0).toUpperCase() + l.slice(1))}</option>`).join('');
    if ($('#f-q').value !== f.q) $('#f-q').value = f.q;
  }
  function filtered() {
    const q = f.q.trim().toLowerCase();
    return rowsSoc().filter(r => {
      if (f.centro && r.centro !== f.centro) return false;
      if (f.cat && (r.categoria || 'Altro') !== f.cat) return false;
      if (f.per === 'nd' && validD(r.data)) return false;
      if (f.per === 'zero' && num(r.prezzo)) return false;
      if (f.per[0] === 'y' && String(r.data).slice(0, 4) !== f.per.slice(1)) return false;
      if (f.per[0] === 'm' && String(r.data).slice(0, 7) !== f.per.slice(1)) return false;
      if (q && !`${r.descrizione} ${r.codice} ${r.ndoc} ${r.fornitore} ${r.note}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }
  function renderMov() {
    fillFilters();
    const list = filtered();
    const T = sumT(list);
    sub(isDesk() ? 'Clic su prezzo, quantità, centro o categoria per modificarli al volo' : (soc || ''));
    $('#m-selmode').hidden = isDesk(); $('#m-selmode').textContent = selMode ? 'Fine' : 'Seleziona'; $('#m-selmode').classList.toggle('primary', selMode);
    selBar();
    $('#m-count').textContent = `${fmtNum(list.length, 0)} righe`;
    $('#m-zero').hidden = f.per !== 'zero';
    if (f.per === 'zero') {
      const ps = priceStats();
      $('#zb-an').innerHTML = `
        <div><b>${fmtNum(ps.nPrezzo, 0)}</b><span>righe con prezzo · ${eur0(ps.tPrezzo)}</span></div>
        <div class="bad"><b>${fmtNum(ps.zero.length, 0)}</b><span>righe senza prezzo</span></div>
        <div><b>${fmtNum(ps.conCod, 0)}</b><span>di queste hanno un codice</span></div>
        <div class="${ps.out.length ? 'ok' : ''}"><b>${fmtNum(ps.out.length, 0)}</b><span>completabili in automatico${ps.nDes ? ` (${ps.nCod} da codice, ${ps.nDes} da descrizione)` : ''}</span></div>`;
      $('#zb-auto').hidden = !ps.out.length; $('#zb-auto').textContent = `Completa in automatico (${ps.out.length})`;
    }
    countTo($('#m-sum'), T);
    // con data prima (più recenti), poi senza data nell'ordine di inserimento
    const sorted = list.map((r, i) => [r, i]).sort((x, y) => {
      const dx = validD(x[0].data) ? x[0].data : '', dy = validD(y[0].data) ? y[0].data : '';
      if (dx !== dy) return dy.localeCompare(dx);
      return x[1] - y[1];
    }).map(x => x[0]);
    const shown = sorted.slice(0, mLimit);
    const more = sorted.length > mLimit ? `<div class="more-row"><button class="btn sm" id="m-more">Mostra altre ${fmtNum(Math.min(300, sorted.length - mLimit), 0)}</button></div>` : '';
    if (!list.length) { $('#m-list').innerHTML = `<div class="card empty-state"><p class="muted">${db.movimenti.length ? 'Nessun movimento con questi filtri.' : 'Ancora nessun movimento. Importa il file Excel da Impostazioni o aggiungi un movimento.'}</p></div>`; return; }
    if (isDesk()) {
      const allOn = shown.length && shown.every(r => sel.has(String(r.id)));
      $('#m-list').innerHTML = `<div class="card tbl-card"><table class="tbl"><thead><tr><th class="ck"><input type="checkbox" class="cb" id="m-ckall"${allOn ? ' checked' : ''} aria-label="Seleziona tutte le righe visibili"></th><th>Descrizione</th><th>Centro</th><th>Categoria</th><th class="r">Q.tà</th><th class="r">Prezzo${ivaOn ? ' + IVA' : ''}</th><th class="r">Totale${ivaOn ? ' + IVA' : ''}</th></tr></thead><tbody>${shown.map(r => {
        const z = !num(r.prezzo);
        const on = sel.has(String(r.id));
        return `<tr data-id="${esc(r.id)}"${on ? ' class="sel"' : ''}><td class="ck"><input type="checkbox" class="cb" data-ck="${esc(r.id)}"${on ? ' checked' : ''}></td><td><div class="tcell">${ccIc(r.centro)}<div class="tt"><b>${esc(r.descrizione)}</b><small>${[r.codice ? 'Cod. ' + r.codice : '', r.ndoc ? 'Doc. ' + r.ndoc : '', shortDate(r.data), r.fornitore].filter(Boolean).map(esc).join(' · ') || '&nbsp;'}</small></div></div></td><td class="m2 ed" data-ed="centro" title="Clic per cambiare">${esc(r.centro || '—')}</td><td class="ed" data-ed="categoria" title="Clic per cambiare"><span class="chip">${esc(r.categoria || 'Altro')}</span></td><td class="num ed" data-ed="quantita" title="Clic per modificare">${qtyFmt(r.quantita)} <span class="muted small">${esc(r.um || '')}</span></td><td class="num ed" data-ed="prezzo" title="Clic per modificare">${z ? '<span class="chip soon">mancante</span>' : eurP(pu(r))}</td><td class="num amt">${eur(tot(r))}</td></tr>`;
      }).join('')}</tbody></table></div>${more}`;
    } else {
      $('#m-list').innerHTML = `<div class="day${selMode ? ' selmode' : ''}">${shown.map(r => selMode ? itemHtml(r).replace('<div class="item"', `<div class="item${sel.has(String(r.id)) ? ' sel' : ''}" data-ck="${esc(r.id)}"`).replace(/ data-id="[^"]*"/, '') : itemHtml(r)).join('')}</div>${more}`;
    }
  }

  /* ---------- Prezzi mancanti: analisi e completamento dal codice ---------- */
  const normD = d => String(d || '').toUpperCase().replace(/\s+/g, ' ').trim();
  function priceSuggest() {
    const priced = db.movimenti.filter(r => num(r.prezzo) > 0)
      .map((r, i) => [r, i]).sort((a, b) => String(a[0].data || '').localeCompare(String(b[0].data || '')) || a[1] - b[1]).map(x => x[0]);
    const byCod = new Map(), byDes = new Map();
    priced.forEach(r => { // l'ultimo inserito vince: è il più recente
      const c = String(r.codice || '').trim(); if (c) { const L = byCod.get(c) || []; L.push(r); byCod.set(c, L); }
      const d = normD(r.descrizione); const L2 = byDes.get(d) || []; L2.push(r); byDes.set(d, L2);
    });
    const zero = db.movimenti.filter(r => !num(r.prezzo));
    const out = [];
    zero.forEach(r => {
      const c = String(r.codice || '').trim();
      let L = c && byCod.get(c), src = 'codice';
      if (!L) { L = byDes.get(normD(r.descrizione)); src = 'descrizione'; }
      if (!L || !L.length) return;
      const from = L[L.length - 1], prices = [...new Set(L.map(x => num(x.prezzo)))];
      out.push({ r, src, from, price: num(from.prezzo), prices });
    });
    return { zero, out, conCod: zero.filter(r => String(r.codice || '').trim()).length };
  }
  function priceStats() {
    const p = priceSuggest(), conPrezzo = db.movimenti.filter(r => num(r.prezzo) > 0);
    return { ...p, nPrezzo: conPrezzo.length, tPrezzo: sumT(conPrezzo), nCod: p.out.filter(x => x.src === 'codice').length, nDes: p.out.filter(x => x.src === 'descrizione').length };
  }
  function openAutoPrice() {
    const { out } = priceSuggest();
    if (!out.length) return toast('Nessuna riga senza prezzo ha un codice già presente con prezzo');
    const line = x => `${esc(x.r.centro || '—')} · ${qtyFmt(x.r.quantita)} ${esc(x.r.um || '')} × <b>${eurP(x.price * mul(x.r))}</b> = ${eur(num(x.r.quantita) * x.price * mul(x.r))}`;
    const srcTxt = x => `${x.src === 'codice' ? 'stesso codice ' + esc(x.r.codice) : 'stessa descrizione'} · da ${esc(x.from.centro || '—')}${validD(x.from.data) ? ' del ' + esc(shortDate(x.from.data)) : ''}${x.prices.length > 1 ? ` · prezzi trovati ${eurP(Math.min(...x.prices))} – ${eurP(Math.max(...x.prices))}, uso il più recente` : ''}`;
    const sec = (title, items, off) => items.length ? `<div class="rv-sec"><div class="rv-h"><b>${title}</b><span class="chip">${items.length}</span></div><div class="rv-list">${items.map(x => `<label class="rv-row"><input type="checkbox" class="cb" name="a${out.indexOf(x)}"${off ? '' : ' checked'}><span class="rv-m"><span class="t">${esc(x.r.descrizione)}</span><span class="s">${line(x)}</span><span class="s rv-src">${srcTxt(x)}</span></span></label>`).join('')}</div></div>` : '';
    const c1 = out.filter(x => x.src === 'codice'), c2 = out.filter(x => x.src === 'descrizione');
    openSheet('Completa i prezzi in automatico', `
      <div class="ai-note">Prezzo preso dall'ultimo acquisto dello stesso articolo. Controlla e togli la spunta a quello che non vuoi.</div>
      ${sec('Stesso codice', c1, false)}
      ${sec('Stessa descrizione, codice diverso', c2, true)}`,
      fd => {
        const pick = out.filter((x, i) => fd.get('a' + i));
        if (!pick.length) return toast('Nessuna riga selezionata');
        write(pick.map(x => ({ action: 'upsert', sheet: 'Movimenti', row: { ...x.r, prezzo: x.price } })));
        toast(`${pick.length} prezzi inseriti · ${eur(pick.reduce((s, x) => s + num(x.r.quantita) * x.price, 0))}`);
        return true;
      }, null, `Applica ${c1.length} prezzi`);
    $('#sheet-form').classList.add('wide');
    $('#sheet-body').addEventListener('change', () => { const n = $$('#sheet-body .rv-row input:checked').length; $('#sheet-ok').textContent = `Applica ${n} prezz${n === 1 ? 'o' : 'i'}`; });
  }

  function selBar() {
    const ids = new Set(db.movimenti.map(r => String(r.id)));
    [...sel].forEach(id => { if (!ids.has(id)) sel.delete(id); });
    const bar = $('#selbar'); bar.hidden = view !== 'movimenti' || !sel.size;
    document.body.classList.toggle('has-sel', !bar.hidden);
    if (bar.hidden) return;
    $('#sb-n').textContent = fmtNum(sel.size, 0);
    $('#sb-t').textContent = eur(sumT(db.movimenti.filter(r => sel.has(String(r.id)))));
    const n = filtered().length; $('#sb-all').textContent = `Tutte (${fmtNum(n, 0)})`;
  }
  function delSelected() {
    const n = sel.size; if (!n) return;
    if (!confirm(`Eliminare ${n} ${n === 1 ? 'movimento' : 'movimenti'}? L'operazione non si può annullare.`)) return;
    write([...sel].map(id => ({ action: 'delete', sheet: 'Movimenti', id })));
    sel.clear(); selMode = false; renderMov();
    toast(`${n} ${n === 1 ? 'movimento eliminato' : 'movimenti eliminati'}`);
  }

  /* ================= CENTRI ================= */
  /* ================= CENTRI — dashboard ================= */
  const IT_PATH = 'M53.8 55.2L55.6 56.8L57.3 57.0L60.8 55.6L63.5 55.5L67.4 53.1L70.2 53.7L71.5 55.1L75.1 55.6L76.9 53.2L79.2 52.6L80.3 49.3L82.5 48.0L83.0 45.6L81.6 43.2L87.0 39.4L88.0 37.2L90.2 36.5L90.9 36.6L91.4 37.9L91.1 44.2L93.0 45.1L95.5 48.2L97.5 49.2L98.8 48.7L100.9 49.3L101.6 50.2L99.9 53.1L102.6 54.4L103.7 56.7L103.4 58.7L106.0 58.9L107.7 56.1L105.5 53.8L106.4 52.8L106.0 51.1L107.6 50.4L107.8 48.3L111.9 44.4L113.3 40.8L112.3 37.0L113.4 34.9L115.3 34.9L116.1 36.0L117.4 34.8L117.6 39.0L120.1 42.0L123.8 42.2L125.0 40.1L126.3 40.5L130.3 39.4L131.4 39.9L131.8 42.0L133.2 43.3L133.5 44.7L134.4 44.7L136.5 43.2L134.8 40.9L136.1 38.2L133.1 36.7L133.2 33.6L134.9 30.9L137.5 30.3L138.5 30.6L138.5 32.1L140.2 33.0L144.2 33.4L144.5 30.4L142.8 29.8L142.2 28.6L143.7 25.7L143.4 24.1L144.3 21.9L146.3 22.6L149.5 21.9L151.9 23.1L151.5 24.6L155.4 25.4L158.7 25.2L160.2 23.6L161.0 20.5L163.4 18.3L167.1 17.5L169.6 18.1L171.2 16.8L172.7 17.4L176.9 17.3L178.2 18.1L182.6 16.0L190.0 14.0L190.6 14.2L190.5 15.1L188.2 17.2L188.9 19.6L188.5 20.2L192.3 21.7L192.4 24.7L194.2 25.3L195.9 28.0L199.7 29.4L205.0 29.8L207.1 30.9L215.4 31.8L217.7 32.9L224.2 32.5L230.1 34.1L229.5 36.5L227.4 36.8L225.6 38.7L223.1 40.0L221.2 42.3L222.4 45.1L223.1 45.1L222.8 44.4L224.0 44.6L226.4 46.0L228.5 46.2L227.9 48.1L225.0 50.2L223.8 52.3L225.0 53.7L227.6 53.1L228.1 53.7L226.6 58.6L227.7 59.7L232.2 61.6L235.2 65.5L234.0 67.3L230.4 67.0L230.8 66.3L232.9 66.3L231.1 65.0L231.5 64.2L230.8 63.1L226.8 60.0L226.2 59.9L225.4 61.1L226.3 61.9L222.2 64.1L221.5 63.8L222.9 63.3L222.8 62.4L221.3 61.6L218.3 61.2L217.3 60.4L215.5 61.4L214.8 60.7L214.9 61.9L213.7 62.2L213.5 63.3L215.5 63.1L213.8 65.3L210.1 65.7L205.8 68.4L196.1 72.6L196.5 70.9L197.7 70.8L197.5 70.2L198.8 70.6L200.5 68.4L199.4 69.0L198.6 67.7L197.3 68.6L197.1 69.9L195.9 69.7L195.7 68.9L195.5 69.8L196.4 70.4L193.4 70.7L191.9 72.6L192.1 74.1L190.7 77.1L189.3 76.9L190.0 78.9L190.4 77.4L190.9 77.7L191.3 80.8L192.3 81.1L193.3 79.9L193.9 84.5L193.3 83.5L193.0 84.9L193.9 85.2L193.7 84.7L194.5 85.7L194.9 87.7L195.4 86.7L194.9 85.8L198.1 88.9L198.4 88.4L199.3 89.1L196.9 94.5L196.8 91.6L196.0 91.9L195.7 94.2L196.4 94.5L195.7 95.4L193.2 93.7L192.3 94.2L191.9 99.9L192.7 101.8L193.6 110.8L194.9 114.7L202.6 123.3L209.7 126.6L218.3 134.2L224.1 137.4L225.2 136.7L227.9 139.2L233.6 154.6L236.5 166.3L240.0 173.4L252.8 186.7L256.7 188.4L257.6 191.7L261.0 193.5L264.2 194.3L265.6 195.8L268.8 197.2L276.2 198.0L291.5 196.6L294.5 197.5L295.6 198.5L295.9 202.1L288.2 208.4L288.1 211.2L289.0 213.2L306.5 222.8L318.8 227.3L324.5 230.9L329.8 236.2L334.3 238.0L339.5 241.1L342.4 241.9L342.4 242.8L343.8 242.6L344.7 244.3L344.6 245.9L350.0 249.5L355.2 256.2L357.3 262.0L354.5 266.5L353.9 272.2L352.5 272.8L345.5 268.9L343.5 265.9L344.1 264.4L342.7 263.7L344.0 262.3L341.7 259.4L341.3 256.7L340.0 255.6L330.8 254.9L327.8 254.0L322.5 250.8L323.6 250.0L323.2 248.9L325.0 248.9L325.7 248.0L323.7 247.9L322.2 248.6L321.3 247.5L318.5 247.3L316.6 248.2L314.9 249.9L311.5 255.0L310.1 258.6L306.8 262.7L306.6 264.5L307.5 266.9L304.2 271.5L303.8 273.7L305.3 277.8L307.3 279.1L311.5 279.5L313.2 281.6L317.5 284.0L319.5 286.3L321.4 286.8L320.2 291.7L321.1 293.8L320.5 298.0L321.2 299.6L322.7 300.2L321.8 301.1L321.8 302.6L320.0 304.9L319.7 304.1L317.8 304.6L316.1 303.4L313.0 304.1L310.0 305.6L305.9 308.9L304.9 311.9L306.0 318.0L305.7 322.0L303.2 324.4L299.8 326.1L295.3 331.7L293.8 337.7L292.8 338.9L290.8 339.7L284.6 339.4L282.5 338.5L281.2 336.5L281.8 335.3L280.8 333.5L281.5 331.7L281.1 329.0L281.6 328.2L285.2 326.9L288.3 320.0L288.6 317.2L286.5 314.5L286.6 313.7L290.9 311.0L294.4 311.1L295.6 310.2L296.5 307.9L296.6 304.9L296.2 303.6L294.9 302.9L293.0 298.6L291.7 289.0L290.7 285.7L287.3 281.2L285.7 276.5L284.8 269.6L280.9 263.0L278.6 263.0L275.2 265.9L273.4 265.6L272.4 264.4L271.3 264.7L271.8 264.1L271.3 263.1L267.7 259.7L265.6 259.7L264.5 258.2L262.0 257.2L262.6 253.9L264.3 253.0L264.4 251.6L260.8 244.1L258.7 241.9L254.5 242.6L252.4 243.9L250.9 243.2L247.1 245.5L246.9 243.5L250.6 241.0L250.5 239.8L245.8 235.9L243.9 236.2L243.4 237.2L240.2 236.2L240.2 237.9L239.3 237.7L238.5 233.0L235.9 229.4L234.1 224.9L230.7 221.2L227.3 221.2L226.5 221.8L226.8 222.8L226.0 222.8L219.2 219.7L212.8 222.1L211.5 219.0L208.8 216.0L205.0 215.2L202.4 213.7L201.9 214.3L197.0 207.8L193.9 204.9L191.5 204.1L189.7 199.0L185.7 194.9L183.0 193.3L180.7 193.5L176.2 184.8L173.1 182.3L168.8 180.2L164.8 179.7L163.6 181.6L161.6 180.8L161.1 179.4L161.7 178.8L163.2 179.1L163.7 177.6L163.0 174.6L162.2 174.9L160.9 172.2L159.0 171.0L157.3 168.3L151.7 166.1L152.6 165.0L152.9 162.9L152.2 161.8L149.1 160.6L146.6 160.9L146.8 161.5L146.1 161.8L145.6 161.2L145.0 159.5L146.1 158.3L146.8 153.9L146.3 150.4L144.0 145.3L140.7 141.6L139.0 129.1L138.0 126.4L134.7 122.7L132.1 121.5L131.1 121.9L128.3 119.8L127.6 120.3L128.4 121.0L128.0 122.1L124.0 118.8L122.4 118.3L118.8 114.9L117.5 115.1L112.1 111.0L111.5 112.8L109.8 111.9L108.7 110.3L99.7 108.3L91.9 112.8L90.4 116.7L86.4 119.1L85.3 122.0L83.6 124.2L84.0 125.2L81.4 127.3L71.5 131.1L66.4 131.0L66.2 127.6L71.4 121.2L70.1 118.5L70.5 117.4L62.2 119.2L54.4 115.1L52.7 115.0L49.8 110.7L50.0 108.9L51.0 108.1L49.5 106.8L48.8 104.7L51.8 101.4L52.1 99.3L54.6 99.3L53.1 95.4L53.4 94.4L52.7 93.5L49.1 93.1L46.4 91.3L45.9 87.6L44.0 86.8L42.7 84.4L46.2 82.5L49.1 83.5L52.0 80.6L53.9 80.0L54.6 80.5L56.0 78.9L55.7 76.6L57.5 73.5L52.7 69.9L51.9 67.3L52.2 65.3L48.3 63.3L47.4 60.4L48.0 58.7L51.9 57.6L53.8 55.2ZM185.2 378.2L186.5 379.8L186.0 381.5L183.5 379.8L183.5 378.2L185.2 378.2ZM278.4 326.0L281.5 327.3L279.4 328.7L279.6 329.7L277.6 333.8L270.0 345.2L270.2 347.2L268.8 352.1L267.0 354.8L267.0 360.1L271.1 363.2L271.3 364.0L270.9 363.6L270.2 364.5L269.8 363.6L269.2 365.0L270.1 366.8L271.0 366.7L270.5 367.0L271.0 368.1L272.4 368.7L271.9 370.6L272.9 370.9L273.1 371.9L271.5 372.3L271.5 373.3L268.6 375.0L266.9 379.4L268.0 383.4L266.9 384.6L264.6 382.9L263.9 383.4L261.3 381.9L258.6 383.0L253.4 380.1L250.9 379.7L247.8 373.3L243.5 369.4L240.4 368.2L235.2 368.8L233.6 367.4L230.5 366.2L226.7 362.6L222.8 361.1L219.0 358.3L216.2 355.0L212.0 354.7L211.6 353.3L210.1 352.1L202.6 352.3L200.9 349.7L198.5 348.7L196.4 344.0L197.5 343.1L198.2 336.0L200.4 334.3L201.3 334.6L202.7 332.6L203.8 332.9L204.5 329.9L205.3 330.4L206.8 334.0L209.0 335.8L213.3 333.8L213.1 331.7L214.3 330.1L217.1 330.5L217.9 329.5L220.0 329.0L221.4 330.7L221.9 333.1L225.1 332.9L226.3 335.0L228.8 336.8L232.5 337.7L238.5 335.0L240.2 335.9L245.2 336.2L249.4 335.0L251.5 335.2L254.8 333.9L257.4 331.2L261.9 330.1L266.8 332.2L269.1 331.3L270.7 327.4L270.9 329.1L272.1 329.5L275.0 328.5L278.4 326.0ZM91.6 298.6L92.3 298.8L90.7 302.6L89.2 300.2L88.7 297.8L89.1 297.1L91.3 297.6L91.6 298.6ZM126.9 245.9L127.8 246.9L127.1 249.5L125.8 252.3L124.8 252.7L122.5 256.4L123.2 260.6L125.3 262.7L124.1 267.1L125.0 268.1L124.0 269.9L124.4 271.0L122.6 283.4L123.1 284.0L121.8 289.1L122.8 290.7L121.3 291.8L121.0 296.0L119.7 297.5L119.1 296.5L117.6 296.8L113.7 293.4L111.7 293.2L110.4 294.6L106.3 291.9L107.0 293.2L108.1 293.3L106.5 296.0L107.2 299.2L106.7 301.4L102.1 305.6L98.5 303.7L97.2 304.4L96.5 306.1L96.5 305.2L95.4 304.9L95.9 303.1L94.9 302.6L94.3 299.2L92.9 299.0L92.9 298.0L92.3 298.4L89.4 293.3L91.0 290.5L89.5 287.8L90.3 286.1L89.8 284.6L91.8 280.7L91.3 274.4L93.2 276.3L94.5 276.4L92.9 275.6L94.0 273.4L93.3 274.1L94.2 272.1L94.0 270.1L91.8 268.8L91.1 269.3L91.8 269.3L91.1 270.8L90.6 269.6L90.0 268.8L90.4 265.0L89.5 264.5L92.0 263.5L92.4 262.6L91.7 258.1L92.2 255.4L89.8 253.2L89.9 250.0L87.3 244.6L85.3 245.5L84.7 245.2L85.3 244.0L84.6 243.8L83.9 245.7L83.6 245.2L83.3 243.5L84.8 241.1L83.1 239.8L85.3 234.4L85.1 233.2L84.3 232.7L84.9 231.1L86.9 235.0L93.3 236.3L95.4 235.4L96.5 233.9L98.3 233.0L99.8 233.3L101.3 232.1L102.8 229.4L103.9 228.9L106.1 225.8L109.7 224.8L110.5 221.6L112.1 220.9L113.4 223.3L113.5 222.3L113.5 223.3L114.8 223.5L114.9 222.7L117.2 223.8L116.8 224.5L117.6 225.5L117.6 226.9L118.4 225.0L119.8 224.9L120.8 225.7L119.5 229.6L120.3 228.9L120.6 229.9L122.3 229.5L123.5 230.1L121.5 230.3L121.1 232.5L119.3 232.8L121.1 233.5L123.0 233.0L122.2 234.0L125.1 235.7L123.3 237.3L124.6 238.7L126.1 244.9L126.9 245.9ZM144.1 164.7L143.8 166.7L142.6 167.5L143.6 168.4L143.4 169.5L141.3 167.5L140.6 168.3L140.4 167.7L139.4 168.2L138.8 167.8L138.6 168.6L136.3 168.5L135.0 166.8L136.5 165.6L138.8 166.2L139.6 165.3L141.0 165.3L140.9 165.9L141.8 166.0L143.3 163.6L144.1 164.7Z';
  const IT_P = {"c": 0.743145, "k": 35.5311, "minx": 4.9079, "miny": -47.0848, "ox": 42.726, "oy": 14};
  const GEO = { 'SAN CESAREO': [12.80, 41.82], 'FERENTINO': [13.25, 41.69], 'BOLOGNA': [11.34, 44.49], 'PIACENZA': [9.69, 45.05], 'ATTREZZATI': [12.57, 41.86], 'ROMA': [12.50, 41.90] };
  // posizione delle etichette rispetto al punto [dx, dy, ancoraggio]
  const LBL = { 'SAN CESAREO': [58, -34, 'start'], 'FERENTINO': [52, 26, 'start'], 'ATTREZZATI': [-60, -16, 'end'], 'BOLOGNA': [40, -22, 'start'], 'PIACENZA': [-30, -30, 'end'] };
  const HQ = 'SAN CESAREO';
  const proj = ([lon, lat]) => [(lon * IT_P.c - IT_P.minx) * IT_P.k + IT_P.ox, (-lat - IT_P.miny) * IT_P.k + IT_P.oy];
  const CAT_COL = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)'];
  let selCC = '', ccAnim = true;
  const K = (k, R) => $('.k-' + k, R);

  function ccStats(rows) {
    const T = sumT(rows), by = groupBy(rows, r => r.centro || '—');
    const list = centri().map(c => ({ c, rows: by.get(c) || [] })).concat([...by.keys()].filter(k => !centri().includes(k)).map(k => ({ c: k, rows: by.get(k) })));
    list.forEach(x => (x.t = sumT(x.rows)));
    list.sort((p, q) => q.t - p.t);
    return { T, list: list.filter(x => x.rows.length || budV(x.c)) };
  }

  function renderCentri() { renderDash($('#v-centri'), { hero: true, matrix: true }); }

  function renderDash(R, opt = {}) {
    const rows = rowsSoc();
    const { T, list } = ccStats(rows);
    if (opt.hero) sub(soc || 'Tutte le società');
    if (!list.find(x => x.c === selCC)) selCC = list[0] ? list[0].c : '';
    const anim = ccAnim && !reduced(); ccAnim = false;
    R.classList.toggle('cc-anim', anim);

    // società
    if (K('soc', R)) K('soc', R).innerHTML = [['', 'Tutte'], ['Soluzione Veicolare', 'Soluzione Veicolare'], ['Attrezzati', 'Attrezzati']].map(([k, l]) => `<button data-soc="${esc(k)}" class="${soc === k ? 'on' : ''}">${esc(l)}</button>`).join('');

    // hero
    const top2 = list.slice(0, 2).reduce((s, x) => s + x.t, 0);
    if (opt.hero) K('hero', R).innerHTML = `
      <div class="ch-main"><span class="label">Spesa totale dei centri</span><div class="ch-big k-tot">0 €</div><span class="muted small">${ivaLbl()} · ${list.filter(x => x.rows.length).length} centri attivi · ${fmtNum(rows.length, 0)} righe</span></div>
      <div class="ch-kpis">
        <div><span>Concentrazione</span><b>${fmtNum(pct(top2, T), 1)}%</b><small>nei primi 2 centri</small></div>
        <div><span>Media per centro</span><b>${eur0(list.length ? T / list.filter(x => x.rows.length).length : 0)}</b><small>spesa media</small></div>
      </div>`;
    if (opt.hero) countTo(K('tot', R), T, eur0);

    // mappa
    const mx = Math.max(1, ...list.map(x => x.t));
    const pins = list.filter(x => GEO[x.c]).map((x, i) => { const [px, py] = proj(GEO[x.c]); return { ...x, px, py, r: 4 + 8 * Math.sqrt(x.t / mx), i }; });
    const hq = pins.find(p => p.c === HQ);
    const arcs = hq ? pins.filter(p => p !== hq).map((p, i) => {
      const dx = p.px - hq.px, dy = p.py - hq.py, L = Math.hypot(dx, dy) || 1, bend = Math.min(60, L * .35);
      const cx = (hq.px + p.px) / 2 - dy / L * bend, cy = (hq.py + p.py) / 2 + dx / L * bend;
      return `<path id="arc-${R.id}-${i}" class="cm-arc" pathLength="1" style="--d:${900 + i * 140}ms" d="M${hq.px.toFixed(1)} ${hq.py.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${p.px.toFixed(1)} ${p.py.toFixed(1)}"/>
        <circle class="cm-dot" r="2.2"><animateMotion dur="${(2.2 + L / 160).toFixed(2)}s" begin="${(1.5 + i * .25).toFixed(2)}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1"><mpath href="#arc-${R.id}-${i}"/></animateMotion></circle>`;
    }).join('') : '';
    const lab = p => {
      const [dx, dy, an] = LBL[p.c] || [p.r + 10, -6, 'start'];
      const lx = p.px + dx, ly = p.py + dy, ex = lx + (an === 'end' ? 4 : -4);
      return `<g class="cm-lbl" data-centro="${esc(p.c)}" style="--d:${1300 + p.i * 90}ms">
        <path class="cm-lead" d="M${p.px.toFixed(1)} ${p.py.toFixed(1)} L${ex.toFixed(1)} ${(ly - 4).toFixed(1)}"/>
        <text x="${lx.toFixed(1)}" y="${(ly - 6).toFixed(1)}" text-anchor="${an}" class="cm-n">${esc(p.c)}${p.c === HQ ? ' · sede' : ''}</text>
        <text x="${lx.toFixed(1)}" y="${(ly + 9).toFixed(1)}" text-anchor="${an}" class="cm-v">${eur0(p.t)} · ${fmtNum(pct(p.t, T), 1)}%</text></g>`;
    };
    K('map', R).innerHTML = `<svg viewBox="0 0 400 440" class="cm-svg" role="img" aria-label="Mappa dei centri di costo">
      <path class="cm-land" pathLength="1" d="${IT_PATH}"/>
      ${arcs}
      ${pins.slice().reverse().map(p => `<g class="cm-pin${p.c === selCC ? ' on' : ''}" data-centro="${esc(p.c)}" style="--d:${700 + p.i * 110}ms" transform="translate(${p.px.toFixed(1)} ${p.py.toFixed(1)})">
        <circle class="cm-pulse" r="${p.r.toFixed(1)}"/><circle class="cm-hit" r="${(p.r + 8).toFixed(1)}"/><circle class="cm-c" r="${p.r.toFixed(1)}"/></g>`).join('')}
      ${pins.map(lab).join('')}
    </svg>${list.some(x => !GEO[x.c]) ? `<div class="muted small cm-note">Non in mappa: ${list.filter(x => !GEO[x.c]).map(x => esc(x.c)).join(', ')}</div>` : ''}`;

    // classifica
    const bud = budget();
    K('rank', R).innerHTML = list.map((x, i) => {
      const b = budV(x.c), over = b && x.t > b;
      return `<button class="cr-row${x.c === selCC ? ' on' : ''}" data-centro="${esc(x.c)}" style="--d:${200 + i * 80}ms">
        <span class="cr-n">${i + 1}</span>
        <span class="cr-main"><span class="cr-top"><b>${esc(x.c)}</b><span><em>${fmtNum(pct(x.t, T), 1)}%</em><strong data-count="${x.t}">${eur0(x.t)}</strong></span></span>
        <span class="cr-track"><i class="${over ? 'over' : ''}" style="width:${(x.t / mx * 100).toFixed(2)}%"></i>${b ? `<u style="left:${Math.min(100, b / mx * 100).toFixed(2)}%" title="Budget ${esc(eur0(b))}"></u>` : ''}</span>
        <span class="cr-sub">${fmtNum(x.rows.length, 0)} righe · ${fmtNum(new Set(x.rows.map(prodKey)).size, 0)} articoli${b ? ' · budget ' + eur0(b) : ''}</span></span>
      </button>`;
    }).join('') || '<div class="empty">Nessun dato</div>';
    // indicatori automatici
    const act = list.filter(x => x.rows.length);
    const ins = [];
    if (act.length) {
      const avg = act.map(x => ({ c: x.c, v: x.t / x.rows.length })).sort((p, q) => q.v - p.v)[0];
      ins.push({ ic: 'up', t: `<b>${esc(avg.c)}</b> ha la spesa media per riga più alta`, v: eur(avg.v) });
      const zr = act.map(x => ({ c: x.c, n: x.rows.filter(r => !num(r.prezzo)).length })).sort((p, q) => q.n - p.n)[0];
      if (zr.n) ins.push({ ic: 'warn', t: `<b>${esc(zr.c)}</b> ha più righe senza prezzo`, v: fmtNum(zr.n, 0), go: zr.c });
      const big = rows.reduce((m, r) => tot(r) > tot(m) ? r : m, rows[0]);
      if (big) ins.push({ ic: 'top', t: `Voce più costosa: <b>${esc(String(big.descrizione).slice(0, 38))}</b> (${esc(big.centro)})`, v: eur0(tot(big)) });
      const bs = act.filter(x => budV(x.c)); const ov = bs.filter(x => x.t > budV(x.c));
      if (bs.length) ins.push({ ic: ov.length ? 'warn' : 'ok', t: ov.length ? `Budget superato in <b>${ov.map(x => esc(x.c)).join(', ')}</b>` : 'Tutti i centri entro il budget', v: `${bs.length - ov.length}/${bs.length}` });
    }
    const II = { up: '<path d="M4 17l6-6 4 4 6-7M14 8h6v6"/>', warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', top: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.8 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>' };
    K('ins', R).innerHTML = ins.length ? `<div class="cf-sub">Indicatori</div>` + ins.map((x, i) => `<div class="ci-row ${x.ic}"${x.go ? ` data-gozero="${esc(x.go)}"` : ''} style="--d:${600 + i * 90}ms"><span class="ci-ic"><svg viewBox="0 0 24 24">${II[x.ic]}</svg></span><span class="ci-t">${x.t}</span><b>${x.v}</b></div>`).join('') : '';
    if (anim) $$('.k-rank [data-count]', R).forEach(el => { el._v = 0; countTo(el, +el.dataset.count, eur0); });

    renderFocus(R, list, T, anim);
    if (opt.matrix) renderMatrix(R, rows, list, T, anim);
  }

  function selectCC(c, R) {
    if (c === selCC) return;
    selCC = c;
    $$('.k-map .cm-pin', R).forEach(p => p.classList.toggle('on', p.dataset.centro === c));
    $$('.k-rank .cr-row', R).forEach(p => p.classList.toggle('on', p.dataset.centro === c));
    const rows = rowsSoc(); const { T, list } = ccStats(rows);
    renderFocus(R, list, T, !reduced());
    if (!isDesk()) K('focus', R).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderFocus(R, list, T, anim) {
    const el = K('focus', R);
    const x = list.find(z => z.c === selCC);
    if (!x) { el.innerHTML = '<div class="empty">Nessun centro</div>'; return; }
    el.classList.remove('cf-in'); void el.offsetWidth; if (anim) el.classList.add('cf-in');
    const rows = x.rows, art = articoli(rows), n = rows.length;
    const cats = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => ({ k, v: sumT(v) })).sort((p, q) => q.v - p.v);
    const seg = cats.slice(0, 5); const rest = cats.slice(5).reduce((s, c) => s + c.v, 0);
    if (rest > 0) seg.push({ k: 'Altre categorie', v: rest, other: true });
    const b = budV(x.c), rank = list.indexOf(x) + 1;
    const zero = rows.filter(r => !num(r.prezzo)).length;
    const top = art.slice(0, 5), tmx = Math.max(1, ...top.map(a => a.tot));
    el.innerHTML = `
      <div class="cf-head">
        ${ccIc(x.c)}
        <div class="cf-t"><span class="label">Focus centro · ${rank}° per spesa</span><h3>${esc(x.c)}</h3></div>
        <span class="pct">${fmtNum(pct(x.t, T), 1)}%</span>
        <button class="btn sm" data-gomov="${esc(x.c)}">Vedi movimenti</button>
      </div>
      <div class="cf-grid">
        <div class="cf-col">
          <div class="cf-kpis">
            <div><span>Spesa ${ivaOn ? '(IVA incl.)' : '(IVA escl.)'}</span><b class="k-cftot">0 €</b></div>
            <div><span>Righe</span><b>${fmtNum(n, 0)}</b></div>
            <div><span>Articoli</span><b>${fmtNum(art.length, 0)}</b></div>
            <div><span>Media per riga</span><b>${eur(n ? x.t / n : 0)}</b></div>
          </div>
          ${b ? (() => { const p = Math.min(1, x.t / b), over = x.t > b; return `<div class="cf-gauge${over ? ' over' : ''}">
              <svg viewBox="0 0 200 112"><path class="g-tr" d="M16 100 A84 84 0 0 1 184 100" pathLength="100"/><path class="g-v" d="M16 100 A84 84 0 0 1 184 100" pathLength="100" style="--p:${(100 - p * 100).toFixed(1)}"/></svg>
              <div class="g-txt"><b>${fmtNum(x.t / b * 100, 0)}%</b><span>del budget ${eur0(b)}</span></div>
              <div class="g-st">${over ? 'Superato di ' + eur0(x.t - b) : 'Restano ' + eur0(b - x.t)}</div></div>`; })()
            : `<a class="cf-nobud" href="#impostazioni">Imposta un budget annuale per questo centro</a>`}
          ${zero ? `<div class="cf-warn" data-gozero="${esc(x.c)}"><svg viewBox="0 0 24 24"><path d="M12 3 2 20h20zM12 10v4M12 17h.01"/></svg>${zero} righe senza prezzo</div>` : ''}
        </div>
        <div class="cf-col cf-donut">
          <div class="dn-wrap"><svg viewBox="0 0 160 160" class="dn">${seg.map((s, i) => `<circle class="dn-s" cx="80" cy="80" r="62" data-v="${s.v}" style="stroke:${s.other ? 'var(--c-other)' : CAT_COL[i]}"/>`).join('')}</svg>
            <div class="dn-c"><b>${cats.length}</b><span>categorie</span></div></div>
          <ul class="dn-leg">${seg.map((s, i) => `<li><i style="background:${s.other ? 'var(--c-other)' : CAT_COL[i]}"></i><span>${esc(s.k)}</span><b>${eur0(s.v)}</b><em>${fmtNum(pct(s.v, x.t), 0)}%</em></li>`).join('')}</ul>
        </div>
        <div class="cf-col">
          <div class="cf-sub">Articoli con più spesa</div>
          <div class="cf-top">${top.map((a, i) => `<div class="ct-row" data-art="${esc(a.k)}" style="--d:${300 + i * 70}ms"><div class="ct-t"><span>${esc(a.desc)}</span><b>${eur0(a.tot)}</b></div><div class="ct-bar"><i style="width:${(a.tot / tmx * 100).toFixed(1)}%"></i></div></div>`).join('') || '<div class="empty">Nessun articolo</div>'}</div>
        </div>
      </div>`;
    countTo(K('cftot', el), x.t, eur0);
    // ciambella: segmenti con 2px di stacco, disegnati in sequenza
    const C = 2 * Math.PI * 62, gap = seg.length > 1 ? 2.5 : 0;
    const segs = $$('.dn-s', el), tot = seg.reduce((s, z) => s + z.v, 0) || 1;
    let acc = 0; const parts = seg.map(z => { const len = z.v / tot * C; const o = { start: acc, len }; acc += len; return o; });
    const draw = k => segs.forEach((c, i) => { const p = parts[i], vis = Math.max(0, Math.min(p.len - gap, k * C - p.start)); c.style.strokeDasharray = `${Math.max(0, vis)} ${C}`; c.style.strokeDashoffset = -p.start; });
    if (!anim) draw(1); else { draw(0); const t0 = performance.now(); const st = now => { const k = Math.min(1, (now - t0 - 150) / 900); const e = k < 0 ? 0 : 1 - Math.pow(1 - k, 3); draw(e); if (k < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); }
  }

  function renderMatrix(R, rows, list, T, anim) {
    const cs = list.filter(x => x.rows.length).map(x => x.c);
    const ks = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => [k, sumT(v)]).sort((p, q) => q[1] - p[1]).map(x => x[0]);
    const cell = {};
    rows.forEach(r => { const k = (r.categoria || 'Altro') + '|' + (r.centro || '—'); cell[k] = (cell[k] || 0) + tot(r); });
    const mxv = Math.max(1, ...Object.values(cell));
    const heat = v => !v ? 'h0' : v / mxv > .45 ? 'h3' : v / mxv > .15 ? 'h2' : v / mxv > .03 ? 'h1' : '';
    const byC = new Map(list.map(x => [x.c, x.t]));
    K('matrix', R).innerHTML = cs.length ? `<table class="mx${anim ? ' mx-anim' : ''}"><thead><tr><th>Categoria</th>${cs.map(c => `<th>${esc(c)}</th>`).join('')}<th>Totale</th></tr></thead><tbody>
      ${ks.map((k, r) => `<tr><td title="${esc(k)}">${esc(k)}</td>${cs.map((c, j) => { const v = cell[k + '|' + c] || 0; return `<td class="${heat(v)}" style="--d:${(r + j) * 35}ms">${v ? eur0(v) : '—'}</td>`; }).join('')}<td><b>${eur0(cs.reduce((s, c) => s + (cell[k + '|' + c] || 0), 0))}</b></td></tr>`).join('')}
      <tr class="tot"><td>Totale</td>${cs.map(c => `<td>${eur0(byC.get(c) || 0)}</td>`).join('')}<td>${eur0(T)}</td></tr></tbody></table>` : '<div class="empty">Nessun dato</div>';
  }

  // tooltip sulla mappa
  function mapTip(e) {
    const pin = e.target.closest('.cm-pin'), wrap = e.currentTarget;
    let tip = $('.cm-tip', wrap);
    if (!pin) { if (tip) tip.remove(); return; }
    const { T, list } = ccStats(rowsSoc()); const x = list.find(z => z.c === pin.dataset.centro); if (!x) return;
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip cm-tip'; wrap.appendChild(tip); }
    tip.innerHTML = `${esc(x.c)}<br><b>${eur(x.t)}</b> · ${fmtNum(pct(x.t, T), 1)}%`;
    const r = pin.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2 - w.left) + 'px'; tip.style.top = (r.top - w.top - 4) + 'px';
  }

  /* ================= ARTICOLI ================= */
  function articoli(rows) {
    const m = groupBy(rows, prodKey);
    return [...m].map(([k, v]) => {
      const prices = v.map(pu).filter(p => p > 0);
      const qty = v.reduce((s, r) => s + num(r.quantita), 0);
      const t = sumT(v);
      const min = prices.length ? Math.min(...prices) : 0, max = prices.length ? Math.max(...prices) : 0;
      const codes = [...new Set(v.map(r => String(r.codice || '').trim()).filter(Boolean))];
      const dc = {}; v.forEach(r => { const d = String(r.descrizione || '').trim().replace(/\s+/g, ' '); dc[d] = (dc[d] || 0) + 1; });
      const desc = Object.entries(dc).sort((p, q) => q[1] - p[1])[0][0];
      return { k, rows: v, desc, codes, codice: codes.length === 1 ? codes[0] : '', um: v[0].um || '', n: v.length, qty, tot: t, min, max, avg: qty ? t / qty : 0, var: min ? max / min - 1 : 0, centri: [...new Set(v.map(r => r.centro))] };
    }).sort((x, y) => y.tot - x.tot);
  }
  function renderArt() {
    $('#a-centro').innerHTML = `<option value="">Tutti i centri</option>` + centri().map(c => `<option${c === a.centro ? ' selected' : ''}>${esc(c)}</option>`).join('');
    const q = a.q.trim().toLowerCase();
    let list = articoli(rowsSoc().filter(r => !a.centro || r.centro === a.centro));
    const nVar = list.filter(x => x.var > 0.02).length;
    if (q) list = list.filter(x => `${x.desc} ${x.codes.join(' ')} ${x.rows.map(r => r.descrizione).join(' ')}`.toLowerCase().includes(q));
    if (a.sort === 'qty') list.sort((x, y) => y.qty - x.qty);
    if (a.sort === 'var') list.sort((x, y) => (y.var > 0.02) - (x.var > 0.02) || y.var - x.var);
    if (a.sort === 'n') list.sort((x, y) => y.n - x.n);
    sub(soc || '');
    $('#a-count').textContent = `${fmtNum(list.length, 0)} prodotti · ${eur0(list.reduce((s, x) => s + x.tot, 0))}`;
    $('#a-var').hidden = !nVar; $('#a-var').textContent = `${nVar} con prezzo variato`;
    const shown = list.slice(0, aLimit);
    const more = list.length > aLimit ? `<div class="more-row"><button class="btn sm" id="a-more">Mostra altri</button></div>` : '';
    const varChip = x => x.var > 0.02 ? `<span class="chip soon art-var">+${fmtNum(x.var * 100, 0)}%</span>` : '';
    if (!list.length) { $('#a-list').innerHTML = '<div class="card empty-state"><p class="muted">Nessun articolo.</p></div>'; return; }
    if (isDesk()) {
      $('#a-list').innerHTML = `<div class="card tbl-card"><table class="tbl"><thead><tr><th>Articolo</th><th class="r">Acquisti</th><th class="r">Q.tà</th><th class="r">Prezzo medio</th><th class="r">Min – Max</th><th class="r">Totale</th></tr></thead><tbody>${shown.map(x => `<tr data-art="${esc(x.k)}"><td><div class="tt"><b>${esc(x.desc)}</b><small>${[x.codes.length > 1 ? x.codes.length + ' codici (varianti)' : x.codice ? 'Cod. ' + x.codice : '', x.centri.join(', ')].filter(Boolean).map(esc).join(' · ')}</small></div></td><td class="num">${x.n}</td><td class="num">${qtyFmt(x.qty)} <span class="muted small">${esc(x.um)}</span></td><td class="num">${x.avg ? eurP(x.avg) : '—'}</td><td class="num">${x.min ? (x.var > 0.02 ? `${eurP(x.min)} – ${eurP(x.max)} ${varChip(x)}` : eurP(x.min)) : '<span class="chip soon">mancante</span>'}</td><td class="num amt">${eur(x.tot)}</td></tr>`).join('')}</tbody></table></div>${more}`;
    } else {
      $('#a-list').innerHTML = `<div class="day">${shown.map(x => `<div class="item" data-art="${esc(x.k)}"><span class="ic">${esc(String(x.n))}×</span><div class="main"><div class="t">${esc(x.desc)}</div><div class="s">${qtyFmt(x.qty)} ${esc(x.um)} · medio ${x.avg ? eurP(x.avg) : '—'} ${varChip(x)}</div></div><div class="amt">${eur0(x.tot)}</div></div>`).join('')}</div>${more}`;
    }
  }
  function openArt(k) {
    const x = articoli(rowsSoc()).find(z => z.k === k); if (!x) return;
    const byDate = (p, q) => (validD(q.data) ? q.data : '').localeCompare(validD(p.data) ? p.data : '');
    const rows = [...x.rows].sort(byDate);
    const pz = [...groupBy(x.rows, r => r.centro || '—')].map(([c, v]) => ({ c, v, q: v.reduce((s, r) => s + num(r.quantita), 0), t: sumT(v), last: v.map(r => validD(r.data) ? r.data : '').sort().pop() })).sort((p, q) => q.q - p.q);
    const mq = Math.max(1, ...pz.map(p => p.q));
    const codesH = x.codes.length > 1 ? `<div class="ad-codes">${x.codes.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : '';
    // cronologia: raggruppata per data
    const groups = [...groupBy(rows, r => validD(r.data) ? r.data : '')];
    openSheet(x.desc, `
      <div class="ad-kpis">
        <div><span>Spesa totale</span><b>${eur(x.tot)}</b></div>
        <div><span>Quantità</span><b>${qtyFmt(x.qty)} ${esc(x.um)}</b></div>
        <div><span>Prezzo medio</span><b>${x.avg ? eurP(x.avg) : '—'}</b></div>
        <div><span>Spedizioni</span><b>${x.n}</b></div>
      </div>
      ${x.var > 0.02 ? `<div class="ad-var">Prezzo variato: ${eurP(x.min)} → ${eurP(x.max)} <b>+${fmtNum(x.var * 100, 0)}%</b></div>` : ''}
      <div class="ad-sec"><span class="cf-sub">${x.codes.length > 1 ? x.codes.length + ' codici (taglie o varianti)' : x.codice ? 'Codice ' + esc(x.codice) : 'Senza codice'}</span>${codesH}</div>
      <div class="ad-sec"><span class="cf-sub">Piazzali</span>
        <div class="ad-pz">${pz.map(p => `<div class="ad-pr">${ccIc(p.c)}<div class="ad-pm"><div class="ad-pt"><b>${esc(p.c)}</b><span>${qtyFmt(p.q)} ${esc(x.um)} · ${eur0(p.t)}</span></div><div class="ct-bar"><i style="width:${(p.q / mq * 100).toFixed(1)}%"></i></div><small>${p.v.length} ${p.v.length === 1 ? 'spedizione' : 'spedizioni'}${p.last ? ' · ultima il ' + esc(shortDate(p.last)) : ''}</small></div></div>`).join('')}</div></div>
      <div class="ad-sec"><span class="cf-sub">Cronologia spedizioni</span>
        <div class="tl">${groups.map(([d, v]) => `<div class="tl-g"><div class="tl-d">${d ? esc(parseD(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })) : 'Senza data'}</div>
          ${v.map(r => `<div class="tl-i" data-id="${esc(r.id)}"><i></i><div class="tl-m"><div class="tl-t"><b>${esc(r.centro || '—')}</b><span>${eur(tot(r))}</span></div><div class="tl-s">${qtyFmt(r.quantita)} ${esc(r.um || '')} × ${num(r.prezzo) ? eurP(pu(r)) : '<span class="up">prezzo mancante</span>'}${r.ndoc ? ' · Doc. ' + esc(r.ndoc) : ''}${x.codes.length > 1 && r.codice ? ' · cod. ' + esc(r.codice) : ''}${r.fornitore ? ' · ' + esc(r.fornitore) : ''}</div></div></div>`).join('')}</div>`).join('')}</div></div>`,
      null, null, 'Modifica prodotto');
    $('#sheet-form').classList.add('wide');
    $('#sheet-ok').type = 'button'; $('#sheet-ok').onclick = () => { closeSheet(); setTimeout(() => formArt(k), 250); };
  }

  /* ================= IMPOSTAZIONI ================= */
  function renderSettings() {
    themeUI();
    sub('');
    const nd = db.movimenti.filter(r => !validD(r.data)).length;
    $('#s-conn').innerHTML = `
      <div><span>Modalità</span><strong>${isLocal() ? 'Solo su questo dispositivo' : 'Foglio Google'}</strong></div>
      <div><span>Movimenti</span><strong>${fmtNum(db.movimenti.length, 0)}</strong></div>
      <div><span>Senza data</span><strong>${fmtNum(nd, 0)}</strong></div>
      ${!isLocal() ? `<div><span>Versione script</span><strong>${esc(db.v || '—')}</strong></div>` : ''}`;
    $('#s-pull').hidden = isLocal();
    $('#s-ai-st').textContent = isLocal() ? 'Disponibile solo con il Foglio Google collegato.' : db.ai ? 'Chiave Gemini attiva. Puoi sostituirla incollandone una nuova.' : 'Incolla la chiave API di Google AI Studio (gratuita). Resta salvata nello script, non nel telefono.';
    $('#s-key').disabled = $('#s-key-go').disabled = isLocal();
    $('#s-classify').hidden = !aiReady();
    const bud = budget();
    $('#s-budget').innerHTML = centri().map(c => `<label class="f bud-row"><span>${esc(c)}</span><input type="text" inputmode="decimal" data-bud="${esc(c)}" value="${bud[c] ? esc(String(bud[c]).replace('.', ',')) : ''}" placeholder="Nessun budget"></label>`).join('');
    $('#s-cc').innerHTML = centri().map(c => `<span class="chip">${esc(c)}<button data-delcc="${esc(c)}" aria-label="Rimuovi">✕</button></span>`).join('');
    $('#s-cat').innerHTML = categorie().map(c => `<span class="chip">${esc(c)}<button data-delcat="${esc(c)}" aria-label="Rimuovi">✕</button></span>`).join('');
  }

  /* ---------- Import Excel ---------- */
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'lib-xlsx.min.js';
      s.onload = res; s.onerror = () => rej(new Error('Libreria Excel non caricata'));
      document.head.appendChild(s);
    });
  }
  function pickFile(accept) {
    return new Promise((res, rej) => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept;
      inp.onchange = () => inp.files[0] ? res(inp.files[0]) : rej(new Error('annullato'));
      inp.click();
    });
  }
  const nh = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const socOf = (v, att) => { const t = nh(v); if (t.startsWith('attrez')) return 'Attrezzati'; if (t.startsWith('soluz') || t === 'sv') return 'Soluzione Veicolare'; return att ? 'Attrezzati' : 'Soluzione Veicolare'; };
  function parseWorkbook(wb) {
    const out = [], now = new Date().toISOString();
    wb.SheetNames.forEach(name => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '' });
      if (/^(riepilogo|articoli|prodotti|info|istruzioni|categorie|elenchi)/i.test(name)) return;
      const hi = aoa.findIndex(r => r.some(c => nh(c) === 'descrizione'));
      if (hi < 0) return;
      const H = aoa[hi].map(h => /€|eur|\//i.test(String(h)) && /kg/i.test(String(h)) ? '~' + nh(h) : nh(h));
      const col = (...keys) => { for (const k of keys) { const i = H.indexOf(k); if (i >= 0) return i; } return -1; };
      const c = { cod: col('cod', 'codice', 'codart'), des: col('descrizione'), um: col('um'), q: col('quant', 'quantita', 'qta', 'qt'), pa: col('pacq', 'prezzoacquisto', 'costo'), pr: col('prezzo', 'prezzounit', 'prezzounitario'), ind: col('indirizzo', 'centro', 'centrodicosto', 'sede'), id: col('idnonmodificare', 'id'), soc: col('societa'), cat: col('categoria'), note: col('note'), doc: col('ndoc', 'documento', 'numdoc'), dt: col('data'), iva: col('imposte', 'iva'), forn: col('fornitore') };
      const isAtt = /attrezzat/i.test(name);
      aoa.slice(hi + 1).forEach(r => {
        const desc = String(r[c.des] ?? '').trim();
        if (!desc) return;
        if (c.note >= 0 && /^esempio/i.test(String(r[c.note] || '').trim())) return; // righe di esempio del modello
        if (/^totale$/i.test(desc)) return; // riga dei totali dell'export
        let d = c.dt >= 0 ? r[c.dt] : '';
        if (d instanceof Date) d = ymd(d);
        else if (typeof d === 'number' && d > 20000) d = ymd(new Date(Math.round((d - 25569) * 864e5)));
        else { const m = String(d).trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); d = m ? `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad(m[2])}-${pad(m[1])}` : validD(d) ? String(d).slice(0, 10) : ''; }
        const price = c.pa >= 0 && r[c.pa] !== '' ? num(r[c.pa]) : c.pr >= 0 ? num(r[c.pr]) : 0;
        const centro = (c.ind >= 0 ? String(r[c.ind] || '').trim().toUpperCase() : '') || (isAtt ? 'ATTREZZATI' : 'DA ASSEGNARE');
        out.push({
          id: (c.id >= 0 && String(r[c.id] ?? '').trim()) || uid() + out.length.toString(36), _hasId: c.id >= 0 && !!String(r[c.id] ?? '').trim(), data: d, ndoc: c.doc >= 0 ? String(r[c.doc] ?? '') : '', codice: c.cod >= 0 ? String(r[c.cod] ?? '').trim() : '',
          descrizione: desc.replace(/\s+/g, ' '), um: c.um >= 0 ? String(r[c.um] || '').trim().toUpperCase() || 'PZ' : 'PZ',
          quantita: num(r[c.q]), prezzo: price, iva: (() => { if (c.iva < 0 || r[c.iva] === '' || r[c.iva] == null) return 0.22; const v = num(r[c.iva]); return v > 1 ? v / 100 : v; })(),
          centro, societa: socOf(c.soc >= 0 ? r[c.soc] : '', isAtt || centro === 'ATTREZZATI'), categoria: (c.cat >= 0 && String(r[c.cat] || '').trim()) || autoCat(desc), fornitore: c.forn >= 0 ? String(r[c.forn] || '').trim() : '', note: c.note >= 0 ? String(r[c.note] || '').trim() : '', creato: now
        });
      });
    });
    return out;
  }
  async function importExcel(replace) {
    let file;
    try { file = await pickFile('.xlsx,.xls,.xlsm,.csv'); } catch { return; }
    try {
      busy('Leggo il file…');
      await loadXlsx();
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const rows = parseWorkbook(wb);
      busy();
      if (!rows.length) return toast('Nessuna riga trovata nel file');
      const T = sumT(rows);
      const nc = new Set(rows.map(r => r.centro)).size;
      if (!replace) return reviewImport(rows);
      if (!confirm(`${rows.length} righe · ${eur(T)} · ${nc} centri.\nSOSTITUIRE tutti i movimenti attuali?`)) return;
      const cc = centri(); const nuovi = [...new Set(rows.map(r => r.centro))].filter(c => !cc.includes(c));
      if (replace) {
        if (!isLocal()) {
          busy('Salvo sul Foglio Google…');
          queue = queue.filter(o => o.sheet !== 'Movimenti');
          await api('replaceAll', { sheet: 'Movimenti', rows });
        }
        rows.forEach(r => delete r._hasId); db.movimenti = rows; save(); render();
      } else {
        write(rows.map(row => ({ action: 'upsert', sheet: 'Movimenti', row })));
      }
      if (nuovi.length) setConfig('centri', [...cc, ...nuovi]);
      toast(`${rows.length} righe importate`);
    } catch (e) { toast(e.message); } finally { busy(); }
  }
  /* ---------- Importa aggiornamenti: confronto prima di salvare ---------- */
  const FIELDS = ['data', 'ndoc', 'codice', 'descrizione', 'um', 'quantita', 'prezzo', 'iva', 'centro', 'societa', 'categoria', 'fornitore', 'note'];
  const FLBL = { data: 'data', ndoc: 'n. doc.', codice: 'codice', descrizione: 'descrizione', um: 'UM', quantita: 'quantità', prezzo: 'prezzo', centro: 'centro', societa: 'società', categoria: 'categoria', fornitore: 'fornitore', note: 'note', iva: 'IVA' };
  const same = (f, a, b) => f === 'iva' ? Math.abs(ivaRate({ iva: a }) - ivaRate({ iva: b })) < 1e-6 : (f === 'quantita' || f === 'prezzo') ? Math.abs(num(a) - num(b)) < 1e-6 : String(a ?? '').trim() === String(b ?? '').trim();
  function diffImport(rows) {
    const byId = new Map(db.movimenti.map(r => [String(r.id), r]));
    const lastPrice = new Map(); // ultimo prezzo noto per articolo
    [...db.movimenti].sort((a, b) => String(a.data || '').localeCompare(String(b.data || ''))).forEach(r => { if (num(r.prezzo) > 0) lastPrice.set(prodKey(r), num(r.prezzo)); });
    const known = new Set(db.movimenti.map(prodKey));
    const res = { prezzoIns: [], prezzoVar: [], altre: [], nuoviProd: [], nuoveRighe: [], invariate: 0 };
    rows.forEach(r => {
      const old = r._hasId ? byId.get(String(r.id)) : null;
      const row = { ...r }; delete row._hasId;
      if (old) {
        const row2 = { ...old, ...Object.fromEntries(FIELDS.map(f => [f, row[f]])) };
        const ch = FIELDS.filter(f => !same(f, old[f], row[f]));
        if (!ch.length) { res.invariate++; return; }
        const it = { row: row2, old, ch };
        if (ch.includes('prezzo')) (num(old.prezzo) > 0 ? res.prezzoVar : res.prezzoIns).push(it);
        else res.altre.push(it);
      } else {
        if (r._hasId) row.id = uid() + Math.random().toString(36).slice(2, 5); // ID non trovato: riga nuova
        const k = prodKey(row), lp = lastPrice.get(k);
        const it = { row, lp, pv: lp && num(row.prezzo) > 0 && Math.abs(num(row.prezzo) / lp - 1) > .005 };
        (known.has(k) ? res.nuoveRighe : res.nuoviProd).push(it);
      }
    });
    return res;
  }
  function reviewImport(rows) { return netMode(() => reviewImport0(rows)); }
  function reviewImport0(rows) {
    const d = diffImport(rows);
    const nTot = d.prezzoIns.length + d.prezzoVar.length + d.altre.length + d.nuoviProd.length + d.nuoveRighe.length;
    if (!nTot) return toast(`Nessuna differenza: ${d.invariate} righe già aggiornate`);
    const nVar = d.prezzoVar.length + d.nuoveRighe.filter(x => x.pv).length;
    const all = [];
    const pctTxt = (a, b) => { const p = (b / a - 1) * 100; return `<em class="${p > 0 ? 'up' : 'down'}">${p > 0 ? '+' : ''}${fmtNum(p, 1)}%</em>`; };
    const sec = (key, title, cls, items, line) => {
      if (!items.length) return '';
      const rowsH = items.map(it => { const i = all.push(it) - 1; return `<label class="rv-row"><input type="checkbox" class="cb" name="u${i}" checked><span class="rv-m"><span class="t">${esc(it.row.descrizione)}</span><span class="s">${line(it)}</span></span></label>`; }).join('');
      return `<div class="rv-sec ${cls}"><div class="rv-h"><b>${title}</b><span class="chip ${cls}">${items.length}</span><button type="button" class="link rv-tg" data-tg="${key}">Deseleziona</button></div><div class="rv-list" data-sec="${key}">${rowsH}</div></div>`;
    };
    const cc = it => esc(it.row.centro || '—');
    const html = `
      <div class="rv-kpis">
        <div class="${nVar ? 'warn' : ''}"><b>${nVar}</b><span>prezzi variati</span></div>
        <div><b>${d.prezzoIns.length}</b><span>prezzi inseriti</span></div>
        <div class="${d.nuoviProd.length ? 'new' : ''}"><b>${d.nuoviProd.length}</b><span>prodotti nuovi</span></div>
        <div><b>${d.nuoveRighe.length + d.altre.length}</b><span>altre righe</span></div>
      </div>
      ${d.invariate ? `<div class="muted small rv-same">${d.invariate} righe del file sono uguali a quelle già salvate e vengono ignorate.</div>` : ''}
      ${sec('pv', 'Prezzi variati', 'late', d.prezzoVar, it => `${cc(it)} · ${eurP(it.old.prezzo)} → <b>${eurP(it.row.prezzo)}</b> ${pctTxt(num(it.old.prezzo), num(it.row.prezzo))}`)}
      ${sec('np', 'Prodotti nuovi', 'paid', d.nuoviProd, it => `${cc(it)} · ${qtyFmt(it.row.quantita)} ${esc(it.row.um || '')} × ${num(it.row.prezzo) ? eurP(it.row.prezzo) : 'senza prezzo'} · mai acquistato prima`)}
      ${sec('pi', 'Prezzi inseriti', '', d.prezzoIns, it => `${cc(it)} · ${qtyFmt(it.row.quantita)} × <b>${eurP(it.row.prezzo)}</b> = ${eur(tot(it.row))}`)}
      ${sec('nr', 'Nuove righe di articoli già presenti', '', d.nuoveRighe, it => `${cc(it)} · ${qtyFmt(it.row.quantita)} × ${num(it.row.prezzo) ? eurP(it.row.prezzo) : 'senza prezzo'}${it.pv ? ` · <span class="rv-pv">ultimo prezzo ${eurP(it.lp)} ${pctTxt(it.lp, num(it.row.prezzo))}</span>` : ''}`)}
      ${sec('al', 'Altre modifiche', '', d.altre, it => `${cc(it)} · cambia ${it.ch.map(f => FLBL[f]).join(', ')}`)}`;
    openSheet('Controlla prima di importare', html, fd => {
      const pick = all.filter((_, i) => fd.get('u' + i));
      if (!pick.length) return toast('Nessuna riga selezionata');
      const cc0 = centri(); const nuoviC = [...new Set(pick.map(it => it.row.centro))].filter(c => c && !cc0.includes(c));
      write(pick.map(it => ({ action: 'upsert', sheet: 'Movimenti', row: it.row })));
      if (nuoviC.length) setConfig('centri', [...cc0, ...nuoviC]);
      const nP = pick.filter(it => it.old && it.ch.includes('prezzo')).length, nN = pick.filter(it => !it.old).length;
      toast(`Importato: ${nP} prezzi aggiornati, ${nN} righe nuove`);
      return true;
    }, null, `Applica ${nTot} modifiche`);
    $('#sheet-form').classList.add('wide');
    const upd = () => { const n = $$('#sheet-body .rv-row input:checked').length; $('#sheet-ok').textContent = `Applica ${n} modifich${n === 1 ? 'a' : 'e'}`; };
    $('#sheet-body').addEventListener('change', upd);
    $$('#sheet-body .rv-tg').forEach(b => b.onclick = () => { const L = $(`[data-sec="${b.dataset.tg}"]`), on = !$$('input', L).every(x => !x.checked) ; $$('input', L).forEach(x => (x.checked = !on)); b.textContent = on ? 'Seleziona' : 'Deseleziona'; upd(); });
  }

  async function exportXlsx(rows, tag) { const p = ivaOn; ivaOn = false; try { return await exportXlsx0(rows, tag); } finally { ivaOn = p; } }
  async function exportXlsx0(rows, tag) {
    if (!rows.length) return toast('Nessun movimento da esportare');
    try {
      busy('Preparo il file Excel…');
      await loadXlsx();
      const U = XLSX.utils, wb = U.book_new();
      const EUR = '#,##0.00 "€"', EUR3 = '#,##0.000 "€"', QTY = '#,##0.##';
      const sorted = rows.slice().sort((a, b) => (centri().indexOf(a.centro) - centri().indexOf(b.centro)) || String(b.data || '').localeCompare(String(a.data || '')));
      const n = sorted.length, last = n + 1;
      const fit = (ws, w) => (ws['!cols'] = w.map(x => ({ wch: x })));
      const setF = (ws, ref, f, v, z) => (ws[ref] = { t: 'n', f, v, z });

      // 1 · Movimenti (stesso formato del modello di importazione)
      const H = ['Data', 'N. Doc.', 'Codice', 'Descrizione', 'UM', 'Quantità', 'Prezzo unit.', 'Totale', 'IVA %', 'Totale + IVA', 'Centro', 'Società', 'Categoria', 'Fornitore', 'Note', 'ID (non modificare)'];
      const ws = U.aoa_to_sheet([H, ...sorted.map(r => [validD(r.data) ? parseD(r.data) : '', r.ndoc || '', r.codice || '', r.descrizione || '', r.um || '', num(r.quantita), num(r.prezzo), null, ivaRate(r), null, r.centro || '', r.societa || '', r.categoria || '', r.fornitore || '', r.note || '', String(r.id)])], { cellDates: true });
      sorted.forEach((r, i) => {
        const R = i + 2;
        if (ws['A' + R] && ws['A' + R].t === 'd') ws['A' + R].z = 'dd/mm/yyyy';
        ws['F' + R].z = QTY; ws['G' + R].z = EUR3;
        setF(ws, 'H' + R, `F${R}*G${R}`, tot(r), EUR);
        ws['I' + R].z = '0%'; setF(ws, 'J' + R, `H${R}*(1+I${R})`, r2(tot(r) * (1 + ivaRate(r))), EUR);
      });
      U.sheet_add_aoa(ws, [['', '', '', 'TOTALE', '', null, '', null, '', null]], { origin: 'A' + (last + 1) });
      setF(ws, 'F' + (last + 1), `SUBTOTAL(9,F2:F${last})`, sorted.reduce((s, r) => s + num(r.quantita), 0), QTY);
      setF(ws, 'H' + (last + 1), `SUBTOTAL(9,H2:H${last})`, sumT(sorted), EUR);
      setF(ws, 'J' + (last + 1), `SUBTOTAL(9,J2:J${last})`, sumI(sorted), EUR);
      ws['!autofilter'] = { ref: `A1:P${last}` };
      fit(ws, [11, 9, 9, 56, 6, 10, 13, 14, 7, 14, 15, 19, 26, 18, 24, 18]);
      U.book_append_sheet(wb, ws, 'Movimenti');

      // 2 · Riepilogo centri (formule collegate ai movimenti)
      const T = sumT(sorted), bud = budget();
      const cs = [...new Set(sorted.map(r => r.centro || ''))].sort((a, b) => sumT(sorted.filter(r => r.centro === b)) - sumT(sorted.filter(r => r.centro === a)));
      const wr = U.aoa_to_sheet([['Centro', 'Righe', 'Prodotti', 'Totale (IVA esclusa)', '% sul totale', 'Budget annuale', 'Scostamento', 'Righe senza prezzo', 'Totale + IVA']]);
      cs.forEach((c, i) => {
        const R = i + 2, rr = sorted.filter(r => r.centro === c), t = sumT(rr), b = num(bud[c]);
        U.sheet_add_aoa(wr, [[c]], { origin: 'A' + R });
        setF(wr, 'B' + R, `COUNTIF(Movimenti!$K$2:$K$${last},A${R})`, rr.length, '#,##0');
        wr['C' + R] = { t: 'n', v: new Set(rr.map(prodKey)).size, z: '#,##0' };
        setF(wr, 'D' + R, `SUMIF(Movimenti!$K$2:$K$${last},A${R},Movimenti!$H$2:$H$${last})`, t, EUR);
        setF(wr, 'E' + R, `IF($D$${cs.length + 2}=0,0,D${R}/$D$${cs.length + 2})`, T ? t / T : 0, '0.0%');
        if (b) { wr['F' + R] = { t: 'n', v: b, z: EUR }; setF(wr, 'G' + R, `F${R}-D${R}`, b - t, EUR); }
        setF(wr, 'H' + R, `COUNTIFS(Movimenti!$K$2:$K$${last},A${R},Movimenti!$G$2:$G$${last},0)`, rr.filter(r => !num(r.prezzo)).length, '#,##0');
        setF(wr, 'I' + R, `SUMIF(Movimenti!$K$2:$K$${last},A${R},Movimenti!$J$2:$J$${last})`, sumI(rr), EUR);
      });
      const TR = cs.length + 2;
      U.sheet_add_aoa(wr, [['TOTALE']], { origin: 'A' + TR });
      setF(wr, 'B' + TR, `SUM(B2:B${TR - 1})`, n, '#,##0');
      wr['C' + TR] = { t: 'n', v: new Set(sorted.map(prodKey)).size, z: '#,##0' };
      setF(wr, 'D' + TR, `SUM(D2:D${TR - 1})`, T, EUR);
      setF(wr, 'E' + TR, `SUM(E2:E${TR - 1})`, 1, '0.0%');
      setF(wr, 'H' + TR, `SUM(H2:H${TR - 1})`, sorted.filter(r => !num(r.prezzo)).length, '#,##0');
      setF(wr, 'I' + TR, `SUM(I2:I${TR - 1})`, sumI(sorted), EUR);
      wr['!ref'] = `A1:I${TR}`;
      fit(wr, [18, 9, 10, 19, 12, 15, 15, 17, 15]);
      U.book_append_sheet(wb, wr, 'Riepilogo centri');

      // 3 · Categorie x Centri
      const ks = [...new Set(sorted.map(r => r.categoria || 'Altro'))].sort((a, b) => sumT(sorted.filter(r => (r.categoria || 'Altro') === b)) - sumT(sorted.filter(r => (r.categoria || 'Altro') === a)));
      const col = i => U.encode_col(i);
      const wm = U.aoa_to_sheet([['Categoria', ...cs, 'Totale']]);
      ks.forEach((k, i) => {
        const R = i + 2; U.sheet_add_aoa(wm, [[k]], { origin: 'A' + R });
        cs.forEach((c, j) => { const v = sumT(sorted.filter(r => r.centro === c && (r.categoria || 'Altro') === k)); setF(wm, col(j + 1) + R, `SUMIFS(Movimenti!$H$2:$H$${last},Movimenti!$M$2:$M$${last},$A${R},Movimenti!$K$2:$K$${last},${col(j + 1)}$1)`, v, EUR); });
        setF(wm, col(cs.length + 1) + R, `SUM(B${R}:${col(cs.length)}${R})`, sumT(sorted.filter(r => (r.categoria || 'Altro') === k)), EUR);
      });
      const MR = ks.length + 2; U.sheet_add_aoa(wm, [['TOTALE']], { origin: 'A' + MR });
      cs.concat(['']).forEach((c, j) => { const L = col(j + 1); setF(wm, L + MR, `SUM(${L}2:${L}${MR - 1})`, c ? sumT(sorted.filter(r => r.centro === c)) : T, EUR); });
      wm['!ref'] = `A1:${col(cs.length + 1)}${MR}`;
      fit(wm, [28, ...cs.map(() => 15), 15]);
      U.book_append_sheet(wb, wm, 'Categorie x Centri');

      // 4 · Articoli
      const arts = articoli(sorted);
      const wa = U.aoa_to_sheet([['Codici', 'Prodotto', 'Spedizioni', 'Q.tà totale', 'Prezzo min', 'Prezzo max', 'Prezzo medio', 'Variazione', 'Spesa totale', 'Centri'],
        ...arts.map(x => [x.codes.join(', '), x.desc, x.n, x.qty, x.min || null, x.max || null, x.avg || null, x.var || null, x.tot, x.centri.join(', ')])]);
      arts.forEach((x, i) => { const R = i + 2; ['E', 'F', 'G'].forEach(L => wa[L + R] && (wa[L + R].z = EUR3)); if (wa['H' + R]) wa['H' + R].z = '0%'; wa['I' + R].z = EUR; wa['D' + R].z = QTY; });
      wa['!autofilter'] = { ref: `A1:J${arts.length + 1}` };
      fit(wa, [9, 56, 9, 11, 12, 12, 13, 10, 14, 34]);
      U.book_append_sheet(wb, wa, 'Prodotti');

      // 5 · Info
      const wi = U.aoa_to_sheet([['Centro di Costo — Soluzione Veicolare'], [], ['Esportato il', new Date()], ['Società', soc || 'Tutte'], ['Movimenti', n], ['Spesa totale (IVA esclusa)', T], ['Spesa totale (IVA inclusa)', sumI(sorted)], [], ['I totali dei fogli «Riepilogo centri» e «Categorie x Centri» sono formule collegate al foglio «Movimenti».'], ['Il foglio «Movimenti» ha lo stesso formato del modello: correggi prezzi o aggiungi righe e reimporta con «Importa aggiornamenti».'], ['La colonna «ID» collega ogni riga al movimento nell\'app: non modificarla. Le righe nuove vanno lasciate con ID vuoto.']], { cellDates: true });
      wi.B3.z = 'dd/mm/yyyy hh:mm'; wi.B6.z = EUR; wi.B7.z = EUR; fit(wi, [16, 22]);
      U.book_append_sheet(wb, wi, 'Info');

      XLSX.writeFile(wb, `centro-di-costo-${tag}-${today()}.xlsx`, { compression: true });
      toast('File Excel scaricato');
    } catch (e) { toast(e.message); } finally { busy(); }
  }
  function exportCsv() {
    const H = ['data', 'ndoc', 'codice', 'descrizione', 'um', 'quantita', 'prezzo', 'totale', 'centro', 'societa', 'categoria', 'fornitore', 'note'];
    const cell = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [H.join(';'), ...db.movimenti.map(r => H.map(h => h === 'totale' ? String(tot(r)).replace('.', ',') : (h === 'quantita' || h === 'prezzo') ? String(num(r[h])).replace('.', ',') : cell(r[h])).join(';'))];
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `centro-di-costo-${today()}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  }
  async function classifyAI() {
    const altro = db.movimenti.filter(r => (r.categoria || 'Altro') === 'Altro');
    if (!altro.length) return toast('Nessuna voce in «Altro»');
    const descs = [...new Set(altro.map(r => String(r.descrizione).trim()))].slice(0, 200);
    try {
      busy(`Classifico ${descs.length} voci…`);
      const res = await aiCall('classify', { items: descs.map((d, i) => ({ i, d })) });
      const valid = new Set(categorie());
      const map = new Map();
      (Array.isArray(res) ? res : []).forEach(x => { if (descs[x.i] != null && valid.has(x.c) && x.c !== 'Altro') map.set(descs[x.i], x.c); });
      const ops = altro.filter(r => map.has(String(r.descrizione).trim())).map(r => ({ action: 'upsert', sheet: 'Movimenti', row: { ...r, categoria: map.get(String(r.descrizione).trim()) } }));
      if (ops.length) write(ops);
      toast(`${ops.length} voci classificate`);
    } catch (e) { toast(e.message); } finally { busy(); }
  }

  /* ================= Sheet (form) ================= */
  let onSubmit = null, onDelete = null;
  function openSheet(title, html, submit, del, okLabel = 'Salva') {
    $('#sheet-title').textContent = title;
    $('#sheet-body').innerHTML = html;
    const ok = $('#sheet-ok'); ok.textContent = okLabel; ok.type = 'submit'; ok.onclick = null; ok.hidden = false;
    $('#sheet-del').hidden = !del;
    $('#sheet-form').classList.remove('wide');
    onSubmit = submit; onDelete = del;
    clearTimeout(closeSheet._t);
    $('#sheet').classList.remove('closing');
    $('#sheet').hidden = false;
    document.body.style.overflow = 'hidden';
    const first = $('#sheet-body [data-focus]');
    if (first && matchMedia('(min-width: 640px)').matches) setTimeout(() => first.focus(), 50);
  }
  function closeSheet() {
    const sh = $('#sheet');
    onSubmit = onDelete = null; document.body.style.overflow = '';
    if (sh.hidden) return;
    if (reduced()) { sh.hidden = true; return; }
    sh.classList.add('closing');
    clearTimeout(closeSheet._t);
    closeSheet._t = setTimeout(() => { sh.hidden = true; sh.classList.remove('closing'); }, 230);
  }
  const opt = (list, sel) => { const l = [...list]; if (sel && !l.includes(sel)) l.push(sel); return l.map(v => `<option${v === sel ? ' selected' : ''}>${esc(v)}</option>`).join(''); };
  const fmtIn = v => (v === '' || v == null) ? '' : String(v).replace('.', ',');

  function formMov(r) {
    const isNew = !r;
    r = r || { id: uid(), data: today(), ndoc: '', codice: '', descrizione: '', um: 'PZ', quantita: 1, prezzo: '', iva: 0.22, centro: LS.get('cdc_lastcc', centri()[0]), societa: LS.get('cdc_lastsoc', 'Soluzione Veicolare'), categoria: '', fornitore: '', note: '' };
    openSheet(isNew ? 'Nuovo movimento' : 'Modifica movimento', `
      ${isNew && aiReady() ? `<div class="ai-row" style="grid-template-columns:1fr"><button type="button" class="ai-btn" id="scan-btn">${IC.camera}Scansiona DDT o fattura</button></div>` : ''}
      <label class="f"><span>Descrizione</span><input name="descrizione" required data-focus value="${esc(r.descrizione)}" placeholder="Es. Guanti nitrile L"></label>
      <div class="f-row">
        <label class="f"><span>Quantità</span><input name="quantita" inputmode="decimal" value="${esc(fmtIn(r.quantita))}"></label>
        <label class="f"><span>Prezzo unit. € (no IVA)</span><input name="prezzo" inputmode="decimal" value="${esc(fmtIn(r.prezzo))}" placeholder="0,00"></label>
      </div>
      <div class="iva-box">
        <label class="f"><span>Aliquota IVA</span><select name="iva">${[0.22, 0.10, 0.04, 0].map(v => `<option value="${v}"${Math.abs(ivaRate(r) - v) < 1e-6 ? ' selected' : ''}>${v ? fmtNum(v * 100, 0) + '%' : 'Esente'}</option>`).join('')}</select></label>
        <div class="iva-sum" id="fm-sum"></div>
      </div>
      <div class="f-row">
        <label class="f"><span>Centro di costo</span><select name="centro">${opt(centri(), r.centro)}</select></label>
        <label class="f"><span>Categoria</span><select name="categoria">${opt(categorie(), r.categoria || autoCat(r.descrizione))}</select></label>
      </div>
      <div class="f-row">
        <label class="f"><span>Società</span><select name="societa">${opt(SOC, r.societa || 'Soluzione Veicolare')}</select></label>
        <label class="f"><span>Data</span><input name="data" type="date" value="${esc(validD(r.data) ? r.data : '')}"></label>
      </div>
      <div class="f-row">
        <label class="f"><span>Codice articolo</span><input name="codice" value="${esc(r.codice)}"></label>
        <label class="f"><span>Unità</span><select name="um">${opt(UM, r.um || 'PZ')}</select></label>
      </div>
      <div class="f-row">
        <label class="f"><span>N. documento</span><input name="ndoc" value="${esc(r.ndoc)}"></label>
        <label class="f"><span>Fornitore</span><input name="fornitore" value="${esc(r.fornitore)}"></label>
      </div>
      <label class="f"><span>Note</span><input name="note" value="${esc(r.note)}"></label>`,
      fd => {
        const row = { ...r, ...Object.fromEntries(fd), quantita: num(fd.get('quantita')), prezzo: num(fd.get('prezzo')), iva: Number(fd.get('iva')) };
        if (!row.descrizione.trim()) return toast('Inserisci la descrizione');
        if (isNew) row.creato = new Date().toISOString();
        LS.set('cdc_lastcc', row.centro); LS.set('cdc_lastsoc', row.societa);
        write([{ action: 'upsert', sheet: 'Movimenti', row }]);
        toast(isNew ? 'Movimento aggiunto' : 'Movimento salvato');
        return true;
      },
      isNew ? null : () => { if (!confirm('Eliminare questo movimento?')) return; write([{ action: 'delete', sheet: 'Movimenti', id: r.id }]); toast('Movimento eliminato'); return true; });
    const form = $('#sheet-form');
    let catTouched = !isNew;
    form.categoria.addEventListener('change', () => (catTouched = true));
    const upd = () => { const n = num(form.quantita.value) * num(form.prezzo.value), iv = n * Number(form.iva.value);
      $('#fm-sum').innerHTML = `<div><span>Imponibile</span><b>${eur(n)}</b></div><div><span>IVA ${Number(form.iva.value) ? fmtNum(Number(form.iva.value) * 100, 0) + '%' : 'esente'}</span><b>${eur(iv)}</b></div><div class="t"><span>Totale</span><b>${eur(n + iv)}</b></div>`; };
    upd(); form.quantita.addEventListener('input', upd); form.prezzo.addEventListener('input', upd); form.iva.addEventListener('change', upd);
    form.descrizione.addEventListener('input', () => { if (!catTouched) form.categoria.value = autoCat(form.descrizione.value); });
    form.centro.addEventListener('change', () => { if (form.centro.value === 'ATTREZZATI') form.societa.value = 'Attrezzati'; });
    const sb = $('#scan-btn'); if (sb) sb.onclick = scanDoc;
  }

  /* ---------- Scansione documento con IA ---------- */
  function pickImage() {
    return new Promise((resolve, reject) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
      inp.onchange = () => {
        const file = inp.files && inp.files[0];
        if (!file) return reject(new Error('annullato'));
        const img = new Image();
        img.onload = () => {
          const max = 2000, k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(img.src);
          resolve({ image: c.toDataURL('image/jpeg', 0.85).split(',')[1], mime: 'image/jpeg' });
        };
        img.onerror = () => reject(new Error('Immagine non leggibile'));
        img.src = URL.createObjectURL(file);
      };
      inp.click();
    });
  }
  async function scanDoc() {
    let img;
    try { img = await pickImage(); } catch (e) { if (e.message !== 'annullato') toast(e.message); return; }
    try {
      busy('Leggo il documento…');
      const res = await aiCall('scan', img);
      busy();
      const righe = (res.righe || []).filter(x => x && x.descrizione).map(x => ({ ...x, quantita: num(x.quantita) || 1, prezzo: num(x.prezzo) }));
      if (!righe.length) return toast('Nessuna riga riconosciuta');
      openScan(res, righe);
    } catch (e) { busy(); toast(e.message); }
  }
  function openScan(res, righe) {
    const cc = LS.get('cdc_lastcc', centri()[0]);
    openSheet('Righe lette dal documento', `
      <div class="ai-note">${IC.spark}${righe.length} righe riconosciute: controlla prima di salvare</div>
      <div class="f-row">
        <label class="f"><span>Centro di costo</span><select name="centro">${opt(centri(), cc)}</select></label>
        <label class="f"><span>Società</span><select name="societa">${opt(SOC, cc === 'ATTREZZATI' ? 'Attrezzati' : 'Soluzione Veicolare')}</select></label>
      </div>
      <div class="f-row">
        <label class="f"><span>Fornitore</span><input name="fornitore" value="${esc(res.fornitore || '')}"></label>
        <label class="f"><span>Data</span><input name="data" type="date" value="${esc(validD(res.data) ? res.data : today())}"></label>
      </div>
      <label class="f"><span>N. documento</span><input name="ndoc" value="${esc(res.ndoc || '')}"></label>
      <div class="scan-list">${righe.map((x, i) => `<label class="scan-row"><input type="checkbox" name="r${i}" checked><div style="min-width:0"><div class="t">${esc(x.descrizione)}</div><div class="s">${qtyFmt(x.quantita)} ${esc(x.um || 'PZ')} × ${eurP(x.prezzo)} · ${esc(autoCat(x.descrizione))}</div></div><span class="amt">${eur(r2(x.quantita * x.prezzo))}</span></label>`).join('')}</div>
      <div class="tot-line"><span class="muted">Totale righe</span><b>${eur(righe.reduce((s, x) => s + r2(x.quantita * x.prezzo), 0))}</b></div>`,
      fd => {
        const now = new Date().toISOString();
        const ops = righe.filter((x, i) => fd.get('r' + i)).map(x => ({ action: 'upsert', sheet: 'Movimenti', row: {
          id: uid() + Math.random().toString(36).slice(2, 4), data: fd.get('data'), ndoc: fd.get('ndoc'), codice: String(x.codice || ''), descrizione: String(x.descrizione).trim(), um: String(x.um || 'PZ').toUpperCase(),
          quantita: x.quantita, prezzo: x.prezzo, iva: 0.22, centro: fd.get('centro'), societa: fd.get('societa'), categoria: autoCat(x.descrizione), fornitore: fd.get('fornitore'), note: '', creato: now } }));
        if (!ops.length) return toast('Nessuna riga selezionata');
        LS.set('cdc_lastcc', fd.get('centro'));
        write(ops); toast(`${ops.length} righe aggiunte`);
        return true;
      }, null, 'Aggiungi righe');
  }

  /* ---------- Modifica veloce in tabella ---------- */
  function inlineEdit(td) {
    const id = td.closest('tr').dataset.id, f0 = td.dataset.ed;
    const r = db.movimenti.find(x => String(x.id) === id); if (!r) return;
    let el;
    if (f0 === 'centro' || f0 === 'categoria') {
      el = document.createElement('select');
      el.innerHTML = opt(f0 === 'centro' ? centri() : categorie(), r[f0] || (f0 === 'categoria' ? 'Altro' : ''));
    } else {
      el = document.createElement('input');
      el.inputMode = 'decimal'; const sv = f0 === 'prezzo' ? r2(num(r[f0]) * mul(r) * 1000) / 1000 : num(r[f0]); el.value = sv ? String(sv).replace('.', ',') : ''; el.placeholder = '0,00';
    }
    el.className = 'cell-in';
    td.innerHTML = ''; td.appendChild(el); el.focus(); if (el.select) el.select();
    let done = false;
    const commit = keep => {
      if (done) return; done = true;
      if (!keep) return renderMov();
      const v = f0 === 'centro' || f0 === 'categoria' ? el.value : f0 === 'prezzo' ? Math.round(num(el.value) / mul(r) * 1e6) / 1e6 : num(el.value);
      if (String(v) === String(f0 === 'centro' || f0 === 'categoria' ? r[f0] : num(r[f0]))) return renderMov();
      const row = { ...r, [f0]: v };
      if (f0 === 'centro' && v === 'ATTREZZATI') row.societa = 'Attrezzati';
      write([{ action: 'upsert', sheet: 'Movimenti', row }]);
      toast(f0 === 'prezzo' ? 'Prezzo aggiornato' : f0 === 'quantita' ? 'Quantità aggiornata' : 'Salvato');
    };
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') commit(false); });
    el.addEventListener('blur', () => commit(true));
    if (el.tagName === 'SELECT') el.addEventListener('change', () => commit(true));
  }

  /* ---------- Modifica articolo (tutte le righe) ---------- */
  function formArt(k) {
    const x = articoli(db.movimenti).find(z => z.k === k); if (!x) return;
    const last = [...x.rows].reverse().find(r => num(r.prezzo) > 0);
    const zero = x.rows.filter(r => !num(r.prezzo)).length;
    const cat = x.rows[x.rows.length - 1].categoria || autoCat(x.desc);
    openSheet('Modifica articolo', `
      <div class="ai-note">Le modifiche valgono per ${x.n === 1 ? 'l\'unica riga' : 'tutte le ' + x.n + ' righe'} di questo prodotto</div>
      <label class="f"><span>Descrizione</span><input name="descrizione" required data-focus value="${esc(x.desc)}"></label>
      <div class="f-row">
        ${x.codes.length > 1 ? `<label class="f"><span>Codici</span><input value="${esc(x.codes.length + ' codici: restano invariati')}" disabled></label>` : `<label class="f"><span>Codice articolo</span><input name="codice" value="${esc(x.codice)}"></label>`}
        <label class="f"><span>Unità</span><select name="um">${opt(UM, x.um || 'PZ')}</select></label>
      </div>
      <label class="f"><span>Categoria</span><select name="categoria">${opt(categorie(), cat)}</select></label>
      <div class="f-row">
        <label class="f"><span>Nuovo prezzo unit. € (IVA esclusa)</span><input name="prezzo" inputmode="decimal" value="${last ? esc(String(num(last.prezzo)).replace('.', ',')) : ''}" placeholder="0,00"></label>
        <label class="f"><span>Applica il prezzo a</span><select name="dove">
          <option value="no">Non cambiare i prezzi</option>
          <option value="tutte">Tutte le righe</option>
          ${zero ? `<option value="zero"${zero ? ' selected' : ''}>Solo righe senza prezzo (${zero})</option>` : ''}
        </select></label>
      </div>`,
      fd => {
        const desc = String(fd.get('descrizione')).trim(); if (!desc) return toast('Inserisci la descrizione');
        const p = num(fd.get('prezzo')), dove = fd.get('dove');
        const ops = x.rows.map(r => {
          const row = { ...r, descrizione: desc, codice: fd.has('codice') ? String(fd.get('codice')).trim() : r.codice, um: fd.get('um'), categoria: fd.get('categoria') };
          if (dove === 'tutte' || (dove === 'zero' && !num(r.prezzo))) row.prezzo = p;
          return { action: 'upsert', sheet: 'Movimenti', row };
        });
        write(ops); toast(`Articolo aggiornato su ${ops.length} righe`);
        return true;
      });
  }

  /* =========================================================
     GLS ATTREZZATI — spedizioni dal centro di costo di Roma
     ========================================================= */
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const mLabel = k => { const [y, m] = k.split('-').map(Number); return MESI[m - 1].replace(/^./, c => c.toUpperCase()) + ' ' + y; };
  const GLS_ORIG = { citta: 'Roma', prov: 'RM', lat: 41.902, lon: 12.496 };
  const CONTR = { C1: 'Contratto 1 · Pacchi', C2: 'Contratto 2 · Pesante e pedane' };
  const TIPI = ['Pacco', 'Collo voluminoso', 'Pedana'];
  const BANDS = [[0, 3], [3, 5], [5, 10], [10, 20], [20, 50], [50, 100], [100, 250], [250, 500], [500, 1000], [1000, Infinity]];
  let gMonth = '', glsAnim = true, gF = { q: '', cdc: '', contr: '' }, gLimit = 60;
  const gMul = () => ivaOn ? 1.22 : 1;
  const gE = v => eur(num(v) * gMul()), gE0 = v => eur0(num(v) * gMul());
  const kg = v => fmtNum(num(v), 1) + ' kg';
  const glsRows = () => db.gls || [];
  const glsMonths = () => [...new Set(glsRows().map(r => r.mese).filter(Boolean))].sort();
  const gSum = (arr, f) => arr.reduce((s, r) => s + num(r[f]), 0);
  const gTot = arr => gSum(arr, 'totale');
  const geoOf = r => {
    const G = window.GLS_GEO || { PROV: {}, CITY: {} };
    const k = String(r.citta || '').toUpperCase().trim() + '|' + String(r.prov || '').toUpperCase().trim();
    const c = G.CITY[k], p = G.PROV[String(r.prov || '').toUpperCase().trim()];
    return c ? { lat: c[0], lon: c[1] } : p ? { lat: p[0], lon: p[1] } : null;
  };
  const regOf = r => r.regione || ((window.GLS_GEO || { PROV: {} }).PROV[String(r.prov || '').toUpperCase()] || [])[2] || 'Altro';
  const glsScriptOk = () => isLocal() || !db.v || db.v >= 'cdc-1.1';

  const pdfSeen = {};
  function glsPdf() {
    const a = $('#gl-pdf'); if (!a) return;
    const m = gMonth, url = `analisi/gls-${m}.pdf`;
    const show = ok => { if (m !== gMonth) return; a.hidden = !ok; if (ok) { a.href = url; a.setAttribute('download', `Analisi GLS ${mLabel(m)}.pdf`); } };
    if (m in pdfSeen) return show(pdfSeen[m]);
    a.hidden = true;
    fetch(url, { method: 'HEAD', cache: 'no-cache' }).then(r => { pdfSeen[m] = r.ok && !/html/i.test(r.headers.get('content-type') || ''); show(pdfSeen[m]); }).catch(() => {});
  }
  const sgn = p => (p > 0 ? '+' : p < 0 ? '−' : '') + fmtNum(Math.abs(p), 0) + '%';

  function renderGls() {
    const months = glsMonths();
    const cur = ymOf(new Date());
    if (!months.includes(gMonth)) gMonth = months.includes(cur) ? cur : months[months.length - 1] || cur;
    const sel = $('#gl-mese');
    const opts = [...new Set([...months, cur])].sort().reverse();
    sel.innerHTML = opts.map(k => `<option value="${k}"${k === gMonth ? ' selected' : ''}>${esc(mLabel(k))}${months.includes(k) ? '' : ' · da caricare'}</option>`).join('');
    const ix = opts.indexOf(gMonth);
    $('#gl-prev').disabled = ix >= opts.length - 1; $('#gl-next').disabled = ix <= 0;
    sub(ivaLbl() + ' · spedizioni GLS da Roma');
    glsPdf();
    const rows = glsRows().filter(r => r.mese === gMonth);
    const anim = glsAnim && !reduced(); glsAnim = false;
    const body = $('#gl-body');
    body.classList.toggle('cc-anim', anim);
    const warn = glsScriptOk() ? '' : `<div class="card gl-warn"><b>Aggiorna lo script Google per salvare i dati GLS.</b><span>Lo script collegato è la versione ${esc(db.v || '—')}: serve la cdc-1.1 (Code.gs nuovo). Finché non lo aggiorni l'importazione è bloccata.</span></div>`;
    if (!rows.length) {
      body.innerHTML = warn + `<div class="gl-hero gl-hero-empty"><div class="gh-top"><div class="gh-art">${glsArt()}</div><div class="gh-main"><span class="gh-lbl">GLS Attrezzati · ${esc(mLabel(gMonth))}</span><h3>Nessuna spedizione caricata</h3><p>Importa il resoconto del mese con «Importa mese».</p></div></div></div>`;
      return;
    }
    const T = gTot(rows), n = rows.length, colli = gSum(rows, 'colli'), kr = gSum(rows, 'kgReali'), kt = gSum(rows, 'kgTass');
    const prevK = months[months.indexOf(gMonth) - 1], prev = prevK ? glsRows().filter(r => r.mese === prevK) : null;
    const dlt = (a, b) => { if (!b) return ''; const p = (a / b - 1) * 100; return `<span class="gl-d ${p > 0 ? 'up' : 'down'}">${p > 0 ? '▲' : '▼'} ${fmtNum(Math.abs(p), 0)}% vs ${esc(MESI[Number(prevK.slice(5)) - 1])}</span>`; };
    const vol = kr ? (kt / kr - 1) * 100 : 0;
    const nLoc = new Set(rows.map(r => r.citta + '|' + r.prov)).size, nReg = new Set(rows.map(regOf)).size;
    const K = [['Spedizioni', n, v => fmtNum(Math.round(v), 0), `${fmtNum(colli, 0)} colli`],
      ['Peso reale', kr, v => fmtNum(v, 0) + ' kg', `${fmtNum(kr / n, 0)} kg medi`],
      ['Peso tassabile', kt, v => fmtNum(v, 0) + ' kg', `${sgn(vol)} sul reale`],
      ['Medio spedizione', T / n * gMul(), v => eur(v), ivaLbl()],
      ['Medio collo', T / colli * gMul(), v => eur(v), `${fmtNum(colli / n, 1)} colli/sped.`],
      ['€ / kg tassabile', T / kt * gMul(), v => fmtNum(v, 3) + ' €', `${fmtNum(T / kr * gMul(), 3)} € sul reale`]];
    body.innerHTML = warn + `
      <div class="gl-hero">
        <div class="gh-top"><div class="gh-art">${glsArt()}</div>
        <div class="gh-main">
          <span class="gh-lbl">Costo spedizioni · ${esc(mLabel(gMonth))}</span>
          <div class="gh-big k-gtot">0 €</div>
          <div class="gh-sub"><span>${n} spedizioni</span><span>${nLoc} località</span><span>${nReg} regioni</span>${dlt(T, prev && gTot(prev))}</div>
        </div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k"><span>${l}</span><b data-gk="${i}">0</b><small>${s}</small></div>`).join('')}</div>
      </div>
      <div class="card gl-mapcard">
        <div class="card-h"><h3>Destinazioni</h3><span class="gl-leg2"><i class="o"></i>Roma · partenza <i class="p"></i>destinazione, grandezza = costo</span></div>
        <div class="gl-mapgrid"><div class="gl-map" id="gl-map"></div><div class="gl-dest" id="gl-dest"></div></div>
      </div>
      <div class="gl-3">
        <div class="card"><div class="card-h"><h3>Contratti</h3></div><div id="gl-contr"></div></div>
        <div class="card"><div class="card-h"><h3>Composizione del costo</h3></div><div id="gl-comp"></div></div>
        <div class="card"><div class="card-h"><h3>Tipologia</h3></div><div id="gl-tipo"></div></div>
      </div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Regioni</h3><span class="muted small">${nReg} regioni</span></div><div class="bars" id="gl-reg"></div></div>
        <div class="card"><div class="card-h"><h3>Fasce di peso tassabile</h3><span class="muted small">costo per fascia</span></div><div id="gl-band"></div></div>
      </div>
      <div class="card"><div class="card-h"><h3>Spedizioni giorno per giorno</h3><span class="muted small" id="gl-day-s"></span></div><div class="mbars gl-days" id="gl-days"></div></div>
      ${months.length > 1 ? `<div class="card"><div class="card-h"><h3>Andamento mensile</h3><span class="muted small">${months.length} mesi caricati</span></div><div class="mbars gl-months" id="gl-months"></div></div>` : ''}
      <div class="card"><div class="card-h"><h3>Centri di costo e riaddebito</h3><span class="muted small">costo GLS + IVA 22%</span></div><div class="mx-wrap" id="gl-cdc"></div></div>
      <div class="card" id="gl-anom"></div>
      <div class="card gl-list"><div class="card-h"><h3>Tutte le spedizioni</h3><span class="muted small" id="gl-cnt"></span></div>
        <div class="filters f3 gl-f"><input id="gl-q" type="search" placeholder="Cerca destinatario, località, n. spedizione…" value="${esc(gF.q)}"><select id="gl-fcdc"></select><select id="gl-fcon"></select></div>
        <div id="gl-ship"></div></div>`;

    countTo($('.k-gtot', body), T * gMul(), eur0);
    $$('[data-gk]', body).forEach(el => { const i = +el.dataset.gk; el._v = 0; countTo(el, K[i][1], K[i][2]); });

    glsMapRender($('#gl-map'), $('#gl-dest'), rows, anim);
    // regioni
    const byR = [...groupBy(rows, regOf)].map(([k, v]) => ({ k, v: gTot(v), n: v.length })).sort((a, b) => b.v - a.v);
    if (byR.length > 10) { const o = byR.splice(9); byR.push({ k: `Altre ${o.length} regioni`, v: o.reduce((s, x) => s + x.v, 0), n: o.reduce((s, x) => s + x.n, 0) }); }
    const mr = Math.max(...byR.map(x => x.v), 1);
    $('#gl-reg').innerHTML = byR.map((x, i) => `<div class="bar-row gl-anim-row" style="--d:${200 + i * 50}ms"><div class="bar-top"><span>${esc(x.k)}<em>${x.n} sped. · ${fmtNum(pct(x.v, T), 1)}%</em></span><span>${gE0(x.v)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(x.v / mr * 100).toFixed(2)}%"></div></div></div>`).join('');

    if (months.length > 1) {
      const vals = months.map(k => gTot(glsRows().filter(r => r.mese === k))), mx = Math.max(...vals, 1);
      $('#gl-months').innerHTML = months.map((k, i) => `<div class="mb${k === gMonth ? '' : ' gl-mb'}" data-gmonth="${k}" title="${esc(mLabel(k))}: ${esc(gE(vals[i]))}"><span class="mbv">${esc(gE0(vals[i]))}</span><i class="${k === gMonth ? 'cur' : ''}" style="height:${Math.max(3, vals[i] / mx * 100)}%;animation-delay:${i * 40}ms"></i><span class="mbl">${esc(MESI[Number(k.slice(5)) - 1].slice(0, 3))}</span></div>`).join('');
    }
    // contratti
    const cs = ['C1', 'C2'].map(c => { const v = rows.filter(r => r.contratto === c); return { c, v, t: gTot(v), n: v.length, colli: gSum(v, 'colli'), kt: gSum(v, 'kgTass'), kr: gSum(v, 'kgReali') }; }).filter(x => x.n);
    $('#gl-contr').innerHTML = `<div class="gl-split">${cs.map((x, i) => `<i class="gs-${i}" style="flex:${Math.max(x.t, T * .03)}"></i>`).join('')}</div>
      <div class="gl-cs">${cs.map((x, i) => `<div class="gl-c"><div class="gl-ch"><span><span class="gl-dot gs-${i}"></span>${esc(CONTR[x.c] || x.c)}</span><b>${gE0(x.t)}<em>${fmtNum(pct(x.t, T), 0)}%</em></b></div>
        <div class="gl-ct"><div><small>Sped. / colli</small><b>${x.n} / ${x.colli}</b></div><div><small>Medio</small><b>${gE(x.t / x.n)}</b></div><div><small>€ / kg tass.</small><b>${fmtNum(x.t / x.kt * gMul(), 3)}</b></div><div><small>Tass. vs reale</small><b>${x.kr ? sgn((x.kt / x.kr - 1) * 100) : '—'}</b></div></div></div>`).join('')}</div>`;
    // composizione: anello
    const comp = [['Nolo', gSum(rows, 'nolo')], ['Fuel surcharge', gSum(rows, 'fuel')], ['Supplementi', gSum(rows, 'suppl')]];
    const ct = comp.reduce((s, x) => s + x[1], 0) || 1;
    let acc = 0; const C = 2 * Math.PI * 42;
    const ring = comp.map((x, i) => { const f = x[1] / ct, seg = `<circle class="gc-${i} gl-rs" r="42" cx="60" cy="60" pathLength="1" style="stroke-dasharray:${Math.max(0, f - .006).toFixed(4)} 1;stroke-dashoffset:${(-acc).toFixed(4)};--d:${300 + i * 150}ms"/>`; acc += f; return seg; }).join('');
    $('#gl-comp').innerHTML = `<div class="gl-ring"><svg viewBox="0 0 120 120"><circle r="42" cx="60" cy="60" class="gl-rb"/>${ring}</svg><div class="gl-rc"><b>${gE0(ct)}</b><small>totale</small></div></div>
      <ul class="dn-leg gl-leg">${comp.map((x, i) => `<li><i class="gc-${i}"></i><span>${x[0]}</span><b>${gE(x[1])}</b><em>${fmtNum(x[1] / ct * 100, 1)}%</em></li>`).join('')}</ul>`;
    // tipologia
    const TI = { 'Pacco': '<path d="M3 8l9-4 9 4v8l-9 4-9-4z"/><path d="M3 8l9 4 9-4M12 12v8"/>', 'Collo voluminoso': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v5"/>', 'Pedana': '<path d="M3 17h18M5 17v3M12 17v3M19 17v3"/><rect x="5" y="6" width="14" height="11" rx="1"/><path d="M5 11h14"/>' };
    const tps = [...new Set([...TIPI, ...rows.map(r => r.tipologia)])].map(t => ({ t, v: rows.filter(r => r.tipologia === t) })).filter(x => x.v.length);
    $('#gl-tipo').innerHTML = `<div class="gl-tipi">${tps.map(({ t, v }) => { const tt = gTot(v);
      return `<div class="gl-ti"><span class="gl-tic"><svg viewBox="0 0 24 24">${TI[t] || TI.Pacco}</svg></span><div><b>${esc(t)}</b><small>${v.length} sped. · ${gSum(v, 'colli')} colli · ${fmtNum(gSum(v, 'kgTass'), 0)} kg</small><span class="gl-tb"><i style="width:${(tt / T * 100).toFixed(1)}%"></i></span></div><div class="gl-tv"><b>${gE0(tt)}</b><small>${gE(tt / v.length)} medio</small></div></div>`; }).join('')}</div>`;
    // fasce di peso
    const bands = BANDS.map(([a, b]) => { const v = rows.filter(r => num(r.kgTass) >= a && num(r.kgTass) < b); return { l: b === Infinity ? `oltre ${fmtNum(a, 0)} kg` : `${fmtNum(a, 0)}–${fmtNum(b, 0)} kg`, v, t: gTot(v), kt: gSum(v, 'kgTass') }; }).filter(x => x.v.length);
    const mb = Math.max(...bands.map(x => x.t), 1);
    $('#gl-band').innerHTML = `<div class="gl-bands">${bands.map((x, i) => `<div class="gb-row gl-anim-row" style="--d:${150 + i * 50}ms"><span class="gb-l">${x.l}<small>${x.v.length} sped. · ${fmtNum(x.t / (x.kt || 1) * gMul(), 2)} €/kg</small></span><span class="gb-t"><i style="width:${(x.t / mb * 100).toFixed(1)}%"></i></span><b class="gb-v">${gE0(x.t)}</b></div>`).join('')}</div>`;
    // giorni
    const [yy, mm] = gMonth.split('-').map(Number), nd = new Date(yy, mm, 0).getDate();
    const byD = groupBy(rows, r => String(r.data).slice(0, 10));
    const days = [...Array(nd)].map((_, i) => { const k = `${gMonth}-${pad(i + 1)}`, v = byD.get(k) || []; const wd = new Date(yy, mm - 1, i + 1).getDay(); return { d: i + 1, k, v, t: gTot(v), we: wd === 0 || wd === 6 }; });
    const md = Math.max(...days.map(x => x.t), 1);
    $('#gl-days').innerHTML = days.map((x, i) => `<div class="mb${x.we ? ' we' : ''}" title="${x.d} ${esc(MESI[mm - 1])}: ${x.v.length} sped. · ${esc(gE(x.t))}"><span class="mbv">${x.t ? esc(gE0(x.t)) : ''}</span><i class="${x.t === md ? 'cur' : ''}" style="height:${x.t ? Math.max(3, x.t / md * 100) : 0}%;animation-delay:${i * 18}ms"></i><span class="mbl">${x.d}</span></div>`).join('');
    const act = days.filter(x => x.v.length).length;
    $('#gl-day-s').textContent = `${act} giorni di spedizione · media ${fmtNum(n / (act || 1), 1)} sped. al giorno`;
    // centri di costo
    const byCC = [...groupBy(rows, r => r.cdc || '—')].map(([k, v]) => ({ k, nome: v[0].cdcNome || '', v, t: gTot(v), rd: v[0].riaddebito || '' })).sort((a, b) => String(a.k).localeCompare(String(b.k)));
    const isR = x => /^s[iì]/i.test(x.rd);
    const tR = byCC.filter(isR).reduce((s, x) => s + x.t, 0);
    $('#gl-cdc').innerHTML = `<table class="mx gl-tab"><thead><tr><th>Centro di costo</th><th>Sped.</th><th>Colli</th><th>Kg tass.</th><th>C1</th><th>C2</th><th>Costo GLS</th><th>%</th><th>Totale + IVA</th><th>Riaddebito</th></tr></thead><tbody>
      ${byCC.map(x => `<tr data-gcdc="${esc(x.k)}"><td><b class="gl-cc">${esc(x.k)}</b> ${esc(x.nome)}</td><td>${x.v.length}</td><td>${gSum(x.v, 'colli')}</td><td>${fmtNum(gSum(x.v, 'kgTass'), 1)}</td><td>${eur(gTot(x.v.filter(r => r.contratto === 'C1')))}</td><td>${eur(gTot(x.v.filter(r => r.contratto === 'C2')))}</td><td><b>${eur(x.t)}</b></td><td>${fmtNum(pct(x.t, T), 1)}%</td><td>${eur(x.t * 1.22)}</td><td><span class="chip ${isR(x) ? 'paid' : /^no/i.test(x.rd) ? '' : 'soon'}">${esc(x.rd || '—')}</span></td></tr>`).join('')}
      <tr class="tot"><td>Totale</td><td>${n}</td><td>${colli}</td><td>${fmtNum(kt, 1)}</td><td>${eur(gTot(rows.filter(r => r.contratto === 'C1')))}</td><td>${eur(gTot(rows.filter(r => r.contratto === 'C2')))}</td><td>${eur(T)}</td><td>100%</td><td>${eur(T * 1.22)}</td><td></td></tr>
      <tr class="gl-rr"><td colspan="6">di cui riaddebitabile ai clienti</td><td>${eur(tR)}</td><td>${fmtNum(pct(tR, T), 1)}%</td><td>${eur(tR * 1.22)}</td><td></td></tr></tbody></table>`;
    renderGlsAnom(rows);
    $('#gl-fcdc').innerHTML = `<option value="">Tutti i centri di costo</option>` + byCC.map(x => `<option value="${esc(x.k)}"${gF.cdc === x.k ? ' selected' : ''}>${esc(x.k)} ${esc(x.nome)}</option>`).join('');
    $('#gl-fcon').innerHTML = `<option value="">Tutti i contratti</option>` + ['C1', 'C2'].map(c => `<option value="${c}"${gF.contr === c ? ' selected' : ''}>${esc(CONTR[c])}</option>`).join('');
    renderGlsList(rows);
  }

  function renderGlsList(rows) {
    rows = rows || glsRows().filter(r => r.mese === gMonth);
    const q = gF.q.trim().toLowerCase();
    const L = rows.filter(r => (!gF.cdc || r.cdc === gF.cdc) && (!gF.contr || r.contratto === gF.contr) && (!q || `${r.destinatario} ${r.citta} ${r.prov} ${r.nsped} ${r.rif} ${r.cdcNome}`.toLowerCase().includes(q)))
      .sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.nsped).localeCompare(String(b.nsped)));
    $('#gl-cnt').textContent = `${L.length} spedizioni · ${gE(gTot(L))}`;
    const sh = L.slice(0, gLimit);
    const more = L.length > gLimit ? `<div class="more-row"><button class="btn sm" id="gl-more">Mostra tutte (${L.length})</button></div>` : '';
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : '—';
    if (!L.length) { $('#gl-ship').innerHTML = '<div class="empty">Nessuna spedizione</div>'; return; }
    if (isDesk()) {
      $('#gl-ship').innerHTML = `<table class="tbl gl-st"><thead><tr><th>Data</th><th>Contr.</th><th>Destinatario</th><th>Destinazione</th><th>CdC</th><th>Tipologia</th><th class="r">Colli</th><th class="r">Kg reali</th><th class="r">Kg tass.</th><th class="r">Totale</th><th class="r">€/kg</th><th class="r">Gg</th></tr></thead><tbody>
        ${sh.map(r => `<tr data-gship="${esc(r.id)}"><td class="d">${dd(r.data)}</td><td><span class="chip gk-${r.contratto}">${esc(r.contratto)}</span></td><td><div class="tt"><b>${esc(r.destinatario)}</b><small>${esc(r.nsped)}${r.rif ? ' · rif. ' + esc(r.rif) : ''}</small></div></td><td class="m2">${esc(r.citta)} (${esc(r.prov)})</td><td class="m2">${esc(r.cdc)}</td><td class="m2">${esc(r.tipologia)}</td><td class="num">${num(r.colli)}</td><td class="num">${fmtNum(num(r.kgReali), 1)}</td><td class="num">${fmtNum(num(r.kgTass), 1)}</td><td class="num amt">${gE(r.totale)}</td><td class="num">${num(r.kgTass) ? fmtNum(num(r.totale) / num(r.kgTass) * gMul(), 2) : '—'}</td><td class="num">${r.gg === '' || r.gg == null ? '<span class="chip soon">—</span>' : num(r.gg)}</td></tr>`).join('')}</tbody></table>${more}`;
    } else {
      $('#gl-ship').innerHTML = `<div class="list">${sh.map(r => `<div class="item" data-gship="${esc(r.id)}"><span class="ic cc gk-${r.contratto}">${esc(r.contratto)}</span><div class="main"><div class="t">${esc(r.citta)} (${esc(r.prov)}) · ${esc(r.destinatario)}</div><div class="s">${dd(r.data)} · ${esc(r.tipologia)} · ${num(r.colli)} colli · ${fmtNum(num(r.kgTass), 0)} kg tass.</div></div><div class="amt">${gE(r.totale)}</div></div>`).join('')}</div>${more}`;
    }
  }

  function renderGlsAnom(rows) {
    const A = [];
    const c1 = rows.filter(r => r.contratto === 'C1' && num(r.kgTass) < 30), c1avg = c1.length ? gTot(c1) / c1.length : 0;
    const bad = rows.filter(r => r.contratto === 'C2' && num(r.kgTass) < 30);
    if (bad.length && c1avg) { const ex = bad.reduce((s, r) => s + Math.max(0, num(r.totale) - c1avg), 0); A.push({ t: 'warn', h: 'Contratto non ottimale', d: `${bad.length} spedizioni leggere (sotto 30 kg tassabili) partite con il Contratto 2, che ha un nolo minimo più alto. Con il Contratto 1 costano in media ${gE(c1avg)}.`, v: `circa ${gE0(ex)} in più`, ids: bad.map(r => r.nsped) }); }
    const nr = s => String(s || '').replace(/[^0-9a-z]/gi, '').toUpperCase();
    const dup = [...groupBy(rows.filter(r => nr(r.rif).length > 4), r => nr(r.rif) + '|' + String(r.destinatario).toUpperCase().trim())].filter(([, v]) => v.length > 1);
    dup.forEach(([, v]) => A.push({ t: 'warn', h: 'Ordine spedito più volte', d: `Rif. ${esc(v[0].rif)} a ${esc(v[0].destinatario)} (${esc(v[0].citta)}) compare ${v.length} volte.`, v: gE(gTot(v)), ids: v.map(r => r.nsped) }));
    ['C1', 'C2'].forEach(c => { const v = rows.filter(r => r.contratto === c), kr = gSum(v, 'kgReali'), kt = gSum(v, 'kgTass'); if (kr && kt / kr > 1.3 && v.length > 3) { const w = v.reduce((m, r) => num(r.kgTass) / Math.max(.1, num(r.kgReali)) * Math.min(1, num(r.kgReali) / 50) > num(m.kgTass) / Math.max(.1, num(m.kgReali)) * Math.min(1, num(m.kgReali) / 50) ? r : m, v[0]); A.push({ t: 'info', h: `Peso volumetrico alto · ${CONTR[c] || c}`, d: `Si paga su ${fmtNum(kt, 0)} kg tassabili contro ${fmtNum(kr, 0)} kg reali (+${fmtNum((kt / kr - 1) * 100, 0)}%). Caso limite: ${esc(w.citta)}, ${fmtNum(num(w.kgReali), 0)} kg reali tassati ${fmtNum(num(w.kgTass), 0)} kg.`, v: 'rivedere imballi', ids: [w.nsped] }); } });
    const inb = rows.filter(r => /arrivo|da valutare/i.test(r.riaddebito + ' ' + r.cdcNome));
    if (inb.length) A.push({ t: 'warn', h: 'Spedizioni in arrivo a nostro carico', d: `${inb.length} spedizioni ricevute addebitate a noi: valutare il riaddebito al mittente.`, v: gE(gTot(inb)), ids: inb.map(r => r.nsped) });
    const int = rows.filter(r => /^no/i.test(r.riaddebito));
    if (int.length) A.push({ t: 'info', h: 'Costi interni', d: `${int.length} spedizioni verso le nostre sedi (${[...new Set(int.map(r => r.citta))].map(esc).join(', ')}): da non riaddebitare.`, v: gE(gTot(int)), ids: int.map(r => r.nsped) });
    const nd = rows.filter(r => r.gg === '' || r.gg == null);
    if (nd.length) A.push({ t: 'info', h: 'Consegna non registrata', d: `${nd.length} spedizioni senza data di consegna (${[...new Set(nd.map(r => r.citta))].map(esc).join(', ')}): verificare il tracking prima di fatturare.`, v: '—', ids: nd.map(r => r.nsped) });
    const I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    $('#gl-anom').innerHTML = `<div class="card-h"><h3>Anomalie e possibili risparmi</h3><span class="muted small">${A.length ? A.length + ' punti da controllare' : 'nessuna anomalia'}</span></div>` +
      (A.length ? `<div class="gl-an">${A.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms" data-gq="${esc(x.ids.join(' '))}"><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span><small>${x.ids.slice(0, 6).map(esc).join(' · ')}${x.ids.length > 6 ? ' …' : ''}</small></div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Tutto in ordine</div>');
  }

  // mappa: archi da Roma alle destinazioni, numerati come l'elenco a lato
  const glsName = v => {
    const by = [...groupBy(v, r => String(r.destinatario || '').trim().toUpperCase())].map(([, a]) => ({ a, t: gTot(a) })).sort((a, b) => b.t - a.t);
    const r = by[0].a[0];
    return { nm: (String(r.destinatario || '').trim() || r.citta).toUpperCase().replace(/\s+/g, ' '), more: by.length - 1 };
  };
  function glsMapRender(el, list, rows, anim) {
    const P = (lat, lon) => proj([lon, lat]);
    const [ox, oy] = P(GLS_ORIG.lat, GLS_ORIG.lon);
    const g = [...groupBy(rows, r => r.citta + '|' + r.prov)].map(([k, v]) => ({ k, c: v[0].citta, p: v[0].prov, v, t: gTot(v), n: v.length, kt: gSum(v, 'kgTass'), geo: geoOf(v[0]), ...glsName(v) })).sort((a, b) => b.t - a.t);
    g.forEach((x, i) => { x.i = i + 1; });
    const gm = g.filter(x => x.geo), mx = Math.max(...g.map(x => x.t), 1);
    gm.forEach(x => { [x.x, x.y] = P(x.geo.lat, x.geo.lon); x.r = 2.2 + 7.5 * Math.sqrt(x.t / mx); x.home = Math.hypot(x.x - ox, x.y - oy) < 2.5; if (x.i <= 12) x.r = Math.max(x.r, 5.6); });
    const far = gm.filter(x => !x.home);
    const arcs = far.map((x, j) => {
      const dx = x.x - ox, dy = x.y - oy, L = Math.hypot(dx, dy) || 1, b = Math.min(46, L * .22) * (dx < 0 ? 1 : -1);
      const cx = (ox + x.x) / 2 - dy / L * b, cy = (oy + x.y) / 2 + dx / L * b;
      const d = `M${ox.toFixed(1)} ${oy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.x.toFixed(1)} ${x.y.toFixed(1)}`;
      const w = .5 + 1.9 * Math.sqrt(x.t / mx);
      return `<path class="cm-arc gl-arc" data-ga="${esc(x.k)}" pathLength="1" style="--d:${500 + j * 40}ms;stroke-width:${w.toFixed(2)}" d="${d}"/>` +
        (x.i <= 10 ? `<path class="gl-flow" pathLength="1" style="--d:${(1.4 + j * .23).toFixed(2)}s;--t:${(1.6 + L / 160).toFixed(2)}s;stroke-width:${(w + .6).toFixed(2)}" d="${d}"/>` : '');
    }).join('');
    const pins = gm.slice().reverse().map(x => `<g class="gl-pin${x.i <= 12 ? ' nb' : ''}" data-gpin="${esc(x.k)}" style="--d:${800 + x.i * 35}ms" transform="translate(${x.x.toFixed(1)} ${x.y.toFixed(1)})"><circle class="cm-hit" r="${(x.r + 4).toFixed(1)}"/><circle class="gl-halo" r="${(x.r + 2.4).toFixed(1)}"/><circle class="cm-c" r="${x.r.toFixed(1)}"/>${x.i <= 12 ? `<text class="gl-pn" dy=".35em">${x.i}</text>` : ''}</g>`).join('');
    const right = false;
    el.innerHTML = `<svg viewBox="26 4 346 388" class="gl-svg" role="img" aria-label="Mappa delle spedizioni GLS">
      <defs><radialGradient id="glsea" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="var(--accent)" stop-opacity=".07"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs>
      <rect x="26" y="4" width="346" height="388" fill="url(#glsea)"/>
      <path class="cm-land gl-land" pathLength="1" d="${IT_PATH}"/>
      ${arcs}
      ${pins}
      <g class="gl-orig" transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})"><circle class="gl-op" r="6"/><circle class="gl-op gl-op2" r="6"/><circle r="5.2" class="gl-oc"/><circle r="1.9" class="gl-oi"/></g>
      <g class="gl-olab" transform="translate(${(ox + (right ? 9 : -9)).toFixed(1)} ${(oy + 3).toFixed(1)})"><text text-anchor="${right ? 'start' : 'end'}" class="gl-on">ROMA</text><text text-anchor="${right ? 'start' : 'end'}" dy="8" class="gl-os">partenza</text></g>
    </svg>`;
    // elenco aziende / destinazioni
    list.innerHTML = `<div class="gd-h"><span>${g.length} destinazioni</span><span>costo</span></div><div class="gd-l">${g.map(x => `<div class="gd-r${x.home ? ' home' : ''}" data-gdest="${esc(x.k)}" style="--d:${300 + Math.min(x.i, 14) * 45}ms"><span class="gd-n${x.i <= 12 ? ' nb' : ''}">${x.i}</span><span class="gd-m"><b title="${esc(x.nm)}">${esc(x.nm)}${x.more ? ` <em>+${x.more}</em>` : ''}</b><small>${esc(x.c)} (${esc(x.p)}) · ${x.n} sped. · ${fmtNum(x.kt, 0)} kg</small><span class="gd-b"><i style="width:${(x.t / mx * 100).toFixed(1)}%"></i></span></span><b class="gd-v">${gE0(x.t)}</b></div>`).join('')}</div>`;
    const hl = k => { $$('.gl-pin.hl,.gd-r.hl,.gl-arc.hl', el.parentNode).forEach(e => e.classList.remove('hl')); if (!k) return; $$(`[data-gpin="${CSS.escape(k)}"],[data-gdest="${CSS.escape(k)}"],[data-ga="${CSS.escape(k)}"]`, el.parentNode).forEach(e => e.classList.add('hl')); };
    const pick = k => { const x = g.find(z => z.k === k); if (!x) return; gF.q = x.c; $('#gl-q').value = x.c; renderGlsList(); $('#gl-ship').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const tipH = e => {
      const pin = e.target.closest('.gl-pin'); let tip = $('.cm-tip', el);
      if (!pin) { if (tip) tip.remove(); hl(''); return; }
      const x = g.find(z => z.k === pin.dataset.gpin); if (!x) return;
      hl(x.k);
      if (!tip) { tip = document.createElement('div'); tip.className = 'tip cm-tip'; el.appendChild(tip); }
      tip.innerHTML = `<b>${x.i}. ${esc(x.nm)}</b><br>${esc(x.c)} (${esc(x.p)}) · ${x.n} sped.<br><b>${gE(x.t)}</b> · ${fmtNum(x.kt, 0)} kg tass.`;
      const r = pin.getBoundingClientRect(), w = el.getBoundingClientRect();
      tip.style.left = (r.left + r.width / 2 - w.left) + 'px'; tip.style.top = (r.top - w.top - 4) + 'px';
    };
    el.onmousemove = tipH; el.onmouseleave = () => { const t = $('.cm-tip', el); if (t) t.remove(); hl(''); };
    el.onclick = e => { const pin = e.target.closest('.gl-pin'); if (pin) pick(pin.dataset.gpin); };
    list.onmouseover = e => { const r = e.target.closest('.gd-r'); hl(r ? r.dataset.gdest : ''); };
    list.onmouseleave = () => hl('');
    list.onclick = e => { const r = e.target.closest('.gd-r'); if (r) pick(r.dataset.gdest); };
  }

  // grafica in movimento: rotte che partono da Roma (linee e impulsi di luce)
  function glsArt() {
    const O = [92, 168], E = [[600, 34], [628, 82], [585, 118], [640, 150], [596, 196], [632, 226], [560, 70]];
    const R = E.map(([x, y], i) => { const c1 = [O[0] + 150 + i * 12, O[1] - 60 - (168 - y) * .5], c2 = [x - 160, y + (i % 2 ? 30 : -24)]; return `M${O[0]} ${O[1]} C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${x} ${y}`; });
    return `<svg viewBox="0 0 640 260" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" class="gh-svg">
      <defs><pattern id="ghdots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" opacity=".13"/></pattern>
      <radialGradient id="ghglow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <rect width="640" height="260" fill="url(#ghdots)"/>
      <g class="gh-rings" transform="translate(${O[0]} ${O[1]})"><circle r="38"/><circle r="74"/><circle r="116"/></g>
      ${R.map((d, i) => `<path class="gh-r" pathLength="1" style="--d:${200 + i * 110}ms" d="${d}"/>`).join('')}
      ${R.map((d, i) => `<path class="gh-f${i === 1 ? ' red' : ''}" pathLength="1" style="--d:${(1.2 + i * .55).toFixed(2)}s;--t:${(2.6 + (i % 3) * .5).toFixed(1)}s" d="${d}"/>`).join('')}
      ${E.map(([x, y], i) => `<g class="gh-e" style="--d:${900 + i * 110}ms" transform="translate(${x} ${y})"><circle class="gh-ep" r="4"/><circle r="3" class="gh-ec"/></g>`).join('')}
      <circle cx="${O[0]}" cy="${O[1]}" r="40" fill="url(#ghglow)"/>
      <g class="gh-o" transform="translate(${O[0]} ${O[1]})"><circle class="gh-op" r="9"/><circle r="7" class="gh-oc"/><circle r="2.6" class="gh-oi"/></g>
    </svg>`;
  }

  function glsDetail(id) {
    const r = glsRows().find(x => x.id === id); if (!r) return;
    const items = [['Data', validD(r.data) ? shortDate(r.data) : '—'], ['Contratto', CONTR[r.contratto] || r.contratto], ['N. spedizione', r.nsped], ['Riferimento', r.rif || '—'], ['Destinatario', r.destinatario], ['Destinazione', `${r.citta} (${r.prov}) · ${regOf(r)}`], ['Centro di costo', `${r.cdc} ${r.cdcNome || ''}`], ['Riaddebito', r.riaddebito || '—'], ['Tipologia', r.tipologia], ['Colli', num(r.colli)], ['Peso reale', kg(r.kgReali)], ['Peso tassabile', kg(r.kgTass) + (num(r.kgReali) ? ` (+${fmtNum((num(r.kgTass) / num(r.kgReali) - 1) * 100, 0)}%)` : '')], ['Giorni di consegna', r.gg === '' || r.gg == null ? 'non registrata' : num(r.gg)]];
    const c = [['Nolo', r.nolo], ['Fuel', r.fuel], ['Supplementi', r.suppl]];
    openSheet(`${r.citta} · ${r.destinatario}`, `
      <div class="kv">${items.map(([a, b]) => `<div><span>${a}</span><strong>${esc(String(b))}</strong></div>`).join('')}</div>
      <div class="iva-sum" style="margin-top:14px">${c.map(([a, b]) => `<div><span>${a}</span><b>${eur(b)}</b></div>`).join('')}<div class="t"><span>Totale (IVA esclusa)</span><b>${eur(r.totale)}</b></div><div><span>Con IVA 22%</span><b>${eur(num(r.totale) * 1.22)}</b></div><div><span>€ / kg tassabile</span><b>${num(r.kgTass) ? fmtNum(num(r.totale) / num(r.kgTass), 3) + ' €' : '—'}</b></div></div>`,
      null, () => { if (!confirm('Eliminare questa spedizione?')) return; write([{ action: 'delete', sheet: 'GLS', id: r.id }]); toast('Spedizione eliminata'); return true; }, 'Chiudi');
    $('#sheet-ok').type = 'button'; $('#sheet-ok').onclick = closeSheet;
  }

  /* ---------- Import / export GLS ---------- */
  function parseGls(wb) {
    const out = [];
    wb.SheetNames.forEach(name => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '' });
      const hi = aoa.findIndex(r => r.some(c => /^nspedizione$|^numerospedizione$|^nsped$/.test(nh(c))) && r.some(c => /kgtass|pesotass/.test(nh(c))));
      if (hi < 0) return;
      const H = aoa[hi].map(h => /€|eur|\//i.test(String(h)) && /kg/i.test(String(h)) ? '~' + nh(h) : nh(h));
      const col = (...ks) => { for (const k of ks) { const i = H.findIndex(h => h === k); if (i >= 0) return i; } for (const k of ks) { const i = H.findIndex(h => h.startsWith(k)); if (i >= 0) return i; } return -1; };
      const c = { data: col('data', 'dataspedizione'), con: col('contratto', 'contr'), ns: col('nspedizione', 'numerospedizione', 'nsped'), rif: col('rif', 'riferimento'), dest: col('destinatario'), citta: col('citta', 'localita', 'destinazione'), prov: col('provincia', 'prov'), cdc: col('centrodicosto', 'cdc'), cdcn: col('nomecentrodicosto', 'cliente'), tipo: col('tipologia', 'tipo'), colli: col('colli'), kr: col('kgreali', 'pesoreale'), kt: col('kgtassabili', 'kgtass', 'pesotassabile'), nolo: col('nolo'), fuel: col('fuel'), sup: col('supplementi', 'suppl'), tot: col('totale', 'costo', 'costogls'), gg: col('giorniconsegna', 'gg', 'giorni'), rd: col('riaddebitabile', 'riaddebito'), note: col('note') };
      aoa.slice(hi + 1).forEach(r => {
        const ns = String(r[c.ns] ?? '').trim(); if (!ns || /^totale/i.test(ns)) return;
        if (c.note >= 0 && /^esempio/i.test(String(r[c.note] ?? '').trim())) return;
        let d = r[c.data];
        if (d instanceof Date) d = ymd(d);
        else if (typeof d === 'number' && d > 20000) d = ymd(new Date(Math.round((d - 25569) * 864e5)));
        else { const m = String(d || '').trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); d = m ? `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad(m[2])}-${pad(m[1])}` : validD(d) ? String(d).slice(0, 10) : ''; }
        if (!d) return;
        let citta = String(r[c.citta] ?? '').trim(), prov = c.prov >= 0 ? String(r[c.prov] ?? '').trim().toUpperCase() : '';
        const pm = citta.match(/^(.*?)\s*\((\w\w)\)\s*$/); if (pm) { citta = pm[1]; prov = prov || pm[2].toUpperCase(); }
        const con = String(r[c.con] ?? '').toUpperCase().replace(/CONTRATTO\s*/, 'C').replace(/^(\d)$/, 'C$1').trim() || 'C1';
        const nolo = num(r[c.nolo]), fuel = num(r[c.fuel]), sup = num(r[c.sup]);
        const tot = c.tot >= 0 && r[c.tot] !== '' ? num(r[c.tot]) : nolo + fuel + sup;
        const sup2 = Math.abs(tot - nolo - fuel - sup) > .02 && tot > nolo + fuel ? r2(tot - nolo - fuel) : sup;
        const gg = c.gg >= 0 && r[c.gg] !== '' && !/^-+$/.test(String(r[c.gg]).trim()) ? num(r[c.gg]) : '';
        const cdcRaw = String(r[c.cdc] ?? '').trim(), cm = cdcRaw.match(/^(CC-\d+)\s*[·\-–]?\s*(.*)$/i);
        const row = { id: 'g' + ns, mese: d.slice(0, 7), data: d, contratto: con, nsped: ns, rif: String(r[c.rif] ?? '').trim(), destinatario: String(r[c.dest] ?? '').trim(), citta, prov, regione: '', cdc: cm ? cm[1].toUpperCase() : cdcRaw, cdcNome: (c.cdcn >= 0 ? String(r[c.cdcn] ?? '').trim() : '') || (cm ? cm[2] : ''), tipologia: String(r[c.tipo] ?? '').trim() || 'Pacco', colli: num(r[c.colli]) || 1, kgReali: num(r[c.kr]), kgTass: num(r[c.kt]), nolo, fuel, suppl: sup2, totale: r2(tot), gg, riaddebito: c.rd >= 0 ? String(r[c.rd] ?? '').trim() : '', note: c.note >= 0 ? String(r[c.note] ?? '').trim() : '' };
        row.regione = regOf(row);
        out.push(row);
      });
    });
    return out;
  }
  async function importGls() {
    if (!glsScriptOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.1)');
    let file; try { file = await pickFile('.xlsx,.xls,.xlsm,.csv'); } catch { return; }
    try {
      busy('Leggo il resoconto…'); await loadXlsx();
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const rows = parseGls(wb); busy();
      if (!rows.length) return toast('Nessuna spedizione trovata: usa il modello GLS');
      const months = [...new Set(rows.map(r => r.mese))].sort();
      const old = glsRows().filter(r => months.includes(r.mese));
      const noGeo = [...new Set(rows.filter(r => !geoOf(r)).map(r => `${r.citta} (${r.prov})`))];
      if (!confirm(`${rows.length} spedizioni · ${eur(gTot(rows))} · ${months.map(mLabel).join(', ')}.${old.length ? `\nSostituisce le ${old.length} spedizioni già caricate per ${months.length > 1 ? 'questi mesi' : 'questo mese'}.` : ''}${noGeo.length ? `\nSenza coordinate sulla mappa: ${noGeo.join(', ')}.` : ''}\nImportare?`)) return;
      const ids = new Set(rows.map(r => r.id));
      write([...old.filter(r => !ids.has(r.id)).map(r => ({ action: 'delete', sheet: 'GLS', id: r.id })), ...rows.map(row => ({ action: 'upsert', sheet: 'GLS', row }))]);
      gMonth = months[months.length - 1]; glsAnim = true; render();
      toast(`${rows.length} spedizioni GLS importate`);
    } catch (e) { busy(); toast(e.message); }
  }
  async function exportGls() {
    const rows = glsRows().filter(r => r.mese === gMonth).sort((a, b) => String(a.data).localeCompare(String(b.data)));
    if (!rows.length) return toast('Nessuna spedizione in questo mese');
    try {
      busy('Preparo il file Excel…'); await loadXlsx();
      const U = XLSX.utils, wb = U.book_new(), EUR = '#,##0.00 "€"';
      const H = ['Data', 'Contratto', 'N. spedizione', 'Rif.', 'Destinatario', 'Città', 'Provincia', 'Regione', 'Centro di costo', 'Nome centro di costo', 'Tipologia', 'Colli', 'Kg reali', 'Kg tassabili', 'Nolo', 'Fuel', 'Supplementi', 'Totale', 'Totale + IVA', 'Giorni consegna', 'Riaddebitabile', 'Note'];
      const ws = U.aoa_to_sheet([H, ...rows.map(r => [parseD(r.data), r.contratto, String(r.nsped), r.rif, r.destinatario, r.citta, r.prov, regOf(r), r.cdc, r.cdcNome, r.tipologia, num(r.colli), num(r.kgReali), num(r.kgTass), num(r.nolo), num(r.fuel), num(r.suppl), null, null, r.gg === '' || r.gg == null ? '' : num(r.gg), r.riaddebito, r.note || ''])], { cellDates: true });
      rows.forEach((r, i) => { const R = i + 2; ws['A' + R].z = 'dd/mm/yyyy'; ['O', 'P', 'Q'].forEach(L => (ws[L + R].z = EUR)); ws['R' + R] = { t: 'n', f: `O${R}+P${R}+Q${R}`, v: num(r.totale), z: EUR }; ws['S' + R] = { t: 'n', f: `R${R}*1.22`, v: r2(num(r.totale) * 1.22), z: EUR }; });
      const L = rows.length + 1;
      U.sheet_add_aoa(ws, [['', '', 'TOTALE']], { origin: 'A' + (L + 1) });
      const sv = { L: gSum(rows, 'colli'), M: gSum(rows, 'kgReali'), N: gSum(rows, 'kgTass'), O: gSum(rows, 'nolo'), P: gSum(rows, 'fuel'), Q: gSum(rows, 'suppl'), R: gTot(rows), S: r2(gTot(rows) * 1.22) };
      Object.keys(sv).forEach(C => (ws[C + (L + 1)] = { t: 'n', f: `SUBTOTAL(9,${C}2:${C}${L})`, v: sv[C], z: 'LMN'.includes(C) ? '#,##0.0' : EUR }));
      ws['!autofilter'] = { ref: `A1:V${L}` }; ws['!cols'] = [11, 9, 13, 14, 26, 22, 8, 15, 10, 28, 15, 6, 9, 11, 11, 10, 11, 12, 12, 9, 16, 20].map(w => ({ wch: w }));
      U.book_append_sheet(wb, ws, 'Spedizioni');
      const by = [...groupBy(rows, r => r.cdc)].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
      const wc = U.aoa_to_sheet([['Centro di costo', 'Nome', 'Spedizioni', 'Colli', 'Kg tassabili', 'Costo GLS', 'IVA 22%', 'Totale fattura', 'Riaddebitabile']]);
      by.forEach(([k, v], i) => { const R = i + 2; U.sheet_add_aoa(wc, [[k, v[0].cdcNome]], { origin: 'A' + R });
        wc['C' + R] = { t: 'n', f: `COUNTIF(Spedizioni!$I$2:$I$${L},A${R})`, v: v.length }; wc['D' + R] = { t: 'n', f: `SUMIF(Spedizioni!$I$2:$I$${L},A${R},Spedizioni!$L$2:$L$${L})`, v: gSum(v, 'colli') };
        wc['E' + R] = { t: 'n', f: `SUMIF(Spedizioni!$I$2:$I$${L},A${R},Spedizioni!$N$2:$N$${L})`, v: gSum(v, 'kgTass'), z: '#,##0.0' }; wc['F' + R] = { t: 'n', f: `SUMIF(Spedizioni!$I$2:$I$${L},A${R},Spedizioni!$R$2:$R$${L})`, v: gTot(v), z: EUR };
        wc['G' + R] = { t: 'n', f: `F${R}*0.22`, v: gTot(v) * .22, z: EUR }; wc['H' + R] = { t: 'n', f: `F${R}+G${R}`, v: gTot(v) * 1.22, z: EUR }; wc['I' + R] = { t: 's', v: v[0].riaddebito || '' }; });
      const TR = by.length + 2; U.sheet_add_aoa(wc, [['TOTALE']], { origin: 'A' + TR });
      const cv = { C: rows.length, D: gSum(rows, 'colli'), E: gSum(rows, 'kgTass'), F: gTot(rows), G: gTot(rows) * .22, H: gTot(rows) * 1.22 };
      Object.keys(cv).forEach(C => (wc[C + TR] = { t: 'n', f: `SUM(${C}2:${C}${TR - 1})`, v: cv[C], z: 'CDE'.includes(C) ? '#,##0.0' : EUR }));
      wc['!ref'] = `A1:I${TR}`; wc['!cols'] = [12, 34, 10, 8, 12, 13, 12, 14, 16].map(w => ({ wch: w }));
      U.book_append_sheet(wb, wc, 'Centri di costo');
      const bd = [...groupBy(rows, r => r.citta + '|' + r.prov)].map(([, v]) => [regOf(v[0]), v[0].citta, v[0].prov, v.length, gSum(v, 'colli'), gSum(v, 'kgReali'), gSum(v, 'kgTass'), gTot(v)]).sort((a, b) => b[7] - a[7]);
      const wd = U.aoa_to_sheet([['Regione', 'Località', 'Provincia', 'Spedizioni', 'Colli', 'Kg reali', 'Kg tassabili', 'Costo'], ...bd]);
      bd.forEach((_, i) => { wd['H' + (i + 2)].z = EUR; }); wd['!cols'] = [18, 26, 9, 10, 8, 10, 12, 12].map(w => ({ wch: w }));
      U.book_append_sheet(wb, wd, 'Destinazioni');
      XLSX.writeFile(wb, `gls-${gMonth}.xlsx`, { compression: true });
      toast('File Excel scaricato');
    } catch (e) { toast(e.message); } finally { busy(); }
  }

  /* =========================================================
     GASOLIO — rifornimenti dei mezzi dalla sede di San Cesareo
     ========================================================= */
  let gasP = '', gasAnim = true, gasF = { q: '', targa: '' }, gasLimit = 80;
  const gasRows = () => db.gasolio || [];
  const gasOk = () => isLocal() || !db.v || db.v >= 'cdc-1.2';
  const gasPrice = () => num(cfg('gasolioPrezzo'));
  const gPrezzo = r => num(r.prezzo) || gasPrice();
  const gCost = arr => arr.reduce((s, r) => s + num(r.litri) * gPrezzo(r), 0);
  const plate = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const plateFmt = p => /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(p) ? `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}` : p;
  const L = (v, d = 0) => fmtNum(v, d) + ' L';
  const gasMonths = () => [...new Set(gasRows().map(r => String(r.data).slice(0, 7)).filter(k => /^\d{4}-\d\d$/.test(k)))].sort();
  const gasNorm = s => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase();
  function gasVehicles(all) {
    // statistiche per mezzo calcolate su tutto lo storico (servono i km precedenti)
    const by = groupBy(all, r => plate(r.targa) || '—');
    const out = new Map();
    by.forEach((v, p) => {
      const s = v.slice().sort((a, b) => String(a.data).localeCompare(String(b.data)) || num(a.km) - num(b.km));
      const usi = [...groupBy(s, r => gasNorm(r.uso) || '—')].sort((a, b) => b[1].length - a[1].length);
      const owner = s.map(r => gasNorm(r.proprietario)).filter(Boolean).pop() || '';
      const seg = new Map(); let prev = null;
      s.forEach(r => { const k = num(r.km); if (!k) return; if (prev && k > prev.km && k - prev.km < 5000) seg.set(r.id, k - prev.km); prev = { km: k }; });
      out.set(p, { p, s, uso: usi[0][0], owner, seg });
    });
    return out;
  }

  function renderGas() {
    const months = gasMonths();
    const sel = $('#ga-per');
    if (gasP && !months.includes(gasP)) gasP = '';
    sel.innerHTML = `<option value=""${gasP ? '' : ' selected'}>Tutto il periodo</option>` + months.slice().reverse().map(k => `<option value="${k}"${k === gasP ? ' selected' : ''}>${esc(mLabel(k))}</option>`).join('');
    const opts = ['', ...months.slice().reverse()], ix = opts.indexOf(gasP);
    $('#ga-prev').disabled = ix >= opts.length - 1; $('#ga-next').disabled = ix <= 0;
    sub(ivaLbl() + ' · rifornimenti sede di San Cesareo');
    const all = gasRows();
    const rows = gasP ? all.filter(r => String(r.data).slice(0, 7) === gasP) : all;
    const anim = gasAnim && !reduced(); gasAnim = false;
    const body = $('#ga-body');
    body.classList.toggle('cc-anim', anim);
    const warn = gasOk() ? '' : `<div class="card gl-warn"><b>Aggiorna lo script Google per salvare i dati del gasolio.</b><span>Lo script collegato è la versione ${esc(db.v || '—')}: serve la cdc-1.2 (Code.gs nuovo). Finché non lo aggiorni l'importazione è bloccata.</span></div>`;
    const perL = gasP ? mLabel(gasP) : months.length ? `${mLabel(months[0])} – ${mLabel(months[months.length - 1])}` : '';
    if (!rows.length) {
      body.innerHTML = warn + `<div class="gl-hero ga-hero gl-hero-empty"><div class="gh-top"><div class="gh-art">${gasArt(0)}</div><div class="gh-main"><span class="gh-lbl">Gasolio Attrezzati</span><h3>Nessun rifornimento registrato</h3><p>Importa il tuo file Excel con «Importa» oppure aggiungi un rifornimento.</p></div></div></div>`;
      return;
    }
    const V = gasVehicles(all);
    const lit = gSum(rows, 'litri'), n = rows.length, price = gasPrice();
    const ids = new Set(rows.map(r => r.id));
    let km = 0, kmL = 0;
    V.forEach(x => x.seg.forEach((d, id) => { if (ids.has(id)) { km += d; kmL += num(x.s.find(r => r.id === id).litri); } }));
    const cons = kmL ? km / kmL : 0;
    const cost = gCost(rows), hasCost = rows.some(r => gPrezzo(r) > 0);
    const plates = new Set(rows.map(r => plate(r.targa)));
    const days = new Set(rows.map(r => String(r.data).slice(0, 10))).size;
    const K = [['Rifornimenti', n, v => fmtNum(Math.round(v), 0), `${days} giorni`],
      ['Mezzi', plates.size, v => fmtNum(Math.round(v), 0), `${new Set(rows.map(r => gasNorm(r.operatore)).filter(x => x && x !== '?')).size} operatori`],
      ['Media a pieno', lit / n, v => L(v, 1), `max ${L(Math.max(...rows.map(r => num(r.litri))), 1)}`],
      ['Km percorsi', km, v => fmtNum(v, 0) + ' km', 'tra due rifornimenti'],
      ['Consumo medio', cons, v => fmtNum(v, 1) + ' km/L', cons ? `${fmtNum(100 / cons, 1)} L ogni 100 km` : 'servono i km'],
      hasCost ? ['Costo', cost * gMul(), v => eur0(v), km ? `${fmtNum(cost * gMul() / km, 3)} €/km` : ivaLbl()] : ['Costo', 0, () => '—', 'imposta il prezzo €/L']];
    const prevK = gasP ? months[months.indexOf(gasP) - 1] : null;
    const prevL = prevK ? gSum(all.filter(r => String(r.data).slice(0, 7) === prevK), 'litri') : 0;
    const dl = prevL ? (() => { const p = (lit / prevL - 1) * 100; return `<span class="gl-d ${p > 0 ? 'up' : 'down'}">${p > 0 ? '▲' : '▼'} ${fmtNum(Math.abs(p), 0)}% vs ${esc(MESI[Number(prevK.slice(5)) - 1])}</span>`; })() : '';
    body.innerHTML = warn + `
      <div class="gl-hero ga-hero">
        <div class="gh-top"><div class="gh-art">${gasArt(Math.min(1, lit / Math.max(1, gasP ? Math.max(...months.map(k => gSum(all.filter(r => String(r.data).slice(0, 7) === k), 'litri'))) : lit)))}</div>
        <div class="gh-main">
          <span class="gh-lbl">Gasolio erogato · ${esc(perL)}</span>
          <div class="gh-big k-glit">0 L</div>
          <div class="gh-sub"><span>${n} rifornimenti</span><span>${plates.size} mezzi</span>${hasCost ? `<span>${esc(gE0(cost))} stimati</span>` : `<button class="gh-chip" id="ga-price" type="button">Imposta prezzo €/L</button>`}${dl}</div>
        </div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k"><span>${l}</span><b data-gak="${i}">0</b><small>${s}</small></div>`).join('')}</div>
      </div>
      <div class="card"><div class="card-h"><h3>Mezzi</h3><span class="muted small">${plates.size} mezzi · clic per vedere i rifornimenti</span></div><div class="ga-veh" id="ga-veh"></div></div>
      <div class="card"><div class="card-h"><h3>Linea del tempo</h3><span class="muted small">ogni punto è un rifornimento · grandezza = litri</span></div><div class="ga-tl" id="ga-tl"></div></div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>${gasP ? 'Litri giorno per giorno' : 'Litri mese per mese'}</h3><span class="muted small" id="ga-tr-s"></span></div><div class="mbars ga-bars" id="ga-tr"></div></div>
        <div class="card"><div class="card-h"><h3>Per utilizzo</h3><span class="muted small">da colonna «movimenti»</span></div><div class="bars" id="ga-uso"></div></div>
      </div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Operatori</h3><span class="muted small">chi ha fatto rifornimento</span></div><div id="ga-op"></div></div>
        <div class="card"><div class="card-h"><h3>Giorni della settimana</h3><span class="muted small">litri per giorno</span></div><div id="ga-wd"></div></div>
      </div>
      <div class="card" id="ga-anom"></div>
      <div class="card gl-list"><div class="card-h"><h3>Tutti i rifornimenti</h3><span class="muted small" id="ga-cnt"></span></div>
        <div class="filters gl-f ga-f"><input id="ga-q" type="search" placeholder="Cerca targa, operatore, utilizzo…" value="${esc(gasF.q)}"><select id="ga-ft"></select></div>
        <div id="ga-list"></div></div>`;

    countTo($('.k-glit', body), lit, v => L(v, 0));
    $$('[data-gak]', body).forEach(el => { const i = +el.dataset.gak; el._v = 0; if (K[i][1]) countTo(el, K[i][1], K[i][2]); else el.textContent = K[i][2](0); });

    // mezzi
    const vs = [...plates].map(p => { const x = V.get(p) || { s: [], uso: '—', owner: '', seg: new Map() }; const v = rows.filter(r => plate(r.targa) === p); let k = 0, kl = 0; x.seg.forEach((d, id) => { if (v.some(r => r.id === id)) { k += d; kl += num(v.find(r => r.id === id).litri); } }); const last = v.slice().sort((a, b) => String(b.data).localeCompare(String(a.data)))[0]; const kms = x.s.map(r => num(r.km)).filter(Boolean); return { p, v, l: gSum(v, 'litri'), k, cons: kl ? k / kl : 0, uso: x.uso, owner: x.owner, last, odo: kms.length ? Math.max(...kms) : 0 }; }).sort((a, b) => b.l - a.l);
    const mv = Math.max(...vs.map(x => x.l), 1);
    $('#ga-veh').innerHTML = vs.map((x, i) => `<div class="gv-c${gasF.targa === x.p ? ' on' : ''}" data-gtarga="${esc(x.p)}" style="--d:${120 + i * 60}ms">
        <div class="gv-top"><span class="gv-plate"><i>I</i><b>${esc(plateFmt(x.p))}</b></span><span class="gv-l"><b>${L(x.l, 0)}</b><small>${fmtNum(pct(x.l, lit), 0)}%</small></span></div>
        <div class="gv-name">${esc(x.uso)}${x.owner ? ` <em>· ${esc(x.owner)}</em>` : ''}</div>
        <div class="gv-tank"><i style="width:${(x.l / mv * 100).toFixed(1)}%"></i></div>
        <div class="gv-st"><div><small>Pieni</small><b>${x.v.length}</b></div><div><small>Km</small><b>${x.k ? fmtNum(x.k, 0) : '—'}</b></div><div><small>km/L</small><b>${x.cons ? fmtNum(x.cons, 1) : '—'}</b></div><div><small>Ultimo</small><b>${x.last && validD(x.last.data) ? parseD(x.last.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : '—'}</b></div></div>
      </div>`).join('');

    // linea del tempo
    const ds = rows.map(r => parseD(r.data).getTime()).filter(t => !isNaN(t));
    let t0 = Math.min(...ds), t1 = Math.max(...ds);
    if (gasP) { const [y, m] = gasP.split('-').map(Number); t0 = new Date(y, m - 1, 1).getTime(); t1 = new Date(y, m, 0).getTime(); }
    const span = Math.max(1, t1 - t0), W = 1000, LH = 34, PL = 112, PR = 16;
    const lanes = vs.map(x => x.p), H = lanes.length * LH + 30, mxL = Math.max(...rows.map(r => num(r.litri)), 1);
    const X = t => PL + (t - t0) / span * (W - PL - PR);
    const ticks = []; { const d = new Date(t0); d.setDate(1); if (d.getTime() < t0) d.setMonth(d.getMonth() + (gasP ? 0 : 1)); if (gasP) { for (let i = 1; i <= new Date(t1).getDate(); i += 5) ticks.push([new Date(new Date(t0).getFullYear(), new Date(t0).getMonth(), i).getTime(), String(i)]); } else { while (d.getTime() <= t1) { ticks.push([d.getTime(), MESI[d.getMonth()].slice(0, 3)]); d.setMonth(d.getMonth() + 1); } } }
    $('#ga-tl').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="ga-tsvg">
      ${ticks.map(([t, l]) => `<line class="ga-tk" x1="${X(t).toFixed(1)}" x2="${X(t).toFixed(1)}" y1="0" y2="${H - 22}"/><text class="ga-tkl" x="${X(t).toFixed(1)}" y="${H - 6}">${esc(l)}</text>`).join('')}
      ${lanes.map((p, i) => { const y = i * LH + LH / 2; const pts = rows.filter(r => plate(r.targa) === p).sort((a, b) => String(a.data).localeCompare(String(b.data)));
        return `<g class="ga-lane" data-gtarga="${esc(p)}"><text class="ga-ll" x="0" y="${y + 4}">${esc(plateFmt(p))}</text><line class="ga-lt" x1="${PL}" x2="${W - PR}" y1="${y}" y2="${y}"/>
          ${pts.length > 1 ? `<path class="ga-lp" pathLength="1" style="--d:${300 + i * 90}ms" d="M${pts.map(r => `${X(parseD(r.data).getTime()).toFixed(1)} ${y}`).join(' L')}"/>` : ''}
          ${pts.map((r, j) => `<circle class="ga-dot" data-gas="${esc(r.id)}" style="--d:${500 + i * 90 + j * 40}ms" cx="${X(parseD(r.data).getTime()).toFixed(1)}" cy="${y}" r="${(3 + 7 * Math.sqrt(num(r.litri) / mxL)).toFixed(1)}"><title>${esc(shortDate(r.data))} · ${esc(L(num(r.litri), 2))}${num(r.km) ? ' · ' + fmtNum(num(r.km), 0) + ' km' : ''}${r.operatore ? ' · ' + esc(r.operatore) : ''}</title></circle>`).join('')}</g>`; }).join('')}
    </svg>`;

    // andamento
    if (gasP) {
      const [yy, mm] = gasP.split('-').map(Number), nd = new Date(yy, mm, 0).getDate(), byD = groupBy(rows, r => String(r.data).slice(0, 10));
      const dd = [...Array(nd)].map((_, i) => { const v = byD.get(`${gasP}-${pad(i + 1)}`) || []; return { l: i + 1, v: gSum(v, 'litri'), n: v.length }; }), md = Math.max(...dd.map(x => x.v), 1);
      $('#ga-tr').innerHTML = dd.map((x, i) => `<div class="mb" title="${x.l} ${esc(MESI[mm - 1])}: ${esc(L(x.v, 1))}"><span class="mbv">${x.v ? fmtNum(x.v, 0) : ''}</span><i class="${x.v === md ? 'cur' : ''}" style="height:${x.v ? Math.max(3, x.v / md * 100) : 0}%;animation-delay:${i * 18}ms"></i><span class="mbl">${x.l % 5 === 1 ? x.l : ''}</span></div>`).join('');
      $('#ga-tr-s').textContent = `${days} giorni con rifornimenti`;
    } else {
      const mm = months.map(k => ({ k, v: gSum(all.filter(r => String(r.data).slice(0, 7) === k), 'litri') })), mx = Math.max(...mm.map(x => x.v), 1);
      $('#ga-tr').innerHTML = mm.map((x, i) => `<div class="mb gl-mb" data-gaper="${x.k}" title="${esc(mLabel(x.k))}: ${esc(L(x.v, 1))}"><span class="mbv">${fmtNum(x.v, 0)} L</span><i class="${x.v === mx ? 'cur' : ''}" style="height:${Math.max(3, x.v / mx * 100)}%;animation-delay:${i * 60}ms"></i><span class="mbl">${esc(MESI[Number(x.k.slice(5)) - 1].slice(0, 3))}</span></div>`).join('');
      $('#ga-tr-s').textContent = `media ${L(lit / (months.length || 1), 0)} al mese`;
    }
    // utilizzo
    const byU = [...groupBy(rows, r => gasNorm(r.uso) || '—')].map(([k, v]) => ({ k, v: gSum(v, 'litri'), n: v.length })).sort((a, b) => b.v - a.v);
    const mu = Math.max(...byU.map(x => x.v), 1);
    $('#ga-uso').innerHTML = byU.slice(0, 10).map((x, i) => `<div class="bar-row gl-anim-row" style="--d:${200 + i * 50}ms"><div class="bar-top"><span>${esc(x.k)}<em>${x.n} ${x.n === 1 ? 'pieno' : 'pieni'}</em></span><span>${L(x.v, 0)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(x.v / mu * 100).toFixed(2)}%"></div></div></div>`).join('');
    // operatori
    const byO = [...groupBy(rows, r => { const o = gasNorm(r.operatore); return o && o !== '?' ? o : 'Non indicato'; })].map(([k, v]) => ({ k, v: gSum(v, 'litri'), n: v.length })).sort((a, b) => b.v - a.v);
    $('#ga-op').innerHTML = `<div class="ga-ops">${byO.map((x, i) => `<div class="ga-op${x.k === 'Non indicato' ? ' na' : ''}" style="--d:${150 + i * 70}ms"><span class="ga-av">${esc(x.k === 'Non indicato' ? '?' : x.k.slice(0, 2))}</span><span class="ga-om"><b>${esc(x.k.charAt(0) + x.k.slice(1).toLowerCase())}</b><small>${x.n} ${x.n === 1 ? 'rifornimento' : 'rifornimenti'} · ${fmtNum(pct(x.v, lit), 0)}%</small><span class="gd-b"><i style="width:${(x.v / byO[0].v * 100).toFixed(1)}%"></i></span></span><b>${L(x.v, 0)}</b></div>`).join('')}</div>`;
    // giorni della settimana
    const WD = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], wd = WD.map(() => ({ v: 0, n: 0 }));
    rows.forEach(r => { if (!validD(r.data)) return; const d = (parseD(r.data).getDay() + 6) % 7; wd[d].v += num(r.litri); wd[d].n++; });
    const mw = Math.max(...wd.map(x => x.v), 1);
    $('#ga-wd').innerHTML = `<div class="ga-wd">${wd.map((x, i) => `<div class="ga-w" style="--d:${150 + i * 60}ms"><div class="ga-wb"><i style="height:${(x.v / mw * 100).toFixed(1)}%"></i></div><b>${x.v ? fmtNum(x.v, 0) : '–'}</b><small>${WD[i]}</small><em>${x.n ? x.n + (x.n === 1 ? ' pieno' : ' pieni') : ''}</em></div>`).join('')}</div>`;

    renderGasAnom(rows, V);
    $('#ga-ft').innerHTML = `<option value="">Tutti i mezzi</option>` + vs.map(x => `<option value="${esc(x.p)}"${gasF.targa === x.p ? ' selected' : ''}>${esc(plateFmt(x.p))} · ${esc(x.uso)}</option>`).join('');
    renderGasList(rows);
  }

  function renderGasList(rows) {
    rows = rows || (gasP ? gasRows().filter(r => String(r.data).slice(0, 7) === gasP) : gasRows());
    const q = gasF.q.trim().toLowerCase();
    const Ls = rows.filter(r => (!gasF.targa || plate(r.targa) === gasF.targa) && (!q || `${r.targa} ${plate(r.targa)} ${r.operatore} ${r.uso} ${r.proprietario} ${r.note}`.toLowerCase().includes(q)))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || num(b.km) - num(a.km));
    $('#ga-cnt').textContent = `${Ls.length} rifornimenti · ${L(gSum(Ls, 'litri'), 1)}`;
    const sh = Ls.slice(0, gasLimit);
    const more = Ls.length > gasLimit ? `<div class="more-row"><button class="btn sm" id="ga-more">Mostra tutti (${Ls.length})</button></div>` : '';
    if (!Ls.length) { $('#ga-list').innerHTML = '<div class="empty">Nessun rifornimento</div>'; return; }
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    if (isDesk()) {
      $('#ga-list').innerHTML = `<table class="tbl gl-st"><thead><tr><th>Data</th><th>Targa</th><th>Utilizzo</th><th>Operatore</th><th>Proprietario</th><th class="r">Km</th><th class="r">Litri</th><th class="r">€/L</th><th class="r">Costo</th></tr></thead><tbody>
        ${sh.map(r => `<tr data-gas="${esc(r.id)}"><td class="d">${dd(r.data)}</td><td><span class="gv-plate sm"><i>I</i><b>${esc(plateFmt(plate(r.targa)))}</b></span></td><td class="m2">${esc(r.uso)}</td><td class="m2">${esc(r.operatore || '—')}</td><td class="m2">${esc(r.proprietario || '—')}</td><td class="num">${num(r.km) ? fmtNum(num(r.km), 0) : '<span class="chip soon">—</span>'}</td><td class="num amt">${fmtNum(num(r.litri), 2)}</td><td class="num">${gPrezzo(r) ? fmtNum(gPrezzo(r) * gMul(), 3) : '—'}</td><td class="num">${gPrezzo(r) ? gE(num(r.litri) * gPrezzo(r)) : '—'}</td></tr>`).join('')}</tbody></table>${more}`;
    } else {
      $('#ga-list').innerHTML = `<div class="list">${sh.map(r => `<div class="item" data-gas="${esc(r.id)}"><span class="ic ga-ic"><svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg></span><div class="main"><div class="t">${esc(plateFmt(plate(r.targa)))} · ${esc(r.uso)}</div><div class="s">${dd(r.data)} · ${esc(r.operatore || '—')}${num(r.km) ? ' · ' + fmtNum(num(r.km), 0) + ' km' : ''}</div></div><div class="amt">${fmtNum(num(r.litri), 1)} L</div></div>`).join('')}</div>${more}`;
    }
  }

  function renderGasAnom(rows, V) {
    const A = [], ids = new Set(rows.map(r => r.id));
    const noKm = rows.filter(r => !num(r.km));
    if (noKm.length) A.push({ t: 'warn', h: 'Chilometri mancanti', d: `${noKm.length} rifornimenti senza km: non si può calcolare il consumo di quei pieni (${[...new Set(noKm.map(r => plateFmt(plate(r.targa))))].join(', ')}).`, v: L(gSum(noKm, 'litri'), 0), ids: noKm.map(r => r.id) });
    V.forEach(x => { let prev = null; x.s.forEach(r => { const k = num(r.km); if (!k) return; if (prev && k < prev.km && ids.has(r.id)) A.push({ t: 'warn', h: `Km che tornano indietro · ${plateFmt(x.p)}`, d: `Il ${esc(shortDate(r.data))} risultano ${fmtNum(k, 0)} km, ma il ${esc(shortDate(prev.r.data))} erano ${fmtNum(prev.km, 0)} km. Probabile errore di data o di battitura.`, v: fmtNum(k - prev.km, 0) + ' km', ids: [prev.r.id, r.id] }); if (prev && k - prev.km >= 5000 && ids.has(r.id)) A.push({ t: 'info', h: `Salto di km anomalo · ${plateFmt(x.p)}`, d: `Tra il ${esc(shortDate(prev.r.data))} e il ${esc(shortDate(r.data))} risultano ${fmtNum(k - prev.km, 0)} km.`, v: 'verificare', ids: [prev.r.id, r.id] }); prev = { km: k, r }; }); });
    const ps = [...new Set(rows.map(r => plate(r.targa)))], lev = (a, b) => { if (a.length !== b.length) return 9; let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) if (lev(ps[i], ps[j]) === 1) { const v = rows.filter(r => [ps[i], ps[j]].includes(plate(r.targa))); A.push({ t: 'info', h: 'Targhe quasi uguali', d: `${plateFmt(ps[i])} e ${plateFmt(ps[j])} differiscono di un solo carattere: controlla se è lo stesso mezzo.`, v: v.length + ' pieni', ids: v.map(r => r.id) }); }
    const big = rows.filter(r => num(r.litri) > 70);
    if (big.length) A.push({ t: 'info', h: 'Rifornimenti molto grandi', d: `${big.length} rifornimenti oltre 70 litri: verificare se il serbatoio del mezzo li può contenere.`, v: L(gSum(big, 'litri'), 0), ids: big.map(r => r.id) });
    const noOp = rows.filter(r => !String(r.operatore || '').trim() || String(r.operatore).trim() === '?');
    if (noOp.length) A.push({ t: 'info', h: 'Operatore non indicato', d: `${noOp.length} rifornimenti senza chi li ha fatti.`, v: L(gSum(noOp, 'litri'), 0), ids: noOp.map(r => r.id) });
    const fix = rows.filter(r => /data corretta/i.test(r.note || ''));
    if (fix.length) A.push({ t: 'info', h: 'Date corrette in importazione', d: fix.map(r => `${plateFmt(plate(r.targa))}: ${esc(r.note)}`).join(' · '), v: fix.length + '', ids: fix.map(r => r.id) });
    const I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    $('#ga-anom').innerHTML = `<div class="card-h"><h3>Controlli</h3><span class="muted small">${A.length ? A.length + ' punti da verificare' : 'tutto in ordine'}</span></div>` +
      (A.length ? `<div class="gl-an">${A.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms" data-gaq="${esc(x.ids.join(' '))}"><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span></div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Nessuna anomalia</div>');
  }

  // grafica: indicatore carburante con lancetta e goccia con liquido
  function gasArt(level) {
    const lv = Math.max(.08, Math.min(1, level || .6));
    const cx = 420, cy = 178, R = 82, a0 = Math.PI * 1.1, a1 = Math.PI * 1.9;
    const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const ticks = [...Array(21)].map((_, i) => { const a = a0 + (a1 - a0) * i / 20, [x1, y1] = pt(a, R), [x2, y2] = pt(a, R - (i % 5 ? 7 : 14)); return `<line class="gg-t${i % 5 ? '' : ' m'}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join('');
    const [ax, ay] = pt(a0, R + 12), [bx, by] = pt(a1, R + 12);
    const arc = `M${pt(a0, R + 4).map(v => v.toFixed(1)).join(' ')} A${R + 4} ${R + 4} 0 0 1 ${pt(a1, R + 4).map(v => v.toFixed(1)).join(' ')}`;
    const deg = (a0 + (a1 - a0) * lv) * 180 / Math.PI + 90;
    const dy = 172 - 128 * lv;
    return `<svg viewBox="250 22 390 232" aria-hidden="true" class="gh-svg ga-svg" preserveAspectRatio="xMaxYMid meet">
      <defs><pattern id="gadots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" opacity=".12"/></pattern>
      <clipPath id="gadrop"><path d="M560 40 C560 40 518 96 518 128 a42 42 0 0 0 84 0 C602 96 560 40 560 40Z"/></clipPath>
      <linearGradient id="galiq" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#f39c34"/></linearGradient></defs>
      <rect x="250" y="22" width="390" height="232" fill="url(#gadots)"/>
      <path class="ga-pipe" d="M250 236 C 300 236 320 214 360 226 S 420 244 470 236 S 540 222 560 172" pathLength="1"/>
      <path class="ga-pulse" d="M250 236 C 300 236 320 214 360 226 S 420 244 470 236 S 540 222 560 172" pathLength="1"/>
      <path class="gg-arc" d="${arc}" pathLength="1"/>
      <path class="gg-lvl" d="${arc}" pathLength="1" style="--lv:${lv.toFixed(3)}"/>
      ${ticks}
      <text class="gg-e" x="${ax.toFixed(1)}" y="${(ay + 4).toFixed(1)}" text-anchor="middle">E</text><text class="gg-e" x="${bx.toFixed(1)}" y="${(by + 4).toFixed(1)}" text-anchor="middle">F</text>
      <g class="gg-ndl" style="--deg:${deg.toFixed(1)}deg"><path d="M${cx - 3} ${cy} L${cx} ${cy - R + 18} L${cx + 3} ${cy} Z"/></g>
      <circle cx="${cx}" cy="${cy}" r="8" class="gg-hub"/><circle cx="${cx}" cy="${cy}" r="3" class="gg-hub2"/>
      <g clip-path="url(#gadrop)"><g class="ga-liq" style="--dy:${dy.toFixed(1)}px">
        <path class="ga-w1" d="M500 0 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V180 H500Z" fill="url(#galiq)" opacity=".55"/>
        <path class="ga-w2" d="M500 4 q15 8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V180 H500Z" fill="url(#galiq)"/>
      </g>${[0, 1, 2, 3].map(i => `<circle class="ga-bub" cx="${544 + i * 11}" cy="160" r="${1.6 + (i % 2)}" style="--d:${(i * .7).toFixed(1)}s"/>`).join('')}</g>
      <path class="ga-drop" d="M560 40 C560 40 518 96 518 128 a42 42 0 0 0 84 0 C602 96 560 40 560 40Z"/>
    </svg>`;
  }

  function formGas(r) {
    if (!gasOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.2)');
    const isNew = !r;
    const last = gasRows().slice().sort((a, b) => String(b.data).localeCompare(String(a.data)))[0] || {};
    r = r || { id: 'f' + uid(), data: today(), targa: '', km: '', litri: '', prezzo: '', proprietario: '', operatore: last.operatore || '', centro: 'ATTREZZATI', uso: '', note: '' };
    const V = gasVehicles(gasRows());
    openSheet(isNew ? 'Nuovo rifornimento' : 'Modifica rifornimento', `
      <div class="f-row">
        <label class="f"><span>Targa</span><input name="targa" required data-focus list="ga-dl-t" value="${esc(r.targa)}" placeholder="Es. GC193WV" autocapitalize="characters"></label>
        <label class="f"><span>Data</span><input name="data" type="date" required value="${esc(validD(r.data) ? r.data : today())}"></label>
      </div>
      <datalist id="ga-dl-t">${[...V.values()].map(x => `<option value="${esc(x.p)}">${esc(x.uso)}</option>`).join('')}</datalist>
      <div class="f-row">
        <label class="f"><span>Litri</span><input name="litri" required inputmode="decimal" value="${esc(fmtIn(r.litri))}" placeholder="0,00"></label>
        <label class="f"><span>Chilometri</span><input name="km" inputmode="numeric" value="${num(r.km) ? esc(String(num(r.km))) : ''}" placeholder="contachilometri"></label>
      </div>
      <div class="f-row">
        <label class="f"><span>Operatore</span><input name="operatore" list="ga-dl-o" value="${esc(r.operatore)}"></label>
        <label class="f"><span>Proprietario</span><input name="proprietario" value="${esc(r.proprietario)}"></label>
      </div>
      <datalist id="ga-dl-o">${[...new Set(gasRows().map(x => gasNorm(x.operatore)).filter(x => x && x !== '?'))].map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <label class="f"><span>Utilizzo / movimento</span><input name="uso" list="ga-dl-u" value="${esc(r.uso)}" placeholder="Es. VASY, GIRI PER BENI"></label>
      <datalist id="ga-dl-u">${[...new Set(gasRows().map(x => gasNorm(x.uso)).filter(Boolean))].map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <div class="f-row">
        <label class="f"><span>Prezzo €/L (no IVA)</span><input name="prezzo" inputmode="decimal" value="${esc(fmtIn(r.prezzo))}" placeholder="${gasPrice() ? 'standard ' + esc(fmtIn(gasPrice())) : 'facoltativo'}"></label>
        <label class="f"><span>Centro di costo</span><input name="centro" value="${esc(r.centro || 'ATTREZZATI')}"></label>
      </div>
      <label class="f"><span>Note</span><input name="note" value="${esc(r.note)}"></label>`,
      fd => {
        const row = { ...r, ...Object.fromEntries(fd), targa: plate(fd.get('targa')), km: num(fd.get('km')) || '', litri: num(fd.get('litri')), prezzo: num(fd.get('prezzo')) || '', operatore: gasNorm(fd.get('operatore')), uso: gasNorm(fd.get('uso')), proprietario: gasNorm(fd.get('proprietario')) };
        if (!row.targa) return toast('Inserisci la targa');
        if (!(row.litri > 0)) return toast('Inserisci i litri');
        write([{ action: 'upsert', sheet: 'Gasolio', row }]);
        toast(isNew ? 'Rifornimento aggiunto' : 'Rifornimento salvato');
        return true;
      },
      isNew ? null : () => { if (!confirm('Eliminare questo rifornimento?')) return; write([{ action: 'delete', sheet: 'Gasolio', id: r.id }]); toast('Rifornimento eliminato'); return true; });
  }
  function formGasPrice() {
    openSheet('Prezzo del gasolio', `<p class="muted small" style="margin:0 0 12px">Prezzo medio al litro IVA esclusa, usato per stimare i costi dei rifornimenti che non hanno un prezzo proprio.</p>
      <label class="f"><span>Prezzo €/L (no IVA)</span><input name="p" inputmode="decimal" data-focus value="${esc(fmtIn(gasPrice() || ''))}" placeholder="Es. 1,45"></label>`,
      fd => { const v = num(fd.get('p')); setConfig('gasolioPrezzo', v > 0 ? v : ''); toast(v > 0 ? 'Prezzo salvato' : 'Prezzo rimosso'); return true; });
  }

  /* ---------- Import / export gasolio ---------- */
  function parseGas(wb) {
    const out = [];
    wb.SheetNames.forEach(name => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '' });
      const hi = aoa.findIndex(r => r.some(c => /^targa/.test(nh(c))) && r.some(c => /^litri/.test(nh(c))));
      if (hi < 0) return;
      const H = aoa[hi].map(nh);
      const col = (...ks) => { for (const k of ks) { const i = H.findIndex(h => h === k); if (i >= 0) return i; } for (const k of ks) { const i = H.findIndex(h => h.startsWith(k)); if (i >= 0) return i; } return -1; };
      const c = { data: col('data'), targa: col('targa', 'targauso', 'mezzo'), km: col('kilometri', 'chilometri', 'km'), litri: col('litri'), prop: col('proprietario'), op: col('operatore'), note: col('note'), uso: col('movimenti', 'movimento', 'utilizzo', 'uso'), prezzo: col('prezzolitro', 'prezzo', 'eurolitro'), imp: col('importo', 'costo', 'totale'), cc: col('centrodicosto', 'centro') };
      const rowsIn = [];
      aoa.slice(hi + 1).forEach(r => {
        const tg = plate(r[c.targa]), lt = num(r[c.litri]);
        if (!tg || !(lt > 0)) return;
        let d = r[c.data];
        if (d instanceof Date) d = new Date(d.getTime() + 12 * 36e5); // evita problemi di fuso
        else if (typeof d === 'number' && d > 20000) d = new Date(Math.round((d - 25569) * 864e5) + 12 * 36e5);
        else { const m = String(d || '').trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); d = m ? new Date(+(m[3].length === 2 ? '20' + m[3] : m[3]), +m[2] - 1, +m[1], 12) : null; }
        if (!d || isNaN(d)) return;
        const kmv = r[c.km], km = typeof kmv === 'number' && kmv > 100 ? Math.round(kmv) : typeof kmv === 'string' && num(kmv) > 100 ? Math.round(num(kmv)) : '';
        let prezzo = c.prezzo >= 0 ? num(r[c.prezzo]) : 0;
        if (!prezzo && c.imp >= 0 && num(r[c.imp])) prezzo = r2(num(r[c.imp]) / lt * 1000) / 1000;
        let note = c.note >= 0 ? String(r[c.note] ?? '').trim() : '', centro = c.cc >= 0 ? gasNorm(r[c.cc]) : '';
        if (/^esempio/i.test(note)) return;
        if (!centro && /^[a-z ]{3,30}$/i.test(note) && note.trim().split(/\s+/).length <= 2) { centro = note.toUpperCase(); note = ''; }
        rowsIn.push({ d, targa: tg, km, litri: r2(lt), prezzo: prezzo || '', proprietario: c.prop >= 0 ? gasNorm(r[c.prop]) : '', operatore: c.op >= 0 ? gasNorm(r[c.op]) : '', centro: centro || 'ATTREZZATI', uso: c.uso >= 0 ? gasNorm(r[c.uso]) : '', note });
      });
      // anno sbagliato (es. 1962): si usa l'anno più frequente del file
      const ys = groupBy(rowsIn.filter(x => x.d.getFullYear() >= 2000), x => x.d.getFullYear()), Y = [...ys].sort((a, b) => b[1].length - a[1].length)[0];
      rowsIn.forEach((x, i) => {
        if (x.d.getFullYear() < 2000 && Y) { const old = x.d.toLocaleDateString('it-IT'); x.d.setFullYear(Y[0]); x.note = `data corretta: nel file era ${old}`; }
        const data = ymd(x.d);
        let h = 0; const s = `${data}|${x.targa}|${x.litri}|${x.km}|${i}`; for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0;
        out.push({ id: 'f' + (h >>> 0).toString(36), data, targa: x.targa, km: x.km, litri: x.litri, prezzo: x.prezzo, proprietario: x.proprietario, operatore: x.operatore, centro: x.centro, uso: x.uso, note: x.note });
      });
    });
    return out;
  }
  async function importGas() {
    if (!gasOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.2)');
    let file; try { file = await pickFile('.xlsx,.xls,.xlsm,.csv'); } catch { return; }
    try {
      busy('Leggo il file…'); await loadXlsx();
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const rows = parseGas(wb); busy();
      if (!rows.length) return toast('Nessun rifornimento trovato: servono le colonne TARGA e LITRI');
      const months = [...new Set(rows.map(r => r.data.slice(0, 7)))].sort();
      const old = gasRows().filter(r => months.includes(String(r.data).slice(0, 7)));
      const fixed = rows.filter(r => /data corretta/.test(r.note)).length, noKm = rows.filter(r => !r.km).length;
      if (!confirm(`${rows.length} rifornimenti · ${fmtNum(gSum(rows, 'litri'), 2)} litri · ${months.map(mLabel).join(', ')}.${old.length ? `\nSostituisce i ${old.length} rifornimenti già presenti in questi mesi.` : ''}${fixed ? `\n${fixed} data con anno sbagliato corretta in automatico.` : ''}${noKm ? `\n${noKm} righe senza chilometri validi.` : ''}\nImportare?`)) return;
      const nid = new Set(rows.map(r => r.id));
      write([...old.filter(r => !nid.has(r.id)).map(r => ({ action: 'delete', sheet: 'Gasolio', id: r.id })), ...rows.map(row => ({ action: 'upsert', sheet: 'Gasolio', row }))]);
      gasP = ''; gasAnim = true; render();
      toast(`${rows.length} rifornimenti importati`);
    } catch (e) { busy(); toast(e.message); }
  }
  async function exportGas() {
    const rows = (gasP ? gasRows().filter(r => String(r.data).slice(0, 7) === gasP) : gasRows()).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)));
    if (!rows.length) return toast('Nessun rifornimento');
    try {
      busy('Preparo il file Excel…'); await loadXlsx();
      const U = XLSX.utils, wb = U.book_new(), EUR = '#,##0.000 "€"';
      const H = ['DATA', 'TARGA', 'KILOMETRI', 'LITRI', 'PROPRIETARIO', 'OPERATORE', 'CENTRO DI COSTO', 'MOVIMENTI', 'PREZZO €/L', 'IMPORTO', 'NOTE'];
      const ws = U.aoa_to_sheet([H, ...rows.map(r => [parseD(r.data), r.targa, num(r.km) || '', num(r.litri), r.proprietario || '', r.operatore || '', r.centro || '', r.uso || '', gPrezzo(r) || '', null, r.note || ''])], { cellDates: true });
      rows.forEach((r, i) => { const R = i + 2; ws['A' + R].z = 'dd/mm/yyyy'; ws['D' + R].z = '#,##0.00'; if (ws['I' + R] && ws['I' + R].t === 'n') ws['I' + R].z = EUR; ws['J' + R] = { t: 'n', f: `IF(I${R}="","",D${R}*I${R})`, v: r2(num(r.litri) * gPrezzo(r)), z: '#,##0.00 "€"' }; });
      const Lr = rows.length + 1;
      U.sheet_add_aoa(ws, [['TOTALE']], { origin: 'A' + (Lr + 1) });
      ws['D' + (Lr + 1)] = { t: 'n', f: `SUM(D2:D${Lr})`, v: gSum(rows, 'litri'), z: '#,##0.00' };
      ws['J' + (Lr + 1)] = { t: 'n', f: `SUM(J2:J${Lr})`, v: r2(gCost(rows)), z: '#,##0.00 "€"' };
      ws['!cols'] = [12, 12, 11, 9, 14, 13, 16, 34, 11, 11, 30].map(w => ({ wch: w })); ws['!autofilter'] = { ref: `A1:K${Lr}` };
      U.book_append_sheet(wb, ws, 'Rifornimenti');
      const V = gasVehicles(gasRows());
      const vs = [...groupBy(rows, r => plate(r.targa))].map(([p, v]) => { const x = V.get(p); let k = 0, kl = 0; x.seg.forEach((d, id) => { const z = v.find(r => r.id === id); if (z) { k += d; kl += num(z.litri); } }); return [plateFmt(p), x.uso, v.length, r2(gSum(v, 'litri')), k || '', kl ? r2(k / kl * 10) / 10 : '', r2(gCost(v))]; }).sort((a, b) => b[3] - a[3]);
      const w2 = U.aoa_to_sheet([['TARGA', 'UTILIZZO PRINCIPALE', 'RIFORNIMENTI', 'LITRI', 'KM PERCORSI', 'KM/L', 'COSTO STIMATO'], ...vs]);
      w2['!cols'] = [12, 30, 13, 10, 12, 8, 14].map(w => ({ wch: w }));
      U.book_append_sheet(wb, w2, 'Mezzi');
      XLSX.writeFile(wb, `gasolio-${gasP || 'completo'}.xlsx`);
      busy(); toast('Excel scaricato');
    } catch (e) { busy(); toast(e.message); }
  }

  /* ================= Eventi ================= */
  function bind() {
    window.addEventListener('hashchange', go);
    $('#sheet-form').addEventListener('submit', e => {
      e.preventDefault();
      if (onSubmit && onSubmit(new FormData(e.target)) === true) closeSheet();
    });
    $('#sheet-del').onclick = () => { if (onDelete && onDelete() === true) closeSheet(); };
    $$('[data-close]').forEach(b => (b.onclick = closeSheet));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });
    $('#fab').onclick = () => view === 'gasolio' ? formGas() : formMov(); $('#add-top').onclick = () => formMov();

    document.addEventListener('click', e => {
      const t = e.target;
      const s = t.closest('[data-soc]'); if (s) { soc = s.dataset.soc; LS.set('cdc_soc', soc); if (view === 'centri' || view === 'home') ccAnim = true; render(); return; }
      const go2 = t.closest('[data-go]'); if (go2) { location.hash = go2.dataset.go; return; }
      if (t.closest('#k-zero-card')) { Object.assign(f, { q: '', centro: '', cat: '', per: 'zero' }); location.hash = 'movimenti'; return; }
      const gm = t.closest('[data-gomov]'); if (gm) { Object.assign(f, { q: '', cat: '', per: '', centro: gm.dataset.gomov }); mLimit = 150; location.hash = 'movimenti'; return; }
      const gz = t.closest('[data-gozero]'); if (gz) { Object.assign(f, { q: '', cat: '', per: 'zero', centro: gz.dataset.gozero }); mLimit = 150; location.hash = 'movimenti'; return; }
      const sc = t.closest('.dash [data-centro]'); if (sc) { selectCC(sc.dataset.centro, sc.closest('.view')); return; }
      const bc = t.closest('.bar-row[data-centro], .cc-card[data-centro]'); if (bc) { Object.assign(f, { q: '', cat: '', per: '', centro: bc.dataset.centro }); mLimit = 150; location.hash = 'movimenti'; return; }
      const bk = t.closest('.bar-row[data-cat]'); if (bk) { Object.assign(f, { q: '', centro: '', per: '', cat: bk.dataset.cat }); mLimit = 150; location.hash = 'movimenti'; return; }
      if (t.id === 'm-ckall') { const on = t.checked; $$('#m-list [data-ck]').forEach(c => { const id = c.dataset.ck; on ? sel.add(id) : sel.delete(id); }); renderMov(); return; }
      const ck = t.closest('#m-list [data-ck]'); if (ck) { const id = ck.dataset.ck; sel.has(id) ? sel.delete(id) : sel.add(id); if (t.tagName !== 'INPUT') ck.classList.toggle('sel'); else ck.closest('tr').classList.toggle('sel', t.checked); selBar(); return; }
      if (t.closest('#m-list td.ck')) { const cb = t.closest('td.ck').querySelector('input'); cb.click(); return; }
      if (t.closest('#m-selmode')) { selMode = !selMode; if (!selMode) sel.clear(); renderMov(); return; }
      if (t.closest('#sb-none')) { sel.clear(); selMode = false; renderMov(); return; }
      if (t.closest('#sb-all')) { filtered().forEach(r => sel.add(String(r.id))); if (!isDesk()) selMode = true; renderMov(); return; }
      if (t.closest('#sb-del')) { delSelected(); return; }
      if (t.closest('#m-xls')) { exportXlsx(filtered(), f.per === 'zero' ? 'senza-prezzo' : 'movimenti-filtrati'); return; }
      if (t.closest('#m-imp') || t.closest('#zb-imp')) { importExcel(false); return; }
      const th = t.closest('[data-theme-set]'); if (th) { const v = th.dataset.themeSet; try { localStorage.setItem('cdc_theme', v); } catch {} applyTheme(v, true); toast(v === 'auto' ? 'Tema automatico' : v === 'dark' ? 'Tema scuro' : 'Tema chiaro'); return; }
      if (t.closest('.iva-tg')) { ivaOn = !ivaOn; try { localStorage.setItem('cdc_iva', ivaOn ? '1' : '0'); } catch {} if (view === 'centri' || view === 'home') ccAnim = true; render(); toast(ivaOn ? 'Importi con IVA inclusa' : 'Importi senza IVA'); return; }
      if (t.closest('#ga-imp')) { importGas(); return; }
      if (t.closest('#ga-xls')) { exportGas(); return; }
      if (t.closest('#ga-add')) { formGas(); return; }
      if (t.closest('#ga-price')) { formGasPrice(); return; }
      if (t.closest('#ga-prev') || t.closest('#ga-next')) { const o = [...$('#ga-per').options].map(x => x.value), i = o.indexOf(gasP) + (t.closest('#ga-prev') ? 1 : -1); if (i >= 0 && i < o.length) { gasP = o[i]; gasAnim = true; renderGas(); } return; }
      const gap = t.closest('[data-gaper]'); if (gap) { gasP = gap.dataset.gaper; gasAnim = true; renderGas(); return; }
      const gas = t.closest('[data-gas]'); if (gas) { const r = gasRows().find(x => String(x.id) === gas.dataset.gas); if (r) formGas(r); return; }
      const gat = t.closest('[data-gtarga]'); if (gat) { gasF.targa = gasF.targa === gat.dataset.gtarga ? '' : gat.dataset.gtarga; $$('.gv-c').forEach(x => x.classList.toggle('on', x.dataset.gtarga === gasF.targa)); $('#ga-ft').value = gasF.targa; renderGasList(); if (gasF.targa) $('#ga-list').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const gaq = t.closest('[data-gaq]'); if (gaq) { gasF.q = ''; gasF.targa = ''; $('#ga-q').value = ''; $('#ga-ft').value = ''; const ids = gaq.dataset.gaq.split(' '); renderGasList(gasRows().filter(r => ids.includes(String(r.id)))); $('#ga-cnt').textContent += ' · filtro controllo'; $('#ga-list').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (t.closest('#ga-more')) { gasLimit = 9999; renderGasList(); return; }
      if (t.closest('#gl-imp')) { importGls(); return; }
      if (t.closest('#gl-xls')) { exportGls(); return; }
      if (t.closest('#gl-prev') || t.closest('#gl-next')) { const o = [...$('#gl-mese').options].map(x => x.value), i = o.indexOf(gMonth) + (t.closest('#gl-prev') ? 1 : -1); if (o[i]) { gMonth = o[i]; glsAnim = true; renderGls(); } return; }
      const gmo = t.closest('[data-gmonth]'); if (gmo) { gMonth = gmo.dataset.gmonth; glsAnim = true; renderGls(); return; }
      const gsh = t.closest('[data-gship]'); if (gsh) { glsDetail(gsh.dataset.gship); return; }
      const gq = t.closest('[data-gq]'); if (gq) { gF.q = ''; gF.cdc = ''; gF.contr = ''; renderGlsList(glsRows().filter(r => r.mese === gMonth && gq.dataset.gq.split(' ').includes(String(r.nsped)))); $('#gl-cnt').textContent += ' · filtro anomalia'; $('#gl-ship').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const gcc = t.closest('[data-gcdc]'); if (gcc) { gF.cdc = gcc.dataset.gcdc; $('#gl-fcdc').value = gF.cdc; renderGlsList(); $('#gl-ship').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      if (t.closest('#gl-more')) { gLimit = 9999; renderGlsList(); return; }
      if (t.closest('#a-imp')) { importExcel(false); return; }
      if (t.closest('#a-xls')) { exportXlsx(db.movimenti, 'prodotti'); return; }
      if (t.closest('#zb-auto')) { openAutoPrice(); return; }
      if (t.closest('#zb-xls')) { exportXlsx(filtered(), 'senza-prezzo'); return; }
      const ed = t.closest('td.ed'); if (ed && !ed.querySelector('input,select')) { inlineEdit(ed); return; }
      if (t.closest('td.ed')) return;
      const it = t.closest('[data-id]'); if (it && !t.closest('#sheet-body')) { const r = db.movimenti.find(x => String(x.id) === it.dataset.id); if (r) formMov(r); return; }
      if (it && t.closest('#sheet-body')) { const r = db.movimenti.find(x => String(x.id) === it.dataset.id); if (r) { closeSheet(); setTimeout(() => formMov(r), 250); } return; }
      const ar = t.closest('[data-art]'); if (ar) { openArt(ar.dataset.art); return; }
      if (t.closest('#m-more')) { mLimit += 300; renderMov(); return; }
      if (t.closest('#a-more')) { aLimit += 200; renderArt(); return; }
      if (t.closest('#ai-gen')) { genInsights(); return; }
      const dc = t.closest('[data-delcc]'); if (dc) { const c = dc.dataset.delcc; if (db.movimenti.some(r => r.centro === c)) return toast('Centro in uso nei movimenti'); setConfig('centri', centri().filter(x => x !== c)); return; }
      const dk = t.closest('[data-delcat]'); if (dk) { const c = dk.dataset.delcat; if (db.movimenti.some(r => r.categoria === c)) return toast('Categoria in uso nei movimenti'); setConfig('categorie', categorie().filter(x => x !== c)); return; }
    });

    let qt;
    $('#f-q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { f.q = e.target.value; mLimit = 150; renderMov(); }, 180); });
    $('#f-centro').onchange = e => { f.centro = e.target.value; mLimit = 150; renderMov(); };
    $('#f-cat').onchange = e => { f.cat = e.target.value; mLimit = 150; renderMov(); };
    $('#f-per').onchange = e => { f.per = e.target.value; mLimit = 150; renderMov(); };
    $('#a-q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { a.q = e.target.value; aLimit = 120; renderArt(); }, 180); });
    $('#a-sort').onchange = e => { a.sort = e.target.value; renderArt(); };
    $('#gl-mese').onchange = e => { gMonth = e.target.value; glsAnim = true; renderGls(); };
    $('#ga-per').onchange = e => { gasP = e.target.value; gasAnim = true; renderGas(); };
    document.addEventListener('input', e => { if (e.target.id === 'ga-q') { clearTimeout(qt); qt = setTimeout(() => { gasF.q = e.target.value; renderGasList(); }, 180); } });
    document.addEventListener('change', e => { if (e.target.id === 'ga-ft') { gasF.targa = e.target.value; $$('.gv-c').forEach(x => x.classList.toggle('on', x.dataset.gtarga === gasF.targa)); renderGasList(); } });
    document.addEventListener('input', e => { if (e.target.id === 'gl-q') { clearTimeout(qt); qt = setTimeout(() => { gF.q = e.target.value; renderGlsList(); }, 180); } });
    document.addEventListener('change', e => { if (e.target.id === 'gl-fcdc') { gF.cdc = e.target.value; renderGlsList(); } if (e.target.id === 'gl-fcon') { gF.contr = e.target.value; renderGlsList(); } });
    $('#a-centro').onchange = e => { a.centro = e.target.value; renderArt(); };

    $$('.k-map').forEach(m => { m.addEventListener('mousemove', mapTip); m.addEventListener('mouseleave', () => { const t = $('.cm-tip', m); if (t) t.remove(); }); });

    $('#s-pull').onclick = () => pull(true);
    $('#s-key-go').onclick = async () => {
      const k = $('#s-key').value.trim(); if (!k) return;
      try { busy('Salvo la chiave…'); await api('setKey', { key: k }); db.ai = true; save(); $('#s-key').value = ''; toast('Chiave Gemini salvata'); render(); } catch (e) { toast(e.message); } finally { busy(); }
    };
    $('#s-classify').onclick = classifyAI;
    $('#s-imp-add').onclick = () => importExcel(false);
    $('#s-imp-rep').onclick = () => importExcel(true);
    $('#s-xls').onclick = () => exportXlsx(db.movimenti, 'completo');
    $('#s-budget').addEventListener('change', e => {
      const c = e.target.dataset.bud; if (!c) return;
      const b = { ...budget() }; const v = num(e.target.value);
      if (v > 0) b[c] = v; else delete b[c];
      setConfig('budget', b); toast('Budget salvato');
    });
    const addChip = (inp, key, getter) => { const v = $(inp).value.trim(); if (!v) return; const l = getter(); if (l.includes(v)) return toast('Già presente'); setConfig(key, [...l, key === 'centri' ? v.toUpperCase() : v]); $(inp).value = ''; };
    $('#s-cc-add').onclick = () => addChip('#s-cc-in', 'centri', centri);
    $('#s-cat-add').onclick = () => addChip('#s-cat-in', 'categorie', categorie);

    $('#setup-go').onclick = async () => {
      const v = $('#setup-url').value.trim();
      const err = $('#setup-err'); err.hidden = true;
      if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(v)) { err.textContent = 'URL non valido: deve iniziare con https://script.google.com/'; err.hidden = false; return; }
      try {
        busy('Collego…');
        const r = await fetch(v + (v.includes('?') ? '&' : '?') + 'action=all');
        const j = await r.json();
        if (!j.ok) throw new Error(j.error);
        url = v; LS.set('cdc_url', url);
        db = { movimenti: j.data.movimenti || [], config: j.data.config || {}, ai: !!j.data.ai, v: j.v }; save();
        start();
      } catch (e) { err.textContent = 'Collegamento non riuscito. Controlla che l\'App web sia accessibile a «Chiunque».'; err.hidden = false; } finally { busy(); }
    };
    $('#setup-local').onclick = () => { url = 'local'; LS.set('cdc_url', url); start(); };

    window.addEventListener('online', () => { online = true; flush(); setSync(); });
    window.addEventListener('offline', () => { online = false; setSync(); });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (view === 'movimenti' || view === 'articoli') render(); }, 200); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && url && !isLocal()) pull(); });
  }

  function start() {
    const linked = !!url;
    $('#setup').hidden = linked; $('#app').hidden = !linked;
    if (!linked) return;
    setSync(); go();
    if (!isLocal()) pull();
  }

  bind();
  applyTheme(getTheme());
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (getTheme() === 'auto') applyTheme('auto'); });
  start();
  intro();

  /* ================= Splash: S.V.CAR → logo ================= */
  function intro() {
    const sp = $('#splash'); if (!sp) return;
    const q = id => document.getElementById('spx-' + id);
    const E = {
      out3: t => 1 - Math.pow(1 - t, 3), out5: t => 1 - Math.pow(1 - t, 5), in3: t => t * t * t,
      io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      back: t => { const c = 1.55; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    };
    let skip = false, t0 = performance.now();
    const tw = (delay, dur, ease, fn) => new Promise(res => {
      const step = now => {
        if (skip) { fn(1); return res(); }
        const k = Math.min(1, Math.max(0, (now - t0 - delay) / dur));
        if (now - t0 >= delay) fn(ease(k));
        k < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
    const lerp = (a, b, k) => a + (b - a) * k;
    const letters = ['S', 'C', 'A', 'R'].map(q), V = q('V'), Ln = q('L'), dots = [q('D1'), q('D2')];
    const ic = q('ic'), sq = q('sq'), ring = q('ring'), hand = q('hand'), slice = q('slice');
    const title = $('.spx-t', sp), stage = $('.spx-stage', sp), bg = $('.spx-bg', sp);

    // campiona una forma in N punti nel sistema dell'SVG
    const N = 140;
    const sample = (el, sx, sy, tx, ty) => { const L = el.getTotalLength(), pts = []; for (let i = 0; i < N; i++) { const p = el.getPointAtLength(L * i / N); pts.push([p.x * sx + tx, p.y * sy + ty]); } return pts; };
    const area = P => P.reduce((a, p, i) => { const n = P[(i + 1) % P.length]; return a + p[0] * n[1] - n[0] * p[1]; }, 0);
    const align = (A, B) => { if (Math.sign(area(A)) !== Math.sign(area(B))) B = B.slice().reverse(); let best = 0, bd = Infinity; for (let o = 0; o < N; o += 2) { let d = 0; for (let i = 0; i < N; i += 4) { const b = B[(i + o) % N]; d += (A[i][0] - b[0]) ** 2 + (A[i][1] - b[1]) ** 2; } if (d < bd) { bd = d; best = o; } } return B.map((_, i) => B[(i + best) % N]); };
    const poly = (A, B, k) => 'M' + A.map((a, i) => `${lerp(a[0], B[i][0], k).toFixed(2)} ${lerp(a[1], B[i][1], k).toFixed(2)}`).join('L') + 'Z';
    const set = (el, o) => Object.entries(o).forEach(([k, v]) => (el.style[k] = v));

    const finish = () => {
      if (finish.done) return; finish.done = true;
      const target = [...$$('.nav .brand img, .top-logo')].find(e => e.offsetParent && e.getBoundingClientRect().width > 0);
      const a = ic.getBoundingClientRect(), dur = reduced() ? 1 : 620;
      title.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: dur * .45, fill: 'forwards' });
      bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, delay: dur * .25, easing: 'ease', fill: 'forwards' });
      if (target && a.width) {
        const b = target.getBoundingClientRect(), w = stage.getBoundingClientRect(), s = b.width / a.width;
        const tx = b.left - w.left - (a.left - w.left) * s, ty = b.top - w.top - (a.top - w.top) * s;
        stage.animate([{ transform: 'none' }, { transform: `translate(${tx}px,${ty}px) scale(${s})` }], { duration: dur, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
      } else stage.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(1.04)' }], { duration: dur, fill: 'forwards' });
      setTimeout(() => sp.remove(), dur + 80);
    };
    sp.addEventListener('click', () => { skip = true; });

    if (reduced()) { ['wm'].forEach(id => (q(id).style.opacity = 0)); set(ic, { opacity: 1 }); [sq, ring, hand, slice].forEach(e => set(e, { opacity: 1, strokeDashoffset: 0, transform: 'none' })); sq.setAttribute('rx', 116); set(title, { opacity: 1 }); return setTimeout(finish, 500); }

    // 1 · comparsa del marchio
    letters.forEach((el, i) => { set(el, { opacity: 0 }); tw(80 + i * 75, 650, E.out5, k => set(el, { opacity: k, transform: `translateY(${(1 - k) * 9}px)` })); });
    set(V, { opacity: 0 }); tw(260, 520, E.out3, k => set(V, { opacity: k, transform: `translateY(${(1 - k) * -10}px) scale(${.8 + .2 * k})` }));
    const sw = q('sweep-r'); tw(420, 620, E.io, k => sw.setAttribute('width', 130 * k));
    dots.forEach((d, i) => { set(d, { opacity: 0 }); tw(820 + i * 90, 420, E.back, k => set(d, { opacity: Math.min(1, k * 2), transform: `scale(${k})` })); });
    const sh = q('shine'); tw(1050, 650, E.io, k => { sh.setAttribute('opacity', .9); sh.setAttribute('x', lerp(-160, 620, k)); });

    // 2 · il marchio si raccoglie nel logo
    const wm = q('wm'), cx = (300 + 61.5) / 3, cy = (150 + 83.6) / 3;
    const T2 = 1850;
    letters.concat(dots).forEach((el, i) => {
      const b = el.getBBox(), dx = cx - (b.x + b.width / 2), dy = cy - (b.y + b.height / 2);
      tw(T2 + i * 25, 520, E.in3, k => set(el, { transform: `translate(${dx * k}px,${dy * k}px) scale(${1 - .85 * k})`, opacity: 1 - k }));
    });
    const tgt = sample(slice, .3125, .3125, 220, 70);
    const s1 = sample(Ln, 3, 3, -61.5, -83.6), s2 = sample(V, 3, 3, -61.5, -83.6);
    const t1 = align(s1, tgt), t2 = align(s2, tgt);
    const m1 = q('m1'), m2 = q('m2');
    tw(T2 + 60, 760, E.io, k => {
      if (k > 0) { Ln.style.opacity = 0; V.style.opacity = 0; m1.style.opacity = 1; m2.style.opacity = 1 - k * .9; }
      m1.setAttribute('d', poly(s1, t1, k)); m2.setAttribute('d', poly(s2, t2, k)); m1.style.strokeWidth = m2.style.strokeWidth = (8.1 * k).toFixed(2);
    });
    set(ic, { opacity: 1 });
    tw(T2 + 220, 700, E.back, k => { set(sq, { opacity: Math.min(1, k * 3), transform: `scale(${Math.max(0, k)})` }); sq.setAttribute('rx', lerp(256, 116, Math.min(1, Math.max(0, k)))); });
    tw(T2 + 820, 10, E.out3, () => { set(slice, { opacity: 1 }); m1.style.opacity = 0; m2.style.opacity = 0; });
    tw(T2 + 640, 620, E.io, k => set(ring, { opacity: 1, strokeDashoffset: 1 - k }));
    tw(T2 + 860, 420, E.out3, k => set(hand, { opacity: 1, strokeDashoffset: 1 - k }));
    tw(T2 + 1000, 600, E.out5, k => set(title, { opacity: k, transform: `translateY(${(1 - k) * 12}px)` }))
      .then(() => setTimeout(finish, skip ? 0 : 650));
    void wm;
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
