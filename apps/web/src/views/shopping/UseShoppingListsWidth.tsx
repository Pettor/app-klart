import type { ReactElement } from "react";
import { useIntl } from "react-intl";
import { ResizeHandle } from "~/components/input/resize-handle/ResizeHandle";
import { useResizableWidth } from "~/components/input/resize-handle/UseResizableWidth";

/** The lists column's default width, which is also the narrowest it goes. */
const LISTS_WIDTH = 300;

export interface ShoppingListsWidth {
  width: number;
  handle: ReactElement;
}

/** Width of the lists column on wide screens: from its default up to 70% wider, remembered per device. */
export function useShoppingListsWidth(): ShoppingListsWidth {
  const intl = useIntl();
  const resize = useResizableWidth({
    storageKey: "klart-shopping-lists-width",
    defaultWidth: LISTS_WIDTH,
    minWidth: LISTS_WIDTH,
    maxWidth: Math.round(LISTS_WIDTH * 1.7),
  });

  return {
    width: resize.width,
    handle: (
      <ResizeHandle
        edge="right"
        width={resize.width}
        minWidth={resize.minWidth}
        maxWidth={resize.maxWidth}
        onResize={resize.onResize}
        onResizeEnd={resize.onResizeEnd}
        onReset={resize.onReset}
        ariaLabel={intl.formatMessage({
          description: "ShoppingView - aria-label of the handle that resizes the lists column",
          defaultMessage: "Resize lists",
          id: "goKcJm",
        })}
      />
    ),
  };
}
