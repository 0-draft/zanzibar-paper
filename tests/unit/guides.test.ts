// Guide and ecosystem pages: every English page exists in every language,
// and a translation keeps the page's structure (figures, code) intact.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANGS } from "../../src/i18n/langs.ts";

const ROOT = join(process.cwd(), "src", "content", "guides");
const slugs = (lang: string) =>
  readdirSync(join(ROOT, lang))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
const read = (lang: string, slug: string) => readFileSync(join(ROOT, lang, `${slug}.mdx`), "utf8");
const frontmatter = (src: string) => src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const field = (fm: string, name: string) => fm.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]?.trim();
const components = (src: string) => [...src.matchAll(/<(Graph|Swimlane|Timeline|Callout)\b/g)].map((m) => m[1]);
const codeBlocks = (src: string) => [...src.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1]);
const nodeIds = (src: string) => [...src.matchAll(/\bid: "([^"]+)"/g)].map((m) => m[1]).sort();

const en = slugs("en");
const present = LANGS.map((l) => l.code).filter((c) => {
  try {
    return slugs(c).length > 0;
  } catch {
    return false;
  }
});

describe("guides: English source", () => {
  it("has pages", () => {
    expect(en.length).toBeGreaterThan(0);
  });
  for (const slug of en) {
    it(`${slug} declares its facts check date and section`, () => {
      const fm = frontmatter(read("en", slug));
      expect(field(fm, "checked")).toMatch(/^"?\d{4}-\d{2}-\d{2}"?$/);
      expect(field(fm, "section")).toMatch(/^(guide|ecosystem)$/);
    });
  }
});

describe("guides: translations", () => {
  for (const lang of present.filter((c) => c !== "en")) {
    it(`${lang} has every English page and nothing else`, () => {
      expect(slugs(lang)).toEqual(en);
    });
    for (const slug of en) {
      it(`${lang}/${slug} keeps figures, node ids, code and facts`, () => {
        const a = read("en", slug);
        let b: string;
        try {
          b = read(lang, slug);
        } catch {
          return; // reported by the previous test
        }
        expect(components(b)).toEqual(components(a));
        expect(nodeIds(b)).toEqual(nodeIds(a));
        expect(codeBlocks(b)).toEqual(codeBlocks(a));
        for (const f of ["section", "part", "order", "checked"])
          expect(field(frontmatter(b), f)).toBe(field(frontmatter(a), f));
      });
    }
  }
});
