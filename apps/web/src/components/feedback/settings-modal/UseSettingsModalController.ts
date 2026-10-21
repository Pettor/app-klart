import { useMemo } from "react";
import type { SettingsModalProps } from "./SettingsModal";
import { useThemeSelector } from "~/components/actions/theme-selector/UseThemeSelector";
import { useAppInfo } from "~/core/config/UseAppInfo";
import { useSettingsModal } from "~/core/settings/UseSettingsModal";

export function useSettingsModalController(): SettingsModalProps {
  const { isOpen, initialSection, sections, close } = useSettingsModal();
  const { appName } = useAppInfo();
  const themeSelector = useThemeSelector();

  const aboutDetails = useMemo(
    () => ({
      appName,
      appVersion: import.meta.env.VITE_APP_VERSION,
    }),
    [appName]
  );

  return {
    isOpen,
    sections,
    initialSection,
    onClose: close,
    appearance: { themeSelector },
    aboutDetails,
  };
}
