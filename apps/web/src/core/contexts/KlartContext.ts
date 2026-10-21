/** Palette keys a context can use. Each maps to a `.ctx-<color>` class in `main.css`. */
export const CONTEXT_COLORS = ["blue", "orange", "green", "teal", "violet", "pink", "red"] as const;

export type ContextColor = (typeof CONTEXT_COLORS)[number];

/**
 * A user-defined context (e.g. Personal, Work). Every task belongs to exactly
 * one context. Typing the routing tag in quick add moves a task into it.
 */
export interface KlartContext {
  id: string;
  name: string;
  color: ContextColor;
  /** Lowercase routing tag without `#`, e.g. `work`. */
  tag: string;
}

/** The built-in "All contexts" view. Never stored on a task. */
export const ALL_CONTEXTS = "all";

/** Either a context id or {@link ALL_CONTEXTS}. */
export type ContextSelection = string;

export const DEFAULT_CONTEXTS: KlartContext[] = [
  { id: "personal", name: "Personal", color: "blue", tag: "personal" },
  { id: "work", name: "Work", color: "orange", tag: "work" },
];

/** Normalises user input into a routing tag: lowercase, no `#`, no whitespace. */
export function toContextTag(value: string): string {
  return value.trim().toLowerCase().replace(/^#+/, "").replace(/\s+/g, "-");
}

export function findContext(contexts: KlartContext[], id: string): KlartContext | undefined {
  return contexts.find((context) => context.id === id);
}

export function findContextByTag(contexts: KlartContext[], tag: string): KlartContext | undefined {
  return contexts.find((context) => context.tag === tag);
}

/** The context used when nothing else decides, e.g. quick add while "All contexts" is selected. */
export function getDefaultContextId(contexts: KlartContext[]): string {
  return contexts[0]?.id ?? DEFAULT_CONTEXTS[0]!.id;
}

/** Creates a unique, file-system friendly id for a new context. */
export function createContextId(name: string, existing: KlartContext[]): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "context";
  const taken = new Set(existing.map((context) => context.id).concat(ALL_CONTEXTS));
  let id = base;
  let suffix = 2;
  while (taken.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}
