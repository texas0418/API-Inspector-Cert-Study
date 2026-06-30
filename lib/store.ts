// lib/store.ts — single persisted zustand store (AsyncStorage).
//
// Holds per-question progress (Leitner box 0..5), unlocked module ids,
// bookmarks, reported items, theme, exam target dates, and session history.
// `unlocked` is never cleared by study or progress resets.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exam, QProgress, SessionResult } from './types';

type ThemePref = 'light' | 'dark' | 'system';

interface StoreState {
  theme: ThemePref;
  progress: Record<string, QProgress>;
  bookmarks: string[];
  reported: string[];
  unlocked: string[]; // product ids owned
  examTargets: Partial<Record<Exam, string>>; // ISO date strings
  history: SessionResult[];

  setTheme: (t: ThemePref) => void;
  recordAnswer: (qid: string, correct: boolean) => void;
  toggleBookmark: (qid: string) => void;
  markReported: (qid: string) => void;
  setUnlocked: (ids: string[]) => void;
  addUnlocked: (id: string) => void;
  setExamTarget: (exam: Exam, iso: string) => void;
  addHistory: (r: SessionResult) => void;
  resetProgress: () => void;
}

const EMPTY: QProgress = { box: 0, seen: 0, correct: 0 };

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      progress: {},
      bookmarks: [],
      reported: [],
      unlocked: [],
      examTargets: {},
      history: [],

      setTheme: (t) => set({ theme: t }),

      recordAnswer: (qid, correct) =>
        set((state) => {
          const prev = state.progress[qid] ?? EMPTY;
          const box = correct ? Math.min(5, prev.box + 1) : 0;
          const next: QProgress = {
            box,
            seen: prev.seen + 1,
            correct: prev.correct + (correct ? 1 : 0),
            lastWrongAt: correct ? prev.lastWrongAt : Date.now(),
            lastSeenAt: Date.now(),
          };
          return { progress: { ...state.progress, [qid]: next } };
        }),

      toggleBookmark: (qid) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(qid)
            ? state.bookmarks.filter((x) => x !== qid)
            : [...state.bookmarks, qid],
        })),

      markReported: (qid) =>
        set((state) => ({
          reported: state.reported.includes(qid)
            ? state.reported
            : [...state.reported, qid],
        })),

      setUnlocked: (ids) => set({ unlocked: Array.from(new Set(ids)) }),

      addUnlocked: (id) =>
        set((state) => ({
          unlocked: state.unlocked.includes(id)
            ? state.unlocked
            : [...state.unlocked, id],
        })),

      setExamTarget: (exam, iso) =>
        set((state) => ({ examTargets: { ...state.examTargets, [exam]: iso } })),

      addHistory: (r) =>
        set((state) => ({ history: [r, ...state.history].slice(0, 200) })),

      resetProgress: () => set({ progress: {}, history: [] }),
    }),
    {
      name: 'api-inspector-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        theme: s.theme,
        progress: s.progress,
        bookmarks: s.bookmarks,
        reported: s.reported,
        unlocked: s.unlocked,
        examTargets: s.examTargets,
        history: s.history,
      }),
    }
  )
);

// ---- derived selectors (pure helpers over a progress map) ----

export function blockReadiness(
  progress: Record<string, QProgress>,
  ids: string[]
): number {
  if (ids.length === 0) return 0;
  let answered = 0;
  for (const id of ids) {
    const p = progress[id];
    if (p && p.correct > 0) answered++;
  }
  return Math.round((100 * answered) / ids.length);
}

// Order: most-recently-wrong first, then unseen, then weaker (lower-box) first.
// Ties are shuffled so repeated sessions vary.
export function weakFirstOrder(
  progress: Record<string, QProgress>,
  ids: string[]
): string[] {
  const jitter = () => Math.random() - 0.5;
  return ids
    .map((id) => ({ id, p: progress[id] }))
    .sort((a, b) => {
      const aw = a.p?.lastWrongAt ?? 0;
      const bw = b.p?.lastWrongAt ?? 0;
      if (aw !== bw) return bw - aw; // recent wrong first
      const aSeen = a.p?.seen ?? 0;
      const bSeen = b.p?.seen ?? 0;
      if ((aSeen === 0) !== (bSeen === 0)) return aSeen === 0 ? -1 : 1; // unseen next
      const ab = a.p?.box ?? 0;
      const bb = b.p?.box ?? 0;
      if (ab !== bb) return ab - bb; // weaker box first
      return jitter();
    })
    .map((x) => x.id);
}
