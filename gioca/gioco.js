/* Briciola vola! — mini gioco di Natale dal libro «Aiuto, è caduta una renna!» di Antonino Campanella.
   Nessuna pubblicità, nessun tracciamento, nessun dato raccolto o salvato. */
(() => {
'use strict';
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TEST = /[?&]test=1/.test(location.search);
const LEVEL_Q = (() => {
  const m = /[?&]level=(\d+)/.exec(location.search);
  if (!m) return null;
  const n = Math.max(1, Math.min(14, parseInt(m[1], 10) || 1));
  return n - 1;
})();
const FROM_LIBRO = /[?&]from=libro/.test(location.search);
const START_INFINITE = /[?&]mode=infinito/.test(location.search);
let W = 450, H = 800, SC = 1, DPR = 1;
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  H = 800;
  W = Math.round(Math.min(1100, Math.max(360, 800 * vw / vh)));
  SC = Math.min(vw / W, vh / H);
  DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * SC * DPR); cv.height = Math.round(H * SC * DPR);
  cv.style.width = Math.round(W * SC) + 'px'; cv.style.height = Math.round(H * SC) + 'px';
}
window.addEventListener('resize', resize); resize();

// ---------- immagini ----------
const IMG = {};
const SRC = { bri: 'assets/briciola.png', gab: 'assets/gabbiano.png', sli: 'assets/slitta.png', cop: 'assets/copertina.jpg' };
for (let i = 1; i <= 14; i++) SRC['c' + i] = 'assets/cap' + String(i).padStart(2, '0') + '.jpg';
let loaded = 0; const total = Object.keys(SRC).length;
for (const k in SRC) { const im = new Image(); im.onload = im.onerror = () => loaded++; im.src = SRC[k]; IMG[k] = im; }
const ok = im => im && im.complete && im.naturalWidth > 0;

// ---------- audio (WebAudio, generato) ----------
let AC = null, master = null, musicGain = null, muted = false, musicTimer = null, musicStep = 0;
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
  AC = new A(); master = AC.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(AC.destination);
  musicGain = AC.createGain(); musicGain.gain.value = 0.11; musicGain.connect(master);
  startMusic();
}
function tone(f, t0, dur, type = 'sine', vol = 0.2, dest = master, slide = 0) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
}
const SFX = {
  tin(p = 0) { if (!AC) return; const t = AC.currentTime, f = 1568 * Math.pow(2, p / 12);
    tone(f, t, 0.9, 'sine', 0.22); tone(f * 2.76, t, 0.5, 'sine', 0.07); tone(f * 5.4, t, 0.25, 'sine', 0.03); },
  hic() { if (!AC) return; const t = AC.currentTime; tone(330, t, 0.12, 'square', 0.05, master, 2.2); },
  pof() { if (!AC) return; const t = AC.currentTime; tone(160, t, 0.16, 'triangle', 0.16, master, 0.5); },
  ahi() { if (!AC) return; const t = AC.currentTime; tone(220, t, 0.25, 'sawtooth', 0.05, master, 0.6); },
  gnam() { if (!AC) return; const t = AC.currentTime; tone(660, t, 0.08, 'triangle', 0.12); tone(880, t + 0.08, 0.12, 'triangle', 0.12); },
  squawk() { if (!AC) return; const t = AC.currentTime; tone(900, t, 0.18, 'sawtooth', 0.05, master, 0.55); tone(800, t + 0.16, 0.2, 'sawtooth', 0.04, master, 0.5); },
  letter() { if (!AC) return; const t = AC.currentTime; [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.09, 0.4, 'sine', 0.13)); },
  fanfare() { if (!AC) return; const t = AC.currentTime; [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.13, 0.5, 'triangle', 0.14)); },
  laugh() { if (!AC) return; const t = AC.currentTime; for (let i = 0; i < 8; i++) tone(500 + (i % 2) * 120 + i * 20, t + i * 0.11, 0.1, 'triangle', 0.08); }
};
// "Jingle Bells" (J. L. Pierpont, 1857, pubblico dominio), ritornello semplificato. [nota MIDI, ottavi]
const MEL = [[64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],
  [65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[64,2],[62,2],[62,2],[64,2],[62,4],[67,4],
  [64,2],[64,2],[64,4],[64,2],[64,2],[64,4],[64,2],[67,2],[60,3],[62,1],[64,8],
  [65,2],[65,2],[65,3],[65,1],[65,2],[64,2],[64,2],[64,1],[64,1],[67,2],[67,2],[65,2],[62,2],[60,8],[0,8]];
const BASS = { 64: 48, 65: 53, 67: 55, 62: 55, 60: 48 };
function startMusic() {
  if (!AC || musicTimer) return;
  let next = AC.currentTime + 0.2; const e = 0.16;
  musicTimer = setInterval(() => {
    if (!AC) return;
    while (next < AC.currentTime + 0.6) {
      const [n, d] = MEL[musicStep % MEL.length];
      if (n) { const f = 440 * Math.pow(2, (n - 69) / 12); tone(f, next, d * e * 0.95, 'triangle', 0.5, musicGain);
        if (musicStep % 2 === 0) tone(440 * Math.pow(2, (BASS[n] - 69) / 12), next, d * e, 'sine', 0.35, musicGain); }
      next += d * e; musicStep++;
    }
  }, 120);
}
function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, AC.currentTime, 0.05); }
document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); });

// ---------- util ----------
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const FONT = '"Trebuchet MS", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function text(s, x, y, size, color = '#fff', align = 'center', weight = 'bold', stroke = null, sw = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
function wrap(s, maxW, size, weight = 'normal') {
  ctx.font = `${weight} ${size}px ${FONT}`; const out = [];
  for (const para of s.split('\n')) { let line = '';
    for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    out.push(line); }
  return out;
}

