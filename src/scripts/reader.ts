// Progressive enhancement for the reading page. Everything here is optional:
// without JS the page is still a complete side-by-side text with working
// language links and a table of contents.

type View = "both" | "original" | "translation";
type Layout = "side" | "stacked";
type Theme = "system" | "light" | "dark";

const root = document.documentElement;
const rows = [...document.querySelectorAll<HTMLElement>(".paper > .row")];
const NARROW = matchMedia("(max-width: 56rem)");

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage: preferences just do not persist
  }
}

for (const el of document.querySelectorAll<HTMLElement>("[data-js-only]")) el.hidden = false;

// ── Where the reader is ────────────────────────────────────────────────
// The reading line: just under the sticky column heads, or under the bar
// when the heads are not shown (stacked layout).
function readingLine(): number {
  // Where the sticky bar and column heads end once they are stuck, not where
  // they happen to be: at the top of the page the heads are still in flow,
  // far down the screen.
  const bar = document.querySelector<HTMLElement>(".bar");
  const heads = document.querySelector<HTMLElement>(".colheads");
  const headsShown = heads && getComputedStyle(heads).display !== "none";
  return (bar?.offsetHeight ?? 0) + (headsShown ? heads.offsetHeight : 0) + 8;
}
function topRowId(): string | undefined {
  // a row only counts when a few lines of it sit below the reading line;
  // the sliver of the previous row left above the target does not
  const line = readingLine() + 24;
  // still in the masthead: there is no paragraph to keep
  if (!rows[0] || rows[0].getBoundingClientRect().top > line) return undefined;
  for (const r of rows) {
    if (r.offsetParent === null) continue;
    if (r.getBoundingClientRect().bottom > line) return r.id;
  }
  return undefined;
}
/** Run a layout change without losing the paragraph being read. */
function keepPlace(change: () => void) {
  const anchor = topRowId();
  change();
  if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: "start" });
}

// ── Reading preferences (the View menu) ────────────────────────────────
const form = document.querySelector<HTMLFormElement>("[data-view-form]");
const prefLayout = (): Layout => (load("zp-layout") === "stacked" ? "stacked" : "side");
function applyLayout() {
  root.dataset.layout = NARROW.matches ? "stacked" : prefLayout();
}

if (form) {
  const set = (name: string, value: string) => {
    const el = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  };
  set("view", root.dataset.view ?? "both");
  set("layout", prefLayout());
  set("theme", root.dataset.theme ?? "system");
  set("size", root.dataset.size ?? "m");
  const first = form.querySelector<HTMLInputElement>('input[name="first"]');
  // unset means "the default for this layout": original left, translation on top
  const syncFirst = () => {
    if (first)
      first.checked = root.dataset.first ? root.dataset.first === "translation" : root.dataset.layout === "stacked";
  };
  syncFirst();
  NARROW.addEventListener("change", () => queueMicrotask(syncFirst));

  form.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    switch (input.name) {
      case "view":
        keepPlace(() => {
          root.dataset.view = input.value as View;
        });
        store("zp-view", input.value);
        break;
      case "layout":
        store("zp-layout", input.value === "stacked" ? "stacked" : null);
        keepPlace(applyLayout);
        syncFirst(); // after the layout is applied, so the box shows what the page does
        break;
      case "first":
        keepPlace(() => {
          root.dataset.first = input.checked ? "translation" : "original";
        });
        store("zp-first", root.dataset.first ?? null);
        break;
      case "size":
        keepPlace(() => {
          if (input.value === "m") delete root.dataset.size;
          else root.dataset.size = input.value;
        });
        store("zp-size", input.value === "m" ? null : input.value);
        break;
      case "theme": {
        const t = input.value as Theme;
        if (t === "system") delete root.dataset.theme;
        else root.dataset.theme = t;
        store("zp-theme", t === "system" ? null : t);
        break;
      }
    }
  });
  form.addEventListener("submit", (e) => e.preventDefault());
}
NARROW.addEventListener("change", () => keepPlace(applyLayout));

// Switching language keeps your place: carry the current paragraph as #hash.
for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-lang-link]")) {
  a.addEventListener("click", () => {
    a.hash = topRowId() ?? "";
  });
}

