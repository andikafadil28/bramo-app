# 🤖 BRAMO — Interactive Cyber Visor & Tech Buddy

> **BRAMO** (Brader Visor / Tech Buddy) adalah aplikasi desktop *floating top bar widget* interaktif untuk Windows 10/11. Menggabungkan utilitas produktivitas, pemantau kesehatan berbasis *human bio-rhythm*, sistem *active-time gamification*, dan *digital pet companion* berwajah LED Visor Robot.

---

## ✨ Features Highlight

### 1. 🤖 Dynamic LED Visor Robot
- **Interactive Eye States:** Cursor tracking, auto-blink, digital glitch, AFK sleep (`z Z z`), dan reaksi *gesture* (Petting `[♥ ♥]`, Shake Dizzy `[@ @]`, Poking Sneeze `[> o <]`).
- **Color Themes:** Cyber Cyan, Matrix Green, Neon Purple, Amber, Red Alert, dan Dynamic RGB Cycle.
- **Unlockable Wardrobe:** Sistem kostum & aksesoris pixel (*Party Hat*, *Cowboy Hat*, *Deal With It Shades*, *RGB Headset*, hingga *Gold Crown*).
- **Retro 8-Bit Audio Engine:** *Feedback* suara unik untuk tiap interaksi lengkap dengan *Master Volume* & *Global Mute toggle*.

### 2. 🧰 Core Productivity Utilities
- **Temporary File Shelf ("Perut BRAMO"):** *Drop zone* staging area file sementara + **Clipboard History** (5 item terakhir).
- **Universal Media Controller:** Integrasi pemutar musik (Spotify/YouTube) + *LED Equalizer beat effect*.
- **Quick To-Do & Smart Alarm:** Checklist tugas harian + preset alarm instan (`+15m`, `+30m`) dengan animasi lonceng `[🔔 🔔]`.

### 3. 🍖 Digital Feeding & PC Maintenance
- **Jus RAM Soda (`🥤`):** "Suapin" BRAMO untuk eksekusi pembersihan *cache/standby memory* PC.
- **Snack Junk File (`🍿`):** "Suapin" file temp untuk pembersihan otomatis folder `%TEMP%`.
- **Battery Charging:** Animasi *power boost* khusus saat laptop dicolok charger.

### 4. 🧠 Human-Centric Care & Active Work Tracker
- **Proof-of-Work Active Tracker:** EXP waktu aktif cuma bertambah saat lu bener-bener produktif ngetik/gerakkin kursor (Anti-AFK auto-pause setelah 2 menit).
- **Human Bio-Rhythm Reminders:** Notifikasi alami waktu Sarapan, 10 AM Coffee Break, Lunch Time, Micro-Hydration (tiap 1.5–2 jam aktif), 4 PM Snack Slump, dan Makan Malam.
- **Prayer & Overwork Alerts:** Countdown waktu sholat + *auto-pause* media, serta *overwork warning* (peringatan peregangan/encok) setelah 5+ jam aktif.
- **Smart Anti-Spam:** *Smart Snooze* 2–3 jam, *AFK Lunch Auto-Detection*, dan *Fullscreen/Gaming DND Mode*.

---

## 🛠️ Tech Stack

- **Engine:** [Tauri v2](https://tauri.app/) (Rust Backend + HTML/CSS/JS Frontend)
- **Frontend:** Vanilla HTML5, CSS3 (CSS Variables), Modular Modern JS (ES6+)
- **Audio:** Web Audio API (8-bit Synthesizer/SFX)
- **Target OS:** Windows 10/11 (Frameless, Transparent, Always-on-Top)
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
git clone [https://github.com/USERNAME_GITHUB_LU/bramo-app.git](https://github.com/USERNAME_GITHUB_LU/bramo-app.git)
cd bramo-app

# Install dependencies
npm install

# Run in Development Mode
npm run tauri dev