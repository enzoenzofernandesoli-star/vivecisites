"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";
import { ContactForm } from "./ContactForm";
import { LOGO_DRAW_DURATION, VVCLogo } from "./VVCLogo";
import { Reveal } from "./motion/Reveal";
import { TextReveal } from "./motion/TextReveal";
import { Stagger } from "./motion/Stagger";
import { ServiceCard } from "./motion/ServiceCard";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import { StickyHeader } from "./motion/StickyHeader";
import { Cursor } from "./motion/Cursor";
import { DistortionImage } from "./motion/DistortionImage";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "./viveci.module.css";

const process = [
  {
    title: "Conversa",
    description: "Você conta sobre seu negócio, seu público e o que precisa.",
    icon: "chat",
  },
  {
    title: "Modelo",
    description: "Criamos uma primeira versão com a identidade da sua empresa.",
    icon: "window",
  },
  {
    title: "Você avalia",
    description: "Você recebe o link, explora o site e compartilha seus ajustes.",
    icon: "search",
  },
  {
    title: "Valor",
    description: "Com o escopo definido, apresentamos um valor fechado.",
    icon: "price",
  },
  {
    title: "Publicação",
    description: "Fazemos os ajustes finais, conectamos o domínio e publicamos.",
    icon: "globe",
  },
] as const;

/** Ícones de linha das etapas do processo. */
function ProcessIcon({ name }: { name: (typeof process)[number]["icon"] }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {name === "chat" && <>
        <path d="M5 10a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H14l-6 4v-4a3 3 0 0 1-3-3z"/>
        <circle cx="12" cy="14" r=".9" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="14" r=".9" fill="currentColor" stroke="none"/>
        <circle cx="20" cy="14" r=".9" fill="currentColor" stroke="none"/>
      </>}
      {name === "window" && <>
        <rect x="4" y="6" width="24" height="20" rx="2.5"/>
        <line x1="4" y1="12" x2="28" y2="12"/>
        <circle cx="7.6" cy="9" r=".8" fill="currentColor" stroke="none"/>
        <circle cx="10.4" cy="9" r=".8" fill="currentColor" stroke="none"/>
        <rect x="8" y="16" width="7" height="6" rx="1"/>
        <line x1="18" y1="17.5" x2="24" y2="17.5"/>
        <line x1="18" y1="21" x2="24" y2="21"/>
      </>}
      {name === "search" && <>
        <circle cx="14.5" cy="14.5" r="8"/>
        <line x1="20.4" y1="20.4" x2="27" y2="27"/>
      </>}
      {name === "price" && <>
        <path d="M8 4h11l5 5v19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
        <polyline points="19,4 19,9 24,9"/>
        <line x1="15" y1="14" x2="15" y2="25"/>
        <path d="M18 16.4c0-1.2-1.3-2-3-2s-3 .8-3 2 1.3 1.7 3 2.1 3 .9 3 2.1-1.3 2-3 2-3-.8-3-2"/>
      </>}
      {name === "globe" && <>
        <circle cx="16" cy="16" r="11"/>
        <ellipse cx="16" cy="16" rx="4.6" ry="11"/>
        <line x1="5" y1="16" x2="27" y2="16"/>
        <path d="M7.5 9.5c2.4 1.6 5.4 2.5 8.5 2.5s6.1-.9 8.5-2.5"/>
        <path d="M7.5 22.5c2.4-1.6 5.4-2.5 8.5-2.5s6.1.9 8.5 2.5"/>
      </>}
    </svg>
  );
}

/**
 * Uma etapa do fluxo em ziguezague. Quando entra na tela, o raio diagonal se
 * desenha e o card sobe logo atrás. A revelação é feita por transição de CSS
 * sobre `data-shown` — mais previsível que animar `clip-path` pelo framer.
 */
/**
 * Uma etapa do fluxo. É só marcação: quem anima é o orquestrador da seção,
 * para que o traço corra continuamente de uma etapa à seguinte em vez de
 * quatro desenhos independentes.
 */
