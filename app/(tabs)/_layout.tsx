import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/components/ui/Icon';

import { Colors, Fonts } from '@/constants/theme';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
const ICONS: Record<string, IconName> = {
  index: 'orders',
  designers: 'designers',
  settings: 'settings',
};

// Tab bar docked to the bottom: page white with a hairline on top. Phosphor icons (filled when
// selected) over small spaced capitals. The selected tab is black on a soft
// warm-grey square; the rest are grey.
function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.holder, { paddingBottom: insets.bottom > 0 ? Math.max(insets.bottom - 12, 8) : 8 }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = String(descriptors[route.key].options.title ?? route.name);
          const color = focused ? Colors.ink : Colors.caption;
          const iconName = ICONS[route.name] ?? 'orders';
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tab, focused && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
            >
              <View style={[styles.pill, focused && styles.pillActive]}>
                <Icon name={iconName} size={24} color={color} weight="fill" />
                <Text style={[styles.label, { color }, focused && styles.labelActive]}>{label.toUpperCase()}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Orders' }} />
      <Tabs.Screen name="designers" options={{ title: 'Designers' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  holder: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.hairline,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' } as object)
      : null),
  },
  // Same breathing room as the header: 8 above the tabs, 8 (or the home-indicator gap) below.
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabActive: {},
  // Selected tab sits on a soft warm-grey square: visible, but quieter than black.
  pill: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 16,
    minWidth: 96,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#EFEDE8',
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 9.5,
    letterSpacing: 1.8,
  },
  labelActive: {
    fontFamily: Fonts.sansSemiBold,
  },
});
