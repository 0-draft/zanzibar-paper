// Edge labels: pick the first spot near the line where the label's plate does
// not cover a box. Used by Graph and Swimlane so labels never sit on nodes.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Estimated text width: CJK and other wide characters take about twice the
// advance of Latin ones at the same size.
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;
export const textWidth = (t: string, mono = false) =>
  [...t].reduce((w, ch) => w + (WIDE.test(ch) ? 13 : mono ? 7.6 : 7.2), 0);

// Advance of 11.5px IBM Plex Sans, roughly, by character class.
const labelChar = (ch: string) =>
  WIDE.test(ch)
    ? 11.8
    : /[A-Z0-9_#@]/.test(ch)
      ? 7.2
      : /[mwMW]/.test(ch)
        ? 8.6
        : /[\s.,:;'|!ijl()[\]]/.test(ch)
          ? 3.4
          : 6.1;

/** Size of an edge label's plate (11.5px text) */
export function labelSize(label: string): { w: number; h: number } {
  const ls = label.split("\n");
  return { w: Math.max(...ls.map((t) => [...t].reduce((w, ch) => w + labelChar(ch), 0))) + 8, h: ls.length * 13.8 + 4 };
}

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Centre of the label. Tries the given point first, then steps along the
 * line's normal on both sides, then along the line itself.
 */
export function placeLabel(
  at: { x: number; y: number },
  line: { ux: number; uy: number; len: number },
  size: { w: number; h: number },
  boxes: Rect[],
  bounds: Rect,
  label = "",
): { x: number; y: number } {
  const nx = -line.uy;
  const ny = line.ux;
  const cands: { x: number; y: number }[] = [at];
  for (const d of [12, 20, 28, 38, 50]) {
    cands.push({ x: at.x + nx * d, y: at.y + ny * d }, { x: at.x - nx * d, y: at.y - ny * d });
  }
  for (const s of [0.25, -0.25, 0.4, -0.4]) {
    const t = s * line.len;
    for (const d of [0, 14, -14, 26, -26])
      cands.push({ x: at.x + line.ux * t + nx * d, y: at.y + line.uy * t + ny * d });
  }
  const pad = 2;
  const fits = (c: { x: number; y: number }) => {
    const r = { x: c.x - size.w / 2 - pad, y: c.y - size.h / 2 - pad, w: size.w + 2 * pad, h: size.h + 2 * pad };
    const inside =
      r.x >= bounds.x && r.y >= bounds.y && r.x + r.w <= bounds.x + bounds.w && r.y + r.h <= bounds.y + bounds.h;
    return inside && !boxes.some((b) => overlaps(r, b));
  };
  const hit = cands.find(fits);
  if (hit && Math.hypot(hit.x - at.x, hit.y - at.y) > 24) {
    console.warn(`diagram: the label "${label}" moved away from its line`);
  }
  if (!hit) {
    // Build-time hint for the figure's author: give the label more room.
    console.warn(`diagram: no free spot for the label "${label}"`);
  }
  return hit ?? at;
}
