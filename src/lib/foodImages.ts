// Food photography for the public site (Unsplash CDN, lazy-loaded).
// Matches a dish by keywords; falls back to a thali/curry spread.

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=60`;

export const FOOD_FALLBACK = img('photo-1585937421612-70a008356fbe');

export function foodImageFor(name: string, category: string): string {
  const t = `${name} ${category}`.toLowerCase();
  if (/puff|pastry|croissant|patty/.test(t)) return img('photo-1555507036-ab1f4038808a');
  if (/momo|dumpling|puri|choila/.test(t)) return img('photo-1496116218417-1a781b1c416c');
  if (/chowmein|noodle|thukpa|ramen/.test(t)) return img('photo-1585032226651-759b368d7246');
  if (/sekuwa|grill|tandoor|roast|skewer|bbq|kebab|pork|chilli|chicken/.test(t))
    return img('photo-1555939594-58d7cb561ad1');
  if (/thali|dal|rice|biryani|curry|aloo|sadeko|chatpate|bhatmas/.test(t))
    return img('photo-1585937421612-70a008356fbe');
  if (/chiya|tea|coffee|lassi|coke|drink|cold/.test(t)) return img('photo-1544787219-7f47ccb76574');
  if (/dhau|mohan|rasbari|sikarni|dessert|cake|sweet|chocolate/.test(t))
    return img('photo-1551024506-0bccd828d307');
  if (/burger|sandwich|pizza|pasta/.test(t)) return img('photo-1568901346375-23c9450c58cd');
  return FOOD_FALLBACK;
}

export function shortBlurbFor(description: string | null, category: string): string {  if (description && description.trim().length > 0) return description;
  switch (category.toLowerCase()) {
    case 'mains':
      return 'Cooked to order in our own kitchen.';
    case 'starters':
      return 'Made for sharing at the table.';
    case 'drinks':
    case 'chiya':
      return 'Brewed fresh, served steaming.';
    case 'puffs':
      return 'Baked golden, filled generously.';
    case 'desserts':
      return 'A sweet end to the meal.';
    default:
      return 'From our kitchen, served hot.';
  }
}

// Ambience shots for the place gallery (café interiors / tea moments).
export const PLACE_IMAGES = [
  {
    src: img('photo-1554118811-1e0d58224f24'),
    title: 'The tea counter',
    text: 'Chiya brewing all day — masala, adrak-elaichi and butter tea, poured to order.',
  },
  {
    src: img('photo-1509440159596-0249088772ff'),
    title: 'Fresh puffs, twice daily',
    text: 'Veg, chicken, buff and paneer puffs baked golden in small morning and evening batches.',
  },
  {
    src: img('photo-1445116572660-236099ec97a0'),
    title: 'Evening tables',
    text: 'Warm lights, quick QR ordering and room for long conversations over a second chiya.',
  },
];
