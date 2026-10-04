import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CreateOrderFormData, Gender } from '@/types';
import { BorderRadius, Colors, Spacing, Typography, Fonts } from '@/constants/theme';
import { Input } from '@/components/ui/Input';

interface CustomerStepProps {
  formData: CreateOrderFormData;
  onChange: (updates: Partial<CreateOrderFormData>) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'boy', label: 'Boy' },
  { value: 'girl', label: 'Girl' },
];

export function CustomerStep({ formData, onChange }: CustomerStepProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Input
        label="Full Name"
        value={formData.fullName}
        onChangeText={(text) => onChange({ fullName: text })}
        placeholder="Customer full name"
        autoCapitalize="words"
      />

      <Input
        label="Email Address"
        value={formData.email}
        onChangeText={(text) => onChange({ email: text })}
        placeholder="customer@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Phone Number"
        value={formData.phone}
        onChangeText={(text) => onChange({ phone: text })}
        placeholder="+44 7700 900000"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map((option) => {
          const isSelected = formData.gender === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange({ gender: option.value, measurements: {} })}
              style={[styles.genderChip, isSelected && styles.genderChipSelected]}
            >
              <Text
                style={[styles.genderText, isSelected && styles.genderTextSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.optionalLabel}>Optional</Text>

      <Input
        label="Wedding Date"
        value={formData.weddingDate}
        onChangeText={(text) => onChange({ weddingDate: text })}
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="Event Type"
        value={formData.eventType}
        onChangeText={(text) => onChange({ eventType: text })}
        placeholder="e.g. Wedding, Gala, Reception"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    ...Typography.subhead,
    fontFamily: Fonts.sansMedium,
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  genderChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.searchBackground,
  },
  genderChipSelected: {
    borderColor: Colors.ink,
    backgroundColor: Colors.background,
  },
  genderText: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    fontFamily: Fonts.sansMedium,
  },
  genderTextSelected: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansMedium,
  },
  optionalLabel: {
    ...Typography.caption1,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
});