function ProcessFlowStep({
  step,
  index,
}: {
  step: (typeof process)[number];
  index: number;
}) {
  const side = index % 2 === 0 ? "left" : "right";
  return (
    <li className={styles.processFlowItem} data-side={side} data-fluxo-item>
      {index > 0 && (
        <svg className={styles.processBolt} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path
            data-fluxo-curva
            pathLength={1}
            d={side === "right" ? "M 18 0 C 18 38, 82 62, 82 100" : "M 82 0 C 82 38, 18 62, 18 100"}
          />
        </svg>
      )}
      <div className={styles.processFlowCard}>
        <span className={styles.processCardIcon}><ProcessIcon name={step.icon} /></span>
        <h3>{step.title}</h3>
        <em aria-hidden />
        <p>{step.description}</p>
      </div>
    </li>
  );
}

/**
 * Orquestra o fluxo inteiro num único scrub: o traço corre da etapa 1 até a 5
 * conforme a seção passa pela tela, e cada etapa acende quando a linha chega
 * nela. É isso que dá a sensação de percurso, e não de itens soltos surgindo.
 */
function ProcessFlow({ semMovimento }: { semMovimento: boolean }) {
  const ref = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const lista = ref.current;
      if (!lista) return;

      const itens = Array.from(lista.querySelectorAll<HTMLElement>("[data-fluxo-item]"));
      const curvas = Array.from(lista.querySelectorAll<SVGPathElement>("[data-fluxo-curva]"));

      const acender = (i: number, ligado: boolean) =>
        itens[i]?.setAttribute("data-shown", ligado ? "true" : "false");

      if (semMovimento) {
        itens.forEach((_, i) => acender(i, true));
        return;
      }

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        curvas.forEach((c) => { c.style.strokeDasharray = "1"; c.style.strokeDashoffset = "1"; });
        itens.forEach((_, i) => acender(i, i === 0));

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: lista,
            start: "top 85%",
            end: "bottom 55%",
            scrub: 1.2,
          },
        });

        /**
         * O valor é interpolado num objeto e escrito à mão no atributo.
         * Animar `strokeDashoffset` direto, com pathLength normalizado, faz o
         * GSAP escrever só os extremos (1px e 0px) — a linha aparecia de uma
         * vez em vez de ser desenhada.
         */
        curvas.forEach((curva, i) => {
          const estado = { v: 1 };
          tl.to(estado, {
            v: 0,
            duration: 1,
            onUpdate: () => {
              curva.style.strokeDashoffset = String(estado.v);
              acender(i + 1, estado.v < 0.16);
            },
          });
          tl.to({}, { duration: 0.22 });
        });

        return () => { tl.scrollTrigger?.kill(); tl.kill(); };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [semMovimento] }
  );

  return (
    <ol ref={ref} className={styles.processFlow}>
      {process.map((step, index) => (
        <ProcessFlowStep key={step.title} step={step} index={index} />
      ))}
    </ol>
  );
}

const serviceObjectives = [
  {
    title: "Sites",
    purpose: "Sites e landing pages. Identidade visual, imagens e textos.",
    icon: "site",
  },
  {
    title: "Visibilidade",
    purpose: "Google, Maps e SEO. Presença nas buscas e análise de resultados.",
    icon: "search",
  },
  {
    title: "Sistemas",
    purpose: "Sistemas e aplicativos. Gestão, automações e integrações sob medida.",
    icon: "code",
  },
  {
    title: "Suporte",
    purpose: "Manutenção e atualizações. Atendimento por WhatsApp após a entrega.",
    icon: "support",
  },
] as const;

const technologyLayers = [
  {
    title: "Interface",
    description: "O que seu cliente vê e usa.",
    technologies: ["HTML", "CSS", "TypeScript", "React", "Next.js"],
  },
  {
    title: "Aplicação",
    description: "A lógica por trás de cada ação.",
    technologies: ["Node.js", "Python"],
  },
  {
    title: "Dados",
    description: "Informações conectadas ao seu negócio.",
    technologies: ["Supabase"],
  },
] as const;

