import type { DayFile, DayItemSource, SuggestionReason } from "./Day";
import { DAY_SCHEMA } from "./Day";
import type { KlartData } from "./KlartData";
import { addDays, toLocalDate, toUtcTimestamp } from "./LocalDate";
import type { Task } from "./Task";
import { TASK_SCHEMA } from "./Task";
import type { KlartContext } from "~/core/contexts/KlartContext";
import { DEFAULT_CONTEXTS } from "~/core/contexts/KlartContext";
import { createSampleShopping } from "~/core/shopping/ShoppingSampleData";

/** Ids of sample tasks and contexts start with this, so they can be told apart from real ones. */
export const SAMPLE_ID_PREFIX = "sample-";

/** Dev builds only (`VITE_SAMPLE_DATA`): start with sample data instead of an empty list. */
export const SAMPLE_DATA_ENABLED = import.meta.env.VITE_SAMPLE_DATA === "true";

const SAMPLE_CONTEXTS: KlartContext[] = [
  ...DEFAULT_CONTEXTS,
  { id: "sample-club", name: "Football club", color: "green", tag: "club" },
  { id: "sample-side", name: "Side project", color: "violet", tag: "side" },
  { id: "sample-health", name: "Health", color: "teal", tag: "health" },
  { id: "sample-travel", name: "Travel", color: "pink", tag: "travel" },
];

interface SampleTask {
  id: string;
  title: string;
  context: string;
  tags?: string[];
  /** Days from today. */
  due?: number;
  /** Days from today and a time, e.g. `[0, "17:30"]`. */
  remind?: [number, string];
  important?: boolean;
  status?: Task["status"];
  /** Days from today the task was completed (done tasks only). */
  completed?: number;
  notes?: string;
  links?: string[];
  /** Days ago the task was created. */
  created: number;
  /** In today's My Day, and how it got there. */
  today?: DayItemSource | [DayItemSource, SuggestionReason];
  /** In yesterday's My Day. */
  yesterday?: boolean;
}

/**
 * Covers every view and suggestion group: overdue, due today, left from yesterday, coming up, related to
 * today, recently added, planned far ahead, reminders, links, notes, important, done and archived tasks.
 */
