// Explainer pages that accompany the paper: guides (background, history,
// mechanisms) and the ecosystem (systems built on the paper's ideas).
// One MDX file per language and page: src/content/guides/<lang>/<slug>.mdx.

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guides = defineCollection({
  // Keep the language folder's case in the id ("pt-BR/…", not "pt-br/…"):
  // the default id is slugified, which lowercases it.
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/guides",
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    /** One sentence for the index card and the meta description */
    description: z.string(),
    section: z.enum(["guide", "ecosystem"]),
    /** Guides index: which part the page belongs to */
    part: z.enum(["background", "mechanisms", "practice", "reference"]).optional(),
    /** Position in its section's index */
    order: z.number().int(),
    /** Date the facts were last checked (YYYY-MM-DD) */
    checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Paper sections this page explains, e.g. ["2.2", "2.4.4"] */
    paper: z.array(z.string()).default([]),
    /** Ecosystem pages: product facts shown in the header */
    product: z
      .object({
        name: z.string(),
        maintainer: z.string(),
        license: z.string(),
        language: z.string(),
        repo: z.url(),
        docs: z.url(),
        status: z.string(),
        latest: z.string(),
        logo: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { guides };