const frequentlyAskedQuestions = [
  ["O modelo é grátis mesmo?", "Sim. Você não paga para ver, não assina nada e pode recusar sem compromisso."],
  ["Eu já tenho Instagram. Preciso de site?", "O Instagram ajuda a manter contato com quem já conhece o seu negócio. O site também permite que sua empresa seja encontrada por quem procura seu serviço no Google."],
  ["Quanto custa?", "O valor depende do que o projeto precisa. Depois de você avaliar o modelo e definirmos o escopo, apresentamos um valor fechado."],
  ["Quem fica com o site e o domínio?", "O domínio e o conteúdo pertencem ao seu negócio. O site é seu."],
] as const;

function TechIcon({ name }: { name: string }) {
  if (name === "HTML") return <span className={styles.techShield}>5</span>;
  if (name === "CSS") return <span className={styles.techShield}>3</span>;
  if (name === "TypeScript") return <span className={styles.techSquare}>TS</span>;
  if (name === "React") return <svg viewBox="0 0 48 48" aria-hidden><circle cx="24" cy="24" r="3"/><ellipse cx="24" cy="24" rx="21" ry="8"/><ellipse cx="24" cy="24" rx="21" ry="8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="21" ry="8" transform="rotate(120 24 24)"/></svg>;
  if (name === "Next.js") return <span className={styles.techNext}>N</span>;
  if (name === "Node.js") return <span className={styles.techHex}>JS</span>;
  if (name === "Python") return <svg viewBox="0 0 48 48" aria-hidden><path d="M24 5c-10 0-9 4-9 4v7h10v2H11S5 17 5 27s6 10 6 10h6v-7s0-6 7-6h10s6 0 6-7V10s1-5-16-5Z"/><circle cx="20" cy="10" r="1.5"/><path d="M24 43c10 0 9-4 9-4v-7H23v-2h14s6 1 6-9-6-10-6-10h-6v7s0 6-7 6H14s-6 0-6 7v7s-1 5 16 5Z"/><circle cx="28" cy="38" r="1.5"/></svg>;
  if (name === "Supabase") return <svg viewBox="0 0 48 48" aria-hidden><path d="M27 4 9 27h15l-3 17 18-25H25L27 4Z"/></svg>;
  if (name === "GitHub") return <svg viewBox="0 0 48 48" aria-hidden><path d="M24 5a19 19 0 0 0-6 37v-5c-5 1-6-2-6-2-.8-2-2-3-2-3-2-1 0-1 0-1 2 0 3 2 4 2 1-1 2-1 3-1 .2-2 1-3 2-4-4 0-8-2-8-9 0-2 1-4 2-6-1-2 0-5 0-5 2 0 5 2 5 2a18 18 0 0 1 10 0s3-2 5-2c0 0 1 3 0 5 1 2 2 4 2 6 0 7-4 9-8 9 1 1 2 3 2 5v7a19 19 0 0 0-6-37Z"/></svg>;
  return <span className={styles.techTriangle} aria-hidden />;
}

function ServiceIcon({ type }: { type: (typeof serviceObjectives)[number]["icon"] }) {
  if (type === "site") return <svg viewBox="0 0 48 48" aria-hidden><rect x="8" y="10" width="32" height="28" rx="1"/><path d="M8 17h32M13 14h1M18 14h1M14 23h10v9H14zM28 24h7M28 28h7M28 32h5"/></svg>;
  if (type === "search") return <svg viewBox="0 0 48 48" aria-hidden><circle cx="21" cy="21" r="11"/><path d="m29 29 10 10M17 21h8"/></svg>;
  if (type === "code") return <svg viewBox="0 0 48 48" aria-hidden><path d="m18 13-11 11 11 11M30 13l11 11-11 11M27 8l-6 32"/></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden><path d="M9 23c0-8 6.7-14 15-14s15 6 15 14-6.7 14-15 14c-2.2 0-4.3-.4-6.2-1.2L10 39l2.4-7A13.4 13.4 0 0 1 9 23Z"/><circle cx="18" cy="23" r="1"/><circle cx="24" cy="23" r="1"/><circle cx="30" cy="23" r="1"/></svg>;
}

