const MAX_TAG_SUGGESTIONS = 8;

/** The tag being typed at the end of `value` (lowercase, without `#`), or `null` when the last word isn't a `#tag`. */
export function getTagQuery(value: string): string | null {
  const match = /(?:^|\s)#(\S*)$/.exec(value);
  return match ? match[1]!.toLowerCase() : null;
}

/** Replaces the `#tag` being typed at the end of `value` with `#tag ` so the next word can follow. */
export function completeTag(value: string, tag: string): string {
  return value.replace(/#\S*$/, `#${tag} `);
}

/**
 * Tags matching `query`: prefix matches first, then other matches, each group in the order given.
 * Tags already typed earlier in `value` are left out.
 */
export function matchTags(tags: string[], query: string, value: string): string[] {
  const typed = new Set(
    value
      .toLowerCase()
      .split(/\s+/)
      .slice(0, -1)
      .filter((word) => word.startsWith("#"))
      .map((word) => word.slice(1))
  );
  const candidates = tags.filter((tag) => !typed.has(tag) && tag.includes(query));
  const prefixed = candidates.filter((tag) => tag.startsWith(query));
  const rest = candidates.filter((tag) => !tag.startsWith(query));
  return [...prefixed, ...rest].slice(0, MAX_TAG_SUGGESTIONS);
}
