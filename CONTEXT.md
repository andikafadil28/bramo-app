# BLUEPRINT PROYEK: BRAMO (Cyberpunk LED Visor Desktop Companion)

## 1. Ikhtisar Proyek & Filosofi Inti
- **Nama Proyek:** BRAMO (Cyberpunk Desktop Companion / Interactive Top-Bar Widget)
- **Target Platform:** Desktop (Windows / macOS / Linux via Tauri v2)
- **Konsep Utama:** Asisten kapsul desktop interaktif bertema cyberpunk yang dilengkapi wajah visor LED hidup, gelembung dialog komik (speech bubble), fisika drag-and-drop, serta panel dropdown utilitas yang bisa dilipat.
- **Tantangan Arsitektur Utama:** Menyeimbangkan transparansi penuh pada window OS dan kemampuan *click-through* (`pointer-events: none` pada background) dengan elemen interaktif (`pointer-events: auto`), serta melakukan *resize* ukuran window secara dinamis (`win.setSize`) antara **Mode Compact** (`220x90`), **Mode Music** (`220x162`), dan **Mode Expanded** (`280x360`) tanpa menembus batas layar atau taskbar.

---

## 2. Tech Stack & Catatan Kritis API (Tauri v2 & DPI Scaling)
- **Framework:** Tauri v2 (Backend Rust + Frontend Web)
- **Aturan Wajib API Tauri v2:** 
  - Selalu gunakan namespace API modern Tauri v2 di frontend JavaScript: `const win = window.__TAURI__.window.getCurrentWindow();`
  - Method pendukung yang digunakan: `win.outerPosition()`, `win.setPosition({ type: 'Physical', x, y })`, `win.setSize(new window.__TAURI__.window.PhysicalSize(width, height))`. **Jangan pernah** menggunakan API lawas Tauri v1.
- **Isu DPI Scaling Windows:** 
  - Perhatikan masalah skala resolusi Windows (misal layar 125% atau 150%). Kalkulasi posisi *physical vs logical pixels* harus hati-hati agar window tidak mengalami "teleportasi" liar atau meleset keluar layar.
- **Konfigurasi Window (`tauri.conf.json`):**
  - Frameless (`decorations: false`), transparan penuh (`transparent: true`), dan selalu di atas (`alwaysOnTop: true`).

---

## 3. Struktur File & Detail Arsitektur

### A. `src/index.html` (Lapisan Markup)
- **`.capsule-wrapper`**: Kontainer luar yang mengatur perataan vertikal (`flex-start` atau `flex-end` via `.align-bottom`).
- **`.bramo-container`**: Wrapper utama yang menampung zona topi/bubble, kapsul utama, dan panel dropdown. Mengelola kelas state: `.expanded`, `.flip-bubble`, `.flip-dropdown`, `.is-dragging`, `.just-landed`.
- **`.hat-and-bubble-zone`**: Kontainer absolut untuk gelembung dialog komik (`#speechBubble`) dan trigger topi cowboy pixel (`#hatTrigger`).
- **`.bramo-capsule`**: Badan utama yang bisa di-drag (`listener mousedown`). Berisi:
  - **`.visor-screen`**: Monitor LED cyberpunk dengan garis scan, soket mata (`#leftEye`, `#rightEye`), mulut LED (`#ledMouth`), dan efek blush (`.led-blush`).
  - **`.dropdown-handle-bar`**: Tab penarik dropdown (`#dropdownToggle`) dengan indikator garis animasi (`.tab-indicator`).
- **`.dropdown-panel`**: Panel pulau utilitas compact berbasis quick-action button untuk Music, System Stats, File Drop, Power, dan Prayer Reminder. Hanya satu utility panel aktif pada satu waktu.

### B. `src/style.css` (Lapisan Styling & Animasi)
- **Variabel CSS (`:root`)**: Cyan neon (`--led-cyan: #00f0ff`), efek glow, dan warna panel transparan gelap (`--bg-capsule`, `--bg-panel`).
- **Pengaturan Click-Through**: 
  - `html, body` memiliki `pointer-events: none; background: transparent !important; overflow: hidden;` agar klik mouse menembus area kosong ke aplikasi di belakangnya.
  - `.interactive` dan elemen visual utama seperti `.bramo-capsule` mengaktifkan kembali `pointer-events: auto;`; `.bramo-container` tetap click-through agar padding transparan tidak menghalangi aplikasi di belakang.
