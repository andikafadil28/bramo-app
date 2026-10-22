# BRAMO - Interactive Cyberpunk Desktop Companion

BRAMO is a sleek, retro-futuristic desktop top bar companion for Windows and Linux, powered by **Tauri v2**. Designed with an LED visor capsule aesthetic, BRAMO combines system utilities, productivity tracking, prayer reminders, and expressive mascot interactions.

> Detail arsitektur dan rencana sprint aktif ada di `CONTEXT.md` (Section 7). Checklist ada di `todo.md`.

## Key Features & Capabilities

- **Cyber-Retro LED Visor:** Dynamic LED eyes with gaze-tracking, auto-blinking, glance states, and reactive mouth animations (idle, whistle, mumble, happy).
- **Robust Drag & Snap Mechanics:** Smooth custom `requestAnimationFrame` dragging with wiggle physics, landing bounce, and a cowboy hat double-click auto-snap to the top-center of the screen.
- **Expandable Dropdown Island:** CSS-powered dropdown panel with 7 utility panels (Music, Stats, File, Power, Prayer, Pomodoro, Launcher) without window clipping.
- **Productivity & Health Companion:** Prayer/sholat reminders with azan audio, attention bubble, and Azan Priority Mode (music auto-pause + locked bubble + auto-resume), plus configurable Pomodoro focus/break timer with a floating mini-timer.
- **System Monitor:** CPU, RAM, and battery readout with amber reaction under load.
- **Media Integration:** Windows Media Session controls, auto-hiding Now Playing mini-player, and music-vibe visor palette during playback. Paused tracks remain available for resume; stopped/closed sessions and sessions without track metadata are treated as inactive.
- **File Shelf:** Drag-and-drop file zone with Open, Show in Folder, and a five-item history.
- **Customization:** Persistent visor themes (Cyan, Matrix, Pink, Amber).
- **Desktop Integration:** Clipboard watcher, typing curiosity, Quick Launcher, and mascot Sleep Mode.
- **System Tray:** Native Show/Hide/Sleep/Quit menu with an autostart plugin and an autostart toggle in the Power panel.
- **Fullscreen & DPI Awareness:** External fullscreen hiding (with ChatGPT/Codex exclusions), Windows scale-aware native sizing, and multi-monitor aware clamping.

## Tech Stack

- **Backend:** Rust (Tauri v2 Core)
- **Frontend:** HTML5, Modern CSS3 (Grid/Flexbox, custom variables, cubic-bezier animations), Vanilla JavaScript (ES6+).
- **Audio:** HTML5 Audio (`src/assets/Adzan.wav`)

## Roadmap (Not Yet Implemented)

- **Wardrobe & EXP System:** Unlockable pixel costumes driven by daily EXP.
- **Retro 8-Bit Audio Engine:** Per-interaction SFX with master volume and global mute.
- **Bio-Rhythm Reminders:** Sarapan, coffee break, lunch, hydration, snack, dinner.
- **Active Work Tracker:** Proof-of-Work EXP with anti-AFK pause, overwork warning, smart snooze.
- **PC Maintenance:** RAM standby and `%TEMP%` junk cleanup.
- **Quick To-Do & Smart Alarm:** Daily checklist plus instant alarm presets.
- **Clipboard History:** Last five copied text items.
- **Extra Themes:** Neon Purple, Red Alert, and Dynamic RGB Cycle.
