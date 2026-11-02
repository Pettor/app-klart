import { useAtom, useAtomValue } from "jotai";
import type { TaskStyleSelectorProps } from "./TaskStyleSelector";
import { resolvedThemeModeAtom, taskStyleAtom } from "~/core/theme/ThemeAtoms";
import { THEME_TASK_STYLES } from "~/core/theme/ThemeMode";

export function useTaskStyleSelector(): TaskStyleSelectorProps {
  const [style, setStyle] = useAtom(taskStyleAtom);
  const theme = useAtomValue(resolvedThemeModeAtom);

  return {
    style,
    themeStyle: THEME_TASK_STYLES[theme],
    onSelect: setStyle,
  };
}
