import { useEffect, type ReactElement } from "react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Button } from "@heroui/react";
import { useIntl } from "react-intl";
import type { SettingsAboutSectionProps } from "./SettingsAboutSection";
import { SettingsAboutSection } from "./SettingsAboutSection";
import type { SettingsAgentsSectionProps } from "./SettingsAgentsSection";
import { SettingsAgentsSection } from "./SettingsAgentsSection";
import type { SettingsContextsSectionProps } from "./SettingsContextsSection";
import { SettingsContextsSection } from "./SettingsContextsSection";
import type { SettingsNotificationsSectionProps } from "./SettingsNotificationsSection";
import { SettingsNotificationsSection } from "./SettingsNotificationsSection";
import { SettingsSectionShell } from "./SettingsSectionShell";
import type { SettingsSyncSectionProps } from "./SettingsSyncSection";
import { SettingsSyncSection } from "./SettingsSyncSection";
import type { ThemeSelectorProps } from "~/components/actions/theme-selector/ThemeSelector";
import { ThemeSelector } from "~/components/actions/theme-selector/ThemeSelector";
import type { SettingsSectionId } from "~/core/settings/SettingsSection";
import { SETTINGS_SECTION_IDS } from "~/core/settings/SettingsSection";

export interface SettingsViewProps {
  initialSection?: SettingsSectionId;
  onBack: () => void;
  contexts: SettingsContextsSectionProps;
  sync: SettingsSyncSectionProps;
  agents: SettingsAgentsSectionProps;
  notifications: SettingsNotificationsSectionProps;
  appearance: { themeSelector: ThemeSelectorProps };
  about: SettingsAboutSectionProps;
}

function scrollToSection(id: SettingsSectionId): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SettingsView({
  initialSection,
  onBack,
  contexts,
  sync,
  agents,
  notifications,
  appearance,
  about,
}: SettingsViewProps): ReactElement {
  const intl = useIntl();

  useEffect(() => {
    if (initialSection) {
      document.getElementById(initialSection)?.scrollIntoView({ block: "start" });
    }
  }, [initialSection]);

  const labels: Record<SettingsSectionId, string> = {
    contexts: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Contexts",
      id: "AiSScy",
    }),
    sync: intl.formatMessage({ description: "SettingsView - nav item", defaultMessage: "Sync", id: "V78IVb" }),
    agents: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Agents & files",
      id: "Q8GRwL",
    }),
    notifications: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Notifications",
      id: "ahF0RP",
    }),
    appearance: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Appearance",
      id: "+TqxRH",
    }),
    about: intl.formatMessage({ description: "SettingsView - nav item", defaultMessage: "About", id: "yqQ5e6" }),
  };

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col text-sm lg:flex-row">
      <aside className="border-separator flex shrink-0 flex-col gap-1 border-b px-3 pt-4 pb-3 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-r lg:border-b-0 lg:pt-10">
        <Button
          variant="ghost"
          onPress={onBack}
          className="mb-3 h-9 self-start px-2.5 font-normal"
          data-testid="settings__back"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          {intl.formatMessage({
            description: "SettingsView - back button",
            defaultMessage: "Back to My Day",
            id: "hNutHe",
          })}
        </Button>
        <h1 className="px-2.5 pb-2 text-[22px] font-bold">
          {intl.formatMessage({
            description: "SettingsView - page heading",
            defaultMessage: "Settings",
            id: "wdvuV0",
          })}
        </h1>
        <nav
          aria-label={intl.formatMessage({
            description: "SettingsView - nav aria-label",
            defaultMessage: "Settings sections",
            id: "IE6R0H",
          })}
          className="-mx-3 flex gap-1 overflow-x-auto px-3 lg:mx-0 lg:flex-col lg:px-0"
        >
          {SETTINGS_SECTION_IDS.map((id) => (
            <Button
              key={id}
              variant="ghost"
              onPress={() => scrollToSection(id)}
              className="h-9 shrink-0 justify-start px-2.5 font-normal lg:w-full"
            >
              {labels[id]}
            </Button>
          ))}
        </nav>
      </aside>

      <main className="flex w-full max-w-[980px] min-w-0 flex-col gap-10 px-4 pt-6 pb-12 sm:px-8 lg:pt-10">
        <SettingsContextsSection {...contexts} />
        <SettingsSyncSection {...sync} />
        <SettingsAgentsSection {...agents} />
        <SettingsNotificationsSection {...notifications} />
        <SettingsSectionShell id="appearance" title={labels.appearance}>
          <ThemeSelector {...appearance.themeSelector} />
        </SettingsSectionShell>
        <SettingsAboutSection {...about} />
      </main>
    </div>
  );
}
