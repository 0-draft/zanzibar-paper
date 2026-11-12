// Lint the Japanese translation with textlint.
//
//   node scripts/textlint-ja.ts
//
// content/ja.yaml is YAML, so each translated string is written out as its
// own Markdown file (code spans stay code; TeX becomes a code span so
// textlint does not read it as prose), then textlint runs over them. Files
// are named <block-id>.md so a finding points straight at the block.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadSource, loadTranslation, requiredFields } from "../src/lib/content.ts";

const OUT = join(process.cwd(), ".cache", "textlint", "ja");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const src = loadSource();
const tr = loadTranslation("ja");
const toMd = (s: string) => s.replace(/\$([^$]+)\$/g, "`$1`");

let n = 0;
for (const b of src.blocks) {
  const t = tr.blocks[b.id];
  if (!t) continue;
  // Table cells are terse labels and numbers, not sentences.
  const fields = requiredFields(b).filter((f) => !(b.type === "table" && (f === "rows" || f === "header")));
  const parts: string[] = [];
  for (const f of fields) {
    const v = (t as Record<string, unknown>)[f];
    if (typeof v === "string") parts.push(toMd(v));
    else if (Array.isArray(v)) parts.push((v as string[]).map((x) => `- ${toMd(x)}`).join("\n"));
  }
  // headings and titles are not sentences: as Markdown headings they are
  // exempt from the sentence-ending rule
  if (b.type === "heading" || b.type === "example") parts[0] = `# ${parts[0]}`;
  writeFileSync(join(OUT, `${b.id}.md`), `${parts.join("\n\n")}\n`);
  n++;
}

try {
  execFileSync(join("node_modules", ".bin", "textlint"), ["--config", ".textlintrc.json", OUT], { stdio: "inherit" });
  console.log(`✓ textlint: ${n} Japanese blocks`);
} catch {
  console.error("\ntextlint found problems in content/ja.yaml (file names are block ids).");
  process.exit(1);
}
