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

function mentionsAny(text, terms) {
  return terms.some((term) => text.includes(term));
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

const ALLERGEN_KEYWORDS = {
  dairy: ['butter', 'ghee', 'paneer', 'milk', 'cream', 'malai', 'lassi', 'curd', 'yogurt', 'kheer', 'cheese'],
  nuts: ['apricot', 'cashew', 'pistachio', 'almond', 'badam', 'walnut', 'peanut'],
  seafood: ['prawn', 'shrimp', 'fish', 'crab'],
  eggs: ['egg', 'omelette'],
  gluten: ['naan', 'roti', 'bread', 'wheat', 'paratha', 'double ka meetha']
};

const VEGAN_BLOCK = /\b(paneer|butter|ghee|milk|cream|malai|curd|lassi|cheese|kheer)\b/;

function dishText(dish) {
  return `${dish.name || ''} ${dish.description || ''}`.toLowerCase();
}

function dishHasAllergen(dish, allergy) {
  const terms = ALLERGEN_KEYWORDS[allergy];
  if (!terms) return false;
  const text = dishText(dish);
  return terms.some((term) => text.includes(term));
}

function violatesAllergies(dish, allergies = []) {
  return allergies.some((allergy) => dishHasAllergen(dish, allergy));
}

// Hard constraints: diet type, vegan strictness, and allergies (never just a score penalty).
function applyProfileFilters(items, profile = {}) {
  let result = items;

  if (profile.diet_type === 'vegetarian' || profile.diet_type === 'vegan') {
    result = result.filter((dish) => dish.isVeg);
  }
  if (profile.diet_type === 'vegan') {
    result = result.filter((dish) => !VEGAN_BLOCK.test(dishText(dish)));
  }
  if (profile.allergies?.length) {
    result = result.filter((dish) => !violatesAllergies(dish, profile.allergies));
  }

  return result;
}

const WORD_NUMBERS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10
};

const RESULT_HARD_CAP = 12;

// Figures out how many items the guest wants ("just one", "top 3", "a lot", "everything").
export function parseResultLimit(lower, defaultLimit = 6) {
  if (/\b(all|everything|every|entire menu|full (?:list|menu)|whole menu)\b/.test(lower)) {
    return Infinity;
  }

  const topMatch = lower.match(
    /\b(?:top|best|first)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\b/
  );
  if (topMatch) {
    const raw = parseInt(topMatch[1], 10);
    const n = Number.isNaN(raw) ? WORD_NUMBERS[topMatch[1]] || defaultLimit : raw;
    return Math.min(Math.max(n, 1), RESULT_HARD_CAP);
  }

  if (/\b(just|only)\s+(one|1|a single)\b/.test(lower) || /\b(one dish|single dish|one option|a dish)\b/.test(lower)) {
    return 1;
  }
  if (/\b(couple|few|some|handful)\b/.test(lower)) return 3;
  if (/\b(lot|lots|many|tons|loads|plenty|bunch)\b/.test(lower)) return RESULT_HARD_CAP;

  return defaultLimit;
}

function limitItems(items, limit) {
  return Number.isFinite(limit) ? items.slice(0, limit) : items;
}

function parseGroupSize(lower, profile) {
  const match =
    lower.match(/(?:for|feed|serve)\s*(\d{1,2})\s*(?:people|person|guests|pax)?/) ||
    lower.match(/(\d{1,2})\s*(?:people|person|guests|pax)/);
  if (match) {
    const size = parseInt(match[1], 10);
    if (size >= 1 && size <= 20) return size;
  }
  return profile.group_size || 1;
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

  return applyProfileFilters(items, profile).sort((a, b) => a.price - b.price);
}

