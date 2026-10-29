import { Button, toast } from "@heroui/react";
import { CommonDecorator, ToastDecorator } from "@package/storybook";
import type { StoryObj } from "@storybook/react-vite";
import { useIntl } from "react-intl";
import { expect, within } from "storybook/test";
import { SyncOutdatedDialogProps } from "./SyncOutdatedDialog";

const meta = {
  title: "Feedback/Sync Outdated",
  tags: ["autodocs"],
  decorators: [CommonDecorator, ToastDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The installed web app: "Update" loads the newest version. */
export const CanUpdate: Story = {
  render: () => {
    const intl = useIntl();
    return (
      <Button
        onPress={() => {
          const [msg, opts] = SyncOutdatedDialogProps(
            intl,
            "Klart",
            "0.8",
            () => console.log("onClose"),
            () => console.log("onUpdate")
          );
          toast(msg, opts);
        }}
      >
        Show Toast
      </Button>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show Toast" }));

    const body = within(document.body);
    await expect(await body.findByText(/Klart 0\.8 or newer is needed/i)).toBeInTheDocument();
    await expect(await body.findByRole("button", { name: /update/i })).toBeInTheDocument();
  },
};

/** The desktop app can't update itself, so the toast only explains. */
export const Desktop: Story = {
  render: () => {
    const intl = useIntl();
    return (
      <Button
        onPress={() => {
          const [msg, opts] = SyncOutdatedDialogProps(intl, "Klart", "0.8", () => console.log("onClose"), null);
          toast(msg, opts);
        }}
      >
        Show Toast
      </Button>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show Toast" }));

    const body = within(document.body);
    await expect(await body.findByText(/Install the latest Klart/i)).toBeInTheDocument();
  },
};
