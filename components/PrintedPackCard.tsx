import React from 'react';
import { Pressable, Text } from 'react-native';
import { openPrintedPack, type PrintedPack } from '../lib/printed';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';

export default function PrintedPackCard({ pack, examTitle }: { pack: PrintedPack; examTitle: string }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={() => openPrintedPack(pack)}
      accessibilityRole="link"
      accessibilityLabel={`${pack.title} on Amazon, opens in your browser`}
      style={{
        marginTop: 24,
        padding: 14,
        borderRadius: 12,
        borderColor: tokens.border,
        borderWidth: 1,
        backgroundColor: tokens.panel,
      }}
    >
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12 }}>PRINTED PACK</Text>
      <Text style={{ color: tokens.ink, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
        {examTitle} on paper: {pack.questions} questions, every one with a worked solution, plus two mock exams.
        Opens Amazon in your browser.
      </Text>
    </Pressable>
  );
}
