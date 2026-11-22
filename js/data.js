/* خونه‌چین — لایهٔ داده و متن‌های محصول
   همهٔ داده‌ها محلی‌اند؛ هیچ درخواستی به سرور فرستاده نمی‌شود. */
(function (global) {
  const K = (global.K = global.K || {});
  const D = (K.Data = {});

  D.app = {
    name: 'خونه‌چین',
    tagline: 'قبل از خرج‌کردن، ببین کدام تغییر واقعاً برای خانه‌ات ارزش دارد.',
    version: 'نسخهٔ نمایشی ۰٫۱',
    packagePrice: 149000,
    refineCredits: 1,
  };

  D.steps = ['عکس', 'حالت', 'هدف', 'وسایل', 'مرور'];

  D.goals = [
    { id: 'traffic', label: 'رفت‌وآمد بهتر', icon: 'path', hint: 'راه بالکن و مسیر عبور باز شود' },
    { id: 'light', label: 'نور بیشتر', icon: 'sun', hint: 'نور طبیعی و چراغ‌ها بهتر پخش شوند' },
    { id: 'guest', label: 'پذیرایی از مهمان', icon: 'people', hint: 'جای نشستن بیشتر و مرتب‌تر' },
    { id: 'compact', label: 'جمع‌وجور شدن فضا', icon: 'compact', hint: 'فضای خالی و آرام بیشتر' },
    { id: 'style', label: 'ظاهر تازه', icon: 'spark', hint: 'رنگ، جنس و پرده تازه' },
  ];

  D.tastes = [
    { id: 'light-simple', label: 'روشن و ساده', colors: ['#F2ECE0', '#DCD3C2', '#8FA28F'], hint: 'سطح‌های روشن، خطوط کم' },
    { id: 'warm-wood', label: 'گرم و چوبی', colors: ['#E4C9A5', '#A9744F', '#4E3A2C'], hint: 'چوب، پارچهٔ کرم، نور گرم' },
    { id: 'colorful', label: 'رنگی و پرجزئیات', colors: ['#C9704C', '#285542', '#D8B24A'], hint: 'فرش نقش‌دار، پردهٔ رنگی' },
  ];

  D.modes = [
    {
      id: 'own', title: 'با وسایل خودم', line: 'همین وسایل، چیدمان تازه؛ بدون خرید.',
      detail: 'وسایلی که تأیید می‌کنی سر جایشان می‌مانند و بقیه جابه‌جا می‌شوند.',
      cost: 'هزینهٔ خرید: صفر', icon: 'sofa',
    },
    {
      id: 'free', title: 'طراحی آزاد', line: 'حال‌وهوای تازه، حتی با وسایل جدید.',
      detail: 'جنس، نور، رنگ و مبلمان آزاد است؛ می‌توانی چند وسیله را نگه داری.',
      cost: 'خرید: آزاد', icon: 'spark',
    },
    {
      id: 'mixed', title: 'ترکیبی', line: 'وسایل دلخواه را نگه دار، چند مورد را عوض کن.',
      detail: 'سقف هزینه، تعداد خرید و دسته‌های مجاز را خودت تعیین می‌کنی.',
      cost: 'خرید: محدود', icon: 'mix',
    },
  ];

  D.itemStatuses = [
    { id: 'fixed', label: 'جای ثابت', hint: 'هیچ‌کس نمی‌تواند آن را جابه‌جا کند.' },
    { id: 'keep', label: 'حفظ شود', hint: 'بماند، ولی اگر لازم شد جایش آزاد است.' },
    { id: 'free', label: 'قابل تغییر', hint: 'می‌شود جابه‌جا یا عوض شود.' },
  ];

  D.categories = [
    { id: 'curtain', label: 'پرده' },
    { id: 'light', label: 'نور' },
    { id: 'rug', label: 'فرش' },
    { id: 'chair', label: 'صندلی' },
    { id: 'decor', label: 'دکور' },
    { id: 'storage', label: 'ذخیره‌سازی' },
  ];

  D.measureState = { measured: 'اندازه‌گیری‌شده', estimated: 'تخمینی', unknown: 'نامعلوم' };

  D.checkState = {
    ok: { label: 'بررسی شد', tone: 'ok' },
    conflict: { label: 'ناسازگار', tone: 'bad' },
    need: { label: 'نیاز به اندازه', tone: 'warn' },
  };

  /* ---------- اتاق نمونه: پذیرایی ۴٫۲ × ۳٫۴ متر ---------- */
  D.room = {
    id: 'living',
    name: 'پذیرایی',
    w: 4.2,
    d: 3.4,
    walls: {
      n: { window: { x1: 1.0, x2: 3.4 }, freeWidth: 1.8, freeLabel: 'کنار پنجره' },
      s: { tv: { x1: 1.4, x2: 3.0 } },
      w: { balcony: { y1: 2.3, y2: 3.2, swing: 0.9, inward: true } },
      e: {},
    },
    route: { x1: 0, y1: 2.2, x2: 1.15, y2: 3.25, label: 'مسیر بالکن' },
    constraints: [{ id: 'n-free', wall: 'n', from: 2.2, to: 4.0, label: 'کنار پنجره' }],
    source: 'estimated',
  };

  D.photoBounds = {
    sofa: { x: 0.3, y: 0.585, w: 0.4, h: 0.195 },
    rug: { x: 0.19, y: 0.74, w: 0.62, h: 0.24 },
    tv: { x: 0.4, y: 0.8, w: 0.2, h: 0.1 },
    curtain: { x: 0.245, y: 0.08, w: 0.515, h: 0.53 },
    chair: { x: 0.085, y: 0.7, w: 0.19, h: 0.22 },
    lamp: { x: 0.86, y: 0.6, w: 0.07, h: 0.26 },
    plant: { x: 0.81, y: 0.68, w: 0.13, h: 0.22 },
  };

  D.items = [
    { id: 'sofa', name: 'مبل سه‌نفره', cat: 'sofa', len: 210, dep: 90, h: 82, x: 1.15, y: 1.55, rot: 0, status: 'free', meas: 'measured', color: '#8C6B52', bounds: D.photoBounds.sofa },
    { id: 'rug', name: 'فرش دستباف', cat: 'rug', len: 240, dep: 170, h: 2, x: 1.05, y: 1.25, rot: 0, status: 'fixed', meas: 'measured', color: '#A44232', flat: true, bounds: D.photoBounds.rug },
    { id: 'tv', name: 'میز تلویزیون', cat: 'tv', len: 160, dep: 40, h: 55, x: 1.4, y: 2.98, rot: 0, status: 'fixed', meas: 'measured', color: '#5C4636', bounds: D.photoBounds.tv, hiddenInView: true },
    { id: 'curtain', name: 'پردهٔ پنجره', cat: 'curtain', len: 240, dep: 12, h: 260, x: 1.0, y: 0.05, rot: 0, status: 'keep', meas: 'measured', color: '#C9B79B', wall: 'n', flat: true, bounds: D.photoBounds.curtain },    { id: 'chair', name: 'صندلی تک‌نفره', cat: 'chair', len: 80, dep: 80, h: 78, x: 0.28, y: 2.35, rot: 0, status: 'free', meas: 'measured', color: '#7C8B7A', bounds: D.photoBounds.chair },
    { id: 'lamp', name: 'چراغ پایه‌دار', cat: 'light', len: 40, dep: 40, h: 165, x: 3.75, y: 1.2, rot: 0, status: 'free', meas: 'estimated', color: '#D8B24A', round: true, bounds: D.photoBounds.lamp, hiddenInView: true },
    { id: 'plant', name: 'گلدان بزرگ', cat: 'decor', len: 50, dep: 50, h: 140, x: 3.7, y: 2.85, rot: 0, status: 'keep', meas: 'estimated', color: '#4C6B4F', round: true, bounds: D.photoBounds.plant },
  ];

  /* ---------- کالاهای نمونه ---------- */
  D.products = [
    {
      id: 'p-curtain', name: 'پردهٔ کتان روشن — کرم طبیعی', cat: 'curtain', price: 980000,
      size: 'عرض ۲۸۰ × ارتفاع ۲۶۰ سانتی‌متر', seller: 'پارچه‌سرای نقش', validUntil: '۳ روز',
      status: 'موجود', note: 'هم‌رنگ با دیوار کرم؛ نور را پخش می‌کند.',
    },
    {
      id: 'p-lamp', name: 'چراغ پایه‌دار با آباژور پارچه‌ای', cat: 'light', price: 1250000,
      size: 'ارتفاع ۱۶۵ × قطر پایه ۳۰ سانتی‌متر', seller: 'روشنایی خانه', validUntil: '۵ روز',
      status: 'موجود', note: 'نور گرم در گوشهٔ نشیمن.',
    },
    {
      id: 'p-side', name: 'میز کنار مبل با کشو', cat: 'decor', price: 780000,
      size: 'عرض ۱۲۰ × عمق ۶۰ × ارتفاع ۴۵ سانتی‌متر', seller: 'چوب و خانه', validUntil: '۲ روز',
      status: 'موجود', drawer: 35, note: 'کشو ۳۵ سانتی‌متر به سمت مسیر باز می‌شود؛ بررسی جدا لازم دارد.',
    },
  ];

  D.package = {
    title: 'بستهٔ اتاق',
    contents: ['دو طرح قابل مقایسه از یک زاویه', 'یک اصلاح موضعی', 'فهرست تغییرها و راهنمای اجرا'],
    note: 'تصویر واقع‌گرایانه در نسخهٔ نمایشی تولید نمی‌شود؛ خروجی، مقایسهٔ شماتیک و پلان معتبر است.',
  };

  D.demoProjectNames = ['پذیرایی خانهٔ ما', 'نشیمن — پیش‌نویس'];

  D.opsRole = {
    support: 'پشتیبان', reviewer: 'بازبین', finance: 'امور مالی',
  };
})(window);
