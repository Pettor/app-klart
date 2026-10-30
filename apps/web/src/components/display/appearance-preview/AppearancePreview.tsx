import type { CSSProperties, ReactElement } from "react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { useAppearancePreview } from "./UseAppearancePreview";
import { TaskRow } from "~/components/display/task-row/TaskRow";
import type { Density } from "~/core/theme/ThemeMode";

export interface AppearancePreviewProps {
  today: string;
  density: Density;
  tintByContext: boolean;
  className?: string;
}

/** Without the tint, the backdrop falls back to the plain background, as in My Day. */
const UNTINTED: CSSProperties = { "--ctx-backdrop": "var(--color-background)" } as CSSProperties;

/**
 * A miniature My Day built from real task rows, so the theme, density, tint and motion settings show here exactly as
 * they will in the app. The sample tasks can be checked off and starred to try the motion.
 */
export function AppearancePreview({ today, density, tintByContext, className }: AppearancePreviewProps): ReactElement {
  const intl = useIntl();
  const preview = useAppearancePreview(today);

  return (
    <figure className={clsx("flex flex-col gap-2", className)} data-testid="appearance-preview">
      <figcaption className="text-muted px-1 text-xs font-semibold tracking-wide uppercase">
        {intl.formatMessage({
          description: "AppearancePreview - caption above the preview",
          defaultMessage: "Preview",
          id: "qisLBL",
        })}
      </figcaption>
      <div
        data-density={density}
        style={tintByContext ? undefined : UNTINTED}
        className={clsx(
          "ctx-blue hero-glow flex flex-col gap-3 overflow-hidden rounded-[14px] bg-(--ctx-backdrop) bg-no-repeat p-4",
          "ring-separator ring-1 transition-[background-color] duration-300 ring-inset"
        )}
      >
        <span className="hero-title hero:text-[22px] self-start text-xl leading-tight font-bold tracking-tight">
          {intl.formatMessage({
            description: "AppearancePreview - heading of the miniature My Day",
            defaultMessage: "My Day",
            id: "bLJz7/",
          })}
        </span>
        <div className="compact:gap-2 compact:[--slab-gap:--spacing(2)] flex flex-col gap-3 [--slab-gap:--spacing(3)]">
          {preview.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              today={today}
              onToggleDone={preview.onToggleDone}
              onToggleImportant={preview.onToggleImportant}
            />
          ))}
        </div>
      </div>
      <p className="text-muted px-1 text-xs leading-relaxed">
        {intl.formatMessage({
          description: "AppearancePreview - hint under the preview",
          defaultMessage: "Check off or star a task to try the motion.",
          id: "jlNLzq",
        })}
      </p>
    </figure>
  );
}
