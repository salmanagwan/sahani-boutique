import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { AuthScreen, Notice } from '@/components/auth/AuthUI';
import { daysText } from '@/components/account/Trial';
import { getPlan, perMonth, PlanId, PLANS, PRICES_ARE_SAMPLES, rupees, savingPercent } from '@/constants/plans';
import { trialEndDate, useAuth } from '@/context/AuthContext';

export default function PlansScreen() {
  const router = useRouter();
  const { locked: fromLock } = useLocalSearchParams<{ locked?: string }>();
  const { account, status, trialDaysLeft } = useAuth();
  const current = status === 'active' ? account?.plan : undefined;
  const [picked, setPicked] = useState<PlanId>(current?.nextId ?? current?.id ?? 'yearly');
  const plan = getPlan(picked)!;
  const end = trialEndDate(account);
  const isCurrent = current && picked === (current.nextId ?? current.id);

  const intro =
    status === 'trial'
      ? `${daysText(trialDaysLeft)} left on your free trial. A plan you pick now starts when the trial ends${end ? ` on ${format(end, 'd MMM')}` : ''}.`
      : status === 'ended'
        ? 'Every plan includes everything in the app. Cancel any time.'
        : 'Switch plans any time. The new plan starts when your current one renews.';

  return (
    <AuthScreen
      title={current ? 'Change plan' : 'Choose a plan'}
      intro={intro}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    >
      <Notice
        tone="info"
        text={fromLock && status === 'ended' ? 'Your trial has ended, so the app is read-only. Your orders are safe. Choose a plan to add or change them again.' : null}
      />
      {PRICES_ARE_SAMPLES ? <Text style={styles.sample}>SAMPLE PRICES, NOT FINAL</Text> : null}

      <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
        {PLANS.map((p) => {
          const on = p.id === picked;
          const save = savingPercent(p);
          const isCur = current && p.id === current.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPicked(p.id)}
              style={({ pressed }) => [styles.card, on && styles.cardOn, pressed && { opacity: 0.85 }]}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${p.name}, ${rupees(p.price)} ${p.period}`}
            >
              <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={14} color={Colors.onInk} weight="bold" /> : null}</View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{p.name}</Text>
                  {save > 0 ? <Text style={styles.save}>{`SAVE ${save}%`}</Text> : null}
                  {isCur ? <Text style={styles.cur}>CURRENT</Text> : null}
                </View>
                <Text style={styles.sub}>{p.months > 1 ? `${rupees(perMonth(p))} a month` : 'Pay month by month'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{rupees(p.price)}</Text>
                <Text style={styles.period}>{p.period}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.summary}>
        {isCurrent
          ? 'This is your plan.'
          : current
            ? `${plan.name} starts on ${format(new Date(current.renewsAt), 'd MMM yyyy')}, at ${rupees(plan.price)} ${plan.period}.`
            : status === 'trial' && end
              ? `Nothing is charged before ${format(end, 'd MMM')}. Then ${rupees(plan.price)} ${plan.period} until you cancel.`
              : `${rupees(plan.price)} today, then ${plan.period} until you cancel.`}
      </Text>
      <Button
        title={current ? `Switch to ${plan.name}` : 'Continue'}
        disabled={Boolean(isCurrent)}
        onPress={() => router.push({ pathname: '/account/checkout', params: { plan: picked } })}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  sample: { ...Typography.house, fontSize: 10, color: Colors.caption, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
  },
  cardOn: { borderColor: Colors.ink, backgroundColor: '#FAFAF8' },
  box: { width: 20, height: 20, borderWidth: 1, borderColor: Colors.champagne, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: Fonts.display, fontSize: 19, lineHeight: 24, color: Colors.ink },
  save: { fontFamily: Fonts.sansSemiBold, fontSize: 9.5, letterSpacing: 1.2, color: Colors.ink, backgroundColor: '#EFEDE8', paddingHorizontal: 6, paddingVertical: 3 },
  cur: { fontFamily: Fonts.sansSemiBold, fontSize: 9.5, letterSpacing: 1.2, color: Colors.secondaryText, borderWidth: 1, borderColor: Colors.hairline, paddingHorizontal: 6, paddingVertical: 2 },
  sub: { ...Typography.footnote, color: Colors.secondaryText, marginTop: 2 },
  price: { fontFamily: Fonts.sansSemiBold, fontSize: 16, color: Colors.ink, fontVariant: ['tabular-nums'] },
  period: { ...Typography.caption1, color: Colors.caption, marginTop: 2 },
  summary: { ...Typography.footnote, color: Colors.secondaryText, marginTop: 22, marginBottom: 14 },
});
