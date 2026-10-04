import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { OrderStatus } from '@/types';
import {
  BorderRadius,
  Colors,
  ControlHeight,
  Fonts,
  Spacing,
  STATUS_CONFIG,
  STATUS_FLOW,
  Typography,
} from '@/constants/theme';
import { NotesSection } from '@/components/order-details/NotesSection';
import { Timeline } from '@/components/order-details/Timeline';
import {
  formatDate,
  formatDateShort,
  formatEventDate,
  formatPrice,
  getDaysUntilEvent,
  getMeasurementFields,
  getNextStatus,
  getStatusLabel,
} from '@/utils/helpers';
import { getGarmentImage } from '@/utils/garments';
import { StatusChip } from '@/components/ui/StatusChip';
import { StatusSheet } from '@/components/orders/StatusSheet';
import { eventUrgency } from '@/components/orders/OrderRow';
import { SendSheet } from '@/components/orders/SendSheet';
import { Icon } from '@/components/ui/Icon';
import { MeasureFigure } from '@/components/create-order/MeasureFigure';
import { GUIDES } from '@/components/measure/figure';
import { WomenSheetView } from '@/components/measure/WomenSheetView';

const HERO_HEIGHT = 340;

export default function OrderDetailScreen() {
  const { id, send } = useLocalSearchParams<{ id: string; send?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getOrderWithRelations, updateOrderStatus, addNote, updateNote, deleteNote } = useApp();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [picking, setPicking] = useState(false);
  // Opened straight after "Save and email" on a new order.
  const [sending, setSending] = useState(send === '1');

  const order = getOrderWithRelations(id!);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!order) {
    return (
      <View style={[styles.container, styles.notFound, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundTitle}>Order not found</Text>
        <Pressable onPress={goBack} style={styles.notFoundLink}>
          <Text style={styles.link}>Back to orders</Text>
        </Pressable>
      </View>
    );
  }

  // Same Change Status sheet as the orders list.
  const showStatusPicker = () => setPicking(true);

  const handleSendEmail = () => setSending(true);

  const status = STATUS_CONFIG[order.status];
  const urgency = eventUrgency(order);
  const stageIndex = STATUS_FLOW.indexOf(order.status);
  const next = getNextStatus(order.status);
  const days = getDaysUntilEvent(order.eventDate);
  const balance =
    order.depositAmount && order.depositAmount > 0 ? order.productPrice - order.depositAmount : order.productPrice;
  const fields = getMeasurementFields(order.customer.gender);
  const measured = [
    ...fields,
    ...Object.keys(order.measurements?.values ?? {}).filter((k) => !fields.includes(k)),
  ].filter((f) => order.measurements?.values[f]);
  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

  // Three dates, in the order they happen: taken, due from the designer, worn.
  const dueDate = order.vendorDeliveryDate ?? order.expectedDeliveryDate;
  const deliveryDate = order.customerDeliveryDate ?? order.expectedDeliveryDate;
  const facts = [
    {
      label: 'Ordered',
      value: formatDateShort(order.orderDate ?? order.createdAt),
      note: 'Order taken',
    },
    {
      label: 'Due date',
      value: formatDateShort(dueDate),
      note: `From ${order.designer.name}`,
    },
    {
      label: 'Event',
      value: order.eventDate ? formatDateShort(order.eventDate) : 'Not set',
      note: days === null ? order.customer.eventType ?? '' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days < 0 ? 'Passed' : `In ${days} days`,
      urgent: days !== null && days >= 0 && days <= 2 && order.status !== 'completed',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const past = e.nativeEvent.contentOffset.y > HERO_HEIGHT - insets.top - 110;
          if (past !== pastHero) setPastHero(past);
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Photograph, edge to edge */}
        <View style={styles.hero}>
          <Image source={getGarmentImage(order)} resizeMode="cover" style={styles.heroImage} />
        </View>

        {/* Identity, centred */}
        <View style={styles.identity}>
          <View style={styles.heroMeta}>
            <Text style={styles.heroId}>{order.orderNumber}</Text>
            <View style={styles.square} />
            <Text style={styles.heroProduct}>{order.customer.fullName}</Text>
          </View>
          <Text style={styles.heroName}>{order.productName}</Text>
          <Text style={styles.heroDesigner}>{order.designer.name}</Text>
        </View>

        {/* Stage: one fine line, a dot per stage */}
        <Pressable onPress={showStatusPicker} style={styles.stage} accessibilityRole="button" accessibilityLabel={`Stage: ${status.label}. Tap to change.`}>
          <View style={styles.dots}>
            {STATUS_FLOW.map((st, i) => {
              const done = order.status !== 'on_hold' && i <= stageIndex;
              return (
                <React.Fragment key={st}>
                  {i > 0 && <View style={[styles.dotLine, done && { backgroundColor: Colors.ink }]} />}
                  <View style={[styles.dot, done && styles.dotDone]} />
                </React.Fragment>
              );
            })}
          </View>
          <View style={styles.stageRow}>
            <StatusChip status={order.status} />
            {urgency ? (
              <Text style={styles.stageUrgent}>{urgency}</Text>
            ) : (
              <Text style={styles.stageNext}>{next ? `Next: ${getStatusLabel(next)}` : 'Closed'}</Text>
            )}
          </View>
        </Pressable>

        {/* Key facts */}
        <View style={styles.facts}>
          {facts.map((f, i) => (
            <View key={f.label} style={[styles.fact, i > 0 && styles.factDivider]}>
              <Text style={styles.eyebrow}>{f.label}</Text>
              <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit>
                {f.value}
              </Text>
              <Text style={[styles.factNote, f.urgent && { color: Colors.urgent }]} numberOfLines={1}>
                {f.note}
              </Text>
            </View>
          ))}
        </View>

        <Section title="Client">
          <Row label="Name" value={order.customer.fullName} />
          <Row
            label="Phone"
            value={order.customer.phone}
            onPress={() => Linking.openURL(`tel:${order.customer.phone}`)}
          />
          <Row
            label="Email"
            value={order.customer.email}
            onPress={() => Linking.openURL(`mailto:${order.customer.email}`)}
          />
          {order.customer.address ? <Row label="Address" value={order.customer.address} /> : null}
          {order.customer.eventType ? <Row label="Occasion" value={order.customer.eventType} /> : null}
          <Row label="Fitting for" value={cap(order.customer.gender)} last />
        </Section>

        <Section title="Commission">
          <Row label="Designer" value={order.designer.name} />
          <Row label="Style code" value={order.productCode || 'Not set'} />
          {order.colour ? <Row label="Colour" value={order.colour} /> : null}
          {order.fabric ? <Row label="Fabric" value={order.fabric} /> : null}
          {order.details ? <Row label="Details" value={order.details} /> : null}
          <Row
            label="Follow-up"
            value={order.followUpRequired ? 'Needed' : 'None'}
            valueColor={order.followUpRequired ? Colors.urgencyWarning : undefined}
            last
          />
        </Section>

        <Section title="Payment">
          <Row label="Price" value={formatPrice(order.productPrice, order.currency)} />
          <Row
            label="Deposit"
            value={order.depositAmount ? formatPrice(order.depositAmount, order.currency) : 'None taken'}
          />
          <Row label="Balance" value={formatPrice(balance, order.currency)} strong last />
        </Section>

        <Section title="Measurements" aside={measured.length ? `${measured.length} taken` : undefined}>
          {measured.length ? (
            <>
              {order.customer.gender === 'female' ? (
                <WomenSheetView values={order.measurements!.values} />
              ) : (
                <View style={{ marginTop: 8 }}>
                  <MeasureFigure mode="static" fields={fields} values={order.measurements!.values} height={420} />
                </View>
              )}
              {/* Anything the figure can't show, such as age */}
              {measured
                .filter((f) => order.customer.gender !== 'female' && !GUIDES[f])
                .map((f) => (
                  <Row key={f} label={f} value={order.measurements!.values[f]} />
                ))}
            </>
          ) : (
            <Text style={styles.empty}>No measurements yet.</Text>
          )}
        </Section>

        {order.specialRequest || order.specialImageUri ? (
          <Section title="Special request">
            {order.specialRequest ? <Text style={styles.brief}>{order.specialRequest}</Text> : null}
            {order.specialImageUri ? (
              <Image source={{ uri: order.specialImageUri }} resizeMode="contain" style={styles.specialImage} />
            ) : null}
          </Section>
        ) : null}

        <Section title="History">
          <View style={styles.history}>
            <Timeline statusHistory={order.statusHistory} currentStatus={order.status} />
          </View>
        </Section>

        <Section title="Brief and notes">
          {order.internalNotes ? <Text style={styles.brief}>{order.internalNotes}</Text> : null}
          {order.attachments.length > 0 && (
            <View style={styles.attachments}>
              {order.attachments.map((att) => (
                <View key={att.id} style={styles.attachment}>
                  <Icon name="image" size={17} color={Colors.secondaryText} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {att.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <NotesSection
            notes={order.notes}
            onAddNote={(content) => addNote(order.id, content)}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        </Section>
      </ScrollView>

      <SendSheet order={sending ? order : null} onClose={() => setSending(false)} />

      <StatusSheet
        order={picking ? order : null}
        onClose={() => setPicking(false)}
        onSelect={(o, st) => {
          updateOrderStatus(o.id, st);
          setPicking(false);
        }}
      />

      {/* Compact bar once the photograph has scrolled away */}
      {pastHero ? (
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <Pressable onPress={goBack} style={styles.topBarBack} hitSlop={10} accessibilityLabel="Back to orders">
            <Icon name="back" size={20} color={Colors.ink} />
          </Pressable>
          <View style={styles.topBarTitle}>
            <Text style={styles.topBarName} numberOfLines={1}>
              {order.productName}
            </Text>
            <Text style={[styles.topBarStatus, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={styles.topBarBack} />
        </View>
      ) : (
        <Pressable
          onPress={goBack}
          style={[styles.back, { top: insets.top + 10 }]}
          hitSlop={8}
          accessibilityLabel="Back to orders"
        >
          <Icon name="back" size={20} color={Colors.ink} />
        </Pressable>
      )}

      {/* Action bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [styles.primary, (isSendingEmail || pressed) && { opacity: 0.8 }]}
          onPress={handleSendEmail}
          disabled={isSendingEmail}
        >
          <Icon name="email" size={18} color={Colors.onInk} />
          <Text style={styles.primaryText}>{isSendingEmail ? 'OPENING MAIL…' : 'EMAIL DESIGNER'}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]} onPress={showStatusPicker}>
          <Text style={styles.secondaryText}>STATUS</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {aside ? <Text style={styles.sectionAside}>{aside}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  valueColor,
  strong,
  last,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  valueColor?: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.row, last && { borderBottomWidth: 0 }]} onPress={onPress} disabled={!onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          onPress && styles.rowLink,
          strong && styles.rowStrong,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dotDone: {
    width: 7,
    height: 7,
    backgroundColor: Colors.ink,
  },
  dot: {
    width: 5,
    height: 5,
    backgroundColor: Colors.hairline,
  },
  dotLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.hairline,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 12,
  },
  identity: {
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingTop: 24,
    gap: 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    height: 460,
    backgroundColor: Colors.mist,
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  heroText: {
    position: 'absolute',
    left: Spacing.gutter,
    right: Spacing.gutter,
    bottom: 24,
  },
  // Same three tiers as a list row: house, piece, then order number and client.
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  square: {
    width: 4,
    height: 4,
    marginHorizontal: 8,
    backgroundColor: Colors.caption,
  },
  heroId: {
    ...Typography.orderId,
  },
  heroDesigner: {
    ...Typography.house,
    textAlign: 'center',
    marginTop: 8,
  },
  heroName: {
    fontFamily: Fonts.product,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  heroProduct: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
  heroCode: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    letterSpacing: 0.8,
    color: Colors.onInkMuted,
  },
  back: {
    position: 'absolute',
    left: 14,
    width: 44,
    height: 44,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.hairline,
  },
  topBarBack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
  },
  topBarName: {
    fontFamily: Fonts.display,
    fontSize: 18,
    color: Colors.primaryText,
  },
  topBarStatus: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  eyebrow: {
    ...Typography.label,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: Colors.secondaryText,
  },
  stage: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 26,
    paddingBottom: 22,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.hairline,
  },
  stageTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  stageName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  stageCount: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    letterSpacing: 0.4,
    color: Colors.tertiaryText,
    marginBottom: 6,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 0,
    backgroundColor: Colors.borderLight,
  },
  stageNext: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'right',
    flexShrink: 1,
  },
  stageUrgent: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.urgent,
    textAlign: 'right',
    flexShrink: 1,
  },
  // Two by two: Ordered | Due date, then Delivery | Event.
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.gutter,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.hairline,
  },
  fact: {
    width: '33.33%',
    minWidth: 0,
    paddingRight: 10,
  },
  factLower: {
    marginTop: 18,
  },
  factDivider: {
    paddingLeft: 12,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.hairline,
  },
  factValue: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.primaryText,
    marginTop: 6,
  },
  factNote: {
    ...Typography.caption1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 28,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.primaryText,
  },
  sectionAside: {
    ...Typography.caption1,
    color: Colors.tertiaryText,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  rowLink: {
    textDecorationLine: 'underline',
    textDecorationColor: Colors.hairline,
  },
  rowStrong: {
    fontFamily: Fonts.sansSemiBold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  cell: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  cellLabel: {
    ...Typography.caption1,
    color: Colors.tertiaryText,
  },
  cellValue: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.primaryText,
    marginTop: 2,
  },
  empty: {
    ...Typography.subhead,
    color: Colors.tertiaryText,
    paddingVertical: 8,
  },
  specialImage: {
    width: '100%',
    height: 280,
    marginTop: 12,
    backgroundColor: Colors.mist,
  },
  history: {
    marginTop: 8,
  },
  brief: {
    fontFamily: Fonts.displayItalic,
    fontSize: 17,
    lineHeight: 25,
    color: Colors.inkSoft,
    paddingVertical: 8,
    marginBottom: 12,
  },
  attachments: {
    gap: 10,
    marginBottom: 16,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  attachmentName: {
    ...Typography.footnote,
    color: Colors.primaryText,
    flex: 1,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.hairline,
  },
  primary: {
    flex: 1.4,
    height: ControlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
  },
  primaryText: {
    ...Typography.button,
    color: Colors.onInk,
  },
  secondary: {
    flex: 1,
    height: ControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  secondaryText: {
    ...Typography.button,
    color: Colors.primaryText,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    ...Typography.title2,
    color: Colors.primaryText,
  },
  notFoundLink: {
    marginTop: 12,
  },
  link: {
    ...Typography.subhead,
    color: Colors.primaryText,
    textDecorationLine: 'underline',
  },
});
