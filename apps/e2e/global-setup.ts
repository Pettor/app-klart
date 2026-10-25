import { chromium } from "@playwright/test";

async function globalSetup() {
  const browser = await chromium.launch({
    args: ["--ignore-certificate-errors"],
  });
  const page = await browser.newPage();

  // Warm up the dev server. DOMContentLoaded waits for the module graph, which on a cold CI runner means
  // Vite pre-bundling dependencies (and Istanbul instrumenting every module in coverage runs).
  await page.goto("https://localhost:4167", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  await browser.close();
}

export default globalSetup;
