/**
 * تطبيع النص العربي للمقارنة والبحث — لا للعرض. يوحّد الكتابات الشائعة
 * («اكورد» = «أكورد»، «النترا» = «إلنترا»، «٢٠٢٢» = «2022») حتى يجد العميل
 * ما يقصده كيفما كتبه.
 */
import { toLatinDigits } from "./format";

export function normalizeArabic(text: string): string {
  return toLatinDigits(text)
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
