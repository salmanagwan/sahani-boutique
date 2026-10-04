import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays, addMonths, format } from 'date-fns';

import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { CreateOrderFormData } from '@/types';
import { BorderRadius, Colors, ControlHeight, Fonts, Spacing, Typography } from '@/constants/theme';
import { ClientStep } from '@/components/create-order/ClientStep';
import { GarmentStep } from '@/components/create-order/GarmentStep';
import { MeasurementsStep } from '@/components/create-order/MeasurementsStep';
import { ReviewStep } from '@/components/create-order/ReviewStep';
import { useVisualViewport } from '@/utils/useVisualViewport';
import { Icon } from '@/components/ui/Icon';

const STEPS = [
  { key: 'client', label: 'Client', title: 'Client' },
  { key: 'garment', label: 'Piece', title: 'The piece' },
  { key: 'measurements', label: 'Measure', title: 'Measurements' },
  { key: 'review', label: 'Review', title: 'Review' },
];

const initialFormData = (): CreateOrderFormData => ({
  designerId: '',
  productCode: '',
  productName: '',
  productPrice: '',
  currency: 'GBP',
  expectedDeliveryDate: '',
  vendorDeliveryDate: '',
  customerDeliveryDate: '',
  eventDate: '',
  orderDate: format(new Date(), 'yyyy-MM-dd'),
  photoUri: '',
  colour: '',
  fabric: '',
  details: '',
  depositAmount: '',
  internalNotes: '',
  fullName: '',
  email: '',
  phone: '',
  gender: 'female',
  address: '',
  weddingDate: '',
  eventType: '',
  measurements: {},
  measurementUnit: 'in',
  customMeasurements: [],
  specialRequest: '',
  specialImageUri: '',
  attachments: [],
});

// Read-only after the trial ends: adding goes to the plans screen instead.
export default function CreateOrderScreen() {
  const { locked } = useAuth();
  if (locked) return <Redirect href={{ pathname: '/account/plans', params: { locked: '1' } }} />;
  return <CreateOrderScreenInner />;
}

function CreateOrderScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Pin the screen to the area above the phone's keyboard so nothing slides out of view.
  const visible = useVisualViewport();
  const typing = visible.keyboardOpen;
  const { activeDesigners, createOrder } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateOrderFormData>(initialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const updateForm = (updates: Partial<CreateOrderFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleClose = () => {
    router.back();
  };

  const goTo = (step: number) => {
    setNotice(null);
    setCurrentStep(Math.max(0, Math.min(step, STEPS.length - 1)));
  };
  const handleNext = () => goTo(currentStep + 1);
  const handleBack = () => goTo(currentStep - 1);

  const handleSaveDraft = () => {
    try {
      const order = createOrder(formData, { isDraft: true });
      if (Platform.OS === 'web') {
        handleClose();
        return;
      }
      Alert.alert('Draft saved', `${order.orderNumber} is in your orders as a draft.`, [
        { text: 'Done', onPress: handleClose },
      ]);
    } catch {
      setNotice('The draft could not be saved. Try again.');
    }
  };

  const validateForCreate = (): string | null => {
    if (!formData.fullName.trim()) return "Add the client's name on the Client step.";
    if (!formData.vendorDeliveryDate) return 'Choose a due date on the Client step.';
    if (!formData.eventDate) return 'Choose the event date on the Client step.';
    if (!formData.designerId) return 'Choose a designer on the Piece step.';
    if (!formData.productName.trim()) return 'Name the piece on the Piece step.';
    if (!formData.productPrice.trim()) return 'Add the price on the Piece step.';
    return null;
  };

  const handleCreate = async (sendEmail: boolean) => {
    const validationError = validateForCreate();
    if (validationError) {
      setNotice(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const order = createOrder(formData, { isDraft: false, sendEmail });

      if (sendEmail) {
        // Go to the new order with the send sheet open: it shows the measurement card
        // and the ways to send it.
        router.replace(`/order/${order.id}?send=1`);
      } else if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (err) {
      setNotice('The order could not be created. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const step = STEPS[currentStep];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        Platform.OS === 'web' && visible.height
          ? ({
              // Pinned to the visible area, but kept in the app's 430px column like every other screen.
              position: 'fixed',
              left: 0,
              right: 0,
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%',
              maxWidth: 430,
              top: visible.offsetTop,
              height: visible.height,
            } as object)
          : null,
      ]}
    >
      {/* Header: close, the step's name, save draft. A thin bar below shows progress. */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.headerSide} hitSlop={12} accessibilityLabel="Close">
          <Icon name="close" size={20} color={Colors.ink} />
        </Pressable>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {step.title}
          </Text>
          <Text style={styles.headerSub}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>
        <Pressable onPress={handleSaveDraft} style={[styles.headerSide, { alignItems: 'flex-end' }]} hitSlop={8}>
          <Text style={styles.draftText}>Save draft</Text>
        </Pressable>
      </View>
      {/* Step names; tucked away while typing so the keyboard leaves room for the fields */}
      <View style={[styles.segments, typing && { display: 'none' }]}>
        {STEPS.map((st, idx) => (
          <Pressable
            key={st.key}
            onPress={() => goTo(idx)}
            style={styles.segmentHit}
            accessibilityRole="tab"
            accessibilityLabel={st.label}
            accessibilityState={{ selected: idx === currentStep }}
          >
            <View style={[styles.segment, idx <= currentStep && styles.segmentDone]} />
            <Text style={[styles.segmentLabel, idx === currentStep && styles.segmentLabelOn]} numberOfLines={1}>
              {st.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {currentStep === 0 && <ClientStep formData={formData} onChange={updateForm} />}
        {currentStep === 1 && (
          <GarmentStep formData={formData} designers={activeDesigners} onChange={updateForm} />
        )}
        {currentStep === 2 && <MeasurementsStep formData={formData} onChange={updateForm} />}
        {currentStep === 3 && <ReviewStep formData={formData} designers={activeDesigners} />}
      </View>

      {/* Footer, hidden while the keyboard is up */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }, typing && { display: 'none' }]}>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <View style={styles.buttons}>
          {isLastStep ? (
            <>
              <Pressable onPress={handleBack} style={styles.btnBackSquare} accessibilityRole="button" accessibilityLabel="Back">
                <Icon name="back" size={20} color={Colors.ink} />
              </Pressable>
              <Pressable
                style={[styles.btnSecondary, isSubmitting && styles.btnDisabled]}
                onPress={() => handleCreate(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.btnSecondaryText}>SAVE ORDER</Text>
              </Pressable>
              <Pressable
                style={[styles.btnPrimary, { flex: 1.4 }, isSubmitting && styles.btnDisabled]}
                onPress={() => handleCreate(true)}
                disabled={isSubmitting}
              >
                <Icon name="email" size={18} color={Colors.onInk} />
                <Text style={styles.btnPrimaryText}>{isSubmitting ? 'SAVING…' : 'SAVE AND EMAIL'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              {!isFirstStep && (
                <Pressable onPress={handleBack} style={styles.btnSecondary}>
                  <Text style={styles.btnSecondaryText}>BACK</Text>
                </Pressable>
              )}
              <Pressable onPress={handleNext} style={[styles.btnPrimary, { flex: isFirstStep ? 1 : 1.4 }]}>
                <Text style={styles.btnPrimaryText}>CONTINUE</Text>
                <Icon name="forward" size={18} color={Colors.onInk} />
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    height: 56,
  },
  headerSide: {
    width: 90,
  },
  headerMid: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.product,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.primaryText,
  },
  headerSub: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    color: Colors.caption,
    marginTop: 1,
  },
  draftText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.primaryText,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.hairline,
  },
  // Progress: one thin segment per step, under the header.
  segments: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  segmentHit: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 4,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  // Step names under the bar, so any step can be opened directly.
  segmentLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.caption,
    marginTop: 8,
  },
  segmentLabelOn: {
    color: Colors.ink,
  },
  segment: {
    height: 2,
    backgroundColor: '#E6E6E6',
  },
  segmentDone: {
    backgroundColor: Colors.ink,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 22,
  },
  footer: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.hairline,
    backgroundColor: Colors.background,
  },
  notice: {
    ...Typography.footnote,
    color: Colors.error,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    height: ControlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
  },
  btnPrimaryText: {
    ...Typography.button,
    color: Colors.onInk,
  },
  btnSecondary: {
    flex: 1,
    height: ControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  btnSecondaryText: {
    ...Typography.button,
    color: Colors.primaryText,
  },
  btnBackSquare: {
    width: ControlHeight,
    height: ControlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
