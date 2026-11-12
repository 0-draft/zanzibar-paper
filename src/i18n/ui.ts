// Interface strings. The paper text itself lives in content/*.yaml.

export interface UiStrings {
  /** Right-column heading, e.g. "日本語訳" */
  translation: string;
  /** Left-column heading */
  original: string;
  description: string;
  skip: string;
  contents: string;
  language: string;
  view: string;
  viewBoth: string;
  viewOriginal: string;
  viewTranslation: string;
  theme: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  permalink: string;
  tupleCaption: string;
  tupleParts: { namespace: string; object: string; relation: string; user: string };
  readOriginal: string;
  notice: string;
  aiNote: string;
  fixLink: string;
  sourceCode: string;
  backToTop: string;
}

const en: UiStrings = {
  translation: "Translation",
  original: "Original",
  description: "The Zanzibar paper (USENIX ATC ’19) in English and translation, paragraph by paragraph.",
  skip: "Skip to the paper",
  contents: "Contents",
  language: "Language",
  view: "View",
  viewBoth: "Side by side",
  viewOriginal: "Original only",
  viewTranslation: "Translation only",
  theme: "Theme",
  themeSystem: "System",
  themeLight: "Light",
  themeDark: "Dark",
  permalink: "Link to this paragraph",
  tupleCaption: "The page’s address, written as a Zanzibar relation tuple.",
  tupleParts: { namespace: "namespace", object: "object", relation: "relation", user: "user" },
  readOriginal: "Original paper",
  notice:
    "Unofficial translation. Not affiliated with or endorsed by Google, USENIX or the authors. The paper is © 2019 its authors and was published at USENIX ATC ’19.",
  aiNote: "Translated with AI assistance and checked against the original. Errors may remain.",
  fixLink: "Report a translation error",
  sourceCode: "Source on GitHub",
  backToTop: "Back to top",
};

