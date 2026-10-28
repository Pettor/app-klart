import type { IntlShape } from "react-intl";
import type { ShoppingCategory } from "~/core/shopping/ShoppingCategory";

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