const projects = [
  { area: "Viveci App", image: "/images/projects/viveci-app.jpg", position: "top center", kind: "Aplicativo de treinos · Área logada" },
  { area: "Agenda Viveci", image: "/images/projects/agenda-viveci.jpg", position: "top center", kind: "CRM e agenda · Sistema interno" },
  { area: "Prospector", image: "/images/projects/prospector.png", position: "top center" },
  { area: "Pousada da Nívea", image: "/images/projects/pousada-da-nivea.png", position: "top center" },
  { area: "Care For Men", image: "/images/projects/care-for-men.png", position: "top center" },
  { area: "Apoio ao Autismo", image: "/images/projects/apoio-autismo.png", position: "top center" },
  { area: "Pare a Queda", image: "/images/projects/calvicie.png", position: "top center" },
  { area: "Arsenal de Prompts", image: "/images/projects/arsenal-de-prompts.png", position: "top center" },
  { area: "Barbearia Buenos Aires", image: "/images/projects/barbearia-buenos-aires.png", position: "top center" },
  { area: "Maria Flor", image: "/images/projects/maria-flor.png", position: "top center" },
  { area: "Ana Magalhães", image: "/images/projects/ana-magalhaes.png", position: "top center" },
  { area: "Imobilis Momentum", image: "/images/projects/imobilis-momentum.png", position: "top center" },
] as const;

function usePinnedProgress(ref: RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      progress.set(Math.max(0, Math.min(1, -el.getBoundingClientRect().top / total)));
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => { window.removeEventListener("scroll", request); window.removeEventListener("resize", request); if (raf) cancelAnimationFrame(raf); };
  }, [progress, ref]);
  return progress;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    const frame = requestAnimationFrame(update);
    query.addEventListener("change", update);
    return () => { cancelAnimationFrame(frame); query.removeEventListener("change", update); };
  }, []);
  return reduced;
}

