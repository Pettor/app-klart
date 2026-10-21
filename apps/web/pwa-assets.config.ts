import { defineConfig } from "@vite-pwa/assets-generator/config";
import { resolve } from "node:path";

// The Klart dial mark; keep in sync with components/display/klart-mark/KlartMark.tsx
const svgPath = resolve(import.meta.dirname, "src/assets/branding/klart-icon.svg");

export default defineConfig({
  preset: {
    transparent: {
      sizes: [192, 512],
      favicons: [
        [16, "favicon-16x16.png"],
        [32, "favicon-32x32.png"],
        [48, "favicon.ico"],
        [180, "apple-touch-icon.png"],
      ],
    },
    maskable: {
      sizes: [],
    },
    apple: {
      sizes: [],
    },
  },
  images: [svgPath],
});
