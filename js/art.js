/* خونه‌چین — دارایی‌های بصری تولیدشده با SVG
   لوگو، صحنهٔ پذیرایی (قابل بازسازی از وضعیت چیدمان) و پلان نمای بالا. */
(function (global) {
  const K = (global.K = global.K || {});
  const A = (K.Art = {});

  const C = {
    cream: '#F2ECE0',
    cream2: '#E7DDCB',
    green: '#285542',
    ink: '#24312B',
    leaf: '#4C6B4F',
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- لوگو: پلان مربع + مبل ال‌شکل ---------------- */
  A.logo = function (size, opts) {
    const o = opts || {};
    const s = size || 64;
    const bg = o.transparent ? 'none' : C.green;
    return `<svg width="${s}" height="${s}" viewBox="0 0 96 96" role="img" aria-label="نشان خونه‌چین" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="96" height="96" rx="${o.radius == null ? 24 : o.radius}" fill="${bg}"/>
      <g fill="none" stroke="${C.cream}" stroke-width="3.8" stroke-linecap="round">
        <path d="M24 79 L24 26 Q24 22.5 27.5 22.5 L68.5 22.5 Q72 22.5 72 26 L72 45"/>
        <path d="M72 60 L72 70.5 Q72 74 68.5 74 L66 74"/>
        <path d="M30 79 L57 79"/>
      </g>
      <path d="M72 47 q6.5 3.4 6.5 9" fill="none" stroke="${C.cream}" stroke-width="2.2" opacity=".65"/>
      <g fill="${C.cream}">
        <rect x="31" y="51" width="26" height="10.5" rx="5.2"/>
        <rect x="46" y="37" width="10.5" height="24" rx="5.2"/>
      </g>
      <circle cx="37.5" cy="44" r="2.1" fill="${C.cream}" opacity=".5"/>
    </svg>`;
  };

  A.logoMark = function (size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 96 96" aria-hidden="true">
      <g fill="none" stroke="${C.green}" stroke-width="4.4" stroke-linecap="round">
        <path d="M24 79 L24 26 Q24 22.5 27.5 22.5 L68.5 22.5 Q72 22.5 72 26 L72 45"/>
        <path d="M72 60 L72 70.5 Q72 74 68.5 74 L66 74"/>
        <path d="M30 79 L57 79"/>
      </g>
      <g fill="${C.green}">
        <rect x="31" y="51" width="26" height="10.5" rx="5.2"/>
        <rect x="46" y="37" width="10.5" height="24" rx="5.2"/>
      </g>
    </svg>`;
  };

  /* ---------------- صحنهٔ پذیرایی: ۴:۳ ---------------- */
  function mapX(x, roomW) {
    return 40 + (x / roomW) * 720;
  }

  A.scene = function (opts) {
    const o = opts || {};
    const uid = o.uid || 'sc' + Math.random().toString(36).slice(2, 7);
    const roomW = o.roomW || 4.2;
    const roomD = o.roomD || 3.4;
    const items = o.items || [];
    const get = (cat) => items.find((i) => i.cat === cat);
    const sofa = get('sofa');
    const chair = get('chair');
    const rug = get('rug');
    const plant = get('plant');
    const lamp = get('light');
    const curtainItem = get('curtain');
    const curtainLight = o.curtainLight !== false;
    const warm = o.light == null ? 1 : o.light;

    const depthT = (it) => (it ? clamp((it.y + (it.dep || 0) / 200) / roomD, 0, 1) : 0.6);
    const sofaCx = sofa ? clamp(mapX(sofa.x + sofa.len / 200, roomW), 190, 610) : 400;
    const chairCx = chair ? clamp(mapX(chair.x + chair.len / 200, roomW), 80, 730) : 640;
    const plantCx = plant ? clamp(mapX(plant.x + plant.len / 200, roomW), 70, 745) : 700;
    const lampCx = lamp ? clamp(mapX(lamp.x + lamp.len / 200, roomW), 70, 745) : 120;
    const rugCx = rug ? clamp(mapX(rug.x + rug.len / 200, roomW), 240, 560) : 400;

    const sSofa = (sofa ? clamp(sofa.len / 210, 0.7, 1.15) : 1) * (0.9 + depthT(sofa) * 0.1);
    const sChair = 0.86 + depthT(chair) * 0.2;
    const sPlant = 0.82 + depthT(plant) * 0.24;
    const sLamp = 0.88 + depthT(lamp) * 0.14;
    const chairBase = 470 + depthT(chair) * 90;
    const plantBase = 466 + depthT(plant) * 92;
    const lampBase = 452 + depthT(lamp) * 78;

    const curtain = curtainLight ? '#F2E6CF' : '#A57E58';
    const curtainHi = curtainLight ? '#FDF7EA' : '#C09F79';
    const curtainLo = curtainLight ? '#DDCBA8' : '#7C5A3B';
    const rugMotif = rug ? '#9E3B2E' : '#9E3B2E';

    return `<svg viewBox="0 0 800 600" width="800" height="600" class="scene-svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="نمای پذیرایی">
      <defs>
        <linearGradient id="${uid}-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#F4ECDD"/><stop offset="1" stop-color="#E4D7C1"/>
        </linearGradient>
        <linearGradient id="${uid}-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#C6AB86"/><stop offset="1" stop-color="#A4835E"/>
        </linearGradient>
        <linearGradient id="${uid}-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFDF5"/><stop offset="1" stop-color="#F3E7CD"/>
        </linearGradient>
        <linearGradient id="${uid}-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFF6E0" stop-opacity=".62"/><stop offset="1" stop-color="#FFF6E0" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${uid}-curt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${curtainLo}"/><stop offset=".35" stop-color="${curtainHi}"/>
          <stop offset=".7" stop-color="${curtain}"/><stop offset="1" stop-color="${curtainLo}"/>
        </linearGradient>
        <radialGradient id="${uid}-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#FFEFC6" stop-opacity=".85"/><stop offset="1" stop-color="#FFEFC6" stop-opacity="0"/>
        </radialGradient>
        <pattern id="${uid}-rug" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="${rugMotif}"/>
          <path d="M18 4 L32 18 L18 32 L4 18 Z" fill="none" stroke="#EBD3AE" stroke-width="1.7" opacity=".9"/>
          <rect x="15" y="15" width="6" height="6" fill="#285542" opacity=".8"/>
          <path d="M0 0 L5 5 M36 0 L31 5 M0 36 L5 31 M36 36 L31 31" stroke="#EBD3AE" stroke-width="1" opacity=".45"/>
        </pattern>
      </defs>

      <rect width="800" height="600" fill="url(#${uid}-wall)"/>

      <!-- قاب تصویر -->
      <g>
        <rect x="78" y="106" width="104" height="126" rx="4" fill="#F7F1E4" stroke="#BBA487" stroke-width="4"/>
        <path d="M94 214 L118 172 L138 200 L152 178 L166 214 Z" fill="#8FA28F"/>
        <circle cx="146" cy="136" r="11" fill="#D8B24A"/>
        <path d="M92 200 q30 -18 58 -6" fill="none" stroke="#C9B79B" stroke-width="2"/>
      </g>

      <!-- پنجره -->
      <g>
        <rect x="244" y="64" width="312" height="242" rx="5" fill="#D8CBB3"/>
        <rect x="252" y="72" width="296" height="226" fill="url(#${uid}-win)"/>
        <path d="M252 236 Q 300 196 350 232 T 450 224 T 548 238 L548 298 L252 298 Z" fill="#DCE6D6" opacity=".8"/>
        <path d="M252 254 Q 320 226 386 252 T 548 246" fill="none" stroke="#B9C9B2" stroke-width="3" opacity=".55"/>
        <g fill="none" stroke="#FAF4E8" stroke-width="7">
          <rect x="256" y="76" width="288" height="218" rx="2"/>
          <path d="M400 76 L400 294 M256 186 L544 186"/>
        </g>
        <rect x="234" y="298" width="332" height="13" rx="4" fill="#E7DBC4"/>
      </g>

      <!-- پرده -->
      <g>
        <rect x="192" y="42" width="416" height="9" rx="4" fill="#7B6752"/>
        <circle cx="192" cy="46.5" r="7" fill="#6F5B47"/>
        <circle cx="608" cy="46.5" r="7" fill="#6F5B47"/>
        <path d="M204 50 L272 50 L266 372 Q 240 386 206 372 Z" fill="url(#${uid}-curt)"/>
        <path d="M222 54 q-4 150 0 314 M244 54 q4 150 0 314" stroke="${curtainLo}" stroke-width="2" fill="none" opacity=".55"/>
        <path d="M596 50 L528 50 L534 372 Q 560 386 594 372 Z" fill="url(#${uid}-curt)"/>
        <path d="M578 54 q4 150 0 314 M556 54 q-4 150 0 314" stroke="${curtainLo}" stroke-width="2" fill="none" opacity=".55"/>
      </g>

      <!-- نور روی کف -->
      <path d="M268 312 L532 312 L628 592 L176 592 Z" fill="url(#${uid}-shaft)"/>

      <!-- کف -->
      <rect x="0" y="392" width="800" height="208" fill="url(#${uid}-floor)"/>
      <rect x="0" y="386" width="800" height="9" fill="#DCD0BA"/>
      <g opacity=".2" stroke="#6F513C" stroke-width="1.4">
        <path d="M0 418 L800 420 M0 448 L800 451 M0 486 L800 490 M0 532 L800 537 M0 578 L800 584"/>
        <path d="M140 392 L96 600 M320 392 L304 600 M490 392 L500 600 M660 392 L700 600"/>
      </g>

      <!-- فرش -->
      <g>
        <path d="M ${rugCx - 232} 452 L ${rugCx + 232} 452 L ${rugCx + 288} 586 L ${rugCx - 288} 586 Z" fill="url(#${uid}-rug)"/>
        <path d="M ${rugCx - 232} 452 L ${rugCx + 232} 452 L ${rugCx + 288} 586 L ${rugCx - 288} 586 Z" fill="none" stroke="#EBD3AE" stroke-width="5"/>
        <path d="M ${rugCx - 208} 464 L ${rugCx + 208} 464 L ${rugCx + 256} 574 L ${rugCx - 256} 574 Z" fill="none" stroke="#EBD3AE" stroke-width="2.2" opacity=".85"/>
      </g>

      <!-- مبل -->
      <g transform="translate(${sofaCx} 470) scale(${sSofa})">
        <ellipse cx="0" cy="8" rx="168" ry="15" fill="#6F513C" opacity=".22"/>
        <rect x="-142" y="-118" width="284" height="90" rx="15" fill="#7C5B44"/>
        <rect x="-126" y="-108" width="116" height="58" rx="10" fill="#8C6A51"/>
        <rect x="10" y="-108" width="116" height="58" rx="10" fill="#8C6A51"/>
        <rect x="-134" y="-40" width="268" height="50" rx="11" fill="#957157"/>
        <rect x="-122" y="-34" width="112" height="34" rx="8" fill="#A6805F"/>
        <rect x="10" y="-34" width="112" height="34" rx="8" fill="#A6805F"/>
        <rect x="-158" y="-112" width="26" height="118" rx="12" fill="#6F513C"/>
        <rect x="132" y="-112" width="26" height="118" rx="12" fill="#6F513C"/>
        <rect x="-138" y="6" width="14" height="12" rx="4" fill="#5C4331"/>
        <rect x="124" y="6" width="14" height="12" rx="4" fill="#5C4331"/>
        <g fill="#E4D6BF">
          <rect x="-108" y="-112" width="44" height="36" rx="10" transform="rotate(-7 -108 -112)"/>
          <rect x="52" y="-110" width="44" height="36" rx="10" transform="rotate(6 52 -110)"/>
        </g>
      </g>

      <!-- صندلی -->
      <g transform="translate(${chairCx} ${chairBase}) scale(${sChair})">
        <ellipse cx="0" cy="6" rx="62" ry="11" fill="#6F513C" opacity=".2"/>
        <rect x="-60" y="-104" width="120" height="68" rx="17" fill="#71806E"/>
        <rect x="-52" y="-96" width="104" height="40" rx="12" fill="#83917F"/>
        <rect x="-52" y="-44" width="104" height="46" rx="13" fill="#7C8B7A"/>
        <rect x="-44" y="-38" width="88" height="32" rx="10" fill="#8E9C86"/>
        <rect x="-68" y="-96" width="14" height="88" rx="7" fill="#687767"/>
        <rect x="54" y="-96" width="14" height="88" rx="7" fill="#687767"/>
        <rect x="-40" y="0" width="10" height="10" rx="3" fill="#5C4331"/>
        <rect x="30" y="0" width="10" height="10" rx="3" fill="#5C4331"/>
      </g>

      <!-- گلدان -->
      <g transform="translate(${plantCx} ${plantBase}) scale(${sPlant})">
        <ellipse cx="0" cy="4" rx="36" ry="9" fill="#6F513C" opacity=".2"/>
        <path d="M-24 -44 L24 -44 L17 2 L-17 2 Z" fill="#B9754E"/>
        <path d="M-24 -44 L24 -44 L22.5 -32 L-22.5 -32 Z" fill="#C98763"/>
        <g fill="${C.leaf}">
          <path d="M-2 -46 C -14 -96 -44 -120 -52 -156 C -18 -146 -2 -104 4 -46 Z"/>
          <path d="M2 -46 C 16 -104 46 -128 60 -164 C 30 -150 10 -108 6 -46 Z" opacity=".92"/>
          <path d="M0 -46 C -2 -100 10 -134 4 -170 C -14 -132 -10 -92 0 -46 Z" opacity=".78" fill="#5A7A5D"/>
          <path d="M-2 -46 C -24 -80 -40 -88 -58 -96 C -40 -72 -20 -62 -2 -46 Z" opacity=".7"/>
        </g>
      </g>

      <!-- چراغ -->
      <g transform="translate(${lampCx} ${lampBase}) scale(${sLamp})">
        <ellipse cx="0" cy="4" rx="28" ry="7" fill="#6F513C" opacity=".2"/>
        <circle cx="0" cy="-150" r="66" fill="url(#${uid}-glow)" opacity="${0.35 + clamp(warm, 0.6, 1.2) * 0.28}"/>
        <rect x="-2.6" y="-146" width="5.2" height="148" fill="#6F513C"/>
        <path d="M-20 -146 L20 -146 L30 -190 L-30 -190 Z" fill="#F1E5CB"/>
        <path d="M-20 -146 L20 -146 L24 -160 L-24 -160 Z" fill="#DFC37F" opacity=".65"/>
        <ellipse cx="0" cy="-146" rx="21" ry="4" fill="#D8B24A" opacity=".5"/>
      </g>

      <!-- جای پیشنهادی (برای نمای قبل) -->
      ${(o.targets || [])
        .filter((g) => {
          const cx = mapX(g.x + (g.len || 80) / 200, roomW);
          const from = mapX((g._fromX == null ? g.x : g._fromX) + (g.len || 80) / 200, roomW);
          return Math.abs(cx - from) > 90;
        })
        .map((g) => {
          const cx = clamp(mapX(g.x + (g.len || 80) / 200, roomW), 70, 740);
          const base = 462 + depthT(g) * 96;
          const w = Math.max(70, (g.len || 80) * 0.95);
          const h = Math.max(80, (g.dep || 80) * 1.15);
          return `<g opacity=".95">
            <rect x="${cx - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="14" fill="rgba(40,85,66,.1)" stroke="#FBF8F2" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round" opacity=".5"/>
            <rect x="${cx - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="14" fill="none" stroke="#285542" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>
            <text x="${cx}" y="${base - h - 10}" text-anchor="middle" font-size="12.5" fill="#FBF8F2" font-family="Vazirmatn,Tahoma,sans-serif" style="paint-order:stroke;stroke:#285542;stroke-width:3.5px;stroke-linejoin:round">جای پیشنهادی</text>
          </g>`;
        })
        .join('')}
      <!-- سایهٔ لبه و گرمی -->
      ${(o.ghosts || [])
        .map((g) => {
          const cx = clamp(mapX(g.x + (g.len || 80) / 200, roomW), 70, 740);
          const base = 462 + depthT(g) * 96;
          const w = Math.max(70, (g.len || 80) * 0.95);
          const h = Math.max(80, (g.dep || 80) * 1.15);
          return `<g opacity=".95">
            <rect x="${cx - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="14" fill="rgba(251,248,242,.1)" stroke="#FBF8F2" stroke-width="5" stroke-dasharray="9 7" opacity=".55"/>
            <rect x="${cx - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="14" fill="none" stroke="#285542" stroke-width="2.2" stroke-dasharray="9 7"/>
            <text x="${cx}" y="${base - h - 10}" text-anchor="middle" font-size="12.5" fill="#FBF8F2" font-family="Vazirmatn,Tahoma,sans-serif" style="paint-order:stroke;stroke:#3B4A42;stroke-width:3.5px;stroke-linejoin:round">جای قبلی</text>
          </g>`;
        })
        .join('')}
      <rect x="0" y="0" width="800" height="600" fill="#3A2C1E" opacity="${clamp((1.02 - warm) * 0.9, 0, 0.2)}"/>
      <rect x="0" y="560" width="800" height="40" fill="#4A3626" opacity=".2"/>
    </svg>`;
  };

  /* ---------------- پلان نمای بالا ---------------- */
  A.plan = function (project, opts) {
    const o = opts || {};
    const room = project.room;
    const S = o.scale || 100;
    const pad = 34;
    const W = room.w * S + pad * 2;
    const H = room.d * S + pad * 2;
    const uid = o.uid || 'pl' + Math.random().toString(36).slice(2, 6);
    const selected = o.selected || null;
    const issues = o.issues || [];
    const X = (m) => pad + m * S;
    const Y = (m) => pad + m * S;
    const nWall = room.walls.n || {};
    const bal = (room.walls.w || {}).balcony;
    const tv = (room.walls.s || {}).tv;
    const issueIds = new Set(issues.filter((i) => i.severity === 'conflict').map((i) => i.itemId));

    let out = `<svg viewBox="0 0 ${W} ${H}" class="plan-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="پلان پذیرایی">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#FBF8F1"/>
      <rect x="${X(0)}" y="${Y(0)}" width="${room.w * S}" height="${room.d * S}" fill="#F4EEE2"/>`;

    if (room.route) {
      out += `<rect x="${X(room.route.x1)}" y="${Y(room.route.y1)}" width="${(room.route.x2 - room.route.x1) * S}" height="${(room.route.y2 - room.route.y1) * S}" fill="#285542" fill-opacity=".07" stroke="#285542" stroke-dasharray="6 5" stroke-width="1.4"/>`;
    }

    out += `<g opacity=".25" stroke="#B9A184" stroke-width="1">`;
    for (let i = 0.5; i < room.w; i += 0.5) out += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(room.d)}"/>`;
    out += `</g>`;

    out += `<g stroke="#24312B" stroke-width="3.4" fill="none" stroke-linecap="square">`;
    out += `<path d="M${X(0)} ${Y(0)} L${X(room.w)} ${Y(0)} L${X(room.w)} ${Y(room.d)} L${X(0)} ${Y(room.d)} Z"/>`;
    out += `</g>`;

    if (nWall.window) {
      const a = nWall.window.x1;
      const b = nWall.window.x2;
      out += `<g>
        <rect x="${X(a)}" y="${Y(0) - 7}" width="${(b - a) * S}" height="14" fill="#FBF8F1"/>
        <line x1="${X(a)}" y1="${Y(0) - 4}" x2="${X(b)}" y2="${Y(0) - 4}" stroke="#4E7A8A" stroke-width="2.4"/>
        <line x1="${X(a)}" y1="${Y(0) + 4}" x2="${X(b)}" y2="${Y(0) + 4}" stroke="#4E7A8A" stroke-width="2.4"/>
        <line x1="${X(a)}" y1="${Y(0) - 6}" x2="${X(a)}" y2="${Y(0) + 6}" stroke="#4E7A8A" stroke-width="2"/>
        <line x1="${X(b)}" y1="${Y(0) - 6}" x2="${X(b)}" y2="${Y(0) + 6}" stroke="#4E7A8A" stroke-width="2"/>
      </g>`;
    }

    if (tv) {
      out += `<rect x="${X(tv.x1)}" y="${Y(room.d) - 8}" width="${(tv.x2 - tv.x1) * S}" height="6" rx="2" fill="#6F513C"/>`;
    }

    if (bal) {
      out += `<g>
        <rect x="${X(0) - 7}" y="${Y(bal.y1)}" width="14" height="${(bal.y2 - bal.y1) * S}" fill="#FBF8F1"/>
        <line x1="${X(0)}" y1="${Y(bal.y1)}" x2="${X(0)}" y2="${Y(bal.y2)}" stroke="#FBF8F1" stroke-width="4"/>
        <path d="M${X(0)} ${Y(bal.y2)} A${(bal.y2 - bal.y1) * S} ${(bal.y2 - bal.y1) * S} 0 0 1 ${X(bal.swing || 0.9)} ${Y(bal.y1)}" fill="none" stroke="#A44232" stroke-width="1.6" stroke-dasharray="4 4"/>
        <line x1="${X(0)}" y1="${Y(bal.y2)}" x2="${X(bal.swing || 0.9)}" y2="${Y(bal.y2)}" stroke="#24312B" stroke-width="2.6"/>
        <text x="${X(0.66)}" y="${Y(bal.y2) + 15}" font-size="9" fill="#A44232" font-family="Vazirmatn,Tahoma,sans-serif">درِ بالکن</text>
      </g>`;
    }

    const order = project.items.slice().sort((a, b) => (a.flat ? -1 : 0) - (b.flat ? -1 : 0));
    order.forEach((it) => {
      const r = K.Engine.rect(it);
      const x = X(r.x);
      const y = Y(r.y);
      const w = r.w * S;
      const h = r.d * S;
      const isSel = selected === it.id;
      const bad = issueIds.has(it.id);
      const locked = it.status === 'fixed';
      const fill = it.flat ? 'none' : it.color || '#8C6B52';
      out += `<g class="plan-item${isSel ? ' is-selected' : ''}" data-item="${it.id}" tabindex="0" role="button" aria-label="${it.name}${locked ? '، جای ثابت' : ''}">`;
      if (it.flat) {
        out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${it.cat === 'rug' ? '#A44232' : '#C9B79B'}" fill-opacity=".2" stroke="${it.cat === 'rug' ? '#A44232' : '#A08B6D'}" stroke-width="1.2"/>`;
      } else {
        out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${it.round ? Math.min(w, h) / 2 : 9}" fill="${fill}" stroke="${bad ? '#A44232' : isSel ? '#285542' : '#3B4A42'}" stroke-width="${isSel || bad ? 3 : 1.4}"/>`;
        if (it.cat === 'sofa') {
          out += `<rect x="${x + w * 0.08}" y="${y + h * 0.14}" width="${w * 0.84}" height="${h * 0.26}" rx="5" fill="#fff" opacity=".22"/>`;
        }
      }
      if (locked) {
        out += `<g transform="translate(${x + w - 12} ${y + 12})"><rect x="-6" y="-2" width="12" height="10" rx="2" fill="#FBF8F1" stroke="#24312B" stroke-width="1.2"/><path d="M-3 -2 v-3 a3 3 0 0 1 6 0 v3" fill="none" stroke="#24312B" stroke-width="1.2"/></g>`;
      }
      if (isSel) {
        out += `<rect x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}" rx="12" fill="none" stroke="#285542" stroke-width="1.6" stroke-dasharray="5 4"/>`;
      }
      out += `</g>`;
      if (!it.flat && w > 52) {
        out += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="11" fill="#FBF8F1" font-family="Vazirmatn,Tahoma,sans-serif" style="pointer-events:none">${it.name.length > 13 ? it.name.slice(0, 13) + '…' : it.name}</text>`;
      }
    });

    (room.constraints || []).forEach((c) => {
      if (c.wall !== 'n') return;
      const y = Y(0) - 22;
      out += `<g stroke="#285542" stroke-width="1.2">
        <line x1="${X(c.from)}" y1="${Y(0)}" x2="${X(c.from)}" y2="${y - 6}"/>
        <line x1="${X(c.to)}" y1="${Y(0)}" x2="${X(c.to)}" y2="${y - 6}"/>
        <line x1="${X(c.from)}" y1="${y}" x2="${X(c.to)}" y2="${y}"/>
        <line x1="${X(c.from)}" y1="${y - 4}" x2="${X(c.from)}" y2="${y + 4}"/>
        <line x1="${X(c.to)}" y1="${y - 4}" x2="${X(c.to)}" y2="${y + 4}"/>
      </g>
      <text x="${X((c.from + c.to) / 2)}" y="${y - 7}" text-anchor="middle" font-size="10.5" fill="#285542" font-family="Vazirmatn,Tahoma,sans-serif">عرض آزاد ${K.Engine.fa(Math.round((c.to - c.from) * 100))}</text>`;
    });

    out += `<g stroke="#8A9A90" stroke-width="1" opacity=".7">
      <line x1="${X(0) - 16}" y1="${Y(0)}" x2="${X(0) - 16}" y2="${Y(room.d)}"/>
      <line x1="${X(0) - 20}" y1="${Y(0)}" x2="${X(0) - 12}" y2="${Y(0)}"/>
      <line x1="${X(0) - 20}" y1="${Y(room.d)}" x2="${X(0) - 12}" y2="${Y(room.d)}"/>
    </g>
    <text x="${X(0) - 22}" y="${Y(room.d / 2)}" text-anchor="middle" font-size="9" fill="#8A9A90" transform="rotate(-90 ${X(0) - 22} ${Y(room.d / 2)})">${K.Engine.fa((room.d * 100).toFixed(0))} cm</text>
    <text x="${X(room.w / 2)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#8A9A90">${K.Engine.fa((room.w * 100).toFixed(0))} cm</text>
    <text x="${W - 46}" y="${H - 8}" font-size="9" fill="#8A9A90" font-family="Vazirmatn,Tahoma,sans-serif">پلان از بالا</text>`;

    out += `</svg>`;
    return out;
  };

  A.roomThumb = function (project, scheme) {
    const applied = K.Engine.placements(project, A.schemeOverrides(scheme));
    return A.scene({
      roomW: project.room.w,
      roomD: project.room.d,
      items: applied,
      curtainLight: !!scheme.buys.find((b) => b.productId === 'p-curtain'),
      light: scheme.buys.length ? 1.08 : 0.92,
      uid: 'th' + scheme.id,
    });
  };

  function schemeOverrides(scheme) {
    const o = {};
    (scheme.moves || []).forEach((m) => (o[m.itemId] = m.to));
    return o;
  }
  A.schemeOverrides = schemeOverrides;

  /* آیکون‌های خطی ساده */
  A.icon = function (name, size) {
    const s = size || 22;
    const p = {
      path: '<path d="M4 18 L4 8 M20 18 L20 8 M4 13 q8 -6 16 0" />',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
      people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15 20c0-2.5 2-4 4-4"/>',
      compact: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><path d="M14 17h6M17 14v6"/>',
      spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
      sofa: '<path d="M5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 12h18v6H3z"/><path d="M3 18v2M21 18v2"/>',
      mix: '<circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="M8 12v4h4"/>',
      back: '<path d="M9 5l7 7-7 7"/>',
      next: '<path d="M15 5l-7 7 7 7"/>',
      camera: '<path d="M3 8h3l2-2h8l2 2h3v11H3z"/><circle cx="12" cy="13" r="3.4"/>',
      gallery: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
      menu: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
      lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      check: '<path d="M4 12l5 5L20 6"/>',
      edit: '<path d="M4 20h4l10-10-4-4L4 16z"/>',
      ruler: '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
      home: '<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
      grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
      user: '<circle cx="12" cy="8" r="3.6"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
      share: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
      close: '<path d="M6 6l12 12M18 6L6 18"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      rotate: '<path d="M4 12a8 8 0 1 1 3 6.2"/><path d="M3 7v5h5"/>',
      trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
      cart: '<path d="M3 5h2l2.4 10h10L20 8H6"/><circle cx="9" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/>',
    }[name];
    return `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p || ''}</svg>`;
  };
})(window);
