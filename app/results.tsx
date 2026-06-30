import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';

export default function Results() {
  const router = useRouter();
  const { tokens } = useTheme();
  const session = useSession();

  const { correct, total, byTopic, missed } = useMemo(() => {
    let correct = 0;
    const byTopic: Record<string, { c: number; n: number }> = {};
    const missed: string[] = [];
    for (const q of session.questions) {
      const top = q.subtopic.split(' — ')[0];
      byTopic[top] = byTopic[top] ?? { c: 0, n: 0 };
      byTopic[top].n++;
      const ok = session.answers[q.id] === q.content.answer;
      if (ok) {
        correct++;
        byTopic[top].c++;
      } else {
        missed.push(q.id);
      }
    }
    return { correct, total: session.questions.length, byTopic, missed };
  }, [session]);

  if (total === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={{ color: tokens.accent, fontFamily: mono }}>Home</Text>
        </Pressable>
      </View>
    );
  }

  const pct = Math.round((100 * correct) / total);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12 }}>SCORE</Text>
      <Text style={{ color: tokens.ink, fontSize: 48, fontWeight: '800', marginVertical: 4 }}>
        {pct}%
      </Text>
      <Text style={{ color: tokens.muted, fontFamily: mono }}>
        {correct} / {total} correct
      </Text>

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginTop: 26, marginBottom: 8 }}>
        BY TOPIC
      </Text>
      {Object.entries(byTopic).map(([t, v]) => (
        <View
          key={t}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: tokens.border,
          }}
        >
          <Text style={{ color: tokens.ink, flex: 1, fontSize: 14 }}>{t}</Text>
          <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 13 }}>
            {v.c}/{v.n}
          </Text>
        </View>
      ))}

      {missed.length > 0 && (
        <Pressable
          onPress={() => router.push('/review')}
          style={{
            marginTop: 24,
            backgroundColor: tokens.accent,
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: tokens.accentInk, fontWeight: '700' }}>
            Review {missed.length} missed
          </Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.replace('/')} style={{ marginTop: 14, alignItems: 'center' }}>
        <Text style={{ color: tokens.muted, fontFamily: mono }}>Back to modules</Text>
      </Pressable>
    </ScrollView>
  );
}
