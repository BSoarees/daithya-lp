// Preços e modelos copiados de daithyabikes.com.br em 28/09/2026.
// O site pode morar numa subpasta (GitHub Pages), então as fotos seguem a base
const B = import.meta.env.BASE_URL.replace(/\/?$/, "/");
export const foto = (arquivo: string) => `${B}bikes/${arquivo}`;

export const WHATS = "5519983628818";
export const SITE = "https://daithyabikes.com.br";

export const wa = (texto: string) =>
  `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;

export const waModelo = (nome: string, esgotado = false) =>
  wa(
    esgotado
      ? `Olá, tenho uma loja e quero ser avisado quando a Daithya ${nome} voltar ao estoque.`
      : `Olá, tenho uma loja e quero revender a Daithya ${nome}. Vi o preço no site e gostaria de confirmar disponibilidade e entrega.`,
  );

export type Linha = "urbana" | "utilitaria" | "infantil";

export type Modelo = {
  id: string;
  nome: string;
  linha: Linha;
  selo: string;
  de?: number;
  por?: number;
  esgotado?: boolean;
  img: string;
  familia?: boolean;
  destaque?: string;
};

export const modelos: Modelo[] = [
  { id: "s2", nome: "S2", linha: "urbana", selo: "Exclusiva Daithya", de: 5700, por: 5500, img: foto("s2-catalog-black-seat-2026-08-29.webp") },
  { id: "fhx-002-pro", nome: "FHX-002 Pro", linha: "urbana", selo: "Modelo Daithya", de: 5200, por: 5000, img: foto("fhx-002-pro.webp") },
  { id: "fhx-002", nome: "FHX-002", linha: "urbana", selo: "Modelo Daithya", de: 5000, por: 4800, esgotado: true, img: foto("fhx-002.webp") },
  { id: "fhx-006-pro-15-6ah", nome: "FHX-006 Pro 15.6Ah", linha: "utilitaria", selo: "Modelo Daithya", de: 5200, por: 5000, img: foto("fhx-006-family.webp"), familia: true },
  { id: "fhx-006-pro-18-2ah", nome: "FHX-006 Pro 18.2Ah", linha: "utilitaria", selo: "Modelo Daithya", de: 5500, por: 5300, esgotado: true, img: foto("fhx-006-family.webp"), familia: true },
  { id: "fhx-009-500w", nome: "FHX-009 500W", linha: "utilitaria", selo: "Modelo Daithya", de: 4800, por: 4600, img: foto("fhx-009-family.webp"), familia: true },
  { id: "fhx-009-pro-500w", nome: "FHX-009 PRO 500W", linha: "utilitaria", selo: "Modelo Daithya", de: 5000, por: 4800, img: foto("fhx-009-family.webp"), familia: true },
  { id: "fhx-009-pro-1000w", nome: "FHX-009 PRO 1000W", linha: "utilitaria", selo: "Modelo Daithya", de: 5100, por: 4900, img: foto("fhx-009-family.webp"), familia: true },
  { id: "fhx-009-max-20-3ah", nome: "FHX-009 Max 20.3Ah", linha: "utilitaria", selo: "Modelo Daithya", de: 5400, por: 5200, esgotado: true, img: foto("fhx-009-family.webp"), familia: true },
  { id: "c1", nome: "C1", linha: "urbana", selo: "Modelo Daithya", de: 2400, por: 2200, img: foto("c1.webp") },
  { id: "s2-mini", nome: "S2 MINI", linha: "infantil", selo: "Linha juvenil", img: foto("s2-mini.webp") },
  { id: "c6", nome: "C6", linha: "infantil", selo: "Linha infantil", de: 1600, por: 1400, img: foto("c6.webp") },
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
