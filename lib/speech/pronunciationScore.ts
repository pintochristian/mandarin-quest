/**
 * Pronunciation scoring behind a swappable interface.
 *
 * IMPORTANT LIMITATION: the browser Web Speech API only gives us
 * speech-*to-text* — it does not expose acoustic/pitch data, so there is no
 * way to measure actual Mandarin tone accuracy from it. `HeuristicScorer`
 * approximates both scores from how closely the recognized text matches
 * the target characters, which is a genuinely useful signal (a
 * mis-recognized word usually does mean the pronunciation was off) but is
 * NOT ground-truth acoustic tone analysis. Swap in a real acoustic model
 * (e.g. Azure Pronunciation Assessment) behind this same interface later —
 * call sites won't need to change.
 */
export interface PronunciationScorer {
  score(params: { transcript: string; targetScript: string }): {
    accuracyScore: number;
    toneScore: number;
    isHeuristic: boolean;
  };
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function normalize(text: string): string {
  return text.replace(/[.,!?。,!?、\s]/g, "");
}

export const heuristicScorer: PronunciationScorer = {
  score({ transcript, targetScript }) {
    const a = normalize(transcript);
    const b = normalize(targetScript);
    if (b.length === 0) return { accuracyScore: 0, toneScore: 0, isHeuristic: true };

    const distance = levenshtein(a, b);
    const accuracyScore = Math.max(0, 1 - distance / b.length);
    // Tone score is deliberately a conservative shrink of the accuracy
    // score, not an independent measurement — see interface doc above.
    const toneScore = accuracyScore * 0.85;

    return { accuracyScore, toneScore, isHeuristic: true };
  },
};
