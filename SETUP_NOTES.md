# RumeDio Shop — Setup Notes

Everything below explains what was changed and the 3 things you still need to
do yourself (none of them need coding — just clicking through dashboards).

## ✅ What's done

- **Rebrand**: site name changed from "LENS BAZAAR BD" to **RumeDio Shop**
  everywhere (homepage title, header, footer, dashboard, login/register
  pages, favicon, logo).
- **Logo**: your circular RumeDio Shop badge is now `public/images/web-logo.png`
  (header) and `public/images/favicon.png` (browser tab icon).
- **Database**: `config/db.js` now reads connection details from `.env`
  instead of being hardcoded to `localhost`. Your FreeDB credentials are
  already filled in.
- **Cloudinary**: new product photos and review photos uploaded from the
  dashboard now go straight to Cloudinary instead of the local disk. Old
  product/review photos that came bundled with the site (lens, camera,
  umbrella, etc.) still work exactly as before — nothing was migrated, no
  images were deleted.
- **package.json**: added the `cloudinary` package; `node_modules` is
  already installed in this zip, so you don't need to run `npm install`
  unless you want to.

## ⚠️ 3 things to do yourself

### 1. Import the database into FreeDB
I can't reach `sql.freedb.tech` from where I run, so you'll need to import it:
1. Go to your FreeDB dashboard → click on the `freedb_ZknNKs7V` database.
2. Look for an **"phpMyAdmin"** or **"Manage"** / **"Import"** link/button on
   that page (FreeDB usually links out to a phpMyAdmin instance for your DB).
3. In phpMyAdmin, open the **Import** tab and upload `ecommerce_db_import.sql`
   (included in this zip, same content as the file you sent me).
4. Click **Go**. That recreates all your tables (products, orders, users,
   reviews, etc.) on FreeDB.

**Important — please read:** your FreeDB screenshot shows this database is on
the **free 7‑day plan** ("Deletes 6 days" badge). FreeDB auto-deletes free
databases after 7 days unless you upgrade to their persistent plan. If this
site is going live with real orders, you'll want to either upgrade that
FreeDB database or move to a different always-on MySQL host — otherwise your
orders/products will vanish in less than a week.

### 2. Double-check Cloudinary
Your API key/secret are already in `.env` and the app reads them correctly
(I verified this from my side). I couldn't actually test an upload because my
sandbox can't reach Cloudinary's API — so the first time you add a product
with a photo after deploying, just confirm the image shows up. If it doesn't,
double check the cloud name `dhdn9ja2u` is exactly right on your Cloudinary
dashboard.

### 3. Update outward-facing links when you're ready
A few things still point at the **old** brand/domain because I don't have
replacements for them — update these whenever you have the new ones:
- YouTube/TikTok links in the footer and contact page (`@lensbazaarbd`)
- The `lensbazaarbd.com` domain used in the Facebook/WhatsApp "share product"
  buttons (`views/pages/product.ejs`)
- Phone number, email, and WhatsApp number in the footer — these were left as
  the original site's contact info; update if RumeDio Shop uses different ones.

## Running locally
```
npm install      # only needed if you ever delete node_modules
npm run dev       # http://localhost:3000
```
Note: `.env` has `NODE_ENV=production`, which makes login cookies require
HTTPS. If you're testing locally over plain `http://`, temporarily change it
to `NODE_ENV=development` in `.env`, otherwise login/sessions won't persist.
