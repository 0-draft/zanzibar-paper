# Brief for writing a guide or ecosystem page

Read these first: `research/explainer-design.md` (the rules), `research/ecosystem.md` and `research/guides.md` (facts and sources), `content/en.yaml` (the paper, transcribed; cite sections as §2.2 and quote exactly), and the pilot `src/content/guides/en/relation-tuples.mdx`.

## Files

- One MDX file per page: `src/content/guides/en/<slug>.mdx`. English first; translations come later in `src/content/guides/<lang>/<slug>.mdx` with the same slug.
- Frontmatter (validated by `src/content.config.ts`): `title`, `description` (one sentence), `section` (`guide` or `ecosystem`), `order`, `checked` (`YYYY-MM-DD`, the day you verified the facts), `paper` (list of section numbers), and for ecosystem pages `product` { name, maintainer, license, language, repo, docs, status, latest }.
- Only create or edit your own MDX files. Do not touch components, styles, scripts or other pages. If a figure needs something the kit cannot draw, write the closest version and describe the missing capability in your report.

## Components (import with a relative path, as the pilot does)

- `Graph` (`src/components/diagram/Graph.astro`): boxes and arrows. Props: `width`, `height` (viewBox units; keep width ≤ 640), `title`, `desc` (a full text alternative), `nodes` [{ id, x, y (centre), label ("\n" for line breaks), kind: client | server | store | subject | object | group | note, mono, on, w, h }], `edges` [{ from, to, label, dashed, dir: forward | both | none, on, labelOffset }], `groups` [{ x, y, w, h, label }] (dashed frames drawn behind the nodes, label at the top-left inside), `minWidth` (px to keep on phones; the figure then scrolls), `caption`. Edge labels may break lines with "\n".
- `Swimlane`: lanes of actors, time running down. Props: `lanes` [names], `events` [{ lane, t, label ("\n" breaks lines), kind: write | read | note | bad | good, mono }], `arrows` [{ from: [lane, t], to: [lane, t], label, dashed }], `title`, `desc`, `timeLabel`, `ticks` (labels per row), `laneWidth`, `rowHeight`, `caption`.
- `Timeline`: `items` [{ year, title, body, href, era, on }], `sourceLabel`.
- `Frames`: small multiples. Wrap two or more figures in `<Frames>…</Frames>` (optional `min="20rem"`, the width below which frames stack). Use it for before/after and step sequences instead of inline styles.
- `Callout`: `kind` note | paper | warn, `title`; children are Markdown.
- Plain Markdown tables and fenced code blocks (with a language tag: `text`, `ts`, `yaml`, `json`).

Colours mean the same on every figure: blue box = client, yellow = server, green = storage, plain outline = subject or object, dashed outline = group or derived, link colour (`on`) = the path being discussed. Never rely on colour alone: label everything.

## MDX pitfalls

- Write links as `[text](https://…)`. The `<https://…>` autolink form breaks the MDX build.
- In running text, `{`, `}` and `<` start JSX: write them inside code spans, or escape them (`\{`, `&lt;`).
- A glossary or any list of terms is a definition list written as HTML in MDX: `<dl><dt id="zookie">zookie</dt><dd>…</dd></dl>`, so each term gets an anchor (`../glossary/#zookie`).
- The paper's grammar (§2.1) is a `text` code block with one `::=` rule per line.

## Running example

Anne, Beto and Chen (`user:anne`, `user:beto`, `user:chen`); the document `doc:readme` in `folder:A`; the group `group:eng`. Anne owns the readme; Beto is in eng; eng members view the readme; Chen views folder A. Use it everywhere it fits so readers can carry it from page to page.

## Voice

Plain, exact, neutral. Short paragraphs. No marketing words, no "powerful", "seamless", "robust", "in today's world", no rhetorical questions as headings, no closing summaries that repeat the page. Explain, then show, then point to the paper section. Every claim about history, standards or products has an inline link to a primary source (paper, standard, official docs, the project's repository or announcement). End with `## Sources`, a list of the links used. Mark anything you could not verify instead of guessing.

## Done when

`./node_modules/.bin/astro build` succeeds (run it from the repository root). Report: files written, every figure's question in one line, facts you could not verify, and capabilities the kit lacked.
