import { useCallback } from "react";
import { useAtom } from "jotai";
import { settingsModalAtom } from "./SettingsAtoms";
import type { SettingsSection } from "./SettingsSection";

const SECTIONS: SettingsSection[] = ["appearance", "about"];

export interface UseSettingsModalResult {
  isOpen: boolean;
  initialSection?: SettingsSection;
  sections: SettingsSection[];
  open: (section?: SettingsSection) => void;
  close: () => void;
}

export function useSettingsModal(): UseSettingsModalResult {
  const [state, setState] = useAtom(settingsModalAtom);

  const open = useCallback(
    (section?: SettingsSection) => {
      setState({ isOpen: true, initialSection: section });
    },
    [setState]
  );

  const close = useCallback(() => {
    setState({ isOpen: false });
  }, [setState]);

  return {
    isOpen: state.isOpen,
    initialSection: state.initialSection,
    sections: SECTIONS,
    open,
    close,
  };
}
