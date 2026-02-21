# Tauri MSI Template (Minimal)

This template contains pre-wired baseline files for a browser-launched Tauri MSI app with a packaged Node proxy.

Included files:
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/build.rs`
- `src-tauri/src/main.rs`
- `server/proxy.cjs`
- `scripts/tauri-setup.test.js`

Use from project root:

```bash
npm run bootstrap:tauri
```

Use `npm run bootstrap:tauri -- --force` to overwrite existing files.
