import type { MyDayTask } from "./MyDayTypes";
import { addDays } from "~/core/tasks/LocalDate";

export type PlannedGroupId = "overdue" | "today" | "tomorrow" | "week" | "later";

export interface PlannedGroup {
  id: PlannedGroupId;
  tasks: MyDayTask[];
}

const GROUP_ORDER: PlannedGroupId[] = ["overdue", "today", "tomorrow", "week", "later"];

function groupOf(due: string, today: string): PlannedGroupId {
  if (due < today) {
    return "overdue";
  }
  if (due === today) {
    return "today";
  }
  if (due === addDays(today, 1)) {
    return "tomorrow";
  }
  return due <= addDays(today, 7) ? "week" : "later";
}

/** Planned's sections, like Microsoft To Do: overdue, today, tomorrow, the next 7 days, later. Empty ones are left out. */
export function groupPlannedTasks(tasks: MyDayTask[], today: string): PlannedGroup[] {
  const byGroup = new Map<PlannedGroupId, MyDayTask[]>();
  for (const task of tasks) {
    if (!task.due) {
      continue;
    }
    const id = groupOf(task.due, today);
    byGroup.set(id, [...(byGroup.get(id) ?? []), task]);
  }
  return GROUP_ORDER.flatMap((id) => {
    const grouped = byGroup.get(id);
    return grouped ? [{ id, tasks: grouped }] : [];
  });
}