const SAMPLE_TASKS: SampleTask[] = [
  // My Day, in display order.
  {
    id: "w1",
    title: "Review sync PR for gateway client",
    context: "work",
    tags: ["acme", "review"],
    due: 0,
    remind: [0, "14:00"],
    today: "user",
    links: ["https://github.com/acme/gateway-client/pull/412"],
    created: 3,
  },
  {
    id: "p1",
    title: "Beredskap: ny brandsläckare",
    context: "personal",
    tags: ["hem", "familj"],
    important: true,
    today: ["suggestion", "overdue"],
    due: -2,
    created: 12,
  },
  {
    id: "w2",
    title: "Write the quarterly update for the platform team",
    context: "work",
    tags: ["acme", "docs"],
    today: "quick_add",
    notes: "Cover: sync reliability, the GitHub backend, desktop app adoption.\n\nAsk Sam for the latency numbers.",
    created: 1,
  },
  {
    id: "b1",
    title: "Packa bollar och västar till träningen",
    context: "sample-club",
    tags: ["träning"],
    today: "agent",
    created: 2,
  },
  {
    id: "h1",
    title: "Book dentist appointment",
    context: "sample-health",
    tags: ["vård"],
    remind: [0, "08:30"],
    today: ["suggestion", "left_from_yesterday"],
    yesterday: true,
    created: 6,
  },
  {
    id: "p2",
    title: "Betala elräkningen",
    context: "personal",
    tags: ["ekonomi"],
    due: 0,
    status: "done",
    completed: 0,
    today: "user",
    created: 9,
  },
  {
    id: "w3",
    title: "Update onboarding docs",
    context: "work",
    tags: ["acme", "docs"],
    status: "done",
    completed: 0,
    today: "user",
    created: 5,
  },

  // Overdue.
  {
    id: "p3",
    title: "Byt munstycke på tandborsten",
    context: "personal",
    tags: ["hem"],
    due: -1,
    important: true,
    created: 20,
  },
  { id: "w4", title: "Send expense report for September", context: "work", tags: ["admin"], due: -9, created: 30 },
  {
    id: "b2",
    title: "Skicka ut protokollet från årsmötet",
    context: "sample-club",
    tags: ["styrelse"],
    due: -45,
    created: 60,
  },

  // Due today, not yet planned.
  {
    id: "p4",
    title: "Köp kattmat och sand",
    context: "personal",
    tags: ["köp"],
    due: 0,
    remind: [0, "17:30"],
    created: 4,
  },
  { id: "s1", title: "Renew the klart.dev domain", context: "sample-side", tags: ["infra"], due: 0, created: 40 },

  // Left from yesterday.
  { id: "p5", title: "Fixa den knarrande dörren", context: "personal", tags: ["hem"], yesterday: true, created: 8 },
  { id: "w5", title: "1:1 prep with Alex", context: "work", tags: ["team"], yesterday: true, created: 7 },

  // Coming up (next three days).
  {
    id: "w6",
    title: "Prepare sprint planning",
    context: "work",
    tags: ["team", "acme"],
    due: 1,
    remind: [1, "09:00"],
    important: true,
    created: 4,
  },
  { id: "b3", title: "Styrelsemöte: förbered budget", context: "sample-club", tags: ["styrelse"], due: 2, created: 14 },
  {
    id: "t1",
    title: "Check in online for the Berlin flight",
    context: "sample-travel",
    tags: ["berlin"],
    due: 3,
    remind: [2, "18:00"],
    links: ["https://www.sas.se/", "https://maps.google.com/?q=Berlin+Brandenburg+Airport"],
    created: 10,
  },

  // Related to today (shares #review, #hem or #familj with a My Day task).
  { id: "w7", title: "Review design doc for offline mode", context: "work", tags: ["review"], created: 11 },
  { id: "p6", title: "Rensa förrådet", context: "personal", tags: ["hem"], created: 25 },
  { id: "p7", title: "Adele: guldpeng i simning", context: "personal", tags: ["familj", "barn"], created: 15 },

  // Planned further ahead.
  {
    id: "h2",
    title: "Register for Midnattsloppet",
    context: "sample-health",
    tags: ["löpning"],
    due: 6,
    created: 18,
  },
  {
    id: "t2",
    title: "Book hotel in Lisbon for the conference",
    context: "sample-travel",
    tags: ["lisbon", "konferens"],
    due: 14,
    important: true,
    links: ["https://example.com/conference/venue"],
    created: 3,
  },
  {
    id: "s2",
    title: "Ship 0.3.0 with recurring tasks",
    context: "sample-side",
    tags: ["release"],
    due: 30,
    created: 21,
  },
  {
    id: "p8",
    title: "Byt till vinterdäck",
    context: "personal",
    tags: ["bil"],
    due: 10,
    remind: [9, "19:00"],
    created: 13,
  },
  { id: "b4", title: "Årsredovisning till revisorn", context: "sample-club", tags: ["ekonomi"], due: 90, created: 33 },

  // No due date: recently added and older backlog.
  { id: "s3", title: "Try a dark-mode friendly accent palette", context: "sample-side", tags: ["design"], created: 0 },
  {
    id: "w8",
    title:
      "Investigate why the GitHub backend sometimes reports a conflict on the first sync after reconnecting a phone that was offline for a long time",
    context: "work",
    tags: ["acme", "bug", "sync"],
    notes: "Repro: disconnect wifi for a day, edit two tasks, reconnect.\n\n- Check the ETag handling\n- Check retries",
    links: [
      "https://github.com/acme/gateway-client/issues/398",
      "https://github.com/acme/gateway-client/pull/401",
      "https://docs.github.com/en/rest/git/refs",
    ],
    created: 0,
  },
  { id: "h3", title: "Stretch 10 minutes every evening", context: "sample-health", tags: ["rutin"], created: 1 },
  { id: "p9", title: "Beställ: Algot utehus", context: "personal", tags: ["hem", "köp"], created: 50 },
  { id: "s4", title: "Write a blog post about the folder format", context: "sample-side", tags: ["docs"], created: 70 },
  { id: "t3", title: "Renew passport", context: "sample-travel", tags: ["admin"], important: true, created: 45 },

  // Done earlier, and archived.
  {
    id: "w9",
    title: "Migrate CI to the new runners",
    context: "work",
    tags: ["acme", "infra"],
    status: "done",
    completed: -3,
    created: 20,
  },
  {
    id: "p10",
    title: "Lämna tillbaka biblioteksböckerna",
    context: "personal",
    tags: ["ärenden"],
    status: "done",
    completed: -1,
    yesterday: true,
    created: 6,
  },
  {
    id: "s5",
    title: "Old idea: browser extension",
    context: "sample-side",
    tags: ["idé"],
    status: "archived",
    created: 90,
  },
];

