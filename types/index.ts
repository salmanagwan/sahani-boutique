export type OrderStatus =
  | 'created'
  | 'sent'
  | 'in_atelier'
  | 'in_transit'
  | 'ready_pickup'
  | 'trial_pending'
  | 'completed'
  | 'on_hold';

export type Gender = 'male' | 'female' | 'boy' | 'girl';

export type AttachmentType = 'measurement' | 'reference' | 'design';

export interface Designer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  averageLeadTimeDays: number;
  /** House photo or logo, added by the boutique. */
  photoUri?: string;
  /** Emoji shown for the house when there is no photo. */
  emoji?: string;
  archived: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  address?: string;
  weddingDate?: string;
  eventType?: string;
}

export interface Measurements {
  id: string;
  orderId: string;
  values: Record<string, string>;
}

export interface Attachment {
  id: string;
  orderId: string;
  type: AttachmentType;
  uri: string;
  name: string;
}

export interface Note {
  id: string;
  orderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  designerId: string;
  customerId: string;
  productCode: string;
  productName: string;
  productPrice: number;
  currency: string;
  expectedDeliveryDate: string;
  vendorDeliveryDate?: string;
  customerDeliveryDate?: string;
  eventDate?: string;
  /** The day the order was taken. */
  orderDate?: string;
  /** Photo of the piece: a local file, or an image link. */
  photoUri?: string;
  colour?: string;
  fabric?: string;
  /** Making notes for the designer, e.g. "Palla 63 in from shoulders". */
  details?: string;
  specialRequest?: string;
  specialImageUri?: string;
  depositAmount?: number;
  followUpRequired?: boolean;
  internalNotes: string;
  status: OrderStatus;
  createdAt: string;
  isDraft: boolean;
}

export interface OrderWithRelations extends Order {
  designer: Designer;
  customer: Customer;
  measurements: Measurements | null;
  attachments: Attachment[];
  notes: Note[];
  statusHistory: StatusHistoryEntry[];
}

export interface CreateOrderFormData {
  designerId: string;
  productCode: string;
  productName: string;
  productPrice: string;
  currency: string;
  expectedDeliveryDate: string;
  vendorDeliveryDate: string;
  customerDeliveryDate: string;
  eventDate: string;
  orderDate: string;
  photoUri: string;
  colour: string;
  fabric: string;
  details: string;
  depositAmount: string;
  internalNotes: string;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  address: string;
  weddingDate: string;
  eventType: string;
  measurements: Record<string, string>;
  /** Unit the measurements were taken in. */
  measurementUnit: 'cm' | 'in';
  /** Measurements the boutique added beyond the standard sheet, in the order added. */
  customMeasurements: string[];
  /** Anything special for the designer, in words... */
  specialRequest: string;
  /** ...and/or a sketch or reference image. */
  specialImageUri: string;
  attachments: Omit<Attachment, 'id' | 'orderId'>[];
}

export interface BoutiqueSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface NotificationPreferences {
  orderStatusUpdates: boolean;
  deliveryReminders: boolean;
  emailSentConfirmations: boolean;
}
