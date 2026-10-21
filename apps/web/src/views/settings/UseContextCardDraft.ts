import { useEffect, useState } from "react";

export interface ContextCardDraft {
  name: string;
  tag: string;
  setName: (value: string) => void;
  setTag: (value: string) => void;
  /** Commits non-empty, changed values and restores the saved ones otherwise. */
  commit: () => void;
}

/** Local edit state for a context's name and routing tag, saved on blur or Enter. */
export function useContextCardDraft(
  saved: { name: string; tag: string },
  onSave: (patch: { name?: string; tag?: string }) => void
): ContextCardDraft {
  const [name, setName] = useState(saved.name);
  const [tag, setTag] = useState(saved.tag);

  useEffect(() => {
    setName(saved.name);
    setTag(saved.tag);
  }, [saved.name, saved.tag]);

  function commit(): void {
    const patch: { name?: string; tag?: string } = {};
    if (name.trim() && name.trim() !== saved.name) {
      patch.name = name.trim();
    }
    if (tag.trim() && tag.trim() !== saved.tag) {
      patch.tag = tag.trim();
    }
    if (patch.name || patch.tag) {
      onSave(patch);
    } else {
      setName(saved.name);
      setTag(saved.tag);
    }
  }

  return { name, tag, setName, setTag, commit };
}
