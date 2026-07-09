type MistakeInput =
  | {
      kind: "MULTIPLE_CHOICE" | "LISTENING" | "DIALOGUE_CHOICE";
      selectedText: string;
      correctText: string;
    }
  | { kind: "FILL_BLANK"; selected: string; correct: string }
  | { kind: "SENTENCE_ORDER"; submitted: string[]; correct: string[] }
  | {
      kind: "TRANSLATION";
      promptText: string;
      submittedText: string;
      correctText: string;
      sourceLang: "en" | "zh";
    };

/**
 * Fire-and-forget mistake report — same pattern as lib/settings-client.ts.
 * Never blocks or throws in the caller: a failed mistake log shouldn't
 * interrupt the learner's exercise flow.
 */
export function reportMistake(exerciseId: string, input: MistakeInput) {
  fetch("/api/mistakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseId, input }),
  }).catch(() => {});
}
