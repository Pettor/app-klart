import { useEffect } from "react";
import { desktop, isDesktop } from "./Desktop";

/**
 * In the desktop app, opens `target="_blank"` web links in the default browser.
 * The webview ignores them otherwise. Does nothing in a browser.
 */
export function useDesktopExternalLinks(): void {
  useEffect(() => {
    if (!isDesktop()) {
      return;
    }
    function handleClick(event: MouseEvent): void {
      const anchor = (event.target as Element | null)?.closest?.("a[target='_blank']");
      if (!(anchor instanceof HTMLAnchorElement) || !/^https?:$/.test(anchor.protocol)) {
        return;
      }
      event.preventDefault();
      void desktop.openUrl(anchor.href);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);
}
