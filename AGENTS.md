# AGENTS.md — BRAMO System Context & Coding Guidelines

## 🤖 Project Overview
- **Name:** BRAMO (Brader Visor / Tech Buddy)
- **Tagline:** Interactive Cyber Visor & Tech Buddy for Windows Top Bar
- **Description:** A lightweight, interactive cyberpunk/retro LED visor top bar widget for Windows 10/11. Serves as a productivity assistant, health/break reminder (tailored to human bio-rhythms), active time EXP tracker, digital pet (Tamagotchi-style feeding), and system utility container.
- **Target OS:** Windows 10/11 (Frameless, Transparent, Always-on-Top Floating Window)

---

## 🛠️ Tech Stack & Architecture Requirements
- **Framework:** Tauri v2 (Rust Backend + HTML/CSS/JS Frontend)
- **Frontend Architecture:**
  - Standard HTML5 / CSS3 / Modern Vanilla JS (ES6+) for maximum performance & zero overhead.
  - CSS Variables for all LED theme parameters (`--led-cyan`, `--led-matrix`, `--led-purple`, `--led-amber`, `--led-red`, etc.).
  - Modular Component Pattern without bloated JavaScript frameworks.
  - Target RAM Footprint: **30MB – 50MB**.
- **Audio / SFX Engine:**
  - Lightweight Web Audio API / HTML5 Audio for retro 8-bit sound effects (Feeding crunch, Task chime, Water drop, Alarm bell, Prayer chime).
  - Configurable master volume & global mute toggle saved in `%APPDATA%/Bramo/config.json`.
- **State Machine Architecture:**
  - Reactive Event-Driven State Machine (Single Source of Truth).
  - Priority State Queue: `EMERGENCY/ALERT` > `ACTION TRIGGER (File Hover/Click)` > `APP CONTEXT (VSCode/Game/Music)` > `IDLE/AFK`.
- **Data Persistence:**
  - Store configuration, level, EXP, wardrobe inventory, task list, SFX settings, and stats in `%APPDATA%/Bramo/config.json`.

---

## 📜 AI Developer Guidelines & Persona
1. **Tech Buddy Persona:** Act as a clear, direct, pragmatic tech partner.
2. **Anti-Overengineering:** Keep code simple, modular, and performant. Avoid unnecessarily complex libraries or abstractions.
3. **Copy-Paste Ready Output:** When providing code snippets, deliver complete, well-formatted, ready-to-use code blocks.
4. **Clean Separation:** Strictly separate Tauri IPC commands (Rust) from Frontend UI rendering (JS).
5. **Human-Centric UX:** Ensure all notifications respect human rest/work rhythms with strict anti-spam logic.

---

## 🎨 Complete Eye Animation & Gesture State Machine

Every animation state MUST be mapped to specific CSS classes/SVG states in the JS State Machine:

### 1. Idle & Base States
- `State: IDLE_TRACKING` — Default state. Pupils follow cursor position smoothly.
- `State: AUTO_BLINK` — Triggers every 3–5s for 0.1s (`[ -  - ]`).
- `State: DIGITAL_GLITCH` — Random 0.2s LED flicker (`[ %  # ]`) every few minutes.
- `State: AFK_SLEEP` — Triggered after 2 minutes of user inactivity. Closed eyes (`[ ∪  ∪ ]`) with floating `z Z z` text particles.
- `State: WAKE_UP` — Triggered on mouse movement after AFK. Surprised eyes (`[ 👁️ 👁️ ! ]`) before returning to IDLE.

### 2. Direct Interaction Gestures
- `State: PETTING_LOVE` — Triggered on gentle cursor drag/rubbing over eyes. Love shape (`[ ♥  ♥ ]`) or curved smile (`[ ^  ^ ]`) + red LED blush cheeks.
- `State: POKING_SNEEZE` — Triggered on repeated fast clicks/hovers. Eyes squeeze bergetar (`[ >  < ]`) -> Digital Sneeze (`[ > o < ]`) + capsule bounce.
- `State: SHAKE_DIZZY` — Triggered when user drags and shakes the capsule violently. Swirling eyes (`[ @  @ ]` / `[ 🌀  🌀 ]`) -> dizzy tilt -> annoyed pout (`[ ಠ ╭╮ ಠ ]`).

### 3. Utility & Context-Aware States
- `State: HOVER_DRAG_FILE` — Triggered when a file is dragged over the top bar. Open mouth/excited (`[ ⊙ 口 ⊙ ]`).
- `State: NOM_NOM_EATING` — Triggered when file is dropped into shelf. Alternating blink + mini loading bar loop.
- `State: MUSIC_EQUALIZER` — Active during music playback (Spotify/YouTube). Jumping audio bars (`[ ♫  ♫ ]` / `[ ||  || ]`) reacting to audio beat.
- `State: TASK_COMPLETED` — Triggered on checking a to-do task. Happy wink (`[ ^ ᴗ ^ ]`) + mini LED fireworks or "Deal With It" sunglasses (`[ 😎 ]`).
- `State: ALARM_RINGING` — Triggered on timer/alarm end. Flashing yellow/red bells (`[ 🔔  🔔 ]`) + vibrating capsule UI.
- `State: SHOLAT_ADZAN` — Triggered on prayer times. Calming green LED + serene eyes (`[ 🕌  🕌 ]`).

### 4. Feeding & System Health States
- `State: FEEDING_CHARGING` — Triggered on plugging charger (Laptop). Sparkling eyes (`[ ⚡  ⚡ ]`) + light-flow effect on capsule border.
- `State: JUS_RAM_REFRESH` — Triggered on feeding RAM Soda (PC). Fresh glitch (`[ ✨  ✨ ]`) as cache memory is cleaned.
- `State: JUNK_FILE_CLEAN` — Triggered on feeding Junk Snack. Popcorn icon animation -> chewing -> `%TEMP%` folder cleaned.
- `State: CPU_OVERHEAT` — Triggered on CPU usage >90%. Dizzy/hot eyes (`[ @_@ ]`) + Red Alert LED theme.
- `State: STARVING_LOW_BATTERY` — Triggered when power/energy <15%. Weak/dimmed eyes (`[ ~  ~ ]` or `[ - _ - ]`).

---

## ⚙️ Logic Rules for Care, Work Tracking & Progression

### Active Work Tracker (Proof of Work Logic)
- **Active Window:** Requires mouse or keyboard input within 60-second intervals.
- **AFK Threshold:** 2 minutes without input automatically pauses work timer and enters `AFK_SLEEP`.
- **EXP Calculation:**
  - `+25 EXP` per 15 minutes of verified active time.
  - `+150 EXP` bonus for completing a 1-hour continuous active focus streak.
  - `+50 EXP` per completed task item.
  - `+20 EXP` per feeding action (Jus RAM, Junk Clean, Charger).
  - `+30 EXP` for daily first login.
  - `+40 EXP` for taking timely breaks/prayer breaks.

### Smart Bio-Rhythm & Anti-Spam Care Logic
- **Smart Snooze:** Clicking "Bentar lagi / Focus" mutes the specific reminder for 2–3 hours.
- **AFK Lunch Detection:** If user is AFK during lunch hours (12:00–12:45), bypass lunch nag upon return and display welcome back message.
- **DND / Fullscreen Mode:** Mute non-critical popups and audio automatically during fullscreen gaming, videos, or presentation mode.

---

### Audio & Sound Effects (SFX) Rules
- **Volume & Mute Controls:** Master volume slider (0–100%) and global Mute SFX toggle in Settings.
- **Context Auto-Mute:** Automatically silent during AFK Sleep Mode and Fullscreen DND Mode.