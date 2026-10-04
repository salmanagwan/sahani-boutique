import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CreateOrderFormData, Gender } from '@/types';
import { BorderRadius, Colors, Spacing, Typography, Fonts } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { getMeasurementFields } from '@/utils/helpers';
import { MeasureFigure } from '@/components/create-order/MeasureFigure';
import { withUnit } from '@/components/measure/figure';
import { WomenMeasureEntry } from '@/components/measure/WomenMeasureEntry';

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'girl', label: 'Girl' },
  { key: 'boy', label: 'Boy' },
];

interface MeasurementsStepProps {
  formData: CreateOrderFormData;
  onChange: (updates: Partial<CreateOrderFormData>) => void;
}

export function MeasurementsStep(props: MeasurementsStepProps) {
  // Women get the full measurement sheet, one measurement at a time.
  if (props.formData.gender === 'female') return <WomenMeasureEntry {...props} />;
  return <GeneralMeasurements {...props} />;
}

function GeneralMeasurements({ formData, onChange }: MeasurementsStepProps) {
  const fields = getMeasurementFields(formData.gender);
  // Which field is being typed in. The figure zooms to it; a short delay on blur stops it
  // springing back out when moving straight to the next field.
  const [focused, setFocused] = useState<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focus = (field: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(field);
  };
  const blur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setFocused(null), 160);
  };

  const unit = formData.measurementUnit;
  const display = Object.fromEntries(fields.map((f) => [f, withUnit(f, formData.measurements[f], unit)]));

  const updateMeasurement = (field: string, value: string) => {
    onChange({
      measurements: { ...formData.measurements, [field]: value },
    });
  };

  return (
    <View style={styles.container}>
      {/* Figure stays put above the fields: it zooms to the field in focus and shows values as they are typed */}
      <MeasureFigure fields={fields} values={display} focused={focused} height={210} />
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* Fitting, carried over from the Client step */}
      <Text style={styles.fitLabel}>
        Fitting for<Text style={styles.fitNote}>{'  From the client step'}</Text>
      </Text>
      <View style={styles.genderToggle}>
        {GENDERS.map((g) => {
          const isSelected = formData.gender === g.key;
          return (
            <Pressable
              key={g.key}
              onPress={() => onChange({ gender: g.key, measurements: {} })}
              style={[styles.genderBtn, isSelected && styles.genderBtnSelected]}
            >
              <Text style={[styles.genderBtnText, isSelected && styles.genderBtnTextSelected]}>
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Unit for every measurement */}
      <View style={styles.unitRow}>
        <Text style={[styles.fitLabel, { marginBottom: 0 }]}>Measured in</Text>
        <View style={styles.unitChips}>
          {(['cm', 'in'] as const).map((u) => (
            <Pressable
              key={u}
              onPress={() => onChange({ measurementUnit: u })}
              style={[styles.unitChip, unit === u && styles.unitChipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: unit === u }}
            >
              <Text style={[styles.unitText, unit === u && styles.unitTextOn]}>{u === 'cm' ? 'Centimetres' : 'Inches'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Measurement fields in 2-col grid */}
      <View style={styles.fieldsGrid}>
        {fields.map((field) => (
          <View key={field} style={styles.fieldCell}>
            <Input
              label={field}
              value={formData.measurements[field] ?? ''}
              onChangeText={(text) => updateMeasurement(field, text)}
              placeholder=""
              keyboardType="decimal-pad"
              onFocus={() => focus(field)}
              onBlur={blur}
              style={{ paddingRight: 34 }}
            />
            <Text style={styles.suffix} pointerEvents="none">
              {field === 'Age' ? 'yrs' : unit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fitLabel: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginBottom: 10,
  },
  fitNote: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.caption,
  },
  container: {
    flex: 1,
  },
  guideImage: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.md,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
  },
  genderToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 22,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.border,
  },
  // Segmented control: the chosen side sits on the soft square used by the tab bar.
  genderBtnSelected: {
    backgroundColor: '#EFEDE8',
  },
  genderBtnText: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontFamily: Fonts.sans,
  },
  genderBtnTextSelected: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansMedium,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    marginHorizontal: -Spacing.xs,
  },
  fieldCell: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
  },
  // Unit shown at the right end of each field.
  suffix: {
    position: 'absolute',
    right: Spacing.xs + 2,
    top: 36,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.caption,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  unitChips: {
    flexDirection: 'row',
    gap: 6,
  },
  unitChip: {
    height: 32,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  unitChipOn: {
    borderColor: Colors.ink,
  },
  unitText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
  unitTextOn: {
    fontFamily: Fonts.sansMedium,
    color: Colors.ink,
  },
  bottomPad: {
    height: 40,
  },
});
