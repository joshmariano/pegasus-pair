/**
 * Single source of truth for survey questions. Used by survey page and matches (explain).
 */
export const QUESTIONS: { id: string; text: string }[] = [
  { id: "group-study", text: "I prefer studying in groups rather than alone." },
  { id: "lead-discussions", text: "I am comfortable leading discussions." },
  { id: "hands-on", text: "I learn best from hands-on projects." },
  { id: "morning-classes", text: "I prefer morning classes over evening." },
  { id: "plan-ahead", text: "I like to plan my schedule well in advance." },
  { id: "last-minute", text: "I am open to last-minute study sessions." },
  { id: "written-feedback", text: "I prefer written feedback over verbal." },
  { id: "deadline-pressure", text: "I work best under deadline pressure." },
  { id: "explain-concepts", text: "I enjoy explaining concepts to others." },
  { id: "sync-collab", text: "I prefer synchronous (real-time) collaboration." },
];

export const QUESTION_IDS = QUESTIONS.map((q) => q.id);
