import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Designer } from '@/types';
import { Colors, Fonts, Typography } from '@/constants/theme';

interface DesignerCardProps {
  designer: Designer;
  onPress: () => void;
  openOrders?: number;
}

export function monogram(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Emojis a house can wear when it has no photo. */
export const HOUSE_EMOJIS = ['💎', '🪷', '🌿', '🦚', '🌙', '🕊️', '🌹', '🐚', '✨', '🌺', '👑', '🪡'];

/** A steady pick for houses that don't have one yet, so it doesn't change between visits. */
export function emojiFor(designer: Designer) {
  if (designer.emoji) return designer.emoji;
  const n = designer.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return HOUSE_EMOJIS[n % HOUSE_EMOJIS.length];
}

/** Row of emojis to choose from, used when adding or editing a house. */
export function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <View style={styles.picker}>
      {HOUSE_EMOJIS.map((e) => (
        <Pressable
          key={e}
          onPress={() => onChange(e)}
          style={[styles.pick, value === e && styles.pickOn]}
          accessibilityRole="button"
          accessibilityState={{ selected: value === e }}
        >
          <Text style={styles.pickText}>{e}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** The house's photo or logo if the boutique added one; otherwise its emoji. */
export function DesignerTile({ designer, size }: { designer: Designer; size: number }) {
  if (designer.photoUri) {
    return (
      <View style={[styles.tile, { width: size, height: size, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.hairline }]}>
        <Image source={{ uri: designer.photoUri }} resizeMode="contain" style={{ width: size - 8, height: size - 8 }} />
      </View>
    );
  }
  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      <Text style={{ fontSize: Math.round(size * 0.44), lineHeight: Math.round(size * 0.6) }}>{emojiFor(designer)}</Text>
    </View>
  );
}

// A house, set like an order row: a monogram tile where the photo would be, the name in
// Tenor Sans, the country as a spaced capital line, and open orders along the bottom.
export function DesignerCard({ designer, onPress, openOrders }: DesignerCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.mist }]}
      accessibilityRole="button"
      accessibilityLabel={`${designer.name}, ${openOrders ?? 0} open orders`}
    >
      <DesignerTile designer={designer} size={TILE} />

      <View style={styles.content}>
        <View>
          <Text style={styles.name} numberOfLines={2}>
            {designer.name}
          </Text>
          <Text style={styles.house} numberOfLines={1}>
            {designer.country}
          </Text>
        </View>
        <View style={styles.meta}>
          {openOrders !== undefined ? (
            <>
              <Text style={[styles.open, openOrders === 0 && { color: Colors.caption }]}>{openOrders} open</Text>
              <View style={styles.square} />
            </>
          ) : null}
          <Text style={styles.lead} numberOfLines={1}>
            Usually {designer.averageLeadTimeDays} days
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const TILE = 72;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pick: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    backgroundColor: Colors.background,
  },
  pickOn: {
    borderColor: Colors.ink,
    backgroundColor: Colors.mist,
  },
  pickText: {
    fontSize: 22,
  },
  tile: {
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: Fonts.product,
    letterSpacing: 2,
    marginRight: -2,
    color: Colors.ink,
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: TILE,
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: Fonts.product,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.primaryText,
  },
  house: {
    ...Typography.house,
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  open: {
    ...Typography.orderId,
  },
  square: {
    width: 4,
    height: 4,
    marginHorizontal: 8,
    backgroundColor: Colors.caption,
  },
  lead: {
    flexShrink: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
});
