import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Loose equality for typed Mandarin/pinyin answers: strips punctuation,
 * whitespace, and casing so "Nǐ hǎo?" and "ni hao" can both match. */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,!?。,!?、\s]/g, "")
    .trim();
}
