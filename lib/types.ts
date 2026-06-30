// lib/types.ts — core data model for the API Inspector question bank.

export type Exam = '510' | '570' | '653' | '571' | '577' | '580';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionContent {
  stem: string;
  options: string[]; // exactly 4
  answer: number; // index 0..3 of the correct option
  explanation: string;
}

export interface QuestionMeta {
  ref: string; // clause / code reference, e.g. "ASME VIII-1 UG-27(c)(1)"
  reviewStatus: string; // "approved" once SME-verified
  exclusionGroup?: string; // near-pairs sharing a group are never drawn together
}

export interface EditionGate {
  doc: string;
  edition: string; // "stable" | "2025" | "2023"
}

export interface Question {
  id: string;
  exams: Exam[]; // every exam code this question surfaces on
  subtopic: string; // e.g. "Calc — Corrosion rate"
  tier: string;
  difficulty: Difficulty;
  content: QuestionContent;
  meta: QuestionMeta;
  editionGate?: EditionGate;
}

export interface ModuleDef {
  id: Exam; // module id == exam code
  title: string;
  subtitle: string;
  productId: string; // RevenueCat / App Store product id
}

// Leitner-style per-question progress.
export interface QProgress {
  box: number; // 0..5
  seen: number;
  correct: number;
  lastWrongAt?: number; // epoch ms of most recent wrong answer
  lastSeenAt?: number;
}

export type SessionMode = 'practice' | 'exam' | 'free';

export interface SessionResult {
  id: string; // session id
  exam: Exam;
  mode: SessionMode;
  at: number; // epoch ms
  total: number;
  correct: number;
  questionIds: string[];
  answers: Record<string, number>; // qid -> chosen option index
}
