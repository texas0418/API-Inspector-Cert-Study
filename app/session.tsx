import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSession } from '../lib/session';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';
import { mono, withAlpha } from '../lib/theme';
import { orderOptions } from '../lib/optionOrder';
import { reportQuestion } from '../lib/report';
import OptionButton from '../components/OptionButton';
import ProgressBar from '../components/ProgressBar';
import type { SessionResult } from '../lib/types';

// Time budget for the timed exam: per-question seconds x question count.
const EXAM_SECONDS_PER_QUESTION = 90;

function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// eslint-disable-next-line complexity -- tracked in #6
export default function SessionScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const session = useSession();
  const recordAnswer = useStore((s) => s.recordAnswer);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const bookmarks = useStore((s) => s.bookmarks);
  const reported = useStore((s) => s.reported);
  const markReported = useStore((s) => s.markReported);
  const addHistory = useStore((s) => s.addHistory);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const finishedRef = useRef(false);

  const q = session.questions[idx];
  const isPractice = session.mode !== 'exam';
  const isExam = session.mode === 'exam';

  const ordered = useMemo(() => {
    if (!q) return { options: [] as string[], answerIndex: 0, map: [] as number[] };
    return orderOptions(session.sessionId, q.id, q.content.options, q.content.answer);
  }, [session.sessionId, q]);

  // Reset and seed the exam clock when a new session starts.
  useEffect(() => {
    finishedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tracked in #7
    setRemaining(isExam ? session.questions.length * EXAM_SECONDS_PER_QUESTION : null);
  }, [session.sessionId]);

  // Tick the exam clock down once per second.
  useEffect(() => {
    if (!isExam) return;
    const t = setInterval(() => {
      setRemaining((r) => (r === null ? r : Math.max(0, r - 1)));
    }, 1000);
    return () => clearInterval(t);
  }, [isExam, session.sessionId]);

  // Auto-submit when the clock hits zero.
  useEffect(() => {
    if (isExam && remaining === 0) finish();
  }, [remaining, isExam]);

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
  const isReported = reported.includes(q.id);

  async function flag() {
    const r = await reportQuestion(q, '');
    if (r === 'sent') {
      markReported(q.id);
      Alert.alert('Thanks', 'Your flag was sent. We will review this question.');
    } else if (r === 'unavailable') {
      Alert.alert(
        'Email not set up',
        'No mail account is set up on this device, so the flag could not be sent. Set up Mail and try again.'
      );
    } else if (r === 'error') {
      Alert.alert('Could not send', 'Something went wrong opening the mail composer.');
    }
  }

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
    if (finishedRef.current) return;
    finishedRef.current = true;
    // Exams score the whole form (unanswered = wrong). Practice scores only
    // what was actually answered, so an early exit still gives a fair result.
    const considered =
      session.mode === 'exam'
        ? session.questions
        : session.questions.filter((x) => session.answers[x.id] !== undefined);
    const correct = considered.filter(
      (x) => session.answers[x.id] === x.content.answer
    ).length;
    const result: SessionResult = {
      id: session.sessionId,
      exam: session.exam,
      mode: session.mode,
      at: Date.now(),
      total: considered.length,
      correct,
      questionIds: considered.map((x) => x.id),
      answers: session.answers,
    };
    addHistory(result);
    if (session.mode === 'free') router.replace('/free-complete');
    else router.replace('/results');
  }

  function onExit() {
    const answered = session.questions.filter(
      (x) => session.answers[x.id] !== undefined
    ).length;
    if (isPractice && answered > 0) {
      Alert.alert(
        'End practice?',
        `You've answered ${answered} of ${total}. End now and review what you missed?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'End & review', onPress: () => finish() },
        ]
      );
    } else {
      router.back();
    }
  }

  const optState = (i: number): 'idle' | 'correct' | 'wrong' | 'reveal' => {
    if (picked === null) return 'idle';
    if (i === ordered.answerIndex) return 'correct';
    if (i === picked) return 'wrong';
    return 'idle';
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={onExit} hitSlop={10} style={{ paddingRight: 12 }}>
              <Text style={{ color: tokens.accent, fontFamily: mono, fontSize: 15 }}>‹ Exit</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12 }}>
          {session.mode.toUpperCase()} · {idx + 1}/{total}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={flag} hitSlop={8} style={{ marginRight: 16 }}>
            <Text style={{ color: isReported ? tokens.bad : tokens.muted, fontFamily: mono, fontSize: 12 }}>
              {isReported ? '⚑ flagged' : '⚑ flag'}
            </Text>
          </Pressable>
          <Pressable onPress={() => toggleBookmark(q.id)} hitSlop={8}>
            <Text style={{ color: isBookmarked ? tokens.accent : tokens.muted, fontFamily: mono, fontSize: 12 }}>
              {isBookmarked ? '★ saved' : '☆ save'}
            </Text>
          </Pressable>
        </View>
      </View>

      {isExam && remaining !== null && (
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <View
            style={{
              backgroundColor: remaining <= 60 ? withAlpha(tokens.bad, '24') : tokens.panelAlt,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                fontFamily: mono,
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 1,
                color: remaining <= 60 ? tokens.bad : tokens.ink,
              }}
            >
              ⏱ {fmtClock(remaining)}
            </Text>
          </View>
        </View>
      )}

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
    </>
  );
}
