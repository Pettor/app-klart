export interface AppVersionInfo {
  /** Release version, e.g. "0.1.0". */
  version: string;
  /** CI build number; undefined for local builds. */
  build?: string;
  /** Short commit hash the build was made from. */
  commit?: string;
}

export function useAppInfo(): {
  appName: string;
  appNameCapital: string;
  appVersion: AppVersionInfo;
} {
  const appName = "Klart";
  const appNameCapital = appName.toUpperCase();

  return {
    appName,
    appNameCapital,
    appVersion: {
      version: import.meta.env.VITE_APP_VERSION,
      build: import.meta.env.VITE_APP_BUILD || undefined,
      commit: import.meta.env.VITE_APP_COMMIT || undefined,
    },
  };
}
