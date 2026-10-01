/* ---------- Simulador de pedido ----------
   Quantidade por modelo + margem do lojista. Mostra investimento, faturamento
   e lucro, e monta a mensagem do pedido para o WhatsApp. Fica salvo no
   navegador para não sumir ao recarregar. Nada é enviado sem o clique. */
import { WHATS, brl } from "../data/modelos";

const MINIMO = 3;
const CHAVE = "daithya-simulador";

export function iniciarSimulador() {
  const $ = (id: string) => document.getElementById(id)!;
  const linhas = [...document.querySelectorAll<HTMLElement>("[data-sim]")];
  const produtos = new Map(linhas.map((l) => [l.dataset.sim!, { nome: l.dataset.nome!, preco: Number(l.dataset.preco) }]));
  const qtd = new Map<string, number>([...produtos.keys()].map((id) => [id, 0]));
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
    for (const [id, n] of Object.entries(salvo)) if (qtd.has(id)) qtd.set(id, Math.max(0, Math.min(99, Number(n) || 0)));
  } catch {}

  const markup = $("markup") as HTMLInputElement;
  const enviar = $("sim-enviar") as HTMLAnchorElement;
  const total = () => [...qtd.values()].reduce((a, n) => a + n, 0);
  const subtotal = () => [...qtd].reduce((a, [id, n]) => a + n * produtos.get(id)!.preco, 0);
  const itensTexto = () => [...qtd].filter(([, n]) => n).map(([id, n]) => `- ${n}x ${produtos.get(id)!.nome}`);

  function avisoMinimo(unidades: number) {
    const falta = MINIMO - unidades;
    if (unidades >= 10) return "Com 10 bikes ou mais há condição especial. Pergunte ao comercial.";
    if (falta <= 0) return "Pedido mínimo atingido.";
    if (unidades === 0) return "Escolha pelo menos 3 bikes.";
    return `Falta${falta > 1 ? "m" : ""} ${falta} bike${falta > 1 ? "s" : ""} para o pedido mínimo.`;
  }

  function render() {
    try { localStorage.setItem(CHAVE, JSON.stringify(Object.fromEntries(qtd))); } catch {}
    const unidades = total(), custo = subtotal(), ok = unidades >= MINIMO;

    for (const l of linhas) {
      const n = qtd.get(l.dataset.sim!)!;
      l.querySelector("output")!.textContent = String(n);
      l.classList.toggle("text-fire-3", n > 0);
    }
    const venda = custo * (1 + Number(markup.value) / 100);
    $("markup-out").textContent = `${markup.value}%`;
    $("r-qtd").textContent = String(unidades);
    $("r-custo").textContent = brl(custo);
    $("r-venda").textContent = brl(venda);
    $("r-lucro").textContent = brl(venda - custo);
    $("r-aviso").textContent = avisoMinimo(unidades);
    enviar.setAttribute("aria-disabled", String(!ok));
    enviar.href = ok
      ? `https://wa.me/${WHATS}?text=${encodeURIComponent(`Olá, tenho uma loja e quero fazer este pedido Daithya:\n${itensTexto().join("\n")}\nTotal: ${unidades} bikes (${brl(custo)} no atacado).\nPode confirmar estoque, frete e prazo?`)}`
      : "#";
  }

  linhas.forEach((l) =>
    l.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = l.dataset.sim!;
        qtd.set(id, Math.max(0, Math.min(99, qtd.get(id)! + Number(b.dataset.step))));
        render();
      }),
    ),
  );
  markup.addEventListener("input", render);
  render();
}
