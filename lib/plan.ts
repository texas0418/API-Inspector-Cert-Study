// lib/plan.ts — simple exam-date study planner.

import type { Exam } from './types';

export interface PlanStat {
  daysLeft: number | null;
  perDay: number | null;
}

export function planFor(
  targetIso: string | undefined,
  remainingQuestions: number
): PlanStat {
  if (!targetIso) return { daysLeft: null, perDay: null };
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  const perDay = daysLeft > 0 ? Math.ceil(remainingQuestions / daysLeft) : remainingQuestions;
  return { daysLeft, perDay };
}

export function examLabel(exam: Exam): string {
  return `API ${exam}`;
}
