// Print a translation skeleton for a new language: every translatable field of
// content/en.yaml, in order, with the English text as the starting value.
//
//   node scripts/translation-skeleton.ts ko > content/ko.yaml
//
// Strings are emitted on one line each (no YAML folding): folding would join
// CJK lines with a space.

import { stringify } from "yaml";
import { loadSource, requiredFields } from "../src/lib/content.ts";

const lang = process.argv[2];
if (!lang) {
  console.error("usage: node scripts/translation-skeleton.ts <lang>");
  process.exit(2);
}
const src = loadSource();
const blocks: Record<string, Record<string, unknown>> = {};
for (const b of src.blocks) {
  const fields = requiredFields(b);
  if (!fields.length) continue;
  blocks[b.id] = Object.fromEntries(fields.map((f) => [f, (b as Record<string, unknown>)[f]]));
}
process.stdout.write(
  `# ${lang} translation of content/en.yaml. Translate the values; keep ids, keys and order.\n` +
    stringify({ lang, meta: { title: src.meta.title }, blocks }, { lineWidth: 0 }),
);
