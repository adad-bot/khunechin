/* صفحه‌های آغاز، نمونه، خانه، پروژه‌ها و حساب */
(function (global) {
  const K = global.K;
  const UI = K.UI;
  const S = K.Store;
  const E = K.Engine;
  const A = K.Art;
  const D = K.Data;

  /* تصویر کوچک پروژه */
  UI.projectThumb = function (p) {
    const ph = UI.mainPhoto(p);
    if (ph && ph.dataUrl) return `<img src="${ph.dataUrl}" alt="${UI.esc(p.name)}"/>`;
    const scheme = S.activeScheme(p);
    if (scheme) return UI.sceneHtml(p, scheme, 'pth' + p.id.slice(-4));
    return A.scene({ roomW: p.room.w, roomD: p.room.d, items: p.items, light: 0.9, uid: 'pth' + p.id.slice(-4) });
  };

  function featureRow() {
    const items = [
      { i: 'sofa', t: 'همان وسایل خودت', s: 'بدون خرید' },
      { i: 'sun', t: 'قبل و بعد', s: 'از یک زاویه' },
      { i: 'ruler', t: 'اندازه‌های لازم', s: 'قبل از اجرا' },
    ];
    return `<div class="grid3">${items
      .map(
        (x) => `<div class="feat">${A.icon(x.i, 19)}<b>${x.t}</b><span>${x.s}</span></div>`
      )
      .join('')}</div>`;
  }

  /* ================= آغاز ================= */
  UI.define('welcome', function () {
    const st = S.get();
    const demo = st.projects[0];
    const scheme = demo && (demo.schemes.find((s) => s.id === 'B') || demo.schemes[0]);
    const before = UI.sceneHtml(demo, null, 'wc-before');
    const after = UI.sceneHtml(demo, scheme, 'wc-after', { ghosts: true });
    const html = `<div class="screen">
      <div class="content">
        <div class="hero-brand">
          ${A.logo(76, { radius: 22 })}
          <h1>خونه‌چین</h1>
          <p>از پذیرایی‌ات عکس بگیر، بگو چه تغییری می‌خواهی، و پیش از خرید نتیجه را در خانهٔ خودت ببین.</p>
        </div>
        <div class="hero-art">${UI.compareHtml(before, after, { ratio: 54 })}</div>
        <p class="tiny center mt-8">انگشتت را بکش تا عکس فعلی و طرح پیشنهادی را مقایسه کنی.</p>
        ${featureRow()}
        <p class="tiny center mt-16" style="opacity:.85">نمونهٔ پذیرایی، عرض ۴٫۲ و عمق ۳٫۴ متر — دو طرح در همین زاویه</p>
      </div>
      <div class="actions">
        <button class="btn" data-start>اتاقم رو بچین</button>
        <button class="btn secondary mt-8" data-sample>با یک نمونه امتحان کن</button>
        <div class="meta">${D.app.version} · بدون ارسال عکس به سرور</div>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        UI.bindCompare(root);
        root.querySelector('[data-start]').addEventListener('click', () => {
          S.get().seenWelcome = true;
          const p = S.newProject();
          UI.go('#/new/photo/' + p.id);
        });
        root.querySelector('[data-sample]').addEventListener('click', () => {
          S.get().seenWelcome = true;
          S.save();
          UI.go('#/sample/' + demo.id);
        });
      },
    };
  });

  /* ================= نمونهٔ آماده ================= */
  function sampleSub(sc) {
    const moves = sc.changes.filter((c) => c.kind === 'move').map((c) => c.title);
    const parts = [];
    if (moves.length) parts.push(moves.join(' و ') + ' جابه‌جا شد');
    if (sc.changes.some((c) => c.kind === 'buy')) parts.push('پرده با پارچهٔ روشن‌تر عوض شد');
    return parts.length ? parts.join(' و ') + '.' : 'چیدمان فعلی تأیید شد.';
  }
  let sampleSel = null;
  UI.define('sample', function (ctx) {
    const st = S.get();
    const p = S.byId(ctx.id) || st.projects[0];
    const schemes = p.schemes || [];
    let active = sampleSel && schemes.find((s) => s.id === sampleSel) ? sampleSel : schemes[0] ? schemes[0].id : 'A';
    sampleSel = active;
    const build = (sid) => {
      const sc = schemes.find((x) => x.id === sid) || schemes[0];
      return {
        html: `<div class="screen">
          <header class="topbar">
            <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
            <div class="tb-title">نمونهٔ آماده</div>
            <div class="tb-side"><span class="badge">پذیرایی نمونه</span></div>
          </header>
          <div class="content">
            <h1 class="h1" style="font-size:21px">${sc.buys.length ? 'پذیرایی روشن‌تر، با راه بالکن باز' : 'راه بالکن باز، با همان وسایل'}</h1>
            <p class="sub mt-4">${UI.esc(sampleSub(sc))} مبل، فرش و تلویزیون سر جایشان ماندند.</p>
            <div class="mt-12">${UI.compareHtml(UI.sceneHtml(p, null, 'sp-b'), UI.sceneHtml(p, sc, 'sp-a', { ghosts: true }), { ratio: 50 })}</div>
            <div class="compare-tools">
              ${UI.modeToggle(active, p)}
              <span class="spacer"></span>
              <button class="chip" data-why>چرا این‌طوری؟</button>
            </div>
            <div class="card mt-16">
              <div class="card-title">${A.icon('check', 18)} چه چیزهایی تغییر کرد؟</div>
              <div class="mt-8">${(sc.changes || [])
                .map(
                  (c) => `<div class="chg"><span class="badge ${c.kind === 'buy' ? 'warn' : c.kind === 'measure' ? 'bad' : 'ok'}">${c.action}</span>
                  <div><b>${UI.esc(c.title)}</b><div class="tiny">${UI.esc(c.note)}</div></div></div>`
                )
                .join('')}</div>
            </div>
            <div class="card flat mt-12">
              <div class="card-title">${A.icon('info', 18)} چرا مبل کنار پنجره نرفت؟</div>
              <p class="sub mt-4">${UI.esc((p.rejected && p.rejected[0] && p.rejected[0].reasons[0]) || 'عرض آزاد کنار پنجره کمتر از طول مبل است.')}</p>
            </div>
            <div class="card tint mt-12">
              <div class="card-title">${A.icon('lock', 18)} فرش دست‌نخورده ماند</div>
              <p class="sub mt-4">فرش، تلویزیون و قاب روی دیوار به‌عنوان «جای ثابت» تأیید شده‌اند و هیچ طرحی آن‌ها را جابه‌جا نمی‌کند.</p>
            </div>
          </div>
          <div class="actions">
            <button class="btn" data-own>برای اتاق خودم</button>
            <div class="meta">دو طرح با یک زاویه و یک فهرست تغییر</div>
          </div>
        </div>`,
      };
    };
    const first = build(active);
    return {
      html: first.html,
      mount(root) {
        UI.bindCompare(root);
        root.querySelectorAll('[data-scheme]').forEach((b) =>
          b.addEventListener('click', () => {
            active = b.getAttribute('data-scheme');
            sampleSel = active;
            UI.render();
          })
        );
        root.querySelector('[data-why]').addEventListener('click', () => {
          const cur = schemes.find((x) => x.id === active) || schemes[0];
          const before = Math.round(E.check(p).freeRoute * 100);
          const after = Math.round(E.check(p, A.schemeOverrides(cur)).freeRoute * 100);
          UI.sheet({
            title: 'چرا این دو طرح؟',
            sub: 'ترتیب اولویت‌ها: معماری و قیدهای ثابت، بعد سقف خرید، بعد هدف اصلی.',
            html: `<div class="stack-sm mt-12">
              <div class="card flat"><b>۱. مسیر بالکن</b><p class="sub">عرض آزاد مسیر در چیدمان فعلی ${E.fa(before)} سانتی‌متر است؛ با این طرح به ${E.fa(after)} سانتی‌متر می‌رسد. حد لازم برای عبور ۶۰ سانتی‌متر است.</p></div>
              <div class="card flat"><b>۲. نور</b><p class="sub">پردهٔ ضخیم نور پنجره را می‌گرفت؛ در طرح دوم با یک خرید، پارچهٔ روشن‌تر جای آن می‌آید.</p></div>
              <div class="card flat"><b>۳. چیزی که رد شد</b><p class="sub">${UI.esc((p.rejected && p.rejected[0] && p.rejected[0].reasons[0]) || 'مبل در عرض آزاد کنار پنجره جا نمی‌شود.')} بنابراین از هر دو طرح حذف شد.</p></div>
            </div>`,
          });
        });
      },
    };
  });

  /* ================= خانه ================= */
  UI.define('home', function () {
    const st = S.get();
    const list = st.projects;
    const latest = list[0];
    const card = latest ? projectCard(latest) : '';
    const html = `<div class="screen">
      <div class="content has-tabbar">
        <header class="topbar" style="padding-inline:0">
          <div class="brandbar">${A.logo(34, { radius: 10 })}<div>خونه‌چین<small>${greeting()}</small></div></div>
          <span class="spacer"></span>
          <button class="iconbtn is-bordered" data-go="#/support" aria-label="پشتیبانی">${A.icon('info', 19)}</button>
        </header>
        ${latest ? `<h2 class="h2">آخرین پروژه</h2><div class="mt-8">${card}</div>` : `<div class="empty"><div class="em-ico">${A.icon('home', 28)}</div><b>اولین اتاقت را ثبت کن</b><p class="sub mt-4">یک عکس از پذیرایی، یک هدف، و یک طرح قابل اجرا.</p></div>`}
        <button class="btn mt-12" data-new>${A.icon('plus', 20)} پروژهٔ جدید</button>

        <div class="row-head mt-24"><h3 class="h3">نمونهٔ قبل و بعد</h3><span class="tiny">بدون خرید</span></div>
        <div class="card clickable" data-go="#/sample/${st.projects[0] ? st.projects[0].id : ''}">
          <div class="media" style="aspect-ratio:16/9">${UI.projectThumb(st.projects[0])}</div>
          <div class="card-title mt-8">راه بازتر با دو جابه‌جایی</div>
          <div class="card-meta">${A.icon('ruler', 14)} ۲ جابه‌جایی · ۱ خرید اختیاری · ۱ اندازهٔ لازم</div>
        </div>

        <div class="row-head mt-24"><h3 class="h3">قدم بعدی تو</h3></div>
        <div class="card flat">
          <div class="row" style="border:0" data-go="#/projects"><div class="ico-lead">${A.icon('grid', 18)}</div><div class="row-main"><div class="row-title">همهٔ پروژه‌ها</div><div class="row-sub">${E.fa(st.projects.length)} پروژه روی این گوشی</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
        </div>
      </div>
      ${UI.tabbar('home')}
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-new]').addEventListener('click', () => {
          const p = S.newProject();
          UI.go('#/new/photo/' + p.id);
        });
      },
    };
  });

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'صبح بخیر';
    if (h < 18) return 'ظهر بخیر';
    return 'شب بخیر';
  }

  function projectCard(p) {
    const scheme = S.activeScheme(p);
    const summary = scheme ? E.summaryOf(scheme) : p.status === 'draft' ? 'در حال تکمیل' : '—';
    const cta =
      p.status === 'ready'
        ? `<button class="btn small" data-open="${p.id}">دیدن طرح</button>`
        : p.status === 'failed'
        ? `<button class="btn small" data-open="${p.id}">تلاش دوباره</button>`
        : p.status === 'draft'
        ? `<button class="btn small" data-open="${p.id}">ادامهٔ پیش‌نویس</button>`
        : `<button class="btn small" data-open="${p.id}">وضعیت ساخت</button>`;
    return `<div class="card clickable" data-open="${p.id}">
      <div style="display:flex;gap:12px">
        <div class="thumb" style="width:92px;height:72px">${UI.projectThumb(p)}</div>
        <div style="flex:1;min-width:0">
          <div class="card-title">${UI.esc(p.name)}</div>
          <div class="card-meta">${UI.statusBadge(p)} <span style="margin-inline-start:6px">${UI.relTime(p.updatedAt)}</span></div>
          <div class="tiny mt-4">${summary}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-start;margin-top:10px">${cta}</div>
    </div>`;
  }

  /* ================= پروژه‌ها ================= */
  UI.define('projects', function () {
    const st = S.get();
    const list = st.projects;
    const rows = list
      .map((p) => {
        const scheme = S.activeScheme(p);
        return `<div class="card clickable" data-open="${p.id}">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div class="thumb" style="width:86px;height:70px">${UI.projectThumb(p)}</div>
            <div style="flex:1;min-width:0">
              <div class="card-title" style="justify-content:space-between">${UI.esc(p.name)}</div>
              <div class="card-meta">${UI.statusBadge(p)}</div>
              <div class="tiny mt-4">${scheme ? E.summaryOf(scheme) : 'پیش‌نویس — مرحلهٔ ' + stepName(p)}</div>
              <div class="tiny mt-4">آخرین تغییر: ${UI.relTime(p.updatedAt)}</div>
            </div>
            <button class="iconbtn" data-menu="${p.id}" aria-label="منوی پروژه">${A.icon('menu', 20)}</button>
          </div>
        </div>`;
      })
      .join('');
    const html = `<div class="screen">
      <header class="topbar">
        <div class="tb-title">پروژه‌ها</div>
        <div class="tb-side"><button class="iconbtn is-bordered" data-new aria-label="پروژهٔ جدید">${A.icon('plus', 20)}</button></div>
      </header>
      <div class="content has-tabbar">
        ${list.length ? `<p class="sub">${E.fa(list.length)} پروژه روی این گوشی ذخیره شده است.</p><div class="stack mt-8">${rows}</div>` : `<div class="empty"><div class="em-ico">${A.icon('grid', 28)}</div><b>اولین اتاقت را ثبت کن</b><p class="sub mt-4">عکس بگیر تا طرح پیشنهادی بسازیم.</p><button class="btn mt-16" data-new>شروع طراحی</button></div>`}
      </div>
      ${UI.tabbar('projects')}
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelectorAll('[data-open]').forEach((el) =>
          el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            openProject(el.getAttribute('data-open'));
          })
        );
        root.querySelectorAll('[data-menu]').forEach((el) =>
          el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            projectMenu(el.getAttribute('data-menu'));
          })
        );
        const nw = root.querySelector('[data-new]');
        if (nw)
          nw.addEventListener('click', () => {
            const p = S.newProject();
            UI.go('#/new/photo/' + p.id);
          });
      },
    };
  });

  function stepName(p) {
    return { photo: 'عکس', mode: 'حالت طراحی', goal: 'هدف', limits: 'محدودیت', items: 'انتخاب وسیله', review: 'مرور' }[p.step] || 'شروع';
  }

  function openProject(id) {
    const p = S.byId(id);
    if (!p) return;
    S.setActive(id);
    if (p.status === 'ready') return UI.go('#/result/' + id);
    if (p.status === 'failed') return UI.go('#/processing/' + id);
    if (['queued', 'building', 'review'].includes(p.status)) return UI.go('#/processing/' + id);
    const step = p.step === 'result' ? 'review' : p.step;
    const routes = { photo: 'photo', mode: 'mode', goal: 'goal', limits: 'limits', items: 'items', review: 'review' };
    UI.go('#/new/' + (routes[step] || 'photo') + '/' + id);
  }
  UI.openProject = openProject;

  function projectMenu(id) {
    const p = S.byId(id);
    if (!p) return;
    UI.sheet({
      title: p.name,
      sub: 'پروژهٔ ' + (p.status === 'ready' ? 'آماده' : 'در جریان'),
      html: `<div class="stack-sm mt-12">
        <button class="row" data-act="open"><div class="ico-lead">${A.icon('next', 18)}</div><div class="row-main"><div class="row-title">ادامه / باز کردن</div></div></button>
        <button class="row" data-act="rename"><div class="ico-lead">${A.icon('edit', 18)}</div><div class="row-main"><div class="row-title">تغییر نام</div></div></button>
        <button class="row" data-act="dup"><div class="ico-lead">${A.icon('share', 18)}</div><div class="row-main"><div class="row-title">تکثیر</div><div class="row-sub">عکس‌ها و تنظیمات به پیش‌نویس تازه می‌رود</div></div></button>
        <button class="row" data-act="del"><div class="ico-lead" style="background:var(--brick-soft);color:var(--brick)">${A.icon('trash', 18)}</div><div class="row-main"><div class="row-title" style="color:var(--brick)">حذف</div><div class="row-sub">پردازش صف‌شده لغو می‌شود</div></div></button>
      </div>`,
      mount(el) {
        el.querySelector('[data-act="open"]').addEventListener('click', () => {
          UI.closeSheet();
          openProject(id);
        });
        el.querySelector('[data-act="rename"]').addEventListener('click', () => renameSheet(p));
        el.querySelector('[data-act="dup"]').addEventListener('click', () => {
          S.duplicate(id);
          UI.closeSheet();
          UI.toast('پیش‌نویس تازه ساخته شد؛ خرید پروژهٔ اصلی منتقل نشد.');
          UI.refresh();
        });
        el.querySelector('[data-act="del"]').addEventListener('click', () => {
          UI.closeSheet();
          UI.confirmSheet({
            title: 'پروژه حذف شود؟',
            sub: 'پردازش در جریان لغو می‌شود و نتیجهٔ دیررس دوباره ظاهر نمی‌شود.',
            confirm: 'حذف پروژه',
            danger: true,
            onConfirm() {
              S.remove(id);
              UI.toast('پروژه حذف شد.');
              UI.refresh();
            },
          });
        });
      },
    });
  }

  function renameSheet(p) {
    UI.sheet({
      title: 'تغییر نام پروژه',
      html: `<div class="field mt-12"><span>نام اتاق</span><input class="input" id="rname" value="${UI.esc(p.name)}" maxlength="40"/></div>
      <div class="btn-row mt-16"><button class="btn secondary" data-close>بی‌خیال</button><button class="btn" data-save>ذخیره</button></div>`,
      mount(el) {
        const inp = el.querySelector('#rname');
        inp.focus();
        inp.select();
        el.querySelector('[data-save]').addEventListener('click', () => {
          const v = inp.value.trim();
          if (!v) {
            inp.classList.add('err');
            return;
          }
          S.rename(p.id, v);
          UI.closeSheet();
          UI.refresh();
        });
      },
    });
  }

  /* ================= حساب ================= */
  UI.define('account', function () {
    const st = S.get();
    const paid = st.purchases.filter((p) => p.status === 'paid');
    const html = `<div class="screen">
      <div class="content has-tabbar">
        <header class="topbar" style="padding-inline:0"><div class="tb-title">حساب من</div></header>
        <div class="card">
          <div style="display:flex;gap:12px;align-items:center">
            <div class="ico-lead" style="width:52px;height:52px;border-radius:16px">${A.icon('user', 24)}</div>
            <div style="flex:1">
              <div class="card-title">${st.user.loggedIn ? E.fa(st.user.phone) : 'مهمان'}</div>
              <div class="card-meta">${st.user.loggedIn ? 'وارد شده — پیش‌نویس‌ها روی همین گوشی هستند' : 'برای بازیابی خرید وارد شو'}</div>
            </div>
            ${st.user.loggedIn ? `<button class="chip" data-logout>خروج</button>` : `<button class="btn small" data-login>ورود</button>`}
          </div>
        </div>
        <div class="card mt-12" style="padding:4px 14px">
          <div class="row" data-purchases><div class="ico-lead">${A.icon('cart', 18)}</div><div class="row-main"><div class="row-title">خریدها</div><div class="row-sub">${E.fa(paid.length)} بستهٔ فعال</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-restore><div class="ico-lead">${A.icon('rotate', 18)}</div><div class="row-main"><div class="row-title">بازیابی خرید</div><div class="row-sub">سفارش قبلی را با شماره برگردان</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-support><div class="ico-lead">${A.icon('info', 18)}</div><div class="row-main"><div class="row-title">پشتیبانی</div><div class="row-sub">${E.fa(st.tickets.length)} تیکت ثبت‌شده</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
        </div>
        <div class="card mt-12" style="padding:4px 14px">
          <div class="row" style="cursor:default"><div class="ico-lead">${A.icon('sun', 18)}</div><div class="row-main"><div class="row-title">نوشتهٔ بزرگ</div><div class="row-sub">اندازهٔ متن را بزرگ‌تر می‌کند</div></div><button class="switch ${st.settings.bigText ? 'is-on' : ''}" data-bigtext aria-label="نوشتهٔ بزرگ"></button></div>
          <div class="row" data-ai><div class="ico-lead">${A.icon('spark', 18)}</div><div class="row-main"><div class="row-title">تصویر با هوش مصنوعی</div><div class="row-sub">${K.AI.ready() ? 'کلید وصل است · ' + K.AI.provider().name : 'برای تغییر واقعی عکس، کلید وصل کن'}</div></div><div class="row-side">${K.AI.ready() ? '<span class="badge ok">وصل</span>' : '<span class="badge warn">وصل نیست</span>'}</div></div>
          <div class="row" data-privacy><div class="ico-lead">${A.icon('lock', 18)}</div><div class="row-main"><div class="row-title">حریم خصوصی و نگهداری داده</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-ops><div class="ico-lead">${A.icon('grid', 18)}</div><div class="row-main"><div class="row-title">پنل عملیات (داخلی)</div><div class="row-sub">سفارش‌ها، بازبینی و پرداخت</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-pilot><div class="ico-lead">${A.icon('ruler', 18)}</div><div class="row-main"><div class="row-title">پایلوت و اندازه‌گیری</div><div class="row-sub">قیف استفاده و خروجی CSV</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
        </div>
        <div class="card mt-12" style="padding:4px 14px">
          <div class="row" data-reset><div class="ico-lead" style="background:var(--brick-soft);color:var(--brick)">${A.icon('trash', 18)}</div><div class="row-main"><div class="row-title">پاک‌کردن داده‌های نمایشی</div><div class="row-sub">همهٔ پروژه‌ها و خریدها روی این گوشی</div></div></div>
          <div class="row" data-delete><div class="ico-lead" style="background:var(--brick-soft);color:var(--brick)">${A.icon('user', 18)}</div><div class="row-main"><div class="row-title" style="color:var(--brick)">حذف حساب</div></div></div>
        </div>
        <p class="tiny center mt-16">${D.app.version} · ساخته‌شده بر پایهٔ سند طراحی خونه‌چین</p>
      </div>
      ${UI.tabbar('account')}
    </div>`;
    return {
      html,
      mount(root) {
        const loginBtn = root.querySelector('[data-login]');
        if (loginBtn) loginBtn.addEventListener('click', () => loginSheet());
        const logoutBtn = root.querySelector('[data-logout]');
        if (logoutBtn)
          logoutBtn.addEventListener('click', () => {
            S.logout();
            UI.refresh();
          });
        root.querySelector('[data-bigtext]').addEventListener('click', (ev) => {
          const st2 = S.get();
          st2.settings.bigText = !st2.settings.bigText;
          S.save();
          document.body.classList.toggle('big-text', st2.settings.bigText);
          ev.currentTarget.classList.toggle('is-on', st2.settings.bigText);
        });
        root.querySelector('[data-purchases]').addEventListener('click', purchasesSheet);
        root.querySelector('[data-restore]').addEventListener('click', restoreSheet);
        root.querySelector('[data-support]').addEventListener('click', () => UI.go('#/support'));
        root.querySelector('[data-privacy]').addEventListener('click', privacySheet);
        root.querySelector('[data-ai]').addEventListener('click', () => UI.go('#/ai'));
        root.querySelector('[data-ops]').addEventListener('click', () => UI.go('#/ops'));
        root.querySelector('[data-pilot]').addEventListener('click', () => UI.go('#/pilot'));
        root.querySelector('[data-reset]').addEventListener('click', () =>
          UI.confirmSheet({
            title: 'داده‌های نمایشی پاک شود؟',
            sub: 'پروژه‌ها، خریدها و تیکت‌های این گوشی حذف می‌شوند.',
            confirm: 'پاک کن',
            danger: true,
            onConfirm() {
              S.resetDemo();
              UI.toast('داده‌های نمایشی دوباره ساخته شد.');
              UI.go('#/home');
            },
          })
        );
        root.querySelector('[data-delete]').addEventListener('click', () =>
          UI.confirmSheet({
            title: 'حذف حساب',
            sub: 'دسترسی حساب و لینک‌های صادرشده قطع می‌شود. عکس‌های ارسالی و پردازش‌های صف‌شده حذف می‌شوند. نسخه‌ای که خودت ذخیره یا ارسال کرده‌ای خارج از اپ می‌ماند.',
            confirm: 'حذف حساب',
            danger: true,
            onConfirm() {
              S.logout();
              UI.toast('حساب حذف شد. پروژه‌های محلی پاک شدند.');
              S.resetDemo();
              UI.go('#/welcome');
            },
          })
        );
      },
    };
  });

  function loginSheet() {
    UI.sheet({
      title: 'ورود با شماره',
      sub: 'کد تأیید در نسخهٔ نمایشی: ۱۲۳۴',
      html: `<div class="field mt-12"><span>شمارهٔ موبایل</span><input class="input" id="phone" inputmode="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" maxlength="11"/><div class="field-err" id="perr" hidden></div></div>
      <button class="btn mt-12" data-send>دریافت کد</button>
      <div class="field mt-12" id="codewrap" hidden><span>کد تأیید</span><input class="input" id="code" inputmode="numeric" maxlength="5" placeholder="۱۲۳۴"/><div class="field-err" id="cerr" hidden></div></div>
      <button class="btn mt-12" data-verify hidden>تأیید و ورود</button>`,
      mount(el) {
        const phone = el.querySelector('#phone');
        const code = el.querySelector('#code');
        const perr = el.querySelector('#perr');
        const cerr = el.querySelector('#cerr');
        el.querySelector('[data-send]').addEventListener('click', () => {
          const v = E.normDigits(phone.value).replace(/\D/g, '');
          if (v.length !== 11 || !v.startsWith('09')) {
            phone.classList.add('err');
            perr.hidden = false;
            perr.textContent = 'شماره باید ۱۱ رقم و با ۰۹ شروع شود.';
            return;
          }
          phone.classList.remove('err');
          perr.hidden = true;
          el.querySelector('#codewrap').hidden = false;
          el.querySelector('[data-verify]').hidden = false;
          el.querySelector('[data-send]').hidden = true;
          code.focus();
        });
        el.querySelector('[data-verify]').addEventListener('click', () => {
          if (E.normDigits(code.value).replace(/\D/g, '') !== '1234') {
            code.classList.add('err');
            cerr.hidden = false;
            cerr.textContent = 'کد درست نیست. در نسخهٔ نمایشی ۱۲۳۴ را وارد کن.';
            return;
          }
          S.login(E.normDigits(phone.value).replace(/\D/g, ''));
          UI.closeSheet();
          UI.toast('وارد شدی. پیش‌نویس‌ها سر جایشان هستند.');
          UI.refresh();
        });
      },
    });
  }

  function purchasesSheet() {
    const st = S.get();
    const rows = st.purchases.length
      ? st.purchases
          .map(
            (x) => `<div class="row" style="cursor:default"><div class="ico-lead">${A.icon('cart', 18)}</div><div class="row-main"><div class="row-title">${UI.esc(x.projectName)}</div><div class="row-sub">${UI.money(x.amount)} · ${UI.relTime(x.at)} · ${x.receiptId || 'در انتظار'}</div></div><span class="badge ${x.status === 'paid' ? 'ok' : x.status === 'pending' ? 'warn' : 'bad'}">${x.status === 'paid' ? 'پرداخت‌شده' : x.status === 'pending' ? 'در انتظار' : 'ناموفق'}</span></div>`
          )
          .join('')
      : `<p class="sub center mt-16">خریدی ثبت نشده است.</p>`;
    UI.sheet({ title: 'خریدها', html: `<div class="mt-8">${rows}</div>` });
  }

  function restoreSheet() {
    UI.sheet({
      title: 'بازیابی خرید',
      sub: 'شماره‌ای که با آن خریده‌ای را وارد کن.',
      html: `<div class="field mt-12"><span>شمارهٔ موبایل</span><input class="input" id="rphone" inputmode="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹"/><div class="field-err" id="rerr" hidden></div></div>
      <button class="btn mt-12" data-do>بازیابی</button>`,
      mount(el) {
        el.querySelector('[data-do]').addEventListener('click', () => {
          const r = S.restorePurchase(el.querySelector('#rphone').value);
          if (!r.ok) {
            const err = el.querySelector('#rerr');
            err.hidden = false;
            err.textContent = r.reason;
            return;
          }
          UI.closeSheet();
          UI.toast(r.count ? E.fa(r.count) + ' بستهٔ پرداخت‌شده بازیابی شد.' : 'خریدی برای این شماره پیدا نشد.');
        });
      },
    });
  }

  function privacySheet() {
    UI.sheet({
      title: 'حریم خصوصی و نگهداری داده',
      html: `<div class="stack-sm mt-8">
        <div class="card flat"><b>عکس‌ها</b><p class="sub">عکس هنگام انتخاب روی گوشی دوباره رمزگذاری می‌شود و داده‌های مکانی (GPS) از آن حذف می‌شود. در این نسخهٔ نمایشی هیچ عکسی به سرور فرستاده نمی‌شود.</p></div>
        <div class="card flat"><b>دورهٔ نگهداری</b><p class="sub">فایل‌های موقت پردازش پس از ۷ روز و نسخهٔ پشتیبان حداکثر تا ۳۰ روز پس از حذف پروژه پاک می‌شود.</p></div>
        <div class="card flat"><b>دادهٔ آماری</b><p class="sub">رویدادهایی مثل شروع، تکمیل عکس، دیدن پیش‌نمایش، خرید و اصلاح ثبت می‌شوند؛ متن خواستهٔ تو و تصویر خانه در دادهٔ آماری قرار نمی‌گیرد.</p></div>
        <div class="card flat"><b>حذف پروژه</b><p class="sub">با حذف پروژه، پردازش فعال لغو می‌شود و نتیجهٔ دیررس دوباره ظاهر نمی‌شود. رسیدهای مالی جدا از عکس‌های خانه نگهداری می‌شوند.</p></div>
      </div>`,
    });
  }

  /* ================= پشتیبانی ================= */
  UI.define('support', function () {
    const st = S.get();
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">پشتیبانی</div>
      </header>
      <div class="content">
        <div class="card">
          <div class="card-title">${A.icon('info', 18)} گزارش مشکل</div>
          <div class="field mt-12"><span>موضوع</span><input class="input" id="tsub" placeholder="مثلاً طرح با فهرست تغییرها نمی‌خورد"/></div>
          <div class="field mt-12"><span>توضیح (اختیاری)</span><textarea class="input" id="tbody" placeholder="چه اتفاقی افتاد؟"></textarea></div>
          <div class="field mt-12"><span>پروژه</span>
            <select class="input" id="tprj">${st.projects.map((p) => `<option value="${p.id}">${UI.esc(p.name)}</option>`).join('')}</select>
          </div>
          <button class="btn mt-12" data-send-ticket>ثبت تیکت</button>
          <p class="tiny mt-8">شناسهٔ پروژه و وضعیت سفارش به‌صورت خودکار درج می‌شود. پیوست تصویر اختیاری است.</p>
        </div>
        ${st.tickets.length ? `<h3 class="h3 mt-16">تیکت‌های من</h3><div class="stack-sm mt-8">${st.tickets
          .map((t) => `<div class="card flat"><div class="card-title" style="justify-content:space-between">${UI.esc(t.subject)}<span class="badge warn">در بررسی</span></div><div class="card-meta">${UI.esc(t.projectName)} · ${UI.relTime(t.at)}</div></div>`)
          .join('')}</div>` : ''}
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-send-ticket]').addEventListener('click', () => {
          const sub = root.querySelector('#tsub').value.trim();
          if (!sub) {
            root.querySelector('#tsub').classList.add('err');
            return;
          }
          const pid = root.querySelector('#tprj').value;
          S.addTicket(S.byId(pid), sub, root.querySelector('#tbody').value.trim());
          UI.toast('تیکت ثبت شد؛ پاسخ در حساب من دیده می‌شود.');
          UI.refresh();
        });
      },
    };
  });
})(window);
