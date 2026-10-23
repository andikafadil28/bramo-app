# BLUEPRINT PROYEK: BRAMO (Cyberpunk LED Visor Desktop Companion)

## 1. Ikhtisar Proyek & Filosofi Inti
- **Nama Proyek:** BRAMO (Cyberpunk Desktop Companion / Interactive Top-Bar Widget)
- **Target Platform:** Desktop (Windows / macOS / Linux via Tauri v2)
- **Konsep Utama:** Asisten kapsul desktop interaktif bertema cyberpunk yang dilengkapi wajah visor LED hidup, gelembung dialog komik (speech bubble), fisika drag-and-drop, serta panel dropdown utilitas yang bisa dilipat.
- **Tantangan Arsitektur Utama:** Menyeimbangkan transparansi penuh pada window OS dan kemampuan *click-through* (`pointer-events: none` pada background) dengan elemen interaktif (`pointer-events: auto`), serta melakukan *resize* ukuran window secara dinamis (`win.setSize`) antara **Mode Compact** (`220x90`), **Mode Music** (`220x162`), dan **Mode Expanded** (`300x520`) tanpa menembus batas layar atau taskbar.

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
- **`.dropdown-panel`**: Panel pulau utilitas compact dengan 10 tab: Music, System Stats, File Drop, Power, Prayer, Pomodoro, Bio-rhythm, Launcher, To-do/Alarm, dan BRAMO Journey. Hanya satu utility panel aktif pada satu waktu.

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
   - Menekan `#dropdownToggle` beralih antara **Mode Compact** (`220x90`) dan **Mode Expanded** (`300x520`), dengan retry/verifikasi `outerSize()` setelah `setSize()`.
   - Ukuran native punya satu sumber: `computeTargetWindowSize()` (expanded `300x520` > media+pomodoro `220x210` > media `220x162` > pomodoro `220x140` > compact `220x90`, dengan override sleep) dan `applyWindowLayout({ anchor })`.
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

## 4. Fitur Aktif dan Ekspresi Kontekstual
- **Ekspresi Dasar dan Kontekstual (Sudah Dibuat):**
  - `FORWARD`: Menatap lurus ke depan secara stabil.
  - `BLINKING`: Mengecilkan tinggi mata secara instan (`height: 2px`) secara periodik.
  - `TRACKING`: Mengikuti koordinat kursor mouse secara real-time dalam batas aman (`MAX_OFFSET`).
  - `GLANCE`: Melirik ke arah kiri, kanan, atas, atau serong secara acak saat mode idle.
  - `WHISTLE` / `MUMBLE` / `HAPPY-OPEN`: Variasi bentuk mulut LED interaktif.
- **Ekspresi kontekstual aktif:**
  - `MUSIC_VIBE` **(aktif):** Mata berubah jadi equalizer LED, mulut pulse seperti humming, visor memakai palet warna berbasis judul/artist, dan speech bubble memakai kalimat vibing.
  - `GAMING_FOCUS` **(aktif, Windows):** Mendeteksi game foreground yang didukung, termasuk Valorant, CS2, Dota 2, League of Legends, Fortnite, Apex, Overwatch, Roblox, Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, Elden Ring, Cyberpunk 2077, GTA V, BG3, Helldivers 2, Rocket League, Dead by Daylight, Minecraft, dan Fall Guys; pola executable shipping/test umum juga dikenali. BRAMO memakai ekspresi fokus, kacamata/headset pixel dengan LED merah, dan HUD RTT TCP internet sebagai perkiraan koneksi umum (bukan ping server game). Pemeriksaan lokal berjalan tiap 3 detik; alarm bangun tidur dan azan tetap mendapat prioritas visual.
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

### Gaming Focus (Windows)
- Deteksi foreground process lokal mengenali game yang didukung; daftar nama dan pola executable ada di Section 4.
- Saat aktif, BRAMO memasang kacamata/headset pixel, mengganti ekspresi visor, dan menampilkan RTT TCP internet sebagai gambaran koneksi umum; angka tersebut bukan ping server game.
- Pemeriksaan berjalan setiap 3 detik. Alarm bangun tidur dan azan mengambil prioritas visual.

## 5. Status Fitur dan Roadmap

### Sudah tersedia
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
- [x] **Bio-rhythm Reminder:** Pengingat jeda dengan interval, test, selesai, dan snooze.
- [x] **To-do + Wake Alarm:** Daftar tugas dengan pengingat, alarm berulang berdasarkan hari, test suara, dan snooze.
- [x] **Clipboard History + Watchers:** Riwayat lima item clipboard; watcher clipboard dan typing dapat diatur.
- [x] **BRAMO Cache Cleaner:** Membersihkan cache khusus BRAMO dan melaporkan hasilnya.
- [x] **8-bit UI SFX:** Efek suara sintetis dengan toggle dan preferensi tersimpan.
- [x] **Gaming Focus (Windows):** Fokus visor, aksesori gaming pixel, dan HUD RTT internet saat game yang didukung foreground.
- [x] **Buddy Mood & Reactions:** Mood adaptif, sapaan waktu, reaksi kontekstual, serta apresiasi target Pomodoro harian.

