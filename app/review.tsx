import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import { reportQuestion } from '../lib/report';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Review() {
  const router = useRouter();
  const { tokens } = useTheme();
  const session = useSession();

  const considered =
    session.mode === 'exam'
      ? session.questions
      : session.questions.filter((q) => session.answers[q.id] !== undefined);
  const missed = considered.filter(
    (q) => session.answers[q.id] !== q.content.answer
  );

  async function report(qid: string) {
    const q = session.questions.find((x) => x.id === qid);
    if (!q) return;
    const r = await reportQuestion(q, 'Reported from review screen.');
    if (r === 'unavailable') Alert.alert('Mail not set up', 'No mail account is configured on this device.');
    else if (r === 'sent') Alert.alert('Thanks', 'Your note was sent.');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      {missed.length === 0 && (
        <Text style={{ color: tokens.muted, textAlign: 'center', marginTop: 40 }}>
          Nothing missed in this session.
        </Text>
      )}
      {missed.map((q) => {
        const chosen = session.answers[q.id];
        return (
          <View
            key={q.id}
            style={{
              backgroundColor: tokens.panel,
              borderColor: tokens.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 11 }}>{q.subtopic}</Text>
            <Text style={{ color: tokens.ink, fontSize: 15, lineHeight: 22, marginVertical: 8 }}>
              {q.content.stem}
            </Text>
            {q.content.options.map((opt, i) => {
              const isAns = i === q.content.answer;
              const isChosen = i === chosen;
              return (
                <Text
                  key={i}
                  style={{
                    color: isAns ? tokens.good : isChosen ? tokens.bad : tokens.muted,
                    fontSize: 14,
                    marginBottom: 3,
                  }}
                >
                  {LETTERS[i]}. {opt}
                  {isAns ? '  ✓' : isChosen ? '  ✗' : ''}
                </Text>
              );
            })}
            <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 11, marginTop: 8 }}>
              {q.meta.ref}
            </Text>
            <Text style={{ color: tokens.ink, fontSize: 13, lineHeight: 20, marginTop: 4 }}>
              {q.content.explanation}
            </Text>
            <Pressable onPress={() => report(q.id)} style={{ marginTop: 8 }}>
              <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12 }}>
                Report a problem
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Pressable onPress={() => router.replace('/')} style={{ marginTop: 8, alignItems: 'center' }}>
        <Text style={{ color: tokens.accent, fontFamily: mono }}>Done</Text>
      </Pressable>
    </ScrollView>
  );
}
