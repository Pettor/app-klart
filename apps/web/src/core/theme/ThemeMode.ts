export type ThemeMode = "light" | "paper" | "bloom" | "dark" | "midnight" | "graphite" | "ember" | "auto";

/** The theme actually applied, once "auto" is resolved. */
export type ResolvedThemeMode = Exclude<ThemeMode, "auto">;

/**
 * Classes set on `<html>` for each theme. Paper and Bloom are light themes, so they keep `light`; Midnight, Graphite
 * and Ember are dark themes, so they keep `dark` and every `dark:` style still applies. Each adds its own class on top
 * that only overrides colors and card styles.
 */
export const THEME_CLASSES: Record<ResolvedThemeMode, string> = {
  light: "light",
  paper: "light paper",
  bloom: "light bloom",
  dark: "dark",
  midnight: "dark midnight",
  graphite: "dark graphite",
  ember: "dark ember",
};

export type Density = "comfortable" | "compact";

/** `system` follows the OS "reduce motion" setting; `full` and `reduced` override it. */
export type MotionPreference = "full" | "reduced" | "system";
