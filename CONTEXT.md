# BLUEPRINT PROYEK: BRAMO (Cyberpunk LED Visor Desktop Companion)

## 1. Ikhtisar Proyek & Filosofi Inti
- **Nama Proyek:** BRAMO (Cyberpunk Desktop Companion / Interactive Top-Bar Widget)
- **Target Platform:** Desktop (Windows / macOS / Linux via Tauri v2)
- **Konsep Utama:** Asisten kapsul desktop interaktif bertema cyberpunk yang dilengkapi wajah visor LED hidup, gelembung dialog komik (speech bubble), fisika drag-and-drop, serta panel dropdown utilitas yang bisa dilipat.
- **Tantangan Arsitektur Utama:** Menyeimbangkan transparansi penuh pada window OS dan kemampuan *click-through* (`pointer-events: none` pada background) dengan elemen interaktif (`pointer-events: auto`), serta melakukan *resize* ukuran window secara dinamis (`win.setSize`) antara **Mode Compact** (`90px`), **Mode Music** (`162px`), dan **Mode Expanded** (`270px`) tanpa menembus batas layar atau taskbar.

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
   - Menekan `#dropdownToggle` beralih antara **Mode Compact** (`90px`) dan **Mode Expanded** (`270px`), dengan retry/verifikasi `outerSize()` setelah `setSize()`.
   - Menggunakan `savedCompactY` dan `wasFlipped` untuk mencegah pergeseran kumulatif saat dropdown dibuka-tutup.
6. **Window Position Persistence & Bubble Sizing**:
   - Posisi terakhir disimpan di `localStorage` dan dipulihkan saat startup.
   - Ukuran native window mengikuti compact, expanded, dan speech bubble aktif.
   - Speech bubble berpindah ke bawah saat BRAMO di atas layar dan ke atas topi saat BRAMO di bawah layar.
7. **System Stats & Prayer Reminder**:
   - CPU/RAM diambil dari Rust command `get_system_stats` menggunakan `sysinfo`; battery memakai WebView Battery API.
   - Prayer Reminder mengambil lima waktu sholat dari Aladhan API berdasarkan geolocation, dengan fallback Jakarta.
   - Reminder memiliki toggle ON/OFF, audio ON/OFF, tombol test berurutan Subuh-Zuhur-Asar-Magrib-Isya, tombol mute, dan audio `src/assets/Adzan.wav`.
   - Selama azan: bubble attention tetap tampil, visor amber, mulut animasi melafalkan, mata menghayati, dan cowboy hat berubah menjadi peci kotak abu-abu bercorak.

---

## 4. Daftar Ekspresi Visor LED BRAMO (Aktif & Rencana Kontekstual)
- **Ekspresi Dasar (Sudah Dibuat):**
  - `FORWARD`: Menatap lurus ke depan secara stabil.
  - `BLINKING`: Mengecilkan tinggi mata secara instan (`height: 2px`) secara periodik.
  - `TRACKING`: Mengikuti koordinat kursor mouse secara real-time dalam batas aman (`MAX_OFFSET`).
  - `GLANCE`: Melirik ke arah kiri, kanan, atas, atau serong secara acak saat mode idle.
  - `WHISTLE` / `MUMBLE` / `HAPPY-OPEN`: Variasi bentuk mulut LED interaktif.
- **Roadmap Ekspresi Kontekstual (Akan Datang):**
  - `MUSIC_VIBE` **(aktif):** Mata berubah jadi equalizer LED, mulut pulse seperti humming, visor memakai palet warna berbasis judul/artist, dan speech bubble memakai kalimat vibing.
  - `GAMING_FOCUS`: Mata menyipit tajam penuh konsentrasi (bentuk `> <` atau garis fokus), mulut lurus serius saat mendeteksi aplikasi game berjalan.
  - `SLEEPING / IDLE_DEEP`: Mata tertutup garis datar (`- -`), animasi mulut kecil tanda bernapas lambat saat pengguna meninggalkan PC dalam waktu lama.
  - `SUCCESS / FILE_DROP`: Mata berbinar bintang (`★ ★`), mulut terbuka lebar gembira saat file berhasil di-drop ke widget.
  - `ERROR / WARNING`: Mata berbentuk silang (`X X`) atau berkedip merah cepat saat terjadi kendala sistem.

---