- **Posisi Adaptif & Mekanisme Flip**:
  - `.bramo-container.flip-bubble .speech-bubble`: Memindahkan gelembung dialog ke bawah topi jika maskot berada dekat batas atas layar.
  - `.bramo-container.flip-dropdown .dropdown-panel`: Membalik panel dropdown ke atas (`bottom: calc(100% + 4px)`) ketika BRAMO ditaruh di dekat batas bawah layar.
- **Animasi**:
  - Keyframes `landingBounce` kustom saat drag dilepas (`.just-landed`).
  - Transisi mulus untuk perubahan skala tinggi (`max-height`, `opacity`).

### C. `src/main.js` (Lapisan Logika & Engine)
1. **Visor & Expression Engine**:
   - Kedipan mata otomatis acak (`visorScreen.classList.add('blinking')`).
   - Engine pandangan (`switchGazeState` & `updateEyeFrame`) yang mendukung mode *tracking* (mengikuti kursor) dan lirikan acak (`GLANCE`, `FORWARD`).
   - State machine mulut (`setMouthState`, `triggerHappyMouth`) yang berganti antara mode idle, siul, gumam, dan senang terbuka.
2. **Speech Bubble & Sistem Chat Kontekstual**:
   - Kutipan sistem berkala acak (`bramoQuotes`).
   - Kutipan kontekstual berdasarkan aksi: `drag_start`, `drag_end`, `idle_click`, `snapped_top`, `edge_left`, `edge_right`, `dropdown_open`.
3. **Custom Drag & Anti-Teleport Engine**:
   - `mousedown` mencatat koordinat awal window dan layar via API Tauri (`win.outerPosition()`).
   - `mousemove` menggunakan pembatasan `requestAnimationFrame` (`isTicking`) untuk menghitung delta secara *real-time* guna memperbarui posisi window (`win.setPosition`) dengan mulus tanpa lag atau glitch teleport.
   - Kemiringan/rotasi kapsul dinamis berdasarkan kecepatan mouse (`movementX`).
4. **Double-Click Snap**:
   - Klik 2x pada `#hatTrigger` menghitung dimensi layar dan langsung melakukan *snap* BRAMO ke posisi tengah atas layar (`targetX = (screenWidth - windowWidth) / 2`, `targetY = 20`), sekaligus mereset state ke compact.
   5. **Dual-Mode Dynamic Window Sizing & State Management (Kunci Logika Aktif)**:
    - Menekan `#dropdownToggle` beralih antara **Mode Compact** (`220x90`) dan **Mode Expanded** (`280x360`), dengan retry/verifikasi `outerSize()` setelah `setSize()`.
    - Ukuran native kini punya satu sumber: `computeTargetWindowSize()` (expanded > media+pomodoro `220x210` > media `220x162` > pomodoro `220x140` > compact `220x90`, dengan override sleep) dan `applyWindowLayout({ anchor })`. Fungsi ini dipakai oleh sleep, wake, toggle dropdown, sync media, sync pomodoro, dan bubble.
    - Menggunakan `savedCompactY` dan `wasFlipped` untuk mencegah pergeseran kumulatif saat dropdown dibuka-tutup.
