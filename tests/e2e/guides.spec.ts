import { readdirSync, readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const BASE = "/zanzibar-paper/";
const DIR = "src/content/guides";
const langs = readdirSync(DIR).filter((d) => !d.startsWith("."));
const slugs = (lang: string) =>
  readdirSync(`${DIR}/${lang}`)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
const sectionOf = (lang: string, slug: string) =>
  /^section: ecosystem$/m.test(readFileSync(`${DIR}/${lang}/${slug}.mdx`, "utf8")) ? "ecosystem" : "guides";

async function noHorizontalScroll(page: Page) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw, "page must not scroll sideways").toBeLessThanOrEqual(cw);
}

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude(".katex-mathml")
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

for (const lang of langs) {
  test.describe(`${lang} guide pages`, () => {
    for (const section of ["guides", "ecosystem"]) {
      test(`${section} index`, async ({ page }) => {
        await page.goto(`${BASE}${lang}/${section}/`);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("h1")).toHaveCount(1);
        await noHorizontalScroll(page);
        expect(await seriousViolations(page)).toEqual([]);
      });
    }
    for (const slug of slugs(lang)) {
      test(slug, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(`${BASE}${lang}/${sectionOf(lang, slug)}/${slug}/`);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.locator("h1")).toHaveCount(1);
        // every drawn figure is named and described for screen readers
        for (const svg of await page.locator("figure.dg svg").all()) {
          await expect(svg).toHaveAttribute("role", "img");
          expect(await svg.locator("title").textContent()).toBeTruthy();
          expect(await svg.locator("desc").textContent()).toBeTruthy();
        }
        await noHorizontalScroll(page);
        expect(await seriousViolations(page)).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  });
}
