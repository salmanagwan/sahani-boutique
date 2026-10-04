import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Shadow, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
}

export function FAB({ onPress, style }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed, style]}
    >
      <Icon name="plus" size={26} color={Colors.fabText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.fabBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.elevated,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
