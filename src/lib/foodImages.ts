// Food photography for the public site (Unsplash CDN, lazy-loaded).
// Matches a dish by keywords; falls back to a thali/curry spread.

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=60`;

export const FOOD_FALLBACK = img('photo-1585937421612-70a008356fbe');

export function foodImageFor(name: string, category: string): string {
  const t = `${name} ${category}`.toLowerCase();
  if (/momo|dumpling|puri|choila/.test(t)) return img('photo-1496116218417-1a781b1c416c');
  if (/chowmein|noodle|thukpa|ramen/.test(t)) return img('photo-1585032226651-759b368d7246');
  if (/sekuwa|grill|tandoor|roast|skewer|bbq|kebab|pork|chilli|chicken/.test(t))
    return img('photo-1555939594-58d7cb561ad1');
  if (/thali|dal|rice|biryani|curry|aloo|sadeko|chatpate|bhatmas/.test(t))
    return img('photo-1585937421612-70a008356fbe');
  if (/chiya|tea|coffee|lassi|coke|drink|cold/.test(t)) return img('photo-1544787219-7f47ccb76574');
  if (/dhau|mohan|rasbari|sikarni|dessert|cake|sweet/.test(t))
    return img('photo-1551024506-0bccd828d307');
  if (/burger|sandwich|pizza|pasta|momo/.test(t)) return img('photo-1568901346375-23c9450c58cd');
  return FOOD_FALLBACK;
}

export function shortBlurbFor(description: string | null, category: string): string {
  if (description && description.trim().length > 0) return description;
  switch (category.toLowerCase()) {
    case 'mains':
      return 'Cooked to order in our own kitchen.';
    case 'starters':
      return 'Made for sharing at the table.';
    case 'drinks':
      return 'Brewed and served fresh.';
    case 'desserts':
      return 'A sweet end to the meal.';
    default:
      return 'From our kitchen, served hot.';
  }
}
