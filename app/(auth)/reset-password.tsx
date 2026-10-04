import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AuthScreen, Notice, PasswordInput } from '@/components/auth/AuthUI';
import { PASSWORD_MIN, useAuth } from '@/context/AuthContext';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);

  const submit = () => {
    if (password.length < PASSWORD_MIN) {
      setError(`Use at least ${PASSWORD_MIN} characters.`);
      return;
    }
    const res = resetPassword(email, password);
    if (!res.ok) {
      setNotice(res.error);
      return;
    }
    router.replace({ pathname: '/log-in', params: { email, notice: 'Password changed. Log in with your new password.' } });
  };

  return (
    <AuthScreen
      title="Set a new password"
      intro={`For ${email}.`}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/log-in'))}
    >
      <PasswordInput
        label="New password"
        hint={`At least ${PASSWORD_MIN} characters`}
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(undefined);
        }}
        error={error}
        autoComplete="new-password"
        onSubmitEditing={submit}
        autoFocus
      />
      <Notice text={notice} />
      <Button title="Save new password" onPress={submit} style={{ marginTop: 8 }} />
    </AuthScreen>
  );
}
