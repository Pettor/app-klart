import type { ReactElement } from "react";
import { useIntl } from "react-intl";
import { ResizeHandle } from "~/components/input/resize-handle/ResizeHandle";
import { useResizableWidth } from "~/components/input/resize-handle/UseResizableWidth";

export interface MyDayPane {
  width: number;
  handle: ReactElement;
}

/** Shared width of the right pane, so suggestions and the task editor open at the same size. */
export function useMyDayPaneWidth(): MyDayPane {
  const intl = useIntl();
  const resize = useResizableWidth({ storageKey: "klart-right-pane-width", defaultWidth: 340, minWidth: 300 });

  return {
    width: resize.width,
    handle: (
      <ResizeHandle
        edge="left"
        width={resize.width}
        minWidth={resize.minWidth}
        maxWidth={resize.maxWidth}
        onResize={resize.onResize}
        onResizeEnd={resize.onResizeEnd}
        onReset={resize.onReset}
        ariaLabel={intl.formatMessage({
          description: "MyDayView - aria-label of the handle that resizes the right pane",
          defaultMessage: "Resize panel",
          id: "1CLgZv",
        })}
      />
    ),
  };
}
