# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#read-it)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

**English** | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

The Zanzibar paper, read side by side. The original stays on the left and your language sits on the right, one paragraph per row, so the sentence you are unsure about is always next to its source.

> Ruoming Pang, Ramón Cáceres, Mike Burrows, et al. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## Read it

| Language | Page |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

Every paragraph has a ¶ link, and switching language keeps you on the paragraph you were reading. You can hide either column. Figures 2 to 5 are vector crops of the PDF rather than redraws. Figure 1 and both tables are text, so you can copy the namespace config and the latency numbers.

## About the translations

They are unofficial and have no connection to Google, USENIX or the authors. The paper is © 2019 its authors, and the [original](https://www.usenix.org/conference/atc19/presentation/pang) is free to read at USENIX.

Each translation was drafted with AI assistance. A separate pass then compared it with the English block by block, looking for meaning drift, dropped clauses and changed numbers. The Korean one, for example, had been rendering *staleness* with the same word as *latency* in 14 blocks. Errors can remain. If you spot one, [open an issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) with the paragraph's ¶ link.

## How the text stays faithful

`content/en.yaml` is a transcription of the PDF, typos included ("continously", "oustanding"), split into blocks with ids such as `s2-2-p3` or `tab-1`. A translation in `content/<lang>.yaml` holds only strings under those same ids. `pnpm validate` rejects a translation that drops a block, changes a code span, a formula or a citation, or leaves a CJK paragraph in English. CI runs it on every pull request, along with Biome, `astro check`, Vitest, textlint for the Japanese, markdownlint, `pnpm audit`, Playwright with axe on a desktop and a phone viewport, an offline link and fragment check, and actionlint with zizmor. A Claude review reads each diff for the things those checks cannot see, such as a translation that is well formed but says something else. Dependabot proposes dependency updates weekly, after a 7-day cooldown.

## Working on it

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # source and every translation
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # Playwright + axe against the build
```

To add a language, register it in `src/i18n/langs.ts`, add its interface strings to `src/i18n/ui.ts`, then run `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` and translate the values until `pnpm validate <code>` is clean.

## License

The code is under the [MIT License](LICENSE). The paper's text, figures and tables belong to its authors and are not covered by it.
