import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../lib/session';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import { orderOptions } from '../lib/optionOrder';
import OptionButton from '../components/OptionButton';
import ProgressBar from '../components/ProgressBar';
import type { Question, SessionResult } from '../lib/types';

export default function SessionScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const session = useSession();
  const recordAnswer = useStore((s) => s.recordAnswer);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const bookmarks = useStore((s) => s.bookmarks);
  const addHistory = useStore((s) => s.addHistory);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const q = session.questions[idx];
  const isPractice = session.mode !== 'exam';

  const ordered = useMemo(() => {
    if (!q) return { options: [] as string[], answerIndex: 0, map: [] as number[] };
    return orderOptions(session.sessionId, q.id, q.content.options, q.content.answer);
  }, [session.sessionId, q]);

  if (!q) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: tokens.muted }}>No active session.</Text>
        <Pressable onPress={() => router.replace('/')} style={{ marginTop: 12 }}>
          <Text style={{ color: tokens.accent, fontFamily: mono }}>Home</Text>
        </Pressable>
      </View>
    );
  }

  const total = session.questions.length;
  const isBookmarked = bookmarks.includes(q.id);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const originalIdx = ordered.map[i];
    const correct = originalIdx === q.content.answer;
    session.answer(q.id, originalIdx);
    recordAnswer(q.id, correct);
  }

  function next() {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      finish();
    }
  }

  function finish() {
    const correct = scoreSession(session.questions, session.answers);
    const result: SessionResult = {
      id: session.sessionId,
      exam: session.exam,
      mode: session.mode,
      at: Date.now(),
      total,
      correct,
      questionIds: session.questions.map((x) => x.id),
      answers: session.answers,
    };
    addHistory(result);
    if (session.mode === 'free') router.replace('/free-complete');
    else router.replace('/results');
  }

  const optState = (i: number): 'idle' | 'correct' | 'wrong' | 'reveal' => {
    if (picked === null) return 'idle';
    if (i === ordered.answerIndex) return 'correct';
    if (i === picked) return 'wrong';
    return 'idle';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12 }}>
          {session.mode.toUpperCase()} · {idx + 1}/{total}
        </Text>
        <Pressable onPress={() => toggleBookmark(q.id)}>
          <Text style={{ color: isBookmarked ? tokens.accent : tokens.muted, fontFamily: mono, fontSize: 12 }}>
            {isBookmarked ? '★ saved' : '☆ save'}
          </Text>
        </Pressable>
      </View>
      <View style={{ marginVertical: 12 }}>
        <ProgressBar pct={Math.round((100 * (idx + (picked !== null ? 1 : 0))) / total)} />
      </View>

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 11, marginBottom: 6 }}>
        {q.subtopic}
      </Text>
      <Text style={{ color: tokens.ink, fontSize: 17, lineHeight: 24, marginBottom: 16 }}>
        {q.content.stem}
      </Text>

      {ordered.options.map((opt, i) => (
        <OptionButton
          key={i}
          index={i}
          label={opt}
          state={optState(i)}
          disabled={picked !== null}
          onPress={() => choose(i)}
        />
      ))}

      {picked !== null && isPractice && (
        <View
          style={{
            marginTop: 8,
            padding: 14,
            borderRadius: 12,
            backgroundColor: tokens.panel,
            borderColor: tokens.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 11, marginBottom: 4 }}>
            {q.meta.ref}
          </Text>
          <Text style={{ color: tokens.ink, fontSize: 14, lineHeight: 21 }}>
            {q.content.explanation}
          </Text>
        </View>
      )}

      {(picked !== null || isPractice === false) && (
        <Pressable
          onPress={picked !== null ? next : undefined}
          disabled={picked === null}
          style={{
            marginTop: 18,
            backgroundColor: picked === null ? tokens.panelAlt : tokens.accent,
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: picked === null ? tokens.muted : tokens.accentInk, fontWeight: '700' }}>
            {idx + 1 < total ? 'Next' : 'Finish'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// Score by comparing each recorded answer index against the correct index.
function scoreSession(questions: Question[], answers: Record<string, number>): number {
  let n = 0;
  for (const q of questions) {
    if (answers[q.id] === q.content.answer) n++;
  }
  return n;
}
