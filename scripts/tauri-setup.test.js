// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('tauri installer scaffolding', () => {
  it('contains required Tauri project files for build:tauri', () => {
    const requiredPaths = [
      'src-tauri/tauri.conf.json',
      'src-tauri/Cargo.toml',
      'src-tauri/build.rs',
      'src-tauri/src/main.rs',
      'src-tauri/icons/icon.ico',
    ];

    for (const relativePath of requiredPaths) {
      expect(fs.existsSync(path.join(projectRoot, relativePath))).toBe(true);
    }
  });

  it('has expected tauri build pipeline scripts in package.json', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts.server).toContain('server/proxy.cjs');
    expect(packageJson.scripts['preflight:tauri']).toContain('scripts/preflight-tauri.cjs');
    expect(packageJson.scripts['build:proxy']).toContain('server/proxy.cjs');
    expect(packageJson.scripts['build:proxy']).toContain('src-tauri/resources/proxy/proxy.exe');
    expect(packageJson.scripts['prepare:tauri']).toContain('scripts/prepare-tauri-resources.cjs');
    expect(packageJson.scripts['build:tauri']).toContain('npm run preflight:tauri');
    expect(packageJson.scripts['build:tauri']).toContain('npm run build');
    expect(packageJson.scripts['build:tauri']).toContain('npm run build:proxy');
    expect(packageJson.scripts['build:tauri']).toContain('npm run prepare:tauri');
    expect(packageJson.scripts['build:tauri']).toContain('tauri build --bundles msi');
  });

  it('contains CommonJS proxy entry required by pkg', () => {
    expect(fs.existsSync(path.join(projectRoot, 'server', 'proxy.cjs'))).toBe(true);
  });

  it('has required MSI bundle settings in tauri.conf.json', () => {
    const tauriConfigPath = path.join(projectRoot, 'src-tauri', 'tauri.conf.json');
    const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
    const bundle = tauriConfig?.tauri?.bundle;

    expect(Array.isArray(bundle?.targets)).toBe(true);
    expect(bundle.targets).toContain('msi');
    expect(Array.isArray(bundle?.resources)).toBe(true);
    expect(bundle.resources).toContain('resources/proxy/proxy.exe');
    expect(bundle.resources).toContain('resources/web');
    expect(Array.isArray(bundle?.icon)).toBe(true);
    expect(bundle.icon).toContain('icons/icon.ico');
  });

  it('uses LAN-aware UI host resolution in launcher', () => {
    const launcherPath = path.join(projectRoot, 'src-tauri', 'src', 'main.rs');
    const launcherSource = fs.readFileSync(launcherPath, 'utf8');

    expect(launcherSource).toContain('fn resolve_ui_host(allow_lan: bool) -> String');
    expect(launcherSource).toContain('let ui_host = resolve_ui_host(allow_lan);');
    expect(launcherSource).toContain('let url = format!("http://{ui_host}:{port}/");');
  });
});