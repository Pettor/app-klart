import { useState } from "react";
import type { SuggestionItem } from "./SuggestionList";
import type { SuggestionKind } from "~/core/tasks/Suggestions";

/** "pick" is the ranked list with a top pick; the others narrow it to one kind. */
export type SuggestionFilter = "pick" | SuggestionKind;

const FILTERS: SuggestionFilter[] = ["pick", "overdue", "soon", "related", "important"];

/** How many rows "Next up" shows, before and after "Show a few more". */
const REST_LIMIT = 4;
const REST_LIMIT_MORE = 10;

export interface SuggestionFilterState {
  /** The filters that would show something. */
  filters: SuggestionFilter[];
  /** The chip shown as pressed; none while searching. */
  activeFilter: SuggestionFilter | null;
  pickFilter: (filter: SuggestionFilter) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
  topPick: SuggestionItem | null;
  rest: SuggestionItem[];
  isEmpty: boolean;
  canShowMore: boolean;
  canShowFewer: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

function matchesQuery(item: SuggestionItem, query: string): boolean {
  return `${item.title} ${item.tags.join(" ")}`.toLowerCase().includes(query.replace(/^#/, ""));
}

/** The panel's filter chips, search and "show more", and the top pick and rows they leave. */
export function useSuggestionFilter(items: SuggestionItem[]): SuggestionFilterState {
  const [selected, setSelected] = useState<SuggestionFilter>("pick");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filters = FILTERS.filter((filter) => filter === "pick" || items.some((item) => item.kinds.includes(filter)));
  // The last overdue task may just have been added: fall back rather than strand the list on a chip that's gone.
  const filter = filters.includes(selected) ? selected : "pick";
  const search = query.trim().toLowerCase();
  const isSearching = search.length > 0;

  const listed = items.filter((item) =>
    isSearching ? matchesQuery(item, search) : filter === "pick" || item.kinds.includes(filter)
  );
  const topPick = !isSearching && filter === "pick" ? (listed[0] ?? null) : null;
  const allRest = topPick ? listed.slice(1) : listed;

  return {
    filters,
    activeFilter: isSearching ? null : filter,
    pickFilter: (next) => {
      setSelected(next);
      setIsExpanded(false);
      setQuery("");
    },
    isSearchOpen,
    toggleSearch: () => {
      setIsSearchOpen(!isSearchOpen);
      setQuery("");
    },
    query,
    setQuery: (next) => {
      setQuery(next);
      setIsExpanded(false);
    },
    isSearching,
    topPick,
    rest: allRest.slice(0, isExpanded ? REST_LIMIT_MORE : REST_LIMIT),
    isEmpty: listed.length === 0,
    canShowMore: !isExpanded && allRest.length > REST_LIMIT,
    canShowFewer: isExpanded && allRest.length > REST_LIMIT,
    setIsExpanded,
  };
}
