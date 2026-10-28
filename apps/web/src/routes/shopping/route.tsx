import type { ReactElement } from "react";
import { useDocumentTitle } from "@package/react";
import { createFileRoute } from "@tanstack/react-router";
import { useIntl } from "react-intl";
import { z } from "zod";
import { useShoppingRoute } from "./-UseShoppingRoute";
import { CommandPaletteController } from "~/components/actions/command-palette/CommandPaletteController";
import { WhatsNewDialogController } from "~/components/feedback/whats-new-dialog/WhatsNewDialogController";
import { RouteError } from "~/core/routes/logic/RouteError";
import { useMyDayRoute } from "~/routes/index/-UseMyDayRoute";
import { MyDayView } from "~/views/my-day/MyDayView";
import { ShoppingView } from "~/views/shopping/ShoppingView";

const shoppingSearchSchema = z.object({
  /** The list shown; on phones its presence picks the list over the lists. */
  list: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/shopping")({
  validateSearch: shoppingSearchSchema,
  component: ShoppingPageRoute,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

function ShoppingPageRoute(): ReactElement {
  const intl = useIntl();
  useDocumentTitle(
    intl.formatMessage({
      description: "ShoppingRoute - document title",
      defaultMessage: "Shopping · Klart",
      id: "9ng1cL",
    })
  );
  const { list } = Route.useSearch();
  // Shopping is a page of My Day: the sidebar stays and only the main area changes.
  const myDay = useMyDayRoute(null, "shop");
  const props = useShoppingRoute(list ?? null);

  return (
    <>
      <MyDayView {...myDay} page={<ShoppingView {...props} />} />
      <CommandPaletteController />
      <WhatsNewDialogController />
    </>
  );
}
