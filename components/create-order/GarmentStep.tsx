import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { addDays, format } from 'date-fns';
import { CreateOrderFormData, Designer } from '@/types';
import { BorderRadius, Colors, Spacing, Typography, Fonts } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { getDaysUntilEvent } from '@/utils/helpers';
import { PhotoField } from '@/components/create-order/PhotoField';
import { Icon } from '@/components/ui/Icon';

interface GarmentStepProps {
  formData: CreateOrderFormData;
  designers: Designer[];
  onChange: (updates: Partial<CreateOrderFormData>) => void;
}

export function GarmentStep({ formData, designers, onChange }: GarmentStepProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const selectedDesigner = designers.find((d) => d.id === formData.designerId);
  const daysUntilEvent = getDaysUntilEvent(formData.eventDate);
  const timingMargin = selectedDesigner && daysUntilEvent !== null
    ? daysUntilEvent - selectedDesigner.averageLeadTimeDays - 5
    : null;

  const handleDesignerSelect = (designer: Designer) => {
    const estimatedVendorDate = format(addDays(new Date(), designer.averageLeadTimeDays), 'yyyy-MM-dd');
    // Keep a due date already chosen on the Client step; otherwise suggest one from the
    // house's usual making time.
    onChange(
      formData.vendorDeliveryDate
        ? { designerId: designer.id }
        : {
            designerId: designer.id,
            vendorDeliveryDate: estimatedVendorDate,
            expectedDeliveryDate: estimatedVendorDate,
          }
    );
    setPickerVisible(false);
  };

  const openDesignerPicker = () => {
    if (Platform.OS === 'ios' && designers.length <= 8) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...designers.map((d) => d.name), 'Cancel'],
          cancelButtonIndex: designers.length,
          title: 'Choose a designer',
        },
        (idx) => {
          if (idx < designers.length) {
            handleDesignerSelect(designers[idx]);
          }
        }
      );
    } else {
      setPickerVisible(true);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PhotoField value={formData.photoUri} onChange={(uri) => onChange({ photoUri: uri })} />

        {/* Designer picker */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Designer<Text style={styles.required}>{'  Required'}</Text>
          </Text>
          <Pressable onPress={openDesignerPicker} style={styles.dropdownBtn}>
            <Text
              style={[
                styles.dropdownText,
                !selectedDesigner && styles.dropdownPlaceholder,
              ]}
            >
              {selectedDesigner ? selectedDesigner.name : 'Choose a designer'}
            </Text>
            <Icon name="caretDown" size={18} color={Colors.tertiaryText} />
          </Pressable>
          {selectedDesigner && (
            <>
              <Text style={styles.designerMeta}>
                {selectedDesigner.country} · usually {selectedDesigner.averageLeadTimeDays} days to make
              </Text>
              {timingMargin !== null && (
                <View style={[styles.timingNote, timingMargin < 0 && styles.timingNoteUrgent]}>
                  <Text style={[styles.timingNoteLabel, timingMargin < 0 && styles.timingNoteLabelUrgent]}>
                    {timingMargin < 0 ? 'Tight timing' : 'Time to spare'}
                  </Text>
                  <Text style={styles.timingNoteText}>
                    {timingMargin < 0
                      ? `The event is ${Math.abs(timingMargin)} days sooner than this house usually needs.`
                      : `${timingMargin} days to spare for fittings after the usual making time.`}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <Input
          label="Style code"
          value={formData.productCode}
          onChangeText={(text) => onChange({ productCode: text.toUpperCase() })}
          placeholder="e.g. MM-002"
          autoCapitalize="characters"
        />

        <Input
          label="Piece *"
          value={formData.productName}
          onChangeText={(text) => onChange({ productName: text })}
          placeholder="e.g. Embroidered Lehenga Set"
        />

        <Input
          label="Colour"
          value={formData.colour}
          onChangeText={(text) => onChange({ colour: text })}
          placeholder="e.g. Pink, leaf embellished"
        />

        <Input
          label="Fabric"
          value={formData.fabric}
          onChangeText={(text) => onChange({ fabric: text })}
          placeholder="e.g. Organza with silk lining"
        />

        <Input
          label="Details for the designer"
          value={formData.details}
          onChangeText={(text) => onChange({ details: text })}
          placeholder={'e.g. Palla 63 in from shoulders. Add sleeve on the right side.'}
          multiline
        />

        <Input
          label={`Price (${formData.currency}) *`}
          value={formData.productPrice}
          onChangeText={(text) => onChange({ productPrice: text })}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Input
          label={`Deposit taken (${formData.currency})`}
          value={formData.depositAmount}
          onChangeText={(text) => onChange({ depositAmount: text })}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Designer picker modal (Android / large lists) */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose a designer</Text>
            {designers.map((designer) => {
              const isSelected = formData.designerId === designer.id;
              return (
                <Pressable
                  key={designer.id}
                  onPress={() => handleDesignerSelect(designer)}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                >
                  <View style={styles.modalOptionContent}>
                    <Text style={[styles.modalOptionName, isSelected && styles.modalOptionNameSelected]}>
                      {designer.name}
                    </Text>
                    <Text style={styles.modalOptionMeta}>
                      Usually {designer.averageLeadTimeDays} days
                    </Text>
                  </View>
                  {isSelected && (
                    <Icon name="check" size={18} color={Colors.primaryText} />
                  )}
                </Pressable>
              );
            })}
            <Pressable style={styles.modalCancel} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
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
    marginBottom: 8,
  },
  required: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.caption,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    minHeight: 50,
  },
  dropdownText: {
    ...Typography.body,
    color: Colors.primaryText,
  },
  dropdownPlaceholder: {
    color: Colors.placeholder,
  },
  designerMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: Colors.secondaryText,
    marginTop: 8,
  },
  timingNote: {
    marginTop: 4,
  },
  timingNoteUrgent: {
    marginTop: 4,
  },
  timingNoteLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.secondaryText,
  },
  timingNoteLabelUrgent: {
    color: Colors.urgent,
  },
  timingNoteText: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.secondaryText,
  },
  bottomPad: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.scrim,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 0,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 10.5,
    fontFamily: Fonts.sansMedium,
    color: Colors.tertiaryText,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  modalOptionSelected: {
    backgroundColor: Colors.sectionBackground,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionName: {
    fontFamily: Fonts.display,
    fontSize: 19,
    color: Colors.primaryText,
  },
  modalOptionNameSelected: {
    fontFamily: Fonts.displayMedium,
  },
  modalOptionMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.tertiaryText,
    marginTop: 1,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: 4,
  },
  modalCancelText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.secondaryText,
  },
});
