// Blocks → HTML rows. Each row puts the original on the left and the
// translation on the right in one grid row, so paired paragraphs always start
// at the same height without any scroll syncing.

import { type Block, localize, type Source, type Translation } from "./content.ts";
import { escapeHtml, renderInline, renderMath } from "./inline.ts";

export interface Row {
  id: string;
  type: Block["type"];
  /** Rendered once across both columns (figure art, code, TeX, grammar, references) */
  shared?: string;
  /** Original column */
  en?: string;
  /** Translation column */
  tr?: string;
}

export interface TocEntry {
  id: string;
  level: number;
  num?: string;
  en: string;
  tr: string;
}

const list = (tag: "ul" | "ol", items: string[]) =>
  `<${tag}>${items.map((i) => `<li>${renderInline(i)}</li>`).join("")}</${tag}>`;

function heading(b: Extract<Block, { type: "heading" }>): string {
  const num = b.num ? `<span class="num">${escapeHtml(b.num)}</span>` : "";
  return `<h${b.level}>${num}<span class="htext">${renderInline(b.text)}</span></h${b.level}>`;
}

function table(b: Extract<Block, { type: "table" }>): string {
  const head = b.header.map((h) => `<th scope="col">${h ? renderInline(h) : ""}</th>`).join("");
  let body = "";
  if (b.variant === "latency") {
    // first column groups rows (Safe / Recent): emit it once with rowspan
    b.rows.forEach((row, r) => {
      const group = row[0]!;
      const first = r === 0 || b.rows[r - 1]![0] !== group;
      const span = b.rows.filter((x) => x[0] === group).length;
      const groupCell = first ? `<th scope="rowgroup" rowspan="${span}" class="group">${renderInline(group)}</th>` : "";
      const api = `<th scope="row">${renderInline(row[1]!)}</th>`;
      const nums = row
        .slice(2)
        .map((c) => `<td class="n">${renderInline(c)}</td>`)
        .join("");
      body += `<tr${first && r > 0 ? ' class="group-start"' : ""}>${groupCell}${api}${nums}</tr>`;
    });
  } else {
    body = b.rows.map((row) => `<tr>${row.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`).join("");
  }
  const title =
    b.title && b.variant === "latency"
      ? `<tr class="span-title"><td colspan="2"></td><th colspan="${b.header.length - 2}" scope="colgroup">${renderInline(b.title)}</th></tr>`
      : "";
  return (
    `<figure class="table table-${b.variant}"><div class="scroll" tabindex="0">` +
    `<table><thead>${title}<tr>${head}</tr></thead><tbody>${body}</tbody></table></div>` +
    `<figcaption>${renderInline(b.caption)}</figcaption></figure>`
  );
}

/** HTML of one column for blocks that are fully translated. */
export function renderSide(b: Block): string {
  switch (b.type) {
    case "heading":
      return heading(b);
    case "p":
      return `<p>${renderInline(b.text)}</p>`;
    case "note":
      return `<p class="note"><span aria-hidden="true">∗</span> ${renderInline(b.text)}</p>`;
    case "ul":
    case "ol":
      return list(b.type, b.items);
    case "example":
      return `<div class="example"><p class="example-title">${renderInline(b.title)}</p>${list("ol", b.items)}</div>`;
    case "table":
      return table(b);
    case "code":
    case "figure":
      return `<p class="caption">${renderInline(b.caption)}</p>`;
    default:
      return "";
  }
}

/** HTML rendered once across both columns, or undefined for paired-only blocks. */
export function renderShared(b: Block, base: string): string | undefined {
  switch (b.type) {
    case "grammar":
      return `<div class="grammar" role="table" aria-label="Relation tuple text notation">${b.rules
        .map(
          ([lhs, rhs]) =>
            `<div role="row"><span role="rowheader" class="lhs">⟨${escapeHtml(lhs)}⟩</span><span role="cell" class="op">::=</span><span role="cell" class="rhs">${escapeHtml(rhs)}</span></div>`,
        )
        .join("")}</div>`;
    case "math":
      return `<div class="math" tabindex="0" role="group" aria-label="formula">${renderMath(b.tex, true)}</div>`;
    case "code":
      return `<pre class="codeblock" tabindex="0"><code>${escapeHtml(b.code)}</code></pre>`;
    case "figure":
      return `<div class="plate"><img src="${escapeHtml(`${base}figures/${b.src}`)}" width="${b.width}" height="${b.height}" alt="${escapeHtml(b.alt)}" loading="lazy" decoding="async"></div>`;
    case "refs":
      return `<ol class="refs">${b.items
        .map((r) => `<li id="ref-${r.n}" value="${r.n}">${renderInline(r.text)}</li>`)
        .join("")}</ol>`;
    default:
      return undefined;
  }
}

/** Figure alt text in the reader's language (the art itself is the original). */
function sharedFor(b: Block, tb: Block, base: string): string | undefined {
  if (b.type === "figure" && tb.type === "figure") return renderShared({ ...b, alt: tb.alt }, base);
  return renderShared(b, base);
}

export function buildRows(src: Source, tr: Translation, base: string): Row[] {
  return src.blocks.map((b) => {
    const tb = localize(b, tr.blocks[b.id]);
    const row: Row = { id: b.id, type: b.type };
    const shared = sharedFor(b, tb, base);
    if (shared !== undefined) row.shared = shared;
    if (b.type !== "grammar" && b.type !== "math" && b.type !== "refs") {
      row.en = renderSide(b);
      row.tr = renderSide(tb);
    }
    return row;
  });
}

export function buildToc(src: Source, tr: Translation, maxLevel = 3): TocEntry[] {
  return src.blocks.flatMap((b) => {
    if (b.type !== "heading" || b.level > maxLevel) return [];
    const tb = localize(b, tr.blocks[b.id]) as typeof b;
    const e: TocEntry = { id: b.id, level: b.level, en: renderInline(b.text), tr: renderInline(tb.text) };
    if (b.num) e.num = b.num;
    return [e];
  });
}