export function buildMenuListResponse(query, menuData, profile = {}) {
  const intent = parseMenuListIntent(query);
  if (!intent) return null;

  const lower = normalizeQuery(query);
  const allItems = getMenuListItems(intent, menuData, profile);

  if (allItems.length === 0) {
    return buildEmptyResultResponse(intent.title, menuData, intent.category, profile);
  }

  // Lists default to "show everything"; only trim when the guest asks for a count.
  const limit = parseResultLimit(lower, Infinity);
  const items = limitItems(allItems, limit);

  const constraintNote = describeActiveConstraints(profile);
  const moreNote =
    items.length < allItems.length
      ? ` (showing ${items.length} of ${allItems.length})`
      : '';

  return {
    text: `Here are our **${intent.title}** available at Patel's Kitchen${constraintNote}${moreNote}. Use **Add** on any row to place it on your plate.`,
    menuTable: { title: intent.title, items }
  };
}

function describeActiveConstraints(profile = {}) {
  const notes = [];
  if (profile.diet_type === 'vegetarian' || profile.diet_type === 'vegan') {
    notes.push(`${profile.diet_type}`);
  }
  if (profile.allergies?.length) {
    notes.push(`no ${profile.allergies.join('/')}`);
  }
  return notes.length ? ` (filtered for ${notes.join(', ')})` : '';
}

// Graceful "nothing matched" path: relax the strictest constraint and show the closest options.
function buildEmptyResultResponse(title, menuData, category, profile = {}) {
  const relaxed = menuData
    .filter((dish) => dish.category === category && dish.available !== false)
    .filter((dish) => !(profile.allergies?.length) || !violatesAllergies(dish, profile.allergies))
    .sort((a, b) => a.price - b.price)
    .slice(0, 4);

  if (relaxed.length > 0) {
    return {
      text: `I could not find **${title.toLowerCase()}** that match every preference, but these come closest while still respecting your allergies. Adjust your filters if you'd like more options.`,
      menuTable: { title: `Closest ${title}`, items: relaxed }
    };
  }

  return {
    text: `I could not find any **${title.toLowerCase()}** for your current preferences. Try another category or relax a filter, and I'll find something delightful.`,
    menuTable: null
  };
}

function isBiryaniPairingQuery(lower) {
  const hasBiryaniContext =
    mentionsAny(lower, ['biryani', 'biryanis']) ||
    mentionsAny(lower, ['with biryani', 'for biryani', 'biryani feast']);

  return (
    hasBiryaniContext &&
    mentionsAny(lower, [
      'pair', 'pairing', 'side', 'sides', 'raita', 'salna', 'accompaniment',
      'go with', 'along with', 'complete', 'combo'
    ])
  ) || /\bsides?\s*(and|with)?\s*raita\b/.test(lower);
}

function isMildBiryaniQuery(lower) {
  return (
    mentionsAny(lower, ['biryani', 'biryanis']) &&
    mentionsAny(lower, [
      'mild', 'less heat', 'less spice', 'low spice', 'not spicy',
      'alternative', 'alternatives', 'gentle', 'lighter'
    ])
  );
}

function isMildMealQuery(lower) {
  return (
    mentionsAny(lower, ['mild', 'less spice', 'low spice', 'no spice', 'gentle']) &&
    !isMildBiryaniQuery(lower)
  );
}

function getBiryaniPairings(menuData, profile) {
  const biryaniIdSet = new Set(
    menuData.filter((d) => d.category === 'biryanis').map((d) => d.id)
  );

  const seen = new Set();
  const items = [];

  const add = (dish) => {
    if (!dish || dish.available === false || seen.has(dish.id)) return;
    seen.add(dish.id);
    items.push(dish);
  };

  menuData.forEach((dish) => {
    if (dish.pairWith && biryaniIdSet.has(dish.pairWith)) add(dish);
    if (dish.pairingText?.toLowerCase().includes('biryani')) add(dish);
  });

  ['chicken-65', 'paneer-tikka', 'mango-lassi', 'gulab-jamun', 'qubani-ka-meetha', 'filter-coffee'].forEach((id) => {
    add(menuData.find((d) => d.id === id));
  });

  return applyProfileFilters(items, profile).sort((a, b) => a.price - b.price);
}

function getMildBiryanis(menuData, profile) {
  const items = menuData.filter(
    (d) => d.category === 'biryanis' && d.available !== false && (d.spiceLevel ?? 0) <= 2
  );

  return applyProfileFilters(items, profile).sort(
    (a, b) => (a.spiceLevel ?? 0) - (b.spiceLevel ?? 0) || a.price - b.price
  );
}

