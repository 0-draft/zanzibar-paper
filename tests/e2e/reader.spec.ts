import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { TRANSLATIONS } from "../../src/i18n/langs.ts";
import { loadSource } from "../../src/lib/content.ts";

const BASE = "/zanzibar-paper/";
const src = loadSource();

async function noHorizontalScroll(page: Page) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw, "page must not scroll sideways").toBeLessThanOrEqual(cw);
}

test.describe("every translation page", () => {
  for (const l of TRANSLATIONS) {
    test(`${l.code} renders every block with the right languages`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${BASE}${l.code}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", l.code);
      await expect(page.locator(".paper > .row")).toHaveCount(src.blocks.filter((b) => b.type !== "note").length);
      expect(await page.locator(".cell-en:not([lang='en'])").count()).toBe(0);
      expect(await page.locator(`.cell-tr:not([lang='${l.code}'])`).count()).toBe(0);
      await expect(page.locator("h1")).toHaveCount(1);
      // every figure loads
      for (const img of await page.locator(".plate img").all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      }
      // every TeX fragment rendered through KaTeX (no raw $...$ left)
      expect(await page.locator(".katex").count()).toBeGreaterThan(20);
      expect(await page.locator(".cell", { hasText: /\$[^$\s][^$]*\$/ }).count()).toBe(0);
      await noHorizontalScroll(page);
      expect(errors).toEqual([]);
    });
  }
});

test("internal anchors resolve to an element", async ({ page }) => {
  await page.goto(`${BASE}ja/`);
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
      .map((a) => a.getAttribute("href")!.slice(1))
      .filter((id) => id && !document.getElementById(id)),
  );
  expect(missing).toEqual([]);
});

async function openView(page: Page) {
  await page.locator("details.viewmenu > summary").click();
}

test("view menu: show one text, and the choice is remembered", async ({ page }) => {
  await page.goto(`${BASE}ja/`);
  const cellEn = page.locator("#s1-p1 .cell-en");
  const cellTr = page.locator("#s1-p1 .cell-tr");
  await expect(cellEn).toBeVisible();
  await expect(cellTr).toBeVisible();
  await openView(page);
  await page.locator('input[name="view"][value="translation"]').check();
  await expect(cellEn).toBeHidden();
  await expect(cellTr).toBeVisible();
  await page.reload();
  await expect(cellEn).toBeHidden();
  await openView(page);
  await page.locator('input[name="view"][value="original"]').check();
  await expect(cellTr).toBeHidden();
  await expect(cellEn).toBeVisible();
});

test("switching the view at the top of the page does not jump into the paper", async ({ page }) => {
  await page.goto(`${BASE}ja/`);
  await openView(page);
  await page.locator('input[name="view"][value="translation"]').check();
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

test("view menu: stacked layout and translation first", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones are always stacked");
  await page.goto(`${BASE}de/`);
  const en = page.locator("#s1-p1 .cell-en");
  const tr = page.locator("#s1-p1 .cell-tr");
  // side by side: original on the left
  expect((await en.boundingBox())!.x).toBeLessThan((await tr.boundingBox())!.x);
  await openView(page);
  await page.locator('input[name="first"]').check();
  expect((await tr.boundingBox())!.x).toBeLessThan((await en.boundingBox())!.x);
  await page.locator('input[name="layout"][value="stacked"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-layout", "stacked");
  const a = (await tr.boundingBox())!;
  const b = (await en.boundingBox())!;
  expect(Math.abs(a.x - b.x)).toBeLessThan(20);
  expect(a.y).toBeLessThan(b.y);
});

test("phones stack the pair with the translation on top", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone layout");
  await page.goto(`${BASE}ja/`);
  await expect(page.locator("html")).toHaveAttribute("data-layout", "stacked");
  const tr = (await page.locator("#s1-p1 .cell-tr").boundingBox())!;
  const en = (await page.locator("#s1-p1 .cell-en").boundingBox())!;
  expect(tr.y).toBeLessThan(en.y);
  // figure captions follow the same order
  const ftr = (await page.locator("#fig-2 .cell-tr").boundingBox())!;
  const fen = (await page.locator("#fig-2 .cell-en").boundingBox())!;
  expect(ftr.y).toBeLessThan(fen.y);
});

test("code and formulas keep their own faces inside CJK text", async ({ page }) => {
  await page.goto(`${BASE}ja/`);
  const codeFont = await page
    .locator(".cell-tr code")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(codeFont).toMatch(/Plex Mono/);
  const katexFont = await page
    .locator(".cell-tr .katex")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(katexFont).toMatch(/KaTeX/);
  const refsLang = await page.locator("#refs-list .shared").getAttribute("lang");
  expect(refsLang).toBe("en");
});

test("citations preview their reference on hover", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover preview is for pointer devices; taps follow the link");
  await page.goto(`${BASE}ja/#s1-p10`);
  await page.locator("#s1-p10 .cell-tr a.cite").first().hover();
  const tip = page.locator("#cite-tip");
  await expect(tip).toBeVisible();
  await expect(tip).toContainText("Spanner");
});

