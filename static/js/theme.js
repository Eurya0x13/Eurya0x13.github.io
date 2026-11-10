(function () {
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var light = document.getElementById('chroma-light');
  var dark = document.getElementById('chroma-dark');
  var themeBtn = document.getElementById('theme-toggle');

  function readPref() {
    var v = null;
    try {
      var m = document.cookie.match(/(?:^|;\s*)blog-theme=([^;]*)/);
      if (m) v = decodeURIComponent(m[1]);
      if (v !== 'light' && v !== 'dark') v = localStorage.getItem('blog-theme');
    } catch (e) {}
    return (v === 'light' || v === 'dark') ? v : null;
  }

  function writePref(v) {
    try {
      document.cookie = 'blog-theme=' + encodeURIComponent(v) + ';path=/;max-age=31536000;SameSite=Lax';
      localStorage.setItem('blog-theme', v);
    } catch (e) {}
  }

  function effective() { return root.dataset.theme || (mq.matches ? 'dark' : 'light'); }

  var pref = readPref();
  if (pref && !root.dataset.theme) root.dataset.theme = pref;

  function syncTheme() {
    var manual = !!root.dataset.theme;
    var t = effective();
    if (light) light.media = manual ? (t === 'light' ? 'all' : 'not all') : '(prefers-color-scheme: light)';
    if (dark) dark.media = manual ? (t === 'dark' ? 'all' : 'not all') : '(prefers-color-scheme: dark)';
    if (themeBtn) {
      themeBtn.textContent = t === 'dark' ? '浅色' : '深色';
      themeBtn.setAttribute('aria-label', t === 'dark' ? '切换到浅色主题' : '切换到深色主题');
      themeBtn.title = '当前' + (t === 'dark' ? '深色' : '浅色') + (manual ? '（已锁定）' : '（跟随系统）');
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      writePref(next);
      syncTheme();
    });
  }
  if (mq.addEventListener) mq.addEventListener('change', syncTheme);
  syncTheme();

  var dataEl = document.getElementById('search-data');
  var docs = [];
  try { docs = JSON.parse(dataEl ? dataEl.textContent : '[]'); } catch (e) { docs = []; }
  var toggle = document.getElementById('search-toggle');
  var panel = document.getElementById('search-panel');
  var input = document.getElementById('site-search');
  var list = document.getElementById('search-results');
  var hint = document.getElementById('search-hint');
  if (!toggle || !panel || !input || !list) return;

  function open() { panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); input.focus(); }
  function close() { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }

  function render(q) {
    q = q.trim().toLowerCase();
    list.textContent = '';
    if (hint) hint.hidden = !!q;
    if (!q) return;
    var hits = docs.filter(function (d) {
      return ((d.t || '') + ' ' + (d.d || '') + ' ' + (d.g || []).join(' ')).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
    if (!hits.length) {
      var empty = document.createElement('li');
      empty.className = 'search-empty';
      empty.textContent = '没有匹配的文章';
      list.appendChild(empty);
      return;
    }
    hits.forEach(function (d) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = d.u;
      a.textContent = d.t;
      var small = document.createElement('small');
      small.textContent = (d.date ? d.date + ' · ' : '') + (d.d || '').slice(0, 60);
      a.appendChild(small);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.hidden ? open() : close();
  });
  input.addEventListener('input', function () { render(this.value); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.toolbar-search')) close();
  });
})();
