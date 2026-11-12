# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#読む)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | **日本語** | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

Zanzibar 論文を原文と並べて読むためのサイト。左に原文、右に訳文を 1 段落ずつ横に並べてあるので、訳が引っかかった文のすぐ隣に原文がある。

> Ruoming Pang, Ramón Cáceres, Mike Burrows ほか. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## 読む

| 言語 | ページ |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

段落ごとに ¶ リンクがあり、言語を切り替えても読んでいた段落から動かない。原文だけ、訳文だけの表示にもできる。図 2〜5 は描き直しではなく PDF からのベクタ切り出し。図 1 と表 2 つはテキストなので、名前空間設定やレイテンシの数値をそのままコピーできる。

## 訳文について

非公式の翻訳で、Google、USENIX、著者とは関係がない。論文の著作権は著者 (2019) にあり、[原文](https://www.usenix.org/conference/atc19/presentation/pang)は USENIX で無料で読める。

訳文は AI の支援で下訳を作り、別の工程で原文とブロック単位に突き合わせて、意味のずれ、訳抜け、数値の取り違えを直している。たとえば韓国語訳では、*staleness* と *latency* が 14 ブロックにわたって同じ語で訳されていた。それでも誤りは残りうる。見つけたら段落の ¶ リンクを添えて [issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) を立ててほしい。

## 原文に忠実であり続ける仕組み

`content/en.yaml` は PDF の書き起こしで、原文の typo ("continously"、"oustanding") もそのまま残し、`s2-2-p3` や `tab-1` のような id を持つブロックに分けてある。`content/<lang>.yaml` の訳文は同じ id の下に文字列だけを持つ。`pnpm validate` は、ブロックの欠落、コード・数式・引用の改変、英語のまま残った CJK の段落を弾く。CI は PR ごとにこれを走らせ、あわせて Biome、`astro check`、Vitest、日本語の textlint、markdownlint、`pnpm audit`、デスクトップとスマホでの Playwright + axe、オフラインのリンク・フラグメント検査、actionlint と zizmor を回す。形式は正しいのに意味が違う訳のように機械検査では拾えないものは、Claude のレビューが diff から読む。依存の更新は Dependabot が週 1 で、公開から 7 日待ってから提案する。

## 開発

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # 原文と全訳文の検証
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # ビルド結果に Playwright + axe
```

言語を足すときは、`src/i18n/langs.ts` に登録して `src/i18n/ui.ts` に UI 文言を書き、`node scripts/translation-skeleton.ts <code> > content/<code>.yaml` で雛形を作って、`pnpm validate <code>` が通るまで訳す。

## ライセンス

コードは [MIT License](LICENSE)。論文の本文・図・表は著者のもので、このライセンスの対象外。
