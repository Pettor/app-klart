import type { FolderBackend, FolderFileInfo } from "./FolderBackend";
import { desktop, folderNameOf } from "~/core/platform/Desktop";

/** The data folder through the desktop app's native file commands. */
export class DesktopFolderBackend implements FolderBackend {
  readonly name: string;

  constructor(private readonly root: string) {
    this.name = folderNameOf(root);
  }

  list(dir: string, depth: number): Promise<FolderFileInfo[]> {
    return desktop.folderList(this.root, dir, depth);
  }

  stat(path: string): Promise<number | null> {
    return desktop.folderStat(this.root, path);
  }

  read(path: string): Promise<string> {
    return desktop.folderRead(this.root, path);
  }

  write(path: string, content: string): Promise<number> {
    return desktop.folderWrite(this.root, path, content);
  }

  remove(path: string): Promise<void> {
    return desktop.folderRemove(this.root, path);
  }
}
