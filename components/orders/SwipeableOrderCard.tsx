import React from 'react';
import { ActionSheetIOS, Alert, Platform, StyleSheet, View } from 'react-native';
import { OrderWithRelations, OrderStatus } from '@/types';
import { OrderCard } from '@/components/orders/OrderCard';
import { getNextStatus, getStatusLabel } from '@/utils/helpers';
import { STATUS_CONFIG, STATUS_FLOW } from '@/constants/theme';

interface LongPressOrderCardProps {
  order: OrderWithRelations;
  onPress: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  onDuplicate: (orderId: string) => void;
}

function showStatusPicker(order: OrderWithRelations, onUpdateStatus: (id: string, s: OrderStatus) => void) {
  const availableStatuses = STATUS_FLOW.filter((s) => s !== order.status);
  const onHoldIncluded: OrderStatus[] = order.status !== 'on_hold'
    ? [...availableStatuses, 'on_hold']
    : availableStatuses;

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...onHoldIncluded.map(getStatusLabel), 'Cancel'],
        cancelButtonIndex: onHoldIncluded.length,
        title: 'Move to Status',
        message: order.customer.fullName,
      },
      (idx) => {
        if (idx < onHoldIncluded.length) {
          onUpdateStatus(order.id, onHoldIncluded[idx]);
        }
      }
    );
  } else {
    Alert.alert(
      'Move to Status',
      order.customer.fullName,
      [
        ...onHoldIncluded.map((s) => ({
          text: getStatusLabel(s),
          onPress: () => onUpdateStatus(order.id, s),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  }
}

export function SwipeableOrderCard({
  order,
  onPress,
  onUpdateStatus,
  onDelete,
  onDuplicate,
}: LongPressOrderCardProps) {
  const handleLongPress = () => {
    const nextStatus = getNextStatus(order.status);
    const nextStatusLabel = nextStatus ? `Move to "${getStatusLabel(nextStatus)}"` : null;

    const options: string[] = [];
    if (nextStatusLabel) options.push(nextStatusLabel);
    options.push('Change Status…');
    options.push('Duplicate Order');
    options.push('Archive Order');
    options.push('Cancel');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: options.indexOf('Archive Order'),
          message: `${order.customer.fullName} · ${order.orderNumber}`,
        },
        (idx) => {
          const selected = options[idx];
          if (selected === nextStatusLabel && nextStatus) {
            onUpdateStatus(order.id, nextStatus);
          } else if (selected === 'Change Status…') {
            showStatusPicker(order, onUpdateStatus);
          } else if (selected === 'Duplicate Order') {
            onDuplicate(order.id);
          } else if (selected === 'Archive Order') {
            Alert.alert(
              'Archive Order',
              `Archive order for ${order.customer.fullName}? It will be removed from the active list.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Archive', style: 'destructive', onPress: () => onDelete(order.id) },
              ]
            );
          }
        }
      );
    } else {
      const androidOptions: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [];
      if (nextStatus) {
        androidOptions.push({
          text: `Move to "${getStatusLabel(nextStatus)}"`,
          onPress: () => onUpdateStatus(order.id, nextStatus),
        });
      }
      androidOptions.push({ text: 'Change Status…', onPress: () => showStatusPicker(order, onUpdateStatus) });
      androidOptions.push({ text: 'Duplicate Order', onPress: () => onDuplicate(order.id) });
      androidOptions.push({
        text: 'Archive Order',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Archive Order', `Archive ${order.orderNumber}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Archive', style: 'destructive', onPress: () => onDelete(order.id) },
          ]);
        },
      });
      androidOptions.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(`${order.customer.fullName} · ${order.orderNumber}`, undefined, androidOptions);
    }
  };

  return (
    <View style={styles.wrapper}>
      <OrderCard order={order} onPress={onPress} onLongPress={handleLongPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
