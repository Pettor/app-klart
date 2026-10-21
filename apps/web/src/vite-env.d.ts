/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Release version from package.json, e.g. "0.1.0". */
  readonly VITE_APP_VERSION: string;
  /** CI run number that produced this build; empty for local builds. */
  readonly VITE_APP_BUILD: string;
  /** Short commit hash the build was made from; empty when Git isn't available. */
  readonly VITE_APP_COMMIT: string;
}
