/**
 * Centro di Costo — TEAM (script separato, NON fa parte di Code.gs)
 * Legge i report degli agenti dalla cartella Drive «Centro di Costo - Team» e li dà alla Console (sezione Team).
 * Nessuna chat che modifica Code.gs deve toccare questo script.
 * Accesso: controlla il token chiedendo allo script principale chi è l'utente (azione «me»): solo l'amministratore.
 */
const TEAM_V = 'team-1';
const MAIN_URL = 'https://script.google.com/macros/s/AKfycbxExGwxVNa08xHz1zp2BmoGkvT1LX7jj-yfdbzbWckqOBsMxPsISmDdKgDmx4uqwRiW/exec';
const ADMIN = 'attrezzatidario@gmail.com';
const FOLDER = 'Centro di Costo - Team', MAX = 150;

function doGet() { return out({ ok: true, v: TEAM_V }); }

function doPost(e) {
  try {
    const b = JSON.parse((e.postData && e.postData.contents) || '{}');
    const me = whoIs(b.token);
    if (!me) return out({ ok: false, auth: true, error: 'Sessione scaduta: entra di nuovo nella Console' });
    if (!me.admin || String(me.email).toLowerCase() !== ADMIN) return out({ ok: false, error: 'Solo l\'amministratore può vedere il Team' });
    if (b.action === 'report') return out({ ok: true, v: TEAM_V, result: report() });
    return out({ ok: false, error: 'Azione sconosciuta' });
  } catch (err) { return out({ ok: false, error: String(err.message || err) }); }
}

// chiede allo script principale chi è il proprietario del token (risultato tenuto 10 minuti)
function whoIs(tok) {
  if (!tok) return null;
  const c = CacheService.getScriptCache(), k = 'me_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(tok)));
  const hit = c.get(k); if (hit) return JSON.parse(hit);
  const r = UrlFetchApp.fetch(MAIN_URL, { method: 'post', contentType: 'text/plain;charset=utf-8', payload: JSON.stringify({ action: 'me', token: tok }), muteHttpExceptions: true, followRedirects: true });
  let j = null; try { j = JSON.parse(r.getContentText()); } catch (e) { throw new Error('Lo script principale non risponde'); }
  if (!j.ok) return null;
  c.put(k, JSON.stringify(j.result), 600);
  return j.result;
}

function report() {
  const it = DriveApp.getFoldersByName(FOLDER);
  if (!it.hasNext()) return { report: [] };
  const files = [], fi = it.next().getFiles();
  while (fi.hasNext()) { const f = fi.next(); if (/\.json$/i.test(f.getName())) files.push(f); }
  files.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  const out = [];
  files.slice(0, MAX).forEach(f => { try { const j = JSON.parse(f.getBlob().getDataAsString('UTF-8')); if (j && j.agente) out.push(j); } catch (e) {} });
  return { report: out };
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// da eseguire una volta dall'editor per dare i permessi (Drive e connessione allo script principale)
function autorizza() { report(); UrlFetchApp.fetch(MAIN_URL, { muteHttpExceptions: true }); Logger.log('Permessi OK'); }
