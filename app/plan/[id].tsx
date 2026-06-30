import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore, blockReadiness } from '../../lib/store';
import { MODULES, bankForExam } from '../../lib/bank';
import { planFor } from '../../lib/plan';
import { useTheme } from '../../lib/useTheme';
import { mono } from '../../lib/theme';
import type { Exam } from '../../lib/types';

const EXAM_CODES = MODULES.map((m) => m.id) as Exam[];

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useTheme();
  const exam = (EXAM_CODES.includes(id as Exam) ? id : '510') as Exam;
  const mod = MODULES.find((m) => m.id === exam)!;

  const progress = useStore((s) => s.progress);
  const examTargets = useStore((s) => s.examTargets);
  const setExamTarget = useStore((s) => s.setExamTarget);

  const ids = bankForExam(exam).map((q) => q.id);
  const ready = blockReadiness(progress, ids);
  const remaining = ids.filter((qid) => (progress[qid]?.correct ?? 0) === 0).length;
  const targetIso = examTargets[exam];
  const { daysLeft, perDay } = planFor(targetIso, remaining);

  const [showPicker, setShowPicker] = useState(false);
  const current = targetIso ? new Date(targetIso) : new Date(Date.now() + 30 * 24 * 3600 * 1000);

  function onChange(_e: unknown, d?: Date) {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (d) setExamTarget(exam, d.toISOString());
  }

  const dateLabel = targetIso
    ? new Date(targetIso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not set';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <Stack.Screen options={{ title: `${mod.title} plan` }} />

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginBottom: 8 }}>
        TEST DATE
      </Text>
      <Pressable
        onPress={() => setShowPicker((s) => !s)}
        style={{
          padding: 16,
          borderRadius: 12,
          borderColor: tokens.border,
          borderWidth: 1,
          backgroundColor: tokens.panel,
        }}
      >
        <Text style={{ color: tokens.ink, fontSize: 17, fontWeight: '600' }}>{dateLabel}</Text>
        <Text style={{ color: tokens.accent, fontFamily: mono, fontSize: 12, marginTop: 6 }}>
          {targetIso ? 'Tap to change' : 'Tap to set your exam date'}
        </Text>
      </Pressable>

      {showPicker && (
        <View style={{ marginTop: 10 }}>
          <DateTimePicker
            value={current}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            minimumDate={new Date()}
            onChange={onChange}
          />
        </View>
      )}

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginTop: 24, marginBottom: 8 }}>
        PLAN
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat label="DAYS LEFT" value={daysLeft === null ? '—' : String(daysLeft)} tokens={tokens} />
        <Stat
          label="NEW / DAY"
          value={perDay === null ? '—' : String(perDay)}
          tokens={tokens}
          hint="to cover the bank"
        />
        <Stat label="READY" value={`${ready}%`} tokens={tokens} />
      </View>

      <Text style={{ color: tokens.muted, fontSize: 13, lineHeight: 20, marginTop: 18 }}>
        {targetIso
          ? `${remaining} of ${ids.length} questions not yet answered correctly. At ${
              perDay ?? 0
            } new per day you'll cover the bank before your test date.`
          : 'Set a test date to get a daily target for covering the question bank in time.'}
      </Text>
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  tokens,
  hint,
}: {
  label: string;
  value: string;
  tokens: ReturnType<typeof useTheme>['tokens'];
  hint?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tokens.panel,
        borderColor: tokens.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 10, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ color: tokens.ink, fontSize: 22, fontWeight: '700', marginTop: 6 }}>{value}</Text>
      {hint && <Text style={{ color: tokens.muted, fontSize: 10, marginTop: 2 }}>{hint}</Text>}
    </View>
  );
}
