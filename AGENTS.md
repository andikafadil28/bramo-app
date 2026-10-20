# AGENTS.md — Technical Architecture & Agent Guidelines for BRAMO

Welcome to the **BRAMO** core documentation. This document serves as the absolute source of truth for AI agents and developers working on the BRAMO application.

---

## 1. Project Overview & Identity

* **Name:** BRAMO
* **Repository:** `bramo-app`
* **Target OS:** Windows (Primary `.exe`/`.msi`), Linux (`.AppImage`/`.deb`)
* **Tech Stack:**
  * **Core Engine:** Tauri v2 (Rust Backend + Lightweight Native Webview)
  * **Frontend Stack:** HTML5, Modern CSS3, Vanilla JavaScript (ES6+)
* **Performance Budget:** 
  * RAM Target: **30MB – 50MB**
  * CPU Target: **< 1%** during idle state
* **Window Specifications:**
  * Frameless & Transparent background
  * Always-on-Top (`alwaysOnTop: true`)
  * Native Tauri window dragging (`-webkit-app-region: drag` + `startDragging()`)

---

## 2. Core Operating Rules & Architecture Guidelines

1. **Keep it Lightweight & Modular:**
   * Pure Vanilla JS + CSS3 for maximum performance and minimum memory footprint.
   * Do not introduce heavy frontend frameworks (React/Vue/Svelte) unless strictly necessary.
2. **Strict Design & UI Consistency:**
   * **Compact Top Bar First:** Default state is ultra-sleek (`122px x 48px`).
   * **Dynamic Dropdown Island Panel:** Expanding down (`200px x 140px`) on user click rather than widening horizontally to preserve screen proportion on any screen alignment.
   * **Wardrobe Slot Architecture:** Accessories (like the **Pixel Cowboy Hat**) must sit on an overlaying absolute slot (`.accessory-slot`) above the capsule border so unlockable items can be swapped dynamically.
3. **Human-Centric Care Logic:**
   * Non-intrusive biological reminders (hydration, posture, break rhythm).
   * Smart DND / Anti-Overwork detection logic.

---

## 3. Visor LED Engine & Expression Matrix

BRAMO's face operates on a dynamic state machine driving the LED matrix visor (`.visor-screen`), eye pupils (`.led-eye`), and animated LED mouth (`.led-mouth`).

### 3.1 Random Gaze Engine (Mata Iseng Logic)
Rather than locking onto the mouse cursor permanently, BRAMO cycles between gaze behavior modes every 2.5s - 5s:
* `FORWARD`: Looks directly forward at the user (`translate(0, 0)`).
* `TRACKING`: Follows the user's cursor dynamically with bounded offsets (`MAX_OFFSET = 3px`).
* `GLANCE`: Looks randomly in a specific direction (Left, Right, Up, Top-Right) for a brief duration.

### 3.2 Eye & Mouth Expression Matrix

| State / Event | Left Eye (`#leftEye`) | Right Eye (`#rightEye`) | Mouth Class (`#ledMouth`) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Idle Normal** | Rounded Cyan (`13x10px`) | Rounded Cyan (`13x10px`) | `default` (`u`) | Cute, content default expression |
| **Blinking** | Slit line (`height: 2px`) | Slit line (`height: 2px`) | Unchanged | Triggers every 2.5s – 5.5s randomly |
| **Whistling / Singing** | Normal / Glance | Normal / Glance | `whistle` (`o`) | Small glowing circle, idle singing |
| **Mumbling** | Normal / Forward | Normal / Forward | `mumble` (`-`) | Flat line, quiet self-talking |
| **Click / Happy** | Normal / Wide | Normal / Wide | `happy-open` (`:D`) | Fully filled semi-circle smile on click/pet |
| **Petting (Love)** | Heart / Arc (`^ ^`) | Heart / Arc (`^ ^`) | `happy-open` (`:D`) | Triggered by rapid mouse hovering on head |
| **Shake (Dizzy)** | Spiral / Cross (`x x`) | Spiral / Cross (`x x`) | `mumble` (`o`) | Triggered by rapid window movement/drag |
| **Poking (Sneeze)** | Closed Squeeze (`> <`) | Closed Squeeze (`> <`) | `whistle` (`o`) | Triggered by repeated fast clicks |

---

## 4. Feature Blueprint & Component Structure

### 4.1 UI Layout Hierarchy
```text
src/
├── index.html        # Main DOM structure (Capsule + Dropdown Panel)
├── style.css         # LED styling, Scanlines effect, Glassmorphism & Animations
└── main.js           # Visor State Machine, Gaze Engine, Dragging & Interactions
src-tauri/
├── capabilities/
│   └── default.json  # Tauri permissions (core:window:allow-start-dragging)
├── tauri.conf.json   # App window geometry & transparent config
└── Cargo.toml        # Rust backend dependencies