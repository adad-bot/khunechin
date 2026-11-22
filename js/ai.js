/* خونه‌چین — اتصال به مدل تصویر
   بدون کلید کار نمی‌کند؛ کلید در همین گوشی ذخیره می‌شود و جایی جز سرویس انتخاب‌شده نمی‌رود. */
(function (global) {
  const K = (global.K = global.K || {});
  const AI = (K.AI = {});
  const KEY = 'khunechin.ai.v1';

  AI.providers = [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      model: 'google/gemini-2.5-flash-image',
      hint: 'بدون VPN · هر تصویر چند سنت',
      url: 'https://openrouter.ai/keys',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      model: 'gemini-2.5-flash-image',
      hint: 'رایگان ولی از ایران بدون VPN بسته است',
      url: 'https://aistudio.google.com/apikey',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      model: 'gpt-image-1',
      hint: 'کلید از platform.openai.com (پرداختی)',
      url: 'https://platform.openai.com/api-keys',
    },
  ];

  const clone = (x) => JSON.parse(JSON.stringify(x));

  AI.config = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { provider: 'gemini', key: '', model: '' };
  };

  AI.setConfig = function (cfg) {
    const cur = AI.config();
    const next = Object.assign({}, cur, cfg);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  };

  AI.clear = function () {
    localStorage.removeItem(KEY);
  };

  AI.ready = function () {
    const c = AI.config();
    return !!(c.key && c.provider);
  };

  AI.provider = function () {
    const c = AI.config();
    return AI.providers.find((p) => p.id === c.provider) || AI.providers[0];
  };

  const CAT_EN = {
    sofa: 'three-seater sofa',
    rug: 'persian rug',
    tv: 'TV console',
    curtain: 'window curtains',
    chair: 'single armchair',
    light: 'floor lamp',
    decor: 'plant pot',
  };

  /** متن دستور برای مدل: چه چیزی بماند، چه چیزی عوض شود، هدف و سلیقه. */
  AI.buildPrompt = function (project, extra) {
    const D = K.Data;
    const goal = (D.goals.find((g) => g.id === (project.goal || {}).primary) || {}).label || '';
    const taste = (D.tastes.find((t) => t.id === (project.taste || {}).preset) || {}).label || '';
    const keep = project.items.filter((i) => i.status !== 'free').map((i) => CAT_EN[i.cat] || i.name);
    const free = project.items.filter((i) => i.status === 'free').map((i) => CAT_EN[i.cat] || i.name);
    const lines = [
      'Edit the attached photo of a real living room. Keep the same room, same camera angle, same walls, window, balcony door and floor.',
      'Keep these exactly as they are: ' + (keep.join(', ') || 'the architecture and fixed items') + '.',
      free.length ? 'These may be moved, replaced or restyled: ' + free.join(', ') + '.' : '',
      'Design goal: ' + (goal || 'a calmer, brighter room') + '.',
      taste ? 'Preferred style: ' + taste + '.' : '',
      (project.goal || {}).text ? 'User request (translate and follow): ' + project.goal.text : '',
      extra ? 'Additional instruction: ' + extra : '',
      'Make it photorealistic and believable, same framing and lighting direction as the original, no text, no watermark, no people.',
    ];
    return lines.filter(Boolean).join('\n');
  };

  function toBase64(dataUrl) {
    const i = dataUrl.indexOf(',');
    return dataUrl.slice(i + 1);
  }
  function mimeOf(dataUrl) {
    const m = /^data:([^;]+);base64,/.exec(dataUrl);
    return m ? m[1] : 'image/jpeg';
  }

  async function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'timeout' })), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  /** کوچک‌کردن تصویر خروجی تا در حافظهٔ گوشی جا شود */
  AI.shrink = function (dataUrl, max, quality) {
    const limit = max || 1100;
    const q = quality || 0.85;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, limit / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try {
          resolve(c.toDataURL('image/jpeg', q));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  /** آزمون کلید بدون مصرف سهمیهٔ تصویر */
  AI.testKey = async function () {
    const c = AI.config();
    if (!c.key) throw new Error('کلید خالی است');
    if (c.provider === 'openrouter') {
      const r = await fetch('https://openrouter.ai/api/v1/key', { headers: { Authorization: 'Bearer ' + c.key } });
      const txt = await r.text();
      if (!r.ok) throw new Error(r.status + ' ' + txt.slice(0, 160));
      const j = JSON.parse(txt).data || {};
      return { ok: true, models: 0, credit: j.limit_remaining != null ? j.limit_remaining : null };
    }
    if (c.provider === 'gemini') {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(c.key));
      const txt = await r.text();
      if (!r.ok) throw new Error(r.status + ' ' + txt.slice(0, 160));
      const j = JSON.parse(txt);
      const hasImage = (j.models || []).some((m) => /image/i.test(m.name || ''));
      return { ok: true, models: (j.models || []).length, imageModel: hasImage };
    }
    const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + c.key } });
    const txt = await r.text();
    if (!r.ok) throw new Error(r.status + ' ' + txt.slice(0, 160));
    return { ok: true, models: (JSON.parse(txt).data || []).length };
  };

  AI.errorText = function (e) {
    const msg = String((e && e.message) || e);
    if (/blocked/.test(msg) || (e && e.code === 'blocked'))
      return 'این سرویس از شبکهٔ فعلی در دسترس نیست (فیلتر). VPN را روشن کن یا سرویس دیگری انتخاب کن.';
    if (e && e.code === 'timeout') return 'سرویس تصویر جواب نداد (بیش از ۳ دقیقه). دوباره تلاش کن.';
    if (/401|403|API key|permission|unauthor/i.test(msg)) return 'کلید معتبر نیست یا دسترسی تصویر ندارد.';
    if (/429|quota|rate/i.test(msg)) return 'سهمیهٔ این کلید تمام شده است. کمی بعد یا با کلید دیگر امتحان کن.';
    if (/safety|blocked|policy/i.test(msg)) return 'سرویس، این تصویر یا درخواست را نپذیرفت. عکس یا توضیح را عوض کن.';
    if (/network|fetch|Failed/i.test(msg)) return 'اتصال به سرویس برقرار نشد. اینترنت را بررسی کن.';
    return 'تولید تصویر انجام نشد: ' + msg.slice(0, 120);
  };

  /** اگر پروژه عکس واقعی ندارد، صحنهٔ نمونه را به تصویر تبدیل می‌کند تا مدل چیزی برای ویرایش داشته باشد */
  function sceneToPhoto(project) {
    return new Promise((resolve, reject) => {
      const svg = K.Art.scene({
        roomW: project.room.w,
        roomD: project.room.d,
        items: project.items,
        light: 0.95,
        uid: 'aiscene' + Date.now().toString(36),
      });
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 768;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#F7F4ED';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('عکس اصلی برای ویرایش آماده نشد.'));
      };
      img.src = url;
    });
  }

  AI.scenePhoto = sceneToPhoto;

  /** ساخت تصویر تازه از عکس اتاق. ورودی و خروجی dataURL. */
  AI.generate = async function (project, opts) {
    const o = opts || {};
    const cfg = AI.config();
    if (!cfg.key) throw Object.assign(new Error('no key'), { code: 'nokey' });
    const prompt = o.prompt || AI.buildPrompt(project, o.extra);
    const main = (project.photos || []).find((p) => p.kind === 'main') || {};
    let before = o.image || main.dataUrl;
    if (!before) before = await sceneToPhoto(project);

    if (cfg.provider === 'openai') return generateOpenAI(cfg, prompt, before);
    if (cfg.provider === 'openrouter') return generateOpenRouter(cfg, prompt, before);
    return generateGemini(cfg, prompt, before);
  };

  async function generateOpenRouter(cfg, prompt, before) {
    const model = cfg.model || 'google/gemini-2.5-flash-image';
    const res = await withTimeout(
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + cfg.key,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://khunechin.app',
          'X-Title': 'Khunechin',
        },
        body: JSON.stringify({
          model,
          modalities: ['image', 'text'],
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: before } },
              ],
            },
          ],
        }),
      }),
      180000
    );
    const text = await res.text();
    if (!res.ok) {
      if (/^\s*</.test(text)) throw new Error('blocked');
      throw new Error(res.status + ' ' + text.slice(0, 200));
    }
    const json = JSON.parse(text);
    const msg = ((json.choices || [])[0] || {}).message || {};
    let url = null;
    if (Array.isArray(msg.images) && msg.images.length) {
      const im = msg.images[0];
      url = (im.image_url && im.image_url.url) || im.url || (typeof im === 'string' ? im : null);
    }
    if (!url && Array.isArray(msg.content)) {
      const part = msg.content.find((p) => p && (p.type === 'image_url' || p.image_url));
      url = part && (part.image_url ? part.image_url.url || part.image_url : part.url);
    }
    if (!url) {
      const said = typeof msg.content === 'string' ? msg.content : (json.error && json.error.message) || '';
      throw new Error(said.slice(0, 160) || 'تصویری در پاسخ نبود.');
    }
    return url;
  }

  async function generateGemini(cfg, prompt, before) {
    const model = cfg.model || 'gemini-2.5-flash-image';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(cfg.key);
    const base = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }, { inline_data: { mime_type: mimeOf(before), data: toBase64(before) } }],
        },
      ],
    };

    async function call(body) {
      const res = await withTimeout(
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
        180000
      );
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    }

    let r = await call(base);
    if (!r.ok) {
      if (/^\s*</.test(r.text)) throw new Error('blocked');
      const e = new Error('HTTP ' + r.status + ' · ' + r.text.slice(0, 300));
      e.raw = 'HTTP ' + r.status + '\n' + r.text.slice(0, 800);
      throw e;
    }
    let json = JSON.parse(r.text);
    let parts = (((json.candidates || [])[0] || {}).content || {}).parts || [];
    let img = parts.map((p) => p.inlineData || p.inline_data).find((x) => x && x.data);

    if (!img) {
      // اگر تصویری برنگشت، یک بار با تنظیم حالت خروجی دوباره امتحان کن
      r = await call(Object.assign({}, base, { generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }));
      if (!r.ok) {
        if (/^\s*</.test(r.text)) throw new Error('blocked');
        const e = new Error('HTTP ' + r.status + ' · ' + r.text.slice(0, 300));
        e.raw = 'HTTP ' + r.status + '\n' + r.text.slice(0, 800);
        throw e;
      }
      json = JSON.parse(r.text);
      parts = (((json.candidates || [])[0] || {}).content || {}).parts || [];
      img = parts.map((p) => p.inlineData || p.inline_data).find((x) => x && x.data);
    }

    if (!img) {
      const said = parts.map((p) => p.text).filter(Boolean).join(' ');
      const reason = (json.candidates && json.candidates[0] && json.candidates[0].finishReason) || '';
      const e = new Error(said || 'تصویری در پاسخ نبود. ' + reason);
      e.raw = 'finishReason: ' + reason + '\n' + r.text.slice(0, 800);
      throw e;
    }
    return 'data:' + (img.mimeType || img.mime_type || 'image/png') + ';base64,' + img.data;
  }

  async function generateOpenAI(cfg, prompt, before) {
    const blob = await (await fetch(before)).blob();
    const form = new FormData();
    form.append('model', cfg.model || 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('image', blob, 'room.' + (blob.type === 'image/png' ? 'png' : 'jpg'));
    form.append('size', '1024x1024');
    const res = await withTimeout(
      fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + cfg.key },
        body: form,
      }),
      180000
    );
    const text = await res.text();
    if (!res.ok) {
      if (/^\s*</.test(text)) throw new Error('blocked');
      throw new Error(res.status + ' ' + text.slice(0, 200));
    }
    const json = JSON.parse(text);
    const b64 = ((json.data || [])[0] || {}).b64_json;
    if (!b64) throw new Error('تصویری در پاسخ نبود.');
    return 'data:image/png;base64,' + b64;
  }
})(window);
