/* Centro di Costo — dati dimostrativi per la versione DEMO (codice DEMO2026).
   Tutto è inventato e generato nel browser: niente viene letto o salvato sul Foglio Google. */
(() => {
  'use strict';
  let seed = 20260426;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const r2 = n => Math.round(n * 100) / 100;
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const daysAgo = n => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  const uid = () => Math.floor(rnd() * 1e12).toString(36) + Math.floor(rnd() * 1e6).toString(36);

  window.CDC_DEMO = function () {
    seed = 20260426;
    const CENTRI = ['MILANO', 'TORINO', 'BOLOGNA', 'ROMA', 'NAPOLI'];
    const SEDI = [
      { cod: 'DM01', n: 'Sede Milano', tipo: 'Sede', ind: 'Via Roma 10 – Milano (MI)', key: 'AZIENDA DEMO VIA ROMA MILANO', loc: 'MILANO|20121', citta: 'Milano', prov: 'MI', geo: [9.19, 45.464] },
      { cod: 'DM02', n: 'Magazzino Torino', tipo: 'Magazzino', ind: 'Corso Francia 200 – Torino (TO)', key: 'MAGAZZINO TORINO', loc: 'TORINO|10143', citta: 'Torino', prov: 'TO', geo: [7.65, 45.075] },
      { cod: 'DM03', n: 'Piazzale Bologna', tipo: 'Piazzale', ind: 'Via Emilia 45 – Bologna (BO)', key: 'PIAZZALE BOLOGNA', loc: 'BOLOGNA|40132', citta: 'Bologna', prov: 'BO', geo: [11.3, 44.5] },
      { cod: 'DM04', n: 'Filiale Roma', tipo: 'Sede operativa', ind: 'Via Tiburtina 900 – Roma (RM)', key: 'FILIALE ROMA', loc: 'ROMA|00156', citta: 'Roma', prov: 'RM', geo: [12.58, 41.92] },
      { cod: 'DM05', n: 'Magazzino Napoli', tipo: 'Magazzino', ind: 'Via Argine 300 – Napoli (NA)', key: 'MAGAZZINO NAPOLI', loc: 'NAPOLI|80147', citta: 'Napoli', prov: 'NA', geo: [14.32, 40.86] },
      { cod: 'CDC99', n: 'Da attribuire', tipo: 'Sospeso', ind: 'Sede di consegna non indicata', key: '', loc: '', citta: '', prov: '', geo: null }
    ];
    const CDC_BY = { MILANO: 'DM01', TORINO: 'DM02', BOLOGNA: 'DM03', ROMA: 'DM04', NAPOLI: 'DM05' };
    // ---------- acquisti di attrezzatura ----------
    const ART = [
      ['Guanti nitrile nero tg. L (conf. 100)', 'CONF', 8.9, 'Würth'], ['Scarpe antinfortunistiche S3 tg. 43', 'PA', 64.5, 'Cofra'], ['T-shirt cotone con logo', 'PZ', 6.2, 'Payper'],
      ['Felpa con zip blu navy', 'PZ', 18.5, 'Payper'], ['Gilet alta visibilità arancio', 'PZ', 7.4, 'Portwest'], ['Avvitatore a batteria 18V', 'PZ', 189, 'Milwaukee'],
      ['Batteria 18V 5,0 Ah', 'PZ', 98, 'Milwaukee'], ['Smerigliatrice angolare 125 mm', 'PZ', 145, 'DeWalt'], ['Disco da taglio inox 125 mm', 'PZ', 1.35, 'Würth'],
      ['Punta HSS 8 mm', 'PZ', 2.1, 'Würth'], ['Viti autoperforanti 4,2x19 (conf. 500)', 'CONF', 14.8, 'Würth'], ['Rivetti alluminio 4,8x12 (conf. 250)', 'CONF', 11.5, 'Berner'],
      ['Silicone trasparente 310 ml', 'PZ', 4.9, 'Berner'], ['Sgrassatore spray 400 ml', 'PZ', 5.6, 'Würth'], ['Nastro americano 50 mm', 'PZ', 3.2, 'Propac'],
      ['Scatola cartone 40x30x30', 'PZ', 1.1, 'Propac'], ['Film estensibile 23 my', 'PZ', 12.9, 'Propac'], ['Carta mani piegata (cartone)', 'CONF', 24, 'Lyreco'],
      ['Toner stampante nero', 'PZ', 69, 'Lyreco'], ['Risma carta A4 80 g', 'PZ', 4.2, 'Lyreco'], ['Chiave combinata 13 mm', 'PZ', 7.8, 'USAG'],
      ['Set cacciaviti 8 pezzi', 'PZ', 32, 'USAG'], ['Cassetta attrezzi completa', 'PZ', 249, 'USAG'], ['Prolunga avvolgicavo 25 m', 'PZ', 39, 'Amazon'],
      ['Faro LED da cantiere 50W', 'PZ', 45, 'Amazon'], ['Idropulitrice acqua fredda 150 bar', 'PZ', 299, 'Lavor'], ['Aspiratore solidi e liquidi 30 L', 'PZ', 129, 'Lavor'],
      ['Spese di trasporto', 'PZ', 12, 'Würth'], ['Occhiali di protezione', 'PZ', 3.9, 'Cofra'], ['Cuffie antirumore', 'PZ', 16.5, 'Cofra']
    ];
    const cat = d => { const D = d.toUpperCase();
      if (/TRASPORTO/.test(D)) return 'Trasporti e servizi'; if (/T-SHIRT|FELPA|GILET/.test(D)) return 'Abbigliamento da lavoro'; if (/SCARPE|GUANT|OCCHIAL|CUFFIE/.test(D)) return 'DPI e sicurezza';
      if (/SCATOLA|FILM|NASTRO/.test(D)) return 'Imballaggio'; if (/CARTA MANI|SGRASS/.test(D)) return 'Pulizia e igiene'; if (/TONER|RISMA/.test(D)) return 'Ufficio e informatica';
      if (/DISCO|PUNTA/.test(D)) return 'Accessori per utensili'; if (/AVVITATORE|BATTERIA|SMERIGLIATRICE|IDROPULITRICE|ASPIRATORE/.test(D)) return 'Elettroutensili e batterie';
      if (/VITI|RIVETTI/.test(D)) return 'Minuteria e fissaggio'; if (/SILICONE/.test(D)) return 'Chimici e sigillanti'; if (/PROLUNGA|FARO|LED/.test(D)) return 'Elettrico e illuminazione'; return 'Utensili e attrezzature'; };
    const movimenti = [];
    for (let i = 0; i < 360; i++) {
      const a = pick(ART), d = daysAgo(int(0, 360)), q = a[1] === 'PZ' && a[2] > 100 ? int(1, 2) : int(1, 20);
      movimenti.push({ id: 'dm' + uid(), data: ds(d), ndoc: 'DDT ' + int(1000, 9999), codice: 'ART' + int(10000, 99999), descrizione: a[0].toUpperCase(), um: a[1], quantita: q, prezzo: r2(a[2] * (0.9 + rnd() * 0.2)), iva: 0.22,
        centro: pick(CENTRI), societa: 'Soluzione Veicolare', categoria: cat(a[0]), fornitore: a[3], note: '', creato: ds(d) });
    }
    // ---------- spedizioni GLS ----------
    const DEST = [['Ricambi Rossi S.r.l.', 'Milano', 'MI', 'Lombardia'], ['Officina Bianchi', 'Torino', 'TO', 'Piemonte'], ['Autoservice Verdi', 'Bologna', 'BO', 'Emilia-Romagna'], ['Logistica Nord', 'Verona', 'VR', 'Veneto'],
      ['Carrozzeria Esposito', 'Napoli', 'NA', 'Campania'], ['Gomme Express', 'Roma', 'RM', 'Lazio'], ['Ferramenta Conti', 'Firenze', 'FI', 'Toscana'], ['Truck Center Sud', 'Bari', 'BA', 'Puglia'],
      ['Flotte Italia', 'Padova', 'PD', 'Veneto'], ['Service Adriatico', 'Pescara', 'PE', 'Abruzzo'], ['Moto Ricambi', 'Brescia', 'BS', 'Lombardia'], ['Isola Auto', 'Palermo', 'PA', 'Sicilia']];
    const gls = [];
    for (let m = 5; m >= 0; m--) {
      const base = new Date(now.getFullYear(), now.getMonth() - m, 1), mese = `${base.getFullYear()}-${pad(base.getMonth() + 1)}`, n = int(55, 85);
      for (let i = 0; i < n; i++) {
        const dd = pick(DEST), c = pick(CENTRI), colli = int(1, 6), kg = r2(colli * (2 + rnd() * 12)), nolo = r2(6.5 + kg * 0.32), fuel = r2(nolo * 0.12), suppl = rnd() < 0.15 ? r2(3 + rnd() * 9) : 0;
        const day = new Date(base); day.setDate(int(1, 27));
        gls.push({ id: 'dg' + uid(), mese, data: ds(day), contratto: '1234', nsped: String(int(600000000, 699999999)), rif: 'ORD' + int(1000, 9999), destinatario: dd[0], citta: dd[1], prov: dd[2], regione: dd[3],
          cdc: CDC_BY[c], cdcNome: c, tipologia: rnd() < 0.85 ? 'Nazionale' : 'Express', colli, kgReali: kg, kgTass: Math.ceil(kg), nolo, fuel, suppl, totale: r2(nolo + fuel + suppl), gg: int(1, 3), riaddebito: rnd() < 0.2 ? 'Cliente' : '', note: '' });
      }
    }
    // ---------- gasolio ----------
    const MEZZI = [['FX123AB', 'Furgone Iveco Daily', 'Marco Neri'], ['GA456CD', 'Furgone Ford Transit', 'Luca Gallo'], ['FY789EF', 'Fiat Ducato', 'Paolo Riva'], ['GB012GH', 'Renault Master', 'Andrea Fontana'], ['FZ345IL', 'Peugeot Boxer', 'Sara Greco']];
    const gasolio = [];
    MEZZI.forEach(([targa, mezzo, op], k) => { let km = 40000 + k * 23000;
      for (let d = 180; d > 0; d -= int(6, 10)) { const lt = r2(45 + rnd() * 30); km += Math.round(lt * (11 + rnd() * 3));
        gasolio.push({ id: 'dq' + uid(), data: ds(daysAgo(d)), targa, km, litri: lt, prezzo: r2(1.68 + rnd() * 0.14), proprietario: 'Aziendale', operatore: op, centro: CENTRI[k % CENTRI.length], uso: mezzo, note: '' }); } });
    // ---------- fatture fornitori ----------
    const FORN = ['Würth S.r.l.', 'Berner S.p.A.', 'Cofra S.r.l.', 'Milwaukee Italia', 'Propac S.r.l.', 'Payper S.p.A.', 'Officina Meccanica Sud', 'Energia Più S.p.A.'];
    const fatture = [];
    for (let i = 0; i < 46; i++) {
      const d = daysAgo(int(5, 300)), imp = r2(150 + rnd() * 3800), sc = new Date(d); sc.setDate(sc.getDate() + pick([30, 60, 90]));
      const paid = ds(sc) < ds(now) ? rnd() < 0.85 : rnd() < 0.2;
      fatture.push({ id: 'df' + uid(), fornitore: pick(FORN), numero: `${int(1, 999)}/${d.getFullYear()}`, data: ds(d), scadenza: ds(sc), imponibile: imp, imposta: r2(imp * 0.22), totale: r2(imp * 1.22), centro: pick(CENTRI),
        categoria: pick(['Utensili e attrezzature', 'DPI e sicurezza', 'Abbigliamento da lavoro', 'Imballaggio', 'Trasporti e servizi']), stato: paid ? 'pagata' : 'da pagare', pagata: paid ? ds(sc) : '', ddt: '', righe: '', pdf: '', note: '', creato: ds(d) });
    }
    // ---------- Lyreco ----------
    const LYA = [['Carta A4 80 g (risma)', 'Ufficio', 4.1], ['Toner nero', 'Informatica', 68], ['Penne a sfera blu (conf. 50)', 'Cancelleria', 12.5], ['Carta igienica (conf. 48)', 'Igiene', 29.9],
      ['Detergente multiuso 5 L', 'Pulizia', 11.8], ['Sacchi neri 110 L', 'Pulizia', 9.4], ['Raccoglitori ad anelli', 'Archiviazione', 2.3], ['Caffè in capsule (100)', 'Pausa caffè', 27]];
    const lyreco = [], lyfatture = [];
    for (let m = 7; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, int(3, 25)), nf = String(2026000000 + int(100000, 999999)); let tot = 0;
      for (let i = 0; i < int(6, 14); i++) { const a = pick(LYA), q = int(1, 10), s = pick(SEDI.slice(0, 5)), imp = r2(a[2] * q); tot += imp;
        lyreco.push({ id: 'dl' + uid(), fattura: nf, tipo: 'TD01', data: ds(d), ddt: String(int(800000, 899999)), dataDdt: ds(d), ordine: 'OR' + int(10000, 99999), richiedente: pick(['M. Neri', 'L. Gallo', 'S. Greco']), codice: String(int(100000, 999999)), descrizione: a[0].toUpperCase(), categoria: a[1], quantita: q, um: 'PZ', prezzo: a[2], importo: imp, iva: 22, sede: s.key, cdc: s.cod, note: '' }); }
      lyfatture.push({ id: nf, tipo: 'TD01', data: ds(d), descrizione: 'Fattura', imponibile: r2(tot), totale: r2(tot * 1.22), stato: m > 1 ? 'pagata' : 'da pagare', pagata: m > 1 ? ds(d) : '', pdf: '', note: '' });
    }
    // ---------- Amazon ----------
    const AMA = [['Organizer per minuteria 24 scomparti', 'Organizzazione', 19.9], ['Prolunga elettrica 10 m', 'Elettrico', 24.5], ['Faretto LED ricaricabile', 'Illuminazione', 32], ['Mouse wireless', 'Informatica', 14.9],
      ['Cavo USB-C 2 m (2 pezzi)', 'Informatica', 11.9], ['Termometro digitale', 'Varie', 9.9], ['Kit pronto soccorso', 'Sicurezza', 26.5], ['Tappetino ergonomico', 'Ufficio', 22]];
    const amazon = [], amazonart = [];
    for (let i = 0; i < 34; i++) {
      const d = daysAgo(int(2, 330)), id = `40${int(1, 9)}-${int(1000000, 9999999)}-${int(1000000, 9999999)}`, s = pick(SEDI.slice(0, 5)); let sub = 0, pz = 0; const n = int(1, 3);
      for (let k = 0; k < n; k++) { const a = pick(AMA), q = int(1, 3); sub += a[2] * q; pz += q;
        amazonart.push({ id: id + '-' + k, ordine: id, data: ds(d), quantita: q, descrizione: a[0], prezzo: a[2], importo: r2(a[2] * q), venditore: 'Amazon', condizione: 'Nuovo', spedito: ds(d), localita: s.citta.toUpperCase(), categoria: a[1] }); }
      const totale = r2(sub), imp = r2(totale / 1.22);
      amazon.push({ id, data: ds(d), articoli: n, pezzi: pz, venditore: 'Amazon', destinatario: 'Azienda Demo', localita: s.citta.toUpperCase(), pagamento: 'Carta aziendale', subtotale: totale, spedizione: 0, sconti: 0, imponibile: imp, iva: r2(totale - imp), totale, ivaTipo: 'fattura', cdc: s.cod, note: '', pdf: '' });
    }
    // ---------- preventivi, clienti, ordini Torental ----------
    const config = {
      azienda: { nome: 'Azienda Demo S.r.l.', citta: 'Milano (MI)' }, centri: CENTRI, lyCdc: SEDI, ppRic: 2,
      budget: { MILANO: 26000, TORINO: 18000, BOLOGNA: 17000, ROMA: 20000, NAPOLI: 12000 },
      pvClienti: [{ id: 'c1', nome: 'Rossi Trasporti S.r.l.', ref: 'Mario Rossi', email: 'info@rossitrasporti.example', tel: '02 1234567', ind: 'Via Milano 1, Milano', ric: '' },
        { id: 'c2', nome: 'Edil Bianchi', ref: 'Giulia Bianchi', email: 'giulia@edilbianchi.example', tel: '011 7654321', ind: 'Corso Torino 5, Torino', ric: 70 },
        { id: 'c3', nome: 'Officina Verdi', ref: 'Luca Verdi', email: 'officina@verdi.example', tel: '051 222333', ind: 'Via Bologna 9, Bologna', ric: '' }]
    };
    const y = now.getFullYear();
    const pv = (id, num, cli, stato, giorni, righe, extra) => { config['pv:' + id] = Object.assign({ id, num, data: ds(daysAgo(giorni)), valid: 30, stato, cliente: { nome: cli.nome, ref: cli.ref, email: cli.email, tel: cli.tel, ind: cli.ind }, righe, sconto: 0, note: 'Consegna in 10 giorni lavorativi.', iva: 22, agg: daysAgo(giorni).toISOString() }, extra || {}); };
    pv('d1', `P${y}-004`, config.pvClienti[0], 'inviato', 3, [{ sup: 'payper', it: '000001', n: 'MIAMI+', cl: 'T-SHIRT', c: '00000', cn: 'BIANCO', sz: ['S', 'M', 'L', 'XL'], q: { S: 4, M: 10, L: 10, XL: 6 }, p: 6.9, man: true, sc: 0 }]);
    pv('d2', `P${y}-003`, config.pvClienti[1], 'accettato', 12, [{ sup: 'payper', it: '000001', n: 'MIAMI+', cl: 'T-SHIRT', c: '01000', cn: 'GIALLO', sz: ['M', 'L'], q: { M: 15, L: 15 }, p: 6.9, man: true, sc: 5 }]);
    pv('d3', `P${y}-002`, config.pvClienti[2], 'bozza', 20, []);
    config.trClienti = [{ id: 't1', nome: 'Noleggi Express S.r.l.', ref: 'Anna Conti', tel: '06 998877', email: 'anna@noleggiexpress.example', ind: 'Roma', piva: '' }];
    config['tro:o1'] = { id: 'o1', num: `T${y}-001`, data: ds(daysAgo(6)), consegna: ds(daysAgo(-8)), stato: 'confermato', cliente: { nome: 'Noleggi Express S.r.l.', ref: 'Anna Conti', tel: '06 998877', email: 'anna@noleggiexpress.example', ind: 'Roma', piva: '' }, cliId: 't1', mezzi: '4 furgoni', righe: [{ t: 'Applicazione kit adesivi furgone', cod: 'DEMO-APP', q: 4, p: 85 }, { t: 'Transferta (1 giorno, 100 km)', cod: 'TRASF', q: 1, p: 120 }], sconto: 0, note: '' };
    return { movimenti, gls, gasolio, fatture, lyreco, lyfatture, amazon, amazonart, pdf: [], config, ai: false, aik: { gemini: false }, aiFirst: 'gemini', v: 'demo' };
  };
})();
