/**
 * Folder handles can't go in localStorage, but they survive in IndexedDB
 * (structured clone). One small object store holds each sync's folder, keyed by
 * the sync's id. Before several syncs, the one folder was kept under `data-folder`.
 */
const DB_NAME = "klart";
const STORE = "handles";
export const LEGACY_FOLDER_KEY = "data-folder";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function loadFolderHandle(key: string): Promise<FileSystemDirectoryHandle | undefined> {
  if (typeof indexedDB === "undefined") {
    return undefined;
  }
  return run<FileSystemDirectoryHandle | undefined>("readonly", (store) => store.get(key));
}

export async function saveFolderHandle(key: string, handle: FileSystemDirectoryHandle): Promise<void> {
  await run("readwrite", (store) => store.put(handle, key));
}

export async function clearFolderHandle(key: string): Promise<void> {
  await run("readwrite", (store) => store.delete(key));
}
