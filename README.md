# 🤖 BRAMO — Interactive Cyber Visor & Tech Buddy

> **BRAMO** (Brader Visor / Tech Buddy) adalah aplikasi desktop *floating top bar widget* interaktif untuk Windows 10/11. Menggabungkan utilitas produktivitas, pengingat waktu sholat, pemantau sistem, dan *digital pet companion* berwajah LED Visor Robot.

---

## ✨ Features Highlight

> Status per blok: **[Aktif]** sudah ada di kode, **[Roadmap]** masih rencana.
> Rujukan roadmap & sprint aktif ada di `CONTEXT.md` (Section 5 dan Section 7).

### 1. 🤖 Dynamic LED Visor Robot — [Aktif]
- **Interactive Eye States:** Cursor tracking, auto-blink, dan lirik acak (glance kiri/kanan/atas).
- **Color Themes:** Cyber Cyan, Matrix Green, Neon Pink, Amber Orange (persisten di local storage).
- **Accessory:** Cowboy hat sebagai trigger snap ke tengah atas layar, peci kotak otomatis saat azan berbunyi.
- **BRAMO Journey:** XP, level, koleksi aksesori/kosmetik, unlock, dan equip.
- **Gaming Focus (Windows):** Ekspresi visor, kacamata pixel-art, dan headset bermikrofon dengan LED merah muncul saat game yang dikenali aktif; HUD menampilkan RTT internet.
- **Mouth Expressions:** Idle, siul, gumam, dan mulut terbuka senang.

### 2. 🧰 Core Productivity Utilities — [Aktif]
- **Temporary File Shelf ("Perut BRAMO"):** *Drop zone* file dari Explorer + **Open** / **Show in Folder** + riwayat 5 file terakhir.
- **Universal Media Controller:** Integrasi pemutar musik Windows (Windows Media Session) + mini-player *Now Playing* + efek *LED Equalizer beat effect*.
- **Clipboard & Typing Watcher:** Deteksi clipboard baru (sumber tunggal di sisi Rust) dan feedback ekspresif saat user mengetik.
- **Quick Launcher:** Pintasan cepat untuk URL dan aplikasi lokal (persisten).
- **Pomodoro Timer:** Focus/break configurable dengan mini-timer floating.
- **To-do & Alarm:** Pengingat satu kali untuk tiap tugas dan alarm bangun tidur harian yang berulang sampai dimatikan atau ditunda 5 menit.
- **Clipboard History:** Menyimpan hingga lima teks terakhir untuk disalin ulang.
- **BRAMO Cache Cleaner:** Membersihkan isi direktori cache aplikasi BRAMO.

### 3. 🧠 Human-Centric Care — [Aktif]
- **Prayer Reminder:** Jadwal lima waktu sholat dari Aladhan API (berbasis geolokasi, fallback Jakarta) + azan audio + bubble perhatian + animasi visor amber.
- **Azan Priority Mode:** Musik otomatis di-pause dan bubble azan dikunci dari pesan lain selama azan berjalan, lalu musik auto-resume.

### 4. 🖥️ Desktop Integration — [Aktif]
- **System Stats Monitor:** CPU / RAM / Battery real-time dengan reaksi amber saat resource tinggi.
- **Custom Themes:** 4 tema visor dengan persistence.
- **Mascot Sleep Mode:** Mode tidur visual yang tetap bisa dibangunkan dan langsung di-drag.
- **System Tray + Auto-start:** Menu Show/Hide/Sleep/Quit plus toggle autostart di panel Power.
- **Fullscreen Companion Mode:** Menyembunyikan diri di window fullscreen, dengan pengecualian ChatGPT/Codex.
- **DPI-Aware Sizing:** Ukuran native window mengikuti Windows scale factor dan monitor aktif (multi-monitor aware).
- **8-bit SFX:** Efek suara sintetis untuk interaksi UI dengan toggle ON/OFF.

### 5. 🚀 Roadmap (Belum Ada di Kode)
- **Human Bio-Rhythm Reminders:** Sarapan, coffee break, lunch, micro-hydration, snack, makan malam.
- **Proof-of-Work Active Tracker:** EXP hanya bertambah saat user benar-benar produktif, anti-AFK.
- **Advanced Cache Cleanup:** Pilihan pembersihan folder `%TEMP%` dan kategori cache lain di luar cache BRAMO.
- **Battery Charging Animation:** Reaksi visual khusus saat laptop dicolok charger.
- **Overwork Warning & Smart Snooze:** Peringatan encok setelah 5 jam kerja + snooze 2–3 jam.
- **Dynamic RGB Cycle & Red Alert Theme:** Tambahan palet tema.

---

## 🛠️ Tech Stack

- **Engine:** [Tauri v2](https://tauri.app/) (Rust Backend + HTML/CSS/JS Frontend)
- **Frontend:** Vanilla HTML5, CSS3 (CSS Variables), Modular Modern JS (ES6+)
- **Audio:** HTML5 Audio (`src/assets/Adzan.wav`)
- **Target OS:** Windows 10/11 (Frameless, Transparent, Always-on-Top) · Linux/macOS didukung sebagian
- **RAM Footprint:** Super ringan (Target 30MB – 50MB)

---

## 🚀 Getting Started (Development Setup)

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (v18+)
2. Install [Rust](https://www.rust-lang.org/tools/install) & Cargo
3. Cek panduan [Tauri Prerequisites for Windows](https://tauri.app/v1/guides/getting-started/prerequisites#windows)

### Run Locally
```bash
# Clone repository
git clone https://github.com/andikafadil28/bramo-app.git
cd bramo-app

# Install dependencies
npm install

# Run in Development Mode
npm run dev

# Build bundle (release)
npm run build

# Syntax check frontend
npm run check
```

### Dokumentasi Proyek
| File | Isi |
|---|---|
| `CONTEXT.md` | Blueprint arsitektur, status fitur, dan rencana sprint aktif (Section 7) |
| `todo.md` | Checklist sprint yang sedang berjalan + backlog roadmap |
| `SUMMARY.md` | Ringkasan fitur singkat |
| `AGENTS.md` | Aturan kerja untuk AI agent di repo ini |
