import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts } from '@/constants/theme';

/** Mark outlines on a 24 x 30 grid, shared with the measurement card. */
export const LOGO_PATHS = {
  outer: 'M3 28.5V12.5C3 7.6 7.4 5 12 1.2 16.6 5 21 7.6 21 12.5V28.5',
  inner: 'M6.6 28.5V13.4C6.6 10 9.3 8.2 12 5.6 14.7 8.2 17.4 10 17.4 13.4V28.5',
  base: 'M1 28.5H23',
  diamond: 'M12 14.2 14.1 17.4 12 20.6 9.9 17.4Z',
};

/** The mark: an arched doorway, a boutique entrance in the Mughal manner, with a diamond inside. */
export function LogoMark({ size = 30, color = Colors.ink }: { size?: number; color?: string }) {
  const w = (size * 24) / 30;
  return (
    <Svg width={w} height={size} viewBox="0 0 24 30" fill="none">
      {/* outer arch */}
      <Path d="M3 28.5V12.5C3 7.6 7.4 5 12 1.2 16.6 5 21 7.6 21 12.5V28.5" stroke={color} strokeWidth={1.15} />
      {/* inner arch */}
      <Path d="M6.6 28.5V13.4C6.6 10 9.3 8.2 12 5.6 14.7 8.2 17.4 10 17.4 13.4V28.5" stroke={color} strokeWidth={0.8} />
      {/* threshold */}
      <Path d="M1 28.5H23" stroke={color} strokeWidth={1.15} />
      {/* diamond */}
      <Path d="M12 14.2 14.1 17.4 12 20.6 9.9 17.4Z" fill={color} />
    </Svg>
  );
}

/** Mark beside the SAHANI wordmark, with BOUTIQUE set small underneath. */
export function Logo({ color = Colors.ink, scale = 1 }: { color?: string; scale?: number }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Sahani Boutique">
      <LogoMark size={31 * scale} color={color} />
      <View style={{ marginLeft: 10 * scale }}>
        <Text style={[styles.word, { color, fontSize: 21 * scale, letterSpacing: 6 * scale, marginRight: -6 * scale }]}>SAHANI</Text>
        <Text style={[styles.sub, { color, fontSize: 7.5 * scale, letterSpacing: 4.6 * scale, marginTop: 1 * scale }]}>
          BOUTIQUE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontFamily: Fonts.product,
    lineHeight: undefined,
  },
  sub: {
    fontFamily: Fonts.sansMedium,
    opacity: 0.7,
  },
});
