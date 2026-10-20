# SUMMARY.md — BRAMO Blueprint & Execution Roadmap

## 📌 Product Concept
BRAMO is an open-source interactive desktop top bar widget for Windows. It combines top bar utilities (file drop shelf, clipboard history, music controller) with a human-centric health companion (bio-rhythm alerts, active-time EXP tracker, and digital pet feeding mechanics).

---

## 🏛️ Core Features Blueprint

### 1. Visor LED Robot & Personality System
- **Dynamic LED Visor:** Color themes (Cyber Cyan, Matrix Green, Neon Purple, Amber, Red Alert, RGB Cycle).
- **Interactive Micro-Behaviors:** Cursor tracking, auto-blink, random glitch, AFK sleep, petting love, shake dizzy, poking sneeze.
- **Retro 8-Bit Audio SFX Engine:** Sound effects for feeding crunch, task complete chime, water drop reminder, alarm bells, and prayer chime with master volume & global mute toggle.
- **Wardrobe & Progression Tree:**
  - **Level 1:** Paper Party Hat (`[🥳]`)
  - **Level 3:** Pixel Cowboy Hat (`[🤠]`)
  - **Level 5:** "Deal With It" Sunglasses (`[😎]`)
  - **Level 10:** RGB Gaming Headset (`[🎧]`)
  - **Level 15:** Ninja Headband / Nekomimi (`[🥷]` / `[🐱]`)
  - **Level 25:** Legendary Gold Crown + Glitch Aura (`[👑]`)

### 2. Digital Feeding & System Maintenance
- **Laptop Mode:** Charge/Battery feeding (`[ ⚡ ]`).
- **PC Desktop Mode:** 
  - **RAM Soda (`🥤`):** Feeding triggers cache/standby memory cleanup.
  - **Junk File Snack (`🍿`):** Feeding cleans up `%TEMP%` folder.
  - **Power Performance Integration:** High performance mode gives energy boost.
- **Hunger / Power Meter:** Visual LED indicator (100% Full, 50% Hungry, 10% Low/Exhausted, >100% CPU Overheat).

### 3. Human-Centric Care & Active Time Tracker
- **Active Work Tracker:** Tracks real typing/cursor activity time with 60s input window and 2-min AFK auto-pause.
- **Human Bio-Rhythm Reminders:**
  - Breakfast (07:00 – 08:30)
  - 10 AM Coffee/Tea Break (`[☕ ☕]`)
  - Lunch Time (12:00 – 13:00)
  - Micro-Hydration (Every 90–120 mins of continuous active work)
  - 4 PM Afternoon Snack Slump (`[🍩 🍩]`)
  - Dinner (18:30 – 19:30)
- **Sholat & Adzan Alert:** Local prayer countdown, adzan chime option, auto-pause media player, and calming green LED theme.
- **Tiered Health Alerts:**
  - 1 Hour Active: +150 EXP Focus milestone.
  - 2-3 Hours Active: Micro-hydration / eye break alert (`[💧 💧]`).
  - 5+ Hours Active: Major overwork alert (`[👁️ 👁️ !]`), stretching/encok warning, capsule bounce until acknowledged.
- **Smart Anti-Spam Rules:** Smart Snooze (2-3 hrs), AFK Lunch auto-detection, DND Fullscreen mode.

### 4. Utilities & Expandable Panels
- **Temporary File Shelf ("Perut BRAMO"):** Drag & drop staging area with Clipboard History (last 5 copied items).
- **Universal Media Controller:** Spotify/YouTube music controls + audio reactive LED equalizer.
- **Quick To-Do & Smart Alarm:** Task checklist with EXP rewards (`+50 EXP`) + `+15m`/`+30m` alarm/timer presets with ringing animation (`[ 🔔 🔔 ]`).
- **System Health Monitor:** RAM/CPU usage monitor, cache cleaner button, power mode status.
- **Active Time EXP & Leveling:** EXP generated strictly from verified active work time to unlock wardrobe cosmetics.

---

## 🗺️ Execution Roadmap & Checklist

### Phase 1: Project Setup & Tauri Core Architecture
- [x] Initialize Git repository (`bramo-app`) with documentation (`AGENTS.md`, `SUMMARY.md`, `README.md`).
- [ ] Initialize Tauri (v2) project workspace (Rust + HTML/CSS/JS).
- [ ] Configure `tauri.conf.json` for frameless, transparent, always-on-top floating window dock at top-center.
- [ ] Set up local JSON storage handler (`config.json`) in Rust.

### Phase 2: Visor LED Engine & Interactivity (Frontend)
- [ ] Build Capsule Top Bar container UI & SVG/CSS Matrix LED grid.
- [ ] Implement Eye Animation State Machine (Tracking, Blink, Glitch, Sleep Zzz).
- [ ] Implement Mouse Gestures (Petting Love, Shake Dizzy, Poking Sneeze).
- [ ] Build Retro 8-Bit Audio SFX Engine & Volume/Mute controls.
- [ ] Add LED Theme Color Switcher.
- [ ] Build Wardrobe System & Cosmetic Overlay Renderer.

### Phase 3: Windows OS Listeners & Health Companion
- [ ] Implement Tauri Rust Commands: Battery/Power status, CPU Usage, and System Media Listener.
- [ ] Build Active Time Work Tracker (Proof-of-work logic with auto-pause on AFK).
- [ ] Implement Human Bio-Rhythm Reminder Logic & Anti-Spam Snooze system.
- [ ] Integrate Sholat/Adzan Prayer Countdown & Media Auto-Pause.

### Phase 4: Utilities, Gamification & Distribution
- [ ] Build Temporary File Shelf & RAM Soda / Junk File cleanup tools.
- [ ] Build Universal Media Controller + Audio Equalizer LED effect.
- [ ] Build Mini Task Checklist & Quick Alarm system (`[ 🔔 🔔 ]` ringing state).
- [ ] Finalize EXP Calculation & Wardrobe Level-Up Progression.
- [ ] Compile Release Build (`.exe` installer) & publish GitHub release documentation.

---
---

## 📊 Current Status
- **Current Phase:** Phase 1 (Project Setup)
- **Active Milestone:** Setting up local files (`AGENTS.md`, `SUMMARY.md`, `README.md`) & initializing Tauri template.