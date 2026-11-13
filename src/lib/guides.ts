// Guide and ecosystem pages: one MDX entry per language, id "<lang>/<slug>".

import { type CollectionEntry, getCollection } from "astro:content";
import { LANGS } from "../i18n/langs.ts";

export type GuideEntry = CollectionEntry<"guides">;
export type Section = "guides" | "ecosystem";

export const SECTION_OF = { guide: "guides", ecosystem: "ecosystem" } as const;

export function splitId(id: string): { lang: string; slug: string } {
  const i = id.indexOf("/");
  return { lang: id.slice(0, i), slug: id.slice(i + 1) };
}

export async function allEntries(): Promise<GuideEntry[]> {
  const entries = await getCollection("guides");
  for (const e of entries) {
    const { lang } = splitId(e.id);
    if (!LANGS.some((l) => l.code === lang)) throw new Error(`guides: unknown language folder in ${e.id}`);
  }
  return entries;
}

export function inSection(entries: GuideEntry[], lang: string, section: Section): GuideEntry[] {
  return entries
    .filter((e) => splitId(e.id).lang === lang && SECTION_OF[e.data.section] === section)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Languages in which this page exists, in the site's language order. */
export function languagesOf(entries: GuideEntry[], slug: string): string[] {
  const have = new Set(entries.filter((e) => splitId(e.id).slug === slug).map((e) => splitId(e.id).lang));
  return LANGS.map((l) => l.code).filter((c) => have.has(c));
}

export const pathOf = (lang: string, section: Section, slug?: string) =>
  slug ? `${lang}/${section}/${slug}/` : `${lang}/${section}/`;
