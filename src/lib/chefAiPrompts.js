const DEFAULT_PROFILE = {
  name: '',
  diet_type: 'all',
  spice_preference: 'medium',
  health_goals: [],
  allergies: [],
  budget_range: 1000,
  group_size: 1
};

const DEFAULT_CHIPS = [
  { label: 'Veg feast under ₹500', query: 'vegetarian meal under 500 rupees for 2 people', score: 4 },
  { label: 'Mild biryani for 2', query: 'mild biryani recommendation for 2 people', score: 4 },
  { label: 'High-protein breakfast', query: 'high protein South Indian breakfast options', score: 4 }
];

const CATEGORY_KEYWORDS = {
  biryani: ['biryani', 'dum'],
  breakfast: ['breakfast', 'dosa', 'idli', 'upma', 'pongal'],
  desserts: ['dessert', 'sweet', 'gulab', 'jamun', 'kheer'],
  starters: ['starter', 'tikka', '65', 'snack'],
  beverages: ['coffee', 'chai', 'lassi', 'drink', 'beverage'],
  biryanis: ['biryani'],
  maincourse: ['curry', 'main course', 'dal', 'kurma'],
  chefspecials: ['signature', 'chef special', 'special']
};

function normalizeText(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s₹]/g, ' ').replace(/\s+/g, ' ').trim();
}

function mentionsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function detectCategories(text) {
  const found = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (mentionsAny(text, keywords)) found.push(category);
  }
  return found;
}

export function parseProfileUpdates(text, profile = DEFAULT_PROFILE) {
  const lower = text.toLowerCase();
  const updated = {
    ...profile,
    health_goals: [...profile.health_goals],
    allergies: [...profile.allergies]
  };
  let changed = false;

  const markChanged = () => { changed = true; };

  if (mentionsAny(lower, ['vegetarian', 'pure veg', 'veg only', 'no meat'])) {
    updated.diet_type = 'vegetarian';
    markChanged();
  } else if (mentionsAny(lower, ['vegan', 'no dairy', 'plant based'])) {
    updated.diet_type = 'vegan';
    if (!updated.allergies.includes('dairy')) updated.allergies.push('dairy');
    markChanged();
  } else if (mentionsAny(lower, ['non veg', 'non-veg', 'chicken', 'mutton', 'meat', 'egg'])) {
    if (!mentionsAny(lower, ['no meat', 'without meat'])) {
      updated.diet_type = 'non_vegetarian';
      markChanged();
    }
  }

  if (mentionsAny(lower, ['extra spicy', 'extremely hot', 'very spicy'])) {
    updated.spice_preference = 'extra_spicy';
    markChanged();
  } else if (mentionsAny(lower, ['spicy', 'hot'])) {
    updated.spice_preference = 'spicy';
    markChanged();
  } else if (mentionsAny(lower, ['mild', 'no spice', 'less spicy', 'low spice'])) {
    updated.spice_preference = 'mild';
    markChanged();
  }

  if (mentionsAny(lower, ['workout', 'gym', 'protein', 'muscle', 'high protein'])) {
    ['high_protein', 'muscle_gain'].forEach((goal) => {
      if (!updated.health_goals.includes(goal)) updated.health_goals.push(goal);
    });
    markChanged();
  }
  if (mentionsAny(lower, ['weight loss', 'diet', 'healthy', 'low oil', 'light meal'])) {
    ['weight_loss', 'low_oil'].forEach((goal) => {
      if (!updated.health_goals.includes(goal)) updated.health_goals.push(goal);
    });
    markChanged();
  }

  if (mentionsAny(lower, ['allergic to nuts', 'nut allergy', 'no nuts'])) {
    if (!updated.allergies.includes('nuts')) updated.allergies.push('nuts');
    markChanged();
  }
  if (mentionsAny(lower, ['allergic to dairy', 'lactose', 'no dairy'])) {
    if (!updated.allergies.includes('dairy')) updated.allergies.push('dairy');
    markChanged();
  }
  if (mentionsAny(lower, ['gluten allergy', 'celiac', 'no gluten'])) {
    if (!updated.allergies.includes('gluten')) updated.allergies.push('gluten');
    markChanged();
  }

  const budgetMatch = lower.match(/(?:under|below|within|budget|max)\s*₹?\s*(\d{2,5})/)
    || lower.match(/(\d{2,5})\s*(?:rupees?|rs|₹)/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1], 10);
    if (budget >= 100 && budget <= 10000) {
      updated.budget_range = budget;
      markChanged();
    }
  }

  const groupMatch = lower.match(/(?:for|feed|serve)\s*(\d{1,2})\s*(?:people|person|guests|pax)?/)
    || lower.match(/(\d{1,2})\s*(?:people|person|guests|pax)/)
    || lower.match(/family\s*(?:of|for)?\s*(\d{1,2})/);
  if (groupMatch) {
    const size = parseInt(groupMatch[1], 10);
    if (size >= 1 && size <= 20) {
      updated.group_size = size;
      markChanged();
    }
  }
  if (mentionsAny(lower, ['family dinner', 'family meal', 'family feast'])) {
    updated.group_size = Math.max(updated.group_size, 4);
    markChanged();
  }

  return { profile: updated, changed };
}

