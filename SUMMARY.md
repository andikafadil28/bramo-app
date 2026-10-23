# BRAMO 1.0.1 — Interactive Cyberpunk Desktop Companion

BRAMO is a sleek, retro-futuristic desktop top bar companion for Windows, powered by **Tauri v2**. Designed with an LED visor capsule aesthetic, BRAMO combines system utilities, productivity tracking, prayer reminders, and expressive mascot interactions.

> Status proyek dan arsitektur terbaru ada di `CONTEXT.md`. Langkah pindah komputer ada di `HANDOFF.md`.

## Key Features & Capabilities

- **Cyber-Retro LED Visor:** Dynamic LED eyes with gaze-tracking, auto-blinking, glance states, and reactive mouth animations (idle, whistle, mumble, happy).
- **Robust Drag & Snap Mechanics:** Controlled pointer-delta movement with wiggle physics, landing bounce, monitor clamping, and cowboy-hat double-click auto-snap.
- **Expandable Dropdown Island:** 10 utility panels for music, stats, files/clipboard, settings, prayer, Pomodoro, bio-rhythm, launcher, to-do/alarm, and BRAMO Journey.
- **Productivity & Health Companion:** Prayer/sholat reminders with azan audio and Azan Priority Mode; configurable Pomodoro; breaks, long-focus warnings, to-do reminders, and recurring wake alarms.
- **System Monitor:** CPU, RAM, and battery readout with amber reaction under load.
- **Media Integration:** Windows Media Session controls, auto-hiding Now Playing mini-player, and music-vibe visor palette during playback. Paused tracks remain available for resume; stopped/closed sessions and sessions without track metadata are treated as inactive.
- **File Shelf:** Drag-and-drop file zone with Open, Show in Folder, and a five-item history.
- **Customization:** Persistent visor themes (Cyan, Matrix, Pink, Amber, RGB Cycle, Red Alert), XP, levels, and unlockable cosmetics.
- **Desktop Integration:** Clipboard watcher/history, typing curiosity, Quick Launcher, Gaming Focus (Windows), and mascot Sleep Mode.
- **Gaming Focus:** Locks the dropdown while a supported game is foregrounded; an open dropdown closes when Gaming Focus activates.
- **Dropdown layout:** Fixed expanded size `300x520`, flips upward near the screen bottom, and Settings scrolls internally. Startup restores saved coordinates within the monitor work area.
- **System Tray:** Native Show/Hide/Sleep/Quit menu with an autostart plugin and an autostart toggle in the Power panel.
- **Fullscreen & DPI Awareness:** External fullscreen hiding (with ChatGPT/Codex exclusions), Windows scale-aware native sizing, and multi-monitor aware clamping.

## Tech Stack

- **Backend:** Rust (Tauri v2 Core)
- **Frontend:** HTML5, Modern CSS3 (Grid/Flexbox, custom variables, cubic-bezier animations), Vanilla JavaScript (ES6+).
- **Audio:** HTML5 Audio (`src/assets/Adzan.wav`)

## Status

- Versi source/build dan GitHub Release stabil terbaru: **1.0.1**.
- GitHub Release: [v1.0.1](https://github.com/andikafadil28/bramo-app/releases/tag/v1.0.1) (installer EXE dan MSI tersedia); situs promo mengarah ke release terbaru.
- Situs promo Astro: [bramo.dikadevit.my.id](https://bramo.dikadevit.my.id), sumbernya di `promo-site/`. Demo mencakup buddy yang bisa diseret dan 10 tab; interaksi di situs hanya simulasi browser, bukan integrasi native desktop.
- Installer belum ditandatangani digital, sehingga Windows dapat menampilkan SmartScreen. Hash SHA-256 installer ada di `RELEASE_NOTES.md`.
- Panduan menjalankan Astro ada di `promo-site/README.md`; detail arsitektur dan pengujian manual tersisa ada di `CONTEXT.md`.
