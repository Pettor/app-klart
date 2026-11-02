import type { CSSProperties, ReactElement } from "react";
import { Radio, RadioGroup } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { TaskStyle } from "~/core/theme/ThemeMode";

export interface TaskStyleSelectorProps {
  style: TaskStyle;
  /** The style the current theme has of its own, shown on the "Theme's own" option. */
  themeStyle: Exclude<TaskStyle, "theme">;
  onSelect: (style: TaskStyle) => void;
}

/** A miniature card's corners and edge in each style; colors come from the current theme, as in `main.css`. */
const CARDS: Record<Exclude<TaskStyle, "theme">, { radius: number; checkRadius: string; shadow: string }> = {
  raised: { radius: 5, checkRadius: "9999px", shadow: "0 2px 0 var(--ts-edge), 0 4px 8px -4px var(--ts-shadow-deep)" },
  floating: {
    radius: 6,
    checkRadius: "9999px",
    shadow: "inset 0 0 0 1px var(--ts-line), 0 4px 10px -5px var(--ts-shadow-deep)",
  },
  flat: { radius: 4, checkRadius: "9999px", shadow: "inset 0 0 0 1px var(--ts-line)" },
  square: { radius: 1.5, checkRadius: "1.5px", shadow: "inset 0 0 0 1px var(--ts-line)" },
  glow: {
    radius: 8,
    checkRadius: "9999px",
    shadow:
      "0 2px 0 color-mix(in srgb, var(--ctx) 40%, var(--slab)), 0 5px 10px -5px color-mix(in srgb, var(--ctx) 55%, transparent)",
  },
  outline: {
    radius: 5,
    checkRadius: "9999px",
    shadow: "inset 0 0 0 1px color-mix(in srgb, var(--ctx) 60%, transparent)",
  },
};

/** Two task cards in the style, on the current theme's backdrop. */
function TaskStylePreview({ style }: { style: Exclude<TaskStyle, "theme"> }): ReactElement {
  const card = CARDS[style];
  const cardStyle: CSSProperties = { background: "var(--slab)", borderRadius: card.radius, boxShadow: card.shadow };
  const checkStyle: CSSProperties = { borderRadius: card.checkRadius, borderColor: "var(--ctx)" };
  return (
    <span
      aria-hidden
      className="ctx-blue flex h-[76px] w-full flex-col justify-center gap-2.5 self-stretch overflow-hidden rounded-[9px] bg-(--ctx-backdrop) px-3"
    >
      {[0.75, 0.55].map((width) => (
        <span key={width} className="flex h-5 items-center gap-1.5 px-2" style={cardStyle}>
          <span className="size-2.5 shrink-0 border-[1.5px]" style={checkStyle} />
          <span className="bg-foreground/25 h-1 rounded-full" style={{ width: `${width * 100}%` }} />
        </span>
      ))}
    </span>
  );
}

interface TaskStyleOptionProps {
  value: TaskStyle;
  preview: Exclude<TaskStyle, "theme">;
  label: string;
  hint: string;
}

function TaskStyleOption({ value, preview, label, hint }: TaskStyleOptionProps): ReactElement {
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
        <TaskStylePreview style={preview} />
        <span className="flex flex-col gap-0.5 px-0.5">
          <span className="font-semibold">{label}</span>
          <span className="text-muted text-xs">{hint}</span>
        </span>
      </Radio.Content>
    </Radio>
  );
}

/** Picks the shape of task cards, which goes with any theme. */
export function TaskStyleSelector({ style, themeStyle, onSelect }: TaskStyleSelectorProps): ReactElement {
  const intl = useIntl();

  return (
    <RadioGroup
      value={style}
      onChange={(value) => onSelect(value as TaskStyle)}
      orientation="horizontal"
      aria-label={intl.formatMessage({
        description: "TaskStyleSelector - aria-label of the task style radio group",
        defaultMessage: "Task style",
        id: "7ovijO",
      })}
      className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3"
      data-testid="task-style-selector"
    >
      <TaskStyleOption
        value="theme"
        preview={themeStyle}
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the option that keeps the theme's own task cards",
          defaultMessage: "Theme's own",
          id: "6NsBkC",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the option that keeps the theme's own task cards",
          defaultMessage: "Whatever the theme comes with",
          id: "132QJq",
        })}
      />
      <TaskStyleOption
        value="raised"
        preview="raised"
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the raised style, cards with a solid edge underneath",
          defaultMessage: "Raised",
          id: "/8VG8q",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the raised style",
          defaultMessage: "Tiles that lift and press down",
          id: "hxVUnO",
        })}
      />
      <TaskStyleOption
        value="floating"
        preview="floating"
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the floating style, cards with a soft drop shadow",
          defaultMessage: "Floating",
          id: "P7tXln",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the floating style",
          defaultMessage: "A thin edge and a soft shadow",
          id: "bZWcg2",
        })}
      />
      <TaskStyleOption
        value="flat"
        preview="flat"
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the flat style, cards with only a hairline edge",
          defaultMessage: "Flat",
          id: "D6QnTA",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the flat style",
          defaultMessage: "Just a thin line, no shadow",
          id: "t02Lbc",
        })}
      />
      <TaskStyleOption
        value="square"
        preview="square"
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the square style, flat cards with sharp corners",
          defaultMessage: "Square",
          id: "JclojN",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the square style",
          defaultMessage: "Sharp corners, square checkboxes",
          id: "GAxj83",
        })}
      />
      <TaskStyleOption
        value="glow"
        preview="glow"
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the glow style, round cards shadowed in the context's color",
          defaultMessage: "Glow",
          id: "BiQbyj",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the glow style",
          defaultMessage: "Round, glowing in the context's color",
          id: "qCCyDz",
        })}
      />
      <TaskStyleOption
        value="outline"
        preview="outline"
        label={intl.formatMessage({
          description: "TaskStyleSelector - label of the outline style, cards edged in the context's color",
          defaultMessage: "Outline",
          id: "vlcHXt",
        })}
        hint={intl.formatMessage({
          description: "TaskStyleSelector - hint of the outline style",
          defaultMessage: "Edged in the context's color",
          id: "0k2/Lo",
        })}
      />
    </RadioGroup>
  );
}
