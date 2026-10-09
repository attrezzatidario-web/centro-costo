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
    if (view === 'centri') ccAnim = true;
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

  function ccStats(rows) {
    const T = sumT(rows), by = groupBy(rows, r => r.centro || '—');
    const list = centri().map(c => ({ c, rows: by.get(c) || [] })).concat([...by.keys()].filter(k => !centri().includes(k)).map(k => ({ c: k, rows: by.get(k) })));
    list.forEach(x => (x.t = sumT(x.rows)));
    list.sort((p, q) => q.t - p.t);
    return { T, list: list.filter(x => x.rows.length || num(budget()[x.c])) };
  }

  function renderCentri() {
    const rows = rowsSoc();
    const { T, list } = ccStats(rows);
    sub(soc || 'Tutte le società');
    if (!list.find(x => x.c === selCC)) selCC = list[0] ? list[0].c : '';
    const anim = ccAnim && !reduced(); ccAnim = false;
    const v = $('#v-centri'); v.classList.toggle('cc-anim', anim);

    // società
    $('#c-soc').innerHTML = [['', 'Tutte'], ['Soluzione Veicolare', 'Soluzione Veicolare'], ['Attrezzati', 'Attrezzati']].map(([k, l]) => `<button data-soc="${esc(k)}" class="${soc === k ? 'on' : ''}">${esc(l)}</button>`).join('');

    // hero
    const top2 = list.slice(0, 2).reduce((s, x) => s + x.t, 0);
    $('#c-hero').innerHTML = `
      <div class="ch-main"><span class="label">Spesa totale dei centri</span><div class="ch-big" id="c-tot">0 €</div><span class="muted small">${list.filter(x => x.rows.length).length} centri attivi · ${fmtNum(rows.length, 0)} righe</span></div>
      <div class="ch-kpis">
        <div><span>Concentrazione</span><b>${fmtNum(pct(top2, T), 1)}%</b><small>nei primi 2 centri</small></div>
        <div><span>Media per centro</span><b>${eur0(list.length ? T / list.filter(x => x.rows.length).length : 0)}</b><small>spesa media</small></div>
      </div>`;
    countTo($('#c-tot'), T, eur0);

    // mappa
    const mx = Math.max(1, ...list.map(x => x.t));
    const pins = list.filter(x => GEO[x.c]).map((x, i) => { const [px, py] = proj(GEO[x.c]); return { ...x, px, py, r: 4 + 8 * Math.sqrt(x.t / mx), i }; });
    const hq = pins.find(p => p.c === HQ);
    const arcs = hq ? pins.filter(p => p !== hq).map((p, i) => {
      const dx = p.px - hq.px, dy = p.py - hq.py, L = Math.hypot(dx, dy) || 1, bend = Math.min(60, L * .35);
      const cx = (hq.px + p.px) / 2 - dy / L * bend, cy = (hq.py + p.py) / 2 + dx / L * bend;
      return `<path id="arc-${i}" class="cm-arc" pathLength="1" style="--d:${900 + i * 140}ms" d="M${hq.px.toFixed(1)} ${hq.py.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${p.px.toFixed(1)} ${p.py.toFixed(1)}"/>
        <circle class="cm-dot" r="2.2"><animateMotion dur="${(2.2 + L / 160).toFixed(2)}s" begin="${(1.5 + i * .25).toFixed(2)}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1"><mpath href="#arc-${i}"/></animateMotion></circle>`;
    }).join('') : '';
    const lab = p => {
      const [dx, dy, an] = LBL[p.c] || [p.r + 10, -6, 'start'];
      const lx = p.px + dx, ly = p.py + dy, ex = lx + (an === 'end' ? 4 : -4);
      return `<g class="cm-lbl" data-centro="${esc(p.c)}" style="--d:${1300 + p.i * 90}ms">
        <path class="cm-lead" d="M${p.px.toFixed(1)} ${p.py.toFixed(1)} L${ex.toFixed(1)} ${(ly - 4).toFixed(1)}"/>
        <text x="${lx.toFixed(1)}" y="${(ly - 6).toFixed(1)}" text-anchor="${an}" class="cm-n">${esc(p.c)}${p.c === HQ ? ' · sede' : ''}</text>
        <text x="${lx.toFixed(1)}" y="${(ly + 9).toFixed(1)}" text-anchor="${an}" class="cm-v">${eur0(p.t)} · ${fmtNum(pct(p.t, T), 1)}%</text></g>`;
    };
    $('#c-map').innerHTML = `<svg viewBox="0 0 400 440" class="cm-svg" role="img" aria-label="Mappa dei centri di costo">
      <path class="cm-land" pathLength="1" d="${IT_PATH}"/>
      ${arcs}
      ${pins.slice().reverse().map(p => `<g class="cm-pin${p.c === selCC ? ' on' : ''}" data-centro="${esc(p.c)}" style="--d:${700 + p.i * 110}ms" transform="translate(${p.px.toFixed(1)} ${p.py.toFixed(1)})">
        <circle class="cm-pulse" r="${p.r.toFixed(1)}"/><circle class="cm-hit" r="${(p.r + 8).toFixed(1)}"/><circle class="cm-c" r="${p.r.toFixed(1)}"/></g>`).join('')}
      ${pins.map(lab).join('')}
    </svg>${list.some(x => !GEO[x.c]) ? `<div class="muted small cm-note">Non in mappa: ${list.filter(x => !GEO[x.c]).map(x => esc(x.c)).join(', ')}</div>` : ''}`;

    // classifica
    const bud = budget();
    $('#c-rank').innerHTML = list.map((x, i) => {
      const b = num(bud[x.c]), over = b && x.t > b;
      return `<button class="cr-row${x.c === selCC ? ' on' : ''}" data-centro="${esc(x.c)}" style="--d:${200 + i * 80}ms">
        <span class="cr-n">${i + 1}</span>
        <span class="cr-main"><span class="cr-top"><b>${esc(x.c)}</b><span><em>${fmtNum(pct(x.t, T), 1)}%</em><strong data-count="${x.t}">${eur0(x.t)}</strong></span></span>
        <span class="cr-track"><i class="${over ? 'over' : ''}" style="width:${(x.t / mx * 100).toFixed(2)}%"></i>${b ? `<u style="left:${Math.min(100, b / mx * 100).toFixed(2)}%" title="Budget ${esc(eur0(b))}"></u>` : ''}</span>
        <span class="cr-sub">${fmtNum(x.rows.length, 0)} righe · ${fmtNum(new Set(x.rows.map(artKey)).size, 0)} articoli${b ? ' · budget ' + eur0(b) : ''}</span></span>
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
      const bs = act.filter(x => num(bud[x.c])); const ov = bs.filter(x => x.t > num(bud[x.c]));
      if (bs.length) ins.push({ ic: ov.length ? 'warn' : 'ok', t: ov.length ? `Budget superato in <b>${ov.map(x => esc(x.c)).join(', ')}</b>` : 'Tutti i centri entro il budget', v: `${bs.length - ov.length}/${bs.length}` });
    }
    const II = { up: '<path d="M4 17l6-6 4 4 6-7M14 8h6v6"/>', warn: '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>', top: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.8 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>' };
    $('#c-ins').innerHTML = ins.length ? `<div class="cf-sub">Indicatori</div>` + ins.map((x, i) => `<div class="ci-row ${x.ic}"${x.go ? ` data-gozero="${esc(x.go)}"` : ''} style="--d:${600 + i * 90}ms"><span class="ci-ic"><svg viewBox="0 0 24 24">${II[x.ic]}</svg></span><span class="ci-t">${x.t}</span><b>${x.v}</b></div>`).join('') : '';
    if (anim) $$('#c-rank [data-count]').forEach(el => { el._v = 0; countTo(el, +el.dataset.count, eur0); });

    renderFocus(list, T, anim);
    renderMatrix(rows, list, T, anim);
  }

  function selectCC(c) {
    if (c === selCC) return;
    selCC = c;
    $$('#c-map .cm-pin').forEach(p => p.classList.toggle('on', p.dataset.centro === c));
    $$('#c-rank .cr-row').forEach(p => p.classList.toggle('on', p.dataset.centro === c));
    const rows = rowsSoc(); const { T, list } = ccStats(rows);
    renderFocus(list, T, !reduced());
    if (!isDesk()) $('#c-focus').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderFocus(list, T, anim) {
    const el = $('#c-focus');
    const x = list.find(z => z.c === selCC);
    if (!x) { el.innerHTML = '<div class="empty">Nessun centro</div>'; return; }
    el.classList.remove('cf-in'); void el.offsetWidth; if (anim) el.classList.add('cf-in');
    const rows = x.rows, art = articoli(rows), n = rows.length;
    const cats = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => ({ k, v: sumT(v) })).sort((p, q) => q.v - p.v);
    const seg = cats.slice(0, 5); const rest = cats.slice(5).reduce((s, c) => s + c.v, 0);
    if (rest > 0) seg.push({ k: 'Altre categorie', v: rest, other: true });
    const b = num(budget()[x.c]), rank = list.indexOf(x) + 1;
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
            <div><span>Spesa</span><b id="cf-tot">0 €</b></div>
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
    countTo($('#cf-tot'), x.t, eur0);
    // ciambella: segmenti con 2px di stacco, disegnati in sequenza
    const C = 2 * Math.PI * 62, gap = seg.length > 1 ? 2.5 : 0;
    const segs = $$('.dn-s', el), tot = seg.reduce((s, z) => s + z.v, 0) || 1;
    let acc = 0; const parts = seg.map(z => { const len = z.v / tot * C; const o = { start: acc, len }; acc += len; return o; });
    const draw = k => segs.forEach((c, i) => { const p = parts[i], vis = Math.max(0, Math.min(p.len - gap, k * C - p.start)); c.style.strokeDasharray = `${Math.max(0, vis)} ${C}`; c.style.strokeDashoffset = -p.start; });
    if (!anim) draw(1); else { draw(0); const t0 = performance.now(); const st = now => { const k = Math.min(1, (now - t0 - 150) / 900); const e = k < 0 ? 0 : 1 - Math.pow(1 - k, 3); draw(e); if (k < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); }
  }

  function renderMatrix(rows, list, T, anim) {
    const cs = list.filter(x => x.rows.length).map(x => x.c);
    const ks = [...groupBy(rows, r => r.categoria || 'Altro')].map(([k, v]) => [k, sumT(v)]).sort((p, q) => q[1] - p[1]).map(x => x[0]);
    const cell = {};
    rows.forEach(r => { const k = (r.categoria || 'Altro') + '|' + (r.centro || '—'); cell[k] = (cell[k] || 0) + tot(r); });
    const mxv = Math.max(1, ...Object.values(cell));
    const heat = v => !v ? 'h0' : v / mxv > .45 ? 'h3' : v / mxv > .15 ? 'h2' : v / mxv > .03 ? 'h1' : '';
    const byC = new Map(list.map(x => [x.c, x.t]));
    $('#c-matrix').innerHTML = cs.length ? `<table class="mx${anim ? ' mx-anim' : ''}"><thead><tr><th>Categoria</th>${cs.map(c => `<th>${esc(c)}</th>`).join('')}<th>Totale</th></tr></thead><tbody>
      ${ks.map((k, r) => `<tr><td title="${esc(k)}">${esc(k)}</td>${cs.map((c, j) => { const v = cell[k + '|' + c] || 0; return `<td class="${heat(v)}" style="--d:${(r + j) * 35}ms">${v ? eur0(v) : '—'}</td>`; }).join('')}<td><b>${eur0(cs.reduce((s, c) => s + (cell[k + '|' + c] || 0), 0))}</b></td></tr>`).join('')}
      <tr class="tot"><td>Totale</td>${cs.map(c => `<td>${eur0(byC.get(c) || 0)}</td>`).join('')}<td>${eur0(T)}</td></tr></tbody></table>` : '<div class="empty">Nessun dato</div>';
  }

  // tooltip sulla mappa
  function mapTip(e) {
    const pin = e.target.closest('.cm-pin'), wrap = $('#c-map');
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
      const s = t.closest('[data-soc]'); if (s) { soc = s.dataset.soc; LS.set('cdc_soc', soc); if (view === 'centri') ccAnim = true; render(); return; }
      const go2 = t.closest('[data-go]'); if (go2) { location.hash = go2.dataset.go; return; }
      if (t.closest('#k-zero-card')) { Object.assign(f, { q: '', centro: '', cat: '', per: 'zero' }); location.hash = 'movimenti'; return; }
      const gm = t.closest('[data-gomov]'); if (gm) { Object.assign(f, { q: '', cat: '', per: '', centro: gm.dataset.gomov }); mLimit = 150; location.hash = 'movimenti'; return; }
      const gz = t.closest('[data-gozero]'); if (gz) { Object.assign(f, { q: '', cat: '', per: 'zero', centro: gz.dataset.gozero }); mLimit = 150; location.hash = 'movimenti'; return; }
      const sc = t.closest('#v-centri [data-centro]'); if (sc) { selectCC(sc.dataset.centro); return; }
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

    $('#c-map').addEventListener('mousemove', mapTip); $('#c-map').addEventListener('mouseleave', () => { const t = $('#c-map .cm-tip'); if (t) t.remove(); });
    $('#chat-form').addEventListener('submit', e => { e.preventDefault(); ask($('#chat-q').value); });
    $('#chat-q').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && isDesk()) { e.preventDefault(); ask(e.target.value); } });
    $('#chat-q').addEventListener('input', e => { e.target.style.height = ''; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px'; });

    $('#s-pull').onclick = () => pull(true);
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
