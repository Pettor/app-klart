import type { IntlShape } from "react-intl";
import type { PlannedGroupId } from "./MyDayPlannedGroups";
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

export function getPlannedGroupLabel(intl: IntlShape, group: PlannedGroupId): string {
  switch (group) {
    case "overdue":
      return intl.formatMessage({
        description: "MyDayTaskList - Planned section: tasks past their due date",
        defaultMessage: "Overdue",
        id: "H1NT8z",
      });
    case "today":
      return intl.formatMessage({
        description: "MyDayTaskList - Planned section: tasks due today",
        defaultMessage: "Today",
        id: "pMT1g4",
      });
    case "tomorrow":
      return intl.formatMessage({
        description: "MyDayTaskList - Planned section: tasks due tomorrow",
        defaultMessage: "Tomorrow",
        id: "64sSuO",
      });
    case "week":
      return intl.formatMessage({
        description: "MyDayTaskList - Planned section: tasks due within the next 7 days",
        defaultMessage: "Next 7 days",
        id: "pZgv9i",
      });
    case "later":
      return intl.formatMessage({
        description: "MyDayTaskList - Planned section: tasks due more than a week from now",
        defaultMessage: "Later",
        id: "V9m7MI",
      });
  }
}
