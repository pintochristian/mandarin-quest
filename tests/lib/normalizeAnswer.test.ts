import { describe, it, expect } from "vitest";
import { normalizeAnswer } from "@/lib/utils";

describe("normalizeAnswer", () => {
  it("lowercases the input", () => {
    expect(normalizeAnswer("Nǐ Hǎo")).toBe(normalizeAnswer("nǐ hǎo"));
  });

  it("strips whitespace", () => {
    expect(normalizeAnswer("ni  hao")).toBe(normalizeAnswer("nihao"));
  });

  it("strips common English and Chinese punctuation", () => {
    expect(normalizeAnswer("你好?")).toBe(normalizeAnswer("你好"));
    expect(normalizeAnswer("Hello!")).toBe(normalizeAnswer("hello"));
  });

  it("treats punctuation/casing/whitespace variants of the same string as equal", () => {
    expect(normalizeAnswer("Nǐ hǎo?")).toBe(normalizeAnswer("nǐ  hǎo"));
  });

  it("strips tone-mark diacritics, so toneless typed pinyin matches a toned authored answer", () => {
    expect(normalizeAnswer("nǐ hǎo")).toBe(normalizeAnswer("ni hao"));
  });
});
