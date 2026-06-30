import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useStore, blockReadiness, weakFirstOrder } from '../../lib/store';
import {
  MODULES,
  bankForExam,
  freeSampler,
  assembleForm,
  productIdForModule,
} from '../../lib/bank';
import { useSession } from '../../lib/session';
import { useTheme } from '../../lib/useTheme';
import { mono } from '../../lib/theme';
import Paywall from '../../components/Paywall';
import ProgressBar from '../../components/ProgressBar';
import type { Exam } from '../../lib/types';

const EXAM_CODES = MODULES.map((m) => m.id) as Exam[];

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tokens } = useTheme();
  const unlocked = useStore((s) => s.unlocked);
  const progress = useStore((s) => s.progress);
  const start = useSession((s) => s.start);

  const exam = (EXAM_CODES.includes(id as Exam) ? id : '510') as Exam;
  const mod = MODULES.find((m) => m.id === exam)!;
  const ids = bankForExam(exam).map((q) => q.id);
  const locked = !unlocked.includes(productIdForModule(exam));

  function launchPractice() {
    const ordered = weakFirstOrder(progress, ids);
    const qs = assembleForm(exam, { count: Math.min(20, ids.length), order: () => ordered });
    start(exam, 'practice', qs);
    router.push('/session');
  }

  function launchExam() {
    const qs = assembleForm(exam, { count: Math.min(40, ids.length) });
    start(exam, 'exam', qs);
    router.push('/session');
  }

  function launchFree() {
    start(exam, 'free', freeSampler(exam, 10));
    router.push('/session');
  }

  if (locked) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.bg }}>
        <Stack.Screen options={{ title: mod.title }} />
        <View style={{ padding: 16 }}>
          <Pressable
            onPress={launchFree}
            style={{
              borderWidth: 1,
              borderColor: tokens.accent,
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: tokens.accent, fontFamily: mono }}>
              Try the free 10-question sample
            </Text>
          </Pressable>
        </View>
        <Paywall module={mod} onUnlocked={() => router.replace(`/module/${exam}`)} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: mod.title }} />
      <Text style={{ fontSize: 22, color: tokens.ink, fontWeight: '700' }}>{mod.subtitle}</Text>
      <Text style={{ color: tokens.muted, fontFamily: mono, marginTop: 6 }}>
        {ids.length} questions · {blockReadiness(progress, ids)}% ready
      </Text>
      <View style={{ marginTop: 12 }}>
        <ProgressBar pct={blockReadiness(progress, ids)} />
      </View>

      <BigButton label="Practice (weak-first)" sub="20 questions, instant feedback" onPress={launchPractice} />
      <BigButton label="Timed exam" sub="40 questions, score at the end" onPress={launchExam} />
      <BigButton label="Free sample" sub="10 questions" onPress={launchFree} subtle />

      <Pressable onPress={() => router.push('/bookmarks')} style={{ marginTop: 18, alignItems: 'center' }}>
        <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 13 }}>View bookmarks</Text>
      </Pressable>
    </ScrollView>
  );
}

function BigButton({
  label,
  sub,
  onPress,
  subtle,
}: {
  label: string;
  sub: string;
  onPress: () => void;
  subtle?: boolean;
}) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 14,
        backgroundColor: subtle ? tokens.panel : tokens.accent,
        borderColor: tokens.border,
        borderWidth: subtle ? 1 : 0,
        borderRadius: 14,
        padding: 18,
      }}
    >
      <Text
        style={{
          color: subtle ? tokens.ink : tokens.accentInk,
          fontSize: 17,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: subtle ? tokens.muted : tokens.accentInk,
          marginTop: 4,
          fontSize: 13,
          opacity: subtle ? 1 : 0.8,
        }}
      >
        {sub}
      </Text>
    </Pressable>
  );
}
