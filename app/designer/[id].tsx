import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { BorderRadius, Colors, Fonts, Spacing, Typography, Divider } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OrderRow } from '@/components/orders/OrderRow';
import { DesignerTile, EmojiPicker, emojiFor } from '@/components/designers/DesignerCard';
import { PhotoField } from '@/components/create-order/PhotoField';

export default function DesignerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { designers, updateDesigner, archiveDesigner, getOrdersWithRelations } = useApp();

  const designer = designers.find((d) => d.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [form, setForm] = useState({
    name: designer?.name ?? '',
    email: designer?.email ?? '',
    phone: designer?.phone ?? '',
    country: designer?.country ?? '',
    leadTime: String(designer?.averageLeadTimeDays ?? 45),
    photoUri: designer?.photoUri ?? '',
    emoji: designer ? emojiFor(designer) : '💎',
  });

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/designers'));

  if (!designer) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Designer" showBack onBack={goBack} />
        <Text style={styles.missing}>This designer could not be found.</Text>
      </View>
    );
  }

  const orders = getOrdersWithRelations().filter((o) => o.designerId === designer.id);
  const open = orders.filter((o) => o.status !== 'completed');
  const done = orders.length - open.length;

  const handleSave = () => {
    updateDesigner(designer.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      country: form.country.trim(),
      averageLeadTimeDays: parseInt(form.leadTime, 10) || 45,
      photoUri: form.photoUri || undefined,
      emoji: form.emoji,
    });
    setIsEditing(false);
  };

  const archive = () => {
    archiveDesigner(designer.id);
    goBack();
  };

  const handleArchive = () => {
    if (Platform.OS === 'web') {
      setConfirmArchive(true);
      return;
    }
    Alert.alert(
      `Archive ${designer.name}?`,
      'They will leave your designer list. Their past orders stay as they are.',
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: archive },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEditing ? 'Edit designer' : 'Designer'}
        showBack
        onBack={() => (isEditing ? setIsEditing(false) : goBack())}
        rightAction={
          !isEditing ? (
            <Pressable onPress={() => setIsEditing(true)} hitSlop={10}>
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.masthead}>
          <DesignerTile designer={designer} size={88} />
          <Text style={styles.name}>{designer.name}</Text>
          <Text style={styles.sub}>{designer.country}</Text>
        </View>

        {isEditing ? (
          <View style={styles.body}>
            <Text style={styles.pickLabel}>Emoji</Text>
            <EmojiPicker value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e })} />
            <View style={{ height: 22 }} />
            <PhotoField label="Photo or logo" square value={form.photoUri} onChange={(uri) => setForm({ ...form, photoUri: uri })} />
            <Input label="Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <Input
              label="Orders email"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input label="Phone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
            <Input label="Country" value={form.country} onChangeText={(t) => setForm({ ...form, country: t })} />
            <Input
              label="Usual making time, in days"
              value={form.leadTime}
              onChangeText={(t) => setForm({ ...form, leadTime: t })}
              keyboardType="number-pad"
            />
            <Button title="Save changes" onPress={handleSave} />
          </View>
        ) : (
          <>
            <View style={styles.facts}>
              {[
                { label: 'Open orders', value: String(open.length) },
                { label: 'Completed', value: String(done) },
                { label: 'Making time', value: `${designer.averageLeadTimeDays} days` },
              ].map((f, i) => (
                <View key={f.label} style={[styles.fact, i > 0 && styles.factDivider]}>
                  <Text style={styles.factValue}>{f.value}</Text>
                  <Text style={styles.factLabel}>{f.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.body}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Pressable style={styles.row} onPress={() => Linking.openURL(`mailto:${designer.email}`)}>
                <Text style={styles.rowLabel}>Orders email</Text>
                <Text style={[styles.rowValue, styles.link]} numberOfLines={1}>
                  {designer.email}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.row, { borderBottomWidth: 0 }]}
                onPress={() => Linking.openURL(`tel:${designer.phone}`)}
              >
                <Text style={styles.rowLabel}>Phone</Text>
                <Text style={[styles.rowValue, styles.link]}>{designer.phone || 'Not added'}</Text>
              </Pressable>

              <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 12 }]}>
                Orders with {designer.name.split(' ')[0]}
              </Text>
              {orders.length === 0 ? (
                <Text style={styles.empty}>No orders placed yet.</Text>
              ) : (
                orders.map((o, i) => (
                  <React.Fragment key={o.id}>
                    {i > 0 ? <View style={{ ...Divider, marginLeft: 108 }} /> : null}
                    <OrderRow order={o} flush isLast={i === orders.length - 1} onPress={() => router.push(`/order/${o.id}`)} />
                  </React.Fragment>
                ))
              )}

              <View style={styles.archiveBlock}>
                {confirmArchive ? (
                  <>
                    <Text style={styles.archiveText}>
                      Archive {designer.name}? Past orders stay as they are.
                    </Text>
                    <View style={styles.archiveButtons}>
                      <Button title="Keep" variant="secondary" onPress={() => setConfirmArchive(false)} style={{ flex: 1 }} />
                      <Button title="Archive" variant="danger" onPress={archive} style={{ flex: 1 }} />
                    </View>
                  </>
                ) : (
                  <Pressable onPress={handleArchive} hitSlop={8}>
                    <Text style={styles.archiveLink}>Archive this designer</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pickLabel: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  missing: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 60,
  },
  edit: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.primaryText,
    paddingHorizontal: 6,
  },
  masthead: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 22,
    paddingHorizontal: Spacing.gutter,
  },
  monogram: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: Fonts.display,
    fontSize: 28,
    letterSpacing: 1.5,
    color: Colors.ink,
  },
  name: {
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: Colors.primaryText,
    textAlign: 'center',
    marginTop: 16,
  },
  sub: {
    ...Typography.label,
    color: Colors.tertiaryText,
    marginTop: 8,
  },
  facts: {
    flexDirection: 'row',
    marginHorizontal: Spacing.gutter,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
  },
  factDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.hairline,
  },
  factValue: {
    fontFamily: Fonts.sansLight,
    fontSize: 24,
    color: Colors.primaryText,
  },
  factLabel: {
    ...Typography.caption1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 26,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.primaryText,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  rowLabel: {
    ...Typography.subhead,
    color: Colors.secondaryText,
  },
  rowValue: {
    ...Typography.subhead,
    fontFamily: Fonts.sansMedium,
    color: Colors.primaryText,
    flex: 1,
    textAlign: 'right',
  },
  link: {
    textDecorationLine: 'underline',
    textDecorationColor: Colors.hairline,
  },
  empty: {
    ...Typography.subhead,
    color: Colors.tertiaryText,
  },
  archiveBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  archiveText: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 12,
  },
  archiveButtons: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
  },
  archiveLink: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.error,
  },
});
