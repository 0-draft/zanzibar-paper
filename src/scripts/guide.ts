// Progressive enhancement for guide and ecosystem pages: reading settings
// (size, theme), menus, the current section in the contents, and progress.

const root = document.documentElement;

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // blocked storage: settings just do not persist
  }
}

for (const el of document.querySelectorAll<HTMLElement>("[data-js-only]")) el.hidden = false;

// ── View menu: size and theme ──────────────────────────────────────────
const form = document.querySelector<HTMLFormElement>("[data-view-form]");
if (form) {
  const set = (name: string, value: string) => {
    const el = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  };
  set("size", root.dataset.size ?? "m");
  set("theme", root.dataset.theme ?? "system");
  form.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    if (input.name === "size") {
      if (input.value === "m") delete root.dataset.size;
      else root.dataset.size = input.value;
      store("zp-size", input.value === "m" ? null : input.value);
    } else if (input.name === "theme") {
      if (input.value === "system") delete root.dataset.theme;
      else root.dataset.theme = input.value;
      store("zp-theme", input.value === "system" ? null : input.value);
    }
  });
  form.addEventListener("submit", (e) => e.preventDefault());
}

// ── Menus: one open at a time; close outside, on Escape, on a link ─────
const pops = [...document.querySelectorAll<HTMLDetailsElement>("details.pop")];
for (const d of pops) {
  d.addEventListener("toggle", () => {
    if (d.open) for (const o of pops) if (o !== d) o.open = false;
  });
  d.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a")) d.open = false;
  });
  d.addEventListener("focusout", (e) => {
    if (d.open && !d.contains(e.relatedTarget as Node | null)) d.open = false;
  });
}
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

// ── Contents and progress ──────────────────────────────────────────────
const article = document.querySelector<HTMLElement>(".prose");
const tocLinks = new Map<string, HTMLAnchorElement[]>();
for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-toc-link]")) {
  const id = a.dataset.tocLink!;
  tocLinks.set(id, [...(tocLinks.get(id) ?? []), a]);
}
const headings = [...tocLinks.keys()]
  .map((id) => document.getElementById(id))
  .filter((h): h is HTMLElement => h !== null);
const nums = [...document.querySelectorAll<HTMLElement>(".progress-num")];
let current: string | undefined;
let shown = -1;

function update() {
  const barH = document.querySelector<HTMLElement>(".bar")?.offsetHeight ?? 0;
  const line = Math.max(barH + 40, window.innerHeight * 0.3);
  let id: string | undefined;
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= line) id = h.id;
    else break;
  }
  if (id !== current) {
    if (current) for (const a of tocLinks.get(current) ?? []) a.removeAttribute("aria-current");
    if (id) for (const a of tocLinks.get(id) ?? []) a.setAttribute("aria-current", "location");
    current = id;
  }
  if (article) {
    const start = article.getBoundingClientRect().top + window.scrollY - barH;
    const end = article.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
    const ratio = end > start ? Math.min(1, Math.max(0, (window.scrollY - start) / (end - start))) : 1;
    root.style.setProperty("--read", ratio.toFixed(4));
    const pct = Math.round(ratio * 100);
    if (pct !== shown) {
      for (const el of nums) el.textContent = `${pct}%`;
      shown = pct;
    }
  }
}
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    update();
    ticking = false;
  });
};
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
update();

// a module, so its top-level names stay local to this file
export {};