function getMildDishes(menuData, profile, groupSize = 1) {
  const maxSpice = 2;

  let items = menuData.filter(
    (d) =>
      d.available !== false &&
      (d.spiceLevel ?? 0) <= maxSpice &&
      !['beverages', 'breads'].includes(d.category)
  );

  items = applyProfileFilters(items, profile);

  if (groupSize >= 2) {
    items = items.filter((d) => d.category !== 'breakfast' || (d.spiceLevel ?? 0) <= 1);
  }

  const categoryRank = { biryanis: 0, maincourse: 1, starters: 2, chefspecials: 3, breakfast: 4, desserts: 5 };

  return items
    .sort(
      (a, b) =>
        (categoryRank[a.category] ?? 9) - (categoryRank[b.category] ?? 9) ||
        (a.spiceLevel ?? 0) - (b.spiceLevel ?? 0) ||
        a.price - b.price
    )
    .slice(0, 8);
}

function getBiryaniRecommendations(menuData, profile) {
  let items = menuData.filter((d) => d.category === 'biryanis' && d.available !== false);
  items = applyProfileFilters(items, profile);

  if (profile.spice_preference === 'mild') {
    items.sort(
      (a, b) => (a.spiceLevel ?? 0) - (b.spiceLevel ?? 0) || b.rating - a.rating
    );
  } else {
    items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.price - a.price);
  }

  return items;
}

