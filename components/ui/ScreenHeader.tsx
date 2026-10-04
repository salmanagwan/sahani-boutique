import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  showBack = false,
  onBack,
  rightAction,
  style,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }, style]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Icon name="back" size={22} color={Colors.primaryText} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.rightAction}>{rightAction ?? <View style={styles.backPlaceholder} />}</View>
      </View>
    </View>
  );
}

// Inner-page header, matched to the tab screens' top bar: same height and gutter,
// the title in spaced Tenor Sans capitals, and only a very faint line underneath.
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 44,
  },
  title: {
    fontFamily: Fonts.product,
    fontSize: 17,
    letterSpacing: 4.5,
    textTransform: 'uppercase',
    color: Colors.primaryText,
    flex: 1,
    textAlign: 'center',
  },
  rightAction: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
});