// ---------- livelli ----------
const LETTERE = {
  lalla: { from: 'Un foglietto a righe', body: 'Caro Babbo Natale, caro Babbo Natale,\nun amico dinosauro per Gino. Per Gino.\nLalla, 5 anni (5 anni)' },
  pasq: { from: 'Una lettera ingiallita', body: 'Caro Babbo Natale,\nvorrei un campanello per la mia bicicletta, così tutti mi sentono arrivare.\nPasqualino, 7 anni' },
  bri: { from: 'Un biglietto scritto con uno zoccolo', body: 'Dall’ultimo posto a sinistra si vede tutto il mondo.\nStanotte guarderò la tua casa.\nLa tua amica Briciola' }
};
// Desideri dei bambini per Babbo Natale (raccoglibili)
const DESIDERI = [
  { from: 'Emma, 6 anni', body: 'Caro Babbo Natale,\nvorrei una matita magica che disegna le stelle.\nTi lascio un biscotto sulla finestra.\nEmma' },
  { from: 'Leo, 7 anni', body: 'Caro Babbo Natale,\nper favore porta la neve anche a Torre Pinella.\nE un trenino che fa fischi veri.\nLeo' },
  { from: 'Sofia, 5 anni', body: 'Caro Babbo Natale,\nvorrei che la nonna stia bene e una bambola che dice «buonanotte».\nSofia' },
  { from: 'Marco, 8 anni', body: 'Caro Babbo Natale,\nun libro di avventure e un po’ di coraggio, come Briciola.\nMarco' },
  { from: 'Giulia, 6 anni', body: 'Caro Babbo Natale,\nvorrei un sonaglio che suona quando qualcuno ride.\nGiulia' },
  { from: 'Tommaso, 4 anni', body: 'Caro Babbo Natale,\nuna palla rossa e un abbraccio lungo lungo.\nTommy' },
  { from: 'Alice, 9 anni', body: 'Caro Babbo Natale,\nvorrei pace per tutti e una sciarpa gialla per il mio cane.\nAlice' },
  { from: 'Nico (segreto)', body: 'Caro Babbo Natale,\nnon chiedo giocattoli. Chiedo solo di riuscire a ridere di nuovo.\nNico' },
  { from: 'Sara, 7 anni', body: 'Caro Babbo Natale,\nun telescopio per vedere se le renne hanno davvero il singhiozzo.\nSara' },
  { from: 'Pietro, 5 anni', body: 'Caro Babbo Natale,\nvorrei un faro piccolo da tenere sul comodino.\nPietro' },
  { from: 'Chiara, 8 anni', body: 'Caro Babbo Natale,\nuna lettera per dire grazie a chi fa i dolci di Natale.\nChiara' },
  { from: 'Diego, 6 anni', body: 'Caro Babbo Natale,\nvorrei un aquilone a forma di gabbiano buono (non l’Ammiraglio!).\nDiego' },
];
// un livello per ogni capitolo del libro — atmosfera + difficoltà progressiva (bimbi, ma con gusto)
const LEVELS = [
  { name: 'Un tonfo sulla pasticceria', mode: 'night', ground: 'case', theme: 'pasticceria', gulls: 0, chim: 0.42, speed: 128, wires: 0.08, magnets: 2, stars: 3,
    intro: 'È la notte del 19 dicembre. Briciola fa il suo primo volo… e cade! Vola sopra i tetti della pasticceria: raccogli risate e cartellate, evita i comignoli.',
    quote: '«Mi scusi tanto per il disturbo» disse Briciola. «Sono caduta.»' },
  { name: 'Non è un cane', mode: 'night', ground: 'case', theme: 'casa', gulls: 0, chim: 0.48, speed: 132, wires: 0.12, magnets: 2, stars: 3,
    intro: 'Briciola ha il singhiozzo: ogni «hic!» la fa salire. Prendi le risate di Lalla e le stelline bonus. Attenzione ai fili tra i tetti!',
    quote: '«È un cane» sussurrò Lalla. «È un cane.»' },
  { name: 'Nonno Tonino non ci sente', mode: 'night', ground: 'case', theme: 'pasticceria', gulls: 0, chim: 0.52, speed: 136, wires: 0.14, magnets: 2, stars: 4,
    intro: 'Il nonno ha scoperto tutto, ma fa finta di niente. Raccogli le cartellate: Briciola ne va matta! La calamita ti aiuta a prendere le note.',
    quote: 'Il nonno Tonino diventò improvvisamente sordo dall’orecchio sinistro.' },
  { name: 'Il sonaglio perduto', mode: 'day', ground: 'case', theme: 'paese', gulls: 1, chim: 0.55, speed: 140, wires: 0.16, magnets: 2, stars: 4,
    intro: 'Il sonaglio è sparito! Cerca tra i tetti al sole. Evita i gabbiani e prendi le note dorate.',
    quote: '«Poi è arrivato l’Ammiraglio, e se l’è preso.»' },
  { name: 'Un cane molto, molto grosso', mode: 'day', ground: 'case', theme: 'paese', gulls: 1, chim: 0.58, speed: 144, wires: 0.18, magnets: 2, stars: 4, letter: 'lalla',
    intro: 'Briciola è travestita da cane. Attraversa il paese: fili del bucato, comignoli e… sorprese bonus!',
    quote: '«BAU» disse Briciola. Il vigile Spinaci non era per niente convinto.' },
  { name: 'Il gabbiano che rubava le stelle', mode: 'day', ground: 'molo', theme: 'porto', gulls: 3, chim: 0.45, speed: 148, wires: 0.1, magnets: 2, stars: 5,
    intro: 'Al porto c’è l’Ammiraglio! Stagli lontano, raccogli le stelle cadute e le risate sul molo.',
    quote: '«È lui» disse Briciola. «Lo sento. Ha qualcosa che mi appartiene.»' },
  { name: 'Su per il campanile', mode: 'day', ground: 'case', theme: 'campanile', towers: true, gulls: 3, chim: 0.52, speed: 152, wires: 0.2, magnets: 2, stars: 5,
    intro: 'Il nido è in cima al campanile storto. Vola tra campanili, comignoli e fili: è più impegnativo, ma ce la fai!',
    quote: '«L’avete cacciato!» disse zi’ Nunzio. «In quarant’anni, nessuno ci era mai riuscito!»' },
  { name: 'Una telefonata dai Caraibi', mode: 'sunset', ground: 'case', theme: 'casa', gulls: 2, chim: 0.6, speed: 156, wires: 0.2, magnets: 2, stars: 5,
    intro: 'Il cielo è rosa: la mamma torna dal mare. Raccogli risate e note prima che faccia buio.',
    quote: '«Tutto bene» disse Nico. «Non fa niente.»' },
  { name: 'Il pesce più strano del mercato', mode: 'day', ground: 'molo', theme: 'mercato', gulls: 4, chim: 0.48, speed: 160, wires: 0.14, magnets: 3, stars: 6,
    intro: 'Mercato del pesce! Ostacoli più stretti, gabbiani più furbi. Usa la calamita sulle note del sonaglio.',
    quote: '«I cani» disse il vigile Spinaci «non portano i campanelli da bicicletta.»' },
  { name: 'Il presepe vivente più vivente del mondo', mode: 'night', ground: 'case', theme: 'presepe', towers: true, gulls: 2, chim: 0.55, speed: 162, wires: 0.22, magnets: 2, stars: 6,
    intro: 'Briciola fa l’asinello nel presepe. Se le viene il singhiozzo, vola davanti a tutti — e evita i fili delle luci!',
    quote: 'I bambini ridevano, e il sonaglio, sulla bicicletta del vigile, suonò da solo.' },
  { name: 'Il segreto del vigile Spinaci', mode: 'day', ground: 'case', theme: 'paese', gulls: 3, chim: 0.62, speed: 166, wires: 0.24, magnets: 3, stars: 6, letter: 'pasq',
    intro: 'Il vigile ha un segreto. Trova la lettera tra i tetti: il percorso è più lungo e pieno di ostacoli.',
    quote: 'Poi, per la prima volta in cinquant’anni, il vigile Spinaci rise.' },
  { name: 'Il sonaglio che non suona', mode: 'sunset', ground: 'case', theme: 'pasticceria', gulls: 3, chim: 0.65, speed: 168, wires: 0.25, magnets: 3, stars: 7,
    intro: 'Il sonaglio è addormentato. Servono tantissime risate e note: la calamita sarà la tua amica!',
    quote: '«Piangere» disse il nonno «è come impastare. E lievita sempre di notte.»' },
  { name: 'Mezzanotte sul molo', mode: 'night', ground: 'molo', theme: 'vigilia', gulls: 4, chim: 0.55, speed: 172, wires: 0.18, magnets: 3, stars: 7, letter: 'bri', finale: true,
    intro: 'Vigilia sul molo! Gabbiani, lampioni e stelle. Alla fine porta Briciola all’ultimo posto a sinistra.',
    quote: '«Ogni Vigilia, a mezzanotte, guarda il mare. Ci sarà una luce azzurra, all’ultimo posto a sinistra.»' },
  { name: 'Farina sulle spalle', mode: 'dawn', ground: 'case', theme: 'natale', gulls: 1, chim: 0.5, speed: 158, wires: 0.2, magnets: 3, stars: 8, last: true,
    intro: 'Mattina di Natale: zucchero a velo ovunque. Un ultimo volo lungo e dolce, pieno di bonus!',
    quote: 'Su Torre Pinella nevica farina, e tutti sorridono.' }
];
// Frasi e basi — tono del capitolo, per bambini
const CHAPTER_FEEL = [
  { base: 'il tetto della pasticceria', run: 'Briciola prende la rincorsa sul tetto caldo di forno…', lift: '…e con un «hic!» si alza sopra Torre Pinella!',
    fail: ['Mi dispiace: Briciola ha fatto un tonfo. Anche le renne apprendiste cadono… e poi riprovano.', 'Oh no, un piccolo tonfo sulla pasticceria. Respira, riprova: stanotte ce la fai.'],
    win: ['Che volo meraviglioso! Hai accompagnato Briciola sopra i tetti senza paura.', 'Bravissimo! Torre Pinella ti ha visto volare, e ha sorriso.'] },
  { base: 'il cortile di casa', run: 'Dal cortile, zampette silenziose… nessuno deve svegliarsi…', lift: 'Hic! E via, sopra le finestre illuminate.',
    fail: ['Mi dispiace, questa volta il singhiozzo l’ha tradita. Riprova: Lalla crede ancora in te.', 'Un pasetto falso… ma le storie belle ricominciano. Riprova!'],
    win: ['Sei stato dolcissimo. Briciola non è un cane: è un’amica del cielo.', 'Che bravura! Hai raccolto le risate senza far rumore.'] },
  { base: 'la soglia della pasticceria', run: 'Dal bancone del nonno Tonino, Briciola prende lo slancio…', lift: 'Il nonno fa finta di non sentire. Tu vola!',
    fail: ['Mi dispiace: anche il nonno a volte sbaglia le cartellate. Riprova con il cuore leggero.', 'Un piccolo «pof!». Il nonno ti farebbe cenno di riprovare, senza dire una parola.'],
    win: ['Che orgoglio! Hai volato come piace al nonno: con pazienza e tante cartellate.', 'Bravo! A volte capire senza sentire è un superpotere. Ce l’hai.'] },
  { base: 'il balcone al sole', run: 'Sul balcone soleggiato Briciola cerca il sonaglio… e prende la rincorsa!', lift: 'Il vento di dicembre la solleva. Tu guidala.',
    fail: ['Mi dispiace, il sonaglio è ancora lontano. Ma ogni volo ci avvicina. Riprova.', 'Non è finita: le cose perdute si ritrovano. Ancora un volo!'],
    win: ['Che ricerca coraggiosa! Hai cercato con gli occhi del cuore.', 'Bravissimo: anche senza sonaglio, hai fatto tin dentro.'] },
  { base: 'il marciapiede del paese', run: 'Col cappotto dello zio Peppino, Briciola fa finta di essere un cane… poi corre!', lift: 'Bau— hic! E diventa di nuovo una renna in cielo.',
    fail: ['Mi dispiace, il vigile Spinaci ti ha quasi beccato. Riprova, più furba e più dolce.', 'Un passo falso da “cane”. Va bene: le maschere si sistemano. Riprova!'],
    win: ['Che travestimento perfetto! Hai attraversato il paese col sorriso.', 'Bravo: a volte per aiutare gli amici bisogna essere un po’ inventivi.'] },
  { base: 'il molo del porto', run: 'Sulle tavole del molo Briciola prende la rincorsa contro il vento di mare…', lift: 'Via, sopra le barche e i gabbiani!',
    fail: ['Mi dispiace: l’Ammiraglio ha vinto questo giro. Ma tu non sei meno coraggioso. Riprova.', 'Un’ala di troppo… Riprova: il mare ama chi non molla.'],
    win: ['Che volo da vero capitano! Hai tenuto alla larga l’Ammiraglio.', 'Bravissimo: anche le stelle del porto sembrano applaudire.'] },
  { base: 'il sagrato sotto il campanile', run: 'Dal sagrato Briciola guarda in alto… poi parte di scatto!', lift: 'Su, verso il campanile storto!',
    fail: ['Mi dispiace, il campanile è alto e un po’ birichino. Riprova: zi’ Nunzio crede in te.', 'Quasi in cima! Un altro volo e ci arrivi.'],
    win: ['Che impresa! Hai volato dove nessuno osava.', 'Bravo: oggi il campanile ha imparato il tuo nome.'] },
  { base: 'la terrazza al tramonto', run: 'Il cielo è rosa. Briciola prende la rincorsa verso la mamma che torna…', lift: 'E vola nelle luci della sera.',
    fail: ['Mi dispiace, la sera è arrivata troppo in fretta. Riprova: c’è ancora tempo per un abbraccio.', 'Un volo storto nel rosa del cielo. Riprova, piano e sicuro.'],
    win: ['Che dolcezza! Hai portato a casa un po’ di Caraibi nel cuore.', 'Bravissimo: anche da lontano, l’amore ti ha fatto volare dritto.'] },
  { base: 'la banchina del mercato', run: 'Tra cassette di pesce e voci allegre, Briciola prende lo slancio…', lift: 'Hic! Sopra il mercato più strano del mondo.',
    fail: ['Mi dispiace, il mercato è pieno di sorprese. Riprova: il sonaglio ti aspetta.', 'Scivolata sulla banchina! Va bene: i marinai riprovano sempre.'],
    win: ['Che mercato da campione! Hai trovato ritmo, coraggio e sorrisi.', 'Bravo: anche il pesce più strano applaudirebbe, se potesse.'] },
  { base: 'il palco del presepe vivente', run: 'Da asinello sul palco, Briciola fa un passo… due… e la rincorsa!', lift: 'Il singhiozzo la solleva davanti a tutti. Che spettacolo!',
    fail: ['Mi dispiace, il pubblico ha visto un “pof”. Riprova: i bambini vogliono rivederti volare.', 'Anche gli asinelli più bravi inciampano. Ancora una volta, da star!'],
    win: ['Che applauso meriti! Hai reso il presepe il più vivente del mondo.', 'Bravissimo: stanotte hai fatto ridere tutto il paese.'] },
  { base: 'accanto alla bicicletta del vigile', run: 'Accanto alla bicicletta di Spinaci, Briciola prende coraggio… e la rincorsa!', lift: 'Su, a cercare il segreto tra i tetti.',
    fail: ['Mi dispiace: i segreti chiedono pazienza. Riprova, senza paura del fischietto.', 'Quasi! Il vigile un giorno rise… e tu puoi riprovare ora.'],
    win: ['Che cuore grande! Hai rispettato un segreto e volato con gentilezza.', 'Bravo: a volte la cosa più bella è far sorridere chi non ride da anni.'] },
  { base: 'il davanzale della cucina', run: 'Dal davanzale, con il sonaglio addormentato in cuore, Briciola prende la rincorsa…', lift: 'Servono risate: tu le raccogli in volo!',
    fail: ['Mi dispiace, il sonaglio dorme ancora. Riprova: le risate lo svegliano piano piano.', 'Non scoraggiarti. Anche il silenzio, a Natale, sa aspettare. Riprova!'],
    win: ['Che magia: hai riempito l’aria di risate. Il sonaglio ti deve un tin.', 'Bravissimo! Hai dimostrato che la gioia si raccoglie, un pezzetto alla volta.'] },
  { base: 'l’ultimo tratto del molo', run: 'Sulla punta del molo, a mezzanotte, Briciola prende la rincorsa verso la luce azzurra…', lift: 'La slitta arriva. Tu vola all’ultimo posto a sinistra!',
    fail: ['Mi dispiace, la Vigilia chiede un altro tentativo. Riprova: l’ultimo posto ti aspetta.', 'Quasi alla slitta! Un altro volo e sei a casa, all’ultimo a sinistra.'],
    win: ['Che notte indimenticabile! Hai portato Briciola dove doveva essere.', 'Bravissimo: all’ultimo posto a sinistra c’è una luce… e c’è anche il tuo coraggio.'] },
  { base: 'il tetto bianco di zucchero a velo', run: 'Sul tetto nevoso di farina, Briciola fa quattro passetti e prende la rincorsa…', lift: 'Buon Natale in volo!',
    fail: ['Mi dispiace, la farina è scivolosa. Riprova: Natale aspetta il tuo sorriso.', 'Un tonfo zuccheroso! Dolce anche così. Ancora un volo di festa.'],
    win: ['Che Natale splendido! Hai volato fino alla fine, e il paese è bianco di gioia.', 'Bravissimo: oggi hai messo farina sulle spalle… e stelle nel cuore.'] },
];
LEVELS.forEach((l, i) => {
  l.roof = l.towers ? [130, 230] : [105, 200];
  l.num = i + 1;
  l.img = 'c' + (i + 1);
  l.len = 6400 + i * 420;
  l.letterObj = l.letter ? LETTERE[l.letter] : null;
  l.diff = i + 1;
  const feel = CHAPTER_FEEL[i] || CHAPTER_FEEL[0];
  l.base = feel.base; l.runLine = feel.run; l.liftLine = feel.lift;
  l.failLines = feel.fail; l.winLines = feel.win;
  l.bombs = Math.max(0, Math.floor(i / 2));
  l.antennas = Math.max(1, Math.floor(i / 2));
  l.wishes = 2 + Math.floor(i / 3);
});
const BELL_TARGET = 140;
const MAX_HITS_STORY = 3;

// ---------- stato ----------
let state = 'loading', L = null, LI = 0, tWorld = 0, dist = 0, time = 0, timeScale = 1;
let mode = 'story'; // 'story' | 'infinite'
let bri, houses, chims, antennas = [], items, gulls, wires = [], parts = [], pops = [], stars = [], snow = [], far = [];
let score = 0, risate = 0, cart = 0, lettere = 0, desideri = 0, bell = 0, combo = 0;
let overlay = null; // {type:'letter'|'wish'|'fail'|'win'|...}
let endPhase = null, endT = 0, sleigh = null, finale = null;
let buttons = [];
let hintT = 0, bellRing = 0, flash = 0;
let magnetT = 0, magnetPow = 0, notes = 0;
let hits = 0, takeoffT = 0, takeoffPhase = 'ready', winLine = '', failLine = '';
let bestInfinite = 0, floaters = [], sparkBurst = 0;

