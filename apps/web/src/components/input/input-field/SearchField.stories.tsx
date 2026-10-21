import { useState, type ReactElement } from "react";
import { ContainerDecorator } from "@package/storybook";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { SearchField } from "./SearchField";

interface WrapperProps {
  placeholder?: string;
  initialValue?: string;
  shortcutHint?: string;
  tags?: string[];
}

function SearchFieldWrapper({ placeholder, initialValue = "", shortcutHint, tags }: WrapperProps): ReactElement {
  const [value, setValue] = useState(initialValue);
  return (
    <SearchField
      ariaLabel="Search"
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      shortcutHint={shortcutHint}
      tags={tags}
      className="w-64"
    />
  );
}

const meta: Meta<typeof SearchFieldWrapper> = {
  component: SearchFieldWrapper,
  title: "Input/Search Field",
  tags: ["autodocs"],
  decorators: [ContainerDecorator],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Search…",
  },
};

export const WithValue: Story = {
  args: {
    placeholder: "Search…",
    initialValue: "invoice",
  },
};

export const WithShortcutHint: Story = {
  args: {
    placeholder: "Search…",
    shortcutHint: "/",
  },
};

export const WithTagSuggestions: Story = {
  args: {
    placeholder: "Search or #tag",
    tags: ["acme", "review", "hem", "release", "docs"],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("searchbox");
    await userEvent.type(input, "#re");

    const suggestions = canvas.getAllByTestId("search-field__tag-suggestion");
    await expect(suggestions.map((item) => item.textContent)).toEqual(["#review", "#release"]);

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("#release ");
    await expect(canvas.queryByTestId("search-field__tag-suggestions")).toBeNull();

    await userEvent.type(input, "#");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByTestId("search-field__tag-suggestions")).toBeNull();
    await expect(input).toHaveValue("#release #");

    await userEvent.type(input, "d");
    await userEvent.click(canvas.getByText("docs"));
    await expect(input).toHaveValue("#release #docs ");
  },
};
