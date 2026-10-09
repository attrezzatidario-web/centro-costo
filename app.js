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

  let url = LS.get('cdc_url', '');
  let db = LS.get('cdc_data', { movimenti: [], config: {}, ai: false });
  let queue = LS.get('cdc_queue', []);
  let syncing = false, online = navigator.onLine;
  const isLocal = () => url === 'local';
  const save = () => { LS.set('cdc_data', db); LS.set('cdc_queue', queue); };

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
  const parseD = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const validD = s => /^\d{4}-\d{2}-\d{2}/.test(String(s || ''));
  const monthName = key => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }); };
  const monthShort = key => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('it-IT', { month: 'short' }).replace('.', ''); };
  const shortDate = s => validD(s) ? parseD(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const num = v => { if (typeof v === 'number') return v; const n = parseFloat(String(v ?? '').replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };
  const r2 = n => Math.round(n * 100) / 100;
  const tot = r => r2(num(r.quantita) * num(r.prezzo));
  const sumT = arr => r2(arr.reduce((a, r) => a + tot(r), 0));
  const ccAbbr = s => { const w = String(s || '?').trim().split(/\s+/); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };
  const ccIc = c => `<span class="ic cc${String(c).toUpperCase() === 'ATTREZZATI' ? ' cc-att' : ''}">${esc(ccAbbr(c))}</span>`;
  const groupBy = (arr, fn) => { const m = new Map(); arr.forEach(x => { const k = fn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); }); return m; };
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
  const KEY = { Movimenti: 'movimenti' };
  function applyLocal(op) {
    if (op.sheet === 'Config') {
      if (op.action === 'delete') delete db.config[op.id];
      else { try { db.config[op.row.chiave] = JSON.parse(op.row.valore); } catch { db.config[op.row.chiave] = op.row.valore; } }
      return;
    }
    const k = KEY[op.sheet];
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
      db = { movimenti: j.data.movimenti || [], config: j.data.config || {}, ai: !!j.data.ai, v: j.v };
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
  let chat = LS.get('cdc_chat', []);

  const rowsSoc = () => soc ? db.movimenti.filter(r => (r.societa || 'Soluzione Veicolare') === soc) : db.movimenti;

  /* ================= Router ================= */
  const TITLES = { home: 'Home', movimenti: 'Movimenti', centri: 'Centri di costo', articoli: 'Articoli', assistente: 'Assistente IA', impostazioni: 'Impostazioni' };
  function go() {
    const h = location.hash.slice(1) || 'home';
    view = TITLES[h] ? h : 'home';
    $$('.view').forEach(v => (v.hidden = v.dataset.v !== view));
    $$('.nav a').forEach(x => x.classList.toggle('active', x.dataset.view === view));
    $('#title').textContent = TITLES[view];
    $('#fab').hidden = view === 'assistente' || view === 'impostazioni';
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    const fn = { home: renderHome, movimenti: renderMov, centri: renderCentri, articoli: renderArt, assistente: renderChat, impostazioni: renderSettings }[view];
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
    $('#k-tot-s').textContent = `${fmtNum(rows.length, 0)} righe`;

    const byC = [...groupBy(rows, r => r.centro || '—')].map(([k, v]) => ({ k, v: sumT(v), n: v.length })).sort((x, y) => y.v - x.v);
    $('#k-top').textContent = byC[0] ? byC[0].k : '—';
    $('#k-top-s').textContent = byC[0] ? `${eur0(byC[0].v)} · ${fmtNum(pct(byC[0].v, T), 1)}%` : '';

    const arts = new Set(rows.map(artKey));
    countTo($('#k-art'), arts.size, v => fmtNum(Math.round(v), 0));
    $('#k-art-s').textContent = 'codici e voci uniche';
    const zero = rows.filter(r => !num(r.prezzo)).length;
    countTo($('#k-zero'), zero, v => fmtNum(Math.round(v), 0));

    const bud = budget();
    $('#h-centri').innerHTML = barRows(byC.map(x => ({ ...x, bud: num(bud[x.k]) || 0 })), T, { click: 'centro' });

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
    return `<div class="item" data-id="${esc(r.id)}">${ccIc(r.centro)}<div class="main"><div class="t">${esc(r.descrizione)}</div><div class="s">${esc(r.centro || '—')} · ${esc(r.categoria || 'Altro')} · ${qtyFmt(r.quantita)} ${esc(r.um || '')} × ${z ? 'prezzo mancante' : eurP(r.prezzo)}</div></div><div class="amt${z ? ' zero' : ''}">${eur(tot(r))}</div></div>`;
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
  function summary(rows) {
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
    $('#m-count').textContent = `${fmtNum(list.length, 0)} righe`;
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
      $('#m-list').innerHTML = `<div class="card tbl-card"><table class="tbl"><thead><tr><th>Descrizione</th><th>Centro</th><th>Categoria</th><th class="r">Q.tà</th><th class="r">Prezzo</th><th class="r">Totale</th></tr></thead><tbody>${shown.map(r => {
        const z = !num(r.prezzo);
        return `<tr data-id="${esc(r.id)}"><td><div class="tcell">${ccIc(r.centro)}<div class="tt"><b>${esc(r.descrizione)}</b><small>${[r.codice ? 'Cod. ' + r.codice : '', r.ndoc ? 'Doc. ' + r.ndoc : '', shortDate(r.data), r.fornitore].filter(Boolean).map(esc).join(' · ') || '&nbsp;'}</small></div></div></td><td class="m2 ed" data-ed="centro" title="Clic per cambiare">${esc(r.centro || '—')}</td><td class="ed" data-ed="categoria" title="Clic per cambiare"><span class="chip">${esc(r.categoria || 'Altro')}</span></td><td class="num ed" data-ed="quantita" title="Clic per modificare">${qtyFmt(r.quantita)} <span class="muted small">${esc(r.um || '')}</span></td><td class="num ed" data-ed="prezzo" title="Clic per modificare">${z ? '<span class="chip soon">mancante</span>' : eurP(r.prezzo)}</td><td class="num amt">${eur(tot(r))}</td></tr>`;
      }).join('')}</tbody></table></div>${more}`;
    } else {
      $('#m-list').innerHTML = `<div class="day">${shown.map(itemHtml).join('')}</div>${more}`;
    }
  }

  /* ================= CENTRI ================= */
  function renderCentri() {
    const rows = rowsSoc();
    const T = sumT(rows);
    sub(`${eur0(T)} totali${soc ? ' · ' + soc : ''}`);
    const by = groupBy(rows, r => r.centro || '—');
    const bud = budget();
    const list = centri().map(c => ({ c, rows: by.get(c) || [] })).concat([...by.keys()].filter(k => !centri().includes(k)).map(k => ({ c: k, rows: by.get(k) })));
    list.forEach(x => (x.t = sumT(x.rows)));
    list.sort((x, y) => y.t - x.t);
    $('#c-grid').innerHTML = list.map((x, i) => {
      const cats = [...groupBy(x.rows, r => r.categoria || 'Altro')].map(([k, v]) => [k, sumT(v)]).sort((p, q) => q[1] - p[1]).slice(0, 3);
      const b = num(bud[x.c]);
      const art = new Set(x.rows.map(artKey)).size;
      return `<div class="card cc-card rise" style="animation-delay:${i * 50}ms" data-centro="${esc(x.c)}">
        <div class="cc-top">${ccIc(x.c)}<div><h3>${esc(x.c)}</h3><span class="muted">${fmtNum(x.rows.length, 0)} righe · ${fmtNum(art, 0)} articoli</span></div><span class="pct">${fmtNum(pct(x.t, T), 1)}%</span></div>
        <div class="big">${eur(x.t)}</div>
        ${b ? `<div><div class="prog big"><i style="width:${Math.min(100, x.t / b * 100)}%;${x.t > b ? 'background:var(--danger)' : ''}"></i></div><div class="cc-bud${x.t > b ? ' over' : ''}"><span>Budget ${eur0(b)}</span><span>${x.t > b ? 'Superato di ' + eur0(x.t - b) : 'Restano ' + eur0(b - x.t)}</span></div></div>` : ''}
        <div class="cc-cats">${cats.length ? cats.map(([k, v]) => `<div><span>${esc(k)}</span><b>${eur0(v)}</b></div>`).join('') : '<div><span class="muted">Nessun movimento</span></div>'}</div>
      </div>`;
    }).join('');

    // matrice categoria × centro
    const cs = list.filter(x => x.rows.length).map(x => x.c);
    const ks = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => [k, sumT(v)]).sort((p, q) => q[1] - p[1]).map(x => x[0]);
    const cell = {};
    rows.forEach(r => { const k = (r.categoria || 'Altro') + '|' + (r.centro || '—'); cell[k] = (cell[k] || 0) + tot(r); });
    const mxv = Math.max(1, ...Object.values(cell));
    const heat = v => !v ? 'h0' : v / mxv > .45 ? 'h3' : v / mxv > .15 ? 'h2' : v / mxv > .03 ? 'h1' : '';
    $('#c-matrix').innerHTML = cs.length ? `<table class="mx"><thead><tr><th>Categoria</th>${cs.map(c => `<th>${esc(c)}</th>`).join('')}<th>Totale</th></tr></thead><tbody>
      ${ks.map(k => `<tr><td title="${esc(k)}">${esc(k)}</td>${cs.map(c => { const v = cell[k + '|' + c] || 0; return `<td class="${heat(v)}">${v ? eur0(v) : '—'}</td>`; }).join('')}<td><b>${eur0(cs.reduce((s, c) => s + (cell[k + '|' + c] || 0), 0))}</b></td></tr>`).join('')}
      <tr class="tot"><td>Totale</td>${cs.map(c => `<td>${eur0(sumT(by.get(c) || []))}</td>`).join('')}<td>${eur0(T)}</td></tr></tbody></table>` : '<div class="empty">Nessun dato</div>';
  }

  /* ================= ARTICOLI ================= */
  function articoli(rows) {
    const m = groupBy(rows, artKey);
    return [...m].map(([k, v]) => {
      const prices = v.map(r => num(r.prezzo)).filter(p => p > 0);
      const qty = v.reduce((s, r) => s + num(r.quantita), 0);
      const t = sumT(v);
      const min = prices.length ? Math.min(...prices) : 0, max = prices.length ? Math.max(...prices) : 0;
      return { k, rows: v, desc: v[v.length - 1].descrizione, codice: v[0].codice || '', um: v[0].um || '', n: v.length, qty, tot: t, min, max, avg: qty ? t / qty : 0, var: min ? max / min - 1 : 0, centri: [...new Set(v.map(r => r.centro))] };
    }).sort((x, y) => y.tot - x.tot);
  }
  function renderArt() {
    $('#a-centro').innerHTML = `<option value="">Tutti i centri</option>` + centri().map(c => `<option${c === a.centro ? ' selected' : ''}>${esc(c)}</option>`).join('');
    const q = a.q.trim().toLowerCase();
    let list = articoli(rowsSoc().filter(r => !a.centro || r.centro === a.centro));
    const nVar = list.filter(x => x.var > 0.02).length;
    if (q) list = list.filter(x => `${x.desc} ${x.codice}`.toLowerCase().includes(q));
    if (a.sort === 'qty') list.sort((x, y) => y.qty - x.qty);
    if (a.sort === 'var') list.sort((x, y) => (y.var > 0.02) - (x.var > 0.02) || y.var - x.var);
    if (a.sort === 'n') list.sort((x, y) => y.n - x.n);
    sub(soc || '');
    $('#a-count').textContent = `${fmtNum(list.length, 0)} articoli · ${eur0(list.reduce((s, x) => s + x.tot, 0))}`;
    $('#a-var').hidden = !nVar; $('#a-var').textContent = `${nVar} con prezzo variato`;
    const shown = list.slice(0, aLimit);
    const more = list.length > aLimit ? `<div class="more-row"><button class="btn sm" id="a-more">Mostra altri</button></div>` : '';
    const varChip = x => x.var > 0.02 ? `<span class="chip soon art-var">+${fmtNum(x.var * 100, 0)}%</span>` : '';
    if (!list.length) { $('#a-list').innerHTML = '<div class="card empty-state"><p class="muted">Nessun articolo.</p></div>'; return; }
    if (isDesk()) {
      $('#a-list').innerHTML = `<div class="card tbl-card"><table class="tbl"><thead><tr><th>Articolo</th><th class="r">Acquisti</th><th class="r">Q.tà</th><th class="r">Prezzo medio</th><th class="r">Min – Max</th><th class="r">Totale</th></tr></thead><tbody>${shown.map(x => `<tr data-art="${esc(x.k)}"><td><div class="tt"><b>${esc(x.desc)}</b><small>${[x.codice ? 'Cod. ' + x.codice : '', x.centri.join(', ')].filter(Boolean).map(esc).join(' · ')}</small></div></td><td class="num">${x.n}</td><td class="num">${qtyFmt(x.qty)} <span class="muted small">${esc(x.um)}</span></td><td class="num">${x.avg ? eurP(x.avg) : '—'}</td><td class="num">${x.min ? (x.var > 0.02 ? `${eurP(x.min)} – ${eurP(x.max)} ${varChip(x)}` : eurP(x.min)) : '<span class="chip soon">mancante</span>'}</td><td class="num amt">${eur(x.tot)}</td></tr>`).join('')}</tbody></table></div>${more}`;
    } else {
      $('#a-list').innerHTML = `<div class="day">${shown.map(x => `<div class="item" data-art="${esc(x.k)}"><span class="ic">${esc(String(x.n))}×</span><div class="main"><div class="t">${esc(x.desc)}</div><div class="s">${qtyFmt(x.qty)} ${esc(x.um)} · medio ${x.avg ? eurP(x.avg) : '—'} ${varChip(x)}</div></div><div class="amt">${eur0(x.tot)}</div></div>`).join('')}</div>${more}`;
    }
  }
  function openArt(k) {
    const x = articoli(rowsSoc()).find(z => z.k === k); if (!x) return;
    const rows = [...x.rows].sort((p, q) => String(q.data || '').localeCompare(String(p.data || '')));
    openSheet(x.desc, `
      <div class="kv">
        ${x.codice ? `<div><span>Codice</span><strong>${esc(x.codice)}</strong></div>` : ''}
        <div><span>Spesa totale</span><strong>${eur(x.tot)}</strong></div>
        <div><span>Quantità acquistata</span><strong>${qtyFmt(x.qty)} ${esc(x.um)}</strong></div>
        <div><span>Prezzo medio</span><strong>${x.avg ? eurP(x.avg) : '—'}</strong></div>
        ${x.var > 0.02 ? `<div><span>Variazione prezzo</span><strong class="up">${eurP(x.min)} → ${eurP(x.max)} (+${fmtNum(x.var * 100, 0)}%)</strong></div>` : ''}
      </div>
      <div class="hist"><div class="muted small" style="margin-bottom:4px">${rows.length} acquisti</div>${rows.map(r => `<div class="item" data-id="${esc(r.id)}" style="cursor:pointer">${ccIc(r.centro)}<div class="main"><div class="t">${esc(r.centro)}</div><div class="s">${qtyFmt(r.quantita)} × ${num(r.prezzo) ? eurP(r.prezzo) : 'prezzo mancante'}${r.data && validD(r.data) ? ' · ' + esc(shortDate(r.data)) : ''}${r.ndoc ? ' · Doc. ' + esc(r.ndoc) : ''}</div></div><div class="amt">${eur(tot(r))}</div></div>`).join('')}</div>`,
      null, null, 'Modifica articolo');
    $('#sheet-ok').type = 'button'; $('#sheet-ok').onclick = () => { closeSheet(); setTimeout(() => formArt(k), 250); };
  }

  /* ================= ASSISTENTE ================= */
  const QS = ['Quale centro spende di più e in cosa?', 'Quali articoli hanno avuto aumenti di prezzo?', 'Dove possiamo risparmiare?', 'Riassumi la spesa in DPI per centro', 'Quanto abbiamo speso in elettroutensili?'];
  function md(t) {
    const lines = esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split(/\n/);
    let h = '', ul = false;
    lines.forEach(l => {
      const m = l.match(/^\s*[-*•]\s+(.*)/);
      if (m) { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${m[1]}</li>`; return; }
      if (ul) { h += '</ul>'; ul = false; }
      if (l.trim()) h += `<p>${l}</p>`;
    });
    return h + (ul ? '</ul>' : '');
  }
  function renderChat() {
    sub(aiReady() ? 'Fai domande sui costi in linguaggio naturale' : '');
    const log = $('#chat-log');
    if (!aiReady()) {
      log.innerHTML = `<div class="chat-hello"><span class="es-ic">${IC.spark}</span><p class="muted">Per usare l'assistente collega il Foglio Google e salva la chiave Gemini in <a class="link" href="#impostazioni">Impostazioni</a>.</p></div>`;
      return;
    }
    if (!chat.length) {
      log.innerHTML = `<div class="chat-hello"><span class="es-ic">${IC.spark}</span><p class="muted">Conosco tutti i movimenti di ${soc || 'Soluzione Veicolare e Attrezzati'}. Chiedimi quello che vuoi.</p><div class="qchips">${QS.map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>`;
      return;
    }
    log.innerHTML = chat.map(m => `<div class="msg ${m.role === 'user' ? 'u' : 'a'}${m.err ? ' err' : ''}">${m.role === 'user' ? `<p>${esc(m.text)}</p>` : md(m.text)}</div>`).join('') +
      (ask._busy ? '<div class="msg a typing"><i></i><i></i><i></i></div>' : '') +
      `<div class="qchips" style="justify-content:flex-start"><button type="button" id="chat-reset">${IC.reset.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px;fill:none;stroke:currentColor;stroke-width:2"')} Nuova conversazione</button></div>`;
    log.scrollTop = log.scrollHeight;
  }
  function context(rows) {
    const s = summary(rows);
    const head = `TOTALE: ${s.totale} € su ${s.righe} righe (società: ${s.societa})\nPER CENTRO: ${s.perCentro.map(x => `${x.centro}=${x.totale}€`).join(', ')}\nPER CATEGORIA: ${s.perCategoria.map(x => `${x.categoria}=${x.totale}€`).join(', ')}\nBUDGET ANNUALI: ${JSON.stringify(s.budgetAnnuale)}\n\nRIGHE:\ncentro;societa;categoria;data;ndoc;codice;descrizione;qta;um;prezzo_unit;totale\n`;
    return head + rows.map(r => [r.centro, r.societa === 'Attrezzati' ? 'ATT' : 'SV', r.categoria, validD(r.data) ? r.data : '', r.ndoc || '', r.codice || '', String(r.descrizione || '').replace(/[;\n]/g, ' ').slice(0, 70), num(r.quantita), r.um || '', num(r.prezzo), tot(r)].join(';')).join('\n');
  }
  async function ask(q) {
    q = String(q || '').trim();
    if (!q || ask._busy) return;
    chat.push({ role: 'user', text: q });
    ask._busy = true; LS.set('cdc_chat', chat); renderChat();
    $('#chat-q').value = ''; $('#chat-q').style.height = '';
    try {
      const ans = await aiCall('chat', { question: q, context: context(rowsSoc()), history: chat.slice(0, -1).filter(m => !m.err) });
      chat.push({ role: 'model', text: String(ans || '') });
    } catch (e) {
      chat.push({ role: 'model', text: 'Errore: ' + e.message, err: true });
    }
    ask._busy = false;
    chat = chat.slice(-30); LS.set('cdc_chat', chat);
    if (view === 'assistente') renderChat();
  }

  /* ================= IMPOSTAZIONI ================= */
  function renderSettings() {
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
  const nh = s => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
  function parseWorkbook(wb) {
    const out = [], now = new Date().toISOString();
    wb.SheetNames.forEach(name => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '' });
      const hi = aoa.findIndex(r => r.some(c => nh(c) === 'descrizione'));
      if (hi < 0) return;
      const H = aoa[hi].map(nh);
      const col = (...keys) => { for (const k of keys) { const i = H.indexOf(k); if (i >= 0) return i; } return -1; };
      const c = { cod: col('cod', 'codice', 'codart'), des: col('descrizione'), um: col('um'), q: col('quant', 'quantita', 'qta'), pa: col('pacq', 'prezzoacquisto', 'costo'), pr: col('prezzo'), ind: col('indirizzo', 'centro', 'centrodicosto', 'sede'), doc: col('ndoc', 'documento', 'numdoc'), dt: col('data'), iva: col('imposte', 'iva'), forn: col('fornitore') };
      const isAtt = /attrezzat/i.test(name);
      aoa.slice(hi + 1).forEach(r => {
        const desc = String(r[c.des] ?? '').trim();
        if (!desc) return;
        let d = c.dt >= 0 ? r[c.dt] : '';
        if (d instanceof Date) d = ymd(d);
        else if (typeof d === 'number' && d > 20000) d = ymd(new Date(Math.round((d - 25569) * 864e5)));
        else d = validD(d) ? String(d).slice(0, 10) : '';
        const price = c.pa >= 0 && r[c.pa] !== '' ? num(r[c.pa]) : c.pr >= 0 ? num(r[c.pr]) : 0;
        const centro = (c.ind >= 0 ? String(r[c.ind] || '').trim().toUpperCase() : '') || (isAtt ? 'ATTREZZATI' : 'DA ASSEGNARE');
        out.push({
          id: uid() + out.length.toString(36), data: d, ndoc: c.doc >= 0 ? String(r[c.doc] ?? '') : '', codice: c.cod >= 0 ? String(r[c.cod] ?? '').trim() : '',
          descrizione: desc.replace(/\s+/g, ' '), um: c.um >= 0 ? String(r[c.um] || '').trim().toUpperCase() || 'PZ' : 'PZ',
          quantita: num(r[c.q]), prezzo: price, iva: c.iva >= 0 ? num(r[c.iva]) : 0.22,
          centro, societa: isAtt ? 'Attrezzati' : 'Soluzione Veicolare', categoria: autoCat(desc), fornitore: c.forn >= 0 ? String(r[c.forn] || '') : '', note: '', creato: now
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
      if (!confirm(`${rows.length} righe · ${eur(T)} · ${nc} centri.\n${replace ? 'SOSTITUIRE tutti i movimenti attuali?' : 'Aggiungere ai movimenti attuali?'}`)) return;
      const cc = centri(); const nuovi = [...new Set(rows.map(r => r.centro))].filter(c => !cc.includes(c));
      if (replace) {
        if (!isLocal()) {
          busy('Salvo sul Foglio Google…');
          queue = queue.filter(o => o.sheet !== 'Movimenti');
          await api('replaceAll', { sheet: 'Movimenti', rows });
        }
        db.movimenti = rows; save(); render();
      } else {
        write(rows.map(row => ({ action: 'upsert', sheet: 'Movimenti', row })));
      }
      if (nuovi.length) setConfig('centri', [...cc, ...nuovi]);
      toast(`${rows.length} righe importate`);
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
      <div class="tot-line"><span class="muted">Totale</span><b id="fm-tot">${eur(tot(r))}</b></div>
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
        const row = { ...r, ...Object.fromEntries(fd), quantita: num(fd.get('quantita')), prezzo: num(fd.get('prezzo')) };
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
    const upd = () => { $('#fm-tot').textContent = eur(r2(num(form.quantita.value) * num(form.prezzo.value))); };
    form.quantita.addEventListener('input', upd); form.prezzo.addEventListener('input', upd);
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
      el.inputMode = 'decimal'; el.value = num(r[f0]) ? String(num(r[f0])).replace('.', ',') : ''; el.placeholder = '0,00';
    }
    el.className = 'cell-in';
    td.innerHTML = ''; td.appendChild(el); el.focus(); if (el.select) el.select();
    let done = false;
    const commit = keep => {
      if (done) return; done = true;
      if (!keep) return renderMov();
      const v = f0 === 'centro' || f0 === 'categoria' ? el.value : num(el.value);
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
      <div class="ai-note">Le modifiche valgono per ${x.n === 1 ? 'l\'unica riga' : 'tutte le ' + x.n + ' righe'} di questo articolo</div>
      <label class="f"><span>Descrizione</span><input name="descrizione" required data-focus value="${esc(x.desc)}"></label>
      <div class="f-row">
        <label class="f"><span>Codice articolo</span><input name="codice" value="${esc(x.codice)}"></label>
        <label class="f"><span>Unità</span><select name="um">${opt(UM, x.um || 'PZ')}</select></label>
      </div>
      <label class="f"><span>Categoria</span><select name="categoria">${opt(categorie(), cat)}</select></label>
      <div class="f-row">
        <label class="f"><span>Nuovo prezzo unit. €</span><input name="prezzo" inputmode="decimal" value="${last ? esc(String(num(last.prezzo)).replace('.', ',')) : ''}" placeholder="0,00"></label>
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
          const row = { ...r, descrizione: desc, codice: String(fd.get('codice')).trim(), um: fd.get('um'), categoria: fd.get('categoria') };
          if (dove === 'tutte' || (dove === 'zero' && !num(r.prezzo))) row.prezzo = p;
          return { action: 'upsert', sheet: 'Movimenti', row };
        });
        write(ops); toast(`Articolo aggiornato su ${ops.length} righe`);
        return true;
      });
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
    $('#fab').onclick = () => formMov(); $('#add-top').onclick = () => formMov();
    $('#gear').onclick = () => (location.hash = 'impostazioni');

    document.addEventListener('click', e => {
      const t = e.target;
      const s = t.closest('[data-soc]'); if (s) { soc = s.dataset.soc; LS.set('cdc_soc', soc); render(); return; }
      const go2 = t.closest('[data-go]'); if (go2) { location.hash = go2.dataset.go; return; }
      if (t.closest('#k-zero-card')) { Object.assign(f, { q: '', centro: '', cat: '', per: 'zero' }); location.hash = 'movimenti'; return; }
      const bc = t.closest('.bar-row[data-centro], .cc-card[data-centro]'); if (bc) { Object.assign(f, { q: '', cat: '', per: '', centro: bc.dataset.centro }); mLimit = 150; location.hash = 'movimenti'; return; }
      const bk = t.closest('.bar-row[data-cat]'); if (bk) { Object.assign(f, { q: '', centro: '', per: '', cat: bk.dataset.cat }); mLimit = 150; location.hash = 'movimenti'; return; }
      const ed = t.closest('td.ed'); if (ed && !ed.querySelector('input,select')) { inlineEdit(ed); return; }
      if (t.closest('td.ed')) return;
      const it = t.closest('[data-id]'); if (it && !t.closest('#sheet-body')) { const r = db.movimenti.find(x => String(x.id) === it.dataset.id); if (r) formMov(r); return; }
      if (it && t.closest('#sheet-body')) { const r = db.movimenti.find(x => String(x.id) === it.dataset.id); if (r) { closeSheet(); setTimeout(() => formMov(r), 250); } return; }
      const ar = t.closest('[data-art]'); if (ar) { openArt(ar.dataset.art); return; }
      if (t.closest('#m-more')) { mLimit += 300; renderMov(); return; }
      if (t.closest('#a-more')) { aLimit += 200; renderArt(); return; }
      if (t.closest('#ai-gen')) { genInsights(); return; }
      const qb = t.closest('[data-q]'); if (qb) { ask(qb.dataset.q); return; }
      if (t.closest('#chat-reset')) { chat = []; LS.set('cdc_chat', chat); renderChat(); return; }
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
    $('#a-centro').onchange = e => { a.centro = e.target.value; renderArt(); };

    $('#chat-form').addEventListener('submit', e => { e.preventDefault(); ask($('#chat-q').value); });
    $('#chat-q').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && isDesk()) { e.preventDefault(); ask(e.target.value); } });
    $('#chat-q').addEventListener('input', e => { e.target.style.height = ''; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px'; });

    $('#s-pull').onclick = () => pull(true);
    $('#s-unlink').onclick = () => { if (!confirm('Scollegare l\'app? I dati restano sul Foglio Google.')) return; url = ''; LS.set('cdc_url', ''); db = { movimenti: [], config: {}, ai: false }; queue = []; save(); start(); };
    $('#s-key-go').onclick = async () => {
      const k = $('#s-key').value.trim(); if (!k) return;
      try { busy('Salvo la chiave…'); await api('setKey', { key: k }); db.ai = true; save(); $('#s-key').value = ''; toast('Chiave Gemini salvata'); render(); } catch (e) { toast(e.message); } finally { busy(); }
    };
    $('#s-classify').onclick = classifyAI;
    $('#s-imp-add').onclick = () => importExcel(false);
    $('#s-imp-rep').onclick = () => importExcel(true);
    $('#s-exp').onclick = exportCsv;
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
  start();
  const sp = $('#splash');
  setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 500); }, reduced() ? 0 : 1100);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
