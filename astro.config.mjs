import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Duas saídas a partir do mesmo código:
// - oficial (padrão): daithyabikes.com.br, na raiz, aparece no Google
// - demonstração (DEMO=1): GitHub Pages em /daithya-lp, fora do Google
const demo = process.env.DEMO === "1";

export default defineConfig({
  site: demo ? "https://bsoarees.github.io" : "https://daithyabikes.com.br",
  base: demo ? "/daithya-lp" : "/",
  outDir: demo ? "dist" : "dist-oficial",
  vite: { plugins: [tailwindcss()], define: { "import.meta.env.DEMO": JSON.stringify(demo) } },
});