function sampleId(id: string): string {
  return `${SAMPLE_ID_PREFIX}${id}`;
}

function toTask(sample: SampleTask, today: string, now: Date): Task {
  const created = new Date(now.getTime() - sample.created * 86_400_000 - 3_600_000);
  const status = sample.status ?? "open";
  const completedAt =
    status === "done" ? toUtcTimestamp(new Date(now.getTime() + (sample.completed ?? 0) * 86_400_000)) : null;
  return {
    schema: TASK_SCHEMA,
    id: sampleId(sample.id),
    title: sample.title,
    context: sample.context,
    tags: sample.tags ?? [],
    due: sample.due === undefined ? null : addDays(today, sample.due),
    remindAt: sample.remind ? `${addDays(today, sample.remind[0])}T${sample.remind[1]}` : null,
    important: sample.important ?? false,
    status,
    notes: sample.notes ?? "",
    links: sample.links ?? [],
    createdAt: toUtcTimestamp(created),
    updatedAt: completedAt ?? toUtcTimestamp(created),
    completedAt,
    raw: "",
  };
}

function toDay(date: string, samples: SampleTask[], sourceOf: (sample: SampleTask) => SampleTask["today"]): DayFile {
  return {
    schema: DAY_SCHEMA,
    date,
    items: samples.map((sample) => {
      const source = sourceOf(sample) ?? "user";
      const [addedBy, reason] = Array.isArray(source) ? source : [source, null];
      return { taskId: sampleId(sample.id), addedAt: `${date}T07:00:00Z`, addedBy, reason };
    }),
  };
}

/** A wide set of tasks across six contexts, dated relative to `now` so every suggestion group shows up. */
export function createSampleData(now: Date = new Date()): KlartData {
  const today = toLocalDate(now);
  const yesterday = addDays(today, -1);
  const shopping = createSampleShopping(SAMPLE_ID_PREFIX, today, now, "personal");
  const todayDay = toDay(
    today,
    SAMPLE_TASKS.filter((sample) => sample.today),
    (sample) => sample.today
  );
  return {
    contexts: SAMPLE_CONTEXTS,
    tasks: {
      ...Object.fromEntries(SAMPLE_TASKS.map((sample) => [sampleId(sample.id), toTask(sample, today, now)])),
      ...shopping.tasks,
    },
    lists: shopping.lists,
    days: {
      [today]: {
        ...todayDay,
        items: [
          ...todayDay.items,
          ...Object.keys(shopping.tasks).map((taskId) => ({
            taskId,
            addedAt: `${today}T07:00:00Z`,
            addedBy: "user" as const,
            reason: null,
          })),
        ],
      },
      [yesterday]: toDay(
        yesterday,
        SAMPLE_TASKS.filter((sample) => sample.yesterday),
        () => "user"
      ),
    },
  };
}

/** Drops sample tasks, their My Day entries, and sample contexts no remaining task uses. */
function isSample(id: string): boolean {
  return id.startsWith(SAMPLE_ID_PREFIX);
}

export function withoutSampleData(data: KlartData): KlartData {
  const tasks = Object.fromEntries(Object.entries(data.tasks).filter(([id]) => !isSample(id)));
  const usedContexts = new Set(Object.values(tasks).map((task) => task.context));
  const days = Object.fromEntries(
    Object.entries(data.days)
      .filter(([, day]) => day.items.length === 0 || day.items.some((item) => !isSample(item.taskId)))
      .map(([date, day]) => [date, { ...day, items: day.items.filter((item) => !isSample(item.taskId)) }])
  );
  return {
    contexts: data.contexts.filter((context) => !isSample(context.id) || usedContexts.has(context.id)),
    tasks,
    days,
    lists: Object.fromEntries(Object.entries(data.lists).filter(([id]) => !isSample(id))),
  };
}

export function hasSampleData(data: KlartData): boolean {
  return (
    Object.keys(data.tasks).some(isSample) ||
    Object.keys(data.lists).some(isSample) ||
    data.contexts.some((context) => isSample(context.id))
  );
}
