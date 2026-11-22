/* نتیجه، اصلاح موضعی، راهنمای اجرا، بسته و رسید، پنل عملیات */
(function (global) {
  const K = global.K;
  const UI = K.UI;
  const S = K.Store;
  const E = K.Engine;
  const A = K.Art;
  const D = K.Data;

  function schemeLabel(s) {
    if (s.id === 'A') return 'بدون خرید';
    if (s.id === 'B') return s.tag === 'با خرید محدود' ? 'با خرید محدود' : 'طرح دوم';
    return s.title.replace('نسخهٔ ', 'نسخه ');
  }

  function goBack(p) {
    if (p) UI.go('#/projects');
  }

  function aiCardHtml(p) {
    const AI = K.AI;
    const ai = p.ai || { status: 'idle' };
    if (!AI.ready()) {
      return `<div class="card tint mt-12">
        <div class="card-title">${A.icon('spark', 18)} تصویر واقعی با هوش مصنوعی</div>
        <p class="sub mt-4">برای اینکه عکس اتاقت واقعاً عوض شود، یک کلید سرویس تصویر لازم است. رایگان‌ترین راه، کلید Google AI Studio است.</p>
        <div class="btn-row mt-8">
          <button class="btn small" data-ai-settings>وصل‌کردن کلید</button>
          <button class="btn secondary small" data-ai-help>چطور بگیرم؟</button>
        </div>
      </div>`;
    }
    if (ai.status === 'loading') {
      return `<div class="card mt-12">
        <div class="card-title">${A.icon('spark', 18)} در حال ساخت تصویر…</div>
        <div class="progress mt-8"><i class="ai-bar" style="width:12%"></i></div>
        <p class="sub mt-8">عکس اتاق برای ${UI.esc(AI.provider().name)} فرستاده می‌شود و معمولاً ۲۰ تا ۹۰ ثانیه طول می‌کشد. صفحه را نبند.</p>
      </div>`;
    }
    if (ai.status === 'error') {
      return `<div class="card warn mt-12">
        <div class="card-title">${A.icon('info', 18)} تصویر ساخته نشد</div>
        <p class="sub mt-4">${UI.esc(ai.error || '')}</p>
        <div class="btn-row mt-8">
          <button class="btn small" data-ai-retry>تلاش دوباره</button>
          <button class="btn secondary small" data-ai-settings>تنظیمات کلید</button>
        </div>
      </div>`;
    }
    if (ai.status === 'done') {
      return `<div class="card mt-12">
        <div class="card-title" style="justify-content:space-between"><span>${A.icon('spark', 18)} ساخته‌شده با هوش مصنوعی</span><span class="badge ok">واقعی</span></div>
        <p class="sub mt-4">این تصویر با ${UI.esc(AI.provider().name)} از عکس اتاق تو ساخته شده. با کشیدن انگشت روی تصویر، قبل و بعد را مقایسه کن.</p>
        <div class="btn-row mt-8">
          <button class="btn small" data-ai-retry>تولید دوباره</button>
          <button class="btn secondary small" data-ai-refine>اصلاح با AI</button>
        </div>
        <button class="btn ghost small mt-8" data-ai-remove>حذف تصویر و بازگشت به طرح شماتیک</button>
      </div>`;
    }
    return `<div class="card mt-12">
      <div class="card-title">${A.icon('spark', 18)} تصویر واقعی از این اتاق</div>
      <p class="sub mt-4">${AI.provider().name} آماده است. با زدن دکمه، عکس اتاق و خواستهٔ تو فرستاده می‌شود و تصویر تازه برمی‌گردد.</p>
      <button class="btn mt-8" data-ai-run>ساخت تصویر با ${UI.esc(AI.provider().name)}</button>
    </div>`;
  }

  UI.define('ai', function () {
    const cfg = K.AI.config();
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">هوش مصنوعی تصویر</div>
        <div class="tb-side">${K.AI.ready() ? '<span class="badge ok">وصل</span>' : '<span class="badge warn">وصل نیست</span>'}</div>
      </header>
      <div class="content">
        <p class="sub">برای تغییر واقعی عکس، یک مدل تصویری لازم است. کلید فقط در همین گوشی ذخیره می‌شود و مستقیم به سرویس خودت می‌رود؛ هیچ سروری از ما در میان نیست.</p>

        <h3 class="h3 mt-16">سرویس</h3>
        <div class="stack-sm mt-8">
          ${K.AI.providers
            .map(
              (pr) => `<button class="status-opt ${cfg.provider === pr.id ? 'is-on' : ''}" data-prov="${pr.id}">
                <div style="min-width:0"><b>${pr.name}</b><div class="tiny">${pr.hint}</div><div class="tiny" style="direction:ltr;text-align:right;opacity:.75;word-break:break-all">${pr.model}</div></div>
                <span class="so-radio">${cfg.provider === pr.id ? A.icon('check', 14) : ''}</span>
              </button>`
            )
            .join('')}
        </div>

        <div class="field mt-16">
          <span>کلید API</span>
          <input class="input" id="aikey" type="password" dir="ltr" placeholder="کلید API را اینجا بچسبان" value="${UI.esc(cfg.key || '')}"/>
        </div>
        <div class="field mt-12">
          <span>مدل (اختیاری)</span>
          <input class="input" id="aimodel" dir="ltr" placeholder="${UI.esc(K.AI.provider().model)}" value="${UI.esc(cfg.model || '')}"/>
        </div>
        <div class="btn-row mt-12">
          <button class="btn" data-save-key>ذخیره</button>
          <button class="btn secondary" data-test-key>آزمایش کلید</button>
        </div>
        <p class="tiny mt-8">آزمایش از همین مرورگر انجام می‌شود؛ اگر VPN تو افزونهٔ مرورگر است، باید همان‌جا روشن باشد. اگر VPN کل ویندوز است، همین کافی است.</p>
        <div class="field-err" id="aierr" hidden></div>
        <div class="card tint mt-12" id="aiok" hidden><div class="tiny" id="aioktxt"></div></div>

        <div class="card flat mt-16">
          <div class="card-title">${A.icon('info', 18)} کلید را از کجا بگیرم؟</div>
          <p class="sub mt-4"><b>OpenRouter</b> از ایران بدون VPN کار می‌کند و همان مدل‌های تصویری گوگل را دارد؛ فقط باید چند دلار شارژ کنی. <b>Gemini</b> رایگان است ولی از شبکهٔ ایران بسته است و VPN می‌خواهد. <b>OpenAI</b> پرداختی است.</p>
          <div class="btn-row mt-8" style="flex-wrap:wrap">
            <button class="btn secondary small" data-open-openrouter>کلید OpenRouter</button>
            <button class="btn secondary small" data-open-gemini>کلید Gemini</button>
            <button class="btn secondary small" data-open-openai>کلید OpenAI</button>
          </div>
        </div>

        <div class="card flat mt-12">
          <div class="card-title">${A.icon('lock', 18)} حریم خصوصی</div>
          <p class="sub mt-4">با زدن دکمهٔ ساخت تصویر، عکس اتاقت به سرویس انتخاب‌شده فرستاده می‌شود. اگر نمی‌خواهی عکست جایی برود، از این بخش استفاده نکن؛ طرح شماتیک و پلان بدون ارسال عکس کار می‌کنند.</p>
        </div>
        <button class="btn ghost mt-12" data-clear-key>پاک‌کردن کلید</button>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        let provider = cfg.provider;
        root.querySelectorAll('[data-prov]').forEach((b) =>
          b.addEventListener('click', () => {
            provider = b.getAttribute('data-prov');
            root.querySelectorAll('[data-prov]').forEach((x) => x.classList.toggle('is-on', x === b));
            root.querySelectorAll('.so-radio').forEach((r) => (r.innerHTML = ''));
            b.querySelector('.so-radio').innerHTML = A.icon('check', 14);
          })
        );
        root.querySelector('[data-save-key]').addEventListener('click', () => {
          const key = root.querySelector('#aikey').value.trim();
          const model = root.querySelector('#aimodel').value.trim();
          const err = root.querySelector('#aierr');
          if (!key) {
            err.hidden = false;
            err.textContent = 'کلید را وارد کن.';
            return;
          }
          if (provider === 'gemini' && !/^(AIza|AQ\.)/.test(key)) {
            err.hidden = false;
            err.textContent = 'کلید Gemini با AIza یا AQ. شروع می‌شود؛ مطمئن شو کلید کامل کپی شده.';
            return;
          }
          if (provider === 'openrouter' && !/^sk-or-/.test(key)) {
            err.hidden = false;
            err.textContent = 'کلید OpenRouter با sk-or- شروع می‌شود.';
            return;
          }
          if (provider === 'openai' && !/^sk-/.test(key)) {
            err.hidden = false;
            err.textContent = 'کلید OpenAI با sk- شروع می‌شود.';
            return;
          }
          err.hidden = true;
          K.AI.setConfig({ provider, key, model });
          UI.toast('کلید ذخیره شد.');
          UI.refresh();
        });
        root.querySelector('[data-test-key]').addEventListener('click', async (ev) => {
          const key = root.querySelector('#aikey').value.trim();
          const model = root.querySelector('#aimodel').value.trim();
          if (key) K.AI.setConfig({ provider, key, model });
          const err = root.querySelector('#aierr');
          const ok = root.querySelector('#aiok');
          const txt = root.querySelector('#aioktxt');
          ev.currentTarget.disabled = true;
          ev.currentTarget.textContent = 'در حال آزمایش…';
          try {
            const r = await K.AI.testKey();
            err.hidden = true;
            ok.hidden = false;
            txt.textContent =
              r.credit != null
                ? 'کلید سالم است؛ اعتبار باقی‌مانده: $' + r.credit
                : 'کلید سالم است؛ ' + E.fa(r.models) + ' مدل در دسترس' + (r.imageModel ? ' و مدل تصویر پیدا شد.' : '.');
            if (r.models && !r.imageModel) txt.textContent += ' اگر تصویر ساخته نشد، نام مدل را در کادر بالا بگذار.';
          } catch (e) {
            ok.hidden = true;
            err.hidden = false;
            err.textContent = K.AI.errorText(e);
          } finally {
            ev.currentTarget.disabled = false;
            ev.currentTarget.textContent = 'آزمایش کلید';
          }
        });
        root.querySelector('[data-open-gemini]').addEventListener('click', () =>
          window.open('https://aistudio.google.com/apikey', '_blank', 'noopener')
        );
        root.querySelector('[data-open-openrouter]').addEventListener('click', () =>
          window.open('https://openrouter.ai/keys', '_blank', 'noopener')
        );
        root.querySelector('[data-open-openai]').addEventListener('click', () =>
          window.open('https://platform.openai.com/api-keys', '_blank', 'noopener')
        );
        root.querySelector('[data-clear-key]').addEventListener('click', () =>
          UI.confirmSheet({
            title: 'کلید پاک شود؟',
            sub: 'بعد از پاک‌کردن، ساخت تصویر با AI کار نمی‌کند.',
            confirm: 'پاک کن',
            danger: true,
            onConfirm() {
              K.AI.clear();
              UI.refresh();
            },
          })
        );
      },
    };
  });

  /* ================= نتیجه ================= */
  UI.define('result', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    if (!p) return { html: '<div class="screen"><div class="content"><div class="empty"><b>پروژه پیدا نشد</b></div></div></div>' };
    if (p.status !== 'ready') {
      setTimeout(() => UI.go('#/processing/' + p.id), 10);
      return { html: '<div class="screen"><div class="content"><p class="sub">در حال رفتن به وضعیت ساخت…</p></div></div>' };
    }
    let focus = null;
    const scheme = S.activeScheme(p) || p.schemes[0];
    const ai = p.ai || { status: 'idle' };
    const aiImage = ai.status === 'done' && ai.image ? ai.image : null;
    const before = UI.isSamplePhoto(p) ? UI.sceneHtml(p, null, 'rs-b') : `<img src="${UI.mainPhoto(p).dataUrl}" alt="عکس فعلی"/>`;
    const afterHtml = aiImage ? `<img src="${aiImage}" alt="طرح هوش مصنوعی"/>` : UI.afterHtml(p, scheme);

    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">${UI.esc(p.name)}</div>
        <div class="tb-side"><button class="iconbtn" data-menu aria-label="منو">${A.icon('menu', 20)}</button></div>
      </header>
      <div class="content">
        <div class="scheme-strip" role="tablist">
          ${p.schemes
            .map(
              (s, i) => `<button class="scheme-chip ${s.id === scheme.id ? 'is-on' : ''}" data-sch="${s.id}" role="tab">
                <span class="sc-tag">${s.id === 'A' || s.id === 'B' ? 'طرح ' + E.fa(i + 1) : 'نسخهٔ اصلاح‌شده'}</span>
                <b>${UI.esc(s.id === 'A' || s.id === 'B' ? s.tag : s.title)}</b>
              </button>`
            )
            .join('')}
        </div>
        <div class="mt-8" id="compareHost">${UI.compareHtml(before, afterHtml, { ratio: 50 })}</div>
        <div class="compare-tools">
          <div class="seg" data-layer-toggle>
            <button type="button" data-lay="before">عکس فعلی</button>
            <button type="button" data-lay="after" class="is-on">طرح</button>
          </div>
          <span class="spacer"></span>
          <button class="chip" data-guide>${A.icon('ruler', 16)} راهنمای اجرا</button>
        </div>
        ${aiCardHtml(p)}

        <div class="card mt-12">
          <div class="card-title" style="justify-content:space-between"><span>${UI.esc(scheme.title)}</span><span class="badge ok">${scheme.tag}</span></div>
          <p class="sub mt-4">${UI.esc(scheme.reason)}</p>
          <div class="metric-row mt-8">
            <span class="metric">${A.icon('sofa', 15)} ${E.fa(scheme.metrics.moves)} جابه‌جایی</span>
            <span class="metric">${A.icon('cart', 15)} ${E.fa(scheme.metrics.buys)} خرید</span>
            <span class="metric">${A.icon('ruler', 15)} ${E.fa(scheme.metrics.measures)} اندازه</span>
          </div>
          ${scheme.id === p.activeSchemeId
            ? `<div class="badge ok" style="padding:8px 12px"><b>✓ این طرح انتخاب شده است</b></div>`
            : `<button class="btn" data-select>این طرح رو انتخاب کن</button>`}
          <div class="tiny mt-8">تصمیم خرید و راهنمای اجرا به همین نسخه وصل می‌شود.</div>
        </div>

        ${
          (scheme.blockers || []).length
            ? `<div class="card warn mt-12">
                <div class="card-title">${A.icon('lock', 18)} این قید مانع رسیدن به هدف است</div>
                ${scheme.blockers
                  .map((b) => `<p class="sub mt-4"><b>${UI.esc(b.name)}:</b> ${UI.esc(b.text)}</p>`)
                  .join('')}
                <p class="tiny mt-8">تا وقتی این وسیله «جای ثابت» است، طرح اجرایی برای این بخش پیشنهاد نمی‌شود.</p>
                <button class="btn secondary small mt-8" data-fix-lock="${scheme.blockers[0].itemId}">تغییر وضعیت این وسیله</button>
              </div>`
            : ''
        }

        <div class="row-head mt-16"><h3 class="h3">چه چیزهایی تغییر کرد؟</h3><span class="tiny">برای دیدن محل، بزن</span></div>
        <div class="card" style="padding:4px 14px" id="changes">
          ${scheme.changes
            .map(
              (c) => `<button class="change-row ${focus === c.id ? 'is-active' : ''}" data-change="${c.id}">
                <div class="ch-ico ${c.kind === 'buy' ? 'buy' : c.kind === 'measure' ? 'measure' : ''}">${A.icon(c.kind === 'buy' ? 'cart' : c.kind === 'measure' ? 'ruler' : 'sofa', 16)}</div>
                <div class="ch-main">
                  <div class="ch-title">${UI.esc(c.title)}</div>
                  <div class="ch-sub">${UI.esc(c.note)}</div>
                </div>
                <span class="badge ${D.checkState[c.check].tone}">${D.checkState[c.check].label}</span>
              </button>`
            )
            .join('')}
          ${scheme.changes.length === 0 ? '<p class="sub" style="padding:12px 0">هیچ تغییری لازم نیست؛ چیدمان فعلی با قیدها سازگار است.</p>' : ''}
        </div>

        ${
          (scheme.rejected || []).length
            ? `<div class="card flat mt-12"><div class="card-title">${A.icon('info', 18)} چه چیزی رد شد؟</div>
              ${scheme.rejected
                .slice(0, 2)
                .map((r) => `<div class="tiny mt-8">• ${UI.esc(r.itemName)}: ${UI.esc(r.reasons[0] || '')}</div>`)
                .join('')}
              </div>`
            : ''
        }

        <div class="card mt-12" style="padding:4px 14px">
          <div class="row" data-plan-row><div class="ico-lead">${A.icon('grid', 18)}</div><div class="row-main"><div class="row-title">پلان و اندازه</div><div class="row-sub">جای فعلی و مقصد، اندازه‌های لازم</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-guide><div class="ico-lead">${A.icon('ruler', 18)}</div><div class="row-main"><div class="row-title">راهنمای اجرا</div><div class="row-sub">جابه‌جایی، اندازه‌گیری، خرید اختیاری</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-refine><div class="ico-lead">${A.icon('edit', 18)}</div><div class="row-main"><div class="row-title">اصلاح موضعی</div><div class="row-sub">${K.AI.ready() ? 'با هوش مصنوعی، روی همین تصویر' : 'سهم اصلاح بسته'}</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
          <div class="row" data-history><div class="ico-lead">${A.icon('rotate', 18)}</div><div class="row-main"><div class="row-title">تاریخچهٔ نسخه‌ها</div><div class="row-sub">${E.fa(p.history.filter((h) => h.status === 'ok').length)} نسخه</div></div><div class="row-side">${A.icon('next', 18)}</div></div>
        </div>
      </div>
      <div class="actions">
        <div class="btn-row">
          <button class="btn secondary" data-guide>راهنمای اجرا</button>
          <button class="btn" data-ai-top>${aiImage ? 'تولید تصویر تازه' : 'ساخت تصویر با AI'}</button>
        </div>
        <div class="meta">${aiImage ? 'تصویر ساخته‌شده با ' + K.AI.provider().name : 'بدون کلید، طرح شماتیک نمایش داده می‌شود'}</div>
      </div>
    </div>`;

    return {
      html,
      mount(root) {
        S.trackOnce('preview_viewed', { projectId: p.id });
        UI.bindCompare(root);
        root.querySelectorAll('[data-sch]').forEach((b) =>
          b.addEventListener('click', () => {
            S.selectScheme(p, b.getAttribute('data-sch'));
            UI.render();
          })
        );
        root.querySelectorAll('[data-lay]').forEach((b) =>
          b.addEventListener('click', () => {
            const box = root.querySelector('[data-compare]');
            const beforeLayer = box.querySelector('.layer.before');
            const handle = box.querySelector('.handle');
            const ratio = b.getAttribute('data-lay') === 'before' ? 0 : 100;
            box.setAttribute('data-ratio', ratio);
            beforeLayer.style.clipPath = 'inset(0 0 0 ' + ratio + '%)';
            handle.style.left = ratio + '%';
            root.querySelectorAll('[data-lay]').forEach((x) => x.classList.toggle('is-on', x === b));
            b.blur();
          })
        );
        root.querySelectorAll('[data-change]').forEach((b) =>
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-change');
            focus = id;
            const c = scheme.changes.find((x) => x.id === id);
            root.querySelectorAll('[data-change]').forEach((x) => x.classList.toggle('is-active', x === b));
            const host = root.querySelector('#compareHost');
            if (host && c) {
              const afterNow = aiImage ? `<img src="${aiImage}" alt="طرح هوش مصنوعی"/>` : UI.afterHtml(p, scheme);
              host.innerHTML = UI.compareHtml(UI.isSamplePhoto(p) ? UI.sceneHtml(p, null, 'rs-b2') : before, afterNow, { ratio: 50 });
              UI.bindCompare(root);
              host.scrollIntoView({ behavior: 'smooth', block: 'center' });
              const legend = host.querySelector('.layer.after');
              if (legend) legend.classList.add('pulse');
            }
            UI.toast(c ? c.title + ' — ' + c.to : '');
          })
        );
        const selBtn = root.querySelector('[data-select]');
        if (selBtn)
          selBtn.addEventListener('click', (ev) => {
            S.selectScheme(p, scheme.id);
            UI.toast('این طرح انتخاب شد؛ خرید و راهنما به همین نسخه وصل شد.');
            ev.currentTarget.disabled = true;
            ev.currentTarget.textContent = 'این طرح انتخاب شده';
            UI.render();
          });
        root.querySelectorAll('[data-guide]').forEach((b) => b.addEventListener('click', () => UI.go('#/guide/' + p.id)));
        root.querySelector('[data-plan-row]').addEventListener('click', () => UI.go('#/plan/' + p.id));
        root.querySelector('[data-refine]').addEventListener('click', () => {
          if (K.AI.ready() && p.ai && p.ai.image) return UI.go('#/refine/' + p.id);
          if (!p.refineCredits) return UI.toast('سهم اصلاح این بسته تمام شده است.');
          UI.go('#/refine/' + p.id);
        });
        root.querySelector('[data-history]').addEventListener('click', () => historySheet(p));
        root.querySelector('[data-menu]').addEventListener('click', () => resultMenu(p));

        // ——— هوش مصنوعی تصویر ———
        const runAI = async () => {
          if (!K.AI.ready()) return UI.go('#/ai');
          p.ai = { status: 'loading', image: (p.ai && p.ai.image) || null, at: S.now() };
          S.touch(p);
          UI.render();
          try {
            const raw = await K.AI.generate(p);
            const img = await K.AI.shrink(raw, 1100, 0.85);
            p.ai = { status: 'done', image: img, at: S.now(), provider: K.AI.provider().id };
            S.track('ai_generated', { projectId: p.id });
            S.touch(p);
            UI.render();
            UI.toast('تصویر ساخته شد؛ انگشتت را روی تصویر بکش.');
          } catch (e) {
            p.ai = { status: 'error', error: K.AI.errorText(e), at: S.now(), image: null };
            S.touch(p);
            UI.render();
          }
        };
        root.querySelectorAll('[data-ai-run],[data-ai-retry],[data-ai-top]').forEach((b) => b.addEventListener('click', runAI));
        const aiSet = root.querySelector('[data-ai-settings]');
        if (aiSet) aiSet.addEventListener('click', () => UI.go('#/ai'));
        const aiRefine = root.querySelector('[data-ai-refine]');
        if (aiRefine) aiRefine.addEventListener('click', () => UI.go('#/refine/' + p.id));
        const aiRemove = root.querySelector('[data-ai-remove]');
        if (aiRemove)
          aiRemove.addEventListener('click', () => {
            p.ai = { status: 'idle' };
            S.touch(p);
            UI.render();
          });
        const aiHelp = root.querySelector('[data-ai-help]');
        if (aiHelp) aiHelp.addEventListener('click', () => aiHelpSheet());
        const fix = root.querySelector('[data-fix-lock]');
        if (fix)
          fix.addEventListener('click', () => {
            UI.go('#/new/items/' + p.id + '?sel=' + fix.getAttribute('data-fix-lock'));
          });
        const buy = root.querySelector('[data-buy]');
        if (buy) buy.addEventListener('click', () => UI.go('#/package/' + p.id));
        const receipt = root.querySelector('[data-receipt]');
        if (receipt) receipt.addEventListener('click', () => UI.go('#/receipt/' + p.id));
      },
    };
  });

  function aiHelpSheet() {
    UI.sheet({
      title: 'کلید تصویر از کجا؟',
      sub: 'Gemini رایگان است ولی از ایران VPN می‌خواهد؛ OpenRouter بدون VPN کار می‌کند و شارژ می‌خواهد.',
      html: `<div class="stack-sm mt-8">
        <div class="card flat"><b>۱. گرفتن کلید</b><p class="sub">OpenRouter: با حساب گوگل یا گیت‌هاب وارد شو، در Credits چند دلار شارژ کن و کلید بساز. Gemini: در AI Studio دکمهٔ Get API key. هر دو با حساب گوگل ممکن است.</p></div>
        <div class="card flat"><b>۲. گذاشتن کلید در اپ</b><p class="sub">حساب من ← تصویر با هوش مصنوعی ← سرویس را انتخاب کن ← کلید را بچسبان ← ذخیره ← آزمایش کلید.</p></div>
        <div class="card flat"><b>۳. ساخت تصویر</b><p class="sub">در صفحهٔ نتیجه، دکمهٔ «ساخت تصویر با AI» عکس اتاق را می‌فرستد و تصویر تازه برمی‌گردد.</p></div>
      </div>`,
      mount(el) {
        el.querySelector('[data-open-gemini]').addEventListener('click', () =>
          window.open('https://aistudio.google.com/apikey', '_blank', 'noopener')
        );
      },
    });
  }

  function historySheet(p) {
    UI.sheet({
      title: 'تاریخچهٔ نسخه‌ها',
      sub: 'هر نسخه با عکس فعلی قابل مقایسه است.',
      html: `<div class="mt-8">${p.history
        .slice()
        .reverse()
        .map(
          (h) => `<div class="hist-item"><span class="dotv ${h.status === 'rejected' ? 'rej' : ''}"></span>
            <div style="flex:1"><div class="strong" style="font-size:13.5px">${UI.esc(h.label)}</div><div class="tiny">${UI.relTime(h.at)}${h.status === 'rejected' ? ' · رد شد، سهم مصرف نشد' : ''}</div></div>
            ${h.status === 'ok' && h.schemeId ? `<button class="chip" data-ver="${h.schemeId}">${p.activeSchemeId === h.schemeId ? 'فعال' : 'انتخاب'}</button>` : ''}
          </div>`
        )
        .join('')}</div>`,
      mount(el) {
        el.querySelectorAll('[data-ver]').forEach((b) =>
          b.addEventListener('click', () => {
            S.revertVersion(p, b.getAttribute('data-ver'));
            UI.closeSheet();
            UI.toast('نسخهٔ انتخابی فعال شد.');
            UI.refresh();
          })
        );
      },
    });
  }

  function resultMenu(p) {
    UI.sheet({
      title: p.name,
      html: `<div class="stack-sm mt-8">
        <button class="row" data-a="share"><div class="ico-lead">${A.icon('share', 18)}</div><div class="row-main"><div class="row-title">اشتراک‌گذاری</div><div class="row-sub">کارت قبل و بعد یا فهرست اجرا</div></div></button>
        <button class="row" data-a="plan"><div class="ico-lead">${A.icon('grid', 18)}</div><div class="row-main"><div class="row-title">پلان و اندازه</div></div></button>
        <button class="row" data-a="refine"><div class="ico-lead">${A.icon('edit', 18)}</div><div class="row-main"><div class="row-title">اصلاح موضعی</div></div></button>
        <button class="row" data-a="support"><div class="ico-lead">${A.icon('info', 18)}</div><div class="row-main"><div class="row-title">گزارش مشکل</div></div></button>
      </div>`,
      mount(el) {
        el.querySelector('[data-a="share"]').addEventListener('click', shareSheet(p));
        el.querySelector('[data-a="plan"]').addEventListener('click', () => {
          UI.closeSheet();
          UI.go('#/plan/' + p.id);
        });
        el.querySelector('[data-a="refine"]').addEventListener('click', () => {
          UI.closeSheet();
          UI.go('#/refine/' + p.id);
        });
        el.querySelector('[data-a="support"]').addEventListener('click', () => {
          UI.closeSheet();
          UI.go('#/support');
        });
      },
    });
  }

  function shareSheet(p) {
    UI.closeSheet();
    const scheme = S.activeScheme(p);
    UI.sheet({
      title: 'اشتراک‌گذاری',
      sub: 'فقط نسخه‌ای که پیش‌نمایش کرده‌ای ارسال می‌شود.',
      html: `<div class="media mt-8" style="aspect-ratio:16/9">${UI.projectThumb(p)}</div>
      <div class="stack-sm mt-12">
        <label class="check-line"><input type="checkbox" checked/> کارت قبل و بعد</label>
        <label class="check-line"><input type="checkbox" checked/> فهرست تغییرها و اندازه‌های لازم</label>
        <label class="check-line"><input type="checkbox"/> فهرست خرید با قیمت</label>
      </div>
      <button class="btn mt-16" data-share>آمادهٔ ارسال</button>`,
      mount(el) {
        el.querySelector('[data-share]').addEventListener('click', () => {
          UI.closeSheet();
          UI.toast('کارت اشتراک‌گذاری آماده شد (نمایشی). در نسخهٔ واقعی، تصویر و فهرست به اشتراک گذاشته می‌شود.');
        });
      },
    });
  }

  function purchaseCard(p, scheme) {
    const pur = p.purchase || { status: 'none' };
    if (pur.status === 'paid') {
      return `<div class="card tint mt-12">
        <div class="card-title">${A.icon('check', 18)} بستهٔ اتاق خریداری شده</div>
        <p class="sub mt-4">دو طرح، یک اصلاح موضعی و راهنمای اجرا فعال است. رسید ${pur.receipt ? pur.receipt.id : ''}.</p>
        <button class="btn secondary small mt-8" data-receipt>دیدن رسید</button>
      </div>`;
    }
    if (pur.status === 'pending') {
      return `<div class="card warn mt-12">
        <div class="card-title">${A.icon('info', 18)} پرداخت در انتظار بررسی</div>
        <p class="sub mt-4">وضعیت خرید را بررسی کن؛ پرداخت مجدد لازم نیست.</p>
        <button class="btn secondary small mt-8" data-receipt>بررسی وضعیت خرید</button>
      </div>`;
    }
    return `<div class="card mt-12">
      <div class="card-title">${A.icon('lock', 18)} ${D.package.title}</div>
      <p class="sub mt-4">${D.package.contents.join('، ')}.</p>
      <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
        <div class="price">${E.money(D.app.packagePrice)} <small>تومان</small></div>
        <span class="spacer"></span>
        <button class="btn small" data-buy>خرید بسته</button>
      </div>
      <p class="tiny mt-8">${D.package.note}</p>
    </div>`;
  }

  function packageBar(p, scheme) {
    const paid = p.purchase && p.purchase.status === 'paid';
    return `<div class="actions">
      <div class="btn-row">
        <button class="btn secondary" data-guide>راهنمای اجرا</button>
        <button class="btn" data-${paid ? 'receipt' : 'buy'}>${paid ? 'رسید خرید' : 'خرید بسته'}</button>
      </div>
      <div class="meta">${paid ? 'این بسته فعال است' : E.money(D.app.packagePrice) + ' تومان · دو طرح، یک اصلاح، راهنمای اجرا'}</div>
    </div>`;
  }

  /* ================= اصلاح موضعی ================= */
  UI.define('refine', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    const scheme = S.activeScheme(p);
    if (!p || !scheme) return { html: '<div class="content"><p class="sub">طرحی برای اصلاح نیست.</p></div>' };
    let target = (p.items.find((i) => i.cat === 'curtain' && i.status !== 'fixed') || p.items.find((i) => i.status !== 'fixed')).id;
    let prompt = 'روشن‌ترش کن';
    const item = p.items.find((i) => i.id === target);
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">اصلاح موضعی</div>
        <div class="tb-side"><span class="badge ${p.refineCredits ? 'ok' : 'bad'}">${E.fa(p.refineCredits)} از ${E.fa(D.app.refineCredits)}</span></div>
      </header>
      <div class="content">
        <div class="photo-frame" style="aspect-ratio:4/3">
          ${(UI.mainPhoto(p) && UI.mainPhoto(p).dataUrl) ? `<img src="${UI.mainPhoto(p).dataUrl}" alt="عکس اتاق"/>` : UI.sceneHtml(p, scheme, 'rf')}
          <div class="focus-ring" style="${UI.boundsStyle(item.bounds)}"><span>${UI.esc(item.name)}</span></div>
        </div>
        <div class="chip-row mt-12">
          ${p.items
            .filter((i) => i.bounds)
            .map((i) => `<button class="chip ${i.id === target ? 'is-on' : ''}" data-target="${i.id}">${UI.esc(i.name)}</button>`)
            .join('')}
        </div>
        <div class="card ${item.status === 'fixed' ? 'warn' : ''} mt-12">
          <div class="card-title">${item.status === 'fixed' ? A.icon('lock', 18) : A.icon('edit', 18)} ${UI.esc(item.name)}</div>
          <p class="sub mt-4">${item.status === 'fixed' ? 'این وسیله جای ثابت است؛ اصلاح به آن سرایت می‌کند و پیش از مصرف سهم، بازبینی می‌شود.' : 'تغییر ظاهر همین بخش، بدون تغییر ساختار چیدمان.'}</p>
        </div>
        <div class="chip-row mt-12">
          ${['روشن‌ترش کن', 'رنگ گرم‌تر', 'کمی جمع‌وجورتر', 'پارچهٔ ساده‌تر'].map((t) => `<button class="chip ${prompt === t ? 'is-on' : ''}" data-prompt="${t}">${t}</button>`).join('')}
        </div>
        <div class="field mt-12"><span>توضیح خودت</span><textarea class="input" id="rprompt" placeholder="مثلاً: پرده روشن‌تر ولی بدون طرح گل">${UI.esc(prompt)}</textarea></div>
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('info', 18)} دو نوع تغییر</div>
          <p class="sub mt-4">تغییر ظاهر (مثل روشن‌تر شدن پرده) از سهم اصلاح استفاده می‌کند. تغییر ساختاری مثل افزودن مبل، درخواست تازه می‌سازد و نسخهٔ قبلی در تاریخچه می‌ماند.</p>
        </div>
        <div class="card tint mt-12">
          <div class="card-title">${A.icon('check', 18)} اگر کنترل کیفیت رد کند</div>
          <p class="sub mt-4">نسخهٔ تازه منتشر نمی‌شود و از سهم اصلاح تو کم نمی‌شود.</p>
        </div>
      </div>
      <div class="actions"><button class="btn" data-do>ثبت اصلاح</button><div class="meta">${K.AI.ready() && p.ai && p.ai.image ? 'روی تصویر هوش مصنوعی اعمال می‌شود' : 'این اصلاح از سهم بسته مصرف می‌شود.'}</div></div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelectorAll('[data-target]').forEach((b) =>
          b.addEventListener('click', () => {
            target = b.getAttribute('data-target');
            UI.render();
          })
        );
        root.querySelectorAll('[data-prompt]').forEach((b) =>
          b.addEventListener('click', () => {
            prompt = b.getAttribute('data-prompt');
            root.querySelector('#rprompt').value = prompt;
            root.querySelectorAll('[data-prompt]').forEach((x) => x.classList.toggle('is-on', x === b));
          })
        );
        const ta = root.querySelector('#rprompt');
        ta.addEventListener('input', () => (prompt = ta.value));
        root.querySelector('[data-do]').addEventListener('click', async () => {
          // اگر تصویر هوش مصنوعی داریم، اصلاح روی همان تصویر انجام می‌شود
          if (K.AI.ready() && p.ai && p.ai.image) {
            const base = p.ai.image;
            UI.sheet({
              title: 'در حال اصلاح تصویر…',
              sub: 'این کار ۲۰ تا ۹۰ ثانیه طول می‌کشد.',
              html: `<div class="progress mt-12"><i class="ai-bar" style="width:15%"></i></div>`,
            });
            try {
              const raw = await K.AI.generate(p, { image: base, prompt: K.AI.buildPrompt(p, prompt) });
              const img = await K.AI.shrink(raw, 1100, 0.85);
              p.ai = { status: 'done', image: img, at: S.now(), provider: K.AI.provider().id };
              p.history.push({ id: 'h_' + Date.now().toString(36), label: 'اصلاح با AI: ' + prompt, at: S.now(), status: 'ok', schemeId: p.activeSchemeId });
              S.touch(p);
              UI.closeSheet();
              UI.go('#/result/' + p.id);
              UI.toast('تصویر اصلاح شد.');
            } catch (e) {
              UI.closeSheet();
              UI.sheet({
                title: 'اصلاح انجام نشد',
                sub: K.AI.errorText(e),
                html: '<button class="btn mt-12" data-close>باشه</button>',
              });
            }
            return;
          }
          const res = S.refine(p, { itemId: target, prompt: prompt, label: prompt });
          if (!res.ok) {
            UI.sheet({
              title: 'اصلاح انجام نشد',
              sub: res.reason,
              html: `<div class="card flat mt-8"><div class="card-title">${A.icon('info', 18)} سهم اصلاح مصرف نشد</div><p class="sub mt-4">تلاش ناموفق از سهم اصلاح کم نمی‌شود و نسخهٔ قبلی دست‌نخورده می‌ماند.</p></div><button class="btn mt-12" data-close>باشه</button>`,
            });
            return;
          }
          UI.sheet({
            title: 'نسخهٔ تازه آماده شد',
            sub: 'عکس فعلی و نسخهٔ جدید را مقایسه کن.',
            html: `<div class="compare-mini mt-8"><div>${UI.sceneHtml(p, res.previous, 'cmp-old')}</div><div>${UI.sceneHtml(p, res.scheme, 'cmp-new')}</div></div>
            <div class="btn-row mt-12"><button class="btn secondary" data-back-ver>بازگشت به قبلی</button><button class="btn" data-keep>این نسخه رو نگه دار</button></div>`,
            mount(el) {
              el.querySelector('[data-keep]').addEventListener('click', () => {
                UI.closeSheet();
                UI.go('#/result/' + p.id);
              });
              el.querySelector('[data-back-ver]').addEventListener('click', () => {
                S.revertVersion(p, res.previous.id);
                UI.closeSheet();
                UI.toast('نسخهٔ قبلی فعال شد؛ نسخهٔ تازه در تاریخچه ماند.');
                UI.go('#/result/' + p.id);
              });
            },
          });
        });
      },
    };
  });

  /* ================= راهنمای اجرا ================= */
  UI.define('guide', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    const scheme = S.activeScheme(p);
    if (!p || !scheme) return { html: '<div class="content"><p class="sub">راهنمایی موجود نیست.</p></div>' };
    if (!p.guide || p.guide.schemeId !== scheme.id) {
      p.guide = E.buildGuide(p, scheme);
      p.guide.schemeId = scheme.id;
      S.save();
    }
    const g = p.guide;
    const done = g.tasks.filter((t) => t.status === 'done').length;
    const pct = g.tasks.length ? Math.round((done / g.tasks.length) * 100) : 0;
    const groups = [
      { kind: 'move', title: 'جابه‌جایی — بدون خرید', note: 'این کارها قبل از هر خرید انجام می‌شوند.' },
      { kind: 'measure', title: 'اندازه‌گیری باقی‌مانده', note: 'هر اندازه فقط به همان جابه‌جایی وصل است.' },
      { kind: 'buy', title: 'خرید اختیاری', note: 'قیمت و موجودی باید پیش از خرید بررسی شود.' },
    ];
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">راهنمای اجرا</div>
        <div class="tb-side"><button class="iconbtn" data-share aria-label="اشتراک">${A.icon('share', 19)}</button></div>
      </header>
      <div class="content">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center"><b>پیشرفت اجرا</b><span class="badge ${pct === 100 ? 'ok' : ''}">${E.fa(done)} از ${E.fa(g.tasks.length)}</span></div>
          <div class="progress mt-8"><i style="width:${pct}%"></i></div>
          <div class="tiny mt-8">ترتیب: جابه‌جایی‌های بدون خرید ← اندازه‌گیری‌های باقی‌مانده ← خرید اختیاری.</div>
        </div>
        ${groups
          .map((grp) => {
            const tasks = g.tasks.filter((t) => t.kind === grp.kind);
            if (!tasks.length) return '';
            return `<div class="task-group-label"><i></i>${grp.title}<span class="spacer"></span><span class="tiny">${E.fa(tasks.length)} کار</span></div>
            <p class="tiny" style="margin-top:-4px">${grp.note}</p>
            <div class="stack-sm mt-8">${tasks.map((t) => taskHtml(p, t)).join('')}</div>`;
          })
          .join('')}
        ${
          g.totals.cost
            ? `<div class="card mt-12"><div class="card-title">${A.icon('cart', 18)} جمع خرید</div><div class="price mt-4">${E.money(g.totals.cost)} <small>تومان</small></div>
              <p class="tiny mt-4">مبلغ ارسال نامعلوم جدا محاسبه می‌شود. اگر قیمت معتبر نبود، فقط مشخصات موردنیاز نمایش داده می‌شود.</p></div>`
            : ''
        }
        <div class="card flat mt-12"><div class="card-title">${A.icon('info', 18)} یادآوری</div><p class="sub mt-4">علامت‌زدن یک قلم، اقلام دیگر را تغییر نمی‌دهد. اگر وسیله‌ای ناموجود شد، جایگزین فقط با سازگاری ابعاد و بودجه پیشنهاد می‌شود.</p></div>
      </div>
      <div class="actions"><div class="btn-row"><button class="btn secondary" data-back>بازگشت به طرح</button><button class="btn" data-share>اشتراک‌گذاری فهرست</button></div></div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelectorAll('[data-task]').forEach((b) =>
          b.addEventListener('click', () => {
            const t = g.tasks.find((x) => x.id === b.getAttribute('data-task'));
            if (!t) return;
            if (t.check === 'conflict') return UI.toast(t.issue || 'این کار با قیدها سازگار نیست.');
            t.status = t.status === 'done' ? 'pending' : 'done';
            S.touch(p);
            if (t.status === 'done') S.track('task_done', { projectId: p.id, note: t.kind });
            UI.render();
          })
        );
        root.querySelectorAll('[data-skip]').forEach((b) =>
          b.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const t = g.tasks.find((x) => x.id === b.getAttribute('data-skip'));
            t.status = 'skipped';
            S.touch(p);
            UI.render();
          })
        );
        root.querySelectorAll('[data-product]').forEach((b) =>
          b.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const prod = D.products.find((x) => x.id === b.getAttribute('data-product'));
            productSheet(prod);
          })
        );
        root.querySelectorAll('[data-measure-task]').forEach((b) =>
          b.addEventListener('click', (ev) => {
            ev.stopPropagation();
            UI.go('#/plan/' + p.id + '?item=' + b.getAttribute('data-measure-task'));
          })
        );
        root.querySelectorAll('[data-share]').forEach((b) => b.addEventListener('click', () => shareSheet(p)));
      },
    };
  });

  function taskHtml(p, t) {
    const isDone = t.status === 'done';
    const isSkip = t.status === 'skipped';
    return `<div class="task ${isDone ? 'done' : ''} ${isSkip ? 'done' : ''}" data-task-row>
      <button class="tk-check" data-task="${t.id}" aria-label="انجام شد">${A.icon('check', 15)}</button>
      <div class="tk-main">
        <div class="tk-title">${UI.esc(t.title)}</div>
        <div class="tk-sub">${UI.esc(t.detail || '')}</div>
        ${t.check === 'conflict' ? `<div class="tiny" style="color:var(--brick)">${UI.esc(t.issue || '')}</div>` : ''}
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
          ${t.kind === 'measure' ? `<button class="chip" data-measure-task="${t.id.replace('t-ms-', '')}">ثبت اندازه</button>` : ''}
          ${t.kind === 'buy' && t.product ? `<button class="chip" data-product="${t.product.id}">دیدن مشخصات</button>` : ''}
          ${isDone ? `<span class="badge ok">انجام شد</span>` : isSkip ? `<span class="badge">صرف‌نظر کردم</span>` : `<button class="chip" data-skip="${t.id}">صرف‌نظر</button>`}
        </div>
      </div>
      ${t.kind === 'buy' ? `<div class="tiny" style="text-align:left">${E.money(t.price)}<br/><small>تومان</small></div>` : ''}
    </div>`;
  }

  function productSheet(prod) {
    if (!prod) return;
    UI.sheet({
      title: prod.name,
      html: `<div class="media mt-8" style="aspect-ratio:16/9;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary)">${A.icon('cart', 40)}</div>
      <div class="mt-12">
        <div class="kv"><span>ابعاد</span><b>${UI.esc(prod.size)}</b></div>
        <div class="kv"><span>قیمت</span><b>${E.money(prod.price)} تومان</b></div>
        <div class="kv"><span>وضعیت</span><b>${UI.esc(prod.status)}</b></div>
        <div class="kv"><span>اعتبار قیمت</span><b>${UI.esc(prod.validUntil)}</b></div>
        <div class="kv"><span>فروشنده</span><b>${UI.esc(prod.seller)}</b></div>
        ${prod.drawer ? `<div class="kv"><span>کشو</span><b>${E.fa(prod.drawer)} سانتی‌متر بازشو</b></div>` : ''}
      </div>
      <p class="tiny mt-8">${UI.esc(prod.note)}</p>
      ${prod.drawer ? `<div class="card warn mt-8"><div class="tiny">این قلم باید جداگانه بررسی شود: باز شدن کشو در مسیر عبور، با اندازهٔ فعلی اتاق تأیید نشده است.</div></div>` : ''}
      <button class="btn mt-16" data-buy-now>افزودن به فهرست خرید</button>`,
      mount(el) {
        el.querySelector('[data-buy-now]').addEventListener('click', () => {
          UI.closeSheet();
          UI.toast('به فهرست خرید اضافه شد (نمایشی).');
        });
      },
    });
  }

  /* ================= بسته و خرید ================= */
  UI.define('package', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    const scheme = S.activeScheme(p);
    const pur = p.purchase || { status: 'none' };
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">بستهٔ اتاق</div>
        <div class="tb-side">${pur.status === 'paid' ? '<span class="badge ok">فعال</span>' : pur.status === 'pending' ? '<span class="badge warn">در انتظار</span>' : ''}</div>
      </header>
      <div class="content">
        <div class="media" style="aspect-ratio:16/9">${UI.projectThumb(p)}</div>
        <div class="card mt-12">
          <div class="card-title">${UI.esc(p.name)}</div>
          <div class="card-meta">${scheme ? scheme.title : '—'} · ${scheme ? E.summaryOf(scheme) : ''}</div>
          <div class="hr"></div>
          <div class="stack-sm">
            ${D.package.contents.map((c) => `<div style="display:flex;gap:8px;align-items:flex-start">${A.icon('check', 16)}<span>${c}</span></div>`).join('')}
          </div>
          <div class="hr"></div>
          <div style="display:flex;align-items:center"><div class="price">${E.money(D.app.packagePrice)} <small>تومان</small></div><span class="spacer"></span><span class="tiny">پرداخت یک‌باره برای این اتاق</span></div>
        </div>
        <div class="card flat mt-12"><div class="card-title">${A.icon('info', 18)} پیش از پرداخت</div><p class="sub mt-4">${D.package.note} تغییر تنظیمات در میانهٔ پردازش، سفارش تازه نمی‌سازد و نتیجه به نسخهٔ قبلی وصل می‌ماند.</p></div>
        ${pur.status === 'paid' ? `<button class="btn secondary mt-12" data-receipt>دیدن رسید</button>` : ''}
        ${pur.status === 'pending' ? `<button class="btn mt-12" data-check>بررسی وضعیت خرید</button>` : ''}
      </div>
      <div class="actions">
        ${pur.status === 'paid' ? '<button class="btn" data-open>باز کردن طرح‌ها</button>' : `<button class="btn" data-pay>خرید بستهٔ اتاق</button><div class="meta">پرداخت آزمایشی — هیچ مبلغی کسر نمی‌شود.</div>`}
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        const pay = root.querySelector('[data-pay]');
        if (pay)
          pay.addEventListener('click', () => {
            S.createOrder(p);
            paymentSheet(p);
          });
        const chk = root.querySelector('[data-check]');
        if (chk)
          chk.addEventListener('click', () => {
            if (p.purchase.status === 'pending') {
              UI.sheet({
                title: 'وضعیت خرید',
                sub: 'پرداخت در انتظار تأیید است. برای همان سفارش بررسی می‌شود و پرداخت مجدد لازم نیست.',
                html: `<div class="card flat mt-8"><div class="kv"><span>شناسهٔ سفارش</span><b>${UI.esc(p.purchase.orderId)}</b></div><div class="kv"><span>وضعیت</span><b>در انتظار تأیید</b></div><div class="kv"><span>مبلغ</span><b>${E.money(D.app.packagePrice)} تومان</b></div></div><button class="btn mt-12" data-confirm-demo>تأیید آزمایشی پرداخت</button>`,
                mount(el) {
                  el.querySelector('[data-confirm-demo]').addEventListener('click', () => {
                    S.confirmPayment(p, true);
                    UI.closeSheet();
                    UI.go('#/receipt/' + p.id);
                  });
                },
              });
            }
          });
        const rec = root.querySelector('[data-receipt]');
        if (rec) rec.addEventListener('click', () => UI.go('#/receipt/' + p.id));
        const open = root.querySelector('[data-open]');
        if (open) open.addEventListener('click', () => UI.go('#/result/' + p.id));
      },
    };
  });

  function paymentSheet(p) {
    UI.sheet({
      title: 'پرداخت بسته',
      sub: 'درگاه نمایشی — اطلاعات واقعی وارد نکن.',
      html: `<div class="card flat mt-8">
        <div class="kv"><span>محصول</span><b>بستهٔ اتاق</b></div>
        <div class="kv"><span>پروژه</span><b>${UI.esc(p.name)}</b></div>
        <div class="kv"><span>مبلغ</span><b>${E.money(D.app.packagePrice)} تومان</b></div>
        <div class="kv"><span>شناسهٔ سفارش</span><b>${UI.esc(p.purchase.orderId)}</b></div>
      </div>
      <button class="btn mt-12" data-pay-demo>پرداخت آزمایشی</button>
      <button class="btn ghost mt-8" data-fail>انصراف / ناموفق</button>
      <p class="tiny mt-8">تأیید دوبارهٔ یک شناسهٔ پرداخت فقط یک‌بار بسته را فعال می‌کند.</p>`,
      mount(el) {
        el.querySelector('[data-pay-demo]').addEventListener('click', () => {
          const r = S.confirmPayment(p, true);
          UI.closeSheet();
          if (r.duplicate) {
            UI.toast('این سفارش از قبل پرداخت شده است.');
            return UI.go('#/receipt/' + p.id);
          }
          UI.toast('پرداخت تأیید شد.');
          UI.go('#/receipt/' + p.id);
        });
        el.querySelector('[data-fail]').addEventListener('click', () => {
          S.confirmPayment(p, false);
          UI.closeSheet();
          UI.toast('پرداخت انجام نشد. سفارش برای بررسی وضعیت باقی ماند.');
          UI.refresh();
        });
      },
    });
  }

  UI.define('receipt', function (ctx) {
    const p = S.byId(ctx.id) || S.active();
    const pur = p && p.purchase;
    if (!p || !pur || !pur.receipt) {
      return { html: `<div class="screen"><div class="content"><div class="empty"><b>رسیدی ثبت نشده</b><button class="btn mt-16" data-go="#/package/${p ? p.id : ''}">بازگشت به بسته</button></div></div></div>` };
    }
    const r = pur.receipt;
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">رسید خرید</div>
      </header>
      <div class="content">
        <div class="card center" style="padding:22px 14px">
          <div class="em-ico" style="background:var(--primary);color:#fff;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin:0 auto 10px">${A.icon('check', 28)}</div>
          <h2 class="h2">پرداخت تأیید شد</h2>
          <p class="sub">بستهٔ اتاق برای «${UI.esc(p.name)}» فعال شد.</p>
        </div>
        <div class="receipt mt-12">
          <div class="kv"><span>نام پروژه</span><b>${UI.esc(r.project)}</b></div>
          <div class="kv"><span>بسته</span><b>${UI.esc(r.title)}</b></div>
          <div class="kv"><span>مبلغ</span><b>${E.money(r.amount)} تومان</b></div>
          <div class="kv"><span>وضعیت</span><b>پرداخت‌شده</b></div>
          <div class="kv"><span>شناسهٔ رسید</span><b>${UI.esc(r.id)}</b></div>
          <div class="kv"><span>پیگیری</span><b>${UI.esc(r.tracking)}</b></div>
          <div class="kv"><span>زمان</span><b>${UI.relTime(r.at)}</b></div>
        </div>
        <div class="btn-row mt-16">
          <button class="btn secondary" data-receipt-share>اشتراک رسید</button>
          <button class="btn" data-open>باز کردن طرح‌ها</button>
        </div>
      </div>
      <div class="actions"><button class="btn secondary" data-go="#/support">گزارش مشکل</button></div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-open]').addEventListener('click', () => UI.go('#/result/' + p.id));
        root.querySelector('[data-receipt-share]').addEventListener('click', () => UI.toast('رسید برای ارسال آماده شد (نمایشی).'));
      },
    };
  });

  /* ================= پنل عملیات ================= */
  UI.define('ops', function () {
    const st = S.get();
    let filter = 'all';
    const statusMap = {
      pending: { l: 'در انتظار پرداخت', c: 'warn' },
      paid: { l: 'پرداخت تأییدشده', c: 'ok' },
      stuck: { l: 'معطل', c: 'bad' },
      review: { l: 'نیازمند بازبینی', c: 'warn' },
    };
    const filters = [
      { id: 'all', l: 'همه' },
      { id: 'stuck', l: 'معطل' },
      { id: 'review', l: 'نیازمند بازبینی' },
      { id: 'paid', l: 'پرداخت تأییدشده' },
    ];
    const rows = st.orders
      .filter((o) => filter === 'all' || o.status === filter)
      .map(
        (o) => `<div class="card clickable" data-order="${o.id}">
          <div class="card-title" style="justify-content:space-between">${UI.esc(o.projectName)}<span class="badge ${(statusMap[o.status] || {}).c || ''}">${(statusMap[o.status] || {}).l || o.status}</span></div>
          <div class="card-meta">شناسه ${UI.esc(o.id)} · ${E.fa(o.age)} ساعت سن · ${E.fa(o.attempts)} تلاش</div>
          ${o.reason ? `<div class="tiny mt-4" style="color:var(--brick)">علت توقف: ${UI.esc(o.reason)}</div>` : ''}
        </div>`
      )
      .join('');
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">پنل عملیات</div>
        <div class="tb-side"><span class="badge">داخلی</span></div>
      </header>
      <div class="content">
        <div class="chip-row">${filters.map((f) => `<button class="chip ${filter === f.id ? 'is-on' : ''}" data-filter="${f.id}">${f.l}</button>`).join('')}</div>
        <div class="stack-sm mt-12">${rows || '<div class="empty">سفارشی در این وضعیت نیست.</div>'}</div>
        <div class="card flat mt-16">
          <div class="card-title">${A.icon('user', 18)} نقش‌ها</div>
          <p class="sub mt-4">پشتیبان به شناسه و وضعیت سفارش دسترسی دارد؛ بازبین فقط عکس سفارش محول‌شده را باز می‌کند؛ امور مالی پرداخت و بازپرداخت را بررسی می‌کند. اقدام حساس با شناسهٔ عامل، دلیل و زمان ثبت می‌شود.</p>
        </div>
        <div class="card mt-12">
          <div class="card-title">${A.icon('info', 18)} شبیه‌سازی خطا</div>
          <p class="sub mt-4">برای آزمون مسیر ناموفق، خطای تولید را روی آخرین پروژه اعمال کن.</p>
          <button class="btn secondary small mt-8" data-simfail>اعمال خطای تولید</button>
        </div>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelectorAll('[data-filter]').forEach((b) =>
          b.addEventListener('click', () => {
            filter = b.getAttribute('data-filter');
            UI.render();
          })
        );
        root.querySelectorAll('[data-order]').forEach((b) =>
          b.addEventListener('click', () => {
            const o = st.orders.find((x) => x.id === b.getAttribute('data-order'));
            orderSheet(o);
          })
        );
        root.querySelector('[data-simfail]').addEventListener('click', () => {
          const p = st.projects[0];
          if (!p) return UI.toast('پروژه‌ای نیست.');
          p.status = 'failed';
          p.failure = 'کنترل کیفیت، تغییر در محل پنجره را تشخیص داد.';
          S.touch(p);
          UI.toast('خطای تولید روی «' + p.name + '» اعمال شد.');
          UI.refresh();
        });
      },
    };
  });

  function orderSheet(o) {
    if (!o) return;
    const p = S.byId(o.projectId);
    UI.sheet({
      title: o.projectName,
      sub: 'شناسهٔ سفارش ' + o.id,
      html: `<div class="compare-mini mt-8">
        <div>${p ? UI.projectThumb(p) : ''}<span class="mini-cap">عکس مرجع</span></div>
        <div>${p && S.activeScheme(p) ? UI.afterHtml(p, S.activeScheme(p)) : '<div class="media"></div>'}<span class="mini-cap">نتیجه</span></div>
      </div>
      <div class="card flat mt-12">
        <div class="kv"><span>وضعیت</span><b>${o.status}</b></div>
        <div class="kv"><span>سن سفارش</span><b>${E.fa(o.age)} ساعت</b></div>
        <div class="kv"><span>تلاش‌ها</span><b>${E.fa(o.attempts)}</b></div>
        <div class="kv"><span>وسایل ثابت</span><b>${p ? p.items.filter((i) => i.status === 'fixed').map((i) => i.name).join('، ') : '—'}</b></div>
      </div>
      <div class="check-list mt-12">
        <label class="check-line"><input type="checkbox"/> محل در و پنجره حفظ شده</label>
        <label class="check-line"><input type="checkbox"/> وسایل قفل‌شده تغییر نکرده‌اند</label>
        <label class="check-line"><input type="checkbox"/> تصویر با فهرست تغییرها می‌خواند</label>
      </div>
      <div class="btn-row mt-12">
        <button class="btn secondary" data-reject>رد با دلیل</button>
        <button class="btn" data-approve>تأیید تحویل</button>
      </div>`,
      mount(el) {
        el.querySelector('[data-approve]').addEventListener('click', () => {
          const checks = Array.from(el.querySelectorAll('input[type=checkbox]'));
          if (checks.some((c) => !c.checked)) return UI.toast('برای تحویل، هر سه مورد الزامی باید علامت بخورد.');
          o.status = 'paid';
          UI.closeSheet();
          UI.toast('تحویل تأیید شد و در گزارش ثبت شد.');
          UI.refresh();
        });
        el.querySelector('[data-reject]').addEventListener('click', () => {
          UI.sheet({
            title: 'دلیل رد',
            sub: 'دلیل اجباری است و نوع خطا برای اندازه‌گیری هزینهٔ بازتولید ثبت می‌شود.',
            html: `<div class="chip-row mt-8">${['تغییر وسیلهٔ قفل‌شده', 'تحریف در یا پنجره', 'ناهماهنگی با فهرست تغییرها', 'خرید بیش از حد'].map((x, i) => `<button class="chip" data-r="${x}">${x}</button>`).join('')}</div>
            <button class="btn mt-12" data-confirm-reject>ثبت رد</button>`,
            mount(e2) {
              let reason = '';
              e2.querySelectorAll('[data-r]').forEach((b) =>
                b.addEventListener('click', () => {
                  reason = b.getAttribute('data-r');
                  e2.querySelectorAll('[data-r]').forEach((x) => x.classList.toggle('is-on', x === b));
                })
              );
              e2.querySelector('[data-confirm-reject]').addEventListener('click', () => {
                if (!reason) return UI.toast('یک دلیل انتخاب کن.');
                o.status = 'review';
                o.reason = reason;
                UI.closeSheet();
                UI.closeSheet();
                UI.toast('سفارش برای بازبینی علامت خورد: ' + reason);
                UI.refresh();
              });
            },
          });
        });
      },
    });
  }
  /* ================= پایلوت و اندازه‌گیری ================= */
  const FUNNEL = [
    { e: 'project_created', label: 'پروژه ساخته شد' },
    { e: 'photo_completed', label: 'عکس کامل شد' },
    { e: 'design_started', label: 'درخواست ساخت ثبت شد' },
    { e: 'preview_ready', label: 'طرح آماده شد' },
    { e: 'preview_viewed', label: 'طرح دیده شد' },
    { e: 'ai_generated', label: 'تصویر با AI ساخته شد' },
    { e: 'scheme_selected', label: 'طرح انتخاب شد' },
    { e: 'task_done', label: 'دست‌کم یک کار اجرا شد' },
  ];

  function pilotStats() {
    const ev = S.events();
    const by = {};
    ev.forEach((x) => {
      by[x.e] = by[x.e] || new Set();
      if (x.p) by[x.e].add(x.p);
    });
    const created = by.project_created || new Set();
    const rows = FUNNEL.map((f) => {
      const set = by[f.e] || new Set();
      return { key: f.e, label: f.label, count: set.size, rate: created.size ? set.size / created.size : 0 };
    });
    // میانگین فاصلهٔ ساخت پروژه تا آماده‌شدن طرح
    const gaps = [];
    created.forEach((pid) => {
      const a = ev.find((x) => x.e === 'project_created' && x.p === pid);
      const b = ev.find((x) => x.e === 'preview_ready' && x.p === pid);
      if (a && b && b.t > a.t) gaps.push(b.t - a.t);
    });
    gaps.sort((x, y) => x - y);
    const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
    return { rows, total: created.size, opens: ev.filter((x) => x.e === 'app_open').length, median, raw: ev.length };
  }

  UI.define('pilot', function () {
    const st = pilotStats();
    const max = Math.max(1, ...st.rows.map((r) => r.count));
    const html = `<div class="screen">
      <header class="topbar">
        <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
        <div class="tb-title">پایلوت و اندازه‌گیری</div>
        <div class="tb-side"><span class="badge">داخلی</span></div>
      </header>
      <div class="content">
        <div class="grid3">
          <div class="feat"><b>${E.fa(st.total)}</b><span>پروژه</span></div>
          <div class="feat"><b>${st.median == null ? '—' : E.fa(Math.round(st.median / 1000)) + 's'}</b><span>تا آماده‌شدن طرح</span></div>
          <div class="feat"><b>${E.fa(st.opens)}</b><span>بار باز شدن اپ</span></div>
        </div>

        <div class="row-head mt-16"><h3 class="h3">مسیر رسیدن به نتیجه</h3><span class="tiny">${E.fa(st.raw)} رویداد</span></div>
        <div class="card" style="padding:12px 14px">
          ${st.rows
            .map(
              (r) => `<div class="funnel-row">
                <div class="fr-top"><span>${r.label}</span><b>${E.fa(r.count)}${st.total ? `<small> · ${E.fa(Math.round(r.rate * 100))}٪</small>` : ''}</b></div>
                <div class="funnel-bar"><i style="width:${Math.max(2, (r.count / max) * 100)}%"></i></div>
              </div>`
            )
            .join('')}
        </div>

        <div class="card flat mt-12">
          <div class="card-title">${A.icon('info', 18)} این عددها چه می‌گویند</div>
          <p class="sub mt-4">از هر ${E.fa(st.total || 0)} پروژه، ${E.fa(st.rows[3].count)} تا به طرح رسیده و ${E.fa(st.rows[5].count)} تا تصویر هوش مصنوعی گرفته‌اند. اگر «طرح دیده شد» از «طرح آماده شد» کمتر باشد، یعنی پردازش تمام می‌شود ولی کاربر خبردار نمی‌شود؛ اگر «تصویر با AI» کم باشد، مشکل کلید یا کیفیت تصویر است.</p>
        </div>

        <div class="card flat mt-12">
          <div class="card-title">${A.icon('lock', 18)} چه چیزی ثبت نمی‌شود</div>
          <p class="sub mt-4">فقط نام رویداد، زمان و شناسهٔ پروژه. متن خواستهٔ تو و تصویر خانه در این داده نیست. همه‌چیز روی همین گوشی می‌ماند.</p>
        </div>

        <div class="btn-row mt-16">
          <button class="btn secondary" data-csv>خروجی CSV</button>
          <button class="btn secondary" data-clear>پاک‌کردن رویدادها</button>
        </div>
        <p class="tiny mt-8">خروجی CSV را می‌توانی در اکسل باز کنی و برای گزارش پایلوت استفاده کنی.</p>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-csv]').addEventListener('click', () => {
          const csv = S.eventsCsv();
          const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'khunechin-events.csv';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            URL.revokeObjectURL(a.href);
            a.remove();
          }, 600);
          UI.toast('فایل CSV ساخته شد.');
        });
        root.querySelector('[data-clear]').addEventListener('click', () =>
          UI.confirmSheet({
            title: 'رویدادها پاک شوند؟',
            sub: 'این کار شمارنده‌های پایلوت را صفر می‌کند.',
            confirm: 'پاک کن',
            danger: true,
            onConfirm() {
              S.get().events = [];
              S.save();
              UI.render();
            },
          })
        );
      },
    };
  });
})(window);
