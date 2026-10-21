/** Small path-based helpers on top of a directory handle. Paths use `/` and are relative to the root. */

export interface FolderFile {
  path: string;
  handle: FileSystemFileHandle;
}

function split(path: string): { dirs: string[]; name: string } {
  const parts = path.split("/").filter(Boolean);
  const name = parts.pop() ?? "";
  return { dirs: parts, name };
}

async function getDirectory(
  root: FileSystemDirectoryHandle,
  dirs: string[],
  create: boolean
): Promise<FileSystemDirectoryHandle | null> {
  let current = root;
  for (const dir of dirs) {
    try {
      current = await current.getDirectoryHandle(dir, { create });
    } catch (error) {
      if (!create && error instanceof DOMException && error.name === "NotFoundError") {
        return null;
      }
      throw error;
    }
  }
  return current;
}

export async function getFileHandle(
  root: FileSystemDirectoryHandle,
  path: string
): Promise<FileSystemFileHandle | null> {
  const { dirs, name } = split(path);
  const dir = await getDirectory(root, dirs, false);
  if (!dir) {
    return null;
  }
  try {
    return await dir.getFileHandle(name);
  } catch (error) {
    if (error instanceof DOMException && (error.name === "NotFoundError" || error.name === "TypeMismatchError")) {
      return null;
    }
    throw error;
  }
}

/** Writes a text file, creating folders as needed. Returns the file's new `lastModified`. */
export async function writeTextFile(root: FileSystemDirectoryHandle, path: string, text: string): Promise<number> {
  const { dirs, name } = split(path);
  const dir = await getDirectory(root, dirs, true);
  const handle = await dir!.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
  return (await handle.getFile()).lastModified;
}

export async function removeFile(root: FileSystemDirectoryHandle, path: string): Promise<void> {
  const { dirs, name } = split(path);
  const dir = await getDirectory(root, dirs, false);
  try {
    await dir?.removeEntry(name);
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "NotFoundError")) {
      throw error;
    }
  }
}

/** Lists files under `path`, descending at most `depth` folder levels. Hidden entries are skipped. */
export async function listFiles(root: FileSystemDirectoryHandle, path: string, depth: number): Promise<FolderFile[]> {
  const dir = await getDirectory(root, path.split("/").filter(Boolean), false);
  if (!dir) {
    return [];
  }
  const files: FolderFile[] = [];
  for await (const [name, entry] of dir.entries()) {
    if (name.startsWith(".")) {
      continue;
    }
    const entryPath = path ? `${path}/${name}` : name;
    if (entry.kind === "file") {
      files.push({ path: entryPath, handle: entry });
    } else if (depth > 0) {
      files.push(...(await listFiles(root, entryPath, depth - 1)));
    }
  }
  return files;
}
