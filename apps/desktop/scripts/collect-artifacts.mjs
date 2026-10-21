#!/usr/bin/env node
// Copies the desktop app and its installers from Tauri's bundle folder to
// <repo>/output/build, replacing whatever an earlier build left there.
//
//   macOS    Klart.app, Klart_<version>_<arch>.dmg
//   Windows  Klart.exe, Klart_<version>_<arch>-setup.exe, Klart_<version>_<arch>_en-US.msi
//   Linux    klart-desktop, *.AppImage, *.deb, *.rpm
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const desktopDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(desktopDir, "../..");
const outputDir = join(repoRoot, "output", "build");
const targetDir = process.env.CARGO_TARGET_DIR
  ? resolve(process.env.CARGO_TARGET_DIR)
  : join(desktopDir, "src-tauri", "target");
const releaseDir = join(targetDir, "release");
const bundleDir = join(releaseDir, "bundle");

// Installers and app bundles worth shipping; everything else in bundle/ is intermediate.
const ARTIFACT = /\.(app|dmg|msi|exe|AppImage|deb|rpm)$/;

if (!existsSync(bundleDir)) {
  console.error(`No Tauri bundles found in ${bundleDir}. Run "tauri build" first.`);
  process.exit(1);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const copied = [];

function copy(from, name) {
  // verbatimSymlinks keeps the framework symlinks inside a macOS .app intact.
  cpSync(from, join(outputDir, name), { recursive: true, verbatimSymlinks: true });
  copied.push(name);
}

for (const kind of readdirSync(bundleDir)) {
  for (const name of readdirSync(join(bundleDir, kind))) {
    if (ARTIFACT.test(name)) {
      copy(join(bundleDir, kind, name), name);
    }
  }
}

// On Windows and Linux the plain executable runs without installing; macOS ships it inside Klart.app.
if (process.platform !== "darwin") {
  const binary = process.platform === "win32" ? "klart-desktop.exe" : "klart-desktop";
  const binaryPath = join(releaseDir, binary);
  if (existsSync(binaryPath) && statSync(binaryPath).isFile()) {
    copy(binaryPath, process.platform === "win32" ? "Klart.exe" : binary);
  }
}

if (copied.length === 0) {
  console.error(`Tauri finished but no installers were found in ${bundleDir}.`);
  process.exit(1);
}

console.log(`Desktop build copied to ${relative(process.cwd(), outputDir) || outputDir}:`);
for (const name of copied) {
  console.log(`  ${name}`);
}
