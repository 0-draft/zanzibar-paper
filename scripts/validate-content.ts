// Validate content/en.yaml and every translation against it.
//
//   node scripts/validate-content.ts          # all languages
//   node scripts/validate-content.ts ja ko    # only these
//
// Exits non-zero on any problem. Also renders every TeX fragment so a broken
// formula fails here rather than at build time.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { LANGS } from "../src/i18n/langs.ts";
import {
  availableTranslations,
  loadSource,
  loadTranslation,
  requiredFields,
  validateSource,
  validateTranslation,
} from "../src/lib/content.ts";
import { invariantTokens, renderMath } from "../src/lib/inline.ts";

const src = loadSource();
const figures = new Set(readdirSync(join(process.cwd(), "public", "figures")));
const problems: string[] = [...validateSource(src, figures)];

const texts: string[] = [];
for (const b of src.blocks) {
  if (b.type === "math") texts.push(`$${b.tex}$`);
  for (const f of requiredFields(b)) {
    const v = (b as Record<string, unknown>)[f];
    texts.push(...((Array.isArray(v) ? v.flat() : [v]) as string[]));
  }
}
for (const t of texts) {
  for (const tok of invariantTokens(t)) {
    if (!tok.startsWith("math:")) continue;
    try {
      renderMath(tok.slice(5));
    } catch (e) {
      problems.push(`en: TeX does not render: ${tok.slice(5)}\n    ${(e as Error).message}`);
    }
  }
}

const requested = process.argv.slice(2);
const langs = requested.length ? requested : availableTranslations();
for (const lang of langs) {
  if (!LANGS.some((l) => l.code === lang)) problems.push(`${lang}: not registered in src/i18n/langs.ts`);
  let tr: ReturnType<typeof loadTranslation>;
  try {
    tr = loadTranslation(lang);
  } catch (e) {
    problems.push(`${lang}: cannot read content/${lang}.yaml: ${(e as Error).message}`);
    continue;
  }
  if (tr.lang !== lang) problems.push(`${lang}: "lang" field is ${JSON.stringify(tr.lang)}`);
  problems.push(...validateTranslation(src, tr));
}
for (const l of LANGS) {
  if (l.code !== "en" && !availableTranslations().includes(l.code)) {
    problems.push(`${l.code}: registered in src/i18n/langs.ts but content/${l.code}.yaml is missing`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join("\n"));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`✓ en + ${langs.length} translation(s): ${langs.join(", ")}`);
