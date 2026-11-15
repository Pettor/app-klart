import type { IntlShape } from "react-intl";
import type { ShoppingCategory } from "~/core/shopping/ShoppingCategory";
import type { ShoppingItemSort, ShoppingListSort } from "~/core/shopping/ShoppingSort";

export function getShoppingCategoryLabel(intl: IntlShape, category: ShoppingCategory): string {
  switch (category) {
    case "produce":
      return intl.formatMessage({
        description: "Shopping - store section heading: fruit and vegetables",
        defaultMessage: "Fruit & veg",
        id: "UYMSzq",
      });
    case "dairy":
      return intl.formatMessage({
        description: "Shopping - store section heading: milk, cheese, eggs",
        defaultMessage: "Dairy",
        id: "bAIzZ/",
      });
    case "bread":
      return intl.formatMessage({
        description: "Shopping - store section heading: bread and bakery",
        defaultMessage: "Bread",
        id: "kS2ny3",
      });
    case "meat":
      return intl.formatMessage({
        description: "Shopping - store section heading: meat and fish",
        defaultMessage: "Meat & fish",
        id: "lYFvCq",
      });
    case "pantry":
      return intl.formatMessage({
        description: "Shopping - store section heading: dry goods, coffee, pasta",
        defaultMessage: "Pantry",
        id: "dvOpv8",
      });
    case "pets":
      return intl.formatMessage({
        description: "Shopping - store section heading: pet food and supplies",
        defaultMessage: "Pets",
        id: "24+vwr",
      });
    case "household":
      return intl.formatMessage({
        description: "Shopping - store section heading: cleaning and household supplies",
        defaultMessage: "Household",
        id: "iS2JJd",
      });
    case "other":
      return intl.formatMessage({
        description: "Shopping - store section heading: everything else",
        defaultMessage: "Other",
        id: "XZzm2N",
      });
  }
}

/** The title of the My Day task made from an item, e.g. `Buy: Milk × 2`. */
export function getItemTaskTitle(intl: IntlShape, name: string, qty: number | null): string {
  return qty !== null && qty > 1
    ? intl.formatMessage(
        {
          description: "Shopping - title of the My Day task made from a shopping item, with a quantity",
          defaultMessage: "Buy: {name} × {qty}",
          id: "aOvbUb",
        },
        { name, qty }
      )
    : intl.formatMessage(
        {
          description: "Shopping - title of the My Day task made from a shopping item",
          defaultMessage: "Buy: {name}",
          id: "kcexSO",
        },
        { name }
      );
}

export function getListSortLabel(intl: IntlShape, sort: ShoppingListSort): string {
  switch (sort) {
    case "newest":
      return intl.formatMessage({
        description: "Shopping - sort choice for the lists: newest first",
        defaultMessage: "Newest first",
        id: "ZLD+O3",
      });
    case "name":
      return intl.formatMessage({
        description: "Shopping - sort choice for the lists: alphabetical by name",
        defaultMessage: "A–Z",
        id: "iHz3d8",
      });
    case "context":
      return intl.formatMessage({
        description: "Shopping - sort choice for the lists: grouped by context",
        defaultMessage: "By context",
        id: "lBWhzR",
      });
    case "kind":
      return intl.formatMessage({
        description: "Shopping - sort choice for the lists: grouped by kind (groceries, gifts, home, other)",
        defaultMessage: "By kind",
        id: "BChPLy",
      });
  }
}

export function getItemSortLabel(intl: IntlShape, sort: ShoppingItemSort): string {
  switch (sort) {
    case "category":
      return intl.formatMessage({
        description: "Shopping - sort choice for a list's items: grouped by store section",
        defaultMessage: "By category",
        id: "oTVEPH",
      });
    case "name":
      return intl.formatMessage({
        description: "Shopping - sort choice for a list's items: alphabetical by name",
        defaultMessage: "A–Z",
        id: "2ZToy/",
      });
    case "added":
      return intl.formatMessage({
        description: "Shopping - sort choice for a list's items: in the order they were added",
        defaultMessage: "Order added",
        id: "r9iFOZ",
      });
  }
}
