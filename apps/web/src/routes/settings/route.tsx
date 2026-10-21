import type { ReactElement } from "react";
import { useDocumentTitle } from "@package/react";
import { createFileRoute } from "@tanstack/react-router";
import { useIntl } from "react-intl";
import { z } from "zod";
import { useSettingsRoute } from "./-UseSettingsRoute";
import { CommandPaletteController } from "~/components/actions/command-palette/CommandPaletteController";
import { WhatsNewDialogController } from "~/components/feedback/whats-new-dialog/WhatsNewDialogController";
import { RouteError } from "~/core/routes/logic/RouteError";
import { SETTINGS_SECTION_IDS } from "~/core/settings/SettingsSection";
import { SettingsView } from "~/views/settings/SettingsView";

const settingsSearchSchema = z.object({
  section: z.enum(SETTINGS_SECTION_IDS).optional().catch(undefined),
});

export const Route = createFileRoute("/settings")({
  validateSearch: settingsSearchSchema,
  component: SettingsPageRoute,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

function SettingsPageRoute(): ReactElement {
  const intl = useIntl();
  useDocumentTitle(
    intl.formatMessage({
      description: "SettingsRoute - document title",
      defaultMessage: "Settings · Klart",
      id: "66r4a3",
    })
  );
  const { section } = Route.useSearch();
  const props = useSettingsRoute(section);

  return (
    <>
      <SettingsView {...props} />
      <CommandPaletteController />
      <WhatsNewDialogController />
    </>
  );
}
