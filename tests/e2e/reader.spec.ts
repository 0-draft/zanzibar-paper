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
      await expect(page.locator(".paper > .row")).toHaveCount(src.blocks.length);
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

test("view switch hides a column and is remembered", async ({ page, isMobile }) => {
  await page.goto(`${BASE}ja/`);
  const cellEn = page.locator("#s1-p1 .cell-en");
  const cellTr = page.locator("#s1-p1 .cell-tr");
  await expect(cellEn).toBeVisible();
  await expect(cellTr).toBeVisible();
  if (isMobile) await page.locator("[data-view-select]").selectOption("translation");
  else await page.getByRole("button", { name: "訳文のみ" }).click();
  await expect(cellEn).toBeHidden();
  await expect(cellTr).toBeVisible();
  await page.reload();
  await expect(cellEn).toBeHidden();
  if (isMobile) await page.locator("[data-view-select]").selectOption("original");
  else await page.getByRole("button", { name: "原文のみ" }).click();
  await expect(cellTr).toBeHidden();
  await expect(cellEn).toBeVisible();
});

test("switching language keeps the paragraph being read", async ({ page }) => {
  await page.goto(`${BASE}ja/#s3-2-5-p3`);
  // the page re-anchors once web fonts have loaded; read the position after that
  await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(r))));
  await page.locator(".bar-lang > summary").click();
  await page.locator('.bar-lang a[hreflang="de"]').click();
  await expect(page).toHaveURL(/\/de\/#s3-2-5-p3$/);
  await expect(page.locator("#s3-2-5-p3")).toBeInViewport();
});

test("theme choice is applied and remembered", async ({ page, isMobile }) => {
  test.skip(isMobile, "the theme control is desktop-only; phones follow the system");
  await page.goto(`${BASE}ko/`);
  await page.locator("[data-theme-select]").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(21, 24, 29)");
});

test("the landing page lists every translation and suggests one", async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator(".landing-langs li")).toHaveCount(TRANSLATIONS.length);
  await expect(page.locator(".landing-langs .suggested")).toHaveCount(1);
  await noHorizontalScroll(page);
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
