/**
 * Compatibility scoring and "why you match" reasons.
 * Likert 1–7: normalize to 0–1, similarity = 1 - |normA - normB|, section weights, final percent.
 */

import {
  CORE_QUESTIONS,
  ROMANCE_QUESTIONS,
  ROMANCE_QUESTION_IDS,
  CORE_SECTION_WEIGHTS,
  ROMANCE_MODE_CORE_SCALE,
  ROMANCE_SECTION_WEIGHT,
  CORE_ID_TO_SECTION,
  ALL_PROMPTS,
  type SectionId,
} from "./surveyQuestions";

export type SurveyAnswerMap = Record<string, number>;

/** Normalize 1–7 to 0–1. Clamp invalid to 0. */
export function normalizeAnswer(value: number): number {
  if (typeof value !== "number" || value < 1 || value > 7) return 0;
  return (value - 1) / 6;
}

/** Similarity for one question: 1 - |normA - normB|. */
export function questionSimilarity(a: number, b: number): number {
  const na = normalizeAnswer(a);
  const nb = normalizeAnswer(b);
  return 1 - Math.abs(na - nb);
}

/** Section sim = average of question similarities in that section (only answered pairs). */
function sectionSimilarity(
  coreA: SurveyAnswerMap,
  coreB: SurveyAnswerMap,
  section: SectionId,
  questionIds: string[]
): number {
  let sum = 0;
  let count = 0;
  for (const id of questionIds) {
    const va = coreA[id];
    const vb = coreB[id];
    if (va != null && vb != null) {
      sum += questionSimilarity(va, vb);
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

/** Core section ids and their question ids. */
const CORE_SECTION_IDS: SectionId[] = ["personality", "values", "emotional", "lifestyle", "social"];
const SECTION_TO_CORE_IDS: Record<SectionId, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const s of CORE_SECTION_IDS) m[s] = [];
  for (const q of CORE_QUESTIONS) m[q.section].push(q.id);
  return m as Record<SectionId, string[]>;
})();

/**
 * Compute compatibility score (0–1) and per-section similarities.
 * If useRomance, blend romance section at 15% and scale core by 0.85.
 */
export function computeScore(
  coreA: SurveyAnswerMap,
  coreB: SurveyAnswerMap,
  romanceA: SurveyAnswerMap = {},
  romanceB: SurveyAnswerMap = {},
  useRomance = false
): { score: number; sectionSims: Record<SectionId, number> } {
  const sectionSims: Record<SectionId, number> = {
    personality: 0,
    values: 0,
    emotional: 0,
    lifestyle: 0,
    social: 0,
    romance: 0,
  };

  for (const sec of CORE_SECTION_IDS) {
    sectionSims[sec] = sectionSimilarity(coreA, coreB, sec, SECTION_TO_CORE_IDS[sec]);
  }

  let score: number;
  if (useRomance && ROMANCE_QUESTION_IDS.length > 0) {
    sectionSims.romance = sectionSimilarity(romanceA, romanceB, "romance", ROMANCE_QUESTION_IDS);
    score =
      CORE_SECTION_WEIGHTS.personality * ROMANCE_MODE_CORE_SCALE * sectionSims.personality +
      CORE_SECTION_WEIGHTS.values * ROMANCE_MODE_CORE_SCALE * sectionSims.values +
      CORE_SECTION_WEIGHTS.emotional * ROMANCE_MODE_CORE_SCALE * sectionSims.emotional +
      CORE_SECTION_WEIGHTS.lifestyle * ROMANCE_MODE_CORE_SCALE * sectionSims.lifestyle +
      CORE_SECTION_WEIGHTS.social * ROMANCE_MODE_CORE_SCALE * sectionSims.social +
      ROMANCE_SECTION_WEIGHT * sectionSims.romance;
  } else {
    score =
      CORE_SECTION_WEIGHTS.personality * sectionSims.personality +
      CORE_SECTION_WEIGHTS.values * sectionSims.values +
      CORE_SECTION_WEIGHTS.emotional * sectionSims.emotional +
      CORE_SECTION_WEIGHTS.lifestyle * sectionSims.lifestyle +
      CORE_SECTION_WEIGHTS.social * sectionSims.social;
  }

  return { score, sectionSims };
}

