/* Tin! — pentagramma orchestrale: melodia riconoscibile + colpi sulla linea d'oro.
   Solo brani di pubblico dominio (classici, Natale, filastrocche italiane). */
(() => {
  'use strict';

  // [midi, beats] — temi riconoscibili, dominio pubblico
  const SONGS = [
    // Natale
    {
      id: 'jingle', title: 'Jingle Bells', composer: 'J. L. Pierpont', cat: 'Natale', key: 'C', bpm: 128,
      notes: [
        [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,0.5],[64,4],
        [65,1],[65,1],[65,1.5],[65,0.5],[65,1],[64,1],[64,1],[64,0.5],[64,0.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2],
        [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,0.5],[64,4],
        [65,1],[65,1],[65,1.5],[65,0.5],[65,1],[64,1],[64,1],[64,0.5],[64,0.5],[67,1],[67,1],[65,1],[62,1],[60,4],
      ],
    },
    {
      id: 'silent', title: 'Astro del ciel', composer: 'Gruber / Mohr', cat: 'Natale', key: 'C', bpm: 72,
      notes: [
        [67,3],[69,1],[67,2],[64,4],[67,3],[69,1],[67,2],[64,4],
        [74,4],[72,4],[71,4],[69,4],[72,3],[71,1],[69,2],[67,4],[64,4],
        [67,3],[69,1],[67,2],[64,4],[67,3],[69,1],[67,2],[64,4],
        [74,4],[72,4],[71,4],[69,4],[72,3],[71,1],[69,2],[67,4],[64,4],
      ],
    },
    {
      id: 'deck', title: 'Deck the Halls', composer: 'Tradizionale gallese', cat: 'Natale', key: 'F', bpm: 122,
      notes: [
        [69,1.5],[67,0.5],[65,1],[64,1],[62,1],[60,1],[62,1],[64,1],[65,1],[62,1],[64,1.5],[65,0.5],[67,2],
        [69,1.5],[67,0.5],[65,1],[64,1],[62,1],[60,1],[62,1],[64,1],[65,1],[62,1],[60,2],
        [62,1],[62,1],[64,1],[65,1],[62,1],[64,1],[65,1],[67,1],[69,1.5],[67,0.5],[65,1],[64,1],[62,1],[60,1],[62,1],[64,1],[65,1],[62,1],[60,2],
      ],
    },
    {
      id: 'wish', title: 'We Wish You a Merry Christmas', composer: 'Tradizionale inglese', cat: 'Natale', key: 'G', bpm: 112,
      notes: [
        [67,1],[72,1],[72,0.5],[74,0.5],[72,0.5],[71,0.5],[69,1],[69,1],[69,1],[74,1],[74,0.5],[76,0.5],[74,0.5],[72,0.5],[71,1],[67,1],
        [67,1],[76,1],[76,0.5],[77,0.5],[76,0.5],[74,0.5],[72,1],[69,1],[67,0.5],[67,0.5],[69,1],[74,1],[71,1],[72,2],
      ],
    },
    {
      id: 'tannen', title: 'O Tannenbaum', composer: 'Tradizionale tedesco', cat: 'Natale', key: 'F', bpm: 92,
      notes: [
        [67,1],[72,1.5],[72,0.5],[72,1],[74,1],[76,1.5],[76,0.5],[76,2],[76,0.5],[74,0.5],[72,1],[74,0.5],[76,0.5],[72,1],[71,1],[69,1],[69,1],
        [69,1],[74,1.5],[71,0.5],[67,1],[72,1],[76,1.5],[76,0.5],[76,2],[76,0.5],[74,0.5],[72,1],[74,0.5],[76,0.5],[72,1],[71,1],[69,1],[67,2],
      ],
    },
    {
      id: 'noel', title: 'The First Noel', composer: 'Tradizionale', cat: 'Natale', key: 'D', bpm: 88,
      notes: [
        [64,1],[67,1],[67,0.5],[69,0.5],[71,1],[72,1],[74,1],[72,1],[71,1],[69,1],[67,2],
        [64,1],[67,1],[67,0.5],[69,0.5],[71,1],[72,1],[74,1],[72,1],[71,1],[69,1],[67,2],
        [72,1],[71,1],[69,1],[67,1],[69,1],[71,1],[72,1],[67,1],[64,1],[67,1],[69,2],
        [72,1],[71,1],[69,1],[67,1],[69,1],[71,1],[72,1],[67,1],[64,1],[67,1],[67,2],
      ],
    },
    {
      id: 'bells2', title: 'Carol of the Bells', composer: 'Leontovych', cat: 'Natale', key: 'G', bpm: 138,
      notes: [
        [71,1],[69,1],[71,1],[64,2],[71,1],[69,1],[71,1],[64,2],[71,1],[69,1],[71,1],[64,1],[67,1],[65,1],[64,1],[62,2],
        [71,1],[69,1],[71,1],[64,2],[71,1],[69,1],[71,1],[64,2],[72,1],[71,1],[69,1],[67,1],[69,1],[67,1],[65,1],[64,2],
      ],
    },
    // Classici
    {
      id: 'ode', title: 'Inno alla gioia', composer: 'L. van Beethoven', cat: 'Classica', key: 'C', bpm: 108,
      notes: [
        [64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[64,1.5],[62,0.5],[62,2],
        [64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,0.5],[60,2],
        [62,1],[62,1],[64,1],[60,1],[62,1],[64,0.5],[65,0.5],[64,1],[60,1],[62,1],[64,0.5],[65,0.5],[64,1],[62,1],[60,1],[62,1],[67,2],
        [64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,0.5],[60,2],
      ],
    },
    {
      id: 'elise', title: 'Für Elise', composer: 'L. van Beethoven', cat: 'Classica', key: 'A', bpm: 100,
      notes: [
        [76,0.5],[75,0.5],[76,0.5],[75,0.5],[76,0.5],[71,0.5],[74,0.5],[72,0.5],[69,2],
        [60,0.5],[64,0.5],[69,0.5],[71,2],[64,0.5],[68,0.5],[71,0.5],[72,2],
        [64,0.5],[76,0.5],[75,0.5],[76,0.5],[75,0.5],[76,0.5],[71,0.5],[74,0.5],[72,0.5],[69,2],
        [60,0.5],[64,0.5],[69,0.5],[71,2],[64,0.5],[72,0.5],[71,0.5],[69,2],
      ],
    },
    {
      id: 'twinkle', title: 'Twinkle Twinkle / Stella', composer: 'W. A. Mozart', cat: 'Classica', key: 'C', bpm: 100,
      notes: [
        [60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2],
        [67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2],[67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2],
        [60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2],
      ],
    },
    {
      id: 'nacht', title: 'Eine kleine Nachtmusik', composer: 'W. A. Mozart', cat: 'Classica', key: 'G', bpm: 120,
      notes: [
        [67,1.5],[62,0.5],[62,1],[62,1],[67,1.5],[62,0.5],[62,1],[62,1],
        [67,1],[69,1],[71,1],[72,1],[74,3],[67,1],[76,1.5],[74,0.5],[72,1],[71,1],[69,1.5],[67,0.5],[66,1],[67,1],[69,2],
        [67,1.5],[62,0.5],[62,1],[62,1],[67,1.5],[62,0.5],[62,1],[62,1],
        [67,1],[69,1],[71,1],[72,1],[74,2],[62,1],[67,1],[69,1],[71,1],[72,1],[74,4],
      ],
    },
    {
      id: 'minuet', title: 'Minuetto in Sol', composer: 'Bach / Petzold', cat: 'Classica', key: 'G', bpm: 104,
      notes: [
        [74,2],[71,1],[72,1],[74,2],[71,1],[72,1],[74,1],[72,1],[71,1],[69,1],[67,2],[67,1],[69,1],
        [71,2],[69,1],[71,1],[72,2],[71,1],[69,1],[67,1],[71,1],[69,1],[67,1],[66,2],[62,2],
        [74,2],[71,1],[72,1],[74,2],[71,1],[72,1],[74,1],[72,1],[71,1],[69,1],[67,2],[67,1],[69,1],
        [71,2],[69,1],[67,1],[66,1],[67,1],[69,1],[66,1],[62,1],[67,4],
      ],
    },
    {
      id: 'canon', title: 'Canone in Re', composer: 'J. Pachelbel', cat: 'Classica', key: 'D', bpm: 84,
      notes: [
        [69,2],[66,2],[67,2],[64,2],[65,2],[62,2],[65,2],[66,2],
        [69,2],[66,2],[67,2],[64,2],[65,2],[62,2],[65,2],[66,2],
        [74,1],[73,1],[74,1],[66,1],[67,1],[74,1],[72,1],[71,1],[69,1],[72,1],[71,1],[69,1],[67,1],[64,1],[67,1],[69,1],
        [66,1],[62,1],[66,1],[69,1],[74,2],[73,2],[74,4],
      ],
    },
    {
      id: 'brahms', title: 'Ninna nanna', composer: 'J. Brahms', cat: 'Classica', key: 'C', bpm: 76,
      notes: [
        [67,1],[67,1.5],[69,0.5],[67,1],[64,2],[67,1],[67,1.5],[69,0.5],[67,1],[64,2],
        [72,1],[71,1],[69,1],[72,1],[71,1],[69,1],[67,1],[64,1],[62,1],[60,1],[62,1],[64,2],
        [67,1],[67,1.5],[69,0.5],[67,1],[64,2],[67,1],[67,1.5],[69,0.5],[67,1],[64,2],
        [72,1],[71,1],[69,1],[72,1],[71,1],[69,1],[67,1],[62,1],[64,1],[62,1],[60,4],
      ],
    },
    {
      id: 'vivaldi', title: 'La Primavera', composer: 'A. Vivaldi', cat: 'Classica', key: 'E', bpm: 116,
      notes: [
        [76,1],[76,0.5],[74,0.5],[72,1],[71,1],[72,1],[74,1],[76,1],[76,0.5],[74,0.5],[72,1],[71,1],[72,2],
        [71,1],[71,0.5],[69,0.5],[67,1],[66,1],[67,1],[69,1],[71,1],[71,0.5],[69,0.5],[67,1],[66,1],[67,2],
        [76,1],[76,0.5],[74,0.5],[72,1],[71,1],[72,1],[74,1],[76,1],[79,1],[76,1],[72,1],[76,1],[74,2],
      ],
    },
    {
      id: 'danube', title: 'Sul bel Danubio blu', composer: 'J. Strauss II', cat: 'Classica', key: 'D', bpm: 96,
      notes: [
        [66,2],[69,2],[73,2],[78,4],[76,1],[74,1],[73,2],[71,2],[69,4],
        [66,2],[69,2],[73,2],[78,4],[76,1],[74,1],[73,1],[71,1],[69,1],[68,1],[69,4],
        [71,2],[74,2],[78,2],[81,4],[79,1],[78,1],[76,2],[74,2],[73,4],
      ],
    },
    {
      id: 'tell', title: 'Guglielmo Tell (galop)', composer: 'G. Rossini', cat: 'Classica', key: 'C', bpm: 148,
      notes: [
        [60,0.5],[60,0.5],[67,0.5],[67,0.5],[69,0.5],[69,0.5],[67,1],[65,0.5],[65,0.5],[64,0.5],[64,0.5],[62,0.5],[62,0.5],[60,1],
        [60,0.5],[60,0.5],[67,0.5],[67,0.5],[69,0.5],[69,0.5],[67,1],[65,0.5],[65,0.5],[64,0.5],[64,0.5],[62,0.5],[62,0.5],[60,1],
        [67,0.5],[67,0.5],[65,0.5],[65,0.5],[64,0.5],[64,0.5],[62,1],[67,0.5],[67,0.5],[65,0.5],[65,0.5],[64,0.5],[64,0.5],[62,1],
        [60,0.5],[60,0.5],[67,0.5],[67,0.5],[69,0.5],[69,0.5],[67,1],[72,1],[67,1],[60,2],
      ],
    },
    // Filastrocche italiane (tradizionali)
    {
      id: 'framartino', title: 'Fra Martino', composer: 'Tradizionale', cat: 'Filastrocca', key: 'C', bpm: 108,
      notes: [
        [60,1],[62,1],[64,1],[60,1],[60,1],[62,1],[64,1],[60,1],
        [64,1],[65,1],[67,2],[64,1],[65,1],[67,2],
        [67,0.5],[69,0.5],[67,0.5],[65,0.5],[64,1],[60,1],[67,0.5],[69,0.5],[67,0.5],[65,0.5],[64,1],[60,1],
        [60,1],[55,1],[60,2],[60,1],[55,1],[60,2],
      ],
    },
    {
      id: 'girotondo', title: 'Giro giro tondo', composer: 'Tradizionale italiano', cat: 'Filastrocca', key: 'C', bpm: 112,
      notes: [
        [60,1],[60,1],[60,1],[62,1],[64,2],[62,2],[60,1],[64,1],[62,1],[60,1],[55,2],[55,2],
        [60,1],[60,1],[60,1],[62,1],[64,2],[62,2],[60,1],[64,1],[62,1],[55,1],[60,4],
      ],
    },
    {
      id: 'lavanderina', title: 'La bella lavanderina', composer: 'Tradizionale italiano', cat: 'Filastrocca', key: 'F', bpm: 118,
      notes: [
        [65,1],[65,1],[65,1],[67,1],[69,2],[65,2],[67,1],[67,1],[67,1],[69,1],[70,2],[67,2],
        [65,1],[65,1],[65,1],[67,1],[69,2],[65,2],[64,1],[65,1],[67,1],[64,1],[60,4],
      ],
    },
    {
      id: 'stellina', title: 'Stella stellina', composer: 'Tradizionale italiano', cat: 'Filastrocca', key: 'C', bpm: 80,
      notes: [
        [67,2],[64,2],[67,2],[64,2],[65,1],[65,1],[64,1],[62,1],[60,4],
        [67,2],[64,2],[67,2],[64,2],[65,1],[65,1],[64,1],[62,1],[60,4],
        [62,2],[62,2],[64,2],[60,2],[62,1],[62,1],[64,1],[65,1],[67,4],
        [67,2],[64,2],[67,2],[64,2],[65,1],[65,1],[64,1],[62,1],[60,4],
      ],
    },
    {
      id: 'ponte', title: 'Sul ponte di Avignone', composer: 'Tradizionale', cat: 'Filastrocca', key: 'G', bpm: 112,
      notes: [
        [67,1],[67,1],[69,1],[67,1],[71,1],[69,1],[67,2],[65,1],[65,1],[64,1],[62,1],[60,4],
        [67,1],[67,1],[69,1],[67,1],[71,1],[69,1],[67,2],[65,1],[64,1],[62,1],[60,1],[55,4],
      ],
    },
    {
      id: 'cuccu', title: 'Cucù sing', composer: 'Tradizionale', cat: 'Filastrocca', key: 'C', bpm: 100,
      notes: [
        [67,1],[64,1],[67,1],[64,1],[65,1],[62,1],[60,2],[67,1],[64,1],[67,1],[64,1],[65,1],[62,1],[60,2],
        [72,1],[71,1],[69,1],[67,1],[65,1],[64,1],[62,2],[60,1],[62,1],[64,1],[65,1],[67,4],
      ],
    },
    {
      id: 'batti', title: 'Batti batti le manine', composer: 'Tradizionale italiano', cat: 'Filastrocca', key: 'C', bpm: 108,
      notes: [
        [60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2],
        [67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2],[67,1],[67,1],[65,1],[65,1],[64,1],[64,1],[62,2],
        [60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2],
      ],
    },
  ];

  const HIT_X = 0.22;
  const PERFECT = 28;
  const GOOD = 54;
  const KEY_ROOT = { C: 60, G: 67, F: 65, D: 62, A: 69, E: 64 };

  let ac = null;
  let master = null;
  let open = false;
  let raf = 0;
  let songIndex = -1;
  let lastSongId = null;
  let currentSong = null;
  let notes = [];
  let score = 0;
  let combo = 0;
  let perfects = 0;
  let goods = 0;
  let misses = 0;
  let songTitle = '';
  let songMeta = '';
  let scrollSpeed = 180;
  let started = false;
  let finished = false;
  let msg = '';
  let msgT = 0;
  let particles = [];
  let beatAcc = 0;
  let chordStep = 0;
  let ambient = null;

  const overlay = () => document.getElementById('tin-overlay');
  const canvas = () => document.getElementById('tin-canvas');
  const helpEl = () => document.querySelector('.tin-help');
  const titleEl = () => document.getElementById('tin-title');

  function ensureAC() {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ac = new A();
      master = ac.createGain();
      master.gain.value = 0.9;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function freq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function envGain(g, t0, attack, peak, dur, release = 0.12) {
    g.gain.cancelScheduledValues(t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * 0.55), t0 + Math.max(attack + 0.02, dur * 0.45));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
  }

  /** Orchestra: piano + archi + basso + campanella — melodia riconoscibile */
  function playOrchestra(midi, beats = 1, accent = false) {
    const ctx = ensureAC();
    if (!ctx || !master) return;
    const t0 = ctx.currentTime;
    const dur = Math.max(0.22, Math.min(1.8, beats * (60 / (currentSong?.bpm || 100)) * 0.92));
    const f = freq(midi);
    const bus = ctx.createGain();
    bus.gain.value = accent ? 1 : 0.72;
    bus.connect(master);

    // piano (fondamentale + ottava soft)
    const piano = ctx.createGain();
    envGain(piano, t0, 0.012, accent ? 0.22 : 0.14, dur, 0.2);
    piano.connect(bus);
    const p1 = ctx.createOscillator();
    p1.type = 'triangle';
    p1.frequency.value = f;
    const p2 = ctx.createOscillator();
    p2.type = 'sine';
    p2.frequency.value = f * 2;
    const p2g = ctx.createGain();
    p2g.gain.value = 0.22;
    p1.connect(piano);
    p2.connect(p2g);
    p2g.connect(piano);
    p1.start(t0); p2.start(t0);
    p1.stop(t0 + dur + 0.25); p2.stop(t0 + dur + 0.25);

    // archi (pad lento)
    const strings = ctx.createGain();
    envGain(strings, t0, 0.08, accent ? 0.09 : 0.07, dur + 0.15, 0.35);
    strings.connect(bus);
    const s1 = ctx.createOscillator();
    s1.type = 'sawtooth';
    s1.frequency.value = f;
    const sFilter = ctx.createBiquadFilter();
    sFilter.type = 'lowpass';
    sFilter.frequency.value = 1200;
    sFilter.Q.value = 0.6;
    const sSoft = ctx.createGain();
    sSoft.gain.value = 0.12;
    s1.connect(sFilter);
    sFilter.connect(sSoft);
    sSoft.connect(strings);
    s1.start(t0); s1.stop(t0 + dur + 0.4);

    // flauto / legno dolce
    const wood = ctx.createGain();
    envGain(wood, t0, 0.03, accent ? 0.08 : 0.05, dur * 0.9, 0.15);
    wood.connect(bus);
    const w1 = ctx.createOscillator();
    w1.type = 'sine';
    w1.frequency.value = f * 1.003;
    w1.connect(wood);
    w1.start(t0); w1.stop(t0 + dur + 0.2);

    // basso (un'ottava sotto, corto)
    if (!accent || beats >= 1) {
      const bass = ctx.createGain();
      envGain(bass, t0, 0.02, 0.08, Math.min(dur, 0.55), 0.12);
      bass.connect(bus);
      const b1 = ctx.createOscillator();
      b1.type = 'sine';
      b1.frequency.value = f / 2;
      b1.connect(bass);
      b1.start(t0); b1.stop(t0 + 0.7);
    }

    // campanella solo sull'accento del giocatore
    if (accent) {
      const bell = ctx.createGain();
      envGain(bell, t0, 0.005, 0.16, 0.55, 0.35);
      bell.connect(bus);
      [1, 2.01, 3.01, 4.04].forEach((mul, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * mul;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 1 : 0.18 / i;
        o.connect(g); g.connect(bell);
        o.start(t0); o.stop(t0 + 0.7);
      });
    }
  }

  function playChordPad() {
    const ctx = ensureAC();
    if (!ctx || !master || !currentSong) return;
    const root = KEY_ROOT[currentSong.key] || 60;
    const triad = [root, root + 4, root + 7].map((m) => (m > 72 ? m - 12 : m));
    const t0 = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.value = 0.55;
    bus.connect(master);
    triad.forEach((midi, i) => {
      const g = ctx.createGain();
      envGain(g, t0, 0.12, 0.045 - i * 0.008, 1.4, 0.5);
      g.connect(bus);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq(midi - 12);
      o.connect(g);
      o.start(t0); o.stop(t0 + 2);
    });
  }

  function startAmbientHall() {
    stopAmbientHall();
    const ctx = ensureAC();
    if (!ctx || !master) return;
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.value = 0.012;
    noise.connect(filter);
    filter.connect(g);
    g.connect(master);
    noise.start();
    ambient = { noise, g };
  }

  function stopAmbientHall() {
    if (!ambient) return;
    try { ambient.noise.stop(); } catch (_) {}
    ambient = null;
  }

  function midiToStaffY(midi, H) {
    const top = H * 0.30;
    const lineGap = H * 0.052;
    const ref = 64;
    const steps = midi - ref;
    return top + 2.2 * lineGap - steps * (lineGap * 0.42);
  }

  function pickSong() {
    const pool = SONGS.filter((s) => s.id !== lastSongId);
    const song = pool[Math.floor(Math.random() * pool.length)];
    lastSongId = song.id;
    return song;
  }

  function loadSong(song) {
    currentSong = song;
    const cv = canvas();
    const W = cv.width;
    const H = cv.height;
    const beatPx = Math.max(64, W * 0.078);
    let x = W * 0.58;
    notes = [];
    song.notes.forEach(([midi, beats]) => {
      notes.push({
        midi,
        x,
        y: midiToStaffY(midi, H),
        beats,
        hit: false,
        miss: false,
        played: false,
        judged: false,
        autoPlayed: false,
      });
      x += beats * beatPx;
    });
    scrollSpeed = (song.bpm / 60) * beatPx * 0.9;
    songTitle = song.title;
    songMeta = `${song.composer} · ${song.cat}`;
    score = 0;
    combo = 0;
    perfects = 0;
    goods = 0;
    misses = 0;
    started = false;
    finished = false;
    beatAcc = 0;
    chordStep = 0;
    msg = 'Ascolta l’orchestra e clicca sulla linea d’oro';
    msgT = 2.8;
    particles = [];
    if (titleEl()) titleEl().textContent = `Tin! · ${song.title}`;
    if (helpEl()) {
      helpEl().innerHTML = `<strong>${song.title}</strong> — ${song.composer} (${song.cat}). L’orchestra suona sempre la melodia: tu la “conduci” cliccando le note sulla <strong>linea d’oro</strong> (o Spazio).`;
    }
  }

  function spawnSpark(x, y, ok) {
    for (let i = 0; i < (ok ? 14 : 5); i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 180,
        vy: -50 - Math.random() * 140,
        life: 0.55 + Math.random() * 0.45,
        t: 0,
        c: ok ? (Math.random() > 0.5 ? '#ffe08a' : '#fff6d0') : '#ff9a9a',
        r: 2 + Math.random() * 3,
      });
    }
  }

  function markHit(best, perfect) {
    best.judged = true;
    best.hit = true;
    best.played = true;
    if (!best.autoPlayed) {
      best.autoPlayed = true;
      playOrchestra(best.midi, best.beats, false);
    }
    playOrchestra(best.midi, Math.max(0.6, best.beats), true);
    if (perfect) {
      score += 100 + combo * 8;
      combo += 1;
      perfects += 1;
      msg = combo > 3 ? `Bravissimo! x${combo}` : 'Perfetto!';
    } else {
      score += 40;
      combo = 0;
      goods += 1;
      msg = 'Bene!';
    }
    msgT = 0.7;
    spawnSpark(best.x, best.y, true);
  }

  function judgeAt() {
    const cv = canvas();
    const hitLine = cv.width * HIT_X;
    let best = null;
    let bestDist = 1e9;
    notes.forEach((n) => {
      if (n.judged) return;
      const d = Math.abs(n.x - hitLine);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    });
    if (!best || bestDist > GOOD) {
      msg = '…';
      msgT = 0.3;
      return;
    }
    markHit(best, bestDist <= PERFECT);
  }

  function clickNote(mx, my) {
    const cv = canvas();
    const hitLine = cv.width * HIT_X;
    let best = null;
    let bestScore = 1e9;
    notes.forEach((n) => {
      if (n.judged) return;
      const dist = Math.hypot(n.x - mx, n.y - my);
      if (dist < 46 && dist < bestScore) {
        bestScore = dist;
        best = n;
      }
    });
    if (best) {
      const d = Math.abs(best.x - hitLine);
      if (d <= GOOD) markHit(best, d <= PERFECT);
      else {
        best.judged = true;
        best.miss = true;
        combo = 0;
        misses += 1;
        msg = 'Fuori tempo';
        msgT = 0.55;
        spawnSpark(best.x, best.y, false);
      }
      return;
    }
    judgeAt();
  }

  function drawNoteHead(ctx, n, r, gap, hx) {
    ctx.save();
    if (n.miss) ctx.globalAlpha = 0.32;
    else if (n.hit) ctx.globalAlpha = 0.5;
    ctx.strokeStyle = n.hit ? '#8fd6a8' : '#f4f7ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(n.x + r * 0.9, n.y);
    ctx.lineTo(n.x + r * 0.9, n.y - gap * 2.35);
    ctx.stroke();
    if (n.beats >= 2) {
      // semibreve-ish open head
      ctx.strokeStyle = n.hit ? '#8fd6a8' : '#ffe08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, r * 1.2, r * 0.88, -0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = n.hit ? 'rgba(63,174,106,0.25)' : 'rgba(230,193,90,0.2)';
      ctx.fill();
    } else {
      const grd = ctx.createRadialGradient(n.x - 3, n.y - 3, 2, n.x, n.y, r);
      grd.addColorStop(0, '#fff8d8');
      grd.addColorStop(1, n.hit ? '#3fae6a' : '#e6c15a');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, r * 1.15, r * 0.85, -0.4, 0, Math.PI * 2);
      ctx.fill();
      if (n.beats <= 0.5) {
        ctx.beginPath();
        ctx.moveTo(n.x + r * 0.9, n.y - gap * 2.35);
        ctx.quadraticCurveTo(n.x + r * 2.2, n.y - gap * 1.8, n.x + r * 1.5, n.y - gap * 0.9);
        ctx.stroke();
      }
    }
    if (!n.judged && Math.abs(n.x - hx) < GOOD) {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, r * 1.15, r * 0.85, -0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    const cv = canvas();
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#08142c');
    g.addColorStop(0.55, '#12284c');
    g.addColorStop(1, '#1a1838');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // sala da concerto: alone caldo
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.42, W * 0.45);
    glow.addColorStop(0, 'rgba(230,193,90,0.14)');
    glow.addColorStop(1, 'rgba(230,193,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // tendaggi laterali
    ctx.fillStyle = 'rgba(90,20,40,0.22)';
    ctx.fillRect(0, 0, W * 0.035, H);
    ctx.fillRect(W * 0.965, 0, W * 0.035, H);

    const top = H * 0.30;
    const gap = H * 0.052;
    ctx.strokeStyle = 'rgba(232,240,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = top + i * gap;
      ctx.beginPath();
      ctx.moveTo(W * 0.08, y);
      ctx.lineTo(W * 0.94, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#e6c15a';
    ctx.font = `700 ${Math.round(H * 0.13)}px "Palatino Linotype", Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.fillText('𝄞', W * 0.085, top + gap * 3.35);

    const hx = W * HIT_X;
    ctx.fillStyle = 'rgba(230,193,90,0.10)';
    ctx.fillRect(hx - PERFECT, top - gap * 0.8, PERFECT * 2, gap * 6.2);
    ctx.strokeStyle = 'rgba(230,193,90,0.95)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(hx, top - gap * 0.8);
    ctx.lineTo(hx, top + gap * 5.2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffe08a';
    ctx.font = `700 ${Math.round(H * 0.028)}px "Avenir Next", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BATTA', hx, top - gap * 1.05);

    const r = Math.max(10, H * 0.026);
    notes.forEach((n) => {
      if (n.x < -50 || n.x > W + 50) return;
      drawNoteHead(ctx, n, r, gap, hx);
    });

    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r || 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // HUD premium
    ctx.fillStyle = 'rgba(8,18,40,0.45)';
    roundRect(ctx, W * 0.05, H * 0.05, W * 0.28, H * 0.14, 12);
    ctx.fill();
    ctx.fillStyle = 'rgba(8,18,40,0.45)';
    roundRect(ctx, W * 0.52, H * 0.05, W * 0.43, H * 0.14, 12);
    ctx.fill();

    ctx.fillStyle = '#ffe08a';
    ctx.font = `800 ${Math.round(H * 0.042)}px "Avenir Next", "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`★ ${score}`, W * 0.07, H * 0.105);
    ctx.fillStyle = '#b7c6df';
    ctx.font = `600 ${Math.round(H * 0.026)}px "Avenir Next", sans-serif`;
    ctx.fillText(`combo ${combo}`, W * 0.07, H * 0.155);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.round(H * 0.036)}px "Palatino Linotype", Georgia, serif`;
    ctx.fillText(songTitle, W * 0.93, H * 0.1);
    ctx.fillStyle = '#c9d7f0';
    ctx.font = `600 ${Math.round(H * 0.024)}px "Avenir Next", sans-serif`;
    ctx.fillText(songMeta, W * 0.93, H * 0.145);
    ctx.fillText(`Perfetti ${perfects} · Bene ${goods} · Fuori ${misses}`, W * 0.93, H * 0.175);

    if (msgT > 0) {
      ctx.fillStyle = '#ffe08a';
      ctx.font = `800 ${Math.round(H * 0.05)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText(msg, W * 0.5, H * 0.86);
    }

    if (!started) {
      ctx.fillStyle = 'rgba(6,12,28,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.round(H * 0.055)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Orchestra del sonaglio', W / 2, H * 0.38);
      ctx.fillStyle = '#e6c15a';
      ctx.font = `700 ${Math.round(H * 0.04)}px "Palatino Linotype", Georgia, serif`;
      ctx.fillText(songTitle, W / 2, H * 0.48);
      ctx.fillStyle = '#dce6f8';
      ctx.font = `600 ${Math.round(H * 0.03)}px "Avenir Next", sans-serif`;
      ctx.fillText(songMeta, W / 2, H * 0.55);
      ctx.fillText('Piano, archi e campanelle suonano la melodia', W / 2, H * 0.62);
      ctx.fillText('Tu la guidhi sulla linea d’oro', W / 2, H * 0.68);
      ctx.fillStyle = '#ffe08a';
      ctx.fillText('Clicca per alzare il sipario', W / 2, H * 0.78);
    }

    if (finished) {
      ctx.fillStyle = 'rgba(6,12,28,0.58)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.round(H * 0.05)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Che bel concerto!', W / 2, H * 0.4);
      ctx.fillStyle = '#e6c15a';
      ctx.fillText(`★ ${score} · ${songTitle}`, W / 2, H * 0.5);
      ctx.fillStyle = '#dce6f8';
      ctx.font = `600 ${Math.round(H * 0.03)}px "Avenir Next", sans-serif`;
      ctx.fillText('Clicca per la prossima melodia (classici, Natale, filastrocche)', W / 2, H * 0.6);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function tick(ts) {
    if (!open) return;
    const cv = canvas();
    if (!cv) return;
    if (!tick.last) tick.last = ts;
    let dt = Math.min(0.05, (ts - tick.last) / 1000);
    tick.last = ts;
    const hitLine = cv.width * HIT_X;

    if (started && !finished) {
      // pad armonico ogni ~2 beat
      beatAcc += dt;
      const beatSec = 60 / (currentSong?.bpm || 100);
      if (beatAcc >= beatSec * 2) {
        beatAcc = 0;
        chordStep += 1;
        playChordPad();
      }

      notes.forEach((n) => {
        n.x -= scrollSpeed * dt;
        // L'orchestra suona SEMPRE la melodia al passaggio della linea
        if (!n.autoPlayed && n.x <= hitLine) {
          n.autoPlayed = true;
          playOrchestra(n.midi, n.beats, false);
        }
        if (!n.judged && n.x < hitLine - GOOD) {
          n.judged = true;
          n.miss = true;
          combo = 0;
          misses += 1;
        }
      });
      if (notes.length && notes.every((n) => n.judged) && notes[notes.length - 1].x < cv.width * 0.04) {
        finished = true;
        msg = 'Bis!';
        msgT = 2;
        [72, 76, 79, 84].forEach((m, i) => setTimeout(() => playOrchestra(m, 0.8, true), i * 140));
      }
    }

    msgT = Math.max(0, msgT - dt);
    particles.forEach((p) => {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
    });
    particles = particles.filter((p) => p.t < p.life);

    draw();
    raf = requestAnimationFrame(tick);
  }

  function resize() {
    const cv = canvas();
    const box = document.getElementById('tin-stage');
    if (!cv || !box) return;
    const w = Math.min(960, box.clientWidth || 900);
    const h = Math.round(Math.min(540, Math.max(340, w * 0.54)));
    cv.width = w;
    cv.height = h;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
  }

  function openGame() {
    const el = overlay();
    if (!el) return;
    ensureAC();
    startAmbientHall();
    open = true;
    el.hidden = false;
    document.body.classList.add('tin-open');
    resize();
    loadSong(pickSong());
    tick.last = 0;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function closeGame() {
    open = false;
    stopAmbientHall();
    const el = overlay();
    if (el) el.hidden = true;
    document.body.classList.remove('tin-open');
    cancelAnimationFrame(raf);
    if (titleEl()) titleEl().textContent = 'Tin! · Pentagramma di Natale';
  }

  function onPointer(ev) {
    const cv = canvas();
    if (!cv || !open) return;
    const rect = cv.getBoundingClientRect();
    const x = ((ev.clientX || ev.touches?.[0]?.clientX) - rect.left) * (cv.width / rect.width);
    const y = ((ev.clientY || ev.touches?.[0]?.clientY) - rect.top) * (cv.height / rect.height);
    if (!started) {
      started = true;
      ensureAC();
      playChordPad();
      msg = 'L’orchestra inizia…';
      msgT = 0.9;
      return;
    }
    if (finished) {
      loadSong(pickSong());
      started = true;
      playChordPad();
      return;
    }
    clickNote(x, y);
  }

  function boot() {
    document.getElementById('btn-tin')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openGame();
    });
    document.getElementById('btn-tin-auguri')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openGame();
    });
    document.getElementById('tin-close')?.addEventListener('click', closeGame);
    document.getElementById('tin-next')?.addEventListener('click', () => {
      ensureAC();
      loadSong(pickSong());
      started = true;
      playChordPad();
    });
    overlay()?.addEventListener('click', (e) => {
      if (e.target === overlay()) closeGame();
    });
    canvas()?.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', () => {
      if (!open) return;
      resize();
      draw();
    });
    window.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') closeGame();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!started) {
          started = true;
          playChordPad();
          return;
        }
        if (finished) {
          loadSong(pickSong());
          started = true;
          playChordPad();
          return;
        }
        judgeAt();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.__TIN = { open: openGame, close: closeGame, songs: () => SONGS.map((s) => s.title) };
})();
