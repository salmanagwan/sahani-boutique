import { withUnit } from '@/components/measure/figure';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Attachment,
  BoutiqueSettings,
  CreateOrderFormData,
  Customer,
  Designer,
  EmailTemplate,
  Measurements,
  Note,
  NotificationPreferences,
  Order,
  OrderStatus,
  OrderWithRelations,
  StatusHistoryEntry,
} from '@/types';
import {
  MOCK_ATTACHMENTS,
  MOCK_BOUTIQUE_SETTINGS,
  MOCK_CUSTOMERS,
  MOCK_DESIGNERS,
  MOCK_EMAIL_TEMPLATES,
  MOCK_MEASUREMENTS,
  MOCK_NOTES,
  MOCK_NOTIFICATION_PREFERENCES,
  MOCK_ORDERS,
  MOCK_STATUS_HISTORY,
  orderCounter as initialOrderCounter,
} from '@/data/mockData';
import { generateId, generateOrderNumber, orderSequence } from '@/utils/helpers';

interface AppContextValue {
  orders: Order[];
  designers: Designer[];
  customers: Customer[];
  measurements: Measurements[];
  attachments: Attachment[];
  notes: Note[];
  statusHistory: StatusHistoryEntry[];
  boutiqueSettings: BoutiqueSettings;
  emailTemplates: EmailTemplate[];
  notificationPreferences: NotificationPreferences;
  getOrderWithRelations: (orderId: string) => OrderWithRelations | undefined;
  getOrdersWithRelations: () => OrderWithRelations[];
  createOrder: (formData: CreateOrderFormData, options?: { isDraft?: boolean; sendEmail?: boolean }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  duplicateOrder: (orderId: string) => Order | undefined;
  addNote: (orderId: string, content: string) => Note;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  addDesigner: (designer: Omit<Designer, 'id' | 'createdAt' | 'archived'>) => Designer;
  updateDesigner: (designerId: string, updates: Partial<Designer>) => void;
  archiveDesigner: (designerId: string) => void;
  updateBoutiqueSettings: (settings: Partial<BoutiqueSettings>) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  activeDesigners: Designer[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [designers, setDesigners] = useState<Designer[]>(MOCK_DESIGNERS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [measurements, setMeasurements] = useState<Measurements[]>(MOCK_MEASUREMENTS);
  const [attachments, setAttachments] = useState<Attachment[]>(MOCK_ATTACHMENTS);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>(MOCK_STATUS_HISTORY);
  const [boutiqueSettings, setBoutiqueSettings] = useState<BoutiqueSettings>(MOCK_BOUTIQUE_SETTINGS);
  const [emailTemplates] = useState<EmailTemplate[]>(MOCK_EMAIL_TEMPLATES);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    MOCK_NOTIFICATION_PREFERENCES
  );
  const [orderCounter, setOrderCounter] = useState(initialOrderCounter);

  const activeDesigners = useMemo(
    () => designers.filter((d) => !d.archived),
    [designers]
  );

  const getOrderWithRelations = useCallback(
    (orderId: string): OrderWithRelations | undefined => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return undefined;

      const designer = designers.find((d) => d.id === order.designerId);
      const customer = customers.find((c) => c.id === order.customerId);
      if (!designer || !customer) return undefined;

      return {
        ...order,
        designer,
        customer,
        measurements: measurements.find((m) => m.orderId === orderId) ?? null,
        attachments: attachments.filter((a) => a.orderId === orderId),
        notes: notes.filter((n) => n.orderId === orderId),
        statusHistory: statusHistory
          .filter((s) => s.orderId === orderId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      };
    },
    [orders, designers, customers, measurements, attachments, notes, statusHistory]
  );

  const getOrdersWithRelations = useCallback((): OrderWithRelations[] => {
    return orders
      .map((order) => getOrderWithRelations(order.id))
      .filter((o): o is OrderWithRelations => o !== undefined)
      // Newest order on top: #9 above #8, and so on down to #1.
      .sort((a, b) => orderSequence(b.orderNumber) - orderSequence(a.orderNumber));
  }, [orders, getOrderWithRelations]);

  const createOrder = useCallback(
    (formData: CreateOrderFormData, options?: { isDraft?: boolean; sendEmail?: boolean }): Order => {
      const customerId = generateId();
      const orderId = generateId();
      const measurementId = generateId();
      const now = new Date().toISOString();
      const orderNumber = generateOrderNumber(orderCounter);
      setOrderCounter((c) => c + 1);

      const customer: Customer = {
        id: customerId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address.trim() || undefined,
        weddingDate: formData.weddingDate || undefined,
        eventType: formData.eventType || undefined,
      };

      const depositAmt = formData.depositAmount ? parseFloat(formData.depositAmount) : undefined;
      const order: Order = {
        id: orderId,
        orderNumber,
        designerId: formData.designerId,
        customerId,
        productCode: formData.productCode,
        productName: formData.productName,
        productPrice: parseFloat(formData.productPrice) || 0,
        currency: formData.currency,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        vendorDeliveryDate: formData.vendorDeliveryDate || undefined,
        customerDeliveryDate: formData.customerDeliveryDate || undefined,
        // The due date doubles as the expected date now that there is no separate one.
        eventDate: formData.eventDate || undefined,
        // The order date is the day it is created.
        orderDate: now.slice(0, 10),
        photoUri: formData.photoUri || undefined,
        colour: formData.colour.trim() || undefined,
        fabric: formData.fabric.trim() || undefined,
        details: formData.details.trim() || undefined,
        specialRequest: formData.specialRequest.trim() || undefined,
        specialImageUri: formData.specialImageUri || undefined,
        depositAmount: depositAmt,
        followUpRequired: false,
        internalNotes: formData.internalNotes,
        status: 'created',
        createdAt: now,
        isDraft: options?.isDraft ?? false,
      };

      const measurement: Measurements = {
        id: measurementId,
        orderId,
        // Store each value with its unit ("32 cm") so it reads the same everywhere.
        values: Object.fromEntries(
          Object.entries(formData.measurements)
            .filter(([, v]) => v && v.trim())
            .map(([k, v]) => [k, withUnit(k, v, formData.measurementUnit)])
        ),
      };

      const newAttachments: Attachment[] = formData.attachments.map((a) => ({
        ...a,
        id: generateId(),
        orderId,
      }));

      const historyEntries: StatusHistoryEntry[] = [
        { id: generateId(), orderId, status: 'created', timestamp: now },
      ];

      setCustomers((prev) => [...prev, customer]);
      setOrders((prev) => [order, ...prev]);
      setMeasurements((prev) => [...prev, measurement]);
      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
      setStatusHistory((prev) => [...prev, ...historyEntries]);

      return order;
    },
    [orderCounter]
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, isDraft: false } : o))
    );
    setStatusHistory((prev) => [
      ...prev,
      { id: generateId(), orderId, status, timestamp: now },
    ]);
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setMeasurements((prev) => prev.filter((m) => m.orderId !== orderId));
    setAttachments((prev) => prev.filter((a) => a.orderId !== orderId));
    setNotes((prev) => prev.filter((n) => n.orderId !== orderId));
    setStatusHistory((prev) => prev.filter((s) => s.orderId !== orderId));
  }, []);

  const duplicateOrder = useCallback(
    (orderId: string): Order | undefined => {
      const original = getOrderWithRelations(orderId);
      if (!original) return undefined;

      const newOrderId = generateId();
      const newCustomerId = generateId();
      const now = new Date().toISOString();
      const orderNumber = generateOrderNumber(orderCounter);
      setOrderCounter((c) => c + 1);

      const customer: Customer = { ...original.customer, id: newCustomerId };
      const order: Order = {
        ...original,
        id: newOrderId,
        orderNumber,
        customerId: newCustomerId,
        status: 'created',
        createdAt: now,
        isDraft: false,
      };

      setCustomers((prev) => [...prev, customer]);
      setOrders((prev) => [order, ...prev]);

      if (original.measurements) {
        setMeasurements((prev) => [
          ...prev,
          { ...original.measurements!, id: generateId(), orderId: newOrderId },
        ]);
      }

      setStatusHistory((prev) => [
        ...prev,
        { id: generateId(), orderId: newOrderId, status: 'created', timestamp: now },
      ]);

      return order;
    },
    [getOrderWithRelations, orderCounter]
  );

  const addNote = useCallback((orderId: string, content: string): Note => {
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      orderId,
      content,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [...prev, note]);
    return note;
  }, []);

  const updateNote = useCallback((noteId: string, content: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content, updatedAt: now } : n))
    );
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const addDesigner = useCallback(
    (data: Omit<Designer, 'id' | 'createdAt' | 'archived'>): Designer => {
      const designer: Designer = {
        ...data,
        id: generateId(),
        archived: false,
        createdAt: new Date().toISOString(),
      };
      setDesigners((prev) => [...prev, designer]);
      return designer;
    },
    []
  );

  const updateDesigner = useCallback((designerId: string, updates: Partial<Designer>) => {
    setDesigners((prev) =>
      prev.map((d) => (d.id === designerId ? { ...d, ...updates } : d))
    );
  }, []);

  const archiveDesigner = useCallback((designerId: string) => {
    setDesigners((prev) =>
      prev.map((d) => (d.id === designerId ? { ...d, archived: true } : d))
    );
  }, []);

  const updateBoutiqueSettings = useCallback((settings: Partial<BoutiqueSettings>) => {
    setBoutiqueSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const updateNotificationPreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => ({ ...prev, ...prefs }));
  }, []);

  const value = useMemo(
    () => ({
      orders,
      designers,
      customers,
      measurements,
      attachments,
      notes,
      statusHistory,
      boutiqueSettings,
      emailTemplates,
      notificationPreferences,
      getOrderWithRelations,
      getOrdersWithRelations,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      duplicateOrder,
      addNote,
      updateNote,
      deleteNote,
      addDesigner,
      updateDesigner,
      archiveDesigner,
      updateBoutiqueSettings,
      updateNotificationPreferences,
      activeDesigners,
    }),
    [
      orders,
      designers,
      customers,
      measurements,
      attachments,
      notes,
      statusHistory,
      boutiqueSettings,
      emailTemplates,
      notificationPreferences,
      getOrderWithRelations,
      getOrdersWithRelations,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      duplicateOrder,
      addNote,
      updateNote,
      deleteNote,
      addDesigner,
      updateDesigner,
      archiveDesigner,
      updateBoutiqueSettings,
      updateNotificationPreferences,
      activeDesigners,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
