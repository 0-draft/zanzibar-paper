// Languages of the right-hand column. "en" is the original and is always on
// the left; every other code needs content/<code>.yaml and UI strings in ui.ts.

export interface Lang {
  /** BCP 47 tag, used in URLs and the html lang attribute */
  code: string;
  /** Name in its own language */
  native: string;
  /** Name in English, for the language list */
  english: string;
  /** Font stack key, see global.css */
  script: "latin" | "ja" | "zh-Hans" | "zh-Hant" | "ko";
}

export const LANGS: readonly Lang[] = [
  { code: "en", native: "English", english: "English", script: "latin" },
  { code: "ja", native: "日本語", english: "Japanese", script: "ja" },
  { code: "zh-Hans", native: "简体中文", english: "Chinese (Simplified)", script: "zh-Hans" },
  { code: "zh-Hant", native: "繁體中文", english: "Chinese (Traditional)", script: "zh-Hant" },
  { code: "ko", native: "한국어", english: "Korean", script: "ko" },
  { code: "es", native: "Español", english: "Spanish", script: "latin" },
  { code: "fr", native: "Français", english: "French", script: "latin" },
  { code: "de", native: "Deutsch", english: "German", script: "latin" },
  { code: "pt-BR", native: "Português (Brasil)", english: "Portuguese (Brazil)", script: "latin" },
] as const;

export const TRANSLATIONS = LANGS.filter((l) => l.code !== "en");
export const DEFAULT_LANG = "ja";

export function getLang(code: string): Lang {
  const l = LANGS.find((x) => x.code === code);
  if (!l) throw new Error(`unknown language ${code}`);
  return l;
}
