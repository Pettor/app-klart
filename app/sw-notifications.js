// Imported into the generated service worker (see `importScripts` in @config/vite's PWA config).
// Tapping a notification brings Klart forward: an open window if there is one, else a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((client) => client.url.startsWith(self.registration.scope));
      if (open) {
        await open.focus();
        return;
      }
      await self.clients.openWindow(self.registration.scope);
    })()
  );
});