export const UI: Record<string, UiStrings> = {
  en,
  ja: {
    translation: "日本語訳",
    original: "原文",
    description: "Zanzibar 論文 (USENIX ATC ’19) の英日対訳。段落ごとに原文と訳文を並べて読める。",
    skip: "本文へ移動",
    contents: "目次",
    language: "言語",
    view: "表示",
    viewBoth: "対訳",
    viewOriginal: "原文のみ",
    viewTranslation: "訳文のみ",
    theme: "テーマ",
    themeSystem: "システム",
    themeLight: "ライト",
    themeDark: "ダーク",
    permalink: "この段落へのリンク",
    tupleCaption: "このページのアドレスを Zanzibar のリレーションタプルで書くとこうなる。",
    tupleParts: { namespace: "名前空間", object: "オブジェクト", relation: "関係", user: "ユーザー" },
    readOriginal: "原論文",
    notice:
      "非公式の翻訳です。Google、USENIX、著者とは関係がなく、承認も受けていません。論文の著作権は著者 (2019) にあり、USENIX ATC ’19 で発表されました。",
    aiNote: "AI の支援を受けて翻訳し、原文と照合しています。誤りが残っている可能性があります。",
    fixLink: "誤訳を報告する",
    sourceCode: "GitHub のソース",
    backToTop: "ページの先頭へ",
  },
  "zh-Hans": {
    translation: "中文译文",
    original: "原文",
    description: "Zanzibar 论文（USENIX ATC ’19）英中对照，逐段并排阅读原文与译文。",
    skip: "跳到正文",
    contents: "目录",
    language: "语言",
    view: "显示",
    viewBoth: "对照",
    viewOriginal: "仅原文",
    viewTranslation: "仅译文",
    theme: "主题",
    themeSystem: "跟随系统",
    themeLight: "浅色",
    themeDark: "深色",
    permalink: "链接到本段",
    tupleCaption: "用 Zanzibar 关系元组写出的本页地址。",
    tupleParts: { namespace: "命名空间", object: "对象", relation: "关系", user: "用户" },
    readOriginal: "论文原文",
    notice:
      "非官方翻译，与 Google、USENIX 及作者无关，亦未获其认可。论文版权归作者所有（2019），发表于 USENIX ATC ’19。",
    aiNote: "译文在 AI 辅助下完成，并已对照原文核对，仍可能存在错误。",
    fixLink: "报告翻译错误",
    sourceCode: "GitHub 源代码",
    backToTop: "返回顶部",
  },
  "zh-Hant": {
    translation: "中文譯文",
    original: "原文",
    description: "Zanzibar 論文（USENIX ATC ’19）英中對照，逐段並排閱讀原文與譯文。",
    skip: "跳至正文",
    contents: "目錄",
    language: "語言",
    view: "顯示",
    viewBoth: "對照",
    viewOriginal: "僅原文",
    viewTranslation: "僅譯文",
    theme: "主題",
    themeSystem: "跟隨系統",
    themeLight: "淺色",
    themeDark: "深色",
    permalink: "連結到本段",
    tupleCaption: "以 Zanzibar 關係元組寫出的本頁位址。",
    tupleParts: { namespace: "命名空間", object: "物件", relation: "關係", user: "使用者" },
    readOriginal: "論文原文",
    notice:
      "非官方翻譯，與 Google、USENIX 及作者無關，亦未獲其認可。論文著作權屬於作者（2019），發表於 USENIX ATC ’19。",
    aiNote: "譯文在 AI 輔助下完成，並已對照原文校對，仍可能有錯誤。",
    fixLink: "回報翻譯錯誤",
    sourceCode: "GitHub 原始碼",
    backToTop: "回到頂端",
  },
  ko: {
    translation: "한국어 번역",
    original: "원문",
    description: "Zanzibar 논문(USENIX ATC ’19)의 영한 대역. 문단마다 원문과 번역문을 나란히 읽을 수 있다.",
    skip: "본문으로 건너뛰기",
    contents: "목차",
    language: "언어",
    view: "보기",
    viewBoth: "대역",
    viewOriginal: "원문만",
    viewTranslation: "번역문만",
    theme: "테마",
    themeSystem: "시스템",
    themeLight: "라이트",
    themeDark: "다크",
    permalink: "이 문단으로 연결",
    tupleCaption: "이 페이지의 주소를 Zanzibar 관계 튜플로 쓰면 이렇다.",
    tupleParts: { namespace: "네임스페이스", object: "객체", relation: "관계", user: "사용자" },
    readOriginal: "논문 원문",
    notice:
      "비공식 번역입니다. Google, USENIX, 저자와 관련이 없으며 승인을 받지 않았습니다. 논문의 저작권은 저자(2019)에게 있으며 USENIX ATC ’19에서 발표되었습니다.",
    aiNote: "AI의 도움을 받아 번역하고 원문과 대조했습니다. 오류가 남아 있을 수 있습니다.",
    fixLink: "번역 오류 신고",
    sourceCode: "GitHub 소스",
    backToTop: "맨 위로",
  },
  es: {
    translation: "Traducción",
    original: "Original",
    description: "El artículo de Zanzibar (USENIX ATC ’19) en inglés y en español, párrafo a párrafo.",
    skip: "Ir al artículo",
    contents: "Índice",
    language: "Idioma",
    view: "Vista",
    viewBoth: "En paralelo",
    viewOriginal: "Solo original",
    viewTranslation: "Solo traducción",
    theme: "Tema",
    themeSystem: "Sistema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    permalink: "Enlace a este párrafo",
    tupleCaption: "La dirección de esta página, escrita como una tupla de relación de Zanzibar.",
    tupleParts: { namespace: "espacio de nombres", object: "objeto", relation: "relación", user: "usuario" },
    readOriginal: "Artículo original",
    notice:
      "Traducción no oficial. Sin relación con Google, USENIX ni los autores, ni avalada por ellos. El artículo es © 2019 de sus autores y se publicó en USENIX ATC ’19.",
    aiNote: "Traducido con ayuda de IA y cotejado con el original. Puede contener errores.",
    fixLink: "Informar de un error de traducción",
    sourceCode: "Código en GitHub",
    backToTop: "Volver arriba",
  },
  fr: {
    translation: "Traduction",
    original: "Original",
    description: "L’article Zanzibar (USENIX ATC ’19) en anglais et en français, paragraphe par paragraphe.",
    skip: "Aller à l’article",
    contents: "Sommaire",
    language: "Langue",
    view: "Affichage",
    viewBoth: "En regard",
    viewOriginal: "Original seul",
    viewTranslation: "Traduction seule",
    theme: "Thème",
    themeSystem: "Système",
    themeLight: "Clair",
    themeDark: "Sombre",
    permalink: "Lien vers ce paragraphe",
    tupleCaption: "L’adresse de cette page, écrite comme un tuple de relation Zanzibar.",
    tupleParts: { namespace: "espace de noms", object: "objet", relation: "relation", user: "utilisateur" },
    readOriginal: "Article original",
    notice:
      "Traduction non officielle, sans lien avec Google, USENIX ou les auteurs, ni approuvée par eux. L’article est © 2019 ses auteurs et a été publié à USENIX ATC ’19.",
    aiNote: "Traduit avec l’aide de l’IA et vérifié par rapport à l’original. Des erreurs peuvent subsister.",
    fixLink: "Signaler une erreur de traduction",
    sourceCode: "Code source sur GitHub",
    backToTop: "Haut de page",
  },
  de: {
    translation: "Übersetzung",
    original: "Original",
    description: "Das Zanzibar-Paper (USENIX ATC ’19) auf Englisch und Deutsch, Absatz für Absatz.",
    skip: "Zum Paper springen",
    contents: "Inhalt",
    language: "Sprache",
    view: "Ansicht",
    viewBoth: "Nebeneinander",
    viewOriginal: "Nur Original",
    viewTranslation: "Nur Übersetzung",
    theme: "Design",
    themeSystem: "System",
    themeLight: "Hell",
    themeDark: "Dunkel",
    permalink: "Link zu diesem Absatz",
    tupleCaption: "Die Adresse dieser Seite als Zanzibar-Relationstupel.",
    tupleParts: { namespace: "Namespace", object: "Objekt", relation: "Relation", user: "Benutzer" },
    readOriginal: "Original-Paper",
    notice:
      "Inoffizielle Übersetzung. Nicht mit Google, USENIX oder den Autoren verbunden und nicht von ihnen autorisiert. Das Paper ist © 2019 seiner Autoren und erschien auf der USENIX ATC ’19.",
    aiNote: "Mit KI-Unterstützung übersetzt und mit dem Original abgeglichen. Fehler sind möglich.",
    fixLink: "Übersetzungsfehler melden",
    sourceCode: "Quellcode auf GitHub",
    backToTop: "Nach oben",
  },
  "pt-BR": {
    translation: "Tradução",
    original: "Original",
    description: "O artigo do Zanzibar (USENIX ATC ’19) em inglês e português, parágrafo por parágrafo.",
    skip: "Ir para o artigo",
    contents: "Sumário",
    language: "Idioma",
    view: "Exibição",
    viewBoth: "Lado a lado",
    viewOriginal: "Só o original",
    viewTranslation: "Só a tradução",
    theme: "Tema",
    themeSystem: "Sistema",
    themeLight: "Claro",
    themeDark: "Escuro",
    permalink: "Link para este parágrafo",
    tupleCaption: "O endereço desta página, escrito como uma tupla de relação do Zanzibar.",
    tupleParts: { namespace: "namespace", object: "objeto", relation: "relação", user: "usuário" },
    readOriginal: "Artigo original",
    notice:
      "Tradução não oficial. Sem vínculo com o Google, a USENIX ou os autores, nem endossada por eles. O artigo é © 2019 de seus autores e foi publicado no USENIX ATC ’19.",
    aiNote: "Traduzido com auxílio de IA e conferido com o original. Pode conter erros.",
    fixLink: "Relatar um erro de tradução",
    sourceCode: "Código no GitHub",
    backToTop: "Voltar ao topo",
  },
};

export function ui(lang: string): UiStrings {
  const s = UI[lang];
  if (!s) throw new Error(`no UI strings for ${lang}`);
  return s;
}
