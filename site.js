(() => {
  'use strict';

  const VIEWS = ['home', 'leggi', 'auguri', 'gioca'];
  const STORAGE_KEY = 'renna-lettura-v1';
  let libro = null;
  let soundOn = false;
  let audioCtx = null;
  let gameLoaded = false;
  let pendingLevel = null;
  let readDone = new Set();
  let bookmark = null; // { sectionId, chapter, title, audioTime, blockIndex, updatedAt }
  let audioManifest = null;
  let narrIndex = 0;
  let narrReady = false;
  let activeReadingId = null; // una sola sezione aperta per volta (niente cascata)
  let activeCueKey = null; // `${sectionId}:${blockIndex}` — evita flicker/scroll continui

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.done)) readDone = new Set(data.done);
      if (data.bookmark && data.bookmark.sectionId) bookmark = data.bookmark;
    } catch (_) {}
  }
  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ done: [...readDone], bookmark }),
      );
    } catch (_) {}
  }

  function setBookmark(opts = {}) {
    const sec =
      (opts.sectionId && libro?.sections?.find((s) => s.id === opts.sectionId)) ||
      libro?.sections?.find((s) => s.id === activeReadingId);
    if (!sec) return;
    let blockIndex = opts.blockIndex;
    if (!Number.isFinite(blockIndex)) blockIndex = bookmark?.sectionId === sec.id ? bookmark.blockIndex : 0;
    if (!Number.isFinite(blockIndex)) blockIndex = 0;
    bookmark = {
      sectionId: sec.id,
      chapter: sec.chapter || null,
      title: sec.title,
      audioTime: 0,
      blockIndex: Math.max(0, Number(blockIndex)),
      updatedAt: Date.now(),
    };
    saveProgress();
    updateBookmarkUI();
    placeBookmarkRibbon({ pulse: !!opts.chime });
    if (opts.chime) {
      soundOn = true;
      tin(3);
    }
  }

  function flashBookmarkSaved(blockIndex) {
    let toast = $('#bookmark-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bookmark-toast';
      toast.className = 'bookmark-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = `Segnalibro al paragrafo ${Number(blockIndex) + 1}`;
    toast.classList.add('is-visible');
    clearTimeout(flashBookmarkSaved._t);
    flashBookmarkSaved._t = setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  function clearBookmark() {
    bookmark = null;
    saveProgress();
    updateBookmarkUI();
    placeBookmarkRibbon();
  }

  function goToBookmark() {
    if (!bookmark?.sectionId || !libro) return;
    const sec = libro.sections.find((s) => s.id === bookmark.sectionId);
    if (!sec) return;
    openReading(sec, { updateHash: true, play: false });
    requestAnimationFrame(() => {
      placeBookmarkRibbon({ scroll: true, pulse: true });
    });
  }

  function updateBookmarkUI() {
    const btn = $('#btn-vai-segnalibro');
    if (btn) {
      if (bookmark?.sectionId) {
        btn.hidden = false;
        const where =
          Number.isFinite(bookmark.blockIndex) && bookmark.blockIndex > 0
            ? ` · §${bookmark.blockIndex + 1}`
            : '';
        btn.textContent = `🔖 ${bookmark.title || 'Segnalibro'}${where}`;
      } else {
        btn.hidden = true;
      }
    }
    $$('#toc-list a').forEach((a) => {
      const id = a.dataset.openSection;
      a.classList.toggle('has-bookmark', !!(bookmark && id && id === bookmark.sectionId));
    });
    $$('[data-bookmark-toggle]').forEach((b) => {
      const on = bookmark && bookmark.sectionId === activeReadingId;
      b.classList.toggle('is-set', !!on);
      b.title = on
        ? 'Segnalibro su questa pagina — doppio clic su un altro paragrafo per spostarlo'
        : 'Doppio clic su un paragrafo per segnarlo';
    });
    const hint = $('#bookmark-dock-hint');
    if (hint) {
      hint.textContent = bookmark?.sectionId === activeReadingId
        ? 'Segnato — doppio clic su un altro paragrafo per spostarlo'
        : 'Doppio clic sul paragrafo da segnare';
    }
  }

  function placeBookmarkRibbon(opts = {}) {
    $$('.bookmark-ribbon, .bookmark-drop-glow').forEach((el) => el.remove());
    $$('.blocks p.is-bookmarked').forEach((p) => p.classList.remove('is-bookmarked'));
    if (!bookmark?.sectionId || bookmark.sectionId !== activeReadingId) return;
    const root =
      document.getElementById(
        bookmark.chapter ? `capitolo-${bookmark.chapter}` : bookmark.sectionId,
      ) || $('#reader-body .section-block');
    if (!root) return;
    const ps = $$('.blocks p', root);
    const idx = Math.max(0, Math.min(ps.length - 1, Number(bookmark.blockIndex) || 0));
    const p = ps[idx];
    if (!p) return;
    p.classList.add('is-bookmarked');
    const ribbon = document.createElement('button');
    ribbon.type = 'button';
    ribbon.className = 'bookmark-ribbon';
    ribbon.draggable = true;
    ribbon.dataset.bookmarkRibbon = '1';
    ribbon.title = 'Segnalibro qui — trascina su un altro paragrafo';
    ribbon.setAttribute('aria-label', 'Segnalibro sul margine — trascina per spostarlo');
    // solo nastro nel margine: nessuna etichetta sopra le parole
    ribbon.innerHTML = '<span class="visually-hidden">Segnalibro</span>';
    p.prepend(ribbon);
    if (opts.pulse) {
      ribbon.classList.add('is-pulse');
      setTimeout(() => ribbon.classList.remove('is-pulse'), 1200);
    }
    if (opts.scroll) {
      const topPad = document.body.classList.contains('has-narrator') ? 130 : 80;
      const rect = p.getBoundingClientRect();
      if (rect.top < topPad || rect.bottom > window.innerHeight - 80) {
        p.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function nearestParagraphFromPoint(x, y) {
    const root = $('#reader-body .section-block') || $('#reader-body');
    if (!root) return null;
    const ps = $$('.blocks p', root);
    if (!ps.length) return null;
    let best = null;
    let bestDist = Infinity;
    for (const p of ps) {
      const r = p.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return p;
      const cx = clampNum(x, r.left, r.right);
      const cy = clampNum(y, r.top, r.bottom);
      const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  function clampNum(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function audioTimeForBlock(sectionId, blockIndex) {
    const meta = audioManifest?.sections?.find((s) => s.id === sectionId);
    const cue = meta?.cues?.find((c) => c.blockIndex === Number(blockIndex));
    return cue ? cue.start : undefined;
  }

  function wireBookmarkDrag() {
    const body = $('#reader-body');
    if (!body || body.dataset.bookmarkDragWired === '1') return;
    body.dataset.bookmarkDragWired = '1';

    let dragging = false;

    const clearGlow = () => $$('.bookmark-drop-glow').forEach((el) => el.classList.remove('bookmark-drop-glow'));

    body.addEventListener('dragstart', (e) => {
      const handle = e.target.closest('[data-bookmark-handle], [data-bookmark-ribbon]');
      if (!handle) return;
      dragging = true;
      document.body.classList.add('is-dragging-bookmark');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'bookmark');
      try {
        const ghost = document.createElement('div');
        ghost.className = 'bookmark-drag-ghost';
        ghost.textContent = '🔖';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 18, 28);
        setTimeout(() => ghost.remove(), 0);
      } catch (_) {}
    });

    body.addEventListener('dragend', () => {
      dragging = false;
      document.body.classList.remove('is-dragging-bookmark');
      clearGlow();
    });

    body.addEventListener('dragover', (e) => {
      if (!dragging && !document.body.classList.contains('is-dragging-bookmark')) return;
      e.preventDefault();
      const p = nearestParagraphFromPoint(e.clientX, e.clientY);
      clearGlow();
      if (p) p.classList.add('bookmark-drop-glow');
    });

    body.addEventListener('drop', (e) => {
      e.preventDefault();
      document.body.classList.remove('is-dragging-bookmark');
      const p = nearestParagraphFromPoint(e.clientX, e.clientY);
      clearGlow();
      if (!p || !activeReadingId) return;
      const blockIndex = Number(p.dataset.blockIndex);
      if (!Number.isFinite(blockIndex)) return;
      setBookmark({
        sectionId: activeReadingId,
        blockIndex,
        audioTime: 0,
        chime: true,
      });
      flashBookmarkSaved(blockIndex);
    });

    // Doppio clic sul paragrafo → segnalibro
    body.addEventListener('dblclick', (e) => {
      const p = e.target.closest('.blocks p[data-block-index]');
      if (!p || !activeReadingId) return;
      if (e.target.closest('a, button, .bookmark-ribbon, .chapter-toolbar')) return;
      e.preventDefault();
      const blockIndex = Number(p.dataset.blockIndex);
      if (!Number.isFinite(blockIndex)) return;
      setBookmark({
        sectionId: activeReadingId,
        blockIndex,
        audioTime: 0,
        chime: true,
      });
      flashBookmarkSaved(blockIndex);
    });

    // touch fallback: tap lungo sul nastro dock → poi tap sul paragrafo
    let armPlace = false;
    body.addEventListener('pointerup', (e) => {
      const dock = e.target.closest('[data-bookmark-handle]');
      if (dock && e.pointerType === 'touch') {
        armPlace = true;
        document.body.classList.add('is-placing-bookmark');
        const hint = $('#bookmark-dock-hint');
        if (hint) hint.textContent = 'Tocca il paragrafo da segnare';
        return;
      }
      if (!armPlace) return;
      const p = e.target.closest('.blocks p');
      armPlace = false;
      document.body.classList.remove('is-placing-bookmark');
      if (!p || !activeReadingId) return;
      const blockIndex = Number(p.dataset.blockIndex);
      if (!Number.isFinite(blockIndex)) return;
      setBookmark({
        sectionId: activeReadingId,
        blockIndex,
        audioTime: 0,
        chime: true,
      });
      flashBookmarkSaved(blockIndex);
    });
  }

  function ensureAudio() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    audioCtx = new A();
    return audioCtx;
  }

  function tin(pitch = 0) {
    if (!soundOn) return;
    const ac = ensureAudio();
    if (!ac) return;
    const t0 = ac.currentTime;
    const f = 1568 * Math.pow(2, pitch / 12);
    [[f, 0.9, 0.22], [f * 2.76, 0.5, 0.07], [f * 5.4, 0.25, 0.03]].forEach(([freq, dur, vol]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    });
  }

  function ringButton(btn) {
    if (!btn) return;
    btn.classList.remove('ring');
    void btn.offsetWidth;
    btn.classList.add('ring');
    tin();
  }

  function currentView() {
    const h = (location.hash || '#home').replace(/^#/, '').split('?')[0];
    if (h.startsWith('capitolo-')) return 'leggi';
    if (VIEWS.includes(h)) return h;
    return 'home';
  }

  function showView(name) {
    VIEWS.forEach((v) => {
      const el = $(`#view-${v}`);
      if (!el) return;
      const on = v === name;
      el.hidden = !on;
    });
    document.body.classList.toggle('on-leggi', name === 'leggi');
    $$('.nav a[data-nav]').forEach((a) => {
      a.setAttribute('aria-current', a.dataset.nav === name ? 'page' : 'false');
    });
    if (name === 'gioca') loadGame();
    if (name === 'leggi') {
      const s = sectionFromHash();
      if (s && s.id !== activeReadingId) openReading(s, { updateHash: false, play: false });
      $('#reader')?.focus({ preventScroll: true });
    }
    if (name === 'home' || name === 'auguri') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function route() {
    showView(currentView());
  }

  /** Sezioni leggibili una per volta (niente libro intero in cascata). */
  function readableSections() {
    return (libro?.sections || []).filter((s) =>
      s.kind === 'note' || s.kind === 'chapter' || s.kind === 'titlepage',
    );
  }

  function sectionFromHash() {
    const h = (location.hash || '').replace(/^#/, '').split('?')[0];
    if (!libro) return null;
    if (h.startsWith('capitolo-')) {
      const n = Number(h.split('-')[1]);
      return libro.sections.find((s) => s.kind === 'chapter' && Number(s.chapter) === n) || null;
    }
    if (h === 'leggi' || h === '') {
      return libro.sections.find((s) => s.kind === 'chapter' && s.chapter === 1)
        || readableSections()[0]
        || null;
    }
    return libro.sections.find((s) => s.id === h) || null;
  }

  function hashForSection(s) {
    if (!s) return 'leggi';
    if (s.kind === 'chapter') return `capitolo-${s.chapter}`;
    return s.id;
  }

  function syncReadingFromHash() {
    const s = sectionFromHash();
    if (s) openReading(s, { updateHash: false, play: false });
  }

  function loadGame(level) {
    const frame = $('#game-frame');
    if (!frame) return;
    if (level != null && level !== '') pendingLevel = Number(level);
    const q = new URLSearchParams();
    q.set('from', 'libro');
    q.set('v', String(Date.now() % 1e9)); // evita cache stantia nell’iframe
    if (pendingLevel) {
      q.set('level', String(pendingLevel));
      pendingLevel = null;
      gameLoaded = false;
    }
    const src = `gioca/index.html?${q.toString()}`;
    const blank = !frame.src || frame.src === 'about:blank' || frame.getAttribute('src') === 'about:blank';
    if (!gameLoaded || q.has('level') || blank || !String(frame.src).includes('gioca/index.html')) {
      frame.src = src;
      gameLoaded = true;
      frame.addEventListener(
        'load',
        () => {
          try {
            frame.focus();
            frame.contentWindow?.focus?.();
            frame.contentDocument?.getElementById('c')?.focus?.();
          } catch (_) {}
        },
        { once: true },
      );
    } else {
      try {
        frame.focus();
        frame.contentWindow?.focus?.();
      } catch (_) {}
    }
  }

  function markChapter(n) {
    if (!n) return;
    readDone.add(Number(n));
    saveProgress();
    updateProgressUI();
  }

  function updateProgressUI() {
    const chapters = (libro?.sections || []).filter((s) => s.kind === 'chapter');
    const total = chapters.length || 14;
    const done = [...readDone].filter((n) => n >= 1 && n <= total).length;
    const pct = Math.round((done / total) * 100);
    const pctEl = $('#progress-pct');
    const bar = $('#progress-bar');
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (bar) bar.style.width = `${pct}%`;
    $$('#toc-list a[data-chapter]').forEach((a) => {
      const n = Number(a.dataset.chapter);
      a.classList.toggle('done', readDone.has(n));
    });
  }

  function renderToc() {
    const list = $('#toc-list');
    if (!list || !libro) return;
    list.innerHTML = '';
    libro.sections.forEach((s) => {
      if (s.kind === 'titlepage') return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      if (s.kind === 'chapter') {
        a.href = `#capitolo-${s.chapter}`;
        a.dataset.chapter = String(s.chapter);
        a.dataset.openSection = s.id;
        a.className = 'toc-chapter';
        a.textContent = s.title;
        a.title = 'Apri questo capitolo';
      } else if (s.kind === 'augurio') {
        a.href = '#auguri';
        a.dataset.nav = 'auguri';
        a.textContent = s.title;
        a.title = 'Apri gli auguri';
      } else if (s.kind === 'gioca') {
        a.href = '#gioca';
        a.dataset.nav = 'gioca';
        a.textContent = s.title;
      } else if (s.kind === 'note') {
        a.href = `#${s.id}`;
        a.dataset.openSection = s.id;
        a.textContent = s.title;
        a.title = 'Apri la nota dell’autore';
      } else {
        a.href = `#${s.id}`;
        a.dataset.openSection = s.id;
        a.textContent = s.title;
      }
      li.appendChild(a);
      list.appendChild(li);
    });
    highlightToc();
  }

  function highlightToc() {
    $$('#toc-list a').forEach((a) => {
      const open = a.dataset.openSection;
      const ch = a.dataset.chapter;
      let on = false;
      if (ch && activeReadingId) {
        const cur = libro?.sections?.find((s) => s.id === activeReadingId);
        on = cur && String(cur.chapter) === String(ch);
      } else if (open) on = open === activeReadingId;
      a.setAttribute('aria-current', on ? 'true' : 'false');
      a.classList.toggle('is-open', on);
    });
  }

  function neighborSections(section) {
    const list = readableSections();
    const i = list.findIndex((s) => s.id === section.id);
    return {
      prev: i > 0 ? list[i - 1] : null,
      next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
      index: i,
      total: list.length,
    };
  }

  function openReading(section, opts = {}) {
    if (!section || !libro) return;
    const { updateHash = true, play = false } = opts;
    activeReadingId = section.id;
    if (section.kind === 'chapter') markChapter(section.chapter);

    const body = $('#reader-body');
    if (!body) return;
    body.innerHTML = '';

    const { prev, next } = neighborSections(section);

    const sec = document.createElement('section');
    sec.className = `section-block kind-${section.kind} is-alone`;
    sec.id = section.kind === 'chapter' ? `capitolo-${section.chapter}` : section.id;
    sec.dataset.kind = section.kind;
    sec.dataset.sectionId = section.id;
    if (section.chapter) sec.dataset.chapter = String(section.chapter);

    // CONTROLLI COMPATTI: una sola riga, poco spazio sottratto al testo
    const tool = document.createElement('div');
    tool.className = 'chapter-toolbar';
    const playBtn =
      section.kind === 'chapter'
        ? `<button type="button" class="tool-btn tool-play" data-play-level="${section.chapter}" title="Gioca il livello">Gioca</button>`
        : '';
    const prevBtn = prev
      ? `<button type="button" class="tool-btn tool-nav" data-open-section="${prev.id}" title="Precedente">‹</button>`
      : `<span class="tool-btn tool-nav is-disabled" aria-hidden="true">‹</span>`;
    let nextBtn = '';
    if (next) {
      nextBtn = `<button type="button" class="tool-btn tool-nav tool-next" data-open-section="${next.id}" title="Successivo">›</button>`;
    } else if (section.kind === 'chapter') {
      nextBtn = `<a class="tool-btn tool-nav tool-next" href="#auguri" data-nav="auguri" title="Auguri">›</a>`;
    } else {
      nextBtn = `<span class="tool-btn tool-nav is-disabled" aria-hidden="true">›</span>`;
    }
    const label =
      section.kind === 'chapter'
        ? `Cap. ${section.chapter}/14`
        : section.kind === 'note'
          ? 'Nota'
          : 'Inizio';
    const otherBm =
      bookmark?.sectionId && bookmark.sectionId !== section.id
        ? `<button type="button" class="tool-btn tool-ghost" data-go-bookmark title="Vai al segnalibro">↩ Segna</button>`
        : '';
    tool.innerHTML = `
      <div class="toolbar-cluster">
        ${prevBtn}
        <span class="toolbar-label">${escapeHtml(label)}</span>
        ${nextBtn}
      </div>
      <div class="toolbar-cluster toolbar-actions">
        ${playBtn}
        ${otherBm}
        <button type="button" class="bookmark-dock" data-bookmark-handle draggable="true" title="Trascina il nastro sul paragrafo da segnare" aria-label="Segnalibro trascinabile">
          <span class="bookmark-dock-ribbon" aria-hidden="true"></span>
          <span class="bookmark-dock-text">Nastro</span>
        </button>
        <button type="button" class="tool-btn tool-ghost" data-bookmark-toggle title="Fissa qui (o trascina il nastro)">📌</button>
        ${bookmark?.sectionId === section.id ? `<button type="button" class="tool-btn tool-ghost" data-clear-bookmark title="Rimuovi segnalibro">✕</button>` : ''}
      </div>
      <p class="bookmark-dock-hint" id="bookmark-dock-hint">Doppio clic sul paragrafo da segnare</p>`;
    sec.appendChild(tool);

    if (section.kind === 'chapter' && section.chapter) {
      const opener = document.createElement('div');
      opener.className = 'chapter-opener';
      opener.innerHTML = `
        <p class="chapter-opener-kicker">Capitolo</p>
        <div class="chapter-opener-num">${escapeHtml(String(section.chapter))}</div>
        <div class="chapter-opener-ornament" aria-hidden="true"></div>`;
      sec.appendChild(opener);
    }

    const h = document.createElement('h2');
    h.textContent = section.title.replace(/^\d+\.\s*/, '');
    sec.appendChild(h);

    if (section.image) {
      const fig = document.createElement('figure');
      fig.className = 'illust';
      fig.innerHTML = `<img src="${section.image}" alt="Illustrazione: ${escapeAttr(section.title)}" loading="eager">`;
      sec.appendChild(fig);
    }

    const blocks = document.createElement('div');
    blocks.className = 'blocks';
    let blockIdx = 0;
    let firstPara = true;
    (section.blocks || []).forEach((b) => {
      if (b.type === 'p' || b.type === 'quote') {
        const p = document.createElement('p');
        p.dataset.blockIndex = String(blockIdx);
        if (b.type === 'quote') {
          p.className = 'is-quote';
          p.innerHTML = `<em>${b.html}</em>`;
        } else {
          p.innerHTML = b.html;
          if (firstPara && section.kind === 'chapter') {
            p.classList.add('is-lead');
            firstPara = false;
          }
        }
        blocks.appendChild(p);
        blockIdx += 1;
      }
    });
    sec.appendChild(blocks);

    // piede leggero: solo avanti
    if (next || section.kind === 'chapter') {
      const foot = document.createElement('div');
      foot.className = 'chapter-foot';
      if (next) {
        foot.innerHTML = `<button type="button" class="btn btn-primary btn-sm" data-open-section="${next.id}">Continua: ${
          next.kind === 'chapter' ? `capitolo ${next.chapter}` : escapeHtml(next.title)
        } ›</button>`;
      } else {
        foot.innerHTML = `<a class="btn btn-primary btn-sm" href="#auguri" data-nav="auguri">Leggi gli auguri ›</a>`;
      }
      sec.appendChild(foot);
    }

    body.appendChild(sec);

    highlightToc();
    updateProgressUI();
    updateBookmarkUI();
    wireBookmarkDrag();
    placeBookmarkRibbon();

    VIEWS.forEach((v) => {
      const el = $(`#view-${v}`);
      if (el) el.hidden = v !== 'leggi';
    });
    document.body.classList.add('on-leggi');
    $$('.nav a[data-nav]').forEach((a) => {
      a.setAttribute('aria-current', a.dataset.nav === 'leggi' ? 'page' : 'false');
    });

    const wantHash = hashForSection(section);
    if (updateHash && location.hash.replace(/^#/, '') !== wantHash) {
      location.hash = wantHash;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    const reader = $('#reader');
    if (reader) reader.scrollTop = 0;

    void play;
  }

  function renderReader() {
    // Compat: all’avvio apre dal hash (una sola pagina)
    const s = sectionFromHash() || readableSections()[0];
    if (s) openReading(s, { updateHash: false, play: false });
  }

  function renderAuguri() {
    const box = $('#auguri-body');
    if (!box || !libro) return;
    const s = libro.sections.find((x) => x.kind === 'augurio');
    if (!s) return;
    box.innerHTML = (s.blocks || [])
      .filter((b) => b.type === 'p')
      .map((b, i) => `<p data-block-index="${i}">${b.html}</p>`)
      .join('');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function observeReading() {
    const nodes = $$('.section-block[data-chapter]');
    if (!nodes.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const n = Number(en.target.dataset.chapter);
          markChapter(n);
          $$('#toc-list a[data-chapter]').forEach((a) => {
            a.setAttribute('aria-current', Number(a.dataset.chapter) === n ? 'true' : 'false');
          });
        });
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.01 }
    );
    nodes.forEach((n) => io.observe(n));
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function clearReadingHighlight() {
    $$('.blocks p.reading, #auguri-body p.reading').forEach((p) => {
      p.classList.remove('reading');
      p.removeAttribute('aria-current');
    });
    activeCueKey = null;
  }

  /** Cue attivo: tiene il paragrafo anche nei piccoli silenzi tra un pezzo e l’altro. */
  function cueAtTime(cues, t) {
    if (!cues?.length) return null;
    let active = cues[0];
    for (const c of cues) {
      if (t + 0.05 >= c.start) active = c;
      else break;
    }
    return active;
  }

  function readingRootForSection(sectionId) {
    const meta = audioManifest?.sections.find((x) => x.id === sectionId);
    if (meta?.kind === 'augurio') return $('#auguri-body') || $('#view-auguri');
    if (meta?.kind === 'chapter') {
      return document.getElementById(`capitolo-${meta.chapter}`) || document.getElementById(sectionId);
    }
    return document.getElementById(sectionId) || $('#reader-body .section-block');
  }

  function highlightCue(sectionId, blockIndex, opts = {}) {
    const key = `${sectionId}:${blockIndex}`;
    if (!opts.force && activeCueKey === key) return;
    const root = readingRootForSection(sectionId);
    if (!root) return;
    const ps = $$('p[data-block-index], .blocks p, #auguri-body p', root);
    // prefer data-block-index match (allineato ai cue del manifesto)
    let p =
      ps.find((el) => Number(el.dataset.blockIndex) === Number(blockIndex)) ||
      ps[blockIndex];
    if (!p) return;

    $$('.blocks p.reading, #auguri-body p.reading').forEach((el) => {
      if (el !== p) {
        el.classList.remove('reading');
        el.removeAttribute('aria-current');
      }
    });
    p.classList.add('reading');
    p.setAttribute('aria-current', 'true');
    activeCueKey = key;

    const topPad = document.body.classList.contains('has-narrator') ? 160 : 90;
    const rect = p.getBoundingClientRect();
    if (rect.top < topPad || rect.bottom > window.innerHeight - 100) {
      p.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showNarratorBar() {
    document.body.classList.remove('has-narrator');
  }

  function goToSection(sectionId, chapterNum) {
    if (chapterNum) {
      const sec = libro?.sections?.find((s) => s.kind === 'chapter' && Number(s.chapter) === Number(chapterNum));
      if (sec) {
        openReading(sec, { updateHash: true, play: false });
        return;
      }
    }
    const sec = libro?.sections?.find((s) => s.id === sectionId);
    if (!sec) return;
    if (sec.kind === 'augurio') {
      if (location.hash.replace(/^#/, '') !== 'auguri') location.hash = 'auguri';
      showView('auguri');
      return;
    }
    if (sec.kind === 'gioca') {
      location.hash = 'gioca';
      showView('gioca');
      loadGame();
      return;
    }
    openReading(sec, { updateHash: true, play: false });
  }

  function wireReadingChrome() {
    showNarratorBar();
    $('#btn-vai-segnalibro')?.addEventListener('click', () => goToBookmark());
  }

  function snow() {
    const cv = $('#neve');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let flakes = [];
    let w = 0;
    let h = 0;
    function resize() {
      w = cv.width = window.innerWidth * devicePixelRatio;
      h = cv.height = window.innerHeight * devicePixelRatio;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
      flakes = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 12)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (1 + Math.random() * 2.2) * devicePixelRatio,
        v: (0.4 + Math.random() * 1.1) * devicePixelRatio,
        drift: (Math.random() - 0.5) * 0.4 * devicePixelRatio,
      }));
    }
    resize();
    window.addEventListener('resize', resize);
    function tick() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      flakes.forEach((f) => {
        f.y += f.v;
        f.x += f.drift + Math.sin(f.y * 0.01) * 0.2;
        if (f.y > h) {
          f.y = -5;
          f.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  async function init() {
    loadProgress();
    snow();

    const res = await fetch('libro.json');
    libro = await res.json();
    audioManifest = null;
    renderToc();
    renderReader();
    renderAuguri();
    updateProgressUI();
    updateBookmarkUI();
    wireReadingChrome();
    route();
    // Se arrivi a #leggi senza capitolo e c’è segnalibro, riprendi
    const h0 = (location.hash || '').replace(/^#/, '');
    if (h0 === 'leggi' && bookmark?.sectionId) {
      goToBookmark();
    }

    document.body.addEventListener('click', (e) => {
      // Indice: ENTRA nel capitolo (pagina intera), senza cascata
      const tocItem = e.target.closest('#toc-list a');
      if (tocItem) {
        e.preventDefault();
        if (tocItem.dataset.nav === 'gioca') {
          location.hash = 'gioca';
          showView('gioca');
          loadGame();
          return;
        }
        if (tocItem.dataset.nav === 'auguri') {
          location.hash = 'auguri';
          showView('auguri');
          return;
        }
        const openId = tocItem.dataset.openSection;
        const chapter = tocItem.dataset.chapter ? Number(tocItem.dataset.chapter) : null;
        if (openId) {
          const sec = libro.sections.find((s) => s.id === openId);
          if (sec) openReading(sec, { updateHash: true, play: false });
          return;
        }
        if (chapter) {
          goToSection(null, chapter);
          return;
        }
        return;
      }
      const openBtn = e.target.closest('[data-open-section]');
      if (openBtn) {
        e.preventDefault();
        const sec = libro?.sections?.find((s) => s.id === openBtn.dataset.openSection);
        if (sec) {
          openReading(sec, { updateHash: true, play: false });
          setBookmark({ sectionId: sec.id, audioTime: 0 });
        }
        return;
      }
      if (e.target.closest('[data-bookmark-toggle]')) {
        e.preventDefault();
        const reading = $('.blocks p.reading');
        let blockIndex = reading ? Number(reading.dataset.blockIndex) : NaN;
        if (!Number.isFinite(blockIndex)) {
          // paragrafo più vicino al centro viewport
          const paras = $$('.blocks p[data-block-index]');
          const mid = window.innerHeight * 0.35;
          let best = paras[0];
          let bestDist = Infinity;
          paras.forEach((p) => {
            const r = p.getBoundingClientRect();
            const d = Math.abs(r.top + r.height / 2 - mid);
            if (d < bestDist) {
              bestDist = d;
              best = p;
            }
          });
          blockIndex = best ? Number(best.dataset.blockIndex) || 0 : 0;
        }
        setBookmark({
          blockIndex,
          audioTime: 0,
          chime: true,
        });
        flashBookmarkSaved(blockIndex);
        return;
      }
      if (e.target.closest('[data-go-bookmark]')) {
        e.preventDefault();
        goToBookmark();
        return;
      }
      if (e.target.closest('[data-clear-bookmark]')) {
        e.preventDefault();
        clearBookmark();
        openReading(
          libro.sections.find((s) => s.id === activeReadingId) || readableSections()[0],
          { updateHash: false, play: false },
        );
        return;
      }
      const play = e.target.closest('[data-play-level]');
      if (play) {
        e.preventDefault();
        const level = Number(play.dataset.playLevel);
        markChapter(level);
        tin(2);
        location.hash = 'gioca';
        showView('gioca');
        loadGame(level);
        return;
      }
      const nav = e.target.closest('a[data-nav]');
      if (nav && VIEWS.includes(nav.dataset.nav)) {
        tin(-2);
        if (nav.dataset.nav === 'gioca') {
          // forza caricamento iframe anche se hash già #gioca
          setTimeout(() => loadGame(), 0);
        }
      }
      // Il sonaglio in copertina apre il pentagramma (tin-game.js). Qui solo chip data-tin generici.
      if (e.target.closest('[data-tin]')) {
        e.preventDefault();
        soundOn = true;
        $('#btn-suono')?.setAttribute('aria-pressed', 'true');
        ringButton(e.target.closest('.sonaglio') || e.target);
        tin();
      }
    });

    $('#btn-suono')?.addEventListener('click', () => {
      soundOn = !soundOn;
      $('#btn-suono').setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      if (soundOn) {
        ensureAudio();
        tin();
      }
    });

    $('#btn-fullscreen')?.addEventListener('click', () => {
      const frame = $('#game-frame');
      if (!frame) return;
      if (frame.requestFullscreen) frame.requestFullscreen();
      else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
    });

    // Briciola nell’iframe non riceve lo Space se il focus è sulla pagina padre:
    // inoltra i tasti di salto quando la vista gioco è aperta.
    window.addEventListener('keydown', (e) => {
      if (currentView() !== 'gioca') return;
      if (e.repeat) return;
      const code = e.code || e.key;
      const isJump =
        code === 'Space' ||
        code === ' ' ||
        code === 'ArrowUp' ||
        code === 'KeyW' ||
        code === 'Enter';
      if (!isJump) return;
      const frame = $('#game-frame');
      if (!frame) return;
      e.preventDefault();
      try {
        frame.contentWindow?.__BV_KEY?.(code === ' ' ? 'Space' : code);
        frame.contentWindow?.focus?.();
        frame.focus?.();
      } catch (_) {}
    });

    window.addEventListener('hashchange', route);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