### Backlog yang belum tersedia / perlu keputusan produk
- [x] Daftar game tambahan dari UI (nama executable), tersimpan lokal dan bisa dihapus.
- [x] Status baterai charging dengan ikon/pulse saat panel Stats dibuka.
- [x] Tracker produktivitas harian opsional yang menghitung waktu Pomodoro fokus atau Gaming Focus (dipilih pengguna).
- [x] Cache cleaner punya pilihan semua cache BRAMO atau file sementara pada subfolder cache BRAMO; tidak menyasar cache aplikasi lain.
- [x] Peringatan fokus panjang setelah ambang 60/90/120 menit dengan snooze 15 menit.
- [x] Tema RGB cycle dan red-alert.

---

## 6. Status Proyek (2026-10-22)
- **Interaksi desktop:** window frameless/transparan, drag dengan tilt dan landing bounce, snap top-center lewat klik ganda topi, persist posisi, clamp per-monitor, DPI-aware sizing, tray, dan fullscreen hide.
- **Ukuran window saat ini:** compact `220x90`, media `220x162`, Pomodoro `220x140`, media+Pomodoro `220x210`, expanded `300x520`; mode sleep memakai tinggi sesuai kombinasi media/timer. Expanded Y menjaga posisi atas/bawah dengan `savedCompactY` dan `wasFlipped`.
- **Dropdown terbaru:** tetap expanded `300x520`; flip ke atas bila ruang bawah tidak cukup dan Settings memakai scroll internal setinggi 320px.
- **Gaming Focus:** game yang didukung foreground mengunci dropdown; panel yang kebetulan terbuka ditutup saat mode ini aktif.
- **Pemulihan startup:** posisi tersimpan di-clamp ke work area monitor dan window di-show setelah pemulihan selesai.
- **Dropdown:** 10 tab aktif — Music, Stats, File, Power, Prayer, Pomodoro, Bio-rhythm, Launcher, To-do/Alarm, dan BRAMO Journey.
- **Dropdown UI/UX:** tab horizontal scrollable dengan label aksesibilitas dan navigasi keyboard; seluruh panel memakai heading, ukuran kontrol konsisten, serta scroll internal.
- **Buddy:** gaze/blink, typing-curious, idle peek/stretch/sigh/yawn, pusing saat digoyang, mood adaptif, sapaan pagi/malam, reaksi sukses/XP/level, musik, fokus, kaget, reuni, serta target fokus harian.
- **Gaming Focus (Windows):** deteksi game foreground tiap 3 detik, kosmetik gaming, ekspresi fokus, dan HUD RTT TCP internet.
- **Roadmap (2026-10-22):** pengelolaan daftar executable game, tracker produktivitas harian, indikator charging, cache cleaner per kategori aman, peringatan fokus panjang dengan snooze, serta tema RGB/red-alert sudah tersedia.
- **Produktivitas & reminder:** Pomodoro dengan dukungan fokus tiap 8 menit dan target harian 2/4/6 sesi; bio-rhythm; to-do dengan alarm; wake alarm harian dan snooze; Prayer Reminder dengan audio dan Azan Priority Mode.
- **Utilitas lain:** system stats CPU/RAM/baterai, file drop/history, clipboard history + watcher, typing curiosity, quick launcher, cache cleaner BRAMO, 8-bit SFX, tema visor, dan koleksi kosmetik.
- **Pemeriksaan kode yang pernah tercatat lolos:** `npm run check`, `cargo check`, `cargo clippy`, dan `npm run build`. Hasil tersebut tidak menggantikan uji perilaku di komputer pengguna.
- **Uji manual yang masih perlu dilakukan:** pastikan installer menampilkan BRAMO pada konfigurasi monitor pengguna; semua 10 tab dan scroll Settings; flip dekat bawah; Gaming Focus lock; drag/snap lintas monitor dan DPI; tray/sleep/wake; media, Pomodoro, reminder/alarm/azan, clipboard/typing, cache cleaner, dan autostart.

---

## 7. Sprint: Polish & Stabilisasi (SUDAH DIJALANKAN)

> Status: **sprint selesai dieksekusi**. Dokumen ini tetap menjadi rujukan tunggal; checklist ringkas ada di `todo.md`.

