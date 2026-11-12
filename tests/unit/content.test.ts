import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANGS, TRANSLATIONS } from "../../src/i18n/langs.ts";
import { UI } from "../../src/i18n/ui.ts";
import {
  availableTranslations,
  loadSource,
  loadTranslation,
  localize,
  type Source,
  type Translation,
  validateSource,
  validateTranslation,
} from "../../src/lib/content.ts";

const src = loadSource();

describe("content/en.yaml", () => {
  it("is internally consistent (ids, anchors, figure files)", () => {
    const figures = new Set(readdirSync(join(process.cwd(), "public", "figures")));
    expect(validateSource(src, figures)).toEqual([]);
  });

  it("transcribes the whole paper", () => {
    const headings = src.blocks.filter((b) => b.type === "heading").map((b) => (b.type === "heading" ? b.num : ""));
    expect(headings.filter(Boolean)).toEqual([
      "1",
      "2",
      "2.1",
      "2.2",
      "2.3",
      "2.3.1",
      "2.4",
      "2.4.1",
      "2.4.2",
      "2.4.3",
      "2.4.4",
      "2.4.5",
      "3",
      "3.1",
      "3.1.1",
      "3.1.2",
      "3.1.3",
      "3.1.4",
      "3.2",
      "3.2.1",
      "3.2.2",
      "3.2.3",
      "3.2.4",
      "3.2.5",
      "3.2.6",
      "3.2.7",
      "4",
      "4.1",
      "4.2",
      "4.3",
      "4.4",
      "4.5",
      "5",
      "6",
      "7",
    ]);
    const refs = src.blocks.find((b) => b.type === "refs");
    expect(refs?.type === "refs" && refs.items.map((r) => r.n)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    expect(src.blocks.filter((b) => b.type === "figure" || b.type === "code").map((b) => b.id)).toEqual([
      "fig-1",
      "fig-2",
      "fig-3",
      "fig-4",
      "fig-5",
    ]);
    expect(src.meta.authors).toHaveLength(14);
  });

  it("cites every reference at least once", () => {
    const text = JSON.stringify(src.blocks.filter((b) => b.type !== "refs"));
    for (let n = 1; n <= 24; n++) expect(text, `ref-${n}`).toContain(`(#ref-${n})`);
  });
});

describe("translations", () => {
  it("has a content file for every registered language and vice versa", () => {
    expect(availableTranslations()).toEqual(TRANSLATIONS.map((l) => l.code).sort());
  });

  it("has UI strings for every language", () => {
    expect(Object.keys(UI).sort()).toEqual(LANGS.map((l) => l.code).sort());
  });

  for (const l of TRANSLATIONS) {
    it(`${l.code} matches the source structure and tokens`, () => {
      const tr = loadTranslation(l.code);
      expect(tr.lang).toBe(l.code);
      expect(validateTranslation(src, tr)).toEqual([]);
    });
  }
});

describe("validateTranslation", () => {
  const mini: Source = {
    meta: src.meta,
    blocks: [
      { id: "h", type: "heading", level: 2, num: "1", text: "Introduction" },
      {
        id: "p",
        type: "p",
        text: "Zanzibar stores ACLs in `Spanner` [[15](#ref-15)] at $T$ and that is a long sentence.",
      },
      { id: "t", type: "table", variant: "tuples", header: ["A", "B"], rows: [["`x`", "user 10"]], caption: "Cap" },
      { id: "m", type: "math", tex: "x" },
    ],
  };
  const good: Translation = {
    lang: "ja",
    meta: { title: "題" },
    blocks: {
      h: { text: "はじめに" },
      p: { text: "Zanzibar は `Spanner` [[15](#ref-15)] に $T$ の時点で ACL を保存する長い文である。" },
      t: { header: ["甲", "乙"], rows: [["`x`", "ユーザー 10"]], caption: "表" },
    },
  };

  it("accepts a faithful translation", () => {
    expect(validateTranslation(mini, good)).toEqual([]);
  });

  it("reports missing blocks, unknown ids and untranslatable blocks", () => {
    const errs = validateTranslation(mini, {
      ...good,
      blocks: { ...good.blocks, h: undefined as never, x: { text: "?" }, m: { text: "?" } },
    });
    expect(errs.join("\n")).toMatch(/unknown or untranslatable block id "x"/);
    expect(errs.join("\n")).toMatch(/unknown or untranslatable block id "m"/);
    expect(errs.join("\n")).toMatch(/missing block "h"/);
  });

  it("reports a dropped code span, citation or formula", () => {
    const errs = validateTranslation(mini, {
      ...good,
      blocks: { ...good.blocks, p: { text: "Zanzibar は Spanner に ACL を保存する長い文である。" } },
    });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/tokens differ/);
  });

  it("requires literal cells to be copied verbatim", () => {
    const errs = validateTranslation(mini, {
      ...good,
      blocks: { ...good.blocks, t: { header: ["甲", "乙"], rows: [["`y`", "ユーザー 10"]], caption: "表" } },
    });
    expect(errs.join("\n")).toMatch(/must be copied verbatim/);
  });

  it("flags untranslated CJK text and wrong shapes", () => {
    const errs = validateTranslation(mini, {
      ...good,
      blocks: {
        ...good.blocks,
        p: { text: mini.blocks[1]!.type === "p" ? mini.blocks[1]!.text : "" },
        t: { header: ["甲"], rows: [], caption: "表" },
      },
    });
    const all = errs.join("\n");
    expect(all).toMatch(/looks untranslated/);
    expect(all).toMatch(/header must have 2 items/);
    expect(all).toMatch(/rows must have 1 rows/);
  });

  it("rejects fields that are not translatable for the block type", () => {
    const errs = validateTranslation(mini, { ...good, blocks: { ...good.blocks, h: { text: "x", caption: "y" } } });
    expect(errs.join("\n")).toMatch(/h\.caption is not a translatable field/);
  });
});

