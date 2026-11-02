import type { ReactElement } from "react";
import { Drawer } from "@heroui/react";
import { useBreakpoint } from "@package/react";
import { useIntl } from "react-intl";
import { ShoppingItemEditor } from "./ShoppingItemEditor";
import type { ShoppingEditorItem, ShoppingItemEditorState, ShoppingListActions } from "./ShoppingTypes";
import { useMyDayPaneWidth } from "~/views/my-day/UseMyDayPaneWidth";

export interface ShoppingItemEditorPanelProps {
  editor: ShoppingItemEditorState;
  actions: ShoppingListActions;
}

/** A pane beside the list on wide screens, the same width as My Day's; a bottom sheet on phones and tablets. */
export function ShoppingItemEditorPanel({ editor, actions }: ShoppingItemEditorPanelProps): ReactElement | null {
  const intl = useIntl();
  const isWide = useBreakpoint("xl");
  const pane = useMyDayPaneWidth();
  const heading = intl.formatMessage({
    description: "ShoppingItemEditorPanel - heading of the item editor",
    defaultMessage: "Edit item",
    id: "FHvm+H",
  });

  function form(item: ShoppingEditorItem, hideHeading: boolean): ReactElement {
    return (
      <ShoppingItemEditor
        // Remounts per item so unsaved drafts never carry over to another item.
        key={item.id}
        item={item}
        color={editor.color}
        showCategory={editor.showCategory}
        onChange={editor.onChange}
        onToggleBought={() => actions.onToggleBought(item.id, !item.bought)}
        onToggleImportant={() => actions.onToggleImportant(item.id)}
        onToggleMyDay={() => actions.onToggleItemMyDay(item.id)}
        onRemove={() => actions.onRemoveItem(item.id)}
        onClose={editor.onClose}
        hideHeading={hideHeading}
      />
    );
  }

  if (isWide) {
    if (!editor.item) {
      return null;
    }
    return (
      <aside
        aria-label={heading}
        className="bg-surface hero:bg-(--hero-panel) border-separator sticky top-0 flex h-dvh max-w-[60vw] shrink-0 flex-col border-l"
        style={{ width: pane.width }}
      >
        {pane.handle}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-10 pb-4">{form(editor.item, false)}</div>
      </aside>
    );
  }

  return (
    <Drawer isOpen={!!editor.item} onOpenChange={(open) => !open && editor.onClose()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="bottom">
          <Drawer.Dialog className="max-h-[90dvh]">
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>{heading}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="overflow-y-auto pb-6">{editor.item && form(editor.item, true)}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