/** Percentage 0–100, deterministic. */
export function scoreToPercent(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

/**
 * Generate 3–5 "why you match" bullets from top sections and top question similarities.
 */
export function generateMatchReasons(
  coreA: SurveyAnswerMap,
  coreB: SurveyAnswerMap,
  romanceA: SurveyAnswerMap = {},
  romanceB: SurveyAnswerMap = {},
  useRomance: boolean
): string[] {
  const { sectionSims } = computeScore(coreA, coreB, romanceA, romanceB, useRomance);
  const bullets: string[] = [];

  const sectionLabels: Record<SectionId, string> = {
    personality: "Personality & energy",
    values: "Values & priorities",
    emotional: "Communication & emotional style",
    lifestyle: "Lifestyle & habits",
    social: "Social style",
    romance: "Relationship preferences",
  };

  const ordered: { section: SectionId; sim: number }[] = CORE_SECTION_IDS
    .concat(useRomance ? ["romance" as SectionId] : [])
    .map((section) => ({ section, sim: sectionSims[section] }))
    .filter((x) => x.sim > 0)
    .sort((a, b) => b.sim - a.sim);

  for (let i = 0; i < Math.min(2, ordered.length); i++) {
    bullets.push(`Similar ${sectionLabels[ordered[i].section].toLowerCase()} (you both align well).`);
  }

  const allCoreIds = CORE_QUESTIONS.map((q) => q.id);
  const allRomanceIds = ROMANCE_QUESTIONS.map((q) => q.id);
  const ids = allCoreIds.concat(useRomance ? allRomanceIds : []);
  const sims: { id: string; sim: number }[] = ids
    .filter((id) => {
      const a = CORE_ID_TO_SECTION[id] ? coreA[id] : romanceA[id];
      const b = CORE_ID_TO_SECTION[id] ? coreB[id] : romanceB[id];
      return a != null && b != null;
    })
    .map((id) => {
      const a = CORE_ID_TO_SECTION[id] ? coreA[id]! : romanceA[id]!;
      const b = CORE_ID_TO_SECTION[id] ? coreB[id]! : romanceB[id]!;
      return { id, sim: questionSimilarity(a, b) };
    })
    .sort((a, b) => b.sim - a.sim || a.id.localeCompare(b.id));

  for (let i = 0; i < Math.min(3, sims.length) && bullets.length < 5; i++) {
    const prompt = ALL_PROMPTS[sims[i].id];
    if (prompt) bullets.push(`"${prompt}" — similar vibe.`);
  }

  return bullets.slice(0, 5);
}

// Legacy exports for backward compatibility with existing matches page until we switch fully to surveys table.
export function answersToVector(
  answers: Record<string, number>,
  questionIds: string[]
): number[] {
  return questionIds.map((id) => answers[id] ?? 0);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const mag = Math.sqrt(normA) * Math.sqrt(normB);
  return mag === 0 ? 0 : dot / mag;
}

export function getMatchExplanation(
  myAnswers: Record<string, number>,
  theirAnswers: Record<string, number>,
  questions: { id: string; text: string }[]
): { topSimilar: { id: string; text: string; diff: number }[]; topDifferent: { id: string; text: string; diff: number }[] } {
  const textById = Object.fromEntries(questions.map((q) => [q.id, q.text]));
  const diffs = questions
    .filter((q) => myAnswers[q.id] != null && theirAnswers[q.id] != null)
    .map((q) => ({
      id: q.id,
      text: textById[q.id] ?? q.id,
      diff: Math.abs((myAnswers[q.id] ?? 0) - (theirAnswers[q.id] ?? 0)),
    }))
    .sort((a, b) => a.diff - b.diff || a.id.localeCompare(b.id));
  const topSimilar = diffs.slice(0, 3);
  const topDifferent = [...diffs].sort((a, b) => b.diff - a.diff || a.id.localeCompare(b.id)).slice(0, 2);
  return { topSimilar, topDifferent };
}
