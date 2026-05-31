const CATEGORY_INTENTS = [
  { category: 'biryanis', title: 'Biryanis', keywords: ['biryani', 'biryanis'] },
  { category: 'breakfast', title: 'Breakfast', keywords: ['breakfast', 'dosa', 'idli', 'upma', 'pongal'] },
  { category: 'starters', title: 'Starters', keywords: ['starter', 'starters', 'snack', 'appetizer'] },
  { category: 'maincourse', title: 'Main Course', keywords: ['main course', 'maincourse', 'curry', 'curries'] },
  { category: 'desserts', title: 'Desserts', keywords: ['dessert', 'desserts', 'sweet', 'sweets'] },
  { category: 'beverages', title: 'Beverages', keywords: ['beverage', 'beverages', 'drink', 'drinks', 'coffee', 'chai'] },
  { category: 'chefspecials', title: 'Chef Specials', keywords: ['chef special', 'signature', 'specials'] }
];

function normalizeQuery(query) {
  return (query || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isCatalogQuery(lower) {
  return (
    /\b(all|list|show|available|options|menu|everything|every)\b/.test(lower) ||
    /\bwhat are\b/.test(lower) ||
    /\bwhich\b/.test(lower) ||
    /\bhow many\b/.test(lower) ||
    /\bdo you have\b/.test(lower) ||
    /\bwhat.*(available|have|offer|serve)\b/.test(lower)
  );
}

export function parseMenuListIntent(query) {
  const lower = normalizeQuery(query);
  if (!isCatalogQuery(lower)) return null;

  for (const intent of CATEGORY_INTENTS) {
    if (intent.keywords.some((keyword) => lower.includes(keyword))) {
      return { category: intent.category, title: intent.title };
    }
  }

  return null;
}

export function getMenuListItems(intent, menuData, profile = {}) {
  if (!intent?.category) return [];

  let items = menuData.filter(
    (dish) => dish.category === intent.category && dish.available !== false
  );

  if (profile.diet_type === 'vegetarian' || profile.diet_type === 'vegan') {
    items = items.filter((dish) => dish.isVeg);
  }

  return items.sort((a, b) => a.price - b.price);
}

export function buildMenuListResponse(query, menuData, profile = {}) {
  const intent = parseMenuListIntent(query);
  if (!intent) return null;

  const items = getMenuListItems(intent, menuData, profile);
  if (items.length === 0) {
    return {
      text: `I could not find any **${intent.title.toLowerCase()}** matching your current dietary preferences. Try adjusting filters or ask for another category.`,
      menuTable: null
    };
  }

  const dietNote =
    profile.diet_type === 'vegetarian' || profile.diet_type === 'vegan'
      ? ` (filtered for your ${profile.diet_type} preference)`
      : '';

  return {
    text: `Here are all our **${intent.title}** available at Patel's Kitchen${dietNote}. Use **Add** on any row to place it on your plate.`,
    menuTable: { title: intent.title, items }
  };
}
