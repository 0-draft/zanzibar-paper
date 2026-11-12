// The paper as data: content/en.yaml is the structure, content/<lang>.yaml
// supplies only translated strings keyed by block id.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { invariantTokens, plainText } from "./inline.ts";

export type Block =
  | { id: string; type: "heading"; level: 2 | 3 | 4; num?: string; text: string }
  | { id: string; type: "p" | "note"; text: string }
  | { id: string; type: "ul" | "ol"; items: string[] }
  | { id: string; type: "example"; title: string; items: string[] }
  | { id: string; type: "grammar"; rules: [string, string][] }
  | { id: string; type: "math"; tex: string }
  | { id: string; type: "code"; lang: string; code: string; caption: string }
  | { id: string; type: "figure"; src: string; width: number; height: number; alt: string; caption: string }
  | {
      id: string;
      type: "table";
      variant: "tuples" | "latency";
      title?: string;
      header: string[];
      rows: string[][];
      caption: string;
    }
  | { id: string; type: "refs"; items: { n: number; text: string }[] };

export type BlockType = Block["type"];

export interface Author {
  name: string;
  aff: number[];
  note?: boolean;
}

export interface Source {
  meta: {
    title: string;
    authors: Author[];
    affiliations: string[];
    contact: string;
    venue: string;
    source: { usenix: string; google: string };
  };
  blocks: Block[];
}

/** Translatable fields for each block type. Everything else is copied from en. */
export const TRANSLATABLE: Record<BlockType, readonly string[]> = {
  heading: ["text"],
  p: ["text"],
  note: ["text"],
  ul: ["items"],
  ol: ["items"],
  example: ["title", "items"],
  grammar: [],
  math: [],
  code: ["caption"],
  figure: ["alt", "caption"],
  table: ["title", "header", "rows", "caption"],
  refs: [],
};

export type TranslatedFields = Partial<{
  text: string;
  items: string[];
  title: string;
  caption: string;
  alt: string;
  header: string[];
  rows: string[][];
}>;

export interface Translation {
  lang: string;
  meta: { title: string };
  blocks: Record<string, TranslatedFields>;
}

const CONTENT_DIR = join(process.cwd(), "content");

export function loadSource(dir = CONTENT_DIR): Source {
  return parse(readFileSync(join(dir, "en.yaml"), "utf8")) as Source;
}

export function loadTranslation(lang: string, dir = CONTENT_DIR): Translation {
  return parse(readFileSync(join(dir, `${lang}.yaml`), "utf8")) as Translation;
}

export function availableTranslations(dir = CONTENT_DIR): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") && f !== "en.yaml")
    .map((f) => f.replace(/\.yaml$/, ""))
    .sort();
}

/** Fields of `b` that a translation must provide (an absent optional title is not required). */
export function requiredFields(b: Block): string[] {
  return TRANSLATABLE[b.type].filter((f) => (b as Record<string, unknown>)[f] !== undefined);
}

/** A block merged with its translation; untranslatable fields come from en. */
export function localize(b: Block, t: TranslatedFields | undefined): Block {
  if (!t) return b;
  const merged: Record<string, unknown> = { ...b };
  for (const f of requiredFields(b)) {
    const v = (t as Record<string, unknown>)[f];
    if (v !== undefined) merged[f] = v;
  }
  return merged as Block;
}

const CJK_LANGS = new Set(["ja", "zh-Hans", "zh-Hant", "ko"]);
const CJK = /[぀-ヿ㐀-鿿가-힯]/;
const LETTER = /\p{L}/u;

