/* Tin! — pentagramma di Natale: clicca le note che scorrono e suona melodie diverse. */
(() => {
  'use strict';

  // Melodie di Natale (dominio pubblico), note MIDI + durata in beat
  const SONGS = [
    {
      id: 'jingle',
      title: 'Jingle Bells',
      bpm: 132,
      notes: [
        [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,0.5],[64,4],
        [65,1],[65,1],[65,1.5],[65,0.5],[65,1],[64,1],[64,1],[64,0.5],[64,0.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2],
        [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,0.5],[64,4],
        [65,1],[65,1],[65,1.5],[65,0.5],[65,1],[64,1],[64,1],[64,0.5],[64,0.5],[67,1],[67,1],[65,1],[62,1],[60,4],
      ],
    },
    {
      id: 'silent',
      title: 'Astro del ciel',
      bpm: 78,
      notes: [
        [67,3],[69,1],[67,2],[64,4],[67,3],[69,1],[67,2],[64,4],
        [74,4],[72,4],[71,4],[69,4],[72,3],[71,1],[69,2],[67,4],[64,4],
        [67,3],[69,1],[67,2],[64,4],[67,3],[69,1],[67,2],[64,4],
        [74,4],[72,4],[71,4],[69,4],[72,3],[71,1],[69,2],[67,4],[64,4],
      ],
    },
    {
      id: 'deck',
      title: 'Deck the Halls',
      bpm: 128,
      notes: [
        [69,1.5],[67,0.5],[65,1],[64,1],[62,1],[60,1],[62,1],[64,1],[65,1],[62,1],[64,1.5],[65,0.5],[67,2],
        [69,1.5],[67,0.5],[65,1],[64,1],[62,1],[60,1],[62,1],[64,1],[65,1],[62,1],[60,2],
        [62,1],[62,1],[64,1],[65,1],[62,1],[64,1],[65,1],[67,1],[69,1.5],[67,0.5],[65,1],[64,1],[62,1],[60,1],[62,1],[64,1],[65,1],[62,1],[60,2],
      ],
    },
    {
      id: 'wish',
      title: 'We Wish You a Merry Christmas',
      bpm: 118,
      notes: [
        [67,1],[72,1],[72,0.5],[74,0.5],[72,0.5],[71,0.5],[69,1],[69,1],[69,1],[74,1],[74,0.5],[76,0.5],[74,0.5],[72,0.5],[71,1],[67,1],
        [67,1],[76,1],[76,0.5],[77,0.5],[76,0.5],[74,0.5],[72,1],[69,1],[67,0.5],[67,0.5],[69,1],[74,1],[71,1],[72,2],
      ],
    },
    {
      id: 'tannen',
      title: 'O Tannenbaum',
      bpm: 96,
      notes: [
        [67,1],[72,1.5],[72,0.5],[72,1],[74,1],[76,1.5],[76,0.5],[76,2],[76,0.5],[74,0.5],[72,1],[74,0.5],[76,0.5],[72,1],[71,1],[69,1],[69,1],
        [69,1],[74,1.5],[71,0.5],[67,1],[72,1],[76,1.5],[76,0.5],[76,2],[76,0.5],[74,0.5],[72,1],[74,0.5],[76,0.5],[72,1],[71,1],[69,1],[67,2],
      ],
    },
    {
      id: 'noel',
      title: 'The First Noel',
      bpm: 92,
      notes: [
        [64,1],[67,1],[67,0.5],[69,0.5],[71,1],[72,1],[74,1],[72,1],[71,1],[69,1],[67,2],
        [64,1],[67,1],[67,0.5],[69,0.5],[71,1],[72,1],[74,1],[72,1],[71,1],[69,1],[67,2],
        [72,1],[71,1],[69,1],[67,1],[69,1],[71,1],[72,1],[67,1],[64,1],[67,1],[69,2],
        [72,1],[71,1],[69,1],[67,1],[69,1],[71,1],[72,1],[67,1],[64,1],[67,1],[67,2],
      ],
    },
    {
      id: 'manger',
      title: 'Away in a Manger',
      bpm: 88,
      notes: [
        [67,1],[67,1],[69,1],[67,1],[64,1],[60,1],[62,1],[64,1],[67,1],[67,1],[69,1],[67,1],[64,2],
        [62,1],[62,1],[64,1],[62,1],[59,1],[55,1],[60,1],[62,1],[64,1],[67,1],[65,1],[62,1],[60,2],
      ],
    },
    {
      id: 'wenceslas',
      title: 'Good King Wenceslas',
      bpm: 110,
      notes: [
        [67,1],[67,1],[67,1],[69,1],[67,1],[67,1],[64,2],[65,1],[65,1],[64,1],[62,1],[60,2],
        [67,1],[67,1],[67,1],[69,1],[67,1],[67,1],[64,2],[65,1],[65,1],[64,1],[62,1],[60,2],
        [72,1],[71,1],[69,1],[67,1],[69,1],[67,1],[64,2],[65,1],[65,1],[64,1],[62,1],[60,2],
      ],
    },
    {
      id: 'bells2',
      title: 'Carol of the Bells (tema)',
      bpm: 140,
      notes: [
        [71,1],[69,1],[71,1],[64,2],[71,1],[69,1],[71,1],[64,2],[71,1],[69,1],[71,1],[64,1],[67,1],[65,1],[64,1],[62,2],
        [71,1],[69,1],[71,1],[64,2],[71,1],[69,1],[71,1],[64,2],[72,1],[71,1],[69,1],[67,1],[69,1],[67,1],[65,1],[64,2],
      ],
    },
    {
      id: 'herald',
      title: 'Hark! The Herald Angels Sing',
      bpm: 112,
      notes: [
        [67,2],[72,2],[71,2],[69,2],[67,2],[74,2],[72,2],[69,2],
        [67,2],[72,2],[71,2],[69,2],[67,1],[69,1],[67,2],[64,2],
        [67,2],[72,2],[71,2],[69,2],[67,2],[74,2],[72,2],[76,2],
        [74,1],[72,1],[71,2],[69,2],[67,1],[69,1],[67,2],[64,2],
      ],
    },
    {
      id: 'ding',
      title: 'Ding Dong Merrily on High',
      bpm: 120,
      notes: [
        [67,1],[72,1],[71,0.5],[69,0.5],[67,1],[64,1],[67,1],[69,0.5],[71,0.5],[72,1],[67,1],[64,2],
        [67,1],[72,1],[71,0.5],[69,0.5],[67,1],[64,1],[67,1],[69,0.5],[71,0.5],[72,1],[67,1],[64,2],
        [76,1],[74,1],[72,1],[71,1],[69,1],[71,1],[72,2],[74,1],[72,1],[71,1],[69,1],[67,2],
      ],
    },
  ];

  const HIT_X = 0.22; // linea di battuta (frazione larghezza)
  const PERFECT = 28;
  const GOOD = 54;

  let ac = null;
  let open = false;
  let raf = 0;
  let songIndex = -1;
  let lastSongId = null;
  let notes = []; // {midi,x,y,hit,miss,played}
  let score = 0;
  let combo = 0;
  let perfects = 0;
  let goods = 0;
  let misses = 0;
  let songTitle = '';
  let scrollSpeed = 180;
  let started = false;
  let finished = false;
  let msg = '';
  let msgT = 0;
  let particles = [];

  const overlay = () => document.getElementById('tin-overlay');
  const canvas = () => document.getElementById('tin-canvas');

  function ensureAC() {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ac = new A();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function playTone(midi, dur = 0.45, kind = 'bell') {
    const ctx = ensureAC();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(0.28, t0 + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    master.connect(ctx.destination);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    o1.connect(master);
    o2.connect(g2);
    g2.connect(master);
    // soft partial for bell sparkle (no reverb)
    const o3 = ctx.createOscillator();
    o3.type = 'sine';
    o3.frequency.value = f * 3.01;
    const g3 = ctx.createGain();
    g3.gain.value = 0.06;
    o3.connect(g3);
    g3.connect(master);
    o1.start(t0); o2.start(t0); o3.start(t0);
    o1.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05); o3.stop(t0 + dur + 0.05);
  }

  function midiToStaffY(midi, H) {
    // Map ~55-76 onto staff
    const top = H * 0.28;
    const lineGap = H * 0.055;
    // E4=64 is middle-ish on staff
    const ref = 64;
    const steps = midi - ref; // semitone approx as diatonic-ish
    // treat as chromatic steps with smaller spacing
    return top + 2.2 * lineGap - steps * (lineGap * 0.42);
  }

  function pickSong() {
    const pool = SONGS.filter((s) => s.id !== lastSongId);
    const song = pool[Math.floor(Math.random() * pool.length)];
    lastSongId = song.id;
    return song;
  }

  function loadSong(song) {
    const cv = canvas();
    const W = cv.width;
    const H = cv.height;
    const beatPx = Math.max(70, W * 0.085);
    let x = W * 0.55;
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
      });
      x += beats * beatPx;
    });
    scrollSpeed = (song.bpm / 60) * beatPx * 0.92;
    songTitle = song.title;
    score = 0;
    combo = 0;
    perfects = 0;
    goods = 0;
    misses = 0;
    started = false;
    finished = false;
    msg = 'Clicca le note sulla linea d’oro!';
    msgT = 2.5;
    particles = [];
  }

  function spawnSpark(x, y, ok) {
    for (let i = 0; i < (ok ? 10 : 4); i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 160,
        vy: -40 - Math.random() * 120,
        life: 0.5 + Math.random() * 0.4,
        t: 0,
        c: ok ? (Math.random() > 0.5 ? '#ffe08a' : '#fff') : '#ff8a8a',
      });
    }
  }

  function judgeAt(x) {
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
      msgT = 0.35;
      return;
    }
    best.judged = true;
    if (bestDist <= PERFECT) {
      best.hit = true;
      best.played = true;
      playTone(best.midi, 0.5);
      score += 100 + combo * 8;
      combo += 1;
      perfects += 1;
      msg = combo > 3 ? `Perfetto! x${combo}` : 'Perfetto!';
      msgT = 0.7;
      spawnSpark(best.x, best.y, true);
    } else {
      best.hit = true;
      best.played = true;
      playTone(best.midi, 0.35);
      score += 40;
      combo = 0;
      goods += 1;
      msg = 'Bene!';
      msgT = 0.55;
      spawnSpark(best.x, best.y, true);
    }
  }

  function clickNote(mx, my) {
    const cv = canvas();
    const hitLine = cv.width * HIT_X;
    // Prefer clicking a note near cursor, else judge at hit line
    let best = null;
    let bestScore = 1e9;
    notes.forEach((n) => {
      if (n.judged) return;
      const dx = n.x - mx;
      const dy = n.y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < 42 && dist < bestScore) {
        bestScore = dist;
        best = n;
      }
    });
    if (best) {
      // judge based on distance to hit line
      const d = Math.abs(best.x - hitLine);
      best.judged = true;
      if (d <= GOOD) {
        const perfect = d <= PERFECT;
        best.hit = true;
        best.played = true;
        playTone(best.midi, perfect ? 0.5 : 0.35);
        if (perfect) {
          score += 100 + combo * 8;
          combo += 1;
          perfects += 1;
          msg = combo > 3 ? `Perfetto! x${combo}` : 'Perfetto!';
        } else {
          score += 40;
          combo = 0;
          goods += 1;
          msg = 'Bene!';
        }
        msgT = 0.7;
        spawnSpark(best.x, best.y, true);
      } else {
        // clicked too early/late
        best.miss = true;
        combo = 0;
        misses += 1;
        msg = 'Troppo presto!';
        msgT = 0.6;
        spawnSpark(best.x, best.y, false);
      }
      return;
    }
    judgeAt(hitLine);
  }

  function draw() {
    const cv = canvas();
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a1a38');
    g.addColorStop(1, '#13284f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // soft glow
    ctx.fillStyle = 'rgba(230,193,90,0.06)';
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.45, W * 0.4, H * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    const top = H * 0.28;
    const gap = H * 0.055;
    ctx.strokeStyle = 'rgba(232,240,255,0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = top + i * gap;
      ctx.beginPath();
      ctx.moveTo(W * 0.06, y);
      ctx.lineTo(W * 0.94, y);
      ctx.stroke();
    }

    // clef hint
    ctx.fillStyle = '#e6c15a';
    ctx.font = `700 ${Math.round(H * 0.12)}px "Palatino Linotype", Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.fillText('𝄞', W * 0.07, top + gap * 3.2);

    // hit line
    const hx = W * HIT_X;
    ctx.strokeStyle = 'rgba(230,193,90,0.95)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(hx, top - gap);
    ctx.lineTo(hx, top + gap * 5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(230,193,90,0.12)';
    ctx.fillRect(hx - PERFECT, top - gap, PERFECT * 2, gap * 6);

    // notes
    notes.forEach((n) => {
      if (n.x < -40 || n.x > W + 40) return;
      const r = Math.max(10, H * 0.028);
      ctx.save();
      if (n.miss) ctx.globalAlpha = 0.35;
      else if (n.hit) ctx.globalAlpha = 0.55;
      // stem
      ctx.strokeStyle = n.hit ? '#8fd6a8' : '#f4f7ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(n.x + r * 0.85, n.y);
      ctx.lineTo(n.x + r * 0.85, n.y - gap * 2.2);
      ctx.stroke();
      // head
      const grd = ctx.createRadialGradient(n.x - 3, n.y - 3, 2, n.x, n.y, r);
      grd.addColorStop(0, '#fff8d8');
      grd.addColorStop(1, n.hit ? '#3fae6a' : '#e6c15a');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, r * 1.15, r * 0.85, -0.4, 0, Math.PI * 2);
      ctx.fill();
      if (!n.judged && Math.abs(n.x - hx) < GOOD) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });

    // particles
    particles.forEach((p) => {
      const a = 1 - p.t / p.life;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // HUD
    ctx.fillStyle = '#e8f0ff';
    ctx.font = `700 ${Math.round(H * 0.045)}px "Avenir Next", "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`★ ${score}`, W * 0.06, H * 0.12);
    ctx.textAlign = 'right';
    ctx.fillText(songTitle, W * 0.94, H * 0.12);
    ctx.font = `600 ${Math.round(H * 0.032)}px "Avenir Next", "Segoe UI", sans-serif`;
    ctx.fillStyle = '#b7c6df';
    ctx.fillText(`Perfetti ${perfects} · Bene ${goods} · Fuori tempo ${misses}`, W * 0.94, H * 0.175);

    if (msgT > 0) {
      ctx.fillStyle = '#ffe08a';
      ctx.font = `800 ${Math.round(H * 0.055)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText(msg, W * 0.5, H * 0.84);
    }

    if (!started) {
      ctx.fillStyle = 'rgba(7,20,40,0.45)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.round(H * 0.06)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Tin! · Pentagramma di Natale', W / 2, H * 0.42);
      ctx.font = `600 ${Math.round(H * 0.035)}px "Avenir Next", sans-serif`;
      ctx.fillStyle = '#dce6f8';
      ctx.fillText('Tocca / clicca le note quando passano sulla linea d’oro', W / 2, H * 0.5);
      ctx.fillText('Ogni giro una melodia diversa', W / 2, H * 0.56);
      ctx.fillStyle = '#e6c15a';
      ctx.fillText('Clicca per iniziare · ' + songTitle, W / 2, H * 0.66);
    }

    if (finished) {
      ctx.fillStyle = 'rgba(7,20,40,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.round(H * 0.055)}px "Palatino Linotype", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Bravo! Melodia completata', W / 2, H * 0.4);
      ctx.fillStyle = '#e6c15a';
      ctx.fillText(`★ ${score}`, W / 2, H * 0.5);
      ctx.fillStyle = '#dce6f8';
      ctx.font = `600 ${Math.round(H * 0.032)}px "Avenir Next", sans-serif`;
      ctx.fillText('Clicca per la prossima canzone di Natale', W / 2, H * 0.6);
    }
  }

  function tick(ts) {
    if (!open) return;
    const cv = canvas();
    if (!cv) return;
    if (!tick.last) tick.last = ts;
    let dt = Math.min(0.05, (ts - tick.last) / 1000);
    tick.last = ts;

    if (started && !finished) {
      notes.forEach((n) => {
        n.x -= scrollSpeed * dt;
        // auto-miss if passed hit line too far
        if (!n.judged && n.x < cv.width * HIT_X - GOOD) {
          n.judged = true;
          n.miss = true;
          combo = 0;
          misses += 1;
        }
      });
      if (notes.length && notes.every((n) => n.judged) && notes[notes.length - 1].x < cv.width * 0.05) {
        finished = true;
        msg = 'Yuletide!';
        msgT = 2;
        playTone(72, 0.35);
        setTimeout(() => playTone(76, 0.35), 120);
        setTimeout(() => playTone(79, 0.55), 240);
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
    const w = Math.min(920, box.clientWidth || 900);
    const h = Math.round(Math.min(520, Math.max(320, w * 0.52)));
    cv.width = w;
    cv.height = h;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
  }

  function openGame() {
    const el = overlay();
    if (!el) return;
    ensureAC();
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
    const el = overlay();
    if (el) el.hidden = true;
    document.body.classList.remove('tin-open');
    cancelAnimationFrame(raf);
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
      msg = 'Via!';
      msgT = 0.6;
      return;
    }
    if (finished) {
      loadSong(pickSong());
      started = true;
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
    });
    overlay()?.addEventListener('click', (e) => {
      if (e.target === overlay()) closeGame();
    });
    const cv = canvas();
    cv?.addEventListener('pointerdown', onPointer);
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
          return;
        }
        if (finished) {
          loadSong(pickSong());
          started = true;
          return;
        }
        judgeAt(canvas().width * HIT_X);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // expose for debugging
  window.__TIN = { open: openGame, close: closeGame };
})();
