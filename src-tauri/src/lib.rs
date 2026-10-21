use serde::Serialize;
use std::path::Path;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use sysinfo::System;
use tauri::Emitter;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

#[derive(Serialize)]
struct SystemStats {
  cpu: f32,
  memory_used: u64,
  memory_total: u64,
}

#[derive(Clone, Copy, Serialize)]
struct ScreenPoint {
  x: f64,
  y: f64,
}

#[derive(Serialize)]
struct MediaInfo {
  active: bool,
  title: String,
  artist: String,
  playing: bool,
}

#[cfg(target_os = "windows")]
fn current_media_session() -> Result<windows::Media::Control::GlobalSystemMediaTransportControlsSession, String> {
  use windows::Media::Control::GlobalSystemMediaTransportControlsSessionManager;
  use windows::Win32::System::WinRT::{RoInitialize, RO_INIT_MULTITHREADED};
  let _ = unsafe { RoInitialize(RO_INIT_MULTITHREADED) };
  GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
    .map_err(|error| error.to_string())?
    .get()
    .map_err(|error| error.to_string())?
    .GetCurrentSession()
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn get_media_info() -> MediaInfo {
  #[cfg(target_os = "windows")]
  {
    let Ok(session) = current_media_session() else {
      return MediaInfo { active: false, title: String::new(), artist: String::new(), playing: false };
    };
    let Ok(properties) = session.TryGetMediaPropertiesAsync().and_then(|operation| operation.get()) else {
      return MediaInfo { active: true, title: "Media aktif".to_string(), artist: String::new(), playing: false };
    };
    let playing = session.GetPlaybackInfo()
      .ok()
      .and_then(|info| info.PlaybackStatus().ok())
      .map(|status| status == windows::Media::Control::GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing)
      .unwrap_or(false);
    return MediaInfo {
      active: true,
      title: properties.Title().map(|value| value.to_string_lossy()).unwrap_or_default(),
      artist: properties.Artist().map(|value| value.to_string_lossy()).unwrap_or_default(),
      playing,
    };
  }

  #[cfg(not(target_os = "windows"))]
  MediaInfo { active: false, title: String::new(), artist: String::new(), playing: false }
}

#[tauri::command]
fn get_system_stats() -> SystemStats {
  let mut system = System::new();
  system.refresh_cpu_all();
  system.refresh_memory();

  SystemStats {
    cpu: system.global_cpu_usage(),
    memory_used: system.used_memory(),
    memory_total: system.total_memory(),
  }
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
    std::process::Command::new("cmd")
      .args(["/C", "start", "", &path])
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
    std::process::Command::new("explorer")
      .args(["/select,", &path])
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
    std::process::Command::new("cmd")
      .args(["/C", "start", "", &target])
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
    .invoke_handler(tauri::generate_handler![get_system_stats, get_media_info, control_media, open_dropped_file, reveal_dropped_file, quit_bramo, is_other_window_fullscreen, open_launcher_target])
    .setup(|app| {
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
          let window = app.get_webview_window("main");
          match event.id.as_ref() {
            "show" => { if let Some(window) = window { let _ = window.show(); let _ = window.set_focus(); } }
            "hide" => { if let Some(window) = window { let _ = window.hide(); } }
            "sleep" => { if let Some(window) = window { let _ = window.hide(); } }
            "quit" => app.exit(0),
            _ => {}
          }
        })
        .build(app)?;

      let app_handle = app.handle().clone();
      std::thread::spawn(move || {
        let control_down = Arc::new(AtomicBool::new(false));
        let control_state = control_down.clone();
        let last_mouse = Arc::new(Mutex::new(ScreenPoint { x: 0.0, y: 0.0 }));
        let mouse_state = last_mouse.clone();
        let _ = rdev::listen(move |event| {
          match event.event_type {
            rdev::EventType::MouseMove { x, y } => {
              if let Ok(mut point) = mouse_state.lock() {
                point.x = x;
                point.y = y;
              }
            }
            rdev::EventType::KeyPress(key) => {
              let point = last_mouse.lock().map(|value| *value).unwrap_or(ScreenPoint { x: 0.0, y: 0.0 });
              if matches!(key, rdev::Key::ControlLeft | rdev::Key::ControlRight) {
                control_state.store(true, Ordering::Relaxed);
              } else if key == rdev::Key::KeyV && control_state.load(Ordering::Relaxed) {
                let _ = app_handle.emit("bramo://clipboard-pasted", point);
              } else {
                let _ = app_handle.emit("bramo://typing", point);
              }
            }
            rdev::EventType::KeyRelease(key) => {
              if matches!(key, rdev::Key::ControlLeft | rdev::Key::ControlRight) {
                control_state.store(false, Ordering::Relaxed);
              }
            }
            _ => {}
          }
        });
      });

      let clipboard_handle = app.handle().clone();
      std::thread::spawn(move || {
        let mut clipboard = arboard::Clipboard::new().ok();
        let mut last_signature = String::new();
        loop {
          if let Some(ref mut clipboard) = clipboard {
            if let Ok(text) = clipboard.get_text() {
              let signature = format!("{}:{}", text.len(), text.chars().take(64).collect::<String>());
              if !last_signature.is_empty() && signature != last_signature {
                let _ = clipboard_handle.emit("bramo://clipboard-changed", ());
              }
              last_signature = signature;
            }
          }
          std::thread::sleep(std::time::Duration::from_millis(1500));
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
