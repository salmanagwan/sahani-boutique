import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authStyles, AuthScreen, FooterPrompt, Notice, PasswordInput, TextLink } from '@/components/auth/AuthUI';
import { isEmail, normaliseEmail, useAuth } from '@/context/AuthContext';

export default function LogInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; notice?: string }>();
  const { logIn } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!isEmail(email)) {
      setEmailError('Enter the email you signed up with.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    const res = logIn(email, password);
    if (res.ok) return; // the app opens on its own
    if (res.needsVerify) {
      router.push({ pathname: '/verify', params: { email: normaliseEmail(email) } });
      return;
    }
    setError(res.error);
  };

  const sendLink = () => {
    setError(null);
    if (!isEmail(email)) {
      setEmailError('Enter your email first, then tap the button again.');
      return;
    }
    router.push({ pathname: '/check-email', params: { email: normaliseEmail(email), kind: 'link' } });
  };

  return (
    <AuthScreen
      title="Log in"
      intro="Welcome back."
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
      footer={<FooterPrompt text="New to Sahani?" action="Start free trial" onPress={() => router.replace('/sign-up')} />}
    >
      <Notice text={params.notice ?? null} tone="info" />
      <Input
        label="Email"
        placeholder="you@yourboutique.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setEmailError(undefined);
        }}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />
      <PasswordInput label="Password" value={password} onChangeText={setPassword} autoComplete="current-password" onSubmitEditing={submit} />
      <View style={{ marginTop: -8, marginBottom: 22 }}>
        <TextLink
          title="Forgot password?"
          onPress={() => router.push({ pathname: '/forgot-password', params: email ? { email } : {} })}
        />
      </View>
      <Notice text={error} />
      <Button title="Log in" onPress={submit} />
      <View style={authStyles.or}>
        <View style={authStyles.orLine} />
        <Text style={authStyles.orText}>or</Text>
        <View style={authStyles.orLine} />
      </View>
      <Button title="Email me a login link" variant="secondary" onPress={sendLink} />
    </AuthScreen>
  );
}
