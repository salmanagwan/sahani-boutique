// Sign-in for the preview. Nothing here talks to a server yet: accounts and the session are
// kept in this browser (localStorage on web, memory on a phone), so the flow can be tried on
// the preview link. When Supabase is set up, these functions are what get swapped for real calls.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export const TRIAL_DAYS = 15;
const DAY = 24 * 60 * 60 * 1000;
const STORE_KEY = 'sahani.v2.auth';

export interface Account {
  email: string;
  name: string;
  boutique: string;
  /** Preview only. The real backend never stores a password like this. */
  password: string;
  verified: boolean;
  /** ISO time the email was verified and the trial began. */
  trialStartedAt?: string;
}

interface Stored {
  accounts: Record<string, Account>;
  session: string | null;
}

export type Result = { ok: true } | { ok: false; error: string; needsVerify?: boolean };

interface AuthValue {
  account: Account | null;
  trialDaysLeft: number;
  signUp: (input: { boutique: string; name: string; email: string; password: string }) => Result;
  verifyEmail: (email: string, code: string) => Result;
  logIn: (email: string, password: string) => Result;
  /** Opens the emailed login link (preview stands in for the inbox). */
  openLoginLink: (email: string) => Result;
  resetPassword: (email: string, password: string) => Result;
  logOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

const empty: Stored = { accounts: {}, session: null };

function load(): Stored {
  if (Platform.OS !== 'web') return empty;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Stored;
    return { accounts: parsed.accounts ?? {}, session: parsed.session ?? null };
  } catch {
    return empty;
  }
}

function save(data: Stored) {
  if (Platform.OS !== 'web') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {
    // Private browsing can block storage. The flow still works until the page is closed.
  }
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
export const PASSWORD_MIN = 8;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Stored>(load);

  const update = useCallback((next: Stored) => {
    setData(next);
    save(next);
  }, []);

  const signUp: AuthValue['signUp'] = useCallback(
    ({ boutique, name, email, password }) => {
      const key = normaliseEmail(email);
      const existing = data.accounts[key];
      if (existing?.verified) {
        return { ok: false, error: 'There is already an account with this email. Log in instead.' };
      }
      update({
        ...data,
        accounts: {
          ...data.accounts,
          [key]: { email: key, name: name.trim(), boutique: boutique.trim(), password, verified: false },
        },
      });
      return { ok: true };
    },
    [data, update]
  );

  const verifyEmail: AuthValue['verifyEmail'] = useCallback(
    (email, code) => {
      const key = normaliseEmail(email);
      const acc = data.accounts[key];
      if (!acc) return { ok: false, error: 'We could not find this sign up. Please start again.' };
      if (!/^\d{6}$/.test(code)) return { ok: false, error: 'Enter the 6-digit code from the email.' };
      const verified: Account = {
        ...acc,
        verified: true,
        trialStartedAt: acc.trialStartedAt ?? new Date().toISOString(),
      };
      update({ accounts: { ...data.accounts, [key]: verified }, session: key });
      return { ok: true };
    },
    [data, update]
  );

  const logIn: AuthValue['logIn'] = useCallback(
    (email, password) => {
      const key = normaliseEmail(email);
      const acc = data.accounts[key];
      if (!acc || acc.password !== password) {
        return { ok: false, error: 'That email and password do not match. Try again or reset your password.' };
      }
      if (!acc.verified) {
        return { ok: false, needsVerify: true, error: 'Verify your email to finish signing up.' };
      }
      update({ ...data, session: key });
      return { ok: true };
    },
    [data, update]
  );

  const openLoginLink: AuthValue['openLoginLink'] = useCallback(
    (email) => {
      const key = normaliseEmail(email);
      const acc = data.accounts[key];
      if (!acc || !acc.verified) {
        return { ok: false, error: 'No account uses this email, so no link was sent. Check the spelling or start a free trial.' };
      }
      update({ ...data, session: key });
      return { ok: true };
    },
    [data, update]
  );

  const resetPassword: AuthValue['resetPassword'] = useCallback(
    (email, password) => {
      const key = normaliseEmail(email);
      const acc = data.accounts[key];
      if (!acc) return { ok: false, error: 'This reset link is no longer valid. Ask for a new one.' };
      update({ accounts: { ...data.accounts, [key]: { ...acc, password } }, session: null });
      return { ok: true };
    },
    [data, update]
  );

  const logOut = useCallback(() => update({ ...data, session: null }), [data, update]);

  const account = data.session ? data.accounts[data.session] ?? null : null;

  const trialDaysLeft = useMemo(() => {
    if (!account?.trialStartedAt) return TRIAL_DAYS;
    const used = Math.floor((Date.now() - new Date(account.trialStartedAt).getTime()) / DAY);
    return Math.max(0, TRIAL_DAYS - used);
  }, [account?.trialStartedAt]);

  const value = useMemo<AuthValue>(
    () => ({ account, trialDaysLeft, signUp, verifyEmail, logIn, openLoginLink, resetPassword, logOut }),
    [account, trialDaysLeft, signUp, verifyEmail, logIn, openLoginLink, resetPassword, logOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