// ── Disclosures: one open at a time; close on outside click, Escape, or
// following a link ───────────────────────────────────────────────────────
const pops = [...document.querySelectorAll<HTMLDetailsElement>("details.pop")];
for (const d of pops) {
  d.addEventListener("toggle", () => {
    if (d.open) for (const o of pops) if (o !== d) o.open = false;
  });
  d.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a")) d.open = false;
  });
}
document.addEventListener("click", (e) => {
  for (const d of pops) if (d.open && !d.contains(e.target as Node)) d.open = false;
});
for (const d of pops) {
  // tabbing out of an open menu closes it
  d.addEventListener("focusout", (e) => {
    if (d.open && !d.contains(e.relatedTarget as Node | null)) d.open = false;
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  for (const d of pops) {
    if (d.open) {
      d.open = false;
      d.querySelector("summary")?.focus();
    }
  }
});

// ── Contents: mark the section being read ──────────────────────────────
const tocLinks = new Map<string, HTMLAnchorElement[]>();
for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-toc-link]")) {
  const id = a.dataset.tocLink!;
  tocLinks.set(id, [...(tocLinks.get(id) ?? []), a]);
}
const headings = rows.filter((r) => tocLinks.has(r.id));
let current: string | undefined;
function markCurrent() {
  // a section is current once its heading passes the upper third of the
  // window: by then the reader is in its text, not the one before
  const line = Math.max(readingLine() + 40, window.innerHeight * 0.3);
  let id: string | undefined;
  for (const h of headings) {
    if (h.offsetParent === null) continue;
    if (h.getBoundingClientRect().top <= line) id = h.id;
    else break;
  }
  if (id === current) return;
  // the references are one list, not a pair: drop the column heads there
  if (id === "refs") root.dataset.inRefs = "";
  else delete root.dataset.inRefs;
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
// ── Reading progress: from the first paragraph to the references ────────
const paper = document.querySelector<HTMLElement>(".paper");
const refsStart = document.getElementById("refs");
const progressNums = [...document.querySelectorAll<HTMLElement>(".progress-num")];
let shown = -1;
function markProgress() {
  if (!paper) return;
  const line = readingLine();
  const start = paper.getBoundingClientRect().top + window.scrollY - line;
  const endEl = refsStart ?? paper;
  const end =
    (refsStart ? endEl.getBoundingClientRect().top : endEl.getBoundingClientRect().bottom) +
    window.scrollY -
    window.innerHeight;
  const ratio = end > start ? Math.min(1, Math.max(0, (window.scrollY - start) / (end - start))) : 0;
  root.style.setProperty("--read", ratio.toFixed(4));
  const pct = Math.round(ratio * 100);
  if (pct !== shown) {
    for (const el of progressNums) el.textContent = `${pct}%`;
    shown = pct;
  }
}

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    markCurrent();
    markProgress();
    ticking = false;
  });
};
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
markCurrent();
markProgress();

// ── Citation preview: [15] shows reference 15 where you are ─────────────
// Pointer: after a short hover delay (reading with the pointer over the
// text should not pop cards). Touch: the first tap opens the card, which
// links on to the reference list.
const tip = document.getElementById("cite-tip");
const canHover = matchMedia("(hover: hover)");
if (tip) {
  let owner: HTMLAnchorElement | null = null;
  // the citation whose card a tap opened; a second tap on it follows the link
  let tapped: HTMLAnchorElement | null = null;
  let lastPointer = "mouse";
  document.addEventListener("pointerdown", (e) => {
    lastPointer = e.pointerType;
  });
  let showTimer = 0;
  let hideTimer = 0;
  const place = (a: HTMLAnchorElement) => {
    const r = a.getBoundingClientRect();
    const w = Math.min(28 * 16, window.innerWidth - 32);
    tip.style.width = `${w}px`;
    const left = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), window.innerWidth - w - 16);
    tip.style.left = `${left + window.scrollX}px`;
    const h = tip.offsetHeight;
    const below = r.bottom + 8;
    const top = below + h < window.innerHeight - 8 ? below : r.top - h - 8;
    tip.style.top = `${top + window.scrollY}px`;
  };
  const show = (a: HTMLAnchorElement, withLink: boolean) => {
    const ref = document.getElementById(a.hash.slice(1));
    if (!ref) return;
    window.clearTimeout(hideTimer);
    owner?.removeAttribute("aria-describedby");
    owner = a;
    // [15] Title. Authors (first author et al.) and the rest of the entry
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = `[${a.textContent ?? ""}]`;
    const title = document.createElement("strong");
    title.className = "ti";
    title.append(...[...(ref.querySelector(".ti")?.childNodes ?? [])].map((c) => c.cloneNode(true)));
    const meta = document.createElement("span");
    meta.className = "meta";
    const au = ref.querySelector(".au")?.textContent ?? "";
    const names = au.split(/\.,\s(?:and\s)?/);
    const shortAu = names.length > 3 ? `${names[0]}., et al.` : au;
    const rest = [...ref.childNodes].filter((c) => !(c instanceof Element && c.matches(".au, .ti, .back")));
    meta.append(...(shortAu ? [document.createTextNode(`${shortAu} `)] : []), ...rest.map((c) => c.cloneNode(true)));
    const parts: Node[] = [n, document.createTextNode(" "), title, document.createElement("br"), meta];
    if (withLink) {
      const go = document.createElement("a");
      go.className = "go";
      go.href = a.href;
      go.textContent = tip.dataset.go ?? "↓";
      go.lang = document.documentElement.lang;
      parts.push(go);
    }
    tip.replaceChildren(...parts);
    // touch: a sheet fixed to the bottom of the screen (as on Wikipedia's
    // mobile site), so scrolling, fonts loading or the address bar moving
    // cannot shift it away from the finger. Pointer: a card at the citation.
    tip.classList.toggle("sheet", withLink);
    if (withLink) tip.removeAttribute("style");
    tip.hidden = false;
    a.setAttribute("aria-describedby", "cite-tip");
    if (!withLink) place(a);
  };
  const hideNow = () => {
    window.clearTimeout(showTimer);
    tapped = null;
    tip.hidden = true;
    owner?.removeAttribute("aria-describedby");
    owner = null;
  };
  const hideSoon = () => {
    window.clearTimeout(showTimer);
    hideTimer = window.setTimeout(hideNow, 150);
  };
  for (const a of document.querySelectorAll<HTMLAnchorElement>(".cell a.cite")) {
    a.addEventListener("mouseenter", () => {
      if (!canHover.matches) return;
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => show(a, false), 400);
    });
    a.addEventListener("mouseleave", hideSoon);
    a.addEventListener("focus", () => show(a, false));
    a.addEventListener("blur", (e) => {
      // moving into the card (its "go to the reference" link) keeps it open;
      // a card opened by a tap closes on a tap elsewhere, not on blur
      if (tapped === a || tip.contains(e.relatedTarget as Node | null)) return;
      hideSoon();
    });
    a.addEventListener("click", (e) => {
      if (lastPointer !== "touch" || tapped === a) return; // mouse, keyboard or a second tap: follow the link
      e.preventDefault();
      show(a, true);
      tapped = a;
    });
  }
  tip.addEventListener("mouseenter", () => window.clearTimeout(hideTimer));
  tip.addEventListener("mouseleave", hideSoon);
  document.addEventListener("click", (e) => {
    const t = e.target as Element;
    if (!tip.hidden && !tip.contains(t) && !t.closest("a.cite")) hideNow();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !tip.hidden) hideNow();
  });
  // phones resize while scrolling (the address bar comes and goes): keep the
  // card and move it with its citation instead of closing it
  window.addEventListener(
    "resize",
    () => {
      if (!tip.hidden && owner && !tip.classList.contains("sheet")) place(owner);
    },
    { passive: true },
  );
}

