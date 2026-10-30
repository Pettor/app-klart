import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import "../src/main.css";

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <IntlProvider locale="en" messages={{}}>
        <Story {...context} />
      </IntlProvider>
    ),
    withThemeByClassName({
      themes: {
        light: "light",
        paper: "light paper",
        bloom: "light bloom",
        dark: "dark",
        midnight: "dark midnight",
        graphite: "dark graphite",
        vivid: "dark vivid",
      },
      defaultTheme: "light",
    }),
  ],
  parameters: {
    a11y: {
      test: "error",
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Design System",
          "Views",
          "Actions",
          "Core",
          "Display",
          "Feedback",
          "Forms",
          "Input",
          "Layout",
          "Navigation",
          "Shared",
        ],
      },
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
};

export default preview;
