# Brief for reviewing a translated guide or ecosystem page

You review the translation in `src/content/guides/<lang>/` against the English in `src/content/guides/en/`, as a careful native reader of the language would. The translator was a different agent; do not trust its choices because they look deliberate.

## Check, page by page

1. Meaning: every sentence says what the English says. No dropped clauses, no added claims, no softened or strengthened facts, numbers, dates or hedges ("not verified", "about", "at most").
2. Terms: the same term as `content/<lang>.yaml` (the paper translation) and the same term across all 24 pages. Make a term list first, then check.
3. Natural prose: reads as written in the language, not translated. Fix calques, wrong register (see `research/TRANSLATING.md`), unnatural word order, and punctuation and spacing conventions of the language.
4. Figures: labels short enough, consistent with the prose, and code-like labels left in English.
5. Links and anchors: link text matches the target; heading anchors resolve (checked by the build below).

## Rules

- Edit only `src/content/guides/<lang>/`. Keep everything `research/TRANSLATING.md` says to keep. Minimal edits; do not rewrite good sentences to taste.
- If the English itself is wrong, do not fix it; report it.
- No git writes.

## Done when

- `./node_modules/.bin/vitest run tests/unit/guides.test.ts -t "<lang>/"` and `-t "<lang> has every"` pass.
- `./node_modules/.bin/astro build --outDir "$TMPDIR/review-<lang>/zanzibar-paper"` succeeds (if it fails on a file another language is writing, run it again), and `lychee --offline --include-fragments --index-files index.html --no-progress --root-dir "$TMPDIR/review-<lang>" "$TMPDIR/review-<lang>/zanzibar-paper/<lang>/**/*.html"` reports 0 errors. If you changed a heading, fix every link to its anchor in the same language.

Report: the term list you settled on (short), the number of edits per page, the most important corrections (meaning errors first) with before → after, and anything wrong in the English.
