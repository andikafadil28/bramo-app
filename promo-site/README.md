# BRAMO Promo Site

Static Astro website for BRAMO, deployed on Cloudflare Pages.

Situs: [bramo.dikadevit.my.id](https://bramo.dikadevit.my.id). Demo menampilkan buddy yang bisa diseret dan sepuluh tab fitur. Kontrol di demo hanya simulasi di browser: tidak menjalankan integrasi desktop BRAMO atau mengirim data dari komputer.

## Local development

Pastikan Node.js versi **22.19.0 atau lebih baru** sudah terpasang. Buka terminal di folder `promo-site`, lalu jalankan:

```sh
npm ci
npm run dev
```

Buka alamat yang ditampilkan Astro di terminal (biasanya `http://localhost:4321/`). Biarkan terminal tetap berjalan saat mengecek situs. Tekan `Ctrl+C` untuk menghentikan server. Setelah mengubah file, browser biasanya memperbarui halaman otomatis; jika tidak, refresh.

Perintah lain:

- `npm run build` membuat versi statis untuk Cloudflare Pages di folder `dist/`.
- `npm run preview` melihat hasil build lokal setelah `npm run build`.

## Cloudflare Pages with automatic Git deploys

In Cloudflare, create a Pages project using **Connect to Git** and select the GitHub repository `andikafadil28/bramo-app`.

- Production branch: `main`
- Root directory: `promo-site`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: pinned to `22.19.0` in `.nvmrc`

Cloudflare Pages will install dependencies, build the static Astro site, and publish it after each push to `main`. Pull requests get preview deployments. No Worker adapter is needed because this site is static.

The website's download buttons point to the latest GitHub Release. Attach the official Windows installers to each release so visitors can download the current version.

### Custom domain

After the first deployment succeeds, open the Pages project > **Custom domains** > **Set up a domain**, then enter `bramo.dikadevit.my.id`.

- If `dikadevit.my.id` is managed in the same Cloudflare account, confirm the suggested DNS record.
- If DNS is managed elsewhere, first associate the custom domain in Pages, then create the requested CNAME at the DNS provider: name `bramo`, target the Pages hostname shown in the dashboard (for example, `bramo.pages.dev`).
