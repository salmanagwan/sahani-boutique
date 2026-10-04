import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { LogoMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { TRIAL_DAYS } from '@/context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 28 }]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.brand}>
        <LogoMark size={64} />
        <Text style={styles.word}>SAHANI</Text>
        <Text style={styles.sub}>BOUTIQUE</Text>
        <Text style={styles.line}>Client orders, measurements and designers for your boutique, in one place.</Text>
      </View>
      <View style={styles.actions}>
        <Button title="Start free trial" onPress={() => router.push('/sign-up')} />
        <Button title="Log in" variant="secondary" onPress={() => router.push('/log-in')} style={{ marginTop: 12 }} />
        <Text style={styles.small}>{TRIAL_DAYS} days free. No card needed.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  // Logo, line and buttons sit together in the middle. Nothing is pinned to the bottom
  // edge, so a browser toolbar drawn over the page can never hide the buttons.
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.gutter + 4,
    justifyContent: 'center',
  },
  brand: { alignItems: 'center' },
  actions: { marginTop: 48 },
  word: {
    fontFamily: Fonts.display,
    fontSize: 40,
    letterSpacing: 16,
    marginRight: -16,
    color: Colors.ink,
    marginTop: 22,
  },
  sub: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 7,
    marginRight: -7,
    color: Colors.ink,
    opacity: 0.7,
    marginTop: 6,
  },
  line: {
    ...Typography.callout,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 36,
    maxWidth: 290,
  },
  small: { ...Typography.footnote, color: Colors.caption, textAlign: 'center', marginTop: 16 },
});
