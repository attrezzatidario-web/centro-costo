/* Centro di Costo — «Scopri cosa può fare» (v97)
   Pagina di presentazione per i clienti: si apre dalla pagina di accesso e dalla demo.
   Si adatta all'attività scelta (settori.js). Animazioni leggere in CSS, ferme con «riduci movimento». */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SOON = new Set(); // funzioni in preparazione: etichetta «in arrivo»

  // esempi di righe di fattura riconosciute in automatico, per attività
  const EX = {
    veicoli: [['GUANTI NITRILE NERO TG. L', 'DPI e sicurezza'], ['AVVITATORE M18 FUEL', 'Elettroutensili e batterie'], ['FELPA ZIP BLU NAVY', 'Abbigliamento da lavoro'], ['VITI AUTOPERFORANTI 4,2X19', 'Minuteria e fissaggio']],
    bar: [['CAFFÈ IN GRANI MISCELA BAR 1 KG', 'Caffè e bevande calde'], ['CORNETTI ALLA CREMA (CONF. 50)', 'Food e pasticceria'], ['APEROL 1 L', 'Bevande e alcolici'], ['BICCHIERI CARTA ASPORTO', 'Monouso e packaging']],
    pizzeria: [['FARINA TIPO 00 SACCO 25 KG', 'Farine e impasti'], ['FIOR DI LATTE PER PIZZA', 'Latticini e formaggi'], ['CARTONI PIZZA 33X33', 'Cartoni e asporto'], ['LEGNA DI FAGGIO PER FORNO', 'Forno e combustibili']],
    ristorante: [['FILETTO DI MANZO', 'Carne'], ['VONGOLE VERACI', 'Pesce'], ['VINO CHIANTI CLASSICO', 'Vini e bevande'], ['NOLEGGIO TOVAGLIATO', 'Tovagliato e lavanderia']],
    lavanderia: [['DETERSIVO LIQUIDO 20 KG', 'Detersivi e prodotti chimici'], ['GRUCCE IN METALLO (500)', 'Grucce e imballi'], ['GUARNIZIONE OBLÒ LAVATRICE', 'Macchinari e ricambi'], ['BOLLETTA ENERGIA ELETTRICA', 'Utenze']],
    edile: [['CEMENTO 32,5 R SACCO 25 KG', 'Cementi, malte e premiscelati'], ['TONDINO FERRO B450C 12 MM', 'Ferro e acciaio'], ['LASTRA CARTONGESSO 120X200', 'Isolanti e cartongesso'], ['SABBIA LAVATA BIG BAG', 'Inerti']],
    impresa: [['NOLEGGIO MINIESCAVATORE', 'Noleggi mezzi e attrezzature'], ['SMALTIMENTO MACERIE CASSONE', 'Smaltimento rifiuti'], ['SUBAPPALTO IMPIANTO ELETTRICO', 'Subappalti e manodopera'], ['SCARPE ANTINFORTUNISTICHE S3', 'DPI e sicurezza']],
    negozio: [['SHOPPER CARTA PERSONALIZZATE', 'Imballi e shopper'], ['SCAFFALE ESPOSITORE', 'Allestimento e arredo'], ['ROTOLI CASSA TERMICI', 'Ufficio, cassa e informatica'], ['SPESE CORRIERE ESPRESSO', 'Spedizioni e-commerce']],
    estetica: [['TINTA IN CREMA 100 ML', 'Prodotti professionali'], ['ASCIUGAMANI MONOUSO (100)', 'Monouso e consumabili'], ['PHON PROFESSIONALE 2000 W', 'Attrezzature e arredi'], ['ABBONAMENTO APP PRENOTAZIONI', 'Prenotazioni e app']],
    hotel: [['KIT CORTESIA (100 PEZZI)', 'Kit cortesia'], ['NOLEGGIO BIANCHERIA', 'Biancheria e lavanderia'], ['COMMISSIONI BOOKING.COM', 'Commissioni portali'], ['MARMELLATA MONOPORZIONE', 'Colazione e food']],
    altro: [['TONER STAMPANTE NERO', 'Ufficio, cassa e informatica'], ['SERVIZIO PULIZIE MENSILE', 'Servizi'], ['CONSULENZA COMMERCIALISTA', 'Personale e consulenze'], ['CANONE DI LOCAZIONE UFFICIO', 'Affitto e locazioni']]
  };
  // a chi si rivolge, per il titolo
  const PL = { veicoli: 'officine e allestitori', bar: 'bar e caffetterie', pizzeria: 'pizzerie', ristorante: 'ristoranti', lavanderia: 'lavanderie', edile: 'ingrossi edili', impresa: 'imprese edili', negozio: 'negozi', estetica: 'parrucchieri ed estetisti', hotel: 'hotel e B&B', altro: 'ogni azienda' };
  const VEI_CAT = ['Trasporti e servizi', 'Abbigliamento da lavoro', 'DPI e sicurezza', 'Imballaggio', 'Pulizia e igiene', 'Ufficio e informatica', 'Accessori per utensili', 'Elettroutensili e batterie', 'Minuteria e fissaggio', 'Chimici e sigillanti', 'Elettrico e illuminazione', 'Utensili e attrezzature'];
  const LOGOS = ['payper', 'milwaukee', 'cofra', 'portwest', 'usag', 'dewalt', 'stanley', 'lavor', 'propac', 'promit', 'maxilia', 'sola', 'ffg', 'benman', 'activegear', 'jrc', 'hugo'];

  // illustrazioni animate delle funzioni (SVG + classi CSS)
  const ILL = {
    spese: `<svg viewBox="0 0 200 110" class="il il-bars">${[[46, 34], [58, 40], [52, 44], [70, 46], [64, 42], [84, 50], [78, 48]].map(([r, c], i) => `<rect class="rv1" x="${16 + i * 25}" y="${100 - r}" width="9" height="${r}" rx="2.5" style="--i:${i}"/><rect class="cv1" x="${26 + i * 25}" y="${100 - c}" width="9" height="${c}" rx="2.5" style="--i:${i}"/>`).join('')}<path class="il-line" d="M25 78 L50 70 L75 76 L100 62 L125 64 L150 52 L175 54" pathLength="1"/></svg>`,
    forn: `<div class="il il-logos"><div class="il-track">${[...LOGOS, ...LOGOS].map(l => `<img src="logo-${l}.svg" alt="" loading="lazy">`).join('')}</div></div>`,
    prev: `<svg viewBox="0 0 200 110" class="il il-doc"><rect x="58" y="8" width="84" height="96" rx="6" class="pg"/>${[24, 34, 44, 58, 68, 78].map((y, i) => `<path d="M70 ${y} H${i % 3 === 2 ? 112 : 130}" pathLength="1" style="--i:${i}"/>`).join('')}<g class="bdg"><rect x="118" y="74" width="44" height="22" rx="6"/><text x="140" y="89">PDF</text></g></svg>`,
    mag: `<svg viewBox="0 0 200 110" class="il il-shelf"><path d="M30 34 H170 M30 68 H170 M30 102 H170" class="sh"/>${[[40, 12], [66, 12], [92, 12], [44, 46], [70, 46], [118, 46], [40, 80], [96, 80], [122, 80], [148, 80]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="22" height="22" rx="3" style="--i:${i}"/>`).join('')}<g class="cnt"><rect x="142" y="8" width="44" height="22" rx="11"/><text x="164" y="23">128</text></g></svg>`,
    ddt: `<svg viewBox="0 0 200 110" class="il il-ddt">${[0, 1, 2].map(i => `<g class="d" style="--i:${i}"><rect x="${12 + i * 10}" y="${14 + i * 8}" width="46" height="58" rx="4"/><path d="M${20 + i * 10} ${30 + i * 8} H${48 + i * 10} M${20 + i * 10} ${40 + i * 8} H${42 + i * 10}"/></g>`).join('')}<path class="ar" d="M84 56 H112" pathLength="1"/><path class="ah" d="M106 50 L114 56 L106 62"/><g class="inv"><rect x="124" y="14" width="62" height="82" rx="5"/><path d="M134 32 H176 M134 44 H168 M134 56 H176"/><rect x="134" y="70" width="42" height="14" rx="3" class="tot"/></g></svg>`,
    ai: `<svg viewBox="0 0 200 110" class="il il-ai"><rect x="50" y="6" width="100" height="98" rx="6" class="pg"/>${[20, 32, 44, 56, 68, 80].map((y, i) => `<rect x="62" y="${y}" width="${[60, 44, 70, 52, 66, 40][i]}" height="6" rx="3" class="ln" style="--i:${i}"/>`).join('')}<rect x="52" y="10" width="96" height="4" rx="2" class="scan"/><g class="ok"><circle cx="150" cy="88" r="14"/><path d="M143 88 L148 93 L157 83"/></g></svg>`,
    sedi: `<svg viewBox="0 0 200 110" class="il il-map"><path class="ln" d="M44 72 L96 36 L150 60 L120 92 Z" pathLength="1"/>${[[44, 72], [96, 36], [150, 60], [120, 92]].map(([x, y], i) => `<g style="--i:${i}"><circle class="pu" cx="${x}" cy="${y}" r="10"/><circle class="pt" cx="${x}" cy="${y}" r="5"/></g>`).join('')}</svg>`,
    cli: `<svg viewBox="0 0 200 110" class="il il-cli">${[0, 1, 2].map(i => `<g style="--i:${i}"><rect x="30" y="${12 + i * 32}" width="140" height="26" rx="8"/><circle cx="46" cy="${25 + i * 32}" r="7"/><rect x="60" y="${20 + i * 32}" width="${[64, 52, 72][i]}" height="5" rx="2.5" class="t"/><rect x="60" y="${29 + i * 32}" width="${[40, 34, 46][i]}" height="4" rx="2" class="t2"/></g>`).join('')}</svg>`,
    acc: `<svg viewBox="0 0 200 110" class="il il-dev"><rect x="26" y="18" width="96" height="62" rx="5" class="lp"/><path d="M16 86 H132" class="lp"/><rect x="148" y="30" width="34" height="62" rx="6" class="ph"/>${[0, 1, 2].map(i => `<circle class="dt" cx="${128 + i * 7}" cy="56" r="2.2" style="--i:${i}"/>`).join('')}<path class="ck" d="M60 48 L70 58 L88 40" pathLength="1"/></svg>`
  };
  const FEAT = [
    ['spese', 'Quanto guadagni, davvero', 'Incassi, fatture e spese in un unico conto: ricavi, costi e utile mese per mese e per ogni sede.'],
    ['forn', 'Tutti i fornitori', 'Cataloghi con foto, codici e listini di 17 fornitori. Aggiungiamo anche i tuoi.'],
    ['prev', 'Preventivi in un clic', 'Scegli i prodotti, applichi ricarico e sconti, scarichi un PDF professionale da mandare al cliente.'],
    ['ai', 'Fatture lette dall\'IA', 'Fotografi o carichi la fattura del fornitore: righe, importi e categorie si compilano da soli.'],
    ['cli', 'Clienti', 'Anagrafica dei clienti con contatti, ricarico personale e storico dei preventivi.'],
    ['mag', 'Magazzino', 'Articoli, giacenze, carichi e scarichi. Sai sempre cosa hai e cosa riordinare.'],
    ['ddt', 'DDT e fatture di fine mese', 'Fai i DDT durante il mese e a fine mese li raccogli in una fattura, con PDF e file XML.'],
    ['sedi', 'Più sedi', 'Locali, cantieri, depositi o punti vendita: spese e confronto tra le tue sedi, con mappa.'],
    ['acc', 'Ovunque e in sicurezza', 'Da PC e telefono. Ogni collaboratore con il suo accesso, i dati restano solo tuoi.']
  ];
  const STEPS = [
    ['Raccontami la tua attività', 'Mi dici come lavori, quali fornitori usi e cosa ti serve controllare.'],
    ['Preparo il tuo gestionale', 'Sezioni, categorie e nomi su misura. I tuoi fornitori con i loro listini.'],
    ['Importo i tuoi dati', 'Fatture, Excel e storico che hai già: niente da ricopiare a mano.'],
    ['Cresce con te', 'Ti serve qualcosa di nuovo? Lo aggiungo. Il gestionale si adatta a te, non il contrario.']
  ];
  const WISH = ['Un nuovo fornitore con il suo listino', 'Un report per il commercialista', 'Import dal tuo vecchio programma', 'Una sezione tutta tua', 'Ordini ai fornitori', 'Scadenzario dei pagamenti', 'Etichette e codici a barre', 'Collegamento all\'e-commerce'];

  let root = null, opts = {}, sel = 'veicoli', obs = null, timers = [];
  const SET = () => window.CDC_SETTORI || { list: [], get: () => null };

  function heroMock() {
    return `<div class="tr-mock" aria-hidden="true">
      <div class="tm-top"><i></i><i></i><i></i><span>Dashboard</span></div>
      <div class="tm-kpi"><div><small>Utile del mese</small><b data-cnt="8460">0 €</b><em class="up">▲ 12% rispetto al mese prima</em></div>
        <svg class="tm-donut" viewBox="0 0 42 42"><circle r="15.9" cx="21" cy="21" class="bg"/>${[[38, 0], [27, 38], [20, 65], [15, 85]].map(([v, o], i) => `<circle r="15.9" cx="21" cy="21" class="sg s${i}" style="--v:${v};--o:${o};--i:${i}"/>`).join('')}</svg></div>
      <div class="tm-bars">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i};--h:${30 + ((i * 37) % 60)}%"></i>`).join('')}</div>
      <div class="tm-rows">${[['Fattura letta dall\'IA', '14 righe · categorie assegnate'], ['Preventivo inviato', 'PDF con foto dei prodotti'], ['Sotto scorta', '3 articoli da riordinare']].map(([t, d], i) => `<div class="tm-r" style="--i:${i}"><span class="tm-ic"></span><span><b>${t}</b><small>${d}</small></span></div>`).join('')}</div>
    </div>`;
  }
  function render() {
    const S = SET(), s = S.get(sel) || S.list[0] || { n: '', s: '', sede: ['Sede', 'Sedi'], cat: [] };
    const cats = s.cat ? [...new Set(s.cat.map(c => c[0]))] : VEI_CAT, C = opts.contatti || {};
    const word = PL[s.id] || (s.s || s.n || '').toLowerCase();
    const ex = EX[s.id] || EX.altro;
    const mail = `mailto:${C.email}?subject=${encodeURIComponent('Centro di Costo · ' + (s.n || ''))}&body=${encodeURIComponent(`Ciao ${C.nome || ''},\nvorrei maggiori informazioni sul gestionale per la mia attività (${s.n || ''}).\n\nAzienda:\nCittà:\nCosa mi servirebbe:\n`)}`;
    root.innerHTML = `<div class="tr-scroll">
      <header class="tr-bar"><div class="tr-brand"><img src="logo.svg" alt="" width="30" height="30"><b>Centro di Costo</b></div>
        <div class="tr-bar-r"><a class="tr-btn ghost sm" href="${esc(mail)}">Contattami</a><button type="button" class="tr-x" data-tr="close" aria-label="Chiudi">✕</button></div></header>

      <section class="tr-hero">
        <div class="tr-hl rv">
          <span class="tr-eye">Gestionale aziendale su misura</span>
          <h1>Il gestionale su misura per <span class="tr-word" data-word>${esc(word)}</span></h1>
          <p>Quanto incassi, quanto spendi e quanto ti resta. Fornitori, preventivi, clienti, magazzino e fatture in un unico posto, su PC e telefono. Preparato su misura per come lavori, e personalizzabile quanto vuoi.</p>
          <div class="tr-cta">${opts.demo ? '' : `<button type="button" class="tr-btn" data-tr="demo">Prova la demo</button>`}<button type="button" class="tr-btn ${opts.demo ? '' : 'alt'}" data-tr="req">Richiedi il tuo gestionale</button><a class="tr-btn ghost" href="${esc(mail)}">Scrivimi</a></div>
        </div>
        <div class="tr-hr rv">${heroMock()}</div>
      </section>

      <section class="tr-sec tr-sets rv"><h2>Scegli la tua attività</h2><p class="tr-sub">Nomi, sezioni e categorie si adattano da soli.</p>
        <div class="tr-chips">${S.list.map(x => `<button type="button" class="tr-chip${x.id === sel ? ' on' : ''}" data-trset="${x.id}"><svg viewBox="0 0 24 24">${x.ic}</svg>${esc(x.s || x.n)}</button>`).join('')}</div></section>

      <section class="tr-sec"><div class="tr-h rv"><h2>Tutto quello che serve, in un posto solo</h2><p class="tr-sub">Ogni funzione si accende o si spegne: tieni solo quello che usi.</p></div>
        <div class="tr-grid">${FEAT.map(([k, t, d], i) => `<article class="tr-f rv" style="--d:${(i % 3) * 90}ms"><div class="tr-ill">${ILL[k]}</div><h3>${t}${SOON.has(k) ? '<span class="tr-soon">in arrivo</span>' : ''}</h3><p>${d}</p></article>`).join('')}</div></section>

      <section class="tr-sec tr-fit"><div class="tr-fit-l rv"><span class="tr-eye">Per ${esc(word)}</span><h2>Parla la lingua della tua attività</h2>
          <ul class="tr-pts"><li><b>${esc(s.sede ? s.sede[1] : 'Sedi')}</b> al posto di sedi generiche: confronti le spese tra ${s.sede && s.sede[2] ? 'le tue' : 'i tuoi'} ${esc((s.sede ? s.sede[1] : 'sedi').toLowerCase())}</li><li><b>${cats.length} categorie di spesa</b> già pronte e modificabili</li><li><b>Ogni riga riconosciuta da sola</b>: scrivi o importi, la categoria si assegna in automatico</li></ul>
          <div class="tr-cats">${cats.map((c, i) => `<span style="--i:${i}">${esc(c)}</span>`).join('')}</div></div>
        <div class="tr-fit-r rv"><div class="tr-cls" aria-hidden="true"><div class="cl-h">Riconoscimento automatico</div>${ex.map(([t, c], i) => `<div class="cl-r" style="--i:${i}"><span class="cl-t">${esc(t)}</span><span class="cl-a"></span><span class="cl-c">${esc(c)}</span></div>`).join('')}</div></div>
      </section>

      <section class="tr-sec tr-num rv">${[[17, '', 'fornitori con catalogo'], [25000, '+', 'codici prodotto con foto'], [11, '', 'attività già pronte'], [24, '/7', 'da PC e telefono']].map(([n, u, l]) => `<div><b data-cnt="${n}" data-u="${u}">0</b><span>${l}</span></div>`).join('')}</section>

      <section class="tr-sec tr-how"><div class="tr-h rv"><h2>Su misura, davvero</h2><p class="tr-sub">Non un programma uguale per tutti: il tuo gestionale lo preparo io, insieme a te.</p></div>
        <ol class="tr-steps">${STEPS.map(([t, d], i) => `<li class="rv" style="--d:${i * 120}ms"><span class="n">${i + 1}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>
        <div class="tr-wish rv"><h3>Pensi a qualcosa che non c'è? Lo aggiungo.</h3><div class="tr-wl">${WISH.map((w, i) => `<span style="--i:${i}">${esc(w)}</span>`).join('')}</div></div></section>

      <section class="tr-sec tr-end rv"><div class="tr-card"><div><h2>Parliamone</h2><p>Raccontami di cosa hai bisogno: ti rispondo personalmente e ti preparo una proposta per la tua attività.</p>
          <div class="tr-who"><span class="tr-av">${esc(String(C.nome || 'D')[0])}</span><span><b>${esc(C.nome || '')}</b><small>${esc(C.email || '')}${C.tel ? ' · ' + esc(C.tel) : ''}</small></span></div></div>
        <div class="tr-cta col"><a class="tr-btn" href="${esc(mail)}">Scrivimi una email</a>${C.wa ? `<a class="tr-btn alt" href="https://wa.me/${esc(C.wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${C.tel ? `<a class="tr-btn alt" href="tel:${esc(String(C.tel).replace(/\s+/g, ''))}">Chiama ${esc(C.tel)}</a>` : ''}<button type="button" class="tr-btn ghost" data-tr="req">Richiedi il tuo gestionale</button>${opts.demo ? '' : '<button type="button" class="tr-btn ghost" data-tr="demo">Prova la demo</button>'}</div></div>
        <p class="tr-foot">Centro di Costo · gestionale aziendale</p></section>
    </div>`;
    wire();
  }
  function count(el) {
    const to = +el.dataset.cnt, u = el.dataset.u || '', eur = /€/.test(el.textContent);
    const fmt = v => Math.round(v).toLocaleString('it-IT') + (eur ? ' €' : u);
    if (reduced()) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function wire() {
    obs && obs.disconnect(); timers.forEach(clearInterval); timers = [];
    const sc = $('.tr-scroll', root);
    obs = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); $$('[data-cnt]', e.target).forEach(c => { if (!c._done) { c._done = 1; count(c); } }); obs.unobserve(e.target); }), { root: sc, threshold: .18 });
    $$('.rv', root).forEach(el => obs.observe(el));
    // parola del titolo che scorre tra le attività finché non ne scegli una
    const w = $('[data-word]', root), L = SET().list;
    if (w && !opts.fixed && !reduced() && L.length) {
      let i = Math.max(0, L.findIndex(x => x.id === sel));
      timers.push(setInterval(() => { i = (i + 1) % L.length; w.classList.add('out'); setTimeout(() => { w.textContent = PL[L[i].id] || (L[i].s || L[i].n).toLowerCase(); w.classList.remove('out'); }, 260); }, 2400));
    }
    // barre della dashboard che respirano
    const bars = $$('.tm-bars i', root);
    if (bars.length && !reduced()) timers.push(setInterval(() => bars.forEach(b => b.style.setProperty('--h', `${25 + Math.random() * 70}%`)), 2600));
  }
  function onClick(e) {
    const a = e.target.closest('[data-tr]'), c = e.target.closest('[data-trset]');
    if (c) { sel = c.dataset.trset; opts.fixed = true; const y = $('.tr-scroll', root).scrollTop; render(); const s2 = $('.tr-scroll', root); s2.scrollTop = y; $$('.rv', root).forEach(el => el.classList.add('in')); return; }
    if (!a) return;
    const k = a.dataset.tr;
    if (k === 'close') close();
    if (k === 'demo') { close(); opts.onDemo && opts.onDemo(); }
    if (k === 'req') { close(); opts.onRequest && opts.onRequest(sel); }
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    if (!root) return;
    timers.forEach(clearInterval); timers = []; obs && obs.disconnect();
    root.classList.add('bye'); document.removeEventListener('keydown', onKey);
    const r = root; root = null; setTimeout(() => { r.remove(); document.body.classList.remove('tr-open'); }, reduced() ? 0 : 260);
  }
  function open(o) {
    opts = o || {}; sel = opts.settore || 'veicoli'; opts.fixed = !!opts.settore && opts.settore !== 'veicoli';
    if (root) root.remove();
    root = document.createElement('div');
    if (!$('link[data-tour]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'tour.css?v=' + (opts.v || 1); l.dataset.tour = 1; const r0 = root; r0.style.visibility = 'hidden'; l.onload = l.onerror = () => { r0.style.visibility = ''; }; document.head.appendChild(l); } root.id = 'tour'; root.className = 'tour'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Scopri cosa può fare il gestionale');
    document.body.appendChild(root); document.body.classList.add('tr-open');
    root.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
    render();
  }
  window.CDC_TOUR = { open, close };
})();
