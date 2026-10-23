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