function maxHits() { return mode === 'infinite' ? 1 : MAX_HITS_STORY; }
function pickLine(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function newGame() {
  mode = 'story';
  score = 0; risate = 0; cart = 0; lettere = 0; desideri = 0; bell = 0; combo = 0; notes = 0; magnetT = 0; hits = 0;
  startIntro(0);
}
function startInfinite() {
  mode = 'infinite';
  score = 0; risate = 0; cart = 0; lettere = 0; desideri = 0; bell = 0; combo = 0; notes = 0; magnetT = 0; hits = 0;
  LI = 0;
  L = makeInfiniteSlice(0);
  buildLevel();
  state = 'intro';
}
function makeInfiniteSlice(tier) {
  const t = Math.min(20, tier);
  return {
    name: 'Volo infinito',
    mode: t % 4 === 0 ? 'night' : t % 4 === 1 ? 'day' : t % 4 === 2 ? 'sunset' : 'dawn',
    ground: t % 5 === 2 ? 'molo' : 'case',
    theme: ['pasticceria', 'paese', 'porto', 'campanile', 'presepe', 'natale'][t % 6],
    towers: t > 4 && t % 3 === 0,
    gulls: Math.min(7, 1 + Math.floor(t / 2)),
    chim: Math.min(0.85, 0.45 + t * 0.03),
    speed: Math.min(210, 138 + t * 4),
    wires: Math.min(0.4, 0.12 + t * 0.02),
    magnets: 2,
    stars: 4 + Math.floor(t / 2),
    bombs: Math.min(8, 1 + Math.floor(t / 2)),
    antennas: Math.min(10, 1 + t),
    wishes: 3 + Math.floor(t / 3),
    len: 9000 + t * 800,
    num: '∞',
    diff: t + 1,
    img: 'c' + String((t % 14) + 1),
    intro: 'Una sola vita. Vola finché puoi: ostacoli, bombe e desideri dei bambini. Più vai avanti, più diventa matto!',
    quote: '«Finché c’è un hic!, c’è un volo.»',
    base: 'la rampa delle stelle',
    runLine: 'Briciola prende la rincorsa sulla rampa infinita…',
    liftLine: 'Hic! E non si ferma più!',
    failLines: [
      'Mi dispiace: il volo infinito si è fermato. Ma che percorso hai fatto!',
      'Tonfo! Riprova: con una sola vita ogni metro è una vittoria.',
    ],
    winLines: ['Incredibile!'],
    letterObj: null,
    infinite: true,
    tier: t,
    roof: t > 4 ? [130, 230] : [105, 200],
  };
}
function startIntro(i) {
  if (mode !== 'infinite') { LI = i; L = LEVELS[i]; }
  buildLevel(); state = 'intro';
}
function startTakeoff() {
  takeoffT = 0; takeoffPhase = 'ready';
  bri.x = 70; bri.y = padY() - 28; bri.vy = 0; bri.ang = 0; bri.s = 0.48; bri.nose = 'base';
  dist = 0; state = 'takeoff'; SFX.hic();
}
function padY() {
  if (!L) return H - 160;
  if (L.ground === 'molo') return H - 140;
  if (L.theme === 'campanile') return H - 210;
  if (L.theme === 'presepe') return H - 180;
  return H - 170;
}
function buildLevel() {
  const R = rng(1000 + (mode === 'infinite' ? (L.tier || 0) * 91 : LI * 77) + (mode === 'infinite' ? Math.floor(dist) : 0));
  if (mode !== 'infinite' || dist < 10) dist = 0;
  time = 0; endPhase = null; endT = 0; sleigh = null; finale = null; overlay = null;
  magnetT = 0; magnetPow = 0; hits = 0; takeoffT = 0; takeoffPhase = 'ready'; sparkBurst = 0; floaters = [];
  bri = { x: 70, y: padY() - 28, s: 0.48, vy: 0, nose: 'base', noseT: 0, hurt: 0, ang: 0, wob: 0 };
  houses = []; chims = []; antennas = []; items = []; gulls = []; wires = []; parts = []; pops = []; snow = [];
  if (!L.roof) L.roof = L.towers ? [130, 230] : [105, 200];
  fillWorldSegment(0, L.len, R);
  stars = []; const R2 = rng(5); for (let i = 0; i < 110; i++) stars.push({ x: R2() * 1200, y: R2() * 420, s: R2() * 1.8 + 0.4, p: R2() * 6 });
  far = []; let fx = 0; while (fx < 7000) { const w = 28 + R() * 62; far.push({ x: fx, w, h: 22 + R() * 60, tower: R() < 0.07 }); fx += w - 4; }
}
function fillWorldSegment(x0, x1, R) {
  const gapHouse = L.ground === 'molo' ? 0 : (L.diff >= 8 ? 8 : 18);
  let x = Math.max(x0, houses.length ? houses[houses.length - 1].x + houses[houses.length - 1].w + gapHouse : -200);
  while (x < x1 + 800) {
    const w = 85 + R() * (L.diff > 7 ? 70 : 95);
    if (L.ground === 'molo') houses.push({ x, w, h: 118, molo: true });
    else {
      const h = L.roof[0] + R() * (L.roof[1] - L.roof[0]);
      const towerChance = L.towers ? 0.09 : (L.theme === 'campanile' ? 0.05 : 0.015);
      const tower = x > 700 && R() < towerChance && !houses.some(o => o.tower && x - o.x < 1000);
      houses.push({
        x, w: tower ? 90 : w, h: tower ? 380 + R() * 40 : h,
        dome: !tower && (L.theme === 'pasticceria' ? R() < 0.28 : R() < 0.16),
        tower, win: Math.floor(R() * 3), door: R() < 0.6, ger: R() < (L.theme === 'presepe' ? 0.7 : 0.35),
        col: L.theme === 'pasticceria' ? (R() < 0.5 ? '#c9781e' : '#d6283b') : (R() < 0.5 ? '#2f74b5' : '#3c9a6a'),
        bakery: L.theme === 'pasticceria' && !tower && R() < 0.35,
        lights: L.theme === 'presepe' || L.theme === 'vigilia' || L.theme === 'natale',
        R: R(),
      });
    }
    x += (houses[houses.length - 1].w) + gapHouse + (L.ground !== 'molo' && R() < 0.2 ? 12 + R() * 28 : 0);
  }
  for (const h of houses) {
    if (h.x < x0 + 200 || h.x > x1 - 100 || h.tower || h._armed) continue;
    h._armed = true;
    if (R() < L.chim) {
      if (L.ground === 'molo') chims.push({ x: h.x + h.w * (0.2 + R() * 0.6), w: 14, top: H - h.h - 110 - R() * 90, lamp: true });
      else chims.push({ x: h.x + 12 + R() * Math.max(20, h.w - 44), w: 28 + R() * 8, top: H - h.h - 40 - R() * (55 + L.diff * 2), base: H - h.h, lamp: false });
    }
    // antenne / parabole sui tetti
    const antN = L.antennas != null ? L.antennas : Math.floor(L.diff / 3);
    if (antN > 0 && !h.molo && R() < Math.min(0.35, 0.08 + L.diff * 0.02)) {
      antennas.push({ x: h.x + h.w * 0.5, base: H - h.h, top: H - h.h - (70 + R() * 50 + L.diff * 3), wob: R() * 6 });
    }
  }
  for (let i = 0; i < houses.length - 1; i++) {
    const a = houses[i], b = houses[i + 1];
    if (a._wired || a.x < x0) continue;
    if (R() > (L.wires || 0)) continue;
    if (a.tower || b.tower || a.molo || b.molo) continue;
    if (b.x - (a.x + a.w) > 140) continue;
    a._wired = true;
    const y = Math.min(H - a.h, H - b.h) - (40 + R() * 70);
    wires.push({ x1: a.x + a.w * 0.7, x2: b.x + b.w * 0.3, y, sag: 8 + R() * 18 });
  }
  let ix = Math.max(x0 + 380, 380); let k = 0;
  const letterAt = Math.floor((x0 + x1) * 0.5);
  let letterPlaced = false;
  let magnetsLeft = L.magnets || 2;
  let starsLeft = L.stars || 3;
  let bombsLeft = L.bombs != null ? L.bombs : Math.max(0, Math.floor(L.diff / 2) - 1);
  let wishesLeft = L.wishes != null ? L.wishes : 2 + Math.floor(L.diff / 4);
  const spacing = Math.max(130, 220 - L.diff * 6);
  while (ix < x1 - 120) {
    const yPath = 290 + Math.sin(ix / 380 + (L.diff || 1)) * (110 + L.diff * 2) + Math.sin(ix / 140) * 28;
    if (L.letterObj && !letterPlaced && ix > letterAt && mode === 'story') {
      items.push({ x: ix, y: clamp(yPath - 36, 160, 420), t: 'lettera', r: 26, got: false });
      letterPlaced = true; ix += 180; continue;
    }
    if (wishesLeft > 0 && R() < 0.09) {
      items.push({ x: ix, y: clamp(yPath - 10, 160, 400), t: 'desiderio', r: 24, got: false, wish: DESIDERI[Math.floor(R() * DESIDERI.length)], pull: true });
      wishesLeft--; ix += spacing; k++; continue;
    }
    if (bombsLeft > 0 && R() < 0.08 + L.diff * 0.004) {
      items.push({ x: ix, y: clamp(yPath + 20 + R() * 40, 180, 440), t: 'bomba', r: 20, got: false, spin: R() * 6 });
      bombsLeft--; ix += spacing * 0.85; k++; continue;
    }
    if (magnetsLeft > 0 && R() < 0.07) {
      items.push({ x: ix, y: clamp(yPath, 170, 400), t: 'magnet', r: 24, got: false });
      magnetsLeft--; ix += spacing; k++; continue;
    }
    if (starsLeft > 0 && R() < 0.1) {
      items.push({ x: ix, y: clamp(yPath - 20, 150, 380), t: 'stella', r: 22, got: false, pull: true });
      starsLeft--; ix += spacing * 0.9; k++; continue;
    }
    if (R() < 0.22 + L.diff * 0.01) {
      const n = 2 + (R() < 0.4 ? 1 : 0);
      for (let j = 0; j < n; j++) {
        items.push({ x: ix + j * 48, y: clamp(yPath + Math.sin(j) * 28, 150, safeYAt(ix + j * 48) - 36), t: 'nota', r: 16, got: false, pull: true });
      }
      ix += spacing; k++; continue;
    }
    const kind = (k % 5 === 4) ? 'cart' : 'risata';
    const n = kind === 'risata' ? (2 + (L.diff > 5 && R() < 0.5 ? 1 : 0) + (R() < 0.35 ? 1 : 0)) : 1;
    for (let j = 0; j < n; j++) {
      items.push({
        x: ix + j * 52,
        y: clamp(yPath + (j - (n - 1) / 2) * 16, 150, safeYAt(ix + j * 52) - 36),
        t: kind,
        r: kind === 'cart' ? 22 : 18,
        got: false,
        pull: true,
        deco: kind === 'risata' ? DECO_SKINS[(k + j) % DECO_SKINS.length] : null,
      });
    }
    ix += spacing + R() * (90 + L.diff * 4); k++;
  }
  const gN = L.gulls || 0;
  const baseG = gulls.length;
  for (let g = 0; g < gN; g++) {
    if (baseG && g < baseG && mode === 'infinite') continue;
    gulls.push({
      x: x0 + 850 + (g + R() * 0.5) * ((x1 - x0 - 400) / Math.max(1, gN)),
      y: 180 + R() * 200,
      ph: R() * 6,
      spd: 65 + R() * 35 + L.diff * 2.2,
      active: false, hit: false, gone: false, warn: 0,
    });
  }
}
function extendInfinite() {
  if (mode !== 'infinite') return;
  const tier = Math.floor(dist / 7000);
  if (tier > (L.tier || 0)) {
    const keepScore = { score, risate, cart, lettere, desideri, notes, bell, combo };
    L = makeInfiniteSlice(tier);
    Object.assign({ score, risate, cart, lettere, desideri, notes, bell, combo }, keepScore);
    score = keepScore.score; risate = keepScore.risate; cart = keepScore.cart;
    lettere = keepScore.lettere; desideri = keepScore.desideri; notes = keepScore.notes;
    bell = keepScore.bell; combo = keepScore.combo;
  }
  const needUntil = dist + W * 4 + 3000;
  if (L.len < needUntil) {
    const old = L.len;
    L.len = needUntil + 4000;
    fillWorldSegment(old - 200, L.len, rng(2000 + Math.floor(dist)));
  }
}
function houseAt(wx) { for (const h of houses) if (wx >= h.x && wx < h.x + h.w) return h; return null; }
function safeYAt(wx) { let y = H - 100; for (const h of houses) if (wx > h.x - 40 && wx < h.x + h.w + 40) y = Math.min(y, H - h.h); for (const c of chims) if (Math.abs(wx - c.x) < 50) y = Math.min(y, c.top - 20); return y; }

// ---------- input ----------
function toLogical(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
function focusPlay() {
  try { cv.focus({ preventScroll: true }); } catch (_) { try { cv.focus(); } catch (_) {} }
}
function handleJumpKey(code) {
  audioInit();
  if (code === 'Enter') { primary(); return; }
  if (code === 'KeyM') { setMuted(!muted); return; }
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || code === ' ') {
    if (state === 'play' && !overlay) hic();
    else if (state === 'takeoff') { /* lascia finire la rincorsa */ }
    else primary();
  }
}
// Esposto al sito padre (iframe): lo Space spesso resta fuori dall’iframe
window.__BV_KEY = (code) => handleJumpKey(code);
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  focusPlay();
  audioInit();
  const p = toLogical(e);
  press(p.x, p.y);
}, { passive: false });
function onKeyDown(e) {
  if (e.repeat) return;
  const code = e.code || e.key;
  if (code === 'Space' || code === ' ' || code === 'ArrowUp' || code === 'KeyW' || code === 'Enter') {
    e.preventDefault();
    handleJumpKey(code === ' ' ? 'Space' : code);
  } else if (code === 'KeyM') {
    handleJumpKey(code);
  }
}
window.addEventListener('keydown', onKeyDown);
document.addEventListener('keydown', onKeyDown);
cv.addEventListener('keydown', onKeyDown);
window.addEventListener('load', focusPlay);
focusPlay();
function press(x, y) {
  for (const b of buttons) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { b.fn(); return; }
  if (state === 'play' && !overlay) hic();
}
function primary() { const b = buttons.find(b => b.primary); if (b) b.fn(); }
function hic() {
  if (!bri) return;
  if (endPhase === 'fly' || endPhase === 'done' || endPhase === 'molo' || endPhase === 'away') return;
  bri.vy = -340; bri.wob = 1; SFX.hic();
  pops.push({ x: bri.x - 30, y: bri.y - 40, s: 'hic!', t: 0, c: '#fff' });
  for (let i = 0; i < 4; i++) parts.push({ x: bri.x - 30, y: bri.y + 10, vx: -60 - Math.random() * 60, vy: 40 + Math.random() * 60, t: 0, life: 0.6, c: 'rgba(200,230,255,0.9)', r: 3 });
}
function setNose(n, t) { bri.nose = n; bri.noseT = t; }

