import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { iniciarCarrinho } from "./carrinho";

gsap.registerPlugin(ScrollTrigger);

const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Rolagem suave ---------- */
let lenis: Lenis | null = null;
if (!calmo) {
  const l = new Lenis({ lerp: 0.12 });
  lenis = l;
  l.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const alvo = a.getAttribute("href")!;
      if (alvo.length < 2) return;
      e.preventDefault();
      l.start(); // o carrinho aberto pausa a rolagem
      l.scrollTo(alvo, { offset: -70 });
    }),
  );
}

/* ---------- Nav ganha fundo ao rolar ---------- */
const nav = document.getElementById("nav")!;
const pintaNav = () => nav.classList.toggle("nav-solid", scrollY > 40);
addEventListener("scroll", pintaNav, { passive: true });
pintaNav();

/* ---------- Animações ---------- */
if (!calmo) {
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero-in", { y: 40, opacity: 0, duration: 0.9, stagger: 0.09 })
    .from(".hero-bike", { x: 120, opacity: 0, scale: 0.9, duration: 1.3 }, 0.15)
    .from(".chip", { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2)" }, 0.8)
    .from(".hero-word", { y: 80, opacity: 0, duration: 1.6 }, 0);

  // Nome ao fundo desliza e o brilho cresce conforme a página rola
  gsap.to(".hero-word", { xPercent: -8, ease: "none", scrollTrigger: { trigger: "#topo", start: "top top", end: "+=900", scrub: true } });
  gsap.to(".hero-glow", { scale: 1.3, opacity: 0.4, ease: "none", scrollTrigger: { trigger: "#topo", start: "top top", end: "+=900", scrub: true } });

  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power2.out" }),
  });

  // Bikes dos destaques sobem um pouco mais devagar que a página
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) =>
    gsap.fromTo(img, { y: 50 }, { y: -50, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } }),
  );
} else {
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => (el.style.opacity = "1"));
}

/* ---------- Carrinho e simulador ---------- */
iniciarCarrinho(lenis);

/* ---------- Filtro do catálogo ---------- */
const filtros = document.querySelectorAll<HTMLButtonElement>("[data-filtro]");
const cards = document.querySelectorAll<HTMLElement>("#grade .card");
filtros.forEach((f) =>
  f.addEventListener("click", () => {
    filtros.forEach((x) => x.setAttribute("aria-pressed", String(x === f)));
    const alvo = f.dataset.filtro;
    const visiveis: HTMLElement[] = [];
    cards.forEach((c) => {
      const mostra = alvo === "todas" || c.dataset.linha === alvo;
      c.hidden = !mostra;
      if (mostra) visiveis.push(c);
    });
    if (!calmo) gsap.fromTo(visiveis, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.03 });
    ScrollTrigger.refresh();
  }),
);

/* ---------- Medição de cliques ----------
   Cada botão de WhatsApp tem data-track. Quando o GA4 / Meta Pixel for
   instalado, esses eventos passam a ser contados sem mexer no resto. */
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
  if (!a) return;
  const w = window as any;
  w.gtag?.("event", "whatsapp_click", { origem: a.dataset.track });
  w.fbq?.("track", "Contact", { origem: a.dataset.track });
});
