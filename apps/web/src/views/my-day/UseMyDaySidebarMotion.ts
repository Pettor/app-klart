import { useState } from "react";

/**
 * Whether the sidebar should slide in: only once it has been collapsed or expanded. My Day and Shopping are
 * separate routes, so the sidebar mounts afresh on every switch and would otherwise replay the slide each time.
 */
export function useMyDaySidebarMotion(isCollapsed: boolean): boolean {
  const [seenCollapsed, setSeenCollapsed] = useState(isCollapsed);
  const [hasToggled, setHasToggled] = useState(false);

  if (isCollapsed !== seenCollapsed) {
    setSeenCollapsed(isCollapsed);
    setHasToggled(true);
  }

  return hasToggled;
}
