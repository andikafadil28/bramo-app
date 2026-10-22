# BRAMO Promo Site

Static Astro website for BRAMO, deployed on Cloudflare Pages.

## Local development

Pastikan Node.js versi 20.19+ atau 22.12+ sudah terpasang. Buka terminal di folder `promo-site`, lalu jalankan:

```sh
npm ci
npm run dev
```

Buka alamat yang ditampilkan Astro di terminal (biasanya `http://localhost:4321/`). Biarkan terminal tetap berjalan saat mengecek situs. Tekan `Ctrl+C` untuk menghentikan server. Setelah mengubah file, browser biasanya memperbarui halaman otomatis; jika tidak, refresh.

Perintah lain:

- `npm run build` membuat versi statis untuk Cloudflare Pages di folder `dist/`.
- `npm run preview` melihat hasil build lokal setelah `npm run build`.

## Cloudflare Pages with automatic Git deploys

Create a Pages project and connect the GitHub repository `andikafadil28/bramo-app`.

- Production branch: `main`
- Root directory: `promo-site`
- Build command: `npm run build`
- Build output directory: `dist`

Cloudflare Pages will install dependencies, build the static Astro site, and publish it after each push to `main`. Pull requests get preview deployments. No Worker adapter is needed because this site is static.

The website's download buttons point to the latest GitHub Release. Attach the official Windows installers to each release so visitors can download the current version.
