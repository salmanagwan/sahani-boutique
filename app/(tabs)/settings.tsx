import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { trialEndDate, useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { getPlan, rupees } from '@/constants/plans';
import { daysText } from '@/components/account/Trial';
import { BorderRadius, Colors, ControlHeight, Fonts, Spacing, Typography } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { TOP_BAR_GAP, TopBar } from '@/components/ui/TopBar';
import { Icon } from '@/components/ui/Icon';

const TAB_BAR_SPACE = 90;

type Open = 'boutique' | 'email' | null;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    boutiqueSettings,
    emailTemplates,
    notificationPreferences,
    updateBoutiqueSettings,
    updateNotificationPreferences,
  } = useApp();
  const router = useRouter();
  const { account, trialDaysLeft, logOut, status, cancelPlan, resumePlan, previewSetDaysLeft } = useAuth();
  const plan = account?.plan;
  const trialEnd = trialEndDate(account);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const [open, setOpen] = useState<Open>(null);
  const [headerH, setHeaderH] = useState(70);
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState(boutiqueSettings);
  const toggle = (key: Open) => setOpen((prev) => (prev === key ? null : key));

  const save = () => {
    updateBoutiqueSettings(form);
    setOpen(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: headerH + TOP_BAR_GAP + 10, paddingBottom: TAB_BAR_SPACE + insets.bottom + 20 }}
        onScroll={(e) => {
          const on = e.nativeEvent.contentOffset.y > 4;
          if (on !== scrolled) setScrolled(on);
        }}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{boutiqueSettings.name}</Text>
          <Text style={styles.address}>{boutiqueSettings.address}</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contact}>{boutiqueSettings.phone}</Text>
            <Text style={styles.contactDot}>·</Text>
            <Text style={styles.contact} numberOfLines={1}>
              {boutiqueSettings.email}
            </Text>
          </View>
        </View>

        {/* Account */}
        <Group title="Account">
          {status === 'trial' ? (
            <Row
              title="Free trial"
              detail={trialEnd ? `Ends ${format(trialEnd, 'EEE d MMM')}. Pick a plan any time.` : undefined}
              value={`${daysText(trialDaysLeft)} left`}
              onPress={() => router.push('/account/plans')}
              chevron
            />
          ) : status === 'ended' ? (
            <Row
              title={account?.plan ? 'Plan ended' : 'Trial ended'}
              detail="Read only. Choose a plan to add or change orders."
              onPress={() => router.push('/account/plans')}
              chevron
            />
          ) : plan ? (
            <>
              <Row
                title={`${getPlan(plan.id)?.name} plan`}
                detail={
                  plan.cancelAtEnd
                    ? `Cancelled. Works until ${format(new Date(plan.renewsAt), 'd MMM yyyy')}.`
                    : new Date(plan.startedAt).getTime() > Date.now()
                      ? `Starts ${format(new Date(plan.startedAt), 'd MMM yyyy')}, when the trial ends`
                      : plan.nextId
                        ? `Changes to ${getPlan(plan.nextId)?.name} on ${format(new Date(plan.renewsAt), 'd MMM yyyy')}`
                        : `Renews ${format(new Date(plan.renewsAt), 'd MMM yyyy')}`
                }
                value={rupees(getPlan(plan.id)!.price)}
              />
              <Row title="Change plan" onPress={() => router.push('/account/plans')} chevron />
              {plan.cancelAtEnd ? (
                <Row title="Turn renewal back on" onPress={resumePlan} chevron />
              ) : (
                <Row
                  title="Cancel plan"
                  detail={confirmCancel ? `Tap again to cancel. It keeps working until ${format(new Date(plan.renewsAt), 'd MMM yyyy')}.` : undefined}
                  danger={confirmCancel}
                  onPress={() => {
                    if (confirmCancel) {
                      cancelPlan();
                      setConfirmCancel(false);
                    } else setConfirmCancel(true);
                  }}
                />
              )}
            </>
          ) : null}
          <Row title={account?.name || 'Signed in'} detail={account?.email} />
          <Pressable
            onPress={logOut}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
          >
            <Text style={[styles.rowTitle, { fontFamily: Fonts.sansMedium }]}>Log out</Text>
          </Pressable>
        </Group>

        {/* Boutique */}
        <Group title="Boutique">
          <Row
            title="Boutique details"
            detail="Name, address and contact shown on emails"
            open={open === 'boutique'}
            onPress={() => {
              setForm(boutiqueSettings);
              toggle('boutique');
            }}
          />
          {open === 'boutique' && (
            <View style={styles.panel}>
              <Input label="Boutique name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
              <Input
                label="Address"
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                multiline
              />
              <Input
                label="Phone"
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType="phone-pad"
              />
              <Input
                label="Email"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.panelButtons}>
                <Pressable style={styles.btnSecondary} onPress={() => setOpen(null)}>
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.btnPrimary} onPress={save}>
                  <Text style={styles.btnPrimaryText}>Save changes</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Row title="Currency" value={boutiqueSettings.currency} last />
        </Group>

        {/* Email */}
        <Group title="Emails to designers">
          <Row
            title="Templates"
            detail={`${emailTemplates.length} saved`}
            open={open === 'email'}
            onPress={() => toggle('email')}
            last={open !== 'email'}
          />
          {open === 'email' && (
            <View style={styles.panel}>
              {emailTemplates.map((t) => (
                <View key={t.id} style={styles.template}>
                  <Text style={styles.templateName}>{t.name}</Text>
                  <Text style={styles.templateSubject} numberOfLines={2}>
                    {t.subject}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Group>

        {/* Notifications */}
        <Group title="Notifications">
          <Toggle
            title="Stage changes"
            detail="When an order moves to a new stage"
            value={notificationPreferences.orderStatusUpdates}
            onChange={(v) => updateNotificationPreferences({ orderStatusUpdates: v })}
          />
          <Toggle
            title="Delivery reminders"
            detail="A week before a piece is due"
            value={notificationPreferences.deliveryReminders}
            onChange={(v) => updateNotificationPreferences({ deliveryReminders: v })}
          />
          <Toggle
            title="Email receipts"
            detail="When an email to a designer is sent"
            value={notificationPreferences.emailSentConfirmations}
            onChange={(v) => updateNotificationPreferences({ emailSentConfirmations: v })}
            last
          />
        </Group>

        {/* Preview only: lets the trial be tried without waiting 15 days. */}
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>PREVIEW TOOLS</Text>
          <Text style={styles.previewText}>Jump the free trial to any point to see what a boutique sees. Clears any plan.</Text>
          <View style={styles.previewRow}>
            {[
              { label: '15 days left', days: 15 },
              { label: '3 days left', days: 3 },
              { label: '1 day left', days: 1 },
              { label: 'Trial ended', days: 0 },
            ].map((o) => (
              <Pressable
                key={o.days}
                onPress={() => {
                  previewSetDaysLeft(o.days);
                  setConfirmCancel(false);
                  router.navigate('/');
                }}
                style={({ pressed }) => [styles.previewChip, pressed && { backgroundColor: Colors.mist }]}
                accessibilityRole="button"
              >
                <Text style={styles.previewChipText}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>Sahani · version 2</Text>
      </ScrollView>
      <TopBar title="Settings" align="left" scrolled={scrolled} onHeight={setHeaderH} />
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

function Row({
  title,
  detail,
  value,
  open,
  onPress,
  last,
  chevron,
  danger,
}: {
  title: string;
  detail?: string;
  value?: string;
  open?: boolean;
  onPress?: () => void;
  last?: boolean;
  /** Opens another screen instead of a panel. */
  chevron?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && { color: Colors.error }]}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {chevron ? (
        <Icon name="caretRight" size={16} color={Colors.tertiaryText} />
      ) : onPress && open !== undefined ? (
        <Icon name={open ? "caretUp" : "caretDown"} size={16} color={Colors.tertiaryText} />
      ) : null}
    </Pressable>
  );
}

function Toggle({
  title,
  detail,
  value,
  onChange,
  last,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.ink }}
        thumbColor={Colors.surface}
        {...({ activeThumbColor: Colors.surface } as object)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: 8,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.tertiaryText,
  },
  title: {
    fontFamily: Fonts.product,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.primaryText,
  },
  address: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  contact: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    flexShrink: 1,
  },
  contactDot: {
    ...Typography.subhead,
    color: Colors.tertiaryText,
  },
  group: {
    marginTop: 30,
    paddingHorizontal: Spacing.gutter,
  },
  // Group label in the house style; no boxes, rows sit on the page.
  groupTitle: {
    ...Typography.house,
    marginBottom: 4,
  },
  groupBody: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...Typography.callout,
    color: Colors.primaryText,
  },
  rowDetail: {
    ...Typography.footnote,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  rowValue: {
    ...Typography.callout,
    color: Colors.secondaryText,
  },
  panel: {
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  panelButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  btnPrimary: {
    flex: 1.4,
    height: ControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
  },
  btnPrimaryText: {
    ...Typography.button,
    color: Colors.onInk,
  },
  btnSecondary: {
    flex: 1,
    height: ControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  btnSecondaryText: {
    ...Typography.button,
    color: Colors.primaryText,
  },
  template: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  templateName: {
    fontFamily: Fonts.product,
    fontSize: 18,
    color: Colors.primaryText,
  },
  templateSubject: {
    ...Typography.footnote,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  previewBox: {
    marginTop: 36,
    marginHorizontal: Spacing.gutter,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.champagne,
  },
  previewLabel: { ...Typography.house, fontSize: 10, color: Colors.caption },
  previewText: { ...Typography.footnote, color: Colors.secondaryText, marginTop: 4 },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  previewChip: { borderWidth: 1, borderColor: Colors.ink, paddingHorizontal: 12, paddingVertical: 8 },
  previewChipText: { fontFamily: Fonts.sansMedium, fontSize: 12.5, color: Colors.ink },
  footer: {
    ...Typography.caption1,
    color: Colors.tertiaryText,
    textAlign: 'center',
    marginTop: 36,
  },
});
