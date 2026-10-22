import { useAtom } from "jotai";
import { appearanceEffect, themeModeEffect } from "./ThemeAtoms";

export function useTheme(): void {
  useAtom(themeModeEffect);
  useAtom(appearanceEffect);
}