export function scoreItemsForQuery(query, menuData, profile = {}) {
  const lower = normalizeQuery(query);

  return menuData
    .filter((d) => d.available !== false)
    .map((item) => {
      let score = 40;

      if (mentionsAny(lower, ['biryani', 'biryanis']) && item.category === 'biryanis') score += 45;
      if (mentionsAny(lower, ['breakfast', 'dosa', 'idli']) && item.category === 'breakfast') score += 45;
      if (mentionsAny(lower, ['starter', 'snack', 'tikka', '65']) && item.category === 'starters') score += 40;
      if (mentionsAny(lower, ['dessert', 'sweet']) && item.category === 'desserts') score += 40;
      if (mentionsAny(lower, ['protein', 'gym', 'workout']) &&
        (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('paneer'))) {
        score += 35;
      }

      if (mentionsAny(lower, ['mild', 'less spice', 'low spice', 'less heat'])) {
        if ((item.spiceLevel ?? 0) <= 2) score += 30;
        if ((item.spiceLevel ?? 0) >= 3) score -= 40;
      }

      if (mentionsAny(lower, ['spicy', 'hot']) && !mentionsAny(lower, ['mild', 'less'])) {
        if ((item.spiceLevel ?? 0) >= 2) score += 25;
      }

      if (profile.diet_type === 'vegetarian' && !item.isVeg) score = 0;
      if (profile.diet_type === 'vegan' && !item.isVeg) score = 0;

      if (profile.spice_preference === 'mild') {
        if ((item.spiceLevel ?? 0) >= 3) score -= 15;
        if ((item.spiceLevel ?? 0) <= 1) score += 10;
      }

      if (item.price > (profile.budget_range || 1000)) score -= 20;

      if (item.isSignature) score += 5;

      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function buildSmartResponse(query, menuData, profile = {}) {
  const listResponse = buildMenuListResponse(query, menuData, profile);
  if (listResponse) return listResponse;

  const lower = normalizeQuery(query);
  const groupSize = parseGroupSize(lower, profile);
  const limit = parseResultLimit(lower, 6);

  if (isBiryaniPairingQuery(lower)) {
    const items = limitItems(getBiryaniPairings(menuData, profile), limit);
    if (items.length > 0) {
      return {
        text: 'These **starters, beverages, and desserts** pair beautifully with our biryanis — add sides to round out your royal feast.',
        menuTable: { title: 'Biryani Pairings', items }
      };
    }
  }

  if (isMildBiryaniQuery(lower)) {
    const items = limitItems(getMildBiryanis(menuData, profile), limit);
    if (items.length > 0) {
      return {
        text: 'Here are our **milder biryanis** with gentle spice — flavourful Hyderabadi dum cooking without overwhelming heat.',
        menuTable: { title: 'Mild Biryanis', items }
      };
    }
  }

  if (isMildMealQuery(lower)) {
    const items = limitItems(getMildDishes(menuData, profile, groupSize), limit);
    if (items.length > 0) {
      return {
        text: `These **mild-spice dishes** are well suited for **${groupSize} ${groupSize === 1 ? 'guest' : 'guests'}** — balanced, comforting, and easy on the heat.`,
        menuTable: { title: `Mild Picks for ${groupSize}`, items }
      };
    }
  }

  if (mentionsAny(lower, ['biryani', 'biryanis']) && !isCatalogQuery(lower)) {
    const items = limitItems(getBiryaniRecommendations(menuData, profile), limit);
    if (items.length > 0) {
      const headline =
        limit === 1
          ? 'Based on your preferences, here is my **top biryani pick** from our royal menu.'
          : 'Based on your preferences, here are **biryani recommendations** from our royal menu.';
      return { text: headline, menuTable: { title: 'Recommended Biryanis', items } };
    }
  }

  return null;
}

export function buildFallbackResponse(query, menuData, profile = {}) {
  const smart = buildSmartResponse(query, menuData, profile);
  if (smart) return smart;

  const lower = normalizeQuery(query);
  const scored = scoreItemsForQuery(query, menuData, profile);
  const top = scored[0];

  if (lower.includes('protein') || lower.includes('workout') || lower.includes('gym')) {
    const item = menuData.find((d) => d.id === 'paneer-tikka') || top?.item;
    return {
      text: 'Pranam! For high-protein targets, I suggest our **Paneer Tikka** or **Chicken 65**. Shall I add one to your plate?',
      suggestedItem: item
    };
  }

  if (lower.includes('diet') || lower.includes('healthy') || lower.includes('weight loss')) {
    const item = menuData.find((d) => d.id === 'idli-sambar') || top?.item;
    return {
      text: 'For lighter dining, our **Idli Sambar** is a wholesome, low-oil choice. Shall I add it to your plate?',
      suggestedItem: item
    };
  }

  if (lower.includes('sweet') || lower.includes('dessert')) {
    const items = applyProfileFilters(
      menuData.filter((d) => d.id === 'gulab-jamun' || d.id === 'filter-coffee'),
      profile
    );
    return {
      text: 'A royal feast deserves a sweet finish. I suggest **Gulab Jamun** with **Filter Coffee**.',
      suggestedItems: items
    };
  }

  // Confidence gate: only make a concrete pick when the match is genuinely strong.
  // The base score is 40, so a real category/keyword hit clears MIN_CONFIDENCE.
  if (top && top.score >= MIN_CONFIDENCE) {
    return {
      text: `Based on your request, I recommend **${top.item.name}** (₹${top.item.price}). Shall I add it to your plate?`,
      suggestedItem: top.item
    };
  }

  return buildClarifyResponse(profile);
}

const MIN_CONFIDENCE = 50;

// Used when intent is too weak to guess — ask one focused question instead of a random dish.
function buildClarifyResponse(profile = {}) {
  const hints = [];
  if (profile.diet_type === 'all' || !profile.diet_type) hints.push('**veg or non-veg**');
  if (!profile.spice_preference || profile.spice_preference === 'medium') hints.push('**mild or spicy**');
  hints.push('a category like **biryani, breakfast, or dessert**');

  return {
    text: `I want to recommend the perfect dish — could you tell me a little more? For example, ${hints.join(', ')}.`,
    menuTable: null
  };
}

const FOOD_SIGNALS = [
  'menu', 'dish', 'dishes', 'food', 'eat', 'eating', 'meal', 'meals', 'order', 'plate', 'serve', 'hungry',
  'veg', 'vegetarian', 'vegan', 'non veg', 'nonveg', 'spicy', 'spice', 'mild', 'price', 'cost', 'cheap',
  'budget', 'rupees', 'rs', 'biryani', 'dosa', 'idli', 'upma', 'pongal', 'breakfast', 'starter', 'snack',
  'curry', 'dessert', 'sweet', 'beverage', 'drink', 'coffee', 'chai', 'lassi', 'tikka', 'paneer', 'chicken',
  'mutton', 'prawn', 'fish', 'egg', 'thali', 'combo', 'pair', 'pairing', 'recommend', 'suggest', 'special',
  'signature', 'rice', 'gravy', 'feast', 'dinner', 'lunch', 'protein', 'healthy', 'diet', 'allergy', 'allergic',
  'calorie', 'calories', 'tasty', 'yummy', 'delicious', 'naan', 'roti', 'kurma', 'dal'
];

const OFF_TOPIC_SIGNALS = [
  'weather', 'news', 'politics', 'election', 'stock', 'bitcoin', 'crypto', 'football', 'cricket',
  'movie', 'song', 'lyrics', 'joke', 'riddle', 'poem', 'write code', 'python', 'javascript', 'homework',
  'capital of', 'who is', 'president', 'what time', 'time is it', 'date today', 'your name', 'are you human',
  'are you a robot', 'are you ai', 'chatgpt', 'meaning of life', 'love you', 'marry me', 'sing', 'translate',
  'how old are you', 'where do you live', 'phone number'
];

const GREETING_RE = /^(hi|hii+|hello|hey+|namaste|pranam|hola|yo|sup|good\s(morning|evening|afternoon|night)|thanks|thank you|ty|ok|okay|cool|nice|great)\b[\s!.]*$/;

function looksLikeGibberish(lower) {
  const compact = lower.replace(/\s+/g, '');
  if (compact.length <= 2) return true;
  if (compact.length >= 4 && !/[aeiou]/.test(compact)) return true;
  if (!lower.includes(' ') && compact.length >= 8) {
    const vowels = (compact.match(/[aeiou]/g) || []).length;
    if (vowels / compact.length < 0.2) return true;
  }
  return false;
}

/**
 * Classifies an incoming message so the UI can route it before spending an LLM call.
 * Returns one of: 'menu' | 'greeting' | 'off_topic' | 'nonsense' | 'unclear'.
 */
export function classifyQuery(query, menuData = []) {
  const lower = normalizeQuery(query);
  if (!lower) return 'nonsense';

  const hasFoodSignal =
    mentionsAny(lower, FOOD_SIGNALS) ||
    isCatalogQuery(lower) ||
    CATEGORY_INTENTS.some((intent) => intent.keywords.some((keyword) => lower.includes(keyword))) ||
    menuData.some((dish) => dish.name && lower.includes(dish.name.toLowerCase()));

  if (hasFoodSignal) return 'menu';
  if (GREETING_RE.test(lower)) return 'greeting';
  if (mentionsAny(lower, OFF_TOPIC_SIGNALS)) return 'off_topic';
  if (looksLikeGibberish(lower)) return 'nonsense';

  return 'unclear';
}

const REDIRECT_TEXTS = {
  off_topic:
    "Pranam! I'm Chef AI — I can only help with our menu, dishes, pairings, dietary needs, and orders here at Patel's Kitchen. What would you like to eat today?",
  nonsense:
    "Forgive me, I didn't quite catch that. I can help you explore biryanis, breakfast, starters, desserts and more. What are you in the mood for?",
  greeting:
    "Pranam and a warm welcome to Patel's Kitchen! I'm Chef AI, your personal food butler. Would you like biryani recommendations, a veg feast, or our chef signatures?",
  unclear:
    "I'd love to help you pick the perfect dish! Are you after something **veg or non-veg**, **mild or spicy**, or a specific category like biryani or breakfast?"
};

/** Canned, on-brand reply for non-menu messages so we never answer off-topic via the LLM. */
export function buildRedirectResponse(type) {
  return {
    text: REDIRECT_TEXTS[type] || REDIRECT_TEXTS.unclear,
    menuTable: null,
    isRedirect: true
  };
}
