# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#lire)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | [Español](README.es.md) | **Français** | [Deutsch](README.de.md) | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

L’article sur Zanzibar, à lire en vis-à-vis. L’original reste à gauche et votre langue s’affiche à droite, un paragraphe par ligne, si bien que la phrase qui vous fait hésiter est toujours à côté de sa source.

> Ruoming Pang, Ramón Cáceres, Mike Burrows, et al. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## Lire

| Langue | Page |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

Chaque paragraphe a un lien ¶, et changer de langue vous laisse sur le paragraphe que vous lisiez. Vous pouvez masquer l’une ou l’autre colonne. Les figures 2 à 5 sont des extraits vectoriels du PDF, pas des redessins. La figure 1 et les deux tableaux sont du texte, ce qui permet de copier la configuration de namespace et les chiffres de latence.

## À propos des traductions

Elles sont non officielles et n’ont aucun lien avec Google, USENIX ni les auteurs. L’article est © 2019 ses auteurs, et l’[original](https://www.usenix.org/conference/atc19/presentation/pang) est en accès libre sur le site d’USENIX.

Chaque traduction a été rédigée avec l’aide d’une IA. Une relecture distincte l’a ensuite comparée à l’anglais bloc par bloc, à la recherche de glissements de sens, de propositions omises et de nombres modifiés. La traduction coréenne, par exemple, rendait *staleness* par le même mot que *latency* dans 14 blocs. Des erreurs peuvent subsister. Si vous en repérez une, [ouvrez une issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) avec le lien ¶ du paragraphe.

## Comment le texte reste fidèle

`content/en.yaml` est une transcription du PDF, coquilles comprises (« continously », « oustanding »), découpée en blocs dotés d’identifiants comme `s2-2-p3` ou `tab-1`. Une traduction dans `content/<lang>.yaml` ne contient que des chaînes sous ces mêmes identifiants. `pnpm validate` rejette une traduction qui omet un bloc, modifie un fragment de code, une formule ou une citation, ou laisse un paragraphe CJK en anglais. La CI l’exécute sur chaque pull request, avec Biome, `astro check`, Vitest, textlint pour le japonais, markdownlint, `pnpm audit`, Playwright avec axe sur un viewport de bureau et un viewport de téléphone, une vérification hors ligne des liens et des fragments, ainsi qu’actionlint avec zizmor. Une revue par Claude lit chaque diff pour repérer ce que ces vérifications ne voient pas, comme une traduction bien formée qui dit autre chose. Dependabot propose chaque semaine des mises à jour de dépendances, après un délai de 7 jours.

## Développement

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # l’original et toutes les traductions
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # Playwright + axe sur le build
```

Pour ajouter une langue, déclarez-la dans `src/i18n/langs.ts`, ajoutez ses chaînes d’interface dans `src/i18n/ui.ts`, puis lancez `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` et traduisez les valeurs jusqu’à ce que `pnpm validate <code>` ne signale plus rien.

## Licence

Le code est sous [licence MIT](LICENSE). Le texte, les figures et les tableaux de l’article appartiennent à leurs auteurs et n’en relèvent pas.
