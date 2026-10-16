// Food photography for the public site (Unsplash CDN, lazy-loaded).
// Each dish type has a small pool and picks deterministically by name hash,
// so neighbouring dishes rarely share the same photo.

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=60`;

export const FOOD_FALLBACK = img('photo-1585937421612-70a008356fbe');

function pick(pool: string[], key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return img(pool[h % pool.length]);
}

const MOMO = [
  'photo-1496116218417-1a781b1c416c',
  'photo-1534422298391-e4f8c172dddb',
  'photo-1497034825429-c343d7c6a68f',
];
const NOODLE = ['photo-1585032226651-759b368d7246', 'photo-1569718212165-3a8278d5f624'];
const SOUP = ['photo-1547592166-23ac45744acd', 'photo-1569718212165-3a8278d5f624'];
const GRILL = [
  'photo-1555939594-58d7cb561ad1',
  'photo-1603360946369-dc9bb6258143',
  'photo-1529193591184-b1d58069ecdd',
  'photo-1599487488170-d11ec9c172f0',
];
const BOWLS = [
  'photo-1585937421612-70a008356fbe',
  'photo-1512058564366-18510be2db19',
  'photo-1565557623262-b51c2513a641',
];
const THALI = ['photo-1567337710282-00832b415979', 'photo-1512058564366-18510be2db19'];
const CURRY = [
  'photo-1565557623262-b51c2513a641',
  'photo-1589302168068-964664d93dc0',
  'photo-1631452180519-c014fe946bc7',
];
const CHIYA = ['photo-1544787219-7f47ccb76574', 'photo-1571934811356-5cc061b6821f'];
const COFFEE = ['photo-1541167760496-1628856ab772'];
const COLD = ['photo-1577805947697-89e18249d767', 'photo-1554866585-cd948fdf7e90'];
const PUFF = [
  'photo-1555507036-ab1f4038808a',
  'photo-1509440159596-0249088772ff',
  'photo-1517433670267-08bbd4be890f',
];
const DESSERT = [
  'photo-1551024506-0bccd828d307',
  'photo-1488477181946-6428a0291777',
  'photo-1563805042-7684c019e1cb',
];
const BURGER = ['photo-1571091718767-18b5b1457add', 'photo-1568901346375-23c9450c58cd'];
const PIZZA = ['photo-1513104890138-7c749659a591', 'photo-1574071318508-1cdbab80d002'];

export function foodImageFor(name: string, category: string): string {
  const t = `${name} ${category}`.toLowerCase();
  if (/puff|pastry|croissant|patty|bun/.test(t)) return pick(PUFF, t);
  if (/jhol|thukpa|soup/.test(t)) return pick(SOUP, t);
  if (/momo|dumpling/.test(t)) return pick(MOMO, t);
  if (/chowmein|noodle|ramen|pasta/.test(t)) return pick(NOODLE, t);
  if (/sekuwa|tandoor|roast|skewer|bbq|kebab|choila|chilli|grill/.test(t)) return pick(GRILL, t);
  if (/thali/.test(t)) return pick(THALI, t);
  if (/biryani|fried rice|curry|dal/.test(t)) return pick(CURRY, t);
  if (/sadeko|chatpate|pani puri|bhatmas|peanut|samosa|pakoda|wings/.test(t)) return pick(BOWLS, t);
  if (/coffee|cold coffee/.test(t)) return pick(COFFEE, t);
  if (/lassi|shake|cold|coke|sprite|fanta|drink|juice/.test(t)) return pick(COLD, t);
  if (/chiya|tea/.test(t)) return pick(CHIYA, t);
  if (/dhau|mohan|rasbari|sikarni|dessert|cake|sweet|chocolate|ice/.test(t)) return pick(DESSERT, t);
  if (/burger/.test(t)) return pick(BURGER, t);
  if (/pizza/.test(t)) return pick(PIZZA, t);
  if (/sandwich/.test(t)) return img('photo-1528735602780-2552fd46c7af');
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
