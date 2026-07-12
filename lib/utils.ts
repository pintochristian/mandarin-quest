import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

/** Loose equality for typed Mandarin/pinyin answers: strips punctuation,
 * whitespace, casing, and tone diacritics so "Nǐ hǎo?", "ni hao", and
 * "NI HAO" can all match — a learner typing plain toneless pinyin (the
 * common case on a standard keyboard) shouldn't fail a match against an
 * authored answer that only lists the toned form. NFD normalization
 * decomposes each toned vowel (e.g. ǎ) into its base letter plus a
 * combining diacritic, which the second replace then strips. */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[.,!?。,!?、\s]/g, "")
    .trim();
}
