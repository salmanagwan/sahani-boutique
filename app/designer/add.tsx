import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhotoField } from '@/components/create-order/PhotoField';
import { EmojiPicker, HOUSE_EMOJIS } from '@/components/designers/DesignerCard';

// Read-only after the trial ends: adding goes to the plans screen instead.
export default function AddDesignerScreen() {
  const { locked } = useAuth();
  if (locked) return <Redirect href={{ pathname: '/account/plans', params: { locked: '1' } }} />;
  return <AddDesignerScreenInner />;
}

function AddDesignerScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addDesigner } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [leadTime, setLeadTime] = useState('45');
  const [photoUri, setPhotoUri] = useState('');
  const [emoji, setEmoji] = useState(() => HOUSE_EMOJIS[Math.floor(Math.random() * HOUSE_EMOJIS.length)]);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !country.trim()) {
      setNotice('Add a name, an email and a country to save.');
      return;
    }

    const designer = addDesigner({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      averageLeadTimeDays: parseInt(leadTime, 10) || 45,
      photoUri: photoUri || undefined,
      emoji,
    });

    if (Platform.OS === 'web') {
      router.back();
      return;
    }
    Alert.alert('Designer added', `${designer.name} is now in your list.`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="New designer" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add a house</Text>
        <Text style={styles.intro}>Orders are emailed to the address you enter here.</Text>
        <Text style={styles.pickLabel}>Emoji</Text>
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <View style={{ height: 22 }} />
        <PhotoField label="Photo or logo" square value={photoUri} onChange={setPhotoUri} />
        <Input
          label="Designer or house name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Manish Malhotra"
          autoCapitalize="words"
        />
        <Input
          label="Orders email *"
          value={email}
          onChangeText={setEmail}
          placeholder="orders@designer.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+44 or +91..."
          keyboardType="phone-pad"
        />
        <Input
          label="Country *"
          value={country}
          onChangeText={setCountry}
          placeholder="e.g. India, United Kingdom"
          autoCapitalize="words"
        />
        <Input
          label="Usual making time, in days"
          value={leadTime}
          onChangeText={setLeadTime}
          placeholder="45"
          keyboardType="number-pad"
        />

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Button title="Save designer" onPress={handleSave} style={styles.saveButton} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pickLabel: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 24,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: Colors.primaryText,
  },
  intro: {
    ...Typography.subhead,
    color: Colors.secondaryText,
    marginTop: 6,
    marginBottom: 24,
  },
  notice: {
    ...Typography.footnote,
    color: Colors.error,
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 8,
  },
});
