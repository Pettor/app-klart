import type { ReactElement } from "react";
import { useAtomValue } from "jotai";
import { syncSetupAtom } from "./SyncAtoms";
import type { SyncTarget } from "./SyncTargets";
import { useFolderSyncLifecycle, useSyncTargetLifecycle } from "./UseFolderSyncLifecycle";
import { useOutdatedSyncNotice } from "./UseOutdatedSyncNotice";
import { SAMPLE_DATA_ENABLED } from "~/core/tasks/SampleData";
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
  useOutdatedSyncNotice();
  const { targets } = useAtomValue(syncSetupAtom);
  return (
    <>
      {/* Dev sample data never syncs: it would replace the real data in the folder, or be replaced by it. */}
      {!SAMPLE_DATA_ENABLED && targets.map((target) => <SyncTargetLifecycle key={target.id} target={target} />)}
      {children}
    </>
  );
}
