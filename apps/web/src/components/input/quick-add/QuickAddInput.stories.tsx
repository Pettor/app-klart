import { useState, type ReactElement } from "react";
import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { QuickAddInput } from "./QuickAddInput";
import type { QuickAddInputProps } from "./QuickAddInput";
import { DEFAULT_CONTEXTS, findContext } from "~/core/contexts/KlartContext";
import { parseQuickAdd } from "~/core/tasks/QuickAdd";

const TODAY = "2026-10-21";

interface WrapperProps {
  initialValue?: string;
  compact?: boolean;
  onSubmit: (value: string) => void;
}

/** Runs the real parser so the preview reacts to typing. */
function QuickAddInputWrapper({ initialValue = "", compact, onSubmit }: WrapperProps): ReactElement {
  const [value, setValue] = useState(initialValue);
  const parsed = parseQuickAdd(value, { today: TODAY, contexts: DEFAULT_CONTEXTS, currentContext: "personal" });
  const context = findContext(DEFAULT_CONTEXTS, parsed.context)!;
  const preview: QuickAddInputProps["preview"] = value.trim()
    ? {
        title: parsed.title,
        contextName: context.name,
        contextColor: context.color,
        due: parsed.due,
        remindAt: parsed.remindAt,
        important: parsed.important,
        tags: parsed.tags.filter((tag) => tag !== context.tag),
      }
    : null;

  return (
    <div className="w-[640px] max-w-full">
      <QuickAddInput
        value={value}
        onChange={setValue}
        onSubmit={() => {
          onSubmit(value);
          setValue("");
        }}
        preview={preview}
        today={TODAY}
        compact={compact}
      />
    </div>
  );
}

const meta: Meta<typeof QuickAddInputWrapper> = {
  component: QuickAddInputWrapper,
  title: "Input/Quick Add",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
  args: { onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSyntax: Story = {
  args: { initialValue: "#work #acme @fri ^09:00 ! prepare sprint planning" },
};

export const Compact: Story = {
  args: { compact: true },
};

export const TypeAndSubmit: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByTestId("quick-add__input");
    await userEvent.type(input, "#work @tomorrow find more tasks to create");

    const preview = canvas.getByTestId("quick-add__preview");
    await expect(preview).toHaveTextContent("Find more tasks to create");
    await expect(preview).toHaveTextContent("Work");
    await expect(preview).toHaveTextContent("Due Tomorrow (2026-10-22)");

    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledWith("#work @tomorrow find more tasks to create");
    await expect(input).toHaveValue("");
  },
};
