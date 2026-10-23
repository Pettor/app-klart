import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, waitFor, within } from "storybook/test";
import { TaskDetailsSheet as Component } from "./TaskDetailsSheet";
import type { TaskDetailsSheetProps as Props } from "./TaskDetailsSheet";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Display/Task Details Sheet",
  tags: ["autodocs"],
  globals: { viewport: { value: "iphonex" } },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  today: "2026-10-21",
  task: {
    id: "p1",
    title: "Beställ: Algot utehus och extra hyllplan till förrådet, kolla leveranstid innan helgen",
    done: false,
    important: true,
    due: "2026-10-20",
    remindAt: "2026-10-21T17:30",
    tags: ["hem", "köp", "förråd"],
    links: ["https://www.ikea.com/se/sv/p/algot-utehus", "https://www.ikea.com/se/sv/p/hyllplan"],
    hasNotes: true,
    notes: "Mät förrådsväggen först: 120 cm bred.\nHämta hellre än leverans om tiden är över en vecka.",
    isInMyDay: true,
    contextName: "Personal",
    contextColor: "blue",
  },
  onClose: fn(),
  onToggleDone: fn(),
  onToggleImportant: fn(),
  onAddToMyDay: fn(),
  onRemoveFromMyDay: fn(),
  onEdit: fn(),
} satisfies Props;

/** The whole title, pills, links, the note and the actions the lean row leaves out. */
export const Default: Story = {
  args: defaultArgs,
  play: async () => {
    const sheet = within(await screen.findByTestId("task-details"));
    await expect(sheet.getByTestId("task-details__title")).toHaveTextContent(defaultArgs.task.title);
    await expect(sheet.getAllByTestId("task-links__link")).toHaveLength(2);
    await expect(sheet.getByTestId("task-details__note")).toHaveTextContent("120 cm bred");
    await expect(sheet.getByText("#förråd")).toBeInTheDocument();
  },
};

/** Completing from the sheet animates the check, then marks the task done and closes the sheet. */
export const Complete: Story = {
  args: defaultArgs,
  play: async ({ args, userEvent }) => {
    await userEvent.click(await screen.findByTestId("task-details__toggle"));
    await expect(args.onToggleDone).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onToggleDone).toHaveBeenCalledWith("p1", true));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const Actions: Story = {
  args: defaultArgs,
  play: async ({ args, userEvent }) => {
    await userEvent.click(await screen.findByTestId("task-details__important"));
    await expect(args.onToggleImportant).toHaveBeenCalledWith("p1");

    await userEvent.click(screen.getByTestId("task-details__edit"));
    await expect(args.onEdit).toHaveBeenCalledWith("p1");

    await userEvent.click(screen.getByTestId("task-details__my-day"));
    await expect(args.onRemoveFromMyDay).toHaveBeenCalledWith("p1");
    await expect(args.onClose).toHaveBeenCalled();
  },
};

/** A task outside My Day, with nothing but a title: no links or note sections, and an Add button. */
export const NotInMyDay: Story = {
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      title: "Boka Body pump",
      important: false,
      due: null,
      remindAt: null,
      tags: [],
      links: [],
      hasNotes: false,
      notes: "",
      isInMyDay: false,
    },
  },
  play: async ({ args, userEvent }) => {
    const sheet = within(await screen.findByTestId("task-details"));
    await expect(sheet.queryByTestId("task-details__links")).toBeNull();
    await expect(sheet.queryByTestId("task-details__note")).toBeNull();
    await userEvent.click(sheet.getByRole("button", { name: "Add to My Day" }));
    await expect(args.onAddToMyDay).toHaveBeenCalledWith("p1");
  },
};
