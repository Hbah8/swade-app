#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream, UdpSocket};
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

fn resolve_ui_host(allow_lan: bool) -> String {
  if !allow_lan {
    return "127.0.0.1".to_string();
  }

  let socket = match UdpSocket::bind("0.0.0.0:0") {
    Ok(socket) => socket,
    Err(_) => return "127.0.0.1".to_string(),
  };

  if socket.connect("8.8.8.8:80").is_err() {
    return "127.0.0.1".to_string();
  }

  match socket.local_addr() {
    Ok(address) => address.ip().to_string(),
    Err(_) => "127.0.0.1".to_string(),
  }
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
      let allow_lan = std::env::var("ALLOW_LAN")
        .map(|value| value != "false")
        .unwrap_or(true);
      let proxy_host = if allow_lan { "0.0.0.0" } else { "127.0.0.1" };

      let mut child = Command::new(proxy_path)
        .env("PROXY_PORT", port.to_string())
        .env("PROXY_HOST", proxy_host)
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

      let ui_host = resolve_ui_host(allow_lan);
      let url = format!("http://{ui_host}:{port}/");
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