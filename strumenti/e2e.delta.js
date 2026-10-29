const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = require('path').resolve(__dirname, '..');
const G = require(__dirname + '/gasmock.js')(process.argv[2]);
const reg = G.call({ action: 'register', nome: 'Dario', email: 'attrezzatidario@gmail.com', password: 'Segreta123', codice: 'SV2026' }).result;
const T = reg.token;
global.window = {}; require(ROOT + '/console/stress.js'); const ops = window.CDC_STRESS.ops().ops.filter(o => o.sheet === 'Config' || ['Movimenti', 'Clienti'].includes(o.sheet));
for (let i = 0; i < ops.length; i += 20000) { const r = G.call({ action: 'batch', token: T, ops: ops.slice(i, i + 20000) }); if (!r.ok) throw r.error; }
const T2 = G.call({ action: 'login', email: 'attrezzatidario@gmail.com', password: 'Segreta123' }).result.token; // «altro dispositivo»
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : f.endsWith('.json') ? 'application/json' : f.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream' }); r.end(d); }); }).listen(8150);
const LOGS = [];
(async () => { await new Promise(r => setTimeout(r, 16000));
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/TUNNEL|Failed to load/.test(m.text())) errs.push(m.text()); });
  await p.route('https://script.google.com/**', rt => { const body = JSON.parse(rt.request().postData()); const t = Date.now(); const out = JSON.stringify(G.call(body)); if (body.action === 'all') LOGS.push(`all since=${body.since ? 'sì' : 'no'} → ${(out.length / 1e6).toFixed(2)} MB in ${Date.now() - t} ms`); rt.fulfill({ contentType: 'application/json', body: out }); });
  await p.addInitScript(([tok, me]) => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('cdc_tok', JSON.stringify(tok)); localStorage.setItem('cdc_me', JSON.stringify(me)); } }, [T, reg.user]);
  await p.goto('http://localhost:8150/#attrezzatura');
  await p.waitForFunction(() => /Sincronizzato/.test((document.querySelector('#sync-side') || {}).textContent || ''), null, { timeout: 120000 });
  const n0 = await p.evaluate(() => document.body.innerText.includes('12.000'));
  console.log('prima apertura ok, 12.000 acquisti visibili:', n0);
  // un altro dispositivo aggiunge un acquisto e cancella un cliente
  const cl = G.call({ action: 'all', token: T2 }).data.clienti[0];
  G.call({ action: 'batch', token: T2, ops: [{ action: 'upsert', sheet: 'Movimenti', row: { id: 'zz1', data: new Date().toISOString().slice(0, 10), descrizione: 'TRAPANO DI PROVA DELTA', um: 'PZ', quantita: 1, prezzo: 123.45, iva: 0.22, centro: 'ROMA', fornitore: 'Test', creato: '' } }, { action: 'delete', sheet: 'Clienti', id: cl.id }] });
  await p.waitForTimeout(3000); await p.reload(); await p.waitForTimeout(2500);
  await p.waitForFunction(() => /Sincronizzato/.test((document.querySelector('#sync-side') || {}).textContent || ''), null, { timeout: 60000 });
  const st = await p.evaluate(() => document.body.innerText.includes('12.001'));
  await p.evaluate(() => { location.hash = '#clienti'; }); await p.waitForTimeout(1500);
  const cli = await p.evaluate(n => [document.body.innerText.includes(n), (document.body.innerText.match(/1\.199|1199/) || [])[0]], cl.nome);
  console.log('dopo la modifica da un altro dispositivo: 12.001 acquisti', st, '· cliente eliminato ancora visibile', cli[0], '· conteggio', cli[1]);
  // salvataggio dal browser: nuovo incasso
  await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(800);
  console.log(LOGS.join('\n')); console.log('errori', errs);
  await b.close(); srv.close();
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
