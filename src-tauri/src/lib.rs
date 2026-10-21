use serde::Serialize;
use std::path::Path;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use std::time::{Duration, Instant};
use sysinfo::System;
use tauri::Emitter;
use tauri::State;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

#[cfg(target_os = "windows")]
use windows::Media::Control::{
  GlobalSystemMediaTransportControlsSession,
  GlobalSystemMediaTransportControlsSessionManager,
};
#[cfg(target_os = "windows")]
use windows::Win32::System::WinRT::{RoInitialize, RO_INIT_MULTITHREADED};

const MEDIA_POLL_INTERVAL: Duration = Duration::from_millis(2500);
const CPU_REFRESH_INTERVAL: Duration = Duration::from_millis(500);
const CLIPBOARD_POLL_INTERVAL: Duration = Duration::from_millis(1500);

#[derive(Serialize)]
struct SystemStats {
  cpu: f32,
  memory_used: u64,
  memory_total: u64,
}

#[derive(Serialize)]
struct MonitorWorkArea {
  left: i32,
  top: i32,
  width: u32,
  height: u32,
}

#[derive(Clone, Copy, Serialize)]
struct ScreenPoint {
  x: f64,
  y: f64,
}

#[derive(Clone, Serialize)]
struct MediaInfo {
  active: bool,
  title: String,
  artist: String,
  playing: bool,
}

// --- CPU / memory sampler -------------------------------------------------
// sysinfo butuh dua sample untuk menghasilkan delta CPU yang valid, jadi
// `System` harus hidup terus, bukan dibuat ulang tiap panggilan command.
struct SamplerState {
  system: System,
  last_refresh: Instant,
  cpu_usage: f32,
}

struct SystemSampler {
  inner: Mutex<SamplerState>,
}

impl SystemSampler {
  fn new() -> Self {
    let mut system = System::new();
    system.refresh_cpu_all();
    system.refresh_memory();
    Self {
      inner: Mutex::new(SamplerState {
        system,
        last_refresh: Instant::now(),
        cpu_usage: 0.0,
      }),
    }
  }

  fn sample(&self) -> SystemStats {
    let Ok(mut state) = self.inner.lock() else {
      return SystemStats {
        cpu: 0.0,
        memory_used: 0,
        memory_total: 0,
      };
    };

    if state.last_refresh.elapsed() >= CPU_REFRESH_INTERVAL {
      state.system.refresh_cpu_all();
      state.system.refresh_memory();
      state.cpu_usage = state.system.global_cpu_usage();
      state.last_refresh = Instant::now();
    }

    SystemStats {
      cpu: state.cpu_usage,
      memory_used: state.system.used_memory(),
      memory_total: state.system.total_memory(),
    }
  }
}

// --- Watcher gates --------------------------------------------------------
struct WatcherFlags {
  clipboard: AtomicBool,
  typing: AtomicBool,
  dragging: AtomicBool,
}

impl WatcherFlags {
  fn new() -> Arc<Self> {
    Arc::new(Self {
      clipboard: AtomicBool::new(false),
      typing: AtomicBool::new(false),
      dragging: AtomicBool::new(false),
    })
  }
}

// --- Media session cache --------------------------------------------------
struct MediaCache {
  #[cfg(target_os = "windows")]
  manager: Mutex<Option<GlobalSystemMediaTransportControlsSessionManager>>,
}

impl MediaCache {
  fn new() -> Self {
    Self {
      #[cfg(target_os = "windows")]
      manager: Mutex::new(None),
    }
  }

  #[cfg(target_os = "windows")]
  fn session_manager(&self) -> Option<GlobalSystemMediaTransportControlsSessionManager> {
    let mut cached = self.manager.lock().ok()?;
    if let Some(manager) = cached.as_ref() {
      return Some(manager.clone());
    }
    let manager = request_media_manager().ok()?;
    *cached = Some(manager.clone());
    Some(manager)
  }

  fn snapshot(&self) -> MediaInfo {
    #[cfg(target_os = "windows")]
    {
      let Some(manager) = self.session_manager() else {
        return MediaInfo {
          active: false,
          title: String::new(),
          artist: String::new(),
          playing: false,
        };
      };
      media_info_from_manager(&manager)
    }

    #[cfg(not(target_os = "windows"))]
    MediaInfo {
      active: false,
      title: String::new(),
      artist: String::new(),
      playing: false,
    }
  }
}

