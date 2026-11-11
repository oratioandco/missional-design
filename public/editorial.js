// Editorial motion layer (study 4, 23 October 2026): mobile menu, scroll-spy for "On this page",
// words of the closing line that light up, and the fallback for browsers without scroll-driven animations.
// The page is complete without this file. Motion is opt-in (html.motion, set in <head>) and never takes over scrolling.
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    /* mobile menu */
    var mast = document.querySelector('.e-mast'), mb = mast && mast.querySelector('.e-menu-btn');
    if (mb) {
      var isOpen = function () { return mast.classList.contains('menu-open'); };
      var setOpen = function (o) { mast.classList.toggle('menu-open', o); mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; };
      mb.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!isOpen()); });
      mast.querySelectorAll('.e-nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
      document.addEventListener('click', function (e) { if (isOpen() && !mast.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) { setOpen(false); mb.focus(); } });
      matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
    }

    /* split the closing line into words (inline spans; assistive technology reads the sentence as before) */
    document.querySelectorAll('[data-light-words]').forEach(function (p) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part; frag.appendChild(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      })(p);
      p.style.setProperty('--step', (80 / Math.max(1, i)).toFixed(3) + '%');
      p.style.setProperty('--w0', '6%');
    });

    /* scroll-spy: aria-current on the index link of the section in view */
    document.querySelectorAll('[data-spy]').forEach(function (nav) {
      if (!('IntersectionObserver' in window)) return;
      var links = nav.querySelectorAll('a[href^="#"]'), map = new Map();
      links.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) map.set(s, a); });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { links.forEach(function (a) { a.removeAttribute('aria-current'); }); map.get(e.target).setAttribute('aria-current', 'true'); }
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      map.forEach(function (_, s) { io.observe(s); });
    });

    if (!root.classList.contains('motion')) return;
    var sda = root.classList.contains('sda');

    /* reveal fallback (with scroll-driven animations the CSS handles it) */
    if (!sda && 'IntersectionObserver' in window) {
      var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px' });
      document.querySelectorAll('.ed .rv').forEach(function (el) { rio.observe(el); });
    }

    /* discrete word states always; the continuous numbers only without scroll timelines */
    var live = new Set();
    var watch = document.querySelectorAll('.e-lit, .e-line, .e-metal');
    var wio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? live.add(e.target) : live.delete(e.target); }); tick(); }, { rootMargin: '20% 0px 20% 0px' });
    watch.forEach(function (el) { wio.observe(el); });
    function clamp(x) { return Math.max(0, Math.min(1, x)); }
    function contain(el) { var b = el.getBoundingClientRect(); return clamp(-b.top / Math.max(1, b.height - innerHeight)); }
    function cover(el) { var b = el.getBoundingClientRect(); return clamp((innerHeight - b.top) / (innerHeight + b.height)); }
    var raf = 0, bar = document.querySelector('.e-progress i');
    function tick() {
      raf = 0;
      if (!root.classList.contains('motion')) return;
      if (!sda && bar) bar.style.setProperty('--e-read', (scrollY / Math.max(1, root.scrollHeight - innerHeight)).toFixed(4));
      live.forEach(function (el) {
        if (el.classList.contains('e-lit')) {
          var p = el.offsetHeight > innerHeight * 1.3 ? contain(el) : clamp((cover(el) - 0.25) / 0.5);
          if (sda) return;
          el.querySelector('.e-lit-stage').style.setProperty('--e-sp', p.toFixed(4));
          var ws = el.querySelectorAll('.w'), n = ws.length;
          ws.forEach(function (w, i) { w.classList.toggle('on', p > 0.06 + (i + 0.8) * (0.8 / n)); });
        } else if (!sda) {
          if (el.classList.contains('e-line')) el.style.setProperty('--e-ap', clamp((cover(el) - 0.25) / 0.5).toFixed(4));
          else el.style.setProperty('--e-p', (0.08 + 0.84 * clamp((cover(el) - 0.1) / 0.8)).toFixed(4));
        }
      });
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    window.addEventListener('resize', tick);
    tick();

    /* if the reader turns on reduced motion while the page is open, drop to the static layout */
    if (reduce.addEventListener) reduce.addEventListener('change', function (e) { if (e.matches) root.classList.remove('motion', 'sda'); });
  });
})();

// Spectrum layout of 8 Nov 2026: scroll cue and edge fade while stops overflow, and the
// position of the phone stills row. Local preview; at rollout this joins dist/editorial.js.
(function () {
  'use strict';
  var smooth = function () { return document.documentElement.classList.contains('motion') ? 'smooth' : 'auto'; };

  function axis(el) {
    var list = el.querySelector('.e-stops'), cue = el.querySelector('.e-cue');
    if (!list || !cue) return;
    var buttons = cue.querySelectorAll('.e-cue-b');
    function update() {
      var over = getComputedStyle(list).overflowX !== 'visible' && list.scrollWidth > list.clientWidth + 2;
      var start = list.scrollLeft <= 2, end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
      cue.hidden = !over;
      el.toggleAttribute('data-overflow', over);
      el.toggleAttribute('data-start', start);
      el.toggleAttribute('data-end', end);
      buttons[0].setAttribute('aria-disabled', String(start));
      buttons[1].setAttribute('aria-disabled', String(end));
    }
    cue.addEventListener('click', function (e) {
      var b = e.target.closest('.e-cue-b');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      list.scrollBy({ left: Number(b.dataset.dir) * list.clientWidth * 0.8, behavior: smooth() });
    });
    list.addEventListener('scroll', update, { passive: true });
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(update); ro.observe(list); [].forEach.call(list.children, function (c) { ro.observe(c); }); }
    else window.addEventListener('resize', update);
    window.addEventListener('load', update);
    if (document.fonts) document.fonts.ready.then(update);
    update();
  }

  function stills(el) {
    var row = el.querySelector('.e-stills-row'), pos = el.querySelector('[data-pos]');
    if (!row || !pos) return;
    function update() {
      var item = row.querySelector('li'); if (!item) return;
      var step = item.getBoundingClientRect().width + parseFloat(getComputedStyle(item.parentNode).columnGap || 0);
      var count = row.querySelectorAll('li').length;
      var i = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2 ? count : Math.round(row.scrollLeft / step) + 1;
      pos.textContent = String(Math.min(count, Math.max(1, i)));
    }
    row.addEventListener('scroll', update, { passive: true });
    update();
  }

  function ready() {
    [].forEach.call(document.querySelectorAll('.e-axis[data-spectrum]'), axis);
    [].forEach.call(document.querySelectorAll('.e-spectrum .e-stills'), stills);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();

// Compact pattern page (11 Nov 2026): a link to a folded section (Go further, More research) opens it.
(function () {
  function open() {
    var t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    var d = t.tagName === 'DETAILS' ? t : t.closest('details');
    if (d && !d.open) { d.open = true; t.scrollIntoView(); }
  }
  addEventListener('hashchange', open);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open); else open();
})();
