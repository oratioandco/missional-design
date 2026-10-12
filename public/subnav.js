// Sticky "On this page" bar: highlights the section in view and slides an underline to it.
(function () {
  var nav = document.querySelector('.subnav'); if (!nav) return;
  var row = nav.querySelector('div'), links = [].slice.call(row.querySelectorAll('a'));
  var ink = document.createElement('span'); ink.className = 'subnav-ink'; ink.setAttribute('aria-hidden', 'true'); row.appendChild(ink);
  var current = null;
  function place(a, instant) {
    if (!a) { ink.style.opacity = 0; return; }
    if (instant) ink.style.transition = 'none';
    ink.style.opacity = 1; ink.style.width = a.offsetWidth + 'px'; ink.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    if (instant) { ink.offsetWidth; ink.style.transition = ''; }
  }
  function mark(id, instant) {
    var a = null;
    links.forEach(function (l) { if (l.getAttribute('href') === '#' + id) a = l; else l.removeAttribute('aria-current'); });
    if (!a || a === current) return;
    current = a; a.setAttribute('aria-current', 'location'); place(a, instant);
    var left = a.offsetLeft - 16, right = a.offsetLeft + a.offsetWidth + 16;
    if (left < row.scrollLeft || right > row.scrollLeft + row.clientWidth) row.scrollTo({ left: left, behavior: 'smooth' });
  }
  links.forEach(function (a) { a.addEventListener('click', function () { mark(a.getAttribute('href').slice(1)); }); });
  window.addEventListener('resize', function () { place(current, true); });
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (e) { nav.classList.toggle('stuck', e[0].intersectionRatio < 1); }, { threshold: [1], rootMargin: '-1px 0px 0px 0px' }).observe(nav);
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var seen = {}, first = true;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
    for (var i = 0; i < targets.length; i++) if (targets[i] && seen[targets[i].id]) { mark(targets[i].id, first); break; }
    first = false;
  }, { rootMargin: '-80px 0px -55% 0px' });
  targets.forEach(function (t) { if (t) io.observe(t); });
})();
