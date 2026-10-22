/**
 * Keyboard shortcut descriptor used by commands in the command palette.
 *
 * `mod` is the platform-agnostic "command" modifier: it maps to ⌘ on macOS
 * and Ctrl everywhere else, so a single shortcut description works on both.
 */
export interface CommandShortcut {
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Single key identifier (case-insensitive), e.g. "k", "d", "/". */
  key: string;
}

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform ?? "";
  const ua = navigator.userAgent ?? "";
  return /Mac|iPhone|iPad|iPod/.test(platform) || /Mac|iPhone|iPad|iPod/.test(ua);
}

export function matchesShortcut(event: KeyboardEvent, shortcut: CommandShortcut): boolean {
  const modPressed = isMac() ? event.metaKey : event.ctrlKey;
  if (!!shortcut.mod !== modPressed) return false;
  // Symbols like "/" and "\\" need Shift or Option on many layouts (Shift+7 and Shift+Option+7 on Swedish),
  // so those two only count for letters and digits, unless the shortcut asks for them.
  const isSymbol = !/^[a-z\d]$/i.test(shortcut.key);
  if (!!shortcut.shift !== event.shiftKey && (shortcut.shift || !isSymbol)) return false;
  if (!!shortcut.alt !== event.altKey && (shortcut.alt || !isSymbol)) return false;
  // Option+digit on macOS produces symbols (⌥1 → "¡"), so digits match on the physical key instead.
  if (/^\d$/.test(shortcut.key) && event.code?.startsWith("Digit")) {
    return event.code === `Digit${shortcut.key}`;
  }
  return event.key.toLowerCase() === shortcut.key.toLowerCase();
}
