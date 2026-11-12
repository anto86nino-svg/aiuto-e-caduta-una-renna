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
    // Altri orchestrali / temi celebri (pubblico dominio)
    {
      id: 'adeste', title: 'Adeste Fideles', composer: 'Tradizionale', cat: 'Natale', key: 'G', bpm: 96,
      notes: [
        [67,2],[67,1],[64,1],[67,1],[69,1],[71,2],[71,1],[71,1],[72,1],[71,1],[69,1],[67,1],[69,1],[67,1],[66,1],[64,2],
        [67,2],[67,1],[64,1],[67,1],[69,1],[71,2],[71,1],[71,1],[72,1],[71,1],[69,1],[67,1],[69,1],[67,1],[66,1],[64,2],
        [74,2],[74,1],[74,1],[74,1],[72,1],[71,2],[69,2],[72,1],[71,1],[69,1],[67,1],[69,1],[66,1],[64,2],
      ],
    },
    {
      id: 'greensleeves', title: 'Greensleeves', composer: 'Tradizionale inglese', cat: 'Classica', key: 'A', bpm: 88,
      notes: [
        [69,2],[71,1],[72,2],[74,1],[76,2],[74,1],[72,2],[71,1],[69,2],[68,1],[69,3],
        [69,2],[71,1],[72,2],[74,1],[76,2],[74,1],[72,1],[71,1],[69,1],[68,1],[66,1],[68,1],[69,3],
        [81,2],[79,1],[76,2],[74,1],[72,2],[71,1],[69,2],[68,1],[69,3],
      ],
    },
    {
      id: 'moonlight', title: 'Chiaro di luna', composer: 'L. van Beethoven', cat: 'Classica', key: 'C', bpm: 60,
      notes: [
        [60,1],[64,1],[67,1],[60,1],[64,1],[67,1],[60,1],[64,1],[67,1],[60,1],[64,1],[67,1],
        [62,1],[65,1],[69,1],[62,1],[65,1],[69,1],[60,1],[64,1],[67,1],[60,1],[64,1],[67,1],
        [59,1],[62,1],[67,1],[59,1],[62,1],[67,1],[60,1],[64,1],[67,1],[72,3],
      ],
    },
    {
      id: 'turkish', title: 'Marcia turca', composer: 'W. A. Mozart', cat: 'Classica', key: 'A', bpm: 120,
      notes: [
        [69,0.5],[71,0.5],[72,0.5],[74,0.5],[76,1],[74,1],[72,0.5],[71,0.5],[69,1],[68,1],[69,2],
        [76,0.5],[78,0.5],[79,0.5],[81,0.5],[83,1],[81,1],[79,0.5],[78,0.5],[76,1],[74,1],[76,2],
        [69,0.5],[71,0.5],[72,0.5],[74,0.5],[76,1],[74,1],[72,0.5],[71,0.5],[69,1],[68,1],[69,2],
      ],
    },
    {
      id: 'newworld', title: 'Dal Nuovo Mondo (Largo)', composer: 'A. Dvořák', cat: 'Classica', key: 'D', bpm: 72,
      notes: [
        [69,2],[66,2],[62,3],[64,1],[66,2],[69,2],[66,4],
        [69,2],[71,2],[73,3],[71,1],[69,2],[66,2],[62,4],
        [66,2],[69,2],[71,3],[69,1],[66,2],[64,2],[62,4],
      ],
    },
    {
      id: 'swan', title: 'Il lago dei cigni', composer: 'P. I. Tchaikovsky', cat: 'Classica', key: 'A', bpm: 84,
      notes: [
        [69,2],[76,2],[74,1],[72,1],[71,2],[69,2],[68,2],[69,4],
        [71,2],[72,2],[74,2],[76,2],[77,2],[76,1],[74,1],[72,4],
        [69,2],[76,2],[74,1],[72,1],[71,2],[72,1],[71,1],[69,4],
      ],
    },
    {
      id: 'hallelujah', title: 'Hallelujah (Messiah)', composer: 'G. F. Handel', cat: 'Classica', key: 'D', bpm: 100,
      notes: [
        [69,1],[69,1],[69,1],[69,1],[71,1],[73,1],[74,2],[74,1],[74,1],[73,1],[71,1],[69,2],
        [73,1],[73,1],[73,1],[73,1],[74,1],[76,1],[78,2],[74,1],[73,1],[71,1],[69,1],[71,2],
        [69,1],[71,1],[73,1],[74,1],[76,2],[74,1],[73,1],[71,2],[69,4],
      ],
    },
    {
      id: 'entertainer', title: 'The Entertainer', composer: 'S. Joplin', cat: 'Classica', key: 'C', bpm: 112,
      notes: [
        [64,0.5],[65,0.5],[67,1],[72,1],[64,0.5],[65,0.5],[67,1],[72,1],[67,1],[64,1],[60,2],
        [62,0.5],[64,0.5],[65,1],[69,1],[62,0.5],[64,0.5],[65,1],[69,1],[65,1],[62,1],[59,2],
        [64,0.5],[65,0.5],[67,1],[72,1],[76,1],[74,1],[72,1],[71,1],[69,1],[67,1],[64,2],
      ],
    },
    {
      id: 'tantauguri', title: 'Tanti auguri a te', composer: 'Tradizionale', cat: 'Filastrocca', key: 'C', bpm: 96,
      notes: [
        [60,0.75],[60,0.25],[62,1],[60,1],[65,1],[64,2],
        [60,0.75],[60,0.25],[62,1],[60,1],[67,1],[65,2],
        [60,0.75],[60,0.25],[72,1],[69,1],[65,1],[64,1],[62,2],
        [70,0.75],[70,0.25],[69,1],[65,1],[67,1],[65,2],
      ],
    },
    {
      id: 'ohquand', title: 'Oh! quando i gatti', composer: 'Tradizionale italiano', cat: 'Filastrocca', key: 'F', bpm: 108,
      notes: [
        [65,1],[65,1],[65,1],[67,1],[69,2],[65,2],[67,1],[69,1],[70,1],[69,1],[67,4],
        [65,1],[65,1],[65,1],[67,1],[69,2],[65,2],[64,1],[65,1],[67,1],[64,1],[60,4],
      ],
    },
  ];

  const HIT_X = 0.22;
  const PERFECT = 48;
  const GOOD = 110; // finestra ampia: basta cliccare vicino alla linea d’oro al momento giusto
  const KEY_ROOT = { C: 60, G: 67, F: 65, D: 62, A: 69, E: 64 };
  const MIDI_LO = 55;
  const MIDI_HI = 81;

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
  let bestCombo = 0;
  let perfects = 0;
  let goods = 0;
  let misses = 0;
  let whiffs = 0;
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
  let shake = 0;
  let flashRed = 0;
  let time = 0;
  let briImg = null;
  let briReady = false;
  let bri = {
    mood: 'walk', // walk | happy | dance | proud | oops | sad
    moodT: 0,
    phase: 0,
    bounce: 0,
    ear: 0,
  };

  const overlay = () => document.getElementById('tin-overlay');
  const canvas = () => document.getElementById('tin-canvas');
  const helpEl = () => document.querySelector('.tin-help');
  const titleEl = () => document.getElementById('tin-title');

  function loadBriImage() {
    if (briImg) return;
    briImg = new Image();
    briImg.onload = () => { briReady = true; };
    briImg.src = 'gioca/assets/briciola.png';
  }

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

  /** Voce orchestrale singola */
  function voice(ctx, bus, midi, t0, dur, type, peak, attack, soft = 1) {
    const g = ctx.createGain();
    envGain(g, t0, attack, peak * soft, dur, Math.min(0.45, dur * 0.35));
    g.connect(bus);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq(midi);
    if (type === 'sawtooth' || type === 'square') {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = type === 'sawtooth' ? 1400 : 900;
      o.connect(f); f.connect(g);
    } else {
      o.connect(g);
    }
    o.start(t0);
    o.stop(t0 + dur + 0.5);
  }

  /** Melodia ricca: piano + archi + corni + flauto — base musicale piena */
  function playOrchestra(midi, beats = 1, accent = false) {
    const ctx = ensureAC();
    if (!ctx || !master) return;
    const bpm = currentSong?.bpm || 100;
    const dur = Math.max(0.24, Math.min(2.2, beats * (60 / bpm) * 0.95));
    const t0 = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.value = accent ? 1 : 0.78;
    bus.connect(master);
    const m = midi;

    // sezione archi (melodia)
    voice(ctx, bus, m, t0, dur + 0.12, 'sawtooth', accent ? 0.07 : 0.055, 0.07);
    voice(ctx, bus, m + 12, t0, dur * 0.9, 'sine', 0.03, 0.05, 0.8);
    // piano
    voice(ctx, bus, m, t0, dur, 'triangle', accent ? 0.2 : 0.13, 0.012);
    voice(ctx, bus, m + 12, t0, dur * 0.7, 'sine', 0.05, 0.01, 0.7);
    // corno / legno
    voice(ctx, bus, m - 12, t0, Math.min(dur, 0.7), 'sine', 0.06, 0.03);
    voice(ctx, bus, m, t0, dur * 0.85, 'sine', accent ? 0.07 : 0.045, 0.04);

    // armonia interna (terza/quinta sotto) = più “orchestra”
    voice(ctx, bus, m - 3, t0, dur * 0.8, 'triangle', 0.03, 0.05, 0.7);
    voice(ctx, bus, m - 7, t0, dur * 0.75, 'sine', 0.035, 0.06, 0.7);

    if (accent) {
      const bell = ctx.createGain();
      envGain(bell, t0, 0.004, 0.15, 0.5, 0.35);
      bell.connect(bus);
      [1, 2.005, 3.01, 4.04].forEach((mul, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq(m) * mul;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 1 : 0.16 / i;
        o.connect(g); g.connect(bell);
        o.start(t0); o.stop(t0 + 0.65);
      });
    }
  }

  /** Base armonica continua: basso + pad + arpeggio (come un arrangiamento) */
  function playChordPad() {
    const ctx = ensureAC();
    if (!ctx || !master || !currentSong) return;
    const root = KEY_ROOT[currentSong.key] || 60;
    const prog = [
      [0, 4, 7],
      [5, 9, 12],
      [7, 11, 14],
      [0, 4, 7],
    ];
    const degrees = prog[chordStep % prog.length];
    const t0 = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.value = 0.7;
    bus.connect(master);
    const beat = 60 / (currentSong.bpm || 100);

    // basso lungo
    voice(ctx, bus, root - 24 + degrees[0], t0, beat * 2.1, 'sine', 0.1, 0.03);
    voice(ctx, bus, root - 12 + degrees[0], t0, beat * 2.0, 'triangle', 0.05, 0.04);

    // pad archi sull'accordo
    degrees.forEach((d, i) => {
      voice(ctx, bus, root - 12 + d, t0, beat * 2.2, 'sawtooth', 0.028 - i * 0.004, 0.12);
      voice(ctx, bus, root + d, t0, beat * 2.0, 'sine', 0.03 - i * 0.005, 0.1);
    });

    // arpeggio delicato (base musicale)
    degrees.forEach((d, i) => {
      voice(ctx, bus, root + d, t0 + i * beat * 0.22, beat * 0.55, 'sine', 0.04, 0.01);
    });
    // pizzicato alto
    voice(ctx, bus, root + 12 + degrees[0], t0 + beat * 0.5, beat * 0.4, 'triangle', 0.035, 0.005);
  }

  /** Pulsazione morbida da sala (non batteria secca) */
  function playSoftPulse(strong) {
    const ctx = ensureAC();
    if (!ctx || !master) return;
    const t0 = ctx.currentTime;
    const g = ctx.createGain();
    envGain(g, t0, 0.005, strong ? 0.045 : 0.025, 0.12, 0.08);
    g.connect(master);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = strong ? 55 : 70;
    o.connect(g);
    o.start(t0); o.stop(t0 + 0.2);
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

  function staffLayout(H) {
    // Lascia spazio HUD sopra e Briciola sotto: il rigo resta centrato e compatto
    const top = H * 0.26;
    const gap = H * 0.048;
    const bottom = top + 4 * gap;
    return {
      top,
      gap,
      bottom,
      // ledger consentiti ma entro area sicura
      minY: top - gap * 1.15,
      maxY: bottom + gap * 1.15,
    };
  }

  function midiToStaffY(midi, H) {
    const { minY, maxY } = staffLayout(H);
    const m = Math.max(MIDI_LO, Math.min(MIDI_HI, midi));
    const t = (m - MIDI_LO) / (MIDI_HI - MIDI_LO); // 0 grave → 1 acuto
    return maxY - t * (maxY - minY);
  }

  function setBriMood(mood, dur = 0.7) {
    bri.mood = mood;
    bri.moodT = dur;
  }

  function refreshBriMood() {
    if (bri.moodT > 0) return;
    if (combo >= 10) bri.mood = 'dance';
    else if (combo >= 5) bri.mood = 'happy';
    else if (combo >= 2) bri.mood = 'proud';
    else bri.mood = 'walk';
  }

  function briBox(W, H) {
    // renna a destra, lontano dalla linea d’oro: non interferisce coi click
    const w = Math.min(140, W * 0.18);
    const h = Math.min(120, H * 0.22);
    return { x: W - w - W * 0.04, y: H - h - H * 0.03, w, h };
  }

  function pointInBri(mx, my, W, H) {
    const b = briBox(W, H);
    return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  }

  function playMissSound() {
    const ctx = ensureAC();
    if (!ctx || !master) return;
    const t0 = ctx.currentTime;
    const g = ctx.createGain();
    envGain(g, t0, 0.01, 0.14, 0.22, 0.08);
    g.connect(master);
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(180, t0);
    o.frequency.exponentialRampToValueAtTime(70, t0 + 0.2);
    o.connect(g);
    o.start(t0); o.stop(t0 + 0.28);
  }

  function penalize(amount, text, x, y) {
    score = Math.max(0, score - amount);
    combo = 0;
    misses += 1;
    msg = text;
    msgT = 0.75;
    shake = Math.max(shake, 0.28);
    flashRed = 0.22;
    setBriMood('oops', 0.85);
    playMissSound();
    if (Number.isFinite(x) && Number.isFinite(y)) spawnSpark(x, y, false);
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
    bestCombo = 0;
    perfects = 0;
    goods = 0;
    misses = 0;
    whiffs = 0;
    started = false;
    finished = false;
    beatAcc = 0;
    chordStep = 0;
    shake = 0;
    flashRed = 0;
    msg = 'Clicca quando la nota è sulla linea d’oro';
    msgT = 2.8;
    particles = [];
    setBriMood('walk', 0);
    if (titleEl()) titleEl().textContent = `Tin! · ${song.title}`;
    if (helpEl()) {
      helpEl().innerHTML = `<strong>${song.title}</strong> — ${song.composer} (${song.cat}). Clicca (o Spazio) <strong>quando la nota è sulla fascia d’oro</strong>: conta il tempo, non dove tocchi. Briciola reagisce solo se clicchi a vuoto.`;
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
      setBriMood(combo >= 8 ? 'dance' : 'happy', 0.9);
    } else {
      score += 45;
      combo += 1;
      goods += 1;
      msg = 'Bene!';
      setBriMood('proud', 0.6);
    }
    bestCombo = Math.max(bestCombo, combo);
    msgT = 0.7;
    spawnSpark(best.x, best.y, true);
  }

  function markLateMiss(n) {
    if (n.judged) return;
    n.judged = true;
    n.miss = true;
    // nota passata senza click: piccolo costo, senza far “inciampare” Briciola ogni volta
    combo = 0;
    misses += 1;
    score = Math.max(0, score - 8);
  }

  function nearestNoteToHitLine() {
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
    return { best, bestDist, hitLine };
  }

  function judgeAt(fromSpace = false) {
    const { best, bestDist, hitLine } = nearestNoteToHitLine();
    // Colpo valido: la nota è sulla / vicino alla linea d’oro
    if (best && bestDist <= GOOD) {
      markHit(best, bestDist <= PERFECT);
      return true;
    }
    // Quasi: nessun punto, nessun “fuori allineamento”
    if (best && bestDist <= GOOD * 2.5) {
      msg = best.x > hitLine ? 'Ancora un attimo…' : 'Un filo tardi…';
      msgT = 0.4;
      return false;
    }
    msg = fromSpace ? 'Aspetta la nota…' : 'Aspetta la linea d’oro…';
    msgT = 0.35;
    return false;
  }

  function pointerToCanvas(ev, cv) {
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width / Math.max(1, rect.width);
    const scaleY = cv.height / Math.max(1, rect.height);
    const src = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
    const clientX = Number(src.clientX);
    const clientY = Number(src.clientY);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function clickNote(mx, my) {
    const cv = canvas();
    if (!cv) return;
    const W = cv.width;
    const H = cv.height;

    // click sulla renna: ignora (non influenza il gioco)
    if (pointInBri(mx, my, W, H)) return;

    // Come Spazio: conta SOLO il tempo (nota vs linea d’oro).
    // Dove clicchi sul pentagramma non importa — così cliccando sulla nota
    // non viene più segnalato «Fuori allineamento».
    const { best, bestDist, hitLine } = nearestNoteToHitLine();
    if (best && bestDist <= GOOD) {
      markHit(best, bestDist <= PERFECT);
      return;
    }
    if (best && bestDist <= GOOD * 2.8) {
      // quasi: niente punti ma niente penale, Briciola resta calma
      msg = best.x > hitLine ? 'Ancora un attimo…' : 'Un filo tardi…';
      msgT = 0.4;
      return;
    }
    // click a vuoto (nessuna nota vicina): piccolo richiamo + Briciola
    whiffs += 1;
    if (whiffs >= 2) {
      penalize(10, 'Fuori tempo! −10', mx, my);
      whiffs = 0;
    } else {
      msg = 'Aspetta che la nota sia sulla linea d’oro';
      msgT = 0.55;
    }
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

  function drawLedgerLines(ctx, n, layout, W) {
    const { top, gap, bottom } = layout;
    ctx.strokeStyle = 'rgba(232,240,255,0.4)';
    ctx.lineWidth = 1.5;
    // sopra
    for (let y = top - gap; y >= n.y - 1; y -= gap) {
      if (y < top - 0.5) {
        ctx.beginPath();
        ctx.moveTo(n.x - 14, y);
        ctx.lineTo(n.x + 14, y);
        ctx.stroke();
      }
    }
    // sotto
    for (let y = bottom + gap; y <= n.y + 1; y += gap) {
      if (y > bottom + 0.5) {
        ctx.beginPath();
        ctx.moveTo(n.x - 14, y);
        ctx.lineTo(n.x + 14, y);
        ctx.stroke();
      }
    }
  }

  function updateBri(dt) {
    bri.phase += dt;
    if (bri.moodT > 0) bri.moodT -= dt;
    else refreshBriMood();
    const speed =
      bri.mood === 'dance' ? 10 :
      bri.mood === 'happy' ? 7 :
      bri.mood === 'oops' ? 14 :
      bri.mood === 'sad' ? 3 : 5;
    bri.bounce = Math.sin(bri.phase * speed) * (
      bri.mood === 'dance' ? 10 :
      bri.mood === 'happy' ? 7 :
      bri.mood === 'oops' ? 4 :
      bri.mood === 'sad' ? 2 : 5
    );
    bri.ear = Math.sin(bri.phase * (speed * 0.7)) * 0.08;
  }

  function drawBriciola(ctx, W, H) {
    const box = briBox(W, H);
    const x = box.x + box.w * 0.5;
    const y = box.y + box.h * 0.55 + (bri.mood === 'oops' ? Math.sin(bri.phase * 20) * 3 : 0) - bri.bounce;
    const s = Math.min(0.38, W / 1200);
    const bw = 240 * s;
    const bh = 212 * s;
    ctx.save();
    // palco a destra
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRect(ctx, box.x, box.y, box.w, box.h, 14);
    ctx.fill();
    ctx.translate(x, y);
    if (bri.mood === 'dance') ctx.rotate(Math.sin(bri.phase * 8) * 0.12);
    else if (bri.mood === 'oops') ctx.rotate(-0.16 + Math.sin(bri.phase * 18) * 0.05);
    else ctx.rotate(bri.ear * 0.35);
    if (bri.mood === 'dance' || bri.mood === 'happy') {
      ctx.shadowColor = 'rgba(230,193,90,0.55)';
      ctx.shadowBlur = 18;
    }
    if (briReady && briImg) {
      ctx.drawImage(briImg, -bw / 2, -bh / 2, bw, bh);
    } else {
      ctx.fillStyle = '#c9a07a';
      ctx.beginPath();
      ctx.ellipse(0, 0, bw * 0.35, bh * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle =
      bri.mood === 'dance' ? '#ffe08a' :
      bri.mood === 'happy' ? '#b6f0c8' :
      bri.mood === 'oops' ? '#ff9a9a' :
      bri.mood === 'proud' ? '#e6c15a' : '#c9d7f0';
    ctx.font = `800 ${Math.round(H * 0.024)}px "Avenir Next", sans-serif`;
    ctx.textAlign = 'center';
    const label =
      bri.mood === 'dance' ? '✦ saltella!' :
      bri.mood === 'happy' ? 'brava!' :
      bri.mood === 'proud' ? 'così!' :
      bri.mood === 'oops' ? 'fuori linea!' : 'ascolta';
    ctx.fillText(label, 0, bh * 0.52);
    ctx.restore();
  }

  function draw() {
    const cv = canvas();
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    const layout = staffLayout(H);
    const { top, gap, bottom } = layout;

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * 10 * shake, (Math.random() - 0.5) * 8 * shake);
    }

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#08142c');
    g.addColorStop(0.55, '#12284c');
    g.addColorStop(1, '#1a1838');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.42, W * 0.45);
    glow.addColorStop(0, 'rgba(230,193,90,0.14)');
    glow.addColorStop(1, 'rgba(230,193,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(90,20,40,0.22)';
    ctx.fillRect(0, 0, W * 0.035, H);
    ctx.fillRect(W * 0.965, 0, W * 0.035, H);

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
    ctx.font = `700 ${Math.round(H * 0.12)}px "Palatino Linotype", Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.fillText('𝄞', W * 0.085, top + gap * 3.35);

    const hx = W * HIT_X;
    ctx.fillStyle = 'rgba(230,193,90,0.12)';
    ctx.fillRect(hx - GOOD, layout.minY, GOOD * 2, layout.maxY - layout.minY);
    ctx.fillStyle = 'rgba(230,193,90,0.22)';
    ctx.fillRect(hx - PERFECT, layout.minY, PERFECT * 2, layout.maxY - layout.minY);
    ctx.strokeStyle = 'rgba(230,193,90,0.95)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(hx, layout.minY);
    ctx.lineTo(hx, layout.maxY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffe08a';
    ctx.font = `700 ${Math.round(H * 0.026)}px "Avenir Next", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BATTA', hx, top - gap * 0.85);

    const r = Math.max(10, H * 0.024);
    notes.forEach((n) => {
      if (n.x < -50 || n.x > W + 50) return;
      if (n.y < top - 1 || n.y > bottom + 1) drawLedgerLines(ctx, n, layout, W);
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

    drawBriciola(ctx, W, H);

    ctx.fillStyle = 'rgba(8,18,40,0.45)';
    roundRect(ctx, W * 0.05, H * 0.045, W * 0.28, H * 0.135, 12);
    ctx.fill();
    ctx.fillStyle = 'rgba(8,18,40,0.45)';
    roundRect(ctx, W * 0.52, H * 0.045, W * 0.43, H * 0.135, 12);
    ctx.fill();

    ctx.fillStyle = '#ffe08a';
    ctx.font = `800 ${Math.round(H * 0.04)}px "Avenir Next", "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`★ ${score}`, W * 0.07, H * 0.1);
    ctx.fillStyle = '#b7c6df';
    ctx.font = `600 ${Math.round(H * 0.024)}px "Avenir Next", sans-serif`;
    ctx.fillText(`combo ${combo} · best ${bestCombo}`, W * 0.07, H * 0.145);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.round(H * 0.034)}px "Palatino Linotype", Georgia, serif`;
    ctx.fillText(songTitle, W * 0.93, H * 0.095);
    ctx.fillStyle = '#c9d7f0';
    ctx.font = `600 ${Math.round(H * 0.022)}px "Avenir Next", sans-serif`;
    ctx.fillText(songMeta, W * 0.93, H * 0.135);
    ctx.fillText(`Perfetti ${perfects} · Bene ${goods} · Errori ${misses}`, W * 0.93, H * 0.165);

    if (msgT > 0) {
      ctx.fillStyle = msg.includes('−') || msg.includes('Ops') || msg.includes('vuoto') || msg.includes('Persa') || msg.includes('Fuori')
        ? '#ffb4b4' : '#ffe08a';
      ctx.font = `800 ${Math.round(H * 0.048)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText(msg, W * 0.58, H * 0.86);
    }

    if (flashRed > 0) {
      ctx.fillStyle = `rgba(180,40,50,${flashRed * 0.35})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (!started) {
      ctx.fillStyle = 'rgba(6,12,28,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.round(H * 0.052)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Orchestra del sonaglio', W / 2, H * 0.36);
      ctx.fillStyle = '#e6c15a';
      ctx.font = `700 ${Math.round(H * 0.038)}px "Palatino Linotype", Georgia, serif`;
      ctx.fillText(songTitle, W / 2, H * 0.46);
      ctx.fillStyle = '#dce6f8';
      ctx.font = `600 ${Math.round(H * 0.028)}px "Avenir Next", sans-serif`;
      ctx.fillText(songMeta, W / 2, H * 0.53);
      ctx.fillText('Base orchestrale + melodia riconoscibile', W / 2, H * 0.6);
      ctx.fillText('Clicca sulla linea d’oro · i click a vuoto tolgono punti', W / 2, H * 0.66);
      ctx.fillStyle = '#ffe08a';
      ctx.fillText('Clicca per alzare il sipario', W / 2, H * 0.76);
    }

    if (finished) {
      ctx.fillStyle = 'rgba(6,12,28,0.58)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.round(H * 0.048)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Che bel concerto!', W / 2, H * 0.38);
      ctx.fillStyle = '#e6c15a';
      ctx.fillText(`★ ${score} · combo max ${bestCombo}`, W / 2, H * 0.48);
      ctx.fillStyle = '#dce6f8';
      ctx.font = `600 ${Math.round(H * 0.028)}px "Avenir Next", sans-serif`;
      ctx.fillText(songTitle, W / 2, H * 0.56);
      ctx.fillText('Clicca per la prossima melodia', W / 2, H * 0.64);
    }
    ctx.restore();
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

    time += dt;
    shake = Math.max(0, shake - dt * 1.8);
    flashRed = Math.max(0, flashRed - dt * 1.6);
    updateBri(dt);

    if (started && !finished) {
      beatAcc += dt;
      const beatSec = 60 / (currentSong?.bpm || 100);
      // ogni beat: pulse; ogni 2 beat: accordo/base orchestrale
      if (beatAcc >= beatSec) {
        const strong = chordStep % 2 === 0;
        playSoftPulse(strong);
        if (strong) {
          playChordPad();
        }
        chordStep += 1;
        beatAcc -= beatSec;
      }

      notes.forEach((n) => {
        n.x -= scrollSpeed * dt;
        if (!n.autoPlayed && n.x <= hitLine) {
          n.autoPlayed = true;
          playOrchestra(n.midi, n.beats, false);
        }
        if (!n.judged && n.x < hitLine - GOOD) {
          markLateMiss(n);
        }
      });
      if (notes.length && notes.every((n) => n.judged) && notes[notes.length - 1].x < cv.width * 0.04) {
        finished = true;
        msg = 'Bis!';
        msgT = 2;
        setBriMood('dance', 2.2);
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
    loadBriImage();
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
    ev.preventDefault?.();
    const { x, y } = pointerToCanvas(ev, cv);
    if (!started) {
      started = true;
      ensureAC();
      playChordPad();
      msg = 'L’orchestra inizia… clicca sulla linea d’oro!';
      msgT = 1.1;
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
        judgeAt(true);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.__TIN = { open: openGame, close: closeGame, songs: () => SONGS.map((s) => s.title) };
})();