6. **Window Position Persistence & Bubble Sizing**:
   - Posisi terakhir disimpan di `localStorage` dan dipulihkan saat startup.
   - Ukuran native window mengikuti compact, expanded, dan speech bubble aktif.
   - Speech bubble berpindah ke bawah saat BRAMO di atas layar dan ke atas topi saat BRAMO di bawah layar.
   7. **System Stats & Prayer Reminder**:
    - CPU/RAM diambil dari Rust command `get_system_stats` menggunakan `sysinfo`; battery memakai WebView Battery API. Sampler `System` dibuat persisten di Rust (`SystemSampler`) agar delta CPU valid.
    - Prayer Reminder mengambil lima waktu sholat dari Aladhan API berdasarkan geolocation, dengan fallback Jakarta.
    - Reminder memiliki toggle ON/OFF, audio ON/OFF, tombol test berurutan Subuh-Zuhur-Asar-Magrib-Isya, tombol mute, dan audio `src/assets/Adzan.wav`.
    - Selama azan: bubble attention tetap tampil, visor amber, mulut animasi melafalkan, mata menghayati, dan cowboy hat berubah menjadi peci kotak abu-abu bercorak.
    - **Azan Priority Mode (aktif):** azan menguasai bubble peringatan — musik sistem di-*pause* otomatis, mini-player disembunyikan, dan bubble dikunci dari pesan lain (random chat / vibing) selama sesi azan berjalan (±4:11 untuk `src/assets/Adzan.wav`), lalu musik di-*resume* otomatis setelah azan selesai atau di-mute.

---

## 4. Daftar Ekspresi Visor LED BRAMO (Aktif & Rencana Kontekstual)
- **Ekspresi Dasar dan Kontekstual (Sudah Dibuat):**
  - `FORWARD`: Menatap lurus ke depan secara stabil.
  - `BLINKING`: Mengecilkan tinggi mata secara instan (`height: 2px`) secara periodik.
  - `TRACKING`: Mengikuti koordinat kursor mouse secara real-time dalam batas aman (`MAX_OFFSET`).
  - `GLANCE`: Melirik ke arah kiri, kanan, atas, atau serong secara acak saat mode idle.
  - `WHISTLE` / `MUMBLE` / `HAPPY-OPEN`: Variasi bentuk mulut LED interaktif.
- **Ekspresi kontekstual aktif:**
  - `MUSIC_VIBE` **(aktif):** Mata berubah jadi equalizer LED, mulut pulse seperti humming, visor memakai palet warna berbasis judul/artist, dan speech bubble memakai kalimat vibing.
  - `GAMING_FOCUS` **(aktif, Windows):** Mendeteksi proses game yang dikenal saat menjadi foreground, lalu mengubah mata ke ekspresi fokus dan memasang kacamata gaming serta headset bermikrofon dengan LED merah. HUD menampilkan RTT TCP internet sebagai perkiraan koneksi umum (bukan ping server game). Pemeriksaan lokal berjalan tiap 3 detik; alarm bangun tidur dan azan tetap mendapat prioritas visual.
  - `SLEEPING`: Mata terpejam dan mulut tenang; idle lama menambah ekspresi sigh/yawn terpisah.
  - `SUCCESS / FILE_DROP`: Reaksi sukses file/clipboard memakai mata cerah dan senyum.
  - `ERROR / WARNING`: Belum ada ekspresi visor silang universal; beberapa fitur sudah menampilkan bubble error kontekstual.

---

