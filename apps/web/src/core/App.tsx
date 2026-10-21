import { type ReactElement, useEffect } from "react";
import { AppProviders } from "./AppProviders";
import { AppTheme } from "./AppTheme";
import { useDesktopExternalLinks } from "./platform/UseDesktopExternalLinks";
import { AppRoutes } from "./routes/AppRoutes";

export function App(): ReactElement {
  useDesktopExternalLinks();

  function handlePreloadError(): void {
    // Used if Vite has issue loading chunks
    window.location.reload();
  }

  useEffect(() => {
    window.addEventListener("vite:preloadError", handlePreloadError);

    return () => {
      window.removeEventListener("vite:preloadError", handlePreloadError);
    };
  }, []);

  return (
    <AppProviders>
      <AppTheme>
        <AppRoutes />
      </AppTheme>
    </AppProviders>
  );
}