test("switching language keeps the paragraph being read", async ({ page }) => {
  await page.goto(`${BASE}ja/#s3-2-5-p3`);
  // the page re-anchors once web fonts have loaded; read the position after that
  await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(r))));
  await page.locator("details.langmenu > summary").click();
  await page.locator('details.langmenu a[hreflang="de"]').click();
  await expect(page).toHaveURL(/\/de\/#s3-2-5-p3$/);
  await expect(page.locator("#s3-2-5-p3")).toBeInViewport();
});

test("theme choice is applied and remembered", async ({ page }) => {
  await page.goto(`${BASE}ko/`);
  await openView(page);
  await page.locator('input[name="theme"][value="dark"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(21, 24, 29)");
});

test("the landing page lists every translation", async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator(".landing-langs li")).toHaveCount(TRANSLATIONS.length);
  await noHorizontalScroll(page);
});

test.describe("with a Korean browser", () => {
  test.use({ locale: "ko-KR" });
  test("the landing page marks the Korean translation", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator(".landing-langs .suggested")).toHaveAttribute("data-code", "ko");
  });
});

test("unknown pages get the 404 page", async ({ page }) => {
  const res = await page.goto(`${BASE}nope/`);
  expect(res?.status()).toBe(404);
  await expect(page.locator(".nf")).toBeVisible();
});

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  for (const path of ["", "ja/", "zh-Hans/", "de/"]) {
    test(`/${path}`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // KaTeX's MathML copy is visually hidden by design
        .exclude(".katex-mathml")
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("dark theme keeps contrast", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(`${BASE}ja/`);
    const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).exclude(".katex-mathml").analyze();
    expect(results.violations.map((v) => v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
  });
});

test("reading progress runs from the first paragraph to the references", async ({ page }) => {
  await page.goto(`${BASE}ja/`);
  const num = page.locator(".progress-num");
  await expect(num).toHaveText("0%");
  await page.locator("#s3-2-4").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById("s3-2-4")!.scrollIntoView({ block: "start" }));
  await expect.poll(async () => Number.parseInt((await num.textContent()) ?? "0", 10)).toBeGreaterThan(20);
  await expect.poll(async () => Number.parseInt((await num.textContent()) ?? "0", 10)).toBeLessThan(80);
  await page.evaluate(() => document.getElementById("refs")!.scrollIntoView({ block: "start" }));
  await expect(num).toHaveText("100%");
  expect(await page.locator(".progress").getAttribute("aria-hidden")).toBe("true");
});

test("text size is applied to the paper and remembered", async ({ page }) => {
  await page.goto(`${BASE}fr/`);
  const p = page.locator("#s1-p1 .cell-tr p");
  const before = await p.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
  await openView(page);
  await page.locator('input[name="size"][value="l"]').check();
  await expect.poll(() => p.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(before);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-size", "l");
});

test("on touch screens a citation opens its card first", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch behaviour");
  await page.goto(`${BASE}ja/#s1-p10`);
  const cite = page.locator("#s1-p10 .cell-tr a.cite").first();
  await cite.tap();
  await expect(page.locator("#cite-tip")).toBeVisible();
  await expect(page).toHaveURL(/#s1-p10$/);
  await page.locator("#cite-tip a.go").tap();
  await expect(page).toHaveURL(/#ref-15$/);
});

test("the latency table follows the view: original labels in the original-only view", async ({ page }) => {
  await page.goto(`${BASE}ja/#tab-2`);
  await expect(page.locator("#tab-2 .v-tr")).toBeVisible();
  await expect(page.locator("#tab-2 .v-en")).toBeHidden();
  await openView(page);
  await page.locator('input[name="view"][value="original"]').check();
  await expect(page.locator("#tab-2 .v-en")).toBeVisible();
  await expect(page.locator("#tab-2 .v-tr")).toBeHidden();
  await expect(page.locator("#tab-2 .v-en")).toContainText("Latency in milliseconds");
});
