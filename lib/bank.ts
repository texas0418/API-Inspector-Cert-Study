// lib/bank.ts — the shared tagged pool and the per-exam module engine.
//
// One pool, authored once. Each question carries an `exams` tag listing every
// exam code it appears on. A module's bank is the pool filtered to that code.
// Progress is keyed per question id, so a question shared across modules counts
// once and is never re-answered for progress.

import type { Exam, ModuleDef, Question } from './types';
import poolJson from '../assets/bank_api_pool.json';

export const POOL: Question[] = poolJson as Question[];

export const MODULES: ModuleDef[] = [
  { id: '510', title: 'API 510', subtitle: 'Pressure Vessel Inspector', productId: 'unlock_api510' },
  { id: '570', title: 'API 570', subtitle: 'Piping Inspector', productId: 'unlock_api570' },
  // Withdrawn 2026-09-07: only 53 of its 251 questions are reviewed, and the
  // IAP is removed from sale. Restore it by setting listed back to true once
  // the remaining questions are approved — nothing else needs to change.
  {
    id: '653',
    title: 'API 653',
    subtitle: 'Aboveground Storage Tank Inspector',
    productId: 'unlock_api653',
    listed: false,
  },
];

// Modules to offer on the home screen. A withdrawn module stays visible to
// anyone who already owns it — they paid for it, and hiding it would look
// like the purchase vanished.
export function listedModules(ownedProductIds: string[]): ModuleDef[] {
  return MODULES.filter((m) => m.listed !== false || ownedProductIds.includes(m.productId));
}

export function moduleById(id: Exam): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id);
}

// Canonical dedup-by-id pool (the pool is already unique; this guards merges).
export function getEveryQuestion(): Question[] {
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const q of POOL) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      out.push(q);
    }
  }
  return out;
}

// Only reviewed questions are ever served. The pool carries drafts alongside
// approved work, and until 2026-09-07 every draft was being served and sold:
// the 653 bank is 53 approved of 251, so a paying customer was studying 198
// questions nobody had checked, for a certification exam. 510 and 570 are
// fully approved, so this filter is a no-op for them and it widens on its own
// as questions are approved — no code change needed to restore 653.
export function isApproved(q: Question): boolean {
  return q.meta.reviewStatus === 'approved';
}

// A module's bank: every APPROVED question tagged for that exam code.
// Deliberately filtered here rather than in getEveryQuestion(), which stays
// unfiltered because bookmarks and progress resolve historical ids through it
// — narrowing it would make an existing owner's saved questions disappear.
export function bankForExam(exam: Exam): Question[] {
  return getEveryQuestion().filter((q) => q.exams.includes(exam) && isApproved(q));
}

// Top-level topic for a question (the part before the em dash in the subtopic).
export function topicOf(q: Question): string {
  return q.subtopic.split(' — ')[0].trim();
}

// Distinct topics in a module, each with its question ids, in stable order.
export function topicsForExam(exam: Exam): Array<{ topic: string; ids: string[] }> {
  const map = new Map<string, string[]>();
  for (const q of bankForExam(exam)) {
    const t = topicOf(q);
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(q.id);
  }
  return Array.from(map.entries())
    .map(([topic, ids]) => ({ topic, ids }))
    .sort((a, b) => a.topic.localeCompare(b.topic));
}

// All questions in a module belonging to one top-level topic.
export function questionsForTopic(exam: Exam, topic: string): Question[] {
  return bankForExam(exam).filter((q) => topicOf(q) === topic);
}

export function moduleCounts(): Record<Exam, number> {
  const out = {} as Record<Exam, number>;
  for (const m of MODULES) out[m.id] = bankForExam(m.id).length;
  return out;
}

// Free preview: a random 10 each time so the sampler varies between sessions.
export function freeSampler(exam: Exam, n = 10): Question[] {
  const pool = bankForExam(exam).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

export function productIdForModule(exam: Exam): string {
  return `unlock_api${exam}`;
}

export function moduleForProductId(productId: string): Exam | undefined {
  const m = MODULES.find((x) => x.productId === productId);
  return m?.id;
}

// Deterministic small shuffle helper (seeded) so a given session is stable.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface AssembleOptions {
  count: number;
  seed?: number;
  // optional ordering hook (e.g. weak-first); receives candidate ids, returns ordered ids
  order?: (ids: string[]) => string[];
}

// Assemble a form for an exam, never drawing two questions that share an
// exclusionGroup, and capping any single subtopic so one calc family can't
// dominate a short form.
// eslint-disable-next-line complexity -- tracked in #8
export function assembleForm(exam: Exam, opts: AssembleOptions): Question[] {
  const seed = opts.seed ?? Date.now();
  let pool = bankForExam(exam);
  const ordered = opts.order
    ? opts.order(pool.map((q) => q.id))
        .map((id) => pool.find((q) => q.id === id))
        .filter((q): q is Question => !!q)
    : seededShuffle(pool, seed);

  const usedGroups = new Set<string>();
  const subtopicCount: Record<string, number> = {};
  const cap = Math.max(2, Math.ceil(opts.count / 4)); // per-subtopic soft cap
  const picked: Question[] = [];

  for (const q of ordered) {
    if (picked.length >= opts.count) break;
    const g = q.meta.exclusionGroup;
    if (g && usedGroups.has(g)) continue;
    const sc = subtopicCount[q.subtopic] ?? 0;
    if (sc >= cap && picked.length < opts.count - 1) continue;
    picked.push(q);
    if (g) usedGroups.add(g);
    subtopicCount[q.subtopic] = sc + 1;
  }

  // Relax the subtopic cap if we couldn't fill the form, but still honor groups.
  if (picked.length < opts.count) {
    for (const q of ordered) {
      if (picked.length >= opts.count) break;
      if (picked.some((p) => p.id === q.id)) continue;
      const g = q.meta.exclusionGroup;
      if (g && usedGroups.has(g)) continue;
      picked.push(q);
      if (g) usedGroups.add(g);
    }
  }
  return picked;
}
