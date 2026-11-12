import { describe, expect, it } from "vitest";
import { escapeHtml, invariantTokens, parseInline, plainText, renderInline } from "../../src/lib/inline.ts";

describe("parseInline", () => {
  it("parses every construct", () => {
    expect(parseInline("a *em* **st** `c` $x$ [l](#t) \\*")).toEqual([
      { kind: "text", value: "a " },
      { kind: "em", children: [{ kind: "text", value: "em" }] },
      { kind: "text", value: " " },
      { kind: "strong", children: [{ kind: "text", value: "st" }] },
      { kind: "text", value: " " },
      { kind: "code", value: "c" },
      { kind: "text", value: " " },
      { kind: "math", value: "x" },
      { kind: "text", value: " " },
      { kind: "link", href: "#t", children: [{ kind: "text", value: "l" }] },
      { kind: "text", value: " *" },
    ]);
  });

  it("keeps unclosed delimiters as text", () => {
    expect(plainText("a * b")).toBe("a * b");
    expect(plainText("cost `x")).toBe("cost `x");
    expect(plainText("[not a link] (x)")).toBe("[not a link] (x)");
    expect(plainText("$5 only")).toBe("$5 only");
  });

  it("treats the outer brackets of a citation as text", () => {
    expect(renderInline("[[15](#ref-15), [18](#ref-18)]")).toBe(
      '[<a href="#ref-15" class="cite">15</a>, <a href="#ref-18" class="cite">18</a>]',
    );
  });

  it("does not close emphasis inside code or math", () => {
    const nodes = parseInline("*a `b*` c*");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ kind: "em" });
  });

  it("allows emphasis next to CJK text without word boundaries", () => {
    expect(renderInline("これは*強調*です")).toBe("これは<em>強調</em>です");
  });

  it("parses emphasis wrapping angle-bracket notation", () => {
    expect(renderInline("⟨*object#relation*⟩")).toBe("⟨<em>object#relation</em>⟩");
  });
});

describe("renderInline", () => {
  it("escapes HTML in text and code", () => {
    expect(renderInline('<b>&"</b> `<i>`')).toBe("&lt;b&gt;&amp;&quot;&lt;/b&gt; <code>&lt;i&gt;</code>");
  });

  it("opens external links in a new tab without opener", () => {
    expect(renderInline("[x](https://example.com)")).toBe(
      '<a href="https://example.com" rel="noopener" target="_blank">x</a>',
    );
  });

  it("renders TeX through KaTeX", () => {
    const html = renderInline("$T_x < T_y$");
    expect(html).toContain('class="katex"');
    expect(html).toContain("<math");
  });

  it("throws on invalid TeX instead of printing it", () => {
    expect(() => renderInline("$\\frac{$")).toThrow();
  });
});

describe("invariantTokens", () => {
  it("collects code, math and link targets, order-independent", () => {
    const a = invariantTokens("see [Figure 1](#fig-1) and `x` with $y$");
    const b = invariantTokens("$y$ と `x` は [図 1](#fig-1) を参照");
    expect(a).toEqual(b);
    expect(a).toEqual(["code:x", "link:#fig-1", "math:y"]);
  });

  it("notices a dropped citation", () => {
    expect(invariantTokens("[[3](#ref-3)]")).not.toEqual(invariantTokens("text"));
  });
});

describe("escapeHtml", () => {
  it("escapes the five significant characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
