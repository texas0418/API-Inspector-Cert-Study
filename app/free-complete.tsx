import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import { MODULES } from '../lib/bank';

export default function FreeComplete() {
  const router = useRouter();
  const { tokens } = useTheme();
  const session = useSession();
  const mod = MODULES.find((m) => m.id === session.exam);

  const correct = session.questions.filter(
    (q) => session.answers[q.id] === q.content.answer
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg, padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12 }}>SAMPLE COMPLETE</Text>
      <Text style={{ color: tokens.ink, fontSize: 30, fontWeight: '800', marginVertical: 8 }}>
        {correct} / {session.questions.length}
      </Text>
      <Text style={{ color: tokens.muted, fontSize: 15, lineHeight: 22 }}>
        That was the free preview of the {mod?.title} bank. Unlock the full module for
        practice and timed-exam modes, weak-first review, and progress tracking.
      </Text>

      <Pressable
        onPress={() => router.replace(`/module/${session.exam}`)}
        style={{
          marginTop: 24,
          backgroundColor: tokens.accent,
          borderRadius: 12,
          paddingVertical: 15,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: tokens.accentInk, fontWeight: '700' }}>See unlock options</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/')} style={{ marginTop: 14, alignItems: 'center' }}>
        <Text style={{ color: tokens.muted, fontFamily: mono }}>Back to modules</Text>
      </Pressable>
    </View>
  );
}
