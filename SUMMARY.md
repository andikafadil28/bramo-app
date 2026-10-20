# BRAMO — Project Status & Progress Summary

## 📌 Project Overview
**BRAMO** is an interactive desktop top bar companion for Windows and Linux featuring a retro-cyberpunk LED visor robot. BRAMO lives floating at the top of your screen, reacting to your mouse, keeping track of active working hours, providing biological care reminders, quick utilities, gamified PC maintenance, and retro 8-bit audio feedback.

- **Repository:** `bramo-app`
- **Tech Stack:** Tauri v2 (Rust Backend + HTML/CSS/JS Frontend)
- **Target Output:** Windows `.exe`/`.msi` & Linux `.AppImage`/`.deb`
- **Current Status:** Phase 2 (Step 1 & UI Polish Completed)

---

## ✅ Completed Milestones & Feature Implementations

### Phase 1: Tauri v2 Framework & Window Setup
- [x] Initialized Tauri v2 project structure (`src-tauri` & `src`).
- [x] Configured `tauri.conf.json`: frameless, transparent background, always-on-top, custom window dimensions (`300x145`), and non-centered top position (`y: 6`).
- [x] Configured Tauri Capabilities (`src-tauri/capabilities/default.json`) with `"core:window:allow-start-dragging"`.
- [x] Enabled `"withGlobalTauri": true` for seamless frontend window API access.

### Phase 2 — Step 1: Sleek Visor LED UI & Core Behavioral Engines
- [x] **Ultra-Sleek Top Bar (Compact Mode):** Compact 122x48px capsule that sits neatly at the top of the screen without obscuring browser tabs.
- [x] **Dropdown Island Panel (Expanded Mode):** Vertical drop-down tray (200px width) containing the Universal Media Controller, Drop File slot, and Power quick action button.
- [x] **Pixel Cowboy Hat Accessory System:** Modular `<div class="accessory-slot">` positioning the pixel hat precisely overlapping the top border line without clipping (`overflow: visible`).
- [x] **Proportional LED Visor Screen:** Dark visor with CRT scanlines, cyan LED eyes, glowing pink blush, and smooth auto-blink.
- [x] **Random Gaze Engine:** BRAMO dynamically switches between staring forward at the user, following the mouse cursor, and glancing around curiously.
- [x] **Animated Mouth Engine:** Morphing mouth states (`u` smile, `o` whistle, `-` mumble, and `:D` happy open on click).
- [x] **Native Window Dragging:** Smooth, zero-lag window dragging using `-webkit-app-region: drag` and interactive exclusion zones.

---

## 🎯 Next Steps & Roadmap

- [ ] **Phase 2 — Step 2: Interactive Mouse Gestures**
  - Implement *Petting Love* (rubbing top of head triggers heart eyes & blush intensity).
  - Implement *Shake Dizzy* (shaking window quickly triggers spiral/swirl eyes & dizzy state).
  - Implement *Poking Sneeze* (rapid double-clicking nose/face triggers sneeze animation & glitch).
- [ ] **Phase 2 — Step 3: Retro 8-Bit Audio & SFX Engine**
  - Web Audio API synthesizer for retro chiptune beeps, chirps, and hums without external audio assets.
- [ ] **Phase 3: Digital Feeding & PC Maintenance**
  - Battery/Power level meter, RAM Soda (cache cleaner animation), Junk File Snack (`%TEMP%` cleaner).
- [ ] **Phase 4: Active Work Tracker & Biological Care**
  - Active time tracking (anti-AFK, auto-pause after 2 mins idle), water/posture reminders, prayer time notifications, smart snooze/DND mode.
- [ ] **Phase 5: Gamification & Utilities**
  - Active Work EXP, Leveling & Wardrobe Unlocks, Clipboard History (5 items), Quick To-Do, Smart Alarm (`+15m`/`+30m`).