#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::process::{Child, Command};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};
use tauri::Manager;
use tauri::RunEvent;

struct ProxyState {
  child: Mutex<Option<Child>>,
}

fn pick_port(start: u16, tries: u16) -> u16 {
  for offset in 0..tries {
    let port = start + offset;
    if TcpListener::bind(("127.0.0.1", port)).is_ok() {
      return port;
    }
  }
  start
}

fn is_proxy_healthy(port: u16) -> bool {
  let address = format!("127.0.0.1:{port}");
  let mut stream = match TcpStream::connect(address) {
    Ok(stream) => stream,
    Err(_) => return false,
  };

  let _ = stream.set_read_timeout(Some(Duration::from_millis(300)));
  let _ = stream.set_write_timeout(Some(Duration::from_millis(300)));

  if stream
    .write_all(b"GET /health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")
    .is_err()
  {
    return false;
  }

  let mut buffer = [0_u8; 512];
  match stream.read(&mut buffer) {
    Ok(bytes_read) => bytes_read > 0,
    Err(_) => false,
  }
}

fn wait_for_health(port: u16, timeout: Duration) -> bool {
  let deadline = Instant::now() + timeout;
  while Instant::now() < deadline {
    if is_proxy_healthy(port) {
      return true;
    }
    thread::sleep(Duration::from_millis(150));
  }
  false
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let proxy_path = app
        .path_resolver()
        .resolve_resource("resources/proxy/proxy.exe")
        .ok_or("Missing proxy binary in resources/proxy/proxy.exe")?;
      let static_dir = app
        .path_resolver()
        .resolve_resource("resources/web")
        .ok_or("Missing web bundle in resources/web")?;

      let port = pick_port(5174, 50);
      let mut child = Command::new(proxy_path)
        .env("PROXY_PORT", port.to_string())
        .env("PROXY_HOST", "127.0.0.1")
        .env("SERVE_STATIC", "true")
        .env("STATIC_DIR", static_dir.to_string_lossy().to_string())
        .spawn()
        .map_err(|error| format!("Failed to spawn proxy: {error}"))?;

      if !wait_for_health(port, Duration::from_secs(10)) {
        let _ = child.kill();
        return Err("Proxy did not become healthy within timeout".into());
      }

      app.manage(ProxyState {
        child: Mutex::new(Some(child)),
      });

      let url = format!("http://127.0.0.1:{port}/");
      tauri::api::shell::open(&app.shell_scope(), url, None)
        .map_err(|error| format!("Failed to open browser: {error}"))?;

      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri app")
    .run(|app_handle, event| {
      if let RunEvent::ExitRequested { .. } = event {
        let state = app_handle.state::<ProxyState>();
        if let Ok(mut guard) = state.child.lock() {
          if let Some(mut child) = guard.take() {
            let _ = child.kill();
          }
        };
      }
    });
}
