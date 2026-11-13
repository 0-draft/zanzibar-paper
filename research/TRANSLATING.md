# Brief for translating a guide or ecosystem page

The English pages in `src/content/guides/en/` are the source. A translation is `src/content/guides/<lang>/<slug>.mdx` with the same slug. `tests/unit/guides.test.ts` checks that every English page exists in the language and that the structure matches.

## Keep exactly as in English

- Frontmatter keys and the values of `section`, `part`, `order`, `checked`, `paper` and `product` (except `product.status`, which may be translated). Translate only `title` and `description`.
- The import lines, and every component (`Graph`, `Swimlane`, `Timeline`, `Frames`, `Callout`) in the same order.
- In figures: node `id`s, `kind`, `x`, `y`, `w`, `h`, `mono`, `on`, edge `from` / `to` / `dashed` / `dir` / `on` / `labelOffset`, group geometry, `width`, `height`, `minWidth`, `laneWidth`, `rowHeight`, and `lane` / `t` / `from` / `to` of swimlane events and arrows.
- Fenced code blocks, byte for byte. Code spans (`` `user:anne` ``), object names, API names, product names and schema keywords stay in English.
- Link targets. Internal links keep the same relative path; if a link points at a heading anchor of another page (`../architecture/#…`), use the anchor that heading gets in your language (Astro slugifies the translated heading text; check the built HTML). Glossary anchors (`<dt id="…">`) never change.
- Quotes from the paper: keep the English quote, then give the translation in your language in parentheses or the next sentence, so readers can match it with the paper page.

## Translate

- Prose, headings, list items, table cells (except code), callout titles and bodies.
- In figures: `title`, `desc`, `caption`, `timeLabel`, `ticks`, lane names, node and edge labels, except where a label is code (`user:anne`, `doc:readme#viewer`, `CheckPermission`). Keep labels short; use "\n" to break a long label instead of letting it grow.
- `sourceLabel` and similar props that hold visible text.

## Voice and terms

- Follow the paper translation in `content/<lang>.yaml` for terms (relation tuple, userset, zookie, namespace, ACL, Leopard, Watch, snapshot, external consistency). Read the abstract and §2 there first.
- Same register as that translation: Japanese である調, Korean 한다체, Chinese written style, formal written register in es / fr / de / pt-BR.
- Plain and exact, as in `research/WRITING.md`. Do not add, drop or soften claims; a translation is not an edit. If the English looks wrong, translate it as is and report it.
- One paragraph per line (MDX). Strings in frontmatter are double-quoted.

## MDX pitfalls

- Write links as `[text](https://…)`, never `<https://…>`.
- `{`, `}` and `<` in running text start JSX: keep them in code spans or escape them.
- CJK text next to inline code or links: put a space only where the language's own style does (ja: a half-width space between Japanese and Latin text, as in `content/ja.yaml`).

## Done when

- `./node_modules/.bin/vitest run tests/unit/guides.test.ts` passes for your language.
- `./node_modules/.bin/astro build --outDir "$TMPDIR/site-<lang>/zanzibar-paper"` succeeds from the repository root (a separate output directory, so builds for several languages can run at once; if it fails on a file another language is writing, run it again).
- No broken internal link or fragment: run `lychee --offline --include-fragments --index-files index.html --no-progress --root-dir "$TMPDIR/site-<lang>" "$TMPDIR/site-<lang>/zanzibar-paper/<lang>/**/*.html"`.