function sameTokens(a: string, b: string) {
  const x = invariantTokens(a);
  const y = invariantTokens(b);
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

/** True when a string has no human words outside code/math: copy it verbatim. */
function isLiteral(s: string): boolean {
  const stripped = s.replace(/`[^`]*`/g, "").replace(/\$[^$]*\$/g, "");
  return !LETTER.test(stripped);
}

/**
 * Structural and token-level checks of one translation against the source.
 * Returns human-readable problems; an empty list means the file is consistent.
 */
export function validateTranslation(src: Source, tr: Translation): string[] {
  const errs: string[] = [];
  const lang = tr.lang;
  const where = (id: string, f: string) => `${lang}:${id}.${f}`;

  if (!tr.meta?.title?.trim()) errs.push(`${lang}: meta.title is missing`);
  if (!tr.blocks || typeof tr.blocks !== "object") return [...errs, `${lang}: blocks is missing`];

  const expected = new Map(src.blocks.filter((b) => requiredFields(b).length > 0).map((b) => [b.id, b]));
  for (const id of Object.keys(tr.blocks)) {
    if (!expected.has(id)) errs.push(`${lang}: unknown or untranslatable block id "${id}"`);
  }

  const checkString = (id: string, f: string, en: string, t: unknown, type: BlockType) => {
    if (typeof t !== "string" || !t.trim()) {
      errs.push(`${where(id, f)} must be a non-empty string`);
      return;
    }
    if (!sameTokens(en, t)) {
      errs.push(
        `${where(id, f)} code/math/link tokens differ\n    en: ${invariantTokens(en).join(" | ")}\n    ${lang}: ${invariantTokens(t).join(" | ")}`,
      );
    }
    if (isLiteral(en)) {
      if (t !== en) errs.push(`${where(id, f)} is literal in en and must be copied verbatim: ${JSON.stringify(en)}`);
      return;
    }
    const plain = plainText(t);
    if (/\bTODO\b|\bFIXME\b|�/.test(t)) errs.push(`${where(id, f)} contains a placeholder or broken character`);
    if (CJK_LANGS.has(lang) && plainText(en).length > 30 && !CJK.test(plain)) {
      errs.push(`${where(id, f)} looks untranslated (no CJK characters)`);
    }
    if (type !== "heading" && plainText(en).length > 60 && t === en) {
      errs.push(`${where(id, f)} is identical to the English source`);
    }
  };

  for (const [id, b] of expected) {
    const t = tr.blocks[id];
    if (!t) {
      errs.push(`${lang}: missing block "${id}" (${b.type})`);
      continue;
    }
    // Rows grouped under one label in the source (Safe / Recent) must keep one
    // label per group, or the rowspans of the rendered table fall apart.
    if (b.type === "table" && b.variant === "latency" && Array.isArray(t.rows)) {
      for (let r = 1; r < b.rows.length; r++) {
        const sameGroup = b.rows[r]![0] === b.rows[r - 1]![0];
        const tSame = t.rows[r]?.[0] === t.rows[r - 1]?.[0];
        if (sameGroup !== tSame) errs.push(`${where(id, `rows[${r}][0]`)} must keep the grouping of the source rows`);
      }
    }
    const allowed = new Set(requiredFields(b));
    for (const f of Object.keys(t)) {
      if (!allowed.has(f)) errs.push(`${where(id, f)} is not a translatable field of a ${b.type} block`);
    }
    for (const f of allowed) {
      const en = (b as Record<string, unknown>)[f];
      const v = (t as Record<string, unknown>)[f];
      if (typeof en === "string") {
        checkString(id, f, en, v, b.type);
      } else if (Array.isArray(en) && f === "rows") {
        const rows = en as string[][];
        if (!Array.isArray(v) || v.length !== rows.length) {
          errs.push(`${where(id, f)} must have ${rows.length} rows`);
          continue;
        }
        rows.forEach((row, r) => {
          const tr_row = (v as unknown[])[r];
          if (!Array.isArray(tr_row) || tr_row.length !== row.length) {
            errs.push(`${where(id, `${f}[${r}]`)} must have ${row.length} cells`);
            return;
          }
          row.forEach((cell, c) => {
            checkString(id, `${f}[${r}][${c}]`, cell, tr_row[c], b.type);
          });
        });
      } else if (Array.isArray(en)) {
        const list = en as string[];
        if (!Array.isArray(v) || v.length !== list.length) {
          errs.push(`${where(id, f)} must have ${list.length} items`);
          continue;
        }
        list.forEach((item, k) => {
          if (item === "" && v[k] === "") return; // empty header cell
          checkString(id, `${f}[${k}]`, item, v[k], b.type);
        });
      }
    }
  }
  return errs;
}

/** Checks of the source itself: unique ids, resolvable internal links. */
/** Ids the page uses itself; a block must not take them. */
const RESERVED_IDS = /^(ref-\d+|paper|cite-tip)$/;

export function validateSource(src: Source, figureFiles?: Set<string>): string[] {
  const errs: string[] = [];
  const ids = new Set<string>();
  for (const b of src.blocks) {
    if (!(b.type in TRANSLATABLE)) {
      errs.push(`en: block "${b.id}" has unknown type "${(b as { type: string }).type}"`);
      continue;
    }
    if (!/^[a-z][a-z0-9-]*$/.test(b.id)) errs.push(`en: bad id "${b.id}"`);
    if (RESERVED_IDS.test(b.id)) errs.push(`en: id "${b.id}" is reserved by the page`);
    if (b.type === "heading" && ![2, 3, 4].includes(b.level)) errs.push(`en:${b.id} heading level must be 2, 3 or 4`);
    if (b.type === "figure" && !(Number.isInteger(b.width) && Number.isInteger(b.height))) {
      errs.push(`en:${b.id} figure width and height must be integers`);
    }
    if (ids.has(b.id)) errs.push(`en: duplicate id "${b.id}"`);
    ids.add(b.id);
  }
  const refs = src.blocks.find((b) => b.type === "refs");
  const anchors = new Set([...ids, ...(refs?.type === "refs" ? refs.items.map((r) => `ref-${r.n}`) : [])]);
  for (const b of src.blocks) {
    if (!(b.type in TRANSLATABLE)) continue;
    for (const f of requiredFields(b)) {
      const v = (b as Record<string, unknown>)[f];
      const strings = (Array.isArray(v) ? v.flat() : [v]) as string[];
      for (const s of strings) {
        for (const tok of invariantTokens(s)) {
          if (!tok.startsWith("link:#")) continue;
          const [target, label] = tok.slice(6).split("=");
          if (!anchors.has(target!)) errs.push(`en:${b.id}.${f} links to missing anchor #${target}`);
          if (label !== undefined && `ref-${label}` !== target) {
            errs.push(`en:${b.id}.${f} cites [${label}] but links to #${target}`);
          }
        }
      }
    }
    if (b.type === "figure" && figureFiles && !figureFiles.has(b.src)) {
      errs.push(`en:${b.id} figure file public/figures/${b.src} is missing`);
    }
  }
  return errs;
}
