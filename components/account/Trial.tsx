// Trial notices inside the app: the strip under the Orders header, the 3-day and 1-day
// reminders, and the one-time "trial ended" screen.
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { trialEndDate, useAuth } from '@/context/AuthContext';

const openPlans = () => router.push('/account/plans');

export const daysText = (n: number) => (n === 1 ? '1 day' : `${n} days`);

/** Thin strip under the Orders header. Quiet in the trial, black once it has ended. */
export function TrialStrip() {
  const { status, trialDaysLeft } = useAuth();
  if (status === 'active') return null;
  const ended = status === 'ended';
  const soon = !ended && trialDaysLeft <= 3;
  return (
    <Pressable
      onPress={openPlans}
      style={({ pressed }) => [styles.strip, ended && styles.stripEnded, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
    >
      <Text style={[styles.stripText, ended && styles.onInk]} numberOfLines={1}>
        {ended ? 'Trial ended. Read only.' : 'Free trial'}
        {!ended ? (
          <Text style={soon ? styles.stripStrong : undefined}>{`  ·  ${daysText(trialDaysLeft)} left`}</Text>
        ) : null}
      </Text>
      <Text style={[styles.stripLink, ended && styles.onInk]}>{ended ? 'Choose a plan' : 'See plans'}</Text>
    </Pressable>
  );
}

// Shown once per app session when the boutique opens in the ended state.
let endedScreenShown = false;

/** Reminders at 3 days and 1 day left, and the trial-ended screen. Lives on the Orders tab. */
export function TrialPrompts() {
  const insets = useSafeAreaInsets();
  const { account, status, trialDaysLeft, markReminderSeen } = useAuth();

  useEffect(() => {
    if (status !== 'ended') {
      endedScreenShown = false;
      return;
    }
    if (endedScreenShown) return;
    endedScreenShown = true;
    const t = setTimeout(() => router.push('/account/trial-ended'), 250);
    return () => clearTimeout(t);
  }, [status]);

  const threshold = status === 'trial' ? (trialDaysLeft <= 1 ? 1 : trialDaysLeft <= 3 ? 3 : null) : null;
  const show = threshold !== null && !(account?.remindersSeen ?? []).includes(threshold);
  const end = trialEndDate(account);

  const close = () => threshold && markReminderSeen(threshold);

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.eyebrow}>Free trial</Text>
          <Text style={styles.title}>
            {trialDaysLeft <= 1 ? 'Last day of your free trial' : `${daysText(trialDaysLeft)} left on your free trial`}
          </Text>
          <Text style={styles.body}>
            {end ? `From ${format(end, 'EEE d MMM')}, ` : 'When it ends, '}
            the app is read-only until you choose a plan. Your orders, clients and designers stay safe either way.
          </Text>
          <Button
            title="Choose a plan"
            onPress={() => {
              close();
              openPlans();
            }}
            style={{ marginTop: 24 }}
          />
          <Button title="Later" variant="ghost" onPress={close} style={{ marginTop: 4 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.mist,
  },
  stripEnded: { backgroundColor: Colors.ink },
  stripText: { ...Typography.footnote, color: Colors.secondaryText, flexShrink: 1 },
  stripStrong: { fontFamily: Fonts.sansSemiBold, color: Colors.ink },
  stripLink: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.ink, textDecorationLine: 'underline' },
  onInk: { color: Colors.onInk },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.35)',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: Colors.background,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  eyebrow: { ...Typography.house },
  title: { fontFamily: Fonts.display, fontSize: 24, lineHeight: 30, color: Colors.ink, marginTop: 6 },
  body: { ...Typography.callout, color: Colors.secondaryText, marginTop: 10 },
});
