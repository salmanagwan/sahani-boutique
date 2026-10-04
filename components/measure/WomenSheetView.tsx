import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { FigureView } from '@/components/measure/FigureView';
import { buildCroquis, CROQUIS_VIEW, WOMEN_FIELDS } from '@/components/measure/croquis';

// Read-only measurement sheet for the app: front and back figures with every taken
// measurement drawn in, and the values listed underneath in the sheet's order.
export function WomenSheetView({ values }: { values: Record<string, string> }) {
  const nodes = useMemo(() => buildCroquis({ values, labelActive: false }), [values]);
  // Standard measurements in sheet order, then any the boutique added.
  const extras = Object.keys(values).filter((k) => !(WOMEN_FIELDS as readonly string[]).includes(k));
  const taken = [...WOMEN_FIELDS, ...extras].filter((f) => values[f]?.trim());
  return (
    <View>
      <View style={styles.figure}>
        <FigureView nodes={nodes} view={{ x: 0, w: CROQUIS_VIEW.w, h: CROQUIS_VIEW.h }} style={StyleSheet.absoluteFill} />
        <Text style={[styles.side, { left: '25%' }]}>FRONT</Text>
        <Text style={[styles.side, { left: '75%' }]}>BACK</Text>
      </View>
      <View style={styles.grid}>
        {taken.map((f) => (
          <View key={f} style={styles.cell}>
            <Text style={styles.name} numberOfLines={1}>
              {f}
            </Text>
            <Text style={styles.value} numberOfLines={1}>
              {values[f]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: {
    height: 360,
    backgroundColor: Colors.mist,
    marginTop: 8,
  },
  side: {
    position: 'absolute',
    bottom: 8,
    width: 60,
    marginLeft: -30,
    textAlign: 'center',
    ...Typography.house,
    fontSize: 10,
    color: Colors.caption,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  cell: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6E6E6',
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  value: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    marginLeft: 8,
  },
});
