// Subscription plans. Prices are SAMPLES so the flow can be tried: they are not decided.
// Change them here and every screen (plans, payment, Settings) follows.

export type PlanId = 'monthly' | 'quarterly' | 'half' | 'yearly';

export interface Plan {
  id: PlanId;
  name: string;
  months: number;
  /** Price for the whole period, in rupees. */
  price: number;
  /** "every month", "every 3 months" … */
  period: string;
}

export const PRICES_ARE_SAMPLES = true;

export const PLANS: Plan[] = [
  { id: 'monthly', name: 'Monthly', months: 1, price: 1499, period: 'every month' },
  { id: 'quarterly', name: 'Quarterly', months: 3, price: 3999, period: 'every 3 months' },
  { id: 'half', name: '6 months', months: 6, price: 7499, period: 'every 6 months' },
  { id: 'yearly', name: 'Yearly', months: 12, price: 13999, period: 'every year' },
];

export const getPlan = (id: PlanId | undefined) => PLANS.find((p) => p.id === id);

const monthly = PLANS[0];

/** Whole-percent saving against paying monthly for the same time. */
export function savingPercent(plan: Plan) {
  const full = monthly.price * plan.months;
  return Math.round(((full - plan.price) / full) * 100);
}

export const perMonth = (plan: Plan) => Math.round(plan.price / plan.months);

/** ₹13,999 / ₹1,49,999: Indian grouping, written by hand so phones without full Intl agree. */
export function rupees(amount: number) {
  const s = String(Math.round(amount));
  if (s.length <= 3) return '₹' + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return '₹' + rest + ',' + last3;
}