### Animasi Buddy Kontekstual (Sudah Aktif)
- Klik kapsul: BRAMO menyapa; setelah lebih dari 90 detik tanpa interaksi ia memakai reaksi reuni. Setelah idle 15–90 detik, ada peluang kecil reaksi kaget.
- Panel dropdown atau Pomodoro yang dimulai memicu ekspresi berpikir. Empat panel berbeda yang dibuka dalam 45 detik memicu reaksi sibuk.
- Sesi fokus memberi dukungan singkat setiap 8 menit selama Pomodoro masih berjalan; sesi fokus selesai memicu anggukan setuju.
- Progres fokus harian tersimpan terpisah pada `bramo.buddy.daily.v1`; pencapaian 2, 4, dan 6 sesi memberi apresiasi. Hitungan harian berganti otomatis mengikuti tanggal lokal.
- Mood berubah sesuai aktivitas: ceria setelah interaksi, tenang setelah 90 detik, dan mengantuk setelah 3 menit. Mood hanya mengubah tampilan visor dan tidak mengubah geometri/window.
- Sapaan pagi (sebelum pukul 11) dan malam (mulai pukul 19) maksimal sekali per hari, disimpan dengan tanggal lokal.
- Saat musik aktif, mata bergerak seperti equalizer, badan bergoyang halus, dan mulut berubah seperti sedang bernyanyi.
- Reaksi lain yang sudah tersedia: XP/level-up, klik/sapa, bangun, fokus/istirahat, sukses launcher, idle peek/stretch/sigh/yawn, typing-curious, goyangan pusing, serta sukses file/clipboard. Animasi mencakup mata, mulut, visor, dan badan sesuai konteks.
- Kedip otomatis dibatalkan saat BRAMO tidur; idle animation tidak berjalan saat tidur, window tersembunyi, dropdown terbuka, atau aktivitas khusus berlangsung.
## 5. Roadmap Fitur Masa Depan (Todo List Pembahasan)
- [x] **Level & Accessory Unlock System (Gamifikasi):** Sistem XP/level berdasarkan interaksi harian (sering di-drag, diklik, atau dipakai mangkal), di mana pengguna bisa membuka/unlock aksesoris baru (macam-macam topi pixel, skin visor warna-warni, atau stiker LED) lewat *reward milestone*.
- [x] **Prayer Reminder:** Fitur pengingat waktu sholat interaktif yang terintegrasi dengan speech bubble BRAMO, toggle, audio azan, mute, dan test reminder.
- [x] **Window Position Persistence:** Menyimpan posisi terakhir koordinat BRAMO di local storage agar posisinya tidak reset saat aplikasi direstart.
- [x] **Functional Music Player:** Kontrol `⏮`, `⏸/▶`, `⏭` memakai Windows Media Session API tanpa memunculkan media overlay; membaca judul/artist/status play, menampilkan mini-player adaptif di bawah BRAMO, serta menyembunyikan kontrol saat tidak ada media aktif.
- [x] **Interactive File Drop Zone:** Drop file dari Explorer diterima widget dengan metadata, Open/Show in Folder, dan riwayat 5 file terakhir.
- [x] **System Stats Monitor (CPU / RAM / Battery):** Widget quick-action pemantau CPU/RAM/Battery real-time dengan reaksi amber saat resource tinggi.
- [x] **Azan Priority Mode:** Musik sistem otomatis di-*pause* + bubble azan dikunci dari pesan lain selama sesi azan, musik *auto-resume* setelah azan selesai.
- [x] **Autostart UI Toggle:** Plugin `tauri-plugin-autostart` sudah terpasang, dan toggle ON/OFF kini tersedia di panel Power.
- [x] **Custom Themes & Color Palette:** Fitur kustomisasi warna LED visor (pilihan tema: *Cyberpunk Cyan*, *Matrix Green*, *Neon Pink*, *Amber Orange*).
- [x] **Productivity / Pomodoro Timer:** Timer fokus kerja terintegrasi dengan maskot yang memberikan motivasi atau teguran lewat *speech bubble*.
- [x] **Quick App / Web Launcher:** Pintasan cepat untuk membuka aplikasi favorit atau web link langsung dari panel dropdown BRAMO.

---

