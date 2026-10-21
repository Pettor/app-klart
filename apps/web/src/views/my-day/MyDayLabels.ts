import type { IntlShape } from "react-intl";
import type { SmartView } from "~/core/tasks/KlartAtoms";

export function getSmartViewLabel(intl: IntlShape, view: SmartView): string {
  switch (view) {
    case "day":
      return intl.formatMessage({
        description: "MyDay - smart view name",
        defaultMessage: "My Day",
        id: "CylMGm",
      });
    case "important":
      return intl.formatMessage({
        description: "MyDay - smart view name",
        defaultMessage: "Important",
        id: "sNJ1E3",
      });
    case "planned":
      return intl.formatMessage({
        description: "MyDay - smart view name",
        defaultMessage: "Planned",
        id: "Ny9hxp",
      });
    case "tasks":
      return intl.formatMessage({
        description: "MyDay - smart view name",
        defaultMessage: "Tasks",
        id: "XtMNtO",
      });
  }
}
