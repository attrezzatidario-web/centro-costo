/* Centro di Costo — lettore di codici a barre con la fotocamera (v111)
   window.CDC_SCAN.open({ title, hint, multi, onCode(code) → { ok, msg } | Promise })
   - usa il lettore del browser (BarcodeDetector) dove c'è, altrimenti la libreria ZXing (lib-zxing.min.js, caricata solo quando serve)
   - funziona anche senza fotocamera: si può scrivere il codice o usare una pistola lettore USB/Bluetooth (scrive il codice + Invio)
   - multi: resta aperto e aggiunge un prodotto a ogni lettura; altrimenti si chiude alla prima lettura buona */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf', 'codabar', 'qr_code', 'data_matrix'];
  let zxP = null;
  const loadZx = () => zxP || (zxP = new Promise((res, rej) => { if (window.ZXing) return res(window.ZXing); const s = document.createElement('script'); s.src = 'lib-zxing.min.js?v=1'; s.onload = () => res(window.ZXing); s.onerror = () => { zxP = null; rej(new Error('Lettore non caricato')); }; document.head.appendChild(s); }));

  async function makeDetector() {
    if ('BarcodeDetector' in window) {
      try {
        const sup = await window.BarcodeDetector.getSupportedFormats();
        const f = FORMATS.filter(x => sup.includes(x));
        if (f.length && f.includes('ean_13')) { const d = new window.BarcodeDetector({ formats: f }); return async src => { const r = await d.detect(src); return r && r[0] ? r[0].rawValue : ''; }; }
      } catch {}
    }
    const Z = await loadZx();
    const hints = new Map(), F = Z.BarcodeFormat;
    hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128, F.CODE_39, F.CODE_93, F.ITF, F.CODABAR, F.QR_CODE, F.DATA_MATRIX]);
    hints.set(Z.DecodeHintType.TRY_HARDER, true);
    const reader = new Z.MultiFormatReader(); reader.setHints(hints);
    return async canvas => {
      try { return reader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(canvas)))).getText(); }
      catch { return ''; } finally { try { reader.reset(); } catch {} }
    };
  }

  let ac = null;
  function beep(ok) {
    try { navigator.vibrate && navigator.vibrate(ok ? 50 : [40, 60, 40]); } catch {}
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = ok ? 1320 : 330;
      g.gain.setValueAtTime(.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(.18, ac.currentTime + .01); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + (ok ? .12 : .25));
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .3);
    } catch {}
  }

  let cur = null;
  async function open(o = {}) {
    if (cur) cur.close();
    const el = document.createElement('div'); el.className = 'scn'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', o.title || 'Scansiona');
    el.innerHTML = `<video class="scn-v" playsinline muted autoplay></video><div class="scn-shade"></div>
      <div class="scn-top"><div><b>${esc(o.title || 'Scansiona il codice a barre')}</b><span>${esc(o.hint || 'Inquadra il codice dentro il riquadro')}</span></div><button type="button" class="scn-x" data-scn="close" aria-label="Chiudi"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="scn-frame"><i></i><i></i><i></i><i></i><em class="scn-line"></em></div>
      <div class="scn-msg" aria-live="polite"></div>
      <div class="scn-bot">
        <form class="scn-man"><input name="c" autocomplete="off" inputmode="text" enterkeyhint="go" placeholder="…oppure scrivi il codice" aria-label="Codice"><button type="submit" aria-label="Cerca">OK</button></form>
        <div class="scn-btns"><button type="button" class="scn-b" data-scn="torch" hidden><svg viewBox="0 0 24 24"><path d="M8 3h8l-1 6H9zM9 9h6l-1 12h-4z"/></svg><span>Torcia</span></button>${o.multi ? '<button type="button" class="scn-b scn-done" data-scn="close"><span>Fatto</span><em class="scn-n">0</em></button>' : ''}</div>
      </div>
      <canvas class="scn-c" hidden></canvas>`;
    document.body.appendChild(el); document.body.classList.add('scn-on');
    requestAnimationFrame(() => el.classList.add('in'));
    const video = $('.scn-v', el), cv = $('.scn-c', el), ctx = cv.getContext('2d', { willReadFrequently: true }), msg = $('.scn-msg', el), inp = $('.scn-man input', el);
    let stream = null, track = null, alive = true, busy = false, last = '', lastT = 0, n = 0, det = null, torch = false, timer = 0;
    const say = (t, k) => { msg.innerHTML = t ? `<span class="${k || ''}">${t}</span>` : ''; msg.classList.remove('pop'); void msg.offsetWidth; if (t) msg.classList.add('pop'); };
    const flash = ok => { el.classList.remove('ok', 'ko'); void el.offsetWidth; el.classList.add(ok ? 'ok' : 'ko'); };
    function close() {
      if (!alive) return; alive = false; clearTimeout(timer);
      try { stream && stream.getTracks().forEach(t => t.stop()); } catch {}
      el.classList.remove('in'); document.body.classList.remove('scn-on'); document.removeEventListener('keydown', onKey, true);
      setTimeout(() => el.remove(), 260); if (cur && cur.el === el) cur = null;
      if (o.onClose) try { o.onClose(n); } catch {}
    }
    cur = { el, close };
    async function hit(code, manual) {
      code = String(code || '').trim(); if (!code || busy) return;
      // lo stesso codice si conta di nuovo solo dopo che è uscito dall'inquadratura (almeno 1,5 s senza vederlo)
      const now = Date.now(); if (!manual && code === last && now - lastT < 1500) { lastT = now; return; }
      last = code; lastT = now; busy = true;
      let r; try { r = await o.onCode(code); } catch (e) { r = { ok: false, msg: e.message }; }
      r = r || { ok: true };
      beep(!!r.ok); flash(!!r.ok);
      if (r.ok) { n++; const c = $('.scn-n', el); if (c) { c.textContent = n; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
      say(`${r.ok ? '✓' : '!'} ${esc(r.msg || code)}`, r.ok ? 'ok' : 'ko');
      busy = false;
      if (r.ok && !o.multi) setTimeout(close, 350);
    }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }
    document.addEventListener('keydown', onKey, true);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-scn]'); if (!b) return;
      if (b.dataset.scn === 'close') close();
      if (b.dataset.scn === 'torch' && track) { torch = !torch; track.applyConstraints({ advanced: [{ torch }] }).catch(() => {}); b.classList.toggle('on', torch); }
    });
    $('.scn-man', el).addEventListener('submit', e => { e.preventDefault(); const v = inp.value; inp.value = ''; hit(v, true); });
    // la fotocamera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { el.classList.add('nocam'); say('Fotocamera non disponibile qui: scrivi il codice o usa un lettore', 'ko'); setTimeout(() => inp.focus(), 300); return cur; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    } catch (e) {
      el.classList.add('nocam');
      say(/NotAllowed|Permission/i.test(e.name + e.message) ? 'Permesso fotocamera negato: abilitalo nelle impostazioni del browser, oppure scrivi il codice' : 'Nessuna fotocamera trovata: scrivi il codice o usa un lettore', 'ko');
      setTimeout(() => inp.focus(), 300); return cur;
    }
    if (!alive) { stream.getTracks().forEach(t => t.stop()); return cur; }
    track = stream.getVideoTracks()[0]; video.srcObject = stream;
    try { await video.play(); } catch {}
    try { const caps = track.getCapabilities ? track.getCapabilities() : {}; if (caps.torch) $('[data-scn="torch"]', el).hidden = false; } catch {}
    try { det = await makeDetector(); } catch (e) { say('Lettore non disponibile: scrivi il codice', 'ko'); return cur; }
    el.classList.add('live');
    const loop = async () => {
      if (!alive) return;
      if (!busy && video.readyState >= 2 && video.videoWidth) {
        // si legge la parte centrale dell'immagine (dove c'è il riquadro): più veloce e più preciso
        const vw = video.videoWidth, vh = video.videoHeight, w = Math.round(vw * .86), h = Math.round(Math.min(vh, w * .62));
        const sx = Math.round((vw - w) / 2), sy = Math.round((vh - h) / 2), k = Math.min(1, 1100 / w);
        cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        ctx.drawImage(video, sx, sy, w, h, 0, 0, cv.width, cv.height);
        let code = ''; try { code = await det(cv); } catch {}
        if (code) await hit(code);
      }
      timer = setTimeout(loop, 120);
    };
    loop();
    return cur;
  }
  window.CDC_SCAN = { open, close: () => cur && cur.close() };
})();
