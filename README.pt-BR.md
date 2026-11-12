# zanzibar-paper

[![CI](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/zanzibar-paper/actions/workflows/ci.yml)
[![Paper: USENIX ATC '19](https://img.shields.io/badge/paper-USENIX%20ATC%20'19-1d5ca8)](https://www.usenix.org/conference/atc19/presentation/pang)
[![Translations: 8](https://img.shields.io/badge/translations-8-d9ead3)](#ler)
[![License: MIT (code)](https://img.shields.io/badge/license-MIT%20(code)-565e6a)](LICENSE)

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | **Português**

[![paper:zanzibar#translation@…](public/og.png)](https://0-draft.github.io/zanzibar-paper/)

O artigo do Zanzibar, lado a lado. O original fica à esquerda e o seu idioma à direita, um parágrafo por linha, então a frase sobre a qual você tem dúvida está sempre ao lado da fonte.

> Ruoming Pang, Ramón Cáceres, Mike Burrows, et al. *Zanzibar: Google's Consistent, Global Authorization System.* USENIX ATC '19.

## Ler

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

Cada parágrafo tem um link ¶, e trocar de idioma mantém você no parágrafo que estava lendo. Dá para ocultar qualquer uma das colunas. As figuras 2 a 5 são recortes vetoriais do PDF, e não redesenhos. A figura 1 e as duas tabelas são texto, então você pode copiar a configuração de namespace e os números de latência.

## Sobre as traduções

Elas não são oficiais e não têm relação com o Google, a USENIX ou os autores. O artigo é © 2019 de seus autores, e o [original](https://www.usenix.org/conference/atc19/presentation/pang) pode ser lido gratuitamente na USENIX.

Cada tradução foi rascunhada com auxílio de IA. Uma revisão separada depois a comparou com o inglês bloco a bloco, procurando desvios de sentido, orações omitidas e números alterados. A coreana, por exemplo, traduzia *staleness* com a mesma palavra que *latency* em 14 blocos. Ainda podem restar erros. Se encontrar algum, [abra uma issue](https://github.com/0-draft/zanzibar-paper/issues/new?labels=translation) com o link ¶ do parágrafo.

## Como o texto se mantém fiel

`content/en.yaml` é uma transcrição do PDF, com erros de digitação e tudo ("continously", "oustanding"), dividida em blocos com ids como `s2-2-p3` ou `tab-1`. Uma tradução em `content/<lang>.yaml` contém apenas strings sob esses mesmos ids. `pnpm validate` rejeita uma tradução que omita um bloco, altere um trecho de código, uma fórmula ou uma citação, ou deixe um parágrafo CJK em inglês. A CI executa isso em cada pull request, junto com Biome, `astro check`, Vitest, textlint para o japonês, markdownlint, `pnpm audit`, Playwright com axe em um viewport de desktop e outro de celular, uma verificação offline de links e fragmentos, e actionlint com zizmor. Uma revisão do Claude lê cada diff em busca do que essas verificações não enxergam, como uma tradução bem formada que diz outra coisa. O Dependabot propõe atualizações de dependências semanalmente, após um período de espera de 7 dias.

## Desenvolvimento

```bash
pnpm install
pnpm dev                       # http://localhost:4321/zanzibar-paper/
pnpm validate                  # original e todas as traduções
pnpm test                      # Vitest
pnpm build && pnpm test:e2e    # Playwright + axe sobre o build
```

Para adicionar um idioma, registre-o em `src/i18n/langs.ts`, adicione os textos da interface em `src/i18n/ui.ts`, depois rode `node scripts/translation-skeleton.ts <code> > content/<code>.yaml` e traduza os valores até que `pnpm validate <code>` passe sem erros.

## Licença

O código está sob a [MIT License](LICENSE). O texto, as figuras e as tabelas do artigo pertencem aos autores e não são cobertos por ela.
