import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CreateOrderFormData } from '@/types';
import { Designer } from '@/types';
import { BorderRadius, Colors, CURRENCIES, Spacing, Typography, Fonts } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { format, parseISO } from 'date-fns';
import { Platform } from 'react-native';

interface ProductStepProps {
  formData: CreateOrderFormData;
  designers: Designer[];
  onChange: (updates: Partial<CreateOrderFormData>) => void;
  showDatePicker: boolean;
  onToggleDatePicker: () => void;
}

export function ProductStep({
  formData,
  designers,
  onChange,
  showDatePicker,
  onToggleDatePicker,
}: ProductStepProps) {
  const deliveryDate = formData.expectedDeliveryDate
    ? parseISO(formData.expectedDeliveryDate)
    : new Date();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Select Designer</Text>
      <View style={styles.designerList}>
        {designers.map((designer) => {
          const isSelected = formData.designerId === designer.id;
          return (
            <Pressable
              key={designer.id}
              onPress={() => onChange({ designerId: designer.id })}
              style={[styles.designerChip, isSelected && styles.designerChipSelected]}
            >
              <Text style={[styles.designerName, isSelected && styles.designerNameSelected]}>
                {designer.name}
              </Text>
              <Text style={[styles.designerMeta, isSelected && styles.designerMetaSelected]}>
                {designer.country} · {designer.averageLeadTimeDays} days
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Product Code"
        value={formData.productCode}
        onChangeText={(text) => onChange({ productCode: text })}
        placeholder="e.g. MM-002"
        autoCapitalize="characters"
      />

      <Input
        label="Product Name"
        value={formData.productName}
        onChangeText={(text) => onChange({ productName: text })}
        placeholder="e.g. Embroidered Lehenga Set"
      />

      <View style={styles.row}>
        <View style={styles.priceField}>
          <Input
            label="Price"
            value={formData.productPrice}
            onChangeText={(text) => onChange({ productPrice: text })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.currencyField}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((currency) => {
              const isSelected = formData.currency === currency;
              return (
                <Pressable
                  key={currency}
                  onPress={() => onChange({ currency })}
                  style={[styles.currencyChip, isSelected && styles.currencyChipSelected]}
                >
                  <Text
                    style={[
                      styles.currencyText,
                      isSelected && styles.currencyTextSelected,
                    ]}
                  >
                    {currency}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <Text style={styles.label}>Expected Delivery Date</Text>
      <Pressable onPress={onToggleDatePicker} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {formData.expectedDeliveryDate
            ? format(parseISO(formData.expectedDeliveryDate), 'MMMM d, yyyy')
            : 'Select date'}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => {
            if (date) {
              onChange({ expectedDeliveryDate: format(date, 'yyyy-MM-dd') });
            }
            if (Platform.OS === 'android') {
              onToggleDatePicker();
            }
          }}
        />
      )}

      <Input
        label="Internal Notes"
        value={formData.internalNotes}
        onChangeText={(text) => onChange({ internalNotes: text })}
        placeholder="Special instructions, preferences..."
        multiline
        numberOfLines={4}
        style={styles.notesInput}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.primaryText,
    marginBottom: Spacing.sm + 4,
  },
  designerList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  designerChip: {
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.searchBackground,
  },
  designerChipSelected: {
    borderColor: Colors.ink,
    backgroundColor: Colors.background,
  },
  designerName: {
    ...Typography.subhead,
    fontFamily: Fonts.sansSemiBold,
    color: Colors.primaryText,
  },
  designerNameSelected: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansMedium,
  },
  designerMeta: {
    ...Typography.caption1,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
  },
  designerMetaSelected: {
    color: Colors.secondaryText,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
  },
  priceField: {
    flex: 1,
  },
  currencyField: {
    flex: 1.2,
  },
  label: {
    ...Typography.subhead,
    fontFamily: Fonts.sansMedium,
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  currencyChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.searchBackground,
  },
  currencyChipSelected: {
    borderColor: Colors.ink,
    backgroundColor: Colors.background,
  },
  currencyText: {
    ...Typography.caption1,
    fontFamily: Fonts.sansSemiBold,
    color: Colors.secondaryText,
  },
  currencyTextSelected: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansMedium,
  },
  dateButton: {
    backgroundColor: Colors.searchBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateText: {
    ...Typography.body,
    color: Colors.primaryText,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