// ---------- update ----------
function update(dt) {
  time += dt; bellRing = Math.max(0, bellRing - dt); flash = Math.max(0, flash - dt);
  for (const p of parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; }
  parts = parts.filter(p => p.t < p.life);
  for (const p of pops) { p.t += dt; p.y -= 40 * dt; }
  pops = pops.filter(p => p.t < 1.1);
  if (state === 'ending') { updSnow(dt, 1); finale.t += dt; finale.x -= 140 * dt; finale.y -= 30 * dt; return; }
  if (state === 'takeoff') { updTakeoff(dt); return; }
  if (state === 'play' && L && L.mode === 'dawn') updSnow(dt, 0.6);
  if (state !== 'play' || overlay) return;
  bri.x = W * 0.3;
  if (bri.noseT > 0) { bri.noseT -= dt; if (bri.noseT <= 0) bri.nose = 'base'; }
  bri.hurt = Math.max(0, bri.hurt - dt); bri.wob = Math.max(0, bri.wob - dt * 3);
  magnetT = Math.max(0, magnetT - dt);
  if (magnetT <= 0) magnetPow = 0;
  hintT += dt;
  if (endPhase) { updEnd(dt); return; }
  if (mode === 'infinite') extendInfinite();
  dist += L.speed * dt;
  // score distance in infinite
  if (mode === 'infinite') score = Math.max(score, Math.floor(dist / 10) + risate * 10 + desideri * 40 + notes * 5);
  bri.vy = Math.min(bri.vy + 820 * dt, 380); bri.y += bri.vy * dt;
  if (bri.y < 110) { bri.y = 110; bri.vy = Math.max(bri.vy, 40); }
  const wx = dist + bri.x;
  const h = houseAt(wx); const floor = h ? H - h.h - 34 : H - 70;
  // tetto / muro = perde vita
  if (bri.y > floor) {
    bri.y = floor; bri.vy = -300;
    bump(h && h.molo ? 'Ahi, il molo!' : 'Ahi, il tetto!');
  }
  bri.ang = clamp(bri.vy / 900, -0.35, 0.45);
  // comignoli, campanili, antenne, fili, muri
  if (bri.hurt <= 0) {
    for (const c of chims) {
      const cx = c.x - dist;
      if (Math.abs(cx - bri.x) < c.w / 2 + 26 && bri.y + 24 > c.top && bri.y < (c.base || H) + 10) {
        bump(c.lamp ? 'Ahi, un lampione!' : 'Ahi, un comignolo!'); break;
      }
    }
    for (const a of antennas) {
      const ax = a.x - dist;
      if (Math.abs(ax - bri.x) < 16 && bri.y + 20 > a.top && bri.y < a.base + 10) {
        bump('Ahi, un’antenna!');
        sparkBurst = 0.5;
        break;
      }
    }
    if (h && !h.molo && bri.y + 20 > H - h.h && bri.y < H - 40) {
      // muro verticale vicino al bordo della casa
      const left = h.x - dist, right = h.x + h.w - dist;
      if ((Math.abs(bri.x - left) < 22 || Math.abs(bri.x - right) < 22) && bri.y > H - h.h + 30) {
        bump(h.tower ? 'Ahi, il campanile!' : 'Ahi, un muro!');
      }
    }
    if (h && h.tower && bri.y + 24 > H - h.h) bump('Ahi, il campanile!');
    for (const w of wires) {
      const x1 = w.x1 - dist, x2 = w.x2 - dist;
      if (bri.x < Math.min(x1, x2) - 10 || bri.x > Math.max(x1, x2) + 10) continue;
      const t = clamp((bri.x - x1) / Math.max(1, x2 - x1), 0, 1);
      const wy = w.y + Math.sin(t * Math.PI) * w.sag;
      if (Math.abs(bri.y - wy) < 22) { bump(L.theme === 'presepe' ? 'Ahi, le lucine!' : 'Ahi, un filo!'); break; }
    }
  }
  // animazioni decorative
  sparkBurst = Math.max(0, sparkBurst - dt);
  if (Math.random() < 0.08) {
    floaters.push({ x: W + 20, y: 120 + Math.random() * 280, vx: -30 - Math.random() * 40, vy: Math.sin(time) * 10, t: 0, life: 3, kind: Math.random() > 0.5 ? '✦' : '❄', c: '#fff6c2' });
  }
  for (const f of floaters) { f.t += dt; f.x += f.vx * dt; f.y += Math.sin(time * 3 + f.y) * 12 * dt; }
  floaters = floaters.filter(f => f.t < f.life && f.x > -40);
  // calamita: attira note, risate, cartellate, stelle
  if (magnetPow > 0) {
    for (const it of items) {
      if (it.got || !it.pull) continue;
      const ix = it.x - dist; if (ix < -40 || ix > W + 80) continue;
      const dx = bri.x - ix, dy = bri.y - it.y;
      const d = Math.hypot(dx, dy);
      if (d < 230 && d > 1) {
        const pull = magnetPow * (260 / d) * dt * 110;
        it.x += (dx / d) * pull;
        it.y += (dy / d) * pull * 0.85;
      }
    }
  }
  // oggetti
  for (const it of items) {
    if (it.got) continue; const ix = it.x - dist; if (ix < -50 || ix > W + 50) continue;
    const bob = it.t === 'nota' ? Math.sin(time * 4 + it.x) * 8 : Math.sin(time * 3 + it.x) * 6;
    const dx = ix - (bri.x + 8), dy = it.y + bob - bri.y;
    if (dx * dx + dy * dy < (it.r + 30) * (it.r + 30)) collect(it, ix);
  }
  // gabbiani
  for (const g of gulls) {
    if (g.gone) continue;
    const sx = g.x - dist;
    if (!g.active && sx < W + 220) { g.active = true; g.sx = W + 120; g.warn = Math.max(0.7, 1.35 - L.diff * 0.03); }
    if (!g.active) continue;
    if (g.warn > 0) { g.warn -= dt; continue; }
    g.sx -= (L.speed * 0.5 + g.spd) * dt; g.ph += dt * 2.2;
    g.yy = g.y + Math.sin(g.ph) * (40 + L.diff);
    if (g.sx < -150) g.gone = true;
    if (!g.hit && bri.hurt <= 0) { const dx = g.sx - bri.x, dy = g.yy - bri.y; if (dx * dx + dy * dy < 50 * 50) steal(g); }
  }
  if (mode !== 'infinite' && dist >= L.len) {
    if (L.finale) { endPhase = 'molo'; endT = 0; }
    else { endPhase = 'land'; endT = 0; }
  }
}
function bump(msg) {
  if (overlay || endPhase || bri.hurt > 0) return;
  bri.hurt = 1.35; bri.vy = -280; setNose('blu', 1.4); SFX.ahi(); combo = 0;
  hits += 1;
  if (bell > 0) bell -= 1;
  pops.push({ x: bri.x, y: bri.y - 50, s: msg, t: 0, c: '#bfe3ff' }); flash = 0.2;
  sparkBurst = 0.45;
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * 6.28;
    parts.push({ x: bri.x, y: bri.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, t: 0, life: 0.55, c: '#9ad0ff', r: 3 });
  }
  if (hits >= maxHits()) failLevel();
}
function steal(g) {
  if (overlay || endPhase) return;
  g.hit = true; bri.hurt = 1.2; setNose('blu', 1.4); SFX.squawk(); combo = 0;
  hits += 1;
  if (cart > 0) { cart--; score = Math.max(0, score - 25); pops.push({ x: bri.x, y: bri.y - 50, s: 'L’Ammiraglio ha rubato una cartellata!', t: 0, c: '#ffe08a' }); }
  else pops.push({ x: bri.x, y: bri.y - 50, s: 'Squaaak! Che spavento!', t: 0, c: '#ffe08a' });
  g.ph += 3; g.spd += 120;
  if (hits >= maxHits()) failLevel();
}
function failLevel() {
  failLine = pickLine(L.failLines || ['Mi dispiace, riprova. Ce la puoi fare!']);
  if (mode === 'infinite') bestInfinite = Math.max(bestInfinite, Math.floor(dist));
  overlay = { type: 'fail' };
  bri.vy = 0;
  SFX.ahi();
}
function winLevel() {
  winLine = pickLine(L.winLines || ['Bravissimo! Che bel volo.']);
  overlay = { type: 'win' };
  SFX.fanfare();
}
function updTakeoff(dt) {
  takeoffT += dt;
  const py = padY();
  // rincorsa diversa per tema (tempi e traiettoria)
  const runEnd = L.theme === 'porto' || L.ground === 'molo' ? 2.4 : L.theme === 'campanile' ? 2.0 : 2.15;
  const leapEnd = runEnd + 0.85;
  if (takeoffT < 0.7) {
    takeoffPhase = 'ready';
    bri.x = 78; bri.y = py - 28; bri.ang = 0; bri.s = 0.48;
  } else if (takeoffT < runEnd) {
    takeoffPhase = 'run';
    const t = (takeoffT - 0.7) / (runEnd - 0.7);
    bri.x = 78 + t * (W * 0.42);
    bri.y = py - 28 - Math.abs(Math.sin(t * 18)) * 6;
    bri.ang = 0.05; bri.wob = 1;
    if (Math.floor(takeoffT * 10) !== Math.floor((takeoffT - dt) * 10) && Math.floor(takeoffT * 10) % 3 === 0) {
      parts.push({ x: bri.x - 20, y: py - 4, vx: -40, vy: -10, t: 0, life: 0.35, c: 'rgba(255,255,255,0.7)', r: 3 });
    }
  } else if (takeoffT < leapEnd) {
    if (takeoffPhase !== 'leap') { takeoffPhase = 'leap'; SFX.hic(); setNose('rosa', 0.8); }
    const t = (takeoffT - runEnd) / (leapEnd - runEnd);
    bri.x = 78 + W * 0.42 + t * 40;
    bri.y = (py - 28) - t * 160;
    bri.ang = -0.25; bri.vy = -200;
  } else {
    state = 'play'; hintT = 0; bri.x = W * 0.3; bri.vy = -220; bri.s = 0.5; pops.push({ x: bri.x, y: bri.y - 40, s: 'hic!', t: 0, c: '#fff' });
  }
}
function collect(it, ix) {
  it.got = true;
  if (it.t === 'risata') {
    risate++; combo++; bell = Math.min(BELL_TARGET, bell + 1); score += 10 + Math.min(combo, 12);
    setNose('rosa', 0.8); bellRing = 0.5; SFX.tin(Math.min(combo, 12));
    pops.push({ x: ix, y: it.y - 24, s: 'tin!', t: 0, c: '#fff6c2' });
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; parts.push({ x: ix, y: it.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, t: 0, life: 0.5, c: '#ffe56b', r: 3 }); }
  } else if (it.t === 'cart') {
    cart++; score += 25; setNose('oro', 1.5); SFX.gnam();
    pops.push({ x: ix, y: it.y - 24, s: 'gnam!', t: 0, c: '#ffcf6b' });
  } else if (it.t === 'nota') {
    notes++; combo++; bell = Math.min(BELL_TARGET, bell + 2); score += 15 + Math.min(combo, 10);
    setNose('oro', 0.7); bellRing = 0.55; SFX.tin(4 + (notes % 8));
    pops.push({ x: ix, y: it.y - 22, s: '♪', t: 0, c: '#ffe08a' });
  } else if (it.t === 'stella') {
    score += 50; combo += 2; bell = Math.min(BELL_TARGET, bell + 4); setNose('oro', 1.2); SFX.letter();
    pops.push({ x: ix, y: it.y - 28, s: '+50 ★', t: 0, c: '#fff6c2' });
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; parts.push({ x: ix, y: it.y, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, t: 0, life: 0.6, c: '#fff', r: 3 }); }
  } else if (it.t === 'magnet') {
    magnetT = 6.5; magnetPow = 1.35; setNose('blu', 1.2); SFX.fanfare();
    pops.push({ x: ix, y: it.y - 26, s: 'Calamita!', t: 0, c: '#9ad0ff' });
  } else if (it.t === 'desiderio') {
    desideri++; lettere++; score += 80; SFX.letter(); setNose('oro', 1);
    sparkBurst = 0.6;
    const wish = (it.wish && it.wish.body) ? it.wish : DESIDERI[Math.floor(Math.random() * DESIDERI.length)];
    overlay = { type: 'wish', L: wish };
  } else if (it.t === 'bomba') {
    pops.push({ x: ix, y: it.y - 24, s: 'BOOM!', t: 0, c: '#ff6b6b' });
    sparkBurst = 0.7;
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 6.28;
      parts.push({ x: ix, y: it.y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, t: 0, life: 0.7, c: '#ff8a3a', r: 4 });
    }
    bump('Ahi, una bomba di fuliggine!');
  } else if (it.t === 'lettera') {
    lettere++; score += 100; SFX.letter();
    const letter = L.letterObj || DESIDERI[Math.floor(Math.random() * DESIDERI.length)];
    overlay = { type: 'letter', L: letter };
  }
}
function updEnd(dt) {
  endT += dt;
  bri.vy = Math.min(bri.vy + 820 * dt, 380);
  if (endPhase === 'land') {
    // atterraggio dolce sulla base del capitolo
    const targetY = padY() - 30;
    const targetX = W * 0.55;
    bri.x = lerp(bri.x, targetX, dt * 1.6);
    bri.y = lerp(bri.y, targetY, dt * 2.2);
    bri.vy = 0; bri.ang = lerp(bri.ang, 0.05, dt * 3); bri.s = lerp(bri.s || 0.5, 0.48, dt * 2);
    if (Math.abs(bri.y - targetY) < 6 && endT > 1.1) {
      endPhase = null;
      winLevel();
    }
    return;
  }
  if (endPhase === 'molo') {
    // tutto il paese ride, e anche Nico
    bri.y = lerp(bri.y, 330, dt * 2); bri.vy = 0;
    if (Math.floor(endT * 6) !== Math.floor((endT - dt) * 6) && bell < BELL_TARGET) { bell = Math.min(BELL_TARGET, bell + 3); SFX.tin(Math.floor(Math.random() * 12)); bellRing = 0.5; }
    if (endT > 0.05 && endT - dt <= 0.05) SFX.laugh();
    if (endT > 3.6) { bell = BELL_TARGET; endPhase = 'sleigh'; endT = 0; sleigh = { x: W + 40, y: 220, s: Math.min(0.78, (W * 0.95) / 720) }; SFX.fanfare(); }
    return;
  }
  if (endPhase === 'sleigh') {
    // la slitta arriva da destra e rallenta
    sleigh.x = lerp(sleigh.x, W * 0.62 - 405 * sleigh.s, dt * 1.4);
    sleigh.y = 210 + Math.sin(time * 1.5) * 8;
    const gx = sleigh.x + 405 * sleigh.s, gy = sleigh.y + 172 * sleigh.s - 6;
    sleigh.gx = gx; sleigh.gy = gy;
    // il giocatore vola; un aiutino lo porta piano verso il posto vuoto
    const assist = clamp(endT / 7, 0.25, 1);
    bri.y += bri.vy * dt * (1 - assist * 0.8);
    bri.y = lerp(bri.y, gy, dt * (0.6 + assist * 2.2));
    bri.x = lerp(bri.x, gx, dt * (0.25 + assist * 0.9));
    bri.y = clamp(bri.y, 110, H - 160);
    const d = Math.hypot(bri.x - gx, bri.y - gy);
    bri.s = lerp(sleigh.s * 0.6, 0.5, clamp(d / 250, 0, 1));
    bri.ang = 0;
    if (d < 22 || endT > 9) {
      endPhase = 'away'; endT = 0; SFX.fanfare(); for (let i = 0; i < 4; i++) setTimeout(() => SFX.tin(i * 3), i * 140);
      score += 200;
    }
    return;
  }
  if (endPhase === 'away') {
    updSnow(dt, 1);
    sleigh.x -= 60 * dt * endT * 3; sleigh.y -= 40 * dt * endT * 2;
    bri.x = sleigh.gx = sleigh.x + 405 * sleigh.s; bri.y = sleigh.gy = sleigh.y + 172 * sleigh.s - 6; bri.s = sleigh.s * 0.6;
    if (endT > 3.2) { winLine = pickLine(L.winLines || ['Bravissimo!']); overlay = { type: 'win' }; }
  }
}
function updSnow(dt, k) {
  if (snow.length < 220 * k) for (let i = 0; i < 4; i++) snow.push({ x: Math.random() * W, y: -10, vy: 30 + Math.random() * 50, vx: (Math.random() - 0.5) * 20, r: 1 + Math.random() * 2.4, p: Math.random() * 6 });
  for (const s of snow) { s.y += s.vy * dt; s.x += s.vx * dt + Math.sin(time + s.p) * 0.3; if (s.y > H + 5) { s.y = -5; s.x = Math.random() * W; } }
}

