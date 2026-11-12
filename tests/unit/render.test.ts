import { describe, expect, it } from "vitest";
import { cropSvg, FIGURES } from "../../scripts/extract-figures.mjs";
import { type Block, loadSource, type Translation } from "../../src/lib/content.ts";
import { issueUrl, joinBase } from "../../src/lib/paths.ts";
import { buildRows, buildToc, renderShared, renderSide } from "../../src/lib/render.ts";

const src = loadSource();
const empty: Translation = { lang: "xx", meta: { title: "t" }, blocks: {} };

describe("buildRows", () => {
  const rows = buildRows(src, empty, "/zanzibar-paper/");

  it("emits one row per source block except notes, in order", () => {
    expect(rows.map((r) => r.id)).toEqual(src.blocks.filter((b) => b.type !== "note").map((b) => b.id));
  });

  it("sets the latency table once and pairs only its captions", () => {
    const r = rows.find((x) => x.id === "tab-2")!;
    expect(r.shared).toContain("401.0 (133.0)");
    expect(r.shared).toContain('<div class="v-en" lang="en">');
    expect(r.shared).not.toContain("figcaption");
    expect(r.en).toContain("Table 2:");
    expect(r.en).not.toContain("<table");
  });

  it("sets table 1 once: the tuple column plus the meaning in both languages", () => {
    const tr: Translation = {
      ...empty,
      blocks: {
        "tab-1": {
          header: ["例", "意味"],
          rows: [
            ["`doc:readme#owner@10`", "所有者"],
            ["`group:eng#member@11`", "b"],
            ["`doc:readme#viewer@group:eng#member`", "c"],
            ["`doc:readme#parent@folder:A#...`", "d"],
          ],
          caption: "表 1",
        },
      },
    };
    const r = buildRows(src, tr, "/").find((x) => x.id === "tab-1")!;
    expect(r.shared).toContain('<td class="c-en" lang="en">User 10 is an owner');
    expect(r.shared).toContain('<td class="c-tr">所有者</td>');
    expect(r.shared?.match(/doc:readme#owner@10/g)).toHaveLength(1);
    expect(r.tr).toContain("表 1");
  });

  it("links every figure to its full-size file", () => {
    const r = rows.find((x) => x.id === "fig-3")!;
    expect(r.shared).toMatch(/<a class="plate" href="\/zanzibar-paper\/figures\/fig-3.svg"/);
  });

  it("pairs text blocks and shares art, code, TeX and references", () => {
    const byId = new Map(rows.map((r) => [r.id, r]));
    expect(byId.get("s1-p1")).toMatchObject({ en: expect.any(String), tr: expect.any(String) });
    expect(byId.get("s1-p1")?.shared).toBeUndefined();
    for (const id of ["s2-1-grammar", "s3-2-3-math", "refs-list"]) {
      expect(byId.get(id)?.shared, id).toBeTruthy();
      expect(byId.get(id)?.en, id).toBeUndefined();
    }
    for (const id of ["fig-1", "fig-2"]) {
      expect(byId.get(id)?.shared, id).toBeTruthy();
      expect(byId.get(id)?.tr, id).toContain("caption");
    }
  });

  it("falls back to the original where a translation is missing", () => {
    const r = rows.find((x) => x.id === "s1-p1")!;
    expect(r.tr).toBe(r.en);
  });

  it("uses the translated alt text on shared figures", () => {
    const tr: Translation = { ...empty, blocks: { "fig-2": { alt: "構成図", caption: "図 2" } } };
    const r = buildRows(src, tr, "/b/").find((x) => x.id === "fig-2")!;
    expect(r.shared).toContain('alt="構成図"');
    expect(r.shared).toContain('src="/b/figures/fig-2.svg"');
  });
});

describe("renderSide / renderShared", () => {
  it("numbers headings", () => {
    const h: Block = { id: "x", type: "heading", level: 3, num: "2.1", text: "Relation Tuples" };
    expect(renderSide(h)).toBe('<h3><span class="num">2.1</span><span class="htext">Relation Tuples</span></h3>');
  });

  it("groups the latency table with rowspans", () => {
    const t = src.blocks.find((b) => b.id === "tab-2")!;
    const html = renderSide(t);
    expect(html.match(/rowspan="3"/g)).toHaveLength(1);
    expect(html.match(/rowspan="4"/g)).toHaveLength(1);
    expect(html).toContain("401.0 (133.0)");
  });

  it("anchors every reference and keeps its published text", () => {
    const refs = src.blocks.find((b) => b.type === "refs")!;
    const html = renderShared(refs, "/")!;
    for (let n = 1; n <= 24; n++) expect(html).toContain(`id="ref-${n}"`);
    expect(html).toContain('<span class="ti">Spanner: Google’s globally-distributed database.</span>');
  });

  it("escapes code blocks", () => {
    const html = renderShared({ id: "c", type: "code", lang: "text", code: "<a> & b", caption: "c" }, "/")!;
    expect(html).toContain("&lt;a&gt; &amp; b");
  });
});

describe("buildToc", () => {
  it("lists level 2 and 3 headings with numbers", () => {
    const toc = buildToc(src, empty);
    expect(toc.some((e) => e.level === 4)).toBe(false);
    expect(toc.find((e) => e.id === "s2-1")).toMatchObject({ level: 3, num: "2.1" });
    expect(toc[0]).toMatchObject({ id: "abstract", level: 2 });
  });
});

describe("paths", () => {
  it("joins onto the base with exactly one slash", () => {
    expect(joinBase("/zanzibar-paper", "ja/")).toBe("/zanzibar-paper/ja/");
    expect(joinBase("/zanzibar-paper/", "/ja/")).toBe("/zanzibar-paper/ja/");
    expect(joinBase("/", "")).toBe("/");
  });

  it("prefills an issue for a paragraph", () => {
    const u = new URL(issueUrl("ja", "s2-2-p3"));
    expect(u.pathname).toBe("/0-draft/zanzibar-paper/issues/new");
    expect(u.searchParams.get("title")).toBe("[ja] translation: s2-2-p3");
    expect(u.searchParams.get("body")).toContain("#s2-2-p3");
  });
});

describe("extract-figures cropSvg", () => {
  const page =
    '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="612pt" height="792pt" viewBox="0 0 612 792">\n<path d="M0 0"/>\n</svg>\n';

  it("resizes to the box and shifts the page under it", () => {
    const out = cropSvg(page, [55, 70, 506, 223]);
    expect(out).toContain('width="506" height="223" viewBox="0 0 506 223"');
    expect(out).toContain('<g transform="translate(-55,-70)">');
    expect(out.trim().endsWith("</g></svg>")).toBe(true);
  });

  it("refuses an unexpected page size", () => {
    expect(() => cropSvg(page.replace("612pt", "595pt"), [0, 0, 1, 1])).toThrow(/unexpected/);
  });

  it("covers figures 2–5", () => {
    expect(Object.keys(FIGURES)).toEqual(["fig-2", "fig-3", "fig-4", "fig-5"]);
  });
});
