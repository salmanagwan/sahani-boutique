import React, { useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthScreen, Notice, PreviewNote, TextLink } from '@/components/auth/AuthUI';
import { useAuth } from '@/context/AuthContext';
import { Fonts } from '@/constants/theme';

// Shown after asking for a login link or a password reset link.
export default function CheckEmailScreen() {
  const router = useRouter();
  const { email = '', kind = 'link' } = useLocalSearchParams<{ email: string; kind: 'link' | 'reset' }>();
  const { openLoginLink } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const reset = kind === 'reset';

  const openLink = () => {
    setError(null);
    if (reset) {
      router.push({ pathname: '/reset-password', params: { email } });
      return;
    }
    const res = openLoginLink(email);
    if (!res.ok) setError(res.error);
  };

  return (
    <AuthScreen
      title="Check your email"
      intro={
        <>
          If there is an account for <Text style={{ fontFamily: Fonts.sansMedium, color: '#000' }}>{email}</Text>, we have sent{' '}
          {reset ? 'a link to set a new password.' : 'a link that logs you in.'} Open it on this device.
        </>
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/log-in'))}
    >
      <Notice text={error} />
      <Notice text={info} tone="info" />
      <TextLink title="Send it again" onPress={() => setInfo(`We sent another link to ${email}.`)} />
      <PreviewNote
        text={reset ? 'No email is sent yet. Open the reset link here instead.' : 'No email is sent yet. Open the login link here instead.'}
        action={reset ? 'Open reset link' : 'Open login link'}
        onPress={openLink}
      />
    </AuthScreen>
  );
}