export function buildChatContext(messages) {
  const userMessages = messages.filter((m) => m.sender === 'user');
  const allText = normalizeText(userMessages.map((m) => m.text).join(' '));
  const lastUserMsg = normalizeText(userMessages[userMessages.length - 1]?.text || '');
  const categories = detectCategories(allText);
  const lastCategories = detectCategories(lastUserMsg);

  const budgetInLast = lastUserMsg.match(/(?:under|below|within)\s*(\d{2,5})/);
  const parsedBudget = budgetInLast ? parseInt(budgetInLast[1], 10) : null;

  return {
    allText,
    lastUserMsg,
    userMessageCount: userMessages.length,
    categories,
    lastCategories,
    parsedBudget,
    mentionedBiryani: mentionsAny(allText, CATEGORY_KEYWORDS.biryani),
    mentionedBreakfast: mentionsAny(allText, CATEGORY_KEYWORDS.breakfast),
    mentionedDessert: mentionsAny(allText, CATEGORY_KEYWORDS.desserts),
    mentionedFamily: mentionsAny(allText, ['family', 'group', 'party']),
    mentionedSignature: mentionsAny(allText, ['signature', 'chef special', 'best dish'])
  };
}

function addCandidate(pool, chip, boost = 0) {
  if (!chip?.label || !chip?.query) return;
  pool.push({ ...chip, score: (chip.score || 0) + boost });
}

function isTooSimilarToLast(query, lastUserMsg) {
  if (!lastUserMsg) return false;
  const a = normalizeText(query);
  const b = lastUserMsg;
  if (a === b) return true;
  if (a.length > 12 && b.includes(a.slice(0, Math.min(a.length, 24)))) return true;
  if (b.length > 12 && a.includes(b.slice(0, Math.min(b.length, 24)))) return true;
  return false;
}

