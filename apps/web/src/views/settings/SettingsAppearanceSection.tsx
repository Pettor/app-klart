import type { ReactElement } from "react";
import { useIntl } from "react-intl";
import { SettingsRow, SettingsSegmented } from "./SettingsRow";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";
import { SettingsSwitchRow } from "./SettingsSwitchRow";
import type { ThemeSelectorProps } from "~/components/actions/theme-selector/ThemeSelector";
import { ThemeSelector } from "~/components/actions/theme-selector/ThemeSelector";
import { AppearancePreview } from "~/components/display/appearance-preview/AppearancePreview";
import type { Density, MotionPreference } from "~/core/theme/ThemeMode";

export interface SettingsAppearanceSectionProps {
  title: string;
  /** Today's date, for the due dates in the preview. */
  today: string;
  themeSelector: ThemeSelectorProps;
  density: Density;
  onDensityChange: (density: Density) => void;
  tintByContext: boolean;
  onTintByContextChange: (tintByContext: boolean) => void;
  motion: MotionPreference;
  onMotionChange: (motion: MotionPreference) => void;
}

export function SettingsAppearanceSection({
  title,
  today,
  themeSelector,
  density,
  onDensityChange,
  tintByContext,
  onTintByContextChange,
  motion,
  onMotionChange,
}: SettingsAppearanceSectionProps): ReactElement {
  const intl = useIntl();
  const densityLabel = intl.formatMessage({
    description: "SettingsAppearance - density setting",
    defaultMessage: "Density",
    id: "0V+846",
  });
  const motionLabel = intl.formatMessage({
    description: "SettingsAppearance - motion setting",
    defaultMessage: "Motion",
    id: "T/LXQf",
  });

  return (
    <SettingsSectionShell
      id="appearance"
      title={title}
      description={intl.formatMessage({
        description: "SettingsAppearance - intro",
        defaultMessage: "Pick a theme. System follows your device's light or dark mode.",
        id: "YIH7GO",
      })}
    >
      {/* The preview sits beside the choices on wide screens and follows the pane as it scrolls. */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-3.5">
          <ThemeSelector {...themeSelector} />
          <SettingsPanel>
            <SettingsRow
              label={densityLabel}
              description={intl.formatMessage({
                description: "SettingsAppearance - hint for the density setting",
                defaultMessage: "Space around tasks in My Day",
                id: "4ul9M5",
              })}
            >
              <SettingsSegmented
                ariaLabel={densityLabel}
                value={density}
                onChange={onDensityChange}
                testId="settings__density"
                options={[
                  {
                    value: "comfortable",
                    label: intl.formatMessage({
                      description: "SettingsAppearance - comfortable density",
                      defaultMessage: "Comfortable",
                      id: "cvgwsh",
                    }),
                  },
                  {
                    value: "compact",
                    label: intl.formatMessage({
                      description: "SettingsAppearance - compact density",
                      defaultMessage: "Compact",
                      id: "fAiOP1",
                    }),
                  },
                ]}
              />
            </SettingsRow>
            <SettingsSwitchRow
              label={intl.formatMessage({
                description: "SettingsAppearance - tint by context setting",
                defaultMessage: "Tint by context",
                id: "qq2Sz3",
              })}
              description={intl.formatMessage({
                description: "SettingsAppearance - hint for the tint by context setting",
                defaultMessage: "Background takes the color of the current context",
                id: "QXksU7",
              })}
              isSelected={tintByContext}
              onChange={onTintByContextChange}
              testId="settings__tint"
            />
            <SettingsRow
              label={motionLabel}
              description={intl.formatMessage({
                description: "SettingsAppearance - hint for the motion setting",
                defaultMessage: "Lift, press and drop effects on tasks",
                id: "NRyQf8",
              })}
            >
              <SettingsSegmented
                ariaLabel={motionLabel}
                value={motion}
                onChange={onMotionChange}
                testId="settings__motion"
                options={[
                  {
                    value: "full",
                    label: intl.formatMessage({
                      description: "SettingsAppearance - full motion",
                      defaultMessage: "Full",
                      id: "XLKrFR",
                    }),
                  },
                  {
                    value: "reduced",
                    label: intl.formatMessage({
                      description: "SettingsAppearance - reduced motion",
                      defaultMessage: "Reduced",
                      id: "THTXi6",
                    }),
                  },
                  {
                    value: "system",
                    label: intl.formatMessage({
                      description: "SettingsAppearance - motion following the device setting",
                      defaultMessage: "System",
                      id: "7aFuOi",
                    }),
                  },
                ]}
              />
            </SettingsRow>
          </SettingsPanel>
        </div>
        <AppearancePreview
          today={today}
          density={density}
          tintByContext={tintByContext}
          className="max-xl:order-first xl:sticky xl:top-6"
        />
      </div>
    </SettingsSectionShell>
  );
}