### Hasil Eksekusi
- **Batch 1 — selesai.** `package.json` rapi (tanpa `main`, description polos, script `tauri`/`dev`/`build`/`check`), `.gitignore` root ditambahkan, `node_modules` dilepas dari git index, `identifier` → `com.bramo.companion`, `productName` → `BRAMO`.
- **Batch 2 — selesai.** `SystemSampler` persisten (`app.manage`), `explorer.exe` menggantikan `cmd /C start`, gate clipboard + typing via `AtomicBool`, tray emit `bramo://tray-action`, media event-driven dengan cache WinRT manager, plus command baru `get_clipboard_text`.
- **Batch 3 — selesai.** Quit confirm in-app, clipboard single-source, `computeTargetWindowSize()` + `applyWindowLayout({ anchor })`, toggle autostart di panel Power, pemilihan monitor melalui `availableMonitors()` dengan fallback `currentMonitor()`, dan `listen('bramo://media')` menggantikan polling frontend.
- **Batch 3A — selesai.** Azan Priority Mode sesuai pseudocode: bubble terkunci, musik auto-pause/resume, mute dan autoplay-blocked tetap menutup sesi dengan rapi.
- **Batch 4 — selesai.** `README.md`, `todo.md`, `CONTEXT.md`, dan `SUMMARY.md` diselaraskan dengan kondisi kode.

### Riwayat Audit: Status Perbaikan dan Verifikasi

Temuan di tabel ini berasal dari audit lama. Status di bawah mencerminkan implementasi yang sekarang; label **perlu uji manual** berarti pemeriksaan kode saja belum memastikan perilaku di komputer pengguna.

| Temuan lama | Status sekarang | Catatan |
|---|---|---|
| CPU selalu 0 karena sampler dibuat ulang | **Diperbaiki di kode** | `SystemSampler` persisten di Rust; nilai CPU tetap perlu dilihat saat aplikasi berjalan. |
| Buka file/shortcut memakai `cmd /C start` | **Diperbaiki di kode** | Windows memakai `explorer.exe`; macOS/Linux memakai opener platform. |
| Clipboard/typing watcher tetap aktif atau terpasang ganda | **Diperbaiki di kode** | Rust watcher memakai gate; browser polling hanya fallback preview tanpa Tauri. |
| Tray Sleep hanya menyembunyikan window | **Diperbaiki di kode** | Aksi tray didelegasikan ke frontend; perlu uji manual tray dan wake. |
| WinRT media manager dibuat ulang setiap polling | **Diperbaiki di kode** | Manager di-cache dan snapshot dikirim melalui event. |
| Bubble azan tertimpa, audio OFF tidak mengunci sesi, atau guard habis terlalu cepat | **Diperbaiki di kode** | `adhanSessionActive` dan alur begin/end sesi mengunci bubble serta mengatur resume; perlu uji manual dengan media aktif. |
| Resize dropdown beradu dan posisi monitor salah | **Diperbaiki di kode** | Resize diserialisasi; pemilihan work area memakai monitor terdekat dari `availableMonitors()` dengan fallback. Perlu uji lintas monitor/DPI. |
| Dialog quit native muncul di belakang window | **Diperbaiki di kode** | Konfirmasi dilakukan di dalam bubble BRAMO. |
| Script/metadata package dan identifier masih placeholder | **Diperbaiki di kode** | Script `dev/build/check`, metadata, dan identifier aplikasi sudah diperbarui. |
| `node_modules` ter-commit | **Diperbaiki di Git index** | `git ls-files node_modules` saat refresh mengembalikan nol file; dependency lokal tetap ada untuk development. |

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
5. **Multi-monitor clamp:** pilih work area monitor terdekat dari `availableMonitors()` berdasarkan pusat window; fallback ke `currentMonitor()` lalu ukuran `window.screen` bila diperlukan.
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
- `README.md`: pada saat Batch 4, pindahkan fitur yang belum ada saat itu ke bagian **Roadmap**; perbaiki perintah `npm run tauri dev` → `npm run dev`; perbaiki URL clone. Status fitur terkini ada di Section 5.
- `todo.md`: tandai ulang item yang sudah selesai dan masukkan checklist sprint ini.
- `CONTEXT.md`: koreksi ukuran window, tambahkan Azan Priority Mode, perbarui bagian Fokus.
- `SUMMARY.md`: selaraskan daftar fitur dengan kondisi kode.

### Batch 5 — Media active-state fix (2026-10-22)
- Backend `media_info_from_manager()` kini menentukan `active` dari status playback (`Playing`/`Paused`) dan metadata judul/artist yang tidak kosong.
- Jika properti media gagal dibaca, snapshot menjadi inactive (bukan placeholder “Media aktif”). Sesi stopped/closed tidak lagi membuat mini-player menetap; sesi paused tetap terlihat untuk memungkinkan resume.
- Frontend debounce dua snapshot untuk perubahan active/inactive tetap dipakai agar pergantian sesi sesaat tidak membuat layout berkedip.
- Tidak menjalankan build MSI pada perbaikan ini. Perlu uji manual di Windows untuk memastikan sesi berhenti menutup panel dan sesi pause tetap tersedia.

