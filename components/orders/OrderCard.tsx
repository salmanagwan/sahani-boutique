import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { OrderWithRelations } from '@/types';
import { Colors, Fonts, STATUS_CONFIG, Typography } from '@/constants/theme';
import { getDaysUntilEvent } from '@/utils/helpers';
import { getGarmentImage } from '@/utils/garments';

interface OrderCardProps {
  order: OrderWithRelations;
  onPress: () => void;
  onLongPress?: () => void;
  /** Photo height. Lists use the full 300; nested lists can pass less. */
  imageHeight?: number;
}

// Emerald only for time-sensitive things: an event inside two weeks.
function attentionLine(order: OrderWithRelations): string | null {
  const days = getDaysUntilEvent(order.eventDate);
  if (days === null || days > 14) return null;
  const what = order.customer.eventType ?? 'Event';
  if (days === 0) return `${what}\ntoday`;
  if (days === 1) return `${what}\ntomorrow`;
  return `${what}\nin ${days} days`;
}

export function OrderCard({ order, onPress, onLongPress, imageHeight = 300 }: OrderCardProps) {
  const status = STATUS_CONFIG[order.status];
  const attention = attentionLine(order);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel={`${order.customer.fullName}, ${order.productName}, ${status.label}`}
    >
      <View style={[styles.imageFrame, { height: imageHeight }]}>
        <Image source={getGarmentImage(order)} resizeMode="cover" style={styles.image} />
        {order.isDraft && (
          <View style={styles.draftTag}>
            <Text style={styles.draftText}>DRAFT</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.text}>
          <Text style={styles.designer} numberOfLines={1}>
            {order.designer.name}
          </Text>
          <Text style={styles.client} numberOfLines={1}>
            {order.customer.fullName}
          </Text>
          <Text style={styles.product} numberOfLines={1}>
            {order.productName}
          </Text>
        </View>
        <Text style={[styles.status, { color: attention ? Colors.emerald : status.color }]}>
          {(attention ?? status.label).toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
  },
  imageFrame: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.mist,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  draftTag: {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  draftText: {
    ...Typography.label,
    fontSize: 10,
    color: Colors.primaryText,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 26,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  designer: {
    ...Typography.label,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  client: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.primaryText,
  },
  product: {
    ...Typography.footnote,
    color: Colors.secondaryText,
  },
  status: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    textAlign: 'right',
    paddingTop: 2,
    maxWidth: 130,
  },
});
