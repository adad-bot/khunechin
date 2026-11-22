/* مسیر ساخت پروژه: عکس، حالت طراحی، هدف، محدودیت، انتخاب وسیله، مرور */
(function (global) {
  const K = global.K;
  const UI = K.UI;
  const S = K.Store;
  const E = K.Engine;
  const A = K.Art;
  const D = K.Data;

  function need(ctx) {
    return S.byId(ctx.id) || S.active() || S.projects()[0];
  }

  function head(p, step, title, sub) {
    return `<header class="topbar">
      <button class="iconbtn" data-back aria-label="بازگشت">${A.icon('back', 21)}</button>
      <div class="tb-title">${title}</div>
      <div class="tb-side"><button class="iconbtn" data-go="#/home" aria-label="خانه">${A.icon('close', 19)}</button></div>
    </header>
    <div class="pad">${UI.steps(step)}</div>
    ${sub ? `<div class="pad"><p class="sub" style="margin-bottom:8px">${sub}</p></div>` : ''}`;
  }

  /* ================= ۱. عکس ================= */
  UI.define('new/photo', function (ctx) {
    const p = need(ctx);
    const main = p.photos.find((x) => x.kind === 'main');
    const aux = p.photos.filter((x) => x.kind === 'aux');
    const html = `<div class="screen">
      <div class="content">
        ${head(p, 0, 'عکس پذیرایی', 'از جایی عکس بگیر که مبل، پنجره و راه بالکن در کادر باشد.')}
        <div class="photo-frame" id="frame">
          ${
            main
              ? `<img src="${main.dataUrl || ''}" alt="عکس اصلی اتاق" ${main.dataUrl ? '' : 'hidden'}/>
                 <div id="samplefill" ${main.dataUrl ? 'hidden' : ''} style="height:100%">${main.dataUrl ? '' : A.scene({ roomW: p.room.w, items: p.items, uid: 'ph' + p.id.slice(-3) })}</div>
                 <div class="corners"><i></i><i></i><i></i><i></i></div>`
              : `<div class="photo-empty"><div class="pe-inner">${A.icon('camera', 30)}<b>قاب راهنما</b><span class="tiny">اتاق را افقی بگیر؛ کل پذیرایی در کادر باشد.</span></div></div>`
          }
        </div>
        <div class="photo-actions">
          <button class="chip" data-pick="camera">${A.icon('camera', 17)} دوربین</button>
          <button class="chip" data-pick="gallery">${A.icon('gallery', 17)} گالری</button>
          ${main ? `<button class="chip" data-rotate>${A.icon('rotate', 17)} چرخاندن</button><button class="chip" data-remove>${A.icon('trash', 17)} حذف</button>` : ''}
          ${main ? '' : `<button class="chip" data-demo>استفاده از عکس نمونه</button>`}
        </div>
        <input type="file" accept="image/*" capture="environment" id="fileCam" hidden/>
        <input type="file" accept="image/*" id="fileGal" hidden/>

        ${main ? qualityCard(main) : ''}

        <div class="row-head mt-16"><h3 class="h3">عکس کمکی</h3><span class="tiny">${E.fa(aux.length)} از ۲</span></div>
        <p class="tiny">فقط وقتی لازم می‌شود که هدف یا تشخیص وسیله به آن کمک کند؛ مثلاً نمای بالکن یا پشت مبل.</p>
        <div class="photo-thumbs">
          ${aux
            .map(
              (a, i) => `<div class="thumb"><img src="${a.dataUrl}" alt="عکس کمکی ${E.fa(i + 1)}"/><span class="tagx">کمکی ${E.fa(i + 1)}</span><button class="iconbtn" data-delaux="${a.id}" style="position:absolute;top:0;left:0;width:24px;height:24px;background:rgba(0,0,0,.45);color:#fff;border-radius:8px" aria-label="حذف">${A.icon('close', 13)}</button></div>`
            )
            .join('')}
          ${aux.length < 2 ? `<button class="thumb add" data-pick="aux" aria-label="افزودن عکس کمکی">${A.icon('plus', 20)}</button>` : ''}
        </div>
        <div class="card flat mt-16">
          <div class="card-title">${A.icon('lock', 17)} دادهٔ مکانی حذف می‌شود</div>
          <p class="sub mt-4">عکس هنگام انتخاب دوباره رمزگذاری می‌شود؛ مختصات GPS در فایل نمی‌ماند.</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn" data-next ${main ? '' : 'disabled'}>ادامه</button>
        <div class="meta">${main ? 'عکس اصلی ثبت شد · پیش‌نویس ذخیره شد' : 'برای ادامه، یک عکس اصلی لازم است'}</div>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        const cam = root.querySelector('#fileCam');
        const gal = root.querySelector('#fileGal');
        root.querySelectorAll('[data-pick]').forEach((b) =>
          b.addEventListener('click', () => {
            const kind = b.getAttribute('data-pick');
            if (kind === 'camera') cam.click();
            else if (kind === 'gallery') gal.click();
            else {
              if (aux.length >= 2) return UI.toast('حداکثر دو عکس کمکی.');
              gal.dataset.aux = '1';
              gal.click();
            }
          })
        );
        async function onFile(file, isAux) {
          if (!file) return;
          if (!/^image\//.test(file.type)) return UI.toast('فقط فایل تصویری پذیرفته می‌شود.');
          UI.toast('عکس در حال آماده‌سازی…');
          try {
            const res = await prepareImage(file);
            const rec = {
              id: 'ph_' + Date.now().toString(36),
              kind: isAux ? 'aux' : 'main',
              dataUrl: res.dataUrl,
              w: res.w,
              h: res.h,
              quality: res.quality,
              rotated: 0,
              at: S.now(),
            };
            if (isAux) p.photos.push(rec);
            else {
              const had = p.photos.findIndex((x) => x.kind === 'main');
              if (had >= 0) p.photos[had] = rec;
              else p.photos.unshift(rec);
              // با جایگزینی عکس اصلی، انتخاب‌های روی عکس باید دوباره تأیید شوند
              p.items.forEach((it) => (it.confirmed = false));
            }
            p.step = 'photo';
            S.touch(p);
            if (!isAux) S.track('photo_completed', { projectId: p.id });
            UI.refresh();
          } catch (e) {
            console.error(e);
            UI.toast('خواندن عکس ناموفق بود؛ عکس دیگری امتحان کن.');
          }
        }
        cam.addEventListener('change', () => onFile(cam.files[0], false));
        gal.addEventListener('change', () => {
          const isAux = gal.dataset.aux === '1';
          gal.dataset.aux = '';
          onFile(gal.files[0], isAux);
        });
        root.querySelectorAll('[data-delaux]').forEach((b) =>
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-delaux');
            p.photos = p.photos.filter((x) => x.id !== id);
            S.touch(p);
            UI.refresh();
          })
        );
        const rot = root.querySelector('[data-rotate]');
        if (rot)
          rot.addEventListener('click', async () => {
            const m = p.photos.find((x) => x.kind === 'main');
            if (!m || !m.dataUrl) return UI.toast('برای عکس نمونه چرخش لازم نیست.');
            const r = await rotateImage(m.dataUrl);
            Object.assign(m, r);
            S.touch(p);
            UI.refresh();
          });
        const rem = root.querySelector('[data-remove]');
        if (rem)
          rem.addEventListener('click', () => {
            p.photos = p.photos.filter((x) => x.kind !== 'main');
            S.touch(p);
            UI.refresh();
          });
        const demo = root.querySelector('[data-demo]');
        if (demo)
          demo.addEventListener('click', () => {
            p.photos = [
              { id: 'ph_demo', kind: 'main', dataUrl: null, scene: 'sample', w: 1600, h: 1200, quality: { label: 'خوب', sharp: 0.8, bright: 0.62 }, rotated: 0, at: S.now() },
            ];
            S.touch(p);
            S.track('photo_completed', { projectId: p.id, note: 'sample' });
            UI.refresh();
          });
        root.querySelector('[data-next]').addEventListener('click', () => {
          if (!p.photos.find((x) => x.kind === 'main')) return;
          p.step = 'mode';
          S.touch(p);
          UI.go('#/new/mode/' + p.id);
        });
      },
    };
  });

  function qualityCard(main) {
    const q = main.quality || {};
    const ok = q.label === 'خوب';
    return `<div class="card ${ok ? 'tint' : 'warn'} mt-12" style="padding:11px 13px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="badge ${ok ? 'ok' : 'warn'}">${ok ? 'کیفیت خوب' : 'کیفیت متوسط'}</span>
        <span class="tiny">${ok ? 'قاب و نور برای پردازش مناسب است.' : 'اگر می‌توانی عکس روشن‌تری بگیر؛ نتیجه دقیق‌تر می‌شود.'}</span>
      </div>
    </div>`;
  }

  function prepareImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const maxDim = 1100;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const quality = analyzeSharpness(c);
          resolve({ dataUrl: c.toDataURL('image/jpeg', 0.82), w, h, quality });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function rotateImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.height;
        c.height = img.width;
        const ctx = c.getContext('2d');
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve({ dataUrl: c.toDataURL('image/jpeg', 0.82), w: img.height, h: img.width });
      };
      img.src = dataUrl;
    });
  }

  function analyzeSharpness(canvas) {
    const w = 200;
    const h = Math.max(40, Math.round((w * canvas.height) / canvas.width));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(canvas, 0, 0, w, h);
    let data;
    try {
      data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
      return { label: 'خوب', sharp: 0.7, bright: 0.55 };
    }
    const g = new Float32Array(w * h);
    let sum = 0;
    for (let i = 0; i < w * h; i++) {
      const r = data[i * 4];
      const gg = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      g[i] = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
      sum += g[i];
    }
    const bright = sum / (w * h);
    let n = 0;
    let m = 0;
    let m2 = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const lap = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
        m += lap;
        m2 += lap * lap;
        n++;
      }
    }
    const mean = m / n;
    const variance = m2 / n - mean * mean;
    const sharp = Math.min(1, variance / 0.035);
    let label = 'خوب';
    if (sharp < 0.28) label = 'تار';
    else if (sharp < 0.5) label = 'متوسط';
    if (bright < 0.16 || bright > 0.94) label = label === 'خوب' ? 'متوسط' : label;
    return { label, sharp: Math.round(sharp * 100) / 100, bright: Math.round(bright * 100) / 100 };
  }

  /* ================= ۲. حالت طراحی ================= */
  UI.define('new/mode', function (ctx) {
    const p = need(ctx);
    const html = `<div class="screen">
      <div class="content">
        ${head(p, 1, 'چطور بچینیم؟', 'حالت طراحی تعیین می‌کند چه چیزی می‌تواند عوض شود.')}
        <div class="stack">
          ${D.modes
            .map(
              (m) => `<button class="mode-card ${p.mode === m.id ? 'is-on' : ''}" data-mode="${m.id}">
                <div class="mc-ico">${A.icon(m.icon, 24)}</div>
                <div class="mc-main">
                  <div class="mc-title">${m.title}</div>
                  <div class="mc-line">${m.line}</div>
                  <div class="tiny mt-4">${m.detail}</div>
                </div>
                <div class="mc-check">${p.mode === m.id ? A.icon('check', 16) : ''}</div>
              </button>`
            )
            .join('')}
        </div>
        <div class="card flat mt-16">
          <div class="card-title">${A.icon('info', 17)} تفاوت دقیق</div>
          <p class="sub mt-4">«با وسایل خودم» هزینهٔ خرید صفر دارد. «طراحی آزاد» می‌تواند وسیلهٔ تازه پیشنهاد بدهد. «ترکیبی» سقف خرید و دسته‌های مجاز را از تو می‌گیرد.</p>
        </div>
      </div>
      <div class="actions"><button class="btn" data-next>ادامه</button></div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelectorAll('[data-mode]').forEach((b) =>
          b.addEventListener('click', () => {
            p.mode = b.getAttribute('data-mode');
            S.touch(p);
            UI.refresh();
          })
        );
        root.querySelector('[data-next]').addEventListener('click', () => {
          p.step = 'goal';
          if (p.mode === 'own') {
            p.limits.purchaseCap = 0;
            p.limits.categories = [];
          }
          S.touch(p);
          UI.go('#/new/goal/' + p.id);
        });
      },
    };
  });

  /* ================= ۳. هدف و سلیقه ================= */
  UI.define('new/goal', function (ctx) {
    const p = need(ctx);
    const html = `<div class="screen">
      <div class="content">
        ${head(p, 2, 'هدف و سلیقه', 'یک هدف اصلی انتخاب کن؛ هدف دوم اختیاری است.')}
        <h3 class="h3">هدف اصلی</h3>
        <div class="chip-row mt-8">
          ${D.goals.map((g) => UI.chip(g.label, p.goal.primary === g.id, `data-goal="${g.id}"`)).join('')}
        </div>
        <p class="tiny mt-8">${(D.goals.find((g) => g.id === p.goal.primary) || {}).hint || ''}</p>
        <h3 class="h3 mt-16">هدف دوم <span class="tiny">(اختیاری)</span></h3>
        <div class="chip-row mt-8">
          ${D.goals.map((g) => UI.chip(g.label, p.goal.secondary === g.id, `data-goal2="${g.id}"`)).join('')}
        </div>
        <div class="field mt-16">
          <span>دوست داری چه تغییری ببینی؟</span>
          <textarea class="input" id="goaltxt" placeholder="مثلاً: پذیرایی روشن‌تر بشه، مبل و فرشم بمونه و راه بالکن باز بشه.">${UI.esc(p.goal.text || '')}</textarea>
        </div>
        <div class="row-head mt-16"><h3 class="h3">حس‌وحال</h3><span class="tiny">اختیاری — می‌توانی رد کنی</span></div>
        <div class="stack-sm mt-8">
          ${D.tastes
            .map(
              (t) => `<button class="taste ${p.taste.preset === t.id ? 'is-on' : ''}" data-taste="${t.id}">
                <div class="swatches">${t.colors.map((c) => `<i style="background:${c}"></i>`).join('')}</div>
                <div class="taste-main"><b>${t.label}</b><span class="tiny">${t.hint}</span></div>
                <span class="tc">${p.taste.preset === t.id ? A.icon('check', 15) : ''}</span>
              </button>`
            )
            .join('')}
        </div>
      </div>
      <div class="actions"><button class="btn" data-next>ادامه</button><div class="meta">هدف با محدودیت‌ها بررسی می‌شود؛ اگر ناسازگار بود، اپ می‌گوید کدام قید را عوض کنی.</div></div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelectorAll('[data-goal]').forEach((b) =>
          b.addEventListener('click', () => {
            p.goal.primary = b.getAttribute('data-goal');
            S.touch(p);
            UI.refresh();
          })
        );
        root.querySelectorAll('[data-goal2]').forEach((b) =>
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-goal2');
            p.goal.secondary = p.goal.secondary === id ? null : id;
            S.touch(p);
            UI.refresh();
          })
        );
        root.querySelectorAll('[data-taste]').forEach((b) =>
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-taste');
            p.taste.preset = p.taste.preset === id ? null : id;
            S.touch(p);
            UI.refresh();
          })
        );
        const txt = root.querySelector('#goaltxt');
        txt.addEventListener('input', () => {
          p.goal.text = txt.value;
          S.save();
        });
        root.querySelector('[data-next]').addEventListener('click', () => {
          p.goal.text = txt.value;
          p.step = p.mode === 'own' ? 'items' : 'limits';
          S.touch(p);
          UI.go('#/new/' + (p.mode === 'own' ? 'items' : 'limits') + '/' + p.id);
        });
      },
    };
  });

  /* ================= ۴. محدودیت‌ها ================= */
  UI.define('new/limits', function (ctx) {
    const p = need(ctx);
    if (p.mode === 'own') {
      setTimeout(() => UI.go('#/new/items/' + p.id), 0);
      return { html: '<div class="screen"><div class="content"><p class="sub">در حال رفتن به انتخاب وسیله…</p></div></div>' };
    }
    const L = p.limits;
    const summary = () => {
      if (L.ideaOnly) return 'فقط ایده — سقف خرید فعلاً تعیین نمی‌شود.';
      if (!L.purchaseCap) return 'بدون خرید — با وسایل موجود.';
      const cats = L.categories.length ? L.categories.map((c) => (D.categories.find((x) => x.id === c) || {}).label).join('، ') : 'همهٔ دسته‌ها';
      return E.fa(L.purchaseCap) + ' خرید تا سقف ' + (L.budget ? UI.money(L.budget) : 'بدون سقف') + ' · ' + cats;
    };
    const html = `<div class="screen">
      <div class="content">
        ${head(p, 2, 'محدودیت خرید', 'ترتیب اولویت: معماری و وسایل ثابت، بعد سقف خرید، بعد هدف.')}
        <div class="card">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1"><div class="card-title">فعلاً فقط ایده بده</div><div class="tiny">سقف هزینه و تعداد خرید تعیین نمی‌شود.</div></div>
            <button class="switch ${L.ideaOnly ? 'is-on' : ''}" data-idea aria-label="فقط ایده"></button>
          </div>
        </div>
        <div style="${L.ideaOnly ? 'opacity:.45;pointer-events:none' : ''}">
          <div class="field mt-16">
            <span>سقف هزینه</span>
            <div class="input-suffix"><input class="input" id="budget" inputmode="numeric" placeholder="۳٬۰۰۰٬۰۰۰" value="${L.budget ? E.money(L.budget) : ''}"/><b>تومان</b></div>
            <div class="field-err" id="berr" hidden></div>
          </div>
          <div class="card flat mt-12">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1"><div class="card-title">تعداد خرید</div><div class="tiny">سقف اقلام تازه‌ای که می‌شود خرید.</div></div>
              <div class="stepper">
                <button type="button" data-cap="-1" aria-label="کمتر">−</button>
                <div class="val" id="capval">${E.fa(L.purchaseCap)}</div>
                <button type="button" data-cap="1" aria-label="بیشتر">+</button>
              </div>
            </div>
          </div>
          <h3 class="h3 mt-16">چه چیزهایی می‌توانند عوض شوند؟</h3>
          <div class="chip-row mt-8">
            ${D.categories.map((c) => UI.chip(c.label, L.categories.includes(c.id), `data-cat="${c.id}"`)).join('')}
          </div>
          <p class="tiny mt-8">اگر هیچ دسته‌ای انتخاب نشود، همهٔ دسته‌ها مجازند. مبل، فرش و تلویزیون در صفحهٔ بعد جداگانه قفل می‌شوند.</p>
        </div>
        <div class="card tint mt-16">
          <div class="card-title">${A.icon('cart', 18)} خلاصهٔ محدودیت</div>
          <p class="sub mt-4" id="lsum">${summary()}</p>
        </div>
      </div>
      <div class="actions"><button class="btn" data-next>ادامه</button></div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-idea]').addEventListener('click', () => {
          L.ideaOnly = !L.ideaOnly;
          S.touch(p);
          UI.refresh();
        });
        root.querySelectorAll('[data-cap]').forEach((b) =>
          b.addEventListener('click', () => {
            L.purchaseCap = Math.max(0, Math.min(6, (L.purchaseCap || 0) + Number(b.getAttribute('data-cap'))));
            S.touch(p);
            UI.refresh();
          })
        );
        root.querySelectorAll('[data-cat]').forEach((b) =>
          b.addEventListener('click', () => {
            const id = b.getAttribute('data-cat');
            L.categories = L.categories.includes(id) ? L.categories.filter((x) => x !== id) : L.categories.concat(id);
            S.touch(p);
            UI.refresh();
          })
        );
        const bud = root.querySelector('#budget');
        if (bud)
          bud.addEventListener('change', () => {
            const v = E.normDigits(bud.value).replace(/[^\d]/g, '');
            const err = root.querySelector('#berr');
            if (!v) {
              L.budget = null;
              err.hidden = true;
              bud.value = '';
            } else if (Number(v) < 100000) {
              err.hidden = false;
              err.textContent = 'سقف کمتر از ۱۰۰٬۰۰۰ تومان معنی ندارد؛ مبلغ را بررسی کن.';
              bud.classList.add('err');
              return;
            } else {
              L.budget = Number(v);
              err.hidden = true;
              bud.classList.remove('err');
              bud.value = E.money(L.budget);
            }
            S.touch(p);
            root.querySelector('#lsum').textContent = summary();
          });
        root.querySelector('[data-next]').addEventListener('click', () => {
          p.step = 'items';
          S.touch(p);
          UI.go('#/new/items/' + p.id);
        });
      },
    };
  });

  /* ================= ۵. انتخاب وسیله ================= */
  function stName(s) {
    return (D.itemStatuses.find((x) => x.id === s) || {}).label || s;
  }

  UI.define('new/items', function (ctx) {
    const p = need(ctx);
    const selected = ctx.query.sel || null;
    const html = `<div class="screen">
      <div class="content">
        ${head(p, 3, 'انتخاب وسایل', 'روی هر وسیله بزن و بگو بماند یا عوض شود.')}
        <div class="photo-frame" id="frame">
          ${
            (UI.mainPhoto(p) && UI.mainPhoto(p).dataUrl)
              ? `<img src="${UI.mainPhoto(p).dataUrl}" alt="عکس اتاق"/>`
              : A.scene({ roomW: p.room.w, items: p.items, uid: 'it' + p.id.slice(-3) })
          }
          ${p.items
            .filter((it) => it.bounds && !it.hiddenInView)
            .map((it) => {
              const b = it.bounds;
              const lp = b.y + b.h > 0.9 ? 'span-inside' : b.y < 0.13 ? 'span-top' : '';
              return `<div class="photo-hotspot ${lp} ${selected === it.id ? 'is-sel' : ''} ${it.status === 'fixed' ? 'locked' : ''}" data-hot="${it.id}" style="${UI.boundsStyle(b)}">
                <span>${UI.esc(it.name)}${it.status === 'fixed' ? ' · ثابت' : ''}</span>
              </div>`;
            })
            .join('')}
        </div>
        <div class="row-head mt-12"><h3 class="h3">وسایل تشخیص‌داده‌شده</h3><span class="tiny">${E.fa(p.items.length)} مورد</span></div>
        <p class="tiny">در نسخهٔ نمایشی تشخیص خودکار شبیه‌سازی شده است؛ می‌توانی محدوده را دستی اصلاح کنی یا وسیله اضافه کنی.</p>
        ${p.items.some((i) => i.hiddenInView) ? `<p class="tiny" style="color:var(--brick)">${p.items.filter((i) => i.hiddenInView).map((i) => i.name).join(' و ')} در این زاویه دیده نمی‌شوند؛ از فهرست انتخابشان کن.</p>` : ''}
        <div class="mt-8">
          ${p.items
            .map(
              (it) => `<button class="item-row ${selected === it.id ? 'is-sel' : ''}" data-row="${it.id}">
                <i class="dot" style="background:${it.color}"></i>
                <div class="nm">${UI.esc(it.name)}<small>${E.fa(it.len)} × ${E.fa(it.dep)} سانتی‌متر · ${stName(it.status)}${it.hiddenInView ? ' · در این زاویه دیده نمی‌شود' : ''}</small></div>
                <span class="badge ${it.status === 'fixed' ? 'bad' : it.status === 'keep' ? 'warn' : 'ok'}">${stName(it.status)}</span>
              </button>`
            )
            .join('')}
        </div>
        <button class="btn secondary mt-12" data-add>${A.icon('plus', 18)} افزودن وسیله</button>
        <div class="card flat mt-16">
          <div class="card-title">${A.icon('info', 17)} ترتیب اعمال قیدها</div>
          <p class="sub mt-4">۱) معماری و وسایل ثابت ۲) سقف خرید و بودجه ۳) هدف اصلی ۴) ترجیح‌های بصری.</p>
        </div>
      </div>
      <div class="actions"><button class="btn" data-next>مرور طرح</button><div class="meta">${E.fa(p.items.filter((i) => i.status === 'fixed').length)} وسیله ثابت · ${E.fa(p.items.filter((i) => i.status === 'keep').length)} حفظ‌شده</div></div>
    </div>`;
    return {
      html,
      mount(root) {
        const open = (id) => {
          root.querySelectorAll('[data-hot]').forEach((h) => h.classList.toggle('is-sel', h.getAttribute('data-hot') === id));
          root.querySelectorAll('[data-row]').forEach((r) => r.classList.toggle('is-sel', r.getAttribute('data-row') === id));
          openItemSheet(p, id, () => UI.refresh());
        };
        root.querySelectorAll('[data-hot],[data-row]').forEach((el) =>
          el.addEventListener('click', () => open(el.getAttribute('data-hot') || el.getAttribute('data-row')))
        );
        root.querySelector('[data-add]').addEventListener('click', () => addItemSheet(p, () => UI.refresh()));
        root.querySelector('[data-next]').addEventListener('click', () => {
          p.step = 'review';
          S.touch(p);
          UI.go('#/new/review/' + p.id);
        });
      },
    };
  });

  function openItemSheet(p, id, after) {
    const it = p.items.find((i) => i.id === id);
    if (!it) return;
    UI.sheet({
      title: it.name,
      sub: 'وضعیت این وسیله را مشخص کن.',
      html: `<div class="stack-sm mt-8">
        ${D.itemStatuses.map(
          (s) => `<button class="status-opt ${it.status === s.id ? 'is-on' : ''}" data-status="${s.id}">
            <div><b>${s.label}</b><div class="tiny">${s.hint}</div></div>
            <span class="so-radio">${it.status === s.id ? A.icon('check', 14) : ''}</span>
          </button>`
        ).join('')}
      </div>
      <div class="btn-row mt-12">
        <div class="field" style="flex:1"><span>طول (سانتی‌متر)</span><input class="input" id="len" inputmode="numeric" value="${E.fa(it.len)}"/></div>
        <div class="field" style="flex:1"><span>عمق (سانتی‌متر)</span><input class="input" id="dep" inputmode="numeric" value="${E.fa(it.dep)}"/></div>
      </div>
      <div class="field-err" id="merr" hidden></div>
      <p class="tiny mt-8">وضعیت اندازه: ${D.measureState[it.meas] || it.meas}. اندازهٔ نامعلوم، جابه‌جایی را «نیاز به اندازه» می‌کند.</p>
      <div class="btn-row mt-12">
        <button class="btn secondary" data-edit-bounds>اصلاح محدوده</button>
        <button class="btn" data-ok>تأیید</button>
      </div>`,
      mount(el) {
        let status = it.status;
        el.querySelectorAll('[data-status]').forEach((b) =>
          b.addEventListener('click', () => {
            status = b.getAttribute('data-status');
            el.querySelectorAll('[data-status]').forEach((x) => x.classList.toggle('is-on', x === b));
            el.querySelectorAll('.so-radio').forEach((r) => (r.innerHTML = ''));
            b.querySelector('.so-radio').innerHTML = A.icon('check', 14);
          })
        );
        el.querySelector('[data-ok]').addEventListener('click', () => {
          const L = E.parseMeasure(el.querySelector('#len').value);
          const Dp = E.parseMeasure(el.querySelector('#dep').value);
          const err = el.querySelector('#merr');
          if (!L.ok || !Dp.ok) {
            err.hidden = false;
            err.textContent = (!L.ok ? 'طول: ' + E.measureError[L.reason] : '') + ' ' + (!Dp.ok ? 'عمق: ' + E.measureError[Dp.reason] : '');
            return;
          }
          it.status = status;
          it.len = L.cm;
          it.dep = Dp.cm;
          it.meas = 'measured';
          it.confirmed = true;
          S.touch(p);
          UI.closeSheet();
          after && after();
        });
        el.querySelector('[data-edit-bounds]').addEventListener('click', () => {
          UI.closeSheet();
          UI.go('#/new/items/' + p.id + '?sel=' + it.id);
          setTimeout(() => boundsEditor(p, it, () => UI.refresh()), 80);
        });
      },
    });
  }

  function boundsEditor(p, it, done) {
    const frame = document.querySelector('.photo-frame');
    if (!frame) return;
    const hot = frame.querySelector('[data-hot="' + it.id + '"]');
    if (!hot) return;
    frame.querySelectorAll('.photo-hotspot').forEach((h) => (h.style.pointerEvents = 'none'));
    hot.style.pointerEvents = 'auto';
    hot.classList.add('is-sel');
    const bar = document.createElement('div');
    bar.className = 'bounds-bar';
    bar.innerHTML = `<span>محدودهٔ «${UI.esc(it.name)}» را بکش</span><button class="btn small" data-save>ذخیره</button>`;
    frame.parentElement.insertBefore(bar, frame.nextSibling);
    let mode = null;
    let start = null;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const onDown = (ev) => {
      const r = frame.getBoundingClientRect();
      mode = ev.target.classList.contains('rs') ? 'resize' : 'move';
      start = { x: ev.clientX, y: ev.clientY, b: Object.assign({}, it.bounds), w: r.width, h: r.height };
      hot.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    };
    const onMove = (ev) => {
      if (!start) return;
      const dx = (ev.clientX - start.x) / start.w;
      const dy = (ev.clientY - start.y) / start.h;
      if (mode === 'move') {
        it.bounds.x = clamp(start.b.x + dx, 0, 1 - it.bounds.w);
        it.bounds.y = clamp(start.b.y + dy, 0, 1 - it.bounds.h);
      } else {
        it.bounds.w = clamp(start.b.w + dx, 0.05, 1 - it.bounds.x);
        it.bounds.h = clamp(start.b.h + dy, 0.05, 1 - it.bounds.y);
      }
      hot.style.cssText = UI.boundsStyle(it.bounds);
      hot.style.pointerEvents = 'auto';
    };
    const onUp = () => (start = null);
    hot.addEventListener('pointerdown', onDown);
    hot.addEventListener('pointermove', onMove);
    hot.addEventListener('pointerup', onUp);
    hot.addEventListener('pointercancel', onUp);
    const rs = document.createElement('i');
    rs.className = 'rs';
    rs.style.cssText = 'position:absolute;left:-6px;bottom:-6px;width:14px;height:14px;background:#fff;border:2px solid #285542;border-radius:4px;cursor:nwse-resize';
    hot.appendChild(rs);
    bar.querySelector('[data-save]').addEventListener('click', () => {
      it.confirmed = true;
      S.touch(p);
      bar.remove();
      done && done();
    });
  }

  function addItemSheet(p, after) {
    UI.sheet({
      title: 'افزودن وسیله',
      html: `<div class="field mt-8"><span>نام وسیله</span><input class="input" id="aname" placeholder="مثلاً میز کنار مبل"/></div>
      <div class="btn-row mt-12">
        <div class="field" style="flex:1"><span>طول (سانتی‌متر)</span><input class="input" id="alen" inputmode="numeric" value="۱۲۰"/></div>
        <div class="field" style="flex:1"><span>عمق (سانتی‌متر)</span><input class="input" id="adep" inputmode="numeric" value="۶۰"/></div>
      </div>
      <div class="field mt-12"><span>وضعیت</span><div class="chip-row" data-statuses>
        ${D.itemStatuses.map((s) => `<button type="button" class="chip ${s.id === 'free' ? 'is-on' : ''}" data-ast="${s.id}">${s.label}</button>`).join('')}
      </div></div>
      <div class="btn-row mt-16"><button class="btn secondary" data-close>بی‌خیال</button><button class="btn" data-ok>افزودن</button></div>`,
      mount(el) {
        let st = 'free';
        el.querySelectorAll('[data-ast]').forEach((b) =>
          b.addEventListener('click', () => {
            st = b.getAttribute('data-ast');
            el.querySelectorAll('[data-ast]').forEach((x) => x.classList.toggle('is-on', x === b));
          })
        );
        el.querySelector('[data-ok]').addEventListener('click', () => {
          const name = el.querySelector('#aname').value.trim();
          if (!name) {
            el.querySelector('#aname').classList.add('err');
            return;
          }
          const L = E.parseMeasure(el.querySelector('#alen').value);
          const Dp = E.parseMeasure(el.querySelector('#adep').value);
          if (!L.ok || !Dp.ok) return UI.toast('اندازه را با عدد معتبر وارد کن.');
          p.items.push({
            id: 'it_' + Date.now().toString(36),
            name,
            cat: 'decor',
            len: L.cm,
            dep: Dp.cm,
            h: 60,
            x: 1.6,
            y: 1.6,
            rot: 0,
            status: st,
            meas: 'measured',
            color: '#9A7B5C',
            bounds: { x: 0.38, y: 0.55, w: 0.18, h: 0.14 },
            added: true,
          });
          S.touch(p);
          UI.closeSheet();
          after && after();
        });
      },
    });
  }

  /* ================= ۶. مرور ================= */
  UI.define('new/review', function (ctx) {
    const p = need(ctx);
    const mode = D.modes.find((m) => m.id === p.mode) || D.modes[2];
    const goal = D.goals.find((g) => g.id === p.goal.primary) || {};
    const goal2 = D.goals.find((g) => g.id === p.goal.secondary);
    const fixed = p.items.filter((i) => i.status === 'fixed');
    const keeps = p.items.filter((i) => i.status === 'keep');
    const chk = E.check(p);
    const L = p.limits;
    const limitLine =
      p.mode === 'own'
        ? 'بدون خرید — با وسایل موجود'
        : L.ideaOnly
        ? 'فقط ایده، بدون سقف خرید'
        : E.fa(L.purchaseCap || 0) + ' خرید تا ' + (L.budget ? UI.money(L.budget) : 'بدون سقف') + (L.categories.length ? ' · ' + L.categories.map((c) => (D.categories.find((x) => x.id === c) || {}).label).join('، ') : '');
    const rows = [
      { k: 'حالت طراحی', v: mode.title, href: '#/new/mode/' + p.id, s: mode.line },
      { k: 'هدف', v: goal.label + (goal2 ? ' + ' + goal2.label : ''), href: '#/new/goal/' + p.id, s: p.goal.text || goal.hint || '' },
      { k: 'وسایل', v: E.fa(fixed.length) + ' ثابت، ' + E.fa(keeps.length) + ' حفظ‌شده، ' + E.fa(p.items.length - fixed.length - keeps.length) + ' قابل تغییر', href: '#/new/items/' + p.id, s: fixed.map((i) => i.name).join('، ') || '—' },
      { k: 'محدودیت خرید', v: limitLine, href: '#/new/limits/' + p.id, s: '' },
    ];
    const html = `<div class="screen">
      <div class="content">
        ${head(p, 4, 'مرور طرح', 'این چیزی است که برای ساخت پیش‌نمایش ارسال می‌شود.')}
        <div class="photo-frame" style="aspect-ratio:16/10">
          ${
            (UI.mainPhoto(p) && UI.mainPhoto(p).dataUrl)
              ? `<img src="${UI.mainPhoto(p).dataUrl}" alt="عکس اتاق"/>`
              : A.scene({ roomW: p.room.w, items: p.items, uid: 'rv' + p.id.slice(-3) })
          }
        </div>
        <div class="card mt-12" style="padding:4px 14px">
          ${rows
            .map(
              (r) => `<div class="row" data-go="${r.href}">
                <div class="row-main"><div class="tiny">${r.k}</div><div class="row-title" style="font-size:14px">${UI.esc(r.v)}</div>${r.s ? `<div class="row-sub">${UI.esc(r.s)}</div>` : ''}</div>
                <div class="row-side">ویرایش ${A.icon('next', 15)}</div>
              </div>`
            )
            .join('')}
        </div>
        ${
          chk.conflicts.length
            ? `<div class="card warn mt-12"><div class="card-title">${A.icon('info', 18)} ${E.fa(chk.conflicts.length)} تعارض پیش از ساخت</div>
               <div class="stack-sm mt-8">${chk.conflicts
                 .slice(0, 4)
                 .map((c) => `<div class="tiny">• ${UI.esc(c.text)}</div>`)
                 .join('')}</div>
               <p class="tiny mt-8">تعارض‌ها در فهرست تغییرها مشخص می‌شوند و به‌عنوان تغییر اجرایی پیشنهاد نمی‌شوند.</p></div>`
            : `<div class="card tint mt-12"><div class="card-title">${A.icon('check', 18)} قیدها با هم سازگارند</div><p class="sub mt-4">هیچ تعارض قطعی پیدا نشد؛ اندازه‌های نامعلوم در فهرست تغییرها علامت می‌خورند.</p></div>`
        }
        <div class="card flat mt-12">
          <div class="card-title">${A.icon('ruler', 18)} عرض آزاد مسیر بالکن</div>
          <p class="sub mt-4">${E.cmLabel(Math.round(chk.freeRoute * 100))} — ${chk.freeRoute >= 0.6 ? 'برای عبور کافی است.' : 'کمتر از ۶۰ سانتی‌متر لازم؛ جابه‌جایی‌های این بخش اجرایی نمی‌شوند.'}</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn" data-build>ساخت پیش‌نمایش</button>
        <div class="meta">پردازش همین نسخه ثبت می‌شود؛ تغییر تنظیمات، سفارش تازه نمی‌سازد.</div>
      </div>
    </div>`;
    return {
      html,
      mount(root) {
        root.querySelector('[data-build]').addEventListener('click', () => {
          p.step = 'review';
          S.touch(p);
          const r = S.startProcessing(p);
          if (r.duplicate) UI.toast('این پروژه از قبل در صف است.');
          UI.go('#/processing/' + p.id);
        });
      },
    };
  });
})(window);
