import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { OrderStatus } from '@/types';
import { Colors, Fonts, FILTER_OPTIONS } from '@/constants/theme';

interface FilterChipsProps {
  selected: OrderStatus | 'all';
  onSelect: (filter: OrderStatus | 'all') => void;
  counts?: Partial<Record<OrderStatus | 'all', number>>;
  style?: ViewStyle;
  dark?: boolean;
}

// Boxed filters. The selected one gets a black outline on the page colour, so it reads
// as secondary next to the solid black + button. The rest have a light outline and grey
// text. Stages with no orders are hidden.
export function FilterChips({ selected, onSelect, counts, style }: FilterChipsProps) {
  const options = FILTER_OPTIONS.filter(
    (o) => o.key === 'all' || o.key === selected || !counts || (counts[o.key] ?? 0) > 0
  );
  return (
    <View style={[styles.wrap, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((o) => {
          const active = selected === o.key;
          const count = counts?.[o.key];
          return (
            <Pressable
              key={o.key}
              onPress={() => onSelect(o.key)}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && !active && styles.chipPressed]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${o.label}${count !== undefined ? `, ${count}` : ''}`}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {o.label}
                {count !== undefined ? <Text style={styles.count}>{`  ${count}`}</Text> : null}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 12,
  },
  row: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.background,
  },
  chipActive: {
    borderColor: Colors.ink,
  },
  chipPressed: {
    backgroundColor: Colors.mist,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  labelActive: {
    fontFamily: Fonts.sansMedium,
    color: Colors.ink,
  },
  count: {
    fontFamily: Fonts.sans,
    color: Colors.caption,
  },
});
