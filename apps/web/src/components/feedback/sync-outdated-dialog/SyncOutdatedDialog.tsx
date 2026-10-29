import type { ReactElement } from "react";
import type { toast } from "@heroui/react";
import type { IntlShape } from "react-intl";

/**
 * The toast shown when a newer version of the app synced first and this one stopped syncing.
 * `onUpdate` is `null` where the app can't update itself (the desktop app): the toast then only explains.
 */
export function SyncOutdatedDialogProps(
  intl: IntlShape,
  appName: string,
  folderVersion: string,
  onClose: () => void,
  onUpdate: (() => void) | null
): [ReactElement | string, options?: Parameters<typeof toast>[1]] {
  return [
    intl.formatMessage(
      {
        description: "SyncOutdatedDialog: toast - a newer version of the app has synced, so this one paused syncing",
        defaultMessage: "Sync paused: {appName} {version} or newer is needed",
        id: "rWFIe4",
      },
      { appName, version: folderVersion }
    ),
    {
      variant: "warning",
      timeout: 0,
      onClose,
      description: onUpdate
        ? intl.formatMessage({
            description: "SyncOutdatedDialog: toast - explains what Update does",
            defaultMessage:
              "Another device synced with a newer version. Update to keep syncing; your changes stay here until then.",
            id: "9uDkdB",
          })
        : intl.formatMessage(
            {
              description: "SyncOutdatedDialog: toast - desktop app, which is updated by installing a new build",
              defaultMessage:
                "Another device synced with a newer version. Install the latest {appName} to keep syncing; your changes stay here until then.",
              id: "CPVn82",
            },
            { appName }
          ),
      actionProps: onUpdate
        ? {
            children: intl.formatMessage({
              description: "SyncOutdatedDialog: button - load the newest version of the app",
              defaultMessage: "Update",
              id: "tv/aHl",
            }),
            onPress: onUpdate,
          }
        : undefined,
    },
  ];
}
