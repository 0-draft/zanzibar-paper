# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#lesen)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | **Deutsch** | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

Das Zanzibar-Paper, nebeneinander gelesen. Links steht das Original, rechts deine Sprache, ein Absatz pro Zeile, sodass der Satz, bei dem du unsicher bist, immer direkt neben seiner Quelle steht.

> Ruoming Pang, Ramón Cáceres, Mike Burrows, et al. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## Lesen

| Sprache | Seite |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

Jeder Absatz hat einen ¶-Link, und beim Sprachwechsel bleibst du auf dem Absatz, den du gerade gelesen hast. Beide Spalten lassen sich ausblenden. Die Abbildungen 2 bis 5 sind Vektorausschnitte aus dem PDF, keine Nachzeichnungen. Abbildung 1 und beide Tabellen sind Text, sodass du die Namespace-Konfiguration und die Latenzwerte kopieren kannst.

## Über die Übersetzungen

Sie sind inoffiziell und stehen in keiner Verbindung zu Google, USENIX oder den Autoren. Das Paper ist © 2019 bei seinen Autoren, und das [Original](https://www.usenix.org/conference/atc19/presentation/pang) ist bei USENIX frei lesbar.

Jede Übersetzung wurde mit KI-Unterstützung entworfen. Ein separater Durchgang hat sie anschließend Block für Block mit dem Englischen verglichen und nach Bedeutungsverschiebungen, ausgelassenen Satzteilen und geänderten Zahlen gesucht. Die koreanische Übersetzung etwa hatte *staleness* in 14 Blöcken mit demselben Wort wiedergegeben wie *latency*. Fehler können bleiben. Wenn du einen findest, [eröffne ein Issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) mit dem ¶-Link des Absatzes.

## Wie der Text originalgetreu bleibt

`content/en.yaml` ist eine Transkription des PDFs, samt Tippfehlern ("continously", "oustanding"), aufgeteilt in Blöcke mit IDs wie `s2-2-p3` oder `tab-1`. Eine Übersetzung in `content/<lang>.yaml` enthält nur Strings unter genau diesen IDs. `pnpm validate` lehnt eine Übersetzung ab, die einen Block auslässt, einen Code-Span, eine Formel oder ein Zitat verändert oder einen CJK-Absatz auf Englisch lässt. Die CI führt das bei jedem Pull Request aus, zusammen mit Biome, `astro check`, Vitest, textlint für das Japanische, markdownlint, `pnpm audit`, Playwright mit axe in einem Desktop- und einem Smartphone-Viewport, einer Offline-Prüfung von Links und Fragmenten sowie actionlint mit zizmor. Ein Claude-Review liest jeden Diff auf das hin, was diese Prüfungen nicht sehen, etwa eine Übersetzung, die formal korrekt ist, aber etwas anderes sagt. Dependabot schlägt wöchentlich Abhängigkeits-Updates vor, nach einer Wartezeit von 7 Tagen.

## Mitarbeiten

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # Original und alle Übersetzungen
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # Playwright + axe gegen den Build
```

Um eine Sprache hinzuzufügen, registriere sie in `src/i18n/langs.ts`, ergänze ihre Oberflächentexte in `src/i18n/ui.ts`, führe dann `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` aus und übersetze die Werte, bis `pnpm validate <code>` fehlerfrei durchläuft.

## Lizenz

Der Code steht unter der [MIT License](LICENSE). Text, Abbildungen und Tabellen des Papers gehören seinen Autoren und fallen nicht darunter.
