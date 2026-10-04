import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { resolveImageLink } from '@/utils/imageLink';
import { Icon } from '@/components/ui/Icon';

interface PhotoFieldProps {
  value: string;
  onChange: (uri: string) => void;
  label?: string;
  /** Square preview for logos; tall preview for garments. */
  square?: boolean;
}

// Photo of the piece, two ways in: pick one from the phone, or paste a link and the
// photo is pulled from it. Once set, it shows at list-row size with Replace and Remove.
export function PhotoField({ value, onChange, label = 'Photo of the piece', square }: PhotoFieldProps) {
  const [mode, setMode] = useState<'choose' | 'link'>('choose');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const upload = async () => {
    setMessage(null);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        onChange(res.assets[0].uri);
        setMode('choose');
      }
    } catch {
      setMessage('Couldn’t open your photos. Try again, or paste a link instead.');
    }
  };

  const fetchLink = async () => {
    if (!link.trim()) return;
    setBusy(true);
    setMessage(null);
    const result = await resolveImageLink(link);
    setBusy(false);
    if (result.ok) {
      onChange(result.uri);
      setLink('');
      setMode('choose');
    } else {
      setMessage(result.reason);
    }
  };

  if (value) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.preview}>
          <Image source={{ uri: value }} resizeMode={square ? 'contain' : 'cover'} style={[styles.previewImage, square && { height: 90 }]} />
          <View style={styles.previewActions}>
            <Pressable onPress={() => onChange('')} hitSlop={8} accessibilityRole="button">
              <Text style={styles.textAction}>Replace</Text>
            </Pressable>
            <Pressable onPress={() => onChange('')} hitSlop={8} accessibilityRole="button">
              <Text style={[styles.textAction, styles.textActionMuted]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}<Text style={styles.optional}>{'  Optional'}</Text>
      </Text>

      <View style={styles.choices}>
        <Pressable
          onPress={upload}
          style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
          accessibilityRole="button"
        >
          <Icon name="image" size={24} color={Colors.ink} />
          <Text style={styles.choiceText}>Upload photo</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setMessage(null);
            setMode(mode === 'link' ? 'choose' : 'link');
          }}
          style={({ pressed }) => [styles.choice, mode === 'link' && styles.choiceActive, pressed && styles.choicePressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'link' }}
        >
          <Icon name="link" size={24} color={Colors.ink} />
          <Text style={styles.choiceText}>Paste a link</Text>
        </Pressable>
      </View>

      {mode === 'link' && (
        <View style={styles.linkRow}>
          <TextInput
            value={link}
            onChangeText={setLink}
            onSubmitEditing={fetchLink}
            placeholder="https://"
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            autoFocus
            style={styles.linkInput}
          />
          <Pressable
            onPress={fetchLink}
            disabled={busy || !link.trim()}
            style={[styles.fetch, (busy || !link.trim()) && { opacity: 0.4 }]}
            accessibilityRole="button"
          >
            {busy ? <ActivityIndicator size="small" color={Colors.onInk} /> : <Text style={styles.fetchText}>Get photo</Text>}
          </Pressable>
        </View>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 24,
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
  choices: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    flex: 1,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.background,
  },
  choiceActive: {
    borderColor: Colors.ink,
  },
  choicePressed: {
    backgroundColor: Colors.mist,
  },
  choiceText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.primaryText,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  linkInput: {
    flex: 1,
    height: 50,
    ...Typography.callout,
    color: Colors.primaryText,
    borderWidth: 1,
    borderColor: Colors.ink,
    paddingHorizontal: 14,
    outlineStyle: 'none',
  } as object,
  fetch: {
    height: 50,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ink,
    minWidth: 104,
  },
  fetchText: {
    ...Typography.button,
    fontSize: 11.5,
    color: Colors.onInk,
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.secondaryText,
    marginTop: 10,
  },
  preview: {
    flexDirection: 'row',
    gap: 18,
  },
  previewImage: {
    width: 90,
    height: 120,
    backgroundColor: Colors.mist,
  },
  previewActions: {
    justifyContent: 'flex-end',
    gap: 12,
  },
  textAction: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.primaryText,
    textDecorationLine: 'underline',
  },
  textActionMuted: {
    color: Colors.secondaryText,
  },
});
