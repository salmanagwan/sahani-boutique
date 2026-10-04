import { WOMEN_FIELDS } from '@/components/measure/croquis';
import { differenceInCalendarDays as differenceInDays, format, parseISO } from 'date-fns';
import { OrderWithRelations } from '@/types';
import { STATUS_CONFIG } from '@/constants/theme';

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'd MMMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    return format(parseISO(dateString), 'd MMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatEventDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'd MMM');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'd MMM yyyy, HH:mm');
  } catch {
    return dateString;
  }
}

export function formatPrice(price: number, currency: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    INR: '₹',
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${price.toLocaleString()}`;
}

/** Orders get IDs SS-01, SS-02, SS-03… in the order they were opened. */
export function generateOrderNumber(counter: number): string {
  return `SS-${String(counter).padStart(2, '0')}`;
}

export function orderSequence(orderNumber: string): number {
  const n = parseInt(orderNumber.replace(/\D/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

export function getNextStatus(
  currentStatus: import('@/types').OrderStatus
): import('@/types').OrderStatus | null {
  const flow: import('@/types').OrderStatus[] = [
    'created',
    'in_atelier',
    'in_transit',
    'ready_pickup',
    'completed',
  ];
  const index = flow.indexOf(currentStatus);
  if (index === -1 || index >= flow.length - 1) return null;
  return flow[index + 1];
}

export type UrgencyLevel = 'critical' | 'warning' | 'none';

export function getOrderUrgency(eventDate?: string): UrgencyLevel {
  if (!eventDate) return 'none';
  try {
    const days = differenceInDays(parseISO(eventDate), new Date());
    if (days < 0) return 'none';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'none';
  } catch {
    return 'none';
  }
}

export function getDaysUntilEvent(eventDate?: string): number | null {
  if (!eventDate) return null;
  try {
    const days = differenceInDays(parseISO(eventDate), new Date());
    return days >= 0 ? days : null;
  } catch {
    return null;
  }
}

/**
 * The email to a designer. Short on purpose: the order card (attached) carries the piece,
 * the measurements and any special request. No price, no client address or contacts.
 */
export function buildOrderEmail(order: OrderWithRelations, opts: { cardAttached?: boolean } = {}): {
  recipients: string[];
  subject: string;
  body: string;
} {
  const due = order.vendorDeliveryDate ?? order.expectedDeliveryDate;
  const dueText = due ? formatDateShort(due) : 'to be confirmed';
  const body = [
    `Hello ${order.designer.name},`,
    '',
    'Here are the details of our new order.',
    '',
    `Order number: ${order.orderNumber}`,
    `Client: ${order.customer.fullName}`,
    `Due date: ${dueText}`,
    '',
    opts.cardAttached
      ? 'The order card with the piece, measurements and any special request is attached.'
      : 'The order card with the piece, measurements and any special request will follow.',
    '',
    'Warm regards,',
    'Sahani Boutique',
  ].join('\n');

  return {
    recipients: [order.designer.email],
    subject: `${order.orderNumber} | ${order.productName} | Due ${dueText}`,
    body,
  };
}

export function getStatusLabel(status: import('@/types').OrderStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

export function isChildGender(gender: import('@/types').Gender): boolean {
  return gender === 'boy' || gender === 'girl';
}

export function getMeasurementFields(gender: import('@/types').Gender): string[] {
  if (gender === 'male') {
    return ['Chest', 'Waist', 'Hip', 'Shoulder', 'Arm Length', 'Neck', 'Shirt Length', 'Trouser Length', 'Height'];
  }
  if (gender === 'female') {
    // The women's measurement sheet, in its order.
    return [...WOMEN_FIELDS];
  }
  return ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Dress Length', 'Height', 'Age'];
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
