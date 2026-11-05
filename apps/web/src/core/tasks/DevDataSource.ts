/** What a dev build shows: the built-in sample data, or this device's real data and syncs. */
export type DevDataSource = "sample" | "live";

const DEV_DATA_SOURCE_KEY = "klart-dev-data-source";

/** The data source switch exists only on the dev server; production builds always use live data. */
export const DEV_DATA_SOURCE_AVAILABLE = import.meta.env.DEV;

/** Read once per app load: switching reloads, so every atom and sync starts from the chosen data. */
function readDevDataSource(): DevDataSource {
  if (!DEV_DATA_SOURCE_AVAILABLE) {
    return "live";
  }
  try {
    const stored = localStorage.getItem(DEV_DATA_SOURCE_KEY);
    if (stored === "sample" || stored === "live") {
      return stored;
    }
  } catch {
    // Unreadable or blocked storage: fall back to the env default.
  }
  // E2E runs set VITE_SAMPLE_DATA=false.
  return import.meta.env.VITE_SAMPLE_DATA === "true" ? "sample" : "live";
}

export const DEV_DATA_SOURCE: DevDataSource = readDevDataSource();

/** Remembers the choice on this device and reloads the app with it. */
export function switchDevDataSource(source: DevDataSource): void {
  if (!DEV_DATA_SOURCE_AVAILABLE || source === DEV_DATA_SOURCE) {
    return;
  }
  localStorage.setItem(DEV_DATA_SOURCE_KEY, source);
  window.location.reload();
}
