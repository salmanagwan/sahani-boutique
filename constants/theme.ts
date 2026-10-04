// Sahani design system, set by the Orders listing.
// Titles and product names: Tenor Sans. Everything else: Work Sans, with small spaced
// capitals for labels and kickers. Black on white, stage colours on chips, red only for
// urgency. Square corners throughout. Older token names are kept and pointed at these faces.

export const Fonts = {
  display: 'TenorSans_400Regular',
  displayItalic: 'WorkSans_400Regular_Italic',
  displayMedium: 'TenorSans_400Regular',
  sans: 'WorkSans_400Regular',
  sansLight: 'WorkSans_300Light',
  sansMedium: 'WorkSans_500Medium',
  sansSemiBold: 'WorkSans_600SemiBold',
  sansBold: 'WorkSans_700Bold',
  serif: 'WorkSans_400Regular',
  sansItalic: 'WorkSans_400Regular_Italic',
  product: 'TenorSans_400Regular',
  serifItalic: 'WorkSans_400Regular_Italic',
};

export const Colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  ink: '#000000',
  inkSoft: '#2B2B2B',
  primaryText: '#000000',
  // Example text inside empty fields: lighter than labels so the two never read alike.
  placeholder: '#B4B4B4',
  // Field box outline at rest.
  fieldBorder: '#DADADA',
  // Caption grey, as used for image captions on Luxury London.
  caption: '#848484',
  secondaryText: '#6B6B6B',
  tertiaryText: '#767676',
  border: '#EEEEEE',
  borderLight: '#F2F2F2',
  hairline: '#DDDDDD',
  success: '#0F4D3A',
  warning: '#0F4D3A',
  error: '#9E2A2B',
  // Red only for an event two days away or less.
  urgent: '#C0362C',
  tint: '#000000',
  cardBackground: '#FFFFFF',
  searchBackground: '#FFFFFF',
  chipBackground: '#F5F4F1',
  chipActiveBackground: '#141414',
  chipActiveText: '#FFFFFF',
  fabBackground: '#141414',
  fabText: '#FFFFFF',
  shadow: 'rgba(20, 20, 20, 0.06)',
  urgencyCritical: '#0F4D3A',
  urgencyWarning: '#0F4D3A',
  sectionBackground: '#F5F4F1',
  mist: '#F5F4F1',
  emerald: '#0F4D3A',
  // Gold is retired: these names now map to the greys of the Orders language.
  gold: '#6B6B6B',
  goldSoft: '#DDDDDD',
  champagne: '#BDBDBD',
  oxblood: '#141414',
  onInk: '#FFFFFF',
  onInkMuted: 'rgba(255, 255, 255, 0.7)',
  scrim: 'rgba(20, 20, 20, 0.45)',
};

// Row separator: 0.5px, very light, inset to the text column (not edge to edge).
export const Divider = { height: 0, borderTopWidth: 0.5, borderTopColor: '#E0E0E0' };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 20,
};

// Maison Blanc is square. Only dots stay round.
// One corner language: sharp. No rounded corners on any surface, control or marker.
export const BorderRadius = {
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 9999,
};

// One control height across search, buttons and inputs
export const ControlHeight = 52;

const sans = { fontFamily: Fonts.sans };
const sansMedium = { fontFamily: Fonts.sansMedium };
const sansSemi = { fontFamily: Fonts.sansSemiBold };

