// lib/printed.ts — the printed edition of each exam's question pack.
//
// These are physical paperbacks on Amazon, so linking out is allowed: the
// App Store rules on external purchase links cover digital content, not print.
import { Linking } from 'react-native';
import type { Exam } from './types';

export interface PrintedPack {
  asin: string;
  title: string;
  questions: number;
}

const PACKS: Record<string, PrintedPack> = {
  '510': { asin: 'B0HJN99ZC9', title: 'API 510 Practice Question Pack', questions: 323 },
  '570': { asin: 'B0HJNC99FN', title: 'API 570 Practice Question Pack', questions: 291 },
  '653': { asin: 'B0HJZL7WGK', title: 'API 653 Practice Question Pack', questions: 251 },
};

export function printedPackFor(exam: Exam): PrintedPack | undefined {
  return PACKS[exam];
}

export async function openPrintedPack(pack: PrintedPack): Promise<void> {
  try {
    await Linking.openURL(`https://www.amazon.com/dp/${pack.asin}`);
  } catch {
    // No browser to open: the row simply does nothing rather than alerting.
  }
}
