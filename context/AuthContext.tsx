// Sign-in for the preview. Nothing here talks to a server yet: accounts and the session are
// kept in this browser (localStorage on web, memory on a phone), so the flow can be tried on
// the preview link. When Supabase is set up, these functions are what get swapped for real calls.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { addMonths } from 'date-fns';
import { PlanId } from '@/constants/plans';

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
  plan?: Subscription;
  /** Trial reminders already shown (3 and 1 days left). */
  remindersSeen?: number[];
}

export interface Subscription {
  id: PlanId;
  startedAt: string;
  renewsAt: string;
  /** Cancelled: keeps working until renewsAt, then stops. */
  cancelAtEnd?: boolean;
  /** Plan switched to; it starts at renewsAt. */
  nextId?: PlanId;
}

/** trial: free days left. active: paid. ended: trial or plan over, app is read-only. */
export type AccessStatus = 'trial' | 'active' | 'ended';

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
  status: AccessStatus;
  /** True when the trial or plan has ended: everything can be looked at, nothing changed. */
  locked: boolean;
  subscribe: (id: PlanId) => void;
  /** Switch plan. The new one starts when the current period ends. */
  changePlan: (id: PlanId) => void;
  cancelPlan: () => void;
  resumePlan: () => void;
  markReminderSeen: (days: number) => void;
  /** Preview only: jump the trial to a given number of days left (0 = ended). Clears any plan. */
  previewSetDaysLeft: (days: number) => void;
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

/** The moment the free trial runs out. */
export function trialEndDate(acc: Account | null | undefined) {
  if (!acc?.trialStartedAt) return null;
  return new Date(new Date(acc.trialStartedAt).getTime() + TRIAL_DAYS * DAY);
}

export const normaliseEmail =(email: string) => email.trim().toLowerCase();
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

  const patchAccount = useCallback(
    (fn: (acc: Account) => Account) => {
      if (!data.session || !data.accounts[data.session]) return;
      const acc = data.accounts[data.session];
      update({ ...data, accounts: { ...data.accounts, [data.session]: fn(acc) } });
    },
    [data, update]
  );

  const trialDaysLeft = useMemo(() => {
    if (!account?.trialStartedAt) return TRIAL_DAYS;
    const used = Math.floor((Date.now() - new Date(account.trialStartedAt).getTime()) / DAY);
    return Math.max(0, TRIAL_DAYS - used);
  }, [account?.trialStartedAt]);

  // A paid plan renews by itself unless cancelled. Once a cancelled plan's period is over,
  // the boutique goes read-only, the same as an ended trial.
  const plan = account?.plan;
  const planLive = Boolean(plan && (!plan.cancelAtEnd || Date.now() < new Date(plan.renewsAt).getTime()));
  const status: AccessStatus = planLive ? 'active' : plan ? 'ended' : trialDaysLeft > 0 ? 'trial' : 'ended';

  const subscribe = useCallback(
    (id: PlanId) =>
      patchAccount((acc) => {
        const months = { monthly: 1, quarterly: 3, half: 6, yearly: 12 }[id];
        // Picked during the trial: the plan starts when the free days run out, so none are lost.
        const end = trialEndDate(acc);
        const start = end && end.getTime() > Date.now() ? end : new Date();
        return { ...acc, plan: { id, startedAt: start.toISOString(), renewsAt: addMonths(start, months).toISOString() } };
      }),
    [patchAccount]
  );

  const changePlan = useCallback(
    (id: PlanId) =>
      patchAccount((acc) =>
        acc.plan ? { ...acc, plan: { ...acc.plan, nextId: id === acc.plan.id ? undefined : id, cancelAtEnd: false } } : acc
      ),
    [patchAccount]
  );

  const cancelPlan = useCallback(
    () => patchAccount((acc) => (acc.plan ? { ...acc, plan: { ...acc.plan, cancelAtEnd: true, nextId: undefined } } : acc)),
    [patchAccount]
  );

  const resumePlan = useCallback(
    () => patchAccount((acc) => (acc.plan ? { ...acc, plan: { ...acc.plan, cancelAtEnd: false } } : acc)),
    [patchAccount]
  );

  const markReminderSeen = useCallback(
    (days: number) =>
      patchAccount((acc) => ({ ...acc, remindersSeen: Array.from(new Set([...(acc.remindersSeen ?? []), days])) })),
    [patchAccount]
  );

  const previewSetDaysLeft = useCallback(
    (days: number) =>
      patchAccount((acc) => ({
        ...acc,
        trialStartedAt: new Date(Date.now() - (TRIAL_DAYS - days) * DAY - 60_000).toISOString(),
        plan: undefined,
        remindersSeen: [],
      })),
    [patchAccount]
  );

  const value = useMemo<AuthValue>(
    () => ({
      account,
      trialDaysLeft,
      signUp,
      verifyEmail,
      logIn,
      openLoginLink,
      resetPassword,
      logOut,
      status,
      locked: status === 'ended',
      subscribe,
      changePlan,
      cancelPlan,
      resumePlan,
      markReminderSeen,
      previewSetDaysLeft,
    }),
    [account, trialDaysLeft, signUp, verifyEmail, logIn, openLoginLink, resetPassword, logOut, status, subscribe, changePlan, cancelPlan, resumePlan, markReminderSeen, previewSetDaysLeft]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
