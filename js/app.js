/* خونه‌چین — راه‌اندازی */
(function (global) {
  const K = global.K;
  const UI = K.UI;
  const E = K.Engine;

  // قالب زمان داخل نوار وضعیت
  function clock() {
    const el = document.querySelector('.sb-time');
    if (!el) return;
    const d = new Date();
    el.textContent = E.fa(d.getHours()).padStart(2, '۰') + ':' + E.fa(String(d.getMinutes()).padStart(2, '0'));
  }

  function boot() {
    clock();
    setInterval(clock, 30000);
    UI.boot();
    K.Store.track('app_open');

    // نصب به‌عنوان اپ روی اندروید
    let installEvent = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installEvent = e;
      showInstallBar();
    });

    function showInstallBar() {
      if (document.querySelector('.install-bar')) return;
      const bar = document.createElement('div');
      bar.className = 'install-bar';
      bar.innerHTML = `<div class="ib-main"><b>خونه‌چین را روی گوشی نصب کن</b>بدون نوار مرورگر و با آیکون مستقل باز می‌شود.</div>
        <button class="btn" data-install>نصب</button>
        <button class="iconbtn" data-dismiss aria-label="بستن">${K.Art.icon('close', 18)}</button>`;
      document.querySelector('.device').appendChild(bar);
      bar.querySelector('[data-install]').addEventListener('click', async () => {
        bar.remove();
        if (installEvent) {
          installEvent.prompt();
          try {
            await installEvent.userChoice;
          } catch (e) {}
          installEvent = null;
        }
      });
      bar.querySelector('[data-dismiss]').addEventListener('click', () => {
        bar.dataset.closed = '1';
        bar.remove();
      });
      // فقط جایی که نوار پایین وجود دارد نمایش داده می‌شود تا دکمه‌های اصلی را نپوشاند
      const sync = () => {
        const b = document.querySelector('.install-bar');
        if (!b) return;
        b.style.display = document.querySelector('.tabbar') ? 'flex' : 'none';
      };
      sync();
      window.addEventListener('hashchange', () => setTimeout(sync, 60));
    }

    // نصب به‌عنوان اپ (PWA) — فقط در مرورگر، نه داخل APK
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (isNative) {
      // پاک‌کردن کش قدیمی نسخه‌های قبل تا فایل‌های تازه APK دیده شوند
      try {
        if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
        if (window.caches) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      } catch (e) {}
    } else if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !/[?&]nosw=1/.test(location.search)) {
      navigator.serviceWorker
        .register('sw.js?rev=3', { updateViaCache: 'none' })
        .then((reg) => reg.update().catch(() => {}))
        .catch(() => {});
    }

    // دسترسی برای آزمون خودکار
    global.__khunechin = { K, UI, Store: K.Store, Engine: E };
    document.documentElement.setAttribute('data-ready', '1');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
