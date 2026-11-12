# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#阅读)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | [日本語](README.ja.md) | **简体中文** | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

一个把 Zanzibar 论文原文和译文并排阅读的网站。左边是原文，右边是你的语言，每段一行，拿不准的句子旁边总有原文可以对照。

> Ruoming Pang, Ramón Cáceres, Mike Burrows 等. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## 阅读

| 语言 | 页面 |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

每个段落都有 ¶ 链接，切换语言时仍停留在正在阅读的段落。两栏都可以单独隐藏。图 2 至图 5 是从 PDF 中截取的矢量图，而不是重绘。图 1 和两张表格都是文本，可以直接复制命名空间配置和延迟数据。

## 关于译文

译文为非官方翻译，与 Google、USENIX 及作者无关。论文版权 © 2019 归作者所有，[原文](https://www.usenix.org/conference/atc19/presentation/pang)可在 USENIX 免费阅读。

每份译文先借助 AI 起草，再由另一道工序逐块与英文对照，检查语义偏差、漏译和数字改动。例如韩语译文曾在 14 个块中把 *staleness* 和 *latency* 译成同一个词。译文仍可能有错误。如果发现，请附上该段落的 ¶ 链接[提交 issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation)。

## 如何保证忠实于原文

`content/en.yaml` 是 PDF 的转录，连原文的拼写错误（“continously”、“oustanding”）也保留下来，并按 `s2-2-p3`、`tab-1` 这样的 id 分块。`content/<lang>.yaml` 中的译文只在相同的 id 下存放字符串。`pnpm validate` 会拒绝漏掉块、改动代码片段、公式或引用，或者让 CJK 段落仍是英文的译文。CI 在每个 pull request 上运行它，同时运行 Biome、`astro check`、Vitest、针对日语的 textlint、markdownlint、`pnpm audit`、在桌面和手机视口下的 Playwright + axe、离线链接与片段检查，以及 actionlint 和 zizmor。Claude 审查会阅读每个 diff，找出这些检查发现不了的问题，比如格式正确但意思不对的译文。Dependabot 每周提出依赖更新，并等待 7 天冷却期。

## 开发

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # 校验原文和所有译文
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # 对构建结果运行 Playwright + axe
```

要添加一种语言，先在 `src/i18n/langs.ts` 中注册，在 `src/i18n/ui.ts` 中添加界面文案，然后运行 `node scripts/translation-skeleton.ts <code> > content/<code>.yaml`，翻译其中的值，直到 `pnpm validate <code>` 没有报错。

## 许可证

代码采用 [MIT License](LICENSE)。论文的正文、图和表格归作者所有，不在该许可证范围内。
