# CLAUDE.md

Guidance for Claude Code in this repository.

## What this is

A static Astro site that shows the Zanzibar paper (USENIX ATC '19) side by side: original English on the left, one of eight translations on the right. Public repo `0-draft/zanzibar-paper`, published at <https://0-draft.github.io/zanzibar-paper/> (base path `/zanzibar-paper/`).

## Layout

- `content/en.yaml`: transcription of the PDF, split into blocks with stable ids. Structural source of truth.
- `content/<lang>.yaml`: translated strings only, keyed by block id. Generate a new one with `scripts/translation-skeleton.ts`.
- `src/lib/content.ts`: types, loaders, and the validator (`validateSource`, `validateTranslation`).
- `src/lib/inline.ts`: the inline markup (`*em*`, `` `code` ``, `$tex$`, `[label](#id)`), rendered with KaTeX.
- `src/lib/render.ts`: blocks to grid rows (paired or shared) and the table of contents.
- `src/pages/[lang]/index.astro`: the reading page. `src/scripts/reader.ts` is progressive enhancement only (view and theme switches, keeping the paragraph across a language switch, current section).
- `src/i18n/langs.ts` and `src/i18n/ui.ts`: the language registry and interface strings.
- `public/figures/`: vector crops of the PDF made by `scripts/extract-figures.mjs`. The PDF is not committed.

## Invariants

- `content/en.yaml` stays a word-for-word transcription. Do not fix the authors' wording or typos.
- A translation never changes code spans, TeX or link targets, and has exactly the ids, fields and shapes of the source. `pnpm validate` enforces this; keep it green.
- Strings in translation files are one-line YAML scalars. Folded scalars insert spaces into CJK text.
- The unofficial-translation and AI-assistance notices stay on every reading page in every language.
- Colour roles are documented at the top of `src/styles/global.css` (blue: where you are, yellow: under the pointer, green: stored notation). Do not use them decoratively.
- Anchor offsets use `scroll-margin-top` on targets, not `scroll-padding` on the root: root scroll-padding makes the page jump when a control in the sticky bar takes focus.
- Reading preferences live as attributes on `<html>` (`data-view`, `data-layout`, `data-first`, `data-theme`), set before first paint by the inline script in `Base.astro` and kept in sync by `reader.ts`. Narrow screens are always `stacked`.
- Language fonts use `[lang="…"]` selectors, never `:lang()`: `:lang()` matches every descendant and overrides the mono and KaTeX faces inside CJK text.
- Japanese and Korean font CSS is linked only on `/ja/` and `/ko/` (`?url` imports in the page), not bundled into the shared stylesheet.

## Commands

```bash
pnpm dev
pnpm validate [lang...]
pnpm test
pnpm build && pnpm test:e2e
pnpm lint && pnpm check && pnpm lint:md && pnpm lint:ja
```

Inside the Claude Code sandbox, `pnpm` fails on its store lock and Chromium cannot start. Read-only checks run directly (`node scripts/validate-content.ts`, `./node_modules/.bin/vitest run`, `./node_modules/.bin/biome ci .`). install, `astro check`, and Playwright need the sandbox lifted.
