// Progressive enhancement for the reading page. Everything here is optional:
// without JS the page is still a complete side-by-side text with working
// language links and a table of contents.

type View = "both" | "original" | "translation";
type Theme = "system" | "light" | "dark";

const root = document.documentElement;
const rows = [...document.querySelectorAll<HTMLElement>(".paper > .row")];

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage: preferences just do not persist
  }
}

for (const el of document.querySelectorAll<HTMLElement>("[data-js-only]")) el.hidden = false;

// ── View: both / original / translation ────────────────────────────────
const viewButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-set-view]")];
const viewSelect = document.querySelector<HTMLSelectElement>("[data-view-select]");
function setView(v: View, persist: boolean) {
  const anchor = persist ? topRowId() : undefined;
  root.dataset.view = v;
  for (const b of viewButtons) b.setAttribute("aria-pressed", String(b.dataset.setView === v));
  if (viewSelect) viewSelect.value = v;
  if (persist) store("zp-view", v);
  // keep the paragraph the reader was on in place when a column disappears
  if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: "start" });
}
setView((root.dataset.view as View) ?? "both", false);
for (const b of viewButtons) b.addEventListener("click", () => setView(b.dataset.setView as View, true));
viewSelect?.addEventListener("change", () => setView(viewSelect.value as View, true));

// ── Theme ──────────────────────────────────────────────────────────────
const themeSelect = document.querySelector<HTMLSelectElement>("[data-theme-select]");
if (themeSelect) {
  themeSelect.value = root.dataset.theme ?? "system";
  themeSelect.addEventListener("change", () => {
    const t = themeSelect.value as Theme;
    if (t === "system") delete root.dataset.theme;
    else root.dataset.theme = t;
    store("zp-theme", t === "system" ? null : t);
  });
}

// ── Where the reader is ────────────────────────────────────────────────
// The reading line: just under the sticky column heads (or the bar, on
// phones where the column heads are hidden).
function readingLine(): number {
  const heads = document.querySelector(".colheads");
  const bar = document.querySelector(".bar");
  const visibleHeads = heads && getComputedStyle(heads).display !== "none";
  return ((visibleHeads ? heads : bar)?.getBoundingClientRect().bottom ?? 0) + 8;
}
function topRowId(): string | undefined {
  // a row only counts when a few lines of it sit below the reading line;
  // the sliver of the previous row left in the scroll padding does not
  const line = readingLine() + 24;
  for (const r of rows) {
    if (r.offsetParent === null) continue;
    if (r.getBoundingClientRect().bottom > line) return r.id;
  }
  return undefined;
}

// Switching language keeps your place: carry the current paragraph as #hash.
for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-lang-link]")) {
  a.addEventListener("click", () => {
    const id = window.scrollY > 200 ? topRowId() : undefined;
    if (id) a.hash = id;
  });
}

// ── Disclosures: close on outside click, Escape, or following a link ───
const pops = [...document.querySelectorAll<HTMLDetailsElement>("details.langmenu, details.toc-pop")];
document.addEventListener("click", (e) => {
  for (const d of pops) if (d.open && !d.contains(e.target as Node)) d.open = false;
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  for (const d of pops) {
    if (d.open) {
      d.open = false;
      d.querySelector("summary")?.focus();
    }
  }
});
for (const d of pops) {
  d.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a")) d.open = false;
  });
}

// ── Contents: mark the section being read ──────────────────────────────
const tocLinks = new Map<string, HTMLAnchorElement[]>();
for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-toc-link]")) {
  const id = a.dataset.tocLink!;
  tocLinks.set(id, [...(tocLinks.get(id) ?? []), a]);
}
const headings = rows.filter((r) => tocLinks.has(r.id));
let current: string | undefined;
function markCurrent() {
  // the sticky column heads sit under the bar; a heading counts as current
  // once it reaches the reading line just below them
  const line = readingLine() + 40;
  let id: string | undefined;
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= line) id = h.id;
    else break;
  }
  if (id === current) return;
  if (current) for (const a of tocLinks.get(current) ?? []) a.removeAttribute("aria-current");
  if (id) for (const a of tocLinks.get(id) ?? []) a.setAttribute("aria-current", "location");
  current = id;
  const railLink = id && document.querySelector<HTMLElement>(`.rail a[data-toc-link="${CSS.escape(id)}"]`);
  if (railLink) {
    const rail = railLink.closest<HTMLElement>(".rail")!;
    const r = railLink.getBoundingClientRect();
    const box = rail.getBoundingClientRect();
    if (r.top < box.top || r.bottom > box.bottom) railLink.scrollIntoView({ block: "nearest" });
  }
}
let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      markCurrent();
      ticking = false;
    });
  },
  { passive: true },
);
markCurrent();

// ── Deep links survive web-font loading ────────────────────────────────
// The browser scrolls to #id before the fonts arrive; once they do, the text
// above reflows and the target drifts. Put it back, unless the reader has
// already started scrolling on their own.
if (location.hash.length > 1) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  let moved = false;
  const stop = () => {
    moved = true;
  };
  for (const ev of ["wheel", "touchstart", "keydown", "mousedown"]) {
    window.addEventListener(ev, stop, { once: true, passive: true });
  }
  document.fonts?.ready.then(() => {
    if (!moved && target) target.scrollIntoView({ block: "start" });
    markCurrent();
  });
}
