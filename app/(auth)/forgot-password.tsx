import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthScreen } from '@/components/auth/AuthUI';
import { isEmail, normaliseEmail } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();

  const submit = () => {
    if (!isEmail(email)) {
      setError('Enter the email you signed up with.');
      return;
    }
    router.push({ pathname: '/check-email', params: { email: normaliseEmail(email), kind: 'reset' } });
  };

  return (
    <AuthScreen
      title="Reset your password"
      intro="Enter your work email. We will send you a link to set a new password."
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/log-in'))}
    >
      <Input
        label="Email"
        placeholder="you@yourboutique.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setError(undefined);
        }}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        onSubmitEditing={submit}
        autoFocus
      />
      <Button title="Send reset link" onPress={submit} style={{ marginTop: 8 }} />
    </AuthScreen>
  );
}