## 6. Progress Selesai & Isu Terbaru (Active Debugging)
- **Fitur Selesai (Completed):**
  - Transparansi frameless penuh dan perilaku *click-through* area kosong.
  - Fisika drag-and-drop, wiggle, landing bounce, dan snap ke tengah atas.
  - Ekspresi visor otonom, berkedip, melirik, chat kontekstual, mood bertahap, sapaan waktu, dan animasi buddy mata/mulut/badan.
  - UI adaptif untuk speech bubble (di atas layar) dan panel dropdown (di bawah layar).
  - **Dual-Mode Height Awareness & Saved Compact Y:** Sistem buka-tutup dropdown dinamis (`90px` vs `270px`) yang mengunci koordinat awal pakai `savedCompactY` dan `wasFlipped` agar posisi window presisi dan tidak menembus batas taskbar.
  - **Quick-Action Dropdown:** Music, Stats, File, Power, dan Prayer kini memakai tombol fitur sehingga hanya satu panel terbuka.
  - **Prayer Reminder + Audio Azan:** Jadwal lima waktu, toggle reminder/audio, test berurutan, mute, attention bubble, animasi mulut/mata, dan pergantian cowboy hat ke peci saat azan.
  - **Transparent Hit Area:** Padding transparan di atas kapsul tidak lagi menangkap klik; native window compact dirapatkan ke topi, kapsul, dan tab.
  - **System Media Session & Now Playing:** Mini-player otomatis muncul saat media aktif, menampilkan judul/artist dan kontrol media, dengan mode Music Vibe dan chat bubble bertema musik.
  - **Azan/Media Isolation:** Audio azan, session berjudul BRAMO, dan periode setelah mute diabaikan oleh deteksi musik agar tidak bentrok dengan reminder, dropdown, atau mini-player.
  - **Dropdown/Media Layer Separation:** Mini-player disembunyikan saat dropdown terbuka; bubble dan mini-player memakai layout serta perhitungan tinggi native yang terpisah agar tidak saling menimpa atau flicker.
  - **Azan Priority Mode:** Musik di-pause otomatis, mini-player disembunyikan, bubble terkunci selama azan, musik auto-resume setelah azan selesai atau di-mute.
  - **Autostart toggle di panel Power** (`plugin:autostart|is_enabled|enable|disable`).
  - **Media event-driven:** Rust meng-cache `GlobalSystemMediaTransportControlsSessionManager` dan emit `bramo://media` tiap 2,5 detik; frontend tidak lagi polling WinRT.
  - **Clipboard single-source:** Rust menjadi satu-satunya sumber deteksi clipboard; isi clipboard asli dikirim ke bubble.
  - **Quit confirm in-app:** bubble "klik lagi" + tombol "Confirm?" dengan timeout 3 detik, tanpa `window.confirm()`.
  - **Multi-monitor clamp:** `win.currentMonitor()` menentukan batas area kerja, bukan `window.screen`.
  - **CPU% valid:** sampler `sysinfo` persisten di Rust, bukan `System::new()` per panggilan.
  - **Anti command injection:** buka file/shortcut memakai `explorer.exe`, tanpa `cmd /C start`.
  - **Watcher gate:** thread clipboard dan `rdev` berhenti emit saat toggle OFF.
- **Fokus / Isu Terbaru (setelah sprint Polish & Stabilisasi):**
  - [x] Presisi batas bawah layar saat ditarik (*drag release*) dalam kondisi dropdown tertutup maupun terbuka sudah ditangani. Kalkulasi *bottom safety lock* kini membaca tinggi aktual native window, termasuk setelah resize dropdown dan pada skenario DPI scaling umum.
  - [x] Interactive File Drop Zone menerima file, menampilkan metadata, menyediakan Open/Show in Folder, dan menyimpan riwayat lima file terakhir.
  - [x] Custom Themes tersedia untuk Cyberpunk Cyan, Matrix Green, Neon Pink, dan Amber Orange dengan persistence.
  - [x] Dropdown otomatis menutup saat blur atau idle 12 detik.
  - [x] Sleep Mode BRAMO mengecilkan seluruh maskot tanpa mensleep OS, tetap bisa dibangunkan dan langsung di-drag; kedip dibatalkan saat tidur dan anchor resize mengikuti posisi atas/bawah.
  - [x] Pomodoro Timer tersedia dengan focus/break configurable, mini-timer floating, layout adaptif, dukungan fokus tiap 8 menit, serta apresiasi target harian 2/4/6 sesi.
  - [x] Quick Launcher untuk URL/path aplikasi dengan persistence.
  - [x] System Tray + Auto-start: menu Show/Hide/Sleep/Quit dan plugin autostart Tauri.
  - [x] Fullscreen companion mode dengan pengecualian ChatGPT/Codex.
  - [x] DPI-aware native sizing berbasis Windows scale factor.
  - [x] `identifier` aplikasi → `com.bramo.companion` (localStorage, tema, pomodoro, dan launcher reset satu kali setelah migrasi).

---

## 7. Sprint: Polish & Stabilisasi (SUDAH DIJALANKAN)

