/**
 * The data version is the app's `major.minor`: a minor release may change what's
 * in the files, a patch release never does. Each folder's `klart.json` records
 * the newest data version that wrote to it, and an app with an older one stops
 * syncing with that folder until it's updated, so it never reads files it only
 * half understands or writes over them in an older format.
 */
export function toDataVersion(appVersion: string): string {
  const [major = "0", minor = "0"] = appVersion.split(/[-+]/)[0]!.split(".");
  return `${Number(major) || 0}.${Number(minor) || 0}`;
}

/** This app's data version. */
export const DATA_VERSION = toDataVersion(import.meta.env.VITE_APP_VERSION ?? "0.0.0");

/** Whether data version `a` is newer than `b` ("0.10" > "0.9"). */
export function isNewerDataVersion(a: string, b: string): boolean {
  const [majorA, minorA] = toDataVersion(a).split(".").map(Number);
  const [majorB, minorB] = toDataVersion(b).split(".").map(Number);
  return majorA! !== majorB! ? majorA! > majorB! : minorA! > minorB!;
}

/** A sync's folder was written by a newer version of Klart; this app must be updated before it syncs again. */
export class NewerDataVersionError extends Error {
  constructor(
    /** The folder's data version, e.g. "0.8". */
    readonly folderVersion: string
  ) {
    super(`This folder needs Klart ${folderVersion} or newer.`);
    this.name = "NewerDataVersionError";
  }
}
