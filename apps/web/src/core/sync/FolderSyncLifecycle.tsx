import type { ReactElement } from "react";
import { useAtomValue } from "jotai";
import { syncSetupAtom } from "./SyncAtoms";
import type { SyncTarget } from "./SyncTargets";
import { useFolderSyncLifecycle, useSyncTargetLifecycle } from "./UseFolderSyncLifecycle";
import { useTodayTicker } from "~/core/tasks/UseToday";

export interface FolderSyncLifecycleProps {
  children: ReactElement;
}

/** Runs one sync. Renders nothing. */
function SyncTargetLifecycle({ target }: { target: SyncTarget }): null {
  useSyncTargetLifecycle(target);
  return null;
}

/** Keeps today's date current and every sync's data in sync for everything below it. */
export function FolderSyncLifecycle({ children }: FolderSyncLifecycleProps): ReactElement {
  useTodayTicker();
  useFolderSyncLifecycle();
  const { targets } = useAtomValue(syncSetupAtom);
  return (
    <>
      {targets.map((target) => (
        <SyncTargetLifecycle key={target.id} target={target} />
      ))}
      {children}
    </>
  );
}
