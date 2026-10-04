import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OrderStatus } from '@/types';
import { Colors, Fonts, STATUS_CONFIG, STATUS_FLOW, Typography } from '@/constants/theme';
import { formatDateTime } from '@/utils/helpers';

interface TimelineProps {
  statusHistory: { status: OrderStatus; timestamp: string }[];
  currentStatus: OrderStatus;
}

// Every stage the order has passed through, with the time it happened.
// Stages still ahead are listed in grey so the path is visible.
export function Timeline({ statusHistory, currentStatus }: TimelineProps) {
  const historyMap = new Map(statusHistory.map((h) => [h.status, h.timestamp]));
  const isOnHold = currentStatus === 'on_hold';
  const statuses: OrderStatus[] = isOnHold
    ? [...STATUS_FLOW.slice(0, Math.max(historyMap.size - 1, 1)), 'on_hold']
    : STATUS_FLOW;
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <View>
      {statuses.map((status, index) => {
        const timestamp = historyMap.get(status);
        const done = index <= currentIndex;
        const isCurrent = status === currentStatus;
        const isLast = index === statuses.length - 1;
        return (
          <View key={status} style={styles.item}>
            <View style={styles.rail}>
              <View style={[styles.dot, done && styles.dotDone, isCurrent && styles.dotCurrent]} />
              {!isLast && <View style={[styles.line, index < currentIndex && styles.lineDone]} />}
            </View>
            <View style={[styles.body, !isLast && { paddingBottom: 16 }]}>
              <Text style={[styles.label, done && styles.labelDone]}>{STATUS_CONFIG[status].label}</Text>
              {timestamp && done ? <Text style={styles.time}>{formatDateTime(timestamp)}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
  },
  rail: {
    width: 14,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.background,
    zIndex: 1,
  },
  dotDone: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  dotCurrent: {
    width: 9,
    height: 9,
    marginTop: 5,
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  line: {
    position: 'absolute',
    top: 12,
    bottom: -6,
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  lineDone: {
    backgroundColor: Colors.ink,
  },
  body: {
    flex: 1,
    paddingLeft: 14,
  },
  label: {
    ...Typography.subhead,
    color: Colors.tertiaryText,
  },
  labelDone: {
    fontFamily: Fonts.sansMedium,
    color: Colors.primaryText,
  },
  time: {
    ...Typography.caption1,
    color: Colors.tertiaryText,
    marginTop: 1,
  },
});
