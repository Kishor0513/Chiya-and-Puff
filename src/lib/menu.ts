// Shared menu helpers: canonical order, ingredient notes.
// Breakfast-first flow matching the Chiya & Puff concept — desserts last.

export const CATEGORY_ORDER = ['Puffs', 'Drinks', 'Starters', 'Mains', 'Desserts'];

export function categoryRank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

export function sortMenuItems<T extends { category: string; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const r = categoryRank(a.category) - categoryRank(b.category);
    if (r !== 0) return r;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

export function orderedCategories<T extends { category: string }>(items: T[]): string[] {
  const seen = Array.from(new Set(items.map((m) => m.category)));
  return seen.sort((a, b) => {
    const r = categoryRank(a) - categoryRank(b);
    return r !== 0 ? r : a.localeCompare(b);
  });
}

// Short ingredient notes keyed by dish keywords (no schema change needed).
const INGREDIENT_NOTES: Array<[RegExp, string]> = [
  [/puff|pastry|croissant/i, 'flaky pastry · spiced filling · baked golden'],
  [/momo|dumpling/i, 'cabbage · ginger-garlic · timur achar'],
  [/chowmein|noodle/i, 'wok-tossed · soy · seasonal veg'],
  [/thukpa/i, 'hand-pulled noodles · mountain herbs'],
  [/choila/i, 'mustard oil · garlic · timur'],
  [/sekuwa|tandoor|roast|skewer|kebab/i, 'char-grilled · house spice rub'],
  [/sadeko/i, 'mustard oil · lemon · green chilli'],
  [/chatpate|pani puri|bhatmas|peanut/i, 'tamarind · mint · roasted crunch'],
  [/thali/i, 'dal · rice · saag · achar'],
  [/biryani|fried rice/i, 'jeera rice · saffron · fried onion'],
  [/chiya|masala tea/i, 'milk · ginger · cardamom'],
  [/black tea|lemon tea/i, 'highland leaves · lemon'],
  [/coffee/i, 'espresso · steamed milk'],
  [/lassi/i, 'curd · banana · honey'],
  [/dhau|sikarni/i, 'curd · cardamom · nuts'],
  [/mohan|rasbari/i, 'milk · light syrup · cardamom'],
  [/burger|sandwich/i, 'brioche · house sauce · fries'],
  [/pizza/i, 'wood-fired · mozzarella · basil'],
  [/pasta/i, 'durum · garlic · parmesan'],
  [/chilli chicken|chilli/i, 'soy-chilli glaze · peppers'],
  [/curry/i, 'slow-cooked · garam masala'],
];

export function ingredientsFor(name: string): string | null {
  for (const [re, note] of INGREDIENT_NOTES) {
    if (re.test(name)) return note;
  }
  return null;
}
