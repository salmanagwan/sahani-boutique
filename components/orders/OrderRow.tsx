import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { OrderWithRelations } from '@/types';
import { Colors, Fonts, STATUS_CONFIG } from '@/constants/theme';
import { getGarmentImage } from '@/utils/garments';
import { getDaysUntilEvent } from '@/utils/helpers';
import { StatusChip } from '@/components/ui/StatusChip';

interface OrderRowProps {
  order: OrderWithRelations;
  onPress: () => void;
  /** Long press opens the status picker. Leave out where status can't change. */
  onLongPress?: () => void;
  isLast?: boolean;
  /** Drop the side padding when the parent already has a gutter. */
  flush?: boolean;
}

/** Red flag when the client's event is two days away or less and the piece isn't handed over. */
export function eventUrgency(order: OrderWithRelations): string | null {
  if (order.status === 'completed') return null;
  const days = getDaysUntilEvent(order.eventDate);
  if (days === null || days > 2) return null;
  if (days === 0) return 'Event today';
  if (days === 1) return 'Event tomorrow';
  return `Event in ${days} days`;
}

// One entry: the photo on the left; on the right, the stage chip, the piece and the
// house sit at the top, and the order number and client sit on the photo's bottom edge.
export function OrderRow({ order, onPress, onLongPress, flush }: OrderRowProps) {
  const cfg = STATUS_CONFIG[order.status];
  const urgency = eventUrgency(order);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [styles.row, flush && { paddingHorizontal: 0 }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${order.productName} by ${order.designer.name}, for ${order.customer.fullName}, order ${order.orderNumber}, ${cfg.label}${urgency ? `, ${urgency}` : ''}`}
      accessibilityHint={onLongPress ? 'Long press to change the status' : undefined}
    >
      <View style={styles.imageFrame} pointerEvents="none">
        <Image source={getGarmentImage(order)} resizeMode="cover" style={styles.image} />
      </View>

      <View style={styles.text}>
        <View>
          <View style={styles.chipRow}>
            <StatusChip status={order.status} size="small" />
            {urgency ? (
              <Text style={styles.urgent} numberOfLines={1}>
                {urgency}
              </Text>
            ) : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {order.productName}
          </Text>
          <Text style={styles.designer} numberOfLines={1}>
            {order.designer.name}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.id}>{order.orderNumber}</Text>
          <View style={styles.square} />
          <Text style={styles.client} numberOfLines={1}>
            {order.customer.fullName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const IMG_W = 90;
const IMG_H = 120;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    ...(Platform.OS === 'web' ? ({ userSelect: 'none', WebkitTouchCallout: 'none' } as object) : null),
  },
  pressed: {
    backgroundColor: Colors.mist,
  },
  imageFrame: {
    width: IMG_W,
    height: IMG_H,
    backgroundColor: Colors.mist,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Top block and bottom line are pushed to the photo's top and bottom edges.
  text: {
    flex: 1,
    minWidth: 0,
    minHeight: IMG_H,
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  urgent: {
    flexShrink: 1,
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.urgent,
  },
  // The piece keeps its own face, Tenor Sans.
  title: {
    fontFamily: Fonts.product,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.ink,
    marginTop: 10,
  },
  // The house as a small spaced capital line in grey, so it sits clearly below the piece.
  designer: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11.5,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.secondaryText,
    marginTop: 7,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  id: {
    flexShrink: 0,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 0.3,
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
  },
  square: {
    width: 4,
    height: 4,
    marginHorizontal: 8,
    backgroundColor: Colors.caption,
  },
  client: {
    flexShrink: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
});
