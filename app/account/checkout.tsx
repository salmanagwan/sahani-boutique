import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addMonths, format } from 'date-fns';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';
import { AuthScreen, PreviewNote } from '@/components/auth/AuthUI';
import { getPlan, PlanId, rupees } from '@/constants/plans';
import { trialEndDate, useAuth } from '@/context/AuthContext';

type Method = 'upi' | 'card';

export default function CheckoutScreen() {
  const router = useRouter();
  const { plan: planId } = useLocalSearchParams<{ plan: PlanId }>();
  const plan = getPlan(planId) ?? getPlan('yearly')!;
  const { account, status, subscribe, changePlan } = useAuth();
  const [method, setMethod] = useState<Method>('upi');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Fixed when the screen opens, so the confirmation keeps its wording after the plan changes.
  const [{ switching, startsLater, start }] = useState(() => {
    const sw = status === 'active' && Boolean(account?.plan);
    const end = trialEndDate(account);
    const later = !sw && status === 'trial' && Boolean(end) && end!.getTime() > Date.now();
    return { switching: sw, startsLater: later, start: sw ? new Date(account!.plan!.renewsAt) : later ? end! : new Date() };
  });
  const renews = addMonths(start, plan.months);

  const confirm = () => {
    setBusy(true);
    // Preview: stands in for Razorpay (or the store's payment sheet in the phone apps).
    setTimeout(() => {
      if (switching) changePlan(plan.id);
      else subscribe(plan.id);
      setBusy(false);
      setDone(true);
    }, 1100);
  };

  const finish = () => router.dismissTo('/');

  if (done) {
    return (
      <AuthScreen title={switching ? 'Plan changed' : 'You are all set'} intro={undefined}>
        <View style={styles.doneMark}>
          <LogoMark size={44} />
        </View>
        <Text style={styles.doneText}>
          {switching
            ? `You move to the ${plan.name} plan on ${format(start, 'd MMM yyyy')}. Until then nothing changes.`
            : startsLater
              ? `Your ${plan.name} plan starts on ${format(start, 'd MMM yyyy')}, when your free trial ends. The first payment is taken then.`
              : `You are on the ${plan.name} plan. It renews on ${format(renews, 'd MMM yyyy')}.`}
        </Text>
        <Button title="Back to orders" onPress={finish} style={{ marginTop: 28 }} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={switching ? 'Confirm change' : 'Confirm and pay'}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/account/plans'))}
    >
      <View style={styles.summary}>
        <Line label="Plan" value={plan.name} />
        <Line label="Price" value={`${rupees(plan.price)} ${plan.period}`} />
        <Line label={switching ? 'Starts' : startsLater ? 'First payment' : 'Paid today'} value={switching || startsLater ? format(start, 'd MMM yyyy') : rupees(plan.price)} />
        <Line label="Renews" value={format(renews, 'd MMM yyyy')} last />
      </View>

      {switching ? (
        <Text style={styles.note}>No charge today. Your current plan runs to its end, then this one starts.</Text>
      ) : (
        <>
          <Text style={styles.label}>Pay with</Text>
          <View style={{ gap: 10 }}>
            <Option on={method === 'upi'} title="UPI Autopay" detail="GPay, PhonePe, Paytm or any UPI app" onPress={() => setMethod('upi')} />
            <Option on={method === 'card'} title="Card" detail="Debit or credit card" onPress={() => setMethod('card')} />
          </View>
          <Text style={styles.note}>Renews by itself {plan.period}. Cancel any time in Settings.</Text>
        </>
      )}

      <Button
        title={switching ? `Switch to ${plan.name}` : startsLater ? 'Set up payment' : `Pay ${rupees(plan.price)}`}
        onPress={confirm}
        loading={busy}
      />
      <PreviewNote
        text={
          switching
            ? 'Nothing is changed with a payment provider yet.'
            : 'No money is taken. In the live app this button opens the payment screen to approve UPI Autopay or the card.'
        }
      />
    </AuthScreen>
  );
}

function Line({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.line, !last && styles.lineBorder]}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

function Option({ on, title, detail, onPress }: { on: boolean; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && { opacity: 0.85 }]}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
    >
      <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={14} color={Colors.onInk} weight="bold" /> : null}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optTitle}>{title}</Text>
        <Text style={styles.optDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: Colors.mist, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 26 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, gap: 12 },
  lineBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.hairline },
  lineLabel: { ...Typography.subhead, color: Colors.secondaryText },
  lineValue: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.ink, fontVariant: ['tabular-nums'] },
  label: { ...Typography.label, color: Colors.secondaryText, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderWidth: 1, borderColor: Colors.fieldBorder },
  optionOn: { borderColor: Colors.ink },
  box: { width: 20, height: 20, borderWidth: 1, borderColor: Colors.champagne, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  optTitle: { ...Typography.callout, color: Colors.ink },
  optDetail: { ...Typography.footnote, color: Colors.secondaryText, marginTop: 1 },
  note: { ...Typography.footnote, color: Colors.secondaryText, marginTop: 18, marginBottom: 14 },
  doneMark: { alignItems: 'flex-start', marginBottom: 18, paddingLeft: Spacing.xs },
  doneText: { ...Typography.callout, color: Colors.secondaryText },
});
