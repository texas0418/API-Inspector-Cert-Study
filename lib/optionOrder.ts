// lib/optionOrder.ts — deterministic per-session shuffle of a question's options.
//
// Options are stored answer-first in some authoring stages but the bank ships
// pre-shuffled with an explicit `answer` index. For display we re-order per
// session so the same question doesn't always show the answer in one position,
// while staying stable within a session (seeded by session id + question id).

export interface OrderedOptions {
  options: string[];
  answerIndex: number; // new index of the correct option after shuffle
  map: number[]; // map[displayIndex] -> original option index
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function orderOptions(
  sessionId: string,
  questionId: string,
  options: string[],
  answer: number
): OrderedOptions {
  let seed = (hashString(sessionId + ':' + questionId) % 2147483647) || 1;
  const idx = options.map((_, i) => i);
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const options2 = idx.map((i) => options[i]);
  const answerIndex = idx.indexOf(answer);
  return { options: options2, answerIndex, map: idx };
}
