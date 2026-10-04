import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrderWithRelations } from '@/types';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { buildOrderEmail } from '@/utils/helpers';
import { canMakeCard, makeOrderImage } from '@/lib/measureCard';
import { sendOrderEmail } from '@/lib/email';
import { Icon } from '@/components/ui/Icon';

interface SendSheetProps {
  order: OrderWithRelations | null;
  onClose: () => void;
}

// "Email designer": shows the measurement card that goes to the house, then three ways
// to send it. Share hands the card and the text to Mail, WhatsApp and so on. Email opens
// a filled-in message. Save keeps the card to attach by hand.
export function SendSheet({ order, onClose }: SendSheetProps) {
  const insets = useSafeAreaInsets();
  const { boutiqueSettings } = useApp();
  const [card, setCard] = useState<Blob | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  // Card height grows with the content, so the preview follows its real shape.
  const [cardRatio, setCardRatio] = useState(1240 / 1754);
  const [making, setMaking] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!order || !canMakeCard()) return;
    let url: string | null = null;
    setMaking(true);
    setNote(null);
    makeOrderImage(order, boutiqueSettings)
      .then((b) => {
        setCard(b);
        if (b) {
          url = URL.createObjectURL(b);
          setCardUrl(url);
          const probe = new window.Image();
          probe.onload = () => setCardRatio(probe.naturalWidth / probe.naturalHeight);
          probe.src = url;
        }
      })
      .finally(() => setMaking(false));
    return () => {
      if (url) URL.revokeObjectURL(url);
      setCard(null);
      setCardUrl(null);
    };
  }, [order, boutiqueSettings]);

  if (!order) return null;
  const fileName = `${order.orderNumber}-measurement-sheet.png`;
  const email = buildOrderEmail(order, { cardAttached: true });
  const file = card && typeof File !== 'undefined' ? new File([card], fileName, { type: 'image/png' }) : null;
  const nav: any = typeof navigator !== 'undefined' ? navigator : null;
  const canShareFile = !!(file && nav?.canShare?.({ files: [file] }));

  const share = async () => {
    if (!file || !canShareFile) return;
    try {
      await nav.share({ files: [file], title: email.subject, text: `${email.subject}\n\n${email.body}` });
      onClose();
    } catch {
      // Cancelled; leave the sheet open.
    }
  };

  const save = () => {
    if (!cardUrl) return;
    const a = document.createElement('a');
    a.href = cardUrl;
    a.download = fileName;
    a.click();
    setNote(`Saved ${fileName}. Attach it to the email.`);
  };

  const openEmail = async () => {
    if (Platform.OS === 'web') {
      const mailto = `mailto:${email.recipients.join(',')}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      await Linking.openURL(mailto);
    } else {
      await sendOrderEmail(order);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Send to designer</Text>
              <Text style={styles.title} numberOfLines={1}>
                {order.designer.name}
              </Text>
              <Text style={styles.to} numberOfLines={1}>
                {order.designer.email}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Icon name="close" size={22} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ alignItems: 'center' }}>
            {making ? (
              <View style={styles.placeholder}>
                <ActivityIndicator color={Colors.ink} />
              </View>
            ) : cardUrl ? (
              <Image source={{ uri: cardUrl }} style={[styles.card, { height: 260 / cardRatio }]} resizeMode="contain" accessibilityLabel="Measurement card" />
            ) : (
              <Text style={styles.small}>The measurement card is made in the web app. The email still carries every value.</Text>
            )}
          </ScrollView>
          <Text style={styles.small}>
            The card and email leave out the price and the client&rsquo;s address and contact details.
          </Text>

          <View style={styles.actions}>
            {canShareFile ? (
              <Pressable style={styles.primary} onPress={share} accessibilityRole="button">
                <Text style={styles.primaryText}>Share card and details</Text>
              </Pressable>
            ) : null}
            <View style={styles.row}>
              <Pressable style={[styles.secondary, !canShareFile && styles.primaryLike]} onPress={openEmail} accessibilityRole="button">
                <Icon name="email" size={18} color={canShareFile ? Colors.ink : Colors.onInk} />
                <Text style={[styles.secondaryText, !canShareFile && { color: Colors.onInk }]}>Open email</Text>
              </Pressable>
              {cardUrl ? (
                <Pressable style={styles.secondary} onPress={save} accessibilityRole="button">
                  <Icon name="download" size={18} />
                  <Text style={styles.secondaryText}>Save card</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          {note ? <Text style={[styles.small, { color: Colors.ink }]}>{note}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.35)',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: Colors.background,
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  eyebrow: {
    ...Typography.house,
  },
  title: {
    fontFamily: Fonts.product,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.ink,
    marginTop: 4,
  },
  to: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.secondaryText,
  },
  placeholder: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mist,
  },
  card: {
    width: 260,
    height: 368,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
  },
  small: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.caption,
    marginTop: 10,
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  primary: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ink,
  },
  primaryLike: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  primaryText: {
    ...Typography.button,
    color: Colors.onInk,
  },
  secondary: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  secondaryText: {
    ...Typography.button,
    color: Colors.ink,
  },
});
