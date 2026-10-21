export interface NotificationContent {
  title: string;
  body: string;
  /** Replaces an earlier notification with the same tag instead of stacking. */
  tag: string;
}

const ICON = "pwa-192x192.png";

/**
 * Shows a system notification. Uses the service worker when one is
 * registered (works with the window in the background), else the page API.
 */
export async function showSystemNotification({ title, body, tag }: NotificationContent): Promise<void> {
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
