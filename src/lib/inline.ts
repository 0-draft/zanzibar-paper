// A deliberately tiny inline markup for paragraph text in content/*.yaml.
//
//   *emphasis*   **strong**   `code`   $tex$   [label](#anchor|https://...)   \x (literal x)
//
// Anything that does not close is kept as literal text, so a stray "*" or "["
// in prose never swallows the rest of a paragraph.

import katex from "katex";

export type Inline =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "math"; value: string }
  | { kind: "em"; children: Inline[] }
  | { kind: "strong"; children: Inline[] }
  | { kind: "link"; href: string; children: Inline[] };

const LINK = /^\[([^[\]]*)\]\(([^)\s]+)\)/;
/** Only in-page anchors and web links: anything else stays literal text. */
const SAFE_HREF = /^(#[A-Za-z0-9_-]+|https?:\/\/[^\s"'<>]+)$/;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ kind: "text", value: buf });
    buf = "";
  };

  let i = 0;
  while (i < src.length) {
    const c = src[i]!;

    if (c === "\\" && i + 1 < src.length) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    if (c === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ kind: "code", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (c === "$") {
      const end = findMathClose(src, i);
      if (end > 0) {
        flush();
        out.push({ kind: "math", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (c === "*" && src[i + 1] === "*") {
      const end = findStrongClose(src, i + 2);
      if (end > i + 2) {
        flush();
        out.push({ kind: "strong", children: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (c === "*" && src[i + 1] !== "*" && src[i + 1] !== " " && src[i + 1] !== undefined) {
      const end = findEmClose(src, i + 1);
      if (end > 0) {
        flush();
        out.push({ kind: "em", children: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    if (c === "[") {
      const m = LINK.exec(src.slice(i));
      if (m && SAFE_HREF.test(m[2]!)) {
        flush();
        out.push({ kind: "link", href: m[2]!, children: parseInline(m[1]!) });
        i += m[0].length;
        continue;
      }
    }

    buf += c;
    i++;
  }
  flush();
  return out;
}

// Pandoc's rule for $…$: the opener is followed by a non-space, the closer
// is preceded by a non-space and not followed by a digit. "$5 and $10" stays
// text.
function findMathClose(src: string, open: number): number {
  const next = src[open + 1];
  if (next === undefined || next === " " || next === "$") return -1;
  for (let j = open + 1; j < src.length; j++) {
    if (src[j] === "\\") {
      j++;
      continue;
    }
    if (src[j] === "$" && src[j - 1] !== " " && !/[0-9]/.test(src[j + 1] ?? "")) return j;
  }
  return -1;
}

// The closing "**" of a strong span, skipping code and math.
function findStrongClose(src: string, from: number): number {
  for (let j = from; j < src.length - 1; j++) {
    const c = src[j];
    if (c === "`") {
      const end = src.indexOf("`", j + 1);
      if (end > j) j = end;
      continue;
    }
    if (c === "$") {
      const end = findMathClose(src, j);
      if (end > 0) j = end;
      continue;
    }
    if (c === "*" && src[j + 1] === "*" && j > from) return j;
  }
  return -1;
}

// The closing "*" of an emphasis: not doubled, not preceded by a space, and
// not inside a code or math span that starts after the opener.
function findEmClose(src: string, from: number): number {
  for (let j = from; j < src.length; j++) {
    const c = src[j];
    if (c === "\\") {
      j++;
      continue;
    }
    if (c === "`") {
      const end = src.indexOf("`", j + 1);
      if (end > j) {
        j = end;
        continue;
      }
    }
    if (c === "$") {
      const end = findMathClose(src, j);
      if (end > 0) {
        j = end;
        continue;
      }
    }
    if (c === "*" && src[j + 1] !== "*" && src[j - 1] !== " " && src[j - 1] !== "*") return j;
  }
  return -1;
}

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (ch) => ESC[ch]!);

export function renderMath(tex: string, displayMode = false): string {
  return katex.renderToString(tex, { displayMode, throwOnError: true, output: "htmlAndMathml", strict: "error" });
}

export function renderNodes(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.kind) {
        case "text":
          return escapeHtml(n.value);
        case "code":
          return `<code>${escapeHtml(n.value)}</code>`;
        case "math":
          return renderMath(n.value);
        case "em":
          return `<em>${renderNodes(n.children)}</em>`;
        case "strong":
          return `<strong>${renderNodes(n.children)}</strong>`;
        case "link": {
          const inner = renderNodes(n.children);
          if (n.href.startsWith("#")) {
            const cls = n.href.startsWith("#ref-") ? ' class="cite"' : "";
            return `<a href="${escapeHtml(n.href)}"${cls}>${inner}</a>`;
          }
          return `<a href="${escapeHtml(n.href)}" rel="noopener" target="_blank">${inner}</a>`;
        }
        default:
          return assertNever(n);
      }
    })
    .join("");
}

function assertNever(n: never): never {
  throw new Error(`unknown inline node ${JSON.stringify(n)}`);
}

export const renderInline = (src: string) => renderNodes(parseInline(src));

// The atoms a translation must carry over unchanged: code spans, TeX and link
// targets. Sorted, so word order may change between languages.
export function invariantTokens(src: string): string[] {
  const acc: string[] = [];
  const walk = (nodes: Inline[]) => {
    for (const n of nodes) {
      if (n.kind === "code") acc.push(`code:${n.value}`);
      else if (n.kind === "math") acc.push(`math:${n.value}`);
      else if (n.kind === "link") {
        // a citation's number is part of what must not change
        acc.push(
          n.href.startsWith("#ref-") ? `link:${n.href}=${plainText(renderNodesText(n.children))}` : `link:${n.href}`,
        );
        walk(n.children);
      } else if (n.kind === "em" || n.kind === "strong") walk(n.children);
    }
  };
  walk(parseInline(src));
  return acc.sort();
}

function renderNodesText(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.kind === "text" || n.kind === "code" || n.kind === "math" ? n.value : renderNodesText(n.children)))
    .join("");
}

// Plain text with markup removed (code and math kept as their source).
export function plainText(src: string): string {
  const walk = (nodes: Inline[]): string =>
    nodes
      .map((n) => {
        if (n.kind === "text" || n.kind === "code" || n.kind === "math") return n.value;
        return walk(n.children);
      })
      .join("");
  return walk(parseInline(src));
}
