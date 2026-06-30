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
  { id: '653', title: 'API 653', subtitle: 'Aboveground Storage Tank Inspector', productId: 'unlock_api653' },
  { id: '571', title: 'API 571', subtitle: 'Corrosion & Materials', productId: 'unlock_api571' },
  { id: '577', title: 'API 577', subtitle: 'Welding Inspection & Metallurgy', productId: 'unlock_api577' },
  { id: '580', title: 'API 580', subtitle: 'Risk-Based Inspection', productId: 'unlock_api580' },
];

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

// A module's bank: every question tagged for that exam code.
export function bankForExam(exam: Exam): Question[] {
  return getEveryQuestion().filter((q) => q.exams.includes(exam));
}

export function moduleCounts(): Record<Exam, number> {
  const out = {} as Record<Exam, number>;
  for (const m of MODULES) out[m.id] = bankForExam(m.id).length;
  return out;
}

// Free preview: a stable first-N slice so the sampler is consistent.
export function freeSampler(exam: Exam, n = 10): Question[] {
  return bankForExam(exam).slice(0, n);
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
