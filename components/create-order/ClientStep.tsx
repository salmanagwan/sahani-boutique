import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CreateOrderFormData, Gender } from '@/types';
import { BorderRadius, Colors, EVENT_TYPES, Spacing, Typography, Fonts } from '@/constants/theme';
import { Input, DatePickerField } from '@/components/ui/Input';
import { getDaysUntilEvent } from '@/utils/helpers';

interface ClientStepProps {
  formData: CreateOrderFormData;
  onChange: (updates: Partial<CreateOrderFormData>) => void;
}

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'girl', label: 'Girl' },
  { key: 'boy', label: 'Boy' },
];

export function ClientStep({ formData, onChange }: ClientStepProps) {
  const [openDate, setOpenDate] = useState<'due' | 'event' | null>(null);
  const daysUntilEvent = getDaysUntilEvent(formData.eventDate);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Input
        label="Full Name *"
        value={formData.fullName}
        onChangeText={(text) => onChange({ fullName: text })}
        placeholder="e.g. Priya Sharma"
        autoCapitalize="words"
      />

      <Input
        label="Phone"
        value={formData.phone}
        onChangeText={(text) => onChange({ phone: text })}
        placeholder="+44 7700 900000"
        keyboardType="phone-pad"
      />

      <Input
        label="Email"
        value={formData.email}
        onChangeText={(text) => onChange({ email: text })}
        placeholder="client@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Address"
        value={formData.address}
        onChangeText={(text) => onChange({ address: text })}
        placeholder="House, street, city, postcode"
        multiline
        autoCapitalize="words"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Fitting for</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const isSelected = formData.gender === g.key;
            return (
              <Pressable
                key={g.key}
                onPress={() => onChange({ gender: g.key })}
                style={[styles.genderChip, isSelected && styles.genderChipSelected]}
              >
                <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Two required dates, side by side. An open calendar takes the full row. */}
      <View style={styles.dateRow}>
        <View style={[styles.dateCol, openDate === 'due' && styles.dateColOpen]}>
          <Text style={styles.label}>
            Due date<Text style={styles.optional}>{'  Required'}</Text>
          </Text>
          <DatePickerField
            compact
            value={formData.vendorDeliveryDate}
            onChange={(d) => onChange({ vendorDeliveryDate: d, expectedDeliveryDate: d })}
            onOpenChange={(o) => setOpenDate(o ? 'due' : null)}
            placeholder="Select"
            minimumDate={new Date()}
          />
        </View>
        <View style={[styles.dateCol, openDate === 'event' && styles.dateColOpen, openDate === 'due' && { display: 'none' }]}>
          <Text style={styles.label}>
            Event date<Text style={styles.optional}>{'  Required'}</Text>
          </Text>
          <DatePickerField
            compact
            value={formData.eventDate}
            onChange={(date) => onChange({ eventDate: date })}
            onOpenChange={(o) => setOpenDate(o ? 'event' : null)}
            placeholder="Select"
            minimumDate={new Date()}
          />
        </View>
      </View>
      <Text style={styles.dateHint}>
        Due date: when the designer should send the piece.
        {daysUntilEvent !== null ? (
          <Text style={daysUntilEvent <= 2 ? { color: Colors.urgent } : undefined}>
            {daysUntilEvent === 0
              ? '  The event is today.'
              : `  The event is ${daysUntilEvent} ${daysUntilEvent === 1 ? 'day' : 'days'} away.`}
          </Text>
        ) : null}
      </Text>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: 22,
  },
  label: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginBottom: 10,
  },
  optional: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.caption,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    height: 46,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  genderChipSelected: {
    borderColor: Colors.ink,
    backgroundColor: Colors.background,
  },
  genderText: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontFamily: Fonts.sans,
  },
  genderTextSelected: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansMedium,
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  occasionChip: {
    paddingHorizontal: 14,
    height: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    backgroundColor: Colors.background,
  },
  occasionChipSelected: {
    borderColor: Colors.ink,
    backgroundColor: Colors.background,
  },
  occasionText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  occasionTextSelected: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansMedium,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dateCol: {
    flex: 1,
    minWidth: 0,
  },
  dateColOpen: {
    flexBasis: '100%',
  },
  dateHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.caption,
    marginTop: -10,
  },
  bottomPad: {
    height: 40,
  },
  eventTiming: {
    marginTop: -Spacing.sm + 2,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm + 3,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    backgroundColor: Colors.sectionBackground,
    gap: 2,
  },
  eventTimingLabel: {
    fontSize: 9,
    fontFamily: Fonts.sansSemiBold,
    color: Colors.gold,
    letterSpacing: 1.1,
  },
  eventTimingText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.caption,
    marginTop: 6,
  },
});
