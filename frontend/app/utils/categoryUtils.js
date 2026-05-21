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
  sweets: { emoji: '🍬', name: 'Food', color: '#F59E0B' },
  icecream: { emoji: '🍦', name: 'Food', color: '#F59E0B' },
  'ice cream': { emoji: '🍦', name: 'Food', color: '#F59E0B' },
  restaurant: { emoji: '🍽️', name: 'Food', color: '#F59E0B' },
  zomato: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  swiggy: { emoji: '🍔', name: 'Food', color: '#F59E0B' },
  tiffin: { emoji: '🍱', name: 'Food', color: '#F59E0B' },
  mess: { emoji: '🍲', name: 'Food', color: '#F59E0B' },
  'outside pg': { emoji: '🍳', name: 'Food', color: '#F59E0B' },
  outsidepg: { emoji: '🍳', name: 'Food', color: '#F59E0B' },
  'pg food': { emoji: '🍲', name: 'Food', color: '#F59E0B' },
  pgfood: { emoji: '🍲', name: 'Food', color: '#F59E0B' },
  momo: { emoji: '🥟', name: 'Food', color: '#F59E0B' },
  momos: { emoji: '🥟', name: 'Food', color: '#F59E0B' },
  maggi: { emoji: '🍜', name: 'Food', color: '#F59E0B' },
  noodles: { emoji: '🍜', name: 'Food', color: '#F59E0B' },
  samosa: { emoji: '🥟', name: 'Food', color: '#F59E0B' },
  shawarma: { emoji: '🌯', name: 'Food', color: '#F59E0B' },
  chocolate: { emoji: '🍫', name: 'Food', color: '#F59E0B' },
  biscuit: { emoji: '🍪', name: 'Food', color: '#F59E0B' },
  biscuits: { emoji: '🍪', name: 'Food', color: '#F59E0B' },
  rice: { emoji: '🌾', name: 'Food', color: '#F59E0B' },
  roti: { emoji: '🫓', name: 'Food', color: '#F59E0B' },
  curry: { emoji: '🍲', name: 'Food', color: '#F59E0B' },
  paneer: { emoji: '🧀', name: 'Food', color: '#F59E0B' },
  chicken: { emoji: '🍗', name: 'Food', color: '#F59E0B' },
  mutton: { emoji: '🍖', name: 'Food', color: '#F59E0B' },
  fish: { emoji: '🐟', name: 'Food', color: '#F59E0B' },
  egg: { emoji: '🥚', name: 'Food', color: '#F59E0B' },
  eggs: { emoji: '🥚', name: 'Food', color: '#F59E0B' },
  bakery: { emoji: '🍞', name: 'Food', color: '#F59E0B' },
  dhaba: { emoji: '🛖', name: 'Food', color: '#F59E0B' },
  cafe: { emoji: '☕', name: 'Food', color: '#F59E0B' },

  // Drinks
  chai: { emoji: '☕', name: 'Drinks', color: '#8B5CF6' },
  tea: { emoji: '☕', name: 'Drinks', color: '#8B5CF6' },
  coffee: { emoji: '☕', name: 'Drinks', color: '#8B5CF6' },
  'cold coffee': { emoji: '🧋', name: 'Drinks', color: '#8B5CF6' },
  juice: { emoji: '🧃', name: 'Drinks', color: '#8B5CF6' },
  drinks: { emoji: '🍹', name: 'Drinks', color: '#8B5CF6' },
  water: { emoji: '💧', name: 'Drinks', color: '#8B5CF6' },
  bottle: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  'water bottle': { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  waterbottle: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  soda: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  coke: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  pepsi: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  sprite: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  beer: { emoji: '🍺', name: 'Drinks', color: '#8B5CF6' },
  wine: { emoji: '🍷', name: 'Drinks', color: '#8B5CF6' },
  alcohol: { emoji: '🥃', name: 'Drinks', color: '#8B5CF6' },
  liquor: { emoji: '🥃', name: 'Drinks', color: '#8B5CF6' },
  milkshake: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },
  shake: { emoji: '🥤', name: 'Drinks', color: '#8B5CF6' },

  // Transport
  uber: { emoji: '🚗', name: 'Transport', color: '#0EA5E9' },
  ola: { emoji: '🚗', name: 'Transport', color: '#0EA5E9' },
  rapido: { emoji: '🏍️', name: 'Transport', color: '#0EA5E9' },
  cab: { emoji: '🚕', name: 'Transport', color: '#0EA5E9' },
  taxi: { emoji: '🚕', name: 'Transport', color: '#0EA5E9' },
  auto: { emoji: '🛺', name: 'Transport', color: '#0EA5E9' },
  bus: { emoji: '🚌', name: 'Transport', color: '#0EA5E9' },
  metro: { emoji: '🚇', name: 'Transport', color: '#0EA5E9' },
  train: { emoji: '🚆', name: 'Transport', color: '#0EA5E9' },
  fuel: { emoji: '⛽', name: 'Transport', color: '#0EA5E9' },
  petrol: { emoji: '⛽', name: 'Transport', color: '#0EA5E9' },
  diesel: { emoji: '⛽', name: 'Transport', color: '#0EA5E9' },
  gas: { emoji: '⛽', name: 'Transport', color: '#0EA5E9' },
  parking: { emoji: '🅿️', name: 'Transport', color: '#0EA5E9' },
  toll: { emoji: '🛣️', name: 'Transport', color: '#0EA5E9' },
  puncture: { emoji: '🔧', name: 'Transport', color: '#0EA5E9' },
  service: { emoji: '🛠️', name: 'Transport', color: '#0EA5E9' },
  repair: { emoji: '🛠️', name: 'Transport', color: '#0EA5E9' },
  bike: { emoji: '🏍️', name: 'Transport', color: '#0EA5E9' },
  car: { emoji: '🚗', name: 'Transport', color: '#0EA5E9' },

  // Travel
  flight: { emoji: '✈️', name: 'Travel', color: '#6366F1' },
  travel: { emoji: '✈️', name: 'Travel', color: '#6366F1' },
  trip: { emoji: '🧳', name: 'Travel', color: '#6366F1' },
  hotel: { emoji: '🏨', name: 'Travel', color: '#6366F1' },
  stay: { emoji: '🏨', name: 'Travel', color: '#6366F1' },
  ticket: { emoji: '🎫', name: 'Travel', color: '#6366F1' },
  vacation: { emoji: '🌴', name: 'Travel', color: '#6366F1' },

  // Grocery
  grocery: { emoji: '🛒', name: 'Grocery', color: '#10B981' },
  groceries: { emoji: '🛒', name: 'Grocery', color: '#10B981' },
  vegetables: { emoji: '🥬', name: 'Grocery', color: '#10B981' },
  fruits: { emoji: '🍎', name: 'Grocery', color: '#10B981' },
  milk: { emoji: '🥛', name: 'Grocery', color: '#10B981' },
  curd: { emoji: '🥣', name: 'Grocery', color: '#10B981' },
  bread: { emoji: '🍞', name: 'Grocery', color: '#10B981' },
  butter: { emoji: '🧈', name: 'Grocery', color: '#10B981' },
  cheese: { emoji: '🧀', name: 'Grocery', color: '#10B981' },
  zepto: { emoji: '⚡', name: 'Grocery', color: '#10B981' },
  blinkit: { emoji: '⚡', name: 'Grocery', color: '#10B981' },
  instamart: { emoji: '⚡', name: 'Grocery', color: '#10B981' },
  bigbasket: { emoji: '🛒', name: 'Grocery', color: '#10B981' },
  supermarket: { emoji: '🏬', name: 'Grocery', color: '#10B981' },

  // Shopping
  shopping: { emoji: '🛍️', name: 'Shopping', color: '#EC4899' },
  clothes: { emoji: '👕', name: 'Shopping', color: '#EC4899' },
  shoes: { emoji: '👟', name: 'Shopping', color: '#EC4899' },
  amazon: { emoji: '📦', name: 'Shopping', color: '#EC4899' },
  flipkart: { emoji: '📦', name: 'Shopping', color: '#EC4899' },
  online: { emoji: '📦', name: 'Shopping', color: '#EC4899' },
  myntra: { emoji: '🛍️', name: 'Shopping', color: '#EC4899' },
  meesho: { emoji: '🛍️', name: 'Shopping', color: '#EC4899' },
  ajio: { emoji: '🛍️', name: 'Shopping', color: '#EC4899' },
  dress: { emoji: '👗', name: 'Shopping', color: '#EC4899' },
  tshirt: { emoji: '👕', name: 'Shopping', color: '#EC4899' },
  shirt: { emoji: '👔', name: 'Shopping', color: '#EC4899' },
  jeans: { emoji: '👖', name: 'Shopping', color: '#EC4899' },
  pant: { emoji: '👖', name: 'Shopping', color: '#EC4899' },
  sneakers: { emoji: '👟', name: 'Shopping', color: '#EC4899' },
  watch: { emoji: '⌚', name: 'Shopping', color: '#EC4899' },
  cosmetics: { emoji: '💄', name: 'Shopping', color: '#EC4899' },
  makeup: { emoji: '💄', name: 'Shopping', color: '#EC4899' },
  perfume: { emoji: ' sprayer', emoji: '💨', name: 'Shopping', color: '#EC4899' },

  // Entertainment
  movie: { emoji: '🎬', name: 'Entertainment', color: '#F43F5E' },
  movies: { emoji: '🎬', name: 'Entertainment', color: '#F43F5E' },
  netflix: { emoji: '📺', name: 'Entertainment', color: '#F43F5E' },
  spotify: { emoji: '🎵', name: 'Entertainment', color: '#F43F5E' },
  game: { emoji: '🎮', name: 'Entertainment', color: '#F43F5E' },
  games: { emoji: '🎮', name: 'Entertainment', color: '#F43F5E' },
  concert: { emoji: '🎤', name: 'Entertainment', color: '#F43F5E' },
  party: { emoji: '🎉', name: 'Entertainment', color: '#F43F5E' },
  pub: { emoji: '🍻', name: 'Entertainment', color: '#F43F5E' },
  club: { emoji: '🪩', name: 'Entertainment', color: '#F43F5E' },
  bar: { emoji: '🍺', name: 'Entertainment', color: '#F43F5E' },
  outing: { emoji: '🎡', name: 'Entertainment', color: '#F43F5E' },
  cinema: { emoji: '🎥', name: 'Entertainment', color: '#F43F5E' },
  pvr: { emoji: '🎥', name: 'Entertainment', color: '#F43F5E' },
  inox: { emoji: '🎥', name: 'Entertainment', color: '#F43F5E' },
  hotstar: { emoji: '📺', name: 'Entertainment', color: '#F43F5E' },
  youtube: { emoji: '📺', name: 'Entertainment', color: '#F43F5E' },

  // Bills & Utilities
  rent: { emoji: '🏠', name: 'Bills', color: '#2DD4BF' },
  electricity: { emoji: '⚡', name: 'Bills', color: '#2DD4BF' },
  currentbill: { emoji: '⚡', name: 'Bills', color: '#2DD4BF' },
  'current bill': { emoji: '⚡', name: 'Bills', color: '#2DD4BF' },
  eb: { emoji: '⚡', name: 'Bills', color: '#2DD4BF' },
  wifi: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  internet: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  broadband: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  phone: { emoji: '📱', name: 'Bills', color: '#2DD4BF' },
  mobile: { emoji: '📱', name: 'Bills', color: '#2DD4BF' },
  recharge: { emoji: '📱', name: 'Bills', color: '#2DD4BF' },
  jio: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  airtel: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  vi: { emoji: '📶', name: 'Bills', color: '#2DD4BF' },
  dth: { emoji: '📺', name: 'Bills', color: '#2DD4BF' },
  cable: { emoji: '📺', name: 'Bills', color: '#2DD4BF' },
  gas: { emoji: '🔥', name: 'Bills', color: '#2DD4BF' },
  cylinder: { emoji: '🔥', name: 'Bills', color: '#2DD4BF' },
  lpg: { emoji: '🔥', name: 'Bills', color: '#2DD4BF' },
  bill: { emoji: '📄', name: 'Bills', color: '#2DD4BF' },
  emi: { emoji: '🏦', name: 'Bills', color: '#2DD4BF' },
  insurance: { emoji: '🛡️', name: 'Bills', color: '#2DD4BF' },
  subscription: { emoji: '📋', name: 'Bills', color: '#2DD4BF' },
  maintenance: { emoji: '🔧', name: 'Bills', color: '#2DD4BF' },
  maid: { emoji: '🧹', name: 'Bills', color: '#2DD4BF' },
  salary: { emoji: '💵', name: 'Bills', color: '#2DD4BF' },

  // Health
  medicine: { emoji: '💊', name: 'Health', color: '#14B8A6' },
  medicines: { emoji: '💊', name: 'Health', color: '#14B8A6' },
  doctor: { emoji: '🏥', name: 'Health', color: '#14B8A6' },
  clinic: { emoji: '🏥', name: 'Health', color: '#14B8A6' },
  hospital: { emoji: '🏥', name: 'Health', color: '#14B8A6' },
  dental: { emoji: '🦷', name: 'Health', color: '#14B8A6' },
  gym: { emoji: '💪', name: 'Health', color: '#14B8A6' },
  fitness: { emoji: '💪', name: 'Health', color: '#14B8A6' },
  pharmacy: { emoji: '💊', name: 'Health', color: '#14B8A6' },
  apollo: { emoji: '💊', name: 'Health', color: '#14B8A6' },
  '1mg': { emoji: '💊', name: 'Health', color: '#14B8A6' },
  protein: { emoji: '🥤', name: 'Health', color: '#14B8A6' },
  supplement: { emoji: '💊', name: 'Health', color: '#14B8A6' },

  // Education
  book: { emoji: '📚', name: 'Education', color: '#8B5CF6' },
  books: { emoji: '📚', name: 'Education', color: '#8B5CF6' },
  course: { emoji: '🎓', name: 'Education', color: '#8B5CF6' },
  tuition: { emoji: '🎓', name: 'Education', color: '#8B5CF6' },
  stationery: { emoji: '✏️', name: 'Education', color: '#8B5CF6' },
  notebook: { emoji: '📓', name: 'Education', color: '#8B5CF6' },
  pen: { emoji: '🖊️', name: 'Education', color: '#8B5CF6' },
  pencil: { emoji: '✏️', name: 'Education', color: '#8B5CF6' },
  xerox: { emoji: '📄', name: 'Education', color: '#8B5CF6' },
  print: { emoji: '🖨️', name: 'Education', color: '#8B5CF6' },
  exam: { emoji: '📝', name: 'Education', color: '#8B5CF6' },
  college: { emoji: '🏫', name: 'Education', color: '#8B5CF6' },
  fees: { emoji: '💵', name: 'Education', color: '#8B5CF6' },

  // Personal Care
  salon: { emoji: '💇', name: 'Personal', color: '#D946EF' },
  haircut: { emoji: '💇', name: 'Personal', color: '#D946EF' },
  laundry: { emoji: '👔', name: 'Personal', color: '#D946EF' },
  parlour: { emoji: '💅', name: 'Personal', color: '#D946EF' },
  spa: { emoji: '🧖', name: 'Personal', color: '#D946EF' },
  shampoo: { emoji: '🧴', name: 'Personal', color: '#D946EF' },
  soap: { emoji: '🧼', name: 'Personal', color: '#D946EF' },
  iron: { emoji: '🔌', name: 'Personal', color: '#D946EF' },
  washing: { emoji: '🧼', name: 'Personal', color: '#D946EF' },

  // Gifts & Donations
  gift: { emoji: '🎁', name: 'Gifts', color: '#F472B6' },
  donation: { emoji: '❤️', name: 'Gifts', color: '#F472B6' },
  birthday: { emoji: '🎂', name: 'Gifts', color: '#F472B6' },
  anniversary: { emoji: '💍', name: 'Gifts', color: '#F472B6' },
  temple: { emoji: '🛕', name: 'Gifts', color: '#F472B6' },
  charity: { emoji: '🤝', name: 'Gifts', color: '#F472B6' },

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
