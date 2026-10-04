import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { LogoMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

// Shown once when the boutique opens after its trial (or a cancelled plan) has run out.
export default function TrialEndedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account } = useAuth();
  const hadPlan = Boolean(account?.plan);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 28 }]}
      bounces={false}
    >
      <View style={styles.center}>
        <LogoMark size={48} />
        <Text style={styles.title}>{hadPlan ? 'Your plan has ended' : 'Your free trial has ended'}</Text>
        <Text style={styles.body}>
          Your orders, clients and designers are all still here. You can open and read everything.
        </Text>
        <Text style={styles.body}>To add or change orders again, choose a plan.</Text>
      </View>
      <View style={styles.actions}>
        <Button title="Choose a plan" onPress={() => router.replace('/account/plans')} />
        <Button title="Just look around" variant="secondary" onPress={close} style={{ marginTop: 12 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.gutter + 4 },
  center: { alignItems: 'center' },
  title: { fontFamily: Fonts.display, fontSize: 28, lineHeight: 34, color: Colors.ink, textAlign: 'center', marginTop: 28 },
  body: { ...Typography.callout, color: Colors.secondaryText, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  actions: { marginTop: 40 },
});
