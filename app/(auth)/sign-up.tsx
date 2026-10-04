import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthScreen, FooterPrompt, Notice, PasswordInput } from '@/components/auth/AuthUI';
import { isEmail, normaliseEmail, PASSWORD_MIN, TRIAL_DAYS, useAuth } from '@/context/AuthContext';

type Field = 'boutique' | 'name' | 'email' | 'password';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ boutique: '', name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const set = (key: Field) => (t: string) => {
    setForm((f) => ({ ...f, [key]: t }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!form.boutique.trim()) next.boutique = 'Add your boutique name.';
    if (!form.name.trim()) next.name = 'Add your name.';
    if (!isEmail(form.email)) next.email = 'Enter an email like you@yourboutique.com.';
    if (form.password.length < PASSWORD_MIN) next.password = `Use at least ${PASSWORD_MIN} characters.`;
    setErrors(next);
    setNotice(null);
    if (Object.keys(next).length) return;
    const res = signUp(form);
    if (!res.ok) {
      setNotice(res.error);
      return;
    }
    router.push({ pathname: '/verify', params: { email: normaliseEmail(form.email) } });
  };

  return (
    <AuthScreen
      title="Start your free trial"
      intro={`${TRIAL_DAYS} days free. No card needed. Your orders stay yours if you stop.`}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
      footer={<FooterPrompt text="Already have an account?" action="Log in" onPress={() => router.replace('/log-in')} />}
    >
      <Input label="Boutique name" placeholder="Sahani Boutique" value={form.boutique} onChangeText={set('boutique')} error={errors.boutique} autoComplete="organization" />
      <Input label="Your name" placeholder="Ayesha Sahani" value={form.name} onChangeText={set('name')} error={errors.name} autoComplete="name" />
      <Input
        label="Work email"
        placeholder="you@yourboutique.com"
        value={form.email}
        onChangeText={set('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />
      <PasswordInput
        label="Password"
        hint={`At least ${PASSWORD_MIN} characters`}
        value={form.password}
        onChangeText={set('password')}
        error={errors.password}
        autoComplete="new-password"
        onSubmitEditing={submit}
      />
      <Notice text={notice} />
      <Button title="Create account" onPress={submit} style={{ marginTop: 8 }} />
    </AuthScreen>
  );
}
