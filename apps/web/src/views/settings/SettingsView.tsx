import { useEffect, useState, type ReactElement } from "react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import {
  AdjustmentsHorizontalIcon,
  BellIcon,
  CloudIcon,
  CodeBracketIcon,
  InformationCircleIcon,
  LightBulbIcon,
  Square3Stack3DIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { SettingsAboutSectionProps } from "./SettingsAboutSection";
import { SettingsAboutSection } from "./SettingsAboutSection";
import type { SettingsAgentsSectionProps } from "./SettingsAgentsSection";
import { SettingsAgentsSection } from "./SettingsAgentsSection";
import type { SettingsAppearanceSectionProps } from "./SettingsAppearanceSection";
import { SettingsAppearanceSection } from "./SettingsAppearanceSection";
import type { SettingsContextsSectionProps } from "./SettingsContextsSection";
import { SettingsContextsSection } from "./SettingsContextsSection";
import type { SettingsGeneralSectionProps } from "./SettingsGeneralSection";
import { SettingsGeneralSection } from "./SettingsGeneralSection";
import type { SettingsNotificationsSectionProps } from "./SettingsNotificationsSection";
import { SettingsNotificationsSection } from "./SettingsNotificationsSection";
import type { SettingsSuggestionsSectionProps } from "./SettingsSuggestionsSection";
import { SettingsSuggestionsSection } from "./SettingsSuggestionsSection";
import type { SettingsSyncSectionProps } from "./SettingsSyncSection";
import { SettingsSyncSection } from "./SettingsSyncSection";
import type { SettingsSectionId } from "~/core/settings/SettingsSection";
import { SETTINGS_SECTION_IDS } from "~/core/settings/SettingsSection";

export interface SettingsViewProps {
  initialSection?: SettingsSectionId;
  onBack: () => void;
  general: Omit<SettingsGeneralSectionProps, "title">;
  appearance: Omit<SettingsAppearanceSectionProps, "title">;
  contexts: SettingsContextsSectionProps;
  sync: SettingsSyncSectionProps;
  notifications: SettingsNotificationsSectionProps;
  suggestions: Omit<SettingsSuggestionsSectionProps, "title">;
  agents: SettingsAgentsSectionProps;
  about: SettingsAboutSectionProps;
}

const SECTION_ICONS: Record<SettingsSectionId, ReactElement> = {
  general: <AdjustmentsHorizontalIcon className="size-[18px]" />,
  appearance: <SwatchIcon className="size-[18px]" />,
  contexts: <Square3Stack3DIcon className="size-[18px]" />,
  sync: <CloudIcon className="size-[18px]" />,
  notifications: <BellIcon className="size-[18px]" />,
  suggestions: <LightBulbIcon className="size-[18px]" />,
  agents: <CodeBracketIcon className="size-[18px]" />,
  about: <InformationCircleIcon className="size-[18px]" />,
};

/** Settings, one section at a time: the section list on the left (a scrolling strip on phones), the pane beside it. */
export function SettingsView({
  initialSection,
  onBack,
  general,
  appearance,
  contexts,
  sync,
  notifications,
  suggestions,
  agents,
  about,
}: SettingsViewProps): ReactElement {
  const intl = useIntl();
  const [section, setSection] = useState<SettingsSectionId>(initialSection ?? "general");

  // A link to a section (e.g. "Manage contexts") lands on it even when settings is already open.
  useEffect(() => {
    if (initialSection) {
      setSection(initialSection);
    }
  }, [initialSection]);

  const labels: Record<SettingsSectionId, string> = {
    general: intl.formatMessage({ description: "SettingsView - nav item", defaultMessage: "General", id: "kmqLSO" }),
    appearance: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Appearance",
      id: "+TqxRH",
    }),
    contexts: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Contexts",
      id: "AiSScy",
    }),
    sync: intl.formatMessage({ description: "SettingsView - nav item", defaultMessage: "Sync", id: "V78IVb" }),
    notifications: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Notifications",
      id: "ahF0RP",
    }),
    suggestions: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Suggestions",
      id: "wc0Wrh",
    }),
    agents: intl.formatMessage({
      description: "SettingsView - nav item",
      defaultMessage: "Agents & files",
      id: "Q8GRwL",
    }),
    about: intl.formatMessage({ description: "SettingsView - nav item", defaultMessage: "About", id: "yqQ5e6" }),
  };

  const panes: Record<SettingsSectionId, () => ReactElement> = {
    general: () => <SettingsGeneralSection title={labels.general} {...general} />,
    appearance: () => <SettingsAppearanceSection title={labels.appearance} {...appearance} />,
    contexts: () => <SettingsContextsSection {...contexts} />,
    sync: () => <SettingsSyncSection {...sync} />,
    notifications: () => <SettingsNotificationsSection {...notifications} />,
    suggestions: () => <SettingsSuggestionsSection title={labels.suggestions} {...suggestions} />,
    agents: () => <SettingsAgentsSection {...agents} />,
    about: () => <SettingsAboutSection {...about} />,
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
        <span className="hero-title hero:text-2xl self-start px-2.5 pb-2 text-[22px] font-bold">
          {intl.formatMessage({
            description: "SettingsView - page heading",
            defaultMessage: "Settings",
            id: "wdvuV0",
          })}
        </span>
        <nav
          aria-label={intl.formatMessage({
            description: "SettingsView - nav aria-label",
            defaultMessage: "Settings sections",
            id: "IE6R0H",
          })}
          className="-mx-3 flex gap-0.5 overflow-x-auto px-3 lg:mx-0 lg:flex-col lg:px-0"
        >
          {SETTINGS_SECTION_IDS.map((id) => {
            const isCurrent = id === section;
            return (
              <Button
                key={id}
                variant="ghost"
                onPress={() => setSection(id)}
                aria-current={isCurrent ? "page" : undefined}
                data-testid={`settings__nav-${id}`}
                className={clsx(
                  "h-10 shrink-0 justify-start gap-3 rounded-[9px] px-2.5 lg:w-full",
                  isCurrent ? "bg-surface hero:bg-surface-secondary font-semibold" : "font-normal"
                )}
              >
                <span aria-hidden className={clsx("flex", isCurrent ? "text-accent" : "text-muted")}>
                  {SECTION_ICONS[id]}
                </span>
                {labels[id]}
              </Button>
            );
          })}
        </nav>
      </aside>

      <main className="bg-surface-secondary/40 hero:bg-(--hero-panel) hero-glow min-w-0 flex-1 bg-no-repeat px-4 pt-6 pb-12 sm:px-8 lg:pt-10">
        <div
          key={section}
          className={clsx(
            "settings-pane-in flex flex-col gap-6",
            // Appearance is wider, to fit its preview beside the choices.
            section === "appearance" ? "max-w-[1100px]" : "max-w-[760px]"
          )}
        >
          {panes[section]()}
        </div>
      </main>
    </div>
  );
}
