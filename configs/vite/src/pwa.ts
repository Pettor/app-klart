import type { UserConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
import { type ReactViteConfigOptions } from "./react";

export interface PWAViteConfigOptions extends ReactViteConfigOptions {
  /**
   * PWA configuration options
   */
  pwaOptions?: VitePWAOptions;

  /**
   * App manifest configuration
   */
  manifest?: {
    name?: string;
    shortName?: string;
    description?: string;
    themeColor?: string;
    backgroundColor?: string;
  };
}

export function createPWAConfig(options: PWAViteConfigOptions = {}): UserConfig {
  const { pwaOptions = {}, manifest = {} } = options;

  const defaultPWAOptions: Partial<VitePWAOptions> = {
    devOptions: {
      enabled: false,
    },
    includeAssets: [
      "favicon.ico",
      "apple-touch-icon.png",
      "pwa-192x192.png",
      "pwa-512x512.png",
      "maskable-icon-512x512.png",
      "badge-96x96.png",
      "sw-notifications.js",
      "screenshot-desktop.png",
      "screenshot-phone.png",
    ],
    injectRegister: "auto",
    manifest: {
      background_color: manifest.backgroundColor || "#ffffff",
      display: "standalone",
      description: manifest.description || "Klart",
      name: manifest.name || "Klart",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        // Android crops it to its own shape instead of shrinking the icon into a white circle.
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      screenshots: [
        {
          src: "screenshot-desktop.png",
          sizes: "690x670",
          type: "image/png",
          form_factor: "wide",
          label: "Klart on Desktop",
        },
        {
          src: "screenshot-phone.png",
          sizes: "435x608",
          type: "image/png",
          form_factor: "narrow",
          label: "Klart on Phone",
        },
      ],
      short_name: manifest.shortName || "Klart",
      theme_color: manifest.themeColor || "#ffffff",
    },
    registerType: "autoUpdate",
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      navigateFallbackDenylist: [/storybook/],
      // Opens the app when a notification is tapped.
      importScripts: ["sw-notifications.js"],
    },
    ...pwaOptions,
  };

  return {
    plugins: [VitePWA(defaultPWAOptions)],
  } satisfies UserConfig;
}