#[cfg(target_os = "windows")]
fn request_media_manager() -> Result<GlobalSystemMediaTransportControlsSessionManager, String> {
  let _ = unsafe { RoInitialize(RO_INIT_MULTITHREADED) };
  GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
    .map_err(|error| error.to_string())?
    .get()
    .map_err(|error| error.to_string())
}

#[cfg(target_os = "windows")]
fn current_media_session() -> Result<GlobalSystemMediaTransportControlsSession, String> {
  let manager = request_media_manager()?;
  manager
    .GetCurrentSession()
    .map_err(|error| error.to_string())
}

#[cfg(target_os = "windows")]
fn media_info_from_manager(manager: &GlobalSystemMediaTransportControlsSessionManager) -> MediaInfo {
  let Ok(session) = manager.GetCurrentSession() else {
    return MediaInfo {
      active: false,
      title: String::new(),
      artist: String::new(),
      playing: false,
    };
  };

  let Ok(properties) = session
    .TryGetMediaPropertiesAsync()
    .and_then(|operation| operation.get())
  else {
    return MediaInfo {
      active: true,
      title: "Media aktif".to_string(),
      artist: String::new(),
      playing: false,
    };
  };

  let playing = session
    .GetPlaybackInfo()
    .ok()
    .and_then(|info| info.PlaybackStatus().ok())
    .map(|status| {
      status
        == windows::Media::Control::GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing
    })
    .unwrap_or(false);

  MediaInfo {
    active: true,
    title: properties
      .Title()
      .map(|value| value.to_string_lossy())
      .unwrap_or_default(),
    artist: properties
      .Artist()
      .map(|value| value.to_string_lossy())
      .unwrap_or_default(),
    playing,
  }
}

#[tauri::command]
fn get_media_info(cache: State<'_, Arc<MediaCache>>) -> MediaInfo {
  cache.snapshot()
}

#[tauri::command]
fn get_system_stats(sampler: State<'_, SystemSampler>) -> SystemStats {
  sampler.sample()
}

#[tauri::command]
fn get_current_monitor_work_area(window: tauri::WebviewWindow) -> Result<MonitorWorkArea, String> {
  #[cfg(target_os = "windows")]
  unsafe {
    use windows::Win32::Foundation::{HWND, RECT};
    use windows::Win32::Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST};

    // Tauri and this project resolve different `windows` crate versions;
    // bridge their HWND wrappers through the shared raw handle value.
    let hwnd = HWND(window.hwnd().map_err(|error| error.to_string())?.0 as isize);
    let monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
    if monitor.0 == 0 {
      return Err("Monitor BRAMO tidak ditemukan".to_string());
    }
    let mut info = MONITORINFO {
      cbSize: std::mem::size_of::<MONITORINFO>() as u32,
      rcMonitor: RECT::default(),
      rcWork: RECT::default(),
      dwFlags: 0,
    };
    if !GetMonitorInfoW(monitor, &mut info).as_bool() {
      return Err("Area kerja monitor BRAMO tidak terbaca".to_string());
    }
    let work = info.rcWork;
    return Ok(MonitorWorkArea {
      left: work.left,
      top: work.top,
      width: (work.right - work.left).max(0) as u32,
      height: (work.bottom - work.top).max(0) as u32,
    });
  }

  #[cfg(not(target_os = "windows"))]
  {
    let monitor = window.current_monitor()
      .map_err(|error| error.to_string())?
      .ok_or_else(|| "Monitor BRAMO tidak ditemukan".to_string())?;
    let position = monitor.position();
    let size = monitor.size();
    Ok(MonitorWorkArea {
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
    })
  }
}

