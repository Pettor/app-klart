import { useState } from "react";
import type { Automation } from "~/core/automations/Automations";

export type AutomationDraft = Omit<Automation, "id">;

/** `editingId` of an automation that isn't added yet. */
export const NEW_AUTOMATION = "new";

export interface UseSettingsAutomationsSectionOptions {
  isDesktop: boolean;
  onAdd: (automation: AutomationDraft) => void;
  onUpdate: (id: string, patch: Partial<Automation>) => void;
}

export interface UseSettingsAutomationsSectionResult {
  /** The automation open in the editor: its id, `NEW_AUTOMATION`, or null. */
  editingId: string | null;
  draft: AutomationDraft;
  canSave: boolean;
  changeDraft: (patch: Partial<AutomationDraft>) => void;
  startAdd: () => void;
  startEdit: (automation: Automation) => void;
  cancel: () => void;
  save: () => void;
}

function emptyDraft(isDesktop: boolean): AutomationDraft {
  return { name: "", enabled: true, kind: isDesktop ? "command" : "webhook" };
}

/** One automation is edited at a time, as a draft; nothing changes until Save, so a name never changes by itself. */
export function useSettingsAutomationsSection({
  isDesktop,
  onAdd,
  onUpdate,
}: UseSettingsAutomationsSectionOptions): UseSettingsAutomationsSectionResult {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AutomationDraft>(() => emptyDraft(isDesktop));
  const name = draft.name.trim();

  function startAdd(): void {
    setDraft(emptyDraft(isDesktop));
    setEditingId(NEW_AUTOMATION);
  }

  function startEdit({ id, ...automation }: Automation): void {
    setDraft(automation);
    setEditingId(id);
  }

  function save(): void {
    if (!name || editingId === null) {
      return;
    }
    const saved = { ...draft, name, url: draft.url?.trim() };
    if (editingId === NEW_AUTOMATION) {
      onAdd(saved);
    } else {
      onUpdate(editingId, saved);
    }
    setEditingId(null);
  }

  return {
    editingId,
    draft,
    canSave: name !== "",
    changeDraft: (patch) => setDraft((current) => ({ ...current, ...patch })),
    startAdd,
    startEdit,
    cancel: () => setEditingId(null),
    save,
  };
}
