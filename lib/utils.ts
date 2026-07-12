import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const CURLY_APOSTROPHES = /[‘’]/g;

/** Loose equality for typed Mandarin/English/pinyin answers: strips
 * punctuation, whitespace, casing, and tone diacritics so "Nǐ hǎo?",
 * "ni hao", and "NI HAO" can all match — a learner typing plain toneless
 * pinyin (the common case on a standard keyboard) shouldn't fail a match
 * against an authored answer that only lists the toned form. NFD
 * normalization decomposes each toned vowel (e.g. ǎ) into its base letter
 * plus a combining diacritic, which the second replace then strips — this
 * also collapses ü to plain u, which is intentional (see
 * normalizePinyinAnswer for the full ü/v equivalence). Curly apostrophes
 * are canonicalized to straight ones rather than stripped, since English
 * TRANSLATION answers can legitimately depend on them (e.g. "don't"). */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(CURLY_APOSTROPHES, "'")
    .replace(/[.,!?。,!?、\s]/g, "")
    .trim();
}

/** normalizeAnswer, plus pinyin-specific loosening that would be wrong to
 * apply to general English/Chinese text: apostrophes are dropped entirely
 * (learners rarely bother typing the syllable-divider apostrophe in words
 * like "Xi'an" on a phone keyboard), and a bare "v" is treated as
 * equivalent to "ü" (which normalizeAnswer's diacritic-stripping already
 * reduces to plain "u") — standard pinyin never uses "v" for anything
 * else, so this is safe only in a pinyin context, unlike normalizeAnswer
 * which is also used to grade plain English words that legitimately
 * contain "v" (e.g. "very"). Use this for TYPE_PINYIN-style grading only. */
export function normalizePinyinAnswer(value: string): string {
  return normalizeAnswer(value).replace(/'/g, "").replace(/v/g, "u");
}
