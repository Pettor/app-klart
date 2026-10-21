import type { ReactElement } from "react";
import { useDocumentTitle } from "@package/react";
import { createFileRoute } from "@tanstack/react-router";
import { useIntl } from "react-intl";
import { z } from "zod";
import { useMyDayRoute } from "./-UseMyDayRoute";
import { CommandPaletteController } from "~/components/actions/command-palette/CommandPaletteController";
import { WhatsNewDialogController } from "~/components/feedback/whats-new-dialog/WhatsNewDialogController";
import { RouteError } from "~/core/routes/logic/RouteError";
import { MyDayView } from "~/views/my-day/MyDayView";

const myDaySearchSchema = z.object({
  /** The task open in the editor; in the URL so Back closes the editor. */
  task: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: myDaySearchSchema,
  component: MyDayPageRoute,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

function MyDayPageRoute(): ReactElement {
  const intl = useIntl();
  useDocumentTitle(
    intl.formatMessage({
      description: "MyDayRoute - document title",
      defaultMessage: "My Day · Klart",
      id: "u8rCAi",
    })
  );
  const { task } = Route.useSearch();
  const props = useMyDayRoute(task ?? null);

  return (
    <>
      <MyDayView {...props} />
      <CommandPaletteController />
      <WhatsNewDialogController />
    </>
  );
}