describe("validateTranslation: latency grouping", () => {
  const tab = src.blocks.find((b) => b.id === "tab-2")!;
  const base: Translation = { lang: "ja", meta: { title: "t" }, blocks: {} };
  it("rejects a translation that breaks the Safe / Recent grouping", () => {
    if (tab.type !== "table") throw new Error("tab-2 is not a table");
    const rows = tab.rows.map((r) => [...r]);
    rows[1]![0] = "安全";
    const one: Source = { meta: src.meta, blocks: [tab] };
    const errs = validateTranslation(one, {
      ...base,
      blocks: { "tab-2": { title: "t", header: tab.header, rows, caption: "c" } },
    });
    expect(errs.join("\n")).toMatch(/must keep the grouping/);
  });
});

describe("validateSource: schema", () => {
  it("rejects unknown block types, reserved ids and bad heading levels", () => {
    const errs = validateSource({
      meta: src.meta,
      blocks: [
        { id: "x", type: "aside" } as never,
        { id: "ref-3", type: "p", text: "a" },
        { id: "h", type: "heading", level: 5 as never, text: "h" },
      ],
    });
    const all = errs.join("\n");
    expect(all).toMatch(/unknown type "aside"/);
    expect(all).toMatch(/"ref-3" is reserved/);
    expect(all).toMatch(/level must be 2, 3 or 4/);
  });

  it("rejects a citation whose number does not match its target", () => {
    const errs = validateSource({
      meta: src.meta,
      blocks: [{ id: "p", type: "p", text: "see [4](#ref-3)" }, ...src.blocks.filter((b) => b.type === "refs")],
    });
    expect(errs.join("\n")).toMatch(/cites \[4\] but links to #ref-3/);
  });
});

describe("localize", () => {
  it("overrides only translatable fields", () => {
    const b = { id: "f", type: "figure", src: "a.svg", width: 1, height: 1, alt: "A", caption: "C" } as const;
    expect(localize(b, { alt: "あ", caption: "し" })).toEqual({ ...b, alt: "あ", caption: "し" });
    expect(localize(b, undefined)).toBe(b);
  });
});
