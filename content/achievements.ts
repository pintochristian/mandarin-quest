export type AchievementSeed = {
  code: string;
  title: string;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
};

export const achievements: AchievementSeed[] = [
  {
    code: "first-lesson",
    title: "First Steps",
    description: "Complete your first lesson.",
    icon: "footprints",
    criteria: { type: "LESSONS_COMPLETED", count: 1 },
  },
  {
    code: "first-world-unlocked",
    title: "New Horizons",
    description: "Unlock your second world.",
    icon: "map",
    criteria: { type: "MODULES_UNLOCKED", count: 2 },
  },
  {
    code: "streak-7",
    title: "One Week Strong",
    description: "Keep a 7-day streak.",
    icon: "flame",
    criteria: { type: "STREAK_DAYS", count: 7 },
  },
  {
    code: "words-50",
    title: "Fifty Words In",
    description: "Learn 50 vocabulary words.",
    icon: "book-open",
    criteria: { type: "WORDS_LEARNED", count: 50 },
  },
  {
    code: "first-speaking",
    title: "Found Your Voice",
    description: "Complete your first speaking exercise.",
    icon: "mic",
    criteria: { type: "SPEAKING_ATTEMPTS", count: 1 },
  },
];
