import { ImageSourcePropType } from 'react-native';

// One photograph per garment. Each file is a single, full-frame image.
const IMAGES = {
  maroonLehenga: require('../assets/images/garments/0-maroon-lehenga.jpg'),
  blushSaree: require('../assets/images/garments/1-blush-saree.jpg'),
  ivorySherwani: require('../assets/images/garments/2-ivory-sherwani.jpg'),
  emeraldAnarkali: require('../assets/images/garments/3-emerald-anarkali.jpg'),
  blushLehenga: require('../assets/images/garments/4-blush-lehenga.jpg'),
  navyBandhgala: require('../assets/images/garments/5-navy-bandhgala.jpg'),
  noirSaree: require('../assets/images/garments/6-noir-saree.jpg'),
  wineLehenga: require('../assets/images/garments/7-wine-lehenga.jpg'),
} as const;

const ALL = Object.values(IMAGES);

// Seed orders get a fixed, hand-matched photograph
const BY_ORDER: Record<string, ImageSourcePropType> = {
  o1: IMAGES.maroonLehenga,
  o2: IMAGES.blushSaree,
  o3: IMAGES.noirSaree,
  o4: IMAGES.ivorySherwani,
  o5: IMAGES.emeraldAnarkali,
  o6: IMAGES.navyBandhgala,
  o7: IMAGES.blushLehenga,
  o8: IMAGES.wineLehenga,
  o9: IMAGES.blushLehenga,
  o10: IMAGES.noirSaree,
  o11: IMAGES.wineLehenga,
  o12: IMAGES.emeraldAnarkali,
  o13: IMAGES.maroonLehenga,
  o14: IMAGES.blushSaree,
  o15: IMAGES.emeraldAnarkali,
};

const BY_KEYWORD: [RegExp, ImageSourcePropType][] = [
  [/sherwani|achkan/i, IMAGES.ivorySherwani],
  [/bandhgala|jodhpuri|suit\b|tuxedo/i, IMAGES.navyBandhgala],
  [/anarkali|kurta|gown/i, IMAGES.emeraldAnarkali],
  [/sharara|gharara/i, IMAGES.wineLehenga],
  [/saree|sari/i, IMAGES.blushSaree],
  [/kid|girl|choli/i, IMAGES.blushLehenga],
  [/lehenga|bridal/i, IMAGES.maroonLehenga],
];

export function getGarmentImage(order: { id: string; productName?: string; photoUri?: string }): ImageSourcePropType {
  // A photo added when the order was created always wins.
  if (order.photoUri) return { uri: order.photoUri };
  if (BY_ORDER[order.id]) return BY_ORDER[order.id];
  const name = order.productName ?? '';
  for (const [pattern, image] of BY_KEYWORD) {
    if (pattern.test(name)) return image;
  }
  const hash = order.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return ALL[hash % ALL.length];
}
