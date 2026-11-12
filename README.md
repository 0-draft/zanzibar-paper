# zanzibar-paper

[日本語](README.ja.md)

The Zanzibar paper, "Zanzibar: Google's Consistent, Global Authorization System" (Pang et al., USENIX ATC '19), in English and translation, paragraph by paragraph. The original sits on the left and a translation on the right, aligned one block at a time.

Site: <https://0-draft.github.io/zanzibar-paper/>

Translations: 日本語 (ja), 简体中文 (zh-Hans), 繁體中文 (zh-Hant), 한국어 (ko), Español (es), Français (fr), Deutsch (de), Português (pt-BR).

## Status of the text

This is an unofficial translation. It is not affiliated with or endorsed by Google, USENIX or the authors. The paper is © 2019 its authors and was published at [USENIX ATC '19](https://www.usenix.org/conference/atc19/presentation/pang). Read the original there.

The translations were produced with AI assistance, then checked block by block against the English by a separate review pass and by the validators in this repository. They can still contain errors. Please [open an issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) with the paragraph link (every paragraph has a ¶ anchor) if you find one.

## How it is built

- `content/en.yaml` is a transcription of the published PDF, split into blocks with stable ids (`s2-2-p3`, `fig-2`, `tab-1`). It is the structural source of truth. The authors' original typos are kept.
- `content/<lang>.yaml` holds only translated strings, keyed by the same ids. Code, TeX and link targets must survive translation unchanged; `pnpm validate` checks every string.
- `src/lib/render.ts` turns each block into one grid row: original left, translation right. Paired paragraphs therefore always start at the same height, with no scroll syncing.
- Figures 2 to 5 are vector crops of the PDF (`pnpm figures path/to/paper.pdf`). Figure 1 and the tables are text.
- The site is a static Astro build deployed to GitHub Pages.

## Development

```bash
pnpm install
pnpm dev                 # http://localhost:4321/zanzibar-paper/
pnpm validate            # source + every translation
pnpm test                # unit tests (Vitest)
pnpm build && pnpm test:e2e   # Playwright + axe on the built site
pnpm lint && pnpm check && pnpm lint:md && pnpm lint:ja
```

## Adding a language

1. Register it in `src/i18n/langs.ts` and add interface strings in `src/i18n/ui.ts`.
2. `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` and translate the values.
3. `pnpm validate <code>` until it is clean.

## CI

Every pull request runs Biome, markdownlint, textlint (Japanese), the content validator, `astro check`, Vitest, `pnpm audit`, the build, Playwright with axe (desktop and phone), an offline link and fragment check, and actionlint with zizmor. A Claude review reads the diff for what the checks cannot see, such as translation drift. Dependabot updates npm packages and actions weekly, with a 7-day cooldown. Pushes to `main` deploy to GitHub Pages once everything is green.

## License

The code is MIT licensed (see [LICENSE](LICENSE)). The paper's text, figures and tables remain the authors' work and are not covered by that license.
