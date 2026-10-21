export function useAppInfo(): {
  appName: string;
  appNameCapital: string;
} {
  const appName = "Klart";
  const appNameCapital = appName.toUpperCase();

  return {
    appName,
    appNameCapital,
  };
}