> Status: **sprint selesai dieksekusi**. Dokumen ini tetap menjadi rujukan tunggal; checklist ringkas ada di `todo.md`.

### Hasil Eksekusi
- **Batch 1 — selesai.** `package.json` rapi (tanpa `main`, description polos, script `tauri`/`dev`/`build`/`check`), `.gitignore` root ditambahkan, `node_modules` dilepas dari git index, `identifier` → `com.bramo.companion`, `productName` → `BRAMO`.
- **Batch 2 — selesai.** `SystemSampler` persisten (`app.manage`), `explorer.exe` menggantikan `cmd /C start`, gate clipboard + typing via `AtomicBool`, tray emit `bramo://tray-action`, media event-driven dengan cache WinRT manager, plus command baru `get_clipboard_text`.
- **Batch 3 — selesai.** Quit confirm in-app, clipboard single-source, `computeTargetWindowSize()` + `applyWindowLayout({ anchor })`, toggle autostart di panel Power, clamp multi-monitor via `win.currentMonitor()`, dan `listen('bramo://media')` menggantikan polling frontend.
- **Batch 3A — selesai.** Azan Priority Mode sesuai pseudocode: bubble terkunci, musik auto-pause/resume, mute dan autoplay-blocked tetap menutup sesi dengan rapi.
- **Batch 4 — selesai.** `README.md`, `todo.md`, `CONTEXT.md`, dan `SUMMARY.md` diselaraskan dengan kondisi kode.

### Masalah Terverifikasi (hasil audit kode)
| Lokasi | Masalah | Dampak |
|---|---|---|
| `src-tauri/src/lib.rs:72` | `get_system_stats` membuat `System::new()` tiap panggilan; sysinfo butuh 2 sample | **CPU% selalu 0%** |
| `src-tauri/src/lib.rs:125,157,260` | `cmd /C start "" <path>` dipakai untuk buka file & shortcut | *Command injection* kalau path/URL punya `&` |
| `src-tauri/src/lib.rs:352` | Thread poll clipboard (arboard) jalan tiap 1,5s walau toggle OFF | Boros resource background |
| `src-tauri/src/lib.rs:310` | Tray "Sleep" hanya `hide()`, tidak memicu mode tidur frontend | Perilaku beda dari tombol Sleep di panel Power |
| `src-tauri/src/lib.rs:323` | `rdev` emit `bramo://typing` terus walau toggle OFF | Event jadi sia-sia saat toggle mati |
| `src-tauri/src/lib.rs:36` | `GlobalSystemMediaTransportControlsSessionManager::RequestAsync()` diulang tiap 2,5s | Overhead WinRT tiap polling |
| `src/main.js:686` | Bubble azan ditampilkan sebelum `playAdhan()`; `isAdhanPlaying` baru true saat event `'play'` | Bubble azan bisa **ditimpa** pesan vibing/random chat |
| `src/main.js:571` | Kalau `audioEnabled === false`, `playAdhan()` return → `isAdhanPlaying` tidak pernah true | Bubble **tidak terlindungi sama sekali** |
| `src/main.js:583` | `suppressMediaUntil` hanya 8 detik, azan durasi ±4:11 | Guard habis di tengah azan |
| `src/main.js:829` | Clipboard di-watch dua kali (Rust arboard + `navigator.clipboard`) | Event dobel |
| `src/main.js:252` | `dropdownToggle.click()` async lalu langsung resize | Race dua resize berebut |
| `src/main.js:1162` | `updateAdaptivePositioning` pakai `window.screen` | Multi-monitor bisa clamp ke display yang salah |
| `src/main.js:278` | `window.confirm()` di webview frameless | Dialog sering muncul di belakang window |
| `package.json` | Tidak ada script `tauri`/`dev` | `npm run tauri dev` di README **gagal** |
| `package.json` | `description` berisi markdown, `main` menunjuk `index.js` yang tidak ada | Metadata tidak rapi |
| git index | 30 file `node_modules` ikut ter-commit | Repo membengkak |
| `src-tauri/tauri.conf.json` | `identifier` masih `com.tauri.dev`, `productName` `bramo` | Placeholder, tidak cocok untuk rilis |

