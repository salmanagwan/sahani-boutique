import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CreateOrderFormData } from '@/types';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { FigureView } from '@/components/measure/FigureView';
import { buildCroquis, CROQUIS_GUIDES, CROQUIS_VIEW, TEXT_FIELDS, WOMEN_FIELDS } from '@/components/measure/croquis';
import { withUnit } from '@/components/measure/figure';
import { useVisualViewport } from '@/utils/useVisualViewport';
import { Icon } from '@/components/ui/Icon';
import { PhotoField } from '@/components/create-order/PhotoField';

interface Props {
  formData: CreateOrderFormData;
  onChange: (updates: Partial<CreateOrderFormData>) => void;
}

const VIEW = { x: 0, w: CROQUIS_VIEW.w, h: CROQUIS_VIEW.h };

// The frame here is short, so zoom in further than the guide's own level; long lines
// (dress, skirt) still get at least 2.4x, centred on their middle.
function zoomFor(field: string) {
  const f = CROQUIS_GUIDES[field].focus;
  return { cx: f.cx, cy: f.cy, s: Math.max(f.s * 1.8, 2.4) };
}

// The figure sits at the top, kept short. Below it every measurement is a field, two to
// a row, in the sheet's order. Typing in a field zooms the figure to where it is taken.
export function WomenMeasureEntry({ formData, onChange }: Props) {
  const values = formData.measurements;
  const unit = formData.measurementUnit;
  const [focused, setFocused] = useState<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // While the keyboard is up, the figure and the fields share the space above it.
  const { keyboardOpen } = useVisualViewport();
  const scrollRef = useRef<ScrollView>(null);
  const gridY = useRef(0);
  const cellY = useRef<Record<string, number>>({});
  // Bring the field being typed in to the top of the field area, clear of the keyboard.
  const reveal = (f: string) => {
    const y = gridY.current + (cellY.current[f] ?? 0) - 8;
    setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true }), 120);
  };

  const custom = formData.customMeasurements;
  const fields = useMemo(() => [...WOMEN_FIELDS, ...custom], [custom]);
  const display = useMemo(
    () => Object.fromEntries(fields.map((f) => [f, withUnit(f, values[f], unit)])),
    [fields, values, unit]
  );
  // "Add more": a name and a value, added to the end of the list.
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const addMeasurement = () => {
    const name = newName.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const exists = fields.some((f) => f.toLowerCase() === name.toLowerCase());
    onChange({
      customMeasurements: exists ? custom : [...custom, name],
      measurements: { ...values, [name]: newValue.trim() },
    });
    setNewName('');
    setNewValue('');
    setAdding(false);
  };
  const removeMeasurement = (name: string) => {
    const next = { ...values };
    delete next[name];
    onChange({ customMeasurements: custom.filter((c) => c !== name), measurements: next });
  };
  const nodes = useMemo(
    () => buildCroquis({ values: display, active: focused, labelActive: false }),
    [display, focused]
  );
  const taken = fields.filter((f) => values[f]?.trim()).length;

  const set = (f: string, v: string) => onChange({ measurements: { ...values, [f]: v } });
  const focus = (f: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(f);
  };
  const blur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setFocused(null), 200);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.figure, keyboardOpen && styles.figureTyping]}>
        <FigureView
          nodes={nodes}
          view={VIEW}
          focus={focused && CROQUIS_GUIDES[focused] ? zoomFor(focused) : null}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.caption}>
          {focused ? (
            <>
              <Text style={styles.captionName}>{focused.toUpperCase()}</Text>
              {display[focused] ? `   ${display[focused]}` : ''}
            </>
          ) : (
            `${taken} of ${fields.length} taken`
          )}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.unitRow}>
          <Text style={styles.label}>Measured in</Text>
          <View style={styles.units}>
            {(['in', 'cm'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => onChange({ measurementUnit: u })}
                style={[styles.unit, unit === u && styles.unitOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: unit === u }}
              >
                <Text style={[styles.unitText, unit === u && styles.unitTextOn]}>{u === 'in' ? 'Inches' : 'Centimetres'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.grid} onLayout={(e) => (gridY.current = e.nativeEvent.layout.y)}>
          {fields.map((f) => {
            const text = TEXT_FIELDS[f];
            const on = focused === f;
            const isCustom = custom.includes(f);
            return (
              <View key={f} style={styles.cell} onLayout={(e) => (cellY.current[f] = e.nativeEvent.layout.y)}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { flex: 1 }, on && { color: Colors.ink }]} numberOfLines={1}>
                    {f}
                  </Text>
                  {isCustom ? (
                    <Pressable onPress={() => removeMeasurement(f)} hitSlop={8} accessibilityLabel={`Remove ${f}`}>
                      <Icon name="close" size={14} color={Colors.caption} />
                    </Pressable>
                  ) : null}
                </View>
                {text?.choices ? (
                  <View style={styles.choices}>
                    {text.choices.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => {
                          focus(f);
                          set(f, values[f] === c ? '' : c);
                          blur();
                        }}
                        style={[styles.choice, values[f] === c && styles.choiceOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: values[f] === c }}
                      >
                        <Text style={[styles.choiceText, values[f] === c && styles.choiceTextOn]}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <View style={[styles.box, on && styles.boxOn]}>
                    <TextInput
                      value={values[f] ?? ''}
                      onChangeText={(v) => set(f, v)}
                      onFocus={() => {
                        focus(f);
                        reveal(f);
                      }}
                      onBlur={blur}
                      placeholder=""
                      placeholderTextColor={Colors.placeholder}
                      keyboardType={text ? 'default' : 'decimal-pad'}
                      style={styles.input}
                    />
                    <Text style={styles.suffix}>{unit}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Add more: name the measurement, give its value */}
        {adding ? (
          <View style={styles.addBox}>
            <Text style={styles.label}>New measurement</Text>
            <View style={styles.addRow}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Name, e.g. Shoulder to waist"
                placeholderTextColor={Colors.placeholder}
                autoFocus
                style={[styles.box, styles.addName, styles.inputBare]}
              />
              <View style={[styles.box, styles.addValue]}>
                <TextInput
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder=""
                  keyboardType="decimal-pad"
                  onSubmitEditing={addMeasurement}
                  style={styles.input}
                />
                <Text style={styles.suffix}>{unit}</Text>
              </View>
            </View>
            <View style={styles.addActions}>
              <Pressable onPress={() => setAdding(false)} style={styles.textBtn} hitSlop={8}>
                <Text style={styles.textBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={addMeasurement}
                disabled={!newName.trim()}
                style={[styles.addBtn, !newName.trim() && { opacity: 0.35 }]}
                accessibilityRole="button"
              >
                <Text style={styles.addBtnText}>Add to list</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)} style={styles.addMore} accessibilityRole="button">
            <Icon name="plus" size={18} />
            <Text style={styles.addMoreText}>Add more</Text>
          </Pressable>
        )}

        {/* Special request: describe it, and/or add a sketch or reference */}
        <View style={styles.special}>
          <Text style={styles.specialTitle}>Special request</Text>
          <Text style={styles.specialHint}>Describe what you want, add a sketch or a reference picture, or both.</Text>
          <TextInput
            value={formData.specialRequest}
            onChangeText={(t) => onChange({ specialRequest: t })}
            placeholder="e.g. Deep back with tassels, sleeve only on the right"
            placeholderTextColor={Colors.placeholder}
            multiline
            style={styles.specialInput}
          />
          <PhotoField
            label="Sketch or reference"
            value={formData.specialImageUri}
            onChange={(uri) => onChange({ specialImageUri: uri })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    marginTop: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BDBDBD',
  },
  addMoreText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  addBox: {
    marginTop: 18,
    padding: 14,
    backgroundColor: Colors.mist,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addName: {
    flex: 1.6,
    backgroundColor: Colors.background,
  },
  addValue: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inputBare: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.ink,
    outlineStyle: 'none',
  } as object,
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 18,
    marginTop: 12,
  },
  textBtn: {},
  textBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  addBtn: {
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: Colors.ink,
  },
  addBtnText: {
    ...Typography.button,
    fontSize: 11.5,
    color: Colors.onInk,
  },
  special: {
    marginTop: 32,
    paddingTop: 22,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  specialTitle: {
    fontFamily: Fonts.product,
    fontSize: 20,
    color: Colors.ink,
  },
  specialHint: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.caption,
    marginTop: 4,
    marginBottom: 12,
  },
  specialInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.ink,
    textAlignVertical: 'top',
    marginBottom: 18,
    outlineStyle: 'none',
  } as object,
  wrap: {
    flex: 1,
    marginHorizontal: -20,
    marginTop: -22,
  },
  figure: {
    height: 210,
    backgroundColor: Colors.mist,
  },
  // Keyboard up: the figure takes about two-fifths of what's left, the fields the rest.
  figureTyping: {
    height: undefined,
    flex: 0.8,
    minHeight: 120,
  },
  caption: {
    position: 'absolute',
    left: 16,
    bottom: 10,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  captionName: {
    ...Typography.house,
    color: Colors.ink,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  units: {
    flexDirection: 'row',
    gap: 8,
  },
  unit: {
    height: 34,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
  },
  unitOn: {
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 16,
  },
  cell: {
    width: '47.5%',
    flexGrow: 1,
  },
  label: {
    ...Typography.label,
    fontSize: 10.5,
    letterSpacing: 1,
    color: Colors.secondaryText,
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    paddingHorizontal: 12,
  },
  boxOn: {
    borderColor: Colors.ink,
  },
  input: {
    flex: 1,
    minWidth: 0,
    width: 0,
    height: 46,
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.ink,
    padding: 0,
    outlineStyle: 'none',
  } as object,
  suffix: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.caption,
    marginLeft: 6,
  },
  choices: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
  },
  choiceOn: {
    borderColor: Colors.ink,
  },
  choiceText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.secondaryText,
  },
  choiceTextOn: {
    fontFamily: Fonts.sansMedium,
    color: Colors.ink,
  },
});
