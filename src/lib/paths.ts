// Join a path onto the configured base ("/zanzibar-paper/"), never doubling or
// dropping the slash between them.

export function joinBase(base: string, path = ""): string {
  const b = base.endsWith("/") ? base : `${base}/`;
  return b + path.replace(/^\/+/, "");
}

export const withBase = (path = "") => joinBase(import.meta.env.BASE_URL, path);

export const REPO_URL = "https://github.com/0-draft/zanzibar-paper";

/** Prefilled issue for a translation error at one block of one language. */
export function issueUrl(lang: string, blockId?: string): string {
  const kind = lang === "en" ? "transcription" : "translation";
  const title = blockId ? `[${lang}] ${kind}: ${blockId}` : `[${lang}] ${kind}`;
  const body = [
    `Language: ${lang}`,
    blockId ? `Paragraph: #${blockId}` : "",
    "",
    "What is wrong:",
    "",
    "Suggested wording:",
    "",
  ]
    .filter((l, i) => l !== "" || i > 1)
    .join("\n");
  const q = new URLSearchParams({ title, body, labels: "translation" });
  return `${REPO_URL}/issues/new?${q.toString()}`;
}