### Batch 1 — Repo hygiene & build script
- `package.json`: perbaiki `description`, hapus `main`, tambah scripts `tauri`, `dev`, `build`, `check` (`node --check src/main.js`).
- `.gitignore` baru di root: `node_modules/`, `src-tauri/target/`, `dist/`, `*.log`.
- `git rm -r --cached node_modules` (file tetap ada di disk).
- `src-tauri/tauri.conf.json`: `identifier` → `com.bramo.companion`, `productName` → `BRAMO`.
  - Konsekuensi: app data dir berubah → `localStorage` (posisi, tema, pomodoro, launcher) **reset satu kali**.

### Batch 2 — Perbaikan Rust (`src-tauri/src/lib.rs`)
1. **CPU% valid:** `SystemSampler { inner: Mutex<(System, Instant)> }` di-*manage* via `app.manage(...)`; refresh maksimal 1x/500ms supaya `global_cpu_usage()` punya delta valid.
2. **Anti command injection:** Windows gunakan `explorer.exe <target>` untuk buka file/shortcut dan `explorer.exe /select,<path>` untuk *reveal in folder*. macOS/Linux tetap `open` / `xdg-open`.
3. **Clipboard gate:** `AtomicBool` + command `set_clipboard_watcher(enabled: bool)`; thread hanya membaca clipboard saat aktif. Tambah command `get_clipboard_text() -> Option<String>`.
4. **Tray delegasi ke frontend:** Rust emit `bramo://tray-action` dengan payload `show` / `hide` / `sleep` / `quit`; frontend menjalankan mode tidur yang sama sungguhan. `quit` tetap native sebagai fallback.
5. **Typing gate:** `AtomicBool` + command `set_typing_watcher(enabled: bool)` supaya `rdev` tidak emit saat toggle OFF.
6. **Media event-driven:** thread Rust menyimpan cache `GlobalSystemMediaTransportControlsSessionManager`, mengambil snapshot tiap 2,5 detik lalu `emit("bramo://media", MediaInfo)`, termasuk emit pertama saat start. Command `get_media_info` tetap ada untuk refresh on-demand (mis. setelah klik tombol media).

### Batch 3 — Perbaikan Frontend (`src/main.js`, `src/index.html`, `src/style.css`)
1. **Quit confirm in-app:** buang `window.confirm()`, pakai bubble + tombol "click again to confirm" dengan timeout 3 detik.
2. **Clipboard single-source:** Rust jadi sumber tunggal; polling `navigator.clipboard` hanya fallback saat `invoke` tidak tersedia (preview di browser). Event Rust → `get_clipboard_text` → tampilkan isi asli di bubble.
3. **Satu sumber ukuran window:** satukan `computeTargetWindowSize()` (expanded > media+pomodoro > media > pomodoro > compact, dengan override saat sleeping) dan `applyWindowLayout({ anchor })`; dipakai oleh sleep, wake, toggle dropdown, sync media, sync pomodoro, dan bubble.
4. **Autostart UI:** toggle di panel Power → `plugin:autostart|is_enabled` saat load, `plugin:autostart|enable|disable` saat diubah, preferensi disimpan di `localStorage`, bubble error bila gagal. Permission `autostart:default` sudah mengizinkan ketiganya.
5. **Multi-monitor clamp:** ganti `window.screen` dengan `win.currentMonitor()` (posisi & ukuran fisik) dikombinasikan dengan `screen.availHeight * devicePixelRatio` untuk work area taskbar.
6. **Media event-driven di frontend:** `listen('bramo://media')` menggantikan `setInterval(updateMediaInfo, 2500)`; simpan `lastMediaState { active, playing }` untuk dipakai Azan Priority Mode.

