/**
 * Survey content: CORE (30) + ROMANCE add-on (5).
 * Sections and weights used by scoring in matching.ts and RPC.
 */

export type SectionId = "personality" | "values" | "emotional" | "lifestyle" | "social" | "romance";

export type CoreQuestion = { id: string; section: SectionId; prompt: string; reverse?: boolean };
export type RomanceQuestion = { id: string; section: "romance"; prompt: string };

export const CORE_QUESTIONS: CoreQuestion[] = [
  // personality (8)
  { id: "P1", section: "personality", prompt: "I gain energy from being around people." },
  { id: "P2", section: "personality", prompt: "I like having a clear plan rather than going with the flow." },
  { id: "P3", section: "personality", prompt: "I handle stress well and stay calm under pressure." },
  { id: "P4", section: "personality", prompt: "I enjoy trying new things even if they're unfamiliar." },
  { id: "P5", section: "personality", prompt: "I try to understand other people's feelings before reacting." },
  { id: "P6", section: "personality", prompt: "I prefer a predictable routine over spontaneous plans." },
  { id: "P7", section: "personality", prompt: "I open up about my thoughts easily." },
  { id: "P8", section: "personality", prompt: "I like leading group decisions rather than following." },
  // values (7)
  { id: "V1", section: "values", prompt: "Career success is very important to me." },
  { id: "V2", section: "values", prompt: "I value independence more than emotional closeness." },
  { id: "V3", section: "values", prompt: "I want my life to be structured and stable." },
  { id: "V4", section: "values", prompt: "I'm comfortable taking risks to pursue goals." },
  { id: "V5", section: "values", prompt: "I prioritize friendships and relationships over achievements." },
  { id: "V6", section: "values", prompt: "I prefer a simple life rather than a highly ambitious one." },
  { id: "V7", section: "values", prompt: "I want people around me who challenge me to grow." },
  // emotional (6)
  { id: "E1", section: "emotional", prompt: "I talk through problems rather than avoiding them." },
  { id: "E2", section: "emotional", prompt: "I need reassurance from people close to me." },
  { id: "E3", section: "emotional", prompt: "I handle disagreements calmly." },
  { id: "E4", section: "emotional", prompt: "I prefer direct honesty even if it's uncomfortable." },
  { id: "E5", section: "emotional", prompt: "I withdraw when I'm upset rather than discussing it." },
  { id: "E6", section: "emotional", prompt: "I like frequent communication with people close to me." },
  // lifestyle (5)
  { id: "L1", section: "lifestyle", prompt: "I keep a consistent sleep schedule." },
  { id: "L2", section: "lifestyle", prompt: "I enjoy going out socially multiple times a week." },
  { id: "L3", section: "lifestyle", prompt: "I'm very organized about my space and belongings." },
  { id: "L4", section: "lifestyle", prompt: "I prefer quiet nights over busy events." },
  { id: "L5", section: "lifestyle", prompt: "I like working/studying with others rather than alone." },
  // social (4)
  { id: "S1", section: "social", prompt: "I enjoy deep conversations more than small talk." },
  { id: "S2", section: "social", prompt: "I like making plans in advance rather than last minute." },
  { id: "S3", section: "social", prompt: "Humor is very important in my relationships." },
  { id: "S4", section: "social", prompt: "I want people around me who share my daily habits." },
];

export const ROMANCE_QUESTIONS: RomanceQuestion[] = [
  { id: "R1", section: "romance", prompt: "I want a long-term relationship rather than something casual." },
  { id: "R2", section: "romance", prompt: "Physical affection is important to me." },
  { id: "R3", section: "romance", prompt: "I need a lot of personal space in relationships." },
  { id: "R4", section: "romance", prompt: "I want a partner who is emotionally expressive." },
  { id: "R5", section: "romance", prompt: "I prefer slow-developing relationships over intense ones." },
];

/** All core question ids in order. */
export const CORE_QUESTION_IDS = CORE_QUESTIONS.map((q) => q.id);
/** All romance question ids. */
export const ROMANCE_QUESTION_IDS = ROMANCE_QUESTIONS.map((q) => q.id);

/** Section weights for CORE only (sum = 1). */
export const CORE_SECTION_WEIGHTS: Record<SectionId, number> = {
  personality: 0.3,
  values: 0.25,
  emotional: 0.2,
  lifestyle: 0.15,
  social: 0.1,
  romance: 0,
};

/** When romance add-on is used: core total 0.85, romance 0.15. Core section weights scaled by 0.85. */
export const ROMANCE_MODE_CORE_SCALE = 0.85;
export const ROMANCE_SECTION_WEIGHT = 0.15;

/** Id -> section for core questions. */
export const CORE_ID_TO_SECTION: Record<string, SectionId> = Object.fromEntries(
  CORE_QUESTIONS.map((q) => [q.id, q.section])
);

/** Id -> prompt for reasons generation. */
export const ALL_PROMPTS: Record<string, string> = {
  ...Object.fromEntries(CORE_QUESTIONS.map((q) => [q.id, q.prompt])),
  ...Object.fromEntries(ROMANCE_QUESTIONS.map((q) => [q.id, q.prompt])),
};