export const Typography = {
  display: { fontFamily: Fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: 0, color: '#000000' },
  largeTitle: { fontFamily: Fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: 0 },
  title1: { fontFamily: Fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: 0 },
  title2: { fontFamily: Fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  title3: { fontFamily: Fonts.display, fontSize: 20, lineHeight: 25, letterSpacing: 0 },
  headline: { ...sansMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  body: { ...sans, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  callout: { ...sans, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  subhead: { ...sans, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  footnote: { ...sans, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  caption1: { ...sans, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  caption2: { ...sans, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  label: { ...sansMedium, fontSize: 11.5, lineHeight: 16, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  // The listing's building blocks, shared by every screen.
  // House or designer line: small spaced capitals in grey.
  house: { ...sansMedium, fontSize: 11.5, lineHeight: 16, letterSpacing: 1.4, textTransform: 'uppercase' as const, color: '#6B6B6B' },
  // Order number beside the client: medium, tabular.
  orderId: { ...sansMedium, fontSize: 13, letterSpacing: 0.3, color: '#000000', fontVariant: ['tabular-nums' as const] },
  // Button text: small spaced capitals.
  button: { ...sansSemi, fontSize: 12.5, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  numeral: { fontFamily: Fonts.sansMedium, fontSize: 26, lineHeight: 30, letterSpacing: 0 },
};

export const Shadow = {
  card: {
    shadowColor: '#141414',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  elevated: {
    shadowColor: '#141414',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
};

export const STATUS_CONFIG: Record<
  import('@/types').OrderStatus,
  { label: string; color: string; bgColor: string; dot: string }
> = {
  // Status is written, not painted. Only "ready to collect" uses emerald.
  // The order journey: Created (order placed, email sent) → In Production → In Transit
  // → Ready to Collect → Completed. Each stage has its own quiet colour. Red is kept for urgency.
  created: { label: 'Created', color: '#141414', bgColor: '#ECEAE5', dot: '#141414' },
  in_atelier: { label: 'In Production', color: '#7A5A1E', bgColor: '#F3EBDA', dot: '#7A5A1E' },
  in_transit: { label: 'In Transit', color: '#2C4A78', bgColor: '#E4EAF3', dot: '#2C4A78' },
  ready_pickup: { label: 'Ready to Collect', color: '#0F4D3A', bgColor: '#E0ECE6', dot: '#0F4D3A' },
  completed: { label: 'Completed', color: '#6B6B6B', bgColor: '#F2F2F2', dot: '#6B6B6B' },
  // Older stages, kept only so stored orders still render. Not offered anywhere.
  sent: { label: 'In Production', color: '#7A5A1E', bgColor: '#F3EBDA', dot: '#7A5A1E' },
  trial_pending: { label: 'Ready to Collect', color: '#0F4D3A', bgColor: '#E0ECE6', dot: '#0F4D3A' },
  on_hold: { label: 'Created', color: '#141414', bgColor: '#ECEAE5', dot: '#141414' },
};

export const STATUS_FLOW: import('@/types').OrderStatus[] = [
  'created',
  'in_atelier',
  'in_transit',
  'ready_pickup',
  'completed',
];

export const FILTER_OPTIONS: { key: import('@/types').OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  ...(['created', 'in_atelier', 'in_transit', 'ready_pickup', 'completed'] as const).map(
    (key) => ({ key, label: STATUS_CONFIG[key].label })
  ),
];

export const CURRENCIES = ['GBP', 'USD', 'EUR', 'INR'];

export const MALE_MEASUREMENTS = [
  'Chest',
  'Waist',
  'Hip',
  'Shoulder',
  'Arm Length',
  'Neck',
  'Shirt Length',
  'Trouser Length',
  'Height',
];

export const FEMALE_MEASUREMENTS = [
  'Bust',
  'Waist',
  'Hip',
  'Shoulder',
  'Sleeve Length',
  'Blouse Length',
  'Skirt Length',
  'Height',
];

export const CHILD_MEASUREMENTS = [
  'Chest',
  'Waist',
  'Hip',
  'Shoulder',
  'Sleeve Length',
  'Dress Length',
  'Height',
  'Age',
];

export const EVENT_TYPES = [
  'Wedding',
  'Reception',
  'Engagement',
  'Nikah Ceremony',
  'Mehndi / Sangeet',
  'Gala Dinner',
  'Charity Ball',
  'Corporate Event',
  'Birthday',
  'Family Celebration',
  'Other',
];