### Refresh konteks proyek (2026-10-23)
- Expanded dipulihkan ke ukuran tetap `300x520` mengikuti baseline v1; Settings memakai scroll internal dan dropdown flip berdasar ruang atas/bawah.
- Posisi startup di-clamp ke work area monitor; Gaming Focus mengunci dropdown.
- Fitur aktif dipisahkan dari backlog. Temuan audit lama diberi status perbaikan kode atau uji manual yang masih diperlukan.

### Verifikasi Sprint
1. [x] `npm run check` (syntax check `src/main.js`).
2. [x] `cargo check --manifest-path src-tauri/Cargo.toml` lalu `cargo clippy --manifest-path src-tauri/Cargo.toml` (bersih, tanpa warning).
3. [x] `npm run build` (bundle Tauri harus lolos).
4. [ ] Uji manual: drag/snap lintas monitor dan DPI · 10 tab dropdown · tray/autostart · sleep/wake dan alarm · Pomodoro/target harian · media play/pause/stop · azan dan auto-resume · clipboard/typing watcher · file drop/cache cleaner · Gaming Focus serta fullscreen game.
5. [ ] Uji skenario azan: musik main → jadwal Prayer / Test Reminder dipicu → musik **pause**, mini-player hilang, bubble azan **tidak tertimpa** selama azan berjalan → azan selesai → musik **auto-resume** · mute di tengah jalan → musik resume · Audio OFF → pause 15 detik lalu resume.

### Di Luar Scope Sprint Ini
- Refactor `src/main.js` menjadi modul-modul yang lebih mudah dirawat.
- E2E visual mendalam untuk multi-monitor, DPI, dan interaksi antar-reminder.
- Perluas daftar game yang didukung dan evaluasi kebutuhan pengaturan allowlist dari UI.

- Fokus berikutnya: selesaikan uji manual Windows pada Section 6/7, lalu pilih antara modularisasi frontend atau perluasan Gaming Focus.

---

## 8. Handoff Historis (2026-10-22)

- **Versi stabil:** BRAMO **1.0.0**. Metadata root `package.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, dan `src-tauri/tauri.conf.json` sudah diselaraskan.
- **GitHub Release:** `v1.0.0` sudah dipublikasikan dengan `BRAMO_1.0.0_x64-setup.exe` dan `BRAMO_1.0.0_x64_en-US.msi`. Tombol unduh promo menuju `/releases/latest`.
- **Aksesibilitas kontrol azan:** bubble azan sekarang menampilkan tombol **Matikan azan** tepat di bawah pesan saat audio aktif. Tombol menghentikan playback dan mengakhiri sesi dengan alur resume media yang sama seperti kontrol Mute di panel Prayer.
- **Situs promo:** Astro di `promo-site/`, menjelaskan 11 kelompok fitur BRAMO 1.0. Deploy Cloudflare Pages otomatis hanya berlaku jika project Pages sudah tersambung ke repo, branch `main`, root `promo-site`, build `npm run build`, output `dist`. Node dipin ke 22.19.0 melalui `.nvmrc`; subdomain tujuan `bramo.dikadevit.my.id`.
- **Panduan pindah komputer:** baca `HANDOFF.md`; mulai dari `git pull origin main` di komputer rumah.
- **Menjalankan Astro:** dari `promo-site`, gunakan Node.js **22.19.0+**, `npm ci`, lalu `npm run dev`; buka alamat localhost yang ditampilkan (biasanya `http://localhost:4321/`). `npm run build` memeriksa build statis dan membuat `dist/`.
- **Isu Windows yang baru ditangani:** `npm ci` pengguna gagal `EPERM` pada `astro.win32-x64-msvc.node` karena dev server Astro yang sebelumnya dibuka masih hidup dan mengunci file. Server itu sudah dihentikan. Sebelum instal ulang dependency, hentikan server lama dengan `Ctrl+C`. Node lokal yang teramati adalah `v22.13.1`; upgrade ke `22.19.0+` agar sesuai dengan `undici` di lockfile dan menghilangkan warning engine.
- **Basis sinkronisasi sebelum catatan ini:** branch `main` sampai commit `c7321e2` (`docs: clarify Astro Node.js requirement`). Catatan handoff ini kemudian dipush sebagai commit baru; di komputer rumah jalankan `git pull origin main`.
- **Fokus lanjutan:** review tampilan halaman fitur di Astro, pastikan Cloudflare Pages tersambung dan deployment sukses, lalu lanjutkan uji manual BRAMO Windows yang tercantum pada Section 6/7. Jangan anggap uji manual tersebut selesai hanya dari build.
