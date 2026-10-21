import type { ReactElement } from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ResizeHandle as Component } from "./ResizeHandle";
import type { ResizeHandleProps as Props } from "./ResizeHandle";

function Panel(props: Props): ReactElement {
  const [width, setWidth] = useState(props.width);
  const clamp = (value: number): number => Math.min(props.maxWidth, Math.max(props.minWidth, value));

  return (
    <div className="flex h-64 justify-end">
      <aside className="bg-surface border-separator relative border-l p-4" style={{ width }}>
        <Component
          {...props}
          width={width}
          onResize={(value) => {
            setWidth(clamp(value));
            props.onResize(value);
          }}
          onResizeEnd={(value) => {
            setWidth(clamp(value));
            props.onResizeEnd(value);
          }}
        />
        {width}px
      </aside>
    </div>
  );
}

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Input/Resize Handle",
  tags: ["autodocs"],
  render: (args) => <Panel {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  width: 320,
  minWidth: 240,
  maxWidth: 560,
  edge: "left",
  ariaLabel: "Resize panel",
  onResize: fn(),
  onResizeEnd: fn(),
  onReset: fn(),
} satisfies Props;

export const LeftEdge: Story = {
  args: defaultArgs,
};

export const KeyboardResize: Story = {
  args: defaultArgs,
  play: async ({ args, canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize panel" });
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(336);
    await expect(handle).toHaveAttribute("aria-valuenow", "336");
    await userEvent.keyboard("{Home}");
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(240);
  },
};

export const DoubleClickResets: Story = {
  args: defaultArgs,
  play: async ({ args, canvas }) => {
    await userEvent.dblClick(canvas.getByRole("separator"));
    await expect(args.onReset).toHaveBeenCalled();
  },
};
