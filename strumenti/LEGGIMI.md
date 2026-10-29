# Strumenti di prova (non usati dal sito)

- `gasmock.js` — finto Apps Script per eseguire il vero Code.gs in node.
- `delta.test.js <Code vecchio> <Code nuovo>` — 400 giri di modifiche a caso: il nuovo Code.gs deve dare gli stessi fogli del vecchio, e la sincronizzazione «solo novità» deve dare gli stessi dati della lettura completa.
- `e2e.delta.js <Code.gs>` — gestionale nel browser con lo script finto: modifica da un altro dispositivo, riapertura, controlla che arrivi solo la novità.
- `perf.test.js` — test estremo (~57.000 righe): apertura e ogni sezione entro i limiti; da lanciare prima di ogni pubblicazione.
