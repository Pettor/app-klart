import type { ReactElement } from "react";
import { useNotificationScheduler } from "./UseNotificationScheduler";

export interface NotificationLifecycleProps {
  children: ReactElement;
}

/** Sends task reminders and daily summaries while Klart is open. */
export function NotificationLifecycle({ children }: NotificationLifecycleProps): ReactElement {
  useNotificationScheduler();
  return children;
}
