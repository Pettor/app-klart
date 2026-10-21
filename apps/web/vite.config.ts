import path from "node:path";
import { createBaseConfig, createPWAConfig, createReactConfig, mergeConfigs } from "@config/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, mergeConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

// Set by the Tauri CLI when it starts this dev server for the desktop app
const isTauri = !!process.env.TAURI_ENV_PLATFORM;

// Repo root — two levels up from apps/web
const repoRoot = path.resolve(import.meta.dirname, "../..");

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = mergeConfigs([
    createBaseConfig(),
    createReactConfig({ enableReactCompiler: command === "build" }),
    createPWAConfig({
      manifest: {
        description: "Plan today from what's due.",
        themeColor: "#1b1b1d",
        backgroundColor: "#1b1b1d",
      },
    }),
    {
      plugins: [tanstackRouter({ routeToken: "route" })],
    },
    { resolve: { dedupe: ["react", "react-dom"] } },
  ]);

  switch (command) {
    case "build":
      return mergeConfig(config, {
        base: "./",
        build: {
          commonjsOptions: {
            exclude: ["@faker-js/faker"],
          },
        },
      });
    case "serve":
      return mergeConfig(config, {
        server: {
          cors: true,
          // basicSsl() below provides the self-signed cert; https: true signals intent.
          // Under `tauri dev` the webview rejects self-signed certs, so serve plain HTTP there.
          https: !isTauri,
          port: 5167,
        },
        plugins: [
          ...(isTauri ? [] : [basicSsl()]),
          // Istanbul instrumentation is only active when VITE_COVERAGE is set (E2E coverage runs).
          ...(process.env.VITE_COVERAGE
            ? [
                istanbul({
                  cwd: repoRoot,
                  include: ["apps/web/src/**/*.ts", "apps/web/src/**/*.tsx"],
                  exclude: ["node_modules", "**/*.stories.*", "**/*.test.*", "**/*.spec.*", "**/index.ts"],
                  extension: [".ts", ".tsx"],
                  requireEnv: false,
                }),
              ]
            : []),
        ],
      });
  }
});
