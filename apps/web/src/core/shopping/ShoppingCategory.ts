/** Store sections a grocery list groups its items by, in walking order. */
export const SHOPPING_CATEGORIES = [
  "produce",
  "dairy",
  "bread",
  "meat",
  "pantry",
  "pets",
  "household",
  "other",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

/** Swedish and English word stems that place an item in a section. Checked in order; the first match wins. */
const CATEGORY_WORDS: [ShoppingCategory, RegExp][] = [
  [
    "produce",
    /banan|äpple|apple|tomat|tomato|gurk|cucumber|sallad|salad|lettuce|lök|onion|potatis|potato|avokado|avocado|citron|lemon|lime|paprika|pepper|morot|morötter|carrot|frukt|fruit|grönsak|vegetable|bär|berr/i,
  ],
  ["meat", /kyckling|chicken|färs|mince|lax|salmon|korv|sausage|bacon|fisk|fish|kött|meat|beef|biff/i],
  ["dairy", /mjölk|milk|ost|cheese|yoghurt|yogurt|fil\b|smör|butter|grädde|cream|ägg|egg/i],
  ["bread", /bröd|bread|limpa|knäcke|bulle|bun|tortilla|bagel|croissant/i],
  [
    "pantry",
    /kaffe|coffee|te\b|tea\b|pasta|ris\b|rice|mjöl|flour|socker|sugar|olja|oil|krossade|müsli|muesli|havre|oat|flingor|cereal|chips|läsk|soda/i,
  ],
  ["pets", /katt|cat\b|hund|dog\b|sand\b|litter/i],
  [
    "household",
    /disk|dish|tvätt|laundry|papper|paper|påse|bag|batteri|batter|tandkräm|toothpaste|tvål|soap|schampo|shampoo/i,
  ],
];

/** Guesses an item's store section from its name. */
export function guessCategory(name: string): ShoppingCategory {
  return CATEGORY_WORDS.find(([, pattern]) => pattern.test(name))?.[0] ?? "other";
}
