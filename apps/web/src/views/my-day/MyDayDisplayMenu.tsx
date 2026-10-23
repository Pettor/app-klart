import type { ReactElement } from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Button, Description, Drawer, Label, Popover, Switch } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import type { MyDayDisplayProps } from "./MyDayTypes";
import type { DisplayOption } from "~/core/tasks/DisplayOptions";
import { hasDisplayExtras, MINIMAL_DISPLAY_OPTIONS } from "~/core/tasks/DisplayOptions";

export interface MyDayDisplayMenuProps {
  display: MyDayDisplayProps;
  /** `sheet` is the phone layout: a round icon button opening a bottom sheet, without the agent JSON option. */
  variant: "popover" | "sheet";
  /** Colors the switches; the menu renders in a portal, outside the view's context class. */
  contextColor: string;
  /** Class names for the trigger button. */
  className?: string;
}

interface OptionText {
  label: string;
  hint: string;
}

/** The Display button: switches for what My Day shows besides task titles, and a reset to the minimal view. */
export function MyDayDisplayMenu({ display, variant, contextColor, className }: MyDayDisplayMenuProps): ReactElement {
  const intl = useIntl();
  const isSheet = variant === "sheet";
  const { options, onChange } = display;
  const hasExtras = hasDisplayExtras(options);

  const texts: Record<DisplayOption, OptionText> = {
    details: {
      label: intl.formatMessage({
        description: "MyDayDisplayMenu - option showing due dates and reminders",
        defaultMessage: "Dates & reminders",
        id: "i+ZLfn",
      }),
      hint: intl.formatMessage({
        description: "MyDayDisplayMenu - hint for the dates and reminders option",
        defaultMessage: "Due date and reminder under each title",
        id: "2q3pNL",
      }),
    },
    notes: {
      label: intl.formatMessage({
        description: "MyDayDisplayMenu - option showing the note marker",
        defaultMessage: "Note marker",
        id: "0Qytn/",
      }),
      hint: intl.formatMessage({
        description: "MyDayDisplayMenu - hint for the note marker option",
        defaultMessage: "An icon on tasks that have a note",
        id: "ZSAaJn",
      }),
    },
    links: {
      label: intl.formatMessage({
        description: "MyDayDisplayMenu - option showing link buttons",
        defaultMessage: "Link buttons",
        id: "OM01mF",
      }),
      hint: isSheet
        ? intl.formatMessage({
            description: "MyDayDisplayMenu - hint for the link buttons option on phones",
            defaultMessage: "Open a task's link with one tap",
            id: "mNOaVj",
          })
        : intl.formatMessage({
            description: "MyDayDisplayMenu - hint for the link buttons option",
            defaultMessage: "Open a task's link in one click",
            id: "JM/VuF",
          }),
    },
    taskTags: {
      label: intl.formatMessage({
        description: "MyDayDisplayMenu - option showing every task's tags",
        defaultMessage: "Tags on tasks",
        id: "+jd8Yf",
      }),
      hint: isSheet
        ? intl.formatMessage({
            description: "MyDayDisplayMenu - hint for the tags on tasks option on phones",
            defaultMessage: "Each task's tags below its title",
            id: "yKGkJS",
          })
        : intl.formatMessage({
            description: "MyDayDisplayMenu - hint for the tags on tasks option",
            defaultMessage: "Always show tags (hover shows them anyway)",
            id: "PlTIAb",
          }),
    },
    tagFilter: isSheet
      ? {
          label: intl.formatMessage({
            description: "MyDayDisplayMenu - option showing tag chips on phones",
            defaultMessage: "Tag filter bar",
            id: "NxFZpw",
          }),
          hint: intl.formatMessage({
            description: "MyDayDisplayMenu - hint for the tag filter bar option on phones",
            defaultMessage: "Tag chips at the top to filter My Day",
            id: "ot2Ksi",
          }),
        }
      : {
          label: intl.formatMessage({
            description: "MyDayDisplayMenu - option showing the tag list in the sidebar",
            defaultMessage: "Tag filter",
            id: "J02jQe",
          }),
          hint: intl.formatMessage({
            description: "MyDayDisplayMenu - hint for the tag filter option",
            defaultMessage: "Tag list in the sidebar to filter My Day",
            id: "SPNesW",
          }),
        },
    completed: {
      label: intl.formatMessage({
        description: "MyDayDisplayMenu - option expanding the completed list",
        defaultMessage: "Completed tasks",
        id: "7mjXSC",
      }),
      hint: intl.formatMessage({
        description: "MyDayDisplayMenu - hint for the completed tasks option",
        defaultMessage: "Keep the completed list expanded",
        id: "Jy5abr",
      }),
    },
    agentJson: {
      label: intl.formatMessage({
        description: "MyDayDisplayMenu - option showing the agent JSON",
        defaultMessage: "Agent JSON",
        id: "15p5tc",
      }),
      hint: intl.formatMessage({
        description: "MyDayDisplayMenu - hint for the agent JSON option",
        defaultMessage: "Show today as views/today.json",
        id: "mDmG9M",
      }),
    },
  };
  const keys: DisplayOption[] = ["details", "notes", "links", "taskTags", "tagFilter", "completed"];
  if (!isSheet) {
    keys.push("agentJson");
  }

  const heading = intl.formatMessage({
    description: "MyDayDisplayMenu - heading of the display options",
    defaultMessage: "Show on My Day",
    id: "SSk4hg",
  });
  const title = intl.formatMessage({
    description: "MyDayDisplayMenu - accessible name of the display options dialog",
    defaultMessage: "Display options",
    id: "hT/FOJ",
  });

  const body = (
    <div className="flex flex-col gap-0.5">
      <div className={clsx("flex items-center gap-2", isSheet ? "px-3 pt-2 pb-1.5" : "px-2.5 pt-1.5 pb-1")}>
        <span className={clsx("text-muted flex-1 font-semibold", isSheet ? "text-[13px]" : "text-xs")}>{heading}</span>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => onChange(MINIMAL_DISPLAY_OPTIONS)}
          className="h-7 min-w-0 px-1.5 text-xs font-normal text-(--tag)"
          data-testid="my-day__display-minimal"
        >
          {intl.formatMessage({
            description: "MyDayDisplayMenu - button resetting to the minimal view",
            defaultMessage: "Minimal",
            id: "8ECMBv",
          })}
        </Button>
      </div>
      {keys.map((key) => (
        <Switch
          key={key}
          isSelected={options[key]}
          onChange={(isSelected) => onChange({ ...options, [key]: isSelected })}
          className={clsx(
            "hover:bg-surface-secondary rounded-lg px-2.5 py-1.5",
            isSheet ? "min-h-14 rounded-xl px-3" : "min-h-[50px]"
          )}
          data-testid={`my-day__display-${key}`}
        >
          <Switch.Content className="flex w-full flex-row-reverse items-center justify-between gap-3">
            <Switch.Control className="shrink-0 [--switch-control-bg-checked-hover:var(--ctx)] [--switch-control-bg-checked:var(--ctx)]">
              <Switch.Thumb />
            </Switch.Control>
            <span className="flex min-w-0 flex-col gap-0.5">
              <Label className={clsx("font-normal", isSheet ? "text-base" : "text-sm")}>{texts[key].label}</Label>
              <Description className="text-xs">{texts[key].hint}</Description>
            </span>
          </Switch.Content>
        </Switch>
      ))}
    </div>
  );

  // A dot on the button while anything beyond the minimal view is on.
  const dot = hasExtras && (
    <span aria-hidden className={clsx("size-[7px] rounded-full bg-(--ctx)", isSheet && "absolute top-2 right-2")} />
  );

  if (isSheet) {
    return (
      <Drawer>
        <Button
          isIconOnly
          variant="secondary"
          className={clsx("text-foreground relative size-11 rounded-full", className)}
          aria-label={title}
          data-testid="my-day__display"
        >
          <AdjustmentsHorizontalIcon className="size-5" />
          {dot}
        </Button>
        <Drawer.Backdrop>
          <Drawer.Content placement="bottom" className={`ctx-${contextColor}`}>
            <Drawer.Dialog aria-label={title} className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Drawer.Handle />
              <Drawer.Body className="px-2">{body}</Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }

  return (
    <Popover>
      <Button variant="ghost" className={className} data-testid="my-day__display">
        <AdjustmentsHorizontalIcon className="size-4" aria-hidden />
        {intl.formatMessage({
          description: "MyDayDisplayMenu - button opening the display options",
          defaultMessage: "Display",
          id: "k+Dl/O",
        })}
        {dot}
      </Button>
      <Popover.Content placement="bottom end" className={clsx(`ctx-${contextColor}`, "w-80")}>
        <Popover.Dialog aria-label={title} className="p-1.5">
          {body}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