## 5. Roadmap Fitur Masa Depan (Todo List Pembahasan)
- [ ] **Level & Accessory Unlock System (Gamifikasi):** Sistem XP/level berdasarkan interaksi harian (sering di-drag, diklik, atau dipakai mangkal), di mana pengguna bisa membuka/unlock aksesoris baru (macam-macam topi pixel, skin visor warna-warni, atau stiker LED) lewat *reward milestone*.
- [x] **Prayer Reminder:** Fitur pengingat waktu sholat interaktif yang terintegrasi dengan speech bubble BRAMO, toggle, audio azan, mute, dan test reminder.
- [x] **Window Position Persistence:** Menyimpan posisi terakhir koordinat BRAMO di local storage agar posisinya tidak reset saat aplikasi direstart.
- [x] **Functional Music Player:** Kontrol `⏮`, `⏸/▶`, `⏭` memakai Windows Media Session API tanpa memunculkan media overlay; membaca judul/artist/status play, menampilkan mini-player adaptif di bawah BRAMO, serta menyembunyikan kontrol saat tidak ada media aktif.
- [ ] **Interactive File Drop Zone:** Implementasi fungsional *drag-and-drop file* sungguhan untuk memproses atau membuka file cepat melalui widget.
- [x] **System Stats Monitor (CPU / RAM / Battery):** Widget quick-action pemantau CPU/RAM/Battery real-time dengan reaksi amber saat resource tinggi.
- [ ] **Custom Themes & Color Palette:** Fitur kustomisasi warna LED visor (pilihan tema: *Cyberpunk Cyan*, *Matrix Green*, *Neon Pink*, *Amber Orange*).
- [ ] **Productivity / Pomodoro Timer:** Timer fokus kerja terintegrasi dengan maskot yang memberikan motivasi atau teguran lewat *speech bubble*.
- [ ] **Quick App / Web Launcher:** Pintasan cepat untuk membuka aplikasi favorit atau web link langsung dari panel dropdown BRAMO.

---

## 6. Progress Selesai & Isu Terbaru (Active Debugging)
- **Fitur Selesai (Completed):**
  - Transparansi frameless penuh dan perilaku *click-through* area kosong.
  - Fisika drag-and-drop, wiggle, landing bounce, dan snap ke tengah atas.
  - Ekspresi visor otonom, berkedip, melirik, dan chat speech bubble dinamis.
  - UI adaptif untuk speech bubble (di atas layar) dan panel dropdown (di bawah layar).
  - **Dual-Mode Height Awareness & Saved Compact Y:** Sistem buka-tutup dropdown dinamis (`90px` vs `270px`) yang mengunci koordinat awal pakai `savedCompactY` dan `wasFlipped` agar posisi window presisi dan tidak menembus batas taskbar.
  - **Quick-Action Dropdown:** Music, Stats, File, Power, dan Prayer kini memakai tombol fitur sehingga hanya satu panel terbuka.
  - **Prayer Reminder + Audio Azan:** Jadwal lima waktu, toggle reminder/audio, test berurutan, mute, attention bubble, animasi mulut/mata, dan pergantian cowboy hat ke peci saat azan.
  - **Transparent Hit Area:** Padding transparan di atas kapsul tidak lagi menangkap klik; native window compact dirapatkan ke topi, kapsul, dan tab.
  - **System Media Session & Now Playing:** Mini-player otomatis muncul saat media aktif, menampilkan judul/artist dan kontrol media, dengan mode Music Vibe dan chat bubble bertema musik.
  - **Azan/Media Isolation:** Audio azan, session berjudul BRAMO, dan periode setelah mute diabaikan oleh deteksi musik agar tidak bentrok dengan reminder, dropdown, atau mini-player.
  - **Dropdown/Media Layer Separation:** Mini-player disembunyikan saat dropdown terbuka; bubble dan mini-player memakai layout serta perhitungan tinggi native yang terpisah agar tidak saling menimpa atau flicker.
- **Fokus / Isu Terbaru:**
  - [x] Presisi batas bawah layar saat ditarik (*drag release*) dalam kondisi dropdown tertutup maupun terbuka sudah ditangani. Kalkulasi *bottom safety lock* kini membaca tinggi aktual native window, termasuk setelah resize dropdown dan pada skenario DPI scaling umum.
  - [x] Interactive File Drop Zone menerima file, menampilkan metadata, menyediakan Open/Show in Folder, dan menyimpan riwayat lima file terakhir.
  - [x] Custom Themes tersedia untuk Cyberpunk Cyan, Matrix Green, Neon Pink, dan Amber Orange dengan persistence.
  - [x] Dropdown otomatis menutup saat blur atau idle 12 detik.
  - [x] Sleep Mode BRAMO mengecilkan seluruh maskot tanpa mensleep OS, tetap bisa dibangunkan dan langsung di-drag.
  - [x] Pomodoro Timer tersedia dengan focus/break configurable, mini-timer floating, dan layout adaptif terhadap music player serta speech bubble.
  - Fokus berikutnya: pengujian visual end-to-end dan penyempurnaan state persistence/edge case multi-monitor.
