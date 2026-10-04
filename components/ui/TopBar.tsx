import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

interface TopBarProps {
  /** Centred title. Set in spaced capitals, like the SAHANI wordmark. */
  title: string;
  /** Show the Sahani logo (mark and wordmark) instead of a text title. */
  brand?: boolean;
  /** Page titles sit at the left edge; the logo stays centred. */
  align?: 'center' | 'left';
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Shows the faint bottom line once content has scrolled under the bar. */
  scrolled?: boolean;
  onHeight?: (h: number) => void;
  /** Extra rows inside the bar, such as filters. */
  children?: React.ReactNode;
}

// One header for every top-level screen: frosted white, fixed to the top, the content
// scrolls underneath. Equal side slots keep the title centred.
export function TopBar({ title, brand, align = 'center', left, right, scrolled, onHeight, children }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const leftAligned = align === 'left' && !brand;
  return (
    <View style={styles.wrap} onLayout={(e) => onHeight?.(e.nativeEvent.layout.height)}>
      <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>
        {leftAligned ? (
          <Text style={styles.pageTitle} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
        ) : (
          <>
            <View style={styles.slot}>{left}</View>
            {brand ? (
              <Logo />
            ) : (
              <Text style={styles.title} numberOfLines={1}>
                {title.toUpperCase()}
              </Text>
            )}
          </>
        )}
        <View style={[styles.slot, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
      {children}
      <View style={[styles.line, scrolled && styles.lineOn]} pointerEvents="none" />
    </View>
  );
}

/** Solid black square with a plus: the main action on a screen. */
export function AddButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.add, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
    >
      <Icon name="plus" size={22} color={Colors.onInk} />
    </Pressable>
  );
}

/** Plain icon button for the left slot. */
export function BarIcon({
  name,
  onPress,
  label,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.icon} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Icon name={name} size={23} color={Colors.ink} />
    </Pressable>
  );
}

/** Space the content needs above it so the first row starts under the bar. */
export const TOP_BAR_GAP = 6;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' } as object)
      : null),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  // Equal side slots, 44 tall, so the bar is the same height with or without buttons.
  slot: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    flexShrink: 1,
    fontFamily: Fonts.product,
    fontSize: 17,
    letterSpacing: 4.5,
    marginRight: -4.5,
    color: Colors.ink,
  },
  // Left-aligned page title, like a section heading.
  pageTitle: {
    flex: 1,
    fontFamily: Fonts.product,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.ink,
  },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: Colors.ink,
  },
  icon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.07)',
    opacity: 0,
    ...(Platform.OS === 'web' ? ({ transition: 'opacity 180ms ease' } as object) : null),
  },
  lineOn: {
    opacity: 1,
  },
});
