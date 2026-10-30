import type { ReactElement } from "react";
import { Radio, RadioGroup } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { ThemeMode } from "~/core/theme/ThemeMode";

export interface ThemeSelectorProps {
  mode: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
}

/** Colors of a theme's miniature: sidebar, backdrop, task card, the card's edge and the accent. */
interface ThemeSwatch {
  side: string;
  main: string;
  card: string;
  edge: string;
  accent: string;
}

const SWATCHES: Record<ThemeMode, ThemeSwatch> = {
  auto: { side: "#eceef1", main: "#111114", card: "#18181c", edge: "#27272c", accent: "#2d7ff9" },
  light: { side: "#f5f6f8", main: "#e8f0fb", card: "#ffffff", edge: "#d3d8e1", accent: "#2f74d9" },
  paper: { side: "#f6f3ec", main: "#ecf0f3", card: "#fffdf8", edge: "#e2dbcd", accent: "#c2562c" },
  bloom: { side: "#fdf7ff", main: "#ffe1f0", card: "#ffffff", edge: "#f7a8cf", accent: "#db2777" },
  dark: { side: "#0c0c0f", main: "#111114", card: "#18181c", edge: "#27272c", accent: "#2d7ff9" },
  midnight: { side: "#0e1220", main: "#111d3b", card: "#1d2640", edge: "#0a0e19", accent: "#5b8cff" },
  graphite: { side: "#1c1d1f", main: "#1d2024", card: "#242527", edge: "#303135", accent: "#e6e6e6" },
  vivid: { side: "#000000", main: "#000000", card: "#0d0d0f", edge: "#26262b", accent: "#0a84ff" },
};

interface ThemeOptionProps {
  value: ThemeMode;
  label: string;
  hint: string;
}

/** A miniature of My Day in the theme's colors: sidebar, two task cards and an accent bar. */
function ThemePreview({ swatch }: { swatch: ThemeSwatch }): ReactElement {
  const card = { background: swatch.card, boxShadow: `0 2px 0 ${swatch.edge}` };
  return (
    <span
      aria-hidden
      className="flex h-[76px] w-full self-stretch overflow-hidden rounded-[9px] border border-black/8 dark:border-white/8"
    >
      <span className="w-[30%]" style={{ background: swatch.side }} />
      <span className="flex flex-1 flex-col gap-1.5 px-2 py-2.5" style={{ background: swatch.main }}>
        <span className="h-3 rounded" style={card} />
        <span className="h-3 rounded" style={card} />
        <span className="h-3 w-3/5 rounded" style={{ background: swatch.accent }} />
      </span>
    </span>
  );
}

function ThemeOption({ value, label, hint }: ThemeOptionProps): ReactElement {
  return (
    <Radio
      value={value}
      aria-label={label}
      className={clsx(
        // A ring, not a border: a global border-color rule outside any layer beats Tailwind's border colors.
        "bg-surface ring-separator flex-col items-stretch gap-2.5 rounded-[14px] p-2.5 text-left ring-2 transition ring-inset",
        "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        "data-selected:ring-accent data-selected:bg-accent/8 data-focus-visible:ring-accent"
      )}
    >
      <Radio.Content className="flex w-full flex-col gap-2.5">
        <ThemePreview swatch={SWATCHES[value]} />
        <span className="flex flex-col gap-0.5 px-0.5">
          <span className="font-semibold">{label}</span>
          <span className="text-muted text-xs">{hint}</span>
        </span>
      </Radio.Content>
    </Radio>
  );
}

export function ThemeSelector({ mode, onSelect }: ThemeSelectorProps): ReactElement {
  const intl = useIntl();

  return (
    <RadioGroup
      value={mode}
      onChange={(value) => onSelect(value as ThemeMode)}
      orientation="horizontal"
      aria-label={intl.formatMessage({
        description: "ThemeSelector: aria-label - theme radio group",
        defaultMessage: "Theme",
        id: "aTH1qx",
      })}
      className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3"
    >
      <ThemeOption
        value="auto"
        label={intl.formatMessage({
          description: "ThemeSelector: label - system option, following the device's light or dark mode",
          defaultMessage: "System",
          id: "kn0Zt+",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - system option",
          defaultMessage: "Follows your device's light or dark mode",
          id: "2SRn+c",
        })}
      />
      <ThemeOption
        value="light"
        label={intl.formatMessage({
          description: "ThemeSelector: label - light option",
          defaultMessage: "Light",
          id: "34xMGO",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - light option",
          defaultMessage: "White tiles, soft shadows",
          id: "855fyS",
        })}
      />
      <ThemeOption
        value="paper"
        label={intl.formatMessage({
          description: "ThemeSelector: label - paper option, a warm off-white light theme",
          defaultMessage: "Paper",
          id: "qQq8WT",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - paper option",
          defaultMessage: "Warm and flat, like ink on paper",
          id: "T2RPVf",
        })}
      />
      <ThemeOption
        value="bloom"
        label={intl.formatMessage({
          description: "ThemeSelector: label - bloom option, a colorful light theme",
          defaultMessage: "Bloom",
          id: "c3oBGW",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - bloom option",
          defaultMessage: "Bright, playful colors",
          id: "OxLySX",
        })}
      />
      <ThemeOption
        value="dark"
        label={intl.formatMessage({
          description: "ThemeSelector: label - dark option",
          defaultMessage: "Dark",
          id: "yqsqER",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - dark option",
          defaultMessage: "Near-black, HeroUI style",
          id: "VZvcE7",
        })}
      />
      <ThemeOption
        value="midnight"
        label={intl.formatMessage({
          description: "ThemeSelector: label - midnight option, a navy dark theme",
          defaultMessage: "Midnight",
          id: "RsHeiT",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - midnight option",
          defaultMessage: "Navy, with glowing accents",
          id: "+oSpv2",
        })}
      />
      <ThemeOption
        value="graphite"
        label={intl.formatMessage({
          description: "ThemeSelector: label - graphite option, a gray monochrome dark theme",
          defaultMessage: "Graphite",
          id: "By3CZD",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - graphite option",
          defaultMessage: "Soft gray, flat and quiet",
          id: "i9I/rq",
        })}
      />
      <ThemeOption
        value="vivid"
        label={intl.formatMessage({
          description: "ThemeSelector: label - vivid option, a pure black dark theme with strong colors",
          defaultMessage: "Vivid",
          id: "LuAlnn",
        })}
        hint={intl.formatMessage({
          description: "ThemeSelector: hint - vivid option",
          defaultMessage: "Pure black",
          id: "CLKdJ3",
        })}
      />
    </RadioGroup>
  );
}
