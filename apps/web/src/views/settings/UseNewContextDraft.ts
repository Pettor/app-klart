import { useState } from "react";
import type { ContextColor } from "~/core/contexts/KlartContext";
import { CONTEXT_COLORS } from "~/core/contexts/KlartContext";

export interface NewContextDraft {
  name: string;
  setName: (value: string) => void;
  /** The sync the new context will live in; `null` when nothing syncs. */
  syncId: string | null;
  setSyncId: (value: string) => void;
  /** Creates the context with the first unused color, then clears the name. */
  create: () => void;
}

/** The "New context" row: its name, the sync it goes to (the primary unless picked) and a free color. */
export function useNewContextDraft(
  usedColors: ContextColor[],
  syncs: { id: string }[],
  onCreate: (name: string, color: ContextColor, syncId: string | null) => void
): NewContextDraft {
  const [name, setName] = useState("");
  const [pickedSyncId, setSyncId] = useState<string | null>(null);
  // Falls back to the primary when nothing was picked or the picked sync was removed.
  const syncId = syncs.find((sync) => sync.id === pickedSyncId)?.id ?? syncs[0]?.id ?? null;

  function create(): void {
    if (!name.trim()) {
      return;
    }
    onCreate(name, CONTEXT_COLORS.find((color) => !usedColors.includes(color)) ?? "teal", syncId);
    setName("");
  }

  return { name, setName, syncId, setSyncId, create };
}
