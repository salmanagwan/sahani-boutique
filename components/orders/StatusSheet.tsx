import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrderStatus, OrderWithRelations } from '@/types';
import { Colors, Fonts, STATUS_CONFIG, Typography } from '@/constants/theme';
import { StatusChip } from '@/components/ui/StatusChip';
import { Icon } from '@/components/ui/Icon';

// The order journey, in order.
const OPTIONS: OrderStatus[] = ['created', 'in_atelier', 'in_transit', 'ready_pickup', 'completed'];

interface StatusSheetProps {
  order: OrderWithRelations | null;
  onClose: () => void;
  onSelect: (order: OrderWithRelations, status: OrderStatus) => void;
}

// Change status: the order at the top, then one row per stage with a selector on the
// left and the stage's chip. The current stage is selected; tapping another applies it.
export function StatusSheet({ order, onClose, onSelect }: StatusSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!order} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        {order && (
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.head}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.eyebrow}>Change status</Text>
                <Text style={styles.title} numberOfLines={1}>
                  {order.productName}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {order.orderNumber}  ·  {order.customer.fullName}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
                <Icon name="close" size={22} />
              </Pressable>
            </View>

            <View accessibilityRole="radiogroup">
              {OPTIONS.map((s) => {
                const current = s === order.status;
                return (
                  <Pressable
                    key={s}
                    onPress={() => (current ? onClose() : onSelect(order, s))}
                    style={({ pressed }) => [styles.option, pressed && { backgroundColor: Colors.mist }]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: current }}
                    accessibilityLabel={STATUS_CONFIG[s].label}
                  >
                    <View style={[styles.radio, current && styles.radioOn]}>
                      {current ? <View style={styles.radioDot} /> : null}
                    </View>
                    <StatusChip status={s} style={styles.chip} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.35)',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: Colors.background,
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eyebrow: {
    ...Typography.house,
  },
  title: {
    fontFamily: Fonts.product,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.ink,
    marginTop: 4,
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 56,
    borderTopWidth: 0.5,
    borderTopColor: '#E6E6E6',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  // Round on purpose: a radio button means "pick one". A square would read as a checkbox.
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C4C4C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: Colors.ink,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.ink,
  },
  chip: {
    alignSelf: 'center',
    height: 30,
    paddingHorizontal: 12,
  },
});