// ---------- disegno ----------
function sky() {
  const m = L ? L.mode : 'night';
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (m === 'day') { g.addColorStop(0, '#5fb3e8'); g.addColorStop(0.6, '#bfe6fb'); g.addColorStop(1, '#eaf7ff'); }
  else if (m === 'sunset') { g.addColorStop(0, '#5a5ea8'); g.addColorStop(0.35, '#e58ba0'); g.addColorStop(0.7, '#ffc58a'); g.addColorStop(1, '#ffe7c4'); }
  else if (m === 'dawn') { g.addColorStop(0, '#9fb8e8'); g.addColorStop(0.45, '#f7c3b0'); g.addColorStop(1, '#fff3df'); }
  else { g.addColorStop(0, '#070d2e'); g.addColorStop(0.6, '#1b2a63'); g.addColorStop(1, '#2c3d7a'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Illustrazione del capitolo del libro come atmosfera (parallasse soft)
  storyBackdrop();
  if (m === 'night' || m === 'sunset') {
    for (const s of stars) { const a = (m === 'night' ? 0.9 : 0.35) * (0.6 + 0.4 * Math.sin(time * 2 + s.p)); ctx.fillStyle = `rgba(255,255,240,${a})`; ctx.fillRect(((s.x - dist * 0.02) % 1200 + 1200) % 1200 * (W / 1200), s.y, s.s, s.s); }
  }
  if (m === 'night') { ctx.save(); ctx.shadowColor = '#fff8d0'; ctx.shadowBlur = 40; ctx.fillStyle = '#fbf3cf'; ctx.beginPath(); ctx.arc(W * 0.78, 150, 46, 0, 7); ctx.fill(); ctx.restore(); }
  if (m === 'day') { ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 5; i++) { const x = ((i * 330 - dist * 0.08) % (W + 300) + W + 300) % (W + 300) - 150, y = 150 + (i % 3) * 70; cloud(x, y, 1 + (i % 2) * 0.4); } }
  if (m === 'sunset') { ctx.fillStyle = 'rgba(255,230,210,0.55)'; for (let i = 0; i < 4; i++) { const x = ((i * 380 - dist * 0.08) % (W + 300) + W + 300) % (W + 300) - 150; cloud(x, 180 + (i % 2) * 90, 1.2); } }
  // tema: farina / zucchero a velo in aria
  if (L && (L.theme === 'pasticceria' || L.theme === 'natale')) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 18; i++) {
      const x = ((i * 97 - dist * 0.35 + time * 12) % (W + 40) + W + 40) % (W + 40) - 20;
      const y = 90 + (i * 37) % (H * 0.45);
      ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3), 0, 7); ctx.fill();
    }
  }
}
function storyBackdrop() {
  if (!L) return;
  const im = IMG[L.img];
  if (!ok(im)) return;
  const parallax = dist * 0.035;
  const h = H * 0.58;
  const w = h * (im.naturalWidth / Math.max(1, im.naturalHeight));
  const baseX = -((parallax) % (w * 0.8));
  ctx.save();
  ctx.globalAlpha = L.mode === 'night' ? 0.2 : L.mode === 'sunset' ? 0.24 : 0.28;
  for (let i = -1; i < 3; i++) {
    ctx.drawImage(im, baseX + i * w * 0.82, H * 0.06, w, h);
  }
  ctx.restore();
  // velo per fondere col cielo
  const vg = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  vg.addColorStop(0, 'rgba(7,13,46,0)');
  vg.addColorStop(1, L.mode === 'day' ? 'rgba(190,230,250,0.35)' : L.mode === 'dawn' ? 'rgba(255,240,220,0.35)' : 'rgba(10,20,60,0.45)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H * 0.7);
}
function cloud(x, y, s) { ctx.beginPath(); ctx.arc(x, y, 26 * s, 0, 7); ctx.arc(x + 30 * s, y - 14 * s, 32 * s, 0, 7); ctx.arc(x + 64 * s, y, 24 * s, 0, 7); ctx.rect(x, y, 64 * s, 24 * s); ctx.fill(); }
function farLayer() {
  const m = L.mode === 'dawn' ? 'day' : L.mode; const seaY = H - 230;
  // mare
  const g = ctx.createLinearGradient(0, seaY, 0, H);
  if (m === 'day') { g.addColorStop(0, '#2a8fc4'); g.addColorStop(1, '#1b6ea3'); }
  else if (m === 'sunset') { g.addColorStop(0, '#d98c8f'); g.addColorStop(1, '#6a5c97'); }
  else { g.addColorStop(0, '#13265a'); g.addColorStop(1, '#0a1640'); }
  ctx.fillStyle = g; ctx.fillRect(0, seaY, W, H - seaY);
  if (m === 'night') { ctx.fillStyle = 'rgba(255,245,200,0.25)'; for (let i = 0; i < 9; i++) ctx.fillRect(W * 0.78 - 30 + Math.sin(time * 2 + i) * 10, seaY + 8 + i * 12, 60 - i * 4, 3); }
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 14; i++) { const x = ((i * 97 - dist * 0.45) % (W + 60) + W + 60) % (W + 60) - 30; ctx.fillRect(x, seaY + 14 + (i % 5) * 16, 18, 2); }
  // paese lontano sulla scogliera
  const off = dist * 0.18; const baseY = seaY + 4;
  const col = m === 'day' ? '#efe9dc' : m === 'sunset' ? '#f4d2c0' : '#2c3a70';
  const sh = m === 'day' ? '#d9d0bd' : m === 'sunset' ? '#d9a9a0' : '#202c5c';
  ctx.fillStyle = m === 'night' ? '#18224f' : (m === 'day' ? '#b8a88c' : '#a9837e');
  ctx.beginPath(); ctx.moveTo(0, baseY + 10); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, baseY - 10 + Math.sin((x + off) / 90) * 6); ctx.lineTo(W, baseY + 12); ctx.closePath(); ctx.fill();
  for (const f of far) { const x = f.x - (off % 5800); if (x < -100 || x > W + 100) continue;
    ctx.fillStyle = col; ctx.fillRect(x, baseY - 16 - f.h, f.w, f.h + 8); ctx.fillStyle = sh; ctx.fillRect(x + f.w * 0.75, baseY - 16 - f.h, f.w * 0.25, f.h + 8);
    if (m === 'night') { ctx.fillStyle = 'rgba(255,214,120,0.8)'; ctx.fillRect(x + f.w * 0.3, baseY - f.h, 4, 5); }
    if (f.tower) { ctx.save(); ctx.translate(x + f.w / 2, baseY - 16 - f.h); ctx.rotate(0.06); ctx.fillStyle = col; ctx.fillRect(-9, -70, 18, 70); ctx.beginPath(); ctx.moveTo(-11, -70); ctx.lineTo(0, -88); ctx.lineTo(11, -70); ctx.fill(); ctx.fillStyle = sh; ctx.fillRect(-4, -60, 8, 10); ctx.restore(); }
  }
  // barche nel porto (livello 1)
  if (m === 'day' || m === 'night') { const cols = ['#d94b3d', '#f2c230', '#3d8ad9', '#3fae6a']; for (let i = 0; i < 6; i++) { const x = ((i * 260 - dist * 0.5) % (W + 240) + W + 240) % (W + 240) - 120; boat(x, seaY + 50 + (i % 2) * 22, cols[i % 4]); } }
}
function boat(x, y, c) {
  const b = Math.sin(time * 2 + x) * 2; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y + b); ctx.lineTo(x + 70, y + b); ctx.lineTo(x + 58, y + 16 + b); ctx.lineTo(x + 10, y + 16 + b); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(x + 24, y - 14 + b, 22, 14); ctx.fillStyle = '#5a4630'; ctx.fillRect(x + 34, y - 40 + b, 2, 26);
}
function nearLayer() {
  const m = L.mode === 'dawn' ? 'day' : L.mode; const sugar = L.mode === 'dawn';
  for (const h of houses) {
    const x = h.x - dist; if (x > W + 20 || x + h.w < -20) continue;
    const top = H - h.h;
    if (h.molo) {
      ctx.fillStyle = '#5c6378'; ctx.fillRect(x, top, h.w + 1, h.h); ctx.fillStyle = '#737b94'; ctx.fillRect(x, top, h.w + 1, 12);
      ctx.strokeStyle = 'rgba(30,35,55,0.5)'; ctx.lineWidth = 2; for (let yy = top + 30; yy < H; yy += 26) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + h.w, yy); ctx.stroke(); }
      ctx.fillStyle = '#3a3f52'; ctx.fillRect(x + h.w / 2 - 7, top - 14, 14, 14); continue;
    }
    const wall = m === 'day' ? '#fbf7ee' : m === 'sunset' ? '#ffe4d2' : '#c7cde8';
    const side = m === 'day' ? '#e3dccb' : m === 'sunset' ? '#e9bfae' : '#9aa3c9';
    if (h.tower) {
      ctx.save(); ctx.translate(x + h.w / 2, H); ctx.rotate(0.05);
      ctx.fillStyle = wall; ctx.fillRect(-h.w / 2, -h.h, h.w, h.h); ctx.fillStyle = side; ctx.fillRect(h.w / 4, -h.h, h.w / 4, h.h);
      ctx.fillStyle = '#6b4a2b'; rr(-16, -h.h + 30, 32, 44, 14); ctx.fill(); ctx.fillStyle = '#c9a23a'; ctx.beginPath(); ctx.arc(0, -h.h + 58, 11, 0, 7); ctx.fill();
      ctx.fillStyle = wall; ctx.beginPath(); ctx.moveTo(-h.w / 2 - 6, -h.h); ctx.lineTo(0, -h.h - 46); ctx.lineTo(h.w / 2 + 6, -h.h); ctx.fill();
      ctx.restore(); continue;
    }
    ctx.fillStyle = wall; ctx.fillRect(x, top, h.w + 1, h.h); ctx.fillStyle = side; ctx.fillRect(x + h.w - 12, top, 12, h.h);
    ctx.fillStyle = m === 'night' ? '#aab3d8' : '#efe7d6'; ctx.fillRect(x - 3, top - 6, h.w + 6, 8);
    if (sugar) { ctx.fillStyle = '#ffffff'; rr(x - 5, top - 12, h.w + 10, 12, 6); ctx.fill(); }
    if (h.dome) { ctx.fillStyle = wall; ctx.beginPath(); ctx.arc(x + h.w / 2, top - 4, h.w * 0.28, Math.PI, 0); ctx.fill(); }
    const lit = m === 'night' || m === 'sunset';
    for (let i = 0; i <= h.win; i++) { const wx = x + 16 + i * 30; if (wx > x + h.w - 30) break; ctx.fillStyle = lit && (i + Math.floor(h.R * 5)) % 2 === 0 ? '#ffd27a' : h.col; rr(wx, top + 24, 16, 20, 7); ctx.fill(); }
    if (h.door) { ctx.fillStyle = h.col; rr(x + h.w - 44, H - 52, 24, 52, 11); ctx.fill(); }
    if (h.ger) { for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#d9283a' : '#2e8b47'; ctx.beginPath(); ctx.arc(x + 14 + i * 7, top + 52, 4, 0, 7); ctx.fill(); } }
    if (h.bakery) {
      ctx.fillStyle = '#fff8e8'; rr(x + 10, top + 8, Math.min(54, h.w - 20), 18, 6); ctx.fill();
      text('DOLCI', x + Math.min(37, h.w / 2), top + 17, 11, '#c9781e', 'center', 'bold');
    }
    if (h.lights) {
      for (let i = 0; i < 4; i++) {
        const lx = x + 10 + i * (h.w / 4.5);
        ctx.fillStyle = ['#ff5a5f', '#ffe27a', '#6ad0ff', '#7dffb0'][i % 4];
        ctx.beginPath(); ctx.arc(lx, top - 2, 3, 0, 7); ctx.fill();
      }
    }
  }
  for (const c of chims) {
    const x = c.x - dist; if (x < -40 || x > W + 40) continue;
    if (c.lamp) {
      ctx.fillStyle = '#2b2f40'; ctx.fillRect(x - 4, c.top + 20, 8, H - c.top);
      ctx.save(); ctx.shadowColor = '#ffd36b'; ctx.shadowBlur = 30; ctx.fillStyle = '#ffe9a8'; rr(x - 12, c.top, 24, 26, 5); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#2b2f40'; ctx.fillRect(x - 15, c.top - 6, 30, 7);
    } else {
      const wall = m === 'day' ? '#f3ede0' : m === 'sunset' ? '#f7d6c4' : '#b9c0de';
      ctx.fillStyle = wall; ctx.fillRect(x - c.w / 2, c.top, c.w, c.base - c.top); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x + c.w / 2 - 7, c.top, 7, c.base - c.top);
      ctx.fillStyle = '#b5523b'; ctx.fillRect(x - c.w / 2 - 5, c.top - 8, c.w + 10, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 3; i++) { const t = (time * 0.6 + i / 3) % 1; ctx.beginPath(); ctx.arc(x + Math.sin(t * 6 + c.x) * 6, c.top - 14 - t * 50, 6 + t * 8, 0, 7); ctx.fill(); }
    }
  }
}
function drawAntennas() {
  for (const a of antennas) {
    const x = a.x - dist; if (x < -30 || x > W + 30) continue;
    ctx.strokeStyle = '#6a7188'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, a.base); ctx.lineTo(x + Math.sin(time * 2 + a.wob) * 3, a.top); ctx.stroke();
    ctx.fillStyle = '#9aa3b8'; ctx.beginPath(); ctx.ellipse(x, a.top + 8, 16, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = Math.sin(time * 8 + a.wob) > 0 ? '#ff5a5f' : '#7dffb0';
    ctx.beginPath(); ctx.arc(x, a.top, 4, 0, 7); ctx.fill();
  }
}
function drawWires() {
  for (const w of wires) {
    const x1 = w.x1 - dist, x2 = w.x2 - dist;
    if (Math.max(x1, x2) < -20 || Math.min(x1, x2) > W + 20) continue;
    ctx.strokeStyle = L.theme === 'presepe' || L.theme === 'vigilia' ? 'rgba(255,220,120,0.85)' : 'rgba(40,45,70,0.75)';
    ctx.lineWidth = L.theme === 'presepe' ? 2.5 : 2;
    ctx.beginPath(); ctx.moveTo(x1, w.y);
    const mid = (x1 + x2) / 2;
    ctx.quadraticCurveTo(mid, w.y + w.sag * 2, x2, w.y);
    ctx.stroke();
    if (L.theme === 'presepe' || L.theme === 'vigilia' || L.theme === 'natale') {
      for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        const px = x1 + (x2 - x1) * t;
        const py = w.y + Math.sin(t * Math.PI) * w.sag + Math.sin(time * 6 + i) * 1.5;
        ctx.fillStyle = ['#ff5a5f', '#ffe27a', '#6ad0ff', '#7dffb0'][i % 4];
        ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 7); ctx.fill();
      }
    }
  }
}
const DECO_SKINS = ['cane', 'ginger', 'mistletoe', 'pine', 'bauble', 'holly'];

