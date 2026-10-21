import type { ReactElement } from "react";
import { useFolderSyncLifecycle } from "./UseFolderSyncLifecycle";
import { useTodayTicker } from "~/core/tasks/UseToday";

export interface FolderSyncLifecycleProps {
  children: ReactElement;
}

/** Keeps today's date current and the data folder in sync for everything below it. */
export function FolderSyncLifecycle({ children }: FolderSyncLifecycleProps): ReactElement {
  useTodayTicker();
  useFolderSyncLifecycle();
  return children;
}
