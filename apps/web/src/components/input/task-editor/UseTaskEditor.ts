import { useState } from "react";
import type { TaskEditorPatch, TaskEditorTask } from "./TaskEditor";
import { toTaskLink, toTaskLinks } from "~/core/tasks/TaskLink";

export interface TaskEditorDrafts {
  title: string;
  setTitle: (value: string) => void;
  commitTitle: () => void;
  tags: string;
  setTags: (value: string) => void;
  commitTags: () => void;
  notes: string;
  setNotes: (value: string) => void;
  commitNotes: () => void;
  newLink: string;
  setNewLink: (value: string) => void;
  /** True once a non-empty draft that isn't an `http(s)://` link has been committed. */
  isNewLinkInvalid: boolean;
  commitNewLink: () => void;
  removeLink: (link: string) => void;
}

function formatTags(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(" ");
}

/** Lowercase, without `#`, distinct. Accepts spaces or commas between tags. */
export function parseTags(value: string): string[] {
  const tags = value
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#+/, "").toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)];
}

/**
 * Text fields keep a local draft and save on blur (or Enter), so typing doesn't write
 * the task file on every keystroke. Mount with `key={task.id}` to reset drafts per task.
 */
export function useTaskEditor(task: TaskEditorTask, onChange: (patch: TaskEditorPatch) => void): TaskEditorDrafts {
  const [title, setTitle] = useState(task.title);
  const [tags, setTags] = useState(formatTags(task.tags));
  const [notes, setNotes] = useState(task.notes);
  const [newLink, setNewLink] = useState("");
  const [isNewLinkInvalid, setIsNewLinkInvalid] = useState(false);

  function commitTitle(): void {
    const next = title.replace(/\s+/g, " ").trim();
    if (!next) {
      setTitle(task.title);
    } else if (next !== task.title) {
      onChange({ title: next });
    }
  }

  function commitTags(): void {
    const next = parseTags(tags);
    setTags(formatTags(next));
    if (next.join(" ") !== task.tags.join(" ")) {
      onChange({ tags: next });
    }
  }

  function commitNotes(): void {
    if (notes !== task.notes) {
      onChange({ notes });
    }
  }

  function commitNewLink(): void {
    const typed = newLink.trim();
    if (!typed) {
      setIsNewLinkInvalid(false);
      return;
    }
    const link = toTaskLink(typed);
    if (!link) {
      setIsNewLinkInvalid(true);
      return;
    }
    setNewLink("");
    setIsNewLinkInvalid(false);
    onChange({ links: toTaskLinks([...task.links, link]) });
  }

  return {
    title,
    setTitle,
    commitTitle,
    tags,
    setTags,
    commitTags,
    notes,
    setNotes,
    commitNotes,
    newLink,
    setNewLink: (value) => {
      setNewLink(value);
      setIsNewLinkInvalid(false);
    },
    isNewLinkInvalid,
    commitNewLink,
    removeLink: (link) => onChange({ links: task.links.filter((other) => other !== link) }),
  };
}
