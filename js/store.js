/* خونه‌چین — وضعیت، ذخیره‌سازی محلی و کنش‌ها */
(function (global) {
  const K = (global.K = global.K || {});
  const E = K.Engine;
  const D = K.Data;
  const S = (K.Store = {});
  const KEY = 'khunechin.v1';

  let state = null;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const uid = (p) => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  S.now = () => new Date().toISOString();

  S.seed = function () {
    const mk = function (name, opts) {
      const p = {
        id: uid('prj'),
        name: name,
        createdAt: S.now(),
        updatedAt: S.now(),
        status: 'draft',
        step: 'photo',
        room: clone(D.room),
        photos: [],
        mode: 'mixed',
        goal: { primary: 'traffic', secondary: 'light', text: '' },
        taste: { preset: 'light-simple', note: '' },
        limits: { budget: 3000000, purchaseCap: 2, categories: ['curtain', 'light'], ideaOnly: false },
        items: clone(D.items),
        requestVersion: 1,
        processing: null,
        schemes: [],
        activeSchemeId: null,
        rejected: [],
        history: [],
        refineCredits: D.app.refineCredits,
        guide: null,
        plan: { saved: false, routeWidth: null },
        purchase: { status: 'none', orderId: null, receipt: null },
        notes: [],
      };
      return Object.assign(p, opts || {});
    };

    const ready = mk('پذیرایی خانهٔ ما', { mode: 'mixed', status: 'ready', step: 'result', id: 'prj_demo' });
    ready.items.forEach((it) => {
      if (it.id === 'chair') it.name = 'صندلی تک‌نفره';
    });
    ready.photos = [
      { id: 'ph-main', kind: 'main', dataUrl: null, scene: 'sample', w: 1600, h: 1000, quality: { sharp: 0.82, bright: 0.61, label: 'خوب' }, rotated: 0 },
    ];
    const solved = E.solve(ready);
    ready.schemes = solved.schemes;
    ready.rejected = solved.rejected;
    ready.activeSchemeId = ready.schemes[0].id;
    ready.guide = E.buildGuide(ready, ready.schemes[0]);
    ready.history = [{ id: 'h_seed', label: 'نسخهٔ اول', at: S.now(), schemeId: ready.activeSchemeId, status: 'ok' }];
    ready.purchase = {
      status: 'paid',
      orderId: 'ord_demo1',
      receipt: { id: 'RC-2831', at: S.now(), amount: D.app.packagePrice, title: 'بستهٔ اتاق', project: ready.name, tracking: 'TRK-90231' },
    };
    ready.updatedAt = S.now();

    const draft = mk('نشیمن — پیش‌نویس', { mode: 'mixed', status: 'draft', step: 'goal', name: 'نشیمن — پیش‌نویس', id: 'prj_draft' });
    draft.goal = { primary: 'compact', secondary: null, text: 'می‌خوام فضای وسط بازتر بشه، مبل و فرش بمونه و راه بالکن باز بشه.' };
    draft.photos = [
      { id: 'ph_draft', kind: 'main', dataUrl: null, scene: 'sample', w: 1600, h: 1200, quality: { label: 'خوب', sharp: 0.8, bright: 0.62 }, rotated: 0, at: S.now() },
    ];
    draft.updatedAt = new Date(Date.now() - 36e5 * 4).toISOString();

    return {
      v: 1,
      createdAt: S.now(),
      seenWelcome: false,
      user: { phone: null, loggedIn: false, name: 'مهمان' },
      settings: { bigText: false },
      projects: [ready, draft],
      purchases: [
        { id: 'ord_demo1', projectId: ready.id, projectName: ready.name, amount: D.app.packagePrice, status: 'paid', at: ready.purchase.receipt.at, receiptId: 'RC-2831' },
      ],
      orders: [
        { id: 'ord_demo1', projectId: ready.id, projectName: ready.name, status: 'paid', age: 0, attempts: 1, reason: null, at: ready.purchase.receipt.at },
        { id: 'ord_demo2', projectId: draft.id, projectName: draft.name, status: 'stuck', age: 42, attempts: 2, reason: 'ارسال عکس کمکی نیمه‌کاره ماند', at: S.now() },
      ],
      tickets: [],
      events: [],
    };
  };

  S.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1 && Array.isArray(parsed.projects)) {
          state = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('خواندن وضعیت ناموفق بود', e);
    }
    state = S.seed();
    S.save();
  };

  S.save = function () {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('ذخیره ناموفق', e);
      if (K.UI && K.UI.toast) K.UI.toast('حافظهٔ مرورگر پر شد؛ عکس‌های کمکی را حذف کن.');
      return false;
    }
  };

  S.get = () => state;
  S.projects = () => state.projects;
  S.active = () => state.projects.find((p) => p.id === state.activeId) || null;
  S.byId = (id) => state.projects.find((p) => p.id === id) || null;
  S.setActive = (id) => {
    state.activeId = id;
    S.save();
  };

  S.newProject = function () {
    const p = S.seed().projects[0];
    p.id = uid('prj');
    p.name = 'پذیرایی تازه';
    p.status = 'draft';
    p.step = 'photo';
    p.photos = [];
    p.schemes = [];
    p.activeSchemeId = null;
    p.guide = null;
    p.history = [];
    p.refineCredits = D.app.refineCredits;
    p.purchase = { status: 'none', orderId: null, receipt: null };
    p.createdAt = S.now();
    p.updatedAt = S.now();
    p.plan = { saved: false, routeWidth: null };
    state.projects.unshift(p);
    state.activeId = p.id;
    S.save();
    S.track('project_created', { projectId: p.id });
    return p;
  };

  S.touch = function (p) {
    if (p) p.updatedAt = S.now();
    S.save();
  };

  S.rename = function (id, name) {
    const p = S.byId(id);
    if (!p || !name.trim()) return;
    p.name = name.trim();
    S.touch(p);
  };

  S.remove = function (id) {
    const idx = state.projects.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const p = state.projects[idx];
    if (p.processing) p.processing.canceled = true;
    state.projects.splice(idx, 1);
    if (state.activeId === id) state.activeId = state.projects[0] ? state.projects[0].id : null;
    S.save();
    S.track('project_deleted', { projectId: id });
  };

  S.duplicate = function (id) {
    const p = S.byId(id);
    if (!p) return null;
    const copy = clone(p);
    copy.id = uid('prj');
    copy.name = p.name + ' (کپی)';
    copy.createdAt = S.now();
    copy.updatedAt = S.now();
    copy.status = 'draft';
    copy.step = 'review';
    copy.schemes = [];
    copy.activeSchemeId = null;
    copy.guide = null;
    copy.history = [];
    copy.refineCredits = D.app.refineCredits;
    copy.purchase = { status: 'none', orderId: null, receipt: null };
    copy.processing = null;
    state.projects.unshift(copy);
    state.activeId = copy.id;
    S.save();
    return copy;
  };

  /* ---------- چرخهٔ پردازش ---------- */
  const STAGE_MS = [1400, 3000, 1700, 2200]; // صف، ساخت، بررسی، آماده
  S.totalMs = () => STAGE_MS.reduce((a, b) => a + b, 0);

  S.startProcessing = function (p) {
    // اگر سفارش فعالی هست، سفارش موازی ساخته نمی‌شود
    if (p.processing && ['queued', 'building', 'review'].includes(p.status)) return { duplicate: true, p };
    p.processing = { startedAt: Date.now(), attempt: (p.processing ? p.processing.attempt : 0) + 1 };
    p.status = 'queued';
    p.requestVersion += 1;
    S.touch(p);
    S.track('design_started', { projectId: p.id });
    return { duplicate: false, p };
  };

  S.processingStage = function (p) {
    if (!p.processing || p.status === 'ready' || p.status === 'failed' || p.status === 'draft') return null;
    const el = Date.now() - p.processing.startedAt;
    if (el < STAGE_MS[0]) return { i: 0, key: 'queued', label: 'در صف ساخت', pct: 8 + (el / STAGE_MS[0]) * 10 };
    if (el < STAGE_MS[0] + STAGE_MS[1]) return { i: 1, key: 'building', label: 'چیدمان در حال ساخت', pct: 18 + ((el - STAGE_MS[0]) / STAGE_MS[1]) * 52 };
    if (el < STAGE_MS[0] + STAGE_MS[1] + STAGE_MS[2]) return { i: 2, key: 'review', label: 'کنترل کیفیت', pct: 70 + ((el - STAGE_MS[0] - STAGE_MS[1]) / STAGE_MS[2]) * 22 };
    return { i: 3, key: 'ready', label: 'آماده شد', pct: 100 };
  };

  S.finishProcessing = function (p) {
    const solved = E.solve(p);
    p.schemes = solved.schemes;
    p.rejected = solved.rejected;
    if (!p.schemes.find((s) => s.id === p.activeSchemeId)) p.activeSchemeId = p.schemes[0].id;
    p.guide = E.buildGuide(p, p.schemes.find((s) => s.id === p.activeSchemeId));
    p.status = 'ready';
    p.step = 'result';
    p.processing = null;
    p.history.push({ id: uid('h'), label: 'نسخهٔ اول', at: S.now(), schemeId: p.activeSchemeId, status: 'ok' });
    S.touch(p);
    S.track('preview_ready', { projectId: p.id });
    return p;
  };

  S.failProcessing = function (p, reason) {
    p.status = 'failed';
    p.processing = null;
    p.failure = reason || 'تصویر قابل تأیید آماده نشد.';
    S.touch(p);
  };

  S.activeScheme = function (p) {
    if (!p || !p.schemes) return null;
    return p.schemes.find((s) => s.id === p.activeSchemeId) || p.schemes[0] || null;
  };

  S.selectScheme = function (p, id) {
    p.activeSchemeId = id;
    p.guide = E.buildGuide(p, S.activeScheme(p));
    S.touch(p);
    S.track('scheme_selected', { projectId: p.id });
  };

  /* ---------- اصلاح موضعی ---------- */
  S.refine = function (p, opts) {
    const scheme = S.activeScheme(p);
    if (!p || !scheme) return { ok: false, reason: 'طرحی برای اصلاح وجود ندارد.' };
    if (p.refineCredits < 1) return { ok: false, reason: 'سهم اصلاح این بسته تمام شده است.' };
    const areaItem = (opts && opts.itemId) || 'curtain';
    const item = p.items.find((i) => i.id === areaItem);
    if (item && item.status === 'fixed') {
      p.history.push({ id: uid('h'), label: 'اصلاح ' + item.name, at: S.now(), status: 'rejected', note: 'این وسیله روی جای ثابت است؛ اصلاح به آن سرایت کرد.', schemeId: scheme.id });
      S.touch(p);
      S.track('refinement_rejected', { projectId: p.id });
      return { ok: false, reason: 'این وسیله جای ثابت است. سهم اصلاح مصرف نشد.', rejected: true };
    }
    const version = p.history.filter((h) => h.status === 'ok').length + 1;
    const next = clone(scheme);
    next.id = 'V' + version;
    next.title = 'نسخهٔ ' + E.fa(version) + ' — ' + (opts && opts.label ? opts.label : 'اصلاح موضعی');
    next.tag = 'اصلاح‌شده';
    next.moves = next.moves.map((m) => Object.assign({}, m));
    next.buys = next.buys.map((b) =>
      Object.assign({}, b, {
        title: b.productId === 'p-curtain' ? 'پردهٔ کتان روشن‌تر' : b.title,
        note: (opts && opts.prompt ? opts.prompt + ' — ' : '') + b.note,
      })
    );
    next.changes = next.changes.map((c) =>
      c.kind === 'buy' && c.itemId === areaItem ? Object.assign({}, c, { title: 'پردهٔ کتان روشن‌تر', note: 'اصلاح موضعی: ' + ((opts && opts.prompt) || 'روشن‌تر') }) : Object.assign({}, c)
    );
    next.metrics = Object.assign({}, scheme.metrics);
    next.reason = scheme.reason + ' — با اصلاح موضعی ' + ((opts && opts.prompt) || 'روشن‌تر') + '.';
    next.parentId = scheme.id;
    p.schemes.push(next);
    p.activeSchemeId = next.id;
    p.refineCredits -= 1;
    p.guide = E.buildGuide(p, next);
    p.history.push({ id: uid('h'), label: 'اصلاح ' + (item ? item.name : ''), at: S.now(), status: 'ok', schemeId: next.id, credit: 1 });
    S.touch(p);
    S.track('refinement_used', { projectId: p.id });
    return { ok: true, scheme: next, previous: scheme };
  };

  S.revertVersion = function (p, schemeId) {
    const s = p.schemes.find((x) => x.id === schemeId);
    if (!s) return;
    p.activeSchemeId = s.id;
    p.guide = E.buildGuide(p, s);
    S.touch(p);
  };

  /* ---------- خرید ---------- */
  S.createOrder = function (p) {
    if (p.purchase && (p.purchase.status === 'pending' || p.purchase.status === 'paid')) {
      return { duplicate: true, order: p.purchase };
    }
    const order = {
      id: p.purchase && p.purchase.orderId ? p.purchase.orderId : uid('ord'),
      projectId: p.id,
      amount: D.app.packagePrice,
      status: 'pending',
      at: S.now(),
    };
    p.purchase = { status: 'pending', orderId: order.id, receipt: null };
    state.purchases.push({ id: order.id, projectId: p.id, projectName: p.name, amount: order.amount, status: 'pending', at: order.at, receiptId: null });
    state.orders.unshift({ id: order.id, projectId: p.id, projectName: p.name, status: 'pending', age: 0, attempts: 1, reason: null, at: order.at });
    S.touch(p);
    S.track('purchase_started', { projectId: p.id });
    return { duplicate: false, order };
  };

  S.confirmPayment = function (p, ok) {
    const pur = p.purchase;
    if (!pur || !pur.orderId) return { error: 'سفارشی برای پرداخت نیست.' };
    if (pur.status === 'paid') return { duplicate: true, purchase: pur };
    if (!ok) {
      pur.status = 'failed';
      const rec = state.purchases.find((x) => x.id === pur.orderId);
      if (rec) rec.status = 'failed';
      S.touch(p);
      return { failed: true };
    }
    const receipt = {
      id: 'RC-' + String(Math.floor(1000 + Math.random() * 9000)),
      at: S.now(),
      amount: D.app.packagePrice,
      title: 'بستهٔ اتاق',
      project: p.name,
      tracking: 'TRK-' + String(Math.floor(10000 + Math.random() * 89999)),
    };
    pur.status = 'paid';
    pur.receipt = receipt;
    const rec = state.purchases.find((x) => x.id === pur.orderId);
    if (rec) {
      rec.status = 'paid';
      rec.receiptId = receipt.id;
    }
    const ord = state.orders.find((x) => x.id === pur.orderId);
    if (ord) ord.status = 'paid';
    S.touch(p);
    S.track('purchase_completed', { projectId: p.id });
    return { ok: true, receipt };
  };

  S.restorePurchase = function (phone) {
    if (!phone || String(phone).replace(/\D/g, '').length < 10) return { ok: false, reason: 'شمارهٔ معتبر وارد کن.' };
    const paid = state.purchases.filter((x) => x.status === 'paid');
    const fixed = state.purchases.filter((x) => x.status === 'pending').length;
    return { ok: true, count: paid.length, fixed };
  };

  S.login = function (phone) {
    state.user.phone = phone;
    state.user.loggedIn = true;
    S.save();
  };

  S.logout = function () {
    state.user.loggedIn = false;
    state.user.phone = null;
    S.save();
  };

  S.addTicket = function (p, subject, body) {
    const t = { id: uid('tk'), projectId: p ? p.id : null, projectName: p ? p.name : '—', subject, body, at: S.now(), status: 'open' };
    state.tickets.unshift(t);
    S.save();
    return t;
  };

  S.resetDemo = function () {
    localStorage.removeItem(KEY);
    state = S.seed();
    S.save();
  };

  S.state = () => state;

  /* ---------- رویدادهای پایلوت ----------
     فقط نام رویداد، زمان و شناسهٔ پروژه ثبت می‌شود.
     متن خواستهٔ کاربر و تصویر خانه هرگز در این داده نیست. */
  S.track = function (event, meta) {
    if (!state) return;
    state.events = state.events || [];
    const m = meta || {};
    state.events.push({
      e: event,
      t: Date.now(),
      p: m.projectId || state.activeId || null,
      n: m.note || null,
    });
    if (state.events.length > 800) state.events.splice(0, state.events.length - 800);
    S.save();
  };

  S.trackOnce = function (event, meta) {
    if (!state) return;
    const pid = (meta && meta.projectId) || state.activeId || null;
    const has = (state.events || []).some((x) => x.e === event && x.p === pid);
    if (!has) S.track(event, meta);
  };

  S.events = () => (state && state.events) || [];

  S.eventsCsv = function () {
    const label = {
      app_open: 'باز شدن اپ',
      project_created: 'پروژه ساخته شد',
      photo_completed: 'عکس کامل شد',
      design_started: 'ساخت پیش‌نمایش',
      preview_ready: 'طرح آماده شد',
      preview_viewed: 'طرح دیده شد',
      scheme_selected: 'طرح انتخاب شد',
      purchase_started: 'شروع خرید',
      purchase_completed: 'خرید انجام شد',
      refinement_used: 'اصلاح موضعی',
      refinement_rejected: 'اصلاح رد شد',
      plan_saved: 'پلان ذخیره شد',
      task_done: 'یک کار اجرا شد',
      project_deleted: 'پروژه حذف شد',
    };
    const rows = [['رویداد', 'کد', 'زمان', 'شناسهٔ پروژه', 'توضیح']];
    S.events().forEach((x) => {
      const d = new Date(x.t);
      rows.push([label[x.e] || x.e, x.e, d.toLocaleString('fa-IR'), x.p || '', x.n || '']);
    });
    return rows
      .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(','))
      .join('\r\n');
  };
})(window);
