// Baixa uma cópia do site atual (daithyabikes.com.br): páginas e todos os
// arquivos que elas usam. Serve de backup e mantém no ar as páginas que a
// nova LP não substitui (fichas técnicas e "Sobre").
// Uso: node scripts/copiar-site-atual.mjs [pasta]   (padrão: site-atual/)
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ORIGEM = "https://daithyabikes.com.br";
const PASTA = process.argv[2] ?? "site-atual";
const fila = ["/", "/robots.txt", "/sitemap.xml", "/sitemap-index.xml", "/favicon-32.png", "/favicon-192.png", "/apple-touch-icon.png", "/site.webmanifest", "/404.html"];
const vistos = new Set();
const faltando = [];

const destino = (p) => join(PASTA, decodeURIComponent(p.endsWith("/") ? p + "index.html" : p));

while (fila.length) {
  const p = fila.shift();
  if (vistos.has(p)) continue;
  vistos.add(p);
  const r = await fetch(ORIGEM + p, { redirect: "follow" });
  if (!r.ok) { faltando.push(`${r.status} ${p}`); continue; }
  const tipo = r.headers.get("content-type") ?? "";
  const corpo = Buffer.from(await r.arrayBuffer());
  await mkdir(dirname(destino(p)), { recursive: true });
  await writeFile(destino(p), corpo);

  if (/text\/html|text\/css|xml|javascript|manifest/.test(tipo)) {
    const texto = corpo.toString("utf8");
    const achados = [
      ...texto.matchAll(/(?:href|src|content)=["']([^"']+)["']/g),
      ...texto.matchAll(/srcset=["']([^"']+)["']/g),
      ...texto.matchAll(/url\(["']?([^"')]+)["']?\)/g),
      ...texto.matchAll(/<loc>([^<]+)<\/loc>/g),
      ...texto.matchAll(/["'](\/_astro\/[^"']+)["']/g),
    ].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0]));
    for (let u of achados) {
      if (u.startsWith(ORIGEM)) u = u.slice(ORIGEM.length) || "/";
      if (!u.startsWith("/") || u.startsWith("//")) continue;
      u = u.split("#")[0].split("?")[0];
      if (u && !vistos.has(u)) fila.push(u);
    }
  }
}

console.log(`${vistos.size - faltando.length} arquivos copiados em ${PASTA}/`);
if (faltando.length) console.log("Não encontrados (normal para alguns opcionais):\n" + faltando.join("\n"));