function drawCandyCane(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(255,220,220,0.7)'; ctx.shadowBlur = 12;
  ctx.strokeStyle = '#f4f4f8'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(6, -2); ctx.quadraticCurveTo(6, -16, -6, -16); ctx.quadraticCurveTo(-14, -16, -14, -8); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#d6283b'; ctx.lineWidth = 9; ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(6, -2); ctx.quadraticCurveTo(6, -16, -6, -16); ctx.quadraticCurveTo(-14, -16, -14, -8); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
function drawGingerbread(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = '#c9781e'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#c47a2a';
  ctx.beginPath(); ctx.arc(0, -10, 7, 0, 7); ctx.fill(); // testa
  ctx.fillRect(-5, -4, 10, 14); // corpo
  ctx.fillRect(-12, -2, 7, 4); ctx.fillRect(5, -2, 7, 4); // braccia
  ctx.fillRect(-6, 8, 4, 9); ctx.fillRect(2, 8, 4, 9); // gambe
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff8e8';
  ctx.beginPath(); ctx.arc(-2.5, -11, 1.2, 0, 7); ctx.arc(2.5, -11, 1.2, 0, 7); ctx.fill();
  ctx.fillRect(-3, -7, 6, 1.5); // bocca icing
  ctx.fillStyle = '#d6283b'; ctx.beginPath(); ctx.arc(0, 2, 2, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff8e8'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(4, 6); ctx.stroke();
  ctx.restore();
}
function drawMistletoe(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = '#6dbf7a'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#2f8a45';
  for (const [ox, oy, rx, ry, rot] of [[-6, 2, 9, 5, -0.5], [6, 2, 9, 5, 0.5], [0, 6, 8, 4.5, 0.1], [-4, 8, 7, 4, -0.3], [4, 8, 7, 4, 0.3]]) {
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1f5c2e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 4); ctx.stroke();
  ctx.fillStyle = '#d6283b';
  ctx.beginPath(); ctx.arc(-3, 4, 3.2, 0, 7); ctx.arc(3, 5, 3.2, 0, 7); ctx.fill();
  ctx.restore();
}
function drawPineCone(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = '#8a5a2a'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath(); ctx.ellipse(0, 2, 11, 15, 0, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#a86d38';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const px = -7 + col * 7 + (row % 2) * 3.5;
      const py = -10 + row * 5.5;
      ctx.beginPath(); ctx.ellipse(px, py, 4, 3, 0.2, 0, 7); ctx.fill();
    }
  }
  ctx.strokeStyle = '#5c3a18'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -20); ctx.stroke();
  ctx.fillStyle = '#2f8a45'; ctx.beginPath(); ctx.ellipse(-3, -20, 4, 2.2, -0.4, 0, 7); ctx.ellipse(3, -20, 4, 2.2, 0.4, 0, 7); ctx.fill();
  ctx.restore();
}
function drawBauble(x, y, s = 1, hue = 0) {
  const colors = ['#d6283b', '#2f74b5', '#e6c15a', '#2f8a45'];
  const c = colors[hue % colors.length];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 4, 13, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-4, 0, 4, 6, -0.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#c9a227'; ctx.fillRect(-4, -12, 8, 5); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -14, 4, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#fff6c2'; star(0, 4, 4);
  ctx.restore();
}
function drawHolly(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = '#3fae6a'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#1f7a3a';
  for (const rot of [-0.7, 0.2, 0.9]) {
    ctx.save(); ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, -4); ctx.lineTo(14, -2); ctx.lineTo(10, 2); ctx.lineTo(16, 6); ctx.lineTo(8, 7); ctx.lineTo(6, 14); ctx.lineTo(2, 8); ctx.lineTo(-2, 12); ctx.lineTo(-4, 4); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#d6283b';
  ctx.beginPath(); ctx.arc(-3, 2, 3.5, 0, 7); ctx.arc(3, 1, 3.5, 0, 7); ctx.arc(0, 5, 3.2, 0, 7); ctx.fill();
  ctx.restore();
}
function drawDeco(skin, x, y, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
  if (skin === 'cane') drawCandyCane(0, 0, 1);
  else if (skin === 'ginger') drawGingerbread(0, 0, 1);
  else if (skin === 'mistletoe') drawMistletoe(0, 0, 1);
  else if (skin === 'pine') drawPineCone(0, 0, 1);
  else if (skin === 'holly') drawHolly(0, 0, 1);
  else drawBauble(0, 0, 1, Math.floor(Math.abs(x) / 40));
  ctx.restore();
}

