// mock minimo di Apps Script per eseguire il vero Code.gs in node
const vm = require('vm'), fs = require('fs'), crypto = require('crypto');
module.exports = function load(file) {
  let NOW = Date.now();
  const mkSheet = (name, ss) => {
    const sh = { name, d: [[]], f: {}, max: 1000, maxC: 26, hidden: false, calls: 0 };
    const cell = (r, c) => (sh.d[r - 1] || [])[c - 1];
    const lastRow = () => { for (let r = sh.d.length; r >= 1; r--) if ((sh.d[r - 1] || []).some(v => v !== '' && v != null)) return r; return 0; };
    const lastCol = () => { let m = 0; sh.d.forEach(row => { for (let c = row.length; c >= 1; c--) if (row[c - 1] !== '' && row[c - 1] != null) { m = Math.max(m, c); break; } }); return m; };
    const conv = (v, fmt) => { if (fmt === '@') return v === '' || v == null ? '' : typeof v === 'string' ? v : String(v); if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) && !/^0\d/.test(v.trim())) return Number(v); if (typeof v === 'string' && /^0\d+$/.test(v)) return Number(v); if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T00:00:00'); return v; };
    const range = (r, c, nr = 1, nc = 1) => {
      if (r < 1 || c < 1 || r + nr - 1 > sh.max) throw new Error('Range fuori dal foglio ' + sh.name + ' ' + r + ',' + nr + ' max ' + sh.max);
      sh.calls++;
      const R = {
        getValues: () => { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = cell(r + i, c + j); row.push(v == null ? '' : v); } o.push(row); } return o; },
        getValue: () => { const v = cell(r, c); return v == null ? '' : v; },
        setValues: vals => { if (vals.length !== nr || vals.some(x => x.length !== nc)) throw new Error('dimensioni sbagliate'); for (let i = 0; i < nr; i++) { while (sh.d.length < r + i) sh.d.push([]); const row = sh.d[r + i - 1]; for (let j = 0; j < nc; j++) row[c + j - 1] = conv(vals[i][j], sh.f[(c + j) + ':' + (r + i)] || sh.f[(c + j) + ':*']); } return R; },
        setValue: v => R.setValues([[v]]),
        setNumberFormat: f => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) sh.f[(c + j) + ':' + (r + i)] = f; return R; },
        setFontWeight: () => R, clearContent: () => { for (let i = 0; i < nr; i++) { const row = sh.d[r + i - 1]; if (row) for (let j = 0; j < nc; j++) row[c + j - 1] = ''; } return R; },
        getSheet: () => sh.api
      };
      return R;
    };
    const a1 = s => { const m = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(s); const col = L => [...L].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0); const c1 = col(m[1]), r1 = +m[2], c2 = m[3] ? col(m[3]) : c1, r2 = m[4] ? +m[4] : r1; return range(r1, c1, r2 - r1 + 1, c2 - c1 + 1); };
    sh.api = {
      getName: () => sh.name, getRange: (r, c, nr, nc) => typeof r === 'string' ? a1(r) : range(r, c, nr, nc),
      getRangeList: L => ({ setNumberFormat: f => { L.forEach(x => a1(x).setNumberFormat(f)); } }),
      getDataRange: () => range(1, 1, Math.max(1, lastRow()), Math.max(1, lastCol())),
      getLastRow: lastRow, getLastColumn: lastCol, getMaxRows: () => sh.max,
      insertRowsAfter: (a, n) => { sh.max += n; }, setFrozenRows: () => {}, hideSheet: () => { sh.hidden = true; },
      deleteRow: r => { if (sh.max <= 2) throw new Error('non si possono eliminare tutte le righe'); sh.d.splice(r - 1, 1); sh.max--; const nf = {}; Object.entries(sh.f).forEach(([k, v]) => { const [c, rr] = k.split(':'); if (rr === '*') nf[k] = v; else if (+rr < r) nf[k] = v; else if (+rr > r) nf[c + ':' + (+rr - 1)] = v; }); sh.f = nf; },
      deleteRows: (r, n) => { for (let i = 0; i < n; i++) sh.api.deleteRow(r); },
      appendRow: row => { const r = lastRow() + 1; if (r > sh.max) sh.max = r; range(r, 1, 1, row.length).setValues([row]); },
      protect: () => ({ setDescription: () => ({ setWarningOnly: () => {} }) })
    };
    return sh;
  };
  const mkSS = id => { const S = {}; const ss = { id, S, getSheetByName: n => S[n] ? S[n].api : null, insertSheet: n => { if (S[n]) throw new Error('esiste'); S[n] = mkSheet(n, ss); return S[n].api; }, getSheets: () => Object.values(S).map(x => x.api), deleteSheet: sh => { delete S[sh.getName()]; }, getId: () => id }; return ss; };
  const spreads = { MAIN: mkSS('MAIN') };
  const props = {};
  const cache = {};
  const ctx = {
    console, JSON, Math, Date, String, Number, Object, Array, Boolean, RegExp, Error, isNaN, parseInt, parseFloat,
    SpreadsheetApp: { getActiveSpreadsheet: () => spreads.MAIN, openById: id => spreads[id], create: n => { const id = 'SS' + Object.keys(spreads).length; spreads[id] = mkSS(id); spreads[id].insertSheet('Foglio1'); return spreads[id]; }, getUi: () => ({}) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] == null ? null : props[k], setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; }, getProperties: () => ({ ...props }), getKeys: () => Object.keys(props) }) },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Session: { getScriptTimeZone: () => 'Europe/Rome' },
    Utilities: {
      formatDate: (d, tz, f) => { const p = n => String(n).padStart(2, '0'); const s = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; return f === 'HH:mm:ss' ? `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` : s; },
      getUuid: () => crypto.randomUUID(), sleep: () => {}, computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s)).digest()].map(b => b > 127 ? b - 256 : b),
      DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 }, base64Encode: s => Buffer.from(s).toString('base64'), base64Decode: s => [...Buffer.from(s, 'base64')], newBlob: () => ({})
    },
    ContentService: { createTextOutput: s => ({ s, setMimeType() { return this; } }), MimeType: { JSON: 1 } },
    DriveApp: { getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => ({ getFiles: () => ({ hasNext: () => false }), getId: () => 'F' }), getFolderById: () => ({ getFiles: () => ({ hasNext: () => false }) }) },
    MailApp: { sendEmail: () => {} }, GmailApp: { sendEmail: () => {} }, UrlFetchApp: {}, ScriptApp: { getProjectTriggers: () => [] }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8') + '\n;this.__call = b => JSON.parse(doPost({ postData: { contents: JSON.stringify(b) } }).s);', ctx);
  return { call: b => ctx.__call(b), spreads, ctx, props };
};
