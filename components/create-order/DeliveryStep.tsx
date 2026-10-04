import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CreateOrderFormData } from '@/types';
import { Colors, Spacing, Typography, Fonts } from '@/constants/theme';
import { DatePickerField } from '@/components/ui/Input';

interface DeliveryStepProps {
  formData: CreateOrderFormData;
  onChange: (updates: Partial<CreateOrderFormData>) => void;
}

export function DeliveryStep({ formData, onChange }: DeliveryStepProps) {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>Due date</Text>
        <DatePickerField
          value={formData.vendorDeliveryDate}
          onChange={(d) => onChange({ vendorDeliveryDate: d, expectedDeliveryDate: d })}
          placeholder="Select date"
          minimumDate={new Date()}
        />
        <Text style={styles.hint}>When the designer should send the piece.</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Delivery date</Text>
        <DatePickerField
          value={formData.customerDeliveryDate}
          onChange={(d) => onChange({ customerDeliveryDate: d })}
          placeholder="Select date"
          minimumDate={new Date()}
        />
        <Text style={styles.hint}>When the client receives it.</Text>
      </View>



      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.caption,
    marginTop: -10,
  },
  container: {
    flex: 1,
  },
  field: {
    marginBottom: 22,
  },
  label: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  bottomPad: {
    height: 40,
  },
});
