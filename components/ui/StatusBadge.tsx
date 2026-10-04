import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { OrderStatus } from '@/types';
import { BorderRadius, Colors, Spacing, STATUS_CONFIG, Typography, Fonts } from '@/constants/theme';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function StatusBadge({ status, size = 'md', style }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: config.bgColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color: config.color },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    ...Typography.caption1,
    fontFamily: Fonts.sansSemiBold,
  },
  textSm: {
    ...Typography.caption2,
    fontFamily: Fonts.sansSemiBold,
  },
});
