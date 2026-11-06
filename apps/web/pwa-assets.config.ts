import { resolve } from "node:path";
import { defineConfig } from "@vite-pwa/assets-generator/config";

// The Klart dial mark on its emerald tile; keep in sync with components/display/klart-mark/KlartMark.tsx
const svgPath = resolve(import.meta.dirname, "src/assets/branding/klart-icon.svg");

// The tile's color; filling the padding with it makes the tile full-bleed
const emerald = "#10b981";

export default defineConfig({
  preset: {
    transparent: {
      sizes: [192, 512],
      favicons: [
        [16, "favicon-16x16.png"],
        [32, "favicon-32x32.png"],
        [48, "favicon.ico"],
      ],
    },
    // Android crops this one to its own shape, so it fills the whole square; the mark is shrunk to 74% so it sits
    // inside the safe circle (the middle 80%).
    maskable: {
      sizes: [512],
      padding: 0.26,
      resizeOptions: { background: emerald },
    },
    // iOS rounds the corners itself and fills transparency with black, so the tile goes full-bleed.
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: emerald },
    },
    // Keeps the plain name index.html links to.
    assetName: (type, size) =>
      type === "apple"
        ? "apple-touch-icon.png"
        : type === "maskable"
          ? `maskable-icon-${size.width}x${size.height}.png`
          : `pwa-${size.width}x${size.height}.png`,
  },
  images: [svgPath],
});
