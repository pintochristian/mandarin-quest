import { describe, it, expect } from "vitest";
import { resolveInteractionMode } from "@/lib/interaction-mode";
import type { InteractionMode } from "@/lib/generated/prisma/enums";

const ALL_MODES: InteractionMode[] = [
  "MIC_SPEAKING",
  "TYPE_PINYIN",
  "TYPE_ENGLISH_GUIDED",
  "WORD_TILE_SELECT",
  "SENTENCE_REORDER",
  "DIALOGUE_CHOICE",
  "SHADOW_LISTEN",
  "AI_TEXT_CHAT",
];
const NON_MIC_MODES = ALL_MODES.filter((m) => m !== "MIC_SPEAKING");

describe("resolveInteractionMode", () => {
  it("picks MIC_SPEAKING for Full Speaking when the mic is available", () => {
    const mode = resolveInteractionMode("FULL_SPEAKING", ALL_MODES, true);
    expect(mode).toBe("MIC_SPEAKING");
  });

  it("never picks MIC_SPEAKING for Full Speaking when the mic is unavailable", () => {
    const mode = resolveInteractionMode("FULL_SPEAKING", ALL_MODES, false);
    expect(mode).not.toBe("MIC_SPEAKING");
    expect(NON_MIC_MODES).toContain(mode);
  });

  it("never picks MIC_SPEAKING for Quiet mode, even when the mic is available", () => {
    const mode = resolveInteractionMode("QUIET", ALL_MODES, true);
    expect(mode).not.toBe("MIC_SPEAKING");
  });

  it("never picks MIC_SPEAKING for Typing-only mode", () => {
    const mode = resolveInteractionMode("TYPING_ONLY", ALL_MODES, true);
    expect(mode).not.toBe("MIC_SPEAKING");
  });

  it("never picks MIC_SPEAKING for Listening-only mode", () => {
    const mode = resolveInteractionMode("LISTENING_ONLY", ALL_MODES, true);
    expect(mode).not.toBe("MIC_SPEAKING");
  });

  it("prefers typed pinyin for Quiet mode when available", () => {
    const mode = resolveInteractionMode("QUIET", ALL_MODES, false);
    expect(mode).toBe("TYPE_PINYIN");
  });

  it("prefers shadow-listening for Listening-only mode when available", () => {
    const mode = resolveInteractionMode("LISTENING_ONLY", ALL_MODES, false);
    expect(mode).toBe("SHADOW_LISTEN");
  });

  it("always resolves to a supported mode even with a limited supportedModes list", () => {
    const limited: InteractionMode[] = ["AI_TEXT_CHAT"];
    const mode = resolveInteractionMode("FULL_SPEAKING", limited, true);
    expect(mode).toBe("AI_TEXT_CHAT");
  });

  it("resolves every practice mode to a non-mic mode whenever the mic is unavailable, across the full mode list", () => {
    (["FULL_SPEAKING", "QUIET", "TYPING_ONLY", "LISTENING_ONLY"] as const).forEach((pm) => {
      const mode = resolveInteractionMode(pm, ALL_MODES, false);
      expect(mode).not.toBe("MIC_SPEAKING");
    });
  });
});
