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
  if (!db.fatture) db.fatture = [];
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
  const KEY = { Movimenti: 'movimenti', GLS: 'gls', Gasolio: 'gasolio', Fatture: 'fatture', Lyreco: 'lyreco', LyrecoFatture: 'lyfatture', Amazon: 'amazon', AmazonArticoli: 'amazonart' };
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

  // accesso: token di sessione rilasciato dallo script dopo la password (la password non viene salvata)
  let tok = LS.get('cdc_tok', '');
  class AuthError extends Error {}
  async function post(action, extra) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: tok, ...extra }), credentials: 'omit', referrerPolicy: 'no-referrer' });
    const j = await r.json();
    if (!j.ok && j.auth) { lockApp(j.error); throw new AuthError(j.error); }
    if (!j.ok) throw new Error(j.error || 'Errore');
    return j;
  }
  async function api(action, extra) { return (await post(action, extra)).result; }
  function lockApp(msg) {
    tok = ''; LS.set('cdc_tok', '');
    db = { movimenti: [], config: {}, ai: false, gls: [], gasolio: [], pdf: [], fatture: [], lyreco: [], lyfatture: [], amazon: [], amazonart: [] };
    try { localStorage.removeItem('cdc_data'); } catch {}
    showLogin(msg);
  }
  function showLogin(msg) {
    $('#app').hidden = true; $('#setup').hidden = false;
    const e = $('#login-err'); e.hidden = !msg; e.textContent = msg || '';
    setTimeout(() => $('#login-pw') && $('#login-pw').focus(), 60);
  }
  async function doLogin(ev) {
    ev.preventDefault();
    const pw = $('#login-pw').value, err = $('#login-err'); err.hidden = true;
    if (!pw) return;
    const btn = $('#login-go'); btn.disabled = true; btn.textContent = 'Verifico…';
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'login', password: pw, device: (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '' }), credentials: 'omit', referrerPolicy: 'no-referrer' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Accesso non riuscito');
      tok = j.result; LS.set('cdc_tok', tok);
      $('#login-pw').value = '';
      start(); toast('Accesso effettuato');
    } catch (e) { err.textContent = e instanceof TypeError ? 'Nessuna connessione: riprova' : e.message; err.hidden = false; }
    finally { btn.disabled = false; btn.textContent = 'Entra'; }
  }
  async function flush() {
    if (isLocal() || syncing || !queue.length || !url) return setSync();
    syncing = true; setSync();
    const batch = queue.slice();
    try {
      await api('batch', { ops: batch });
      queue = queue.slice(batch.length); save(); online = true;
    } catch (e) {
      if (e instanceof AuthError) { syncing = false; return; }
      if (e instanceof TypeError) online = false; else toast('Errore salvataggio: ' + e.message);
    } finally { syncing = false; setSync(); }
    if (queue.length && online) setTimeout(flush, 4000);
  }
  async function pull(showToast) {
    if (isLocal()) { if (showToast) toast('Modalità solo dispositivo'); return; }
    try {
      setSync('Aggiorno…');
      if (!tok) { showLogin(); return; }
      const j = await post('all');
      db = { movimenti: j.data.movimenti || [], config: j.data.config || {}, ai: !!j.data.ai, v: j.v, gls: j.data.gls || (j.v >= 'cdc-1.1' ? [] : db.gls || []), gasolio: j.data.gasolio || (j.v >= 'cdc-1.2' ? [] : db.gasolio || []), pdf: j.data.pdf || [], fatture: j.data.fatture || (j.v >= 'cdc-1.4' ? [] : db.fatture || []), lyreco: j.data.lyreco || (j.v >= 'cdc-1.6' ? [] : db.lyreco || []), lyfatture: j.data.lyfatture || (j.v >= 'cdc-1.6' ? [] : db.lyfatture || []), amazon: j.data.amazon || (j.v >= 'cdc-1.7' ? [] : db.amazon || []), amazonart: j.data.amazonart || (j.v >= 'cdc-1.7' ? [] : db.amazonart || []) };
      applyMany(queue);
      online = true; save(); render();
      if (showToast) toast('Dati aggiornati');
    } catch (e) {
      if (e instanceof AuthError) return;
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
  const TITLES = { home: 'Dashboard', attrezzatura: 'Attrezzatura', movimenti: 'Attrezzatura', articoli: 'Attrezzatura', gls: 'GLS Attrezzati', gasolio: 'Gasolio', fatture: 'Fatture', torental: 'Torental', lyreco: 'Lyreco', amazon: 'Amazon', impostazioni: 'Impostazioni' };
  let prevView = '', gKeep = false;
  function go() {
    prevView = view;
    const h = location.hash.slice(1) || 'home';
    view = TITLES[h] ? h : 'home';
    if (view === 'attrezzatura') ccAnim = true;
    if (view === 'home') ovAnim = true;
    if (view === 'gls') { glsAnim = true; if (prevView !== 'gls' && !gKeep) gMonth = ALLM; gKeep = false; }
    if (view === 'gasolio') gasAnim = true;
    if (view === 'fatture') faAnim = true;
    if (view === 'torental') trAnim = true;
    if (view === 'lyreco') lyAnim = true;
    if (view === 'amazon') amAnim = true;
    $$('.view').forEach(v => (v.hidden = v.dataset.v !== view));
    const navV = ['movimenti', 'articoli'].includes(view) ? 'attrezzatura' : view;
    $$('.nav a').forEach(x => x.classList.toggle('active', x.dataset.view === navV));
    $$('.sub-tabs a').forEach(x => x.classList.toggle('on', x.dataset.st === view));
    $('#title').textContent = TITLES[view];
    $('#fab').hidden = view === 'impostazioni' || view === 'gls' || view === 'home' || view === 'torental' || view === 'lyreco' || view === 'amazon';
    $('#add-top').style.visibility = view === 'gls' || view === 'gasolio' || view === 'home' || view === 'fatture' || view === 'torental' || view === 'lyreco' || view === 'amazon' ? 'hidden' : '';
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
    const fn = { home: renderOverview, attrezzatura: renderHome, movimenti: renderMov, articoli: renderArt, gls: renderGls, gasolio: renderGas, fatture: renderFat, torental: renderTor, lyreco: renderLy, amazon: renderAm, impostazioni: renderSettings }[view];
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

    renderDash($('#v-attr'), { matrix: true });
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
    $('#sheet-form').classList.remove('wide', 'xwide');
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
  const ALLM = 'tutto', gIn = r => gMonth === ALLM || r.mese === gMonth;
  const gPer = () => { if (gMonth !== ALLM) return mLabel(gMonth); const m = glsMonths(); return m.length ? `${mLabel(m[0])} – ${mLabel(m[m.length - 1])}` : ''; };
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

  function glsPdf() {
    const a = $('#gl-pdf'), up = $('#gl-pdfup'); if (!a) return;
    const has = gMonth !== ALLM && (db.pdf || []).includes(gMonth);
    a.hidden = !has; up.hidden = gMonth === ALLM || has || isLocal();
  }
  async function openPdf() {
    const m = gMonth;
    try {
      busy('Apro l\'analisi…');
      const b64 = await api('pdf', { mese: m });
      const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const href = URL.createObjectURL(new Blob([u8], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = href; a.download = `Analisi GLS ${mLabel(m)}.pdf`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 60000);
    } catch (e) { if (!(e instanceof AuthError)) toast(e.message); } finally { busy(); }
  }
  async function uploadPdf() {
    const m = gMonth;
    let file; try { file = await pickFile('application/pdf,.pdf'); } catch { return; }
    if (file.size > 15 * 1024 * 1024) return toast('PDF troppo grande (massimo 15 MB)');
    try {
      busy('Carico il PDF…');
      const buf = new Uint8Array(await file.arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
      db.pdf = await api('uploadPdf', { mese: m, data: btoa(bin) }); save(); glsPdf();
      toast(`Analisi di ${mLabel(m)} salvata nel tuo Google Drive`);
    } catch (e) { if (!(e instanceof AuthError)) toast(e.message); } finally { busy(); }
  }
  const sgn = p => (p > 0 ? '+' : p < 0 ? '−' : '') + fmtNum(Math.abs(p), 0) + '%';

  function renderGls() {
    const months = glsMonths();
    const cur = ymOf(new Date());
    if (!gMonth && months.length) gMonth = ALLM;
    if (gMonth !== ALLM && !months.includes(gMonth)) gMonth = months.includes(cur) ? cur : months[months.length - 1] || cur;
    const sel = $('#gl-mese');
    const opts = [...new Set([...months, cur])].sort().reverse();
    if (months.length) opts.unshift(ALLM);
    sel.innerHTML = opts.map(k => k === ALLM ? `<option value="${ALLM}"${gMonth === ALLM ? ' selected' : ''}>Tutto il periodo</option>` : `<option value="${k}"${k === gMonth ? ' selected' : ''}>${esc(mLabel(k))}${months.includes(k) ? '' : ' · da caricare'}</option>`).join('');
    const ix = opts.indexOf(gMonth);
    $('#gl-prev').disabled = ix >= opts.length - 1; $('#gl-next').disabled = ix <= 0;
    sub(ivaLbl() + ' · spedizioni GLS da Roma');
    glsPdf();
    const rows = glsRows().filter(gIn);
    const anim = glsAnim && !reduced(); glsAnim = false;
    const body = $('#gl-body');
    body.classList.toggle('cc-anim', anim);
    const warn = glsScriptOk() ? '' : `<div class="card gl-warn"><b>Aggiorna lo script Google per salvare i dati GLS.</b><span>Lo script collegato è la versione ${esc(db.v || '—')}: serve la cdc-1.1 (Code.gs nuovo). Finché non lo aggiorni l'importazione è bloccata.</span></div>`;
    if (!rows.length) {
      body.innerHTML = warn + `<div class="gl-hero gl-hero-empty"><div class="gh-top"><div class="gh-art">${glsArt()}</div><div class="gh-main"><span class="gh-lbl">GLS Attrezzati · ${esc(gPer())}</span><h3>Nessuna spedizione caricata</h3><p>Importa il resoconto del mese con «Importa mese».</p></div></div></div>`;
      return;
    }
    const T = gTot(rows), n = rows.length, colli = gSum(rows, 'colli'), kr = gSum(rows, 'kgReali'), kt = gSum(rows, 'kgTass');
    const prevK = gMonth === ALLM ? null : months[months.indexOf(gMonth) - 1], prev = prevK ? glsRows().filter(r => r.mese === prevK) : null;
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
          <span class="gh-lbl">Costo spedizioni · ${esc(gPer())}</span>
          <div class="gh-big k-gtot">0 €</div>
          <div class="gh-sub"><span>${n} spedizioni</span><span>${nLoc} località</span><span>${nReg} regioni</span>${dlt(T, prev && gTot(prev))}</div>
        </div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k"><span>${l}</span><b data-gk="${i}">0</b><small>${s}</small></div>`).join('')}</div>
      </div>
      <div class="card gl-mapcard">
        <div class="card-h"><h3>Destinazioni</h3><span class="gl-leg2"><i class="o"></i>Roma · partenza <i class="p"></i>destinazione, grandezza = costo</span></div>
        <div class="gl-mapgrid"><div class="gl-map" id="gl-map"></div><div class="gl-dest" id="gl-dest"></div></div>
      </div>
      <div class="card gf-card" id="gl-fatt"></div>
      <div class="gl-3">
        <div class="card"><div class="card-h"><h3>Contratti</h3></div><div id="gl-contr"></div></div>
        <div class="card"><div class="card-h"><h3>Composizione del costo</h3></div><div id="gl-comp"></div></div>
        <div class="card"><div class="card-h"><h3>Tipologia</h3></div><div id="gl-tipo"></div></div>
      </div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Regioni</h3><span class="muted small">${nReg} regioni</span></div><div class="bars" id="gl-reg"></div></div>
        <div class="card"><div class="card-h"><h3>Fasce di peso tassabile</h3><span class="muted small">costo per fascia</span></div><div id="gl-band"></div></div>
      </div>
      ${gMonth === ALLM ? '' : `<div class="card"><div class="card-h"><h3>Spedizioni giorno per giorno</h3><span class="muted small" id="gl-day-s"></span></div><div class="mbars gl-days" id="gl-days"></div></div>`}
      ${months.length > 1 ? `<div class="card"><div class="card-h"><h3>Andamento mensile</h3><span class="muted small">${months.length} mesi caricati</span></div><div class="mbars gl-months" id="gl-months"></div></div>` : ''}
      <div class="card"><div class="card-h"><h3>Centri di costo e riaddebito</h3><span class="muted small">costo GLS + IVA 22%</span></div><div class="mx-wrap" id="gl-cdc"></div></div>
      <div class="card" id="gl-anom"></div>
      <div class="card gl-list"><div class="card-h"><h3>Tutte le spedizioni</h3><span class="muted small" id="gl-cnt"></span></div>
        <div class="filters f3 gl-f"><input id="gl-q" type="search" placeholder="Cerca destinatario, località, n. spedizione…" value="${esc(gF.q)}"><select id="gl-fcdc"></select><select id="gl-fcon"></select></div>
        <div id="gl-ship"></div></div>`;

    countTo($('.k-gtot', body), T * gMul(), eur0);
    $$('[data-gk]', body).forEach(el => { const i = +el.dataset.gk; el._v = 0; countTo(el, K[i][1], K[i][2]); });

    glsMapRender($('#gl-map'), $('#gl-dest'), rows, anim);
    renderGlsFatt(anim);
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
    if (gMonth !== ALLM) {
    const [yy, mm] = gMonth.split('-').map(Number), nd = new Date(yy, mm, 0).getDate();
    const byD = groupBy(rows, r => String(r.data).slice(0, 10));
    const days = [...Array(nd)].map((_, i) => { const k = `${gMonth}-${pad(i + 1)}`, v = byD.get(k) || []; const wd = new Date(yy, mm - 1, i + 1).getDay(); return { d: i + 1, k, v, t: gTot(v), we: wd === 0 || wd === 6 }; });
    const md = Math.max(...days.map(x => x.t), 1);
    $('#gl-days').innerHTML = days.map((x, i) => `<div class="mb${x.we ? ' we' : ''}" title="${x.d} ${esc(MESI[mm - 1])}: ${x.v.length} sped. · ${esc(gE(x.t))}"><span class="mbv">${x.t ? esc(gE0(x.t)) : ''}</span><i class="${x.t === md ? 'cur' : ''}" style="height:${x.t ? Math.max(3, x.t / md * 100) : 0}%;animation-delay:${i * 18}ms"></i><span class="mbl">${x.d}</span></div>`).join('');
    const act = days.filter(x => x.v.length).length;
    $('#gl-day-s').textContent = `${act} giorni di spedizione · media ${fmtNum(n / (act || 1), 1)} sped. al giorno`;
    }
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
    rows = rows || glsRows().filter(gIn);
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

  function glsChecks(rows) {
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
    return A;
  }
  function renderGlsAnom(rows) {
    const A = glsChecks(rows);
    const I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    $('#gl-anom').innerHTML = `<div class="card-h"><h3>Anomalie e possibili risparmi</h3><span class="muted small">${A.length ? A.length + ' punti da controllare' : 'nessuna anomalia'}</span></div>` +
      (A.length ? `<div class="gl-an">${A.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms" data-gq="${esc(x.ids.join(' '))}"><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span><small>${x.ids.slice(0, 6).map(esc).join(' · ')}${x.ids.length > 6 ? ' …' : ''}</small></div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Tutto in ordine</div>');
  }

  // fatture GLS: un riquadro per mese da spuntare quando la fattura è stata emessa
  const glsFatt = () => { const c = cfg('glsFatt'); return c && typeof c === 'object' && !Array.isArray(c) ? c : {}; };
  let gfYear = '';
  function renderGlsFatt(anim) {
    const box = $('#gl-fatt'); if (!box) return;
    const F = glsFatt(), now = new Date(), cy = String(now.getFullYear()), ms = glsMonths();
    const yrs = [...new Set([...ms.map(m => m.slice(0, 4)), ...Object.keys(F).map(m => m.slice(0, 4)), cy])].sort();
    if (!yrs.includes(gfYear)) gfYear = ms.length ? ms[ms.length - 1].slice(0, 4) : cy;
    const by = groupBy(glsRows().filter(r => String(r.mese || '').startsWith(gfYear)), r => r.mese);
    const cur = ymOf(now);
    const M = MESI.map((nm, i) => { const k = `${gfYear}-${String(i + 1).padStart(2, '0')}`, v = by.get(k) || []; return { k, nm, v, t: gTot(v), on: !!F[k], fut: k > cur }; });
    const withData = M.filter(x => x.v.length), done = withData.filter(x => x.on), todo = withData.filter(x => !x.on), tTodo = todo.reduce((a, x) => a + x.t, 0);
    const yi = yrs.indexOf(gfYear);
    box.innerHTML = `<div class="card-h"><h3>Fatture GLS emesse</h3><span class="gf-yr">${yrs.length > 1 ? `<button type="button" data-gfy="-1"${yi ? '' : ' disabled'} aria-label="Anno precedente">‹</button>` : ''}<b>${gfYear}</b>${yrs.length > 1 ? `<button type="button" data-gfy="1"${yi < yrs.length - 1 ? '' : ' disabled'} aria-label="Anno successivo">›</button>` : ''}</span></div>
      <div class="gf-sum"><span><b>${done.length}</b> di ${withData.length} mesi fatturati</span>${todo.length ? `<span class="gf-todo">Da fatturare: <b>${gE0(tTodo)}</b> · ${todo.map(x => x.nm.slice(0, 3)).join(', ')}</span>` : withData.length ? '<span class="gf-ok">Tutto fatturato</span>' : ''}</div>
      <div class="gf-grid${anim ? ' cc-anim' : ''}">${M.map((x, i) => `<label class="gf-m${x.on ? ' on' : ''}${x.v.length ? '' : ' empty'}${!x.on && x.v.length ? ' due' : ''}" style="--d:${i * 30}ms"><input type="checkbox" data-gf="${x.k}"${x.on ? ' checked' : ''}><span class="gf-box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span><span class="gf-t"><b>${x.nm[0].toUpperCase() + x.nm.slice(1)}</b><small>${x.on ? 'emessa il ' + esc(shortDate(F[x.k])) : x.v.length ? `${gE0(x.t)} · ${x.v.length} sped.` : x.fut ? '—' : 'nessuna spedizione'}</small></span></label>`).join('')}</div>`;
    box.onchange = e => {
      const c = e.target.closest('[data-gf]'); if (!c) return;
      const o = { ...glsFatt() }; if (c.checked) { const d = new Date(); o[c.dataset.gf] = `${ymOf(d)}-${pad(d.getDate())}`; } else delete o[c.dataset.gf];
      const ops = [{ action: 'upsert', sheet: 'Config', row: { chiave: 'glsFatt', valore: JSON.stringify(o) } }];
      applyMany(ops); if (!isLocal()) queue.push(...ops); save(); flush();
      renderGlsFatt(false);
    };
    box.onclick = e => { const b = e.target.closest('[data-gfy]'); if (!b) return; gfYear = yrs[yi + Number(b.dataset.gfy)] || gfYear; renderGlsFatt(false); };
  }

  // mappa: archi da Roma alle destinazioni, numerati come l'elenco a lato (2D vettoriale oppure 3D WebGL)
  const glsName = v => {
    const by = [...groupBy(v, r => String(r.destinatario || '').trim().toUpperCase())].map(([, a]) => ({ a, t: gTot(a) })).sort((a, b) => b.t - a.t);
    const r = by[0].a[0];
    return { nm: (String(r.destinatario || '').trim() || r.citta).toUpperCase().replace(/\s+/g, ' '), more: by.length - 1 };
  };
  const gMap = { mode: LS.get('cdc_glsmap', '2d'), s: 1, cx: null, cy: null };
  const VB2 = [26, 4, 346, 388], MC = { x: 199, y: 198 };
  let itPts = null, threeP = null, gl3 = null;
  const itParse = () => itPts || (itPts = IT_PATH.split(/(?=[MLZ])/).map(t => t[0] === 'Z' ? null : [t[0], ...t.slice(1).trim().split(/[\s,]+/).map(Number)]));
  const loadThree = () => threeP || (threeP = new Promise((ok, ko) => {
    if (window.THREE) return ok(window.THREE);
    const s = document.createElement('script'); s.src = 'lib-three.min.js?v=160';
    s.onload = () => window.THREE ? ok(window.THREE) : ko(new Error('3D'));
    s.onerror = () => { threeP = null; ko(new Error('3D')); };
    document.head.appendChild(s);
  }));

  /* ---------- scena 3D: Italia in rilievo, colonne, rotte e luci ---------- */
  function gls3D(T, host, d) {
    const css = getComputedStyle(document.documentElement), cv = n => css.getPropertyValue(n).trim();
    const col = (n, f) => { try { return new T.Color(cv(n) || f); } catch { return new T.Color(f); } };
    const acc = col('--accent', '#3362ab'), dang = col('--danger', '#e22726'), surf = col('--surface', '#ffffff');
    const dark = surf.r * .3 + surf.g * .59 + surf.b * .11 < .4;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return null; }
    const W = () => Math.max(1, host.clientWidth), H = () => Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.NoToneMapping; renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.className = 'gm-canvas'; host.prepend(renderer.domElement);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(26, W() / H(), 5, 5000);
    const disp = [];
    const keep = o => (disp.push(o), o);
    // luci morbide da studio
    scene.add(new T.HemisphereLight(0xffffff, dark ? 0x1a2236 : 0xb8c4dc, dark ? .8 : 1.05));
    const sun = new T.DirectionalLight(0xffffff, dark ? 1.3 : 1.55); sun.position.set(-120, 520, 160); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -280, right: 280, top: 280, bottom: -280, near: 20, far: 1000 }); sun.shadow.radius = 6; sun.shadow.bias = -.0004;
    scene.add(sun);
    const fill = new T.DirectionalLight(acc.clone().lerp(new T.Color(0xffffff), .6), .35); fill.position.set(220, 120, -160); scene.add(fill);
    const ground = new T.Mesh(keep(new T.PlaneGeometry(3000, 3000)), keep(new T.ShadowMaterial({ opacity: dark ? .4 : .1 })));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.01; ground.receiveShadow = true; scene.add(ground);
    // Italia estrusa
    const X = x => x - MC.x, Z = y => y - MC.y, polys = []; let cur = null;
    itParse().forEach(t => { if (!t) { if (cur && cur.length > 2) polys.push(cur); cur = null; return; } if (t[0] === 'M') { if (cur && cur.length > 2) polys.push(cur); cur = [[t[1], t[2]]]; } else if (cur) cur.push([t[1], t[2]]); });
    if (cur && cur.length > 2) polys.push(cur);
    const LH = 7, shapes = polys.map(p => new T.Shape(p.map(([x, y]) => new T.Vector2(X(x), -Z(y)))));
    const lg = keep(new T.ExtrudeGeometry(shapes, { depth: LH, bevelEnabled: true, bevelThickness: 1, bevelSize: .7, bevelSegments: 3, curveSegments: 1 }));
    lg.rotateX(-Math.PI / 2); lg.translate(0, 1, 0);
    const mTopL = keep(new T.MeshStandardMaterial({ color: dark ? 0x222b3f : 0xffffff, emissive: dark ? 0x0b1020 : 0xdfe6f2, emissiveIntensity: dark ? .6 : .22, roughness: .9, metalness: 0 }));
    const mSide = keep(new T.MeshStandardMaterial({ color: dark ? acc.clone().multiplyScalar(.35) : acc.clone().lerp(new T.Color(0xffffff), .35), emissive: acc, emissiveIntensity: .18, roughness: .6, metalness: .05 }));
    const land = new T.Mesh(lg, [mTopL, mSide]); land.castShadow = true; land.receiveShadow = true; scene.add(land);
    const TOP = LH + 2;
    const coastM = keep(new T.LineBasicMaterial({ color: acc, transparent: true, opacity: dark ? .55 : .38 }));
    polys.forEach(p => { const g = keep(new T.BufferGeometry().setFromPoints(p.map(([x, y]) => new T.Vector3(X(x), TOP + .05, Z(y))))); scene.add(new T.LineLoop(g, coastM)); });
    // colonne
    const HMAX = 92, bg = keep(new T.CylinderGeometry(1, 1, 1, 40)); bg.translate(0, .5, 0);
    const mA = keep(new T.MeshStandardMaterial({ color: acc.clone().lerp(new T.Color(0xffffff), .12), emissive: acc, emissiveIntensity: .22, roughness: .28, metalness: .2 }));
    const mB = keep(new T.MeshStandardMaterial({ color: acc.clone().lerp(new T.Color(dark ? 0x334466 : 0xffffff), .45), emissive: acc, emissiveIntensity: .12, roughness: .45, metalness: .05 }));
    const mH = keep(new T.MeshStandardMaterial({ color: dang, roughness: .3, metalness: .15, emissive: dang, emissiveIntensity: .18 }));
    const capG = keep(new T.CircleGeometry(1, 40)); capG.rotateX(-Math.PI / 2);
    const capM = keep(new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .32 }));
    const bars = d.gm.map((x, j) => {
      const r = x.i <= 12 ? 3 : 1.6, h = 3 + HMAX * x.f, m = new T.Mesh(bg, x.i <= 12 ? mA : mB);
      m.position.set(X(x.x), TOP, Z(x.y)); m.scale.set(r, d.anim ? .001 : h, r); m.castShadow = true; m.receiveShadow = true;
      const cap = new T.Mesh(capG, capM); cap.scale.set(r * .72, 1, r * .72); cap.position.set(X(x.x), TOP + (d.anim ? 0 : h) + .02, Z(x.y)); scene.add(cap);
      m.userData = { x, h, r, cap, base: m.material, delay: 250 + Math.min(x.i, 40) * 35 }; scene.add(m); return m;
    });
    // rotte da Roma: archi sottili + scie luminose
    const O = new T.Vector3(X(d.ox), TOP + .3, Z(d.oy));
    const arcs = d.far.map(x => {
      const D = new T.Vector3(X(x.x), TOP + .3, Z(x.y)), L = O.distanceTo(D);
      const c = new T.QuadraticBezierCurve3(O, new T.Vector3((O.x + D.x) / 2, TOP + 12 + L * .38, (O.z + D.z) / 2), D);
      const top = x.i <= 12, g = keep(new T.TubeGeometry(c, 72, top ? .32 : .16, 6, false));
      const m = keep(new T.MeshBasicMaterial({ color: acc, transparent: true, opacity: top ? .75 : .22, depthWrite: false }));
      const me = new T.Mesh(g, m); if (d.anim) g.setDrawRange(0, 0); scene.add(me);
      return { x, c, me, g, m, n: g.index.count, top, delay: 500 + x.i * 25, o: m.opacity };
    });
    const cometG = keep(new T.SphereGeometry(.85, 16, 12)), cometM = keep(new T.MeshBasicMaterial({ color: 0xffffff }));
    const glowG = keep(new T.SphereGeometry(2.1, 16, 12)), glowM = keep(new T.MeshBasicMaterial({ color: acc, transparent: true, opacity: .28, depthWrite: false }));
    const comets = arcs.filter(a => a.x.i <= 10).map((a, j) => { const s = new T.Mesh(cometG, cometM), gl = new T.Mesh(glowG, glowM); s.add(gl); s.visible = false; scene.add(s); return { a, s, off: j * .37, dur: 2600 + a.c.getLength() * 6 }; });
    // Roma
    const rm = new T.Mesh(keep(new T.CylinderGeometry(2, 2, 3.2, 40)), keep(new T.MeshStandardMaterial({ color: dang, roughness: .35, emissive: dang, emissiveIntensity: .25 })));
    rm.position.set(O.x, TOP + 1.6, O.z); rm.castShadow = true; scene.add(rm);
    const ringG = keep(new T.RingGeometry(2.6, 3.1, 48)); ringG.rotateX(-Math.PI / 2);
    const rings = [0, 1].map(i => { const m = keep(new T.MeshBasicMaterial({ color: dang, transparent: true, opacity: .5, depthWrite: false })); const r = new T.Mesh(ringG, m); r.position.set(O.x, TOP + .1, O.z); scene.add(r); return r; });
    // etichette HTML nitide
    const labs = document.createElement('div'); labs.className = 'gm-labs'; host.appendChild(labs);
    const L = d.gm.filter(x => x.i <= 12).map(x => { const e = document.createElement('span'); e.className = 'g3l'; e.dataset.glab = x.k; e.textContent = x.i; labs.appendChild(e); return { x, e, m: bars[d.gm.indexOf(x)] }; });
    const romaL = document.createElement('span'); romaL.className = 'g3l roma'; romaL.textContent = 'ROMA'; labs.appendChild(romaL);
    // camera
    const st = { az: 0, pol: 46 * Math.PI / 180, s: 1, tx: 0, tz: 4 }, tgt = { ...st };
    const fit = () => { const v = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(v) * cam.aspect); return 158 / Math.sin(Math.min(v, hf)); };
    const place = () => {
      const D = fit() / st.s, t = new T.Vector3(st.tx, 0, st.tz);
      cam.position.set(t.x + D * Math.sin(st.pol) * Math.sin(st.az), D * Math.cos(st.pol), t.z + D * Math.sin(st.pol) * Math.cos(st.az)); cam.lookAt(t);
    };
    const v3 = new T.Vector3(), proj = (x, y, z) => { v3.set(x, y, z).project(cam); return [(v3.x + 1) / 2 * W(), (1 - v3.y) / 2 * H(), v3.z]; };
    const putLabels = () => {
      const placed = [];
      L.forEach(({ x, e, m }) => {
        const [sx, sy, sz] = proj(m.position.x, TOP + m.scale.y + 4.5, m.position.z);
        const ok = sz < 1 && sx > -20 && sx < W() + 20 && sy > -20 && sy < H() + 20 && m.scale.y > 1 && !placed.some(p => Math.abs(p[0] - sx) < 22 && Math.abs(p[1] - sy) < 18);
        if (ok) placed.push([sx, sy]);
        e.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`; e.classList.toggle('off', !ok);
      });
      const [rx, ry] = proj(O.x, TOP + 4, O.z); romaL.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px) translate(-115%,-50%)`;
    };
    let hov = null;
    const setHl = k => { bars.forEach(b => { b.material = b.userData.x.k === k ? mH : b.userData.base; }); arcs.forEach(a => { a.m.color.copy(a.x.k === k ? dang : acc); a.m.opacity = a.x.k === k ? .95 : (k ? a.o * .5 : a.o); }); hov = k; dirty = true; };
    // ciclo di disegno
    let raf = 0, dirty = true, alive = true; const t0 = performance.now(), red = reduced();
    const ease = q => 1 - Math.pow(1 - q, 3);
    const frame = now => {
      if (!alive) return;
      if (!host.isConnected) return api.dispose();
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = now - t0; let moving = false;
      for (const k of ['az', 'pol', 's', 'tx', 'tz']) { const dv = tgt[k] - st[k]; if (Math.abs(dv) > 1e-4) { st[k] += dv * .16; moving = true; } else st[k] = tgt[k]; }
      if (d.anim && t < 3200) {
        bars.forEach(b => { const u = b.userData, q = red ? 1 : ease(Math.min(1, Math.max(0, (t - u.delay) / 1000))); b.scale.y = Math.max(.001, u.h * q); u.cap.position.y = TOP + b.scale.y + .02; });
        arcs.forEach(a => { const q = red ? 1 : ease(Math.min(1, Math.max(0, (t - a.delay) / 900))); a.g.setDrawRange(0, Math.floor(a.n * q / 36) * 36); });
        moving = true;
      }
      if (!red) {
        comets.forEach(c => { const q = ((t - 1400) / c.dur + c.off) % 1; c.s.visible = t > 1400 && q > 0; if (c.s.visible) c.s.position.copy(c.a.c.getPoint(q)); });
        rings.forEach((r, i) => { const q = ((t / 2400) + i * .5) % 1; r.scale.setScalar(1 + q * 2.6); r.material.opacity = .55 * (1 - q); });
        moving = true;
      }
      if (moving || dirty) { place(); renderer.render(scene, cam); putLabels(); dirty = false; }
    };
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); dirty = true; });
    ro.observe(host);
    // interazione: passa sopra / clic sulle colonne, trascina per spostarti quando è ingrandita
    const ray = new T.Raycaster(), pt = new T.Vector2();
    const hit = e => { const r = renderer.domElement.getBoundingClientRect(); pt.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(pt, cam); const h = ray.intersectObjects(bars, false)[0]; return h ? h.object.userData.x : null; };
    let drag = null, moved = false;
    const cvs = renderer.domElement;
    cvs.addEventListener('pointerdown', e => { moved = false; if (tgt.s <= 1.01 || !e.isPrimary) return; drag = { x: e.clientX, y: e.clientY, tx: tgt.tx, tz: tgt.tz }; });
    cvs.addEventListener('pointermove', e => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        if (!moved) { moved = true; cvs.setPointerCapture(e.pointerId); host.classList.add('dragging'); d.tip(null); }
        const k = 2 * (fit() / st.s) * Math.tan(cam.fov * Math.PI / 360) / H(), ca = Math.cos(st.az), sa = Math.sin(st.az);
        tgt.tx = Math.max(-200, Math.min(200, drag.tx - (dx * ca + dy * sa / Math.cos(st.pol) * .9) * k));
        tgt.tz = Math.max(-200, Math.min(200, drag.tz - (-dx * sa + dy * ca / Math.cos(st.pol) * .9) * k));
        st.tx = tgt.tx; st.tz = tgt.tz; dirty = true; return;
      }
      const x = hit(e); cvs.style.cursor = x ? 'pointer' : (tgt.s > 1.01 ? 'grab' : '');
      if ((x && x.k) !== hov) { setHl(x ? x.k : null); d.hl(x ? x.k : ''); }
      d.tip(x, e.clientX, e.clientY);
    });
    const up = () => { drag = null; host.classList.remove('dragging'); };
    cvs.addEventListener('pointerup', up); cvs.addEventListener('pointercancel', up);
    cvs.addEventListener('pointerleave', () => { if (!drag) { setHl(null); d.hl(''); d.tip(null); } });
    cvs.addEventListener('click', e => { if (moved) return; const x = hit(e); if (x) d.pick(x.k); });
    const api = {
      zoom: f => { tgt.s = Math.min(6, Math.max(1, tgt.s * f)); if (tgt.s <= 1.001) { tgt.tx = 0; tgt.tz = 4; } host.classList.toggle('zoomed', tgt.s > 1.01); },
      reset: () => { Object.assign(tgt, { az: 0, s: 1, tx: 0, tz: 4 }); host.classList.remove('zoomed'); },
      rotate: dir => { tgt.az += dir * Math.PI / 6; },
      hl: k => { if (k !== hov) setHl(k || null); },
      dispose: () => { if (!alive) return; alive = false; cancelAnimationFrame(raf); ro.disconnect(); disp.forEach(o => o.dispose && o.dispose()); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); cvs.remove(); labs.remove(); }
    };
    return api;
  }

  function glsMapRender(el, list, rows, anim) {
    const P = (lat, lon) => proj([lon, lat]);
    const [ox, oy] = P(GLS_ORIG.lat, GLS_ORIG.lon);
    const g = [...groupBy(rows, r => r.citta + '|' + r.prov)].map(([k, v]) => ({ k, c: v[0].citta, p: v[0].prov, v, t: gTot(v), n: v.length, kt: gSum(v, 'kgTass'), geo: geoOf(v[0]), ...glsName(v) })).sort((a, b) => b.t - a.t);
    g.forEach((x, i) => { x.i = i + 1; });
    const gm = g.filter(x => x.geo), mx = Math.max(...g.map(x => x.t), 1);
    gm.forEach(x => { [x.x, x.y] = P(x.geo.lat, x.geo.lon); x.f = Math.sqrt(x.t / mx); x.r = 2.2 + 7.5 * x.f; x.home = Math.hypot(x.x - ox, x.y - oy) < 2.5; if (x.i <= 12) x.r = Math.max(x.r, 5.6); });
    const far = gm.filter(x => !x.home);
    if (gl3) { gl3.dispose(); gl3 = null; }

    /* ---------- 2D: disegnata una volta sola, lo zoom cambia solo l'inquadratura ---------- */
    const draw2D = () => {
      const arcs = far.map((x, j) => {
        const dx = x.x - ox, dy = x.y - oy, L = Math.hypot(dx, dy) || 1, b = Math.min(46, L * .22) * (dx < 0 ? 1 : -1);
        const cx = (ox + x.x) / 2 - dy / L * b, cy = (oy + x.y) / 2 + dx / L * b;
        const d = `M${ox.toFixed(1)} ${oy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.x.toFixed(1)} ${x.y.toFixed(1)}`, w = .5 + 1.9 * x.f;
        return `<path class="cm-arc gl-arc" data-ga="${esc(x.k)}" data-w="${w.toFixed(2)}" pathLength="1" style="--d:${500 + j * 40}ms" d="${d}"/>` +
          (x.i <= 10 ? `<path class="gl-flow" data-w="${(w + .6).toFixed(2)}" pathLength="1" style="--d:${(1.4 + j * .23).toFixed(2)}s;--t:${(1.6 + L / 160).toFixed(2)}s" d="${d}"/>` : '');
      }).join('');
      const pins = gm.slice().reverse().map(x => `<g class="gl-pin${x.i <= 12 ? ' nb' : ''}" data-gpin="${esc(x.k)}" data-t="${x.x.toFixed(1)} ${x.y.toFixed(1)}" style="--d:${800 + x.i * 35}ms" transform="translate(${x.x.toFixed(1)} ${x.y.toFixed(1)})"><circle class="cm-hit" r="${(x.r + 4).toFixed(1)}"/><circle class="gl-halo" r="${(x.r + 2.4).toFixed(1)}"/><circle class="cm-c" r="${x.r.toFixed(1)}"/>${x.i <= 12 ? `<text class="gl-pn" dy=".35em">${x.i}</text>` : ''}</g>`).join('');
      return `<defs><radialGradient id="glsea" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="var(--accent)" stop-opacity=".07"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient></defs>
        <rect x="-200" y="-200" width="800" height="800" fill="url(#glsea)"/>
        <path class="cm-land gl-land" data-w=".7" pathLength="1" d="${IT_PATH}"/>
        ${arcs}${pins}
        <g class="gl-orig" data-t="${ox.toFixed(1)} ${oy.toFixed(1)}" transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})"><circle class="gl-op" r="6"/><circle class="gl-op gl-op2" r="6"/><circle r="5.2" class="gl-oc"/><circle r="1.9" class="gl-oi"/>
        <g transform="translate(-9 3)"><text text-anchor="end" class="gl-on">ROMA</text><text text-anchor="end" dy="8" class="gl-os">partenza</text></g></g>`;
    };

    const HINT = 'Usa + e − per lo zoom · trascina per spostarti';
    el.innerHTML = `<div class="gm-tools"><div class="gm-seg" role="group" aria-label="Vista mappa"><button type="button" data-gmode="2d" class="${gMap.mode === '2d' ? 'on' : ''}">2D</button><button type="button" data-gmode="3d" class="${gMap.mode === '3d' ? 'on' : ''}">3D</button></div>
      <div class="gm-zoom"><button type="button" data-gz="in" aria-label="Ingrandisci">+</button><button type="button" data-gz="out" aria-label="Riduci">−</button><button type="button" data-gz="reset" aria-label="Vista intera"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></div>
      <div class="gm-zoom gm-rot"${gMap.mode === '3d' ? '' : ' hidden'}><button type="button" data-gr="-1" aria-label="Ruota a sinistra"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg></button><button type="button" data-gr="1" aria-label="Ruota a destra"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4"/></svg></button></div></div>
      <div class="gm-stage"><svg class="gl-svg${anim ? ' cc-anim' : ''}" viewBox="${VB2.join(' ')}" role="img" aria-label="Mappa delle spedizioni GLS">${draw2D()}</svg><div class="gm-3d" hidden><div class="gm-load">Caricamento 3D…</div></div></div>
      <div class="gm-hint">${HINT}</div>`;
    const svg = $('svg.gl-svg', el), host = $('.gm-3d', el), stage = $('.gm-stage', el);
    const wEls = $$('[data-w]', svg), tEls = $$('[data-t]', svg);
    const setVB = () => {
      const b = VB2, w = b[2] / gMap.s, h = b[3] / gMap.s;
      let cx = gMap.cx == null ? b[0] + b[2] / 2 : gMap.cx, cy = gMap.cy == null ? b[1] + b[3] / 2 : gMap.cy;
      cx = Math.min(b[0] + b[2] - w / 2, Math.max(b[0] + w / 2, cx)); cy = Math.min(b[1] + b[3] - h / 2, Math.max(b[1] + h / 2, cy)); gMap.cx = cx; gMap.cy = cy;
      svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(2)} ${(cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
      const k = 1 / Math.pow(gMap.s, .75);
      wEls.forEach(e => { e.style.strokeWidth = (e.dataset.w * k).toFixed(3); });
      tEls.forEach(e => e.setAttribute('transform', `translate(${e.dataset.t}) scale(${k.toFixed(3)})`));
      svg.classList.toggle('zoomed', gMap.s > 1.01);
    };
    gMap.s = 1; gMap.cx = gMap.cy = null; setVB();
    let zr = 0;
    const zoom2 = ns => {
      ns = Math.min(6, Math.max(1, ns)); if (Math.abs(ns - gMap.s) < .001) return;
      const s0 = gMap.s, t0 = performance.now(), dur = reduced() ? 1 : 320; cancelAnimationFrame(zr);
      const stp = now => { const q = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - q, 3); gMap.s = s0 + (ns - s0) * e; setVB(); if (q < 1) zr = requestAnimationFrame(stp); else if (ns === 1) { gMap.cx = gMap.cy = null; setVB(); } };
      zr = requestAnimationFrame(stp);
    };
    let drag = null, moved = false;
    svg.addEventListener('pointerdown', e => { moved = false; if (gMap.s <= 1.01 || !e.isPrimary) return; drag = { x: e.clientX, y: e.clientY, cx: gMap.cx, cy: gMap.cy }; });
    svg.addEventListener('pointermove', e => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      if (!moved) { moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); }
      const r = svg.getBoundingClientRect(), w = VB2[2] / gMap.s, h = VB2[3] / gMap.s; gMap.cx = drag.cx - dx * w / r.width; gMap.cy = drag.cy - dy * h / r.height; setVB();
    });
    const up = () => { drag = null; svg.classList.remove('dragging'); };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);

    // passaggio 2D / 3D
    const show = (mode, an) => {
      const is3 = mode === '3d';
      svg.style.display = is3 ? 'none' : ''; host.hidden = !is3; $('.gm-rot', el).hidden = !is3;
      if (!is3) { if (gl3) { gl3.dispose(); gl3 = null; } return; }
      if (gl3) return;
      loadThree().then(T => {
        if (!host.isConnected || gMap.mode !== '3d' || gl3) return;
        gl3 = gls3D(T, host, { gm, far, ox, oy, anim: an, hl, pick, tip: tip3 });
        $('.gm-load', host)?.remove();
        if (!gl3) throw new Error('webgl');
      }).catch(() => { if (!host.isConnected) return; const l = $('.gm-load', host); if (l) l.textContent = 'La vista 3D non è disponibile su questo dispositivo.'; });
    };
    el.querySelector('.gm-zoom').onclick = e => { const b = e.target.closest('[data-gz]'); if (!b) return; e.stopPropagation(); const z = b.dataset.gz;
      if (gMap.mode === '3d') { if (!gl3) return; z === 'reset' ? gl3.reset() : gl3.zoom(z === 'in' ? 1.6 : 1 / 1.6); return; }
      zoom2(z === 'in' ? gMap.s * 1.6 : z === 'out' ? gMap.s / 1.6 : 1); };
    el.querySelector('.gm-rot').onclick = e => { const b = e.target.closest('[data-gr]'); if (b && gl3) { e.stopPropagation(); gl3.rotate(Number(b.dataset.gr)); } };
    el.querySelector('.gm-seg').onclick = e => {
      const b = e.target.closest('[data-gmode]'); if (!b || b.dataset.gmode === gMap.mode) return; e.stopPropagation();
      const to = b.dataset.gmode; gMap.mode = to; LS.set('cdc_glsmap', to); $$('.gm-seg button', el).forEach(x => x.classList.toggle('on', x === b));
      gMap.s = 1; gMap.cx = gMap.cy = null; setVB();
      if (reduced()) return show(to, false);
      stage.classList.add('out'); setTimeout(() => { show(to, true); stage.classList.remove('out'); }, 200);
    };

    // elenco aziende / destinazioni
    list.innerHTML = `<div class="gd-h"><span>${g.length} destinazioni</span><span>costo</span></div><div class="gd-l">${g.map(x => `<div class="gd-r${x.home ? ' home' : ''}" data-gdest="${esc(x.k)}" style="--d:${300 + Math.min(x.i, 14) * 45}ms"><span class="gd-n${x.i <= 12 ? ' nb' : ''}">${x.i}</span><span class="gd-m"><b title="${esc(x.nm)}">${esc(x.nm)}${x.more ? ` <em>+${x.more}</em>` : ''}</b><small>${esc(x.c)} (${esc(x.p)}) · ${x.n} sped. · ${fmtNum(x.kt, 0)} kg</small><span class="gd-b"><i style="width:${(x.t / mx * 100).toFixed(1)}%"></i></span></span><b class="gd-v">${gE0(x.t)}</b></div>`).join('')}</div>`;
    function hl(k) { $$('.gl-pin.hl,.gd-r.hl,.gl-arc.hl,.g3l.hl', el.parentNode).forEach(e => e.classList.remove('hl')); if (!k) return; $$(`[data-gpin="${CSS.escape(k)}"],[data-gdest="${CSS.escape(k)}"],[data-ga="${CSS.escape(k)}"],[data-glab="${CSS.escape(k)}"]`, el.parentNode).forEach(e => e.classList.add('hl')); }
    function pick(k) { const x = g.find(z => z.k === k); if (!x) return; gF.q = x.c; $('#gl-q').value = x.c; renderGlsList(); $('#gl-ship').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    const tipAt = (x, left, top) => {
      let tip = $('.cm-tip', el);
      if (!x) { if (tip) tip.remove(); return; }
      if (!tip) { tip = document.createElement('div'); tip.className = 'tip cm-tip'; el.appendChild(tip); }
      tip.innerHTML = `<b>${x.i}. ${esc(x.nm)}</b><br>${esc(x.c)} (${esc(x.p)}) · ${x.n} sped.<br><b>${gE(x.t)}</b> · ${fmtNum(x.kt, 0)} kg tass.`;
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
    };
    function tip3(x, cx, cy) { const w = el.getBoundingClientRect(); tipAt(x, cx - w.left, cy - w.top - 14); }
    svg.onmousemove = e => {
      if (moved && drag) return;
      const pin = e.target.closest('.gl-pin');
      if (!pin) { tipAt(null); hl(''); return; }
      const x = g.find(z => z.k === pin.dataset.gpin); if (!x) return;
      hl(x.k); const r = pin.getBoundingClientRect(), w = el.getBoundingClientRect(); tipAt(x, r.left + r.width / 2 - w.left, r.top - w.top - 4);
    };
    svg.onmouseleave = () => { tipAt(null); hl(''); };
    svg.onclick = e => { if (moved) { moved = false; return; } const pin = e.target.closest('.gl-pin'); if (pin) pick(pin.dataset.gpin); };
    list.onmouseover = e => { const r = e.target.closest('.gd-r'), k = r ? r.dataset.gdest : ''; hl(k); if (gl3) gl3.hl(k); };
    list.onmouseleave = () => { hl(''); if (gl3) gl3.hl(''); };
    list.onclick = e => { const r = e.target.closest('.gd-r'); if (r) pick(r.dataset.gdest); };
    show(gMap.mode, anim);
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
    const rows = glsRows().filter(gIn).sort((a, b) => String(a.data).localeCompare(String(b.data)));
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
      XLSX.writeFile(wb, `gls-${gMonth === ALLM ? 'completo' : gMonth}.xlsx`, { compression: true });
      toast('File Excel scaricato');
    } catch (e) { toast(e.message); } finally { busy(); }
  }

  /* =========================================================
     GASOLIO — rifornimenti dei mezzi dalla sede di San Cesareo
     ========================================================= */
  let gasP = '', gasAnim = true, gasF = { q: '', targa: '' }, gasLimit = 80, gasShowAll = false;
  // noleggi mensili dei mezzi principali (IVA esclusa), modificabili dall'app
  const GAS_RENT_DEF = { FA586HA: 650, GC193WV: 900, GC163WV: 900, FA665TY: 750 };
  const gasRent = () => { const c = cfg('gasNoleggio'); return c && typeof c === 'object' && Object.keys(c).length ? c : GAS_RENT_DEF; };
  const gasNomi = () => { const c = cfg('gasNomi'); return c && typeof c === 'object' ? c : {}; };
  const gasName = p => String(gasNomi()[plate(p)] || '').trim();
  const gasRentTot = () => Object.values(gasRent()).reduce((a, v) => a + num(v), 0);
  const monthSpan = (a, b) => { const o = []; let [y, m] = a.split('-').map(Number); const [y2, m2] = b.split('-').map(Number); while (y < y2 || (y === y2 && m <= m2)) { o.push(`${y}-${pad(m)}`); if (++m > 12) { m = 1; y++; } } return o; };
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
  const gasRange = () => { const m = gasMonths(); return m.length ? monthSpan(m[0], m[m.length - 1]) : []; };
  const rentMonths = p => p ? (gasRange().includes(p) ? [p] : []) : gasRange();
  function gasVehicles(all) {
    // statistiche per mezzo calcolate su tutto lo storico (servono i km precedenti)
    const by = groupBy(all, r => plate(r.targa) || '—');
    const out = new Map();
    by.forEach((v, p) => {
      const s = v.slice().sort((a, b) => String(a.data).localeCompare(String(b.data)) || num(a.km) - num(b.km));
      const usi = [...groupBy(s.filter(r => gasNorm(r.uso)), r => gasNorm(r.uso))].sort((a, b) => b[1].length - a[1].length); if (!usi.length) usi.push(['—', []]);
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
    const RENT = gasRent(), rm = rentMonths(gasP), rent = gasRentTot() * rm.length, totC = cost + rent;
    const plates = new Set(rows.map(r => plate(r.targa)));
    const days = new Set(rows.map(r => String(r.data).slice(0, 10))).size;
    const K = [['Rifornimenti', n, v => fmtNum(Math.round(v), 0), `${days} giorni`],
      ['Mezzi', plates.size, v => fmtNum(Math.round(v), 0), `${new Set(rows.map(r => gasNorm(r.operatore)).filter(x => x && x !== '?')).size} operatori`],
      ['Media a pieno', lit / n, v => L(v, 1), `max ${L(Math.max(...rows.map(r => num(r.litri))), 1)}`],
      ['Km percorsi', km, v => fmtNum(v, 0) + ' km', 'tra due rifornimenti'],
      ['Consumo medio', cons, v => fmtNum(v, 1) + ' km/L', cons ? `${fmtNum(100 / cons, 1)} L ogni 100 km` : 'servono i km'],
      ['Costo totale', totC * gMul(), v => eur0(v), `carburante ${hasCost ? eur0(cost * gMul()) : '—'} · noleggi ${eur0(rent * gMul())}`]];
    const prevK = gasP ? months[months.indexOf(gasP) - 1] : null;
    const prevL = prevK ? gSum(all.filter(r => String(r.data).slice(0, 7) === prevK), 'litri') : 0;
    const dl = prevL ? (() => { const p = (lit / prevL - 1) * 100; return `<span class="gl-d ${p > 0 ? 'up' : 'down'}">${p > 0 ? '▲' : '▼'} ${fmtNum(Math.abs(p), 0)}% vs ${esc(MESI[Number(prevK.slice(5)) - 1])}</span>`; })() : '';
    body.innerHTML = warn + `
      <div class="gl-hero ga-hero">
        <div class="gh-top"><div class="gh-art">${gasArt(Math.min(1, lit / Math.max(1, gasP ? Math.max(...months.map(k => gSum(all.filter(r => String(r.data).slice(0, 7) === k), 'litri'))) : lit)))}</div>
        <div class="gh-main">
          <span class="gh-lbl">Gasolio erogato · ${esc(perL)}</span>
          <div class="gh-big k-glit">0 L</div>
          <div class="gh-sub"><span>${n} rifornimenti</span><span>${plates.size} mezzi</span><span>${esc(gE0(totC))} con noleggi</span>${hasCost ? '' : `<button class="gh-chip" id="ga-price" type="button">Imposta prezzo €/L</button>`}${dl}</div>
        </div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k"><span>${l}</span><b data-gak="${i}">0</b><small>${s}</small></div>`).join('')}</div>
      </div>
      <div class="card"><div class="card-h"><h3>Mezzi principali</h3><span class="ga-vh"><span class="muted small">clic per vedere i rifornimenti</span><button class="btn sm" id="ga-allv" type="button"></button></span></div><div class="ga-veh" id="ga-veh"></div></div>
      <div class="card"><div class="card-h"><h3>Costo dei mezzi a noleggio</h3><span class="ga-vh"><span class="muted small">${rm.length} ${rm.length === 1 ? 'mese' : 'mesi'} di noleggio · ${ivaLbl()}</span><button class="btn sm" id="ga-rent" type="button">Nomi e noleggi</button></span></div><div class="mx-wrap" id="ga-cost"></div></div>
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
    const mainP = Object.keys(RENT).map(plate);
    const vs = [...new Set([...mainP, ...plates])].map(p => { const x = V.get(p) || { s: [], uso: '—', owner: '', seg: new Map() }; const v = rows.filter(r => plate(r.targa) === p); let k = 0, kl = 0; x.seg.forEach((d, id) => { if (v.some(r => r.id === id)) { k += d; kl += num(v.find(r => r.id === id).litri); } }); const last = v.slice().sort((a, b) => String(b.data).localeCompare(String(a.data)))[0]; const kms = x.s.map(r => num(r.km)).filter(Boolean); return { p, v, l: gSum(v, 'litri'), k, cons: kl ? k / kl : 0, uso: x.uso, owner: x.owner, last, odo: kms.length ? Math.max(...kms) : 0 }; }).sort((a, b) => b.l - a.l);
    vs.forEach(x => { x.main = mainP.includes(x.p); x.rent = num(RENT[x.p] ?? RENT[Object.keys(RENT).find(k => plate(k) === x.p)]); x.fuel = gCost(x.v); });
    vs.sort((a, b) => (b.main - a.main) || (a.main ? mainP.indexOf(a.p) - mainP.indexOf(b.p) : b.l - a.l));
    const others = vs.filter(x => !x.main), showAll = gasShowAll || others.some(x => x.p === gasF.targa);
    const shown = vs.filter(x => x.main || showAll);
    const mv = Math.max(...vs.map(x => x.l), 1);
    const bAll = $('#ga-allv'); bAll.hidden = !others.length; bAll.textContent = showAll ? 'Nascondi altri mezzi' : `Altri ${others.length} mezzi`;
    $('#ga-veh').innerHTML = shown.map((x, i) => `<div class="gv-c${gasF.targa === x.p ? ' on' : ''}" data-gtarga="${esc(x.p)}" style="--d:${120 + i * 60}ms">
        <div class="gv-top"><span class="gv-plate"><i>I</i><b>${esc(plateFmt(x.p))}</b></span><span class="gv-l"><b>${L(x.l, 0)}</b><small>${fmtNum(pct(x.l, lit), 0)}%</small></span></div>
        ${gasName(x.p) ? `<div class="gv-nick" data-gname="${esc(x.p)}" title="Cambia nome">${esc(gasName(x.p))}<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></div>` : x.main ? `<button type="button" class="gv-addn" data-gname="${esc(x.p)}">+ Dai un nome</button>` : ''}
        <div class="gv-name">${esc(x.uso)}${x.owner ? ` <em>· ${esc(x.owner)}</em>` : ''}</div>
        <div class="gv-tank"><i style="width:${(x.l / mv * 100).toFixed(1)}%"></i></div>
        ${x.main ? `<div class="gv-rent"><span>Noleggio <b>${eur0(x.rent * gMul())}</b>/mese</span><span>Totale periodo <b>${eur0((x.rent * rm.length + x.fuel) * gMul())}</b></span></div>` : ''}
        <div class="gv-st"><div><small>Pieni</small><b>${x.v.length}</b></div><div><small>Km</small><b>${x.k ? fmtNum(x.k, 0) : '—'}</b></div><div><small>km/L</small><b>${x.cons ? fmtNum(x.cons, 1) : '—'}</b></div><div><small>Ultimo</small><b>${x.last && validD(x.last.data) ? parseD(x.last.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : '—'}</b></div></div>
      </div>`).join('');

    // costo dei mezzi a noleggio
    const mm = vs.filter(x => x.main), oth = vs.filter(x => !x.main);
    const cr = x => { const rp = x.rent * rm.length, t = rp + x.fuel; return `<td><span class="gv-plate sm"><i>I</i><b>${esc(plateFmt(x.p))}</b></span> ${gasName(x.p) ? `<b class="ga-nm">${esc(gasName(x.p))}</b>` : ''}<span class="m2">${esc(x.uso)}</span></td><td>${eur0(x.rent * gMul())}</td><td>${eur0(rp * gMul())}</td><td>${fmtNum(x.l, 0)} L</td><td>${hasCost ? eur0(x.fuel * gMul()) : '—'}</td><td><b>${eur0(t * gMul())}</b></td><td>${fmtNum(pct(t, totC), 1)}%</td><td>${x.k ? fmtNum(t * gMul() / x.k, 3) + ' €' : '—'}</td>`; };
    const oL = gSum(oth.flatMap(x => x.v), 'litri'), oF = oth.reduce((a, x) => a + x.fuel, 0);
    $('#ga-cost').innerHTML = `<table class="mx gl-tab ga-ct"><thead><tr><th>Mezzo</th><th>Noleggio / mese</th><th>Noleggio periodo</th><th>Litri</th><th>Carburante</th><th>Totale</th><th>%</th><th>€ / km</th></tr></thead><tbody>
      ${mm.map(x => `<tr data-gtarga="${esc(x.p)}">${cr(x)}</tr>`).join('')}
      ${oth.length ? `<tr class="ga-oth"><td>Altri ${oth.length} mezzi <span class="m2">solo carburante</span></td><td>—</td><td>—</td><td>${fmtNum(oL, 0)} L</td><td>${hasCost ? eur0(oF * gMul()) : '—'}</td><td><b>${eur0(oF * gMul())}</b></td><td>${fmtNum(pct(oF, totC), 1)}%</td><td>—</td></tr>` : ''}
      <tr class="tot"><td>Totale</td><td>${eur0(gasRentTot() * gMul())}</td><td>${eur0(rent * gMul())}</td><td>${fmtNum(lit, 0)} L</td><td>${hasCost ? eur0(cost * gMul()) : '—'}</td><td>${eur0(totC * gMul())}</td><td>100%</td><td>${km ? fmtNum(totC * gMul() / km, 3) + ' €' : '—'}</td></tr></tbody></table>
      ${hasCost ? '' : '<div class="ga-cn">Il carburante non ha ancora un prezzo: il totale comprende solo i noleggi. <button class="link" id="ga-price2" type="button">Imposta prezzo €/L</button></div>'}`;

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
    const byU = [...groupBy(rows, r => gasNorm(r.uso) || 'NON INDICATO')].map(([k, v]) => ({ k, v: gSum(v, 'litri'), n: v.length })).sort((a, b) => b.v - a.v);
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
    $('#ga-ft').innerHTML = `<option value="">Tutti i mezzi</option>` + vs.map(x => `<option value="${esc(x.p)}"${gasF.targa === x.p ? ' selected' : ''}>${esc(plateFmt(x.p))} · ${esc(gasName(x.p) || x.uso)}</option>`).join('');
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
      $('#ga-list').innerHTML = `<div class="list">${sh.map(r => `<div class="item" data-gas="${esc(r.id)}"><span class="ic ga-ic"><svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg></span><div class="main"><div class="t">${esc(plateFmt(plate(r.targa)))} · ${esc(gasName(r.targa) || r.uso)}</div><div class="s">${dd(r.data)} · ${esc(r.operatore || '—')}${num(r.km) ? ' · ' + fmtNum(num(r.km), 0) + ' km' : ''}</div></div><div class="amt">${fmtNum(num(r.litri), 1)} L</div></div>`).join('')}</div>${more}`;
    }
  }

  function gasChecks(rows, V) {
    const A = [], ids = new Set(rows.map(r => r.id));
    const noKm = rows.filter(r => !num(r.km));
    if (noKm.length) A.push({ t: 'warn', h: 'Chilometri mancanti', d: `${noKm.length} rifornimenti senza km: non si può calcolare il consumo di quei pieni (${[...new Set(noKm.map(r => plateFmt(plate(r.targa))))].join(', ')}).`, v: L(gSum(noKm, 'litri'), 0), ids: noKm.map(r => r.id) });
    V.forEach(x => { let prev = null; x.s.forEach(r => { const k = num(r.km); if (!k) return; if (prev && k < prev.km && ids.has(r.id)) A.push({ t: 'warn', h: `Km che tornano indietro · ${plateFmt(x.p)}`, d: `Il ${esc(shortDate(r.data))} risultano ${fmtNum(k, 0)} km, ma il ${esc(shortDate(prev.r.data))} erano ${fmtNum(prev.km, 0)} km. Probabile errore di data o di battitura.`, v: fmtNum(k - prev.km, 0) + ' km', ids: [prev.r.id, r.id] }); if (prev && k - prev.km >= 5000 && ids.has(r.id)) A.push({ t: 'info', h: `Salto di km anomalo · ${plateFmt(x.p)}`, d: `Tra il ${esc(shortDate(prev.r.data))} e il ${esc(shortDate(r.data))} risultano ${fmtNum(k - prev.km, 0)} km.`, v: 'verificare', ids: [prev.r.id, r.id] }); prev = { km: k, r }; }); });
    const ps = [...new Set(rows.map(r => plate(r.targa)))], lev = (a, b) => { if (a.length !== b.length) return 9; let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) if (lev(ps[i], ps[j]) <= 2) { const v = rows.filter(r => [ps[i], ps[j]].includes(plate(r.targa))); A.push({ t: 'info', h: 'Targhe quasi uguali', d: `${plateFmt(ps[i])} e ${plateFmt(ps[j])} sono quasi uguali: controlla se è lo stesso mezzo scritto male.`, v: v.length + ' pieni', ids: v.map(r => r.id) }); }
    const big = rows.filter(r => num(r.litri) > 70);
    if (big.length) A.push({ t: 'info', h: 'Rifornimenti molto grandi', d: `${big.length} rifornimenti oltre 70 litri: verificare se il serbatoio del mezzo li può contenere.`, v: L(gSum(big, 'litri'), 0), ids: big.map(r => r.id) });
    const noOp = rows.filter(r => !String(r.operatore || '').trim() || String(r.operatore).trim() === '?');
    if (noOp.length) A.push({ t: 'info', h: 'Operatore non indicato', d: `${noOp.length} rifornimenti senza chi li ha fatti.`, v: L(gSum(noOp, 'litri'), 0), ids: noOp.map(r => r.id) });
    const fix = rows.filter(r => /data corretta/i.test(r.note || ''));
    if (fix.length) A.push({ t: 'info', h: 'Date corrette in importazione', d: fix.map(r => `${plateFmt(plate(r.targa))}: ${esc(r.note)}`).join(' · '), v: fix.length + '', ids: fix.map(r => r.id) });
    return A;
  }
  function renderGasAnom(rows, V) {
    const A = gasChecks(rows, V);
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
  function formGasRent(focus) {
    const R = gasRent(), N = gasNomi(), list = [...Object.entries(R), ['', ''], ['', '']];
    openSheet('Mezzi principali', `<p class="muted small" style="margin:0 0 12px">Nome, targa e canone mensile (IVA esclusa) dei mezzi a noleggio: sono quelli mostrati in evidenza nella sezione Gasolio. Lascia vuoto il canone per togliere un mezzo.</p>
      ${list.map(([p, v], i) => `<div class="ga-fr"><label class="f"><span>Nome</span><input name="n${i}" value="${esc(N[plate(p)] || '')}" placeholder="Es. Furgone Vasy"${plate(p) === focus || (!focus && i === 0) ? ' data-focus' : ''}></label><label class="f"><span>Targa</span><input name="t${i}" value="${esc(p)}" autocapitalize="characters" placeholder="Es. GC193WV"></label><label class="f"><span>€ al mese</span><input name="v${i}" inputmode="decimal" value="${esc(v === '' ? '' : fmtIn(v))}" placeholder="0"></label></div>`).join('')}`,
      fd => {
        const o = {}, nm = { ...N };
        list.forEach((_, i) => { const p = plate(fd.get('t' + i)), v = num(fd.get('v' + i)), n = String(fd.get('n' + i) || '').trim(); if (!p) return; if (v > 0) o[p] = v; if (n) nm[p] = n; else delete nm[p]; });
        write([{ action: 'upsert', sheet: 'Config', row: { chiave: 'gasNoleggio', valore: JSON.stringify(o) } }, { action: 'upsert', sheet: 'Config', row: { chiave: 'gasNomi', valore: JSON.stringify(nm) } }]);
        toast('Mezzi salvati'); return true;
      });
  }
  function formGasPrice() {
    openSheet('Prezzo del gasolio', `<p class="muted small" style="margin:0 0 12px">Prezzo medio al litro IVA esclusa, usato per stimare i costi dei rifornimenti che non hanno un prezzo proprio.</p>
      <label class="f"><span>Prezzo €/L (no IVA)</span><input name="p" inputmode="decimal" data-focus value="${esc(fmtIn(gasPrice() || ''))}" placeholder="Es. 1,45"></label>`,
      fd => { const v = num(fd.get('p')); setConfig('gasolioPrezzo', v > 0 ? v : ''); toast(v > 0 ? 'Prezzo salvato' : 'Prezzo rimosso'); return true; });
  }

  /* ---------- Import / export gasolio ---------- */
  function parseGas(wb) {
    const out = []; out.noDate = []; out.dup = [];
    wb.SheetNames.forEach(name => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '' });
      const hi = aoa.findIndex(r => r.some(c => /^targa/.test(nh(c))) && r.some(c => /^litri/.test(nh(c))));
      if (hi < 0) return;
      const H = aoa[hi].map(nh);
      const col = (...ks) => { for (const k of ks) { const i = H.findIndex(h => h === k); if (i >= 0) return i; } for (const k of ks) { const i = H.findIndex(h => h.startsWith(k)); if (i >= 0) return i; } return -1; };
      const c = { data: col('data'), targa: col('targa', 'targauso', 'mezzo'), km: col('kilometri', 'chilometri', 'km'), litri: col('litri'), prop: col('proprietario'), op: col('operatore'), note: col('note'), uso: col('movimenti', 'movimento', 'utilizzo', 'uso'), prezzo: col('prezzolitro', 'prezzo', 'eurolitro'), imp: col('importo', 'costo', 'totale'), cc: col('centrodicosto', 'centro') };
      const rowsIn = [];
      aoa.slice(hi + 1).forEach(r => {
        const tg = plate(r[c.targa]), lt = Math.abs(num(r[c.litri])); // il segno meno nel file non conta
        if (!tg || !(lt > 0)) return;
        let d = r[c.data];
        if (d instanceof Date) d = new Date(d.getTime() + 12 * 36e5); // evita problemi di fuso
        else if (typeof d === 'number' && d > 20000) d = new Date(Math.round((d - 25569) * 864e5) + 12 * 36e5);
        else { const m = String(d || '').trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); d = m ? new Date(+(m[3].length === 2 ? '20' + m[3] : m[3]), +m[2] - 1, +m[1], 12) : null; }
        if (!d || isNaN(d)) { out.noDate.push(`${plateFmt(tg)} ${fmtNum(lt, 2)} L`); return; }
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
      const seen = new Set();
      rowsIn.forEach(x => {
        if (x.d.getFullYear() < 2000 && Y) { const old = x.d.toLocaleDateString('it-IT'); x.d.setFullYear(Y[0]); x.note = `data corretta: nel file era ${old}`; }
        const data = ymd(x.d);
        const s = `${data}|${x.targa}|${x.litri}|${x.km}`;
        if (seen.has(s)) { out.dup.push(`${plateFmt(x.targa)} ${x.d.toLocaleDateString('it-IT')}`); return; }
        seen.add(s); let h = 0; for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0;
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
      if (!confirm(`${rows.length} rifornimenti · ${fmtNum(gSum(rows, 'litri'), 2)} litri · ${months.map(mLabel).join(', ')}.${old.length ? `\nSostituisce i ${old.length} rifornimenti già presenti in questi mesi.` : ''}${fixed ? `\n${fixed} data con anno sbagliato corretta in automatico.` : ''}${noKm ? `\n${noKm} righe senza chilometri validi.` : ''}${rows.dup.length ? `\n${rows.dup.length} righe doppie saltate (${rows.dup.join(', ')}).` : ''}${rows.noDate.length ? `\n${rows.noDate.length} righe senza data saltate (${rows.noDate.join(', ')}).` : ''}\nImportare?`)) return;
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
      const rmx = rentMonths(gasP), RN = gasRent();
      const w3 = U.aoa_to_sheet([['TARGA', 'NOME', 'NOLEGGIO €/MESE', 'MESI', 'NOLEGGIO PERIODO', 'CARBURANTE', 'TOTALE'], ...Object.entries(RN).map(([p, v]) => { const f = gCost(rows.filter(r => plate(r.targa) === plate(p))); return [plateFmt(plate(p)), gasName(p), num(v), rmx.length, num(v) * rmx.length, r2(f), r2(num(v) * rmx.length + f)]; })]);
      w3['!cols'] = [12, 22, 16, 8, 18, 14, 14].map(w => ({ wch: w }));
      U.book_append_sheet(wb, w3, 'Noleggi');
      XLSX.writeFile(wb, `gasolio-${gasP || 'completo'}.xlsx`);
      busy(); toast('Excel scaricato');
    } catch (e) { busy(); toast(e.message); }
  }

  /* =========================================================
     DASHBOARD GENERALE — tutte le aree di spesa
     ========================================================= */
  let ovP = '', ovAnim = true;
  const AREAS = [
    { k: 'att', t: 'Attrezzatura', go: 'attrezzatura', ic: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>' },
    { k: 'gls', t: 'Spedizioni GLS', go: 'gls', ic: '<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>' },
    { k: 'gas', t: 'Gasolio e noleggi', go: 'gasolio', ic: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5v4H7zM15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/>' },
    { k: 'ly', t: 'Lyreco', go: 'lyreco', ic: '<path d="M9 4h6v3H9z"/><path d="M15 5h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3M9 12h6M9 16h4"/>' },
    { k: 'am', t: 'Amazon', go: 'amazon', ic: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10M7.5 5l9 4"/>' }
  ];
  const ovMonthOf = { att: r => validD(r.data) ? String(r.data).slice(0, 7) : '', gls: r => r.mese || '', gas: r => String(r.data || '').slice(0, 7), ly: r => String(r.data || '').slice(0, 7), am: o => String(o.data || '').slice(0, 7) };
  const ovRows = () => ({ att: db.movimenti || [], gls: glsRows(), gas: gasRows(), ly: lyRows(), am: amOrd() });
  const ovVal = { att: arr => sumT(arr), gls: arr => gTot(arr) * gMul(), gas: (arr, m) => (gCost(arr) + gasRentTot() * rentMonths(m).length) * gMul(), ly: arr => lySum(arr), am: arr => amSum(arr) };
  const ovShort = { att: 'Attrezzatura', gls: 'GLS', gas: 'Gasolio', ly: 'Lyreco', am: 'Amazon', fat: 'Fatture' };
  function renderOverview() {
    const D = ovRows();
    const months = [...new Set(AREAS.flatMap(a => D[a.k].map(ovMonthOf[a.k])).filter(k => /^\d{4}-\d\d$/.test(k)))].sort();
    if (ovP && !months.includes(ovP)) ovP = '';
    $('#ov-per').innerHTML = `<option value=""${ovP ? '' : ' selected'}>Tutto il periodo</option>` + months.slice().reverse().map(k => `<option value="${k}"${k === ovP ? ' selected' : ''}>${esc(mLabel(k))}</option>`).join('');
    const opts = ['', ...months.slice().reverse()], ix = opts.indexOf(ovP);
    $('#ov-prev').disabled = ix >= opts.length - 1; $('#ov-next').disabled = ix <= 0;
    sub(`${ivaLbl()} · tutte le aree di spesa`);
    const pick = (k, m) => m ? D[k].filter(r => ovMonthOf[k](r) === m) : D[k];
    const P = {}, V = {};
    AREAS.forEach(a => { P[a.k] = pick(a.k, ovP); V[a.k] = ovVal[a.k](P[a.k], ovP); });
    const T = AREAS.reduce((s, a) => s + V[a.k], 0);
    const prevK = ovP ? months[months.indexOf(ovP) - 1] : null;
    const PV = prevK ? AREAS.reduce((o, a) => (o[a.k] = ovVal[a.k](pick(a.k, prevK), prevK), o), {}) : null;
    const PT = PV ? AREAS.reduce((s, a) => s + PV[a.k], 0) : 0;
    const lit = gSum(P.gas, 'litri'), noPrice = P.gas.length && !P.gas.some(r => gPrezzo(r) > 0);
    const per = ovP ? mLabel(ovP) : months.length ? `${mLabel(months[0])} – ${mLabel(months[months.length - 1])}` : 'nessun dato';
    const anim = ovAnim && !reduced(); ovAnim = false;
    const body = $('#ov-body');
    body.classList.toggle('cc-anim', anim);
    const byM = months.map(m => { const o = { m }; AREAS.forEach(a => { o[a.k] = ovVal[a.k](pick(a.k, m), m); }); o.t = AREAS.reduce((s, a) => s + o[a.k], 0); return o; });
    const undated = sumT(D.att.filter(r => !validD(r.data)));
    const top = byM.slice().sort((a, b) => b.t - a.t)[0];
    const avgM = byM.length ? byM.reduce((s, x) => s + x.t, 0) / byM.length : 0;
    const dPct = (a, b) => b ? (a / b - 1) * 100 : null;
    const dChip = (a, b) => { const p = dPct(a, b); if (p == null || !isFinite(p)) return ''; return `<span class="ov-d ${p > 0 ? 'up' : 'down'}">${p > 0 ? '▲' : '▼'} ${fmtNum(Math.abs(p), 0)}%</span>`; };
    const mName = k => MESI[Number(k.slice(5)) - 1].replace(/^./, c => c.toUpperCase());
    P.fat = ovP ? faRows().filter(r => String(r.data).slice(0, 7) === ovP) : faRows();
    const CK = allChecks(P, ovP), ckW = CK.filter(x => x.t === 'warn').length;
    const lyDocsN = new Set(P.ly.map(r => r.fattura)).size, amA = amArts(P.am);
    const nDocs = P.att.length + P.gls.length + P.gas.length + lyDocsN + P.am.length;
    const active = AREAS.filter(a => V[a.k] > 0 || P[a.k].length);
    // sparkline
    const spark = (k, i) => {
      const vals = byM.map(x => x[k]); if (vals.length < 2) return '<div class="db-spk0"></div>';
      const mx = Math.max(...vals, 1), w = 200, h = 40, st = w / (vals.length - 1);
      const pts = vals.map((v, j) => [j * st, h - 3 - (v / mx) * (h - 8)]);
      const d = pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
      const sel = ovP ? months.indexOf(ovP) : -1;
      return `<svg class="ov-spark db-spark" viewBox="-4 0 208 ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="ov-sa" d="${d} L200 ${h} L0 ${h} Z"/><path class="ov-sl" pathLength="1" style="--d:${400 + i * 100}ms" d="${d}"/>${sel >= 0 ? `<circle class="ov-sd" cx="${pts[sel][0].toFixed(1)}" cy="${pts[sel][1].toFixed(1)}" r="3.2"/>` : ''}</svg>`;
    };
    const stats = {
      att: () => [[fmtNum(P.att.length, 0), 'righe'], [new Set(P.att.map(r => r.centro).filter(Boolean)).size, 'centri']],
      gls: () => [[fmtNum(P.gls.length, 0), 'spedizioni'], [gSum(P.gls, 'kgTass') ? fmtNum(gTot(P.gls) / gSum(P.gls, 'kgTass') * gMul(), 2) + ' €' : '—', 'al kg']],
      gas: () => [[fmtNum(lit, 0) + ' L', 'litri'], [eur0(gasRentTot() * rentMonths(ovP).length * gMul()), 'noleggi']],
      ly: () => [[lyDocsN, 'fatture'], [new Set(P.ly.map(r => r.cdc || LY_NONE).filter(c => c !== LY_NONE)).size, 'piazzali']],
      am: () => [[P.am.length, 'ordini'], [new Set(P.am.map(o => o.cdc || LY_NONE).filter(c => c !== LY_NONE)).size, 'piazzali']]
    };
    const note = {
      gas: () => noPrice ? 'solo noleggi · prezzo €/L da impostare' : '',
      att: () => !ovP && undated ? `${eur0(undated)} senza data` : '',
      am: () => { const e = P.am.filter(amEst).length; return e ? `${e} ordini con IVA stimata` : ''; },
      ly: () => { const n = P.ly.filter(r => (r.cdc || LY_NONE) === LY_NONE).length; return n ? `${n} righe da attribuire` : ''; },
      gls: () => ''
    };
    // forniture per piazzale (Lyreco + Amazon)
    const pz = lyCdcList().map(c => ({ c, ly: lySum(P.ly.filter(r => (r.cdc || LY_NONE) === c.cod)), am: amSum(P.am.filter(o => (o.cdc || LY_NONE) === c.cod)) })).map(x => ({ ...x, t: x.ly + x.am })).filter(x => x.t > 0).sort((a, b) => (a.c.cod === LY_NONE) - (b.c.cod === LY_NONE) || b.t - a.t);
    const pzT = pz.reduce((s, x) => s + x.t, 0), pzM = Math.max(1, ...pz.map(x => x.t));
    // fatture e Torental
    const F = P.fat, open = F.filter(r => !faPaid(r)), late = F.filter(faLate);
    let TK = null; try { const TD = trData(); if (TD && TD.kit && TD.kit.length) { const pr = TD.kit.map(k => trCalc(k, TD).fattura).filter(v => v > 0); TK = { n: TD.kit.length, s: (TD.sing || []).length, min: Math.min(...pr), max: Math.max(...pr), tr: num(TD.transferta), kits: TD.kit.map(k => ({ n: trShort(k.n), cod: k.cod, p: trCalc(k, TD).fattura })).sort((a, b) => b.p - a.p) }; } } catch { TK = null; }

    body.innerHTML = `
      <div class="gl-hero db-hero">
        <div class="db-top">
          <div class="db-hl">
            <span class="gh-lbl">Spesa totale · ${esc(per)}</span>
            <div class="gh-big k-ovt">0 €</div>
            <div class="gh-sub"><span>${ivaLbl()}</span><span>${active.length} ${active.length === 1 ? 'area' : 'aree'} con spese</span>${PV ? `<span class="gl-d ${T > PT ? 'up' : 'down'}">${T > PT ? '▲' : '▼'} ${fmtNum(Math.abs(dPct(T, PT) || 0), 0)}% rispetto a ${esc(MESI[Number(prevK.slice(5)) - 1])}</span>` : ''}</div>
          </div>
          <div class="db-hr">
            <div class="db-mix">${AREAS.map(a => V[a.k] > 0 ? `<i class="h-${a.k}" style="flex:${V[a.k]}" title="${esc(a.t)}: ${esc(eur(V[a.k]))}"></i>` : '').join('')}</div>
            <div class="db-mixl">${AREAS.map(a => `<a class="db-mr" href="#${a.go}"><i class="h-${a.k}"></i><span>${ovShort[a.k]}</span><b>${eur0(V[a.k])}</b><em>${T ? fmtNum(pct(V[a.k], T), 0) : 0}%</em></a>`).join('')}</div>
          </div>
        </div>
        <div class="gh-kpis db-kpis">
          <div class="gh-k"><span>Media mensile</span><b data-ovk="0">0 €</b><small>${byM.length} ${byM.length === 1 ? 'mese' : 'mesi'} con dati</small></div>
          <div class="gh-k"><span>Mese più alto</span><b>${top ? esc(mName(top.m)) : '—'}</b><small>${top ? esc(eur0(top.t)) : ''}</small></div>
          <div class="gh-k"><span>Documenti registrati</span><b data-ovk="1">0</b><small>acquisti, spedizioni, pieni, fatture e ordini</small></div>
          <div class="gh-k"><span>Da controllare</span><b data-ovk="2">0</b><small>${CK.length ? `${ckW} importanti` : 'tutto in ordine'}</small></div>
        </div>
      </div>

      <div class="db-areas">${AREAS.map((a, i) => { const st = stats[a.k](), nt = note[a.k]();
        return `<a class="card db-area a-${a.k}" href="#${a.go}" style="--d:${120 + i * 70}ms">
          <div class="db-ah"><span class="ov-ic"><svg viewBox="0 0 24 24">${a.ic}</svg></span><span class="db-at"><span class="lb-d">${a.t}</span><span class="lb-m">${ovShort[a.k]}</span></span><svg class="db-go" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
          <div class="db-av"><b data-ova="${i}">0 €</b></div>
          <div class="db-am">${PV ? dChip(V[a.k], PV[a.k]) : ''}<span>${T ? fmtNum(pct(V[a.k], T), 1) : 0}% del totale</span></div>
          ${spark(a.k, i)}
          <div class="db-as">${st.map(([v, l]) => `<div><b>${esc(String(v))}</b><small>${l}</small></div>`).join('')}</div>
          ${nt ? `<div class="db-an">${esc(nt)}</div>` : ''}
        </a>`; }).join('')}</div>

      <div class="db-row">
        <div class="card ov-trend"><div class="card-h"><h3>Spesa mese per mese</h3><span class="muted small">${ivaLbl()} · tocca un mese per vederlo</span></div>
          <div class="ov-bars" id="ov-bars"></div>
          <div class="ov-leg db-leg">${AREAS.map(a => `<span class="a-${a.k}"><i></i>${ovShort[a.k]}</span>`).join('')}${!ovP && undated ? `<span class="muted">${esc(eur0(undated))} di attrezzatura senza data non sono nel grafico</span>` : ''}</div></div>
        <div class="card db-split"><div class="card-h"><h3>Peso delle aree</h3><span class="muted small">${esc(ovP ? mLabel(ovP) : 'tutto il periodo')}</span></div>
          ${AREAS.slice().sort((a, b) => V[b.k] - V[a.k]).map((a, i) => `<a class="db-sr a-${a.k}" href="#${a.go}" style="--d:${200 + i * 60}ms">
            <span class="db-st"><b>${a.t}</b><span><em>${T ? fmtNum(pct(V[a.k], T), 1) : 0}%</em><strong>${eur0(V[a.k])}</strong></span></span>
            <span class="db-sb"><i style="width:${T ? (V[a.k] / Math.max(...AREAS.map(x => V[x.k]), 1) * 100).toFixed(1) : 0}%"></i></span>
            <small>${PV ? (PV[a.k] ? `${V[a.k] >= PV[a.k] ? '+' : '−'}${eur0(Math.abs(V[a.k] - PV[a.k]))} rispetto a ${esc(MESI[Number(prevK.slice(5)) - 1])}` : 'nessuna spesa il mese prima') : `media ${eur0(byM.length ? byM.reduce((s, x) => s + x[a.k], 0) / byM.length : 0)} al mese`}</small>
          </a>`).join('')}
          <div class="db-stot"><span>Totale</span><b>${eur(T)}</b></div>
        </div>
      </div>

      <div class="db-row">
        <div class="card db-pz"><div class="card-h"><h3>Forniture per piazzale</h3><span class="muted small">Lyreco + Amazon · ${ivaLbl()}</span></div>
          ${pz.length ? `<div class="db-pzl">${pz.map((x, i) => `<div class="db-pr${x.c.cod === LY_NONE ? ' na' : ''}" style="--d:${200 + i * 45}ms">
              <span class="db-pn">${x.c.cod === LY_NONE ? '?' : i + 1}</span>
              <span class="db-pm"><span class="db-pt"><b>${esc(x.c.n)}</b><strong>${eur0(x.t)}</strong></span>
                <span class="db-pb" style="width:${(x.t / pzM * 100).toFixed(1)}%">${x.ly > 0 ? `<i class="a-ly" style="flex:${x.ly}" title="Lyreco ${esc(eur(x.ly))}"></i>` : ''}${x.am > 0 ? `<i class="a-am" style="flex:${x.am}" title="Amazon ${esc(eur(x.am))}"></i>` : ''}</span>
                <small>${esc(x.c.cod)}${x.c.citta ? ' · ' + esc(x.c.citta) : ''} · ${fmtNum(pct(x.t, pzT), 1)}%${x.ly > 0 ? ` · Lyreco ${eur0(x.ly)}` : ''}${x.am > 0 ? ` · Amazon ${eur0(x.am)}` : ''}</small></span>
            </div>`).join('')}</div>
            <div class="ov-leg db-leg"><span class="a-ly"><i></i>Lyreco</span><span class="a-am"><i></i>Amazon</span><span class="muted">${pz.filter(x => x.c.cod !== LY_NONE).length} piazzali · ${eur0(pzT)}</span></div>` : '<div class="empty">Nessuna fornitura Lyreco o Amazon nel periodo</div>'}
        </div>
        <div class="db-side">
          <a class="card db-mini a-fat" href="#fatture">
            <div class="db-ah"><span class="ov-ic"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg></span><span class="db-at">Fatture fornitori</span><svg class="db-go" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
            <div class="db-mv"><b>${eur0(open.reduce((a, r) => a + num(r.totale), 0))}</b><span>da pagare · ${open.length} di ${F.length} fatture</span>${late.length ? `<span class="ov-d up">${late.length} ${late.length === 1 ? 'scaduta' : 'scadute'}</span>` : ''}</div>
            <div class="ov-fbar">${F.length ? `<i style="flex:${F.length - open.length}" class="pd"></i><i style="flex:${open.length - late.length}" class="op"></i><i style="flex:${late.length}" class="lt"></i>` : ''}</div>
            ${open.length ? `<div class="db-ml">${open.slice().sort((a, b) => String(a.scadenza || '9').localeCompare(String(b.scadenza || '9'))).slice(0, 3).map(r => `<div class="db-mli${faLate(r) ? ' late' : ''}"><span><b>${esc(String(r.fornitore || '—').split(/\s+/).slice(0, 2).join(' '))}</b><small>n. ${esc(r.numero || '—')}${validD(r.scadenza) ? ` · ${faLate(r) ? 'scaduta il' : 'scade il'} ${esc(shortDate(r.scadenza))}` : ''}</small></span><strong>${eur(num(r.totale))}</strong></div>`).join('')}</div>` : ''}
            <div class="db-an">non sommate alla spesa: sono già negli acquisti</div>
          </a>
          <a class="card db-mini a-tr" href="#torental">
            <div class="db-ah"><span class="ov-ic"><svg viewBox="0 0 24 24"><path d="M3 7h12v9H3zM15 10h3.5L21 13v3h-6"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17.5" cy="17.5" r="1.7"/><path d="M6 10.5h6"/></svg></span><span class="db-at">Listino Torental</span><svg class="db-go" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
            ${TK ? `<div class="db-mv"><b>${TK.n} kit</b><span>da ${eur0(TK.min)} a ${eur0(TK.max)}</span></div>
            <div class="db-ml">${TK.kits.slice(0, 3).map(k => `<div class="db-mli"><span><b>${esc(k.n)}</b><small>${k.cod ? 'cod. ' + esc(k.cod) : 'senza codice'}</small></span><strong>${eur(k.p)}</strong></div>`).join('')}</div>
            <div class="db-an">listino di vendita, non è una spesa · ${TK.s} articoli singoli · transferta ${eur0(TK.tr)}/giorno</div>` : '<div class="db-an">Importa il listino dalla sezione Torental</div>'}
          </a>
        </div>
      </div>

      <div class="db-row db-row2">
        <div class="card ov-ck" id="ov-ck"><div class="card-h"><h3>Cose da verificare</h3><span class="muted small">${CK.length ? `${CK.length} punti · ${ckW} importanti` : 'tutto coincide'}</span></div>
        <div class="ov-ckf">${[['', 'Tutte', CK.length], ...['att', 'gls', 'gas', 'ly', 'am', 'fat'].map(k => [k, ovShort[k], CK.filter(x => x.a === k).length])].filter(([k, , n]) => !k || n).map(([k, l, n]) => `<button type="button" class="ov-cf${k === '' ? ' on' : ''}" data-ckf="${k}">${k ? `<i class="a-${k}"></i>` : ''}${l}<b>${n}</b></button>`).join('')}</div>
        ${CK.length ? `<div class="ov-cl">${CK.map((x, i) => `<button type="button" class="ov-ci ${x.t}" data-ovgo="${x.go}" data-cka="${x.a}" style="--d:${150 + Math.min(i, 12) * 45}ms"${i >= 4 ? ' data-more="1"' : ''}><span class="ov-cl-l"></span><span class="ov-cm"><span class="ov-ct"><em class="ov-tag t-${x.a}">${ovShort[x.a]}</em><b>${x.h}</b></span><small>${x.d}</small></span><b class="ov-cv">${x.v}</b><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`).join('')}</div>${CK.length > 4 ? `<button type="button" class="db-more" id="ov-ckmore">Mostra tutti i ${CK.length} punti</button>` : ''}` : '<div class="empty">Tutto coincide: nessuna anomalia trovata</div>'}</div>
        <div class="card db-feed"><div class="card-h"><h3>Ultimi movimenti</h3><span class="muted small">tutte le aree</span></div><div class="ov-feed" id="ov-feed"></div></div>
      </div>
      <div class="card ov-aic db-ai" id="ov-ai"></div>
      <div class="ov-3 db-tops" id="ov-tops"></div>`;

    countTo($('.k-ovt', body), T, eur0);
    const KV = [avgM, nDocs, CK.length];
    $$('[data-ovk]', body).forEach(el => { const i = +el.dataset.ovk; el._v = 0; countTo(el, KV[i], i ? x => fmtNum(Math.round(x), 0) : eur0); });
    $$('[data-ova]', body).forEach(el => { const a = AREAS[+el.dataset.ova]; el._v = 0; countTo(el, V[a.k], eur0); });

    // barre impilate
    const mx = Math.max(...byM.map(x => x.t), 1);
    $('#ov-bars').innerHTML = byM.length ? byM.map((x, i) => `<div class="ov-b${x.m === ovP ? ' on' : ''}" data-ovm="${x.m}" title="${esc(mLabel(x.m))}: ${esc(eur(x.t))}\n${AREAS.filter(a => x[a.k]).map(a => `${ovShort[a.k]}: ${eur(x[a.k])}`).join('\n')}"><span class="ov-bv">${esc(eur0(x.t))}</span><div class="ov-bc" style="height:${Math.max(1.5, x.t / mx * 100).toFixed(1)}%;--d:${i * 45}ms">${AREAS.slice().reverse().map(a => x[a.k] > 0 ? `<i class="a-${a.k}" style="flex:${x[a.k]}"></i>` : '').join('')}</div><span class="ov-bl">${esc(MESI[Number(x.m.slice(5)) - 1].slice(0, 3))}${x.m.slice(0, 4) !== String(new Date().getFullYear()) ? ' ' + x.m.slice(2, 4) : ''}</span></div>`).join('') : '<div class="empty">Nessun dato con data</div>';

    // ultimi movimenti
    const lyFeed = [...groupBy(P.ly, r => String(r.fattura))].map(([id, v]) => ({ a: 'ly', d: v[0].data, t: `Fattura Lyreco ${id}`, s: [...new Set(v.map(r => lyName(r.cdc || LY_NONE)))].slice(0, 2).join(', '), v: lySum(v), go: 'lyreco' }));
    const feed = [
      ...P.att.filter(r => validD(r.data)).map(r => ({ a: 'att', d: r.data, t: r.descrizione, s: r.centro, v: tot(r), go: 'movimenti' })),
      ...P.gls.map(r => ({ a: 'gls', d: r.data, t: `${r.destinatario}`, s: `${r.citta} (${r.prov})`, v: num(r.totale) * gMul(), go: 'gls' })),
      ...P.gas.map(r => ({ a: 'gas', d: r.data, t: `${plateFmt(plate(r.targa))} · ${fmtNum(num(r.litri), 1)} L`, s: r.uso || r.operatore, v: gPrezzo(r) ? num(r.litri) * gPrezzo(r) * gMul() : null, go: 'gasolio' })),
      ...lyFeed,
      ...P.am.map(o => ({ a: 'am', d: o.data, t: String(o.articoli || 'Ordine Amazon').split(/\s*\|\s*/)[0], s: lyName(o.cdc || LY_NONE), v: amV(o), go: 'amazon' }))
    ].sort((a, b) => String(b.d).localeCompare(String(a.d))).slice(0, 8);
    $('#ov-feed').innerHTML = feed.length ? feed.map((x, i) => `<a class="ov-fr a-${x.a}" href="#${x.go}" style="--d:${250 + i * 50}ms"><span class="ov-fi"><svg viewBox="0 0 24 24">${AREAS.find(a => a.k === x.a).ic}</svg></span><span class="ov-fm"><b>${esc(x.t)}</b><small>${esc(shortDate(x.d))}${x.s ? ' · ' + esc(x.s) : ''}</small></span><b class="ov-fv">${x.v == null ? '—' : esc(eur(x.v))}</b></a>`).join('') : '<div class="empty">Nessun movimento</div>';

    renderOvAI(() => ovSummary(P, V, byM, CK));
    // classifiche
    const top5 = (arr, kf, vf, lf) => [...groupBy(arr, kf)].map(([k, v]) => ({ k, v: vf(v), n: v.length, l: lf ? lf(v) : '' })).filter(x => x.k && x.k !== '—').sort((a, b) => b.v - a.v).slice(0, 5);
    const T1 = top5(P.att, r => r.centro || '—', sumT), T2 = top5(P.gls, r => r.citta + ' (' + r.prov + ')', v => gTot(v) * gMul(), v => String(v[0].destinatario || '').toUpperCase()), T3 = top5(P.gas, r => plate(r.targa), v => noPrice ? gSum(v, 'litri') : gCost(v) * gMul(), v => gasName(v[0].targa) || (v.map(r => gasNorm(r.uso)).filter(Boolean)[0] || ''));
    const T4 = [...groupBy(amA, a => a.cat)].map(([k, v]) => ({ k, v: v.reduce((s, a) => s + a.val, 0), n: v.length, l: 'Amazon' }));
    [...groupBy(P.ly, r => r.categoria || 'Altro')].forEach(([k, v]) => T4.push({ k, v: lySum(v), n: v.length, l: 'Lyreco' }));
    const T4s = T4.sort((a, b) => b.v - a.v).slice(0, 5);
    const box = (title, link, list, fmt, unit, nm, cls) => { const m = Math.max(...list.map(x => x.v), 1); return `<div class="card ${cls || ''}"><div class="card-h"><h3>${title}</h3><a class="link" href="#${link}">Apri</a></div>${list.length ? `<div class="ov-top">${list.map((x, i) => `<div class="ov-tr" style="--d:${200 + i * 60}ms"><span class="ov-tn">${i + 1}</span><span class="ov-tm"><b>${esc(nm ? nm(x.k) : x.k)}</b><small>${x.l ? esc(x.l) + ' · ' : ''}${x.n} ${unit}</small><span class="gd-b"><i style="width:${(x.v / m * 100).toFixed(1)}%"></i></span></span><b>${fmt(x.v)}</b></div>`).join('')}</div>` : '<div class="empty">Nessun dato</div>'}</div>`; };
    $('#ov-tops').innerHTML = box('Centri · attrezzatura', 'attrezzatura', T1, eur0, 'righe', null, 'a-att') + box('Destinazioni GLS', 'gls', T2, eur0, 'sped.', null, 'a-gls') + box(noPrice ? 'Mezzi · litri' : 'Mezzi · gasolio', 'gasolio', T3, noPrice ? v => fmtNum(v, 0) + ' L' : eur0, 'pieni', plateFmt, 'a-gas') + box('Categorie · forniture', T4s[0] && T4s[0].l === 'Lyreco' ? 'lyreco' : 'amazon', T4s, eur0, 'righe', null, 'a-am');
  }

  /* =========================================================
     FATTURE FORNITORI (es. Lyreco)
     ========================================================= */
  let faP = '', faAnim = true, faF = { q: '', forn: '', stato: '' }, faLimit = 80;
  const faRows = () => db.fatture || [];
  const faOk = () => isLocal() || !db.v || db.v >= 'cdc-1.4';
  const faMonths = () => [...new Set(faRows().map(r => String(r.data).slice(0, 7)).filter(k => /^\d{4}-\d\d$/.test(k)))].sort();
  const faV = r => num(ivaOn ? r.totale || num(r.imponibile) + num(r.imposta) : r.imponibile || num(r.totale) - num(r.imposta));
  const faSum = arr => arr.reduce((a, r) => a + faV(r), 0);
  const faPaid = r => /pagat/i.test(r.stato || '');
  const faLate = r => !faPaid(r) && validD(r.scadenza) && String(r.scadenza).slice(0, 10) < today();
  const faSoon = r => !faPaid(r) && validD(r.scadenza) && !faLate(r) && (parseD(r.scadenza) - parseD(today())) / 864e5 <= 7;
  const faRighe = r => { try { const x = JSON.parse(r.righe || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } };
  const faDdt = r => String(r.ddt || '').split(/[,;\s]+/).map(x => x.replace(/[^0-9a-z]/gi, '').toUpperCase()).filter(x => x.length > 2);
  const normDoc = s => String(s || '').replace(/[^0-9a-z]/gi, '').toUpperCase();
  const fornKey = s => String(s || '').toUpperCase().replace(/S\.?R\.?L\.?|S\.?P\.?A\.?|ITALIA|[^A-Z0-9 ]/g, ' ').trim().split(/\s+/)[0] || '';
  // collega la fattura agli acquisti registrati: prima per numero di DDT/fattura, poi per codici articolo dello stesso fornitore
  function faLink(r) {
    const docs = new Set([...faDdt(r), normDoc(r.numero)].filter(Boolean)), fk = fornKey(r.fornitore);
    let rows = db.movimenti.filter(m => m.ndoc && docs.has(normDoc(m.ndoc)));
    let how = rows.length ? 'documento' : '';
    if (!rows.length) {
      const codes = new Set(faRighe(r).map(x => String(x.codice || '').trim().toUpperCase()).filter(Boolean));
      if (codes.size) {
        const d0 = validD(r.data) ? parseD(r.data).getTime() : null;
        rows = db.movimenti.filter(m => codes.has(String(m.codice || '').trim().toUpperCase()) && (!fk || !m.fornitore || fornKey(m.fornitore) === fk) && (!d0 || !validD(m.data) || Math.abs(parseD(m.data) - d0) < 75 * 864e5));
        if (rows.length) how = 'codici';
      }
    }
    const tot = r2(rows.reduce((a, m) => a + totN(m), 0)), imp = num(r.imponibile);
    const diff = rows.length ? r2(imp - tot) : null;
    return { rows, tot, how, diff, ok: rows.length && Math.abs(diff) <= Math.max(1, imp * .01) };
  }
  // prezzi fatturati diversi dall'ultimo prezzo d'acquisto in archivio
  function faPriceDiffs(r) {
    const out = [];
    faRighe(r).forEach(x => {
      const c = String(x.codice || '').trim().toUpperCase(); if (!c || !num(x.prezzo)) return;
      const ms = db.movimenti.filter(m => String(m.codice || '').trim().toUpperCase() === c && num(m.prezzo)).sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
      if (!ms.length) return;
      const ref = num(ms[0].prezzo), p = num(x.prezzo), d = (p / ref - 1);
      if (Math.abs(d) > .02) out.push({ codice: c, descrizione: x.descrizione || ms[0].descrizione, prezzo: p, rif: ref, d, q: num(x.quantita) || 1 });
    });
    return out;
  }
  function faChecks(rows) {
    const A = [];
    const late = rows.filter(faLate); if (late.length) A.push({ t: 'warn', h: 'Fatture scadute da pagare', d: `${late.length} fatture oltre la scadenza: ${late.slice(0, 4).map(r => `${esc(r.fornitore)} n. ${esc(r.numero)}`).join(', ')}${late.length > 4 ? '…' : ''}.`, v: eur(late.reduce((a, r) => a + num(r.totale), 0)), ids: late.map(r => r.id) });
    const soon = rows.filter(faSoon); if (soon.length) A.push({ t: 'info', h: 'In scadenza nei prossimi 7 giorni', d: `${soon.length} fatture da pagare a breve.`, v: eur(soon.reduce((a, r) => a + num(r.totale), 0)), ids: soon.map(r => r.id) });
    const badTot = rows.filter(r => num(r.totale) && num(r.imponibile) && Math.abs(num(r.imponibile) + num(r.imposta) - num(r.totale)) > .05);
    if (badTot.length) A.push({ t: 'warn', h: 'Totali che non tornano', d: `In ${badTot.length} fatture imponibile + IVA non è uguale al totale.`, v: badTot.length + '', ids: badTot.map(r => r.id) });
    const badR = rows.filter(r => { const R = faRighe(r); if (!R.length || !num(r.imponibile)) return false; const s = R.reduce((a, x) => a + (num(x.totale) || num(x.quantita) * num(x.prezzo)), 0); return Math.abs(s - num(r.imponibile)) > Math.max(1, num(r.imponibile) * .01); });
    if (badR.length) A.push({ t: 'info', h: 'Righe diverse dall\'imponibile', d: `In ${badR.length} fatture la somma delle righe non coincide con l'imponibile (spese di trasporto, sconti o righe non lette).`, v: badR.length + '', ids: badR.map(r => r.id) });
    const dup = [...groupBy(rows.filter(r => r.numero), r => fornKey(r.fornitore) + '|' + normDoc(r.numero))].filter(([, v]) => v.length > 1);
    dup.forEach(([, v]) => A.push({ t: 'warn', h: 'Fattura registrata due volte', d: `${esc(v[0].fornitore)} n. ${esc(v[0].numero)} compare ${v.length} volte.`, v: eur(num(v[0].totale)), ids: v.map(r => r.id) }));
    const L = rows.map(r => ({ r, l: faLink(r) }));
    const diff = L.filter(x => x.l.rows.length && !x.l.ok);
    if (diff.length) A.push({ t: 'warn', h: 'Fattura diversa dagli acquisti registrati', d: diff.slice(0, 3).map(x => `${esc(x.r.fornitore)} n. ${esc(x.r.numero)}: fattura ${eur(num(x.r.imponibile))}, acquisti ${eur(x.l.tot)}`).join(' · ') + (diff.length > 3 ? ' …' : ''), v: eur(diff.reduce((a, x) => a + Math.abs(x.l.diff), 0)), ids: diff.map(x => x.r.id) });
    const none = L.filter(x => !x.l.rows.length);
    if (none.length) A.push({ t: 'info', h: 'Fatture senza acquisti collegati', d: `${none.length} fatture non trovano righe in Attrezzatura (stesso numero DDT o stessi codici): verifica che la merce sia stata registrata.`, v: eur(none.reduce((a, x) => a + num(x.r.imponibile), 0)), ids: none.map(x => x.r.id) });
    const pd = rows.flatMap(r => faPriceDiffs(r).map(x => ({ ...x, r }))).filter(x => x.d > 0);
    if (pd.length) A.push({ t: 'warn', h: 'Prezzi più alti del solito', d: pd.sort((a, b) => b.d - a.d).slice(0, 3).map(x => `${esc(String(x.descrizione).slice(0, 48))}: ${eurP(x.prezzo)} invece di ${eurP(x.rif)} (+${fmtNum(x.d * 100, 0)}%)`).join(' · '), v: eur(pd.reduce((a, x) => a + (x.prezzo - x.rif) * x.q, 0)) + ' in più', ids: [...new Set(pd.map(x => x.r.id))] });
    const noPdf = rows.filter(r => !r.pdf); if (noPdf.length && rows.length) A.push({ t: 'info', h: 'Fatture senza documento allegato', d: `${noPdf.length} fatture non hanno il PDF salvato.`, v: noPdf.length + '', ids: noPdf.map(r => r.id) });
    return A;
  }

  function renderFat() {
    const months = faMonths();
    if (faP && !months.includes(faP)) faP = '';
    $('#fa-per').innerHTML = `<option value=""${faP ? '' : ' selected'}>Tutto il periodo</option>` + months.slice().reverse().map(k => `<option value="${k}"${k === faP ? ' selected' : ''}>${esc(mLabel(k))}</option>`).join('');
    const opts = ['', ...months.slice().reverse()], ix = opts.indexOf(faP);
    $('#fa-prev').disabled = ix >= opts.length - 1; $('#fa-next').disabled = ix <= 0;
    $('#fa-ai').hidden = !aiReady();
    sub(`${ivaOn ? 'IVA inclusa' : 'imponibile, IVA esclusa'} · fatture dei fornitori`);
    const all = faRows(), rows = faP ? all.filter(r => String(r.data).slice(0, 7) === faP) : all;
    const anim = faAnim && !reduced(); faAnim = false;
    const body = $('#fa-body'); body.classList.toggle('cc-anim', anim);
    const warn = faOk() ? '' : `<div class="card gl-warn"><b>Aggiorna lo script Google per salvare le fatture.</b><span>Lo script collegato è la versione ${esc(db.v || '—')}: serve la cdc-1.4 (Code.gs nuovo).</span></div>`;
    if (!rows.length) {
      body.innerHTML = warn + `<div class="gl-hero fa-hero gl-hero-empty"><div class="gh-top"><div class="gh-art">${faArt()}</div><div class="gh-main"><span class="gh-lbl">Fatture fornitori</span><h3>Nessuna fattura registrata</h3><p>${aiReady() ? 'Premi «Leggi fattura» e carica il PDF: l\'IA compila tutto da sola.' : 'Aggiungi una fattura o importa un Excel. Con la chiave Gemini l\'app legge da sola i PDF.'}</p></div></div></div>`;
      return;
    }
    const T = faSum(rows), imp = rows.reduce((a, r) => a + num(r.imponibile), 0), iva = rows.reduce((a, r) => a + num(r.imposta), 0), tt = rows.reduce((a, r) => a + num(r.totale), 0);
    const open = rows.filter(r => !faPaid(r)), late = rows.filter(faLate);
    const L = rows.map(r => ({ r, l: faLink(r) })), okN = L.filter(x => x.l.ok).length, difN = L.filter(x => x.l.rows.length && !x.l.ok).length;
    const forn = new Set(rows.map(r => fornKey(r.fornitore))).size;
    const per = faP ? mLabel(faP) : months.length > 1 ? `${mLabel(months[0])} – ${mLabel(months[months.length - 1])}` : months.length ? mLabel(months[0]) : '';
    const nF = n => `${n} ${n === 1 ? 'fattura' : 'fatture'}`;
    const K = [['Imponibile', imp, eur0, nF(rows.length)], ['IVA', iva, eur0, imp ? fmtNum(iva / imp * 100, 1) + '% medio' : ''], ['Totale', tt, eur0, 'IVA inclusa'],
      ['Da pagare', open.reduce((a, r) => a + num(r.totale), 0), eur0, nF(open.length)], ['Scadute', late.reduce((a, r) => a + num(r.totale), 0), eur0, nF(late.length)],
      ['Verifica acquisti', okN, v => `${Math.round(v)} / ${rows.length}`, difN ? `${difN} con differenze` : 'coincidono']];
    body.innerHTML = warn + `
      <div class="gl-hero fa-hero">
        <div class="gh-top"><div class="gh-art">${faArt()}</div>
        <div class="gh-main"><span class="gh-lbl">Fatture fornitori · ${esc(per)}</span><div class="gh-big k-fat">0 €</div>
          <div class="gh-sub"><span>${nF(rows.length)}</span><span>${forn} ${forn === 1 ? 'fornitore' : 'fornitori'}</span>${late.length ? `<span class="gl-d up">${late.length} ${late.length === 1 ? "scaduta" : "scadute"}</span>` : ''}</div></div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k"><span>${l}</span><b data-fak="${i}">0</b><small>${s}</small></div>`).join('')}</div>
      </div>
      <div class="card" id="fa-anom"></div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Per fornitore</h3><span class="muted small">${ivaLbl()}</span></div><div class="bars" id="fa-forn"></div></div>
        <div class="card"><div class="card-h"><h3>Scadenze</h3><span class="muted small">${open.length} da pagare</span></div><div id="fa-due"></div></div>
      </div>
      ${months.length > 1 && !faP ? `<div class="card"><div class="card-h"><h3>Mese per mese</h3><span class="muted small">${ivaLbl()}</span></div><div class="mbars fa-bars" id="fa-tr"></div></div>` : ''}
      <div class="card gl-list"><div class="card-h"><h3>Tutte le fatture</h3><span class="muted small" id="fa-cnt"></span></div>
        <div class="filters f3 gl-f"><input id="fa-q" type="search" placeholder="Cerca fornitore, numero, DDT…" value="${esc(faF.q)}"><select id="fa-ff"></select><select id="fa-fs"><option value="">Tutti gli stati</option><option value="open"${faF.stato === 'open' ? ' selected' : ''}>Da pagare</option><option value="late"${faF.stato === 'late' ? ' selected' : ''}>Scadute</option><option value="paid"${faF.stato === 'paid' ? ' selected' : ''}>Pagate</option><option value="diff"${faF.stato === 'diff' ? ' selected' : ''}>Non coincidono con gli acquisti</option></select></div>
        <div id="fa-list"></div></div>`;
    countTo($('.k-fat', body), T, eur0);
    $$('[data-fak]', body).forEach(el => { const i = +el.dataset.fak; el._v = 0; countTo(el, K[i][1], K[i][2]); });
    // anomalie
    const A = faChecks(rows), I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    $('#fa-anom').innerHTML = `<div class="card-h"><h3>Controlli</h3><span class="muted small">${A.length ? A.length + ' punti da verificare' : 'tutto in ordine'}</span></div>` + (A.length ? `<div class="gl-an">${A.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms" data-faq="${esc(x.ids.join(' '))}"><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span></div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Nessuna anomalia</div>');
    // fornitori
    const byF = [...groupBy(rows, r => String(r.fornitore || '—').trim().toUpperCase())].map(([k, v]) => ({ k, v: faSum(v), n: v.length })).sort((a, b) => b.v - a.v), mf = Math.max(...byF.map(x => x.v), 1);
    $('#fa-forn').innerHTML = byF.slice(0, 10).map((x, i) => `<div class="bar-row gl-anim-row" style="--d:${200 + i * 50}ms" data-faforn="${esc(x.k)}"><div class="bar-top"><span>${esc(x.k)}<em>${x.n} ${x.n === 1 ? 'fattura' : 'fatture'}</em></span><span>${eur0(x.v)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(x.v / mf * 100).toFixed(2)}%"></div></div></div>`).join('');
    // scadenze
    const due = open.slice().sort((a, b) => String(a.scadenza || '9999').localeCompare(String(b.scadenza || '9999'))).slice(0, 8);
    $('#fa-due').innerHTML = due.length ? `<div class="fa-due">${due.map((r, i) => { const d = validD(r.scadenza) ? Math.round((parseD(r.scadenza) - parseD(today())) / 864e5) : null; return `<div class="fa-dr${faLate(r) ? ' late' : faSoon(r) ? ' soon' : ''}" data-fat="${esc(r.id)}" style="--d:${200 + i * 50}ms"><span class="fa-dd"><b>${d == null ? '—' : d < 0 ? Math.abs(d) : d}</b><small>${d == null ? 'senza scad.' : d < 0 ? 'gg fa' : d === 0 ? 'oggi' : 'giorni'}</small></span><span class="fa-dm"><b>${esc(r.fornitore)}</b><small>n. ${esc(r.numero)} · scade ${validD(r.scadenza) ? esc(shortDate(r.scadenza)) : '—'}</small></span><b>${eur(num(r.totale))}</b></div>`; }).join('')}</div>` : '<div class="empty">Tutto pagato</div>';
    if ($('#fa-tr')) { const mm = months.map(k => ({ k, v: faSum(all.filter(r => String(r.data).slice(0, 7) === k)) })), mx = Math.max(...mm.map(x => x.v), 1); $('#fa-tr').innerHTML = mm.map((x, i) => `<div class="mb gl-mb" data-faper="${x.k}" title="${esc(mLabel(x.k))}: ${esc(eur(x.v))}"><span class="mbv">${esc(eur0(x.v))}</span><i class="${x.v === mx ? 'cur' : ''}" style="height:${Math.max(3, x.v / mx * 100)}%;animation-delay:${i * 50}ms"></i><span class="mbl">${esc(MESI[Number(x.k.slice(5)) - 1].slice(0, 3))}</span></div>`).join(''); }
    $('#fa-ff').innerHTML = `<option value="">Tutti i fornitori</option>` + byF.map(x => `<option value="${esc(x.k)}"${faF.forn === x.k ? ' selected' : ''}>${esc(x.k)}</option>`).join('');
    renderFatList(rows);
  }
  function renderFatList(rows, only) {
    rows = rows || (faP ? faRows().filter(r => String(r.data).slice(0, 7) === faP) : faRows());
    const q = faF.q.trim().toLowerCase();
    const Ls = (only || rows).filter(r => (!faF.forn || String(r.fornitore || '').trim().toUpperCase() === faF.forn) && (!q || `${r.fornitore} ${r.numero} ${r.ddt} ${r.note} ${r.centro}`.toLowerCase().includes(q))
      && (!faF.stato || (faF.stato === 'open' && !faPaid(r)) || (faF.stato === 'late' && faLate(r)) || (faF.stato === 'paid' && faPaid(r)) || (faF.stato === 'diff' && (() => { const l = faLink(r); return !l.ok; })())))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)));
    $('#fa-cnt').textContent = `${Ls.length} fatture · ${eur(faSum(Ls))}`;
    if (!Ls.length) { $('#fa-list').innerHTML = '<div class="empty">Nessuna fattura</div>'; return; }
    const sh = Ls.slice(0, faLimit), more = Ls.length > faLimit ? `<div class="more-row"><button class="btn sm" id="fa-more">Mostra tutte (${Ls.length})</button></div>` : '';
    const st = r => faPaid(r) ? '<span class="chip paid">Pagata</span>' : faLate(r) ? '<span class="chip late">Scaduta</span>' : '<span class="chip soon">Da pagare</span>';
    const vf = r => { const l = faLink(r); return l.ok ? '<span class="chip paid">Coincide</span>' : l.rows.length ? `<span class="chip late" title="Acquisti registrati: ${esc(eur(l.tot))}">${l.diff > 0 ? '+' : ''}${esc(eur(l.diff))}</span>` : '<span class="chip">Non collegata</span>'; };
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    if (isDesk()) $('#fa-list').innerHTML = `<table class="tbl gl-st"><thead><tr><th>Data</th><th>Fornitore</th><th>Numero</th><th>Scadenza</th><th class="r">Imponibile</th><th class="r">Totale</th><th>Stato</th><th>Verifica acquisti</th><th></th></tr></thead><tbody>
      ${sh.map(r => `<tr data-fat="${esc(r.id)}"><td class="d">${dd(r.data)}</td><td><b>${esc(r.fornitore)}</b></td><td class="m2">${esc(r.numero)}</td><td class="m2">${dd(r.scadenza)}</td><td class="num">${eur(num(r.imponibile))}</td><td class="num amt">${eur(num(r.totale))}</td><td>${st(r)}</td><td>${vf(r)}</td><td>${r.pdf ? '<span class="fa-clip" title="PDF salvato"><svg viewBox="0 0 24 24"><path d="M21 12.5 12.7 20.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/></svg></span>' : ''}</td></tr>`).join('')}</tbody></table>${more}`;
    else $('#fa-list').innerHTML = `<div class="list">${sh.map(r => `<div class="item" data-fat="${esc(r.id)}"><span class="ic fa-ic"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg></span><div class="main"><div class="t">${esc(r.fornitore)} · n. ${esc(r.numero)}</div><div class="s">${dd(r.data)} · ${faPaid(r) ? 'pagata' : faLate(r) ? 'scaduta' : 'da pagare'}</div></div><div class="amt">${eur(faV(r))}</div></div>`).join('')}</div>${more}`;
  }

  function faDetail(id) {
    const r = faRows().find(x => x.id === id); if (!r) return;
    const R = faRighe(r), l = faLink(r), pd = faPriceDiffs(r), pdm = new Map(pd.map(x => [x.codice, x]));
    openSheet(`${r.fornitore} · n. ${r.numero}`, `
      <div class="kv">${[['Data', validD(r.data) ? shortDate(r.data) : '—'], ['Scadenza', validD(r.scadenza) ? shortDate(r.scadenza) : '—'], ['Stato', faPaid(r) ? `Pagata${validD(r.pagata) ? ' il ' + shortDate(r.pagata) : ''}` : faLate(r) ? 'Scaduta' : 'Da pagare'], ['Centro di costo', r.centro || '—'], ['DDT / ordini', r.ddt || '—'], ['Note', r.note || '—']].map(([a, b]) => `<div><span>${a}</span><strong>${esc(String(b))}</strong></div>`).join('')}</div>
      <div class="iva-sum" style="margin-top:14px"><div><span>Imponibile</span><b>${eur(num(r.imponibile))}</b></div><div><span>IVA</span><b>${eur(num(r.imposta))}</b></div><div class="t"><span>Totale fattura</span><b>${eur(num(r.totale))}</b></div></div>
      <div class="fa-chk ${l.ok ? 'ok' : l.rows.length ? 'ko' : ''}"><b>${l.ok ? 'Coincide con gli acquisti registrati' : l.rows.length ? 'Non coincide con gli acquisti registrati' : 'Nessun acquisto collegato'}</b><span>${l.rows.length ? `${l.rows.length} righe in Attrezzatura (collegate per ${l.how}) per ${eur(l.tot)} · differenza ${eur(l.diff)}` : 'Nessuna riga di Attrezzatura con lo stesso DDT o gli stessi codici.'}</span></div>
      ${R.length ? `<div class="fa-rows"><div class="fa-rh"><span>Articolo</span><span>Q.tà</span><span>Prezzo</span><span>Totale</span></div>${R.map(x => { const p = pdm.get(String(x.codice || '').trim().toUpperCase()); return `<div class="fa-rr${p ? ' warn' : ''}"><span><b>${esc(x.descrizione || '')}</b><small>${esc(x.codice || '')}${p ? ` · in archivio ${eurP(p.rif)} (${p.d > 0 ? '+' : ''}${fmtNum(p.d * 100, 0)}%)` : ''}</small></span><span>${qtyFmt(num(x.quantita))}</span><span>${eurP(num(x.prezzo))}</span><span>${eur(num(x.totale) || num(x.quantita) * num(x.prezzo))}</span></div>`; }).join('')}</div>` : ''}
      <div class="row-btns" style="margin-top:14px">${r.pdf ? '<button type="button" class="btn sm" id="fa-open">Apri documento</button>' : ''}<button type="button" class="btn sm" id="fa-pay">${faPaid(r) ? 'Segna da pagare' : 'Segna pagata oggi'}</button><button type="button" class="btn sm" id="fa-edit">Modifica</button>${R.length && !l.rows.length ? '<button type="button" class="btn sm" id="fa-tomov">Aggiungi le righe ad Attrezzatura</button>' : ''}</div>`,
      null, () => { if (!confirm('Eliminare questa fattura? (il documento resta nel tuo Drive)')) return; write([{ action: 'delete', sheet: 'Fatture', id: r.id }]); toast('Fattura eliminata'); return true; }, 'Chiudi');
    $('#sheet-ok').type = 'button'; $('#sheet-ok').onclick = closeSheet;
    const o = $('#fa-open'); if (o) o.onclick = () => openDoc(r.pdf, `${r.fornitore} ${r.numero}`);
    $('#fa-pay').onclick = () => { write([{ action: 'upsert', sheet: 'Fatture', row: { ...r, stato: faPaid(r) ? 'da pagare' : 'pagata', pagata: faPaid(r) ? '' : today() } }]); closeSheet(); toast(faPaid(r) ? 'Segnata da pagare' : 'Segnata come pagata'); };
    $('#fa-edit').onclick = () => { closeSheet(); setTimeout(() => formFat(r), 250); };
    const tm = $('#fa-tomov'); if (tm) tm.onclick = () => { closeSheet(); setTimeout(() => openScan({ fornitore: r.fornitore, data: r.data, ndoc: r.numero }, R.filter(x => x.descrizione).map(x => ({ ...x, quantita: num(x.quantita) || 1, prezzo: num(x.prezzo) }))), 250); };
  }
  function formFat(r, file) {
    if (!faOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.4)');
    const isNew = !r || !faRows().some(x => x.id === r.id);
    r = { id: 'fa' + uid(), fornitore: '', numero: '', data: today(), scadenza: '', imponibile: '', imposta: '', totale: '', centro: '', categoria: '', stato: 'da pagare', pagata: '', ddt: '', righe: '', pdf: '', note: '', ...(r || {}) };
    const R = faRighe(r), forn = [...new Set(faRows().map(x => String(x.fornitore || '').trim()).filter(Boolean))];
    openSheet(isNew ? (R.length ? 'Fattura letta dall\'IA' : 'Nuova fattura') : 'Modifica fattura', `
      ${R.length && isNew ? `<div class="ai-note">${IC.spark}Dati letti dal documento: controlla prima di salvare (${R.length} righe)</div>` : ''}
      <div class="f-row"><label class="f"><span>Fornitore</span><input name="fornitore" required list="fa-dl" value="${esc(r.fornitore)}" data-focus placeholder="Es. Lyreco"></label><label class="f"><span>Numero fattura</span><input name="numero" required value="${esc(r.numero)}"></label></div>
      <datalist id="fa-dl">${forn.map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <div class="f-row"><label class="f"><span>Data</span><input name="data" type="date" required value="${esc(validD(r.data) ? r.data : today())}"></label><label class="f"><span>Scadenza</span><input name="scadenza" type="date" value="${esc(validD(r.scadenza) ? r.scadenza : '')}"></label></div>
      <div class="f-row fa-3"><label class="f"><span>Imponibile €</span><input name="imponibile" inputmode="decimal" value="${esc(fmtIn(r.imponibile))}"></label><label class="f"><span>IVA €</span><input name="imposta" inputmode="decimal" value="${esc(fmtIn(r.imposta))}"></label><label class="f"><span>Totale €</span><input name="totale" inputmode="decimal" value="${esc(fmtIn(r.totale))}" placeholder="calcolato"></label></div>
      <div class="f-row"><label class="f"><span>Centro di costo</span><select name="centro"><option value="">—</option>${opt(centri(), r.centro)}</select></label><label class="f"><span>Stato</span><select name="stato">${opt(['da pagare', 'pagata'], faPaid(r) ? 'pagata' : 'da pagare')}</select></label></div>
      <label class="f"><span>DDT / ordini collegati</span><input name="ddt" value="${esc(r.ddt)}" placeholder="numeri separati da virgola"></label>
      <label class="f"><span>Note</span><input name="note" value="${esc(r.note)}"></label>
      ${file || r.pdf ? `<div class="muted small">${IC.spark ? '' : ''}📎 ${file ? esc(file.name) + ' sarà salvato nel tuo Google Drive' : 'Documento già salvato nel tuo Google Drive'}</div>` : ''}`,
      async fd => {
        const row = { ...r, ...Object.fromEntries(fd), imponibile: num(fd.get('imponibile')), imposta: num(fd.get('imposta')), totale: num(fd.get('totale')) || r2(num(fd.get('imponibile')) + num(fd.get('imposta'))), fornitore: String(fd.get('fornitore')).trim(), numero: String(fd.get('numero')).trim() };
        if (row.stato === 'pagata' && !row.pagata) row.pagata = today();
        if (row.stato !== 'pagata') row.pagata = '';
        if (isNew) row.creato = new Date().toISOString();
        if (isNew && faRows().some(x => fornKey(x.fornitore) === fornKey(row.fornitore) && normDoc(x.numero) === normDoc(row.numero)) && !confirm('Esiste già una fattura con questo fornitore e numero. Salvarla comunque?')) return;
        if (file && !isLocal()) { try { busy('Salvo il documento nel tuo Drive…'); row.pdf = await api('uploadDoc', { name: `${row.fornitore} ${row.numero} ${row.data}.${file.ext}`, mime: file.mime, data: file.data }); } catch (e) { busy(); return toast('Documento non salvato: ' + e.message); } busy(); }
        write([{ action: 'upsert', sheet: 'Fatture', row }]);
        faP = ''; toast(isNew ? 'Fattura salvata' : 'Fattura aggiornata'); return true;
      }, isNew ? null : () => { if (!confirm('Eliminare questa fattura?')) return; write([{ action: 'delete', sheet: 'Fatture', id: r.id }]); toast('Fattura eliminata'); return true; });
  }
  function pickDoc() {
    return new Promise((resolve, reject) => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/pdf,.pdf,image/*';
      inp.onchange = async () => {
        const f = inp.files && inp.files[0]; if (!f) return reject(new Error('annullato'));
        if (f.size > 15 * 1024 * 1024) return reject(new Error('File troppo grande (massimo 15 MB)'));
        if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) {
          const u8 = new Uint8Array(await f.arrayBuffer()); let bin = ''; for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
          return resolve({ name: f.name, mime: 'application/pdf', ext: 'pdf', data: btoa(bin) });
        }
        const img = new Image();
        img.onload = () => { const k = Math.min(1, 2200 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src); resolve({ name: f.name, mime: 'image/jpeg', ext: 'jpg', data: c.toDataURL('image/jpeg', .88).split(',')[1] }); };
        img.onerror = () => reject(new Error('File non leggibile')); img.src = URL.createObjectURL(f);
      };
      inp.click();
    });
  }
  async function readFatAI() {
    if (!faOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.4)');
    let file; try { file = await pickDoc(); } catch (e) { if (e.message !== 'annullato') toast(e.message); return; }
    try {
      busy('L\'IA sta leggendo la fattura…');
      const x = await aiCall('fattura', { data: file.data, mime: file.mime });
      busy();
      const righe = (x.righe || []).filter(y => y && y.descrizione).map(y => ({ codice: String(y.codice || ''), descrizione: String(y.descrizione || ''), quantita: num(y.quantita) || 1, prezzo: num(y.prezzo), totale: num(y.totale) }));
      formFat({ fornitore: x.fornitore || '', numero: String(x.numero || ''), data: validD(x.data) ? x.data : today(), scadenza: validD(x.scadenza) ? x.scadenza : '', imponibile: num(x.imponibile), imposta: num(x.imposta), totale: num(x.totale), ddt: (x.ddt || []).join(', '), righe: righe.length ? JSON.stringify(righe) : '' }, file);
    } catch (e) { busy(); toast(e.message); }
  }
  async function openDoc(id, name) {
    try {
      busy('Apro il documento…');
      const d = await api('getDoc', { id });
      const bin = atob(d.data), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const href = URL.createObjectURL(new Blob([u8], { type: d.mime || 'application/pdf' }));
      const a = document.createElement('a'); a.href = href; a.download = d.name || name || 'documento'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 60000);
    } catch (e) { if (!(e instanceof AuthError)) toast(e.message); } finally { busy(); }
  }
  async function importFat() {
    if (!faOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.4)');
    let file; try { file = await pickFile('.xlsx,.xls,.csv'); } catch { return; }
    try {
      busy('Leggo il file…'); await loadXlsx();
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true }); busy();
      const out = [];
      wb.SheetNames.forEach(n => {
        const aoa = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' });
        const hi = aoa.findIndex(r => r.some(c => /^fornitore/.test(nh(c))) && r.some(c => /^numero|^nfattura/.test(nh(c))));
        if (hi < 0) return;
        const H = aoa[hi].map(nh), col = (...ks) => { for (const k of ks) { const i = H.findIndex(h => h === k || h.startsWith(k)); if (i >= 0) return i; } return -1; };
        const c = { f: col('fornitore'), n: col('numero', 'nfattura'), d: col('data', 'datafattura'), s: col('scadenza'), i: col('imponibile'), v: col('iva', 'imposta'), t: col('totale'), cc: col('centro'), st: col('stato'), ddt: col('ddt'), no: col('note') };
        const dt = v => v instanceof Date ? ymd(new Date(v.getTime() + 12 * 36e5)) : typeof v === 'number' && v > 20000 ? ymd(new Date(Math.round((v - 25569) * 864e5))) : (() => { const m = String(v || '').match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); return m ? `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad(m[2])}-${pad(m[1])}` : validD(v) ? String(v).slice(0, 10) : ''; })();
        aoa.slice(hi + 1).forEach(r => {
          const fo = String(r[c.f] ?? '').trim(), nu = String(r[c.n] ?? '').trim(); if (!fo || !nu || /^esempio/i.test(String(r[c.no] ?? ''))) return;
          const imp = num(r[c.i]), iv = c.v >= 0 ? num(r[c.v]) : 0, to = c.t >= 0 && r[c.t] !== '' ? num(r[c.t]) : r2(imp + iv);
          const ex = faRows().find(x => fornKey(x.fornitore) === fornKey(fo) && normDoc(x.numero) === normDoc(nu));
          out.push({ ...(ex || {}), id: ex ? ex.id : 'fa' + uid() + out.length, fornitore: fo, numero: nu, data: dt(r[c.d]) || today(), scadenza: c.s >= 0 ? dt(r[c.s]) : '', imponibile: imp, imposta: iv, totale: to, centro: c.cc >= 0 ? String(r[c.cc] ?? '').trim() : (ex ? ex.centro : ''), stato: c.st >= 0 && /pagat/i.test(String(r[c.st])) ? 'pagata' : (ex ? ex.stato : 'da pagare'), ddt: c.ddt >= 0 ? String(r[c.ddt] ?? '').trim() : (ex ? ex.ddt : ''), note: c.no >= 0 ? String(r[c.no] ?? '').trim() : (ex ? ex.note : ''), creato: ex ? ex.creato : new Date().toISOString() });
        });
      });
      if (!out.length) return toast('Nessuna fattura trovata: servono le colonne Fornitore e Numero');
      const upd = out.filter(x => faRows().some(y => y.id === x.id)).length;
      if (!confirm(`${out.length} fatture · ${eur(out.reduce((a, r) => a + num(r.totale), 0))}.${upd ? `\n${upd} già presenti verranno aggiornate.` : ''}\nImportare?`)) return;
      write(out.map(row => ({ action: 'upsert', sheet: 'Fatture', row }))); faP = ''; faAnim = true; render(); toast(`${out.length} fatture importate`);
    } catch (e) { busy(); toast(e.message); }
  }
  async function exportFat() {
    const rows = (faP ? faRows().filter(r => String(r.data).slice(0, 7) === faP) : faRows()).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)));
    if (!rows.length) return toast('Nessuna fattura');
    try {
      busy('Preparo il file Excel…'); await loadXlsx();
      const U = XLSX.utils, wb = U.book_new(), E = '#,##0.00 "€"';
      const ws = U.aoa_to_sheet([['Fornitore', 'Numero', 'Data', 'Scadenza', 'Imponibile', 'IVA', 'Totale', 'Stato', 'Pagata il', 'Centro di costo', 'DDT', 'Acquisti collegati', 'Differenza', 'Note'], ...rows.map(r => { const l = faLink(r); return [r.fornitore, r.numero, validD(r.data) ? parseD(r.data) : '', validD(r.scadenza) ? parseD(r.scadenza) : '', num(r.imponibile), num(r.imposta), num(r.totale), faPaid(r) ? 'Pagata' : faLate(r) ? 'Scaduta' : 'Da pagare', validD(r.pagata) ? parseD(r.pagata) : '', r.centro || '', r.ddt || '', l.rows.length ? l.tot : '', l.rows.length ? l.diff : '', r.note || '']; })], { cellDates: true });
      rows.forEach((r, i) => { const R = i + 2; ['C', 'D', 'I'].forEach(c => { if (ws[c + R] && ws[c + R].t === 'd') ws[c + R].z = 'dd/mm/yyyy'; }); ['E', 'F', 'G', 'L', 'M'].forEach(c => { if (ws[c + R] && ws[c + R].t === 'n') ws[c + R].z = E; }); });
      ws['!cols'] = [24, 14, 11, 11, 13, 11, 13, 11, 11, 16, 18, 15, 12, 28].map(w => ({ wch: w })); ws['!autofilter'] = { ref: `A1:N${rows.length + 1}` };
      U.book_append_sheet(wb, ws, 'Fatture');
      const rr = rows.flatMap(r => faRighe(r).map(x => [r.fornitore, r.numero, x.codice || '', x.descrizione || '', num(x.quantita), num(x.prezzo), num(x.totale) || r2(num(x.quantita) * num(x.prezzo))]));
      if (rr.length) { const w2 = U.aoa_to_sheet([['Fornitore', 'Numero', 'Codice', 'Descrizione', 'Quantità', 'Prezzo', 'Totale'], ...rr]); w2['!cols'] = [22, 14, 14, 50, 9, 11, 12].map(w => ({ wch: w })); U.book_append_sheet(wb, w2, 'Righe'); }
      XLSX.writeFile(wb, `fatture-${faP || 'complete'}.xlsx`); busy(); toast('Excel scaricato');
    } catch (e) { busy(); toast(e.message); }
  }
  function faArt() {
    return `<svg viewBox="300 0 340 260" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" class="gh-svg fa-svg">
      <defs><pattern id="fadots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" opacity=".12"/></pattern></defs>
      <rect x="300" width="340" height="260" fill="url(#fadots)"/>
      <g class="fa-p p3"><rect x="452" y="44" width="124" height="160" rx="12"/></g>
      <g class="fa-p p2"><rect x="438" y="56" width="124" height="160" rx="12"/></g>
      <g class="fa-p p1"><rect x="424" y="68" width="124" height="160" rx="12"/>
        ${[96, 112, 128, 150, 166, 182].map((y, i) => `<line x1="442" x2="${i % 3 === 2 ? 498 : 528}" y1="${y}" y2="${y}" class="fa-l" style="--d:${600 + i * 120}ms" pathLength="1"/>`).join('')}
        <line x1="442" x2="528" y1="204" y2="204" class="fa-l fa-tot" style="--d:1400ms" pathLength="1"/></g>
      <g class="fa-ok" transform="translate(548 196)"><circle r="24"/><path d="M-10 0 l7 7 l13 -14" pathLength="1"/></g>
    </svg>`;
  }

  /* =========================================================
     TORENTAL · LISTINO KIT ADESIVI PER I MEZZI
     prezzi dei kit (pellicole + preparazione) e dei servizi
     ========================================================= */
  const TR_DEF = {
    ricarico: 2, transferta: 120,
    nota: 'I prezzi si intendono al netto dell\'IVA e sono esclusi dalla fornitura i paraschizzi e i porta targa',
    mat: [{ cod: '10215', n: 'Arancione', c: 6.7 }, { cod: '10216', n: 'Grigio', c: 6.7 }, { cod: '6377', n: 'APP', c: 0.95, tape: true }],
    kit: [
      { cod: '15572', n: 'Kit Torental Frigo 3800', q: { 10215: 3.6, 10216: 6.1, 6377: 11 }, prep: 60, app: 100, rim: 200 },
      { cod: '15573', n: 'Kit Torental Cassone standard', q: { 10215: 4.6, 10216: 6.8, 6377: 12 }, prep: 60, app: 100, rim: 200 },
      { cod: '15757', n: 'Kit Torental Sponda', q: { 10215: 4, 10216: 6, 6377: 11 }, prep: 60, app: 100, rim: 200 },
      { cod: '15835', n: 'Kit Motrice', q: { 10215: 6.4, 10216: 8.2, 6377: 15.5 }, prep: 60, app: 100, rim: 200 },
      { cod: '', n: 'Kit Motrice - Trattore', q: { 10215: 2.2, 10216: 3.2, 6377: 5.9 }, prep: 25, app: 45, rim: 90, fx: { mat: 41.44, prezzo: 82.88, fattura: 107.88 } },
      { cod: '', n: 'Kit Cliente', q: { 10215: 0.9, 10216: 1.3, 6377: 2 }, prep: 20, app: 31, rim: 62, fx: { mat: 16, prezzo: 32, fattura: 52 } },
      { cod: '15835', n: 'Kit Rimorchio e semirimorchio', q: { 10215: 6.4, 10216: 8.2, 6377: 15.5 }, prep: 60, app: 100, rim: 200 }
    ],
    sing: [{ cod: 'TOR.PAR', n: 'Torental parabrezza', p: 3.88 }, { cod: 'TOR.SPE', n: 'Torental sotto specchi', p: 1.75 }, { cod: 'TOR.LAT', n: 'Torental laterale mezzo pesante', p: 3.88 }, { cod: 'AD.TERZI', n: 'Adesivo conto terzi', p: 1.1 }]
  };
  const TR_COLS = { mat: 'var(--tk-mat)', ric: 'var(--tk-ric)', prep: 'var(--tk-prep)', app: 'var(--tk-app)' };
  let trAnim = true, trQ = LS.get('cdc_trq', null);
  const trData = () => { const c = cfg('trKit'); return c && typeof c === 'object' && !Array.isArray(c) && Array.isArray(c.kit) && c.kit.length ? c : TR_DEF; };
  const trV = v => (Number(v) || 0) * (ivaOn ? 1.22 : 1);
  const trE = v => eur(trV(v)), trE0 = v => eur0(trV(v));
  const trShort = n => String(n || '').replace(/^\s*kit\s+(torental\s+)?/i, '').replace(/^./, c => c.toUpperCase()) || String(n || '');
  const trNice = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().split(' ').map((w, i) => i && /^(e|di|a|da|con|per|il|la)$/.test(w) ? w : w.length <= 3 && /^[a-z]+$/.test(w) && i ? w : w.replace(/^./, c => c.toUpperCase())).join(' ');
  const trFmtQ = v => { v = Math.round((Number(v) || 0) * 100) / 100; return fmtNum(v, Number.isInteger(v) ? 0 : Math.abs(v * 10 - Math.round(v * 10)) < 1e-6 ? 1 : 2); };
  function trCalc(k, D) {
    D = D || trData();
    const comp = D.mat.map(m => { const q = num((k.q || {})[m.cod]); return { ...m, q, cost: q * num(m.c), prezzo: q * num(m.c) * num(D.ricarico) }; }).filter(x => x.q);
    const cMat = comp.reduce((a, x) => a + x.cost, 0), cPrezzo = cMat * num(D.ricarico);
    const calc = { mat: r2(cMat), prezzo: r2(cPrezzo), fattura: r2(r2(cPrezzo) + num(k.prep)) };
    const fx = k.fx || {};
    const mat = fx.mat != null && fx.mat !== '' ? num(fx.mat) : calc.mat, prezzo = fx.prezzo != null && fx.prezzo !== '' ? num(fx.prezzo) : calc.prezzo;
    const fattura = fx.fattura != null && fx.fattura !== '' ? num(fx.fattura) : r2(prezzo + num(k.prep));
    const film = comp.filter(x => !x.tape).reduce((a, x) => a + x.q, 0), tape = comp.filter(x => x.tape).reduce((a, x) => a + x.q, 0);
    const hand = Math.abs(fattura - calc.fattura) > .009 || Math.abs(prezzo - calc.prezzo) > .009;
    return { comp, calc, mat, prezzo, ric: r2(prezzo - mat), prep: num(k.prep), fattura, app: num(k.app), rim: num(k.rim), full: r2(fattura + num(k.app)), film, tape, hand };
  }
  function trChecks(D) {
    const A = [], K = D.kit.map((k, i) => ({ k, i, c: trCalc(k, D) }));
    K.filter(x => x.c.hand).forEach(x => A.push({ t: 'info', h: `${esc(trShort(x.k.n))}: prezzo scritto a mano`, d: `Nel listino il totale fattura è ${eur(x.c.fattura)} ma con le formule (m² × €/m² × ${fmtNum(num(D.ricarico), 2).replace(/,00$/, '')} + preparazione) sarebbe ${eur(x.c.calc.fattura)}. Il costo materiale scritto è ${eur(x.c.mat)} invece di ${eur(x.c.calc.mat)}.`, v: (x.c.fattura - x.c.calc.fattura > 0 ? '+' : '') + eur(x.c.fattura - x.c.calc.fattura), fix: x.i }));
    [...groupBy(K.filter(x => x.k.cod), x => String(x.k.cod))].filter(([, v]) => v.length > 1).forEach(([cod, v]) => {
      const same = v.every(x => JSON.stringify(x.k.q) === JSON.stringify(v[0].k.q));
      A.push({ t: 'warn', h: `Codice ${esc(cod)} usato per ${v.length} kit`, d: `${v.map(x => esc(trShort(x.k.n))).join(' e ')} hanno lo stesso codice${same ? ' e le stesse quantità' : ' ma quantità diverse'}: in fattura non si distinguono.`, v: v.length + ' kit' });
    });
    const nc = K.filter(x => !String(x.k.cod || '').trim()); if (nc.length) A.push({ t: 'info', h: 'Kit senza codice', d: `${nc.map(x => esc(trShort(x.k.n))).join(', ')} non hanno un codice articolo.`, v: nc.length + ' kit' });
    const np = K.filter(x => !x.c.fattura); if (np.length) A.push({ t: 'warn', h: 'Kit senza prezzo', d: `${np.map(x => esc(trShort(x.k.n))).join(', ')}: mancano quantità o costi dei materiali.`, v: np.length + ' kit' });
    const ns = K.filter(x => !x.c.app); if (ns.length) A.push({ t: 'info', h: 'Applicazione senza prezzo', d: `${ns.map(x => esc(trShort(x.k.n))).join(', ')}.`, v: ns.length + ' kit' });
    return A;
  }

  /* ---------- pagina ---------- */
  function renderTor() {
    const D = trData(), K = D.kit.map((k, i) => ({ k, i, c: trCalc(k, D) }));
    sub(`${ivaLbl()} · listino kit adesivi e servizi per i mezzi Torental`);
    const anim = trAnim && !reduced(); trAnim = false;
    const body = $('#tr-body'); body.classList.toggle('cc-anim', anim);
    const F = K.map(x => x.c.fattura).filter(Boolean), lo = Math.min(...F), hi = Math.max(...F);
    const cheap = K.find(x => x.c.fattura === lo), dear = K.find(x => x.c.fattura === hi);
    const avgFull = K.reduce((a, x) => a + x.c.full, 0) / (K.length || 1);
    const film = D.mat.filter(m => !m.tape), filmC = film.length ? film.reduce((a, m) => a + num(m.c), 0) / film.length : 0;
    const A = trChecks(D), I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    const ricPct = (num(D.ricarico) - 1) * 100;
    const KP = [
      ['Kit a listino', K.length, v => fmtNum(Math.round(v), 0), `${D.sing.length} articoli singoli`],
      ['Kit più economico', trV(lo), eur, trShort(cheap ? cheap.k.n : '')],
      ['Kit più caro', trV(hi), eur, trShort(dear ? dear.k.n : '')],
      ['Intervento medio', trV(avgFull), eur, 'kit + applicazione'],
      ['Ricarico materiali', ricPct, v => '+' + fmtNum(v, 0) + '%', `prezzo = costo × ${fmtNum(num(D.ricarico), 2).replace(/,00$/, '')}`],
      ['Transferta', trV(D.transferta), eur0, '1 giorno · 100 km']
    ];
    body.innerHTML = `
      <div class="gl-hero tr-hero">
        <div class="gh-top"><div class="gh-art">${trArt()}</div>
        <div class="gh-main"><span class="gh-lbl">Listino kit Torental · totale fattura per mezzo</span><div class="gh-big">${eur0(trV(lo))} – ${eur0(trV(hi))}</div>
          <div class="gh-sub"><span>${K.length} kit</span><span>pellicola ${eur(filmC)}/m² fornitore</span><span>${ivaOn ? 'IVA inclusa' : 'IVA esclusa'}</span></div></div></div>
        <div class="gh-kpis">${KP.map(([l, , , s], i) => `<div class="gh-k"><span>${l}</span><b data-trk="${i}">0</b><small>${esc(s)}</small></div>`).join('')}</div>
      </div>
      ${D.nota ? `<div class="tr-nota"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><span>${esc(D.nota)}</span></div>` : ''}
      <div class="tk-grid">${K.map((x, j) => { const c = x.c, T = c.mat + c.ric + c.prep || 1; return `<button type="button" class="card tk" data-trkit="${x.i}" style="--d:${120 + j * 60}ms">
        <span class="tk-h"><span class="tk-cod">${x.k.cod ? esc(x.k.cod) : 'senza codice'}</span>${c.hand ? '<span class="tk-flag" title="Prezzo scritto a mano nel listino">manuale</span>' : ''}</span>
        <b class="tk-n">${esc(trShort(x.k.n))}</b>
        <span class="tk-p">${esc(trE(c.fattura))}<small>totale fattura kit</small></span>
        <span class="tk-bar"><i style="flex:${c.mat};background:${TR_COLS.mat}"></i><i style="flex:${Math.max(0, c.ric)};background:${TR_COLS.ric}"></i><i style="flex:${c.prep};background:${TR_COLS.prep}"></i></span>
        <span class="tk-l"><span><i style="background:${TR_COLS.mat}"></i>Materiale ${esc(trE0(c.mat))}</span><span><i style="background:${TR_COLS.ric}"></i>Ricarico ${esc(trE0(c.ric))}</span><span><i style="background:${TR_COLS.prep}"></i>Prep. ${esc(trE0(c.prep))}</span></span>
        <span class="tk-s"><span><small>Applicazione</small><b>${esc(trE0(c.app))}</b></span><span><small>Rimozione</small><b>${esc(trE0(c.rim))}</b></span><span><small>Pellicola</small><b>${trFmtQ(c.film)} m²</b></span></span>
      </button>`; }).join('')}<button type="button" class="tk tk-add" data-trnewkit style="--d:${120 + K.length * 60}ms"><span class="tk-plus">+</span><b>Nuovo kit</b><small>aggiungi un tipo di mezzo</small></button></div>
      <div class="card" id="tr-anom"><div class="card-h"><h3>Controlli sul listino</h3><span class="muted small">${A.length ? A.length + ' punti da verificare' : 'tutto coerente'}</span></div>${A.length ? `<div class="gl-an">${A.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms"><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span>${x.fix != null ? `<button type="button" class="tr-fixb" data-trfix="${x.fix}">Usa il prezzo calcolato</button>` : ''}</div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Quantità, prezzi e codici sono coerenti</div>'}</div>
      <div class="card"><div class="card-h"><h3>Confronto: intervento completo per mezzo</h3><span class="muted small">kit + applicazione · ${ivaLbl()}</span></div>
        <div class="tr-leg">${[['mat', 'Costo materiale'], ['ric', 'Ricarico'], ['prep', 'Preparazione kit'], ['app', 'Applicazione']].map(([k, l]) => `<span><i style="background:${TR_COLS[k]}"></i>${l}</span>`).join('')}</div>
        <div class="tr-cmp" id="tr-cmp"></div></div>
      <div class="tr-2">
        <div class="card tr-calc" id="tr-calc"></div>
        <div class="card"><div class="card-h"><h3>Articoli singoli</h3><span class="muted small">${ivaLbl()} · tocca per modificare</span><button type="button" class="btn sm" data-trsing="-1">+ Articolo</button></div>
          <div class="tr-sing">${D.sing.map((s, i) => `<div class="tr-si" data-trsing="${i}" style="--d:${200 + i * 50}ms"><span class="tr-sc">${esc(s.cod || '—')}</span><span class="tr-sn">${esc(trNice(s.n))}</span><b>${esc(trE(s.p))}</b></div>`).join('') || '<div class="empty">Nessun articolo singolo</div>'}</div>
          <div class="cf-sub" style="margin:18px 0 8px">Materiali</div>
          <div class="tr-sing">${D.mat.map(m => `<div class="tr-si" data-trmat><span class="tr-sc">${esc(m.cod)}</span><span class="tr-sn">${esc(m.n)}${m.tape ? ' <em>application tape</em>' : ' <em>pellicola</em>'}</span><span class="tr-mp"><b>${esc(eur(num(m.c)))}/m²</b><small>al cliente ${esc(trE(num(m.c) * num(D.ricarico)))}/m²</small></span></div>`).join('')}</div></div>
      </div>
      <div class="card"><div class="card-h"><h3>Composizione dei kit</h3><span class="muted small">m² di materiale e prezzi · ${ivaLbl()}</span></div><div class="mx-wrap" id="tr-tab"></div></div>`;
    $$('[data-trk]', body).forEach(el => { const i = +el.dataset.trk; el._v = 0; countTo(el, KP[i][1], KP[i][2]); });
    // confronto
    const mx = Math.max(1, ...K.map(x => x.c.full)), S = K.slice().sort((a, b) => b.c.full - a.c.full);
    $('#tr-cmp').innerHTML = S.map((x, j) => { const c = x.c; return `<div class="tr-cr" data-trkit="${x.i}" style="--d:${200 + j * 60}ms"><span class="tr-cn"><b>${esc(trShort(x.k.n))}</b><small>${x.k.cod ? esc(x.k.cod) : 'senza codice'}</small></span><span class="tr-ct"><span class="tr-cb" style="width:${(c.full / mx * 100).toFixed(2)}%">${[['mat', c.mat], ['ric', c.ric], ['prep', c.prep], ['app', c.app]].map(([k, v]) => v > 0 ? `<i style="flex:${v};background:${TR_COLS[k]}" title="${esc(trE(v))}"></i>` : '').join('')}</span></span><b class="tr-cv">${esc(trE0(c.full))}</b></div>`; }).join('');
    // tabella
    $('#tr-tab').innerHTML = `<table class="mx tr-tabl"><thead><tr><th>Kit</th><th class="l">Codice</th>${D.mat.map(m => `<th>${esc(m.n)}<small>m²</small></th>`).join('')}<th>Costo materiale</th><th>Prezzo materiale</th><th>Preparazione</th><th>Totale fattura</th><th>Applicazione</th><th>Rimozione</th><th>Guadagno sul materiale</th></tr></thead><tbody>
      ${K.map(x => { const c = x.c; return `<tr data-trkit="${x.i}"><td>${esc(trShort(x.k.n))}${c.hand ? ' <span class="tk-flag">manuale</span>' : ''}</td><td class="l m2">${esc(x.k.cod || '—')}</td>${D.mat.map(m => `<td>${num(x.k.q[m.cod]) ? trFmtQ(num(x.k.q[m.cod])) : '—'}</td>`).join('')}<td>${esc(trE(c.mat))}</td><td>${esc(trE(c.prezzo))}</td><td>${esc(trE(c.prep))}</td><td><b>${esc(trE(c.fattura))}</b></td><td>${esc(trE(c.app))}</td><td>${esc(trE(c.rim))}</td><td class="tr-gain">${esc(trE(c.ric))}<small>${c.fattura ? fmtNum(c.ric / c.fattura * 100, 0) : 0}% del kit</small></td></tr>`; }).join('')}</tbody></table>`;
    renderTrCalc();
  }

  /* ---------- preventivo rapido ---------- */
  function trQState() {
    const D = trData();
    const q = trQ && typeof trQ === 'object' ? trQ : {};
    return { kit: Math.min(Math.max(0, +q.kit || 0), D.kit.length - 1), n: Math.max(1, +q.n || 1), app: q.app !== false, rim: !!q.rim, gg: Math.max(0, +q.gg || 0), sing: q.sing && typeof q.sing === 'object' ? q.sing : {} };
  }
  function trQuote() {
    const D = trData(), Q = trQState(), k = D.kit[Q.kit], c = trCalc(k, D), L = [];
    L.push({ t: `${trShort(k.n)} · kit${k.cod ? ' ' + k.cod : ''}`, q: Q.n, p: c.fattura });
    if (Q.app && c.app) L.push({ t: 'Applicazione', q: Q.n, p: c.app });
    if (Q.rim && c.rim) L.push({ t: 'Rimozione kit esistente', q: Q.n, p: c.rim });
    if (Q.gg) L.push({ t: 'Transferta (1 giorno, 100 km)', q: Q.gg, p: num(D.transferta) });
    D.sing.forEach(s => { const n = num(Q.sing[s.cod || s.n]); if (n > 0) L.push({ t: trNice(s.n), q: n, p: num(s.p) }); });
    const imp = r2(L.reduce((a, x) => a + x.q * x.p, 0));
    return { D, Q, L, imp, iva: r2(imp * .22), tot: r2(imp * 1.22) };
  }
  function renderTrCalc() {
    const el = $('#tr-calc'); if (!el) return;
    const { D, Q, L, imp, iva, tot } = trQuote();
    el.innerHTML = `<div class="card-h"><h3>Preventivo rapido</h3><span class="muted small">calcola il prezzo per uno o più mezzi</span></div>
      <div class="f-row"><label class="f"><span>Tipo di kit</span><select data-trq="kit">${D.kit.map((k, i) => `<option value="${i}"${i === Q.kit ? ' selected' : ''}>${esc(trShort(k.n))}</option>`).join('')}</select></label><label class="f"><span>Numero di mezzi</span><input data-trq="n" type="number" min="1" step="1" inputmode="numeric" value="${Q.n}"></label></div>
      <div class="tr-opts"><label class="tr-ck"><input type="checkbox" data-trq="app"${Q.app ? ' checked' : ''}><span>Applicazione</span></label><label class="tr-ck"><input type="checkbox" data-trq="rim"${Q.rim ? ' checked' : ''}><span>Rimozione kit esistente</span></label><label class="tr-gg"><span>Giorni di transferta</span><input data-trq="gg" type="number" min="0" step="1" inputmode="numeric" value="${Q.gg}"></label></div>
      ${D.sing.length ? `<details class="tr-sd"${D.sing.some(s => num(Q.sing[s.cod || s.n])) ? ' open' : ''}><summary>Aggiungi articoli singoli</summary><div class="tr-sg">${D.sing.map(s => `<label><span>${esc(trNice(s.n))}<small>${esc(eur(s.p))} cad.</small></span><input data-trqs="${esc(s.cod || s.n)}" type="number" min="0" step="1" inputmode="numeric" value="${num(Q.sing[s.cod || s.n]) || ''}" placeholder="0"></label>`).join('')}</div></details>` : ''}
      <div class="tr-ql">${L.map(x => `<div><span>${esc(x.t)}${x.q !== 1 ? ` <em>× ${fmtNum(x.q, 0)}</em>` : ''}</span><b>${esc(eur(x.q * x.p))}</b></div>`).join('')}</div>
      <div class="iva-sum"><div><span>Imponibile</span><b>${esc(eur(imp))}</b></div><div><span>IVA 22%</span><b>${esc(eur(iva))}</b></div><div class="t"><span>Totale</span><b>${esc(eur(tot))}</b></div></div>
      <div class="row-btns" style="margin-top:12px"><button type="button" class="btn sm" id="tr-copy">Copia il preventivo</button></div>`;
  }
  function trQSet(e) {
    const t = e.target, Q = trQState();
    if (t.dataset.trq) { const k = t.dataset.trq; Q[k] = t.type === 'checkbox' ? t.checked : +t.value || 0; }
    else if (t.dataset.trqs) { Q.sing = { ...Q.sing, [t.dataset.trqs]: +t.value || 0 }; }
    else return;
    trQ = Q; LS.set('cdc_trq', Q);
    const keep = t.dataset.trq || t.dataset.trqs, pos = t.selectionStart;
    renderTrCalc();
    if (e.type === 'input') { const n = $(`#tr-calc [data-trq="${keep}"], #tr-calc [data-trqs="${CSS.escape(keep)}"]`); if (n) { n.focus(); try { if (pos != null) n.setSelectionRange(pos, pos); } catch {} } }
  }
  async function trCopy() {
    const { L, imp, iva, tot } = trQuote();
    const txt = ['Preventivo kit Torental', ...L.map(x => `- ${x.t}${x.q !== 1 ? ' × ' + fmtNum(x.q, 0) : ''}: ${eur(x.q * x.p)}`), `Imponibile: ${eur(imp)}`, `IVA 22%: ${eur(iva)}`, `Totale: ${eur(tot)}`, '', trData().nota || ''].join('\n').trim();
    try { await navigator.clipboard.writeText(txt); toast('Preventivo copiato: incollalo dove vuoi'); }
    catch { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Preventivo copiato'); } catch { toast('Copia non riuscita'); } ta.remove(); }
  }

  /* ---------- dettaglio kit ---------- */
  function trKitDetail(i) {
    const D = trData(), k = D.kit[i]; if (!k) return;
    const c = trCalc(k, D);
    openSheet(trNice(k.n), `
      <div class="kv">${[['Codice', k.cod || '—'], ['Pellicola', trFmtQ(c.film) + ' m²'], ['Application tape', trFmtQ(c.tape) + ' m²'], ['Ricarico', '× ' + fmtNum(num(D.ricarico), 2).replace(/,00$/, '')]].map(([a, b]) => `<div><span>${a}</span><strong>${esc(String(b))}</strong></div>`).join('')}</div>
      <div class="fa-rows tr-dr"><div class="fa-rh"><span>Componente</span><span>m²</span><span>€/m²</span><span>Costo</span><span>Prezzo</span></div>
        ${c.comp.map(x => `<div class="fa-rr"><span><b>${esc(x.n)}</b><small>${esc(x.cod)}</small></span><span>${trFmtQ(x.q)}</span><span>${esc(eurP(num(x.c)))}</span><span>${esc(eur(x.cost))}</span><span>${esc(eur(x.prezzo))}</span></div>`).join('')}
        <div class="fa-rr tr-dt"><span><b>Totale materiale</b></span><span></span><span></span><span>${esc(eur(c.mat))}</span><span>${esc(eur(c.prezzo))}</span></div></div>
      ${c.hand ? `<div class="fa-chk ko"><b>Prezzo scritto a mano nel listino</b><span>Con le formule il totale sarebbe ${esc(eur(c.calc.fattura))} (materiale ${esc(eur(c.calc.mat))}, prezzo ${esc(eur(c.calc.prezzo))}).</span></div>` : ''}
      <div class="iva-sum" style="margin-top:14px"><div><span>Prezzo materiale</span><b>${esc(eur(c.prezzo))}</b></div><div><span>Preparazione kit</span><b>${esc(eur(c.prep))}</b></div><div class="t"><span>Totale fattura kit (IVA esclusa)</span><b>${esc(eur(c.fattura))}</b></div></div>
      <div class="iva-sum" style="margin-top:10px"><div><span>Applicazione</span><b>${esc(eur(c.app))}</b></div><div><span>Rimozione</span><b>${esc(eur(c.rim))}</b></div><div><span>Transferta 1 giorno (100 km)</span><b>${esc(eur(num(D.transferta)))}</b></div><div class="t"><span>Kit + applicazione</span><b>${esc(eur(c.full))}</b></div></div>
      <div class="row-btns" style="margin-top:14px"><button type="button" class="btn sm" id="tr-use">Usa nel preventivo</button><button type="button" class="btn sm primary" id="tr-kedit">Modifica questo kit</button><button type="button" class="btn sm" id="tr-edit">Modifica tutto il listino</button></div>`, null, null, 'Chiudi');
    $('#sheet-ok').type = 'button'; $('#sheet-ok').onclick = closeSheet;
    $('#tr-use').onclick = () => { trQ = { ...trQState(), kit: i }; LS.set('cdc_trq', trQ); closeSheet(); renderTrCalc(); setTimeout(() => $('#tr-calc').scrollIntoView({ behavior: 'smooth', block: 'center' }), 250); };
    $('#tr-edit').onclick = () => { closeSheet(); setTimeout(trForm, 250); };
    $('#tr-kedit').onclick = () => { closeSheet(); setTimeout(() => trKitForm(i), 250); };
  }

  /* ---------- modifica listino (tutto) ---------- */
  const trClone = () => JSON.parse(JSON.stringify(trData()));
  const trSave = (D, msg) => { setConfig('trKit', D); trAnim = true; toast(msg || 'Listino salvato'); };
  const trIn = (attr, v, ph, cls = '') => `<input ${attr} inputmode="decimal" value="${v === '' || v == null ? '' : esc(fmtIn(v))}" placeholder="${ph}"${cls ? ` class="${cls}"` : ''}>`;
  const trNum = v => String(v ?? '').trim() === '' ? '' : num(v);
  function trForm() {
    const M = trClone();
    M.kit.forEach(k => { k._q = M.mat.map(m => num((k.q || {})[m.cod]) || ''); k._fx = k.fx && k.fx.fattura != null ? k.fx.fattura : ''; k._fx0 = k._fx; });
    openSheet('Modifica listino Torental', `<div class="tr-sw">
      <p class="muted small" style="margin:0 0 12px">Tutti i prezzi sono IVA esclusa. Prezzo kit = m² × costo fornitore × ricarico + preparazione. Se scrivi un «Totale fisso», il kit usa quel prezzo al posto del calcolo.</p>
      <div class="f-row tr-f3"><label class="f"><span>Ricarico sul materiale (×)</span>${trIn('name="ricarico"', M.ricarico, '2')}</label><label class="f"><span>Transferta 1 giorno (100 km) €</span>${trIn('name="transferta"', M.transferta, '0')}</label><label class="f"><span>Nota del listino</span><input name="nota" value="${esc(M.nota || '')}"></label></div>
      <div class="tr-fh"><span class="cf-sub">Materiali</span><button type="button" class="btn sm" id="tr-madd">+ Materiale</button></div>
      <div id="tr-fm"></div>
      <div class="tr-fh"><span class="cf-sub">Kit · m² di materiale, servizi e prezzo</span><button type="button" class="btn sm" id="tr-kadd">+ Kit</button></div>
      <div id="tr-fk"></div>
      <div class="tr-fh"><span class="cf-sub">Articoli singoli</span><button type="button" class="btn sm" id="tr-sadd">+ Articolo</button></div>
      <div id="tr-fs"></div>
      <div class="tr-reset"><button type="button" class="link" id="tr-reset">Ripristina il listino del file originale</button></div></div>`,
      fd => {
        read();
        const mats = M.mat.map((m, j) => ({ j, cod: String(m.cod || '').trim() || String(m.n || '').trim().toUpperCase(), n: String(m.n || '').trim() || String(m.cod || '').trim(), c: num(m.c), tape: !!m.tape })).filter(m => m.cod);
        const dup = mats.find((m, i) => mats.findIndex(x => x.cod === m.cod) !== i); if (dup) return toast(`Due materiali hanno lo stesso codice ${dup.cod}`);
        if (!mats.length) return toast('Serve almeno un materiale');
        const N = { ricarico: num(fd.get('ricarico')) || 1, transferta: num(fd.get('transferta')), nota: String(fd.get('nota') || '').trim(), mat: mats.map(({ j, ...m }) => m), kit: [], sing: [] };
        M.kit.forEach(k => {
          const n = String(k.n || '').trim(); if (!n) return;
          const q = {}; mats.forEach(m => { const v = num(k._q[m.j]); if (v) q[m.cod] = v; });
          const o = { cod: String(k.cod || '').trim(), n, q, prep: num(k.prep), app: num(k.app), rim: num(k.rim) };
          if (k._fx !== '' && k._fx != null) o.fx = String(k._fx) === String(k._fx0) && k.fx ? k.fx : { fattura: num(k._fx) };
          N.kit.push(o);
        });
        if (!N.kit.length) return toast('Serve almeno un kit');
        M.sing.forEach(s => { const n = String(s.n || '').trim(); if (n) N.sing.push({ cod: String(s.cod || '').trim(), n, p: num(s.p) }); });
        trSave(N); return true;
      }, null, 'Salva listino');
    $('#sheet-form').classList.add('wide', 'xwide');
    const body = $('#sheet-body .tr-sw');
    const drawM = () => { $('#tr-fm').innerHTML = `<div class="tr-mh"><span>Codice</span><span>Nome</span><span>€/m² fornitore</span><span>Tipo</span><span></span></div>` + M.mat.map((m, j) => `<div class="tr-mr" data-j="${j}"><input data-m="cod" value="${esc(m.cod || '')}" placeholder="Codice"><input data-m="n" value="${esc(m.n || '')}" placeholder="Nome">${trIn('data-m="c"', m.c, '€/m²')}<select data-m="tape"><option value="0">Pellicola</option><option value="1"${m.tape ? ' selected' : ''}>Application tape</option></select><button type="button" class="icon-btn tr-lx" data-mdel="${j}" aria-label="Togli materiale">×</button></div>`).join(''); };
    const drawK = () => { $('#tr-fk').innerHTML = `<div class="tr-mxw"><table class="tr-mx tr-kt"><thead><tr><th class="tr-c0">Kit</th><th>Codice</th>${M.mat.map(m => `<th>${esc(m.n || m.cod || 'nuovo')} m²</th>`).join('')}<th>Prep. €</th><th>Applic. €</th><th>Rimoz. €</th><th>Totale fisso €</th><th></th></tr></thead><tbody>${M.kit.map((k, i) => `<tr data-i="${i}"><td><input data-k="n" value="${esc(k.n || '')}" placeholder="Nome kit"></td><td><input data-k="cod" value="${esc(k.cod || '')}" placeholder="—" class="tr-in-s"></td>${M.mat.map((m, j) => `<td>${trIn(`data-kq="${j}"`, k._q[j], '0', 'tr-in-n')}</td>`).join('')}<td>${trIn('data-k="prep"', k.prep, '0', 'tr-in-n')}</td><td>${trIn('data-k="app"', k.app, '0', 'tr-in-n')}</td><td>${trIn('data-k="rim"', k.rim, '0', 'tr-in-n')}</td><td>${trIn('data-k="_fx"', k._fx, 'calcolato', 'tr-in-n tr-in-fx')}</td><td><button type="button" class="icon-btn tr-lx" data-kdel="${i}" aria-label="Togli kit">×</button></td></tr>`).join('')}</tbody></table></div>`; };
    const drawS = () => { $('#tr-fs').innerHTML = M.sing.map((s, i) => `<div class="tr-pr3" data-s="${i}"><input data-sf="cod" value="${esc(s.cod || '')}" placeholder="Codice"><input data-sf="n" value="${esc(s.n || '')}" placeholder="Articolo">${trIn('data-sf="p"', s.p, '€')}<button type="button" class="icon-btn tr-lx" data-sdel="${i}" aria-label="Togli articolo">×</button></div>`).join('') || '<div class="muted small">Nessun articolo singolo</div>'; };
    function read() {
      $$('#tr-fm .tr-mr').forEach(el => { const m = M.mat[+el.dataset.j]; if (!m) return; m.cod = $('[data-m="cod"]', el).value; m.n = $('[data-m="n"]', el).value; m.c = trNum($('[data-m="c"]', el).value); m.tape = $('[data-m="tape"]', el).value === '1'; });
      $$('#tr-fk tbody tr').forEach(el => { const k = M.kit[+el.dataset.i]; if (!k) return; k.n = $('[data-k="n"]', el).value; k.cod = $('[data-k="cod"]', el).value; ['prep', 'app', 'rim', '_fx'].forEach(f => { k[f] = trNum($(`[data-k="${f}"]`, el).value); }); $$('[data-kq]', el).forEach(x => { k._q[+x.dataset.kq] = trNum(x.value); }); });
      $$('#tr-fs .tr-pr3').forEach(el => { const s = M.sing[+el.dataset.s]; if (!s) return; s.cod = $('[data-sf="cod"]', el).value; s.n = $('[data-sf="n"]', el).value; s.p = trNum($('[data-sf="p"]', el).value); });
    }
    drawM(); drawK(); drawS();
    const focusLast = sel => { const l = $$(sel, body); if (l.length) l[l.length - 1].focus(); };
    $('#tr-madd').onclick = () => { read(); M.mat.push({ cod: '', n: '', c: '', tape: false }); M.kit.forEach(k => k._q.push('')); drawM(); drawK(); focusLast('#tr-fm [data-m="cod"]'); };
    $('#tr-kadd').onclick = () => { read(); M.kit.push({ n: '', cod: '', _q: M.mat.map(() => ''), prep: '', app: '', rim: '', _fx: '', _fx0: '' }); drawK(); focusLast('#tr-fk [data-k="n"]'); const w = $('#tr-fk .tr-mxw'); if (w) w.scrollTop = w.scrollHeight; };
    $('#tr-sadd').onclick = () => { read(); M.sing.push({ cod: '', n: '', p: '' }); drawS(); focusLast('#tr-fs [data-sf="cod"]'); };
    $('#tr-reset').onclick = () => { if (!confirm('Tornare al listino del file originale? Le modifiche fatte qui andranno perse.')) return; trSave(JSON.parse(JSON.stringify(TR_DEF)), 'Listino originale ripristinato'); closeSheet(); };
    body.addEventListener('change', e => { if (e.target.dataset.m === 'n' || e.target.dataset.m === 'cod') { read(); drawK(); } });
    body.addEventListener('click', e => {
      const md = e.target.closest('[data-mdel]'); if (md) { read(); const j = +md.dataset.mdel, m = M.mat[j]; if (M.kit.some(k => num(k._q[j])) && !confirm(`Il materiale «${m.n || m.cod}» è usato nei kit: toglierlo?`)) return; M.mat.splice(j, 1); M.kit.forEach(k => k._q.splice(j, 1)); drawM(); drawK(); return; }
      const kd = e.target.closest('[data-kdel]'); if (kd) { read(); const k = M.kit[+kd.dataset.kdel]; if (k.n && !confirm(`Togliere «${k.n}» dal listino?`)) return; M.kit.splice(+kd.dataset.kdel, 1); drawK(); return; }
      const sd = e.target.closest('[data-sdel]'); if (sd) { read(); M.sing.splice(+sd.dataset.sdel, 1); drawS(); }
    });
  }
  // un solo kit (comodo sul telefono); i = -1 per un kit nuovo
  function trKitForm(i) {
    const D = trClone(), isNew = !(i >= 0 && D.kit[i]);
    const k = isNew ? { cod: '', n: '', q: {}, prep: '', app: '', rim: '' } : D.kit[i];
    const fx0 = k.fx && k.fx.fattura != null ? k.fx.fattura : '';
    openSheet(isNew ? 'Nuovo kit' : 'Modifica · ' + trShort(k.n), `<div class="tr-sw">
      <div class="f-row"><label class="f"><span>Nome del kit</span><input name="n" required value="${esc(k.n)}" placeholder="Es. Kit Torental Furgone" data-focus></label><label class="f"><span>Codice</span><input name="cod" value="${esc(k.cod || '')}" placeholder="facoltativo"></label></div>
      <div class="cf-sub" style="margin:4px 0 8px">Materiale · m² per kit</div>
      <div class="tr-mats">${D.mat.map(m => `<label class="f"><span>${esc(m.n)} <em class="muted">${esc(m.cod)} · ${esc(eur(num(m.c)))}/m²</em></span>${trIn(`name="q_${esc(m.cod)}"`, (k.q || {})[m.cod], '0')}</label>`).join('')}</div>
      <div class="f-row tr-f4"><label class="f"><span>Preparazione €</span>${trIn('name="prep"', k.prep, '0')}</label><label class="f"><span>Applicazione €</span>${trIn('name="app"', k.app, '0')}</label><label class="f"><span>Rimozione €</span>${trIn('name="rim"', k.rim, '0')}</label><label class="f"><span>Totale fisso €</span>${trIn('name="fx"', fx0, 'calcolato')}</label></div>
      <div class="iva-sum" id="tr-kprev"></div></div>`,
      fd => {
        const n = String(fd.get('n') || '').trim(); if (!n) return toast('Scrivi il nome del kit');
        const q = {}; D.mat.forEach(m => { const v = num(fd.get('q_' + m.cod)); if (v) q[m.cod] = v; });
        const o = { cod: String(fd.get('cod') || '').trim(), n, q, prep: num(fd.get('prep')), app: num(fd.get('app')), rim: num(fd.get('rim')) };
        const fx = String(fd.get('fx') || '').trim(); if (fx !== '') o.fx = String(num(fx)) === String(fx0) && k.fx ? k.fx : { fattura: num(fx) };
        if (isNew) D.kit.push(o); else D.kit[i] = o;
        trSave(D, isNew ? 'Kit aggiunto' : 'Kit aggiornato'); return true;
      }, isNew ? null : () => { if (D.kit.length < 2) return toast('Serve almeno un kit'); if (!confirm(`Togliere «${trShort(k.n)}» dal listino?`)) return; D.kit.splice(i, 1); trSave(D, 'Kit tolto'); return true; });
    const prev = () => {
      const fd = new FormData($('#sheet-form')), q = {}; D.mat.forEach(m => { const v = num(fd.get('q_' + m.cod)); if (v) q[m.cod] = v; });
      const fx = String(fd.get('fx') || '').trim(), c = trCalc({ q, prep: num(fd.get('prep')), app: num(fd.get('app')), rim: num(fd.get('rim')), fx: fx !== '' ? { fattura: num(fx) } : null }, D);
      $('#tr-kprev').innerHTML = `<div><span>Costo materiale</span><b>${esc(eur(c.mat))}</b></div><div><span>Prezzo materiale (× ${fmtNum(num(D.ricarico), 2).replace(/,00$/, '')})</span><b>${esc(eur(c.prezzo))}</b></div><div><span>Calcolato con le formule</span><b>${esc(eur(c.calc.fattura))}</b></div><div class="t"><span>Totale fattura kit</span><b>${esc(eur(c.fattura))}</b></div>`;
    };
    prev(); $('#sheet-body .tr-sw').addEventListener('input', prev);
  }
  // un solo articolo singolo; i = -1 per uno nuovo
  function trSingForm(i) {
    const D = trClone(), isNew = !(i >= 0 && D.sing[i]), s = isNew ? { cod: '', n: '', p: '' } : D.sing[i];
    openSheet(isNew ? 'Nuovo articolo singolo' : 'Modifica articolo', `
      <div class="f-row"><label class="f"><span>Codice</span><input name="cod" value="${esc(s.cod || '')}" placeholder="Es. TOR.POR" data-focus></label><label class="f"><span>Prezzo € (IVA esclusa)</span>${trIn('name="p"', s.p, '0')}</label></div>
      <label class="f"><span>Articolo</span><input name="n" required value="${esc(s.n || '')}"></label>`,
      fd => { const n = String(fd.get('n') || '').trim(); if (!n) return toast('Scrivi il nome dell\'articolo'); const o = { cod: String(fd.get('cod') || '').trim(), n, p: num(fd.get('p')) }; if (isNew) D.sing.push(o); else D.sing[i] = o; trSave(D, isNew ? 'Articolo aggiunto' : 'Articolo aggiornato'); return true; },
      isNew ? null : () => { if (!confirm(`Togliere «${s.n}»?`)) return; D.sing.splice(i, 1); trSave(D, 'Articolo tolto'); return true; });
  }
  /* ---------- PDF del listino ---------- */
  const loadLib = src => new Promise((res, rej) => { if (document.querySelector(`script[data-lib="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.dataset.lib = src; s.onload = res; s.onerror = () => rej(new Error('Libreria PDF non caricata')); document.head.appendChild(s); });
  const b64 = buf => { const u8 = new Uint8Array(buf); let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
  let pdfFonts = null;
  const loadFonts = () => pdfFonts || (pdfFonts = Promise.all(['regular', 'semibold', 'bold'].map(w => fetch(`font-inter-${w}.ttf`).then(r => { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); }).then(b => [w, b64(b)]))).catch(() => { pdfFonts = null; return null; }));
  async function loadPdf() { if (!(window.jspdf && window.jspdf.jsPDF)) await loadLib('lib-jspdf.min.js'); if (!window.jspdf.jsPDF.API.autoTable) await loadLib('lib-jspdf-autotable.min.js'); return window.jspdf.jsPDF; }
  const logoPng = () => new Promise(res => { const img = new Image(); img.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 256; c.getContext('2d').drawImage(img, 0, 0, 256, 256); res(c.toDataURL('image/png')); } catch { res(null); } }; img.onerror = () => res(null); img.src = 'logo.svg'; });
  function trPdfAsk() {
    openSheet('Esporta il listino in PDF', `<p class="muted small" style="margin:0 0 14px">Scegli che versione ti serve. Tutti i prezzi sono IVA esclusa.</p>
      <div class="tr-pdfo">
        <button type="button" class="tr-pdfb" data-trpdf="cliente"><span class="tr-pdfi"><svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg></span><b>Per il cliente</b><small>Solo i prezzi di vendita: kit, servizi, articoli singoli e composizione. Pronto da mandare a Torental.</small></button>
        <button type="button" class="tr-pdfb" data-trpdf="interno"><span class="tr-pdfi int"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span><b>Interno</b><small>Con costo fornitore, ricarico, preparazione e guadagno su ogni kit. Da non inviare al cliente.</small></button>
      </div>`, null, null, 'Chiudi');
    $('#sheet-ok').type = 'button'; $('#sheet-ok').onclick = closeSheet;
  }
  async function trPdf(mode) {
    const INT = mode === 'interno', D = trData(), K = D.kit.map(k => ({ k, c: trCalc(k, D) }));
    try {
      busy('Preparo il PDF…');
      const [jsPDF, logo, fonts] = await Promise.all([loadPdf(), logoPng(), loadFonts()]);
      const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      let FF = 'helvetica';
      if (fonts) { fonts.forEach(([w, data]) => { doc.addFileToVFS(`Inter-${w}.ttf`, data); doc.addFont(`Inter-${w}.ttf`, 'Inter', w === 'regular' ? 'normal' : w); }); FF = 'Inter'; }
      const W = 210, H = 297, M = 16, CW = W - 2 * M;
      const C = { navy: [23, 54, 109], blue: [51, 98, 171], orange: [235, 104, 52], ink: [31, 36, 48], ink2: [74, 81, 96], muted: [120, 128, 142], line: [227, 231, 238], soft: [245, 247, 251], white: [255, 255, 255], green: [22, 138, 96], amber: [165, 111, 0] };
      const fill = c => doc.setFillColor(...c), stroke = c => doc.setDrawColor(...c), color = c => doc.setTextColor(...c);
      const font = (st, sz) => { doc.setFont(FF, FF === 'helvetica' && st === 'semibold' ? 'bold' : st); doc.setFontSize(sz); };
      const fit = (txt, st, sz, maxW, min = 8) => { font(st, sz); while (sz > min && doc.getTextWidth(txt) > maxW) { sz -= .5; font(st, sz); } return sz; };
      const e0 = v => eur0(v).replace(' €', ''), range0 = arr => arr.length ? (Math.min(...arr) === Math.max(...arr) ? eur0(Math.min(...arr)) : `${e0(Math.min(...arr))} – ${eur0(Math.max(...arr))}`) : '—';
      const e2 = v => eur(v), mq = v => trFmtQ(v) + ' m²';
      const oggi = new Date(), dataIt = oggi.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }), meseIt = oggi.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      const alpha = a => doc.setGState(new doc.GState({ opacity: a }));
      const F = K.map(x => x.c.fattura).filter(Boolean), A = K.map(x => x.c.app).filter(Boolean), R = K.map(x => x.c.rim).filter(Boolean);
      const range = arr => arr.length ? (Math.min(...arr) === Math.max(...arr) ? e2(Math.min(...arr)) : `${e2(Math.min(...arr))} – ${e2(Math.max(...arr))}`) : '—';

      // ---- intestazione pagina 1 ----
      const HB = 64;
      fill(C.navy); doc.rect(0, 0, W, HB, 'F');
      fill(C.blue); alpha(.55); doc.triangle(W * .45, 0, W, 0, W, HB, 'F'); alpha(1);
      const stripe = (x, y, w, h, c, a) => { fill(c); alpha(a); doc.lines([[w, -w * .25], [0, h], [-w, w * .25]], x, y + h, [1, 1], 'F', true); alpha(1); };
      stripe(150, 30, 70, 7.5, C.orange, .95); stripe(160, 41, 60, 7.5, [217, 221, 228], .85); stripe(170, 52, 50, 7.5, C.white, .18);
      if (logo) { fill(C.white); doc.roundedRect(M, 12, 12, 12, 2.6, 2.6, 'F'); doc.addImage(logo, 'PNG', M + .6, 12.6, 10.8, 10.8); }
      color(C.white); font('bold', 9.5); doc.text('SOLUZIONE VEICOLARE S.R.L.', M + (logo ? 16 : 0), 17); font('normal', 8); alpha(.8); doc.text('San Cesareo (RM)', M + (logo ? 16 : 0), 21.5); alpha(1);
      font('bold', 8); doc.text(INT ? 'LISTINO · USO INTERNO' : 'LISTINO PREZZI', W - M, 17, { align: 'right' });
      font('normal', 8); alpha(.8); doc.text(`Aggiornato al ${dataIt}`, W - M, 21.5, { align: 'right' }); alpha(1);
      font('bold', 25); doc.text('Listino kit adesivi Torental', M, 41);
      font('normal', 10); alpha(.85); doc.text('Kit per tipo di mezzo, servizi di applicazione e articoli singoli', M, 48.5); doc.text('Tutti i prezzi sono IVA esclusa', M, 53.5); alpha(1);
      if (INT) { font('bold', 7.2); const tw0 = doc.getTextWidth('RISERVATO · NON INVIARE AL CLIENTE') + 8; fill(C.orange); doc.roundedRect(W - M - tw0, 25.5, tw0, 6, 3, 3, 'F'); color(C.white); doc.text('RISERVATO · NON INVIARE AL CLIENTE', W - M - tw0 / 2, 29.6, { align: 'center' }); }

      // ---- riquadri di sintesi ----
      let y = HB + 8;
      const tiles = [['Kit a listino', String(K.length), `${D.sing.length} articoli singoli`], ['Prezzo kit', range0(F), 'totale fattura per mezzo'], ['Applicazione', range0(A), 'posa per mezzo'], ['Transferta', eur0(num(D.transferta)), '1 giorno · fino a 100 km']];
      const tw = (CW - 3 * 4) / 4;
      tiles.forEach(([l, v, s], i) => {
        const x = M + i * (tw + 4);
        fill(C.white); stroke(C.line); doc.setLineWidth(.3); doc.roundedRect(x, y, tw, 22, 2.5, 2.5, 'FD');
        fill(i === 1 ? C.orange : C.blue); doc.roundedRect(x, y, 1.6, 22, .8, .8, 'F');
        color(C.muted); font('normal', 7.5); doc.text(l.toUpperCase(), x + 5, y + 6.5);
        color(C.ink); fit(v, 'bold', 14, tw - 8); doc.text(v, x + 5, y + 14);
        color(C.muted); font('normal', 7.2); doc.text(s, x + 5, y + 18.6);
      });
      y += 22 + 10;

      const section = (title, sub, need = 40) => {
        if (y + need > H - 20) { doc.addPage(); y = 26; }
        fill(C.orange); doc.roundedRect(M, y - 3.6, 3.2, 3.2, .6, .6, 'F');
        color(C.navy); font('bold', 13); doc.text(title, M + 5.5, y);
        if (sub) { color(C.muted); font('normal', 8); doc.text(sub, W - M, y, { align: 'right' }); }
        stroke(C.line); doc.setLineWidth(.3); doc.line(M, y + 2.6, W - M, y + 2.6);
        y += 6;
      };
      const table = (head, body, opt = {}) => {
        doc.autoTable({
          startY: y, head: [head], body, margin: { left: M, right: M, top: 24, bottom: 18 }, theme: 'plain',
          styles: { font: FF, fontSize: opt.fs || 9, textColor: C.ink, cellPadding: { top: 2.6, bottom: 2.6, left: 2.4, right: 2.4 }, lineColor: C.line, lineWidth: { bottom: .2 }, valign: 'middle' },
          headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: 'bold', fontSize: (opt.fs || 9) - 1.2, cellPadding: { top: 3, bottom: 3, left: 2.4, right: 2.4 }, lineWidth: 0 },
          alternateRowStyles: { fillColor: C.soft },
          columnStyles: opt.cols || {}, didParseCell: opt.parse, didDrawCell: opt.draw,
          ...opt.extra
        });
        y = doc.lastAutoTable.finalY + 4;
      };

      // ---- kit ----
      section('Kit per tipo di mezzo', 'importi IVA esclusa');
      const manual = K.some(x => x.c.hand);
      if (!INT) {
        table(['Kit', 'Codice', 'Pellicola', 'Prezzo kit', 'Applicazione', 'Rimozione', 'Kit + applicazione'],
          K.map(x => [trShort(x.k.n), x.k.cod || '—', mq(x.c.film), e2(x.c.fattura), e2(x.c.app), e2(x.c.rim), e2(x.c.full)]),
          { cols: { 0: { fontStyle: 'bold', cellWidth: 'auto' }, 1: { textColor: C.muted, cellWidth: 'wrap' }, 2: { halign: 'right', cellWidth: 'wrap' }, 3: { halign: 'right', fontStyle: 'bold', cellWidth: 'wrap' }, 4: { halign: 'right', cellWidth: 'wrap' }, 5: { halign: 'right', cellWidth: 'wrap' }, 6: { halign: 'right', fontStyle: 'bold', textColor: C.blue, cellWidth: 'wrap' } },
            parse: d => { if (d.section === 'head' && d.column.index >= 2) d.cell.styles.halign = 'right'; } });
        color(C.muted); font('normal', 7.5);
        doc.text('Prezzo kit: pellicole e preparazione del kit. Kit + applicazione: prezzo del kit più la posa sul mezzo. La rimozione si aggiunge solo se c\'è un kit da togliere.', M, y + 1, { maxWidth: CW }); y += 14;
      } else {
        table(['Kit', 'Costo\nmateriale', `Prezzo mat.\n(× ${fmtNum(num(D.ricarico), 2).replace(/,00$/, '')})`, 'Prepara-\nzione', 'Prezzo\nkit', 'Applica-\nzione', 'Rimozione', 'Guadagno\nmateriale'],
          K.map(x => [trShort(x.k.n) + (x.c.hand ? ' *' : '') + (x.k.cod ? '\n' + x.k.cod : ''), e2(x.c.mat), e2(x.c.prezzo), e2(x.c.prep), e2(x.c.fattura), e2(x.c.app), e2(x.c.rim), e2(x.c.ric)]),
          { fs: 8.2, cols: { 0: { fontStyle: 'bold', cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 'wrap' }, 2: { halign: 'right', cellWidth: 'wrap' }, 3: { halign: 'right', cellWidth: 'wrap' }, 4: { halign: 'right', fontStyle: 'bold', cellWidth: 'wrap' }, 5: { halign: 'right', cellWidth: 'wrap' }, 6: { halign: 'right', cellWidth: 'wrap' }, 7: { halign: 'right', fontStyle: 'bold', textColor: C.green, cellWidth: 'wrap' } },
            parse: d => { if (d.section === 'head' && d.column.index >= 2) d.cell.styles.halign = 'right'; } });
        color(C.muted); font('normal', 7.5);
        doc.text(`Prezzo materiale = m² × costo fornitore × ${fmtNum(num(D.ricarico), 2).replace(/,00$/, '')}. Prezzo kit = prezzo materiale + preparazione.${manual ? ' * Prezzo fissato a mano nel listino, diverso dal calcolo.' : ''}`, M, y + 1, { maxWidth: CW }); y += 14;
      }

      // ---- servizi ----
      section('Servizi', '', 40);
      const sv = [['Applicazione', range(A), 'Posa del kit sul mezzo. Il prezzo dipende dal tipo di kit (vedi tabella).'], ['Rimozione', range(R), 'Rimozione del kit esistente prima della nuova applicazione.'], ['Transferta', e2(num(D.transferta)) + ' / giorno', 'Intervento presso la vostra sede, fino a 100 km.']];
      const sw = (CW - 2 * 4) / 3;
      sv.forEach(([t, v, s], i) => {
        const x = M + i * (sw + 4);
        fill(C.soft); doc.roundedRect(x, y, sw, 27, 2.5, 2.5, 'F');
        color(C.orange); font('bold', 7.5); doc.text(t.toUpperCase(), x + 5, y + 7);
        color(C.ink); font('bold', 12); doc.text(v, x + 5, y + 14);
        color(C.ink2); font('normal', 7.6); doc.text(doc.splitTextToSize(s, sw - 10), x + 5, y + 19.5);
      });
      y += 27 + 10;

      // ---- articoli singoli ----
      if (D.sing.length) {
        section('Articoli singoli', 'prezzo cadauno, IVA esclusa', (D.sing.length + 1) * 8.6 + 12);
        table(['Codice', 'Articolo', 'Prezzo'], D.sing.map(s => [s.cod || '—', trNice(s.n), e2(num(s.p))]),
          { cols: { 0: { textColor: C.muted, cellWidth: 30, fontStyle: 'bold' }, 2: { halign: 'right', fontStyle: 'bold', cellWidth: 30 } }, parse: d => { if (d.section === 'head' && d.column.index === 2) d.cell.styles.halign = 'right'; } });
        y += 6;
      }

      // ---- composizione ----
      section('Composizione dei kit', 'm² di materiale per kit', (K.length + 1) * 8.4 + 12);
      const mats = D.mat;
      table(['Kit', ...mats.map(m => `${m.n} (${m.cod})`), 'Totale pellicola', ...(INT ? ['Costo materiale'] : [])],
        K.map(x => [trShort(x.k.n), ...mats.map(m => num(x.k.q[m.cod]) ? mq(num(x.k.q[m.cod])) : '—'), mq(x.c.film), ...(INT ? [e2(x.c.mat)] : [])]),
        { fs: 8.5, cols: Object.fromEntries([[0, { fontStyle: 'bold', cellWidth: 46 }], ...[...mats.map((m, i) => i + 1), mats.length + 1, mats.length + 2].map(i => [i, { halign: 'right' }])]), parse: d => { if (d.section === 'head' && d.column.index >= 1) d.cell.styles.halign = 'right'; if (d.section === 'body' && d.column.index === mats.length + 1) d.cell.styles.fontStyle = 'bold'; } });
      if (INT) {
        y += 4;
        section('Materiali', 'costo fornitore e prezzo al cliente', (mats.length + 1) * 8.6 + 12);
        table(['Codice', 'Materiale', 'Tipo', 'Costo fornitore', 'Prezzo al cliente'], mats.map(m => [m.cod, m.n, m.tape ? 'Application tape' : 'Pellicola', e2(num(m.c)) + '/m²', e2(num(m.c) * num(D.ricarico)) + '/m²']),
          { cols: { 0: { textColor: C.muted, fontStyle: 'bold', cellWidth: 24 }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } }, parse: d => { if (d.section === 'head' && d.column.index >= 3) d.cell.styles.halign = 'right'; } });
      }

      // ---- note ----
      const notes = [D.nota, 'Tutti i prezzi sono IVA esclusa: l\'IVA al 22% viene applicata in fattura.', 'La transferta si applica per ogni giorno di intervento presso la vostra sede.'].filter(Boolean);
      const nl = notes.map(n => doc.splitTextToSize('•  ' + n, CW - 12));
      const nh_ = 10 + nl.reduce((a, l) => a + l.length * 4, 0);
      y += 4; if (y + nh_ > H - 22) { doc.addPage(); y = 26; }
      fill(C.soft); stroke(C.line); doc.roundedRect(M, y, CW, nh_, 2.5, 2.5, 'FD');
      color(C.navy); font('bold', 9); doc.text('Note', M + 6, y + 7);
      color(C.ink2); font('normal', 8.2); let ny = y + 12.5; nl.forEach(l => { doc.text(l, M + 6, ny); ny += l.length * 4; });

      // ---- intestazione pagine successive e piè di pagina ----
      const N = doc.internal.getNumberOfPages();
      for (let p = 1; p <= N; p++) {
        doc.setPage(p);
        if (p > 1) { fill(C.navy); doc.rect(0, 0, W, 3, 'F'); color(C.navy); font('bold', 9); doc.text('Listino kit adesivi Torental', M, 13); color(C.muted); font('normal', 8); doc.text(INT ? 'Uso interno · ' + dataIt : dataIt, W - M, 13, { align: 'right' }); stroke(C.line); doc.setLineWidth(.3); doc.line(M, 16, W - M, 16); }
        stroke(C.line); doc.setLineWidth(.3); doc.line(M, H - 12, W - M, H - 12);
        color(C.muted); font('normal', 7.5);
        doc.text('Soluzione Veicolare S.r.l. · San Cesareo (RM)', M, H - 7.5);
        doc.text(`Listino Torental · ${meseIt}`, W / 2, H - 7.5, { align: 'center' });
        doc.text(`Pagina ${p} di ${N}`, W - M, H - 7.5, { align: 'right' });
      }
      doc.setProperties({ title: 'Listino kit adesivi Torental', subject: INT ? 'Listino interno' : 'Listino prezzi', author: 'Soluzione Veicolare S.r.l.', creator: 'Centro di Costo' });
      doc.save(`Listino_Torental_${INT ? 'interno' : 'cliente'}_${today()}.pdf`);
      busy(); toast('PDF scaricato');
    } catch (e) { busy(); toast('PDF non creato: ' + e.message); }
  }
  /* ---------- Report PDF per piazzale e periodo (Lyreco, Amazon) ---------- */
  const rpTxt = h => { const d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const rpCut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/[\s,;.\-–]+\S*$/, '') + '…' : t; };
  const rpD = s => { const m = String(s || '').match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? `${m[3]}/${m[2]}/${m[1]}` : ''; };
  const rpMonthEnd = k => { const [y, m] = k.split('-').map(Number); return `${k}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`; };
  function rpSrc(kind) {
    if (kind === 'ly') return { all: lyRows(), date: r => String(r.data).slice(0, 10), cdc: r => r.cdc || LY_NONE };
    return { all: amOrd(), date: o => String(o.data).slice(0, 10), cdc: o => o.cdc || LY_NONE };
  }
  function rpPick(kind, cdc, da, a) {
    const S = rpSrc(kind);
    return S.all.filter(x => { const d = S.date(x); return (!da || d >= da) && (!a || d <= a) && (!cdc || S.cdc(x) === cdc); });
  }
  function rpAsk(kind) {
    const LY = kind === 'ly', S = rpSrc(kind);
    if (!S.all.length) return toast(LY ? 'Prima importa il file Lyreco' : 'Prima importa il file Amazon');
    const dates = S.all.map(S.date).filter(d => /^\d{4}-\d\d-\d\d$/.test(d)).sort(), d0 = dates[0], d1 = dates[dates.length - 1];
    const months = LY ? lyMonths() : amMonths(), curP = LY ? lyP : amP, curC = LY ? lyF.cdc : amF.cdc;
    const by = groupBy(S.all, S.cdc), places = lyCdcList().filter(c => by.has(c.cod));
    [...by.keys()].filter(k => !places.some(c => c.cod === k)).forEach(k => places.push({ cod: k, n: k }));
    const qs = [...new Set(months.map(k => k.slice(0, 4) + '-Q' + Math.ceil(Number(k.slice(5)) / 3)))];
    const qRange = q => { const y = q.slice(0, 4), n = Number(q.slice(-1)); return [`${y}-${String(n * 3 - 2).padStart(2, '0')}-01`, rpMonthEnd(`${y}-${String(n * 3).padStart(2, '0')}`)]; };
    const chips = [['all', 'Tutto il periodo', d0, d1], ...qs.map(q => { const [x, y] = qRange(q); return [q, `${Number(q.slice(-1))}° trimestre ${q.slice(0, 4)}`, x, y]; }), ...months.map(k => [k, mLabel(k), k + '-01', rpMonthEnd(k)])];
    const [ia, ib] = curP ? [curP + '-01', rpMonthEnd(curP)] : [d0, d1];
    openSheet(LY ? 'Report Lyreco in PDF' : 'Report Amazon in PDF', `<div class="rp-w">
      <label class="f"><span>Piazzale</span><select name="cdc">
        <option value="">Tutti i piazzali · riepilogo con confronto</option>
        ${places.map(c => `<option value="${esc(c.cod)}"${c.cod === curC ? ' selected' : ''}>${esc(c.n)} · ${esc(c.cod)}</option>`).join('')}
      </select></label>
      <div class="rp-l">Periodo</div>
      <div class="rp-chips">${chips.map(([k, l, x, y]) => `<button type="button" class="rp-chip${x === ia && y === ib ? ' on' : ''}" data-rpq="${k}" data-da="${x}" data-a="${y}">${esc(l)}</button>`).join('')}</div>
      <div class="rp-dates"><label class="f"><span>Dal</span><input type="date" name="da" value="${ia}" min="${d0}" max="${d1}" required></label><label class="f"><span>Al</span><input type="date" name="a" value="${ib}" min="${d0}" max="${d1}" required></label></div>
      <div class="rp-l">Importi</div>
      <div class="seg vers rp-iva"><label><input type="radio" name="iva" value="0"${ivaOn ? '' : ' checked'}><span>IVA esclusa</span></label><label><input type="radio" name="iva" value="1"${ivaOn ? ' checked' : ''}><span>IVA inclusa</span></label></div>
      <div class="rp-l">Cosa mettere nel PDF</div>
      <div class="rp-opts">
        <label class="rp-o"><input type="checkbox" checked disabled><span><b>Riepilogo</b><small>totali, mese per mese, categorie${''}</small></span></label>
        <label class="rp-o"><input type="checkbox" name="doc" checked><span><b>${LY ? 'Elenco delle fatture' : 'Elenco degli ordini'}</b><small>${LY ? 'numero, data, ordine e importo di ogni fattura' : 'data, numero, articoli, venditore e importo'}</small></span></label>
        <label class="rp-o"><input type="checkbox" name="det" checked><span><b>${LY ? 'Dettaglio della merce' : 'Dettaglio degli articoli'}</b><small>${LY ? 'ogni riga: codice, descrizione, quantità e prezzo' : 'ogni articolo con quantità, categoria e importo'}</small></span></label>
        <label class="rp-o"><input type="checkbox" name="chk"><span><b>Controlli</b><small>le cose da verificare nel periodo scelto</small></span></label>
      </div>
      <div class="rp-sum" id="rp-sum"></div></div>`, fd => {
      const o = { cdc: String(fd.get('cdc') || ''), da: String(fd.get('da') || ''), a: String(fd.get('a') || ''), iva: fd.get('iva') === '1', doc: !!fd.get('doc'), det: !!fd.get('det'), chk: !!fd.get('chk') };
      if (o.da > o.a) { toast('La data «Dal» è dopo la data «Al»'); return false; }
      if (!rpPick(kind, o.cdc, o.da, o.a).length) { toast('Nessun dato per il piazzale e il periodo scelti'); return false; }
      setTimeout(() => rpPdf(kind, o), 260); return true;
    }, null, 'Crea PDF');
    $('#sheet-form').classList.add('wide');
    const W = $('#sheet-body .rp-w'), F = $('#sheet-form');
    const upd = () => {
      const cdc = F.cdc.value, da = F.da.value, a = F.a.value, X = rpPick(kind, cdc, da, a), iv = F.querySelector('[name=iva]:checked').value === '1';
      $$('.rp-chip', W).forEach(b => b.classList.toggle('on', b.dataset.da === da && b.dataset.a === a));
      const p = ivaOn; ivaOn = iv;
      const v = LY ? lySum(X) : amSum(X), nd = LY ? new Set(X.map(r => r.fattura)).size : X.length;
      ivaOn = p;
      $('#rp-sum').innerHTML = X.length ? `<b>${esc(eur(v))}</b><span>${nd} ${LY ? (nd === 1 ? 'fattura' : 'fatture') : (nd === 1 ? 'ordine' : 'ordini')} · ${LY ? X.length + ' righe' : amArts(X).length + ' articoli'} · ${esc(rpD(da))} – ${esc(rpD(a))}</span>` : '<span class="rp-none">Nessun dato per questa scelta</span>';
    };
    W.addEventListener('click', e => { const c = e.target.closest('.rp-chip'); if (!c) return; F.da.value = c.dataset.da; F.a.value = c.dataset.a; upd(); });
    W.addEventListener('input', upd); W.addEventListener('change', upd);
    upd();
  }

  function rpModel(kind, o) {
    const LY = kind === 'ly', X = rpPick(kind, o.cdc, o.da, o.a), ALL = rpPick(kind, '', o.da, o.a);
    const place = o.cdc ? lyCdc(o.cdc) : null;
    const M = { LY, place, o, title: LY ? 'Report forniture Lyreco' : 'Report acquisti Amazon', short: LY ? 'Lyreco' : 'Amazon', notes: [] };
    const valOf = LY ? lySum : amSum;
    M.total = valOf(X); M.companyTotal = valOf(ALL); M.net = LY ? lySumN(X) : amSumN(X);
    // mesi del periodo (anche quelli a zero)
    const ms = []; { let [y, m] = o.da.slice(0, 7).split('-').map(Number); const [y2, m2] = o.a.slice(0, 7).split('-').map(Number); while (y < y2 || (y === y2 && m <= m2)) { ms.push(`${y}-${String(m).padStart(2, '0')}`); m++; if (m > 12) { m = 1; y++; } } }
    M.months = ms.map(k => ({ k, v: valOf(X.filter(x => String(x.data).slice(0, 7) === k)) }));
    if (LY) {
      const D = lyDocList(X);
      M.ndoc = D.length; M.nline = X.length; M.docWord = ['fattura', 'fatture']; M.lineWord = ['riga', 'righe'];
      M.byPlace = lyPlist(ALL).filter(x => x.rows.length).map(x => ({ cod: x.cod, n: x.n, citta: x.citta || '', docs: x.docs, lines: x.rows.length, v: x.t })).sort((a, b) => (a.cod === LY_NONE) - (b.cod === LY_NONE) || b.v - a.v);
      M.byCat = [...groupBy(X, r => r.categoria || 'Altro')].map(([k, v]) => ({ k, v: lySum(v), n: v.length })).sort((a, b) => b.v - a.v);
      M.docTitle = 'Fatture e note di credito';
      M.docHead = ['Data', 'Numero', 'Tipo', 'Ordine', ...(o.cdc ? [] : ['Centro di costo']), 'Righe', 'Importo'];
      M.docBody = D.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).map(d => {
        const part = o.cdc && lyDocRows(d.id).length > d.rows.length;
        return [rpD(d.data), d.id + (part ? ' *' : ''), lyTipoLbl(d.tipo), d.ordini.slice(0, 2).join(', ') || '—', ...(o.cdc ? [] : [d.mixed ? 'più centri' : lyName(d.cdc)]), String(d.rows.length), eur(d.v)];
      });
      if (o.cdc && D.some(d => lyDocRows(d.id).length > d.rows.length)) M.notes.push('* Fattura divisa tra più centri di costo: l\'importo indicato è solo la parte di questo piazzale.');
      M.docNum = o.cdc ? [5, 6] : [6, 7];
      M.detTitle = 'Dettaglio della merce';
      M.detHead = ['Data', 'Fattura', 'Codice', 'Descrizione', ...(o.cdc ? [] : ['Centro']), 'Q.tà', 'Prezzo', 'Importo'];
      M.detBody = X.slice().sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.fattura).localeCompare(String(b.fattura))).map(r => [rpD(r.data), String(r.fattura), r.codice || '—', rpCut(r.descrizione, 80), ...(o.cdc ? [] : [String(lyName(r.cdc || LY_NONE)).replace(/^(Magazzino|Piazzale)\s+/i, '')]), fmtNum(num(r.quantita), num(r.quantita) % 1 ? 2 : 0) + (r.um ? ' ' + String(r.um).toLowerCase() : ''), num(r.prezzo) ? eurP(num(r.prezzo) * lyMulR(r)) : '—', eur(lyV(r))]);
      M.detNum = o.cdc ? [4, 5, 6] : [5, 6, 7];
      if (o.chk) M.checks = lyChecks(X, D);
      const na = X.filter(r => (r.cdc || LY_NONE) === LY_NONE);
      if (!o.cdc && na.length) M.notes.push(`${eur(lySum(na))} (${new Set(na.map(r => r.fattura)).size} fatture) non indicano la sede di consegna e sono in «Da attribuire».`);
    } else {
      const A = amArts(X);
      M.ndoc = X.length; M.nline = A.length; M.docWord = ['ordine', 'ordini']; M.lineWord = ['articolo', 'articoli'];
      M.byPlace = amPlist(ALL).filter(x => x.rows.length).map(x => ({ cod: x.cod, n: x.n, citta: x.citta || '', docs: x.docs, lines: amArts(x.rows).length, v: x.t })).sort((a, b) => (a.cod === LY_NONE) - (b.cod === LY_NONE) || b.v - a.v);
      M.byCat = [...groupBy(A, a => a.cat)].map(([k, v]) => ({ k, v: r2(v.reduce((s, a) => s + a.val, 0)), n: v.length })).sort((a, b) => b.v - a.v);
      M.docTitle = 'Ordini';
      M.docHead = ['Data', 'Ordine', 'Articoli', 'Venditore', ...(o.cdc ? [] : ['Centro']), 'Imponibile', 'Totale'];
      M.docBody = X.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).map(x => [rpD(x.data), String(x.id), rpCut(String(x.articoli || '').split(/\s*\|\s*/)[0], o.cdc ? 70 : 52), rpCut(String(x.venditore || '—').split(',')[0], 22), ...(o.cdc ? [] : [String(lyName(x.cdc || LY_NONE)).replace(/^(Magazzino|Piazzale)\s+/i, '')]), eur(amNet(x)) + (amEst(x) ? ' *' : ''), eur(num(x.totale))]);
      M.docNum = o.cdc ? [4, 5] : [5, 6];
      M.detTitle = 'Dettaglio degli articoli';
      M.detHead = ['Data', 'Descrizione', 'Categoria', ...(o.cdc ? [] : ['Centro']), 'Q.tà', 'Importo'];
      M.detBody = A.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).map(a => [rpD(a.data), rpCut(a.descrizione, 90), a.cat, ...(o.cdc ? [] : [String(lyName(a.cdc)).replace(/^(Magazzino|Piazzale)\s+/i, '')]), fmtNum(num(a.quantita) || 1, 0), eur(a.val)]);
      M.detNum = o.cdc ? [3, 4] : [4, 5];
      if (o.chk) M.checks = amChecks(X, A);
      const est = X.filter(amEst);
      if (est.length) M.notes.push(`* In ${est.length} ordini Amazon non riporta l'IVA: l'imponibile è stimato al 22% (${eur(est.reduce((s, x) => s + num(x.totale), 0))} pagati). Il valore esatto è sulla fattura.`);
      M.notes.push('Negli ordini con più articoli l\'importo del singolo articolo è ripartito in proporzione al suo prezzo.');
    }
    M.nplaces = M.byPlace.filter(x => x.cod !== LY_NONE).length;
    return M;
  }

  async function rpPdf(kind, o) {
    const pIva = ivaOn; ivaOn = o.iva;
    try {
      busy('Preparo il PDF…');
      const R = rpModel(kind, o);
      const [jsPDF, logo, fonts] = await Promise.all([loadPdf(), logoPng(), loadFonts()]);
      const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      let FF = 'helvetica';
      if (fonts) { fonts.forEach(([w, data]) => { doc.addFileToVFS(`Inter-${w}.ttf`, data); doc.addFont(`Inter-${w}.ttf`, 'Inter', w === 'regular' ? 'normal' : w); }); FF = 'Inter'; }
      const W = 210, H = 297, M = 16, CW = W - 2 * M;
      const C = { navy: [23, 54, 109], blue: [51, 98, 171], blueSoft: [196, 211, 236], orange: [235, 104, 52], ink: [31, 36, 48], ink2: [74, 81, 96], muted: [120, 128, 142], line: [227, 231, 238], soft: [245, 247, 251], white: [255, 255, 255], red: [200, 52, 50], redSoft: [253, 236, 236], amber: [165, 111, 0], amberSoft: [251, 243, 220] };
      const fill = c => doc.setFillColor(...c), stroke = c => doc.setDrawColor(...c), color = c => doc.setTextColor(...c);
      const font = (st, sz) => { doc.setFont(FF, FF === 'helvetica' && st === 'semibold' ? 'bold' : st); doc.setFontSize(sz); };
      const fit = (txt, st, sz, maxW, min = 8) => { font(st, sz); while (sz > min && doc.getTextWidth(txt) > maxW) { sz -= .5; font(st, sz); } return sz; };
      const alpha = a => doc.setGState(new doc.GState({ opacity: a }));
      const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const ivaT = o.iva ? 'IVA inclusa' : 'IVA esclusa';
      const placeName = R.place ? R.place.n : 'Tutti i piazzali';
      const perT = `dal ${rpD(o.da)} al ${rpD(o.a)}`;
      const w = (n, ws) => `${n} ${n === 1 ? ws[0] : ws[1]}`;

      // ---- intestazione ----
      const HB = 66;
      fill(C.navy); doc.rect(0, 0, W, HB, 'F');
      fill(C.blue); alpha(.55); doc.triangle(W * .45, 0, W, 0, W, HB, 'F'); alpha(1);
      const stripe = (x, y, sw, sh, c, a) => { fill(c); alpha(a); doc.lines([[sw, -sw * .25], [0, sh], [-sw, sw * .25]], x, y + sh, [1, 1], 'F', true); alpha(1); };
      stripe(150, 32, 70, 7.5, C.orange, .95); stripe(160, 43, 60, 7.5, [217, 221, 228], .85); stripe(170, 54, 50, 7.5, C.white, .18);
      if (logo) { fill(C.white); doc.roundedRect(M, 12, 12, 12, 2.6, 2.6, 'F'); doc.addImage(logo, 'PNG', M + .6, 12.6, 10.8, 10.8); }
      color(C.white); font('bold', 9.5); doc.text('SOLUZIONE VEICOLARE S.R.L.', M + (logo ? 16 : 0), 17); font('normal', 8); alpha(.8); doc.text('San Cesareo (RM) · Centro di costo', M + (logo ? 16 : 0), 21.5); alpha(1);
      font('bold', 8); doc.text(R.title.toUpperCase(), W - M, 17, { align: 'right' });
      font('normal', 8); alpha(.8); doc.text(`Creato il ${oggi}`, W - M, 21.5, { align: 'right' }); alpha(1);
      fit(placeName, 'bold', 25, CW - 40, 16); doc.text(placeName, M, 41);
      font('normal', 10.5); alpha(.9); doc.text(`${R.short} · ${perT}`, M, 48.5); alpha(.75); font('normal', 9);
      doc.text(R.place ? [R.place.cod, R.place.ind || R.place.citta].filter(Boolean).join(' · ').slice(0, 95) : `${w(R.nplaces, ['piazzale', 'piazzali'])} con acquisti nel periodo`, M, 54.5); alpha(1);
      font('bold', 7.2); const tg = ivaT.toUpperCase(), tgw = doc.getTextWidth(tg) + 8; fill(C.orange); doc.roundedRect(W - M - tgw, 26, tgw, 6, 3, 3, 'F'); color(C.white); doc.text(tg, W - M - tgw / 2, 30.1, { align: 'center' });

      // ---- riquadri ----
      let y = HB + 8;
      const share = R.companyTotal ? R.total / R.companyTotal * 100 : 0;
      const nm = R.months.filter(x => x.v).length || 1;
      const tiles = [
        ['Spesa ' + (o.iva ? 'con IVA' : 'senza IVA'), eur(R.total), o.iva ? `imponibile ${eur(R.net)}` : (R.LY ? 'imponibile delle righe' : 'imponibile degli ordini')],
        [R.LY ? 'Fatture' : 'Ordini', String(R.ndoc), w(R.nline, R.lineWord)],
        ['Media mensile', eur0(R.total / Math.max(1, R.months.length)), `${w(R.months.length, ['mese', 'mesi'])} nel periodo`],
        R.place ? ['Quota sul totale', fmtNum(share, 1) + '%', `su ${eur0(R.companyTotal)} di tutti i piazzali`] : ['Piazzali', String(R.nplaces), R.byPlace[0] ? `il primo: ${String(R.byPlace[0].n).replace(/^(Magazzino|Piazzale)\s+/i, '')}` : '']
      ];
      const tw = (CW - 3 * 4) / 4;
      tiles.forEach(([l, v, s], i) => {
        const x = M + i * (tw + 4);
        fill(C.white); stroke(C.line); doc.setLineWidth(.3); doc.roundedRect(x, y, tw, 22, 2.5, 2.5, 'FD');
        fill(i === 0 ? C.orange : C.blue); doc.roundedRect(x, y, 1.6, 22, .8, .8, 'F');
        color(C.muted); font('normal', 7.2); doc.text(l.toUpperCase(), x + 5, y + 6.5);
        color(C.ink); fit(v, 'bold', 14, tw - 8); doc.text(v, x + 5, y + 14);
        color(C.muted); fit(s, 'normal', 7, tw - 8, 5.5); doc.text(s, x + 5, y + 18.6);
      });
      y += 22 + 10;

      const newPage = () => { doc.addPage(); y = 26; };
      const section = (title, sub, need = 40) => {
        if (y + need > H - 20) newPage();
        fill(C.orange); doc.roundedRect(M, y - 3.6, 3.2, 3.2, .6, .6, 'F');
        color(C.navy); font('bold', 13); doc.text(title, M + 5.5, y);
        if (sub) { color(C.muted); font('normal', 8); doc.text(sub, W - M, y, { align: 'right' }); }
        stroke(C.line); doc.setLineWidth(.3); doc.line(M, y + 2.6, W - M, y + 2.6);
        y += 6;
      };
      const table = (head, body, opt = {}) => {
        doc.autoTable({
          startY: y, head: [head], body, foot: opt.foot ? [opt.foot] : undefined, showFoot: 'lastPage', margin: { left: M, right: M, top: 24, bottom: 18 }, theme: 'plain',
          styles: { font: FF, fontSize: opt.fs || 9, textColor: C.ink, cellPadding: { top: opt.pad || 2.5, bottom: opt.pad || 2.5, left: 2.2, right: 2.2 }, lineColor: C.line, lineWidth: { bottom: .2 }, valign: 'middle', overflow: 'linebreak' },
          headStyles: { fillColor: C.navy, textColor: C.white, fontStyle: 'bold', fontSize: (opt.fs || 9) - 1.2, cellPadding: { top: 3, bottom: 3, left: 2.2, right: 2.2 }, lineWidth: 0 },
          footStyles: { fillColor: C.soft, textColor: C.navy, fontStyle: 'bold', fontSize: opt.fs || 9, lineWidth: 0 },
          alternateRowStyles: { fillColor: C.soft },
          columnStyles: opt.cols || {},
          didParseCell: d => { if ((opt.num || []).includes(d.column.index)) d.cell.styles.halign = 'right'; if (opt.parse) opt.parse(d); },
          didDrawCell: opt.draw
        });
        y = doc.lastAutoTable.finalY + 4;
      };
      const barCell = (getV, max, idx) => d => {
        if (d.section !== 'body' || d.column.index !== idx) return;
        const v = getV(d.row.index); if (v == null) return;
        const bw = d.cell.width - 4.4, bh = 2.4, bx = d.cell.x + 2.2, by = d.cell.y + d.cell.height / 2 - bh / 2;
        fill(C.line); doc.roundedRect(bx, by, bw, bh, 1.2, 1.2, 'F');
        if (v > 0) { fill(d.row.raw && d.row.raw.na ? C.red : C.blue); doc.roundedRect(bx, by, Math.max(1.2, bw * Math.min(1, v / max)), bh, 1.2, 1.2, 'F'); }
      };

      // ---- confronto tra piazzali / posizione del piazzale ----
      if (R.byPlace.length) {
        const mxp = Math.max(1, ...R.byPlace.map(x => x.v));
        section(R.place ? 'Il piazzale rispetto agli altri' : 'Spesa per piazzale', `stesso periodo · ${ivaT}`, 20 + R.byPlace.length * 8);
        const body = R.byPlace.map((x, i) => { const row = [x.cod === LY_NONE ? '?' : String(i + 1), x.n, x.citta || '—', String(x.docs), '', fmtNum(pct(x.v, R.companyTotal), 1) + '%', eur(x.v)]; row.na = x.cod === LY_NONE; return row; });
        table(['#', 'Centro di costo', 'Località', R.LY ? 'Fatture' : 'Ordini', 'Quota', '%', 'Importo'], body, {
          num: [3, 5, 6], foot: ['', 'Totale', '', String(R.byPlace.reduce((a, x) => a + x.docs, 0)), '', '100%', eur(R.companyTotal)],
          cols: { 0: { cellWidth: 9, halign: 'center', textColor: C.muted, fontStyle: 'bold' }, 1: { fontStyle: 'bold', cellWidth: 50 }, 2: { textColor: C.ink2 }, 3: { cellWidth: 16 }, 4: { cellWidth: 26 }, 5: { cellWidth: 15, textColor: C.muted }, 6: { cellWidth: 28, fontStyle: 'bold' } },
          parse: d => { if (R.place && d.section === 'body' && R.byPlace[d.row.index] && R.byPlace[d.row.index].cod === R.place.cod) { d.cell.styles.fillColor = [234, 240, 250]; d.cell.styles.textColor = C.navy; d.cell.styles.fontStyle = 'bold'; } if (d.section === 'body' && R.byPlace[d.row.index] && R.byPlace[d.row.index].cod === LY_NONE) d.cell.styles.textColor = C.red; },
          draw: barCell(i => R.byPlace[i] ? R.byPlace[i].v : null, mxp, 4)
        });
        y += 4;
      }

      // ---- mese per mese (grafico) ----
      if (R.months.length > 1) {
        const avg = R.total / R.months.length;
        section('Mese per mese', `${ivaT} · linea arancione = media ${eur0(avg)} al mese`, 56);
        const ch = 38, mx = Math.max(1, ...R.months.map(x => x.v)), n = R.months.length, gap = n > 8 ? 2.5 : 5, bw = Math.min(22, (CW - gap * (n - 1)) / n), tot = n * bw + (n - 1) * gap, x0 = M + (CW - tot) / 2, base = y + 8 + ch;
        stroke(C.line); doc.setLineWidth(.2); [0, .5, 1].forEach(f => { const yy = base - ch * f; doc.setLineDashPattern(f ? [.8, .8] : [], 0); doc.line(M, yy, W - M, yy); }); doc.setLineDashPattern([], 0);
        const ya = base - ch * avg / mx;
        R.months.forEach((m, i) => {
          const x = x0 + i * (bw + gap), h = m.v > 0 ? Math.max(.8, ch * m.v / mx) : 0;
          if (h) { fill(m.v >= avg ? C.blue : C.blueSoft); doc.roundedRect(x, base - h, bw, h, 1.2, 1.2, 'F'); doc.rect(x, base - Math.min(h, 1.2), bw, Math.min(h, 1.2), 'F'); }
          color(C.muted); font('normal', 7.4); const ml = MESI[Number(m.k.slice(5)) - 1].slice(0, 3); doc.text(ml.charAt(0).toUpperCase() + ml.slice(1) + (R.months[0].k.slice(0, 4) !== R.months[n - 1].k.slice(0, 4) ? ' ' + m.k.slice(2, 4) : ''), x + bw / 2, base + 4.5, { align: 'center' });
        });
        stroke(C.orange); doc.setLineWidth(.35); doc.setLineDashPattern([1.5, 1], 0); doc.line(M, ya, W - M, ya); doc.setLineDashPattern([], 0);
        R.months.forEach((m, i) => {
          const x = x0 + i * (bw + gap), h = m.v > 0 ? Math.max(.8, ch * m.v / mx) : 0, t = eur0(m.v);
          const fs = fit(t, 'semibold', 7.4, bw + gap - 1, 5), tw0 = doc.getTextWidth(t) + 2, ty = base - h - 2;
          fill(C.white); doc.roundedRect(x + bw / 2 - tw0 / 2, ty - fs * .3528 - .4, tw0, fs * .3528 + 1.4, .8, .8, 'F');
          color(C.ink); doc.text(t, x + bw / 2, ty, { align: 'center' });
        });
        y = base + 12;
      }

      // ---- categorie ----
      if (R.byCat.length) {
        const mxc = Math.max(1, ...R.byCat.map(x => x.v));
        section('Per categoria', ivaT, 20 + Math.min(R.byCat.length, 12) * 8);
        table(['Categoria', R.LY ? 'Righe' : 'Articoli', 'Quota', '%', 'Importo'], R.byCat.map(x => [x.k, String(x.n), '', fmtNum(pct(x.v, R.total), 1) + '%', eur(x.v)]), {
          num: [1, 3, 4], cols: { 0: { fontStyle: 'bold' }, 1: { cellWidth: 18 }, 2: { cellWidth: 46 }, 3: { cellWidth: 15, textColor: C.muted }, 4: { cellWidth: 28, fontStyle: 'bold' } },
          foot: ['Totale', String(R.byCat.reduce((a, x) => a + x.n, 0)), '', '100%', eur(R.total)],
          draw: barCell(i => R.byCat[i] ? R.byCat[i].v : null, mxc, 2)
        });
        y += 4;
      }

      // ---- controlli ----
      if (R.checks && R.checks.length) {
        section('Controlli', `${R.checks.length} punti da verificare`, 30);
        R.checks.forEach(c => {
          const txt = doc.splitTextToSize(rpTxt(c.d), CW - 50), hh = 9 + txt.length * 3.7;
          if (y + hh > H - 20) newPage();
          const warn = c.t === 'warn';
          fill(warn ? C.amberSoft : C.soft); doc.roundedRect(M, y, CW, hh, 2, 2, 'F');
          fill(warn ? C.amber : C.blue); doc.roundedRect(M, y, 1.4, hh, .7, .7, 'F');
          color(C.ink); font('bold', 9); doc.text(rpTxt(c.h), M + 5, y + 5.6);
          color(warn ? C.amber : C.navy); font('bold', 8.5); doc.text(rpTxt(c.v), W - M - 4, y + 5.6, { align: 'right' });
          color(C.ink2); font('normal', 7.8); doc.text(txt, M + 5, y + 10);
          y += hh + 3;
        });
        y += 4;
      }

      // ---- elenco documenti ----
      if (o.doc && R.docBody.length) {
        section(R.docTitle, `${w(R.docBody.length, R.docWord)} · ${ivaT}`, 30);
        const ncol = R.docHead.length;
        table(R.docHead, R.docBody, {
          fs: 7.8, pad: 2, num: R.docNum,
          foot: R.docHead.map((h, i) => i === 0 ? 'Totale' : i === ncol - 1 ? (R.LY ? eur(R.total) : eur(rpPick(kind, o.cdc, o.da, o.a).reduce((a, x) => a + num(x.totale), 0))) : (!R.LY && i === ncol - 2 ? eur(R.net) : '')),
          cols: R.LY ? { 0: { cellWidth: 'wrap' }, 1: { fontStyle: 'bold', cellWidth: 'wrap' }, 2: { textColor: C.ink2 }, [ncol - 2]: { cellWidth: 'wrap' }, [ncol - 1]: { cellWidth: 'wrap', fontStyle: 'bold' } }
            : { 0: { cellWidth: 'wrap' }, 1: { cellWidth: 'wrap', textColor: C.ink2, fontSize: 6.3 }, 2: { cellWidth: 'auto' }, 3: { cellWidth: 24, textColor: C.ink2 }, ...(o.cdc ? {} : { 4: { cellWidth: 19, textColor: C.ink2 } }), [ncol - 2]: { cellWidth: 'wrap' }, [ncol - 1]: { cellWidth: 'wrap', fontStyle: 'bold' } }
        });
        y += 4;
      }

      // ---- dettaglio righe / articoli ----
      if (o.det && R.detBody.length) {
        section(R.detTitle, `${w(R.detBody.length, R.lineWord)} · ${ivaT}`, 30);
        const ncol = R.detHead.length;
        table(R.detHead, R.detBody, {
          fs: 7.4, pad: 1.7, num: R.detNum,
          foot: R.detHead.map((h, i) => i === 0 ? 'Totale' : i === ncol - 1 ? eur(R.total) : ''),
          cols: R.LY ? { 0: { cellWidth: 'wrap' }, 1: { cellWidth: 'wrap', textColor: C.ink2 }, 2: { cellWidth: 'wrap', textColor: C.muted }, 3: { cellWidth: 'auto' }, [ncol - 1]: { cellWidth: 'wrap', fontStyle: 'bold' }, [ncol - 2]: { cellWidth: 'wrap' }, [ncol - 3]: { cellWidth: 'wrap' }, ...(o.cdc ? {} : { 4: { cellWidth: 22, textColor: C.ink2 } }) }
            : { 0: { cellWidth: 'wrap' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 30, textColor: C.ink2 }, [ncol - 1]: { cellWidth: 'wrap', fontStyle: 'bold' }, [ncol - 2]: { cellWidth: 'wrap' }, ...(o.cdc ? {} : { 3: { cellWidth: 22, textColor: C.ink2 } }) }
        });
        y += 4;
      }

      // ---- note ----
      const notes = [...R.notes, `Importi ${ivaT}. Periodo ${perT}.`, R.place ? `Centro di costo ${R.place.cod} · ${R.place.n}${R.place.ind ? ' · ' + R.place.ind : ''}.` : ''].filter(Boolean);
      const nl = notes.map(n => doc.splitTextToSize('•  ' + n, CW - 12));
      const nh = 10 + nl.reduce((a, l) => a + l.length * 3.9, 0);
      if (y + nh > H - 22) newPage();
      fill(C.soft); stroke(C.line); doc.setLineWidth(.3); doc.roundedRect(M, y, CW, nh, 2.5, 2.5, 'FD');
      color(C.navy); font('bold', 9); doc.text('Note', M + 6, y + 7);
      color(C.ink2); font('normal', 7.9); let ny = y + 12.3; nl.forEach(l => { doc.text(l, M + 6, ny); ny += l.length * 3.9; });

      // ---- intestazione pagine successive e piè di pagina ----
      const N = doc.internal.getNumberOfPages();
      for (let p = 1; p <= N; p++) {
        doc.setPage(p);
        if (p > 1) { fill(C.navy); doc.rect(0, 0, W, 3, 'F'); color(C.navy); font('bold', 9); doc.text(`${R.short} · ${placeName}`, M, 13); color(C.muted); font('normal', 8); doc.text(`${perT} · ${ivaT}`, W - M, 13, { align: 'right' }); stroke(C.line); doc.setLineWidth(.3); doc.line(M, 16, W - M, 16); }
        stroke(C.line); doc.setLineWidth(.3); doc.line(M, H - 12, W - M, H - 12);
        color(C.muted); font('normal', 7.5);
        doc.text('Soluzione Veicolare S.r.l. · San Cesareo (RM)', M, H - 7.5);
        doc.text(`${R.title} · creato il ${oggi}`, W / 2, H - 7.5, { align: 'center' });
        doc.text(`Pagina ${p} di ${N}`, W - M, H - 7.5, { align: 'right' });
      }
      doc.setProperties({ title: `${R.title} · ${placeName} · ${perT}`, subject: R.title, author: 'Soluzione Veicolare S.r.l.', creator: 'Centro di Costo' });
      const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '');
      doc.save(`${R.short}_${slug(R.place ? R.place.n : 'Tutti_i_piazzali')}_${o.da}_${o.a}.pdf`);
      busy(); toast('PDF scaricato');
    } catch (e) { busy(); toast('PDF non creato: ' + e.message); console.error(e); }
    finally { ivaOn = pIva; }
  }
  function trFix(i) {
    const D = JSON.parse(JSON.stringify(trData())), k = D.kit[i]; if (!k) return;
    const c = trCalc({ ...k, fx: null }, D);
    if (!confirm(`${trShort(k.n)}: usare il prezzo calcolato ${eur(c.fattura)} al posto di ${eur(trCalc(k, D).fattura)}?`)) return;
    delete k.fx; setConfig('trKit', D); toast('Prezzo aggiornato');
  }

  /* ---------- importa / esporta ---------- */
  function trParse(wb) {
    const U = XLSX.utils, sn = wb.SheetNames, D = { ricarico: 0, transferta: 0, nota: '', mat: [], kit: [], sing: [] };
    const ws = wb.Sheets[sn.find(n => /kit/i.test(n)) || sn[0]], aoa = U.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
    const hi = aoa.findIndex(r => r.some(c => /^consumo/.test(nh(c))));
    if (hi < 0) throw new Error('Non trovo la colonna «CONSUMO (m²)»: è il listino dei kit?');
    const H = aoa[hi].map(nh), col = re => H.findIndex(h => re.test(h));
    const C = { cod: col(/^codice/), n: col(/^prodotto|^articolo|^componente|^descrizione/), q: col(/^consumo/), c: col(/^costofornitore/), e: col(/^costomateriale/), f: col(/^prezzo/), g: col(/^preparazione/), h: col(/^totale/), i: col(/^applicazion/), j: col(/^rimo/), k: col(/^transferta/) };
    const cell = (R, c) => c < 0 ? null : ws[U.encode_cell({ r: R, c })];
    const isN = v => typeof v === 'number' || (/\d/.test(String(v)) && !/[a-z]/i.test(String(v)) && String(v).trim() !== '');
    let cur = null;
    for (let R = 0; R < aoa.length; R++) {
      const r = aoa[R], long = r.map(x => String(x ?? '')).find(x => x.length > 45 && /iva|prezz/i.test(x));
      if (long && !D.nota) { D.nota = long.trim(); continue; }
      if (R <= hi) continue;
      if (nh(r[C.cod]) === 'codice') break; // da qui: tabella articoli singoli
      const name = String(r[C.n] ?? '').trim(), q = r[C.q];
      if (name && !isN(q) && !isN(r[C.c])) { cur = { cod: String(r[C.cod] ?? '').trim(), n: trNice(name), q: {}, prep: 0, app: 0, rim: 0 }; D.kit.push(cur); continue; }
      if (cur && name && isN(q)) {
        const cod = String(r[C.cod] ?? '').trim() || name.toUpperCase();
        if (!D.mat.some(m => m.cod === cod)) D.mat.push({ cod, n: name.length <= 3 ? name.toUpperCase() : trNice(name), c: num(r[C.c]), tape: /^app/i.test(name) });
        const first = !Object.keys(cur.q).length; // prezzi e servizi stanno sulla prima riga del kit (celle unite)
        cur.q[cod] = num(q);
        const cf = cell(R, C.f); if (!D.ricarico && cf && cf.f) { const m = String(cf.f).match(/\*\s*([\d.]+)\s*$/); if (m) D.ricarico = +m[1]; }
        if (!D.ricarico && num(r[C.e]) && num(r[C.f])) D.ricarico = r2(num(r[C.f]) / num(r[C.e]));
        if (first) {
          cur.prep = num(r[C.g]); cur.app = num(r[C.i]); cur.rim = num(r[C.j]);
          if (num(r[C.k]) && !D.transferta) D.transferta = num(r[C.k]);
          const ch = cell(R, C.h); if (ch && typeof ch.v === 'number' && !ch.f) (cur.fx = cur.fx || {}).fattura = ch.v;
        }
        continue;
      }
      if (cur && !name) { // riga del totale materiale
        const ce = cell(R, C.e), cf = cell(R, C.f);
        if (ce && typeof ce.v === 'number' && !ce.f) (cur.fx = cur.fx || {}).mat = ce.v;
        if (cf && typeof cf.v === 'number' && !cf.f) (cur.fx = cur.fx || {}).prezzo = cf.v;
      }
    }
    if (!D.ricarico) D.ricarico = 2;
    D.kit = D.kit.filter(k => Object.keys(k.q).length);
    // tieni il prezzo scritto a mano solo se è diverso dal calcolo
    D.kit.forEach(k => { if (!k.fx) return; const c = trCalc({ ...k, fx: null }, D); const fx = k.fx; if ((fx.fattura == null || Math.abs(fx.fattura - c.fattura) < .01) && (fx.prezzo == null || Math.abs(fx.prezzo - c.prezzo) < .01) && (fx.mat == null || Math.abs(fx.mat - c.mat) < .01)) delete k.fx; });
    const parseSing = a => { const h = a.findIndex(r => r.some(c => nh(c) === 'articolo') && r.some(c => nh(c) === 'prezzo')); if (h < 0) return; const H2 = a[h].map(nh), ia = H2.indexOf('codice'), ib = H2.indexOf('articolo'), ip = H2.indexOf('prezzo'); a.slice(h + 1).forEach(r => { const n = String(r[ib] ?? '').trim(); if (!n || !num(r[ip])) return; const cod = ia >= 0 ? String(r[ia] ?? '').trim() : ''; if (!D.sing.some(x => (x.cod || x.n) === (cod || n))) D.sing.push({ cod, n: trNice(n), p: num(r[ip]) }); }); };
    const ss = sn.find(n => /singol/i.test(n)); if (ss) parseSing(U.sheet_to_json(wb.Sheets[ss], { header: 1, raw: true, defval: '' }));
    parseSing(aoa.slice(hi + 1));
    if (!D.kit.length) throw new Error('Nessun kit trovato nel file');
    return D;
  }
  async function importTor() {
    let file; try { file = await pickFile('.xlsx,.xls'); } catch { return; }
    try {
      busy('Leggo il listino…'); await loadXlsx();
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellFormula: true }); const D = trParse(wb); busy();
      const hand = D.kit.filter(k => k.fx).length;
      if (!confirm(`Listino letto: ${D.kit.length} kit, ${D.mat.length} materiali, ${D.sing.length} articoli singoli, ricarico × ${fmtNum(D.ricarico, 2).replace(/,00$/, '')}.${hand ? `\n${hand} kit hanno il prezzo scritto a mano: lo tengo e lo segnalo nei controlli.` : ''}\nSostituire il listino attuale?`)) return;
      setConfig('trKit', D); trAnim = true; toast('Listino Torental aggiornato');
    } catch (e) { busy(); toast(e.message); }
  }
  async function exportTor() {
    const D = trData();
    try {
      busy('Preparo il file Excel…'); await loadXlsx();
      const U = XLSX.utils, wb = U.book_new(), E = '#,##0.00 "€"';
      const head = ['CODICE', 'PRODOTTO / COMPONENTE', 'CONSUMO (m²)', 'COSTO FORNITORE (€/m²)', 'COSTO MATERIALE (€)', 'PREZZO CON RICARICO (€)', 'PREPARAZIONE KIT (€)', 'TOTALE FATTURA (€)', 'APPLICAZIONI', 'RIMOZIONE', 'TRANSFERTA 1 GIORNO (100KM)'];
      const aoa = [head, [D.nota || '']], money = [];
      D.kit.forEach(k => {
        const c = trCalc(k, D); aoa.push([k.cod || '', k.n.toUpperCase()]);
        c.comp.forEach((x, j) => { aoa.push([x.cod, String(x.n).toUpperCase(), x.q, num(x.c), r2(x.cost), r2(x.prezzo), j ? '' : c.prep, j ? '' : c.fattura, j ? '' : c.app, j ? '' : c.rim, j ? '' : num(D.transferta)]); money.push(aoa.length); });
        aoa.push(['', '', '', '', c.mat, c.prezzo]); money.push(aoa.length);
      });
      aoa.push([], ['CODICE', 'ARTICOLO', 'PREZZO'], ...D.sing.map(s => [s.cod, s.n.toUpperCase(), num(s.p)]));
      const ws = U.aoa_to_sheet(aoa); money.forEach(R => ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach(c => { if (ws[c + R] && ws[c + R].t === 'n') ws[c + R].z = E; }));
      ws['!cols'] = [10, 34, 13, 18, 16, 18, 16, 16, 13, 12, 18].map(w => ({ wch: w })); U.book_append_sheet(wb, ws, 'KIT');
      const w2 = U.aoa_to_sheet([['Kit', 'Codice', 'Costo materiale', 'Prezzo materiale', 'Preparazione', 'Totale fattura', 'Applicazione', 'Rimozione', 'Kit + applicazione', 'Guadagno sul materiale'], ...D.kit.map(k => { const c = trCalc(k, D); return [k.n, k.cod || '', c.mat, c.prezzo, c.prep, c.fattura, c.app, c.rim, c.full, c.ric]; })]);
      D.kit.forEach((k, i) => ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(c => { const x = w2[c + (i + 2)]; if (x && x.t === 'n') x.z = E; }));
      w2['!cols'] = [30, 10, 15, 15, 13, 14, 13, 12, 17, 20].map(w => ({ wch: w })); U.book_append_sheet(wb, w2, 'RIEPILOGO');
      const w3 = U.aoa_to_sheet([['CODICE', 'ARTICOLO', 'PREZZO'], ...D.sing.map(s => [s.cod, s.n.toUpperCase(), num(s.p)])]); D.sing.forEach((s, i) => { const x = w3['C' + (i + 2)]; if (x) x.z = E; }); w3['!cols'] = [12, 34, 10].map(w => ({ wch: w })); U.book_append_sheet(wb, w3, 'SINGOLI');
      XLSX.writeFile(wb, 'Listino_Kit_Torental.xlsx'); busy(); toast('Listino scaricato');
    } catch (e) { busy(); toast(e.message); }
  }
  function trArt() {
    // strisce di pellicola (arancione e grigio) che si sovrappongono: richiamo alla livrea, senza disegnare mezzi
    return `<svg viewBox="300 0 340 260" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" class="gh-svg tr-svg">
      <defs><pattern id="trdots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" opacity=".12"/></pattern></defs>
      <rect x="300" width="340" height="260" fill="url(#trdots)"/>
      <g class="tr-s s1" style="--d:150ms"><rect x="380" y="64" width="250" height="38" rx="19" transform="rotate(-14 505 83)"/></g>
      <g class="tr-s s2" style="--d:300ms"><rect x="400" y="118" width="250" height="38" rx="19" transform="rotate(-14 525 137)"/></g>
      <g class="tr-s s3" style="--d:450ms"><rect x="420" y="172" width="230" height="38" rx="19" transform="rotate(-14 535 191)"/></g>
    </svg>`;
  }

  /* =========================================================
     LYRECO · fatture e merce ripartite per centro di costo (piazzale)
     ========================================================= */
  // anagrafica centri di costo condivisa da Lyreco e Amazon (key = sede in fattura Lyreco, loc = località di consegna Amazon)
  const LY_CDC_DEF = [
    { cod: 'CDC01', n: 'Sede Roma', tipo: 'Sede', ind: 'Viale L. Schiavonetti 278 – Roma (sede legale)', key: 'SOLUZIONE VEICOLARE VIALE L. SCHIAVONETT ROMA', loc: '00173', citta: 'Roma', prov: 'RM', geo: [12.612, 41.857] },
    { cod: 'CDC02', n: 'San Cesareo', tipo: 'Sede operativa', ind: 'Via dell\'Enopolio snc – San Cesareo (RM)', key: 'SOLUZIONE VEICOLARE VIA DELLENOPOLIO SN SAN CESAREO', loc: 'SAN CESAREO|00030', citta: 'San Cesareo', prov: 'RM', geo: [12.80, 41.82] },
    { cod: 'CDC03', n: 'Magazzino Gorgonzola', tipo: 'Magazzino', ind: 'c/o Veneta Logistic – Gorgonzola (MI)', key: 'MAGAZZINO GORGONZOL C/O VENETA LOGISTIC VIA GIUSEPPE P', loc: 'GORGONZOLA|20064', citta: 'Gorgonzola', prov: 'MI', geo: [9.405, 45.532] },
    { cod: 'CDC04', n: 'Magazzino Venezia', tipo: 'Magazzino', ind: 'c/o Veneta Logistic – Via Abbate Tommaso – Quarto d\'Altino (VE)', key: 'MAGAZZINO VENEZIA C/O VENETA LOGISTIC VIA ABBATE TOMMA', loc: 'QUARTO D ALTINO|30020', citta: 'Quarto d\'Altino', prov: 'VE', geo: [12.372, 45.578] },
    { cod: 'CDC05', n: 'Magazzino Pisa', tipo: 'Magazzino', ind: 'c/o RL2 – Via Cocchi snc – Ospedaletto (PI)', key: 'MAGAZZINO PISA C/O RL2 VIA COCCHI SNC PISA', loc: 'OSPEDALETTO|56121', citta: 'Pisa', prov: 'PI', geo: [10.43, 43.687] },
    { cod: 'CDC06', n: 'Magazzino Rimini', tipo: 'Magazzino', ind: 'c/o RL2 – Via Chitarrara 1103 – Taverna di Monte Colombo (RN)', key: 'MAGAZZINO RIMINI C/O RL2 VIA CHITARRARA 1103 TAVERNA D', loc: 'MONTE COLOMBO|TAVERNA|47854', citta: 'Taverna', prov: 'RN', geo: [12.53, 43.948] },
    { cod: 'CDC07', n: 'Magazzino Mondo (RTL2)', tipo: 'Magazzino', ind: 'RTL2 Logistica c/o Magazzino Mondo – Via Alessandro Manzoni', key: 'RTL2 LOGISTICA C/O MAGAZZINO MONDO VIA ALESSANDRO MANZ', loc: '', citta: '', prov: '', geo: null },
    { cod: 'CDC08', n: 'Piazzale Bologna', tipo: 'Piazzale', ind: 'Calderara di Reno / Bargellino (BO)', key: '', loc: 'CALDERARA|BARGELLINO|40012', citta: 'Calderara di Reno', prov: 'BO', geo: [11.272, 44.565] },
    { cod: 'CDC09', n: 'Magazzino Torino', tipo: 'Magazzino', ind: 'c/o Veneta Logistic – Volpiano (TO)', key: '', loc: 'VOLPIANO|10088', citta: 'Volpiano', prov: 'TO', geo: [7.776, 45.201] },
    { cod: 'CDC10', n: 'Magazzino Pescara', tipo: 'Magazzino', ind: 'c/o RL2 – Città Sant\'Angelo (PE)', key: '', loc: 'CITTA SANT ANGELO|65013', citta: 'Città Sant\'Angelo', prov: 'PE', geo: [14.059, 42.518] },
    { cod: 'CDC11', n: 'Magazzino Corropoli', tipo: 'Magazzino', ind: 'c/o RL2 Logistic – Corropoli (TE)', key: '', loc: 'CORROPOLI|64013', citta: 'Corropoli', prov: 'TE', geo: [13.839, 42.827] },
    { cod: 'CDC12', n: 'Magazzino Verona', tipo: 'Magazzino', ind: 'c/o Veneta Logistic – San Bonifacio (VR)', key: '', loc: 'SAN BONIFACIO|37047', citta: 'San Bonifacio', prov: 'VR', geo: [11.274, 45.396] },
    { cod: 'CDC13', n: 'Magazzino Ravenna', tipo: 'Magazzino', ind: 'c/o Veneta Logistic – Fornace Zarattini (RA)', key: '', loc: 'FORNACE ZARATTINI|48124', citta: 'Fornace Zarattini', prov: 'RA', geo: [12.143, 44.405] },
    { cod: 'CDC99', n: 'Da attribuire', tipo: 'Sospeso', ind: 'Sede di consegna non indicata', key: '', loc: '', citta: '', prov: '', geo: null }
  ];
  // aggiunge ai centri salvati quelli nuovi e le località Amazon mancanti, senza toccare le modifiche dell'utente
  function lyCdcMerge(list) {
    const out = list.map(x => ({ ...x }));
    LY_CDC_DEF.forEach(d => {
      const ex = out.find(x => x.cod === d.cod);
      if (!ex) { const i = out.findIndex(x => x.cod === 'CDC99'); out.splice(i < 0 || d.cod === 'CDC99' ? out.length : i, 0, { ...d }); return; }
      if (ex.loc == null) ex.loc = d.loc;
      if (ex.cod === 'CDC04' && Array.isArray(ex.geo) && ex.geo[0] === 12.245) { ex.geo = d.geo; ex.citta = d.citta; ex.ind = d.ind; }
    });
    return out;
  }
  const LY_NONE = 'CDC99';
  const LY_COL = ['#3362ab', '#eb6834', '#1baf7a', '#eda100', '#8b5cf6', '#e87ba4', '#0ea5b7', '#94a3b8'];
  let lyP = '', lyAnim = true, lyF = { q: '', cdc: '', cat: '', doc: '' }, lyLimit = 40, lyDocLimit = 12, lyDocF = '', lyArtQ = '';
  const lyRows = () => db.lyreco || [];
  const lyDocs = () => db.lyfatture || [];
  const lyOk = () => isLocal() || !db.v || db.v >= 'cdc-1.6';
  let lyCdcSrc, lyCdcC = null;
  const lyCdcList = () => { const c = cfg('lyCdc'); if (c !== lyCdcSrc || !lyCdcC) { lyCdcSrc = c; lyCdcC = lyCdcMerge(Array.isArray(c) && c.length ? c : []); } return lyCdcC; };
  const lyCdc = cod => lyCdcList().find(x => x.cod === cod) || { cod, n: cod || '—', tipo: '' };
  const lyName = cod => lyCdc(cod || LY_NONE).n;
  const lyMulR = r => ivaOn ? 1 + num(r.iva) : 1;
  const lyV = r => r2(num(r.importo) * lyMulR(r));
  const lySum = arr => r2(arr.reduce((a, r) => a + lyV(r), 0));
  const lySumN = arr => r2(arr.reduce((a, r) => a + num(r.importo), 0));
  const lyMonths = () => [...new Set(lyRows().map(r => String(r.data).slice(0, 7)).filter(k => /^\d{4}-\d\d$/.test(k)))].sort();
  const lyIn = r => !lyP || String(r.data).slice(0, 7) === lyP;
  const lyIsShip = r => /spese di trasporto/i.test(r.categoria || '') || /TRASP/i.test(r.descrizione || '');
  const lyIsEnv = r => /contribut/i.test(r.categoria || '');
  const lyIsNC = d => /TD04/i.test(d.tipo || '') || /nota di credito/i.test(d.descrizione || '');
  const lyTipoLbl = t => /TD04/.test(t) ? 'Nota di credito' : /TD25/.test(t) ? 'Triangolare' : /TD24/.test(t) ? 'Differita' : (t || 'Fattura');
  const lyGeo = c => { if (Array.isArray(c.geo) && c.geo.length === 2 && num(c.geo[0])) return c.geo; const G = window.GLS_GEO || { CITY: {}, PROV: {} }, pr = String(c.prov || '').trim().toUpperCase(), ci = String(c.citta || '').trim().toUpperCase(); const hit = G.CITY[`${ci}|${pr}`]; if (hit) return [hit[1], hit[0]]; const p = G.PROV[pr]; return p ? [p[1], p[0]] : null; };
  const lyDocRows = id => lyRows().filter(r => String(r.fattura) === String(id));
  const lyDocCdc = rows => { const by = groupBy(rows, r => r.cdc || LY_NONE); return [...by].sort((a, b) => b[1].length - a[1].length).map(x => x[0]); };
  function lyDocList(rows) {
    const byD = groupBy(rows, r => String(r.fattura));
    const meta = new Map(lyDocs().map(d => [String(d.id), d]));
    return [...byD].map(([id, v]) => {
      const d = meta.get(id) || {}, cdcs = lyDocCdc(v), sumN = lySumN(v);
      const imp = d.imponibile !== '' && d.imponibile != null ? num(d.imponibile) : sumN;
      const tot = d.totale !== '' && d.totale != null && num(d.totale) ? num(d.totale) : r2(v.reduce((a, r) => a + num(r.importo) * (1 + num(r.iva)), 0));
      return { id, d, rows: v, tipo: d.tipo || v[0].tipo || '', data: d.data || v[0].data || '', cdc: cdcs[0], mixed: cdcs.length > 1, sumN, imp, tot, diff: r2(imp - sumN), v: lySum(v), ordini: [...new Set(v.map(r => r.ordine).filter(Boolean))], ddt: [...new Set(v.map(r => r.ddt).filter(Boolean))] };
    }).sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(b.id).localeCompare(String(a.id)));
  }

  /* ---------- controlli ---------- */
  function lyChecks(rows, docs) {
    const A = [];
    const na = rows.filter(r => (r.cdc || LY_NONE) === LY_NONE), nad = docs.filter(d => d.cdc === LY_NONE);
    if (na.length) A.push({ t: 'warn', h: 'Merce da attribuire a un piazzale', d: `${nad.length} fatture (${na.length} righe) non indicano la sede di consegna. Apri la fattura e scegli il centro di costo: tutte le righe si aggiornano insieme.`, v: eur(lySum(na)), act: 'lyna' });
    const bad = docs.filter(d => Math.abs(d.diff) > .009);
    if (bad.length) A.push({ t: 'warn', h: 'Fatture che non quadrano', d: bad.slice(0, 3).map(d => `n. ${esc(d.id)}: fattura ${eur(d.imp)}, righe ${eur(d.sumN)}`).join(' · ') + (bad.length > 3 ? ' …' : ''), v: eur(bad.reduce((a, d) => a + Math.abs(d.diff), 0)), ids: bad.map(d => d.id) });
    const ship = rows.filter(lyIsShip), minOrd = ship.filter(r => /MINIMO/i.test(r.descrizione || ''));
    if (ship.length) A.push({ t: 'info', h: 'Spese di trasporto', d: `${eur(lySum(ship))} di trasporto su ${new Set(ship.map(r => r.ordine || r.fattura)).size} ordini${minOrd.length ? `, di cui ${minOrd.length} supplementi per ordine sotto il minimo (${eur(lySum(minOrd))}): raggruppando gli ordini si risparmiano` : ''}.`, v: fmtNum(pct(lySum(ship), lySum(rows)), 1) + '% della spesa', cat: 'Spese di trasporto' });
    const art = [...groupBy(rows.filter(r => r.codice && num(r.prezzo) > 0 && !lyIsShip(r) && !lyIsEnv(r) && num(r.importo) > 0), r => String(r.codice))].map(([k, v]) => { const p = v.map(r => num(r.prezzo)); return { k, d: v[0].descrizione, min: Math.min(...p), max: Math.max(...p), q: v.reduce((a, r) => a + num(r.quantita), 0) }; }).filter(x => x.max / x.min > 1.05).sort((a, b) => (b.max - b.min) * b.q - (a.max - a.min) * a.q);
    if (art.length) A.push({ t: 'info', h: 'Stesso articolo pagato a prezzi diversi', d: art.slice(0, 3).map(x => `${esc(String(x.d).slice(0, 42))}: da ${eurP(x.min)} a ${eurP(x.max)}`).join(' · ') + (art.length > 3 ? ` e altri ${art.length - 3}` : ''), v: art.length + ' articoli', q: art[0] ? art[0].k : '' });
    const nc = docs.filter(d => lyIsNC(d));
    if (nc.length) A.push({ t: 'info', h: 'Note di credito', d: `${nc.length} note di credito già scalate dai totali (resi o correzioni di Lyreco).`, v: eur(nc.reduce((a, d) => a + d.v, 0)), ids: nc.map(d => d.id) });
    const rc = rows.filter(r => num(r.iva) === 0 && num(r.importo) > 0);
    if (rc.length) { const ds = [...new Set(rc.map(r => r.fattura))]; A.push({ t: 'info', h: 'Fatture senza IVA (inversione contabile)', d: `${ds.length === 1 ? 'La fattura' : 'Le fatture'} ${ds.map(esc).join(', ')} ${ds.length === 1 ? 'è' : 'sono'} in reverse charge: l'IVA va integrata da voi in contabilità.`, v: eur(lySumN(rc)), ids: ds }); }
    const zero = rows.filter(r => num(r.quantita) && !num(r.importo));
    if (zero.length) A.push({ t: 'info', h: 'Articoli in omaggio', d: `${zero.length} righe a costo zero (${zero.slice(0, 2).map(r => esc(String(r.descrizione).slice(0, 36))).join(', ')}).`, v: zero.length + ' righe', ids: [...new Set(zero.map(r => r.fattura))] });
    return A;
  }

  /* ---------- pagina ---------- */
  function lyPlist(rows) {
    const by = groupBy(rows, r => r.cdc || LY_NONE);
    const list = lyCdcList().map(c => ({ ...c, rows: by.get(c.cod) || [] }));
    [...by.keys()].filter(k => !list.some(c => c.cod === k)).forEach(k => list.push({ cod: k, n: k, tipo: '', rows: by.get(k) }));
    list.forEach(x => { x.t = lySum(x.rows); x.docs = new Set(x.rows.map(r => r.fattura)).size; });
    return list;
  }
  function renderLy() {
    const months = lyMonths();
    if (lyP && !months.includes(lyP)) lyP = '';
    $('#ly-per').innerHTML = `<option value=""${lyP ? '' : ' selected'}>Tutto il periodo</option>` + months.slice().reverse().map(k => `<option value="${k}"${k === lyP ? ' selected' : ''}>${esc(mLabel(k))}</option>`).join('');
    const opts = ['', ...months.slice().reverse()], ix = opts.indexOf(lyP);
    $('#ly-prev').disabled = ix >= opts.length - 1; $('#ly-next').disabled = ix <= 0;
    sub(`${ivaLbl()} · forniture Lyreco per centro di costo`);
    const all = lyRows(), rows = all.filter(lyIn);
    const anim = lyAnim && !reduced(); lyAnim = false;
    const body = $('#ly-body'); body.classList.toggle('cc-anim', anim);
    const warn = lyOk() ? '' : `<div class="card gl-warn"><b>Aggiorna lo script Google per salvare i dati Lyreco.</b><span>Lo script collegato è la versione ${esc(db.v || '—')}: serve la cdc-1.6 (Code.gs nuovo).</span></div>`;
    if (!rows.length) {
      body.innerHTML = warn + `<div class="gl-hero ly-hero gl-hero-empty"><div class="gh-top"><div class="gh-art">${lyArt()}</div><div class="gh-main"><span class="gh-lbl">Forniture Lyreco</span><h3>Nessuna fattura caricata</h3><p>Importa il file «Centro di costo Lyreco» (fogli Dettaglio righe, Controllo fatture e Anagrafica CdC): l'app ripartisce fatture e merce su ogni piazzale.</p><div class="tr-hb ly-hb"><button class="btn sm" id="ly-imp2" type="button">Importa il file Excel</button></div></div></div></div>`;
      return;
    }
    const D = lyDocList(rows), PL = lyPlist(rows);
    const T = lySum(rows), TN = lySumN(rows);
    const nc = D.filter(d => lyIsNC(d)), fat = D.filter(d => !lyIsNC(d));
    const na = PL.find(x => x.cod === LY_NONE) || { t: 0, rows: [], docs: 0 };
    const ship = rows.filter(lyIsShip), shipT = lySum(ship);
    const docTot = D.reduce((a, d) => a + d.tot, 0), docImp = D.reduce((a, d) => a + d.imp, 0);
    const act = PL.filter(x => x.cod !== LY_NONE && x.rows.length);
    const per = lyP ? mLabel(lyP) : months.length > 1 ? `${mLabel(months[0])} – ${mLabel(months[months.length - 1])}` : months.length ? mLabel(months[0]) : '';
    const prevK = lyP ? months[months.indexOf(lyP) - 1] : null, PT = prevK ? lySum(all.filter(r => String(r.data).slice(0, 7) === prevK)) : 0;
    const int = v => fmtNum(Math.round(v), 0);
    const K = [
      ['Fatture', fat.length, int, nc.length ? `+ ${nc.length} note di credito` : 'nessuna nota di credito'],
      ['IVA', docTot - docImp, eur0, `totale documenti ${eur0(docTot)}`],
      ['Centri serviti', act.length, int, `su ${lyCdcList().filter(c => c.cod !== LY_NONE).length} centri di costo`],
      ['Da attribuire', na.t, eur0, T ? `${fmtNum(pct(na.t, T), 1)}% · ${na.docs} fatture` : '—'],
      ['Trasporto', shipT, eur0, T ? `${fmtNum(pct(shipT, T), 1)}% della spesa` : '—'],
      ['Note di credito', nc.reduce((a, d) => a + d.v, 0), eur0, nc.length ? `${nc.length} documenti` : '—']
    ];
    body.innerHTML = warn + `
      <div class="gl-hero ly-hero">
        <div class="gh-top"><div class="gh-art">${lyArt()}</div>
        <div class="gh-main"><span class="gh-lbl">Forniture Lyreco · ${esc(per)}</span><div class="gh-big k-ly">0 €</div>
          <div class="gh-sub"><span>${D.length} documenti</span><span>${fmtNum(rows.length, 0)} righe</span><span>${act.length} centri di costo</span>${PT ? `<span class="gl-d ${T > PT ? 'up' : 'down'}">${T > PT ? '▲' : '▼'} ${fmtNum(Math.abs((T / PT - 1) * 100), 0)}% vs ${esc(MESI[Number(prevK.slice(5)) - 1])}</span>` : ''}</div></div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k${i === 3 && na.t ? ' ly-kwarn' : ''}"><span>${l}</span><b data-lyk="${i}">0</b><small>${esc(s)}</small></div>`).join('')}</div>
      </div>
      <div class="card" id="ly-anom"></div>
      <div class="card ly-mapcard"><div class="card-h"><h3>Spesa per piazzale</h3><span class="muted small">${ivaLbl()} · tocca per filtrare</span><button class="btn sm" id="ly-cdc" type="button">Centri di costo</button></div>
        <div class="tr-dash ly-dash"><div class="cc-map" id="ly-map"></div><div class="tr-rank" id="ly-rank"></div></div></div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Per categoria</h3><span class="muted small">${ivaLbl()}</span></div><div class="bars" id="ly-cat"></div></div>
        <div class="card"><div class="card-h"><h3>Mese per mese</h3><span class="muted small">per centro di costo</span></div><div class="ly-mb" id="ly-mm"></div><div class="ly-leg" id="ly-leg"></div></div>
      </div>
      <div class="card"><div class="card-h"><h3>Centri di costo × categorie</h3><span class="muted small">come il foglio «Riepilogo CdC» · ${ivaLbl()}</span></div><div class="mx-wrap" id="ly-mx"></div></div>
      <div class="card" id="ly-docs-card"><div class="card-h"><h3>Fatture e note di credito</h3><span class="muted small" id="ly-dcnt"></span><div class="tr-seg ly-dseg">${[['', 'Tutte'], ['na', 'Da attribuire'], ['nc', 'Note di credito']].map(([k, l]) => `<button type="button" data-lydf="${k}" class="${lyDocF === k ? 'on' : ''}">${l}</button>`).join('')}</div></div><div id="ly-docs"></div></div>
      <div class="card"><div class="card-h"><h3>Articoli più acquistati</h3><span class="muted small">per spesa · trasporto e contributi esclusi</span><input id="ly-aq" type="search" class="ly-aq" placeholder="Cerca articolo o codice…" value="${esc(lyArtQ)}"></div><div id="ly-art"></div></div>
      <div class="card gl-list"><div class="card-h"><h3>Tutte le righe</h3><span class="muted small" id="ly-cnt"></span></div>
        <div class="filters f4 gl-f"><input id="ly-q" type="search" placeholder="Cerca descrizione, codice, fattura, ordine…" value="${esc(lyF.q)}"><select id="ly-fc"></select><select id="ly-fk"></select><select id="ly-fd"></select></div>
        <div id="ly-list"></div></div>`;
    countTo($('.k-ly', body), T, eur0);
    $$('[data-lyk]', body).forEach(el => { const i = +el.dataset.lyk; el._v = 0; countTo(el, K[i][1], K[i][2]); });
    // controlli
    const A = lyChecks(rows, D), I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    const okDocs = D.filter(d => Math.abs(d.diff) <= .009).length;
    $('#ly-anom').innerHTML = `<div class="card-h"><h3>Controlli</h3><span class="muted small">${okDocs}/${D.length} fatture quadrano con le righe · ${A.length} punti</span></div>` + (A.length ? `<div class="gl-an">${A.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms"${x.act ? ` data-lyact="${x.act}"` : ''}${x.ids ? ` data-lyids="${esc(x.ids.join(' '))}"` : ''}${x.cat ? ` data-lycat="${esc(x.cat)}"` : ''}${x.q ? ` data-lyartq="${esc(x.q)}"` : ''}><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span></div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Tutto in ordine</div>');
    lyMap(PL, rows, anim);
    // categorie
    const byC = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => ({ k, v: lySum(v), n: v.length })).sort((a, b) => b.v - a.v), mc = Math.max(1, ...byC.map(x => x.v));
    $('#ly-cat').innerHTML = byC.map((x, i) => `<div class="bar-row gl-anim-row click" style="--d:${200 + i * 45}ms" data-lycat="${esc(x.k)}"><div class="bar-top"><span>${esc(x.k)}<em>${fmtNum(pct(x.v, T), 1)}%</em></span><span>${eur0(x.v)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(Math.max(0, x.v) / mc * 100).toFixed(2)}%"></div></div></div>`).join('');
    // mesi (impilati per centro di costo)
    const top = PL.filter(x => x.rows.length).sort((a, b) => b.t - a.t), colOf = new Map(top.map((x, i) => [x.cod, x.cod === LY_NONE ? '#b6bac3' : LY_COL[Math.min(i, LY_COL.length - 1)]]));
    const mm = (lyP ? [lyP] : months).map(k => { const v = all.filter(r => String(r.data).slice(0, 7) === k); const parts = top.map(c => ({ c: c.cod, v: lySum(v.filter(r => (r.cdc || LY_NONE) === c.cod)) })).filter(p => p.v > 0); return { k, t: lySum(v), parts }; });
    const mx = Math.max(1, ...mm.map(x => x.t));
    $('#ly-mm').innerHTML = mm.map((x, i) => `<div class="ly-b" data-lyper="${x.k}" title="${esc(mLabel(x.k))}: ${esc(eur(x.t))}"><span class="ly-bv">${esc(eur0(x.t))}</span><div class="ly-bc" style="height:${Math.max(2, x.t / mx * 100).toFixed(1)}%;--d:${i * 45}ms">${x.parts.slice().reverse().map(p => `<i style="flex:${p.v};background:${colOf.get(p.c)}" title="${esc(lyName(p.c))}: ${esc(eur(p.v))}"></i>`).join('')}</div><span class="ly-bl">${esc(MESI[Number(x.k.slice(5)) - 1].slice(0, 3))}</span></div>`).join('');
    $('#ly-leg').innerHTML = top.map(c => `<span><i style="background:${colOf.get(c.cod)}"></i>${esc(c.n)}</span>`).join('');
    lyMatrix(rows, PL, anim);
    renderLyDocs(D);
    renderLyArt(rows);
    // filtri righe
    const cats = byC.map(x => x.k);
    if (lyF.cdc && !PL.some(x => x.cod === lyF.cdc && x.rows.length)) lyF.cdc = '';
    if (lyF.cat && !cats.includes(lyF.cat)) lyF.cat = '';
    if (lyF.doc && !D.some(d => d.id === lyF.doc)) lyF.doc = '';
    $('#ly-fc').innerHTML = `<option value="">Tutti i centri di costo</option>` + PL.filter(x => x.rows.length).map(x => `<option value="${esc(x.cod)}"${lyF.cdc === x.cod ? ' selected' : ''}>${esc(x.n)}</option>`).join('');
    $('#ly-fk').innerHTML = `<option value="">Tutte le categorie</option>` + cats.map(c => `<option${lyF.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('');
    $('#ly-fd').innerHTML = `<option value="">Tutte le fatture</option>` + D.map(d => `<option value="${esc(d.id)}"${lyF.doc === d.id ? ' selected' : ''}>${esc(d.id)} · ${esc(shortDate(d.data))}</option>`).join('');
    renderLyList(rows);
  }

  /* ===== Mappa dei piazzali (Lyreco, Amazon): solo i piazzali, inquadratura automatica, etichette senza sovrapposizioni ===== */
  let pzCtx = null;
  const pzW = (txt, px, wt) => { if (!pzCtx) pzCtx = document.createElement('canvas').getContext('2d'); pzCtx.font = `${wt} ${px}px ${getComputedStyle(document.body).fontFamily}`; return pzCtx.measureText(txt).width; };
  const pzName = n => String(n).replace(/^(Magazzino|Piazzale|Mag\.)\s+/i, '').replace(/\s*\(.*\)$/, '');
  function pzMap(hostSel, list, o) {
    const host = $(hostSel); if (!host) return;
    pzMap.last = pzMap.last || {}; pzMap.last[hostSel] = [list, { ...o, anim: false }];
    if (!list.length) { host.innerHTML = '<div class="empty">Nessun piazzale da mostrare sulla mappa</div>'; return; }
    const w = Math.max(280, host.clientWidth || 560), wide = w >= 460;
    const rkH = o.rankEl && $(o.rankEl) && matchMedia('(min-width: 980px)').matches ? $(o.rankEl).offsetHeight : 0;
    const th = Math.round(wide ? Math.min(w * 1.5, Math.max(w * .78, rkH - 44)) : w * 1.08);
    const T = list.reduce((a, x) => a + Math.max(0, x.t), 0) || 1, mx = Math.max(1, ...list.map(x => x.t));
    const P = list.map(x => { const [gx, gy] = proj(x.geo); return { ...x, gx, gy, rp: (wide ? 8 : 9.5) + (wide ? 15 : 10) * Math.sqrt(Math.max(0, x.t) / mx) }; });
    // inquadratura: tutti i piazzali con margine per le etichette
    const xs = P.map(p => p.gx), ys = P.map(p => p.gy), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const padX = wide ? Math.min(118, w * .24) : 26, padY = wide ? Math.min(70, th * .15) : 30;
    const s = Math.max((x1 - x0) / Math.max(60, w - 2 * padX), (y1 - y0) / Math.max(60, th - 2.6 * padY), 235 / w);
    const vw = w * s, vh = th * s, vx = (x0 + x1) / 2 - vw / 2, vy = (y0 + y1) / 2 - vh / 2 + padY * .3 * s;
    const u = px => px * s;
    P.forEach(p => { p.x = p.gx; p.y = p.gy; p.r = u(p.rp); });
    // bolle vicine (es. Roma e San Cesareo): si allontanano un poco, con un filo verso il punto vero
    for (let it = 0; it < 80; it++) {
      let moved = false;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j]; let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); const need = a.r + b.r + u(3);
        if (d < need) { if (d < 1e-6) { dx = 1; dy = 0; d = 1; } const k = (need - d) / 2 / d; const wa = b.r / (a.r + b.r), wb = a.r / (a.r + b.r); a.x -= dx * k * 2 * wa; a.y -= dy * k * 2 * wa; b.x += dx * k * 2 * wb; b.y += dy * k * 2 * wb; moved = true; }
      }
      if (!moved) break;
    }
    // etichette: prima i piazzali che spendono di più, nella prima posizione libera
    const fN = 10.5, fV = 11.5, chH = u(36), boxes = P.map(p => ({ x: p.x - p.r - u(2), y: p.y - p.r - u(2), w: 2 * p.r + u(4), h: 2 * p.r + u(4) }));
    const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const inside = b => b.x > vx + u(4) && b.y > vy + u(4) && b.x + b.w < vx + vw - u(4) && b.y + b.h < vy + vh - u(4);
    if (wide) P.slice().sort((a, b) => b.t - a.t).forEach(p => {
      const nm = pzName(p.n).toUpperCase(), val = `${eur0(p.t)} · ${fmtNum(pct(p.t, T), 0)}%`;
      const cw = u(Math.max(pzW(nm, fN, 700) * 1.06, pzW(val, fV, 500)) + 20);
      const cand = [];
      [u(8), u(26), u(46)].forEach(g => {
        const R = p.r + g;
        [[1, 0], [-1, 0], [.75, -.75], [-.75, -.75], [.75, .75], [-.75, .75], [0, -1], [0, 1]].forEach(([ax, ay]) => {
          const cx = p.x + ax * R, cy = p.y + ay * R;
          cand.push({ x: ax > 0 ? cx : ax < 0 ? cx - cw : cx - cw / 2, y: ay > 0 ? cy : ay < 0 ? cy - chH : cy - chH / 2, w: cw, h: chH, far: g > u(10) });
        });
      });
      const ok = cand.find(c => inside(c) && !boxes.some(b => hit(c, b)));
      if (ok) { boxes.push(ok); p.lb = { ...ok, nm, val }; }
    });
    const A = o.attr, ord = P.slice().sort((a, b) => b.r - a.r);
    const fade = vy + vh < 384 ? 1 : 0;
    const edge = (p, b) => { // punto del bordo dell'etichetta più vicino alla bolla
      const ex = Math.max(b.x, Math.min(p.x, b.x + b.w)), ey = Math.max(b.y, Math.min(p.y, b.y + b.h)), d = Math.hypot(ex - p.x, ey - p.y) || 1;
      return [p.x + (ex - p.x) / d * p.r, p.y + (ey - p.y) / d * p.r, ex, ey, d - p.r];
    };
    host.innerHTML = `<svg viewBox="${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}" width="${w}" height="${th}" class="pz-svg${o.anim ? ' pz-anim' : ''}" role="img" aria-label="${esc(o.label || 'Mappa dei piazzali')}">
      <defs>
        <pattern id="pzd-${A}" width="${u(7).toFixed(3)}" height="${u(7).toFixed(3)}" patternUnits="userSpaceOnUse"><circle cx="${u(3.5).toFixed(3)}" cy="${u(3.5).toFixed(3)}" r="${u(1.05).toFixed(3)}" class="pz-dot"/></pattern>
        <filter id="pzs-${A}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${u(1.5).toFixed(3)}" stdDeviation="${u(3).toFixed(3)}" flood-opacity=".10"/></filter>
        <linearGradient id="pzf-${A}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="${fade ? .86 : 1}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="${fade ? 0 : 1}"/></linearGradient>
        <mask id="pzm-${A}" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#pzf-${A})"/></mask>
      </defs>
      <g mask="url(#pzm-${A})" class="pz-landg">
        <path class="pz-land" d="${IT_PATH}" style="stroke-width:${u(1).toFixed(3)}"/>
        <path class="pz-dots" d="${IT_PATH}" fill="url(#pzd-${A})"/>
      </g>
      ${P.filter(p => Math.hypot(p.x - p.gx, p.y - p.gy) > u(2)).map(p => `<g class="pz-true tr-pin" data-${A}="${esc(p.cod)}"><line x1="${p.gx.toFixed(2)}" y1="${p.gy.toFixed(2)}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" style="stroke-width:${u(1).toFixed(3)}"/><circle cx="${p.gx.toFixed(2)}" cy="${p.gy.toFixed(2)}" r="${u(2.2).toFixed(3)}" style="stroke-width:${u(1.2).toFixed(3)}"/></g>`).join('')}
      ${P.filter(p => p.lb).map(p => { const [ax, ay, ex, ey, d] = edge(p, p.lb); return d > u(10) ? `<line class="pz-lead tr-pin" data-${A}="${esc(p.cod)}" x1="${ax.toFixed(2)}" y1="${ay.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" style="stroke-width:${u(1).toFixed(3)}"/>` : ''; }).join('')}
      ${ord.map((p, i) => `<g class="pz-pin tr-pin${o.sel === p.cod ? ' on' : ''}" data-${A}="${esc(p.cod)}" style="--d:${350 + i * 60}ms" transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})"><title>${esc(p.n)}: ${esc(eur(p.t))} · ${esc(p.sub)}</title>
        <circle class="pz-halo" r="${(p.r + u(5)).toFixed(3)}"/><circle class="pz-c" r="${p.r.toFixed(3)}" style="stroke-width:${u(2).toFixed(3)}"/>${p.rp >= 9.5 ? `<text class="pz-num" y="${u(3.6).toFixed(3)}" style="font-size:${u(p.rp >= 14 ? 11 : 10).toFixed(3)}px">${p.rank}</text>` : ''}</g>`).join('')}
      ${P.filter(p => p.lb).map((p, i) => { const b = p.lb; return `<g class="pz-lbl tr-pin${o.sel === p.cod ? ' on' : ''}" data-${A}="${esc(p.cod)}" style="--d:${650 + i * 50}ms">
        <rect x="${b.x.toFixed(2)}" y="${b.y.toFixed(2)}" width="${b.w.toFixed(2)}" height="${b.h.toFixed(2)}" rx="${u(8).toFixed(3)}" filter="url(#pzs-${A})" style="stroke-width:${u(1).toFixed(3)}"/>
        <text x="${(b.x + u(10)).toFixed(2)}" y="${(b.y + u(15)).toFixed(2)}" class="pz-n" style="font-size:${u(fN).toFixed(3)}px;letter-spacing:${u(.5).toFixed(3)}px">${esc(b.nm)}</text>
        <text x="${(b.x + u(10)).toFixed(2)}" y="${(b.y + u(29)).toFixed(2)}" class="pz-v" style="font-size:${u(fV).toFixed(3)}px">${esc(b.val)}</text></g>`; }).join('')}
    </svg>
    <div class="pz-foot"><span class="pz-key"><i style="width:9px;height:9px"></i><i style="width:15px;height:15px"></i><i style="width:22px;height:22px"></i>dimensione = spesa</span><span>${list.length} ${list.length === 1 ? 'piazzale' : 'piazzali'} · ${eur0(T)}</span></div>`;
    // evidenziazione reciproca mappa ↔ classifica
    const card = host.closest('.card');
    if (card && !card.dataset.pzhl) {
      card.dataset.pzhl = 1;
      const hl = k => card.querySelectorAll(`[data-${A}]`).forEach(x => x.classList.toggle('hl', !!k && x.dataset[A] === k));
      card.addEventListener('mouseover', e => { const t = e.target.closest(`.pz-svg [data-${A}], .cr-row[data-${A}]`); hl(t ? t.dataset[A] : ''); });
      card.addEventListener('mouseleave', () => hl(''));
    }
  }
  pzMap.redraw = () => Object.entries(pzMap.last || {}).forEach(([k, [l, o]]) => { if ($(k) && $(k).offsetParent) pzMap(k, l, o); });
  function lyMap(PL, rows, anim) {
    const rk = PL.filter(x => x.rows.length).sort((a, b) => (a.cod === LY_NONE) - (b.cod === LY_NONE) || b.t - a.t), all = rk.reduce((a, x) => a + x.t, 0), mxr = Math.max(1, ...rk.map(x => x.t));
    const noGeo = PL.filter(x => x.cod !== LY_NONE && x.rows.length && !lyGeo(x));
    $('#ly-rank').innerHTML = rk.map((x, i) => `<button type="button" class="cr-row${lyF.cdc === x.cod ? ' on' : ''}${x.cod === LY_NONE ? ' ly-na' : ''}" data-lycdc="${esc(x.cod)}" style="--d:${200 + i * 60}ms">
        <span class="cr-n">${x.cod === LY_NONE ? '?' : i + 1}</span>
        <span class="cr-main"><span class="cr-top"><b>${esc(x.n)}</b><span><em>${fmtNum(pct(x.t, all), 1)}%</em><strong>${eur0(x.t)}</strong></span></span>
        <span class="cr-track"><i style="width:${(Math.max(0, x.t) / mxr * 100).toFixed(2)}%"></i></span>
        <span class="cr-sub">${esc(x.cod)} · ${x.docs} fatture · ${x.rows.length} righe${x.cod === LY_NONE ? ' · da assegnare' : x.tipo ? ' · ' + esc(x.tipo) : ''}</span></span>
      </button>`).join('') + (noGeo.length ? `<div class="muted small tr-none">Non in mappa (manca la città): ${noGeo.map(x => esc(x.n)).join(', ')}. <button type="button" class="link ly-link" id="ly-cdc2">Imposta la città</button></div>` : '');
    pzMap('#ly-map', rk.filter(x => x.cod !== LY_NONE && lyGeo(x)).map(x => ({ cod: x.cod, n: x.n, t: x.t, rank: rk.indexOf(x) + 1, sub: `${x.docs} ${x.docs === 1 ? 'fattura' : 'fatture'}`, geo: lyGeo(x) })), { attr: 'lycdc', sel: lyF.cdc, rankEl: '#ly-rank', anim, label: 'Mappa dei centri di costo Lyreco' });
  }
  function lyMatrix(rows, PL, anim) {
    const cs = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => [k, lySum(v)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const P = PL.filter(x => x.rows.length);
    const cell = {}; rows.forEach(r => { const k = (r.cdc || LY_NONE) + '|' + (r.categoria || 'Altro'); cell[k] = (cell[k] || 0) + lyV(r); });
    const mxv = Math.max(1, ...Object.values(cell));
    const heat = v => !v ? 'h0' : v / mxv > .45 ? 'h3' : v / mxv > .15 ? 'h2' : v / mxv > .03 ? 'h1' : '';
    $('#ly-mx').innerHTML = `<table class="mx ly-mxt${anim ? ' mx-anim' : ''}"><thead><tr><th>Centro di costo</th>${cs.map(c => `<th title="${esc(c)}">${esc(c)}</th>`).join('')}<th>Totale</th></tr></thead><tbody>
      ${P.map((p, r) => `<tr data-lycdc="${esc(p.cod)}"${p.cod === LY_NONE ? ' class="ly-na"' : ''}><td title="${esc(p.n)}">${esc(p.n)}</td>${cs.map((c, j) => { const v = cell[p.cod + '|' + c] || 0; return `<td class="${heat(v)}" style="--d:${(r + j) * 25}ms">${v ? eur0(v) : '—'}</td>`; }).join('')}<td><b>${eur0(p.t)}</b></td></tr>`).join('')}
      <tr class="tot"><td>Totale</td>${cs.map(c => `<td>${eur0(P.reduce((a, p) => a + (cell[p.cod + '|' + c] || 0), 0))}</td>`).join('')}<td>${eur0(lySum(rows))}</td></tr></tbody></table>`;
  }
  function renderLyDocs(D) {
    D = D || lyDocList(lyRows().filter(lyIn));
    const L = D.filter(d => !lyDocF || (lyDocF === 'na' && d.cdc === LY_NONE) || (lyDocF === 'nc' && lyIsNC(d)) || (lyDocF === 'ids' && (renderLyDocs.ids || []).includes(d.id)));
    $('#ly-dcnt').textContent = `${L.length} documenti · ${eur(L.reduce((a, d) => a + d.v, 0))}`;
    if (!L.length) { $('#ly-docs').innerHTML = '<div class="empty">Nessun documento</div>'; return; }
    const sh = L.slice(0, lyDocLimit), more = L.length > lyDocLimit ? `<div class="more-row"><button class="btn sm" id="ly-dmore">Mostra tutti (${L.length})</button></div>` : '';
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    const q = d => Math.abs(d.diff) <= .009 ? '<span class="chip paid ly-q">Quadra</span>' : `<span class="chip late ly-q">${d.diff > 0 ? '+' : ''}${esc(eur(d.diff))}</span>`;
    const tp = d => `<span class="chip ly-tp${lyIsNC(d) ? ' nc' : ''}">${esc(lyTipoLbl(d.tipo))}</span>`;
    const cc = d => d.cdc === LY_NONE ? '<span class="chip late">Da attribuire</span>' : `<span class="ly-cc">${esc(lyName(d.cdc))}${d.mixed ? ' +' : ''}</span>`;
    if (isDesk()) $('#ly-docs').innerHTML = `<div class="tr-tw"><table class="tbl gl-st ly-dt"><thead><tr><th>Data</th><th>Numero</th><th>Tipo</th><th>Centro di costo</th><th class="r">Righe</th><th class="r">Imponibile</th><th class="r">Totale</th><th>Quadratura</th><th></th></tr></thead><tbody>
      ${sh.map(d => `<tr data-lydoc="${esc(d.id)}"${d.cdc === LY_NONE ? ' class="ly-na"' : ''}><td class="d">${dd(d.data)}</td><td><b>${esc(d.id)}</b>${d.ordini.length ? `<small class="tr-nt">ordine ${esc(d.ordini.slice(0, 2).join(', '))}${d.ordini.length > 2 ? '…' : ''}</small>` : ''}</td><td>${tp(d)}</td><td>${cc(d)}</td><td class="num">${d.rows.length}</td><td class="num">${eur(d.imp)}</td><td class="num amt">${eur(d.tot)}</td><td>${q(d)}</td><td>${d.d.pdf ? '<span class="fa-clip" title="PDF salvato"><svg viewBox="0 0 24 24"><path d="M21 12.5 12.7 20.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/></svg></span>' : ''}</td></tr>`).join('')}</tbody></table></div>${more}`;
    else $('#ly-docs').innerHTML = `<div class="list">${sh.map(d => `<div class="item" data-lydoc="${esc(d.id)}"><span class="ic ly-ic${d.cdc === LY_NONE ? ' na' : ''}"><svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg></span><div class="main"><div class="t">n. ${esc(d.id)} · ${esc(lyTipoLbl(d.tipo))}</div><div class="s">${dd(d.data)} · ${esc(d.cdc === LY_NONE ? 'da attribuire' : lyName(d.cdc))} · ${d.rows.length} righe</div></div><div class="amt">${eur(d.v)}</div></div>`).join('')}</div>${more}`;
  }
  function renderLyArt(rows) {
    rows = rows || lyRows().filter(lyIn);
    const q = lyArtQ.trim().toLowerCase();
    const A = [...groupBy(rows.filter(r => !lyIsShip(r) && !lyIsEnv(r)), r => String(r.codice || r.descrizione))].map(([k, v]) => { const p = v.filter(r => num(r.prezzo) > 0).map(r => num(r.prezzo)); return { k, d: v[0].descrizione, cat: v[0].categoria, q: v.reduce((a, r) => a + num(r.quantita), 0), um: v[0].um, t: lySum(v), n: v.length, min: p.length ? Math.min(...p) : 0, max: p.length ? Math.max(...p) : 0, cdc: new Set(v.map(r => r.cdc || LY_NONE)).size }; })
      .filter(x => !q || `${x.k} ${x.d}`.toLowerCase().includes(q)).sort((a, b) => b.t - a.t);
    const sh = A.slice(0, q ? 60 : 12), mt = Math.max(1, ...sh.map(x => x.t));
    $('#ly-art').innerHTML = sh.length ? `<div class="ly-arts">${sh.map((x, i) => `<div class="ly-ar" data-lyart="${esc(x.k)}" style="--d:${150 + i * 35}ms"><span class="ly-am"><b>${esc(x.d)}</b><small>${esc(x.k)} · ${esc(x.cat || '')} · ${fmtNum(x.q, 0)} ${esc(String(x.um || '').toLowerCase())} · ${x.cdc} ${x.cdc === 1 ? 'centro' : 'centri'}</small><span class="gd-b"><i style="width:${(Math.max(0, x.t) / mt * 100).toFixed(1)}%"></i></span></span><span class="ly-ap">${x.min && x.max / x.min > 1.05 ? `<span class="chip soon" title="Prezzo variato">${esc(eurP(x.min))} → ${esc(eurP(x.max))}</span>` : x.min ? `<small>${esc(eurP(x.min))} cad.</small>` : ''}<b>${esc(eur(x.t))}</b></span></div>`).join('')}</div>${!q && A.length > 12 ? `<div class="muted small" style="margin-top:8px">Primi 12 di ${A.length} articoli: usa la ricerca per trovarne altri.</div>` : ''}` : '<div class="empty">Nessun articolo</div>';
  }
  function renderLyList(rows, only) {
    rows = rows || lyRows().filter(lyIn);
    const q = lyF.q.trim().toLowerCase();
    const Ls = (only || rows).filter(r => (!lyF.cdc || (r.cdc || LY_NONE) === lyF.cdc) && (!lyF.cat || (r.categoria || 'Altro') === lyF.cat) && (!lyF.doc || String(r.fattura) === lyF.doc)
      && (!q || `${r.descrizione} ${r.codice} ${r.fattura} ${r.ordine} ${r.ddt} ${r.richiedente} ${r.note}`.toLowerCase().includes(q)))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(a.id).localeCompare(String(b.id)));
    $('#ly-cnt').textContent = `${Ls.length} righe · ${eur(lySum(Ls))}`;
    if (!Ls.length) { $('#ly-list').innerHTML = '<div class="empty">Nessuna riga</div>'; return; }
    const sh = Ls.slice(0, lyLimit), more = Ls.length > lyLimit ? `<div class="more-row"><button class="btn sm" id="ly-more">Mostra tutte (${Ls.length})</button></div>` : '';
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    if (isDesk()) $('#ly-list').innerHTML = `<div class="tr-tw"><table class="tbl gl-st tr-tbl ly-rt"><thead><tr><th>Data</th><th>Fattura</th><th>Descrizione</th><th>Categoria</th><th>Centro di costo</th><th class="r">Q.tà</th><th class="r">Prezzo</th><th class="r">Importo</th></tr></thead><tbody>
      ${sh.map(r => `<tr data-lyrow="${esc(r.id)}"${(r.cdc || LY_NONE) === LY_NONE ? ' class="ly-na"' : ''}><td class="d">${dd(r.data)}</td><td class="m2">${esc(r.fattura)}</td><td><b>${esc(r.descrizione)}</b><small class="tr-nt">${esc([r.codice, r.ordine ? 'ordine ' + r.ordine : '', r.richiedente].filter(Boolean).join(' · '))}</small></td><td class="m2">${esc(r.categoria || '—')}</td><td>${(r.cdc || LY_NONE) === LY_NONE ? '<span class="chip late">Da attribuire</span>' : esc(lyName(r.cdc))}</td><td class="num">${qtyFmt(num(r.quantita))} <small class="muted">${esc(String(r.um || '').toLowerCase())}</small></td><td class="num">${eurP(num(r.prezzo) * lyMulR(r))}</td><td class="num amt${num(r.importo) < 0 ? ' ly-neg' : ''}">${eur(lyV(r))}</td></tr>`).join('')}</tbody></table></div>${more}`;
    else $('#ly-list').innerHTML = `<div class="list">${sh.map(r => `<div class="item" data-lyrow="${esc(r.id)}"><span class="ic ly-ic${(r.cdc || LY_NONE) === LY_NONE ? ' na' : ''}"><svg viewBox="0 0 24 24">${LY_IC}</svg></span><div class="main"><div class="t">${esc(r.descrizione)}</div><div class="s">${esc(lyName(r.cdc))} · ${qtyFmt(num(r.quantita))} ${esc(String(r.um || '').toLowerCase())} · ${dd(r.data)}</div></div><div class="amt${num(r.importo) < 0 ? ' ly-neg' : ''}">${eur(lyV(r))}</div></div>`).join('')}</div>${more}`;
  }
  const LY_IC = '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>';

  /* ---------- fattura: dettaglio e attribuzione ai centri di costo ---------- */
  function lyDocDetail(id) {
    const D = lyDocList(lyDocRows(id))[0]; if (!D) return;
    const C = lyCdcList(), ccOpt = sel => C.map(c => `<option value="${esc(c.cod)}"${c.cod === sel ? ' selected' : ''}>${esc(c.n)}${c.cod === LY_NONE ? '' : ' · ' + esc(c.cod)}</option>`).join('');
    const rows = D.rows.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
    openSheet(`${lyTipoLbl(D.tipo)} n. ${D.id}`, `
      <div class="kv">${[['Data', validD(D.data) ? shortDate(D.data) : '—'], ['Tipo', `${D.tipo || '—'} · ${D.d.descrizione || lyTipoLbl(D.tipo)}`], ['Ordini Lyreco', D.ordini.join(', ') || '—'], ['DDT', D.ddt.join(', ') || '—'], ['Sede di consegna in fattura', rows.find(r => r.sede) ? rows.find(r => r.sede).sede : 'non indicata']].map(([a, b]) => `<div><span>${a}</span><strong>${esc(String(b))}</strong></div>`).join('')}</div>
      <div class="iva-sum" style="margin-top:14px"><div><span>Imponibile</span><b>${esc(eur(D.imp))}</b></div><div><span>IVA</span><b>${esc(eur(D.tot - D.imp))}</b></div><div class="t"><span>Totale documento</span><b>${esc(eur(D.tot))}</b></div></div>
      <div class="fa-chk ${Math.abs(D.diff) <= .009 ? 'ok' : 'ko'}"><b>${Math.abs(D.diff) <= .009 ? 'Le righe quadrano con la fattura' : 'Le righe non quadrano con la fattura'}</b><span>${rows.length} ${rows.length === 1 ? 'riga' : 'righe'} per ${esc(eur(D.sumN))}${Math.abs(D.diff) > .009 ? ` · differenza ${esc(eur(D.diff))}` : ''}</span></div>
      <div class="ly-all"><label class="f"><span>Centro di costo per tutta la fattura</span><select id="ly-all">${ccOpt(D.mixed ? '' : D.cdc)}${D.mixed ? '<option value="" selected>— righe su più centri —</option>' : ''}</select></label><button type="button" class="btn sm" id="ly-allgo">Applica a tutte le righe</button></div>
      <div class="ly-rows"><div class="ly-rh"><span>Articolo</span><span>Importo</span><span>Centro di costo</span></div>
        ${rows.map(r => `<div class="ly-rr"><span><b>${esc(r.descrizione)}</b><small>${esc(r.codice || '')} · ${qtyFmt(num(r.quantita))} ${esc(String(r.um || '').toLowerCase())} × ${esc(eurP(num(r.prezzo)))} · ${esc(r.categoria || '')}</small></span><span class="${num(r.importo) < 0 ? 'ly-neg' : ''}">${esc(eur(num(r.importo)))}</span><select data-lyr="${esc(r.id)}">${ccOpt(r.cdc || LY_NONE)}</select></div>`).join('')}</div>
      <label class="f" style="margin-top:12px"><span>Note sulla fattura</span><input id="ly-dnote" value="${esc(D.d.note || '')}" placeholder="facoltative"></label>
      <div class="row-btns" style="margin-top:6px">${D.d.pdf ? '<button type="button" class="btn sm" id="ly-dopen">Apri PDF</button>' : ''}${!isLocal() ? `<button type="button" class="btn sm" id="ly-dpdf">${D.d.pdf ? 'Sostituisci PDF' : 'Allega PDF della fattura'}</button>` : ''}</div>`,
      () => {
        const ops = [];
        $$('#sheet-body [data-lyr]').forEach(s => { const r = rows.find(x => x.id === s.dataset.lyr); if (r && (r.cdc || LY_NONE) !== s.value) ops.push({ action: 'upsert', sheet: 'Lyreco', row: { ...r, cdc: s.value } }); });
        const note = $('#ly-dnote').value.trim();
        if (note !== String(D.d.note || '')) ops.push({ action: 'upsert', sheet: 'LyrecoFatture', row: { ...lyDocMeta(D), note } });
        if (!ops.length) return true;
        write(ops); toast(`Fattura aggiornata${ops.filter(o => o.sheet === 'Lyreco').length ? ` · ${ops.filter(o => o.sheet === 'Lyreco').length} righe riassegnate` : ''}`); return true;
      }, null, 'Salva');
    $('#ly-allgo').onclick = () => { const v = $('#ly-all').value; if (!v) return; $$('#sheet-body [data-lyr]').forEach(s => { s.value = v; }); toast(`Tutte le righe su ${lyName(v)}: premi Salva`); };
    $('#ly-all').onchange = () => $('#ly-allgo').click();
    const op = $('#ly-dopen'); if (op) op.onclick = () => openDoc(D.d.pdf, `Lyreco ${D.id}`);
    const up = $('#ly-dpdf'); if (up) up.onclick = async () => {
      if (!lyOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.6)');
      let file; try { file = await pickDoc(); } catch (e) { if (e.message !== 'annullato') toast(e.message); return; }
      try { busy('Salvo il PDF nel tuo Drive…'); const pdf = await api('uploadDoc', { name: `Lyreco ${D.id} ${D.data}.${file.ext}`, mime: file.mime, data: file.data }); busy(); write([{ action: 'upsert', sheet: 'LyrecoFatture', row: { ...lyDocMeta(D), pdf } }]); closeSheet(); toast('PDF allegato alla fattura'); }
      catch (e) { busy(); if (!(e instanceof AuthError)) toast('PDF non salvato: ' + e.message); }
    };
  }
  const lyDocMeta = D => ({ id: D.id, tipo: D.tipo, data: D.data, descrizione: D.d.descrizione || lyTipoLbl(D.tipo), imponibile: D.d.imponibile !== '' && D.d.imponibile != null ? D.d.imponibile : D.imp, totale: D.d.totale !== '' && D.d.totale != null ? D.d.totale : D.tot, stato: D.d.stato || '', pagata: D.d.pagata || '', pdf: D.d.pdf || '', note: D.d.note || '' });
  function lyRowForm(r) {
    const C = lyCdcList();
    openSheet('Riga fattura ' + r.fattura, `
      <div class="kv">${[['Articolo', r.descrizione], ['Codice', r.codice || '—'], ['Categoria', r.categoria || '—'], ['Quantità', `${qtyFmt(num(r.quantita))} ${r.um || ''}`], ['Prezzo unitario', eurP(num(r.prezzo))], ['Importo', eur(num(r.importo))], ['Ordine / DDT', [r.ordine, r.ddt].filter(Boolean).join(' · ') || '—'], ['Richiedente', r.richiedente || '—']].map(([a, b]) => `<div><span>${a}</span><strong>${esc(String(b))}</strong></div>`).join('')}</div>
      <div class="f-row" style="margin-top:14px"><label class="f"><span>Centro di costo</span><select name="cdc">${C.map(c => `<option value="${esc(c.cod)}"${c.cod === (r.cdc || LY_NONE) ? ' selected' : ''}>${esc(c.n)}</option>`).join('')}</select></label><label class="f"><span>Categoria</span><input name="categoria" value="${esc(r.categoria || '')}" list="ly-catl"></label></div>
      <datalist id="ly-catl">${[...new Set(lyRows().map(x => x.categoria).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <label class="f"><span>Note</span><input name="note" value="${esc(r.note || '')}"></label>
      <div class="row-btns"><button type="button" class="btn sm" data-lydoc="${esc(r.fattura)}">Apri tutta la fattura</button></div>`,
      fd => { write([{ action: 'upsert', sheet: 'Lyreco', row: { ...r, cdc: String(fd.get('cdc')), categoria: String(fd.get('categoria') || '').trim(), note: String(fd.get('note') || '').trim() } }]); toast('Riga aggiornata'); return true; });
  }

  /* ---------- anagrafica centri di costo ---------- */
  function lyCdcForm() {
    const L = JSON.parse(JSON.stringify(lyCdcList()));
    const used = cod => lyRows().filter(r => (r.cdc || LY_NONE) === cod).length;
    const provs = Object.keys((window.GLS_GEO || { PROV: {} }).PROV).sort();
    const row = (c, i) => `<div class="ly-cr" data-i="${i}"><input data-c="cod" value="${esc(c.cod || '')}" placeholder="CDC08"${c.cod === LY_NONE ? ' readonly' : ''}><input data-c="n" value="${esc(c.n || '')}" placeholder="Nome"><input data-c="tipo" value="${esc(c.tipo || '')}" placeholder="Tipologia" list="ly-tipl"><input data-c="citta" value="${esc(c.citta || '')}" placeholder="Città"><select data-c="prov"><option value="">Prov.</option>${provs.map(p => `<option${p === String(c.prov || '').toUpperCase() ? ' selected' : ''}>${p}</option>`).join('')}</select><input data-c="key" value="${esc(c.key || '')}" placeholder="Sede in fattura Lyreco" class="ly-ck" title="Sede di consegna come la scrive Lyreco"><input data-c="loc" value="${esc(c.loc || '')}" placeholder="Località Amazon: parole o CAP separati da |" class="ly-ck ly-ck2" title="Es. CALDERARA|BARGELLINO|40012">${c.cod === LY_NONE || used(c.cod) ? `<small class="ly-cu">${used(c.cod) ? used(c.cod) + ' righe' : 'fisso'}</small>` : '<button type="button" class="icon-btn tr-lx" data-cdel aria-label="Togli">×</button>'}</div>`;
    openSheet('Centri di costo (Lyreco e Amazon)', `<p class="muted small" style="margin:0 0 12px">Città e provincia mettono il piazzale sulla mappa. «Sede in fattura Lyreco» e «Località Amazon» servono all'importazione per riconoscere il centro di costo (per Amazon scrivi parole o CAP della località di consegna separati da |).</p>
      <div class="ly-ch"><span>Codice</span><span>Nome</span><span>Tipologia</span><span>Città</span><span>Prov.</span></div>
      <div id="ly-cl">${L.map(row).join('')}</div>
      <button type="button" class="btn sm" id="ly-cadd" style="margin-top:10px">+ Centro di costo</button>
      <datalist id="ly-tipl"><option value="Sede"><option value="Sede operativa"><option value="Magazzino"><option value="Piazzale"></datalist>`,
      () => {
        const out = []; let err = '';
        $$('#ly-cl .ly-cr').forEach(el => {
          const g = k => $(`[data-c="${k}"]`, el).value.trim(), cod = g('cod').toUpperCase(); if (!cod) return;
          if (out.some(x => x.cod === cod)) { err = `Codice ${cod} ripetuto`; return; }
          const o = L[+el.dataset.i] || {}, citta = g('citta'), prov = g('prov');
          const geo = o.geo && citta === (o.citta || '') && prov === (o.prov || '') ? o.geo : null;
          out.push({ cod, n: g('n') || cod, tipo: g('tipo'), ind: o.ind || '', key: g('key'), loc: g('loc'), citta, prov, geo });
        });
        if (err) return toast(err);
        if (!out.some(x => x.cod === LY_NONE)) out.push(LY_CDC_DEF.find(x => x.cod === LY_NONE));
        setConfig('lyCdc', out); lyAnim = true; toast('Centri di costo salvati'); return true;
      }, null, 'Salva');
    $('#sheet-form').classList.add('wide', 'xwide');
    $('#ly-cadd').onclick = () => { L.push({ cod: '', n: '', tipo: 'Magazzino', citta: '', prov: '', key: '' }); $('#ly-cl').insertAdjacentHTML('beforeend', row(L[L.length - 1], L.length - 1)); const l = $$('#ly-cl [data-c="cod"]'); l[l.length - 1].focus(); };
    $('#ly-cl').onclick = e => { const x = e.target.closest('[data-cdel]'); if (x) x.closest('.ly-cr').remove(); };
  }

  /* ---------- importazione / esportazione ---------- */
  const lyDate = v => v instanceof Date ? ymd(new Date(v.getTime() + 12 * 36e5)) : typeof v === 'number' && v > 20000 ? ymd(new Date(Math.round((v - 25569) * 864e5))) : (() => { const m = String(v || '').trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/); return m ? `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad(m[2])}-${pad(m[1])}` : validD(v) ? String(v).slice(0, 10) : ''; })();
  const lyIva = v => { const s = String(v ?? '').trim(); if (/N6|rev|esent|N\d/i.test(s)) return 0; const n = num(s); return n > 1 ? n / 100 : n || (s === '' ? .22 : 0); };
  const lyTxt = v => v == null ? '' : v instanceof Date ? ymd(v) : String(v).trim();
  function lyParse(wb) {
    const U = XLSX.utils, sheets = wb.SheetNames.map(n => ({ n, a: U.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' }) }));
    const find = (test) => { for (const s of sheets) { const hi = s.a.findIndex(test); if (hi >= 0) return { ...s, hi }; } return null; };
    const det = find(r => r.some(c => /^fattura/.test(nh(c))) && r.some(c => /^imponibile$/.test(nh(c)) || nh(c) === 'importo') && r.some(c => /^descrizione/.test(nh(c))));
    if (!det) throw new Error('Non trovo il foglio «Dettaglio righe» (colonne Fattura n., Descrizione, Imponibile)');
    const H = det.a[det.hi].map(nh), col = (...re) => { for (const x of re) { const i = H.findIndex(h => x.test(h)); if (i >= 0) return i; } return -1; };
    const C = { f: col(/^fattura/), t: col(/^tipodoc/), dt: col(/^descrtipo/), d: col(/^datafattura/, /^data$/), o: col(/^nordine/, /^ordine/), ddt: col(/^ddt/), dd: col(/^dataddt/), ri: col(/^richiedente/), co: col(/^codarticolo/, /^codice$/), de: col(/^descrizione/), ca: col(/^categoria/), q: col(/^qta/, /^quantita/), um: col(/^um$/), p: col(/^prezzo/), im: col(/^imponibile$/, /^importo/), iva: col(/^iva$/), se: col(/^sede/), cdc: col(/^cdc$/), no: col(/^note/) };
    const g = (r, i) => i >= 0 ? r[i] : '';
    // anagrafica
    const an = find(r => r.some(c => /^codicecdc$/.test(nh(c))));
    let cdcs = JSON.parse(JSON.stringify(lyCdcList()));
    if (an) {
      const AH = an.a[an.hi].map(nh), ai = re => AH.findIndex(h => re.test(h));
      const c = { cod: ai(/^codicecdc/), n: ai(/^centrodicosto/), t: ai(/^tipologia/), ind: ai(/^indirizzo/), key: ai(/^testo/) };
      an.a.slice(an.hi + 1).forEach(r => { const cod = String(r[c.cod] ?? '').trim().toUpperCase(); if (!/^[A-Z0-9]{2,}$/.test(cod)) return; const ex = cdcs.find(x => x.cod === cod), def = LY_CDC_DEF.find(x => x.cod === cod) || {}; const o = { ...def, ...(ex || {}), cod, n: String(r[c.n] ?? '').trim() || (ex || def).n || cod, tipo: String(r[c.t] ?? '').trim() || (ex || def).tipo || '', ind: String(r[c.ind] ?? '').trim() || (ex || def).ind || '', key: String(r[c.key] ?? '').replace(/^\(.*\)$/, '').trim() || (ex || def).key || '' }; if (ex) Object.assign(ex, o); else cdcs.push(o); });
    }
    const byKey = s => { const k = String(s || '').trim().toUpperCase(); if (!k) return ''; const c = cdcs.find(x => x.key && (k === x.key.toUpperCase() || k.startsWith(x.key.toUpperCase()) || x.key.toUpperCase().startsWith(k))); return c ? c.cod : ''; };
    const old = new Map(lyRows().map(r => [r.id, r])), seq = {}, rows = [];
    det.a.slice(det.hi + 1).forEach(r => {
      const f = lyTxt(g(r, C.f)); if (!f || !/\d/.test(f) || /^totale/i.test(f)) return;
      const de = lyTxt(g(r, C.de)); if (!de && !num(g(r, C.im))) return;
      seq[f] = (seq[f] || 0) + 1;
      const id = `${f}-${String(seq[f]).padStart(3, '0')}`, sede = lyTxt(g(r, C.se));
      let cdc = String(lyTxt(g(r, C.cdc))).toUpperCase() || byKey(sede) || LY_NONE;
      const ex = old.get(id); if (ex && cdc === LY_NONE && ex.cdc && ex.cdc !== LY_NONE) cdc = ex.cdc; // non perdere le attribuzioni fatte nell'app
      const ivaS = lyTxt(g(r, C.iva));
      rows.push({ id, fattura: f, tipo: lyTxt(g(r, C.t)), data: lyDate(g(r, C.d)), ddt: lyTxt(g(r, C.ddt)), dataDdt: lyDate(g(r, C.dd)) || lyTxt(g(r, C.dd)), ordine: lyTxt(g(r, C.o)), richiedente: lyTxt(g(r, C.ri)), codice: lyTxt(g(r, C.co)), descrizione: de, categoria: lyTxt(g(r, C.ca)), quantita: num(g(r, C.q)), um: lyTxt(g(r, C.um)), prezzo: num(g(r, C.p)), importo: num(g(r, C.im)), iva: lyIva(ivaS), sede, cdc, note: [lyTxt(g(r, C.no)), /N6|rev/i.test(ivaS) ? 'inversione contabile (N6.6)' : ''].filter(Boolean).join(' · ') || (ex ? ex.note || '' : '') });
    });
    if (!rows.length) throw new Error('Nessuna riga trovata nel foglio di dettaglio');
    // documenti (quadratura)
    const docs = new Map(), oldD = new Map(lyDocs().map(d => [String(d.id), d]));
    const cf = find(r => r.some(c => /^fattura/.test(nh(c))) && r.some(c => /^imponibiledapdf|^imponibile/.test(nh(c))) && r.some(c => /^totaledocumento/.test(nh(c))));
    if (cf) {
      const FH = cf.a[cf.hi].map(nh), fi = re => FH.findIndex(h => re.test(h));
      const c = { f: fi(/^fattura/), t: fi(/^tipodoc/), d: fi(/^data$/), de: fi(/^descrtipo/), imp: fi(/^imponibile/), tot: fi(/^totaledocumento/) };
      cf.a.slice(cf.hi + 1).forEach(r => { const f = lyTxt(r[c.f]); if (!f || !/^\d/.test(f)) return; const o = oldD.get(f) || {}; docs.set(f, { ...o, id: f, tipo: lyTxt(r[c.t]), data: lyDate(r[c.d]), descrizione: lyTxt(r[c.de]), imponibile: num(r[c.imp]), totale: num(r[c.tot]), stato: o.stato || '', pagata: o.pagata || '', pdf: o.pdf || '', note: o.note || '' }); });
    }
    [...groupBy(rows, r => r.fattura)].forEach(([f, v]) => { if (docs.has(f)) return; const o = oldD.get(f) || {}; docs.set(f, { ...o, id: f, tipo: v[0].tipo, data: v[0].data, descrizione: o.descrizione || lyTipoLbl(v[0].tipo), imponibile: r2(v.reduce((a, r) => a + r.importo, 0)), totale: r2(v.reduce((a, r) => a + r.importo * (1 + r.iva), 0)), stato: o.stato || '', pagata: o.pagata || '', pdf: o.pdf || '', note: o.note || '' }); });
    return { rows, docs: [...docs.values()], cdcs };
  }
  async function importLy() {
    if (!lyOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.6)');
    let file; try { file = await pickFile('.xlsx,.xls'); } catch { return; }
    try {
      busy('Leggo il file Lyreco…'); await loadXlsx();
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const P = lyParse(wb); busy();
      const ids = new Set(lyRows().map(r => r.id)), nuove = P.rows.filter(r => !ids.has(r.id)).length;
      const na = P.rows.filter(r => r.cdc === LY_NONE).length, tot = P.rows.reduce((a, r) => a + r.importo, 0);
      if (!confirm(`${P.docs.length} documenti · ${P.rows.length} righe · ${eur(tot)} di imponibile.\n${nuove} righe nuove, ${P.rows.length - nuove} già presenti (aggiornate, senza perdere i centri di costo assegnati nell'app).\n${na ? na + ' righe senza sede di consegna: le trovi in «Da attribuire».' : 'Tutte le righe hanno un centro di costo.'}\nImportare?`)) return;
      const keep = new Set(P.rows.map(r => r.fattura)), stale = lyRows().filter(r => keep.has(String(r.fattura)) && !P.rows.some(x => x.id === r.id));
      write([...P.rows.map(row => ({ action: 'upsert', sheet: 'Lyreco', row })), ...stale.map(r => ({ action: 'delete', sheet: 'Lyreco', id: r.id })), ...P.docs.map(row => ({ action: 'upsert', sheet: 'LyrecoFatture', row })), { action: 'upsert', sheet: 'Config', row: { chiave: 'lyCdc', valore: JSON.stringify(P.cdcs) } }]);
      lyP = ''; lyAnim = true; render(); toast(`Lyreco: ${P.rows.length} righe importate`);
    } catch (e) { busy(); toast(e.message); }
  }
  async function exportLy() {
    const rows = lyRows().filter(lyIn).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.id).localeCompare(String(b.id)));
    if (!rows.length) return toast('Nessun dato da esportare');
    try {
      busy('Preparo il file Excel…'); await loadXlsx();
      const U = XLSX.utils, wb = U.book_new(), E = '#,##0.00 "€"', PL = lyPlist(rows).filter(x => x.rows.length);
      const cats = [...new Set(rows.map(r => r.categoria || 'Altro'))];
      const s1 = [['Codice', 'Centro di costo', ...cats, 'Totale €', '% sul totale', 'N. righe'], ...PL.map(p => [p.cod, p.n, ...cats.map(c => r2(lySumN(p.rows.filter(r => (r.categoria || 'Altro') === c)))), lySumN(p.rows), lySumN(rows) ? lySumN(p.rows) / lySumN(rows) : 0, p.rows.length]), ['', 'TOTALE', ...cats.map(c => lySumN(rows.filter(r => (r.categoria || 'Altro') === c))), lySumN(rows), 1, rows.length]];
      const w1 = U.aoa_to_sheet(s1); for (let R = 2; R <= s1.length; R++) { for (let c = 2; c < cats.length + 3; c++) { const x = w1[xlC(c) + R]; if (x) x.z = E; } const p = w1[xlC(cats.length + 3) + R]; if (p) p.z = '0.0%'; }
      w1['!cols'] = [9, 24, ...cats.map(() => 15), 13, 10, 8].map(w => ({ wch: w })); U.book_append_sheet(wb, w1, 'Riepilogo CdC');
      const months = [...new Set(rows.map(r => String(r.data).slice(0, 7)))].sort();
      const s2 = [['Codice', 'Centro di costo', ...months.map(m => mLabel(m)), 'Totale €'], ...PL.map(p => [p.cod, p.n, ...months.map(m => lySumN(p.rows.filter(r => String(r.data).slice(0, 7) === m))), lySumN(p.rows)])];
      const w2 = U.aoa_to_sheet(s2); for (let R = 2; R <= s2.length; R++) for (let c = 2; c < months.length + 3; c++) { const x = w2[xlC(c) + R]; if (x) x.z = E; }
      w2['!cols'] = [9, 24, ...months.map(() => 13), 13].map(w => ({ wch: w })); U.book_append_sheet(wb, w2, 'CdC per mese');
      const s3 = [['Fattura n.', 'Tipo doc.', 'Data fattura', 'N. ordine Lyreco', 'DDT n.', 'Data DDT', 'Richiedente (Vs.Ord.)', 'Cod. articolo', 'Descrizione', 'Categoria', 'Q.tà', 'UM', 'Prezzo unit.', 'Imponibile €', 'IVA', 'Sede consegna (da fattura)', 'CdC', 'Centro di costo', 'Note'], ...rows.map(r => [r.fattura, r.tipo, validD(r.data) ? parseD(r.data) : '', r.ordine, r.ddt, r.dataDdt, r.richiedente, r.codice, r.descrizione, r.categoria, num(r.quantita), r.um, num(r.prezzo), num(r.importo), num(r.iva) ? fmtNum(num(r.iva) * 100, 2) : 'N6.6 (rev. charge)', r.sede, r.cdc || LY_NONE, lyName(r.cdc), r.note || ''])];
      const w3 = U.aoa_to_sheet(s3, { cellDates: true }); rows.forEach((r, i) => { const R = i + 2, d = w3['C' + R]; if (d && d.t === 'd') d.z = 'dd/mm/yyyy'; ['M', 'N'].forEach(c => { const x = w3[c + R]; if (x) x.z = E; }); });
      w3['!cols'] = [12, 8, 11, 13, 9, 11, 14, 11, 44, 24, 6, 5, 11, 12, 10, 40, 8, 22, 24].map(w => ({ wch: w })); w3['!autofilter'] = { ref: `A1:S${s3.length}` }; U.book_append_sheet(wb, w3, 'Dettaglio righe');
      const D = lyDocList(rows).slice().reverse();
      const s4 = [['Fattura n.', 'Tipo doc.', 'Data', 'Descr. tipo', 'Imponibile da PDF €', 'Totale documento €', 'Somma righe €', 'Differenza €', 'CdC prevalente', 'N. righe'], ...D.map(d => [d.id, d.tipo, validD(d.data) ? parseD(d.data) : '', d.d.descrizione || lyTipoLbl(d.tipo), d.imp, d.tot, d.sumN, d.diff, d.cdc, d.rows.length])];
      const w4 = U.aoa_to_sheet(s4, { cellDates: true }); D.forEach((d, i) => { const R = i + 2, x = w4['C' + R]; if (x && x.t === 'd') x.z = 'dd/mm/yyyy'; ['E', 'F', 'G', 'H'].forEach(c => { const y = w4[c + R]; if (y) y.z = E; }); });
      w4['!cols'] = [12, 8, 11, 26, 16, 16, 14, 12, 12, 8].map(w => ({ wch: w })); U.book_append_sheet(wb, w4, 'Controllo fatture');
      const s5 = [['Codice CdC', 'Centro di costo', 'Tipologia', 'Indirizzo di consegna', 'Testo in fattura (chiave di attribuzione)', 'Città', 'Provincia'], ...lyCdcList().map(c => [c.cod, c.n, c.tipo || '', c.ind || '', c.key || '', c.citta || '', c.prov || ''])];
      const w5 = U.aoa_to_sheet(s5); w5['!cols'] = [11, 24, 14, 50, 52, 14, 9].map(w => ({ wch: w })); U.book_append_sheet(wb, w5, 'Anagrafica CdC');
      XLSX.writeFile(wb, `Centro_di_costo_Lyreco_${lyP || 'completo'}.xlsx`); busy(); toast('Excel scaricato');
    } catch (e) { busy(); toast(e.message); }
  }
  const xlC = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  function lyArt() {
    // fogli e scatole stilizzati (cancelleria), senza mezzi disegnati
    return `<svg viewBox="300 0 340 260" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" class="gh-svg ly-svg">
      <defs><pattern id="lydots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" opacity=".12"/></pattern></defs>
      <rect x="300" width="340" height="260" fill="url(#lydots)"/>
      <g class="ly-p p1" style="--d:120ms"><rect x="470" y="40" width="118" height="150" rx="12"/></g>
      <g class="ly-p p2" style="--d:260ms"><rect x="448" y="58" width="118" height="150" rx="12"/>${[88, 104, 120, 136].map((y, i) => `<line x1="466" x2="${i === 3 ? 520 : 546}" y1="${y}" y2="${y}"/>`).join('')}<rect class="ly-tag" x="466" y="160" width="52" height="22" rx="11"/></g>
      <g class="ly-p p3" style="--d:420ms"><rect x="540" y="150" width="64" height="64" rx="12"/><path d="M556 178 h32 M572 162 v32"/></g>
    </svg>`;
  }

  /* =========================================================
     AMAZON · ordini e articoli ripartiti per centro di costo (località di consegna)
     ========================================================= */
  const AM_CAT = [
    ['Pile e batterie', /DURACELL|\bPILE\b|BATTERIE \(|LITHIUM/],
    ['TV, foto e multimedia', /SMART TV|OLED|SHIELD TV|APPLE TV|OSMO|FOTOCAMERA STABILIZZ|TOP GUN|BLU-?RAY|\bBD\b/],
    ['Informatica e telefonia', /NOTEBOOK|LAPTOP|MONITOR|\bSSD\b|TABLET|GALAXY TAB|MOUSE|TASTIER|HDMI|DISPLAYPORT|DISPLAYLINK|\bUSB\b|HUB|ALIMENTATORE PER HP|\bUPS\b|CONTINUIT|PENDRIVE|BLUETOOTH|AURICOLAR|CUFFI|AIRPODS|EPOS|SENNHEISER|SMARTPHONE|GALAXY A\d|IPHONE|SAMSUNG|CARICA|CAVO|BARCODE|CODICI A BARRE|WALKIE|RICETRASMITT|HOME ASSISTANT|SPLITTER|ADATTATORE|ETHERNET/],
    ['Elettrodomestici', /LAVATRICE|FRIGORIFERO|FRIGO|CUCINA A GAS|FORNO|RAFFREDDAMENTO/],
    ['Illuminazione e videosorveglianza', /LAMPIONE|TUBI LED|\bLED\b|VIDEOCITOFONO|TELECAMERA|FARO/],
    ['Attrezzatura e ricambi auto', /CHIAVE|TELECOMANDO|FIAT|TELE ?PASS|AUTOSTRADA PASS|TEXA|GRASSO|INDUZIONE|COMPRESSORE|PINZA|CAPICORDA|RILEVATORE GAS|CUT OFF|ISOLATORE|SPATOLA|PELLICOL|RYOBI|DUAL LOCK|VHB|BIADESIV|RACCOGLI ?CAVI|SPAZZOLA TELESCOPICA/],
    ['DPI e sicurezza', /ANTINFORTUN|GUANTI|ELMETT|OCCHIALI PROTETT/],
    ['Arredo e ufficio', /SEDIA|POLTRONA|BACHECA|PARAVENTO|DIVISORIO|CASSETTIER|PORTA ETICHETTE|PORTA CARTELLINI|DYMO|BUSTE|POUF|APPENDI|GRUCCE|FERMAPORTA|PORTAROTOLO|POSACENERE|BOTTIGLIE|ELASTICO|SUPPORTO DOPPIO/],
    ['Biancheria e casa', /PIUMONE|PIUMINO|CUSCINI|GUANCIAL|TENDA DA DOCCIA|BEDDING|LENZUOL|TRAPUNTA/],
    ['Pulizia e igiene', /PULIZIA|TAMPONI|ISOPROPIL|DEODORANTE|AIR ?WICK|BAYGON|ANTIZANZAR|ANTI MOSCHE|DETERG/],
    ['Abbigliamento', /POCHETTE|FAZZOLETTO|FOULARD|CRAVAT|POCKET SQUARE/]
  ];
  const amCatOf = d => { const t = String(d || '').toUpperCase(); const c = AM_CAT.find(([, re]) => re.test(t)); return c ? c[0] : 'Altro'; };
  const AM_CHECK = /SMART TV|OLED|AIRPODS|APPLE TV|SHIELD TV|OSMO|TOP GUN|BLU-?RAY|POCHETTE|FOULARD|FAZZOLETTO DA TASCHINO|PIUMONE|CUSCINI LETTO/;
  let amP = '', amAnim = true, amF = { q: '', cdc: '', cat: '', vend: '' }, amLimit = 40, amOrdLimit = 12, amOrdF = '', amArtQ = '';
  const amOrd = () => db.amazon || [];
  const amArtAll = () => db.amazonart || [];
  const amOk = () => isLocal() || !db.v || db.v >= 'cdc-1.7';
  const amNet = o => o.imponibile !== '' && o.imponibile != null && num(o.imponibile) ? num(o.imponibile) : r2(num(o.totale) / 1.22);
  const amV = o => ivaOn ? num(o.totale) : amNet(o);
  const amSum = arr => r2(arr.reduce((a, o) => a + amV(o), 0));
  const amSumN = arr => r2(arr.reduce((a, o) => a + amNet(o), 0));
  const amEst = o => o.ivaTipo === 'stimata';
  const amMonths = () => [...new Set(amOrd().map(o => String(o.data).slice(0, 7)).filter(k => /^\d{4}-\d\d$/.test(k)))].sort();
  const amIn = o => !amP || String(o.data).slice(0, 7) === amP;
  const amNorm = s => String(s || '').toUpperCase().replace(/[’'`]/g, ' ').replace(/\s+/g, ' ').trim();
  const amCdcOf = loc => { const L = amNorm(loc); if (!L) return LY_NONE; const c = lyCdcList().find(x => String(x.loc || '').split('|').map(amNorm).filter(Boolean).some(k => L.includes(k))); return c ? c.cod : LY_NONE; };
  const amPrivate = d => !/S\.?R\.?L|S\.?P\.?A|SOLUZIONE|LOGISTIC|SRL|SPA|S\.N\.C|SAS|SOCIET/i.test(String(d || ''));
  // articoli con il valore ripartito sull'imponibile (o sul totale) dell'ordine: comprende spedizione e sconti
  function amArts(orders) {
    const om = new Map(orders.map(o => [String(o.id), o])), by = groupBy(amArtAll().filter(a => om.has(String(a.ordine))), a => String(a.ordine));
    const out = [];
    by.forEach((v, k) => { const o = om.get(k), s = v.reduce((x, a) => x + num(a.importo), 0); v.forEach(a => { const sh = s ? num(a.importo) / s : 1 / v.length; out.push({ ...a, cdc: o.cdc || LY_NONE, data: o.data, net: r2(amNet(o) * sh), val: r2(amV(o) * sh), cat: a.categoria || amCatOf(a.descrizione) }); }); });
    return out;
  }

  /* ---------- controlli ---------- */
  function amChecks(O, A) {
    const C = [];
    const na = O.filter(o => (o.cdc || LY_NONE) === LY_NONE);
    if (na.length) C.push({ t: 'warn', h: 'Ordini senza centro di costo', d: `${na.length} ordini hanno una località di consegna che non corrisponde a nessun piazzale (${[...new Set(na.map(o => esc(o.localita)))].slice(0, 3).join(', ')}). Apri l'ordine e scegli il centro, oppure aggiungi la località in «Centri di costo».`, v: eur(amSum(na)), act: 'amna' });
    const est = O.filter(amEst);
    if (est.length) C.push({ t: 'warn', h: 'Imponibile stimato (IVA non riportata da Amazon)', d: `In ${est.length} ordini Amazon non indica l'IVA: l'imponibile è calcolato al 22%. Scarica le fatture da Amazon Business e correggi l'IVA nell'ordine per avere i numeri esatti.`, v: eur(est.reduce((a, o) => a + num(o.totale), 0)) + ' pagati', act: 'amest' });
    const z = O.filter(o => !amEst(o) && o.ivaTipo !== 'fattura' && num(o.totale) > 0 && Math.abs(num(o.totale) - num(o.imponibile)) < .01);
    if (z.length) C.push({ t: 'warn', h: 'Ordini con IVA a zero', d: `${z.length} ordini riportano IVA 0 (${z.slice(0, 2).map(o => esc(String(o.articoli).split(/[,(]/)[0].slice(0, 30)) + ' · ' + esc(String(o.venditore).split(',')[0])).join('; ')}): probabilmente l'imponibile comprende già l'IVA. Controlla la fattura e correggi l'imponibile nell'ordine.`, v: eur(z.reduce((a, o) => a + num(o.totale), 0)), ids: z.map(o => o.id) });
    const priv = O.filter(o => amPrivate(o.destinatario));
    if (priv.length) C.push({ t: 'info', h: 'Ordini intestati a persone', d: `${priv.length} ordini hanno come destinatario una persona (${[...new Set(priv.map(o => esc(o.destinatario)))].slice(0, 3).join(', ')}): verifica che siano acquisti aziendali.`, v: eur(amSum(priv)), ids: priv.map(o => o.id) });
    const card = O.filter(o => /card|carta|visa|master|amex/i.test(o.pagamento || ''));
    if (card.length) C.push({ t: 'info', h: 'Pagati con carta', d: `${card.length} ordini pagati con carta invece che sul conto corrente (${[...new Set(card.map(o => esc(o.pagamento)))].join(', ')}).`, v: eur(card.reduce((a, o) => a + num(o.totale), 0)), ids: card.map(o => o.id) });
    const chk = A.filter(a => AM_CHECK.test(String(a.descrizione || '').toUpperCase()));
    if (chk.length) C.push({ t: 'info', h: 'Acquisti da verificare', d: `${chk.length} articoli di elettronica di consumo o casa (${[...new Set(chk.map(a => esc(String(a.descrizione).split(/[,(]/)[0].slice(0, 32))))].slice(0, 3).join(', ')}…): controlla a quale piazzale o uso sono destinati.`, v: eur(chk.reduce((x, a) => x + a.val, 0)), ids: [...new Set(chk.map(a => a.ordine))] });
    const used = A.filter(a => /usato/i.test(a.condizione || '') || /seconda mano/i.test(a.venditore || ''));
    if (used.length) C.push({ t: 'info', h: 'Articoli usati', d: `${used.length} articoli comprati usati (Amazon Seconda mano): ricorda che la garanzia è ridotta.`, v: eur(used.reduce((x, a) => x + a.val, 0)), ids: [...new Set(used.map(a => a.ordine))] });
    const pv = [...groupBy(A.filter(a => num(a.prezzo) > 0), a => amNorm(a.descrizione).slice(0, 60))].map(([k, v]) => { const p = v.map(a => num(a.prezzo)); return { k, d: v[0].descrizione, min: Math.min(...p), max: Math.max(...p), n: v.length }; }).filter(x => x.n > 1 && x.max / x.min > 1.05).sort((a, b) => (b.max - b.min) - (a.max - a.min));
    if (pv.length) C.push({ t: 'info', h: 'Stesso articolo pagato a prezzi diversi', d: pv.slice(0, 3).map(x => `${esc(String(x.d).split(/[,(]/)[0].slice(0, 40))}: da ${eurP(x.min)} a ${eurP(x.max)}`).join(' · '), v: pv.length + ' articoli', q: String(pv[0].d).split(/[,(]/)[0].slice(0, 30) });
    const FIXc = cfg('amArtFix') || {}, aBy = groupBy(amArtAll(), a => String(a.ordine));
    const mis = O.filter(o => { const v = aBy.get(String(o.id)); if (!v || !v.length) return false; const sm = v.reduce((x, a) => x + num(a.importo), 0), t = num(o.totale); return Math.abs(sm - t) > Math.max(1, t * .02); });
    if (mis.length) C.push({ t: 'info', h: 'Prezzi degli articoli da controllare', d: `In ${mis.length} ordini la somma dei prezzi degli articoli non coincide con il totale pagato (nel file c'erano prezzi di listino, sconti o articoli ripetuti). Apri l'ordine e correggi i prezzi, oppure premi «Adatta i prezzi al totale».${Object.keys(FIXc).length ? ` Già corretti a mano: ${Object.keys(FIXc).length}.` : ''}`, v: mis.length + ' ordini', ids: mis.map(o => o.id) });
    const ship = O.filter(o => num(o.spedizione) > 0);
    if (ship.length) C.push({ t: 'info', h: 'Spese di spedizione', d: `${ship.length} ordini con spedizione a pagamento: con Amazon Business Prime e ordini raggruppati si evitano.`, v: eur(ship.reduce((a, o) => a + num(o.spedizione), 0)), ids: ship.map(o => o.id) });
    return C;
  }

  /* ---------- pagina ---------- */
  function amPlist(O) {
    const by = groupBy(O, o => o.cdc || LY_NONE);
    const list = lyCdcList().map(c => ({ ...c, rows: by.get(c.cod) || [] }));
    [...by.keys()].filter(k => !list.some(c => c.cod === k)).forEach(k => list.push({ cod: k, n: k, tipo: '', rows: by.get(k) }));
    list.forEach(x => { x.t = amSum(x.rows); x.docs = x.rows.length; });
    return list;
  }
  function renderAm() {
    const months = amMonths();
    if (amP && !months.includes(amP)) amP = '';
    $('#am-per').innerHTML = `<option value=""${amP ? '' : ' selected'}>Tutto il periodo</option>` + months.slice().reverse().map(k => `<option value="${k}"${k === amP ? ' selected' : ''}>${esc(mLabel(k))}</option>`).join('');
    const opts = ['', ...months.slice().reverse()], ix = opts.indexOf(amP);
    $('#am-prev').disabled = ix >= opts.length - 1; $('#am-next').disabled = ix <= 0;
    $('#am-ai').hidden = !aiReady();
    sub(`${ivaOn ? 'IVA inclusa (totale pagato)' : 'IVA esclusa'} · ordini Amazon per centro di costo`);
    const all = amOrd(), O = all.filter(amIn);
    const anim = amAnim && !reduced(); amAnim = false;
    const body = $('#am-body'); body.classList.toggle('cc-anim', anim);
    const warn = amOk() ? '' : `<div class="card gl-warn"><b>Aggiorna lo script Google per salvare i dati Amazon.</b><span>Lo script collegato è la versione ${esc(db.v || '—')}: serve la cdc-1.7 (Code.gs nuovo).</span></div>`;
    if (!O.length) {
      body.innerHTML = warn + `<div class="gl-hero am-hero gl-hero-empty"><div class="gh-top"><div class="gh-art">${amArt()}</div><div class="gh-main"><span class="gh-lbl">Ordini Amazon</span><h3>Nessun ordine caricato</h3><p>Scarica il report «Articoli» da Amazon Business (Business Analytics) e importalo così com'è: l'app assegna ogni ordine al piazzale in base alla località di consegna.</p><div class="tr-hb ly-hb"><button class="btn sm" id="am-how" type="button">Come aggiornare da Amazon</button><button class="btn sm" id="am-imp2" type="button">Importa il report</button></div></div></div></div>`;
      return;
    }
    const A = amArts(O), PL = amPlist(O);
    const T = amSum(O), TN = amSumN(O), TT = O.reduce((a, o) => a + num(o.totale), 0);
    const est = O.filter(amEst), na = PL.find(x => x.cod === LY_NONE) || { t: 0, rows: [] };
    const pz = O.reduce((a, o) => a + num(o.pezzi), 0), vend = new Set(O.map(o => amNorm(o.venditore))).size;
    const amzS = amSum(O.filter(o => /^AMAZON/i.test(String(o.venditore || '').trim())));
    const act = PL.filter(x => x.cod !== LY_NONE && x.rows.length);
    const per = amP ? mLabel(amP) : months.length > 1 ? `${mLabel(months[0])} – ${mLabel(months[months.length - 1])}` : months.length ? mLabel(months[0]) : '';
    const prevK = amP ? months[months.indexOf(amP) - 1] : null, PT = prevK ? amSum(all.filter(o => String(o.data).slice(0, 7) === prevK)) : 0;
    const int = v => fmtNum(Math.round(v), 0);
    const K = [
      ['Ordini', O.length, int, `${fmtNum(pz, 0)} pezzi · ${A.length} articoli`],
      ['Totale pagato', TT, eur0, `IVA ${eur0(TT - TN)}`],
      ['Ordine medio', O.length ? T / O.length : 0, eur0, ivaOn ? 'IVA inclusa' : 'imponibile'],
      ['Piazzali serviti', act.length, int, na.rows.length ? `${na.rows.length} ordini da attribuire` : 'tutti attribuiti'],
      ['Imponibile stimato', amSumN(est), eur0, `${est.length} ordini senza IVA`],
      ['Venditori', vend, int, `Amazon diretto ${T ? fmtNum(pct(amzS, T), 0) : 0}%`]
    ];
    const LI = cfg('amLastImport'), lastD = String((amOrd().map(o => o.data).sort().pop()) || ''), age = lastD ? Math.round((parseD(today()) - parseD(lastD)) / 864e5) : 0;
    const upd = `<div class="am-upd${age > 20 ? ' old' : ''}"><span class="am-ud"></span><span class="am-ut"><b>${lastD ? `Ordini fino al ${esc(shortDate(lastD))}` : 'Nessun ordine'}</b><small>${LI && LI.data ? `ultimo aggiornamento il ${esc(shortDate(LI.data))}${LI.nuovi != null ? ` · ${LI.nuovi} ordini nuovi` : ''}` : 'aggiorna scaricando il report da Amazon Business'}${age > 20 ? ` · sono passati ${age} giorni dall'ultimo ordine` : ''}</small></span><button class="btn sm" id="am-how" type="button">Come si aggiorna</button><button class="btn sm primary" id="am-imp3" type="button">Aggiorna da Amazon</button></div>`;
    body.innerHTML = warn + upd + `
      <div class="gl-hero am-hero">
        <div class="gh-top"><div class="gh-art">${amArt()}</div>
        <div class="gh-main"><span class="gh-lbl">Ordini Amazon · ${esc(per)}</span><div class="gh-big k-am">0 €</div>
          <div class="gh-sub"><span>${O.length} ordini</span><span>${fmtNum(pz, 0)} pezzi</span><span>${act.length} piazzali</span>${est.length && !ivaOn ? `<span>${est.length} imponibili stimati</span>` : ''}${PT ? `<span class="gl-d ${T > PT ? 'up' : 'down'}">${T > PT ? '▲' : '▼'} ${fmtNum(Math.abs((T / PT - 1) * 100), 0)}% vs ${esc(MESI[Number(prevK.slice(5)) - 1])}</span>` : ''}</div></div></div>
        <div class="gh-kpis">${K.map(([l, , , s], i) => `<div class="gh-k${i === 4 && est.length ? ' ly-kwarn' : ''}"><span>${l}</span><b data-amk="${i}">0</b><small>${esc(s)}</small></div>`).join('')}</div>
      </div>
      <div class="card" id="am-anom"></div>
      <div class="card"><div class="card-h"><h3>Spesa per piazzale</h3><span class="muted small">${ivaLbl()} · tocca per filtrare</span><button class="btn sm" id="am-cdc" type="button">Centri di costo</button></div>
        <div class="tr-dash ly-dash"><div class="cc-map" id="am-map"></div><div class="tr-rank" id="am-rank"></div></div></div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Per categoria</h3><span class="muted small">categorie automatiche · ${ivaLbl()}</span></div><div class="bars" id="am-cat"></div></div>
        <div class="card"><div class="card-h"><h3>Mese per mese</h3><span class="muted small">per centro di costo</span></div><div class="ly-mb" id="am-mm"></div><div class="ly-leg" id="am-leg"></div></div>
      </div>
      <div class="card"><div class="card-h"><h3>Centri di costo × categorie</h3><span class="muted small">${ivaLbl()} · spedizione e sconti ripartiti sugli articoli</span></div><div class="mx-wrap" id="am-mx"></div></div>
      <div class="card" id="am-ord-card"><div class="card-h"><h3>Ordini</h3><span class="muted small" id="am-ocnt"></span><div class="tr-seg ly-dseg">${[['', 'Tutti'], ['est', 'IVA stimata'], ['na', 'Da attribuire']].map(([k, l]) => `<button type="button" data-amof="${k}" class="${amOrdF === k ? 'on' : ''}">${l}</button>`).join('')}</div></div><div id="am-ords"></div></div>
      <div class="gl-2">
        <div class="card"><div class="card-h"><h3>Articoli più costosi</h3><input id="am-aq" type="search" class="ly-aq" placeholder="Cerca articolo…" value="${esc(amArtQ)}"></div><div id="am-art"></div></div>
        <div class="card"><div class="card-h"><h3>Venditori</h3><span class="muted small">${vend} venditori · ${ivaLbl()}</span></div><div id="am-vend"></div></div>
      </div>
      <div class="card gl-list"><div class="card-h"><h3>Tutti gli articoli</h3><span class="muted small" id="am-cnt"></span></div>
        <div class="filters f4 gl-f"><input id="am-q" type="search" placeholder="Cerca articolo, ordine, venditore…" value="${esc(amF.q)}"><select id="am-fc"></select><select id="am-fk"></select><select id="am-fv"></select></div>
        <div id="am-list"></div></div>`;
    countTo($('.k-am', body), T, eur0);
    $$('[data-amk]', body).forEach(el => { const i = +el.dataset.amk; el._v = 0; countTo(el, K[i][1], K[i][2]); });
    const CK = amChecks(O, A), I = { warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
    $('#am-anom').innerHTML = `<div class="card-h"><h3>Controlli</h3><span class="muted small">${CK.length ? CK.length + ' punti da verificare' : 'tutto in ordine'}</span></div>` + (CK.length ? `<div class="gl-an">${CK.map((x, i) => `<div class="ga-row ${x.t}" style="--d:${i * 70}ms"${x.act ? ` data-amact="${x.act}"` : ''}${x.ids ? ` data-amids="${esc(x.ids.join(' '))}"` : ''}${x.q ? ` data-amartq="${esc(x.q)}"` : ''}><span class="ci-ic"><svg viewBox="0 0 24 24">${I[x.t]}</svg></span><div class="ga-m"><b>${x.h}</b><span>${x.d}</span></div><b class="ga-v">${x.v}</b></div>`).join('')}</div>` : '<div class="empty">Tutto in ordine</div>');
    amMap(PL, anim);
    // categorie
    const byC = [...groupBy(A, a => a.cat)].map(([k, v]) => ({ k, v: r2(v.reduce((x, a) => x + a.val, 0)), n: v.length })).sort((a, b) => b.v - a.v), mc = Math.max(1, ...byC.map(x => x.v));
    $('#am-cat').innerHTML = byC.map((x, i) => `<div class="bar-row gl-anim-row click" style="--d:${200 + i * 45}ms" data-amcat="${esc(x.k)}"><div class="bar-top"><span>${esc(x.k)}<em>${fmtNum(pct(x.v, T), 1)}% · ${x.n} art.</em></span><span>${eur0(x.v)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(x.v / mc * 100).toFixed(2)}%"></div></div></div>`).join('');
    // mesi
    const top = PL.filter(x => x.rows.length).sort((a, b) => b.t - a.t), colOf = new Map(top.map((x, i) => [x.cod, x.cod === LY_NONE ? '#b6bac3' : LY_COL[i % LY_COL.length]]));
    const mm = (amP ? [amP] : months).map(k => { const v = all.filter(o => String(o.data).slice(0, 7) === k); return { k, t: amSum(v), parts: top.map(c => ({ c: c.cod, v: amSum(v.filter(o => (o.cdc || LY_NONE) === c.cod)) })).filter(p => p.v > 0) }; });
    const mx = Math.max(1, ...mm.map(x => x.t));
    $('#am-mm').innerHTML = mm.map((x, i) => `<div class="ly-b" data-amper="${x.k}" title="${esc(mLabel(x.k))}: ${esc(eur(x.t))}"><span class="ly-bv">${esc(eur0(x.t))}</span><div class="ly-bc" style="height:${Math.max(2, x.t / mx * 100).toFixed(1)}%;--d:${i * 45}ms">${x.parts.slice().reverse().map(p => `<i style="flex:${p.v};background:${colOf.get(p.c)}" title="${esc(lyName(p.c))}: ${esc(eur(p.v))}"></i>`).join('')}</div><span class="ly-bl">${esc(MESI[Number(x.k.slice(5)) - 1].slice(0, 3))}</span></div>`).join('');
    $('#am-leg').innerHTML = top.map(c => `<span><i style="background:${colOf.get(c.cod)}"></i>${esc(c.n)}</span>`).join('');
    // matrice
    const cs = byC.map(x => x.k), P = PL.filter(x => x.rows.length), cell = {};
    A.forEach(a => { const k = a.cdc + '|' + a.cat; cell[k] = (cell[k] || 0) + a.val; });
    const mxv = Math.max(1, ...Object.values(cell)), heat = v => !v ? 'h0' : v / mxv > .45 ? 'h3' : v / mxv > .15 ? 'h2' : v / mxv > .03 ? 'h1' : '';
    $('#am-mx').innerHTML = `<table class="mx ly-mxt${anim ? ' mx-anim' : ''}"><thead><tr><th>Centro di costo</th>${cs.map(c => `<th title="${esc(c)}">${esc(c)}</th>`).join('')}<th>Totale</th></tr></thead><tbody>
      ${P.map((p, r) => `<tr data-amcdc="${esc(p.cod)}"${p.cod === LY_NONE ? ' class="ly-na"' : ''}><td title="${esc(p.n)}">${esc(p.n)}</td>${cs.map((c, j) => { const v = cell[p.cod + '|' + c] || 0; return `<td class="${heat(v)}" style="--d:${(r + j) * 25}ms">${v ? eur0(v) : '—'}</td>`; }).join('')}<td><b>${eur0(p.t)}</b></td></tr>`).join('')}
      <tr class="tot"><td>Totale</td>${cs.map(c => `<td>${eur0(P.reduce((a, p) => a + (cell[p.cod + '|' + c] || 0), 0))}</td>`).join('')}<td>${eur0(T)}</td></tr></tbody></table>`;
    renderAmOrds(O);
    renderAmArt(A);
    // venditori
    const byV = [...groupBy(O, o => String(o.venditore || '—').split(',')[0].trim())].map(([k, v]) => ({ k, v: amSum(v), n: v.length })).sort((a, b) => b.v - a.v), mv = Math.max(1, ...byV.map(x => x.v));
    $('#am-vend').innerHTML = byV.slice(0, 10).map((x, i) => `<div class="bar-row gl-anim-row click" style="--d:${200 + i * 45}ms" data-amvend="${esc(x.k)}"><div class="bar-top"><span>${esc(x.k)}<em>${x.n} ${x.n === 1 ? 'ordine' : 'ordini'}</em></span><span>${eur0(x.v)}</span></div><div class="bar-track"><div class="bar-fill${/^amazon/i.test(x.k) ? ' am-amz' : ''}" style="width:${(x.v / mv * 100).toFixed(2)}%"></div></div></div>`).join('') + (byV.length > 10 ? `<div class="muted small" style="margin-top:6px">e altri ${byV.length - 10} venditori (${eur0(byV.slice(10).reduce((a, x) => a + x.v, 0))})</div>` : '');
    // filtri
    if (amF.cdc && !PL.some(x => x.cod === amF.cdc && x.rows.length)) amF.cdc = '';
    if (amF.cat && !cs.includes(amF.cat)) amF.cat = '';
    $('#am-fc').innerHTML = `<option value="">Tutti i centri di costo</option>` + PL.filter(x => x.rows.length).map(x => `<option value="${esc(x.cod)}"${amF.cdc === x.cod ? ' selected' : ''}>${esc(x.n)}</option>`).join('');
    $('#am-fk').innerHTML = `<option value="">Tutte le categorie</option>` + cs.map(c => `<option${amF.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('');
    $('#am-fv').innerHTML = `<option value="">Tutti i venditori</option>` + byV.map(x => `<option${amF.vend === x.k ? ' selected' : ''}>${esc(x.k)}</option>`).join('');
    renderAmList(A);
  }
  function amMap(PL, anim) {
    const rk = PL.filter(x => x.rows.length).sort((a, b) => (a.cod === LY_NONE) - (b.cod === LY_NONE) || b.t - a.t), all = rk.reduce((a, x) => a + x.t, 0), mxr = Math.max(1, ...rk.map(x => x.t));
    const noGeo = PL.filter(x => x.cod !== LY_NONE && x.rows.length && !lyGeo(x));
    $('#am-rank').innerHTML = rk.map((x, i) => `<button type="button" class="cr-row${amF.cdc === x.cod ? ' on' : ''}${x.cod === LY_NONE ? ' ly-na' : ''}" data-amcdc="${esc(x.cod)}" style="--d:${200 + i * 50}ms">
        <span class="cr-n">${x.cod === LY_NONE ? '?' : i + 1}</span>
        <span class="cr-main"><span class="cr-top"><b>${esc(x.n)}</b><span><em>${fmtNum(pct(x.t, all), 1)}%</em><strong>${eur0(x.t)}</strong></span></span>
        <span class="cr-track"><i style="width:${(Math.max(0, x.t) / mxr * 100).toFixed(2)}%"></i></span>
        <span class="cr-sub">${esc(x.cod)} · ${x.docs} ordini${x.citta ? ' · ' + esc(x.citta) : ''}${x.cod === LY_NONE ? ' · da assegnare' : ''}</span></span>
      </button>`).join('') + (noGeo.length ? `<div class="muted small tr-none">Non in mappa (manca la città): ${noGeo.map(x => esc(x.n)).join(', ')}. <button type="button" class="link ly-link" id="am-cdc2">Imposta la città</button></div>` : '');
    pzMap('#am-map', rk.filter(x => x.cod !== LY_NONE && lyGeo(x)).map(x => ({ cod: x.cod, n: x.n, t: x.t, rank: rk.indexOf(x) + 1, sub: `${x.docs} ${x.docs === 1 ? 'ordine' : 'ordini'}`, geo: lyGeo(x) })), { attr: 'amcdc', sel: amF.cdc, rankEl: '#am-rank', anim, label: 'Mappa dei piazzali Amazon' });
  }
  function renderAmOrds(O) {
    O = O || amOrd().filter(amIn);
    const L = O.filter(o => !amOrdF || (amOrdF === 'est' && amEst(o)) || (amOrdF === 'na' && (o.cdc || LY_NONE) === LY_NONE) || (amOrdF === 'ids' && (renderAmOrds.ids || []).includes(String(o.id)))).sort((a, b) => String(b.data).localeCompare(String(a.data)));
    $('#am-ocnt').textContent = `${L.length} ordini · ${eur(amSum(L))}`;
    if (!L.length) { $('#am-ords').innerHTML = '<div class="empty">Nessun ordine</div>'; return; }
    const sh = L.slice(0, amOrdLimit), more = L.length > amOrdLimit ? `<div class="more-row"><button class="btn sm" id="am-omore">Mostra tutti (${L.length})</button></div>` : '';
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    const cc = o => (o.cdc || LY_NONE) === LY_NONE ? '<span class="chip late">Da attribuire</span>' : `<span class="ly-cc">${esc(lyName(o.cdc))}</span>`;
    const iv = o => amEst(o) ? '<span class="chip soon ly-q" title="Imponibile calcolato al 22%">stimata</span>' : o.ivaTipo === 'fattura' ? '<span class="chip paid ly-q">da fattura</span>' : '';
    if (isDesk()) $('#am-ords').innerHTML = `<div class="tr-tw"><table class="tbl gl-st ly-dt am-ot"><thead><tr><th>Data</th><th>Ordine</th><th>Articoli</th><th>Centro di costo</th><th class="r">Pezzi</th><th class="r">Imponibile</th><th class="r">IVA</th><th class="r">Totale</th><th></th></tr></thead><tbody>
      ${sh.map(o => `<tr data-amord="${esc(o.id)}"${(o.cdc || LY_NONE) === LY_NONE ? ' class="ly-na"' : ''}><td class="d">${dd(o.data)}</td><td><b>${esc(o.id)}</b><small class="tr-nt">${esc(String(o.venditore || '').split(',')[0])}</small></td><td class="am-ad"><span>${esc(o.articoli)}</span></td><td>${cc(o)}</td><td class="num">${qtyFmt(num(o.pezzi))}</td><td class="num">${eur(amNet(o))}</td><td class="num">${eur(num(o.totale) - amNet(o))} ${iv(o)}</td><td class="num amt">${eur(num(o.totale))}</td><td>${o.pdf ? '<span class="fa-clip" title="Fattura salvata"><svg viewBox="0 0 24 24"><path d="M21 12.5 12.7 20.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/></svg></span>' : ''}</td></tr>`).join('')}</tbody></table></div>${more}`;
    else $('#am-ords').innerHTML = `<div class="list">${sh.map(o => `<div class="item" data-amord="${esc(o.id)}"><span class="ic am-ic${(o.cdc || LY_NONE) === LY_NONE ? ' na' : ''}"><svg viewBox="0 0 24 24">${AM_IC}</svg></span><div class="main"><div class="t">${esc(String(o.articoli).slice(0, 60))}</div><div class="s">${dd(o.data)} · ${esc(lyName(o.cdc))}${amEst(o) ? ' · IVA stimata' : ''}</div></div><div class="amt">${eur(amV(o))}</div></div>`).join('')}</div>${more}`;
  }
  const AM_IC = '<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>';
  function renderAmArt(A) {
    A = A || amArts(amOrd().filter(amIn));
    const q = amArtQ.trim().toLowerCase();
    const G = [...groupBy(A, a => amNorm(a.descrizione).slice(0, 70))].map(([k, v]) => ({ k, d: v[0].descrizione, cat: v[0].cat, q: v.reduce((x, a) => x + num(a.quantita), 0), t: r2(v.reduce((x, a) => x + a.val, 0)), min: Math.min(...v.map(a => num(a.prezzo) || Infinity)), max: Math.max(...v.map(a => num(a.prezzo))), cdc: new Set(v.map(a => a.cdc)).size, ord: v[0].ordine }))
      .filter(x => !q || x.d.toLowerCase().includes(q)).sort((a, b) => b.t - a.t);
    const sh = G.slice(0, q ? 40 : 10), mt = Math.max(1, ...sh.map(x => x.t));
    $('#am-art').innerHTML = sh.length ? `<div class="ly-arts am-arts">${sh.map((x, i) => `<div class="ly-ar" data-amartk="${esc(x.d.split(/[,(]/)[0].slice(0, 40))}" style="--d:${150 + i * 35}ms"><span class="ly-am"><b title="${esc(x.d)}">${esc(x.d)}</b><small>${esc(x.cat)} · ${fmtNum(x.q, 0)} pz · ${x.cdc} ${x.cdc === 1 ? 'centro' : 'centri'}</small><span class="gd-b"><i style="width:${(x.t / mt * 100).toFixed(1)}%"></i></span></span><span class="ly-ap">${isFinite(x.min) && x.max / x.min > 1.05 ? `<span class="chip soon">${esc(eurP(x.min))} → ${esc(eurP(x.max))}</span>` : isFinite(x.min) ? `<small>${esc(eurP(x.min))} cad. IVA incl.</small>` : ''}<b>${esc(eur(x.t))}</b></span></div>`).join('')}</div>${!q && G.length > 10 ? `<div class="muted small" style="margin-top:8px">Primi 10 di ${G.length}: usa la ricerca per gli altri.</div>` : ''}` : '<div class="empty">Nessun articolo</div>';
  }
  function renderAmList(A) {
    A = A || amArts(amOrd().filter(amIn));
    const q = amF.q.trim().toLowerCase();
    const L = A.filter(a => (!amF.cdc || a.cdc === amF.cdc) && (!amF.cat || a.cat === amF.cat) && (!amF.vend || String(a.venditore || '').split(',')[0].trim() === amF.vend) && (!q || `${a.descrizione} ${a.ordine} ${a.venditore} ${a.localita}`.toLowerCase().includes(q)))
      .sort((a, b) => String(b.data).localeCompare(String(a.data)) || String(a.id).localeCompare(String(b.id)));
    $('#am-cnt').textContent = `${L.length} articoli · ${eur(L.reduce((x, a) => x + a.val, 0))}`;
    if (!L.length) { $('#am-list').innerHTML = '<div class="empty">Nessun articolo</div>'; return; }
    const sh = L.slice(0, amLimit), more = L.length > amLimit ? `<div class="more-row"><button class="btn sm" id="am-more">Mostra tutti (${L.length})</button></div>` : '';
    const dd = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
    if (isDesk()) $('#am-list').innerHTML = `<div class="tr-tw"><table class="tbl gl-st tr-tbl ly-rt am-rt"><thead><tr><th>Data</th><th>Articolo</th><th>Categoria</th><th>Centro di costo</th><th class="r">Q.tà</th><th class="r">Prezzo</th><th class="r">${ivaOn ? 'Totale' : 'Imponibile'}</th></tr></thead><tbody>
      ${sh.map(a => `<tr data-amord="${esc(a.ordine)}"${a.cdc === LY_NONE ? ' class="ly-na"' : ''}><td class="d">${dd(a.data)}</td><td><b title="${esc(a.descrizione)}">${esc(a.descrizione)}</b><small class="tr-nt">${esc([a.ordine, String(a.venditore || '').split(',')[0], /usato/i.test(a.condizione || '') ? 'usato' : ''].filter(Boolean).join(' · '))}</small></td><td class="m2">${esc(a.cat)}</td><td>${a.cdc === LY_NONE ? '<span class="chip late">Da attribuire</span>' : esc(lyName(a.cdc))}</td><td class="num">${qtyFmt(num(a.quantita))}</td><td class="num">${eurP(num(a.prezzo))}</td><td class="num amt">${eur(a.val)}</td></tr>`).join('')}</tbody></table></div>${more}`;
    else $('#am-list').innerHTML = `<div class="list">${sh.map(a => `<div class="item" data-amord="${esc(a.ordine)}"><span class="ic am-ic${a.cdc === LY_NONE ? ' na' : ''}"><svg viewBox="0 0 24 24">${AM_IC}</svg></span><div class="main"><div class="t">${esc(String(a.descrizione).slice(0, 70))}</div><div class="s">${esc(lyName(a.cdc))} · ${esc(a.cat)} · ${qtyFmt(num(a.quantita))} pz</div></div><div class="amt">${eur(a.val)}</div></div>`).join('')}</div>${more}`;
  }

  /* ---------- ordine: dettaglio, centro di costo, IVA dalla fattura ---------- */
  function amOrdDetail(id) {
    const o = amOrd().find(x => String(x.id) === String(id)); if (!o) return;
    const arts = amArtAll().filter(a => String(a.ordine) === String(id)).sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const C = lyCdcList(), cats = [...new Set([...AM_CAT.map(c => c[0]), 'Altro', ...amArtAll().map(a => a.categoria).filter(Boolean)])];
    // copia di lavoro degli articoli (modificabili)
    let W = arts.map(a => ({ id: a.id, d: String(a.descrizione || ''), q: num(a.quantita) || 1, p: num(a.prezzo), c: a.categoria || amCatOf(a.descrizione), src: a }));
    const tot = num(o.totale);
    const rowsHtml = () => W.map((w, i) => `<div class="am-er" data-i="${i}">
        <input class="am-ed-d" data-k="d" value="${esc(w.d)}" placeholder="Descrizione dell'articolo" aria-label="Descrizione">
        <label class="am-ed-n"><span>Q.tà</span><input data-k="q" inputmode="decimal" value="${esc(fmtIn(w.q))}"></label>
        <label class="am-ed-n"><span>Prezzo cad.</span><input data-k="p" inputmode="decimal" value="${esc(fmtIn(w.p))}"></label>
        <span class="am-ed-t"><small>Totale</small><b data-t="${i}">${esc(eur(r2(w.q * w.p)))}</b></span>
        <select data-k="c" aria-label="Categoria">${cats.map(c => `<option${c === w.c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <button type="button" class="am-ed-x" data-del="${i}" title="Togli l'articolo" aria-label="Togli l'articolo"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </div>`).join('');
    const sumHtml = () => { const sm = r2(W.reduce((x, w) => x + w.q * w.p, 0)), d = r2(tot - sm), ok = Math.abs(d) < .02; return `<div class="am-es ${ok ? 'ok' : 'ko'}"><span><b>Somma articoli ${esc(eur(sm))}</b><small>${ok ? 'coincide con il totale pagato' : `totale pagato ${esc(eur(tot))} · ${d > 0 ? 'mancano' : 'in più'} ${esc(eur(Math.abs(d)))}`}</small></span>${!ok && sm > 0 ? '<button type="button" class="btn sm" id="am-fit">Adatta i prezzi al totale</button>' : ''}</div>`; };
    openSheet(`Ordine ${o.id}`, `
      <div class="kv">${[['Data', validD(o.data) ? shortDate(o.data) : '—'], ['Venditore', o.venditore || '—'], ['Destinatario', o.destinatario || '—'], ['Consegna', o.localita || '—'], ['Pagamento', o.pagamento || '—']].map(([a, b]) => `<div><span>${a}</span><strong>${esc(String(b))}</strong></div>`).join('')}</div>
      <div class="iva-sum" style="margin-top:14px">${num(o.spedizione) ? `<div><span>Spedizione</span><b>${esc(eur(num(o.spedizione)))}</b></div>` : ''}${num(o.sconti) ? `<div><span>Sconti</span><b>${esc(eur(num(o.sconti)))}</b></div>` : ''}<div><span>Imponibile${amEst(o) ? ' (stimato al 22%)' : ''}</span><b>${esc(eur(amNet(o)))}</b></div><div><span>IVA</span><b>${esc(eur(num(o.totale) - amNet(o)))}</b></div><div class="t"><span>Totale pagato</span><b>${esc(eur(num(o.totale)))}</b></div></div>
      ${amEst(o) ? `<div class="fa-chk ko"><b>IVA non riportata da Amazon</b><span>Se hai la fattura, scrivi qui sotto l'imponibile vero: l'ordine non sarà più stimato.</span></div>` : ''}
      <div class="f-row" style="margin-top:12px"><label class="f"><span>Centro di costo</span><select name="cdc">${C.map(c => `<option value="${esc(c.cod)}"${c.cod === (o.cdc || LY_NONE) ? ' selected' : ''}>${esc(c.n)}${c.cod === LY_NONE ? '' : ' · ' + esc(c.cod)}</option>`).join('')}</select></label><label class="f"><span>Imponibile dalla fattura €</span><input name="imp" inputmode="decimal" value="${amEst(o) ? '' : esc(fmtIn(num(o.imponibile)))}" placeholder="${esc(fmtIn(amNet(o)))}"></label></div>
      <div class="am-ed">
        <div class="am-eh"><b>Articoli</b><small>prezzi IVA inclusa · puoi correggere descrizione, quantità, prezzo e categoria</small></div>
        <div id="am-er">${rowsHtml()}</div>
        <button type="button" class="am-add" id="am-add">+ Aggiungi articolo</button>
        <div id="am-es">${sumHtml()}</div>
      </div>
      <label class="f" style="margin-top:12px"><span>Note</span><input name="note" value="${esc(o.note || '')}"></label>
      <div class="row-btns" style="margin-top:6px">${o.pdf ? '<button type="button" class="btn sm" id="am-open">Apri fattura</button>' : ''}${!isLocal() ? `<button type="button" class="btn sm" id="am-doc">${o.pdf ? 'Sostituisci fattura' : 'Allega fattura (PDF)'}</button>` : ''}</div>`,
      fd => {
        const ops = [], imp = String(fd.get('imp') || '').trim();
        if (W.some(w => !w.d.trim())) { toast('Scrivi la descrizione di ogni articolo (o toglilo)'); return false; }
        const row = { ...o, cdc: String(fd.get('cdc')), note: String(fd.get('note') || '').trim() };
        if (imp !== '' && (amEst(o) || Math.abs(num(imp) - amNet(o)) > .005)) { row.imponibile = num(imp); row.iva = r2(num(o.totale) - num(imp)); row.ivaTipo = 'fattura'; }
        // articoli: modificati, nuovi e tolti
        let next = arts.reduce((m, a) => Math.max(m, Number(String(a.id).split('-').pop()) || 0), 0);
        let artCh = false;
        W.forEach(w => {
          const base = w.src || { ordine: o.id, data: o.data, venditore: String(o.venditore || '').split(',')[0].trim(), condizione: '', spedito: '', localita: o.localita };
          const r = { ...base, id: w.src ? w.src.id : `${o.id}-${String(++next).padStart(2, '0')}`, descrizione: w.d.trim(), quantita: w.q, prezzo: Math.round(w.p * 1000) / 1000, importo: r2(w.q * w.p), categoria: w.c };
          const was = w.src && w.src.descrizione === r.descrizione && num(w.src.quantita) === r.quantita && Math.abs(num(w.src.prezzo) - r.prezzo) < .0005 && Math.abs(num(w.src.importo) - r.importo) < .005;
          if (!w.src || !was) artCh = true;
          if (!w.src || !was || (w.src.categoria || amCatOf(w.src.descrizione)) !== r.categoria) ops.push({ action: 'upsert', sheet: 'AmazonArticoli', row: r });
        });
        arts.filter(a => !W.some(w => w.src && w.src.id === a.id)).forEach(a => { artCh = true; ops.push({ action: 'delete', sheet: 'AmazonArticoli', id: a.id }); });
        if (artCh) {
          row.articoli = W.map(w => w.d.trim()).join(' | '); row.pezzi = W.reduce((x, w) => x + w.q, 0);
          const fix = { ...(cfg('amArtFix') || {}) }; fix[o.id] = today();
          ops.push({ action: 'upsert', sheet: 'Config', row: { chiave: 'amArtFix', valore: JSON.stringify(fix) } });
        }
        if (JSON.stringify(row) !== JSON.stringify(o)) ops.unshift({ action: 'upsert', sheet: 'Amazon', row });
        if (!ops.length) return true;
        write(ops); toast(artCh ? 'Ordine e articoli aggiornati' : 'Ordine aggiornato'); return true;
      }, null, 'Salva');
    $('#sheet-form').classList.add('wide');
    const ED = $('#sheet-body .am-ed');
    const redraw = () => { $('#am-er').innerHTML = rowsHtml(); $('#am-es').innerHTML = sumHtml(); };
    ED.addEventListener('input', e => {
      const el = e.target, r = el.closest('.am-er'); if (!r || !el.dataset.k) return;
      const w = W[+r.dataset.i], k = el.dataset.k;
      if (k === 'd') w.d = el.value; else if (k === 'q') w.q = num(el.value) || 0; else if (k === 'p') w.p = num(el.value) || 0; else if (k === 'c') w.c = el.value;
      if (k === 'q' || k === 'p') { r.querySelector('[data-t]').textContent = eur(r2(w.q * w.p)); $('#am-es').innerHTML = sumHtml(); }
    });
    ED.addEventListener('change', e => { const el = e.target, r = el.closest('.am-er'); if (r && el.dataset.k === 'c') W[+r.dataset.i].c = el.value; });
    ED.addEventListener('click', e => {
      const x = e.target.closest('[data-del]'); if (x) { W.splice(+x.dataset.del, 1); redraw(); return; }
      if (e.target.closest('#am-add')) { W.push({ id: '', d: '', q: 1, p: 0, c: 'Altro', src: null }); redraw(); const ins = $$('#am-er .am-ed-d'); if (ins.length) ins[ins.length - 1].focus(); return; }
      if (e.target.closest('#am-fit')) { const sm = W.reduce((s2, w) => s2 + w.q * w.p, 0); if (sm > 0) { const k = tot / sm; W.forEach(w => { w.p = r2(w.p * k); }); const d = r2(tot - W.reduce((s2, w) => s2 + w.q * w.p, 0)); const last = W.slice().reverse().find(w => w.q === 1); if (last && Math.abs(d) < 1) last.p = r2(last.p + d); redraw(); toast('Prezzi adattati al totale pagato: controllali'); } }
    });
    const op = $('#am-open'); if (op) op.onclick = () => openDoc(o.pdf, `Amazon ${o.id}`);
    const up = $('#am-doc'); if (up) up.onclick = async () => {
      if (!amOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.7)');
      let file; try { file = await pickDoc(); } catch (e) { if (e.message !== 'annullato') toast(e.message); return; }
      try { busy('Salvo la fattura nel tuo Drive…'); const pdf = await api('uploadDoc', { name: `Amazon ${o.id} ${o.data}.${file.ext}`, mime: file.mime, data: file.data }); busy(); write([{ action: 'upsert', sheet: 'Amazon', row: { ...o, pdf } }]); closeSheet(); toast('Fattura allegata all\'ordine'); }
      catch (e) { busy(); if (!(e instanceof AuthError)) toast('Fattura non salvata: ' + e.message); }
    };
  }
  async function amClassifyAI() {
    const arts = amArtAll(); if (!arts.length) return;
    const cats = [...AM_CAT.map(c => c[0]), 'Altro'], todo = arts.filter(a => !a.categoria || a.categoria === 'Altro');
    if (!todo.length) return toast('Tutti gli articoli hanno già una categoria');
    try {
      busy(`L'IA classifica ${todo.length} articoli…`);
      const res = await aiCall('classify', { categorie: cats, items: todo.map((a, i) => ({ i, d: String(a.descrizione).slice(0, 140) })) });
      const ops = (Array.isArray(res) ? res : []).filter(x => todo[x.i] && cats.includes(x.c) && x.c !== 'Altro').map(x => ({ action: 'upsert', sheet: 'AmazonArticoli', row: { ...todo[x.i], categoria: x.c } }));
      busy(); if (!ops.length) return toast('Nessuna categoria nuova'); write(ops); toast(`${ops.length} articoli classificati`);
    } catch (e) { busy(); if (!(e instanceof AuthError)) toast(e.message); }
  }

  /* ---------- importazione / esportazione ---------- */
  function amParse(wb) {
    const U = XLSX.utils, sheets = wb.SheetNames.map(n => ({ n, a: U.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' }) }));
    const find = test => { for (const s of sheets) { const hi = s.a.findIndex(test); if (hi >= 0) return { ...s, hi }; } return null; };
    const os = find(r => r.some(c => /^nordine$/.test(nh(c))) && r.some(c => /^totale$/.test(nh(c))) && r.some(c => /^localita/.test(nh(c))));
    if (!os) throw new Error('Non trovo il foglio «Ordini» (colonne N° ordine, Località consegna, Totale)');
    const H = os.a[os.hi].map(nh), c = re => H.findIndex(h => re.test(h));
    const C = { d: c(/^data/), id: c(/^nordine/), ar: c(/^articoli/), pz: c(/^pezzi/), ve: c(/^venditore/), de: c(/^destinatario/), lo: c(/^localita/), pa: c(/^pagamento/), su: c(/^subtotale/), sp: c(/^spedizione/), sc: c(/^sconti/), im: c(/^imponibile/), iv: c(/^iva$/), to: c(/^totale/), no: c(/^note/), cdc: c(/^cdc$|^centro/) };
    const g = (r, i) => i >= 0 ? r[i] : '';
    let cdcs = lyCdcMerge(lyCdcList());
    const oldO = new Map(amOrd().map(o => [String(o.id), o]));
    const cdcOf = loc => { const L = amNorm(loc); const x = cdcs.find(z => String(z.loc || '').split('|').map(amNorm).filter(Boolean).some(k => L.includes(k))); return x ? x.cod : LY_NONE; };
    const orders = [];
    os.a.slice(os.hi + 1).forEach(r => {
      const id = lyTxt(g(r, C.id)); if (!id || !/\d{3}-\d{5,}/.test(id)) return;
      const tot = num(g(r, C.to)), impS = g(r, C.im), noteF = lyTxt(g(r, C.no)), ex = oldO.get(id);
      const hasImp = String(impS ?? '').trim() !== '' && num(impS);
      let imp = hasImp ? num(impS) : r2(tot / 1.22), iva = hasImp ? num(g(r, C.iv)) : r2(tot - imp), tipo = hasImp ? (/stimat/i.test(noteF) ? 'stimata' : 'amazon') : 'stimata';
      if (ex && ex.ivaTipo === 'fattura') { imp = num(ex.imponibile); iva = num(ex.iva); tipo = 'fattura'; } // non perdere le correzioni dalla fattura
      let cdc = lyTxt(g(r, C.cdc)).toUpperCase() || cdcOf(g(r, C.lo));
      if (ex && cdc === LY_NONE && ex.cdc && ex.cdc !== LY_NONE) cdc = ex.cdc;
      if (ex && ex.cdc && ex.cdc !== LY_NONE) cdc = ex.cdc; // l'attribuzione fatta nell'app vince
      orders.push({ id, data: lyDate(g(r, C.d)), articoli: lyTxt(g(r, C.ar)), pezzi: num(g(r, C.pz)), venditore: lyTxt(g(r, C.ve)), destinatario: lyTxt(g(r, C.de)), localita: lyTxt(g(r, C.lo)), pagamento: lyTxt(g(r, C.pa)), subtotale: num(g(r, C.su)), spedizione: num(g(r, C.sp)), sconti: num(g(r, C.sc)), imponibile: imp, iva, totale: tot, ivaTipo: tipo, cdc, note: ex && ex.note ? ex.note : (/non indicata/i.test(noteF) ? '' : noteF), pdf: ex ? ex.pdf || '' : '' });
    });
    if (!orders.length) throw new Error('Nessun ordine trovato');
    const as = find(r => r.some(c => /^nordine$/.test(nh(c))) && r.some(c => /^descrizione/.test(nh(c))) && r.some(c => /^prezzo/.test(nh(c))));
    const arts = [], oldA = new Map(amArtAll().map(a => [String(a.id), a]));
    if (as) {
      const AH = as.a[as.hi].map(nh), ac = re => AH.findIndex(h => re.test(h));
      const X = { d: ac(/^dataordine|^data$/), id: ac(/^nordine/), q: ac(/^qta|^quantita/), de: ac(/^descrizione/), p: ac(/^prezzo/), t: ac(/^totaleriga|^totale/), ve: ac(/^venditore/), co: ac(/^condizione/), sp: ac(/^spedito/), lo: ac(/^localita/), ca: ac(/^categoria/) };
      const seq = {};
      as.a.slice(as.hi + 1).forEach(r => {
        const ord = lyTxt(g(r, X.id)); if (!ord || !/\d{3}-\d{5,}/.test(ord)) return;
        seq[ord] = (seq[ord] || 0) + 1;
        const id = `${ord}-${String(seq[ord]).padStart(2, '0')}`, q = num(g(r, X.q)) || 1, p = num(g(r, X.p)), ex = oldA.get(id), de = lyTxt(g(r, X.de));
        const tRaw = g(r, X.t), tot = typeof tRaw === 'number' ? tRaw : r2(q * p);
        arts.push({ id, ordine: ord, data: lyDate(g(r, X.d)), quantita: q, descrizione: de, prezzo: p, importo: tot, venditore: lyTxt(g(r, X.ve)), condizione: lyTxt(g(r, X.co)), spedito: lyDate(g(r, X.sp)), localita: lyTxt(g(r, X.lo)), categoria: (ex && ex.categoria) || lyTxt(g(r, X.ca)) || amCatOf(de) });
      });
    }
    // ordini senza righe articolo: una riga sintetica
    const withArt = new Set(arts.map(a => a.ordine));
    orders.filter(o => !withArt.has(o.id)).forEach(o => arts.push({ id: o.id + '-01', ordine: o.id, data: o.data, quantita: o.pezzi || 1, descrizione: o.articoli, prezzo: r2(o.totale / (o.pezzi || 1)), importo: o.totale, venditore: o.venditore, condizione: '', spedito: '', localita: o.localita, categoria: amCatOf(o.articoli) }));
    return { orders, arts, cdcs };
  }
  /* ---------- report originale di Amazon Business (Business Analytics, CSV o Excel) ---------- */
  // legge un CSV con separatore automatico (, ; tab) e campi tra virgolette
  function amCsv(text) {
    text = String(text || '').replace(/^﻿/, '');
    const first = text.split(/\r?\n/).find(l => l.trim()) || '';
    const cnt = ch => (first.match(new RegExp(ch === '\t' ? '\t' : '\\' + ch, 'g')) || []).length;
    const sep = [',', ';', '\t', '|'].sort((a, b) => cnt(b) - cnt(a))[0];
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
      if (c === '"') q = true; else if (c === sep) { row.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; } else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows.filter(r => r.some(x => String(x).trim() !== ''));
  }
  // importi sia in formato italiano (1.234,56) sia inglese (1,234.56), con € o EUR
  const amNum = v => {
    if (typeof v === 'number') return v;
    let s = String(v ?? '').replace(/[€\s]|EUR/gi, '').replace(/[^\d,.\-()]/g, '');
    if (!s) return 0;
    const neg = /^\(.*\)$/.test(s) || s.startsWith('-'); s = s.replace(/[()\-]/g, '');
    const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
    if (lc >= 0 && ld >= 0) s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (lc >= 0) s = /^\d{1,3}(,\d{3})+$/.test(s) && !/,\d{1,2}$/.test(s) ? s.replace(/,/g, '') : s.replace(/,/g, '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s); return isNaN(n) ? 0 : neg ? -n : n;
  };
  function amBizParse(aoa) {
    const hi = aoa.findIndex(r => r.some(c => /^(orderid|idordine|numeroordine|nordine|ordine|numerodellordine|iddellordine)$/.test(nh(c))) && r.some(c => /data|date/.test(nh(c))));
    if (hi < 0) throw new Error('Non riconosco il file: serve il report «Ordini» o «Articoli» scaricato da Amazon Business (Business Analytics) oppure il file «Ordini Amazon» dell\'app');
    const H = aoa[hi].map(nh), col = (...res) => { for (const re of res) { const i = H.findIndex(h => re.test(h)); if (i >= 0) return i; } return -1; };
    const C = {
      id: col(/^(orderid|idordine|numeroordine|nordine|ordine|numerodellordine|iddellordine)$/),
      d: col(/^orderdate$|^dataordine$|^datadellordine$|^data$/, /orderdate|dataordine|datadellordine/),
      st: col(/^orderstatus$|^statoordine$|^statodellordine$/, /orderstatus|statoordine|statodellordine/),
      su: col(/^(ordersubtotal|subtotaleordine|subtotaledellordine)$/),
      sh: col(/^ordershipping|spedizioneegestioneordine|spedizioneegestionedellordine|costidispedizioneordine|ordinespedizione/),
      pr: col(/^orderpromotion|promozioneordine|promozionedellordine|scontoordine/),
      tx: col(/^ordertax$|impostaordine|impostadellordine|ivaordine|ivadellordine/),
      to: col(/^(ordernettotal|totalenettoordine|totalenettodellordine)$/, /^(ordertotal|totaleordine|totaledellordine)$/),
      ti: col(/^title$|^titolo$|^titoloprodotto$|^nomeprodotto$|^productname$|^descrizione/),
      as: col(/^asin$/),
      q: col(/^itemquantity$|quantitaarticolo|quantitadellarticolo/, /^quantity$|^quantita$/),
      ppu: col(/^purchaseppu$|prezzounitariodiacquisto|prezzodiacquistounitario|prezzounitarioacquisto/, /ppu|prezzounitario/),
      isu: col(/^(itemsubtotal|subtotalearticolo|subtotaledellarticolo)$/),
      itx: col(/^itemtax$|impostaarticolo|impostadellarticolo|ivaarticolo/),
      ito: col(/^(itemnettotal|totalenettoarticolo|totalenettodellarticolo)$/),
      se: col(/^sellername$|nomevenditore|nomedelvenditore|^venditore$|^seller$/),
      co: col(/^itemcondition$|^condition$|condizione/),
      sd: col(/^shipmentdate$|datadispedizione|datadellaspedizione/),
      nm: col(/shiptoname|nomedestinatario|^destinatario$|nomedellindirizzodispedizione/),
      us: col(/^accountuser$|^utente$|utentedellaccount|^acquirente$|^buyername$/),
      pt: col(/paymentinstrumenttype|tipodistrumentodipagamento|metododipagamento|strumentodipagamento/),
      pi: col(/^paymentidentifier$|identificativodipagamento|identificativodelpagamento/)
    };
    // indirizzo: tutte le colonne di indirizzo/città/CAP
    const AD = H.map((h, i) => /shippingaddress|shipto(address|street|city|postal|zip|state)|indirizzodispedizione|indirizzodiconsegna|cittadispedizione|capdispedizione|^citta$|^cap$|^city$|postalcode|zipcode/.test(h) ? i : -1).filter(i => i >= 0);
    const g = (r, i) => i >= 0 && r[i] != null ? String(r[i]).trim() : '';
    const body = aoa.slice(hi + 1).filter(r => /\d{3}-\d{5,}-\d{5,}/.test(g(r, C.id)));
    if (!body.length) throw new Error('Il report non contiene ordini');
    // formato delle date: giorno/mese o mese/giorno
    let dm = true;
    body.forEach(r => { const m = g(r, C.d).match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-]\d{2,4}/); if (m) { if (+m[2] > 12) dm = false; } });
    const date = v => { const s = String(v || '').trim(), m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/); if (m) { const [a, b] = dm ? [m[1], m[2]] : [m[2], m[1]]; return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${pad(b)}-${pad(a)}`; } const iso = s.match(/^(\d{4})-(\d\d)-(\d\d)/); return iso ? iso.slice(1).join('-') : lyDate(v); };
    let cdcs = lyCdcMerge(lyCdcList());
    const cdcOf = loc => { const L = amNorm(loc); const x = cdcs.find(z => String(z.loc || '').split('|').map(amNorm).filter(Boolean).some(k => L.includes(k))); return x ? x.cod : LY_NONE; };
    const oldO = new Map(amOrd().map(o => [String(o.id), o])), oldA = new Map(amArtAll().map(a => [String(a.id), a]));
    const byO = groupBy(body, r => g(r, C.id));
    const orders = [], arts = []; let skipped = 0;
    byO.forEach((rs, id) => {
      const r0 = rs[0];
      if (/cancel|annull/i.test(g(r0, C.st))) { skipped++; return; }
      const items = C.ti >= 0 ? rs.filter(r => g(r, C.ti)) : [];
      const sumI = i => r2(items.reduce((a, r) => a + amNum(g(r, i)), 0));
      const sub = C.su >= 0 ? amNum(g(r0, C.su)) : C.isu >= 0 ? sumI(C.isu) : 0;
      const ship = amNum(g(r0, C.sh)), promo = Math.abs(amNum(g(r0, C.pr)));
      const hasTax = C.tx >= 0 || C.itx >= 0, tax = C.tx >= 0 ? amNum(g(r0, C.tx)) : C.itx >= 0 ? sumI(C.itx) : 0;
      const net = C.to >= 0 ? amNum(g(r0, C.to)) : C.ito >= 0 ? sumI(C.ito) : r2(sub + ship - promo + tax);
      let tot, imp;
      if (!hasTax) { tot = net; imp = r2(net / 1.22); }
      else if (tax > 0 && Math.abs(net - (sub + ship - promo)) < .05) { imp = net; tot = r2(net + tax); } // il totale netto è senza IVA
      else { tot = net; imp = r2(net - tax); }
      const ex = oldO.get(id);
      let ivaTipo = hasTax ? 'amazon' : 'stimata', iva = r2(tot - imp);
      if (ex && ex.ivaTipo === 'fattura') { imp = num(ex.imponibile); iva = num(ex.iva); ivaTipo = 'fattura'; }
      const loc = [...new Set(AD.map(i => g(r0, i)).filter(Boolean))].join(', ');
      let cdc = cdcOf(loc);
      if (ex && ex.cdc && ex.cdc !== LY_NONE) cdc = ex.cdc; // l'attribuzione fatta nell'app vince
      const titles = items.map(r => g(r, C.ti)), sellers = [...new Set(items.map(r => g(r, C.se)).filter(Boolean))];
      const pz = items.length ? items.reduce((a, r) => a + (amNum(g(r, C.q)) || 1), 0) : amNum(g(r0, C.q)) || 1;
      orders.push({ id, data: date(g(r0, C.d)), articoli: titles.length ? titles.join(' | ') : (ex ? ex.articoli : ''), pezzi: pz, venditore: sellers.join(', ') || (ex ? ex.venditore : ''), destinatario: g(r0, C.nm) || g(r0, C.us) || (ex ? ex.destinatario : ''), localita: loc || (ex ? ex.localita : ''), pagamento: [g(r0, C.pt), g(r0, C.pi)].filter(Boolean).join(' ') || (ex ? ex.pagamento : ''), subtotale: sub, spedizione: ship, sconti: promo, imponibile: imp, iva, totale: tot, ivaTipo, cdc, note: ex ? ex.note || '' : '', pdf: ex ? ex.pdf || '' : '' });
      items.forEach((r, k) => {
        const aid = `${id}-${String(k + 1).padStart(2, '0')}`, q = amNum(g(r, C.q)) || 1, de = g(r, C.ti), exA = oldA.get(aid);
        const lineNet = C.ito >= 0 ? amNum(g(r, C.ito)) : r2(amNum(g(r, C.isu)) + amNum(g(r, C.itx)));
        const imp0 = lineNet || r2(q * amNum(g(r, C.ppu)));
        arts.push({ id: aid, ordine: id, data: date(g(r0, C.d)), quantita: q, descrizione: de, prezzo: r2(imp0 / q), importo: imp0, venditore: g(r, C.se), condizione: g(r, C.co), spedito: date(g(r, C.sd)), localita: loc, categoria: (exA && amNorm(exA.descrizione).slice(0, 30) === amNorm(de).slice(0, 30) && exA.categoria) || amCatOf(de) });
      });
      if (!items.length && !(ex && amArtAll().some(a => String(a.ordine) === id))) arts.push({ id: id + '-01', ordine: id, data: date(g(r0, C.d)), quantita: pz, descrizione: (ex && ex.articoli) || 'Ordine Amazon', prezzo: r2(tot / pz), importo: tot, venditore: '', condizione: '', spedito: '', localita: loc, categoria: amCatOf(ex && ex.articoli) });
    });
    if (!orders.length) throw new Error('Nessun ordine valido nel report (tutti annullati?)');
    return { orders, arts, cdcs, skipped, biz: true, items: C.ti >= 0 };
  }
  function amHow() {
    const st = [
      ['Apri Amazon Business', 'Entra in <b>amazon.it</b> con l\'account aziendale.'],
      ['Vai su Business Analytics', 'In alto a destra passa sul tuo nome (<b>Account per …</b>) e scegli <b>Business Analytics</b> (o <b>Analisi aziendale</b>).'],
      ['Scegli il report «Articoli»', 'Tra i tipi di report scegli <b>Articoli</b> (Items): contiene ordini, prodotti, venditori, indirizzo di consegna e IVA. Il report «Ordini» va bene lo stesso, ma senza i prodotti.'],
      ['Imposta il periodo', 'Scegli le date, per esempio <b>dall\'inizio dell\'anno a oggi</b>. Puoi riscaricare anche periodi già importati: l\'app riconosce gli ordini che ha già e non li doppia.'],
      ['Scarica il file', 'Premi <b>Scarica</b> / <b>Download CSV</b> e salva il file.'],
      ['Importalo qui', 'Premi <b>Aggiorna da Amazon</b> e scegli il file: l\'app assegna ogni ordine al piazzale, calcola l\'imponibile e mette le categorie. I centri di costo, le categorie e le correzioni IVA fatte da te restano.']
    ];
    openSheet('Aggiornare Amazon', `<div class="am-how">${st.map(([h, d], i) => `<div class="am-hs"><span>${i + 1}</span><div><b>${h}</b><p>${d}</p></div></div>`).join('')}<p class="muted small" style="margin:6px 0 0">Consiglio: fallo una volta alla settimana o a fine mese. Vanno bene sia il CSV sia l'Excel di Amazon, in italiano o in inglese.</p></div>`, () => { setTimeout(importAm, 250); return true; }, null, 'Scegli il file');
  }
  async function importAm() {
    if (!amOk()) return toast('Prima aggiorna lo script Google (versione cdc-1.7)');
    let file; try { file = await pickFile('.csv,.txt,.xlsx,.xls'); } catch { return; }
    try {
      busy('Leggo il file Amazon…');
      let P;
      if (/\.(csv|txt)$/i.test(file.name)) P = amBizParse(amCsv(await file.text()));
      else {
        await loadXlsx();
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
        try { P = amParse(wb); }
        catch (e1) { if (!/Non trovo il foglio/.test(e1.message)) throw e1; const ws = wb.Sheets[wb.SheetNames[0]]; P = amBizParse(XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' })); }
      }
      busy();
      // gli articoli corretti a mano nell'app non vengono sovrascritti
      const FIX = cfg('amArtFix') || {}, exO = new Map(amOrd().map(o => [String(o.id), o]));
      const nFix = P.orders.filter(o => FIX[o.id] && exO.has(o.id)).length;
      if (nFix) { P.arts = P.arts.filter(a => !(FIX[a.ordine] && exO.has(String(a.ordine)))); P.orders.forEach(o => { const ex = exO.get(o.id); if (FIX[o.id] && ex) { o.articoli = ex.articoli; o.pezzi = ex.pezzi; } }); }
      const ids = new Set(amOrd().map(o => String(o.id))), nuovi = P.orders.filter(o => !ids.has(o.id)).length;
      const est = P.orders.filter(o => o.ivaTipo === 'stimata').length, na = P.orders.filter(o => o.cdc === LY_NONE).length;
      const dd = P.orders.map(o => o.data).filter(Boolean).sort();
      if (!confirm(`${P.biz ? 'Report Amazon Business' : 'File Ordini Amazon'}${dd.length ? ` · dal ${dd[0].split('-').reverse().join('/')} al ${dd[dd.length - 1].split('-').reverse().join('/')}` : ''}\n${P.orders.length} ordini · ${P.arts.length} articoli · ${eur(P.orders.reduce((a, o) => a + o.totale, 0))} pagati.\n${nuovi} ordini nuovi, ${P.orders.length - nuovi} già presenti (aggiornati senza perdere centri di costo, categorie e correzioni IVA).${P.skipped ? `\n${P.skipped} ordini annullati non importati.` : ''}${nFix ? `\n${nFix} ordini con articoli corretti a mano: i tuoi prezzi restano.` : ''}${P.biz && !P.items ? '\nIl report non ha gli articoli: per avere anche le categorie scarica il report «Articoli».' : ''}\n${est ? est + ' ordini senza IVA: imponibile stimato al 22%.\n' : ''}${na ? na + ' ordini con località non riconosciuta: «Da attribuire».' : 'Tutti gli ordini sono stati assegnati a un piazzale.'}\nImportare?`)) return;
      const keep = new Set(P.orders.map(o => o.id)), newA = new Set(P.arts.map(a => a.id));
      const stale = P.biz && !P.items ? [] : amArtAll().filter(a => keep.has(String(a.ordine)) && !newA.has(String(a.id)) && !(FIX[a.ordine] && exO.has(String(a.ordine))));
      write([...P.orders.map(row => ({ action: 'upsert', sheet: 'Amazon', row })), ...P.arts.map(row => ({ action: 'upsert', sheet: 'AmazonArticoli', row })), ...stale.map(a => ({ action: 'delete', sheet: 'AmazonArticoli', id: a.id })), { action: 'upsert', sheet: 'Config', row: { chiave: 'lyCdc', valore: JSON.stringify(P.cdcs) } }, { action: 'upsert', sheet: 'Config', row: { chiave: 'amLastImport', valore: JSON.stringify({ data: today(), file: file.name, fino: dd[dd.length - 1] || '', n: P.orders.length, nuovi }) } }]);
      amP = ''; amAnim = true; render(); toast(`Amazon: ${nuovi} ordini nuovi, ${P.orders.length - nuovi} aggiornati`);
    } catch (e) { busy(); toast(e.message); }
  }
  async function exportAm() {
    const O = amOrd().filter(amIn).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)));
    if (!O.length) return toast('Nessun ordine da esportare');
    try {
      busy('Preparo il file Excel…'); await loadXlsx();
      const U = XLSX.utils, wb = U.book_new(), E = '#,##0.00 "€"', A = netMode(() => amArts(O)), PL = amPlist(O).filter(x => x.rows.length);
      const cats = [...new Set(A.map(a => a.cat))];
      const s1 = [['Codice', 'Centro di costo', ...cats, 'Imponibile €', 'Totale pagato €', 'N. ordini'], ...PL.map(p => [p.cod, p.n, ...cats.map(c => r2(A.filter(a => a.cdc === p.cod && a.cat === c).reduce((x, a) => x + a.net, 0))), amSumN(p.rows), r2(p.rows.reduce((a, o) => a + num(o.totale), 0)), p.rows.length])];
      const w1 = U.aoa_to_sheet(s1); for (let R = 2; R <= s1.length; R++) for (let i = 2; i < cats.length + 4; i++) { const x = w1[xlC(i) + R]; if (x) x.z = E; }
      w1['!cols'] = [9, 26, ...cats.map(() => 15), 14, 15, 9].map(w => ({ wch: w })); U.book_append_sheet(wb, w1, 'Riepilogo CdC');
      const s2 = [['Data', 'N° ordine', 'Articoli', 'Pezzi', 'Venditore', 'Destinatario', 'Località consegna', 'Pagamento', 'Subtotale', 'Spedizione', 'Sconti', 'Imponibile', 'IVA', 'Totale', 'IVA', 'CdC', 'Centro di costo', 'Note'], ...O.map(o => [validD(o.data) ? parseD(o.data) : '', o.id, o.articoli, num(o.pezzi), o.venditore, o.destinatario, o.localita, o.pagamento, num(o.subtotale), num(o.spedizione), num(o.sconti), amNet(o), r2(num(o.totale) - amNet(o)), num(o.totale), amEst(o) ? 'stimata 22%' : o.ivaTipo === 'fattura' ? 'da fattura' : 'da Amazon', o.cdc || LY_NONE, lyName(o.cdc), o.note || ''])];
      const w2 = U.aoa_to_sheet(s2, { cellDates: true }); O.forEach((o, i) => { const R = i + 2, d = w2['A' + R]; if (d && d.t === 'd') d.z = 'dd/mm/yyyy'; ['I', 'J', 'K', 'L', 'M', 'N'].forEach(c => { const x = w2[c + R]; if (x) x.z = E; }); });
      w2['!cols'] = [11, 21, 50, 6, 24, 24, 30, 18, 11, 10, 9, 11, 10, 11, 12, 8, 22, 24].map(w => ({ wch: w })); w2['!autofilter'] = { ref: `A1:R${s2.length}` }; U.book_append_sheet(wb, w2, 'Ordini');
      const s3 = [['Data ordine', 'N° ordine', 'Q.tà', 'Descrizione', 'Prezzo unit. (IVA incl.)', 'Totale riga', 'Imponibile ripartito', 'Categoria', 'Venditore', 'Condizione', 'Spedito il', 'Località consegna', 'Centro di costo'], ...A.map(a => [validD(a.data) ? parseD(a.data) : '', a.ordine, num(a.quantita), a.descrizione, num(a.prezzo), num(a.importo), a.net, a.cat, a.venditore, a.condizione, a.spedito, a.localita, lyName(a.cdc)])];
      const w3 = U.aoa_to_sheet(s3, { cellDates: true }); A.forEach((a, i) => { const R = i + 2, d = w3['A' + R]; if (d && d.t === 'd') d.z = 'dd/mm/yyyy'; ['E', 'F', 'G'].forEach(c => { const x = w3[c + R]; if (x) x.z = E; }); });
      w3['!cols'] = [11, 21, 6, 60, 13, 12, 13, 26, 24, 12, 11, 30, 22].map(w => ({ wch: w })); w3['!autofilter'] = { ref: `A1:M${s3.length}` }; U.book_append_sheet(wb, w3, 'Articoli');
      const months = [...new Set(O.map(o => String(o.data).slice(0, 7)))].sort();
      const s4 = [['Mese', 'N° ordini', 'Imponibile', 'IVA', 'Totale'], ...months.map(m => { const v = O.filter(o => String(o.data).slice(0, 7) === m), n = amSumN(v), t = r2(v.reduce((a, o) => a + num(o.totale), 0)); return [mLabel(m), v.length, n, r2(t - n), t]; })];
      const w4 = U.aoa_to_sheet(s4); for (let R = 2; R <= s4.length; R++) ['C', 'D', 'E'].forEach(c => { const x = w4[c + R]; if (x) x.z = E; }); w4['!cols'] = [16, 10, 13, 12, 13].map(w => ({ wch: w })); U.book_append_sheet(wb, w4, 'Riepilogo mensile');
      XLSX.writeFile(wb, `Ordini_Amazon_${amP || 'completo'}.xlsx`); busy(); toast('Excel scaricato');
    } catch (e) { busy(); toast(e.message); }
  }
  function amArt() {
    return `<svg viewBox="300 0 340 260" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" class="gh-svg am-svg">
      <defs><pattern id="amdots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="#fff" opacity=".12"/></pattern></defs>
      <rect x="300" width="340" height="260" fill="url(#amdots)"/>
      <g class="am-b b1" style="--d:120ms"><rect x="476" y="96" width="120" height="100" rx="12"/><path d="M476 126 h120 M536 96 v30"/></g>
      <g class="am-b b2" style="--d:280ms"><rect x="420" y="128" width="96" height="80" rx="10"/><path d="M420 152 h96 M468 128 v24"/></g>
      <g class="am-b b3" style="--d:440ms"><rect x="520" y="40" width="70" height="58" rx="9"/><path d="M520 58 h70 M555 40 v18"/></g>
    </svg>`;
  }

  /* ---------- Controlli di tutte le aree (dashboard) ---------- */
  function attChecks(rows) {
    const A = [];
    const zero = rows.filter(r => !num(r.prezzo)); if (zero.length) A.push({ t: 'warn', h: 'Righe senza prezzo', d: `${fmtNum(zero.length, 0)} acquisti senza prezzo: il totale dell'attrezzatura è sottostimato.`, v: fmtNum(zero.length, 0) + ' righe', go: 'movzero' });
    const nc = rows.filter(r => !r.centro || /assegnare/i.test(r.centro)); if (nc.length) A.push({ t: 'warn', h: 'Acquisti senza centro di costo', d: `${nc.length} righe non assegnate a nessun piazzale.`, v: eur(sumT(nc)), go: 'movimenti' });
    const arts = articoli(rows).filter(x => x.var > .2 && x.n > 1).sort((a, b) => b.var * b.tot - a.var * a.tot);
    if (arts.length) A.push({ t: 'info', h: 'Stesso prodotto pagato a prezzi diversi', d: arts.slice(0, 3).map(x => `${esc(String(x.desc).slice(0, 48))}: da ${eurP(x.min)} a ${eurP(x.max)}`).join(' · ') + (arts.length > 3 ? ` e altri ${arts.length - 3}` : ''), v: arts.length + ' prodotti', go: 'articoli' });
    const dup = [...groupBy(rows.filter(r => validD(r.data) && num(r.prezzo)), r => [prodKey(r), num(r.quantita), num(r.prezzo), r.data, r.centro].join('|'))].filter(([, v]) => v.length > 1);
    if (dup.length) A.push({ t: 'warn', h: 'Possibili acquisti doppi', d: `${dup.length} righe identiche (stesso prodotto, quantità, prezzo, data e centro): ${dup.slice(0, 2).map(([, v]) => esc(String(v[0].descrizione).slice(0, 48)) + (String(v[0].descrizione).length > 48 ? '…' : '')).join(', ')}${dup.length > 2 ? '…' : ''}.`, v: eur(dup.reduce((a, [, v]) => a + sumT(v.slice(1)), 0)), go: 'movimenti' });
    const nd = rows.filter(r => !validD(r.data)); if (nd.length) A.push({ t: 'info', h: 'Acquisti senza data', d: `${fmtNum(nd.length, 0)} righe senza data non compaiono nei confronti mese per mese.`, v: eur(sumT(nd)), go: 'movimenti' });
    return A;
  }
  function allChecks(P, per) {
    const tag = (a, go) => x => ({ ...x, a, go: x.go || go });
    const gV = gasVehicles(gasRows());
    const out = [...attChecks(P.att).map(tag('att', 'movimenti')), ...glsChecks(P.gls).map(tag('gls', 'gls')), ...gasChecks(P.gas, gV).map(tag('gas', 'gasolio')), ...faChecks(P.fat).map(tag('fat', 'fatture')), ...(P.ly && P.ly.length ? lyChecks(P.ly, lyDocList(P.ly)).map(tag('ly', 'lyreco')) : []), ...(P.am && P.am.length ? amChecks(P.am, amArts(P.am)).map(tag('am', 'amazon')) : [])];
    if (P.gas.length && !P.gas.some(r => gPrezzo(r) > 0)) out.push({ a: 'gas', t: 'info', h: 'Prezzo del gasolio non impostato', d: `${fmtNum(gSum(P.gas, 'litri'), 0)} litri senza costo: il totale comprende solo i noleggi.`, v: '—', go: 'gasprice' });
    const merged = [...groupBy(out, x => x.a + '|' + x.h)].map(([, v]) => v.length === 1 ? v[0] : { ...v[0], h: `${v[0].h} · ${v.length} casi`, d: `${v[0].d} E altri ${v.length - 1} casi simili.`, v: v.length + ' casi' });
    return merged.sort((a, b) => (a.t === 'warn' ? 0 : 1) - (b.t === 'warn' ? 0 : 1));
  }

  /* ---------- IA su tutto ---------- */
  function ovSummary(P, V, byM, checks) {
    return netMode(() => {
      const gV = gasVehicles(gasRows()), R = gasRent();
      return {
        periodo: ovP ? mLabel(ovP) : 'tutto il periodo', importi: 'IVA esclusa',
        totali: { attrezzatura: r2(V.att), gls: r2(V.gls), gasolioENoleggi: r2(V.gas), lyreco: r2(V.ly || 0), amazon: r2(V.am || 0), fattureFornitori: r2(P.fat.reduce((a, r) => a + num(r.imponibile), 0)) },
        meseperMese: byM.map(x => ({ mese: x.m, attrezzatura: r2(x.att), gls: r2(x.gls), gasolio: r2(x.gas), lyreco: r2(x.ly || 0), amazon: r2(x.am || 0) })),
        attrezzatura: { ...summary0(P.att), articoliPiuCostosi: undefined },
        gls: { spedizioni: P.gls.length, costo: r2(gTot(P.gls)), kgTassabili: r2(gSum(P.gls, 'kgTass')), perContratto: ['C1', 'C2'].map(c => { const v = P.gls.filter(r => r.contratto === c); return { contratto: c, spedizioni: v.length, costo: r2(gTot(v)) }; }), destinazioniTop: [...groupBy(P.gls, r => r.citta + ' (' + r.prov + ')')].map(([k, v]) => ({ k, costo: r2(gTot(v)), n: v.length })).sort((a, b) => b.costo - a.costo).slice(0, 8) },
        gasolio: { litri: r2(gSum(P.gas, 'litri')), rifornimenti: P.gas.length, prezzoLitro: gasPrice() || null, noleggiMensili: R, mezzi: [...groupBy(P.gas, r => plate(r.targa))].map(([p, v]) => { const x = gV.get(p); let k = 0, kl = 0; if (x) x.seg.forEach((d, id) => { const z = v.find(r => r.id === id); if (z) { k += d; kl += num(z.litri); } }); return { targa: p, nome: gasName(p) || undefined, litri: r2(gSum(v, 'litri')), km: k, kmPerLitro: kl ? r2(k / kl) : null }; }).sort((a, b) => b.litri - a.litri).slice(0, 10) },
        fatture: { numero: P.fat.length, perFornitore: [...groupBy(P.fat, r => String(r.fornitore || '').toUpperCase())].map(([k, v]) => ({ fornitore: k, imponibile: r2(v.reduce((a, r) => a + num(r.imponibile), 0)), fatture: v.length })), daPagare: r2(P.fat.filter(r => !faPaid(r)).reduce((a, r) => a + num(r.totale), 0)), scadute: P.fat.filter(faLate).length },
        lyreco: (() => { const R = lyRows().filter(r => !ovP || String(r.data).slice(0, 7) === ovP); if (!R.length) return undefined; return { nota: 'forniture Lyreco (cancelleria, carta, toner, pulizia, IT) ripartite per centro di costo', imponibile: lySumN(R), perCentro: lyPlist(R).filter(x => x.rows.length).map(x => ({ centro: x.n, imponibile: lySumN(x.rows), righe: x.rows.length })), perCategoria: [...groupBy(R, r => r.categoria || 'Altro')].map(([k, v]) => ({ categoria: k, imponibile: lySumN(v) })), daAttribuire: lySumN(R.filter(r => (r.cdc || LY_NONE) === LY_NONE)), trasporto: lySumN(R.filter(lyIsShip)) }; })(),
        amazon: (() => { const O = amOrd().filter(o => !ovP || String(o.data).slice(0, 7) === ovP); if (!O.length) return undefined; const A = amArts(O); return { nota: 'ordini Amazon (imponibile; dove Amazon non riporta l\'IVA è stimato al 22%)', imponibile: amSumN(O), totalePagato: r2(O.reduce((a, o) => a + num(o.totale), 0)), ordini: O.length, imponibileStimato: amSumN(O.filter(amEst)), perCentro: amPlist(O).filter(x => x.rows.length).map(x => ({ centro: x.n, imponibile: amSumN(x.rows), ordini: x.rows.length })), perCategoria: [...groupBy(A, a => a.cat)].map(([k, v]) => ({ categoria: k, imponibile: r2(v.reduce((x, a) => x + a.net, 0)) })) }; })(),
        controlli: checks.map(x => ({ area: x.a, livello: x.t === 'warn' ? 'attenzione' : 'info', titolo: x.h, dettaglio: String(x.d).replace(/<[^>]+>/g, ''), impatto: String(x.v).replace(/<[^>]+>/g, '') }))
      };
    });
  }
  const mdLite = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split(/\n+/).map(l => /^\s*[-•]\s+/.test(l) ? `<li>${l.replace(/^\s*[-•]\s+/, '')}</li>` : `<p>${l}</p>`).join('').replace(/(<li>.*?<\/li>)+/g, m => `<ul>${m}</ul>`);
  let ovChat = [];
  function renderOvAI(ctx) {
    const el = $('#ov-ai'); if (!el) return;
    if (isLocal()) { el.hidden = true; return; }
    const AREA = { attrezzatura: 'Attrezzatura', gls: 'GLS', gasolio: 'Gasolio', fatture: 'Fatture', lyreco: 'Lyreco', amazon: 'Amazon', generale: 'Generale' };
    if (!db.ai) {
      el.innerHTML = `<div class="card-h"><h3 class="ai-title">${IC.spark}Intelligenza artificiale</h3></div>
        <p class="muted small" style="margin:0 0 12px">Collega Gemini per far analizzare all'IA tutte le aree (attrezzatura, GLS, gasolio, Lyreco, Amazon, fatture), trovare anomalie e rispondere alle tue domande. La chiave è gratuita su <b>aistudio.google.com</b> → «Get API key» e resta salvata solo nel tuo script Google.</p>
        <div class="ov-key"><input id="ov-key" type="password" placeholder="Incolla la chiave API di Gemini" autocomplete="off"><button class="btn primary sm" id="ov-key-go" type="button">Collega</button></div>`;
      return;
    }
    const ins = cfg('insightsAll');
    el.innerHTML = `<div class="card-h"><h3 class="ai-title">${IC.spark}Analisi IA</h3><button class="btn sm primary" id="ov-ai-go" type="button">${ins ? 'Aggiorna analisi' : 'Analizza tutto'}</button></div>
      ${ins ? `<p class="ins-sum">${esc(ins.sintesi || '')}</p><ul class="ins ov-ins">${(ins.punti || []).map(p => `<li class="${esc(p.tipo || '')}"><i></i><span>${p.area && AREA[p.area] ? `<em class="ov-tag t-${esc(p.area)}">${AREA[p.area]}</em>` : ''}${esc(p.testo)}</span></li>`).join('')}</ul><div class="ins-date">Analisi del ${esc(shortDate(ins.data))} · ${esc(ins.per || '')}</div>` : '<p class="muted small" style="margin:0">L\'IA legge i totali, l\'andamento dei mesi e tutti i controlli e ti dice dove intervenire.</p>'}
      <div class="ov-chat">${ovChat.map(m => `<div class="ov-msg ${m.role}">${m.role === 'user' ? esc(m.text) : mdLite(m.text)}</div>`).join('')}</div>
      <form class="ov-ask" id="ov-ask"><input id="ov-q" placeholder="Chiedi all'IA… es. dove posso risparmiare questo mese?" autocomplete="off"><button class="btn sm" type="submit">Chiedi</button></form>`;
    el._ctx = ctx;
  }
  async function ovAnalyze() {
    const el = $('#ov-ai'); if (!el || !el._ctx) return;
    try { busy('L\'IA sta analizzando tutte le aree…'); const r = await aiCall('insights_all', { summary: el._ctx() }); setConfig('insightsAll', { data: today(), per: ovP ? mLabel(ovP) : 'tutto il periodo', sintesi: r.sintesi || '', punti: (r.punti || []).slice(0, 8) }); toast('Analisi aggiornata'); }
    catch (e) { if (!(e instanceof AuthError)) toast(e.message); } finally { busy(); }
  }
  async function ovAsk(q) {
    const el = $('#ov-ai'); if (!el || !el._ctx || !q.trim()) return;
    ovChat.push({ role: 'user', text: q.trim() }); renderOvAI(el._ctx);
    try {
      busy('L\'IA sta rispondendo…');
      const ans = await aiCall('chat', { question: q.trim(), history: ovChat.slice(0, -1).slice(-6), context: JSON.stringify(el._ctx()).slice(0, 30000) });
      ovChat.push({ role: 'ai', text: String(ans || '') });
    } catch (e) { ovChat.pop(); if (!(e instanceof AuthError)) toast(e.message); } finally { busy(); renderOvAI(el._ctx); }
  }

  /* ================= Eventi ================= */
  function bind() {
    window.addEventListener('hashchange', go);
    $('#sheet-form').addEventListener('submit', e => {
      e.preventDefault();
      const res = onSubmit && onSubmit(new FormData(e.target));
      if (res === true) closeSheet(); else if (res && res.then) res.then(v => { if (v === true) closeSheet(); });
    });
    $('#sheet-del').onclick = () => { if (onDelete && onDelete() === true) closeSheet(); };
    $$('[data-close]').forEach(b => (b.onclick = closeSheet));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });
    $('#fab').onclick = () => view === 'gasolio' ? formGas() : view === 'fatture' ? (aiReady() ? readFatAI() : formFat()) : formMov(); $('#add-top').onclick = () => formMov();

    document.addEventListener('click', e => {
      const t = e.target;
      const s = t.closest('[data-soc]'); if (s) { soc = s.dataset.soc; LS.set('cdc_soc', soc); if (view === 'attrezzatura') ccAnim = true; render(); return; }
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
      if (t.closest('.iva-tg')) { ivaOn = !ivaOn; try { localStorage.setItem('cdc_iva', ivaOn ? '1' : '0'); } catch {} if (view === 'attrezzatura') ccAnim = true; if (view === 'home') ovAnim = true; render(); toast(ivaOn ? 'Importi con IVA inclusa' : 'Importi senza IVA'); return; }
      const ovm = t.closest('[data-ovm]'); if (ovm) { ovP = ovP === ovm.dataset.ovm ? '' : ovm.dataset.ovm; ovAnim = true; renderOverview(); return; }
      if (t.closest('#ov-prev') || t.closest('#ov-next')) { const o = [...$('#ov-per').options].map(x => x.value), i = o.indexOf(ovP) + (t.closest('#ov-prev') ? 1 : -1); if (i >= 0 && i < o.length) { ovP = o[i]; ovAnim = true; renderOverview(); } return; }
      const ovg = t.closest('[data-ovgo]'); if (ovg) { const g = ovg.dataset.ovgo; if (g === 'gls') { gMonth = ovP || 'tutto'; gKeep = true; } if (g === 'gasolio') gasP = ovP; if (g === 'fatture') faP = ovP; if (g === 'movzero') { Object.assign(f, { q: '', cat: '', per: 'zero', centro: '' }); mLimit = 150; location.hash = 'movimenti'; } else if (g === 'gasprice') { location.hash = 'gasolio'; setTimeout(formGasPrice, 300); } else location.hash = g; return; }
      const ckf = t.closest('[data-ckf]'); if (ckf) { const k = ckf.dataset.ckf; $$('.ov-cf').forEach(b => b.classList.toggle('on', b === ckf)); $$('.ov-ci').forEach(b => { b.hidden = !!k && b.dataset.cka !== k; }); const c = $('#ov-ck'); if (c) c.classList.toggle('all', !!k || c.classList.contains('open')); const mb = $('#ov-ckmore'); if (mb) mb.hidden = !!k || c.classList.contains('open'); return; }
      if (t.closest('#ov-ckmore')) { const c = $('#ov-ck'); c.classList.add('all', 'open'); t.closest('#ov-ckmore').hidden = true; return; }
      if (t.closest('#ov-ai-go')) { ovAnalyze(); return; }
      if (t.closest('#ov-key-go')) { const k = $('#ov-key').value.trim(); if (!k) return; (async () => { try { busy('Collego Gemini…'); await api('setKey', { key: k }); db.ai = true; save(); toast('Gemini collegato'); render(); } catch (er) { if (!(er instanceof AuthError)) toast(er.message); } finally { busy(); } })(); return; }
      if (t.closest('#fa-ai')) { readFatAI(); return; }
      if (t.closest('#fa-add')) { formFat(); return; }
      if (t.closest('#fa-imp')) { importFat(); return; }
      if (t.closest('#fa-xls')) { exportFat(); return; }
      if (t.closest('#fa-more')) { faLimit = 9999; renderFatList(); return; }
      if (t.closest('#fa-prev') || t.closest('#fa-next')) { const o = [...$('#fa-per').options].map(x => x.value), i = o.indexOf(faP) + (t.closest('#fa-prev') ? 1 : -1); if (i >= 0 && i < o.length) { faP = o[i]; faAnim = true; renderFat(); } return; }
      const fap = t.closest('[data-faper]'); if (fap) { faP = fap.dataset.faper; faAnim = true; renderFat(); return; }
      const faq = t.closest('[data-faq]'); if (faq) { const ids = faq.dataset.faq.split(' '); faF.q = ''; faF.forn = ''; faF.stato = ''; renderFatList(null, faRows().filter(r => ids.includes(r.id))); $('#fa-cnt').textContent += ' · filtro controllo'; $('#fa-list').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const faf = t.closest('[data-faforn]'); if (faf) { faF.forn = faf.dataset.faforn; $('#fa-ff').value = faF.forn; renderFatList(); $('#fa-list').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const fat = t.closest('[data-fat]'); if (fat) { faDetail(fat.dataset.fat); return; }
      if (t.closest('#am-imp') || t.closest('#am-imp2') || t.closest('#am-imp3')) { importAm(); return; }
      if (t.closest('#am-how')) { amHow(); return; }
      if (t.closest('#am-xls')) { exportAm(); return; }
      if (t.closest('#am-ai')) { amClassifyAI(); return; }
      if (t.closest('#am-cdc') || t.closest('#am-cdc2')) { lyCdcForm(); return; }
      if (t.closest('#am-prev') || t.closest('#am-next')) { const o = [...$('#am-per').options].map(x => x.value), i = o.indexOf(amP) + (t.closest('#am-prev') ? 1 : -1); if (i >= 0 && i < o.length) { amP = o[i]; amAnim = true; renderAm(); } return; }
      const amTo = sel => { const c = $(sel); if (c) (c.closest('.card') || c).scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      const amOf = k => { amOrdF = k; amOrdLimit = k ? 999 : 12; $$('[data-amof]').forEach(b => b.classList.toggle('on', b.dataset.amof === k)); renderAmOrds(); };
      if (t.closest('#am-omore')) { amOrdLimit = 999; renderAmOrds(); return; }
      if (t.closest('#am-more')) { amLimit = 99999; renderAmList(); return; }
      const amof = t.closest('[data-amof]'); if (amof) { amOf(amof.dataset.amof); return; }
      const amac = t.closest('[data-amact]'); if (amac) { amOf(amac.dataset.amact === 'amest' ? 'est' : 'na'); amTo('#am-ords'); return; }
      const amid = t.closest('[data-amids]'); if (amid) { renderAmOrds.ids = amid.dataset.amids.split(' '); amOf('ids'); $('#am-ocnt').textContent += ' · filtro controllo'; amTo('#am-ords'); return; }
      const amaq = t.closest('[data-amartq]'); if (amaq) { amArtQ = amaq.dataset.amartq; $('#am-aq').value = amArtQ; renderAmArt(); amTo('#am-art'); return; }
      const amak = t.closest('[data-amartk]'); if (amak) { amF.q = amak.dataset.amartk; $('#am-q').value = amF.q; renderAmList(); amTo('#am-list'); return; }
      const amca = t.closest('[data-amcat]'); if (amca) { amF.cat = amF.cat === amca.dataset.amcat ? '' : amca.dataset.amcat; $('#am-fk').value = amF.cat; renderAmList(); if (amF.cat) amTo('#am-list'); return; }
      const amve = t.closest('[data-amvend]'); if (amve) { amF.vend = amF.vend === amve.dataset.amvend ? '' : amve.dataset.amvend; $('#am-fv').value = amF.vend; renderAmList(); if (amF.vend) amTo('#am-list'); return; }
      const ampe = t.closest('[data-amper]'); if (ampe) { amP = amP === ampe.dataset.amper ? '' : ampe.dataset.amper; amAnim = true; renderAm(); return; }
      const amcd = t.closest('[data-amcdc]'); if (amcd && !t.closest('#sheet')) { const k = amcd.dataset.amcdc; amF.cdc = amF.cdc === k ? '' : k; $$('#am-map .tr-pin, #am-rank .cr-row').forEach(x => x.classList.toggle('on', x.dataset.amcdc === amF.cdc)); $('#am-fc').value = amF.cdc; renderAmList(); if (amF.cdc) amTo('#am-list'); return; }
      const amor = t.closest('[data-amord]'); if (amor && !t.closest('#sheet')) { amOrdDetail(amor.dataset.amord); return; }
      if (t.closest('#ly-imp') || t.closest('#ly-imp2')) { importLy(); return; }
      if (t.closest('#ly-xls')) { exportLy(); return; }
      if (t.closest('#ly-cdc') || t.closest('#ly-cdc2')) { lyCdcForm(); return; }
      if (t.closest('#ly-prev') || t.closest('#ly-next')) { const o = [...$('#ly-per').options].map(x => x.value), i = o.indexOf(lyP) + (t.closest('#ly-prev') ? 1 : -1); if (i >= 0 && i < o.length) { lyP = o[i]; lyAnim = true; renderLy(); } return; }
      const lyTo = sel => { const c = $(sel); if (c) (c.closest('.card') || c).scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      const lyDf = k => { lyDocF = k; lyDocLimit = k ? 999 : 12; $$('[data-lydf]').forEach(b => b.classList.toggle('on', b.dataset.lydf === k)); renderLyDocs(); };
      if (t.closest('#ly-dmore')) { lyDocLimit = 999; renderLyDocs(); return; }
      if (t.closest('#ly-more')) { lyLimit = 99999; renderLyList(); return; }
      const lydf = t.closest('[data-lydf]'); if (lydf) { lyDf(lydf.dataset.lydf); return; }
      const lyac = t.closest('[data-lyact]'); if (lyac) { lyDf('na'); lyTo('#ly-docs'); return; }
      const lyid = t.closest('[data-lyids]'); if (lyid) { renderLyDocs.ids = lyid.dataset.lyids.split(' '); lyDf('ids'); $('#ly-dcnt').textContent += ' · filtro controllo'; lyTo('#ly-docs'); return; }
      const lyaq = t.closest('[data-lyartq]'); if (lyaq) { lyArtQ = lyaq.dataset.lyartq; $('#ly-aq').value = lyArtQ; renderLyArt(); lyTo('#ly-art'); return; }
      const lyca = t.closest('[data-lycat]'); if (lyca && !t.closest('#sheet')) { lyF.cat = lyF.cat === lyca.dataset.lycat ? '' : lyca.dataset.lycat; $('#ly-fk').value = lyF.cat; renderLyList(); if (lyF.cat) lyTo('#ly-list'); return; }
      const lype = t.closest('[data-lyper]'); if (lype) { lyP = lyP === lype.dataset.lyper ? '' : lype.dataset.lyper; lyAnim = true; renderLy(); return; }
      const lycd = t.closest('[data-lycdc]'); if (lycd && !t.closest('#sheet')) { const k = lycd.dataset.lycdc; lyF.cdc = lyF.cdc === k ? '' : k; $$('#ly-map .tr-pin, #ly-rank .cr-row').forEach(x => x.classList.toggle('on', x.dataset.lycdc === lyF.cdc)); $('#ly-fc').value = lyF.cdc; renderLyList(); if (lyF.cdc) lyTo('#ly-list'); return; }
      const lydo = t.closest('[data-lydoc]'); if (lydo) { const id = lydo.dataset.lydoc; if (t.closest('#sheet')) { closeSheet(); setTimeout(() => lyDocDetail(id), 250); } else lyDocDetail(id); return; }
      const lyro = t.closest('[data-lyrow]'); if (lyro) { const r = lyRows().find(x => String(x.id) === lyro.dataset.lyrow); if (r) lyRowForm(r); return; }
      const lyar = t.closest('[data-lyart]'); if (lyar) { lyF.q = lyar.dataset.lyart; $('#ly-q').value = lyF.q; renderLyList(); lyTo('#ly-list'); return; }
      if (t.closest('#tr-imp')) { importTor(); return; }
      if (t.closest('#tr-xls')) { exportTor(); return; }
      if (t.closest('#tr-mod')) { trForm(); return; }
      if (t.closest('#tr-pdf')) { trPdfAsk(); return; }
      if (t.closest('#ly-pdf')) { rpAsk('ly'); return; }
      if (t.closest('#am-pdf')) { rpAsk('am'); return; }
      const trpd = t.closest('[data-trpdf]'); if (trpd) { const m = trpd.dataset.trpdf; closeSheet(); setTimeout(() => trPdf(m), 260); return; }
      if (t.closest('#tr-copy')) { trCopy(); return; }
      const trfx = t.closest('[data-trfix]'); if (trfx) { trFix(+trfx.dataset.trfix); return; }
      if (t.closest('[data-trnewkit]')) { trKitForm(-1); return; }
      const trsg = t.closest('[data-trsing]'); if (trsg && !t.closest('#sheet')) { trSingForm(+trsg.dataset.trsing); return; }
      if (t.closest('[data-trmat]')) { trForm(); return; }
      const trk = t.closest('[data-trkit]'); if (trk && !t.closest('#sheet')) { trKitDetail(+trk.dataset.trkit); return; }
      if (t.closest('#ga-imp')) { importGas(); return; }
      if (t.closest('#ga-xls')) { exportGas(); return; }
      if (t.closest('#ga-add')) { formGas(); return; }
      if (t.closest('#ga-price') || t.closest('#ga-price2')) { formGasPrice(); return; }
      if (t.closest('#ga-rent')) { formGasRent(); return; }
      const gnm = t.closest('[data-gname]'); if (gnm) { e.stopPropagation(); formGasRent(gnm.dataset.gname); return; }
      if (t.closest('#ga-allv')) { gasShowAll = !gasShowAll; renderGas(); return; }
      if (t.closest('#ga-prev') || t.closest('#ga-next')) { const o = [...$('#ga-per').options].map(x => x.value), i = o.indexOf(gasP) + (t.closest('#ga-prev') ? 1 : -1); if (i >= 0 && i < o.length) { gasP = o[i]; gasAnim = true; renderGas(); } return; }
      const gap = t.closest('[data-gaper]'); if (gap) { gasP = gap.dataset.gaper; gasAnim = true; renderGas(); return; }
      const gas = t.closest('[data-gas]'); if (gas) { const r = gasRows().find(x => String(x.id) === gas.dataset.gas); if (r) formGas(r); return; }
      const gat = t.closest('[data-gtarga]'); if (gat) { gasF.targa = gasF.targa === gat.dataset.gtarga ? '' : gat.dataset.gtarga; $$('.gv-c').forEach(x => x.classList.toggle('on', x.dataset.gtarga === gasF.targa)); $('#ga-ft').value = gasF.targa; renderGasList(); if (gasF.targa) $('#ga-list').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const gaq = t.closest('[data-gaq]'); if (gaq) { gasF.q = ''; gasF.targa = ''; $('#ga-q').value = ''; $('#ga-ft').value = ''; const ids = gaq.dataset.gaq.split(' '); renderGasList(gasRows().filter(r => ids.includes(String(r.id)))); $('#ga-cnt').textContent += ' · filtro controllo'; $('#ga-list').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (t.closest('#ga-more')) { gasLimit = 9999; renderGasList(); return; }
      if (t.closest('#gl-pdf')) { e.preventDefault(); openPdf(); return; }
      if (t.closest('#gl-pdfup')) { uploadPdf(); return; }
      if (t.closest('#gl-imp')) { importGls(); return; }
      if (t.closest('#gl-xls')) { exportGls(); return; }
      if (t.closest('#gl-prev') || t.closest('#gl-next')) { const o = [...$('#gl-mese').options].map(x => x.value), i = o.indexOf(gMonth) + (t.closest('#gl-prev') ? 1 : -1); if (o[i]) { gMonth = o[i]; glsAnim = true; renderGls(); } return; }
      const gmo = t.closest('[data-gmonth]'); if (gmo) { gMonth = gmo.dataset.gmonth; glsAnim = true; renderGls(); return; }
      const gsh = t.closest('[data-gship]'); if (gsh) { glsDetail(gsh.dataset.gship); return; }
      const gq = t.closest('[data-gq]'); if (gq) { gF.q = ''; gF.cdc = ''; gF.contr = ''; renderGlsList(glsRows().filter(r => gIn(r) && gq.dataset.gq.split(' ').includes(String(r.nsped)))); $('#gl-cnt').textContent += ' · filtro anomalia'; $('#gl-ship').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
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
    $('#ov-per').onchange = e => { ovP = e.target.value; ovAnim = true; renderOverview(); };
    $('#fa-per').onchange = e => { faP = e.target.value; faAnim = true; renderFat(); };
    $('#ly-per').onchange = e => { lyP = e.target.value; lyAnim = true; renderLy(); };
    $('#am-per').onchange = e => { amP = e.target.value; amAnim = true; renderAm(); };
    document.addEventListener('input', e => { if (e.target.id === 'am-q') { clearTimeout(qt); qt = setTimeout(() => { amF.q = e.target.value; renderAmList(); }, 180); } if (e.target.id === 'am-aq') { clearTimeout(qt); qt = setTimeout(() => { amArtQ = e.target.value; renderAmArt(); }, 180); } });
    document.addEventListener('change', e => { if (e.target.id === 'am-fc') { amF.cdc = e.target.value; $$('#am-map .tr-pin, #am-rank .cr-row').forEach(x => x.classList.toggle('on', x.dataset.amcdc === amF.cdc)); renderAmList(); } if (e.target.id === 'am-fk') { amF.cat = e.target.value; renderAmList(); } if (e.target.id === 'am-fv') { amF.vend = e.target.value; renderAmList(); } });
    document.addEventListener('input', e => { if (e.target.id === 'ly-q') { clearTimeout(qt); qt = setTimeout(() => { lyF.q = e.target.value; renderLyList(); }, 180); } if (e.target.id === 'ly-aq') { clearTimeout(qt); qt = setTimeout(() => { lyArtQ = e.target.value; renderLyArt(); }, 180); } });
    document.addEventListener('change', e => { if (e.target.id === 'ly-fc') { lyF.cdc = e.target.value; $$('#ly-map .tr-pin, #ly-rank .cr-row').forEach(x => x.classList.toggle('on', x.dataset.lycdc === lyF.cdc)); renderLyList(); } if (e.target.id === 'ly-fk') { lyF.cat = e.target.value; renderLyList(); } if (e.target.id === 'ly-fd') { lyF.doc = e.target.value; renderLyList(); } });
    ['input', 'change'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('#tr-calc') && (e.target.dataset.trq || e.target.dataset.trqs) && (ev === 'change' || e.target.type === 'number')) trQSet(e); }));
    document.addEventListener('input', e => { if (e.target.id === 'fa-q') { clearTimeout(qt); qt = setTimeout(() => { faF.q = e.target.value; renderFatList(); }, 180); } });
    document.addEventListener('change', e => { if (e.target.id === 'fa-ff') { faF.forn = e.target.value; renderFatList(); } if (e.target.id === 'fa-fs') { faF.stato = e.target.value; renderFatList(); } });
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

    $('#login-form').addEventListener('submit', doLogin);
    document.addEventListener('submit', e => { if (e.target.id === 'ov-ask') { e.preventDefault(); const q = $('#ov-q').value; $('#ov-q').value = ''; ovAsk(q); } });
    $('#s-logout').onclick = async () => { if (!confirm('Uscire da questo dispositivo? I dati salvati qui vengono cancellati (restano nel Foglio Google).')) return; if (queue.length && !confirm(`Ci sono ${queue.length} modifiche non ancora inviate: uscendo andranno perse. Continuare?`)) return; try { await api('logout'); } catch {} queue = []; LS.set('cdc_queue', []); lockApp(); toast('Uscito'); };
    $('#s-logout-all').onclick = async () => { if (!confirm('Disconnettere tutti i dispositivi (anche questo)? Servirà di nuovo la password ovunque.')) return; try { await api('logoutAll'); } catch {} lockApp(); toast('Tutti i dispositivi disconnessi'); };
    window.addEventListener('online', () => { online = true; flush(); setSync(); });
    window.addEventListener('offline', () => { online = false; setSync(); });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (view === 'movimenti' || view === 'articoli') render(); if (view === 'lyreco' && $('#ly-list')) { renderLyList(); renderLyDocs(); pzMap.redraw(); } if (view === 'amazon' && $('#am-list')) { renderAmList(); renderAmOrds(); pzMap.redraw(); } }, 200); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && url && !isLocal()) pull(); });
  }

  function start() {
    if (top !== self) { try { top.location = self.location; } catch { document.body.innerHTML = ''; } return; }
    if (!isLocal() && !tok) { showLogin(); return; }
    $('#setup').hidden = true; $('#app').hidden = false;
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
