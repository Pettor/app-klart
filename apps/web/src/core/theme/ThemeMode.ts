export type ThemeMode = "light" | "dark" | "midnight" | "auto";

/** The theme actually applied, once "auto" is resolved. */
export type ResolvedThemeMode = Exclude<ThemeMode, "auto">;

/**
 * Classes set on `<html>` for each theme. Midnight is a dark theme, so it keeps `dark` and adds its own
 * class on top: every `dark:` style still applies and `.midnight` only overrides colors.
 */
export const THEME_CLASSES: Record<ResolvedThemeMode, string> = {
  light: "light",
  dark: "dark",
  midnight: "dark midnight",
};

export type Density = "comfortable" | "compact";

/** `system` follows the OS "reduce motion" setting; `full` and `reduced` override it. */
export type MotionPreference = "full" | "reduced" | "system";