// ── Report a paragraph: attach the selected words, as arXiv does ────────
for (const a of document.querySelectorAll<HTMLAnchorElement>("a.pl-report")) {
  a.addEventListener("click", () => {
    const row = a.closest(".row");
    const sel = window.getSelection();
    const text = sel && row && !sel.isCollapsed && row.contains(sel.anchorNode) ? sel.toString().trim() : "";
    if (!text) return;
    const url = new URL(a.href);
    const body = url.searchParams.get("body") ?? "";
    const quoted = text
      .slice(0, 800)
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
    url.searchParams.set("body", `${body}\nSelected text:\n\n${quoted}\n`);
    a.href = url.toString();
  });
}

// ── Arriving at a paragraph ────────────────────────────────────────────
// The target gets a lasting marker (CSS :target) and a brief highlight that
// starts only once the page has settled, so the reader actually sees it.
function targetOf(hash: string): HTMLElement | null {
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // malformed escape in the URL: use the raw fragment
  }
  return id ? document.getElementById(id) : null;
}
function flash(el: HTMLElement | null) {
  for (const old of document.querySelectorAll(".arrived")) old.classList.remove("arrived");
  if (!el) return;
  void el.offsetWidth; // restart the animation
  el.classList.add("arrived");
}

// Back from a reference to the sentence that cited it.
let citedFrom: string | undefined;
for (const a of document.querySelectorAll<HTMLAnchorElement>("a.cite")) {
  a.addEventListener("click", () => {
    citedFrom = a.closest<HTMLElement>(".row")?.id;
  });
}
function offerWayBack(el: HTMLElement | null) {
  for (const b of document.querySelectorAll(".refs .back")) b.remove();
  if (!el?.matches(".refs li") || !citedFrom) return;
  const back = document.createElement("a");
  back.className = "back";
  back.href = `#${citedFrom}`;
  back.textContent = "↩";
  back.setAttribute("aria-label", tip?.dataset.back ?? "Back");
  back.lang = document.documentElement.lang;
  el.append(" ", back);
}

window.addEventListener("hashchange", () => {
  const el = targetOf(location.hash);
  offerWayBack(el);
  flash(el);
});

// Deep links survive web-font loading: the browser scrolls to #id before the
// fonts arrive; once they do, the text above reflows and the target drifts.
// Put it back, unless the reader has already started scrolling.
if (location.hash.length > 1) {
  const target = targetOf(location.hash);
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
    markProgress();
    flash(target);
  });
}
