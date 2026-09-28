import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Publicado em GitHub Pages: https://bsoarees.github.io/daithya-lp/
export default defineConfig({
  site: "https://bsoarees.github.io",
  base: "/daithya-lp",
  vite: { plugins: [tailwindcss()] },
});
