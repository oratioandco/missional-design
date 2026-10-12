// Feedback form: composes an email in the reader's mail app. The address is assembled only when the form is sent,
// so it never appears in the page's HTML for address harvesters. Nothing is stored or sent by this site.
(function () {
  var f = document.getElementById('feedback-form'); if (!f) return;
  var to = function () { return [116,111,98,105,97,115].map(function (c) { return String.fromCharCode(c); }).join('') + '@' + ['missional', 'design'].join('.'); };
  var q = new URLSearchParams(location.search), page = q.get('page');
  if (page && /^\/[a-z0-9\-\/]*$/.test(page)) f.elements.page.value = 'https://missional.design' + page;
  if (q.get('type')) { var t = f.elements.type; for (var i = 0; i < t.options.length; i++) if (t.options[i].value === q.get('type')) t.selectedIndex = i; }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var type = f.elements.type.value, msg = f.elements.message.value.trim(), pg = f.elements.page.value.trim(), name = f.elements.name.value.trim();
    if (!msg) { f.elements.message.focus(); return; }
    var subject = '[Bible & Faith Patterns] ' + type + (pg ? ' · ' + pg.replace('https://missional.design', '') : '');
    var body = msg + '\n\n---\nType: ' + type + (pg ? '\nPage: ' + pg : '') + (name ? '\nFrom: ' + name : '');
    location.href = 'mailto:' + to() + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.getElementById('feedback-sent').hidden = false;
  });
  var show = document.getElementById('feedback-show');
  if (show) show.addEventListener('click', function () { var a = document.getElementById('feedback-address'); a.textContent = to(); a.hidden = false; show.hidden = true; });
})();