/** No celular a galeria de projetos vira scroll horizontal nativo com snap. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const update = () => setMobile(query.matches);
    const frame = requestAnimationFrame(update);
    query.addEventListener("change", update);
    return () => { cancelAnimationFrame(frame); query.removeEventListener("change", update); };
  }, []);
  return mobile;
}

export function ViveciRedesign() {
  const intro = useRef<HTMLElement>(null);
  const projectsSection = useRef<HTMLElement>(null);
  const projectsViewport = useRef<HTMLDivElement>(null);
  const projectsTrack = useRef<HTMLDivElement>(null);
  const projectsBar = useRef<HTMLElement>(null);
  const [projectDragLimit, setProjectDragLimit] = useState(0);
  const [activeProject, setActiveProject] = useState(0);
  const [activeProcess, setActiveProcess] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(2);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  useHeroParallax(heroRef);
  const ctaHero = useMagnetic<HTMLAnchorElement>();
  const isMobile = useIsMobile();
  // Com movimento reduzido o trilho nao e dirigido pelo scroll: o carrossel
  // vira rolagem horizontal no dedo. No celular normal ele trava, como no desktop.
  const carrosselNativo = prefersReducedMotion;
  const whatsappVisible = prefersReducedMotion || showWhatsApp;

  useEffect(() => {
    if (window.innerWidth <= 800 || window.location.hash) return;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => {
      cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  const introProgress = usePinnedProgress(intro);
  /**
   * Desktop: o trilho anda de projeto em projeto. O scroll escolhe o card e a
   * mola leva o trilho até a posição exata dele — assim nunca para no meio de
   * dois projetos, e o card ativo fica sempre centralizado.
   */


  /**
   * Abertura: a logo se desenha sozinha e entrega o herói. Não depende de
   * scroll — com movimento reduzido a marca é pulada por completo.
   */
  const [introPhase, setIntroPhase] = useState<"draw" | "exit" | "done">(
    () => "draw"
  );
  const introVisible = introPhase !== "done";

  useEffect(() => {
    if (prefersReducedMotion) { setIntroPhase("done"); return; }
    // A abertura sempre começa do topo, mesmo se o navegador restaurar o scroll.
    if (!window.location.hash) window.scrollTo(0, 0);
    const hold = (LOGO_DRAW_DURATION + .34) * 1000;
    const exit = 620;
    const toExit = setTimeout(() => setIntroPhase("exit"), hold);
    const toDone = setTimeout(() => setIntroPhase("done"), hold + exit);
    // Quem já quiser começar a navegar pula a abertura.
    const skip = () => { setIntroPhase("done"); };
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchmove", skip, { passive: true, once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      clearTimeout(toExit);
      clearTimeout(toDone);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [prefersReducedMotion]);

  // A página fica travada só durante a abertura.
  useEffect(() => {
    if (!introVisible || prefersReducedMotion) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [introVisible, prefersReducedMotion]);

  useEffect(() => {
    if (introPhase === "done") setShowWhatsApp(true);
  }, [introPhase]);


  /**
   * Desktop: o scroll da seção travada (sticky no CSS) vira posição do trilho.
   * `snap` faz assentar centralizado em um projeto — nunca entre dois.
   * Abaixo de 768px nada disso liga: lá o carrossel é scroll-snap nativo.
   */
  useGSAP(() => {
    const section = projectsSection.current;
    const track = projectsTrack.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const last = projects.length - 1;

      const offsetOf = (index: number) => {
        const viewport = projectsViewport.current;
        const card = track.children[index] as HTMLElement | undefined;
        if (!viewport || !card) return 0;
        return card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
      };

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        snap: { snapTo: 1 / last, duration: 0.35, ease: "power2.inOut" },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const index = Math.max(0, Math.min(last, Math.round(self.progress * last)));
          gsap.set(track, { x: -offsetOf(index) });
          if (projectsBar.current) {
            gsap.set(projectsBar.current, { scaleX: 0.16 + 0.84 * (last ? index / last : 1) });
          }
          setActiveProject((current) => (current === index ? current : index));
        },
      });

      return () => st.kill();
    });

    return () => mm.revert();
  }, { dependencies: [] });

  /** Deslocamento que deixa cada card centralizado no viewport. */
  const centeredOffset = (index: number) => {
    const viewport = projectsViewport.current;
    const track = projectsTrack.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!viewport || !card) return 0;
    return card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
  };


  /**
   * Índice do card mais próximo do centro do carrossel.
   * Lido do DOM, não do estado: as setas precisam funcionar em toques
   * seguidos, antes do evento de scroll atualizar o React.
   */
  const nearestProject = () => {
    const viewport = projectsViewport.current;
    const track = projectsTrack.current;
    if (!viewport || !track) return activeProject;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return activeProject;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (distance < bestDistance) { bestDistance = distance; best = index; }
    });
    return best;
  };

  // Celular: o projeto ativo acompanha a posição do carrossel.
  useEffect(() => {
    if (!carrosselNativo) return;
    const viewport = projectsViewport.current;
    if (!viewport) return;
    const onScroll = () => {
      const best = nearestProject();
      setActiveProject((current) => current === best ? current : best);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrosselNativo]);

  useEffect(() => {
    const measure = () => {
      const viewport = projectsViewport.current;
      const track = projectsTrack.current;
      if (!viewport || !track) return;
      const limit = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setProjectDragLimit(limit);
      // Quem recentraliza no desktop agora e o ScrollTrigger (invalidateOnRefresh).
      if (!carrosselNativo) ScrollTrigger.refresh();
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (projectsViewport.current) observer.observe(projectsViewport.current);
    if (projectsTrack.current) observer.observe(projectsTrack.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrosselNativo, activeProject]);

  const goToProject = (index: number) => {
    // Celular: centraliza o card no carrossel — o scroll-snap trava nele.
    if (carrosselNativo) {
      const viewport = projectsViewport.current;
      const track = projectsTrack.current;
      const card = track?.children[index] as HTMLElement | undefined;
      if (!viewport || !card) return;
      viewport.scrollTo({
        left: card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      return;
    }
    const section = projectsSection.current;
    if (!section) return;
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const target = Math.max(0, Math.min(1, index / Math.max(1, projects.length - 1)));
    window.scrollTo({ top: section.offsetTop + target * distance, behavior: "smooth" });
  };

  const moveProjects = (direction: -1 | 1) => {
    const from = carrosselNativo ? nearestProject() : activeProject;
    goToProject(Math.max(0, Math.min(projects.length - 1, from + direction)));
  };

  return <main className={styles.site}>
    <StickyHeader />
    <Cursor />
    <section ref={intro} className={styles.intro} id="inicio">
      <div className={styles.introSticky}>
        <AnimatePresence>
          {introVisible && (
            <motion.div
              className={styles.introMark}
              key="intro-mark"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .94, transition: { duration: .55, ease: [.22, 1, .36, 1] } }}
            >
              <VVCLogo animated />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={styles.hero}
          ref={heroRef}
          initial={false}
          animate={{
            opacity: introPhase === "draw" ? 0 : 1,
            y: introPhase === "draw" ? 34 : 0,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : .7, ease: [.22, 1, .36, 1] }}
        >
          <header className={styles.header}>
            <a className={styles.brand} href="#inicio" aria-label="Viveci — início"><VVCLogo/><i/><b>VIVECI</b></a>
            <nav aria-label="Navegação principal"><a href="#inicio">Início</a><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a className={styles.headerCta} href="#contato" aria-label="Iniciar projeto"><span>Iniciar projeto</span><b>→</b></a></nav>
          </header>
          <div className={styles.heroPhoto} data-camada="foto">
            <Image src="/images/vvc-android-hero.png" fill preload quality={100} sizes="100vw" alt="Android de acabamento preto e azul representando a tecnologia da Viveci" />
          </div>
          <div className={styles.heroShade} data-camada="fundo"/>
          <div className={styles.heroCopy}>
            <TextReveal as="h1" modo="chars" start="top 95%" delay={0.25} data-camada="titulo">VIVECI</TextReveal>
            <p className={styles.heroSub} data-camada="texto"><TextReveal as="strong" start="top 95%" delay={0.15}>Sua visão. Nossa tecnologia.</TextReveal><span>Sites que elevam a sua marca.</span></p>
            <div className={styles.heroActions} data-camada="texto"><a ref={ctaHero} className={styles.primaryButton} href="#contato">Ver meu modelo <span>→</span></a><a className={styles.secondaryButton} href="#projetos"><i>◇</i><span>Explorar projetos</span></a></div>
          </div>
          <p className={styles.heroDisciplines} data-camada="frente">ESTRATÉGIA <i>/</i> DESIGN <i>/</i> TECNOLOGIA</p>
          <a className={styles.heroMouse} href="#servicos" aria-label="Ir para os serviços"><i/></a>
        </motion.div>
      </div>
    </section>

    <section className={styles.services} id="servicos">
      <div className={styles.servicesIntro}><span>Nossos serviços</span><TextReveal as="h2">O que a Viveci faz.</TextReveal><p>Quatro frentes. Uma presença digital completa.</p></div>
      <div className={styles.serviceGrid}>{serviceObjectives.map((objective, index)=>(
        <ServiceCard
          key={objective.title}
          index={index}
          icone={<ServiceIcon type={objective.icon}/>}
          titulo={objective.title}
          texto={objective.purpose}
        />
      ))}</div>
      <div className={styles.servicesFooter}><p>Da ideia à evolução do seu negócio.</p><a href="#contato">Vamos conversar</a></div>
    </section>

    <section ref={projectsSection} className={styles.projects} id="projetos">
      <div className={styles.projectsSticky}>
        <div className={styles.projectsHead}>
          <span>Projetos</span><TextReveal as="h2">Experiências feitas para impressionar.</TextReveal><p>Explore o que podemos criar para o seu negócio.</p>
        </div>
        <div ref={projectsViewport} className={styles.projectsViewport} role="region" aria-label={carrosselNativo ? "Galeria de projetos — arraste para o lado" : "Galeria horizontal de projetos controlada pelo scroll"}>
          <div ref={projectsTrack} className={styles.projectsTrack}>
            {projects.map((project, index) => <motion.article
              className={styles.projectCard}
              data-cursor="Ver"
              data-active={activeProject === index}
              key={project.area}
              initial={false}
              animate={carrosselNativo ? { scale: 1, opacity: 1, y: 0, rotateY: 0 } : {
                scale: activeProject === index ? 1 : .77,
                opacity: activeProject === index ? 1 : .48,
                y: activeProject === index ? 0 : 25,
                rotateY: activeProject === index ? 0 : index < activeProject ? 8 : -8,
              }}
              transition={{ duration: .34, ease: [.22, 1, .36, 1] }}
            >
              <div className={styles.projectShell}>
                <div className={styles.projectImage}>
                  <DistortionImage
                    src={project.image}
                    alt={`Página inicial do projeto ${project.area}`}
                    sizes="(max-width: 800px) 84vw, (max-width: 1600px) 72vw, 1120px"
                    objectPosition={project.position}
                  />
                </div>
              </div>
            </motion.article>)}
          </div>
        </div>
        <motion.div className={styles.projectMeta} key={projects[activeProject].area} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .26, ease: [.22, 1, .36, 1] }}>
          <span>PROJETO SELECIONADO / {String(activeProject + 1).padStart(2, "0")}</span>
          <h3>{projects[activeProject].area}</h3>
          <p>{"kind" in projects[activeProject] ? (projects[activeProject] as { kind: string }).kind : "Site institucional · Experiência responsiva"}</p>
          <a href="#contato">Explorar conceito <i>↗</i></a>
        </motion.div>
        <div className={styles.projectsControls}>
          <button type="button" onClick={() => moveProjects(-1)} aria-label="Projeto anterior">←</button>
          <div className={styles.projectsProgress}><i ref={projectsBar} />{projects.map((project,index)=><button type="button" className={activeProject === index ? styles.activeProjectDot : ""} onClick={() => goToProject(index)} aria-label={`Ver projeto ${project.area}`} key={project.area}/>)}</div>
          <button type="button" onClick={() => moveProjects(1)} aria-label="Próximo projeto">→</button>
        </div>
        <p className={styles.projectsClosing}>Seu negócio, em uma nova perspectiva.</p>
      </div>
    </section>

    <section className={styles.processSection} id="processo">
      <div className={styles.processHeading}>
        <span>Como funciona</span>
        <TextReveal as="h2">Um processo claro. Sem surpresas.</TextReveal>
        <p>Você acompanha cada etapa, do primeiro contato ao site publicado.</p>
      </div>

      {/*
        Fluxo em ziguezague: cada etapa entra quando alcança a tela e um raio
        diagonal desenha o caminho até a próxima, alternando os lados.
      */}
      <ProcessFlow semMovimento={prefersReducedMotion} />

      <p className={styles.processClosing}>Veja primeiro. Decida depois.</p>
      <a className={styles.processCta} href="#contato">Quero ver meu modelo <b>↗</b></a>
    </section>

    <section className={styles.technology} id="tecnologia">
      <div className={styles.technologyHeading}>
        <div><span>Tecnologia</span><TextReveal as="h2">Uma base sólida. Infinitas possibilidades.</TextReveal></div>
        <p>Cada produto combina interface, lógica e dados em uma experiência integrada.</p>
      </div>
      <span className={styles.stackLabel}>Stack ilustrativa · a validar</span>
      <div className={styles.technologyStack}>
        {technologyLayers.map((layer, index) => <Reveal as="article" index={index} className={styles.technologyLayer} key={layer.title}>
          <b className={styles.layerNumber}>{String(index + 1).padStart(2, "0")}</b>
          <div className={styles.layerCopy}><h3>{layer.title}</h3><i/><p>{layer.description}</p></div>
          <Stagger className={styles.technologyItems} intervalo={0.05} deslocamento={12}>{layer.technologies.map((technology) => <div className={styles.technologyItem} key={technology}><TechIcon name={technology}/><span>{technology}</span></div>)}</Stagger>
        </Reveal>)}
      </div>
      <div className={styles.technologyDeploy}>
        <span>Versionamento e publicação</span>
        <div><i><TechIcon name="GitHub"/></i><b>GitHub</b><em/><i><TechIcon name="Vercel"/></i><b>Vercel</b></div>
        <a href="#contato">Vamos criar seu produto <b>↗</b></a>
      </div>
    </section>

    <section className={styles.faqSection} id="duvidas">
      <div className={styles.faqHeading}><span>Perguntas frequentes</span><TextReveal as="h2">Tudo claro para começar.</TextReveal><p>As respostas que você precisa, sem complicação.</p></div>
      <div className={styles.faqList}>
        {frequentlyAskedQuestions.map(([question, answer], index) => {
          const isOpen = activeFaq === index;
          return <Reveal as="article" index={index} className={isOpen ? styles.faqOpen : ""} key={question}>
            <button type="button" aria-expanded={isOpen} onClick={() => setActiveFaq(isOpen ? null : index)}>
              <strong>{question}</strong><i aria-hidden>{isOpen ? "−" : "+"}</i>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && <motion.div className={styles.faqAnswer} initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0 : .38, ease: [.22, 1, .36, 1] }}><p>{answer}</p></motion.div>}
            </AnimatePresence>
          </Reveal>;
        })}
      </div>
      <div className={styles.faqContact}>
        <div><i aria-hidden><svg viewBox="0 0 48 48"><path d="M8 23c0-8.3 7-15 16-15s16 6.7 16 15-7 15-16 15c-2.6 0-5-.6-7.2-1.6L8 40l3.2-8A14.3 14.3 0 0 1 8 23Z"/></svg></i><span>Sua dúvida não está aqui?</span></div>
        <a href="#contato">Converse com a Viveci <b>↗</b></a>
      </div>
    </section>

    <section className={styles.contact} id="contato">
      <div className={styles.contactIntro}>
        <span>Vamos ver como fica?</span>
        <TextReveal as="h2">Seu próximo site começa com um modelo.</TextReveal>
        <p>Veja uma primeira ideia com a identidade da sua empresa. Depois, você decide.</p>
      </div>
      <div className={styles.contactRobot} aria-hidden>
        <i />
        <Image src="/images/vvc-android-hero.png" fill quality={100} sizes="(max-width: 800px) 90vw, 42vw" alt="" />
      </div>
      <div className={styles.contactPanel}><ContactForm/></div>
      <div className={styles.contactSignature}><span>Sua visão. Nossa tecnologia.</span><i/><b>VIVECI</b></div>
    </section>

    <motion.a
      className={styles.floatingWhatsapp}
      href="/api/whatsapp?source=floating"
      aria-label="Falar com a Viveci pelo WhatsApp"
      aria-hidden={!whatsappVisible}
      tabIndex={whatsappVisible ? 0 : -1}
      initial={false}
      animate={whatsappVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: .94 }}
      transition={{ duration: prefersReducedMotion ? 0 : .45, ease: [.22, 1, .36, 1] }}
      style={{ pointerEvents: whatsappVisible ? "auto" : "none", visibility: whatsappVisible ? "visible" : "hidden" }}
    >
      <svg viewBox="0 0 24 24" aria-hidden><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.4-4.4a8.4 8.4 0 1 1 15.6-4.4Z"/><path d="M8.2 7.4c.2-.4.4-.4.7-.4h.5c.2 0 .3 0 .5.5l.7 1.7c.1.3.1.4 0 .6l-.6.8c-.2.2-.1.4 0 .6.7 1.3 1.7 2.3 3 3 .3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l1.8.8c.3.1.4.3.4.5 0 .3-.2 1.5-1.1 2.1-.7.5-1.6.7-2.6.4-1.2-.3-2.8-1-4.5-2.5-1.3-1.2-2.3-2.6-2.7-3.8-.5-1.4 0-2.5.4-2.9.4-.4.8-.5 1.4-.2Z"/></svg>
      <span>Falar com a Viveci</span>
    </motion.a>

    <footer className={styles.footer}><Stagger className={styles.footerGrid} intervalo={0.07}><div><b>VIVECI</b><span>/ DIGITAL STUDIO</span><p>Sites para negócios que atendem gente todo dia.</p></div><div><span>NAVEGAÇÃO</span><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a href="#duvidas">Dúvidas</a></div><div><span>CONTATO</span><a href="#contato">Falar comigo</a><p>Atendimento direto com quem faz.</p></div><div className={styles.footerLogo}><VVCLogo/></div></Stagger><div className={styles.copyright}><span>© 2026 VIVECI DIGITAL STUDIO</span><a href="#inicio">VOLTAR AO TOPO ↑</a></div></footer>
  </main>;
}
