/* خونه‌چین — هستهٔ رابط: مسیریابی، قالب‌ها و اجزای مشترک */
(function (global) {
  const K = (global.K = global.K || {});
  const UI = (K.UI = {});
  const E = K.Engine;
  const A = K.Art;
  const D = K.Data;

  UI.screens = {};
  UI.current = null;
  UI.params = {};
  let tickTimer = null;

  UI.define = function (name, fn) {
    UI.screens[name] = fn;
  };

  /* ---------- مسیر ---------- */
  function parseHash() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = {};
    (qs || '').split('&').forEach((kv) => {
      if (!kv) return;
      const [k, v] = kv.split('=');
      query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    let name = parts[0] || '';
    let id = parts[1] || '';
    if (parts[0] === 'new' && parts[1]) {
      name = 'new/' + parts[1];
      id = parts[2] || '';
    }
    return { name, id, query };
  }

  UI.go = function (hash, replace) {
    const target = hash.startsWith('#') ? hash : '#/' + hash.replace(/^\//, '');
    if (location.hash === target) return UI.render();
    if (replace) location.replace(target);
    else location.hash = target;
  };

  UI.back = function (fallback) {
    const target = fallback || '#/home';
    const before = location.hash;
    if (history.length > 1) history.back();
    // اگر برگشت تاریخی چیزی را عوض نکرد، حتماً به مقصد مشخص برو
    setTimeout(() => {
      if (location.hash === before) UI.go(target);
    }, 140);
  };

  UI.refresh = function () {
    UI.render();
  };

  UI.render = function () {
    const root = document.getElementById('app');
    if (!root) return;
    const { name, id, query } = parseHash();
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    if (UI._pt) {
      clearInterval(UI._pt);
      UI._pt = null;
    }
    const fn = UI.screens[name] || UI.screens.welcome;
    UI.current = name;
    UI.params = Object.assign({ id, query }, query);
    let out;
    try {
      out = fn({ id, query }) || {};
    } catch (err) {
      console.error(err);
      out = { html: '<div class="content"><div class="empty">خطا در نمایش این صفحه.<br><small>' + (err && err.message) + '</small></div></div>' };
    }
    root.innerHTML = out.html;
    // دکمهٔ خانه همیشه در نوار بالا باشد
    const tb = root.querySelector('.topbar');
    if (tb) {
      const side = tb.querySelector('.tb-side');
      if (side && !side.querySelector('[data-go="#/home"]')) {
        const b = document.createElement('button');
        b.className = 'iconbtn';
        b.setAttribute('data-go', '#/home');
        b.setAttribute('aria-label', 'خانه');
        b.innerHTML = K.Art.icon('home', 19);
        side.insertBefore(b, side.firstChild);
      }
    }
    const scr = root.querySelector('.screen');
    if (scr) scr.setAttribute('data-screen', name);
    const content = root.querySelector('.content');
    if (content) content.scrollTop = 0;
    if (typeof out.mount === 'function') {
      try {
        out.mount(root);
      } catch (err) {
        console.error('mount', err);
      }
    }
    const tab = root.querySelector('.tabbar a.is-on');
    if (tab) tab.setAttribute('aria-current', 'page');
  };

  UI.every = function (ms, fn) {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(fn, ms);
    return tickTimer;
  };

  UI.boot = function () {
    K.Store.load();
    document.body.classList.toggle('big-text', !!K.Store.get().settings.bigText);
    document.addEventListener('click', function (ev) {
      const goEl = ev.target.closest('[data-go]');
      if (goEl) {
        ev.preventDefault();
        UI.go(goEl.getAttribute('data-go'));
        return;
      }
      const backEl = ev.target.closest('[data-back]');
      if (backEl) {
        ev.preventDefault();
        UI.back(backEl.getAttribute('data-back') || undefined);
        return;
      }
      const closeEl = ev.target.closest('[data-close]');
      if (closeEl) {
        ev.preventDefault();
        UI.closeSheet();
        return;
      }
      if (ev.target.classList && ev.target.classList.contains('sheet-backdrop')) UI.closeSheet();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') UI.closeSheet();
    });
    window.addEventListener('hashchange', UI.render);
    if (!location.hash) {
      const st = K.Store.get();
      location.hash = st.seenWelcome ? '#/home' : '#/welcome';
    }
    UI.render();
  };

  /* ---------- کمکی ---------- */
  UI.fa = E.fa;
  UI.money = (n) => E.money(n) + ' تومان';
  UI.esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  UI.relTime = function (iso) {
    const t = new Date(iso).getTime();
    if (!t) return '';
    const diff = Date.now() - t;
    const m = Math.round(diff / 60000);
    if (m < 1) return 'همین حالا';
    if (m < 60) return E.fa(m) + ' دقیقه پیش';
    const h = Math.round(m / 60);
    if (h < 24) return E.fa(h) + ' ساعت پیش';
    const d = Math.round(h / 24);
    if (d === 1) return 'دیروز';
    if (d < 7) return E.fa(d) + ' روز پیش';
    return E.fa(Math.round(d / 7)) + ' هفته پیش';
  };

  UI.statusBadge = function (p) {
    const map = {
      draft: { label: 'پیش‌نویس', cls: '' },
      queued: { label: 'در صف', cls: 'warn' },
      building: { label: 'در حال ساخت', cls: 'warn' },
      review: { label: 'در حال بررسی', cls: 'warn' },
      ready: { label: 'آماده', cls: 'ok' },
      failed: { label: 'ناموفق', cls: 'bad' },
    };
    const m = map[p.status] || map.draft;
    return `<span class="badge ${m.cls} dot">${m.label}</span>`;
  };

  /* ---------- اجزای قالب ---------- */
  UI.topbar = function (o) {
    const opts = o || {};
    return `<header class="topbar">
      ${opts.back === false ? '' : `<button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>`}
      ${opts.brand ? `<div class="brandbar">${A.logo(30, { radius: 9 })}<div>${D.app.name}<small>${opts.sub || D.app.version}</small></div></div>` : `<div class="tb-title">${opts.title || ''}</div>`}
      <div class="tb-side">
        ${opts.action || ''}
        ${opts.home === false ? '' : `<button class="iconbtn" data-go="#/home" aria-label="خانه">${A.icon('home', 20)}</button>`}
      </div>
    </header>`;
  };

  UI.tabbar = function (active) {
    const items = [
      { id: 'home', label: 'خانه', icon: 'home', href: '#/home' },
      { id: 'projects', label: 'پروژه‌ها', icon: 'grid', href: '#/projects' },
      { id: 'account', label: 'حساب من', icon: 'user', href: '#/account' },
    ];
    return `<nav class="tabbar" role="tablist">${items
      .map(
        (i) => `<a href="${i.href}" class="${active === i.id ? 'is-on' : ''}" role="tab">${A.icon(i.icon, 21)}<span>${i.label}</span></a>`
      )
      .join('')}</nav>`;
  };

  UI.steps = function (active) {
    return `<div class="steps">${D.steps
      .map((s, i) => `<div class="st ${i < active ? 'done' : ''} ${i === active ? 'on' : ''}"><div class="bar"></div><span>${s}</span></div>`)
      .join('')}</div>`;
  };

  UI.actions = function (html, meta) {
    return `<div class="actions">${html}${meta ? `<div class="meta">${meta}</div>` : ''}</div>`;
  };

  UI.chip = function (label, on, data, extra) {
    return `<button type="button" class="chip ${on ? 'is-on' : ''} ${extra || ''}" ${data}>${label}</button>`;
  };

  /* ---------- عکس و صحنه ---------- */
  UI.mainPhoto = (p) => (p.photos || []).find((x) => x.kind === 'main') || null;

  UI.sceneItems = function (p, scheme) {
    const ov = scheme ? A.schemeOverrides(scheme) : {};
    return E.placements(p, ov);
  };

  UI.sceneHtml = function (p, scheme, uid, opts) {
    const o = opts || {};
    return A.scene({
      roomW: p.room.w,
      roomD: p.room.d,
      items: UI.sceneItems(p, scheme),
      ghosts:
        o.ghosts && scheme
          ? (scheme.moves || []).map((m) => Object.assign({}, p.items.find((i) => i.id === m.itemId), m.from))
          : [],
      targets:
        o.targets && o.targets.moves
          ? o.targets.moves.map((m) => Object.assign({}, p.items.find((i) => i.id === m.itemId), m.to, { _fromX: m.from.x }))
          : [],
      curtainLight: scheme ? !!scheme.buys.find((b) => b.productId === 'p-curtain') : false,
      light: o.light != null ? o.light : scheme && scheme.buys.length ? 1.06 : 0.94,
      uid: uid,
    });
  };

  UI.isSamplePhoto = function (p) {
    const ph = UI.mainPhoto(p);
    return !ph || !ph.dataUrl;
  };

  /** لایهٔ «بعد»: صحنهٔ نمونه، یا عکس کاربر با نشانه‌های شماتیک */
  UI.afterHtml = function (p, scheme) {
    if (UI.isSamplePhoto(p)) return UI.sceneHtml(p, scheme, 'af' + (scheme ? scheme.id : '0'), { ghosts: true });
    const ph = UI.mainPhoto(p);
    return `<div style="position:relative;width:100%;height:100%">
      <img src="${ph.dataUrl}" alt="طرح پیشنهادی" style="width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.03) brightness(${scheme && scheme.buys.length ? '1.06' : '1.01'})"/>
      ${UI.ghostOverlay(p, scheme)}
      <span class="schematic-note">پیش‌نمایش شماتیک</span>
    </div>`;
  };

  UI.ghostOverlay = function (p, scheme) {
    if (!scheme || !p.items.some((i) => i.bounds)) return '';
    const W = 1000;
    const H = 750;
    let s = `<svg class="overlay-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`;
    const moves = (scheme.moves || []).filter((m) => p.items.find((i) => i.id === m.itemId && i.bounds));
    if (scheme.buys.length) {
      s += `<defs><radialGradient id="glowA" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fff4d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="${W * 0.5}" cy="${H * 0.4}" rx="${W * 0.42}" ry="${H * 0.4}" fill="url(#glowA)"/>`;
    }
    moves.forEach((m, idx) => {
      const it = p.items.find((i) => i.id === m.itemId);
      const b = it.bounds;
      const x = b.x * W;
      const y = b.y * H;
      const w = b.w * W;
      const h = b.h * H;
      const ox = (it.bounds.x + it.bounds.w / 2) * W;
      const oy = (it.bounds.y + it.bounds.h / 2) * H;
      s += `<g>
        <path d="M${ox} ${oy} L${x + w / 2} ${y + h / 2}" stroke="#FBF8F2" stroke-width="2.4" stroke-dasharray="7 6" opacity=".85"/>
        <circle cx="${ox}" cy="${oy}" r="5" fill="#FBF8F2" opacity=".9"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="rgba(40,85,66,.16)" stroke="#fff" stroke-width="2.4" stroke-dasharray="9 7"/>
        <g transform="translate(${x + 8} ${y + 8})">
          <rect x="0" y="0" width="${Math.max(74, it.name.length * 7.4)}" height="26" rx="13" fill="#285542" opacity=".94"/>
          <text x="10" y="18" font-size="13" fill="#fff" font-family="Vazirmatn,Tahoma,sans-serif">${it.name}</text>
        </g>
        <text x="${x + w / 2}" y="${y + h + 20}" text-anchor="middle" font-size="12" fill="#fff" font-family="Vazirmatn,Tahoma,sans-serif" style="paint-order:stroke;stroke:#24312B;stroke-width:3px;stroke-linejoin:round">جای پیشنهادی</text>
      </g>`;
    });
    s += `</svg>`;
    return s;
  };

  /* ---------- مقایسه ---------- */
  UI.compareHtml = function (beforeHtml, afterHtml, opts) {
    const o = opts || {};
    const ratio = o.ratio == null ? 52 : o.ratio;
    return `<div class="compare" data-compare data-ratio="${ratio}" role="group" aria-label="مقایسهٔ عکس فعلی و طرح پیشنهادی">
      <div class="layer after">${afterHtml}</div>
      <div class="layer before" style="clip-path:inset(0 0 0 ${ratio}%);-webkit-clip-path:inset(0 0 0 ${ratio}%)">${beforeHtml}</div>
      <div class="handle" style="left:${ratio}%"></div>
      <span class="tag" style="right:10px">عکس فعلی</span>
      <span class="tag" style="left:10px">طرح پیشنهادی</span>
    </div>`;
  };

  UI.bindCompare = function (root) {
    const box = root.querySelector('[data-compare]');
    if (!box) return;
    const before = box.querySelector('.layer.before');
    const handle = box.querySelector('.handle');
    let dragging = false;
    const set = (clientX) => {
      const r = box.getBoundingClientRect();
      let ratio = ((clientX - r.left) / r.width) * 100;
      ratio = Math.max(4, Math.min(96, ratio));
      box.setAttribute('data-ratio', ratio.toFixed(1));
      before.style.clipPath = 'inset(0 0 0 ' + ratio + '%)';
      before.style.webkitClipPath = 'inset(0 0 0 ' + ratio + '%)';
      handle.style.left = ratio + '%';
    };
    box.addEventListener('pointerdown', (ev) => {
      dragging = true;
      box.setPointerCapture(ev.pointerId);
      set(ev.clientX);
    });
    box.addEventListener('pointermove', (ev) => {
      if (dragging) set(ev.clientX);
    });
    box.addEventListener('pointerup', () => (dragging = false));
    box.addEventListener('pointercancel', () => (dragging = false));
    box.addEventListener('keydown', (ev) => {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      const cur = parseFloat(box.getAttribute('data-ratio')) || 50;
      const next = Math.max(4, Math.min(96, cur + (ev.key === 'ArrowLeft' ? -4 : 4)));
      box.setAttribute('data-ratio', next);
      before.style.clipPath = 'inset(0 0 0 ' + next + '%)';
      handle.style.left = next + '%';
    });
    box.setAttribute('tabindex', '0');
  };

  UI.modeToggle = function (active, project) {
    const s = project.schemes || [];
    return `<div class="seg" data-mode-toggle>${s
      .map((sc) => `<button type="button" data-scheme="${sc.id}" class="${sc.id === active ? 'is-on' : ''}">${sc.id === 'A' ? 'بدون خرید' : sc.tag === 'با خرید محدود' ? 'با خرید محدود' : sc.title.length > 18 ? 'طرح ' + E.fa(s.indexOf(sc) + 1) : sc.title}</button>`)
      .join('')}</div>`;
  };

  /* ---------- برگه ---------- */
  UI.sheet = function (opts) {
    UI.closeSheet();
    const wrap = document.createElement('div');
    wrap.className = 'sheet-backdrop';
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">
      <div class="grabber"></div>
      ${opts.title ? `<h2>${opts.title}</h2>` : ''}
      ${opts.sub ? `<p class="sub" style="margin-bottom:10px">${opts.sub}</p>` : ''}
      ${opts.html || ''}
    </div>`;
    document.querySelector('.device').appendChild(wrap);
    if (opts.mount) opts.mount(wrap.querySelector('.sheet'));
    const firstBtn = wrap.querySelector('.sheet button, .sheet .input, .sheet [tabindex]');
    if (firstBtn) setTimeout(() => firstBtn.focus({ preventScroll: true }), 60);
    return wrap;
  };

  UI.closeSheet = function () {
    document.querySelectorAll('.sheet-backdrop').forEach((el) => el.remove());
  };

  UI.confirmSheet = function (opts) {
    UI.sheet({
      title: opts.title,
      sub: opts.sub,
      html: `<div class="btn-row mt-16">
        <button type="button" class="btn secondary" data-close>${opts.cancel || 'بی‌خیال'}</button>
        <button type="button" class="btn ${opts.danger ? 'danger' : ''}" data-confirm>${opts.confirm || 'تأیید'}</button>
      </div>`,
      mount: (el) => {
        el.querySelector('[data-confirm]').addEventListener('click', () => {
          UI.closeSheet();
          opts.onConfirm && opts.onConfirm();
        });
      },
    });
  };

  UI.toast = function (msg) {
    let host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      document.querySelector('.device').appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  };

  /* ----- محدودهٔ عکس (مختصات از چپ، مستقل از جهت متن) ----- */
  UI.boundsStyle = (b) => `left:${b.x * 100}%;top:${b.y * 100}%;width:${b.w * 100}%;height:${b.h * 100}%`;
})(window);
