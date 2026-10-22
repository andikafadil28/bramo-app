# BRAMO 2.0

BRAMO adalah pendamping desktop Windows berbentuk visor LED yang menggabungkan utilitas produktivitas, pengingat, pemantau sistem, dan mascot interaktif. Aplikasi dibangun dengan Tauri v2, Rust, HTML, CSS, dan JavaScript.

## Fitur

### Buddy dan kustomisasi
- Animasi visor, mata, mulut, mood, bubble kontekstual, reaksi saat drag, musik, mengetik, fokus, dan idle.
- BRAMO Journey dengan XP, level, koleksi aksesori, dan kosmetik.
- Tema Cyan, Matrix, Pink, Amber, RGB Cycle, dan Red Alert.
- Gaming Focus di Windows: mendeteksi game yang dikenal atau executable tambahan yang ditentukan pengguna.

### Produktivitas
- Pomodoro dengan durasi fokus/istirahat yang bisa diatur dan sisa sesi yang tersimpan.
- Tracker waktu fokus harian berbasis Pomodoro atau Gaming Focus.
- Pengingat fokus panjang dengan pilihan ambang dan snooze.
- Pengingat jeda bio-rhythm, to-do dengan pengingat, serta alarm bangun berulang.
- Quick Launcher untuk aplikasi dan situs.

### Utilitas desktop
- Kontrol media sistem dan mini-player.
- CPU, RAM, dan baterai, termasuk indikator charging.
- File drop dengan riwayat, clipboard history, dan watcher clipboard/typing.
- Pengingat sholat dengan jadwal, audio azan, dan prioritas bubble.
- Pembersih cache BRAMO, system tray, autostart, fullscreen hide, dan efek suara 8-bit.
- Jendela transparan always-on-top, snap, penyimpanan posisi, serta penyesuaian monitor dan DPI.

## Persyaratan

- Windows 10/11 x64 untuk dukungan fitur desktop terlengkap.
- Node.js dan npm.
- Rust stable dan toolchain Windows yang dibutuhkan Tauri.

BRAMO dibuat untuk Windows. Dukungan Linux/macOS belum dijamin untuk semua integrasi sistem.

## Menjalankan dari source

```powershell
git clone https://github.com/andikafadil28/bramo-app.git
cd bramo-app
npm install
npm run dev
```

Pemeriksaan sintaks frontend dan build release:

```powershell
npm run check
npm run build
```

Installer Windows x64 akan dibuat di `src-tauri/target/release/bundle/` (NSIS `.exe` dan MSI `.msi`).

## Versi dan dokumentasi

Versi aplikasi saat ini: **2.0.0**.

- [`CONTEXT.md`](CONTEXT.md): arsitektur, inventaris fitur, dan status proyek.
- [`todo.md`](todo.md): checklist dan tindak lanjut.
- [`SUMMARY.md`](SUMMARY.md): ringkasan proyek.
- [`AGENTS.md`](AGENTS.md): panduan kerja repository.

## Lisensi

Lisensi proyek belum ditentukan. Sampai file lisensi ditambahkan, jangan menganggap repository ini memberi izin untuk menggunakan, memodifikasi, atau mendistribusikan ulang kode.
