// lib/report.ts — let a user email a question correction to the author.
// Uses expo-mail-composer; the address is the only personal data sent, and the
// App Privacy answers declare this email-report data collection.

import * as MailComposer from 'expo-mail-composer';
import type { Question } from './types';

export const SUPPORT_EMAIL = 'support@apiicpstudy.app';

export async function reportQuestion(
  q: Question,
  note: string
): Promise<'sent' | 'unavailable' | 'cancelled' | 'error'> {
  try {
    const available = await MailComposer.isAvailableAsync();
    if (!available) return 'unavailable';
    const body =
      `Question id: ${q.id}\n` +
      `Reference: ${q.meta.ref}\n` +
      `Exams: ${q.exams.join(', ')}\n\n` +
      `Stem: ${q.content.stem}\n\n` +
      `User note:\n${note}\n`;
    const result = await MailComposer.composeAsync({
      recipients: [SUPPORT_EMAIL],
      subject: `Question correction: ${q.id}`,
      body,
    });
    if (result.status === MailComposer.MailComposerStatus.SENT) return 'sent';
    if (result.status === MailComposer.MailComposerStatus.CANCELLED) return 'cancelled';
    return 'error';
  } catch {
    return 'error';
  }
}
