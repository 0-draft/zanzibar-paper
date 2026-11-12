# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#leerlo)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | **Español** | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt-BR.md)

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

El artículo de Zanzibar, para leer en paralelo. El original queda a la izquierda y tu idioma a la derecha, un párrafo por fila, de modo que la frase que te genera dudas siempre está junto a su fuente.

> Ruoming Pang, Ramón Cáceres, Mike Burrows, et al. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## Leerlo

| Idioma | Página |
| --- | --- |
| 日本語 | [Zanzibar: Google の一貫性を備えたグローバル認可システム](https://0-draft.github.io/zanzibar-paper/ja/) |
| 简体中文 | [Zanzibar：Google 的一致性全球授权系统](https://0-draft.github.io/zanzibar-paper/zh-Hans/) |
| 繁體中文 | [Zanzibar：Google 的一致性全球授權系統](https://0-draft.github.io/zanzibar-paper/zh-Hant/) |
| 한국어 | [Zanzibar: Google의 일관된 글로벌 인가 시스템](https://0-draft.github.io/zanzibar-paper/ko/) |
| Español | [Zanzibar: el sistema de autorización global y consistente de Google](https://0-draft.github.io/zanzibar-paper/es/) |
| Français | [Zanzibar : le système d’autorisation global et cohérent de Google](https://0-draft.github.io/zanzibar-paper/fr/) |
| Deutsch | [Zanzibar: Googles konsistentes, globales Autorisierungssystem](https://0-draft.github.io/zanzibar-paper/de/) |
| Português (Brasil) | [Zanzibar: o sistema de autorização global e consistente do Google](https://0-draft.github.io/zanzibar-paper/pt-BR/) |

Cada párrafo tiene un enlace ¶, y al cambiar de idioma sigues en el párrafo que estabas leyendo. Puedes ocultar cualquiera de las dos columnas. Las figuras 2 a 5 son recortes vectoriales del PDF, no dibujos rehechos. La figura 1 y las dos tablas son texto, así que puedes copiar la configuración del namespace y las cifras de latencia.

## Sobre las traducciones

No son oficiales y no tienen relación con Google, USENIX ni los autores. El artículo es © 2019 de sus autores, y el [original](https://www.usenix.org/conference/atc19/presentation/pang) se puede leer gratis en USENIX.

Cada traducción se redactó con ayuda de IA. Después, una revisión aparte la comparó con el inglés bloque por bloque, buscando desvíos de sentido, cláusulas omitidas y números cambiados. La coreana, por ejemplo, traducía *staleness* con la misma palabra que *latency* en 14 bloques. Puede que queden errores. Si encuentras uno, [abre un issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) con el enlace ¶ del párrafo.

## Cómo se mantiene fiel el texto

`content/en.yaml` es una transcripción del PDF, erratas incluidas ("continously", "oustanding"), dividida en bloques con ids como `s2-2-p3` o `tab-1`. Una traducción en `content/<lang>.yaml` solo contiene cadenas bajo esos mismos ids. `pnpm validate` rechaza una traducción que omita un bloque, cambie un fragmento de código, una fórmula o una cita, o deje un párrafo CJK en inglés. CI lo ejecuta en cada pull request, junto con Biome, `astro check`, Vitest, textlint para el japonés, markdownlint, `pnpm audit`, Playwright con axe en un viewport de escritorio y otro de móvil, una comprobación offline de enlaces y fragmentos, y actionlint con zizmor. Una revisión de Claude lee cada diff en busca de lo que esas comprobaciones no ven, como una traducción bien formada que dice otra cosa. Dependabot propone actualizaciones de dependencias cada semana, tras un periodo de espera de 7 días.

## Desarrollo

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # el original y todas las traducciones
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # Playwright + axe sobre el build
```

Para añadir un idioma, regístralo en `src/i18n/langs.ts`, añade sus textos de interfaz en `src/i18n/ui.ts`, luego ejecuta `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` y traduce los valores hasta que `pnpm validate <code>` no dé errores.

## Licencia

El código está bajo la [MIT License](LICENSE). El texto, las figuras y las tablas del artículo pertenecen a sus autores y no están cubiertos por ella.
