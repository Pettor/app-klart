import type { DayItem, SuggestionReason } from "./Day";
import type { KlartData } from "./KlartData";
import { addDays } from "./LocalDate";
import type { SuggestionGroup } from "./Suggestions";
import { buildSuggestions } from "./Suggestions";
import type { Task } from "./Task";
import type { ShoppingCategory } from "~/core/shopping/ShoppingCategory";
import type { ShoppingListKind } from "~/core/shopping/ShoppingList";
import { getListContext, isListOpen, itemTotal } from "~/core/shopping/ShoppingList";

/** `views/today.json`: today's day file with full tasks inlined. Read-only for agents. */
export interface TodayView {
  schema: "klart.view.today/v1";
  date: string;
  generatedAt: string;
  items: (DayItem & { task: Task })[];
}

export interface SuggestionsViewItem {
  taskId: string;
  title: string;
  context: string;
  tags: string[];
  due: string | null;
  reason: SuggestionReason;
}

/** `views/suggestions.json`: ranked candidates for My Day. Read-only for agents. */
export interface SuggestionsView {
  schema: "klart.suggestions/v1";
  date: string;
  generatedAt: string;
  items: SuggestionsViewItem[];
}

export interface ShoppingViewItem {
  id: string;
  name: string;
  qty: number | null;
  /** Price per piece, in kronor. */
  price: number | null;
  /** Price times quantity; `null` without a price. */
  total: number | null;
  link: string | null;
  note: string;
  category: ShoppingCategory;
  important: boolean;
  taskId: string | null;
  /** The item's task is in today's My Day. */
  inMyDay: boolean;
}

export interface ShoppingViewList {
  id: string;
  name: string;
  kind: ShoppingListKind;
  /** The context id the list belongs to. */
  context: string;
  date: string | null;
  /** Items not bought yet, starred first. Bought ones are left out. */
  items: ShoppingViewItem[];
  bought: number;
  /** What the items left cost, where they have a price. */
  totalLeft: number;
}

/** `views/shopping.json`: open lists with what's left to buy. Read-only for agents; edit `lists/<id>.json`. */
export interface ShoppingView {
  schema: "klart.view.shopping/v1";
  date: string;
  generatedAt: string;
  itemsLeft: number;
  lists: ShoppingViewList[];
}

export function buildTodayView(data: KlartData, today: string, generatedAt: string): TodayView {
  const items = (data.days[today]?.items ?? []).flatMap((item) => {
    const task = data.tasks[item.taskId];
    return task && task.status !== "archived" ? [{ ...item, task }] : [];
  });
  return { schema: "klart.view.today/v1", date: today, generatedAt, items };
}

export function toSuggestionsViewItems(groups: SuggestionGroup[]): SuggestionsViewItem[] {
  return groups.flatMap((group) =>
    group.tasks.map((task) => ({
      taskId: task.id,
      title: task.title,
      context: task.context,
      tags: task.tags,
      due: task.due,
      reason: group.reason,
    }))
  );
}

export function buildSuggestionsView(data: KlartData, today: string, generatedAt: string): SuggestionsView {
  const groups = buildSuggestions({
    tasks: Object.values(data.tasks),
    today,
    todayDay: data.days[today],
    yesterdayDay: data.days[addDays(today, -1)],
    contextTags: data.contexts.map((context) => context.tag),
  });
  return { schema: "klart.suggestions/v1", date: today, generatedAt, items: toSuggestionsViewItems(groups) };
}

export function buildShoppingView(data: KlartData, today: string, generatedAt: string): ShoppingView {
  const inToday = new Set(data.days[today]?.items.map((item) => item.taskId));
  const lists = Object.values(data.lists)
    .filter(isListOpen)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((list): ShoppingViewList => {
      const left = list.items.filter((item) => !item.bought);
      const ordered = [...left.filter((item) => item.important), ...left.filter((item) => !item.important)];
      const items = ordered.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        total: itemTotal(item),
        link: item.link,
        note: item.note,
        category: item.category,
        important: item.important,
        taskId: item.taskId,
        inMyDay: !!item.taskId && inToday.has(item.taskId),
      }));
      return {
        id: list.id,
        name: list.name,
        kind: list.kind,
        context: getListContext(list, data.contexts),
        date: list.date,
        items,
        bought: list.items.length - left.length,
        totalLeft: items.reduce((sum, item) => sum + (item.total ?? 0), 0),
      };
    });
  return {
    schema: "klart.view.shopping/v1",
    date: today,
    generatedAt,
    itemsLeft: lists.reduce((sum, list) => sum + list.items.length, 0),
    lists,
  };
}
