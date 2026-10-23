# BRAMO — Catatan Pindah Komputer

> Dokumen ringkas untuk melanjutkan project dari komputer lain. Detail teknis tetap ada di `CONTEXT.md`.

## Kondisi sekarang

- Source/build metadata BRAMO saat ini **1.0.1**. Installer source ini belum ditandatangani digital; lihat RELEASE_NOTES.md untuk detail SmartScreen.
- GitHub Release `v1.0.1` berisi installer NSIS `.exe` dan MSI.
- Situs promo Astro ada di `promo-site/`, menjelaskan fitur BRAMO, dan tombol unduh mengarah ke release terbaru.
- Halaman Astro punya buddy mengambang yang muncul saat halaman dibuka, bisa diseret dan mengingat posisinya di browser. Demo `#demo` memuat sepuluh tab dropdown sesuai panel aplikasi; aksinya hanya simulasi browser.
- Node build Cloudflare Pages dipin ke `22.19.0` lewat `promo-site/.nvmrc`.
- Versi Node di komputer kantor tercatat `v22.13.1`; kebutuhan situs promo sekarang **Node.js 22.19.0 atau lebih baru** karena dependency `undici` pada lockfile.
- Server Astro kantor yang menyebabkan file terkunci saat `npm ci` sudah dihentikan.

## Mulai di komputer rumah

Pastikan Git, Node.js **22.19.0+**, dan npm tersedia. Di terminal:

```powershell
cd C:\laragon\www\bramo-app
git pull origin main
cd promo-site
npm ci
npm run dev
```

Buka URL localhost yang muncul di terminal, biasanya `http://localhost:4321/`. Terminal harus tetap berjalan selama preview. Hentikan server dengan `Ctrl+C`.

Kalau `npm ci` di Windows melaporkan `EPERM` untuk file `astro.win32-x64-msvc.node`, kemungkinan server Astro lain masih menguncinya. Fokus ke terminal server itu dan tekan `Ctrl+C`, lalu ulangi `npm ci`. Tutup juga proses editor/terminal lain yang masih menjalankan Astro bila perlu. Warning `EBADENGINE` berarti Node terlalu lama; cek dengan `node -v` dan update ke 22.19.0+.

## Build dan publikasi situs

```powershell
cd C:\laragon\www\bramo-app\promo-site
npm run build
```

Output build berada di `promo-site/dist/`. Push perubahan ke `main`; Cloudflare Pages akan deploy otomatis **jika** Pages sudah dikoneksikan ke repository. Pengaturan Pages: production branch `main`, root directory `promo-site`, build command `npm run build`, output directory `dist`.

## Konteks produk dan cara melanjutkan

- BRAMO adalah buddy desktop visor LED cyberpunk berbasis Tauri v2. Fitur aktif: 10 tab dropdown; animasi/mood; Pomodoro; pengingat jeda dan fokus panjang; to-do/alarm; pengingat sholat; musik; stats; file/clipboard; launcher; Gaming Focus; XP/aksesori; tema; tray/autostart; sleep; fullscreen hide; multi-monitor dan DPI.
- Perilaku window terbaru: dropdown `300x520`, flip ke atas dekat bagian bawah layar, Settings memakai scroll internal, dan dropdown terkunci saat Gaming Focus aktif. Posisi startup di-clamp ke work area monitor.
- Daftar rinci dan status kode ada di `CONTEXT.md`; fitur yang tampil di situs ada di `promo-site/src/pages/index.astro`.
- Sebelum menyebut fitur baru, cocokkan dengan kode yang ada agar tidak menjanjikan kemampuan yang belum dibuat.
- Uji build situs dengan `npm run build`. Jangan klaim perilaku desktop sudah teruji manual tanpa mencobanya di Windows.
- Build installer desktop dengan `npm run build` dari root; output berada di `src-tauri/target/release/bundle/`. Uji manual startup, 10 tab dropdown, Gaming Focus, dan drag sebelum menyatakan perilaku tervalidasi.
- Lisensi proprietary: pemakaian personal dan modifikasi pribadi yang tidak dibagikan diizinkan; installer resmi boleh dibagikan gratis; penjualan, distribusi versi modifikasi/source, atau klaim kepemilikan tidak diizinkan. Lihat `LICENSE`.

## Gaya kolaborasi yang disukai Andika

- Pakai bahasa Indonesia santai, langsung, dan jelas; hindari istilah teknis tanpa penjelasan.
- Saat ia minta diajari, beri langkah berurutan dengan perintah siap salin dan sebut terminal/folder tempat menjalankannya.
- Ia suka dibimbing untuk membahas pilihan dan roadmap, tetapi untuk task implementasi yang jelas, kerjakan langsung lalu beri ringkasan perubahan dan cara mengeceknya.
- Perlihatkan hasil UI di browser lokal bila sedang mengerjakan situs; jangan menganggap preview lokal sama dengan situs yang sudah live.

## Dokumen rujukan

- `CONTEXT.md` — arsitektur, fitur, status, bug/risiko, dan riwayat keputusan.
- `README.md` — overview repo dan build aplikasi desktop.
- `promo-site/README.md` — cara menjalankan Astro dan konfigurasi Cloudflare Pages.
- `SUMMARY.md` — ringkasan singkat fitur dan rilis.
- `todo.md` — checklist kerja ringkas.
