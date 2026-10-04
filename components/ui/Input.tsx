import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Icon } from '@/components/ui/Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, style, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const required = label?.trim().endsWith('*');
  const cleanLabel = required ? label!.replace(/\s*\*$/, '') : label;
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {cleanLabel}
          {required ? <Text style={styles.required}>{'  Required'}</Text> : null}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          props.multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.placeholder}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search orders...',
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.searchContainer, style]}>
      <Icon name="search" size={20} color={Colors.secondaryText} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.secondaryText}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Icon name="clear" size={20} color={Colors.secondaryText} />
        </Pressable>
      )}
    </View>
  );
}

interface DatePickerFieldProps {
  value: string;
  onChange: (dateString: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  /** Short date ("28 Nov 2026") for half-width fields. */
  compact?: boolean;
  /** Tells the parent when the calendar opens, e.g. to give it the full row. */
  onOpenChange?: (open: boolean) => void;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  compact,
  onOpenChange,
}: DatePickerFieldProps) {
  const [show, setShowState] = useState(false);
  const setShow = (v: boolean) => {
    setShowState(v);
    onOpenChange?.(v);
  };
  const [displayMonth, setDisplayMonth] = useState(value ? parseISO(value) : new Date());
  const date = value ? parseISO(value) : new Date();

  const selectDate = (selected: Date) => {
    onChange(format(selected, 'yyyy-MM-dd'));
    if (Platform.OS === 'web') setShow(false);
  };

  return (
    <View style={styles.dateWrapper}>
      <Pressable onPress={() => setShow(true)} style={styles.dateButton}>
        <Text style={[styles.dateText, !value && styles.datePlaceholder]}>
          {value ? format(date, compact ? 'd MMM yyyy' : 'EEE d MMMM yyyy') : placeholder}
        </Text>
        <Icon name="calendar" size={18} color={Colors.tertiaryText} />
      </Pressable>
      {show && Platform.OS === 'web' && (
        <WebCalendar
          month={displayMonth}
          selectedDate={value ? parseISO(value) : undefined}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChangeMonth={setDisplayMonth}
          onSelect={selectDate}
        />
      )}
      {show && Platform.OS !== 'web' && (
        <View style={styles.calendarPanel}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_, selected) => {
              if (selected) selectDate(selected);
              if (Platform.OS === 'android') setShow(false);
            }}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setShow(false)} style={styles.calendarDone}>
              <Text style={styles.calendarDoneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function WebCalendar({
  month,
  selectedDate,
  minimumDate,
  maximumDate,
  onChangeMonth,
  onSelect,
}: {
  month: Date;
  selectedDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChangeMonth: (date: Date) => void;
  onSelect: (date: Date) => void;
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const today = startOfDay(new Date());

  const isDisabled = (day: Date) =>
    (minimumDate && isBefore(day, startOfDay(minimumDate))) ||
    (maximumDate && isBefore(startOfDay(maximumDate), day));

  return (
    <View style={styles.calendarPanel}>
      <View style={styles.calendarHeader}>
        <Pressable onPress={() => onChangeMonth(subMonths(month, 1))} style={styles.monthControl}>
          <Text style={styles.monthControlText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{format(month, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => onChangeMonth(addMonths(month, 1))} style={styles.monthControl}>
          <Text style={styles.monthControlText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekDay}>{day}</Text>
        ))}
      </View>
      <View style={styles.dayGrid}>
        {days.map((day) => {
          const selected = selectedDate && isSameDay(day, selectedDate);
          const muted = !isSameMonth(day, month);
          const disabled = Boolean(isDisabled(day));
          return (
            <Pressable
              key={day.toISOString()}
              disabled={disabled}
              onPress={() => onSelect(day)}
              style={[
                styles.dayButton,
                selected && styles.dayButtonSelected,
                isSameDay(day, today) && !selected && styles.dayButtonToday,
              ]}
            >
              <Text style={[
                styles.dayText,
                muted && styles.dayTextMuted,
                disabled && styles.dayTextDisabled,
                selected && styles.dayTextSelected,
              ]}>
                {format(day, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
  input: {
    ...Typography.body,
    color: Colors.primaryText,
    backgroundColor: Colors.background,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    minHeight: 50,
    outlineStyle: 'none',
  } as object,
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: Colors.ink,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    ...Typography.caption1,
    color: Colors.error,
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    paddingHorizontal: 14,
    height: 46,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.subhead,
    color: Colors.primaryText,
    outlineStyle: 'none',
  } as object,
  dateWrapper: {
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    backgroundColor: Colors.background,
  },
  dateText: {
    ...Typography.body,
    color: Colors.primaryText,
  },
  datePlaceholder: {
    color: Colors.placeholder,
  },
  calendarPanel: {
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    backgroundColor: Colors.surface,
  },
  calendarDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  calendarDoneText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.primaryText,
    fontSize: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  monthControl: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthControlText: {
    fontFamily: Fonts.sansLight,
    fontSize: 26,
    lineHeight: 28,
    color: Colors.primaryText,
  },
  monthTitle: {
    fontFamily: Fonts.display,
    fontSize: 18,
    color: Colors.primaryText,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  weekDay: {
    width: '14.2857%',
    textAlign: 'center',
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.tertiaryText,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayButton: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  dayButtonToday: {
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  dayButtonSelected: {
    backgroundColor: Colors.ink,
  },
  dayText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.primaryText,
  },
  dayTextMuted: {
    color: Colors.tertiaryText,
  },
  dayTextDisabled: {
    color: Colors.border,
  },
  dayTextSelected: {
    fontFamily: Fonts.sansMedium,
    color: Colors.onInk,
  },
});
