export type ThemeMode = "light" | "paper" | "bloom" | "dark" | "midnight" | "graphite" | "vivid" | "auto";

/** The theme actually applied, once "auto" is resolved. */
export type ResolvedThemeMode = Exclude<ThemeMode, "auto">;

/**
 * Classes set on `<html>` for each theme. Paper and Bloom are light themes, so they keep `light`; Midnight, Graphite
 * and Vivid are dark themes, so they keep `dark` and every `dark:` style still applies. Each adds its own class on top
 * that only overrides colors and card styles.
 */
export const THEME_CLASSES: Record<ResolvedThemeMode, string> = {
  light: "light",
  paper: "light paper",
  bloom: "light bloom",
  dark: "dark",
  midnight: "dark midnight",
  graphite: "dark graphite",
  vivid: "dark vivid",
};

export type Density = "comfortable" | "compact";

/** `system` follows the OS "reduce motion" setting; `full` and `reduced` override it. */
export type MotionPreference = "full" | "reduced" | "system";

/**
 * The shape of task cards: how they're edged, shadowed and rounded. Each theme has its own, and any of them can go
 * with any theme; `theme` keeps the theme's own. Colors always come from the theme.
 */
export type TaskStyle = "theme" | "raised" | "floating" | "flat" | "square" | "glow" | "outline";

/** The task style each theme has of its own. */
export const THEME_TASK_STYLES: Record<ResolvedThemeMode, Exclude<TaskStyle, "theme">> = {
  light: "raised",
  paper: "flat",
  bloom: "glow",
  dark: "floating",
  midnight: "raised",
  graphite: "square",
  vivid: "outline",
};
