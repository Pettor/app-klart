import { desktop, isDesktop } from "~/core/platform/Desktop";

export interface NotificationContent {
  title: string;
  body: string;
  /** Replaces an earlier notification with the same tag instead of stacking. */
  tag: string;
}

const ICON = "pwa-192x192.png";

/**
 * Shows a system notification: natively in the desktop app; in the browser
 * through the service worker when one is registered (works with the window in
 * the background), else the page API.
 */
export async function showSystemNotification({ title, body, tag }: NotificationContent): Promise<void> {
  if (isDesktop()) {
    await desktop.showNotification(title, body);
    return;
  }
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) {
    await registration.showNotification(title, { body, tag, icon: ICON, badge: ICON });
    return;
  }
  const notification = new Notification(title, { body, tag, icon: ICON });
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
