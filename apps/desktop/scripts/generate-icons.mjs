#!/usr/bin/env node
// Generates the desktop, iOS and Android icon sets in src-tauri/icons from the
// branding sources in apps/web/src/assets/branding (see tauri-icon.json there).
//
// "tauri icon" makes the adaptive Android layers (background, foreground,
// monochrome) and everything else. Two things are then redone here:
//
//   mipmap-*/ic_launcher(_round).png  Tauri crops the mark too tight for the
//                                      pre-Android 8 icons; these show the 72 dp
//                                      visible part of the 108 dp adaptive canvas.
//   drawable-*/ic_stat_klart.png       Notification small icon: white mark on
//                                      transparent, 24 dp with 2 dp padding.
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const desktopDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brandingDir = resolve(desktopDir, "../web/src/assets/branding");
const iconsDir = join(desktopDir, "src-tauri", "icons");
const androidDir = join(iconsDir, "android");

// Android density buckets and their scale relative to mdpi.
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

execSync(`tauri icon ${join(brandingDir, "tauri-icon.json")} -o ${iconsDir}`, { cwd: desktopDir, stdio: "inherit" });

/** Renders an SVG source at the given square size. */
function render(file, size) {
  return sharp(join(brandingDir, file)).resize(size, size).png().toBuffer();
}

/** An SVG mask of the given shape filling a square of the given size. */
function mask(size, round) {
  const shape = round
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>`
    : `<rect width="${size}" height="${size}" rx="${(size * 16) / 72}"/>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${shape}</svg>`);
}

for (const [density, scale] of Object.entries(DENSITIES)) {
  // Legacy launcher icons: 48 dp, cut from the middle 72 dp of the 108 dp layers.
  const size = 48 * scale;
  const canvas = Math.round((size * 108) / 72);
  const inset = Math.round((canvas - size) / 2);
  // sharp composites after extracting, so stack the layers in a pass of their own.
  const stacked = await sharp(await render("klart-icon-android-bg.svg", canvas))
    .composite([{ input: await render("klart-icon-android-fg.svg", canvas) }])
    .png()
    .toBuffer();
  const layers = await sharp(stacked).extract({ left: inset, top: inset, width: size, height: size }).png().toBuffer();
  for (const [name, round] of [
    ["ic_launcher.png", false],
    ["ic_launcher_round.png", true],
  ]) {
    await sharp(layers)
      .composite([{ input: mask(size, round), blend: "dest-in" }])
      .png()
      .toFile(join(androidDir, `mipmap-${density}`, name));
  }

  // Notification small icon.
  const stat = 24 * scale;
  const padding = 2 * scale;
  const drawableDir = join(androidDir, `drawable-${density}`);
  mkdirSync(drawableDir, { recursive: true });
  await sharp(await render("klart-badge.svg", stat - 2 * padding))
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: "#00000000" })
    .png()
    .toFile(join(drawableDir, "ic_stat_klart.png"));
}

console.log("Icons written to", iconsDir);
