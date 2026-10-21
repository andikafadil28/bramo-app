# Agent Instructions: BRAMO Desktop Companion

## Project Overview
BRAMO is an interactive Windows/Linux desktop top bar application built with Tauri v2 (Rust Backend + HTML/CSS/JS Frontend). It features a cyberpunk/retro LED visor capsule concept, serving as a productivity assistant, health/bio-rhythm companion, and interactive desktop mascot.

## Core Architecture & Guidelines
1. **Window Properties:** Frameless, transparent body (`background: transparent`), always-on-top, non-resizable default window configured in `tauri.conf.json`.
2. **Click-Through Handling:** Global `html, body` uses `pointer-events: none`, while interactive elements (`.interactive`, `.bramo-container`) explicitly use `pointer-events: auto`.
3. **Custom Drag Engine:** Implemented using throttled `requestAnimationFrame` loop with global screen coordinates (`screenX`, `screenY`) and an `isPositionReady` safety lock to prevent teleportation bugs.
4. **Wiggle & Landing Bounce:** Instant tilt/rotate during drag and an elastic CSS cubic-bezier bounce animation upon release.
5. **Dropdown Panel:** CSS expansion inside a wrapper plus serialized native Tauri resizing with DPI-aware logical-to-physical conversion.
6. **Double-Click Auto-Snap:** Triggered exclusively on the cowboy hat (`#hatTrigger`) using a custom 300ms click-timer to snap the window to the top-center of the screen.

## AI & Mascot Behavior
- **Visor & Gaze Engine:** Random procedural eye movements (tracking, glancing, blinking).
- **LED Mouth Expressions:** Dynamic mouth states (idle, whistle, mumble, happy-open).
- **Speech/Chat Bubble System:** Contextual popup dialogs for mascot remarks and reminders.
- **Desktop Integrations:** Pomodoro, Quick Launcher, System Tray/Autostart, fullscreen hiding, and DPI-aware sizing.
