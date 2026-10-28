import type { KlartContext } from "~/core/contexts/KlartContext";
import { createSampleShopping } from "~/core/shopping/ShoppingSampleData";
import type { DayFile } from "~/core/tasks/Day";
import type { KlartData } from "~/core/tasks/KlartData";
import type { Task } from "~/core/tasks/Task";

/** A Wednesday. All demo dates are relative to it. */
export const DEMO_TODAY = "2026-10-21";

export const DEMO_CONTEXTS: KlartContext[] = [
  { id: "personal", name: "Personal", color: "blue", tag: "personal" },
  { id: "work", name: "Work", color: "orange", tag: "work" },
  { id: "club", name: "Football club", color: "green", tag: "club" },
];

interface DemoTask {
  id: string;
  title: string;
  context: string;
  tags: string[];
  due?: string;
  remindAt?: string;
  important?: boolean;
  done?: boolean;
  inToday?: boolean;
  inYesterday?: boolean;
  links?: string[];
}

const DEMO_TASKS: DemoTask[] = [
  { id: "p1", title: "Beställ: Algot utehus", context: "personal", tags: ["hem", "köp"] },
  { id: "p2", title: "Boka Body pump", context: "personal", tags: ["träning"], due: "2026-09-02" },
  { id: "p3", title: "Adele Guldpeng", context: "personal", tags: ["familj", "barn"], due: "2026-08-28" },
  {
    id: "p4",
    title: "Byt munstycke tandborste",
    context: "personal",
    tags: ["hem"],
    due: "2026-10-20",
    important: true,
  },
  {
    id: "p5",
    title: "Köp: Kattmat och sand",
    context: "personal",
    tags: ["köp"],
    due: "2026-10-21",
    remindAt: "2026-10-21T17:30",
  },
  { id: "p6", title: "Hem: fixa knarrande dörr", context: "personal", tags: ["hem"], inYesterday: true },
  { id: "p8", title: "Beredskap: Ny brandsläckare", context: "personal", tags: ["hem", "familj"], inToday: true },
  { id: "p10", title: "Betala elräkning", context: "personal", tags: ["ekonomi"], inToday: true, done: true },
  { id: "b1", title: "Protokoll från årsmötet", context: "club", tags: ["styrelse"], due: "2026-10-23" },
  { id: "b2", title: "Packa bollar och västar", context: "club", tags: ["träning"], inToday: true },
  {
    id: "w1",
    title: "Review sync PR for gateway client",
    context: "work",
    tags: ["acme", "review"],
    due: "2026-10-21",
    remindAt: "2026-10-21T14:00",
    inToday: true,
    links: ["https://github.com/acme/gateway-client/pull/412"],
  },
  {
    id: "w2",
    title: "Prepare sprint planning",
    context: "work",
    tags: ["team", "acme"],
    due: "2026-10-22",
    remindAt: "2026-10-22T09:00",
  },
  { id: "w3", title: "1:1 prep", context: "work", tags: ["team"], inYesterday: true },
  { id: "w4", title: "Find more tasks to create", context: "work", tags: ["acme", "team"], due: "2026-07-08" },
  { id: "w5", title: "Update onboarding docs", context: "work", tags: ["acme", "docs"], inToday: true, done: true },
];

function toTask(demo: DemoTask, index: number): Task {
  const timestamp = `2026-10-${String(1 + index).padStart(2, "0")}T08:00:00Z`;
  return {
    schema: "klart.task/v1",
    id: demo.id,
    title: demo.title,
    context: demo.context,
    tags: demo.tags,
    due: demo.due ?? null,
    remindAt: demo.remindAt ?? null,
    important: demo.important ?? false,
    status: demo.done ? "done" : "open",
    notes: "",
    links: demo.links ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: demo.done ? "2026-10-21T07:30:00Z" : null,
    raw: "",
  };
}

function toDay(date: string, ids: string[]): DayFile {
  return {
    schema: "klart.day/v1",
    date,
    items: ids.map((taskId) => ({ taskId, addedAt: `${date}T07:00:00Z`, addedBy: "user", reason: null })),
  };
}

/** The Shopping design's lists, two items of which are tasks in today's My Day. */
export const DEMO_SHOPPING = createSampleShopping("", DEMO_TODAY, new Date("2026-10-21T10:00:00Z"), "personal");

/** The sample data from the Klart design, as a full data folder. */
export const DEMO_DATA: KlartData = {
  contexts: DEMO_CONTEXTS,
  tasks: {
    ...Object.fromEntries(DEMO_TASKS.map((demo, index) => [demo.id, toTask(demo, index)])),
    ...DEMO_SHOPPING.tasks,
  },
  lists: DEMO_SHOPPING.lists,
  days: {
    [DEMO_TODAY]: toDay(DEMO_TODAY, [
      ...DEMO_TASKS.filter((demo) => demo.inToday).map((demo) => demo.id),
      ...Object.keys(DEMO_SHOPPING.tasks),
    ]),
    "2026-10-20": toDay(
      "2026-10-20",
      DEMO_TASKS.filter((demo) => demo.inYesterday).map((demo) => demo.id)
    ),
  },
};
