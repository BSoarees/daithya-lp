/* ---------- Carrinho + simulador ----------
   Um único estado (quantidade por modelo) alimenta o simulador, o carrinho
   e o contador do menu. Fica salvo no navegador para não sumir ao recarregar.
   É demonstração: nada é cobrado e nenhum dado sai da página. */
import type Lenis from "lenis";
import { WHATS, brl } from "../data/modelos";

const MINIMO = 3;
const CHAVE = "daithya-carrinho";

export function iniciarCarrinho(lenis: Lenis | null) {
  const $ = (id: string) => document.getElementById(id)!;
  const linhas = [...document.querySelectorAll<HTMLElement>("[data-sim]")];
  const produtos = new Map(
    linhas.map((l) => [l.dataset.sim!, { nome: l.dataset.nome!, preco: Number(l.dataset.preco), img: l.querySelector("img")!.getAttribute("src")! }]),
  );
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

  function mudar(id: string, delta: number) {
    qtd.set(id, Math.max(0, Math.min(99, qtd.get(id)! + delta)));
    render();
  }

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

    // Simulador
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
    ($("sim-carrinho") as HTMLButtonElement).disabled = unidades === 0;
    enviar.setAttribute("aria-disabled", String(!ok));
    enviar.href = ok
      ? `https://wa.me/${WHATS}?text=${encodeURIComponent(`Olá, tenho uma loja e quero fazer este pedido Daithya:\n${itensTexto().join("\n")}\nTotal: ${unidades} bikes (${brl(custo)} no atacado).\nPode confirmar estoque, frete e prazo?`)}`
      : "#";

    // Contador do menu
    const badge = $("cart-count");
    badge.textContent = String(unidades);
    badge.classList.toggle("hidden", unidades === 0);
    badge.classList.toggle("flex", unidades > 0);

    // Itens do carrinho
    const lista = $("cart-itens");
    lista.innerHTML = "";
    for (const [id, n] of qtd) {
      if (!n) continue;
      const p = produtos.get(id)!;
      const li = document.createElement("li");
      li.className = "flex items-center gap-3 py-4";
      li.innerHTML = `
        <img src="${p.img}" alt="" class="h-14 w-16 shrink-0 rounded-sm bg-white object-contain" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold leading-tight">${p.nome}</p>
          <p class="text-sm text-cream/50">${brl(p.preco)} /un.</p>
          <button type="button" data-remover="${id}" class="mt-1 text-xs text-cream/45 underline-offset-2 hover:text-cream hover:underline">Remover</button>
        </div>
        <div class="text-right">
          <div class="flex items-center gap-2">
            <button type="button" data-mudar="${id}" data-delta="-1" aria-label="Menos uma ${p.nome}" class="h-8 w-8 rounded-sm border border-cream/20 transition hover:border-cream/60">−</button>
            <span class="w-5 text-center font-bold tabular-nums">${n}</span>
            <button type="button" data-mudar="${id}" data-delta="1" aria-label="Mais uma ${p.nome}" class="h-8 w-8 rounded-sm border border-cream/20 transition hover:border-cream/60">+</button>
          </div>
          <p class="mt-1.5 text-sm font-semibold tabular-nums">${brl(n * p.preco)}</p>
        </div>`;
      lista.append(li);
    }
    lista.classList.toggle("hidden", unidades === 0);
    $("cart-vazio").classList.toggle("hidden", unidades > 0);
    $("cart-barra").style.width = `${Math.min(100, (unidades / MINIMO) * 100)}%`;
    $("cart-minimo").textContent = avisoMinimo(unidades);
    $("cart-subtotal").textContent = brl(custo);
    ($("cart-avancar") as HTMLButtonElement).disabled = !ok;
  }

  linhas.forEach((l) =>
    l.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((b) =>
      b.addEventListener("click", () => mudar(l.dataset.sim!, Number(b.dataset.step))),
    ),
  );
  markup.addEventListener("input", render);
  $("cart-itens").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b) return;
    if (b.dataset.remover) { qtd.set(b.dataset.remover, 0); render(); }
    if (b.dataset.mudar) mudar(b.dataset.mudar, Number(b.dataset.delta));
  });

  /* Etapas: 1 carrinho, 2 dados, 3 confirmação */
  const cart = $("cart");
  let etapaAtual = 1;
  function etapa(n: number) {
    etapaAtual = n;
    cart.querySelectorAll<HTMLElement>("[data-etapa]").forEach((s) => (s.hidden = s.dataset.etapa !== String(n)));
    cart.querySelectorAll<HTMLElement>("[data-etapa-ind]").forEach((s) => s.classList.toggle("atual", s.dataset.etapaInd === String(n)));
    $("cart-titulo").textContent = ["Seu carrinho", "Dados da loja", "Pedido feito"][n - 1];
  }

  /* Abrir e fechar a gaveta */
  let focoAntes: HTMLElement | null = null;
  function abrir() {
    etapa(etapaAtual === 3 ? 1 : etapaAtual);
    $("toast").classList.add("opacity-0", "translate-y-24", "pointer-events-none");
    focoAntes = document.activeElement as HTMLElement;
    cart.classList.add("aberto");
    cart.setAttribute("aria-hidden", "false");
    lenis?.stop();
    document.body.style.overflow = "hidden";
    setTimeout(() => cart.querySelector<HTMLElement>("button[data-cart-close]")?.focus(), 50);
  }
  function fechar() {
    cart.classList.remove("aberto");
    cart.setAttribute("aria-hidden", "true");
    lenis?.start();
    document.body.style.overflow = "";
    focoAntes?.focus();
  }
  document.querySelectorAll("[data-cart-open]").forEach((b) => b.addEventListener("click", abrir));
  cart.querySelectorAll("[data-cart-close]").forEach((b) => b.addEventListener("click", fechar));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && cart.classList.contains("aberto")) fechar(); });
  $("cart-avancar").addEventListener("click", () => etapa(2));
  cart.querySelector("[data-voltar]")!.addEventListener("click", () => etapa(1));

  /* Formulário: máscaras simples e validação */
  const form = $("cart-form") as HTMLFormElement;
  const campo = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
  const escolhido = (n: string) => form.querySelector<HTMLInputElement>(`[name="${n}"]:checked`)!.value;
  const mascara = (v: string, m: string) => {
    const d = v.replace(/\D/g, "");
    let i = 0, out = "";
    for (const c of m) { if (i >= d.length) break; out += c === "0" ? d[i++] : c; }
    return out;
  };
  const comMascara = (n: string, m: (digitos: number) => string) =>
    campo(n).addEventListener("input", () => { const el = campo(n); el.value = mascara(el.value, m(el.value.replace(/\D/g, "").length)); });
  comMascara("cnpj", () => "00.000.000/0000-00");
  comMascara("cep", () => "00000-000");
  comMascara("fone", (d) => (d > 10 ? "(00) 00000-0000" : "(00) 0000-0000"));
  form.querySelectorAll<HTMLInputElement>('[name="entrega"]').forEach((r) =>
    r.addEventListener("change", () => $("cart-endereco").classList.toggle("hidden", escolhido("entrega") === "retirada")),
  );

  const textoPagamento: Record<string, string> = {
    Pix: "Na versão real, aqui aparece o <b class='text-cream'>QR Code do Pix</b> gerado pelo meio de pagamento, com o frete já somado. O pedido é aprovado assim que o Pix cai.",
    Boleto: "Na versão real, aqui aparece o <b class='text-cream'>boleto para baixar</b>, com o frete já somado. O pedido é aprovado quando o boleto compensa.",
    "Transferência": "Na versão real, aqui aparecem os <b class='text-cream'>dados bancários</b> para a transferência, com o frete já somado.",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const obrigatorios = ["cnpj", "razao", "nome", "fone", "email", ...(escolhido("entrega") === "entrega" ? ["cep", "cidade"] : [])];
    let primeiroErro: HTMLInputElement | null = null;
    for (const n of obrigatorios) {
      const el = campo(n);
      const digitos = el.value.replace(/\D/g, "").length;
      const invalido = !el.value.trim()
        || (n === "cnpj" && digitos !== 14)
        || (n === "cep" && digitos !== 8)
        || (n === "fone" && digitos < 10)
        || (n === "email" && !el.checkValidity());
      el.setAttribute("aria-invalid", String(invalido));
      if (invalido && !primeiroErro) primeiroErro = el;
    }
    $("cart-erro").classList.toggle("hidden", !primeiroErro);
    if (primeiroErro) { primeiroErro.focus(); return; }

    // Confirmação montada na própria página: nada é enviado
    const pagamento = escolhido("pagamento");
    $("ok-numero").textContent = `DEMO-${Date.now().toString().slice(-6)}`;
    $("ok-itens").innerHTML = [...qtd].filter(([, n]) => n).map(([id, n]) => {
      const p = produtos.get(id)!;
      return `<li class="flex justify-between gap-4 py-2.5"><span>${n}x ${p.nome}</span><span class="tabular-nums">${brl(n * p.preco)}</span></li>`;
    }).join("");
    $("ok-total").textContent = brl(subtotal());
    $("ok-pagamento").innerHTML = `<p class="font-semibold text-cream">Pagamento: ${pagamento}</p><p class="mt-2">${textoPagamento[pagamento]}</p><p class="mt-2 text-xs text-cream/45">Demonstração: nenhuma cobrança foi gerada.</p>`;
    etapa(3);
  });

  $("ok-novo").addEventListener("click", () => {
    qtd.forEach((_, id) => qtd.set(id, 0));
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    $("cart-endereco").classList.remove("hidden");
    render();
    etapa(1);
  });

  // Botões "Adicionar ao carrinho" dos destaques e do catálogo
  const toast = $("toast");
  let toastTimer: number;
  document.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.add!;
      if (!qtd.has(id)) return;
      mudar(id, 1);
      const n = total();
      toast.innerHTML = `${produtos.get(id)!.nome} no carrinho (${n} ${n > 1 ? "bikes" : "bike"}). <button type="button" data-toast-abrir class="ml-2 underline">Ver carrinho</button>`;
      toast.classList.remove("opacity-0", "translate-y-24", "pointer-events-none");
      clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.add("opacity-0", "translate-y-24", "pointer-events-none"), 3000);
    }),
  );
  toast.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("[data-toast-abrir]")) abrir();
  });

  etapa(1);
  render();
}
