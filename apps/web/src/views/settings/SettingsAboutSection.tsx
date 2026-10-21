import type { ReactElement, ReactNode } from "react";
import { useIntl } from "react-intl";
import { SettingsPanel, SettingsSectionShell } from "./SettingsSectionShell";

export interface SettingsAboutSectionProps {
  appName: string;
  version: string;
  /** CI build number; undefined for local builds. */
  build?: string;
  commit?: string;
}

interface AboutRowProps {
  label: string;
  value: ReactNode;
  testId: string;
}

function AboutRow({ label, value, testId }: AboutRowProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 px-[18px] py-3.5">
      <span>{label}</span>
      <span className="text-muted font-mono text-xs select-all" data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

export function SettingsAboutSection({ appName, version, build, commit }: SettingsAboutSectionProps): ReactElement {
  const intl = useIntl();

  return (
    <SettingsSectionShell
      id="about"
      title={intl.formatMessage({
        description: "SettingsAbout - section heading",
        defaultMessage: "About",
        id: "TYWxwb",
      })}
      description={intl.formatMessage(
        {
          description: "SettingsAbout - section intro",
          defaultMessage: "Which build of {appName} you're running. Include it when reporting a problem.",
          id: "P+5ROr",
        },
        { appName }
      )}
    >
      <SettingsPanel>
        <AboutRow
          label={intl.formatMessage({
            description: "SettingsAbout - version row label",
            defaultMessage: "Version",
            id: "yZQ/S4",
          })}
          value={version}
          testId="settings__about-version"
        />
        <AboutRow
          label={intl.formatMessage({
            description: "SettingsAbout - build number row label",
            defaultMessage: "Build",
            id: "/1Jn7l",
          })}
          value={
            build ??
            intl.formatMessage({
              description: "SettingsAbout - build value when not built by CI",
              defaultMessage: "Local build",
              id: "sVk9WU",
            })
          }
          testId="settings__about-build"
        />
        {commit && (
          <AboutRow
            label={intl.formatMessage({
              description: "SettingsAbout - commit row label",
              defaultMessage: "Commit",
              id: "Jsie28",
            })}
            value={commit}
            testId="settings__about-commit"
          />
        )}
      </SettingsPanel>
    </SettingsSectionShell>
  );
}
