const CATEGORY_MAP = {
  // Food & Drink
  food: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  lunch: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  dinner: { emoji: '🍽️', name: 'Food', color: '#F59E0B' },
  breakfast: { emoji: '🥞', name: 'Food', color: '#F59E0B' },
  snack: { emoji: '🍿', name: 'Food', color: '#F59E0B' },
  snacks: { emoji: '🍿', name: 'Food', color: '#F59E0B' },
  biryani: { emoji: '🍚', name: 'Food', color: '#F59E0B' },
  mandi: { emoji: '🍛', name: 'Food', color: '#F59E0B' },
  pizza: { emoji: '🍕', name: 'Food', color: '#F59E0B' },
  burger: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  chai: { emoji: '☕', name: 'Drinks', color: '#8B5CF6' },
  tea: { emoji: '☕', name: 'Drinks', color: '#8B5CF6' },
  coffee: { emoji: '☕', name: 'Drinks', color: '#8B5CF6' },
  juice: { emoji: '🧃', name: 'Drinks', color: '#8B5CF6' },
  drinks: { emoji: '🍹', name: 'Drinks', color: '#8B5CF6' },
  water: { emoji: '💧', name: 'Drinks', color: '#8B5CF6' },
  bottle: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  'water bottle': { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  waterbottle: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  sweets: { emoji: '🍬', name: 'Food', color: '#F59E0B' },
  icecream: { emoji: '🍦', name: 'Food', color: '#F59E0B' },
  restaurant: { emoji: '🍽️', name: 'Food', color: '#F59E0B' },
  zomato: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  swiggy: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  tiffin: { emoji: '🍱', name: 'Food', color: '#F59E0B' },
  mess: { emoji: '🍲', name: 'Food', color: '#F59E0B' },
  'outside pg': { emoji: '🍳', name: 'Food', color: '#F59E0B' },
  outsidepg: { emoji: '🍳', name: 'Food', color: '#F59E0B' },
  'pg food': { emoji: '🍲', name: 'Food', color: '#F59E0B' },
  pgfood: { emoji: '🍲', name: 'Food', color: '#F59E0B' },

  // Transport
  uber: { emoji: '🚗', name: 'Transport', color: '#0EA5E9' },
  ola: { emoji: '🚗', name: 'Transport', color: '#0EA5E9' },
  cab: { emoji: '🚕', name: 'Transport', color: '#0EA5E9' },
  taxi: { emoji: '🚕', name: 'Transport', color: '#0EA5E9' },
  auto: { emoji: '🛺', name: 'Transport', color: '#0EA5E9' },
  bus: { emoji: '🚌', name: 'Transport', color: '#0EA5E9' },
  metro: { emoji: '🚇', name: 'Transport', color: '#0EA5E9' },
  train: { emoji: '🚆', name: 'Transport', color: '#0EA5E9' },
  fuel: { emoji: '⛽', name: 'Transport', color: '#0EA5E9' },
  petrol: { emoji: '⛽', name: 'Transport', color: '#0EA5E9' },
  parking: { emoji: '🅿️', name: 'Transport', color: '#0EA5E9' },
  flight: { emoji: '✈️', name: 'Travel', color: '#6366F1' },
  travel: { emoji: '✈️', name: 'Travel', color: '#6366F1' },
  trip: { emoji: '🧳', name: 'Travel', color: '#6366F1' },

  // Shopping
  grocery: { emoji: '🛒', name: 'Grocery', color: '#10B981' },
  groceries: { emoji: '🛒', name: 'Grocery', color: '#10B981' },
  vegetables: { emoji: '🥬', name: 'Grocery', color: '#10B981' },
  fruits: { emoji: '🍎', name: 'Grocery', color: '#10B981' },
  shopping: { emoji: '🛍️', name: 'Shopping', color: '#EC4899' },
  clothes: { emoji: '👕', name: 'Shopping', color: '#EC4899' },
  shoes: { emoji: '👟', name: 'Shopping', color: '#EC4899' },
  amazon: { emoji: '📦', name: 'Shopping', color: '#EC4899' },
  flipkart: { emoji: '📦', name: 'Shopping', color: '#EC4899' },
  online: { emoji: '📦', name: 'Shopping', color: '#EC4899' },

  // Entertainment
  movie: { emoji: '🎬', name: 'Entertainment', color: '#F43F5E' },
  movies: { emoji: '🎬', name: 'Entertainment', color: '#F43F5E' },
  netflix: { emoji: '📺', name: 'Entertainment', color: '#F43F5E' },
  spotify: { emoji: '🎵', name: 'Entertainment', color: '#F43F5E' },
  game: { emoji: '🎮', name: 'Entertainment', color: '#F43F5E' },
  games: { emoji: '🎮', name: 'Entertainment', color: '#F43F5E' },
  concert: { emoji: '🎤', name: 'Entertainment', color: '#F43F5E' },
  party: { emoji: '🎉', name: 'Entertainment', color: '#F43F5E' },

  // Bills & Utilities
  rent: { emoji: '🏠', name: 'Bills', color: '#2DD4BF' },
  electricity: { emoji: '⚡', name: 'Bills', color: '#2DD4BF' },
  water: { emoji: '💧', name: 'Bills', color: '#2DD4BF' },
  wifi: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  internet: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  phone: { emoji: '📱', name: 'Bills', color: '#2DD4BF' },
  recharge: { emoji: '📱', name: 'Bills', color: '#2DD4BF' },
  bill: { emoji: '📄', name: 'Bills', color: '#2DD4BF' },
  emi: { emoji: '🏦', name: 'Bills', color: '#2DD4BF' },
  insurance: { emoji: '🛡️', name: 'Bills', color: '#2DD4BF' },
  subscription: { emoji: '📋', name: 'Bills', color: '#2DD4BF' },

  // Health
  medicine: { emoji: '💊', name: 'Health', color: '#14B8A6' },
  doctor: { emoji: '🏥', name: 'Health', color: '#14B8A6' },
  hospital: { emoji: '🏥', name: 'Health', color: '#14B8A6' },
  gym: { emoji: '💪', name: 'Health', color: '#14B8A6' },
  pharmacy: { emoji: '💊', name: 'Health', color: '#14B8A6' },

  // Education
  book: { emoji: '📚', name: 'Education', color: '#8B5CF6' },
  books: { emoji: '📚', name: 'Education', color: '#8B5CF6' },
  course: { emoji: '🎓', name: 'Education', color: '#8B5CF6' },
  tuition: { emoji: '🎓', name: 'Education', color: '#8B5CF6' },
  stationery: { emoji: '✏️', name: 'Education', color: '#8B5CF6' },

  // Personal Care
  salon: { emoji: '💇', name: 'Personal', color: '#D946EF' },
  haircut: { emoji: '💇', name: 'Personal', color: '#D946EF' },
  laundry: { emoji: '👔', name: 'Personal', color: '#D946EF' },

  // Gifts & Donations
  gift: { emoji: '🎁', name: 'Gifts', color: '#F472B6' },
  donation: { emoji: '❤️', name: 'Gifts', color: '#F472B6' },

  // Miscellaneous
  misc: { emoji: '📌', name: 'Other', color: '#A78BFA' },
  other: { emoji: '📌', name: 'Other', color: '#A78BFA' },
};

export function getCategoryInfo(reason) {
  if (!reason) return { emoji: '📌', name: 'Other', color: '#A78BFA' };
  const lower = reason.toLowerCase().trim();
  // Check exact match first
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  // Check if any keyword is contained in the reason
  for (const [keyword, info] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return info;
  }
  return { emoji: '📌', name: 'Other', color: '#A78BFA' };
}

export function getCategoryEmoji(reason) {
  return getCategoryInfo(reason).emoji;
}

export function getCategoryName(reason) {
  return getCategoryInfo(reason).name;
}

export function getCategoryColor(reason) {
  return getCategoryInfo(reason).color;
}

export function getCategoryColorByEmoji(emoji) {
  if (!emoji) return '#FFFFFF';
  for (const info of Object.values(CATEGORY_MAP)) {
    if (info.emoji === emoji) return info.color;
  }
  return '#FFFFFF';
}

export function getCategoryColorByName(categoryName) {
  if (!categoryName) return '#A78BFA';
  const lower = categoryName.toLowerCase().trim();
  for (const info of Object.values(CATEGORY_MAP)) {
    if (info.name.toLowerCase() === lower) return info.color;
  }
  return '#A78BFA';
}

export function getAllCategories() {
  const unique = {};
  for (const info of Object.values(CATEGORY_MAP)) {
    if (!unique[info.name]) {
      unique[info.name] = info;
    }
  }
  return Object.values(unique);
}

export const CATEGORY_COLORS = [
  '#F59E0B', '#0EA5E9', '#10B981', '#EC4899', '#F43F5E',
  '#64748B', '#14B8A6', '#8B5CF6', '#D946EF', '#F472B6', '#94A3B8',
];

export function getCategoryKeywords(categoryName) {
  const keywords = [];
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (value.name.toLowerCase() === categoryName.toLowerCase()) {
      keywords.push(key);
    }
  }
  return [...new Set(keywords)].slice(0, 6);
}
