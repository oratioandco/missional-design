// Studio for working examples (see comparisons.py).
// Options follow the ARIA tabs pattern: arrow keys, Home and End move between options; selection follows focus.
// Changing the option reloads the example so every option starts from the same state. Changing a setting is sent to the
// running example (interactive/src/live.ts), which updates in place; examples that do not listen are reloaded instead.
(function () {
  if (window.__compareReady) return; window.__compareReady = true;
  function init(root) {
    var tabs = [].slice.call(root.querySelectorAll('[role=tab]'));
    var panels = [].slice.call(root.querySelectorAll('[role=tabpanel]'));
    var frame = root.querySelector('iframe'), demo = root.getAttribute('data-demo');
    var current = tabs[0].getAttribute('data-variant');
    var picker = root.querySelector('select[data-option]');
    if (picker) picker.addEventListener('change', function () { tabs.forEach(function (t) { if (t.getAttribute('data-variant') === picker.value) select(t); }); });
    var live = false;
    // Hide the settings area when no setting applies to the chosen option.
    function settingsVisibility() { var box = root.querySelector('.rail-settings'); if (box) box.classList.toggle('is-empty', !box.querySelector('fieldset:not([disabled])')); }
    settingsVisibility();
    window.addEventListener('message', function (e) { if (e.source === frame.contentWindow && e.data && e.data.type === 'bf-live') live = true; });
    function query() {
      var q = 'v=' + current;
      [].forEach.call(root.querySelectorAll('fieldset[data-param]'), function (f) {
        var r = f.querySelector('input:checked'); if (r && r.value) q += '&' + f.getAttribute('data-param') + '=' + r.value;
      });
      return q;
    }
    function load() { live = false; frame.src = demo + (demo.indexOf('?') < 0 ? '?' : '&') + query(); }
    function update() {
      if (!live || !frame.contentWindow) return load();
      var base = demo.indexOf('?') < 0 ? '' : demo.slice(demo.indexOf('?') + 1) + '&';
      frame.contentWindow.postMessage({ type: 'bf-params', query: base + query() }, location.origin);
    }
    function select(tab, focus) {
      current = tab.getAttribute('data-variant');
      tabs.forEach(function (t) { var on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== current; });
      [].forEach.call(root.querySelectorAll('fieldset[data-applies]'), function (f) { f.disabled = f.getAttribute('data-applies').split(' ').indexOf(current) < 0; });
      settingsVisibility();
      if (focus) tab.focus();
      if (picker) picker.value = current;
      if (tab.scrollIntoView && tab.parentNode.scrollWidth > tab.parentNode.clientWidth) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      load();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { if (tab.getAttribute('aria-selected') !== 'true') select(tab); });
      tab.addEventListener('keydown', function (e) {
        var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
    [].forEach.call(root.querySelectorAll('fieldset[data-param] input'), function (r) { r.addEventListener('change', update); });
    var restart = root.querySelector('[data-restart]'); if (restart) restart.addEventListener('click', load);
    root.__select = function (key) { tabs.forEach(function (t) { if (t.getAttribute('data-variant') === key) select(t); }); };
  }
  // Stills in the "At a glance" row open the matching option in the studio.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-goto]'); if (!a) return;
    var root = document.getElementById(a.getAttribute('data-goto')); if (!root || !root.__select) return;
    e.preventDefault(); root.__select(a.getAttribute('data-variant'));
    root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  function ready() { [].forEach.call(document.querySelectorAll('[data-compare]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
