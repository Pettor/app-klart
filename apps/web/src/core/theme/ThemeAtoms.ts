import type { Atom } from "jotai";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomEffect } from "jotai-effect";
import type { Density, MotionPreference, ResolvedThemeMode, ThemeMode } from "./ThemeMode";
import { THEME_CLASSES } from "./ThemeMode";

const themeLocalStorageAtom = atomWithStorage<ThemeMode>("theme", "auto");
const themeMediaQueryAtom = atom(() => window.matchMedia("(prefers-color-scheme: dark)"));

// Stores the user's preference: "auto" or one of the themes in `THEME_CLASSES`
export const themeModeAtom = atom(
  (get) => get(themeLocalStorageAtom) || "auto",
  (_get, set, newTheme: ThemeMode) => {
    set(themeLocalStorageAtom, newTheme);
  }
);

// Resolves "auto" to the actual applied theme
export const resolvedThemeModeAtom = atom<ResolvedThemeMode>((get) => {
  const mode = get(themeModeAtom);
  if (mode === "auto") {
    const mediaQuery = get(themeMediaQueryAtom);
    return mediaQuery.matches ? "dark" : "light";
  }
  return mode;
});

// Effects
export const themeModeEffect: Atom<void> = atomEffect((get) => {
  const resolved = get(resolvedThemeModeAtom);
  document.querySelector("html")?.setAttribute("class", THEME_CLASSES[resolved]);
});

/** Space around tasks in My Day. Remembered per device. */
export const densityAtom = atomWithStorage<Density>("klart-density", "comfortable", undefined, { getOnInit: true });

/** Whether My Day's background takes the current context's color. Remembered per device. */
export const tintByContextAtom = atomWithStorage<boolean>("klart-tint-by-context", true, undefined, {
  getOnInit: true,
});

/** Lift, press and drop effects on tasks. Remembered per device. */
export const motionAtom = atomWithStorage<MotionPreference>("klart-motion", "system", undefined, {
  getOnInit: true,
});

/** Mirrors the appearance settings onto `<html>` as `data-density`, `data-tint` and `data-motion` for CSS. */
export const appearanceEffect: Atom<void> = atomEffect((get) => {
  const html = document.documentElement;
  html.dataset.density = get(densityAtom);
  html.dataset.tint = get(tintByContextAtom) ? "on" : "off";
  html.dataset.motion = get(motionAtom);
});
