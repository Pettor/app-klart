import { useState, type FocusEvent, type KeyboardEvent } from "react";
import { completeTag, getTagQuery, matchTags } from "./TagCompletion";

export interface TagCompletion {
  /** Tags to offer; empty while the list is hidden. */
  suggestions: string[];
  activeIndex: number;
  select: (tag: string) => void;
  /** Goes on the field's wrapper, in the capture phase, so the keys never reach the input while the list is open. */
  onKeyDownCapture: (event: KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: (event: FocusEvent) => void;
}

/** Suggests existing tags while the last word typed in `value` starts with `#`. */
export function useTagCompletion(value: string, onChange: (value: string) => void, tags: string[]): TagCompletion {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  /** The value the list was dismissed at (Escape); typing anything else shows it again. */
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setActiveIndex(0);
  }

  const query = getTagQuery(value);
  const isOpen = isFocused && query !== null && dismissedAt !== value;
  const suggestions = isOpen ? matchTags(tags, query, value) : [];
  const active = Math.min(activeIndex, Math.max(suggestions.length - 1, 0));

  function select(tag: string): void {
    onChange(completeTag(value, tag));
  }

  function onKeyDownCapture(event: KeyboardEvent): void {
    if (suggestions.length === 0 || event.nativeEvent.isComposing) return;
    const handled = ["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(event.key);
    if (!handled || (event.key === "Tab" && event.shiftKey)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "ArrowDown") setActiveIndex((active + 1) % suggestions.length);
    if (event.key === "ArrowUp") setActiveIndex((active - 1 + suggestions.length) % suggestions.length);
    if (event.key === "Enter" || event.key === "Tab") select(suggestions[active]!);
    if (event.key === "Escape") setDismissedAt(value);
  }

  return {
    suggestions,
    activeIndex: active,
    select,
    onKeyDownCapture,
    onFocus: () => setIsFocused(true),
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false);
    },
  };
}