#[tauri::command]
fn set_clipboard_watcher(watchers: State<'_, Arc<WatcherFlags>>, enabled: bool) {
  watchers.clipboard.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
fn set_typing_watcher(watchers: State<'_, Arc<WatcherFlags>>, enabled: bool) {
  watchers.typing.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
fn set_drag_watcher(watchers: State<'_, Arc<WatcherFlags>>, enabled: bool) {
  watchers.dragging.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
fn get_clipboard_text() -> Option<String> {
  arboard::Clipboard::new().ok()?.get_text().ok()
}

#[tauri::command]
fn control_media(action: String) -> Result<(), String> {
  #[cfg(target_os = "windows")]
  {
    let session = current_media_session()?;
    let result = match action.as_str() {
      "previous" => session.TrySkipPreviousAsync().and_then(|operation| operation.get()),
      "next" => session.TrySkipNextAsync().and_then(|operation| operation.get()),
      "play-pause" => {
        let playing = session.GetPlaybackInfo()
          .map_err(|error| error.to_string())?
          .PlaybackStatus()
          .map_err(|error| error.to_string())?
          == windows::Media::Control::GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing;
        if playing {
          session.TryPauseAsync().and_then(|operation| operation.get())
        } else {
          session.TryPlayAsync().and_then(|operation| operation.get())
        }
      }
      _ => return Err("Perintah media tidak dikenal".to_string()),
    };
    result.map_err(|error| error.to_string())?.then_some(()).ok_or_else(|| "Player menolak perintah media".to_string())
  }

  #[cfg(not(target_os = "windows"))]
  {
    let _ = action;
    Err("Kontrol media sistem saat ini hanya diaktifkan untuk Windows".to_string())
  }
}

#[tauri::command]
fn open_dropped_file(path: String) -> Result<(), String> {
  let file_path = Path::new(&path);
  if !file_path.is_file() {
    return Err("File tidak ditemukan".to_string());
  }

  #[cfg(target_os = "windows")]
  {
    // explorer.exe menerima path sebagai argumen biasa, tanpa shell, sehingga
    // karakter seperti `&` tidak bisa jadi command injection.
    std::process::Command::new("explorer.exe")
      .arg(&path)
      .spawn()
      .map_err(|error| error.to_string())?;
  }
  #[cfg(target_os = "macos")]
  {
    std::process::Command::new("open")
      .arg(&path)
      .spawn()
      .map_err(|error| error.to_string())?;
  }
  #[cfg(target_os = "linux")]
  {
    std::process::Command::new("xdg-open")
      .arg(&path)
      .spawn()
      .map_err(|error| error.to_string())?;
  }

  Ok(())
}

#[tauri::command]
fn reveal_dropped_file(path: String) -> Result<(), String> {
  let file_path = Path::new(&path);
  if !file_path.is_file() {
    return Err("File tidak ditemukan".to_string());
  }

  #[cfg(target_os = "windows")]
  {
    std::process::Command::new("explorer.exe")
      .arg(format!("/select,{}", path))
      .spawn()
      .map_err(|error| error.to_string())?;
  }
  #[cfg(target_os = "macos")]
  {
    std::process::Command::new("open")
      .args(["-R", &path])
      .spawn()
      .map_err(|error| error.to_string())?;
  }
  #[cfg(target_os = "linux")]
  {
    let parent = file_path.parent().unwrap_or_else(|| Path::new("."));
    std::process::Command::new("xdg-open")
      .arg(parent)
      .spawn()
      .map_err(|error| error.to_string())?;
  }

  Ok(())
}

#[tauri::command]
fn quit_bramo(app: tauri::AppHandle) {
  app.exit(0);
}

#[tauri::command]
fn is_other_window_fullscreen() -> bool {
  #[cfg(target_os = "windows")]
  unsafe {
    use windows::Win32::Foundation::RECT;
    use windows::Win32::Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST};
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowLongW, GetWindowRect, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible, GWL_STYLE, WS_CAPTION};
    use windows::Win32::System::Threading::GetCurrentProcessId;

    let foreground = GetForegroundWindow();
    if foreground.0 == 0 || !IsWindowVisible(foreground).as_bool() {
      return false;
    }

    let mut process_id = 0;
    GetWindowThreadProcessId(foreground, Some(&mut process_id));
    if process_id == GetCurrentProcessId() {
      return false;
    }

    let mut title_buffer = [0u16; 512];
    let title_length = GetWindowTextW(foreground, &mut title_buffer);
    let title = String::from_utf16_lossy(&title_buffer[..title_length as usize]).to_lowercase();
    if title.contains("chatgpt") || title.contains("codex") {
      return false;
    }

    // Maximized browser windows still cover the monitor, but retain a title
    // bar. Only treat borderless/captionless windows as fullscreen media.
    let style = GetWindowLongW(foreground, GWL_STYLE) as u32;
    if style & WS_CAPTION.0 != 0 {
      return false;
    }

    let monitor = MonitorFromWindow(foreground, MONITOR_DEFAULTTONEAREST);
    if monitor.0 == 0 {
      return false;
    }

    let mut monitor_info = MONITORINFO {
      cbSize: std::mem::size_of::<MONITORINFO>() as u32,
      rcMonitor: RECT::default(),
      rcWork: RECT::default(),
      dwFlags: 0,
    };
    if !GetMonitorInfoW(monitor, &mut monitor_info).as_bool() {
      return false;
    }

    let mut window_rect = RECT::default();
    if GetWindowRect(foreground, &mut window_rect).is_err() {
      return false;
    }

    let monitor_rect = monitor_info.rcMonitor;
    let tolerance = 4;
    window_rect.left <= monitor_rect.left + tolerance
      && window_rect.top <= monitor_rect.top + tolerance
      && window_rect.right >= monitor_rect.right - tolerance
      && window_rect.bottom >= monitor_rect.bottom - tolerance
  }

  #[cfg(not(target_os = "windows"))]
  false
}

#[tauri::command]
fn open_launcher_target(target: String) -> Result<(), String> {
  if target.trim().is_empty() {
    return Err("Target shortcut kosong".to_string());
  }

  #[cfg(target_os = "windows")]
  {
    // explorer.exe membuka URL, .lnk, dan executable tanpa lewat cmd.exe.
    std::process::Command::new("explorer.exe")
      .arg(&target)
      .spawn()
      .map_err(|error| error.to_string())?;
  }
  #[cfg(target_os = "macos")]
  {
    std::process::Command::new("open")
      .arg(&target)
      .spawn()
      .map_err(|error| error.to_string())?;
  }
  #[cfg(target_os = "linux")]
  {
    std::process::Command::new("xdg-open")
      .arg(&target)
      .spawn()
      .map_err(|error| error.to_string())?;
  }

  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::Builder::new().build())
    .invoke_handler(tauri::generate_handler![
      get_system_stats,
      get_current_monitor_work_area,
      get_media_info,
      control_media,
      open_dropped_file,
      reveal_dropped_file,
      quit_bramo,
      is_other_window_fullscreen,
      open_launcher_target,
      set_clipboard_watcher,
      set_typing_watcher,
      set_drag_watcher,
      get_clipboard_text
    ])
    .setup(|app| {
      app.manage(SystemSampler::new());
      let watchers = WatcherFlags::new();
      app.manage(watchers.clone());
      let media_cache = Arc::new(MediaCache::new());
      app.manage(media_cache.clone());

      let show = MenuItem::with_id(app, "show", "Show BRAMO", true, None::<&str>)?;
      let hide = MenuItem::with_id(app, "hide", "Hide BRAMO", true, None::<&str>)?;
      let sleep = MenuItem::with_id(app, "sleep", "Sleep BRAMO", true, None::<&str>)?;
      let separator = PredefinedMenuItem::separator(app)?;
      let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&show, &hide, &sleep, &separator, &quit])?;

      let tray_icon = app.default_window_icon().cloned();
      let mut tray_builder = TrayIconBuilder::new();
      if let Some(icon) = tray_icon {
        tray_builder = tray_builder.icon(icon);
      }

      tray_builder
        .menu(&menu)
        .tooltip("BRAMO Desktop Companion")
        .on_menu_event(|app, event| {
          let action = event.id.as_ref().to_string();
          match action.as_str() {
            "show" => {
              if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
              }
              let _ = app.emit("bramo://tray-action", action);
            }
            "hide" => {
              if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
              }
              let _ = app.emit("bramo://tray-action", action);
            }
            // Sleep harus lewat frontend supaya memakai mode tidur yang sama
            // dengan tombol Sleep di panel Power.
            "sleep" => {
              let _ = app.emit("bramo://tray-action", action);
            }
            // Quit tetap native sebagai fallback kalau frontend tidak merespon.
            "quit" => {
              let delivered = app.emit("bramo://tray-action", action.clone()).is_ok();
              if !delivered {
                app.exit(0);
              }
            }
            _ => {}
          }
        })
        .build(app)?;

      let app_handle = app.handle().clone();
      let typing_watchers = watchers.clone();
      std::thread::spawn(move || {
        let control_down = Arc::new(AtomicBool::new(false));
        let control_state = control_down.clone();
        let last_mouse = Arc::new(Mutex::new(ScreenPoint { x: 0.0, y: 0.0 }));
        let mouse_state = last_mouse.clone();
        let last_click = Arc::new(Mutex::new(None::<ScreenPoint>));
        let click_state = last_click.clone();
        let mut last_drag_motion = Instant::now();
        let _ = rdev::listen(move |event| {
          match event.event_type {
            rdev::EventType::MouseMove { x, y } => {
              if let Ok(mut point) = mouse_state.lock() {
                point.x = x;
                point.y = y;
              }
              if typing_watchers.dragging.load(Ordering::Relaxed)
                && last_drag_motion.elapsed() >= Duration::from_millis(30)
              {
                last_drag_motion = Instant::now();
                let _ = app_handle.emit("bramo://drag-motion", ScreenPoint { x, y });
              }
            }
            rdev::EventType::ButtonPress(rdev::Button::Left) => {
              let point = last_mouse.lock().map(|value| *value).unwrap_or(ScreenPoint { x: 0.0, y: 0.0 });
              if let Ok(mut click) = click_state.lock() {
                *click = Some(point);
              }
            }
            rdev::EventType::KeyPress(key) => {
              let point = last_mouse.lock().map(|value| *value).unwrap_or(ScreenPoint { x: 0.0, y: 0.0 });
              if matches!(key, rdev::Key::ControlLeft | rdev::Key::ControlRight) {
                control_state.store(true, Ordering::Relaxed);
                return;
              }
              let is_control = control_state.load(Ordering::Relaxed);
              // Ctrl+V tetap dilaporkan karena itu aksi eksplisit dari user.
              if key == rdev::Key::KeyV && is_control {
                let _ = app_handle.emit("bramo://clipboard-pasted", point);
                return;
              }
              if !typing_watchers.typing.load(Ordering::Relaxed) {
                return;
              }
              let gaze_target = click_state.lock().ok().and_then(|click| *click).unwrap_or(point);
              let _ = app_handle.emit("bramo://typing", gaze_target);
            }
            rdev::EventType::KeyRelease(key) => {
              if matches!(key, rdev::Key::ControlLeft | rdev::Key::ControlRight) {
                control_state.store(false, Ordering::Relaxed);
              }
            }
            rdev::EventType::ButtonRelease(rdev::Button::Left) => {
              if typing_watchers.dragging.swap(false, Ordering::Relaxed) {
                let _ = app_handle.emit("bramo://drag-ended", ());
              }
            }
            _ => {}
          }
        });
      });

      let clipboard_handle = app.handle().clone();
      let clipboard_watchers = watchers.clone();
      std::thread::spawn(move || {
        let mut clipboard = arboard::Clipboard::new().ok();
        let mut last_signature = String::new();
        loop {
          if clipboard_watchers.clipboard.load(Ordering::Relaxed) {
            if let Some(ref mut clipboard) = clipboard
              && let Ok(text) = clipboard.get_text()
            {
              let signature = format!("{}:{}", text.len(), text.chars().take(64).collect::<String>());
              if !last_signature.is_empty() && signature != last_signature {
                let _ = clipboard_handle.emit("bramo://clipboard-changed", text.clone());
              }
              last_signature = signature;
            }
          } else {
            // Signature direset supaya toggle ON tidak memicu event basi.
            last_signature.clear();
          }
          std::thread::sleep(CLIPBOARD_POLL_INTERVAL);
        }
      });

      let media_handle = app.handle().clone();
      let media_cache = media_cache.clone();
      std::thread::spawn(move || {
        #[cfg(target_os = "windows")]
        unsafe {
          let _ = RoInitialize(RO_INIT_MULTITHREADED);
        }
        loop {
          let info = media_cache.snapshot();
          let _ = media_handle.emit("bramo://media", info);
          std::thread::sleep(MEDIA_POLL_INTERVAL);
        }
      });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