### Batch 3A — Azan Priority Mode
```
beginAdhanSession(nama, withAudio)
  adhanSessionActive = true       // SEBELUM bubble.show -> bubble terkunci
  clearMusicMode()                // mini-player hilang, music vibe mati
  await pauseMediaForAdhan()      // control_media 'play-pause' kalau sedang main
  suppressMediaUntil = now + 5 menit
  showBramoMessage(`Saatnya menunaikan sholat ${nama} 🤲`, null, true)
  withAudio ? playAdhan() : setTimeout(endAdhanSession, 15000)

endAdhanSession()                 // idempotent
  adhanSessionActive = false
  await resumeMediaAfterAdhan()   // resume HANYA kalau get_media_info masih paused
  suppressMediaUntil = now + 3 detik
  hideBramoMessage()
```
- State baru: `adhanSessionActive`, `mediaPausedByAdhan`, `adhanResumeTimer`, `ADHAN_SUPPRESS_MS = 5 * 60 * 1000`.
- `resumeMediaAfterAdhan()` mengecek `get_media_info` lebih dulu supaya tidak mengganggu jika user sudah play/pause manual.
- Guard yang diganti dari `isAdhanPlaying` ke `adhanSessionActive`: `showBramoMessage()` (bubble), handler media, `triggerRandomChat()`, listener clipboard & typing.
- Wiring audio: `'ended'` dan `'pause'` → `endAdhanSession()`; `playAdhan()` catch (autoplay blocked) → `endAdhanSession()`; tombol Mute → `stopAdhan()` → `'pause'` → musik resume.
- Entry point diganti: tombol Test Reminder dan scheduler waktu sholat → `beginAdhanSession(nama, audioEnabled)`.
- Keputusan produk: musik **auto-resume** setelah azan selesai; kalau Audio OFF, musik tetap di-pause selama 15 detik lalu resume; Test Reminder ikut pause musik.
- Dependency: butuh `lastMediaState` dari Batch 3.6; fallback ke `isMusicVibing` bila event media belum tersedia.

### Batch 4 — Sinkronisasi dokumen
- `README.md`: pindahkan fitur yang belum ada (wardrobe/EXP, SFX 8-bit, bio-rhythm reminder, cache cleaner, to-do + alarm, clipboard history, animasi battery charging, active tracker, overwork warning, snooze/AFK, 6 tema) ke bagian **Roadmap**; perbaiki perintah `npm run tauri dev` → `npm run dev`; perbaiki URL clone.
- `todo.md`: tandai ulang item yang sudah selesai dan masukkan checklist sprint ini.
- `CONTEXT.md`: koreksi ukuran window, tambahkan Azan Priority Mode, perbarui bagian Fokus.
- `SUMMARY.md`: selaraskan daftar fitur dengan kondisi kode.

### Verifikasi Sprint
1. [x] `npm run check` (syntax check `src/main.js`).
2. [x] `cargo check --manifest-path src-tauri/Cargo.toml` lalu `cargo clippy --manifest-path src-tauri/Cargo.toml` (bersih, tanpa warning).
3. [x] `npm run build` (bundle Tauri harus lolos).
4. [ ] Uji manual: drag + snap · 7 panel dropdown · toggle autostart (periksa registry `Run`) · tray show/hide/sleep/quit · sleep lalu wake · pomodoro · mini-player · hide in fullscreen · clipboard on/off (event tunggal) · **CPU% bukan 0 lagi** · clamp multi-monitor · DPI 125% dan 150%.
5. [ ] Uji skenario azan: musik main → jadwal Prayer / Test Reminder dipicu → musik **pause**, mini-player hilang, bubble azan **tidak tertimpa** selama azan berjalan → azan selesai → musik **auto-resume** · mute di tengah jalan → musik resume · Audio OFF → pause 15 detik lalu resume.

### Di Luar Scope Sprint Ini
- Refactor `src/main.js` monolit (1.650 baris) menjadi modul.
- Implementasi fitur README yang belum ada (wardrobe/EXP, SFX 8-bit, bio-rhythm, cache cleaner, to-do + alarm).
- E2E visual multi-monitor mendalam.

- Fokus berikutnya: refactor monolit `src/main.js` menjadi modul, pengujian visual end-to-end, dan penyempurnaan edge case multi-monitor. Gaming Focus sudah berjalan di Windows untuk proses game yang dikenali.
