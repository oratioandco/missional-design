/* Missional by Design editorial layer (from editorial study 4, 23 Oct 2026): theme, menu, and scroll-linked light.
   Principle: the page is complete without this file. Motion is opt-in (html.motion) and never takes over scrolling. */
(function () {
  var root = document.documentElement;
  var q = new URLSearchParams(location.search);
  var de = (root.lang || '').slice(0, 2) === 'de';
  var T = de ? { light: 'Helles Design', dark: 'Dunkles Design', toLight: 'Zum hellen Design wechseln', toDark: 'Zum dunklen Design wechseln', menu: 'Menü', close: 'Schließen', play: 'Film abspielen ', pause: 'Pause ', again: 'Noch einmal ' }
            : { light: 'Light theme', dark: 'Dark theme', toLight: 'Switch to light theme', toDark: 'Switch to dark theme', menu: 'Menu', close: 'Close', play: 'Play the film ', pause: 'Pause ', again: 'Play again ' };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- theme ---------- */
  var t = q.get('theme') || store('mbd-theme');
  if (t === 'dark' || t === 'light') root.dataset.theme = t;
  function isDark() { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }

  /* ---------- motion ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var motion = !reduce.matches && q.get('static') !== '1';
  var sda = motion && window.CSS && CSS.supports('animation-timeline: view()') && q.get('nosda') !== '1';
  if (motion) root.classList.add('motion');
  if (sda) root.classList.add('sda');

  document.addEventListener('DOMContentLoaded', function () {
    /* theme button */
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      function label() { var d = isDark(); b.dataset.mode = d ? 'dark' : 'light'; b.setAttribute('aria-label', d ? T.toLight : T.toDark); b.title = d ? T.light : T.dark; }
      label();
      b.addEventListener('click', function () { root.dataset.theme = isDark() ? 'light' : 'dark'; store('mbd-theme', root.dataset.theme); label(); });
    });

    /* mobile menu */
    var mast = document.querySelector('.mast'), mb = document.querySelector('.menu-btn');
    if (mb) {
      var isOpen = function () { return mast.classList.contains('menu-open'); };
      function setOpen(o) { mast.classList.toggle('menu-open', o); mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? T.close : T.menu; }
      mb.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!isOpen()); });
      // Close on a link inside the menu, a tap outside it, Escape, or widening past the phone layout.
      mast.querySelectorAll('.nav a, .nav button:not(.pmenu-toggle):not(.pmenu-area-btn)').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
      document.addEventListener('click', function (e) { if (isOpen() && !mast.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) { setOpen(false); mb.focus(); } });
      matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
    }

    /* split the pinned statement into words (inline spans; text is read normally by assistive technology) */
    document.querySelectorAll('[data-light-words]').forEach(function (p) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span'); s.className = 'w' + (node.tagName === 'EM' ? ' k' : ''); s.style.setProperty('--i', i++); s.textContent = part; frag.appendChild(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !n.classList.contains('glint')) walk(n);
        });
      })(p);
      var span = parseFloat(p.dataset.span || 80), w0 = parseFloat(p.dataset.w0 || 6);
      p.style.setProperty('--step', (span / i).toFixed(3) + '%');
      p.style.setProperty('--w0', w0 + '%');
      p.dataset.n = i;
    });

    /* scroll-spy for rails and article index: aria-current on the link of the section in view */
    document.querySelectorAll('[data-spy]').forEach(function (nav) {
      var links = nav.querySelectorAll('a[href^="#"]');
      var map = new Map();
      links.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) map.set(s, a); });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { links.forEach(function (a) { a.removeAttribute('aria-current'); }); map.get(e.target).setAttribute('aria-current', 'true'); }
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      map.forEach(function (_, s) { io.observe(s); });
    });

    /* the neighborhood film: an image sequence drawn to a canvas. With motion, its progress follows the scroll
       (frame-accurate, no video seeking). Without motion it stays a still with an optional, silent play button. */
    document.querySelectorAll('.film').forEach(function (fig) {
      var n = +fig.dataset.count, base = fig.dataset.frames, cv = fig.querySelector('canvas'), ctx = cv.getContext('2d');
      var ok = new Array(n), asked = new Array(n), cur = -1, want = 0, playing = 0;
      var row = fig.closest('.case-film'), steps = row ? row.querySelectorAll('.film-steps li') : [];
      function load(i) {
        if (asked[i]) return; asked[i] = 1;
        var im = new Image(); im.decoding = 'async';
        im.onload = function () { ok[i] = im; if (Math.abs(i - want) <= 2) draw(want); };
        im.src = base + String(i + 1).padStart(3, '0') + '.webp';
      }
      function loadAll() { for (var s = 8; s >= 1; s = s / 2) for (var i = 0; i < n; i += s) load(i); }
      function nearest(i) { for (var d = 0; d < n; d++) { if (ok[i - d]) return i - d; if (ok[i + d]) return i + d; } return -1; }
      function draw(i) {
        var k = nearest(i); if (k < 0 || k === cur) return;
        ctx.drawImage(ok[k], 0, 0, cv.width, cv.height); cur = k; fig.classList.add('ready');
      }
      function setProgress(p) {
        p = Math.max(0, Math.min(1, p)); want = Math.round(p * (n - 1)); draw(want);
        fig.style.setProperty('--fp', p.toFixed(4));
        var k = Math.min(2, Math.floor(p * 3));
        steps.forEach(function (li, j) { li.classList.toggle('on', j <= k); });
      }
      var btn = fig.querySelector('.film-play');
      btn.addEventListener('click', function () {
        if (playing) { cancelAnimationFrame(playing); playing = 0; btn.setAttribute('aria-pressed', 'false'); btn.firstChild.textContent = T.play; return; }
        loadAll(); var t0 = performance.now(), start = cur > 0 && cur < n - 1 ? cur / (n - 1) : 0;
        btn.setAttribute('aria-pressed', 'true'); btn.firstChild.textContent = T.pause;
        (function step(t) {
          var p = start + (t - t0) / 16000;
          setProgress(p);
          if (p < 1) playing = requestAnimationFrame(step); else { playing = 0; btn.setAttribute('aria-pressed', 'false'); btn.firstChild.textContent = T.again; }
        })(t0);
      });
      if (!motion) return;
      var near = false;
      new IntersectionObserver(function (es) { near = es[0].isIntersecting; if (near) { loadAll(); tick(); } }, { rootMargin: '100% 0px 100% 0px' }).observe(row || fig);
      function tick() {
        if (!near || !root.classList.contains('motion')) return;
        var b = row.getBoundingClientRect(), p;
        if (row.offsetHeight > innerHeight * 1.3) p = -b.top / Math.max(1, b.height - innerHeight) * 1.08 - 0.02;   /* pinned: scrub across the pin */
        else { var f = fig.getBoundingClientRect(); p = ((innerHeight - f.top) / (innerHeight + f.height) - 0.22) / 0.56; }
        setProgress(p);
      }
      window.addEventListener('scroll', function () { requestAnimationFrame(tick); }, { passive: true });
      window.addEventListener('resize', tick);
    });

    if (!motion) return;

    /* reveal fallback (with scroll-driven animations the CSS handles it) */
    if (!sda) {
      var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px' });
      document.querySelectorAll('.rv').forEach(function (el) { rio.observe(el); });
    }

    /* horizontal sequence: measure how far the track travels */
    var seq = document.querySelector('.ways-seq'), track = seq && seq.querySelector('.track');
    function measure() {
      if (!track) return;
      var max = Math.max(0, track.scrollWidth - window.innerWidth);
      seq.style.setProperty('--hmax', max);
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    /* keyboard: when focus enters a panel that is off to the side, scroll the page to the point where that panel is in view */
    if (track) track.addEventListener('focusin', function (e) {
      if (window.innerWidth < 1024) return;
      var way = e.target.closest('.way'); if (!way) return;
      var max = parseFloat(getComputedStyle(seq).getPropertyValue('--hmax')) || 1;
      var want = Math.min(1, Math.max(0, (way.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft)) / max));
      var top = seq.getBoundingClientRect().top + window.scrollY;
      var travel = seq.offsetHeight - window.innerHeight;
      var y = top + travel * (0.04 + want * 0.92);
      window.scrollTo({ top: y, behavior: 'instant' });
      track.parentElement.scrollLeft = 0;
    });

    /* discrete states and the no-scroll-timeline fallback, computed only for elements near the viewport */
    var live = new Set();
    var watch = document.querySelectorAll('.lit, .ways-seq, .three, .sheen, .axis .line, .floor-css, .plate, .metal, .phones');
    var wio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? live.add(e.target) : live.delete(e.target); }); tick(); }, { rootMargin: '20% 0px 20% 0px' });
    watch.forEach(function (el) { wio.observe(el); });
    function clamp(x) { return Math.max(0, Math.min(1, x)); }
    function contain(el) { var b = el.getBoundingClientRect(); return clamp(-b.top / Math.max(1, b.height - innerHeight)); }
    function cover(el) { var b = el.getBoundingClientRect(); return clamp((innerHeight - b.top) / (innerHeight + b.height)); }
    var raf = 0;
    function tick() {
      raf = 0;
      if (!root.classList.contains('motion')) return;
      if (!sda) {
        var d = document.documentElement; root.style.setProperty('--read', (scrollY / Math.max(1, d.scrollHeight - innerHeight)).toFixed(4));
        var pr = document.querySelector('.progress i'); if (pr) pr.style.setProperty('--read', (scrollY / Math.max(1, d.scrollHeight - innerHeight)).toFixed(4));
      }
      live.forEach(function (el) {
        if (el.classList.contains('lit')) {
          var p = el.offsetHeight > innerHeight * 1.3 ? contain(el) : clamp((cover(el) - 0.25) / 0.5);
          if (!sda) {
            var stage = el.querySelector('.lit-stage');
            stage.style.setProperty('--sp', p.toFixed(4));
            if (el.classList.contains('rock')) {
              /* same curve as the CSS keyframes p-rock */
              var lp = clamp((p - 0.14) / 0.58);
              var fl = p < 0.52 ? 0 : p < 0.6 ? (p - 0.52) / 0.08 : p < 0.82 ? 1 - (p - 0.6) / 0.22 * 0.5 : 0.5;
              stage.style.setProperty('--lp', lp.toFixed(4));
              stage.style.setProperty('--fl', fl.toFixed(4));
            }
            var lw = el.querySelector('[data-light-words]');
            var ws = el.querySelectorAll('.w'), n = ws.length;
            var w0 = parseFloat((lw && lw.dataset.w0) || 6) / 100, sp = parseFloat((lw && lw.dataset.span) || 80) / 100;
            ws.forEach(function (w, i) { w.classList.toggle('on', p > w0 + (i + 0.8) * (sp / n)); });
          }
        } else if (el.classList.contains('ways-seq')) {
          if (!sda) el.querySelector('.ways-pin').style.setProperty('--hp', clamp((contain(el) - 0.04) / 0.92).toFixed(4));
        } else if (el.classList.contains('three')) {
          var bp = clamp((contain(el) - 0.08) / 0.62) * 2;
          if (!sda) el.querySelector('.three-cols').style.setProperty('--bp', bp.toFixed(4));
          el.querySelectorAll('.three-cols .col').forEach(function (c, i) { c.classList.toggle('on', Math.abs(bp - i) < 0.5 || (i === 2 && bp > 1.5)); });
        } else if (!sda) {
          if (el.classList.contains('sheen')) el.style.setProperty('--p', (0.08 + 0.84 * clamp((cover(el) - 0.1) / 0.8)).toFixed(4));
          else if (el.classList.contains('line')) el.style.setProperty('--ap', clamp((cover(el) - 0.25) / 0.5).toFixed(4));
          else if (el.classList.contains('floor-css')) el.style.setProperty('--fp', cover(el).toFixed(4));
          else if (el.classList.contains('plate')) el.style.setProperty('--v', cover(el).toFixed(4));
          else if (el.classList.contains('metal') || el.classList.contains('phones')) el.style.setProperty('--p', (0.08 + 0.84 * clamp((cover(el) - 0.1) / 0.8)).toFixed(4));
        }
      });
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    window.addEventListener('resize', tick);
    tick();

    /* if the reader turns on reduced motion while the page is open, drop to the static layout */
    reduce.addEventListener && reduce.addEventListener('change', function (e) { if (e.matches) root.classList.remove('motion', 'sda'); });
  });
})();
