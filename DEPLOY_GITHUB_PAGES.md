# گذاشتن خونه‌چین روی GitHub Pages (بدون نصب هیچ ابزاری)

هدف: یک آدرس عمومی که روی هر گوشی باز شود و به‌عنوان اپ نصب شود.

## گام ۱ — ساخت مخزن

1. به github.com برو و وارد شو.
2. دکمهٔ **New repository**.
3. نام: `khunechin` · نوع: **Public** (برای Pages رایگان لازم است) · بدون README.
4. **Create repository**.

## گام ۲ — آپلود فایل‌ها

در صفحهٔ مخزن خالی، گزینهٔ **uploading an existing file** را بزن و محتوای این پوشه را
بکش و رها کن (نه خود پوشهٔ والد را؛ فقط محتوای داخلش):

```
index.html
manifest.webmanifest
sw.js
.nojekyll
css/
js/
assets/
README.md
DEPLOY_GITHUB_PAGES.md
```

نکته: پوشه‌ها باید با ساختارشان آپلود شوند. ساده‌ترین راه: فایل ZIP را در رایانه باز کن و
پوشه‌های `css`، `js`، `assets` را با همان نام بکش و در صفحهٔ آپلود رها کن.

سپس **Commit changes**.

## گام ۳ — روشن‌کردن Pages

1. در مخزن: **Settings → Pages**.
2. در بخش **Build and deployment**، منبع را روی **Deploy from a branch** بگذار.
3. Branch: `main` · Folder: `/ (root)` · **Save**.
4. یک تا دو دقیقه صبر کن؛ آدرس بالا می‌آید:

```
https://<username>.github.io/khunechin/
```

## گام ۴ — نصب روی گوشی

آدرس را در کروم اندروید باز کن → منوی سه‌نقطه → **Add to Home screen**.
اپ با آیکون و بدون نوار مرورگر باز می‌شود و کش آفلاین هم دارد.

## اگر خواستی با Git کار کنی

این رایانه الان `git` ندارد. اگر ترجیح می‌دهی از خط فرمان استفاده کنی:

```powershell
winget install --id Git.Git -e
```

بعد در پوشهٔ پروژه:

```powershell
git init
git add .
git commit -m "خونه‌چین ۰٫۱ — نسخهٔ اجرایی"
git branch -M main
git remote add origin https://github.com/<username>/khunechin.git
git push -u origin main
```

## هشدار امنیتی

این نسخه هیچ داده‌ای به سرور نمی‌فرستد؛ عکس‌ها و پروژه‌ها فقط در حافظهٔ همان گوشی می‌مانند.
اما مخزن را Public می‌گذاری، پس هیچ کلید API یا اطلاعات شخصی را داخلش نگذار.
