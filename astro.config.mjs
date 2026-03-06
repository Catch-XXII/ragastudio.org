import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import { rehypeExternalLinks } from "./src/utils/rehype-external-links.js";

export default defineConfig({
  site: "https://ragastudio.org",
  integrations: [mdx({
    rehypePlugins: [rehypeExternalLinks],
  }), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  adapter: vercel(),
});
