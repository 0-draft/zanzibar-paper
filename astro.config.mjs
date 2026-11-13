// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// GitHub Pages project site: https://0-draft.github.io/zanzibar-paper/
export default defineConfig({
  site: process.env.SITE_URL ?? "https://0-draft.github.io",
  base: process.env.BASE_PATH ?? "/zanzibar-paper",
  trailingSlash: "always",
  integrations: [mdx(), sitemap()],
  build: { format: "directory" },
  prefetch: false,
  markdown: {
    shikiConfig: {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
      defaultColor: "light",
    },
  },
});