function drawItem(it) {
  const x = it.x - dist; if (x < -40 || x > W + 40) return;
  const y = it.y + (it.t === 'nota' ? Math.sin(time * 4 + it.x) * 8 : Math.sin(time * 3 + it.x) * 6);
  if (it.t === 'risata') {
    const skin = it.deco || DECO_SKINS[Math.floor(Math.abs(it.x) / 90) % DECO_SKINS.length];
    drawDeco(skin, x, y, Math.sin(time * 2.2 + it.x * 0.01) * 0.18);
  } else if (it.t === 'cart') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(time * 0.8);
    ctx.shadowColor = '#ffb84a'; ctx.shadowBlur = 12; ctx.strokeStyle = '#c9781e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); for (let a = 0; a < 15; a += 0.2) { const r = 1.3 * a; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#f2b45a'; ctx.lineWidth = 3; ctx.beginPath(); for (let a = 0; a < 15; a += 0.2) { const r = 1.3 * a; ctx.lineTo(Math.cos(a) * r - 1, Math.sin(a) * r - 1); } ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 5; i++) ctx.fillRect(Math.cos(i * 2) * 10, Math.sin(i * 2) * 10, 2, 2);
    ctx.restore();
  } else if (it.t === 'nota') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 3) * 0.15);
    ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.ellipse(0, 6, 9, 7, -0.4, 0, 7); ctx.fill();
    ctx.fillRect(7, -16, 3, 22); ctx.beginPath(); ctx.moveTo(10, -16); ctx.quadraticCurveTo(22, -10, 18, 0); ctx.quadraticCurveTo(12, -6, 10, -8); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(-2, 4, 2, 0, 7); ctx.fill();
    ctx.restore();
  } else if (it.t === 'stella') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(time * 1.2);
    ctx.shadowColor = '#fff6b0'; ctx.shadowBlur = 20; ctx.fillStyle = '#ffe27a'; star(0, 0, 16); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; star(0, 0, 8); ctx.restore();
  } else if (it.t === 'magnet') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 2) * 0.1);
    ctx.shadowColor = '#7ec8ff'; ctx.shadowBlur = 18;
    ctx.strokeStyle = '#d6283b'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 14, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    ctx.strokeStyle = '#2f74b5'; ctx.beginPath(); ctx.arc(0, 0, 14, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; text('U', 0, 2, 14, '#fff');
    ctx.restore();
  } else if (it.t === 'bomba') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 6 + (it.spin || 0)) * 0.2);
    ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.arc(0, 4, 14, 0, 7); ctx.fill();
    ctx.strokeStyle = '#ffb84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(8, -18, 4, -26); ctx.stroke();
    ctx.fillStyle = Math.sin(time * 20) > 0 ? '#ff5a5f' : '#ffe27a'; ctx.beginPath(); ctx.arc(4, -26, 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; text('!', 0, 6, 16, '#fff'); ctx.restore();
  } else if (it.t === 'desiderio') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 2) * 0.12);
    ctx.shadowColor = '#fff6b0'; ctx.shadowBlur = 22 + Math.sin(time * 5) * 8;
    ctx.fillStyle = '#fff8e0'; ctx.fillRect(-22, -16, 44, 32); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#e6c15a'; ctx.lineWidth = 2; ctx.strokeRect(-22, -16, 44, 32);
    ctx.beginPath(); ctx.moveTo(-22, -16); ctx.lineTo(0, 2); ctx.lineTo(22, -16); ctx.stroke();
    ctx.fillStyle = '#d6283b'; star(0, 4, 7);
    text('✉', 18, -20, 14, '#fff'); ctx.restore();
  } else {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 2) * 0.12);
    ctx.shadowColor = '#fff6b0'; ctx.shadowBlur = 26 + Math.sin(time * 5) * 8; ctx.fillStyle = '#fbf3df'; ctx.fillRect(-24, -16, 48, 32); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, -16); ctx.lineTo(0, 4); ctx.lineTo(24, -16); ctx.stroke();
    ctx.fillStyle = '#c4202f'; ctx.beginPath(); ctx.arc(0, 3, 6, 0, 7); ctx.fill(); ctx.restore();
  }
}
const NOSE = { base: '#bfe6ff', blu: '#2d5bff', rosa: '#ff8fa8', oro: '#ffc23a' };
function drawBri(x, y, ang, flip = false, s = 0.5) {
  if (bri.hurt > 0 && Math.floor(bri.hurt * 12) % 2 === 0 && state === 'play' && !endPhase) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.sin(bri.wob * 9) * 0.06 * bri.wob); if (flip) ctx.scale(-1, 1);
  const w = 240 * s, h = 212 * s;
  if (ok(IMG.bri)) ctx.drawImage(IMG.bri, -w / 2, -h / 2, w, h);
  else { ctx.fillStyle = '#b07a3e'; ctx.beginPath(); ctx.ellipse(0, 0, w / 2.4, h / 3.4, 0, 0, 7); ctx.fill(); }
  // naso che cambia colore
  const nx = -w / 2 + 215 * s, ny = -h / 2 + 95 * s;
  ctx.globalCompositeOperation = 'source-over'; ctx.shadowColor = NOSE[bri.nose]; ctx.shadowBlur = 22; ctx.fillStyle = NOSE[bri.nose];
  ctx.beginPath(); ctx.arc(nx, ny, 13 * s * 2 * 0.55, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(nx - 2, ny - 2, 2.2, 0, 7); ctx.fill();
  ctx.restore();
}
function drawGull(g) {
  if (!g.active || g.gone) return;
  if (g.warn > 0) { const a = 0.5 + 0.5 * Math.sin(time * 18); ctx.fillStyle = `rgba(255,80,60,${a})`; ctx.beginPath(); ctx.arc(W - 30, g.y, 18, 0, 7); ctx.fill(); text('!', W - 30, g.y + 1, 24, '#fff'); return; }
  const w = 200 * 0.6, h = 166 * 0.6; ctx.save(); ctx.translate(g.sx, g.yy); ctx.rotate(Math.sin(g.ph * 2) * 0.08);
  if (ok(IMG.gab)) ctx.drawImage(IMG.gab, -w / 2, -h / 2, w, h); ctx.restore();
}
function drawSleigh(sl, withBri) {
  const w = 720 * sl.s, h = 239 * sl.s;
  if (ok(IMG.sli)) ctx.drawImage(IMG.sli, sl.x, sl.y, w, h);
  if (!withBri && sl.gx) { const a = 0.5 + 0.5 * Math.sin(time * 5); ctx.strokeStyle = `rgba(160,220,255,${0.4 + a * 0.5})`; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(sl.gx, sl.gy, 34 + a * 6, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
}
function hud() {
  vignette();
  ctx.fillStyle = 'rgba(10,18,60,0.62)'; rr(8, 8, W - 16, 78, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; rr(8, 8, W - 16, 78, 20); ctx.stroke();
  text('★ ' + score, 22, 30, 22, '#ffe27a', 'left');
  const cx = W - 24; ctx.font = `bold 17px ${FONT}`;
  let x = cx; const row = [['' + desideri, miniLetter], ['' + notes, miniNote], ['' + cart, miniCart], ['' + risate, miniDeco]];
  for (const [v, ic] of row) { const tw = ctx.measureText(v).width; text(v, x, 30, 17, '#fff', 'right'); x -= tw + 16; ic(x, 30); x -= 22; }
  const bx = 22, bw = W - 84;
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; rr(bx, 56, bw, 16, 8); ctx.fill();
  const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#cfe9ff'); g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g; rr(bx, 56, Math.max(16, bw * Math.min(1, bell / BELL_TARGET)), 16, 8); ctx.fill();
  text(mode === 'infinite' ? 'Distanza' : 'Sonaglio', bx + 8, 64, 11, '#1f3a7a', 'left', 'bold');
  bellIcon(W - 40, 62, bellRing);
  const title = mode === 'infinite' ? ('∞  ' + Math.floor(dist) + ' m · tier ' + ((L && L.tier) || 0)) : (L.num + '. ' + L.name);
  text(title, 16, 150, 14, '#fff', 'left', 'bold', 'rgba(10,20,60,0.7)', 4);
  if (mode !== 'infinite') {
    const prog = clamp(dist / Math.max(1, L.len), 0, 1);
    ctx.fillStyle = 'rgba(10,18,60,0.45)'; rr(16, 164, 160, 10, 5); ctx.fill();
    ctx.fillStyle = '#7dffb0'; rr(16, 164, Math.max(8, 160 * prog), 10, 5); ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(10,18,60,0.45)'; rr(16, 164, 160, 10, 5); ctx.fill();
    ctx.fillStyle = '#ffe27a'; rr(16, 164, Math.max(8, 160 * ((dist % 7000) / 7000)), 10, 5); ctx.fill();
  }
  if (magnetT > 0) text('Calamita ' + magnetT.toFixed(1) + 's', W / 2, 118, 16, '#9ad0ff', 'center', 'bold', 'rgba(10,20,60,0.65)', 4);
  const lives = maxHits();
  for (let i = 0; i < lives; i++) drawHeart(22 + i * 28, 188, i < (lives - hits), 1);
  // durante overlay niente bottoni HUD: si resta nel game, senza uscite accidentali
  if (!overlay) {
    iconButton(W - 52, 94, 40, 'mute', () => setMuted(!muted));
    iconButton(W - 100, 94, 40, 'restart', () => { startIntro(LI); });
  }
}
function miniNote(x, y) {
  ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.ellipse(x - 2, y + 4, 6, 5, -0.4, 0, 7); ctx.fill();
  ctx.fillRect(x + 3, y - 10, 2, 14);
}
function miniDeco(x, y) {
  // bastoncino in HUD al posto della faccina
  ctx.strokeStyle = '#f4f4f8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 3, y + 8); ctx.lineTo(x + 3, y); ctx.quadraticCurveTo(x + 3, y - 8, x - 3, y - 8); ctx.stroke();
  ctx.strokeStyle = '#d6283b'; ctx.lineWidth = 4; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(x + 3, y + 8); ctx.lineTo(x + 3, y); ctx.quadraticCurveTo(x + 3, y - 8, x - 3, y - 8); ctx.stroke();
  ctx.setLineDash([]);
}
function miniCart(x, y) { ctx.strokeStyle = '#e69a35'; ctx.lineWidth = 3; ctx.beginPath(); for (let a = 0; a < 13; a += 0.3) ctx.lineTo(x + Math.cos(a) * a * 0.7, y + Math.sin(a) * a * 0.7); ctx.stroke(); }
function miniLetter(x, y) { ctx.fillStyle = '#fbf3df'; ctx.fillRect(x - 10, y - 7, 20, 14); ctx.strokeStyle = '#b89b6a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 10, y - 7); ctx.lineTo(x, y + 1); ctx.lineTo(x + 10, y - 7); ctx.stroke(); }
function bellIcon(x, y, ring) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 30) * 0.3 * ring);
  ctx.fillStyle = '#e9eef5'; ctx.strokeStyle = '#8a96a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-11, 8); ctx.quadraticCurveTo(-11, -12, 0, -12); ctx.quadraticCurveTo(11, -12, 11, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#8a96a8'; ctx.beginPath(); ctx.arc(0, 10, 3.5, 0, 7); ctx.fill(); ctx.fillStyle = '#f2c230'; star(0, -2, 4); ctx.restore();
  if (ring > 0) text('tin!', x - 4, y - 26 + ring * 6, 14, '#fff');
}
function star(x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); }
function iconButton(x, y, s, kind, fn) {
  buttons.push({ x, y, w: s, h: s, fn });
  ctx.fillStyle = 'rgba(10,18,60,0.6)'; rr(x, y, s, s, 12); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; rr(x, y, s, s, 12); ctx.stroke();
  const cx = x + s / 2, cy = y + s / 2; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  if (kind === 'mute') {
    ctx.beginPath(); ctx.moveTo(cx - 11, cy - 4); ctx.lineTo(cx - 6, cy - 4); ctx.lineTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.lineTo(cx - 6, cy + 4); ctx.lineTo(cx - 11, cy + 4); ctx.closePath(); ctx.fill();
    if (muted) { ctx.beginPath(); ctx.moveTo(cx + 4, cy - 6); ctx.lineTo(cx + 12, cy + 6); ctx.moveTo(cx + 12, cy - 6); ctx.lineTo(cx + 4, cy + 6); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(cx + 2, cy, 6, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 2, cy, 11, -0.9, 0.9); ctx.stroke(); }
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, 10, -0.3, Math.PI * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 10, cy - 9); ctx.lineTo(cx + 10, cy - 2); ctx.lineTo(cx + 3, cy - 3); ctx.stroke();
  }
}
function bigButton(label, cx, cy, w, fn, primary = true, col = '#d6283b') {
  const h = 62, x = cx - w / 2, y = cy - h / 2; buttons.push({ x, y, w, h, fn, primary });
  const p = 1 + Math.sin(time * 4) * (primary ? 0.03 : 0);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); ctx.translate(-cx, -cy);
  if (primary) {
    ctx.shadowColor = col === '#d6283b' ? 'rgba(214,40,59,0.55)' : 'rgba(47,116,181,0.5)';
    ctx.shadowBlur = 18;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; rr(x + 3, y + 6, w, h, 31); ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const top = col === '#d6283b' ? '#ff6a6f' : col === '#2f74b5' ? '#5ec0ff' : col === '#2e8b47' ? '#4ecf78' : '#ffb84a';
  g.addColorStop(0, top); g.addColorStop(1, col);
  ctx.fillStyle = g; rr(x, y, w, h, 31); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 3; rr(x, y, w, h, 31); ctx.stroke();
  text(label, cx, cy + 1, primary ? 26 : 22, '#fff', 'center', 'bold', 'rgba(20,10,40,0.45)', 4);
  ctx.restore();
}
function panel(x, y, w, h, tone = 'cream') {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(x + 5, y + 8, w, h, 28); ctx.fill();
  const fill = tone === 'night' ? '#15244f' : tone === 'wish' ? '#fff8e8' : '#fff7ea';
  const g = ctx.createLinearGradient(x, y, x, y + h);
  if (tone === 'night') {
    g.addColorStop(0, '#1c2f63'); g.addColorStop(1, '#0f1a3a');
  } else {
    g.addColorStop(0, '#fffdf6'); g.addColorStop(1, fill);
  }
  ctx.fillStyle = g; rr(x, y, w, h, 28); ctx.fill();
  ctx.strokeStyle = tone === 'wish' ? '#e6c15a' : '#d6283b';
  ctx.lineWidth = 5; rr(x, y, w, h, 28); ctx.stroke();
  ctx.strokeStyle = tone === 'night' ? 'rgba(255,220,140,0.45)' : '#2e8b47';
  ctx.lineWidth = 2; ctx.setLineDash([10, 7]); rr(x + 9, y + 9, w - 18, h - 18, 20); ctx.stroke(); ctx.setLineDash([]);
  // angoli stelle
  ctx.fillStyle = tone === 'night' ? '#ffe27a' : '#d6283b';
  star(x + 22, y + 22, 7); star(x + w - 22, y + 22, 7);
}
function softBackdrop(alpha = 0.62) {
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.5, Math.max(W, H) * 0.72);
  g.addColorStop(0, `rgba(18,28,70,${alpha * 0.35})`);
  g.addColorStop(1, `rgba(6,10,32,${alpha})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // neve leggera sopra l’overlay
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 18; i++) {
    const x = ((i * 97 + time * 28) % (W + 40)) - 20;
    const y = ((i * 53 + time * (18 + i % 5)) % (H + 40)) - 20;
    ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3), 0, 7); ctx.fill();
  }
}
function drawHeart(hx, hy, on, s = 1) {
  ctx.save(); ctx.translate(hx, hy); ctx.scale(s, s);
  ctx.fillStyle = on ? '#ff6b81' : 'rgba(255,255,255,0.22)';
  if (on) { ctx.shadowColor = '#ff8fa3'; ctx.shadowBlur = 12; }
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-10, -8, -18, 8, 0, 18);
  ctx.bezierCurveTo(18, 8, 10, -8, 0, 4);
  ctx.fill(); ctx.restore();
}
function vignette() {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(4,8,28,0.28)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function drawParticles() {
  for (const p of parts) { ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  for (const p of pops) { ctx.globalAlpha = clamp(1.2 - p.t, 0, 1); text(p.s, clamp(p.x, 120, W - 120), p.y, p.s.length > 10 ? 18 : 24, p.c, 'center', 'bold', 'rgba(20,30,70,0.7)', 4); } ctx.globalAlpha = 1;
}
function drawSnow() { ctx.fillStyle = 'rgba(255,255,255,0.92)'; for (const s of snow) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); } }
function scene() {
  sky(); farLayer(); nearLayer(); drawWires(); drawAntennas();
  for (const it of items) if (!it.got) drawItem(it);
  for (const g of gulls) drawGull(g);
  if (endPhase === 'molo') crowd();
  if (sleigh) drawSleigh(sleigh, endPhase === 'away');
  if (magnetT > 0 && state === 'play' && !overlay) {
    const a = 0.18 + 0.1 * Math.sin(time * 8);
    ctx.strokeStyle = `rgba(120,190,255,${a + 0.25})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bri.x, bri.y, 54 + Math.sin(time * 6) * 6, 0, 7); ctx.stroke();
    ctx.strokeStyle = `rgba(210,235,255,${a})`; ctx.beginPath(); ctx.arc(bri.x, bri.y, 78, 0, 7); ctx.stroke();
  }
  drawBri(bri.x, bri.y, bri.ang, endPhase === 'away', bri.s || 0.5);
  // scintille / floaters
  for (const f of floaters) {
    ctx.globalAlpha = clamp(1 - f.t / f.life, 0, 1);
    text(f.kind, f.x, f.y, 16, f.c);
  }
  ctx.globalAlpha = 1;
  if (sparkBurst > 0) {
    ctx.fillStyle = `rgba(255,220,120,${sparkBurst * 0.35})`;
    ctx.beginPath(); ctx.arc(bri.x, bri.y, 70, 0, 7); ctx.fill();
  }
  drawParticles();
  if (endPhase === 'away' || (L && L.mode === 'dawn') || mode === 'infinite') drawSnow();
  if (flash > 0) { ctx.fillStyle = `rgba(255,120,100,${flash})`; ctx.fillRect(0, 0, W, H); }
}
function crowd() {
  const R = rng(9); const base = H - 118;
  for (let i = 0; i < 26; i++) { const x = (i + 0.5) * (W / 26) + (R() - 0.5) * 10, hh = 34 + R() * 22, j = Math.abs(Math.sin(time * 9 + i)) * 6;
    const cols = ['#d6283b', '#2f74b5', '#f2c230', '#3fae6a', '#e27ab0', '#8a5cc7']; ctx.fillStyle = cols[i % 6];
    rr(x - 9, base - hh - j, 18, hh, 7); ctx.fill(); ctx.fillStyle = '#f2c9a0'; ctx.beginPath(); ctx.arc(x, base - hh - 10 - j, 9, 0, 7); ctx.fill(); }
  // Nico: maglione blu con la stella
  const nx = W * 0.3, j = Math.abs(Math.sin(time * 10)) * 8;
  ctx.fillStyle = '#2f5fb5'; rr(nx - 13, base - 58 - j, 26, 46, 9); ctx.fill(); ctx.fillStyle = '#fff'; star(nx, base - 38 - j, 8);
  ctx.fillStyle = '#f2c9a0'; ctx.beginPath(); ctx.arc(nx, base - 70 - j, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(nx, base - 76 - j, 12, Math.PI, 0); ctx.fill(); ctx.fillRect(nx - 2, base - 92 - j, 4, 8);
  ctx.fillStyle = '#d6283b'; ctx.fillRect(nx - 11, base - 12 - j, 9, 12); ctx.fillRect(nx + 2, base - 12 - j, 9, 12);
  const a = clamp(endT / 0.6, 0, 1); ctx.globalAlpha = a; panel(W / 2 - 190, 150, 380, 120);
  text('Tutto il paese ride…', W / 2, 192, 26, '#b3172b'); text('…e finalmente ride anche Nico!', W / 2, 232, 22, '#1f3a7a'); ctx.globalAlpha = 1;
}
function drawCover() {
  ctx.fillStyle = '#0b1640'; ctx.fillRect(0, 0, W, H);
  if (ok(IMG.cop)) { const s = Math.max(W / 600, H / 960); const w = 600 * s, h = 960 * s; ctx.globalAlpha = 0.35; ctx.drawImage(IMG.cop, (W - w) / 2, (H - h) / 2, w, h); ctx.globalAlpha = 1;
    const s2 = Math.min(W / 600, (H * 0.62) / 960); const w2 = 600 * s2, h2 = 960 * s2; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.drawImage(IMG.cop, (W - w2) / 2, 18, w2, h2); ctx.restore(); }
}
function titleScreen() {
  drawCover(); updSnow(1 / 60, 0.5); drawSnow();
  const py = H * 0.55 - 10; panel(W / 2 - Math.min(210, W / 2 - 14), py, Math.min(420, W - 28), H - py - 12);
  text('Briciola vola!', W / 2, py + 40, 40, '#d6283b', 'center', 'bold', '#fff', 6);
  text('Un gioco di Natale', W / 2, py + 76, 17, '#1f3a7a', 'center', 'bold');
  text('dal libro di Antonino Campanella', W / 2, py + 98, 15, '#1f3a7a', 'center', 'normal');
  bigButton('14 capitoli', W / 2, py + 150, 240, () => { audioInit(); newGame(); });
  bigButton('Modalità infinita', W / 2, py + 215, 260, () => { audioInit(); startInfinite(); }, true, '#2f74b5');
  let ty = py + 270;
  if (FROM_LIBRO) { bigButton('Torna al libro', W / 2, ty, 240, () => { location.href = '../index.html#leggi'; }, false, '#2e8b47'); ty += 58; }
  if (bestInfinite > 0) { text('Record infinito: ' + bestInfinite + ' m', W / 2, ty, 14, '#c9781e'); ty += 22; }
  for (const l of wrap('Storia: 3 cuori. Infinito: 1 vita, ostacoli e bombe sempre di più. Raccogli i desideri per Babbo Natale!', Math.min(400, W - 28) - 50, 13)) {
    text(l, W / 2, ty, 13, '#444', 'center', 'normal'); ty += 17;
  }
  iconButton(W - 52, 14, 40, 'mute', () => setMuted(!muted));
}
function introScreen() {
  scene(); ctx.fillStyle = 'rgba(8,14,45,0.55)'; ctx.fillRect(0, 0, W, H);
  const pw = Math.min(420, W - 28), px = W / 2 - pw / 2, py = 70, ph = H - 140; panel(px, py, pw, ph);
  text(mode === 'infinite' ? 'Modalità infinita' : ('Capitolo ' + L.num + ' di 14'), W / 2, py + 40, 18, '#2e8b47');
  text(L.name, W / 2, py + 76, mode === 'infinite' ? 28 : 30, '#d6283b');
  const im = IMG[L.img]; if (ok(im)) { const iw = pw - 60, ih = iw * im.naturalHeight / im.naturalWidth; const h2 = Math.min(ih, 220), w2 = h2 * im.naturalWidth / im.naturalHeight; ctx.save(); rr(W / 2 - w2 / 2, py + 102, w2, h2, 14); ctx.clip(); ctx.drawImage(im, W / 2 - w2 / 2, py + 102, w2, h2); ctx.restore(); }
  const tip = mode === 'infinite'
    ? ('1 vita · bombe · antenne · desideri · sempre più difficile')
    : ('Livello ' + L.diff + '/14 · ' + maxHits() + ' cuori · ostacoli e desideri');
  text(tip, W / 2, py + 340, 14, '#2e8b47', 'center', 'bold');
  text('Parte da ' + L.base, W / 2, py + 362, 15, '#1f3a7a', 'center', 'bold');
  const lines = wrap(L.intro, pw - 60, 16); let y = py + 388;
  for (const l of lines) { text(l, W / 2, y, 16, '#2a2a3a', 'center', 'normal'); y += 22; }
  bigButton('Via!', W / 2, py + ph - 56, 200, () => { audioInit(); startTakeoff(); });
}
function drawTakeoffPad() {
  const py = padY();
  const w = Math.min(W * 0.62, 420), x = 40;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(x + 4, py + 6, w, 28, 10); ctx.fill();
  if (L.ground === 'molo') {
    ctx.fillStyle = '#6a7188'; rr(x, py, w, 26, 8); ctx.fill();
    ctx.fillStyle = '#8b93ab'; for (let i = 0; i < 8; i++) ctx.fillRect(x + 10 + i * (w / 8), py + 4, 3, 18);
  } else if (L.theme === 'pasticceria') {
    ctx.fillStyle = '#c9a07a'; rr(x, py, w, 26, 8); ctx.fill();
    ctx.fillStyle = '#fff8e8'; rr(x + 8, py - 10, w - 16, 14, 6); ctx.fill();
  } else if (L.theme === 'presepe') {
    ctx.fillStyle = '#8b6a3f'; rr(x, py, w, 26, 8); ctx.fill();
    ctx.fillStyle = '#d6283b'; ctx.fillRect(x + w - 40, py - 24, 8, 24);
  } else {
    ctx.fillStyle = L.mode === 'night' ? '#3a4a7a' : '#e8dfd0'; rr(x, py, w, 26, 8); ctx.fill();
  }
  text(L.base, x + w / 2, py + 40, 14, '#fff', 'center', 'bold', 'rgba(10,20,60,0.65)', 4);
}
function takeoffScreen() {
  scene();
  drawTakeoffPad();
  drawBri(bri.x, bri.y, bri.ang, false, bri.s || 0.48);
  drawParticles();
  const line = takeoffPhase === 'ready' ? ('Pronto su ' + L.base)
    : takeoffPhase === 'run' ? L.runLine
    : L.liftLine;
  ctx.fillStyle = 'rgba(8,14,45,0.45)'; rr(24, 36, W - 48, 78, 16); ctx.fill();
  text('Capitolo ' + L.num + ' · Decollo', W / 2, 58, 16, '#7dffb0');
  for (const l of wrap(line, W - 80, 18)) text(l, W / 2, 88, 18, '#fff', 'center', 'bold');
}
function letterPayload() {
  const Ltr = overlay && overlay.L;
  if (Ltr && typeof Ltr === 'object' && (Ltr.body || Ltr.from)) return Ltr;
  return DESIDERI[Math.floor(Math.random() * DESIDERI.length)];
}
function letterOverlay() {
  const letter = letterPayload();
  softBackdrop(0.58);
  const pw = Math.min(400, W - 28), px = W / 2 - pw / 2, py = 140, ph = 470;
  panel(px, py, pw, ph);
  text('Hai trovato una lettera!', W / 2, py + 44, 24, '#b3172b');
  text(letter.from || 'Una lettera', W / 2, py + 82, 15, '#7a6440', 'center', 'normal');
  let y = py + 125;
  for (const l of wrap(String(letter.body || ''), pw - 60, 19, 'italic')) {
    text(l, W / 2, y, 19, '#3b2f1e', 'center', 'italic'); y += 28;
  }
  text('+100 ★', W / 2, py + ph - 118, 22, '#c9781e');
  bigButton('Continua a volare', W / 2, py + ph - 56, 250, () => { overlay = null; bri.vy = -250; sparkBurst = 0.35; });
}
function wishOverlay() {
  const letter = letterPayload();
  softBackdrop(0.58);
  const pw = Math.min(420, W - 28), px = W / 2 - pw / 2, py = 130, ph = 480;
  panel(px, py, pw, ph, 'wish');
  text('Desiderio per Babbo Natale', W / 2, py + 46, 22, '#d6283b');
  text(letter.from || 'Un bambino', W / 2, py + 84, 16, '#7a6440', 'center', 'normal');
  let y = py + 128;
  for (const l of wrap(String(letter.body || ''), pw - 56, 19, 'italic')) {
    text(l, W / 2, y, 19, '#3b2f1e', 'center', 'italic'); y += 28;
  }
  text('✦ +80 ★  ·  che bello!', W / 2, py + ph - 118, 18, '#c9781e');
  bigButton('Continua a volare', W / 2, py + ph - 56, 260, () => { overlay = null; bri.vy = -260; sparkBurst = 0.4; });
}
function winOverlay() {
  softBackdrop(0.58);
  const pw = Math.min(420, W - 28), px = W / 2 - pw / 2, py = 100, ph = 540;
  panel(px, py, pw, ph, 'wish');
  text('Atterraggio perfetto!', W / 2, py + 48, 30, '#d6283b');
  text(L.name, W / 2, py + 86, 18, '#2e8b47');
  text('★ ' + score, W / 2, py + 128, 30, '#c9781e');
  let y = py + 170;
  for (const l of wrap(winLine || pickLine(L.winLines), pw - 56, 19, 'italic')) {
    text(l, W / 2, y, 19, '#3b2f1e', 'center', 'italic'); y += 28;
  }
  y += 8;
  if (L.quote) for (const l of wrap(L.quote, pw - 60, 15, 'italic')) { text(l, W / 2, y, 15, '#7a6440', 'center', 'italic'); y += 22; }
  const left = Math.max(0, maxHits() - hits);
  for (let i = 0; i < maxHits(); i++) drawHeart(W / 2 - (maxHits() - 1) * 16 + i * 32, py + ph - 168, i < left, 1.15);
  text('Cuori rimasti: ' + left + '/' + maxHits(), W / 2, py + ph - 132, 15, '#1f3a7a');
  if (L.last) {
    bigButton('Guarda il finale', W / 2, py + ph - 56, 260, () => { overlay = null; state = 'ending'; finale = { t: 0 }; SFX.fanfare(); });
  } else {
    // si resta sempre nel game: prossimo volo è l’azione principale
    bigButton('Prossimo volo', W / 2, py + ph - 56, 250, () => { startIntro(LI + 1); });
  }
}
function failOverlay() {
  softBackdrop(0.66);
  const pw = Math.min(420, W - 28), px = W / 2 - pw / 2, py = 130, ph = 480;
  panel(px, py, pw, ph);
  text('Oh no…', W / 2, py + 46, 34, '#d6283b');
  text(mode === 'infinite' ? 'Volo infinito' : L.name, W / 2, py + 88, 17, '#2e8b47');
  // cuori vuoti: si è perso, ma si resta nel gioco
  for (let i = 0; i < maxHits(); i++) drawHeart(W / 2 - (maxHits() - 1) * 16 + i * 32, py + 128, false, 1.2);
  let y = py + 170;
  for (const l of wrap(failLine || pickLine(L.failLines), pw - 56, 19, 'italic')) {
    text(l, W / 2, y, 19, '#3b2f1e', 'center', 'italic'); y += 28;
  }
  if (mode === 'infinite') {
    text('Hai volato ' + Math.floor(dist) + ' m · record ' + bestInfinite + ' m', W / 2, py + ph - 168, 15, '#c9781e');
  }
  text('Ce la puoi fare. Briciola ci crede.', W / 2, py + ph - 150, 16, '#1f3a7a');
  // Niente uscita dal game: solo riprova / menu interno
  bigButton('Riprova il volo', W / 2, py + ph - 88, 270, () => {
    overlay = null;
    buildLevel();
    startTakeoff();
  });
  bigButton('Menu del gioco', W / 2, py + ph - 28, 240, () => {
    overlay = null; endPhase = null; state = 'title';
  }, false, '#2f74b5');
}
function endingScreen() {
  // notte, slitta che si allontana, neve di zucchero a velo
  L = LEVELS[12]; sky(); farLayer(); nearLayer();
  ctx.save(); const s = Math.min(0.5, W / 900);
  const span = W + 720 * s + 40, fx = W + 20 - ((finale.t * 80) % span), fy = 50 + Math.sin(finale.t * 1.3) * 10;
  if (ok(IMG.sli)) ctx.drawImage(IMG.sli, fx, fy, 720 * s, 239 * s);
  ctx.translate(fx + 405 * s, fy + 166 * s); ctx.scale(-1, 1); if (ok(IMG.bri)) { const bw = 240 * s * 0.6, bh = 212 * s * 0.6; ctx.drawImage(IMG.bri, -bw / 2, -bh / 2, bw, bh); }
  ctx.restore();
  drawSnow();
  const pw = Math.min(420, W - 28), px = W / 2 - pw / 2, py = 205, ph = 530; panel(px, py, pw, ph);
  text('Ce l’hai fatta!', W / 2, py + 48, 36, '#d6283b');
  const l1 = wrap('Hai volato per tutti i 14 capitoli! Briciola è tornata al suo posto, l’ultimo a sinistra, e su Torre Pinella nevica zucchero a velo.', pw - 60, 18);
  let y = py + 94; for (const l of l1) { text(l, W / 2, y, 18, '#1f3a7a', 'center', 'normal'); y += 25; }
  text('★ ' + score + ' punti', W / 2, y + 22, 30, '#c9781e'); y += 60;
  text('Risate: ' + risate + '   Cartellate: ' + cart + '   Lettere: ' + lettere + '/3', W / 2, y, 16, '#333', 'center', 'normal'); y += 40;
  const aug = wrap('Buon Natale! Ogni volta che ridi, da qualche parte, un sonaglio fa tin. E stanotte, all’ultimo posto a sinistra, una piccola luce azzurra ti saluta.', pw - 60, 18, 'italic');
  for (const l of aug) { text(l, W / 2, y, 18, '#3b2f1e', 'center', 'italic'); y += 25; }
  text('— Antonino Campanella', W / 2, y + 10, 16, '#7a6440', 'center', 'normal');
  if (FROM_LIBRO) {
    bigButton('Torna agli auguri', W / 2, py + ph - 100, 260, () => {
      try { if (parent && parent !== window) { parent.location.hash = 'auguri'; return; } } catch (_) {}
      location.href = '../index.html#auguri';
    });
    bigButton('Ricomincia', W / 2, py + ph - 48, 230, () => { newGame(); });
  } else {
    bigButton('Ricomincia', W / 2, py + ph - 52, 230, () => { newGame(); });
  }
  text('dal libro «Aiuto, è caduta una renna!»', W / 2, H - 34, 15, '#e8eeff', 'center', 'normal');
  iconButton(W - 52, 14, 40, 'mute', () => setMuted(!muted));
}

// ---------- ciclo ----------
let last = performance.now();
function frame(now) {
  let dt = Math.min(0.05, (now - last) / 1000); last = now; dt *= timeScale;
  buttons = [];
  ctx.setTransform(SC * DPR, 0, 0, SC * DPR, 0, 0);
  if (state === 'loading') {
    ctx.fillStyle = '#0b1640'; ctx.fillRect(0, 0, W, H); text('Briciola sta arrivando… ' + Math.round(loaded / total * 100) + '%', W / 2, H / 2, 22);
    if (loaded >= total) {
      if (LEVEL_Q != null) {
        score = 0; risate = 0; cart = 0; lettere = 0; bell = 0; combo = 0;
        startIntro(LEVEL_Q);
      } else state = 'title';
    }
  } else if (state === 'title') { time += dt; titleScreen(); }
  else if (state === 'intro') { time += dt; introScreen(); }
  else if (state === 'takeoff') {
    let t = dt; while (t > 0) { const s = Math.min(t, 1 / 60); update(s); t -= s; }
    takeoffScreen();
  } else if (state === 'play') {
    // passi fissi per stabilità
    let t = dt; while (t > 0) { const s = Math.min(t, 1 / 60); update(s); t -= s; }
    scene();
    if (endPhase === 'land') drawTakeoffPad();
    hud();
    if (hintT < 3.5 && LI === 0 && !overlay && !endPhase) {
      ctx.globalAlpha = clamp(3.5 - hintT, 0, 1);
      text('Tocca per fare «hic!» e volare', W / 2, H * 0.5, 24, '#fff', 'center', 'bold', 'rgba(10,20,60,0.8)', 5);
      ctx.globalAlpha = 1;
    }
    if (endPhase === 'sleigh') text('Vola all’ultimo posto a sinistra!', W / 2, 140, 22, '#fff', 'center', 'bold', 'rgba(10,20,60,0.8)', 5);
    if (endPhase === 'land' && !overlay) text('Atterraggio…', W / 2, 130, 22, '#fff', 'center', 'bold', 'rgba(10,20,60,0.75)', 5);
    if (overlay && (overlay.type === 'letter' || overlay.type === 'wish')) {
      if (overlay.type === 'wish') wishOverlay();
      else letterOverlay();
    }
    if (overlay && overlay.type === 'win') winOverlay();
    if (overlay && overlay.type === 'fail') failOverlay();
  } else if (state === 'ending') { let t = dt; while (t > 0) { const s = Math.min(t, 1 / 60); update(s); t -= s; } endingScreen(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if (TEST) window.__BV = {
  get: () => ({ state, level: LI, endPhase, overlay: overlay && overlay.type, score, risate, cart, lettere, bell, y: bri && bri.y, vy: bri && bri.vy, dist, len: L && L.len, W, H }),
  tap: () => press(-1, -1), primary: () => primary(), speed: k => { timeScale = k; },
  safe: () => bri ? safeYAt(dist + bri.x + 120) : 0
};
})();
