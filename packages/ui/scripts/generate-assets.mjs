#!/usr/bin/env node
// Generates PWA icon assets from packages/ui/src/Branding/assets/template-512x512.svg.
// Run from any app directory that has a pwa-assets.config.ts pointing to that SVG.
// The @vite-pwa/assets-generator always outputs next to the source image, so this
// script moves the generated files to the app's public directory afterwards.
//
// Usage: generate-assets [public-dir] [source-dir]
//   public-dir  defaults to public
//   source-dir  folder holding the source SVG named in pwa-assets.config.ts,
//               relative to the app; defaults to this package's Branding/assets
import { execSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const assetsDir = process.argv[3]
  ? resolve(process.cwd(), process.argv[3])
  : resolve(dirname(fileURLToPath(import.meta.url)), "../src/Branding/assets");
const publicDir = resolve(process.cwd(), process.argv[2] ?? "public");

execSync("pwa-assets-generator", { cwd: process.cwd(), stdio: "inherit" });

for (const file of [
  "pwa-192x192.png",
  "pwa-512x512.png",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  // Only when the app's config asks for a maskable icon.
  "maskable-icon-512x512.png",
]) {
  if (existsSync(resolve(assetsDir, file))) {
    renameSync(resolve(assetsDir, file), resolve(publicDir, file));
  }
}