export function generatePromptChips(profile, messages) {
  const ctx = buildChatContext(messages);
  const pool = [];
  const budget = ctx.parsedBudget || profile.budget_range || 1000;
  const size = profile.group_size || 1;
  const diet = profile.diet_type;
  const spice = profile.spice_preference;

  const dietQueryPrefix =
    diet === 'vegetarian' ? 'vegetarian' :
    diet === 'vegan' ? 'vegan' :
    diet === 'non_vegetarian' ? 'non vegetarian' : '';

  // Profile-driven suggestions
  if (diet === 'vegetarian' || diet === 'vegan') {
    addCandidate(pool, {
      label: `${diet === 'vegan' ? 'Vegan' : 'Veg'} feast under ₹${budget}`,
      query: `${dietQueryPrefix} meal under ${budget} rupees for ${size} ${size === 1 ? 'person' : 'people'}`,
      score: 12
    });
  }

  if (spice === 'mild') {
    addCandidate(pool, {
      label: size > 1 ? `Mild meal for ${size}` : 'Mild spice picks',
      query: `mild spice dishes for ${size} ${size === 1 ? 'person' : 'people'}`,
      score: 11
    });
    addCandidate(pool, {
      label: 'Mild biryani options',
      query: 'mild biryani recommendation with less spice',
      score: 10
    });
  } else if (spice === 'spicy' || spice === 'extra_spicy') {
    addCandidate(pool, {
      label: 'Spiciest dishes',
      query: 'extra spicy authentic dishes on the menu',
      score: 11
    });
  }

  if (profile.health_goals.includes('high_protein') || profile.health_goals.includes('muscle_gain')) {
    addCandidate(pool, {
      label: 'High-protein breakfast',
      query: 'high protein South Indian breakfast options',
      score: 12
    });
    addCandidate(pool, {
      label: 'Protein-rich mains',
      query: 'high protein lunch and dinner options',
      score: 10
    });
  }

  if (profile.health_goals.includes('weight_loss') || profile.health_goals.includes('low_oil')) {
    addCandidate(pool, {
      label: 'Light & low-oil picks',
      query: 'healthy low oil weight loss friendly dishes',
      score: 12
    });
  }

  if (profile.allergies.length > 0) {
    const allergyLabel = profile.allergies.slice(0, 2).join(', ');
    addCandidate(pool, {
      label: `No ${allergyLabel}`,
      query: `dishes safe without ${profile.allergies.join(' or ')}`,
      score: 13
    });
  }

  if (size >= 3 || ctx.mentionedFamily) {
    addCandidate(pool, {
      label: `Family meal under ₹${Math.min(budget, 1200)}`,
      query: `family dinner meal deal under ${Math.min(budget, 1200)} rupees for ${size} people`,
      score: 11
    });
  }

  // Chat-context follow-ups (boost when topic appears in last message)
  const lastBoost = (topic) => (ctx.lastCategories.includes(topic) || ctx.lastUserMsg.includes(topic) ? 8 : 4);

  if (ctx.mentionedBiryani || ctx.categories.includes('biryanis')) {
    addCandidate(pool, {
      label: 'Best biryani pairing',
      query: `${dietQueryPrefix} sides and raita to pair with biryani`.trim(),
      score: 14
    }, lastBoost('biryani'));
    if (spice !== 'spicy' && spice !== 'extra_spicy') {
      addCandidate(pool, {
        label: 'Less spicy biryani',
        query: 'mild biryani alternatives with less heat',
        score: 13
      }, lastBoost('biryani'));
    }
  }

  if (ctx.mentionedBreakfast || ctx.categories.includes('breakfast')) {
    addCandidate(pool, {
      label: 'Quick breakfast combo',
      query: `${dietQueryPrefix} South Indian breakfast combo for ${size}`.trim(),
      score: 13
    }, lastBoost('breakfast'));
  }

  if (ctx.mentionedDessert || ctx.categories.includes('desserts')) {
    addCandidate(pool, {
      label: 'Dessert pairing',
      query: 'traditional dessert and filter coffee pairing',
      score: 13
    }, lastBoost('dessert'));
  }

  if (ctx.parsedBudget) {
    addCandidate(pool, {
      label: `More under ₹${ctx.parsedBudget}`,
      query: `${dietQueryPrefix} dishes under ${ctx.parsedBudget} rupees`.trim(),
      score: 15
    });
  }

  if (ctx.mentionedSignature) {
    addCandidate(pool, {
      label: 'Chef signatures',
      query: 'show me chef signature and royal feast dishes',
      score: 12
    });
  }

  // After first message, suggest exploratory chips based on top categories not yet discussed
  if (ctx.userMessageCount > 0 && ctx.categories.length === 0) {
    addCandidate(pool, {
      label: 'Chef signatures',
      query: 'what are your chef signature dishes',
      score: 6
    });
  }

  // Merge with defaults for cold start
  const source = ctx.userMessageCount === 0 && pool.length < 3
    ? [...DEFAULT_CHIPS, ...pool]
    : pool.length > 0
      ? [...pool, ...DEFAULT_CHIPS]
      : DEFAULT_CHIPS;

  const seen = new Set();
  const ranked = source
    .filter((chip) => {
      const key = chip.label.toLowerCase();
      if (seen.has(key)) return false;
      if (isTooSimilarToLast(chip.query, ctx.lastUserMsg)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ label, query }) => ({ label, query }));

  return ranked.length > 0 ? ranked : DEFAULT_CHIPS.map(({ label, query }) => ({ label, query }));
}

export { DEFAULT_PROFILE };
