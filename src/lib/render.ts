// Blocks → HTML rows. Each row puts the original on the left and the
// translation on the right in one grid row, so paired paragraphs always start
// at the same height without any scroll syncing.

import { type Block, localize, type Source, type Translation } from "./content.ts";
import { escapeHtml, plainText, renderInline, renderMath } from "./inline.ts";

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

function table(b: Extract<Block, { type: "table" }>, withCaption = true): string {
  const head = b.header
    .map((h, i) => (h ? `<th scope="col">${renderInline(h)}</th>` : i === 0 ? "<td></td>" : '<th scope="col"></th>'))
    .join("");
  let body = "";
  let cols = "";
  if (b.variant === "latency") {
    // The first column groups consecutive rows (Safe / Recent): one <tbody>
    // per run, with the group label once as a rowspan header.
    cols = `<colgroup span="2"></colgroup><colgroup span="${b.header.length - 2}"></colgroup>`;
    for (let r = 0; r < b.rows.length; ) {
      let span = 1;
      while (b.rows[r + span]?.[0] === b.rows[r]![0]) span++;
      body += "<tbody>";
      for (let k = 0; k < span; k++) {
        const row = b.rows[r + k]!;
        const group =
          k === 0 ? `<th scope="rowgroup" rowspan="${span}" class="group">${renderInline(row[0]!)}</th>` : "";
        const nums = row
          .slice(2)
          .map((c) => `<td class="n">${renderInline(c)}</td>`)
          .join("");
        body += `<tr>${group}<th scope="row">${renderInline(row[1]!)}</th>${nums}</tr>`;
      }
      body += "</tbody>";
      r += span;
    }
  } else {
    body = `<tbody>${b.rows.map((row) => `<tr>${row.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  }
  const title =
    b.title && b.variant === "latency"
      ? `<tr class="span-title"><td colspan="2"></td><th colspan="${b.header.length - 2}" scope="colgroup">${renderInline(b.title)}</th></tr>`
      : "";
  return (
    `<figure class="table table-${b.variant}"><div class="scroll" tabindex="0">` +
    `<table>${cols}<thead>${title}<tr>${head}</tr></thead>${body}</table></div>` +
    (withCaption ? `<figcaption>${renderInline(b.caption)}</figcaption>` : "") +
    "</figure>"
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

export interface SharedLabels {
  /** Tooltip of the link around a figure, e.g. "Open full size" */
  openFigure: string;
}
const DEFAULT_LABELS: SharedLabels = { openFigure: "Open full size" };

/** HTML rendered once across both columns, or undefined for paired-only blocks. */
export function renderShared(b: Block, base: string, labels: SharedLabels = DEFAULT_LABELS): string | undefined {
  switch (b.type) {
    case "grammar":
      return `<div class="grammar" role="table" aria-label="Relation tuple text notation">${b.rules
        .map(
          ([lhs, rhs]) =>
            `<div role="row"><span role="rowheader" class="lhs">⟨${escapeHtml(lhs)}⟩</span><span role="cell" class="op">::=</span><span role="cell" class="rhs">${escapeHtml(rhs)}</span></div>`,
        )
        .join("")}</div>`;
    case "math":
      return `<div class="math" tabindex="0" role="group" aria-label="Formula">${renderMath(b.tex, true)}</div>`;
    case "code":
      return `<pre class="codeblock" tabindex="0"><code>${escapeHtml(b.code)}</code></pre>`;
    case "figure": {
      const url = escapeHtml(`${base}figures/${b.src}`);
      return `<a class="plate" href="${url}" title="${escapeHtml(labels.openFigure)}" target="_blank" rel="noopener"><img src="${url}" width="${b.width}" height="${b.height}" alt="${escapeHtml(plainText(b.alt))}" loading="lazy" decoding="async"></a>`;
    }
    case "refs":
      return `<ol class="refs">${b.items
        .map(
          (r) =>
            `<li id="ref-${r.n}" value="${r.n}">${r.authors ? `<span class="au">${renderInline(r.authors)}</span> ` : ""}<span class="ti">${renderInline(r.title)}</span>${renderInline(r.rest)}</li>`,
        )
        .join("")}</ol>`;
    default:
      return undefined;
  }
}

function tuplesTable(b: Extract<Block, { type: "table" }>, tb: Extract<Block, { type: "table" }>): string {
  const head =
    `<th scope="col"><span class="h-tr">${renderInline(tb.header[0]!)}</span><span class="h-en" lang="en">${renderInline(b.header[0]!)}</span></th>` +
    `<th scope="col" class="c-en" lang="en">${renderInline(b.header[1]!)}</th>` +
    `<th scope="col" class="c-tr">${renderInline(tb.header[1]!)}</th>`;
  const body = b.rows
    .map(
      (row, r) =>
        `<tr><td class="c-tuple">${renderInline(row[0]!)}</td>` +
        `<td class="c-en" lang="en">${renderInline(row[1]!)}</td>` +
        `<td class="c-tr">${renderInline(tb.rows[r]![1]!)}</td></tr>`,
    )
    .join("");
  return `<figure class="table table-tuples"><div class="scroll" tabindex="0"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></figure>`;
}

const caption = (c: string) => `<p class="caption">${renderInline(c)}</p>`;

/**
 * Rows of the reading view. Notes (the author footnote) are not rows: the
 * page shows them with the byline.
 *
 * - figure: the art is shared, with alt text in the reader's language
 * - latency table: the numbers are identical in every language, so the
 *   table is set once (translated headers) and only the captions pair up
 */
export function buildRows(src: Source, tr: Translation, base: string, labels?: SharedLabels): Row[] {
  return src.blocks
    .filter((b) => b.type !== "note")
    .map((b) => {
      const tb = localize(b, tr.blocks[b.id]);
      const row: Row = { id: b.id, type: b.type };
      if (b.type === "table" && tb.type === "table" && b.variant === "tuples") {
        // the tuple column is notation and identical in every language: set it
        // once, with the meaning in both languages beside it
        row.shared = tuplesTable(b, tb);
        row.en = caption(b.caption);
        row.tr = caption(tb.caption);
        return row;
      }
      if (b.type === "table" && tb.type === "table" && b.variant === "latency") {
        // both versions: the reader's view decides which one shows
        row.shared = `<div class="v-tr">${table(tb, false)}</div><div class="v-en" lang="en">${table(b, false)}</div>`;
        row.en = caption(b.caption);
        row.tr = caption(tb.caption);
        return row;
      }
      const shared = renderShared(
        b.type === "figure" && tb.type === "figure" ? { ...b, alt: tb.alt } : b,
        base,
        labels,
      );
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
