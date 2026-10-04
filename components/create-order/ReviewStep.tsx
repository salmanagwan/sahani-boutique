import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CreateOrderFormData, Designer } from '@/types';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { formatDate, formatPrice, getMeasurementFields } from '@/utils/helpers';
import { MeasureFigure } from '@/components/create-order/MeasureFigure';
import { GUIDES, withUnit } from '@/components/measure/figure';
import { WomenSheetView } from '@/components/measure/WomenSheetView';
import { getGarmentImage } from '@/utils/garments';
import { StatusChip } from '@/components/ui/StatusChip';

interface ReviewStepProps {
  formData: CreateOrderFormData;
  designers: Designer[];
}

const MISSING = '__missing__';

export function ReviewStep({ formData, designers }: ReviewStepProps) {
  const designer = designers.find((d) => d.id === formData.designerId);
  const price = parseFloat(formData.productPrice);
  const deposit = parseFloat(formData.depositAmount);
  const fields = getMeasurementFields(formData.gender);
  const measured = Object.entries(formData.measurements).filter(
    ([k, v]) => v && (fields.includes(k) || formData.customMeasurements.includes(k))
  );
  const display = Object.fromEntries(measured.map(([k, v]) => [k, withUnit(k, v, formData.measurementUnit)]));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Summary, set like a list row: stage chip, piece, house, then price and client */}
      <View style={styles.summary}>
        <View style={styles.summaryImage}>
          <Image
            source={getGarmentImage({ id: 'new-order', productName: formData.productName, photoUri: formData.photoUri })}
            resizeMode="cover"
            style={styles.image}
          />
        </View>
        <View style={styles.summaryText}>
          <View>
            <StatusChip status="created" size="small" />
            <Text style={styles.summaryName} numberOfLines={2}>
              {formData.productName || 'Piece not named'}
            </Text>
            <Text style={styles.summaryDesigner} numberOfLines={1}>
              {designer?.name ?? 'No designer yet'}
            </Text>
          </View>
          <View style={styles.summaryMeta}>
            {!isNaN(price) ? (
              <>
                <Text style={styles.summaryPrice}>{formatPrice(price, formData.currency)}</Text>
                <View style={styles.square} />
              </>
            ) : null}
            <Text style={styles.summaryPiece} numberOfLines={1}>
              {formData.fullName || 'Client name'}
            </Text>
          </View>
        </View>
      </View>

      <Section title="Client">
        <Row label="Name" value={formData.fullName || MISSING} />
        {formData.phone ? <Row label="Phone" value={formData.phone} /> : null}
        {formData.email ? <Row label="Email" value={formData.email} /> : null}
        {formData.address ? <Row label="Address" value={formData.address} /> : null}
        <Row label="Fitting for" value={formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)} />
        {formData.eventType ? <Row label="Occasion" value={formData.eventType} /> : null}
      </Section>

      <Section title="The piece">
        <Row label="Designer" value={designer?.name ?? MISSING} />
        <Row label="Piece" value={formData.productName || MISSING} />
        {formData.productCode ? <Row label="Style code" value={formData.productCode} /> : null}
        {formData.colour ? <Row label="Colour" value={formData.colour} /> : null}
        {formData.fabric ? <Row label="Fabric" value={formData.fabric} /> : null}
        {formData.details ? <Row label="Details" value={formData.details} /> : null}
        <Row label="Price" value={!isNaN(price) ? formatPrice(price, formData.currency) : MISSING} />
        {!isNaN(deposit) && deposit > 0 ? (
          <Row label="Deposit" value={formatPrice(deposit, formData.currency)} />
        ) : null}
      </Section>

      <Section title="Dates">
        <Row label="Due date" value={formData.vendorDeliveryDate ? formatDate(formData.vendorDeliveryDate) : MISSING} />
        <Row label="Event date" value={formData.eventDate ? formatDate(formData.eventDate) : MISSING} />
      </Section>

      <Section title="Measurements">
        {measured.length === 0 ? (
          <Text style={styles.empty}>None taken yet. You can add them later.</Text>
        ) : (
          <>
            {formData.gender === 'female' ? (
              <WomenSheetView values={display} />
            ) : (
              <View style={{ marginTop: 8 }}>
                <MeasureFigure mode="static" fields={fields} values={display} height={420} />
              </View>
            )}
            {/* Anything the figure can't show, such as age */}
            {measured
              .filter(([k]) => formData.gender !== 'female' && !GUIDES[k])
              .map(([k]) => (
                <Row key={k} label={k} value={display[k]} />
              ))}
          </>
        )}
      </Section>

      {formData.specialRequest || formData.specialImageUri ? (
        <Section title="Special request">
          {formData.specialRequest ? <Text style={styles.brief}>{formData.specialRequest}</Text> : null}
          {formData.specialImageUri ? (
            <Image source={{ uri: formData.specialImageUri }} resizeMode="contain" style={styles.specialImage} />
          ) : null}
        </Section>
      ) : null}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const missing = value === MISSING;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, missing && styles.rowMissing]} numberOfLines={2}>
        {missing ? 'Missing' : value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  specialImage: {
    width: '100%',
    height: 260,
    marginTop: 12,
    backgroundColor: Colors.mist,
  },
  summary: {
    flexDirection: 'row',
    gap: 18,
  },
  summaryImage: {
    width: 90,
    height: 120,
    overflow: 'hidden',
    backgroundColor: Colors.mist,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  summaryName: {
    fontFamily: Fonts.product,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.primaryText,
    marginTop: 10,
  },
  summaryDesigner: {
    ...Typography.house,
    marginTop: 7,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  summaryPrice: {
    ...Typography.orderId,
  },
  square: {
    width: 4,
    height: 4,
    marginHorizontal: 8,
    backgroundColor: Colors.caption,
  },
  summaryPiece: {
    flexShrink: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 21,
    color: Colors.primaryText,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 11,
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
  rowMissing: {
    color: Colors.error,
  },
  empty: {
    ...Typography.subhead,
    color: Colors.tertiaryText,
    paddingVertical: 8,
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
    padding: 12,
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
    fontSize: 20,
    color: Colors.primaryText,
    marginTop: 2,
  },
  brief: {
    fontFamily: Fonts.displayItalic,
    fontSize: 17,
    lineHeight: 25,
    color: Colors.inkSoft,
    paddingVertical: 6,
  },
});
