# zanzibar-paper

[English](README.md)

Zanzibar 論文「Zanzibar: Google's Consistent, Global Authorization System」(Pang ほか, USENIX ATC '19) の対訳サイト。左に原文、右に訳文を段落単位で並べている。

サイト: <https://0-draft.github.io/zanzibar-paper/>

訳文: 日本語 (ja)、简体中文 (zh-Hans)、繁體中文 (zh-Hant)、한국어 (ko)、Español (es)、Français (fr)、Deutsch (de)、Português (pt-BR)

## 本文の位置づけ

非公式の翻訳で、Google、USENIX、著者とは関係がなく、承認も受けていない。論文の著作権は著者 (2019) にあり、[USENIX ATC '19](https://www.usenix.org/conference/atc19/presentation/pang) で発表された。原文はそちらで読める。

訳文は AI の支援を受けて作り、別のレビュー工程とこのリポジトリの検証スクリプトで原文とブロック単位に照合している。それでも誤りは残りうる。見つけたら段落のリンク (各段落に ¶ アンカーがある) を添えて [issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) で知らせてほしい。

## 仕組み

- `content/en.yaml` は公開 PDF の書き起こしで、安定した id (`s2-2-p3`、`fig-2`、`tab-1`) を持つブロックに分けてある。構造の正はこのファイル。著者の原文の typo もそのまま残している。
- `content/<lang>.yaml` は同じ id をキーにした訳文の文字列だけを持つ。コード、TeX、リンク先は訳しても変えてはいけない。`pnpm validate` が全文字列を検査する。
- `src/lib/render.ts` はブロックを 1 行の grid にする (左が原文、右が訳文)。対応する段落は常に同じ高さから始まるので、スクロール同期は要らない。
- 図 2〜5 は PDF からのベクタ切り出し (`pnpm figures path/to/paper.pdf`)。図 1 と表はテキスト。
- サイトは Astro の静的ビルドで、GitHub Pages に置いている。

## 開発

```bash
pnpm install
pnpm dev                 # http://localhost:4321/zanzibar-paper/
pnpm validate            # 原文と全訳文の検証
pnpm test                # ユニットテスト (Vitest)
pnpm build && pnpm test:e2e   # ビルド済みサイトに Playwright + axe
pnpm lint && pnpm check && pnpm lint:md && pnpm lint:ja
```

## 言語の追加

1. `src/i18n/langs.ts` に登録し、`src/i18n/ui.ts` に UI 文言を足す。
2. `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` で雛形を作って値を訳す。
3. `pnpm validate <code>` がクリーンになるまで直す。

## CI

PR ごとに Biome、markdownlint、textlint (日本語)、本文の検証、`astro check`、Vitest、`pnpm audit`、ビルド、Playwright + axe (デスクトップとスマホ)、オフラインのリンク・フラグメント検査、actionlint と zizmor を走らせる。Claude のレビューは訳文の意味のずれなど、機械検査で拾えないものを diff から読む。Dependabot は npm と Actions を週 1 で更新する (7 日のクールダウン付き)。`main` への push は全部 green になったら GitHub Pages にデプロイされる。

## ライセンス

コードは MIT ([LICENSE](LICENSE))。論文の本文・図・表は著者の著作物で、このライセンスの対象外。
