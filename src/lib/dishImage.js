import biryaniImg from '../assets/chicken_biryani.png';
import dosaImg from '../assets/ghee_roast_dosa.png';
import coffeeImg from '../assets/coffee_dessert.png';

const GRADIENT_ONLY_PATTERNS = ['idli', 'upma', 'pongal'];
const DOSA_PATTERNS = ['dosa'];

function matchesPattern(id, name, patterns) {
  const haystack = `${id} ${name}`.toLowerCase();
  return patterns.some((p) => haystack.includes(p));
}

export function getDishImage(dish) {
  if (!dish) return null;

  if (matchesPattern(dish.id, dish.name, GRADIENT_ONLY_PATTERNS)) {
    return null;
  }

  if (matchesPattern(dish.id, dish.name, DOSA_PATTERNS)) {
    return dosaImg;
  }

  if (dish.category === 'beverages' || dish.category === 'desserts') {
    return coffeeImg;
  }

  if (dish.category === 'breads') {
    return null;
  }

  if (
    dish.category === 'biryanis' ||
    dish.category === 'starters' ||
    dish.category === 'maincourse' ||
    dish.category === 'chefspecials'
  ) {
    return biryaniImg;
  }

  if (dish.category === 'breakfast') {
    return null;
  }

  return dish.image || null;
}

export function getDishGradient(category) {
  const gradients = {
    breakfast: 'linear-gradient(135deg, #FFF8E7 0%, #F5DEB3 100%)',
    starters: 'linear-gradient(135deg, #FFE4E1 0%, #FFB6A3 100%)',
    biryanis: 'linear-gradient(135deg, #FFF0E0 0%, #E8C99B 100%)',
    maincourse: 'linear-gradient(135deg, #F0FFF0 0%, #C8E6C9 100%)',
    breads: 'linear-gradient(135deg, #FFF8DC 0%, #F0E68C 100%)',
    beverages: 'linear-gradient(135deg, #E8F4FD 0%, #B3D9F2 100%)',
    desserts: 'linear-gradient(135deg, #FFF0F5 0%, #FFB6C1 100%)',
    chefspecials: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)'
  };
  return gradients[category] || 'linear-gradient(135deg, #F7F1E8 0%, #D8C4A5 100%)';
}
