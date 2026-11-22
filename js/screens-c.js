/* پلان و اندازه‌گیری + صفحهٔ پردازش */
(function (global) {
  const K = global.K;
  const UI = K.UI;
  const S = K.Store;
  const E = K.Engine;
  const A = K.Art;
  const D = K.Data;

  /* ================= پلان و اندازه ================= */
  let planSel = null;
  UI.define('plan', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    if (!p) return { html: '<div class="content"><p class="sub">پروژه پیدا نشد.</p></div>' };
    if (ctx.query.item) planSel = ctx.query.item;
    const selected = p.items.find((i) => i.id === planSel) ? planSel : (p.items.find((i) => i.status === 'free') || {}).id || p.items[0].id;
    planSel = selected;
    let issues = [];
    let undo = null;
    const S_PX = 100;
    const PAD = 34;

    function renderPlan() {
      const chk = E.check(p);
      issues = chk.issues;
      return A.plan(p, { selected, issues });
    }

    function validationFor(item) {
      const chk = E.check(p);
      const mine = chk.itemIssues(item.id);
      if (mine.length) return { tone: 'bad', label: 'جا نمی‌شود', text: mine[0].text };
      if (item.meas !== 'measured') return { tone: 'warn', label: 'اندازه لازم است', text: 'اندازهٔ ' + item.name + ' ثبت نشده؛ تأیید جابه‌جایی به همین اندازه وابسته است.' };
      return { tone: 'ok', label: 'جا می‌شود', text: 'با ابعاد فعلی در مقصد جا می‌شود؛ مسیر عبور هم بررسی شد.' };
    }

    const item = p.items.find((i) => i.id === selected) || p.items[0];
    const v = validationFor(item);
    const chk = E.check(p);
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">پلان و اندازه</div>
        <div class="tb-side"><button class="iconbtn is-bordered" data-save aria-label="ذخیره">${A.icon('check', 19)}</button></div>
      </header>
      <div class="content">
        <div class="plan-wrap" id="planwrap">${renderPlan()}
          <div class="plan-legend">
            <span><i style="background:#8C6B52"></i>قابل تغییر</span>
            <span><i style="background:#5C4636"></i>ثابت (قفل)</span>
            <span><i style="background:#A44232"></i>فرش</span>
            <span><i style="background:#4E7A8A"></i>پنجره</span>
          </div>
        </div>
        <div class="card ${v.tone === 'bad' ? 'warn' : v.tone === 'warn' ? 'flat' : 'tint'} mt-12">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge ${v.tone === 'bad' ? 'bad' : v.tone === 'warn' ? 'warn' : 'ok'}">${v.label}</span>
            <b style="font-size:14px">${UI.esc(item.name)}</b>
          </div>
          <p class="sub mt-4">${UI.esc(v.text)}</p>
        </div>
        <div class="card mt-12">
          <div class="card-title">${A.icon('ruler', 18)} اندازهٔ این وسیله</div>
          <div class="btn-row mt-8">
            <div class="field" style="flex:1"><span>طول (سانتی‌متر)</span><input class="input" id="plen" inputmode="numeric" value="${item.meas === 'unknown' ? '' : E.fa(item.len)}"/></div>
            <div class="field" style="flex:1"><span>عمق (سانتی‌متر)</span><input class="input" id="pdep" inputmode="numeric" value="${item.meas === 'unknown' ? '' : E.fa(item.dep)}"/></div>
          </div>
          <div class="field-err" id="plerr" hidden></div>
          <div class="btn-row mt-12">
            <button class="btn secondary small" data-rotate>${A.icon('rotate', 17)} چرخش ۹۰°</button>
            <button class="btn secondary small" data-undo ${undo ? '' : 'disabled'}>برگرداندن</button>
          </div>
          <p class="tiny mt-8">اندازه فقط برای همین جابه‌جایی ثبت می‌شود و به بقیهٔ بخش‌ها تعمیم داده نمی‌شود.</p>
        </div>
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('path', 18)} عرض آزاد کنار پنجره</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <input class="input" id="freew" inputmode="numeric" value="${E.fa(180)}" style="max-width:120px"/>
            <span class="tiny">سانتی‌متر — این عدد را از اندازه‌گیری واقعی جایگزین کن.</span>
          </div>
          <p class="tiny mt-8">اگر طول وسیله از این عدد بیشتر باشد، آن جابه‌جایی از پیشنهاد اجرایی حذف می‌شود.</p>
        </div>
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('grid', 18)} ابعاد اتاق</div>
          <div class="btn-row mt-8">
            <div class="field" style="flex:1"><span>عرض (سانتی‌متر)</span><input class="input" id="rw" inputmode="numeric" value="${E.fa(Math.round(p.room.w * 100))}"/></div>
            <div class="field" style="flex:1"><span>عمق (سانتی‌متر)</span><input class="input" id="rd" inputmode="numeric" value="${E.fa(Math.round(p.room.d * 100))}"/></div>
          </div>
          <div class="field-err" id="rerr" hidden></div>
          <p class="tiny mt-8">پلان فعلی بر پایهٔ ${E.fa(Math.round(p.room.w * 100))} × ${E.fa(Math.round(p.room.d * 100))} سانتی‌متر است. با اصلاح این دو عدد، همهٔ بررسی‌ها با اتاق خودت انجام می‌شود و چیدمان متناسب جابه‌جا می‌ماند.</p>
        </div>
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('info', 18)} عرض مسیر</div>
          <p class="sub mt-4">مسیر بالکن: ${E.cmLabel(Math.round(chk.freeRoute * 100))} · ${chk.conflicts.length ? E.fa(chk.conflicts.length) + ' تعارض' : 'بدون تعارض'}</p>
        </div>
        ${
          p.items.filter((i) => i.status === 'fixed').length
            ? `<p class="tiny mt-12">وسایل ثابت (${p.items.filter((i) => i.status === 'fixed').map((i) => i.name).join('، ')}) در برابر کشیدن قفل‌اند.</p>`
            : ''
        }
      </div>
      <div class="actions">
        <div class="btn-row">
          <button class="btn secondary" data-save>ذخیرهٔ پلان</button>
          <button class="btn" data-finish>ثبت اندازه</button>
        </div>
      </div>
    </div>`;

    return {
      html,
      mount(root) {
        const svg = root.querySelector('.plan-svg');
        const pt = svg.createSVGPoint();
        const toModel = (ev) => {
          pt.x = ev.clientX;
          pt.y = ev.clientY;
          const m = pt.matrixTransform(svg.getScreenCTM().inverse());
          return { x: (m.x - PAD) / S_PX, y: (m.y - PAD) / S_PX };
        };

        let drag = null;
        svg.querySelectorAll('.plan-item').forEach((g) => {
          const id = g.getAttribute('data-item');
          const it = p.items.find((i) => i.id === id);
          if (!it) return;
          g.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            planSel = id;
            if (it.status === 'fixed') {
              UI.toast('این وسیله روی جای ثابت است و جابه‌جا نمی‌شود.');
              UI.refresh();
              return;
            }
            const start = toModel(ev);
            drag = { id, it, start, orig: { x: it.x, y: it.y }, g };
            g.setPointerCapture(ev.pointerId);
            g.classList.add('dragging');
          });
          g.addEventListener('pointermove', (ev) => {
            if (!drag || drag.id !== id) return;
            const cur = toModel(ev);
            const r = E.rect(it);
            const nx = Math.max(0, Math.min(p.room.w - r.w, Math.round((drag.orig.x + cur.x - drag.start.x) * 40) / 40));
            const ny = Math.max(0, Math.min(p.room.d - r.d, Math.round((drag.orig.y + cur.y - drag.start.y) * 40) / 40));
            drag.next = { x: nx, y: ny };
            drag.g.setAttribute('transform', 'translate(' + (nx - drag.orig.x) * S_PX + ',' + (ny - drag.orig.y) * S_PX + ')');
          });
          const end = () => {
            if (!drag || drag.id !== id) return;
            const it2 = drag.it;
            if (drag.next) {
              undo = { id: it2.id, x: it2.x, y: it2.y, rot: it2.rot };
              it2.x = drag.next.x;
              it2.y = drag.next.y;
              S.touch(p);
            }
            drag = null;
            UI.render();
          };
          g.addEventListener('pointerup', end);
          g.addEventListener('pointercancel', end);
        });

        // انتخاب با لمس ساده
        svg.querySelectorAll('.plan-item').forEach((g) =>
          g.addEventListener('click', () => {
            planSel = g.getAttribute('data-item');
            UI.refresh();
          })
        );

        root.querySelector('[data-rotate]').addEventListener('click', () => {
          if (item.status === 'fixed') return UI.toast('این وسیله روی جای ثابت است.');
          const it = p.items.find((i) => i.id === selected);
          undo = { id: it.id, x: it.x, y: it.y, rot: it.rot };
          it.rot = (it.rot + 90) % 180;
          S.touch(p);
          UI.refresh();
        });
        const undoBtn = root.querySelector('[data-undo]');
        if (undoBtn)
          undoBtn.addEventListener('click', () => {
            if (!undo) return;
            const it = p.items.find((i) => i.id === undo.id);
            it.x = undo.x;
            it.y = undo.y;
            it.rot = undo.rot;
            undo = null;
            S.touch(p);
            UI.refresh();
          });

        root.querySelector('[data-finish]').addEventListener('click', () => commitMeasure(root));
        root.querySelectorAll('[data-save]').forEach((b) =>
          b.addEventListener('click', () => {
            p.plan.saved = true;
            S.touch(p);
            S.track('plan_saved', { projectId: p.id });
            UI.toast('پلان ذخیره شد.');
            goBack();
          })
        );

        const freew = root.querySelector('#freew');
        freew.addEventListener('change', () => {
          const val = E.parseMeasure(freew.value);
          if (!val.ok) {
            freew.classList.add('err');
            return;
          }
          freew.classList.remove('err');
          p.room.constraints[0].to = p.room.constraints[0].from + val.cm / 100;
          S.touch(p);
          UI.refresh();
        });

        ['#rw', '#rd'].forEach((sel2) =>
          root.querySelector(sel2).addEventListener('change', () => {
            const w = E.parseMeasure(root.querySelector('#rw').value);
            const d = E.parseMeasure(root.querySelector('#rd').value);
            const err = root.querySelector('#rerr');
            if (!w.ok || !d.ok) {
              err.hidden = false;
              err.textContent = 'عرض و عمق را با عدد معتبر (بین ۲۰۰ و ۱۲۰۰ سانتی‌متر) وارد کن.';
              return;
            }
            const res = E.resizeRoom(p, w.cm, d.cm);
            if (!res.ok) {
              err.hidden = false;
              err.textContent = res.reason;
              return;
            }
            err.hidden = true;
            S.touch(p);
            UI.toast('ابعاد اتاق ثبت شد؛ بررسی‌ها با اتاق تازه انجام می‌شود.');
            UI.refresh();
          })
        );

        function commitMeasure(r) {
          const L = E.parseMeasure(r.querySelector('#plen').value);
          const Dp = E.parseMeasure(r.querySelector('#pdep').value);
          const err = r.querySelector('#plerr');
          if (!L.ok || !Dp.ok) {
            err.hidden = false;
            err.textContent = (!L.ok ? 'طول: ' + E.measureError[L.reason] : '') + ' ' + (!Dp.ok ? 'عمق: ' + E.measureError[Dp.reason] : '');
            return;
          }
          err.hidden = true;
          item.len = L.cm;
          item.dep = Dp.cm;
          item.meas = 'measured';
          S.touch(p);
          UI.toast('اندازه ثبت شد؛ فقط وضعیت همین جابه‌جایی به‌روز شد.');
          UI.refresh();
        }
      },
    };

    function goBack() {
      if (p.status === 'ready') UI.go('#/result/' + p.id);
      else UI.go('#/new/review/' + p.id);
    }
  });

  /* ================= پردازش ================= */
  UI.define('processing', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    if (!p) {
      return { html: `<div class="screen"><div class="content"><div class="empty"><b>پروژه پیدا نشد</b><p class="sub mt-4">شاید حذف شده باشد. نتیجهٔ دیررس هم نمایش داده نمی‌شود.</p><button class="btn mt-16" data-go="#/projects">پروژه‌ها</button></div></div></div>` };
    }
    if (p.status === 'ready') {
      setTimeout(() => UI.go('#/result/' + p.id), 10);
    }
    if (p.status === 'failed') {
      return failedScreen(p);
    }

    const stage = S.processingStage(p) || { i: 0, label: 'در صف ساخت', pct: 6 };
    const steps = [
      { k: 'queued', t: 'ثبت سفارش' },
      { k: 'building', t: 'ساخت چیدمان و فهرست تغییرها' },
      { k: 'review', t: 'کنترل تضاد با وسایل ثابت' },
      { k: 'ready', t: 'آمادهٔ نمایش' },
    ];
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-go="#/projects" aria-label="بستن">${A.icon('close', 20)}</button>
        <div class="tb-title">در حال ساخت</div>
        <div class="tb-side">${UI.statusBadge(p)}</div>
      </header>
      <div class="content">
        <div class="proc">
          <div class="proc-thumb">${UI.projectThumb(p)}</div>
          <div class="proc-ring" style="--p:${Math.round(stage.pct)}"><b>${E.fa(Math.round(stage.pct))}٪</b></div>
          <h2 class="h2">${stage.label}</h2>
          <p class="sub">${UI.esc(p.name)} — ${E.fa(p.photos.length)} عکس، هدف «${(D.goals.find((g) => g.id === p.goal.primary) || {}).label || '—'}»</p>
        </div>
        <div class="card mt-8" style="padding:6px 14px">
          ${steps
            .map(
              (s, i) => `<div class="row" style="cursor:default">
                <div class="ico-lead" style="background:${i < stage.i ? 'var(--primary)' : i === stage.i ? 'var(--primary-soft)' : 'rgba(36,49,43,.06)'};color:${i < stage.i ? '#fff' : 'var(--primary)'}">${i < stage.i ? A.icon('check', 16) : E.fa(i + 1)}</div>
                <div class="row-main"><div class="row-title" style="${i > stage.i ? 'opacity:.5' : ''}">${s.t}</div></div>
                ${i === stage.i ? '<span class="badge warn dot">در جریان</span>' : i < stage.i ? '<span class="badge ok">انجام شد</span>' : ''}
              </div>`
            )
            .join('')}
        </div>
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('info', 18)} اگر اپ را ببندی</div>
          <p class="sub mt-4">سفارش روی همین گوشی ثبت شده است. با باز کردن دوباره، وضعیت از همان مرحله ادامه پیدا می‌کند و سفارش تازه‌ای ساخته نمی‌شود.</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn secondary" data-go="#/projects">برگشت به پروژه‌ها</button>
        <div class="meta">می‌توانی صفحه را ببندی؛ ساخت ادامه دارد.</div>
      </div>
    </div>`;

    return {
      html,
      mount(root) {
        let lastStage = stage.i;
        const tick = () => {
          const cur = S.byId(p.id);
          if (!cur) {
            clearInterval(UI._pt);
            UI.go('#/projects');
            return;
          }
          const st = S.processingStage(cur);
          if (!st) {
            if (cur.status === 'failed') UI.render();
            return;
          }
          if (st.i === 3 && cur.status !== 'ready') {
            S.finishProcessing(cur);
            UI.go('#/result/' + cur.id);
            return;
          }
          if (st.i !== lastStage) {
            lastStage = st.i;
            UI.render();
            return;
          }
          const ring = root.querySelector('.proc-ring b');
          if (ring) ring.textContent = E.fa(Math.round(st.pct)) + '٪';
          const h2 = root.querySelector('.proc h2');
          if (h2) h2.textContent = st.label;
        };
        UI._pt = setInterval(tick, 350);
        tick();
      },
    };
  });

  function failedScreen(p) {
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-go="#/projects" aria-label="بستن">${A.icon('close', 20)}</button>
        <div class="tb-title">ساخت کامل نشد</div>
        <div class="tb-side"><span class="badge bad">ناموفق</span></div>
      </header>
      <div class="content">
        <div class="empty" style="padding-top:26px">
          <div class="em-ico" style="background:var(--brick-soft);color:var(--brick)">${A.icon('info', 28)}</div>
          <b>پیش‌نمایش دقیق آماده نشد</b>
          <p class="sub mt-4">${UI.esc(p.failure || 'کنترل کیفیت تصویر را نپذیرفت.')}</p>
        </div>
        <div class="card tint mt-8">
          <div class="card-title">${A.icon('grid', 18)} خروجی جایگزین</div>
          <p class="sub mt-4">پلان با اندازه‌های نامعلوم و فهرست تغییرهای معتبر در دسترس است. اعتبار اصلاح در اثر خطای سیستم مصرف نمی‌شود.</p>
          <button class="btn secondary small mt-8" data-plan>دیدن پلان</button>
        </div>
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('camera', 18)} عکس بهتری بفرست</div>
          <p class="sub mt-4">نور بیشتر، کادر کامل‌تر و دوربین ثابت، نرخ تأیید تصویر را بالا می‌برد.</p>
          <button class="btn secondary small mt-8" data-newphoto>ثبت عکس دوباره</button>
        </div>
      </div>
      <div class="actions">
        <button class="btn" data-retry>تلاش دوباره با همین درخواست</button>
        <div class="meta">همان شناسهٔ سفارش استفاده می‌شود؛ سفارش موازی ساخته نمی‌شود.</div>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-retry]').addEventListener('click', () => {
          const r = S.startProcessing(p);
          if (r.duplicate) UI.toast('این سفارش از قبل در صف است.');
          UI.render();
        });
        root.querySelector('[data-plan]').addEventListener('click', () => UI.go('#/plan/' + p.id));
        root.querySelector('[data-newphoto]').addEventListener('click', () => {
          p.status = 'draft';
          p.step = 'photo';
          S.touch(p);
          UI.go('#/new/photo/' + p.id);
        });
      },
    };
  }
})(window);
