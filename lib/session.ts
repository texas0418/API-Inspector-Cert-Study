// lib/session.ts — ephemeral active-session state (not persisted).
// Holds the questions and answers for the in-progress session so the runner,
// results, and review screens can share them without serializing through route
// params.

import { create } from 'zustand';
import type { Exam, Question, SessionMode } from './types';

interface ActiveSession {
  sessionId: string;
  exam: Exam;
  mode: SessionMode;
  questions: Question[];
  answers: Record<string, number>; // qid -> chosen option index
  start: (exam: Exam, mode: SessionMode, questions: Question[]) => void;
  answer: (qid: string, choice: number) => void;
  clear: () => void;
}

export const useSession = create<ActiveSession>((set) => ({
  sessionId: '',
  exam: '510',
  mode: 'practice',
  questions: [],
  answers: {},
  start: (exam, mode, questions) =>
    set({
      sessionId: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      exam,
      mode,
      questions,
      answers: {},
    }),
  answer: (qid, choice) =>
    set((s) => ({ answers: { ...s.answers, [qid]: choice } })),
  clear: () => set({ sessionId: '', questions: [], answers: {} }),
}));
