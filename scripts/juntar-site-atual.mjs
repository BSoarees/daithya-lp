// Junta à nova LP as páginas do site atual que ela não substitui
// (fichas técnicas, "Sobre", 404, imagens). A página inicial é a nova.
// robots.txt e sitemap.xml vêm do site atual, que libera o Google.
import { cp, copyFile, access } from "node:fs/promises";
import { join } from "node:path";

if (process.env.DEMO === "1") process.exit(0); // a demonstração é só a LP

const ORIGEM = "site-atual", DESTINO = "dist-oficial";
const existe = (p) => access(p).then(() => true, () => false);

if (!(await existe(join(ORIGEM, "sobre", "index.html")))) {
  console.error("Falta a cópia do site atual. Rode: node scripts/copiar-site-atual.mjs");
  process.exit(1);
}
await cp(ORIGEM, DESTINO, {
  recursive: true,
  force: false, // o que a nova LP gerou tem prioridade
  filter: (p) => p !== join(ORIGEM, "index.html"),
});
for (const f of ["robots.txt", "sitemap.xml"]) await copyFile(join(ORIGEM, f), join(DESTINO, f));
console.log("Site oficial montado em dist-oficial/");
