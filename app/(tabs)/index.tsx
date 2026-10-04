import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { OrderStatus, OrderWithRelations } from '@/types';
import { Colors, Divider, Fonts, STATUS_CONFIG, Typography } from '@/constants/theme';
import { FilterChips } from '@/components/ui/FilterChips';
import { OrderRow } from '@/components/orders/OrderRow';
import { StatusSheet } from '@/components/orders/StatusSheet';
import { AddButton, BarIcon, TopBar } from '@/components/ui/TopBar';

/** Hairline between rows, starting at the text column: 20 gutter + 90 photo + 18 gap. */
function RowDivider() {
  return <View style={{ ...Divider, marginLeft: 128, marginRight: 20 }} />;
}

/** Room for the floating tab bar so the last row can scroll clear of it. */
const TAB_BAR_SPACE = 90;

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getOrdersWithRelations, updateOrderStatus } = useApp();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const inputRef = useRef<TextInput>(null);
  const [headerH, setHeaderH] = useState(150);
  const [picking, setPicking] = useState<OrderWithRelations | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // The header's bottom line only shows once the list has moved under it.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const changeStatus = (order: OrderWithRelations, status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    setPicking(null);
    setToast(`${order.orderNumber} moved to ${STATUS_CONFIG[status].label}`);
  };

  const orders = getOrdersWithRelations();

  const counts = useMemo(() => {
    const c: Partial<Record<OrderStatus | 'all', number>> = { all: orders.length };
    orders.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (!q) return true;
      return [o.orderNumber, o.customer.fullName, o.designer.name, o.productCode, o.productName]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [orders, filter, query]);

  const toggleSearch = () => {
    if (searching) {
      setQuery('');
      setSearching(false);
    } else {
      setSearching(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const header = (
    <TopBar
      title="Sahani"
      brand
      scrolled={scrolled}
      onHeight={setHeaderH}
      left={<BarIcon name="search" onPress={toggleSearch} label="Search orders" />}
      right={<AddButton onPress={() => router.push('/order/create')} label="New order" />}
    >
      {searching && (
        <View style={styles.searchRow}>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Client, designer or order number"
            placeholderTextColor={Colors.tertiaryText}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          <Pressable onPress={toggleSearch} hitSlop={10}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      )}
      <FilterChips selected={filter} onSelect={setFilter} counts={counts} />
    </TopBar>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={visible}
        keyExtractor={(o) => o.id}
        renderItem={({ item, index }) => (
          <OrderRow
            order={item}
            onPress={() => router.push(`/order/${item.id}`)}
            onLongPress={() => setPicking(item)}
            isLast={index === visible.length - 1}
          />
        )}
        onScroll={(e) => {
          const on = e.nativeEvent.contentOffset.y > 4;
          if (on !== scrolled) setScrolled(on);
        }}
        scrollEventThrottle={32}
        ItemSeparatorComponent={RowDivider}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: headerH + 6, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        scrollIndicatorInsets={{ top: headerH }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{query || filter !== 'all' ? 'Nothing matches' : 'No orders yet'}</Text>
            <Text style={styles.emptyBody}>
              {query || filter !== 'all' ? 'Try another name, or clear the filter.' : 'Tap + to open the first one.'}
            </Text>
          </View>
        }
      />
      {/* Header and filters stay put; the list scrolls underneath. */}
      {header}
      <StatusSheet order={picking} onClose={() => setPicking(null)} onSelect={changeStatus} />
      {toast && (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink,
  },
  searchInput: {
    flex: 1,
    height: 46,
    ...Typography.callout,
    color: Colors.primaryText,
    padding: 0,
    outlineStyle: 'none',
  } as object,
  cancel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 88,
    backgroundColor: Colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toastText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.onInk,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.primaryText,
  },
  emptyBody: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    marginTop: 8,
    textAlign: 'center',
  },
});
