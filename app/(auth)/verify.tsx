import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AuthScreen, CodeInput, Notice, PreviewNote, TextLink } from '@/components/auth/AuthUI';
import { useAuth } from '@/context/AuthContext';
import { Fonts } from '@/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = (value = code) => {
    setInfo(null);
    const res = verifyEmail(email, value);
    if (!res.ok) setError(res.error);
    // On success the session starts and the app opens on its own.
  };

  return (
    <AuthScreen
      title="Check your email"
      intro={
        <>
          We sent a 6-digit code to <Text style={{ fontFamily: Fonts.sansMedium, color: '#000' }}>{email}</Text>. Enter it below to start your trial.
        </>
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/sign-up'))}
    >
      <CodeInput
        value={code}
        error={Boolean(error)}
        onChange={(v) => {
          setCode(v);
          setError(null);
          if (v.length === 6) submit(v);
        }}
      />
      <Notice text={error} />
      <Notice text={info} tone="info" />
      <Button title="Verify and start trial" onPress={() => submit()} disabled={code.length < 6} />
      <View style={{ marginTop: 20 }}>
      <TextLink
        title="Send a new code"
        align="center"
        onPress={() => {
          setCode('');
          setError(null);
          setInfo(`We sent a new code to ${email}.`);
        }}
      />
      </View>
      <PreviewNote text="No email is sent yet. Any 6 digits will verify the account." />
    </AuthScreen>
  );
}
