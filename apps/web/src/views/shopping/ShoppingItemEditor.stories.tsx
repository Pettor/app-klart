import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen } from "storybook/test";
import { ShoppingItemEditor as Component } from "./ShoppingItemEditor";
import type { ShoppingItemEditorProps as Props } from "./ShoppingItemEditor";

const meta: Meta<typeof Component> = {
  component: Component,
  title: "Views/Shopping Item Editor",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  item: {
    id: "i1",
    name: "Mjölk",
    qty: 2,
    price: 25,
    link: null,
    note: "",
    category: "dairy",
    bought: false,
    important: false,
    isInMyDay: false,
  },
  color: "green",
  showCategory: true,
  onChange: fn(),
  onToggleBought: fn(),
  onToggleImportant: fn(),
  onToggleMyDay: fn(),
  onRemove: fn(),
  onClose: fn(),
} satisfies Props;

export const Default: Story = {
  args: defaultArgs,
};

/** Only grocery lists group by store section. */
export const NotGrocery: Story = {
  args: { ...defaultArgs, showCategory: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByTestId("shopping-item-editor__category")).toBeNull();
  },
};

/** My Day doesn't take bought items, so the button goes. */
export const Bought: Story = {
  args: { ...defaultArgs, item: { ...defaultArgs.item, bought: true } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByTestId("shopping-item-editor__my-day")).toBeNull();
  },
};

export const Rename: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const name = canvas.getByTestId("shopping-item-editor__name");
    await userEvent.clear(name);
    await userEvent.type(name, "Havremjölk{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({ name: "Havremjölk" });
  },
};

export const EmptyNameReverts: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const name = canvas.getByTestId("shopping-item-editor__name");
    await userEvent.clear(name);
    await userEvent.tab();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(name).toHaveValue("Mjölk");
  },
};

export const EditNumbers: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const qty = canvas.getByTestId("shopping-item-editor__qty");
    await userEvent.clear(qty);
    await userEvent.type(qty, "1.5{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText("Enter a whole number, 1 or more.")).toBeVisible();
    await userEvent.clear(qty);
    await userEvent.type(qty, "3{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({ qty: 3 });

    const price = canvas.getByTestId("shopping-item-editor__price");
    await userEvent.clear(price);
    await userEvent.type(price, "19,90{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({ price: 19.9 });
    await userEvent.clear(price);
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledWith({ price: null });
  },
};

export const EditLink: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByTestId("shopping-item-editor__link");
    await userEvent.type(link, "not a link{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText("Links must start with http://, https:// or www.")).toBeVisible();
    await userEvent.clear(link);
    await userEvent.type(link, "www.ica.se{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({ link: "https://www.ica.se" });
  },
};

export const EditNote: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByTestId("shopping-item-editor__note"), "Laktosfri");
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledWith({ note: "Laktosfri" });
  },
};

export const PickStoreSection: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Store section/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Pantry" }));
    await expect(args.onChange).toHaveBeenCalledWith({ category: "pantry" });
  },
};

export const ToggleActions: Story = {
  args: defaultArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("shopping-item-editor__toggle"));
    await expect(args.onToggleBought).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__important"));
    await expect(args.onToggleImportant).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__my-day"));
    await expect(args.onToggleMyDay).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__remove"));
    await expect(args.onRemove).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("shopping-item-editor__close"));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
