import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import { OrderWithRelations } from '@/types';
import { buildOrderEmail } from '@/utils/helpers';

export async function sendOrderEmail(order: OrderWithRelations): Promise<boolean> {
  const email = buildOrderEmail(order);

  // MailComposer opens the native compose UI on iOS/Android. On web we use a
  // standard mailto URL so the browser can hand the filled commission to Gmail
  // or the user's configured desktop email app.
  if (Platform.OS === 'web') {
    const recipient = email.recipients.join(',');
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    await Linking.openURL(mailto);
    return true;
  }

  const isAvailable = await MailComposer.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert(
      'Mail Not Configured',
      'Please configure a mail account on this device to send emails.'
    );
    return false;
  }

  const result = await MailComposer.composeAsync({
    recipients: email.recipients,
    subject: email.subject,
    body: email.body,
    isHtml: false,
  });

  return result.status === MailComposer.MailComposerStatus.SENT;
}
