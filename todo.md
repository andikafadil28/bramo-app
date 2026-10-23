# BRAMO Project TODO List

> Rujukan eksekusi sprint aktif ada di `CONTEXT.md` Section 7 ("Rencana Sprint: Polish & Stabilisasi").
> Checklist di bawah adalah versi ringkas — detail + lokasi file ada di `CONTEXT.md`.

> **Status sekarang (2026-10-23):** BRAMO 1.0.1 sudah dirilis di [GitHub Releases](https://github.com/andikafadil28/bramo-app/releases/tag/v1.0.1), dengan installer EXE dan MSI. Situs promo Astro sudah tayang di [bramo.dikadevit.my.id](https://bramo.dikadevit.my.id) dan demo browser menampilkan buddy interaktif serta 10 tab fitur. Uji manual installer dan perilaku desktop di Windows masih perlu dilakukan; lihat checklist di bawah dan `HANDOFF.md`.

## Perbaikan desktop terbaru
- [x] Pulihkan posisi startup ke work area monitor dan tampilkan window setelah restore.
- [x] Pertahankan dropdown `300x520`, flip ke atas dekat bawah, dan scroll internal Settings.
- [x] Kunci dropdown saat Gaming Focus aktif; tutup panel jika game mulai terdeteksi.
- [x] Drag terkontrol dengan pointer delta untuk menghindari Aero Shake.
- [ ] Uji manual installer: startup/visibilitas, seluruh 10 tab, Settings sampai bawah, flip dropdown, Gaming Focus, drag, monitor/DPI.

## Phase 1: Core Interaction & "Aliveness"
- [x] **Chat Bubble / Speech Dialog System:** Elemen balon teks melayang di atas kepala BRAMO untuk sapaan, status, dan komentar acak.
- [x] **Interactive Expression Trigger:** Aksi klik/drag/dropdown terhubung ke ekspresi LED visor (idle, siul, gumam, senang terbuka).
- [x] **Refine Gaze & Blink Engine:** Kedip acak, mode tracking kursor, dan lirik acak sudah berjalan natural.

## Phase 2: Bio-Rhythm & Essential Utilities
- [x] **Prayer Reminder (Pengingat Sholat):** Jadwal Advan/Aladhan, attention bubble, azan audio, topi berubah jadi peci.
- [x] **Temporary File Drop Zone:** Menerima file dari Explorer, Open, Show in Folder, dan history lima file terakhir.
- [x] **Clipboard History:** Riwayat teks 5 item tersimpan di localStorage dengan tombol copy ulang.
- [x] **System Cache Cleaner:** Tombol Power membersihkan isi direktori cache khusus BRAMO dan melaporkan file/ukuran yang dihapus.
- [x] **8-bit SFX:** Efek UI chiptune sintetis dengan toggle ON/OFF dan preferensi tersimpan.
- [x] **To-do + Alarm Bangun Tidur:** Subtab terpisah; pengingat tugas satu kali, alarm harian berulang dengan snooze 5 menit, tes suara, dan membangunkan BRAMO dari Sleep Mode.

## Phase 3: System Integration & Polish
- [x] **Window Position Persistence:** Koordinat terakhir disimpan di local storage.
- [x] **Pomodoro Timer:** Focus/break configurable dengan mini-timer floating dan feedback speech bubble.
- [x] **Custom Themes:** Cyan, Matrix Green, Neon Pink, dan Amber Orange.
- [x] **Mascot Sleep Mode:** Mode tidur visual yang mengecilkan BRAMO dan bangun lewat interaksi drag.
- [x] **System Tray & Auto-Start:** Menu tray Show/Hide/Sleep/Quit dan plugin autostart terpasang.
- [x] **Gamification System (EXP & Costumes):** XP, level, milestone, koleksi kosmetik, unlock, dan equip sudah tersedia.

---

## Sprint: Polish & Stabilisasi (SELESAI)

Detail lengkap, lokasi file, dan skenario uji ada di `CONTEXT.md` Section 7.

### Batch 1 — Repo hygiene & build script
- [x] `package.json`: perbaiki `description`, hapus `main`, tambah script `tauri` / `dev` / `build` / `check`
- [x] Tambah `.gitignore` root: `node_modules/`, `src-tauri/target/`, `dist/`, `*.log`
- [x] `git rm -r --cached node_modules` (file tetap di disk)
- [x] `src-tauri/tauri.conf.json`: `identifier` → `com.bramo.companion`, `productName` → `BRAMO` (localStorage reset satu kali)

### Batch 2 — Perbaikan Rust (`src-tauri/src/lib.rs`)
- [x] B2.1 CPU% valid: `SystemSampler` persisten via `app.manage(...)`, refresh maks 1x/500ms
- [x] B2.2 Anti command injection: `explorer.exe` menggantikan `cmd /C start`
- [x] B2.3 Clipboard gate: `set_clipboard_watcher(bool)` + `get_clipboard_text()`
- [x] B2.4 Tray delegasi: emit `bramo://tray-action` (show/hide/sleep/quit)
- [x] B2.5 Typing gate: `set_typing_watcher(bool)`
- [x] B2.6 Media event-driven: cache WinRT manager, emit `bramo://media` tiap 2,5 detik

### Batch 3 — Perbaikan Frontend (`src/main.js`, `src/index.html`, `src/style.css`)
- [x] B3.1 Quit confirm in-app (ganti `window.confirm()`)
- [x] B3.2 Clipboard single-source (hapus polling dobel)
- [x] B3.3 `computeTargetWindowSize()` + `applyWindowLayout({ anchor })` sebagai satu sumber ukuran window
- [x] B3.4 Toggle autostart di panel Power
- [x] B3.5 Clamp multi-monitor pakai `win.currentMonitor()`
- [x] B3.6 Media event-driven di frontend + `lastMediaState`

### Batch 3A — Azan Priority Mode
- [x] B3A.1 State `adhanSessionActive` / `mediaPausedByAdhan` / `adhanResumeTimer` / `ADHAN_SUPPRESS_MS`
- [x] B3A.2 `beginAdhanSession()` / `endAdhanSession()` (idempotent)
- [x] B3A.3 `pauseMediaForAdhan()` / `resumeMediaAfterAdhan()` (resume hanya kalau masih paused)
- [x] B3A.4 Ganti semua guard `isAdhanPlaying` → `adhanSessionActive`
- [x] B3A.5 Wiring audio: `ended` / `pause` / catch autoplay-blocked → `endAdhanSession()`
- [x] B3A.6 Entry point: Test Reminder + scheduler jadwal → `beginAdhanSession()`

### Batch 4 — Sinkronisasi dokumen
- [x] B4.1 `README.md`: fitur over-promise → Roadmap, perbaiki perintah run & URL clone
- [x] B4.2 `todo.md`: tandai ulang item (file ini)
- [x] B4.3 `CONTEXT.md`: koreksi ukuran window, tambah Azan Priority Mode, update Fokus
- [x] B4.4 `SUMMARY.md`: selaraskan daftar fitur

### Perbaikan lanjutan — Media active-state (2026-10-22)
- [x] Status sesi Windows Media Session stopped/closed tidak lagi dianggap aktif.
- [x] Metadata kosong atau gagal dibaca tidak lagi menghasilkan mini-player placeholder palsu.
- [x] Sesi paused tetap dianggap aktif agar tombol resume tersedia; Music Vibe tetap hanya saat playing.
- [ ] Uji manual Windows: stop/close player menyembunyikan mini-player; pause mempertahankannya; play menampilkan Music Vibe.
- Catatan: belum menjalankan build MSI.

### Verifikasi Sprint
- [x] V1 `npm run check`
- [x] V2 `cargo check` + `cargo clippy`
- [ ] V3 `npm run build`
- [ ] V4 Uji manual 14 skenario UI (drag, snap, 7 panel, autostart, tray, sleep, pomodoro, mini-player, fullscreen, clipboard, CPU%, multi-monitor, DPI)
- [ ] V5 Uji skenario azan (pause musik, bubble terkunci, auto-resume, mute, audio OFF, test)

---

## Completed Integration & Polish
- [x] Speech bubble, expression triggers, gaze, and blink engine.
- [x] Prayer reminder with azan visual/audio mode.
- [x] Quick Launcher for URL/application shortcuts.
- [x] Configurable Pomodoro with floating mini-timer.
- [x] Custom themes and mascot Sleep Mode.
- [x] System Tray + Auto-start.
- [x] Fullscreen companion hide toggle with ChatGPT/Codex exclusions.
- [x] DPI-aware native window sizing.
- [x] File drop zone with history, Open, and Show in Folder.
- [x] System stats monitor (CPU / RAM / Battery) — sampler persisten di Rust, CPU% kini valid.
