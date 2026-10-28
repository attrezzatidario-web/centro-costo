/* Centro di Costo — Analisi (v121)
   Una sezione sola per cercare, filtrare, raggruppare ed esportare (Excel e PDF) tutti i dati del gestionale.
   window.CDC_AN.render(el, ctx): ctx arriva da app.js (dati, formati, librerie PDF/Excel, nomi delle sedi…). */
(() => {
  'use strict';
  let C = null, root = null;
  const S = { src: '*', q: '', per: 'all', da: '', a: '', f: {}, g: '', sort: null, lim: 200, cols: {}, open: '' };
  try { const o = JSON.parse(localStorage.getItem('cdc_an') || '{}'); if (o && o.cols) S.cols = o.cols; if (o && o.per) S.per = o.per; } catch {}
  const keep = () => { try { localStorage.setItem('cdc_an', JSON.stringify({ cols: S.cols, per: S.per })); } catch {} };

  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const r2 = n => Math.round((Number(n) || 0) * 100) / 100;
  const ym = d => String(d || '').slice(0, 7);
  const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const mLbl = k => { const [y, m] = String(k).split('-'); return m ? `${MESI[+m - 1]} ${y}` : k; };
  const jp = (v, d) => { if (v && typeof v === 'object') return v; try { const x = JSON.parse(v || ''); return x == null ? d : x; } catch { return d; } };
  const lnTot = l => r2(C.num(l.q) * C.num(l.p) * (1 - C.num(l.sc) / 100));

  /* ---------- le fonti di dati ----------
     t: d data · e euro · n numero · c categoria (si filtra e si raggruppa) · s testo · p percentuale */
  function sources() {
    const db = C.db(), N = C.num, A = (x) => Array.isArray(x) ? x : [];
    const cli = new Map(A(db.clienti).map(c => [c.id, c])), art = new Map(A(db.articoli).map(a => [a.id, a]));
    const sedeW = C.sedeWord();
    const L = [];
    const add = (o) => { if (o.on !== false) L.push(o); };
    add({ k: 'acquisti', n: C.acqWord(), d: 'Righe di acquisto: materiale, attrezzatura e spese', ic: 'box',
      rows: () => A(db.movimenti).map(r => ({ data: r.data, ndoc: r.ndoc, codice: r.codice, descrizione: r.descrizione, fornitore: r.fornitore, categoria: r.categoria || 'Altro', centro: r.centro, societa: r.societa, quantita: N(r.quantita), prezzo: N(r.prezzo), importo: r2(N(r.quantita) * N(r.prezzo)), iva: C.ivaRate(r) * 100 })),
      cols: [['data', 'Data', 'd'], ['ndoc', 'Documento', 's'], ['codice', 'Codice', 's'], ['descrizione', 'Descrizione', 's', 1], ['fornitore', 'Fornitore', 'c'], ['categoria', 'Categoria', 'c'], ['centro', sedeW, 'c'], ...(C.isMain() ? [['societa', 'Società', 'c']] : []), ['quantita', 'Q.tà', 'n'], ['prezzo', 'Prezzo', 'u'], ['importo', 'Importo', 'e'], ['iva', 'IVA %', 'p']], amt: 'importo' });
    add({ k: 'fatture', n: 'Fatture fornitori', d: 'Fatture ricevute, scadenze e pagamenti', ic: 'doc',
      rows: () => A(db.fatture).map(r => ({ data: r.data, numero: r.numero, fornitore: r.fornitore, categoria: r.categoria || 'Altro', centro: r.centro, scadenza: r.scadenza, stato: r.stato === 'pagata' ? 'Pagata' : 'Da pagare', pagata: r.pagata, imponibile: N(r.imponibile), imposta: N(r.imposta), totale: N(r.totale) })),
      cols: [['data', 'Data', 'd'], ['numero', 'Numero', 's'], ['fornitore', 'Fornitore', 'c', 1], ['categoria', 'Categoria', 'c'], ['centro', sedeW, 'c'], ['scadenza', 'Scadenza', 'd'], ['stato', 'Stato', 'c'], ['pagata', 'Pagata il', 'd'], ['imponibile', 'Imponibile', 'e'], ['imposta', 'IVA', 'e'], ['totale', 'Totale', 'e']], amt: 'imponibile' });
    add({ k: 'docforn', n: 'Documenti fornitori', d: 'Archivio di fatture e DDT dei fornitori', ic: 'clip', on: C.modOn('fornitori'),
      rows: () => A(db.docforn).map(r => ({ data: r.data, tipo: ({ fattura: 'Fattura', ddt: 'DDT', nc: 'Nota di credito', ordine: 'Ordine', altro: 'Altro' })[r.tipo] || r.tipo || 'Altro', fornitore: r.fornitore, numero: r.numero, file: r.nomeFile, totale: N(r.totale) })),
      cols: [['data', 'Data', 'd'], ['tipo', 'Tipo', 'c'], ['fornitore', 'Fornitore', 'c', 1], ['numero', 'Numero', 's'], ['file', 'File', 's'], ['totale', 'Totale', 'e']], amt: 'totale' });
    add({ k: 'preventivi', n: 'Preventivi', d: 'Preventivi ai clienti, stato e fatturazione', ic: 'pv',
      rows: () => C.pvList().map(p => { const t = C.pvTotals(p); return { data: p.data, num: p.num, cliente: (p.cliente && p.cliente.nome) || '—', stato: ({ bozza: 'Bozza', inviato: 'Inviato', accettato: 'Accettato', rifiutato: 'Rifiutato' })[p.stato] || 'Bozza', fatt: C.pvFatt(p) ? 'Fatturato' : 'Da fatturare', righe: (p.righe || []).length, pezzi: t.pz, imponibile: t.imp, totale: t.tot }; }),
      cols: [['data', 'Data', 'd'], ['num', 'Numero', 's'], ['cliente', 'Cliente', 'c', 1], ['stato', 'Stato', 'c'], ['fatt', 'Fatturazione', 'c'], ['righe', 'Righe', 'n'], ['pezzi', 'Pezzi', 'n'], ['imponibile', 'Imponibile', 'e'], ['totale', 'Totale', 'e']], amt: 'imponibile' });
    add({ k: 'ddt', n: 'DDT ai clienti', d: 'Documenti di trasporto emessi', ic: 'truck', on: C.modOn('vendite'),
      rows: () => A(db.ddt).map(d => { const R = A(jp(d.righe, [])).filter(l => !l.h); return { data: d.data, numero: `${d.numero}/${d.anno}`, cliente: (cli.get(d.cliente) || {}).nome || '—', causale: d.causale, destinazione: d.destinazione, colli: N(d.colli), righe: R.length, imponibile: r2(R.reduce((s, l) => s + lnTot(l), 0)), fatt: d.fattura ? 'Fatturato' : 'Da fatturare' }; }),
      cols: [['data', 'Data', 'd'], ['numero', 'Numero', 's'], ['cliente', 'Cliente', 'c', 1], ['causale', 'Causale', 'c'], ['destinazione', 'Destinazione', 's'], ['colli', 'Colli', 'n'], ['righe', 'Righe', 'n'], ['imponibile', 'Imponibile', 'e'], ['fatt', 'Fatturazione', 'c']], amt: 'imponibile' });
    add({ k: 'vendite', n: 'Fatture ai clienti', d: 'Fatture emesse, incassi e scadenze', ic: 'doc', on: C.modOn('vendite'),
      rows: () => A(db.vendite).map(f => ({ data: f.data, numero: `${f.numero}/${f.anno}`, tipo: f.tipo === 'TD04' ? 'Nota di credito' : f.tipo === 'TD24' ? 'Differita' : 'Fattura', cliente: (cli.get(f.cliente) || {}).nome || '—', scadenza: f.scadenza, stato: f.stato === 'pagata' ? 'Incassata' : 'Da incassare', imponibile: N(f.imponibile), imposta: N(f.imposta), totale: N(f.totale) })),
      cols: [['data', 'Data', 'd'], ['numero', 'Numero', 's'], ['tipo', 'Tipo', 'c'], ['cliente', 'Cliente', 'c', 1], ['scadenza', 'Scadenza', 'd'], ['stato', 'Stato', 'c'], ['imponibile', 'Imponibile', 'e'], ['imposta', 'IVA', 'e'], ['totale', 'Totale', 'e']], amt: 'imponibile' });
    add({ k: 'incassi', n: 'Incassi', d: 'Chiusure di cassa e incassi giornalieri', ic: 'cash', on: C.modOn('incassi'),
      rows: () => A(db.incassi).map(r => ({ data: r.data, sede: r.sede, tipo: r.tipo || 'Incasso', importo: N(r.importo), contanti: N(r.contanti), pos: N(r.pos), altro: N(r.altro) })),
      cols: [['data', 'Data', 'd'], ['sede', sedeW, 'c'], ['tipo', 'Tipo', 'c'], ['contanti', 'Contanti', 'e'], ['pos', 'POS', 'e'], ['altro', 'Altro', 'e'], ['importo', 'Importo', 'e']], amt: 'importo', note: 'IVA inclusa' });
    add({ k: 'gls', n: 'Spedizioni GLS', d: 'Spedizioni, destinazioni, peso e costi', ic: 'truck', on: C.modOn('gls'),
      rows: () => A(db.gls).map(r => ({ data: r.data, nsped: r.nsped, rif: r.rif, destinatario: r.destinatario, citta: r.citta, prov: r.prov, regione: r.regione, sede: r.cdc ? C.lyName(r.cdc) : (r.cdcNome || '—'), tipologia: r.tipologia, colli: N(r.colli), kg: N(r.kgReali), totale: N(r.totale), riaddebito: r.riaddebito || '—' })),
      cols: [['data', 'Data', 'd'], ['nsped', 'Spedizione', 's'], ['rif', 'Riferimento', 's'], ['destinatario', 'Destinatario', 'c', 1], ['citta', 'Città', 'c'], ['prov', 'Prov.', 'c'], ['regione', 'Regione', 'c'], ['sede', 'Partenza', 'c'], ['tipologia', 'Tipologia', 'c'], ['colli', 'Colli', 'n'], ['kg', 'Kg', 'n'], ['totale', 'Costo', 'e'], ['riaddebito', 'Riaddebito', 'c']], amt: 'totale' });
    add({ k: 'gasolio', n: 'Carburante', d: 'Rifornimenti, chilometri e litri per mezzo', ic: 'fuel', on: C.modOn('gasolio'),
      rows: () => A(db.gasolio).map(r => ({ data: r.data, targa: r.targa, uso: r.uso, operatore: r.operatore, centro: r.centro, km: N(r.km), litri: N(r.litri), prezzo: N(r.prezzo), importo: r2(N(r.litri) * N(r.prezzo)) })),
      cols: [['data', 'Data', 'd'], ['targa', 'Targa', 'c', 1], ['uso', 'Mezzo', 'c'], ['operatore', 'Operatore', 'c'], ['centro', sedeW, 'c'], ['km', 'Km', 'n'], ['litri', 'Litri', 'n'], ['prezzo', 'Prezzo/l', 'e3'], ['importo', 'Importo', 'e']], amt: 'importo' });
    add({ k: 'lyreco', n: 'Lyreco', d: 'Fatture Lyreco riga per riga', ic: 'clip', on: C.modOn('lyreco'),
      rows: () => A(db.lyreco).map(r => ({ data: r.data, fattura: r.fattura, codice: r.codice, descrizione: r.descrizione, categoria: r.categoria || 'Altro', sede: C.lyName(r.cdc), quantita: N(r.quantita), prezzo: N(r.prezzo), importo: N(r.importo) })),
      cols: [['data', 'Data', 'd'], ['fattura', 'Fattura', 's'], ['codice', 'Codice', 's'], ['descrizione', 'Descrizione', 's', 1], ['categoria', 'Categoria', 'c'], ['sede', sedeW, 'c'], ['quantita', 'Q.tà', 'n'], ['prezzo', 'Prezzo', 'u'], ['importo', 'Importo', 'e']], amt: 'importo' });
    add({ k: 'amazon', n: 'Amazon', d: 'Articoli ordinati su Amazon Business', ic: 'bag', on: C.modOn('amazon'),
      rows: () => A(db.amazonart).map(r => ({ data: r.data, ordine: r.ordine, descrizione: r.descrizione, categoria: r.categoria || 'Altro', venditore: r.venditore, localita: r.localita, quantita: N(r.quantita) || 1, prezzo: N(r.prezzo), importo: N(r.importo) })),
      cols: [['data', 'Data', 'd'], ['ordine', 'Ordine', 's'], ['descrizione', 'Descrizione', 's', 1], ['categoria', 'Categoria', 'c'], ['venditore', 'Venditore', 'c'], ['localita', 'Consegna', 'c'], ['quantita', 'Q.tà', 'n'], ['prezzo', 'Prezzo', 'u'], ['importo', 'Importo', 'e']], amt: 'importo' });
    add({ k: 'articoli', n: 'Articoli di magazzino', d: 'Anagrafica articoli, giacenze e valore', ic: 'box', on: C.modOn('magazzino'),
      rows: () => { const G = C.giacMap(); return A(db.articoli).map(a => { const g = G.get(a.id) || 0; return { codice: a.codice, codForn: a.codForn, descrizione: a.descrizione, categoria: a.categoria || 'Altro', fornitore: a.fornitore, giacenza: g, scorta: N(a.scorta), sotto: N(a.scorta) && g <= N(a.scorta) ? 'Sotto scorta' : 'Ok', costo: N(a.costo), prezzo: N(a.prezzo), valore: r2(g * N(a.costo)) }; }); },
      cols: [['codice', 'Codice', 's'], ['codForn', 'Cod. fornitore', 's'], ['descrizione', 'Descrizione', 's', 1], ['categoria', 'Categoria', 'c'], ['fornitore', 'Fornitore', 'c'], ['giacenza', 'Giacenza', 'n'], ['scorta', 'Scorta min.', 'n'], ['sotto', 'Scorta', 'c'], ['costo', 'Costo', 'u'], ['prezzo', 'Prezzo', 'u'], ['valore', 'Valore', 'e']], amt: 'valore', nodate: true });
    add({ k: 'magmov', n: 'Movimenti di magazzino', d: 'Carichi, scarichi e rettifiche', ic: 'swap', on: C.modOn('magazzino'),
      rows: () => A(db.magmov).map(m => { const a = art.get(m.articolo) || {}, q = N(m.quantita); return { data: m.data, codice: a.codice || '—', descrizione: a.descrizione || 'Articolo eliminato', tipo: q >= 0 ? 'Carico' : 'Scarico', causale: m.causale, doc: m.doc, quantita: q, costo: N(m.costo), valore: r2(Math.abs(q) * N(m.costo)) }; }),
      cols: [['data', 'Data', 'd'], ['codice', 'Codice', 's'], ['descrizione', 'Articolo', 's', 1], ['tipo', 'Tipo', 'c'], ['causale', 'Causale', 'c'], ['doc', 'Documento', 's'], ['quantita', 'Q.tà', 'n'], ['costo', 'Costo', 'u'], ['valore', 'Valore', 'e']], amt: 'valore' });
    add({ k: 'clienti', n: 'Clienti', d: 'Anagrafica e fatturato per cliente', ic: 'user', on: C.modOn('clienti'),
      rows: () => { const F = new Map(); A(db.vendite).forEach(f => F.set(f.cliente, r2((F.get(f.cliente) || 0) + (f.tipo === 'TD04' ? -1 : 1) * N(f.imponibile)))); return A(db.clienti).map(c => ({ nome: c.nome, piva: c.piva, citta: c.citta, prov: c.prov, email: c.email, tel: c.tel, pagamento: c.pagamento, fatturato: F.get(c.id) || 0 })); },
      cols: [['nome', 'Cliente', 's', 1], ['piva', 'P. IVA', 's'], ['citta', 'Città', 'c'], ['prov', 'Prov.', 'c'], ['email', 'Email', 's'], ['tel', 'Telefono', 's'], ['pagamento', 'Pagamento', 'c'], ['fatturato', 'Fatturato', 'e']], amt: 'fatturato', nodate: true });
    add({ k: 'fornitori', n: 'Fornitori', d: 'Anagrafica, acquisti e fatture per fornitore', ic: 'store', on: C.modOn('fornitori'),
      rows: () => { const FL = A(db.fornitori), FM = new Map(), find = n => { if (!n) return null; let f = FM.get(n); if (f === undefined) { f = FL.find(x => C.fMatch(x, n)) || null; FM.set(n, f); } return f; }, T = new Map(FL.map(f => [f.id, { acq: 0, fat: 0, open: 0, nf: 0 }]));
        A(db.movimenti).forEach(r => { const f = find(r.fornitore); if (f) T.get(f.id).acq += N(r.quantita) * N(r.prezzo); });
        A(db.fatture).forEach(r => { const f = find(r.fornitore); if (!f) return; const x = T.get(f.id); x.fat += N(r.imponibile); x.nf++; if (r.stato !== 'pagata') x.open += N(r.totale); });
        return FL.map(f => { const x = T.get(f.id); return { nome: f.nome, categoria: f.categoria || '—', citta: f.citta, prov: f.prov, email: f.email, tel: f.tel, referente: f.referente, pagamento: f.pagamento, nf: x.nf, acq: r2(x.acq), fat: r2(x.fat), open: r2(x.open) }; }); },
      cols: [['nome', 'Fornitore', 's', 1], ['categoria', 'Categoria', 'c'], ['citta', 'Città', 'c'], ['prov', 'Prov.', 'c'], ['email', 'Email', 's'], ['tel', 'Telefono', 's'], ['referente', 'Referente', 's'], ['pagamento', 'Pagamento', 'c'], ['nf', 'N. fatture', 'n'], ['acq', 'Acquisti', 'e'], ['fat', 'Fatture', 'e'], ['open', 'Da pagare', 'e']], amt: 'acq', nodate: true });
    { // v127: dipendenti, ore lavorate per giorno e assenze
      const DP = new Map(A(db.dipendenti).map(d => [String(d.id), d])), dn = id => { const d = DP.get(String(id)); return d ? `${d.nome || ''} ${d.cognome || ''}`.trim() : 'Dipendente eliminato'; }, tm = t => { const [h, m, s] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0) + (s || 0) / 60; };
      const ASL = { ferie: 'Ferie', permesso: 'Permesso', malattia: 'Malattia', altro: 'Altra assenza' }, STL = { attesa: 'Da approvare', approvata: 'Approvata', rifiutata: 'Rifiutata', comunicata: 'Comunicata' };
      add({ k: 'dipendenti', n: 'Dipendenti', d: 'Anagrafica, contratti e scadenze del personale', ic: 'user', on: C.modOn('dipendenti') && A(db.dipendenti).length > 0,
        rows: () => A(db.dipendenti).map(d => ({ nome: `${d.nome || ''} ${d.cognome || ''}`.trim(), mansione: d.mansione, reparto: d.reparto, sede: d.sede, contratto: d.contratto, stato: d.stato === 'cessato' ? 'Cessato' : 'Attivo', assunzione: d.assunzione, fine: d.fine, visita: d.visita, ore: N(d.ore), costo: N(d.costo) })),
        cols: [['nome', 'Dipendente', 's', 1], ['mansione', 'Mansione', 'c'], ['reparto', 'Reparto', 'c'], ['sede', sedeW, 'c'], ['contratto', 'Contratto', 'c'], ['stato', 'Stato', 'c'], ['assunzione', 'Assunto il', 'd'], ['fine', 'Fine contratto', 'd'], ['visita', 'Visita medica', 'd'], ['ore', 'Ore sett.', 'n'], ['costo', 'Costo orario', 'u']], amt: 'ore', nodate: true });
      add({ k: 'presenze', n: 'Presenze', d: 'Ore lavorate per dipendente e giorno, con costo', ic: 'swap', on: C.modOn('dipendenti') && A(db.presenze).length > 0,
        rows: () => { const G = new Map(); A(db.presenze).forEach(p => { const k = p.dip + '|' + String(p.data).slice(0, 10); if (!G.has(k)) G.set(k, []); G.get(k).push(p); });
          return [...G.entries()].map(([k, L]) => { L.sort((a, b) => String(a.ora).localeCompare(String(b.ora))); let m = 0, st = null; L.forEach(p => { const t = tm(p.ora); if (p.tipo === 'in' || p.tipo === 'rientro') st = t; else if (st != null) { m += t - st; st = null; } }); const [id, data] = k.split('|'), d = DP.get(id) || {}, ore = r2(m / 60), first = L.find(p => p.tipo === 'in'), last = [...L].reverse().find(p => p.tipo === 'out');
            return { data, nome: dn(id), sede: d.sede, mansione: d.mansione, entrata: first ? String(first.ora).slice(0, 5) : '', uscita: last ? String(last.ora).slice(0, 5) : 'mancante', ore, manuale: L.some(p => p.fonte === 'manuale') ? 'Sì' : 'No', costo: r2(ore * N(d.costo)) }; }); },
        cols: [['data', 'Data', 'd'], ['nome', 'Dipendente', 'c', 1], ['sede', sedeW, 'c'], ['mansione', 'Mansione', 'c'], ['entrata', 'Entrata', 's'], ['uscita', 'Uscita', 's'], ['ore', 'Ore', 'n'], ['manuale', 'Corretta a mano', 'c'], ['costo', 'Costo', 'e']], amt: 'costo' });
      add({ k: 'assenze', n: 'Ferie e permessi', d: 'Ferie, permessi e malattia con stato della richiesta', ic: 'clip', on: C.modOn('dipendenti') && A(db.assenze).length > 0,
        rows: () => A(db.assenze).map(a => ({ data: a.dal, al: a.al, nome: dn(a.dip), tipo: ASL[a.tipo] || a.tipo, stato: STL[a.stato] || a.stato, ore: N(a.ore), motivo: a.motivo })),
        cols: [['data', 'Dal', 'd'], ['al', 'Al', 'd'], ['nome', 'Dipendente', 'c', 1], ['tipo', 'Tipo', 'c'], ['stato', 'Stato', 'c'], ['ore', 'Ore', 'n'], ['motivo', 'Motivo', 's']], amt: 'ore' });
    }
    L.forEach(s => { s.cols = s.cols.map(([k, l, t, main]) => ({ k, l, t, main: !!main })); s.dk = s.nodate ? '' : 'data'; });
    return L;
  }

  /* ---------- periodo ---------- */
  const PER = [['all', 'Tutto il periodo'], ['m', 'Questo mese'], ['pm', 'Mese scorso'], ['3m', 'Ultimi 3 mesi'], ['12m', 'Ultimi 12 mesi'], ['y', 'Quest\'anno'], ['py', 'Anno scorso'], ['c', 'Date a scelta']];
  function range() {
    const d = new Date(), y = d.getFullYear(), m = d.getMonth(), f = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    switch (S.per) {
      case 'm': return [f(new Date(y, m, 1)), f(new Date(y, m + 1, 0))];
      case 'pm': return [f(new Date(y, m - 1, 1)), f(new Date(y, m, 0))];
      case '3m': return [f(new Date(y, m - 2, 1)), f(new Date(y, m + 1, 0))];
      case '12m': return [f(new Date(y, m - 11, 1)), f(new Date(y, m + 1, 0))];
      case 'y': return [`${y}-01-01`, `${y}-12-31`];
      case 'py': return [`${y - 1}-01-01`, `${y - 1}-12-31`];
      case 'c': return [S.da || '0000-01-01', S.a || '9999-12-31'];
      default: return null;
    }
  }
  const perTxt = () => { const r = range(); if (!r) return 'Tutto il periodo'; if (S.per === 'c') return `${S.da ? 'dal ' + C.dIt(S.da) : ''}${S.da && S.a ? ' ' : ''}${S.a ? 'al ' + C.dIt(S.a) : ''}` || 'Tutto il periodo'; return `${PER.find(p => p[0] === S.per)[1]} · dal ${C.dIt(r[0])} al ${C.dIt(r[1])}`; };

  /* ---------- filtri ---------- */
  const srcOf = k => sources().find(s => s.k === k);
  const hay = (r, cols) => norm(cols.map(c => r[c.k]).join(' '));
  function apply(s, rows, opt = {}) {
    const rg = s.dk ? range() : null, words = norm(S.q).split(/\s+/).filter(Boolean), F = opt.nof ? {} : (S.f[s.k] || {});
    return rows.filter(r => {
      if (rg) { const d = String(r[s.dk] || '').slice(0, 10); if (!d || d < rg[0] || d > rg[1]) return false; }
      for (const k in F) { const v = F[k]; if (v == null || v === '') continue; if (typeof v === 'object') { const x = Number(r[k]) || 0; if (v.min !== '' && v.min != null && x < +v.min) return false; if (v.max !== '' && v.max != null && x > +v.max) return false; } else if (String(r[k] ?? '—') !== v) return false; }
      if (words.length) { const h = hay(r, s.cols); if (!words.every(w => h.includes(w))) return false; }
      return true;
    });
  }
  const gVal = (r, g) => g === '_mese' ? ym(r.data) : g === '_anno' ? String(r.data || '').slice(0, 4) : String(r[g] ?? '—') || '—';
  const gLbl = (g, v) => g === '_mese' ? mLbl(v) : v || '—';
  function groups(s, rows) {
    const g = S.g; if (!g) return null;
    const nums = s.cols.filter(c => c.t === 'e');
    const M = new Map();
    rows.forEach(r => { const k = gVal(r, g); let o = M.get(k); if (!o) M.set(k, o = { k, n: 0, v: {} }); o.n++; nums.forEach(c => { o.v[c.k] = r2((o.v[c.k] || 0) + (Number(r[c.k]) || 0)); }); });
    const L = [...M.values()];
    if (g === '_mese' || g === '_anno') L.sort((a, b) => String(b.k).localeCompare(String(a.k))); else L.sort((a, b) => (b.v[s.amt] || 0) - (a.v[s.amt] || 0) || b.n - a.n);
    return { L, nums };
  }
  const visCols = s => { const v = S.cols[s.k]; return v && v.length ? s.cols.filter(c => v.includes(c.k)) : s.cols; };
  function sorted(s, rows) {
    const so = S.sort && S.sort.s === s.k ? S.sort : { k: s.dk || s.cols.find(c => c.main).k, d: s.dk ? -1 : 1 };
    const c = s.cols.find(x => x.k === so.k) || s.cols[0], numT = isNum(c);
    return rows.slice().sort((a, b) => (numT ? (Number(a[c.k]) || 0) - (Number(b[c.k]) || 0) : String(a[c.k] ?? '').localeCompare(String(b[c.k] ?? ''), 'it', { numeric: true })) * so.d);
  }

  /* ---------- formati ---------- */
  const fmt = (c, v) => { if (v == null || v === '') return '—'; switch (c.t) { case 'd': return C.dIt(v) || '—'; case 'e': case 'u': return C.eur(v); case 'e3': return C.fmtNum(v, 3) + ' €'; case 'n': return Number.isInteger(+v) ? C.fmtNum(v, 0) : C.fmtNum(v, 2); case 'p': return C.fmtNum(v, 0) + '%'; default: return String(v); } };
  const isNum = c => c.t[0] === 'e' || c.t === 'u' || c.t === 'n' || c.t === 'p';
  const IC = {
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>', doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>', clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>',
    pv: '<path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h6"/>', truck: '<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    cash: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>', fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5v4H7z"/>', bag: '<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>', user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>', store: '<path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/>'
  };
  const svg = (p, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}">${p}</svg>`;
  const I = { search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', back: '<path d="M15 18l-6-6 6-6"/>', xls: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/>', pdf: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 14h6M9 17h4"/>', col: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>', filt: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>', up: '<path d="M7 14l5-5 5 5"/>', dn: '<path d="M7 10l5 5 5-5"/>', go: '<path d="M9 6l6 6-6 6"/>' };

  /* ---------- disegno ---------- */
  function render(el, ctx) {
    C = ctx;
    if (root !== el) { root = el; bind(el); }
    const L = sources();
    // v122: arrivo da una scheda (cliente, fornitore…): apre la fonte già filtrata
    const pr = C.take && C.take(); if (pr && pr.src === '*') { S.src = '*'; S.q = pr.q || ''; S.per = 'all'; S.open = ''; } else if (pr && L.find(s => s.k === pr.src)) { const s0 = L.find(s => s.k === pr.src), F = {}; S.q = ''; Object.entries(pr.f || {}).forEach(([k, v]) => { const vals = new Set(s0.rows().map(r => String(r[k] ?? ''))); const hit = [...vals].find(x => norm(x) === norm(v)) || [...vals].find(x => norm(x).replace(/[^a-z0-9]/g, '').includes(norm(v).replace(/\b(srl|spa|snc|sas)\b/g, '').replace(/[^a-z0-9]/g, ''))); if (hit) F[k] = hit; else S.q = String(v); }); S.src = pr.src; S.f[pr.src] = F; S.per = 'all'; S.g = ''; S.open = ''; S.lim = 200 }
    if (S.src !== '*' && !L.find(s => s.k === S.src)) S.src = '*';
    C.sub(S.src === '*' ? 'Cerca, filtra ed esporta tutti i dati' : `${L.find(s => s.k === S.src).n} · cerca, filtra ed esporta`);
    el.innerHTML = S.src === '*' ? home(L) : table(L.find(s => s.k === S.src));
    const q = el.querySelector('#ax-q'); if (q && S._focus) { q.focus(); const n = q.value.length; q.setSelectionRange(n, n); S._focus = false; }
  }
  const perSel = () => `<label class="ax-per"><select id="ax-per" aria-label="Periodo">${PER.map(([k, l]) => `<option value="${k}"${S.per === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>${S.per === 'c' ? `<label class="ax-dt"><span>Dal</span><input type="date" id="ax-da" value="${C.esc(S.da)}"></label><label class="ax-dt"><span>Al</span><input type="date" id="ax-a" value="${C.esc(S.a)}"></label>` : ''}`;
  const searchBox = ph => `<div class="ax-sb">${svg(I.search)}<input id="ax-q" type="search" autocomplete="off" placeholder="${ph}" value="${C.esc(S.q)}">${S.q ? `<button type="button" class="ax-qx" data-an="qx" aria-label="Cancella">${svg(I.x)}</button>` : ''}</div>`;

  function home(L) {
    const e = C.esc, words = norm(S.q).split(/\s+/).filter(Boolean);
    const cards = L.map(s => { const all = s.rows(), R = apply(s, all, { nof: true }), tot = R.reduce((a, r) => a + (Number(r[s.amt]) || 0), 0); return { s, all: all.length, R, tot }; });
    const hits = words.length ? cards.filter(c => c.R.length) : [];
    return `<div class="ax-top card">
        <div class="ax-tt"><div><h3>Analisi</h3><p>Scegli i dati da esaminare oppure cerca una parola in tutto il gestionale.</p></div></div>
        <div class="ax-bar">${searchBox('Cerca in tutto: fornitore, cliente, articolo, numero di documento…')}${perSel()}</div>
      </div>
      ${words.length ? `<div class="card ax-hits"><div class="card-h"><h3>${hits.reduce((a, c) => a + c.R.length, 0) ? `${C.fmtNum(hits.reduce((a, c) => a + c.R.length, 0), 0)} risultati per «${e(S.q.trim())}»` : `Nessun risultato per «${e(S.q.trim())}»`}</h3></div>
        ${hits.map(c => `<button type="button" class="ax-hit" data-ansrc="${c.s.k}"><span class="ax-hi">${svg(IC[c.s.ic] || IC.doc)}</span><span class="ax-hm"><b>${e(c.s.n)}</b><small>${c.R.slice(0, 3).map(r => e(String(r[(c.s.cols.find(x => x.main) || c.s.cols[0]).k] ?? ''))).join(' · ')}${c.R.length > 3 ? ' …' : ''}</small></span><span class="ax-hn"><b>${C.fmtNum(c.R.length, 0)}</b><small>${C.eur(c.tot)}</small></span>${svg(I.go, 'ax-go')}</button>`).join('')}</div>` : ''}
      <div class="ax-grid">${cards.map(c => `<button type="button" class="card ax-src" data-ansrc="${c.s.k}"><span class="ax-si">${svg(IC[c.s.ic] || IC.doc)}</span><b>${e(c.s.n)}</b><small>${e(c.s.d)}</small><span class="ax-sn"><em>${C.fmtNum(c.R.length, 0)} ${c.R.length === 1 ? 'riga' : 'righe'}</em>${c.s.amt && c.R.length ? `<strong>${C.eur0(c.tot)}</strong>` : ''}</span></button>`).join('')}</div>`;
  }

  function table(s) {
    const e = C.esc, all = s.rows(), R = sorted(s, apply(s, all)), V = visCols(s), G = groups(s, R), F = S.f[s.k] || {};
    const amtC = s.cols.find(c => c.k === s.amt), tot = R.reduce((a, r) => a + (Number(r[s.amt]) || 0), 0);
    const catCols = s.cols.filter(c => c.t === 'c');
    const chips = Object.entries(F).filter(([, v]) => v !== '' && v != null && !(typeof v === 'object' && (v.min === '' || v.min == null) && (v.max === '' || v.max == null)))
      .map(([k, v]) => { const c = s.cols.find(x => x.k === k); return `<button type="button" class="ax-chip" data-anrm="${e(k)}">${e(c ? c.l : k)}: <b>${typeof v === 'object' ? [v.min !== '' && v.min != null ? 'da ' + C.eur0(v.min) : '', v.max !== '' && v.max != null ? 'a ' + C.eur0(v.max) : ''].filter(Boolean).join(' ') : e(v)}</b>${svg(I.x)}</button>`; });
    const nF = chips.length;
    const optsOf = c => { const M = new Map(); apply(s, all, { nof: true }).forEach(r => { const v = String(r[c.k] ?? '—') || '—'; M.set(v, (M.get(v) || 0) + 1); }); return [...M].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'it')).slice(0, 400); };
    const kpi = [['Righe', C.fmtNum(R.length, 0), all.length !== R.length ? `su ${C.fmtNum(all.length, 0)}` : 'tutte'], ...(amtC ? [[amtC.l, C.eur(tot), s.k === 'articoli' ? 'giacenza × costo' : s.note || 'IVA esclusa'], ['Media', C.eur(R.length ? tot / R.length : 0), 'per riga']] : []), ...(s.dk ? [['Periodo', R.length ? `${C.dIt(R.reduce((m, r) => !m || r.data < m ? r.data : m, ''))}` : '—', R.length ? `al ${C.dIt(R.reduce((m, r) => r.data > m ? r.data : m, ''))}` : '']] : [])];
    const gOpts = [['', 'Nessuno'], ...(s.dk ? [['_mese', 'Mese'], ['_anno', 'Anno']] : []), ...catCols.map(c => [c.k, c.l])];
    const shown = R.slice(0, S.lim), so = S.sort && S.sort.s === s.k ? S.sort : null;
    const gMax = G ? Math.max(1, ...G.L.map(x => Math.abs(x.v[s.amt] || 0))) : 1;
    return `<div class="ax-top card">
        <div class="ax-tt"><button type="button" class="ax-back" data-an="home" aria-label="Tutte le fonti">${svg(I.back)}</button><span class="ax-si sm">${svg(IC[s.ic] || IC.doc)}</span><div><h3>${e(s.n)}</h3><p>${e(s.d)}</p></div>
          <div class="ax-ex"><button type="button" class="btn sm" data-an="xls">${svg(I.xls)}Excel</button><button type="button" class="btn sm" data-an="pdf">${svg(I.pdf)}PDF</button></div></div>
        <div class="ax-bar">${searchBox(`Cerca in ${s.n.toLowerCase()}…`)}${s.dk ? perSel() : ''}
          <button type="button" class="btn sm ax-tg${S.open === 'f' ? ' on' : ''}" data-an="openf">${svg(I.filt)}Filtri${nF ? `<em>${nF}</em>` : ''}</button>
          <button type="button" class="btn sm ax-tg${S.open === 'c' ? ' on' : ''}" data-an="openc">${svg(I.col)}Colonne</button>
          <label class="ax-gr"><span>Raggruppa per</span><select id="ax-g">${gOpts.map(([k, l]) => `<option value="${k}"${S.g === k ? ' selected' : ''}>${e(l)}</option>`).join('')}</select></label></div>
        ${S.open === 'f' ? `<div class="ax-pan ax-fp">${catCols.map(c => `<label class="ax-f"><span>${e(c.l)}</span><select data-anf="${c.k}"><option value="">Tutti</option>${optsOf(c).map(([v, n]) => `<option value="${e(v)}"${F[c.k] === v ? ' selected' : ''}>${e(v)} (${n})</option>`).join('')}</select></label>`).join('')}
          ${amtC ? `<label class="ax-f"><span>${e(amtC.l)} da (€)</span><input type="number" step="any" data-anmin="${amtC.k}" value="${e((F[amtC.k] || {}).min ?? '')}" placeholder="min"></label><label class="ax-f"><span>${e(amtC.l)} a (€)</span><input type="number" step="any" data-anmax="${amtC.k}" value="${e((F[amtC.k] || {}).max ?? '')}" placeholder="max"></label>` : ''}
          ${nF ? '<button type="button" class="btn sm ax-clr" data-an="clr">Togli tutti i filtri</button>' : ''}</div>` : ''}
        ${S.open === 'c' ? `<div class="ax-pan ax-cp">${s.cols.map(c => `<label class="ax-cc"><input type="checkbox" data-ancol="${c.k}"${V.includes(c) ? ' checked' : ''}><span>${e(c.l)}</span></label>`).join('')}<button type="button" class="btn sm ax-clr" data-an="allc">Mostra tutte</button></div>` : ''}
        ${nF ? `<div class="ax-chips">${chips.join('')}</div>` : ''}
      </div>
      <div class="ax-kpis">${kpi.map(([l, v, sm]) => `<div class="card ax-k"><span>${e(l)}</span><b>${v}</b><small>${e(sm)}</small></div>`).join('')}</div>
      ${G ? `<div class="card ax-gc"><div class="card-h"><h3>Per ${e((gOpts.find(x => x[0] === S.g) || [, ''])[1]).toLowerCase()}</h3><span class="muted small">${G.L.length} ${G.L.length === 1 ? 'gruppo' : 'gruppi'}</span></div>
        <div class="ax-tw"><table class="ax-t ax-gt"><thead><tr><th>${e((gOpts.find(x => x[0] === S.g) || [, ''])[1])}</th><th class="r">Righe</th>${G.nums.map(c => `<th class="r">${e(c.l)}</th>`).join('')}${amtC ? '<th class="ax-bc"></th>' : ''}</tr></thead>
        <tbody>${G.L.slice(0, 300).map(x => `<tr data-angk="${e(x.k)}"><td><b>${e(gLbl(S.g, x.k))}</b></td><td class="r">${C.fmtNum(x.n, 0)}</td>${G.nums.map(c => `<td class="r">${C.eur(x.v[c.k] || 0)}</td>`).join('')}${amtC ? `<td class="ax-bc"><i style="width:${Math.max(1, Math.abs(x.v[s.amt] || 0) / gMax * 100).toFixed(1)}%"></i></td>` : ''}</tr>`).join('')}</tbody>
        <tfoot><tr><td>Totale</td><td class="r">${C.fmtNum(R.length, 0)}</td>${G.nums.map(c => `<td class="r">${C.eur(R.reduce((a, r) => a + (Number(r[c.k]) || 0), 0))}</td>`).join('')}${amtC ? '<td></td>' : ''}</tr></tfoot></table></div></div>` : ''}
      <div class="card ax-dc"><div class="card-h"><h3>Dettaglio</h3><span class="muted small">${R.length > shown.length ? `prime ${C.fmtNum(shown.length, 0)} di ${C.fmtNum(R.length, 0)} righe · l'export le contiene tutte` : `${C.fmtNum(R.length, 0)} ${R.length === 1 ? 'riga' : 'righe'}`}</span></div>
        ${R.length ? `<div class="ax-tw"><table class="ax-t"><thead><tr>${V.map(c => `<th class="${isNum(c) ? 'r' : ''}${c.main ? ' ax-m' : ''}"><button type="button" data-ansort="${c.k}">${e(c.l)}${so && so.k === c.k ? svg(so.d > 0 ? I.up : I.dn) : ''}</button></th>`).join('')}</tr></thead>
        <tbody>${shown.map(r => `<tr>${V.map(c => { const lk = lnkOf(s, c), v = fmt(c, r[c.k]); return `<td class="${isNum(c) ? 'r' : ''}${c.main ? ' ax-m' : ''}">${lk && v !== '—' ? `<button type="button" class="ax-lnk" data-axa="${lk}|${e(r[c.k])}">${e(v)}</button>` : e(v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="ax-ml">${(() => { const mc = s.cols.find(c => c.main) || s.cols[0], dc = s.dk ? s.cols.find(c => c.k === s.dk) : null, ac = amtC, oth = V.filter(c => c !== mc && c !== dc && c !== ac).slice(0, 4); const lc = s.cols.find(c => lnkOf(s, c)); return shown.map(r => `<${lc && r[lc.k] ? `button type="button" data-axa="${lnkOf(s, lc)}|${e(r[lc.k])}"` : 'div'} class="ax-mr"><div class="ax-mt"><b>${e(fmt(mc, r[mc.k]))}</b>${ac ? `<strong>${e(fmt(ac, r[ac.k]))}</strong>` : ''}</div><small>${[dc ? fmt(dc, r[dc.k]) : '', ...oth.map(c => r[c.k] == null || r[c.k] === '' ? '' : (isNum(c) ? `${c.l} ${fmt(c, r[c.k])}` : fmt(c, r[c.k])))].filter(x => x && x !== '—').map(e).join(' · ')}</small></${lc && r[lc.k] ? 'button' : 'div'}>`).join(''); })()}</div>
        ${R.length > shown.length ? `<button type="button" class="db-more ax-more" data-an="more">Mostra altre ${C.fmtNum(Math.min(500, R.length - shown.length), 0)} righe</button>` : ''}` : `<div class="empty">Nessuna riga con questi filtri</div>`}</div>`;
  }

  // v122: nomi di clienti e fornitori cliccabili: aprono la loro scheda
  const lnkOf = (s, c) => c.k === 'cliente' || (s.k === 'clienti' && c.k === 'nome') ? 'cli' : c.k === 'fornitore' || (s.k === 'fornitori' && c.k === 'nome') ? 'forn' : '';
  /* ---------- eventi ---------- */
  let qT = 0;
  function bind(el) {
    const re = () => render(el, C);
    el.addEventListener('click', ev => {
      const t = ev.target;
      const lk = t.closest('[data-axa]'); if (lk) { const v = lk.dataset.axa, i = v.indexOf('|'); if (v.slice(0, i) === 'cli') C.openCli(v.slice(i + 1)); else C.openForn(v.slice(i + 1)); return; }
      const src = t.closest('[data-ansrc]'); if (src) { S.src = src.dataset.ansrc; S.g = ''; S.lim = 200; S.open = ''; re(); window.scrollTo(0, 0); return; }
      const a = t.closest('[data-an]'); if (a) {
        const k = a.dataset.an;
        if (k === 'home') { S.src = '*'; S.open = ''; re(); window.scrollTo(0, 0); }
        else if (k === 'qx') { S.q = ''; S._focus = true; re(); }
        else if (k === 'openf') { S.open = S.open === 'f' ? '' : 'f'; re(); }
        else if (k === 'openc') { S.open = S.open === 'c' ? '' : 'c'; re(); }
        else if (k === 'clr') { delete S.f[S.src]; re(); }
        else if (k === 'allc') { delete S.cols[S.src]; keep(); re(); }
        else if (k === 'more') { S.lim += 500; re(); }
        else if (k === 'xls') exportXls(srcOf(S.src)).catch(er => C.toast(er.message));
        else if (k === 'pdf') exportPdf(srcOf(S.src)).catch(er => { C.busy(); C.toast(er.message); });
        return;
      }
      const rm = t.closest('[data-anrm]'); if (rm) { const F = S.f[S.src] || {}; delete F[rm.dataset.anrm]; re(); return; }
      const so = t.closest('[data-ansort]'); if (so) { const k = so.dataset.ansort, cur = S.sort && S.sort.s === S.src && S.sort.k === k ? S.sort : null; const s = srcOf(S.src), c = s.cols.find(x => x.k === k); S.sort = { s: S.src, k, d: cur ? -cur.d : (isNum(c) || c.t === 'd' ? -1 : 1) }; re(); return; }
      const gk = t.closest('[data-angk]'); if (gk && S.g && S.g[0] !== '_') { (S.f[S.src] = S.f[S.src] || {})[S.g] = gk.dataset.angk; S.g = ''; re(); return; }
    });
    el.addEventListener('input', ev => {
      const t = ev.target;
      if (t.id === 'ax-q') { clearTimeout(qT); qT = setTimeout(() => { S.q = t.value; S.lim = 200; S._focus = true; re(); }, 220); }
    });
    el.addEventListener('change', ev => {
      const t = ev.target, F = () => (S.f[S.src] = S.f[S.src] || {});
      if (t.id === 'ax-per') { S.per = t.value; keep(); re(); }
      else if (t.id === 'ax-da') { S.da = t.value; re(); } else if (t.id === 'ax-a') { S.a = t.value; re(); }
      else if (t.id === 'ax-g') { S.g = t.value; re(); }
      else if (t.dataset.anf) { F()[t.dataset.anf] = t.value; re(); }
      else if (t.dataset.anmin || t.dataset.anmax) { const k = t.dataset.anmin || t.dataset.anmax, o = F()[k] && typeof F()[k] === 'object' ? F()[k] : {}; o[t.dataset.anmin ? 'min' : 'max'] = t.value; F()[k] = o; re(); }
      else if (t.dataset.ancol) { const s = srcOf(S.src), V = visCols(s).map(c => c.k), k = t.dataset.ancol; let N = t.checked ? [...V, k] : V.filter(x => x !== k); if (!N.length) { C.toast('Lascia almeno una colonna'); t.checked = true; return; } N = s.cols.map(c => c.k).filter(x => N.includes(x)); S.cols[S.src] = N; keep(); re(); }
    });
  }

  /* ---------- descrizione dei filtri (per Excel e PDF) ---------- */
  function filtTxt(s) {
    const out = [];
    if (s.dk) out.push(['Periodo', perTxt()]);
    if (S.q.trim()) out.push(['Ricerca', `«${S.q.trim()}»`]);
    Object.entries(S.f[s.k] || {}).forEach(([k, v]) => { const c = s.cols.find(x => x.k === k); if (v === '' || v == null) return; if (typeof v === 'object') { const t = [v.min !== '' && v.min != null ? 'da ' + C.eur(v.min) : '', v.max !== '' && v.max != null ? 'a ' + C.eur(v.max) : ''].filter(Boolean).join(' '); if (t) out.push([c ? c.l : k, t]); } else out.push([c ? c.l : k, v]); });
    return out;
  }
  const slug = t => norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const stamp = () => new Date().toISOString().slice(0, 10);

  async function exportXls(s) {
    await C.loadXlsx(); const X = window.XLSX;
    const R = sorted(s, apply(s, s.rows())), V = visCols(s), G = groups(s, R);
    if (!R.length) return C.toast('Nessuna riga da esportare');
    const val = (c, v) => { if (v == null || v === '') return ''; if (c.t === 'd') { const d = String(v).slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return v; const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd, 12); } if (isNum(c)) return Number(v) || 0; return String(v); };
    const wb = X.utils.book_new();
    const ws = X.utils.aoa_to_sheet([V.map(c => c.l), ...R.map(r => V.map(c => val(c, r[c.k])))], { cellDates: true });
    const rng = X.utils.decode_range(ws['!ref']);
    V.forEach((c, j) => { const z = c.t === 'd' ? 'dd/mm/yyyy' : c.t === 'e' || c.t === 'u' ? '#,##0.00 €' : c.t === 'e3' ? '#,##0.000 €' : c.t === 'p' ? '0"%"' : c.t === 'n' ? '#,##0.##' : null; if (!z) return; for (let i = 1; i <= rng.e.r; i++) { const cell = ws[X.utils.encode_cell({ r: i, c: j })]; if (cell && cell.v !== '') cell.z = z; } });
    if (V.some(c => isNum(c))) { const i = rng.e.r + 2; V.forEach((c, j) => { if (j === 0) ws[X.utils.encode_cell({ r: i, c: 0 })] = { t: 's', v: 'Totale' }; else if (c.t[0] === 'e' || (c.t === 'n' && c.k !== 'giacenza' && c.k !== 'scorta' && c.k !== 'km')) { const L = X.utils.encode_col(j); ws[X.utils.encode_cell({ r: i, c: j })] = { t: 'n', f: `SUBTOTAL(9,${L}2:${L}${rng.e.r + 1})`, z: c.t[0] === 'e' ? '#,##0.00 €' : '#,##0.##' }; } }); ws['!ref'] = X.utils.encode_range({ s: rng.s, e: { r: i, c: rng.e.c } }); }
    ws['!autofilter'] = { ref: X.utils.encode_range({ s: rng.s, e: { r: rng.e.r, c: rng.e.c } }) };
    ws['!cols'] = V.map(c => ({ wch: Math.min(60, Math.max(c.l.length + 2, c.t === 'd' ? 11 : isNum(c) ? 13 : Math.min(48, Math.max(8, ...R.slice(0, 400).map(r => String(r[c.k] ?? '').length))) + 2)) }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    X.utils.book_append_sheet(wb, ws, s.n.slice(0, 31));
    if (G) {
      const gl = ({ _mese: 'Mese', _anno: 'Anno' })[S.g] || (s.cols.find(c => c.k === S.g) || {}).l || 'Gruppo';
      const gs = X.utils.aoa_to_sheet([[gl, 'Righe', ...G.nums.map(c => c.l)], ...G.L.map(x => [gLbl(S.g, x.k), x.n, ...G.nums.map(c => x.v[c.k] || 0)]), ['Totale', R.length, ...G.nums.map(c => r2(R.reduce((a, r) => a + (Number(r[c.k]) || 0), 0)))]]);
      const gr = X.utils.decode_range(gs['!ref']); for (let i = 1; i <= gr.e.r; i++) for (let j = 2; j <= gr.e.c; j++) { const cell = gs[X.utils.encode_cell({ r: i, c: j })]; if (cell) cell.z = '#,##0.00 €'; }
      gs['!cols'] = [{ wch: 34 }, { wch: 8 }, ...G.nums.map(() => ({ wch: 15 }))];
      X.utils.book_append_sheet(wb, gs, `Per ${gl}`.slice(0, 31));
    }
    const info = [['Analisi', s.n], ['Azienda', C.orgName()], ['Creato il', new Date().toLocaleString('it-IT')], ['Righe', R.length], ...filtTxt(s), ['Importi', 'IVA esclusa, salvo le colonne IVA e Totale']];
    const is = X.utils.aoa_to_sheet(info); is['!cols'] = [{ wch: 16 }, { wch: 60 }];
    X.utils.book_append_sheet(wb, is, 'Filtri');
    X.writeFile(wb, `analisi-${slug(s.n)}-${stamp()}.xlsx`, { compression: true });
    C.toast(`Excel creato: ${C.fmtNum(R.length, 0)} righe`);
  }

  async function exportPdf(s) {
    const R = sorted(s, apply(s, s.rows())), G = groups(s, R);
    if (!R.length) return C.toast('Nessuna riga da esportare');
    C.busy('Preparo il PDF…');
    const [jsPDF, logo, fonts] = await Promise.all([C.loadPdf(), C.logoPng(), C.loadFonts()]);
    let V = visCols(s);
    const land = V.length > 6, doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: land ? 'landscape' : 'portrait', compress: true });
    let FF = 'helvetica';
    if (fonts) { fonts.forEach(([w, data]) => { doc.addFileToVFS(`Inter-${w}.ttf`, data); doc.addFont(`Inter-${w}.ttf`, 'Inter', w === 'regular' ? 'normal' : w); }); FF = 'Inter'; }
    const W = land ? 297 : 210, H = land ? 210 : 297, M = 14, CW = W - 2 * M;
    const K = { navy: [23, 54, 109], blue: [51, 98, 171], ink: [31, 36, 48], muted: [120, 128, 142], line: [227, 231, 238], soft: [245, 247, 251], white: [255, 255, 255], orange: [235, 104, 52] };
    const fill = c => doc.setFillColor(...c), color = c => doc.setTextColor(...c), stroke = c => doc.setDrawColor(...c);
    const font = (st, sz) => { doc.setFont(FF, FF === 'helvetica' && st === 'semibold' ? 'bold' : st); doc.setFontSize(sz); };
    const alpha = a => doc.setGState(new doc.GState({ opacity: a }));
    const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    // intestazione
    const HB = 40; fill(K.navy); doc.rect(0, 0, W, HB, 'F'); fill(K.blue); alpha(.5); doc.triangle(W * .55, 0, W, 0, W, HB, 'F'); alpha(1);
    if (logo) { fill(K.white); doc.roundedRect(M, 10, 11, 11, 2.4, 2.4, 'F'); doc.addImage(logo, 'PNG', M + .6, 10.6, 9.8, 9.8); }
    color(K.white); font('bold', 9); doc.text(C.orgName().toUpperCase(), M + (logo ? 15 : 0), 14.5); font('normal', 7.5); alpha(.8); doc.text('Analisi dei dati', M + (logo ? 15 : 0), 19); alpha(1);
    font('bold', 7.5); doc.text('ANALISI', W - M, 14.5, { align: 'right' }); font('normal', 7.5); alpha(.8); doc.text(`Creato il ${oggi}`, W - M, 19, { align: 'right' }); alpha(1);
    font('bold', 18); doc.text(s.n, M, 31.5);
    const ft = filtTxt(s).map(([a, b]) => `${a}: ${b}`).join('   ·   ');
    font('normal', 8.5); alpha(.85); doc.text(doc.splitTextToSize(ft || 'Tutti i dati', CW)[0], M, 36.5); alpha(1);
    // riquadri
    const amtC = s.cols.find(c => c.k === s.amt), tot = R.reduce((a, r) => a + (Number(r[s.amt]) || 0), 0);
    const K4 = [['Righe', C.fmtNum(R.length, 0)], ...(amtC ? [[amtC.l + (s.k === 'articoli' ? '' : s.note ? ` (${s.note})` : ' (IVA escl.)'), C.eur(tot)], ['Media per riga', C.eur(R.length ? tot / R.length : 0)]] : []), ...(s.dk ? [['Dal / al', `${C.dIt(R.reduce((m, r) => !m || r.data < m ? r.data : m, ''))} – ${C.dIt(R.reduce((m, r) => r.data > m ? r.data : m, ''))}`]] : [])];
    let y = HB + 7; const bw = (CW - (K4.length - 1) * 4) / K4.length;
    K4.forEach(([l, v], i) => { const x = M + i * (bw + 4); fill(K.soft); stroke(K.line); doc.roundedRect(x, y, bw, 16, 2.5, 2.5, 'FD'); color(K.muted); font('normal', 7); doc.text(l.toUpperCase(), x + 4, y + 5.5); color(K.ink); font('bold', 11.5); doc.text(v, x + 4, y + 12.2); });
    y += 23;
    const tblBase = { theme: 'plain', styles: { font: FF, fontSize: 7.6, cellPadding: { top: 1.9, bottom: 1.9, left: 2, right: 2 }, textColor: K.ink, lineColor: K.line, lineWidth: { bottom: .2 }, overflow: 'linebreak' }, headStyles: { font: FF, fontStyle: 'bold', fontSize: 7, textColor: K.muted, fillColor: K.soft, lineWidth: { bottom: .3 }, lineColor: [200, 206, 216] }, margin: { left: M, right: M, top: 16, bottom: 14 } };
    if (G) {
      const gl = ({ _mese: 'Mese', _anno: 'Anno' })[S.g] || (s.cols.find(c => c.k === S.g) || {}).l || 'Gruppo';
      color(K.ink); font('bold', 10.5); doc.text(`Per ${gl.toLowerCase()}`, M, y); y += 3;
      doc.autoTable({ ...tblBase, startY: y, head: [[gl, 'Righe', ...G.nums.map(c => c.l), 'Quota']], body: [...G.L.slice(0, 200).map(x => [gLbl(S.g, x.k), C.fmtNum(x.n, 0), ...G.nums.map(c => C.eur(x.v[c.k] || 0)), tot ? C.fmtNum((x.v[s.amt] || 0) / tot * 100, 1) + '%' : '—'])], foot: [['Totale', C.fmtNum(R.length, 0), ...G.nums.map(c => C.eur(R.reduce((a, r) => a + (Number(r[c.k]) || 0), 0))), '100%']],
        footStyles: { font: FF, fontStyle: 'bold', fontSize: 7.6, textColor: K.ink, fillColor: K.soft }, columnStyles: Object.fromEntries([1, ...G.nums.map((_, i) => i + 2), G.nums.length + 2].map(i => [i, { halign: 'right' }])),
        didParseCell: d => { if ((d.section === 'head' || d.section === 'foot') && d.column.index > 0) d.cell.styles.halign = 'right'; } });
      y = doc.lastAutoTable.finalY + 9;
      if (y > H - 40) { doc.addPage(); y = 18; }
    }
    const MAXR = 5000, D = R.slice(0, MAXR);
    color(K.ink); font('bold', 10.5); doc.text('Dettaglio', M, y); font('normal', 7.5); color(K.muted); doc.text(R.length > MAXR ? `prime ${C.fmtNum(MAXR, 0)} di ${C.fmtNum(R.length, 0)} righe (tutte nell'Excel)` : `${C.fmtNum(R.length, 0)} ${R.length === 1 ? 'riga' : 'righe'}`, W - M, y, { align: 'right' }); y += 3;
    const numI = V.map((c, i) => isNum(c) ? i : -1).filter(i => i >= 0), mainI = V.findIndex(c => c.main);
    doc.autoTable({ ...tblBase, startY: y, head: [V.map(c => c.l)], body: D.map(r => V.map(c => fmt(c, r[c.k]))),
      foot: amtC && V.includes(amtC) ? [V.map((c, i) => i === 0 ? 'Totale' : c.t[0] === 'e' ? C.eur(R.reduce((a, r) => a + (Number(r[c.k]) || 0), 0)) : '')] : undefined,
      footStyles: { font: FF, fontStyle: 'bold', fontSize: 7.6, textColor: K.ink, fillColor: K.soft }, showFoot: 'lastPage',
      columnStyles: Object.fromEntries([...numI.map(i => [i, { halign: 'right', cellWidth: 'wrap' }]), ...V.map((c, i) => c.t === 'd' ? [i, { cellWidth: 'wrap' }] : null).filter(Boolean), ...(mainI >= 0 ? [[mainI, { cellWidth: 'auto', fontStyle: 'bold' }]] : [])]),
      didParseCell: d => { if ((d.section === 'head' || d.section === 'foot') && numI.includes(d.column.index)) d.cell.styles.halign = 'right'; } });
    const N = doc.getNumberOfPages();
    for (let i = 1; i <= N; i++) { doc.setPage(i); stroke(K.line); doc.setLineWidth(.3); doc.line(M, H - 9, W - M, H - 9); color(K.muted); font('normal', 7); doc.text(`${C.orgName()} · Analisi · ${s.n}`, M, H - 5); doc.text(`Pagina ${i} di ${N}`, W - M, H - 5, { align: 'right' }); }
    doc.setProperties({ title: `Analisi ${s.n}`, author: C.orgName(), creator: 'Centro di Costo' });
    doc.save(`analisi-${slug(s.n)}-${stamp()}.pdf`);
    C.busy(); C.toast('PDF creato');
  }

  window.CDC_AN = { render };
})();
