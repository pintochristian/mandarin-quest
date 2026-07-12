import { describe, it, expect } from "vitest";
import { normalizeAnswer, normalizePinyinAnswer } from "@/lib/utils";

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

  it("canonicalizes curly apostrophes to straight ones, without dropping them", () => {
    expect(normalizeAnswer("don’t")).toBe(normalizeAnswer("don't"));
    expect(normalizeAnswer("don't")).not.toBe(normalizeAnswer("dont"));
  });

  it("does not corrupt genuine English words containing v", () => {
    // normalizeAnswer (unlike normalizePinyinAnswer) must never map v->u,
    // since that would break plain English TRANSLATION answers.
    expect(normalizeAnswer("very")).toBe("very");
    expect(normalizeAnswer("have")).toBe("have");
  });
});

describe("normalizePinyinAnswer", () => {
  it("matches toned, toneless, and mixed-case variants of the same syllables", () => {
    const variants = ["Nǐ hǎo", "ni hao", "Ni Hao", "nǐhǎo", "NIHAO"];
    const normalized = variants.map(normalizePinyinAnswer);
    expect(new Set(normalized).size).toBe(1);
  });

  it("treats v and ü as equivalent", () => {
    expect(normalizePinyinAnswer("nv")).toBe(normalizePinyinAnswer("nü"));
    expect(normalizePinyinAnswer("lve")).toBe(normalizePinyinAnswer("lüe"));
    expect(normalizePinyinAnswer("Nǚ")).toBe(normalizePinyinAnswer("nv"));
  });

  it("ignores syllable-divider apostrophes learners often skip on mobile", () => {
    expect(normalizePinyinAnswer("xi'an")).toBe(normalizePinyinAnswer("xian"));
  });

  it("still distinguishes genuinely different pinyin", () => {
    expect(normalizePinyinAnswer("mai")).not.toBe(normalizePinyinAnswer("mei"));
    expect(normalizePinyinAnswer("shi")).not.toBe(normalizePinyinAnswer("si"));
  });
});
