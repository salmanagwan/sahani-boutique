import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { Colors, Divider, Fonts, Typography } from '@/constants/theme';
import { DesignerCard } from '@/components/designers/DesignerCard';
import { AddButton, TOP_BAR_GAP, TopBar } from '@/components/ui/TopBar';

const TAB_BAR_SPACE = 90;

export default function DesignersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeDesigners, getOrdersWithRelations } = useApp();
  const orders = getOrdersWithRelations();
  const [headerH, setHeaderH] = useState(70);
  const [scrolled, setScrolled] = useState(false);

  const openByDesigner = useMemo(() => {
    const map: Record<string, number> = {};
    orders
      .filter((o) => o.status !== 'completed')
      .forEach((o) => (map[o.designerId] = (map[o.designerId] ?? 0) + 1));
    return map;
  }, [orders]);

  return (
    <View style={styles.container}>
      <FlatList
        data={activeDesigners}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DesignerCard
            designer={item}
            openOrders={openByDesigner[item.id] ?? 0}
            onPress={() => router.push(`/designer/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ ...Divider, marginLeft: 110, marginRight: 20 }} />}
        onScroll={(e) => {
          const on = e.nativeEvent.contentOffset.y > 4;
          if (on !== scrolled) setScrolled(on);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingTop: headerH + TOP_BAR_GAP, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No designers yet</Text>
            <Text style={styles.emptyBody}>Tap + to add the first house you work with.</Text>
          </View>
        }
      />
      <TopBar
        title="Designers"
        align="left"
        scrolled={scrolled}
        onHeight={setHeaderH}
        right={<AddButton onPress={() => router.push('/designer/add')} label="Add designer" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: Fonts.product,
    fontSize: 22,
    color: Colors.primaryText,
  },
  emptyBody: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    marginTop: 6,
    textAlign: 'center',
  },
});
