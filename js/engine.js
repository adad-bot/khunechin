/* خونه‌چین — موتور چیدمان، اعتبارسنجی اندازه و ساخت راهنمای اجرا
   خروجی این فایل با دادهٔ واقعی پروژه کار می‌کند: هیچ نتیجه‌ای از پیش نوشته نشده. */
(function (global) {
  const K = (global.K = global.K || {});
  const E = (K.Engine = {});
  const FA = '۰۱۲۳۴۵۶۷۸۹';

  /* ---------------- اعداد و متن ---------------- */
  E.fa = (n) => String(n).replace(/[0-9]/g, (d) => FA[+d]);
  E.money = (n) => E.fa(Number(n || 0).toLocaleString('en-US')).replace(/,/g, '٬');
  E.normDigits = (s) =>
    String(s == null ? '' : s)
      .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[٫،]/g, '.');

  E.cmLabel = (cm) => E.fa(cm) + ' سانتی‌متر';

  /** ورودی کاربر را به سانتی‌متر تبدیل می‌کند: «۲۱۰»، «210 cm»، «۲٫۱۰ متر» */
  E.parseMeasure = function (raw) {
    let s = E.normDigits(raw).trim();
    if (!s) return { ok: false, reason: 'empty' };
    const meterWord = /(متر|meter|^m$|\bm\b)/i.test(s) && !/(سانتی|سانت|cm)/i.test(s);
    const cmWord = /(سانتی|سانت|cm)/i.test(s);
    const cleaned = s.replace(/[^0-9.,]/g, '');
    if (!cleaned) return { ok: false, reason: 'invalid' };
    const val = parseFloat(cleaned.replace(',', '.'));
    if (!isFinite(val) || val <= 0) return { ok: false, reason: 'invalid' };
    let cm;
    if (meterWord) cm = val * 100;
    else if (cmWord) cm = val;
    else cm = /[.,]/.test(cleaned) && val < 20 ? val * 100 : val;
    cm = Math.round(cm * 10) / 10;
    if (cm < 20) return { ok: false, reason: 'tiny' };
    if (cm > 1200) return { ok: false, reason: 'huge' };
    return { ok: true, cm, unit: meterWord ? 'm' : 'cm', text: E.cmLabel(cm) };
  };

  E.measureError = {
    empty: 'اندازه را وارد کن.',
    invalid: 'عدد معتبر وارد کن؛ صفر یا مقدار منفی پذیرفته نیست.',
    tiny: 'اندازه کمتر از ۲۰ سانتی‌متر است؛ واحد را بررسی کن.',
    huge: 'اندازه بیش از ۱۲ متر است؛ واحد را بررسی کن.',
  };

  /* ---------------- هندسه ---------------- */
  E.rect = function (item, pos, rot) {
    const r = ((((rot == null ? item.rot : rot) % 180) + 180) % 180);
    const w = (r === 0 ? item.len : item.dep) / 100;
    const d = (r === 0 ? item.dep : item.len) / 100;
    const p = pos || item;
    return { x: p.x, y: p.y, w, d };
  };

  E.overlap = function (a, b, pad) {
    const p = pad == null ? 0 : pad;
    return a.x + p < b.x + b.w && b.x + p < a.x + a.w && a.y + p < b.y + b.d && b.y + p < a.y + a.d;
  };

  const EPS = 0.01;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  E.placements = function (project, overrides) {
    const o = overrides || {};
    return project.items.map((it) => {
      const n = o[it.id];
      return n ? Object.assign({}, it, n) : it;
    });
  };

  E.itemAt = (items, id) => items.find((i) => i.id === id);

  /** بررسی کامل یک وضعیت: مرزها، بازشوی در، مسیر، هم‌پوشانی و عرض دیوار */
  E.check = function (project, overrides) {
    const room = project.room;
    const items = E.placements(project, overrides);
    const issues = [];
    const push = (itemId, code, text, severity) => issues.push({ itemId, code, text, severity: severity || 'conflict' });
    const solids = items.filter((i) => !i.flat);

    items.forEach((it) => {
      const r = E.rect(it);
      if (r.x < -EPS || r.y < -EPS || r.x + r.w > room.w + EPS || r.y + r.d > room.d + EPS)
        push(it.id, 'bounds', 'بخشی از «' + it.name + '» بیرون از اتاق می‌افتد.');
    });

    const bal = room.walls && room.walls.w && room.walls.w.balcony;
    if (bal) {
      const door = { x: 0, y: bal.y1, w: bal.swing || 0.9, d: bal.y2 - bal.y1 };
      solids.forEach((it) => {
        if (E.overlap(E.rect(it), door, 0.01))
          push(it.id, 'door', 'جلوی بازشوی درِ بالکن را می‌بندد.');
      });
    }

    // مسیر رفت‌وآمد: عرض آزاد افقی در دالان بالکن
    let freeRoute = room.w;
    if (room.route) {
      const routeRect = {
        x: room.route.x1,
        y: room.route.y1,
        w: room.route.x2 - room.route.x1,
        d: room.route.y2 - room.route.y1,
      };
      const inRoute = items.filter((i) => !i.flat && E.overlap(E.rect(i), routeRect, 0.01));
      const spans = inRoute
        .map((i) => {
          const r = E.rect(i);
          return [Math.max(room.route.x1, r.x), Math.min(room.route.x2, r.x + r.w)];
        })
        .filter((s) => s[1] > s[0])
        .sort((a, b) => a[0] - b[0]);
      let blocked = 0;
      let cursor = room.route.x1;
      spans.forEach((s) => {
        const a = Math.max(s[0], cursor);
        if (s[1] > a) blocked += s[1] - a;
        cursor = Math.max(cursor, s[1]);
      });
      freeRoute = Math.max(0, room.route.x2 - room.route.x1 - blocked);
      if (freeRoute < 0.6) {
        const names = inRoute.map((i) => i.name).join('، ');
        push(inRoute[0] ? inRoute[0].id : null, 'route',
          'عرض آزاد مسیر بالکن ' + E.cmLabel(Math.round(freeRoute * 100)) + ' است؛ کمتر از ۶۰ سانتی‌متر لازم. (' + names + ')');
      }
    }

    // هم‌پوشانی وسایل
    for (let i = 0; i < solids.length; i++) {
      for (let j = i + 1; j < solids.length; j++) {
        const a = solids[i];
        const b = solids[j];
        if (a.wall || b.wall) continue;
        if (E.overlap(E.rect(a), E.rect(b), 0.015)) {
          push(a.id, 'overlap', '«' + a.name + '» با «' + b.name + '» هم‌پوشانی دارد.');
          push(b.id, 'overlap', '«' + b.name + '» با «' + a.name + '» هم‌پوشانی دارد.');
        }
      }
    }

    // قید عرض دیوار (نمونهٔ سند: عرض آزاد ۱۸۰ و مبل ۲۱۰)
    (room.constraints || []).forEach((c) => {
      items.forEach((it) => {
        const r = E.rect(it);
        if (it.flat) return;
        const nearWall = c.wall === 'n' ? r.y < 0.14 : c.wall === 's' ? r.y + r.d > room.d - 0.14 : c.wall === 'w' ? r.x < 0.14 : r.x + r.w > room.w - 0.14;
        if (!nearWall) return;
        const from = c.from;
        const to = c.to;
        const along1 = c.wall === 'n' || c.wall === 's' ? r.x : r.y;
        const along2 = c.wall === 'n' || c.wall === 's' ? r.x + r.w : r.y + r.d;
        if (along2 < from - EPS || along1 > to + EPS) return;
        const run = (to - from) * 100;
        const len = (along2 - along1) * 100;
        if (len > run + 0.5)
          push(it.id, 'wall',
            'عرض آزاد ' + c.label + ' ' + E.cmLabel(Math.round(run)) + ' است و ' + (it.cat === 'sofa' ? 'طول مبل' : 'طول این وسیله') + ' ' + E.cmLabel(Math.round(len)) + ' است.');
      });
    });

    const need = items.filter((i) => i.meas === 'unknown');
    const conflicts = issues.filter((i) => i.severity === 'conflict');
    return {
      items,
      issues,
      conflict: conflicts.length > 0,
      conflicts,
      need,
      freeRoute,
      itemIssues(id) {
        return conflicts.filter((i) => i.itemId === id);
      },
    };
  };

  /* ---------------- تغییر ابعاد اتاق ---------------- */
  /** اتاق را به ابعاد تازه می‌برد و چیدمان را متناسب جابه‌جا می‌کند تا چیزی بیرون نماند. */
  E.resizeRoom = function (project, wCm, dCm) {
    const r = project.room;
    const nw = Math.round(wCm) / 100;
    const nd = Math.round(dCm) / 100;
    if (!(nw >= 2 && nw <= 12 && nd >= 2 && nd <= 12)) return { ok: false, reason: 'ابعاد اتاق باید بین ۲ و ۱۲ متر باشد.' };
    const sx = nw / r.w;
    const sy = nd / r.d;

    if (r.walls.n && r.walls.n.window) {
      r.walls.n.window.x1 = clamp(r.walls.n.window.x1 * sx, 0.2, nw - 0.8);
      r.walls.n.window.x2 = Math.min(nw - 0.2, r.walls.n.window.x2 * sx);
      if (r.walls.n.window.x2 - r.walls.n.window.x1 < 1) r.walls.n.window.x2 = r.walls.n.window.x1 + 1;
    }
    if (r.walls.s && r.walls.s.tv) {
      r.walls.s.tv.x1 = clamp(r.walls.s.tv.x1 * sx, 0.2, nw - 0.6);
      r.walls.s.tv.x2 = Math.min(nw - 0.2, r.walls.s.tv.x2 * sx);
    }
    if (r.walls.w && r.walls.w.balcony) {
      const b = r.walls.w.balcony;
      const h = Math.min(1.2, Math.max(0.8, (b.y2 - b.y1) * sy));
      b.y2 = Math.min(nd - 0.2, b.y2 * sy);
      b.y1 = Math.max(0.2, b.y2 - h);
      if (r.route) {
        r.route.y1 = Math.max(0.2, b.y1 - 0.1);
        r.route.y2 = Math.min(nd, b.y2 + 0.05);
        r.route.x2 = Math.min(nw, (b.swing || 0.9) + 0.25);
      }
    }
    (r.constraints || []).forEach((c) => {
      c.from = clamp(c.from * sx, 0.2, nw - 0.4);
      c.to = clamp(c.to * sx, c.from + 0.4, nw - 0.2);
    });

    r.w = nw;
    r.d = nd;
    r.source = 'measured';

    project.items.forEach((it) => {
      const rect = E.rect(it);
      it.x = clamp(it.x * sx, 0, Math.max(0, nw - rect.w));
      it.y = clamp(it.y * sy, 0, Math.max(0, nd - rect.d));
    });
    return { ok: true, room: r };
  };

  /* ---------------- توصیف مکان ---------------- */
  E.describePlace = function (room, it) {
    const r = E.rect(it);
    if (it.wall === 'n' || (it.y < 0.14 && !it.wall)) return 'کنار پنجره';
    if (it.x + r.w > room.w - 0.14) return 'کنار دیوار شرقی';
    if (it.x < 0.14) return 'کنار دیوار غربی';
    if (it.y + r.d > room.d - 0.14) return 'کنار دیوار جنوبی';
    if (it.y < 1.2) return 'گوشهٔ پنجره';
    if (it.y + r.d > 2.4) return 'گوشهٔ نشیمن';
    return 'وسط پذیرایی';
  };

  /* ---------------- ساخت طرح‌ها ---------------- */
  const CANDIDATES = {
    chair: [{ x: 3.3, y: 2.5 }, { x: 3.32, y: 2.55 }, { x: 3.3, y: 1.9 }, { x: 3.3, y: 0.35 }],
    plant: [{ x: 3.5, y: 0.45 }, { x: 2.2, y: 0.4 }, { x: 0.35, y: 0.25 }],
    lamp: [{ x: 3.78, y: 1.95 }, { x: 3.72, y: 2.0 }, { x: 3.85, y: 0.9 }],
    side: [{ x: 3.6, y: 0.5 }, { x: 3.55, y: 2.6 }],
    sofa: [{ x: 2.2, y: 0.06, rot: 0 }, { x: 2.1, y: 0.06, rot: 0 }],
  };

  function applyState(project, moves) {
    const o = {};
    moves.forEach((m) => (o[m.itemId] = m.to));
    return E.check(project, o);
  }

  E.solve = function (project) {
    const room = project.room;
    const items = project.items;
    const goal = project.goal || {};
    const limits = project.limits || {};
    const movesA = [];
    const rejected = [];
    const allowedCats = limits.categories || [];

    // تعارض‌های موجود، مانع ارزیابی جابه‌جایی‌های بی‌ربط نمی‌شوند
    const base0 = E.check(project);
    const baseKeys = new Set(base0.conflicts.map((c) => c.code + ':' + c.itemId));
    const valid = (chk) => chk.conflicts.every((c) => baseKeys.has(c.code + ':' + c.itemId));
    const blockers = [];
    base0.conflicts.forEach((c) => {
      const it = items.find((x) => x.id === c.itemId);
      if (it && it.status === 'fixed' && !blockers.some((b) => b.itemId === it.id)) blockers.push({ itemId: it.id, name: it.name, text: c.text });
    });

    const addMove = function (item, pos) {
      return { itemId: item.id, itemName: item.name, from: { x: item.x, y: item.y, rot: item.rot }, to: pos };
    };

    // ۱) هر وسیلهٔ جابه‌جاشونده‌ای که مسیر یا بازشو را می‌بندد، اول آزاد می‌شود
    const base = E.check(project);
    const blockingIds = new Set(base.issues.filter((i) => ['route', 'door'].includes(i.code)).map((i) => i.itemId));
    const goalOrder = goal.primary === 'light' ? ['lamp', 'chair', 'plant'] : ['chair', 'plant', 'lamp'];

    const tryPlace = function (item, list, bucket, label, depth) {
      for (const cand of list) {
        const pos = { x: cand.x, y: cand.y, rot: cand.rot == null ? item.rot : cand.rot };
        if (Math.abs(pos.x - item.x) < 0.01 && Math.abs(pos.y - item.y) < 0.01) continue;
        const test = applyState(project, bucket.concat([addMove(item, pos)]));
        if (valid(test)) {
          bucket.push(addMove(item, pos));
          return true;
        }
        // اگر یک وسیلهٔ جابه‌جاشونده جلوی مقصد را گرفته، اول آن را جابه‌جا کن
        if ((depth || 0) < 1) {
          const blockers = test.conflicts
            .filter((c) => c.code === 'overlap' && c.itemId && c.itemId !== item.id)
            .map((c) => items.find((x) => x.id === c.itemId))
            .filter((x, i, arr) => x && x !== item && x.status !== 'fixed' && !x.flat && CANDIDATES[x.id] && arr.indexOf(x) === i);
          for (const b of blockers) {
            for (const bcand of CANDIDATES[b.id]) {
              const bpos = { x: bcand.x, y: bcand.y, rot: bcand.rot == null ? b.rot : bcand.rot };
              if (Math.abs(bpos.x - b.x) < 0.01 && Math.abs(bpos.y - b.y) < 0.01) continue;
              const helper = [addMove(b, bpos)];
              const test2 = applyState(project, bucket.concat(helper).concat([addMove(item, pos)]));
              if (valid(test2)) {
                helper.forEach((m) => bucket.push(m));
                bucket.push(addMove(item, pos));
                return true;
              }
            }
          }
        }
      }
      if (label) rejected.push({ itemId: item.id, itemName: item.name, reasons: [label] });
      return false;
    };

    // جابه‌جایی‌های طرح پایه (بدون خرید)
    const baseMoves = [];
    const movable = items.filter((it) => !it.flat && it.status !== 'fixed');
    const ordered = movable.slice().sort((a, b) => {
      const ai = blockingIds.has(a.id) ? 0 : 1;
      const bi = blockingIds.has(b.id) ? 0 : 1;
      if (ai !== bi) return ai - bi;
      const ax = goalOrder.indexOf(a.id);
      const bx = goalOrder.indexOf(b.id);
      return (ax < 0 ? 99 : ax) - (bx < 0 ? 99 : bx);
    });

    ordered.forEach((it) => {
      const alreadyFree = !E.check(project).itemIssues(it.id).length;
      const relevant = blockingIds.has(it.id) || goal.primary === 'light';
      if (!relevant) return;
      const list = CANDIDATES[it.id] || [];
      if (!list.length) return;
      const changed = tryPlace(it, list, baseMoves);
      if (!changed && !alreadyFree) rejected.push({ itemId: it.id, itemName: it.name, reasons: ['جای جایگزین بدون تعارض پیدا نشد.'] });
    });

    // تلاش برای جابه‌جایی مبل کنار پنجره — دلیل رد شدن باید دیده شود
    const sofa = items.find((i) => i.cat === 'sofa' && i.status === 'free');
    if (sofa) {
      const sofaTest = applyState(project, baseMoves.concat([addMove(sofa, { x: 2.2, y: 0.06, rot: 0 })]));
      const wallIssue = sofaTest.conflicts.find((i) => i.code === 'wall');
      if (wallIssue) rejected.push({ itemId: sofa.id, itemName: 'جابه‌جایی مبل ' + E.describePlace(room, Object.assign({}, sofa, { x: 2.2, y: 0.06 })), reasons: [wallIssue.text] });
    }

    const planBase = E.check(project, {});
    const nameBase = function (moves) {
      if (goal.primary === 'traffic') return moves.length ? 'راه بازتر با ' + E.fa(moves.length) + ' جابه‌جایی' : 'همان چیدمان با تأیید اندازه';
      if (goal.primary === 'light') return 'نور بهتر بدون خرید';
      if (goal.primary === 'compact') return 'فضای بازتر بدون خرید';
      return moves.length ? 'چیدمان تازه با همان وسایل' : 'همان چیدمان با تأیید اندازه';
    };

    const schemeA = {
      id: 'A',
      title: nameBase(baseMoves),
      tag: 'بدون خرید',
      moves: baseMoves,
      buys: [],
      changes: [],
      rejected: rejected.slice(),
      blockers: blockers.slice(),
      cost: 0,
      score: (blockingIds.size ? 2 : 1) + (goal.primary === 'light' ? 0 : 1),
    };

    // ۲) طرح دوم: کمی جسورانه‌تر، با خرید محدود در سقف کاربر
    const movesB = baseMoves.map((m) => Object.assign({}, m));
    const buys = [];
    const canBuy = limits.purchaseCap == null ? 2 : limits.purchaseCap;
    const budget = limits.budget == null ? Infinity : limits.budget;

    if (canBuy > 0) {
      const curtain = items.find((i) => i.cat === 'curtain');
      const product = (K.Data.products || []).find((p) => p.cat === 'curtain');
      const curtainAllowed = !allowedCats.length || allowedCats.includes('curtain');
      if (curtain && product && curtainAllowed && product.price <= budget && buys.length < canBuy) {
        buys.push({
          id: 'buy-curtain', productId: product.id, itemId: curtain.id,
          title: 'پردهٔ کتان روشن', title2: product.name, price: product.price,
          note: 'پارچهٔ روشن‌تر نور پنجره را پخش می‌کند و رنگ دیوار را گرم نگه می‌دارد.',
          check: 'ok',
        });
      }
      // چراغ اگر جابه‌جایی‌اش رد شده باشد، خرید چراغ پیشنهاد می‌شود
      const lamp = items.find((i) => i.cat === 'light');
      const lampProduct = (K.Data.products || []).find((p) => p.cat === 'light');
      if (lamp && lampProduct && (!allowedCats.length || allowedCats.includes('light')) && lampProduct.price <= budget && buys.length < canBuy) {
        buys.push({
          id: 'buy-lamp', productId: lampProduct.id, itemId: lamp.id,
          title: 'چراغ پایه‌دار گوشهٔ نشیمن', title2: lampProduct.name, price: lampProduct.price,
          note: 'نور گرم کنار مبل، بدون تغییر چیدمان اصلی.',
          check: 'ok',
        });
      }
    }

    const schemeB = {
      id: 'B',
      title: buys.length ? (goal.primary === 'light' ? 'نور بیشتر با ' + E.fa(buys.length) + ' خرید' : 'راه بازتر و نور بهتر') : 'طرح دوم با تأیید اندازه',
      tag: buys.length ? 'با خرید محدود' : 'بدون خرید',
      moves: movesB,
      buys,
      changes: [],
      rejected: rejected.slice(),
      blockers: blockers.slice(),
      cost: buys.reduce((s, b) => s + b.price, 0),
      score: (goal.primary === 'light' ? 3 : 2),
    };

    [schemeA, schemeB].forEach((s) => {
      s.changes = buildChanges(project, s);
      s.metrics = metrics(project, s);
      s.reason = reasonFor(project, s);
    });

    const schemes = [schemeA, schemeB].sort((a, b) => b.score - a.score || a.moves.length - b.moves.length || a.cost - b.cost);
    return { schemes, rejected };
  };

  function buildChanges(project, scheme) {
    const out = [];
    scheme.moves.forEach((m) => {
      const item = project.items.find((i) => i.id === m.itemId);
      const target = Object.assign({}, item, m.to);
      out.push({
        id: 'ch-' + m.itemId,
        kind: 'move',
        itemId: m.itemId,
        itemName: m.itemName,
        title: m.itemName,
        action: 'جابه‌جایی',
        from: E.describePlace(project.room, item),
        to: E.describePlace(project.room, target),
        note: 'بدون خرید — ' + E.describePlace(project.room, item) + ' ← ' + E.describePlace(project.room, target),
        check: 'ok',
      });
    });
    scheme.buys.forEach((b) => {
      const p = (K.Data.products || []).find((x) => x.id === b.productId);
      out.push({
        id: b.id,
        kind: 'buy',
        itemId: b.itemId,
        itemName: b.title,
        title: b.title,
        action: 'خرید',
        from: '—',
        to: 'پنجرهٔ پذیرایی',
        note: b.note,
        product: p,
        check: 'ok',
      });
    });
    // اندازه‌های لازم برای همین تغییرها
    scheme.moves.forEach((m) => {
      const it = project.items.find((i) => i.id === m.itemId);
      if (it && it.meas !== 'measured') {
        out.push({
          id: 'ms-' + it.id,
          kind: 'measure',
          itemId: it.id,
          itemName: it.name,
          title: 'اندازهٔ ' + it.name,
          action: 'اندازه‌گیری',
          from: '—',
          to: 'همین جابه‌جایی',
          note: 'عرض و عمق ' + it.name + ' برای تأیید جا شدن لازم است.',
          check: 'need',
        });
      }
    });
    return out;
  }

  function metrics(project, scheme) {
    const ch = scheme.changes;
    return {
      moves: ch.filter((c) => c.kind === 'move').length,
      buys: ch.filter((c) => c.kind === 'buy').length,
      measures: ch.filter((c) => c.kind === 'measure').length,
    };
  }

  function reasonFor(project, scheme) {
    const m = scheme.metrics;
    const names = scheme.changes.filter((c) => c.kind === 'move').map((c) => c.title);
    if (m.moves && m.buys)
      return 'چیدمان را با ' + E.fa(m.moves) + ' جابه‌جایی تغییر می‌دهد' + (names.length ? ' (' + names.join('، ') + ')' : '') + ' و ' + E.fa(m.buys) + ' خرید دارد.';
    if (m.moves)
      return 'چیدمان را با ' + E.fa(m.moves) + ' جابه‌جایی تغییر می‌دهد' + (names.length ? ' (' + names.join('، ') + ')' : '') + '؛ خرید لازم ندارد.';
    if (m.buys) return 'بدون جابه‌جایی، ' + E.fa(m.buys) + ' خرید پیشنهاد می‌دهد تا هدف اصلی بهتر محقق شود.';
    if (m.measures) return 'چیدمان فعلی را تأیید می‌کند و ' + E.fa(m.measures) + ' اندازهٔ لازم را می‌گیرد.';
    return 'چیدمان فعلی با قیدها سازگار است و تغییر اجرایی لازم ندارد.';
  }

  /* ---------------- راهنمای اجرا ---------------- */
  E.buildGuide = function (project, scheme) {
    const tasks = [];
    const ov = {};
    scheme.moves.forEach((m) => (ov[m.itemId] = m.to));
    const full = E.check(project, ov);
    scheme.moves.forEach((m) => {
      const item = project.items.find((i) => i.id === m.itemId);
      const target = Object.assign({}, item, m.to);
      const issues = full.itemIssues(m.itemId);
      tasks.push({
        id: 't-move-' + m.itemId,
        kind: 'move',
        title: '«' + m.itemName + '» را به ' + E.describePlace(project.room, target) + ' ببر',
        detail: 'از ' + E.describePlace(project.room, item) + ' به ' + E.describePlace(project.room, target) + ' — بدون خرید',
        status: 'pending',
        check: issues.length ? 'conflict' : 'ok',
        issue: issues[0] ? issues[0].text : null,
      });
    });
    scheme.changes
      .filter((c) => c.kind === 'measure')
      .forEach((c) => {
        tasks.push({
          id: 't-ms-' + c.itemId,
          kind: 'measure',
          title: 'اندازهٔ ' + c.itemName + ' را ثبت کن',
          detail: c.note,
          status: 'pending',
          check: 'need',
        });
      });
    scheme.buys.forEach((b) => {
      const p = (K.Data.products || []).find((x) => x.id === b.productId);
      tasks.push({
        id: 't-buy-' + b.id,
        kind: 'buy',
        title: b.title,
        detail: p ? p.size + ' — ' + p.seller : '',
        status: 'pending',
        check: 'ok',
        product: p,
        price: b.price,
      });
    });
    return {
      schemeId: scheme.id,
      tasks,
      order: ['move', 'measure', 'buy'],
      totals: {
        moves: tasks.filter((t) => t.kind === 'move').length,
        measures: tasks.filter((t) => t.kind === 'measure').length,
        buys: tasks.filter((t) => t.kind === 'buy').length,
        cost: tasks.filter((t) => t.kind === 'buy').reduce((s, t) => s + (t.price || 0), 0),
      },
    };
  };

  /* ---------------- دسته‌بندی نتیجه ---------------- */
  E.summaryOf = function (scheme) {
    return E.fa(scheme.metrics.moves) + ' جابه‌جایی، ' + E.fa(scheme.metrics.buys) + ' خرید، ' + E.fa(scheme.metrics.measures) + ' اندازهٔ باقی‌مانده';
  };

  E.statusLabel = function (status) {
    return (
      {
        draft: 'پیش‌نویس',
        queued: 'در صف ساخت',
        building: 'در حال ساخت',
        review: 'در حال بررسی',
        ready: 'آماده',
        failed: 'ناموفق',
      }[status] || status
    );
  };
})(window);
