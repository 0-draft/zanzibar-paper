#!/usr/bin/env node
// Re-create public/figures/fig-{2,3,4,5}.svg from the published PDF.
//
//   node scripts/extract-figures.mjs path/to/zanzibar.pdf
//
// The PDF itself is not committed. Each figure is exported by poppler's
// pdftocairo as a full-page vector SVG (glyphs as paths, so no font
// dependency), then cropped by rewriting the root size to the figure box and
// shifting the page content with a translate. A viewBox with a non-zero origin
// would be shorter, but some renderers (ImageMagick's MSVG) mis-handle it.
//
// Off-figure content of the page stays in the file but is outside the canvas.
// Pruning it by glyph position is not safe: cairo nests chart labels inside
// transformed groups, so their x/y are not page coordinates.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// page, x, y, width, height — PDF points from the top-left of a US-letter page
export const FIGURES = {
  "fig-2": { page: 6, box: [55, 70, 506, 223] },
  "fig-3": { page: 9, box: [318, 68, 272, 124] },
  "fig-4": { page: 10, box: [50, 68, 252, 124] },
  "fig-5": { page: 11, box: [50, 68, 252, 106] },
};

export function cropSvg(svg, [x, y, w, h]) {
  const root = 'width="612pt" height="792pt" viewBox="0 0 612 792"';
  if (!svg.includes(root)) throw new Error("unexpected pdftocairo root element (not a US-letter page?)");
  const resized = svg.replace(root, `width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"`);
  const open = resized.indexOf(">", resized.indexOf("<svg")) + 1;
  const close = resized.lastIndexOf("</svg>");
  return `${resized.slice(0, open)}<g transform="translate(${-x},${-y})">${resized.slice(open, close)}</g>${resized.slice(close)}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pdf = process.argv[2];
  if (!pdf) {
    console.error("usage: node scripts/extract-figures.mjs <paper.pdf>");
    process.exit(2);
  }
  const work = mkdtempSync(join(tmpdir(), "zp-fig-"));
  try {
    for (const [name, { page, box }] of Object.entries(FIGURES)) {
      const raw = join(work, `${name}.svg`);
      execFileSync("pdftocairo", ["-svg", "-r", "72", "-f", String(page), "-l", String(page), pdf, raw]);
      writeFileSync(join("public", "figures", `${name}.svg`), cropSvg(readFileSync(raw, "utf8"), box));
      console.log(`public/figures/${name}.svg  (page ${page}, box ${box.join(" ")})`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
