import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/ai-tutor/systemPrompt";
import type { KnownMaterial } from "@/lib/ai-tutor/known-material";

const known: KnownMaterial = {
  vocab: [
    { script: "你好", romanization: "nǐ hǎo", english: "hello" },
    { script: "我", romanization: "wǒ", english: "I / me" },
  ],
  grammar: [{ title: "I, You, He/She", simpleExplanation: "Pronouns don't change form." }],
};

describe("buildSystemPrompt", () => {
  it("lists every known vocabulary word so the model can be constrained to them", () => {
    const prompt = buildSystemPrompt(known, "steady");
    expect(prompt).toContain("你好 (nǐ hǎo) - hello");
    expect(prompt).toContain("我 (wǒ) - I / me");
  });

  it("lists every known grammar concept", () => {
    const prompt = buildSystemPrompt(known, "steady");
    expect(prompt).toContain("I, You, He/She");
  });

  it("states the hard constraint against introducing unknown material", () => {
    const prompt = buildSystemPrompt(known, "steady");
    expect(prompt.toLowerCase()).toContain("only use vocabulary from the list below");
  });

  it("simplifies further for a struggling learner", () => {
    const prompt = buildSystemPrompt(known, "struggling");
    expect(prompt).toContain("Simplify further");
  });

  it("allows more natural language for a succeeding learner", () => {
    const prompt = buildSystemPrompt(known, "succeeding");
    expect(prompt).toContain("more natural");
  });

  it("includes the scenario when one is provided", () => {
    const prompt = buildSystemPrompt(known, "steady", "Order a coffee.");
    expect(prompt).toContain("Order a coffee.");
  });

  it("handles a learner with no studied material yet without crashing", () => {
    const prompt = buildSystemPrompt({ vocab: [], grammar: [] }, "steady");
    expect(prompt).toContain("none yet");
  });
});
