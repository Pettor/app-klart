import type { ReactElement } from "react";
import { GiftIcon, HomeIcon, ListBulletIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import type { IntlShape } from "react-intl";
import type { ShoppingListKind } from "~/core/shopping/ShoppingList";

export interface ShoppingKindIconProps {
  kind: ShoppingListKind;
  className?: string;
}

/** A list kind's icon: a cart for groceries, a gift, a house, or lines for anything else. */
export function ShoppingKindIcon({ kind, className }: ShoppingKindIconProps): ReactElement {
  switch (kind) {
    case "grocery":
      return <ShoppingCartIcon className={className} aria-hidden />;
    case "gift":
      return <GiftIcon className={className} aria-hidden />;
    case "home":
      return <HomeIcon className={className} aria-hidden />;
    case "other":
      return <ListBulletIcon className={className} aria-hidden />;
  }
}

export function getShoppingKindLabel(intl: IntlShape, kind: ShoppingListKind): string {
  switch (kind) {
    case "grocery":
      return intl.formatMessage({
        description: "Shopping - list kind: food and everyday groceries",
        defaultMessage: "Groceries",
        id: "AZpBbC",
      });
    case "gift":
      return intl.formatMessage({
        description: "Shopping - list kind: presents and party supplies",
        defaultMessage: "Gifts",
        id: "I1jOao",
      });
    case "home":
      return intl.formatMessage({
        description: "Shopping - list kind: things for the house",
        defaultMessage: "Home",
        id: "qPig9+",
      });
    case "other":
      return intl.formatMessage({
        description: "Shopping - list kind: anything else",
        defaultMessage: "Other",
        id: "dnrFPw",
      });
  }
}

/** An amount in kronor, e.g. `1 299 kr`. */
export function formatKronor(intl: IntlShape, amount: number): string {
  return intl.formatMessage(
    {
      description: "Shopping - an amount of money in Swedish kronor",
      defaultMessage: "{amount} kr",
      id: "jXXSU+",
    },
    { amount: intl.formatNumber(amount, { maximumFractionDigits: 2 }) }
  );
}
