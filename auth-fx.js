/* Centro di Costo — animazioni della pagina di accesso (v103)
   Una piccola dashboard «viva» accanto al modulo: utile che sale, grafici che cambiano, notifiche che arrivano.
   Gira solo mentre la pagina di accesso è visibile; con «riduci movimento» resta ferma. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WORDS = ['azienda', 'pizzeria', 'officina', 'lavanderia', 'impresa edile', 'caffetteria', 'trattoria', 'attività'];
  const SCENES = [
    { v: 12480, d: '+18%', p: [.30, .42, .36, .58, .55, .82], b: [62, 84, 45, 70, 38], c: [42, 28, 18, 12], cat: 'Materie prime' },
    { v: 18920, d: '+24%', p: [.25, .33, .52, .47, .70, .90], b: [48, 66, 72, 40, 55], c: [36, 30, 22, 12], cat: 'Personale' },
    { v: 9640, d: '+9%', p: [.45, .38, .50, .44, .56, .64], b: [80, 52, 60, 34, 46], c: [48, 20, 20, 12], cat: 'Utenze' },
    { v: 15310, d: '+15%', p: [.20, .36, .31, .55, .66, .76], b: [55, 74, 50, 86, 42], c: [30, 34, 24, 12], cat: 'Carburante' }
  ];
  const TOASTS = [
    ['doc', 'Fattura registrata', 'Lyreco · € 284,60'], ['in', 'Incasso del giorno', '+ € 1.240,00 · cassa'], ['ddt', 'DDT n. 48 creato', 'Edilmateriali Rossi'],
    ['warn', 'Scorta in esaurimento', 'Guanti nitrile · 4 conf.'], ['ok', 'Fattura pagata', 'Bonifico · € 2.180,00'], ['in', 'Fattura di fine mese', 'Bar Centrale · € 3.460,00']
  ];
  const TI = {
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>', in: '<path d="M12 19V5M5 12l7-7 7 7"/>', ddt: '<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    warn: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>', ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>'
  };
  let on = false, timers = [], sc = 0, wi = 0, ti = 0, cur = SCENES[0].p.slice(), val = SCENES[0].v;
  const eur = v => '€ ' + Math.round(v).toLocaleString('it-IT');

  // curva morbida che passa per i punti (Catmull-Rom → Bézier)
  function curve(pts, W = 300, H = 96) {
    const P = pts.map((y, i) => [i / (pts.length - 1) * W, H - 8 - y * (H - 16)]);
    let d = `M${P[0][0]} ${P[0][1].toFixed(1)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1].toFixed(1)}`;
    }
    return { d, end: P[P.length - 1], W, H };
  }
  function drawLine(pts) {
    const c = curve(pts), p = $('#ax-path'), a = $('#ax-area'), dot = $('#ax-dot'); if (!p) return;
    p.setAttribute('d', c.d); a.setAttribute('d', `${c.d} L${c.W} ${c.H} L0 ${c.H} Z`);
    dot.setAttribute('cx', c.end[0]); dot.setAttribute('cy', c.end[1]);
  }
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  function tween(dur, step) { return new Promise(res => { const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / dur); step(ease(k)); if (k < 1 && on) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); }

  function scene(i, instant) {
    const S = SCENES[i % SCENES.length], from = cur.slice(), v0 = val, vEl = $('#ax-val');
    $('#ax-delta').textContent = S.d;
    [...$('#ax-bars').children].forEach((b, k) => b.style.setProperty('--h', S.b[k] + '%'));
    let off = 0; [...$('#ax-donut').querySelectorAll('circle:not(.t)')].forEach((c, k) => { c.setAttribute('stroke-dasharray', `${S.c[k] - .8} ${100 - S.c[k] + .8}`); c.setAttribute('stroke-dashoffset', -off); off += S.c[k]; });
    const cat = $('#ax-cat'); cat.classList.remove('sw'); void cat.offsetWidth; cat.textContent = S.cat; cat.classList.add('sw');
    if (instant || RM) { cur = S.p.slice(); val = S.v; drawLine(cur); vEl.textContent = eur(val); return; }
    tween(1100, k => { cur = from.map((y, j) => y + (S.p[j] - y) * k); val = v0 + (S.v - v0) * k; drawLine(cur); vEl.textContent = eur(val); });
  }
  function word() {
    const box = $('.ax-rot'); if (!box) return;
    wi = (wi + 1) % WORDS.length;
    const old = box.querySelector('b:not(.out)'), nw = document.createElement('b');
    box.style.width = box.getBoundingClientRect().width + 'px';
    nw.textContent = WORDS[wi]; nw.className = 'in'; box.appendChild(nw);
    void box.offsetWidth; box.style.width = nw.getBoundingClientRect().width + 'px';
    if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 700); }
    setTimeout(() => { nw.classList.remove('in'); }, 30);
  }
  function toast() {
    const t = $('#ax-toast'); if (!t) return;
    const [k, a, b] = TOASTS[ti++ % TOASTS.length];
    t.classList.remove('show');
    setTimeout(() => {
      $('#ax-ti').innerHTML = `<svg viewBox="0 0 24 24">${TI[k]}</svg>`; $('#ax-ti').className = 'ax-ti k-' + k;
      $('#ax-tt').textContent = a; $('#ax-ts').textContent = b; t.classList.add('show');
    }, 450);
  }
  // movimento leggero della scena seguendo il mouse
  function parallax(e) {
    const st = $('#ax-stage'), side = $('.auth-side'); if (!st || !side) return;
    const r = side.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    st.style.setProperty('--px', x.toFixed(3)); st.style.setProperty('--py', y.toFixed(3));
  }
  function start() {
    if (on) return; on = true;
    const side = $('.auth-side'); if (side) side.classList.add('ax-on');
    scene(sc, true); toast();
    if (RM) return;
    timers.push(setInterval(() => { if (!document.hidden) scene(++sc); }, 4200));
    timers.push(setInterval(() => { if (!document.hidden) word(); }, 2600));
    timers.push(setInterval(() => { if (!document.hidden) toast(); }, 3600));
    if (side && matchMedia('(hover: hover)').matches) side.addEventListener('pointermove', parallax);
  }
  function stop() {
    if (!on) return; on = false; timers.forEach(clearInterval); timers = [];
    const side = $('.auth-side'); if (side) { side.classList.remove('ax-on'); side.removeEventListener('pointermove', parallax); }
  }
  function check() { const s = document.getElementById('setup'); if (s && !s.hidden) start(); else stop(); }
  function init() {
    const s = document.getElementById('setup'); if (!s) return;
    new MutationObserver(check).observe(s, { attributes: true, attributeFilter: ['hidden'] });
    check();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
