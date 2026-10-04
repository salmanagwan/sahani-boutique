// Shared pieces for the welcome and sign-in screens: page frame, password field, code boxes,
// text links and the preview note. Same language as the app: Tenor Sans titles, Work Sans
// text, black on white, boxed square fields.
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

export function AuthScreen({
  title,
  intro,
  onBack,
  children,
  footer,
}: {
  title: string;
  intro?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bar}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.back} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
              <Icon name="back" size={22} color={Colors.ink} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Small underlined text button, for "Forgot password?" and the like. */
export function TextLink({ title, onPress, align = 'left' }: { title: string; onPress: () => void; align?: 'left' | 'center' | 'right' }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [{ alignSelf: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.link}>{title}</Text>
    </Pressable>
  );
}

/** A line of grey text with a link at the end: "Already have an account? Log in". */
export function FooterPrompt({ text, action, onPress }: { text: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.promptRow}>
      <Text style={styles.promptText}>{text} </Text>
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
        <Text style={styles.link}>{action}</Text>
      </Pressable>
    </View>
  );
}

/** Message box above the button: errors in red, confirmations in black. */
export function Notice({ text, tone = 'error' }: { text: string | null; tone?: 'error' | 'info' }) {
  if (!text) return null;
  return (
    <View style={[styles.notice, tone === 'error' ? styles.noticeError : styles.noticeInfo]} accessibilityLiveRegion="polite">
      <Text style={[styles.noticeText, tone === 'error' && { color: Colors.error }]}>{text}</Text>
    </View>
  );
}

/** Stands in for the inbox until real emails are sent. Says so plainly. */
export function PreviewNote({ text, action, onPress }: { text: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.preview}>
      <Text style={styles.previewLabel}>PREVIEW</Text>
      <Text style={styles.previewText}>{text}</Text>
      {action && onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.previewBtn, pressed && { opacity: 0.7 }]} accessibilityRole="button">
          <Text style={styles.previewBtnText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Password field with a show / hide eye inside the box. */
export function PasswordInput({
  label,
  hint,
  error,
  value,
  onChangeText,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  const [shown, setShown] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.boxFocused, error && styles.boxError]}>
        <TextInput
          style={styles.boxInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!shown}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={Colors.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        <Pressable
          onPress={() => setShown((s) => !s)}
          style={styles.eye}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={shown ? 'Hide password' : 'Show password'}
        >
          <Icon name={shown ? 'eyeSlash' : 'eye'} size={20} color={Colors.secondaryText} />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

/** Six square boxes for the email code. One hidden input sits on top so paste and autofill work. */
export function CodeInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.split('');
  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.codeWrap} accessibilityLabel="6-digit code">
      <View style={styles.codeRow}>
        {Array.from({ length: 6 }).map((_, i) => {
          const active = focused && (i === digits.length || (i === 5 && digits.length === 6));
          return (
            <View key={i} style={[styles.codeBox, active && styles.boxFocused, error && styles.boxError]}>
              <Text style={styles.codeDigit}>{digits[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.codeHidden}
        caretHidden
      />
    </Pressable>
  );
}

export const authStyles = StyleSheet.create({
  gapButton: { marginTop: 8 },
  or: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.hairline },
  orText: { ...Typography.caption1, color: Colors.caption },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.gutter + 4,
  },
  bar: { height: 44, justifyContent: 'center', marginBottom: 18 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  title: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.ink,
  },
  intro: {
    ...Typography.callout,
    color: Colors.secondaryText,
    marginTop: 10,
  },
  body: { marginTop: 30 },
  footer: { marginTop: 'auto', paddingTop: 28, alignItems: 'center' },
  link: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.ink,
    textDecorationLine: 'underline',
  },
  promptRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  promptText: { ...Typography.subhead, color: Colors.secondaryText },
  notice: { paddingVertical: 12, paddingHorizontal: 14, marginBottom: 16, borderLeftWidth: 2 },
  noticeError: { backgroundColor: '#F8EFEE', borderLeftColor: Colors.error },
  noticeInfo: { backgroundColor: Colors.mist, borderLeftColor: Colors.ink },
  noticeText: { ...Typography.subhead, color: Colors.ink },
  preview: {
    marginTop: 28,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.champagne,
  },
  previewLabel: { ...Typography.house, color: Colors.caption, fontSize: 10, letterSpacing: 1.6 },
  previewText: { ...Typography.footnote, color: Colors.secondaryText, marginTop: 4 },
  previewBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  previewBtnText: { ...Typography.button, fontSize: 11, color: Colors.ink },
  field: { marginBottom: 20 },
  label: { ...Typography.label, color: Colors.secondaryText, marginBottom: 8 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    minHeight: 50,
    backgroundColor: Colors.background,
  },
  boxFocused: { borderColor: Colors.ink },
  boxError: { borderColor: Colors.error },
  boxInput: {
    ...Typography.body,
    flex: 1,
    color: Colors.primaryText,
    paddingHorizontal: 14,
    paddingVertical: 12,
    outlineStyle: 'none',
  } as object,
  eye: { width: 46, height: 48, alignItems: 'center', justifyContent: 'center' },
  hint: { ...Typography.caption1, color: Colors.caption, marginTop: 6 },
  error: { ...Typography.caption1, color: Colors.error, marginTop: 6 },
  codeWrap: { marginBottom: 20 },
  codeRow: { flexDirection: 'row', gap: 8 },
  codeBox: {
    flex: 1,
    aspectRatio: 0.86,
    maxHeight: 64,
    borderWidth: 1,
    borderColor: Colors.fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDigit: { fontFamily: Fonts.display, fontSize: 26, color: Colors.ink },
  codeHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
    fontSize: 16,
  },
});
