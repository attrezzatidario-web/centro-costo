const load = require(__dirname + '/gasmock.js');
const A = load(process.argv[2]), B = load(process.argv[3]);
const reg = G => G.call({ action: 'register', nome: 'Dario', email: 'attrezzatidario@gmail.com', password: 'Segreta123', codice: 'SV2026' }).result.token;
const TA = reg(A), TB = reg(B);
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; const int = (a, b) => a + Math.floor(rnd() * (b - a + 1)); const pick = a => a[Math.floor(rnd() * a.length)];
const KEYS = ['movimenti', 'clienti', 'config', 'presenze'];
// stessa logica di fusione dell'app
function merge(db, d) {
  if (!d.delta) { KEYS.forEach(k => { db[k] = JSON.parse(JSON.stringify(d[k])); }); db.t = d.t; return 'full'; }
  KEYS.forEach(k => {
    if (k === 'config') {
      if (!d.config && !(d.del && d.del.config)) return;
      if ((d.full || []).includes('config')) db.config = d.config; else { Object.assign(db.config, d.config || {}); ((d.del || {}).config || []).forEach(x => { delete db.config[x]; }); }
      return;
    }
    if ((d.full || []).includes(k)) { db[k] = d[k]; return; }
    const ix = new Map(db[k].map((r, i) => [String(r.id), i]));
    (d[k] || []).forEach(r => { const i = ix.get(String(r.id)); if (i != null) db[k][i] = r; else { ix.set(String(r.id), db[k].length); db[k].push(r); } });
    const del = new Set(((d.del || {})[k] || []).map(String)); if (del.size) db[k] = db[k].filter(r => !del.has(String(r.id)));
  });
  db.t = d.t; return 'delta';
}
const norm = (L, k) => k === 'config' ? JSON.stringify(Object.keys(L).sort().map(x => [x, L[x]])) : JSON.stringify(L.map(r => JSON.stringify(r)).sort());
const ids = { Movimenti: [], Clienti: [], Presenze: [] }, ck = [];
const today = new Date().toISOString().slice(0, 10);
const mkRow = (sh, id) => sh === 'Movimenti' ? { id, data: today, ndoc: pick(['0123', 'DDT 5', '77']), codice: pick(['0042', 'A1', '']), descrizione: 'Art ' + int(1, 99), um: 'PZ', quantita: int(1, 9), prezzo: int(1, 999) / 10, iva: 0.22, centro: 'ROMA', fornitore: 'F' + int(1, 5), creato: today }
  : sh === 'Clienti' ? { id, nome: 'Cliente ' + int(1, 999), piva: '0' + int(1000000000, 9999999999), cap: '00' + int(100, 199), citta: 'Roma', creato: today }
  : { id, dip: 'd1', data: today, ora: '08:0' + int(0, 9) + ':00', tipo: 'in', fonte: 'app' };
const client = { movimenti: [], clienti: [], config: {}, presenze: [], t: 0 };
let fails = 0, nDelta = 0, nFull = 0, nFast = 0;
for (let step = 0; step < 400; step++) {
  const ops = [], n = rnd() < .12 ? int(26, 80) : int(1, 6);
  for (let i = 0; i < n; i++) {
    const sh = pick(['Movimenti', 'Movimenti', 'Clienti', 'Config', 'Presenze']), r = rnd();
    if (sh === 'Config') { const k = r < .3 && ck.length ? pick(ck) : 'k' + int(1, 40); if (!ck.includes(k)) ck.push(k); if (rnd() < .15) ops.push({ action: 'delete', sheet: 'Config', id: k }); else ops.push({ action: 'upsert', sheet: 'Config', row: { chiave: k, valore: JSON.stringify(rnd() < .5 ? { a: int(1, 9) } : String(int(100, 999))) } }); continue; }
    const L = ids[sh];
    if (r < .45 || !L.length) { const id = pick(['x', '0', 'id']) + int(1, 5000); L.push(id); ops.push({ action: 'upsert', sheet: sh, row: mkRow(sh, id) }); }
    else if (r < .8) ops.push({ action: 'upsert', sheet: sh, row: mkRow(sh, pick(L)) });
    else { const id = rnd() < .9 ? pick(L) : 'nope' + int(1, 9); ops.push({ action: 'delete', sheet: sh, id }); }
  }
  const ra = A.call({ action: 'batch', token: TA, ops }), rb = B.call({ action: 'batch', token: TB, ops });
  if (!ra.ok || !rb.ok) { console.log('ERR batch', ra.error, rb.error); fails++; break; }
  if (rnd() < .03) { const rows = JSON.parse(JSON.stringify(B.call({ action: 'all', token: TB }).data.clienti)).slice(0, int(0, 5)); A.call({ action: 'replaceAll', token: TA, sheet: 'Clienti', rows }); B.call({ action: 'replaceAll', token: TB, sheet: 'Clienti', rows }); }
  const fa = A.call({ action: 'all', token: TA }).data, fb = B.call({ action: 'all', token: TB }).data;
  KEYS.forEach(k => { if (norm(fa[k], k) !== norm(fb[k], k)) { fails++; if (fails < 4) console.log('DIVERSO vecchio/nuovo', step, k, norm(fa[k], k).slice(0, 300), '\n', norm(fb[k], k).slice(0, 300)); } });
  if (rnd() < .6) {
    const d = B.call({ action: 'all', token: TB, since: client.t || undefined }).data;
    if (merge(client, d) === 'delta') nDelta++; else nFull++;
    KEYS.forEach(k => { if (norm(client[k], k) !== norm(fb[k], k)) { fails++; if (fails < 6) console.log('DELTA DIVERSO', step, k, norm(client[k], k).slice(0, 200), '\n', norm(fb[k], k).slice(0, 200)); } });
  }
}
const LS = B.spreads.MAIN.S._Modifiche;
console.log('errori', fails, '· sincronizzazioni delta', nDelta, 'full', nFull, '· righe registro', LS.api.getLastRow() - 1, '· movimenti', ids.Movimenti.length);
