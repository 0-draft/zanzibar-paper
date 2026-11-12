# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#閱讀)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md) | **繁體中文** | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

一個把 Zanzibar 論文原文和譯文並排閱讀的網站。左邊是原文，右邊是你的語言，每段一列，拿不準的句子旁邊永遠有原文可以對照。

> Ruoming Pang, Ramón Cáceres, Mike Burrows 等. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## 閱讀

| 語言 | 頁面 |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

每個段落都有 ¶ 連結，切換語言時仍會停在正在閱讀的段落。兩欄都可以個別隱藏。圖 2 到圖 5 是從 PDF 擷取的向量圖，不是重新繪製的。圖 1 和兩張表格都是文字，可以直接複製命名空間設定和延遲數據。

## 關於譯文

譯文為非官方翻譯，與 Google、USENIX 及作者無關。論文著作權 © 2019 屬於作者，[原文](https://www.usenix.org/conference/atc19/presentation/pang)可在 USENIX 免費閱讀。

每份譯文先藉助 AI 草擬，再由另一道程序逐塊與英文對照，檢查語意偏差、漏譯和數字變動。例如韓文譯文曾在 14 個區塊中把 *staleness* 和 *latency* 譯成同一個詞。譯文仍可能有錯誤。如果發現，請附上該段落的 ¶ 連結[開一個 issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation)。

## 如何確保忠於原文

`content/en.yaml` 是 PDF 的逐字轉錄，連原文的拼字錯誤（「continously」、「oustanding」）也保留下來，並依 `s2-2-p3`、`tab-1` 這類 id 分成區塊。`content/<lang>.yaml` 的譯文只在相同的 id 下存放字串。`pnpm validate` 會拒絕缺少區塊、改動程式碼片段、公式或引用，或讓 CJK 段落仍是英文的譯文。CI 會在每個 pull request 上執行它，同時執行 Biome、`astro check`、Vitest、針對日文的 textlint、markdownlint、`pnpm audit`、在桌機和手機 viewport 下的 Playwright + axe、離線連結與片段檢查，以及 actionlint 和 zizmor。Claude 審查會閱讀每個 diff，找出這些檢查看不到的問題，例如格式正確但意思不同的譯文。Dependabot 每週提出相依套件更新，並先等待 7 天的冷卻期。

## 開發

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # 驗證原文和所有譯文
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # 對建置結果執行 Playwright + axe
```

要新增一種語言，先在 `src/i18n/langs.ts` 註冊，在 `src/i18n/ui.ts` 加入介面文字，然後執行 `node scripts/translation-skeleton.ts <code> > content/<code>.yaml`，翻譯其中的值，直到 `pnpm validate <code>` 沒有錯誤為止。

## 授權

程式碼採用 [MIT License](LICENSE)。論文的內文、圖和表格屬於作者，不在此授權範圍內。
