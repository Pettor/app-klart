import type { ReactElement } from "react";
import { useDocumentTitle } from "@package/react";
import { createFileRoute } from "@tanstack/react-router";
import { useIntl } from "react-intl";
import { useMyDayRoute } from "./-UseMyDayRoute";
import { CommandPaletteController } from "~/components/actions/command-palette/CommandPaletteController";
import { RouteError } from "~/core/routes/logic/RouteError";
import { MyDayView } from "~/views/my-day/MyDayView";

export const Route = createFileRoute("/")({
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
  const props = useMyDayRoute();

  return (
    <>
      <MyDayView {...props} />
      <CommandPaletteController />
    </>
  );
}
