import { guessCategory } from "./ShoppingCategory";
import type { ShoppingItem, ShoppingList, ShoppingListKind } from "./ShoppingList";
import { SHOPPING_LIST_SCHEMA } from "./ShoppingList";
import { addDays, toUtcTimestamp } from "~/core/tasks/LocalDate";
import type { Task } from "~/core/tasks/Task";
import { TASK_SCHEMA } from "~/core/tasks/Task";

interface SampleItem {
  name: string;
  qty?: number;
  price?: number;
  link?: string;
  note?: string;
  bought?: boolean;
  important?: boolean;
  /** Linked to a task in today's My Day. */
  inDay?: boolean;
}

interface SampleList {
  id: string;
  name: string;
  kind: ShoppingListKind;
  /** Days from today. */
  date?: number;
  /** Days from today the list was completed. */
  completed?: number;
  items: SampleItem[];
}

/** The lists from the Shopping design: a weekly grocery run, a birthday, home supplies and a completed list. */
const SAMPLE_LISTS: SampleList[] = [
  {
    id: "list-week",
    name: "Veckohandling",
    kind: "grocery",
    items: [
      { name: "Mjölk", qty: 2 },
      { name: "Bananer" },
      { name: "Kaffe", note: "mellanrost" },
      { name: "Kattmat och sand", important: true, inDay: true },
      { name: "Tomater" },
      { name: "Pasta", qty: 2 },
      { name: "Kycklingfilé" },
      { name: "Yoghurt", bought: true },
      { name: "Knäckebröd", bought: true },
    ],
  },
  {
    id: "list-party",
    name: "Adeles födelsedag",
    kind: "gift",
    date: 10,
    items: [
      { name: "LEGO Friends set", important: true, inDay: true, price: 499, link: "https://www.lekia.se/" },
      { name: "Pysselbok", price: 149, link: "https://www.adlibris.com/se" },
      { name: "Ballonger och girlang", price: 89 },
      { name: "Tårtljus", bought: true, price: 29 },
    ],
  },
  {
    id: "list-home",
    name: "Hem & förråd",
    kind: "home",
    items: [
      { name: "Brandsläckare 6 kg", important: true, price: 649, link: "https://www.clasohlson.com/se/" },
      { name: "Hyllplan till Algot", qty: 2, link: "https://www.ikea.com/se/sv/" },
      { name: "Glödlampor E27", qty: 4 },
    ],
  },
  {
    id: "list-friday",
    name: "Fredagsmys",
    kind: "grocery",
    completed: -4,
    items: [
      { name: "Tortillas", bought: true },
      { name: "Färs", bought: true },
      { name: "Chips", bought: true },
      { name: "Läsk" },
    ],
  },
];

export interface SampleShopping {
  lists: Record<string, ShoppingList>;
  /** Tasks made from items, all in today's My Day. */
  tasks: Record<string, Task>;
}

/**
 * Sample shopping lists with ids starting with `prefix`, all in `context`. Items marked for My Day get a linked task
 * there, titled with `taskTitle`.
 */
export function createSampleShopping(
  prefix: string,
  today: string,
  now: Date,
  context: string,
  taskTitle: (item: string) => string = (item) => `Buy: ${item}`
): SampleShopping {
  const created = toUtcTimestamp(new Date(now.getTime() - 2 * 86_400_000));
  const lists: Record<string, ShoppingList> = {};
  const tasks: Record<string, Task> = {};

  for (const sample of SAMPLE_LISTS) {
    const listId = `${prefix}${sample.id}`;
    const items = sample.items.map((entry, index): ShoppingItem => {
      const id = `${listId}-${index + 1}`;
      const taskId = entry.inDay ? `${id}-task` : null;
      if (taskId) {
        tasks[taskId] = {
          schema: TASK_SCHEMA,
          id: taskId,
          title: taskTitle(entry.name),
          context,
          tags: [],
          due: sample.date === undefined ? null : addDays(today, sample.date),
          remindAt: null,
          important: entry.important ?? false,
          status: "open",
          notes: entry.note ?? "",
          links: entry.link ? [entry.link] : [],
          createdAt: created,
          updatedAt: created,
          completedAt: null,
          raw: "",
          shopping: { listId, itemId: id },
        };
      }
      return {
        id,
        name: entry.name,
        qty: entry.qty ?? null,
        price: entry.price ?? null,
        link: entry.link ?? null,
        note: entry.note ?? "",
        category: guessCategory(entry.name),
        bought: entry.bought ?? false,
        important: entry.important ?? false,
        taskId,
        createdAt: created,
        updatedAt: created,
      };
    });
    lists[listId] = {
      schema: SHOPPING_LIST_SCHEMA,
      id: listId,
      name: sample.name,
      kind: sample.kind,
      context,
      date: sample.date === undefined ? null : addDays(today, sample.date),
      completedAt:
        sample.completed === undefined ? null : toUtcTimestamp(new Date(now.getTime() + sample.completed * 86_400_000)),
      deletedAt: null,
      taskId: null,
      items,
      createdAt: created,
      updatedAt: created,
    };
  }

  return { lists, tasks };
}
