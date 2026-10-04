import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { OrderStatus } from '@/types';
import { Fonts, STATUS_CONFIG } from '@/constants/theme';

interface StatusChipProps {
  status: OrderStatus;
  /** Filled in the status colour, used for the selected filter. */
  solid?: boolean;
  /** Extra text after the label, e.g. a count in the filter bar. */
  suffix?: string;
  /** small: the compact chip on list rows. */
  size?: 'small' | 'regular';
  style?: ViewStyle;
}

// One chip for status everywhere: list rows, filter bar, status sheet. The colour carries the stage.
export function StatusChip({ status, solid, suffix, size = 'regular', style }: StatusChipProps) {
  const cfg = STATUS_CONFIG[status];
  const fg = solid ? '#FFFFFF' : cfg.color;
  return (
    <View style={[styles.chip, size === 'small' && styles.small, { backgroundColor: solid ? cfg.color : cfg.bgColor }, style]}>
      <Text style={[styles.label, size === 'small' && styles.smallLabel, { color: fg }]} numberOfLines={1}>
        {cfg.label}
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </Text>
    </View>
  );
}

export const chipStyles = StyleSheet.create({
  text: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    letterSpacing: 0.1,
  },
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  small: {
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 0,
    flexShrink: 0,
  },
  smallLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  dot: {
    width: 5,
    height: 5,
  },
  label: {
    ...chipStyles.text,
  },
  suffix: {
    opacity: 0.6,
  },
});
