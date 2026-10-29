import { useEffect, useRef } from "react";
import { toast } from "@heroui/react";
import { useAtomValue } from "jotai";
import { useIntl } from "react-intl";
import { isNewerDataVersion } from "./DataVersion";
import { syncStatusesAtom } from "./SyncAtoms";
import { SyncOutdatedDialogProps } from "~/components/feedback/sync-outdated-dialog/SyncOutdatedDialog";
import { useAppInfo } from "~/core/config/UseAppInfo";
import { canUpdateApp, updateApp } from "~/core/pwa/UpdateApp";

/** Tells the user, once per data version, that a sync needs a newer app, with an "Update" button where it can update itself. */
export function useOutdatedSyncNotice(): void {
  const intl = useIntl();
  const { appName } = useAppInfo();
  const statuses = useAtomValue(syncStatusesAtom);
  const shownRef = useRef<string | null>(null);

  let folderVersion: string | null = null;
  for (const status of Object.values(statuses)) {
    if (status.state === "outdated" && status.folderVersion) {
      if (!folderVersion || isNewerDataVersion(status.folderVersion, folderVersion)) {
        folderVersion = status.folderVersion;
      }
    }
  }

  useEffect(() => {
    if (!folderVersion || shownRef.current === folderVersion) {
      return;
    }
    shownRef.current = folderVersion;
    const [msg, opts] = SyncOutdatedDialogProps(
      intl,
      appName,
      folderVersion,
      () => undefined,
      canUpdateApp() ? () => void updateApp() : null
    );
    toast(msg, opts);
  }, [appName, folderVersion, intl]);
}
