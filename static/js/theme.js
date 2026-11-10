(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var light = document.getElementById('chroma-light');
  var dark = document.getElementById('chroma-dark');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function effective() {
    return root.dataset.theme || (mq.matches ? 'dark' : 'light');
  }

  function sync() {
    var manual = !!root.dataset.theme;
    var t = effective();
    if (light) light.media = manual ? (t === 'light' ? 'all' : 'not all') : '(prefers-color-scheme: light)';
    if (dark) dark.media = manual ? (t === 'dark' ? 'all' : 'not all') : '(prefers-color-scheme: dark)';
    if (btn) {
      btn.textContent = t === 'dark' ? '切换亮色' : '切换暗色';
      btn.setAttribute('aria-label', t === 'dark' ? '切换到亮色主题' : '切换到暗色主题');
    }
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('blog-theme', next); } catch (e) {}
      sync();
    });
  }
  if (mq.addEventListener) mq.addEventListener('change', sync);
  sync();
})();
