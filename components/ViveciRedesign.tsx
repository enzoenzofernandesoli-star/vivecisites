"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";
import { ContactForm } from "./ContactForm";
import { VVCLogo } from "./VVCLogo";
import styles from "./viveci.module.css";

const process = [
  {
    title: "Conversa",
    summary: "Entendemos seu negócio.",
    headline: <>Primeiro,<br/>a gente conversa.</>,
    description: "Você me conta sobre o negócio, o público e o que precisa funcionar melhor.",
    tags: ["Seu negócio", "Seu público", "Seu objetivo"],
    image: "/images/projects/prospector.png",
  },
  {
    title: "Modelo",
    summary: "Criamos a primeira versão.",
    headline: <>Primeiro,<br/>você vê.</>,
    description: "Criamos um modelo com a identidade da sua empresa para você explorar antes de decidir.",
    tags: ["Sua marca", "Seu conteúdo", "Sua experiência"],
    image: "/images/projects/pousada-da-nivea.png",
  },
  {
    title: "Você avalia",
    summary: "Você explora e dá feedback.",
    headline: <>Você explora.<br/>Eu ajusto.</>,
    description: "Você navega pelo modelo no computador e no celular e aponta o que deseja ajustar.",
    tags: ["Navegação", "Conteúdo", "Ajustes"],
    image: "/images/projects/barbearia-buenos-aires.png",
  },
  {
    title: "Valor",
    summary: "Apresentamos o valor fechado.",
    headline: <>Tudo claro.<br/>Valor fechado.</>,
    description: "Com o projeto definido e aprovado, você recebe uma proposta objetiva, sem surpresas.",
    tags: ["Escopo", "Prazo", "Investimento"],
    image: "/images/projects/arsenal-de-prompts.png",
  },
  {
    title: "Publicação",
    summary: "Ajustamos e colocamos no ar.",
    headline: <>Seu site,<br/>no ar.</>,
    description: "Faço os ajustes finais, conecto o domínio e publico tudo com segurança.",
    tags: ["Domínio", "SEO", "Publicação"],
    image: "/images/projects/maria-flor.png",
  },
] as const;

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

export function ViveciRedesign() {
  const intro = useRef<HTMLElement>(null);
  const projectsSection = useRef<HTMLElement>(null);
  const projectsViewport = useRef<HTMLDivElement>(null);
  const projectsTrack = useRef<HTMLDivElement>(null);
  const [projectDragLimit, setProjectDragLimit] = useState(0);
  const [activeProject, setActiveProject] = useState(0);
  const [activeProcess, setActiveProcess] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(2);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
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
  const projectsScrollProgress = usePinnedProgress(projectsSection);
  const logoDraw = useTransform(introProgress, [.012, .5], [0, 1]);
  const introMarkOpacity = useTransform(introProgress, [0, .01, .03, .58, .76], [0, 0, 1, 1, 0]);
  const introHintOpacity = useTransform(introProgress, [0, .006, .03], [1, .96, 0]);
  const introHintY = useTransform(introProgress, [0, .03], [0, 18]);
  const introMarkScale = useTransform(introProgress, [.45, .78], [1, .2]);
  const introMarkY = useTransform(introProgress, [.45, .78], [0, -330]);
  const heroOpacity = useTransform(introProgress, [.5, .75], [0, 1]);
  const heroY = useTransform(introProgress, [.5, .78], [60, 0]);
  const imageY = useTransform(introProgress, [.5, 1], [58, -46]);
  const smoothImageY = useSpring(imageY, { stiffness: 76, damping: 24 });
  const projectX = useTransform(projectsScrollProgress, [0, 1], [0, -projectDragLimit]);
  const projectProgress = useTransform(projectsScrollProgress, [0, 1], [.16, 1]);

  useMotionValueEvent(introProgress, "change", (latest) => {
    const shouldShow = latest >= .82;
    setShowWhatsApp((current) => current === shouldShow ? current : shouldShow);
  });

  useMotionValueEvent(projectsScrollProgress, "change", (latest) => {
    const nextProject = Math.round(latest * (projects.length - 1));
    setActiveProject((current) => current === nextProject ? current : nextProject);
  });

  useEffect(() => {
    const measure = () => {
      const viewport = projectsViewport.current;
      const track = projectsTrack.current;
      if (!viewport || !track) return;
      const limit = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setProjectDragLimit(limit);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (projectsViewport.current) observer.observe(projectsViewport.current);
    if (projectsTrack.current) observer.observe(projectsTrack.current);
    return () => observer.disconnect();
  }, []);

  const goToProject = (index: number) => {
    const section = projectsSection.current;
    if (!section) return;
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const target = Math.max(0, Math.min(1, index / Math.max(1, projects.length - 1)));
    window.scrollTo({ top: section.offsetTop + target * distance, behavior: "smooth" });
  };

  const moveProjects = (direction: -1 | 1) => goToProject(Math.max(0, Math.min(projects.length - 1, activeProject + direction)));

  return <main className={styles.site}>
    <section ref={intro} className={styles.intro} id="inicio">
      <div className={styles.introSticky}>
        <motion.div className={styles.introMark} style={{ opacity: introMarkOpacity, scale: introMarkScale, y: introMarkY }}>
          <VVCLogo progress={logoDraw} />
          <motion.span style={{ opacity: logoDraw }}>VIVECI / DIGITAL STUDIO</motion.span>
        </motion.div>
        <motion.div className={styles.introScrollHint} style={{ opacity: introHintOpacity, y: introHintY }} aria-hidden>
          <span>ARRASTE PARA BAIXO</span>
          <i><b/></i>
        </motion.div>

        <motion.div className={styles.hero} style={{ opacity: heroOpacity, y: heroY }}>
          <header className={styles.header}>
            <a className={styles.brand} href="#inicio" aria-label="Viveci — início"><VVCLogo/><i/><b>VIVECI</b></a>
            <nav aria-label="Navegação principal"><a href="#inicio">Início</a><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a className={styles.headerCta} href="#contato" aria-label="Iniciar projeto"><span>Iniciar projeto</span><b>→</b></a></nav>
          </header>
          <motion.div className={styles.heroPhoto} style={{ y: smoothImageY }}>
            <Image src="/images/vvc-android-hero.png" fill preload quality={100} sizes="100vw" alt="Android de acabamento preto e azul representando a tecnologia da Viveci" />
          </motion.div>
          <div className={styles.heroShade}/>
          <div className={styles.heroCopy}>
            <h1>VIVECI</h1>
            <p className={styles.heroSub}><strong>Sua visão. Nossa tecnologia.</strong><span>Sites que elevam a sua marca.</span></p>
            <div className={styles.heroActions}><a className={styles.primaryButton} href="#contato">Ver meu modelo <span>→</span></a><a className={styles.secondaryButton} href="#projetos"><i>◇</i><span>Explorar projetos</span></a></div>
          </div>
          <p className={styles.heroDisciplines}>ESTRATÉGIA <i>/</i> DESIGN <i>/</i> TECNOLOGIA</p>
          <a className={styles.heroMouse} href="#servicos" aria-label="Ir para os serviços"><i/></a>
        </motion.div>
      </div>
    </section>

    <section className={styles.services} id="servicos">
      <div className={styles.servicesIntro}><span>Nossos serviços</span><h2>O que a Viveci faz.</h2><p>Quatro frentes. Uma presença digital completa.</p></div>
      <div className={styles.serviceGrid}>{serviceObjectives.map((objective)=><article className={styles.serviceObjective} key={objective.title}>
        <div className={styles.serviceIcon}><ServiceIcon type={objective.icon}/></div>
        <h3>{objective.title}</h3>
        <p className={styles.servicePurpose}>{objective.purpose}</p>
        <a className={styles.serviceLink} href="#contato">Saiba mais <span>↗</span></a>
      </article>)}</div>
      <div className={styles.servicesFooter}><p>Da ideia à evolução do seu negócio.</p><a href="#contato">Vamos conversar</a></div>
    </section>

    <section ref={projectsSection} className={styles.projects} id="projetos">
      <div className={styles.projectsSticky}>
        <div className={styles.projectsHead}>
          <span>Projetos</span><h2>Experiências feitas para impressionar.</h2><p>Explore o que podemos criar para o seu negócio.</p>
        </div>
        <div ref={projectsViewport} className={styles.projectsViewport} role="region" aria-label="Galeria horizontal de projetos controlada pelo scroll">
          <motion.div ref={projectsTrack} className={styles.projectsTrack} style={{ x: projectX }}>
            {projects.map((project, index) => <motion.article
              className={styles.projectCard}
              data-active={activeProject === index}
              key={project.area}
              initial={false}
              animate={{
                scale: activeProject === index ? 1 : .77,
                opacity: activeProject === index ? 1 : .48,
                y: activeProject === index ? 0 : 25,
                rotateY: activeProject === index ? 0 : index < activeProject ? 8 : -8,
              }}
              transition={{ duration: .58, ease: [.22, 1, .36, 1] }}
            >
              <div className={styles.projectShell}>
                <motion.div className={styles.projectImage} animate={{ scale: activeProject === index ? 1.015 : 1 }} transition={{ duration: .7, ease: [.22, 1, .36, 1] }}>
                  <Image src={project.image} fill quality={100} sizes="(max-width: 800px) 88vw, (max-width: 1600px) 72vw, 1120px" alt={`Página inicial do projeto ${project.area}`} style={{ objectPosition: project.position }} draggable={false}/>
                </motion.div>
              </div>
            </motion.article>)}
          </motion.div>
        </div>
        <motion.div className={styles.projectMeta} key={projects[activeProject].area} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .38, ease: [.22, 1, .36, 1] }}>
          <span>PROJETO SELECIONADO / {String(activeProject + 1).padStart(2, "0")}</span>
          <h3>{projects[activeProject].area}</h3>
          <p>Site institucional · Experiência responsiva</p>
          <a href="#contato">Explorar conceito <i>↗</i></a>
        </motion.div>
        <div className={styles.projectsControls}>
          <button type="button" onClick={() => moveProjects(-1)} aria-label="Projeto anterior">←</button>
          <div className={styles.projectsProgress}><motion.i style={{ scaleX: projectProgress }}/>{projects.map((project,index)=><button type="button" className={activeProject === index ? styles.activeProjectDot : ""} onClick={() => goToProject(index)} aria-label={`Ver projeto ${project.area}`} key={project.area}/>)}</div>
          <button type="button" onClick={() => moveProjects(1)} aria-label="Próximo projeto">→</button>
        </div>
        <p className={styles.projectsClosing}>Seu negócio, em uma nova perspectiva.</p>
      </div>
    </section>

    <section className={styles.processSection} id="processo">
      <div className={styles.processHeading}>
        <span>Do primeiro contato à publicação</span>
        <h2>Seu site, passo a passo.</h2>
        <p>Clareza em cada etapa. Você participa de todas elas.</p>
      </div>

      <div className={styles.processStage} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className={styles.processStageInner}
            key={activeProcess}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0 : .42, ease: [.22, 1, .36, 1] }}
          >
            <div className={styles.processCopy}>
              <span>ETAPA <b>{String(activeProcess + 1).padStart(2, "0")}</b> / 05</span>
              <h3>{process[activeProcess].headline}</h3>
              <p>{process[activeProcess].description}</p>
              <div className={styles.processTags}>{process[activeProcess].tags.map((tag) => <i key={tag}>{tag}</i>)}</div>
              <a href="#contato">Quero ver meu modelo <b>↗</b></a>
            </div>

            <div className={styles.processPreview}>
              <motion.div className={styles.processDesktop} initial={prefersReducedMotion ? false : { scale: .975 }} animate={{ scale: 1 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>
                <Image src={process[activeProcess].image} fill quality={100} sizes="(max-width: 800px) 86vw, 54vw" alt={`Visual da etapa ${process[activeProcess].title}`} />
              </motion.div>
              <motion.div className={styles.processPhone} initial={prefersReducedMotion ? false : { x: 18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .55, delay: .08, ease: [.22, 1, .36, 1] }}>
                <i aria-hidden />
                <Image src={process[activeProcess].image} fill quality={100} sizes="(max-width: 800px) 24vw, 13vw" alt="" />
              </motion.div>
              <small>MODELO ILUSTRATIVO</small>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.processSteps} role="tablist" aria-label="Etapas do processo de criação">
        {process.map((step, index) => <button
          type="button"
          role="tab"
          aria-selected={activeProcess === index}
          className={activeProcess === index ? styles.processStepActive : ""}
          onClick={() => setActiveProcess(index)}
          key={step.title}
        >
          <b>{String(index + 1).padStart(2, "0")}</b>
          <strong>{step.title}</strong>
          <span>{step.summary}</span>
        </button>)}
      </div>
      <p className={styles.processClosing}>Veja primeiro. Decida depois.</p>
    </section>

    <section className={styles.technology} id="tecnologia">
      <div className={styles.technologyHeading}>
        <div><span>Tecnologia</span><h2>Uma base sólida.<br/>Infinitas possibilidades.</h2></div>
        <p>Cada produto combina interface, lógica e dados em uma experiência integrada.</p>
      </div>
      <span className={styles.stackLabel}>Stack ilustrativa · a validar</span>
      <div className={styles.technologyStack}>
        {technologyLayers.map((layer, index) => <article className={styles.technologyLayer} key={layer.title}>
          <b className={styles.layerNumber}>{String(index + 1).padStart(2, "0")}</b>
          <div className={styles.layerCopy}><h3>{layer.title}</h3><i/><p>{layer.description}</p></div>
          <div className={styles.technologyItems}>{layer.technologies.map((technology) => <div className={styles.technologyItem} key={technology}><TechIcon name={technology}/><span>{technology}</span></div>)}</div>
        </article>)}
      </div>
      <div className={styles.technologyDeploy}>
        <span>Versionamento e publicação</span>
        <div><i><TechIcon name="GitHub"/></i><b>GitHub</b><em/><i><TechIcon name="Vercel"/></i><b>Vercel</b></div>
        <a href="#contato">Vamos criar seu produto <b>↗</b></a>
      </div>
    </section>

    <section className={styles.faqSection} id="duvidas">
      <div className={styles.faqHeading}><span>Perguntas frequentes</span><h2>Tudo claro para começar.</h2><p>As respostas que você precisa, sem complicação.</p></div>
      <div className={styles.faqList}>
        {frequentlyAskedQuestions.map(([question, answer], index) => {
          const isOpen = activeFaq === index;
          return <article className={isOpen ? styles.faqOpen : ""} key={question}>
            <button type="button" aria-expanded={isOpen} onClick={() => setActiveFaq(isOpen ? null : index)}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><i aria-hidden>{isOpen ? "−" : "+"}</i>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && <motion.div className={styles.faqAnswer} initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0 : .38, ease: [.22, 1, .36, 1] }}><p>{answer}</p></motion.div>}
            </AnimatePresence>
          </article>;
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
        <h2>Seu próximo site <br/>começa com <br/>um modelo.</h2>
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

    <footer className={styles.footer}><div className={styles.footerGrid}><div><b>VIVECI</b><span>/ DIGITAL STUDIO</span><p>Sites para negócios que atendem gente todo dia.</p></div><div><span>NAVEGAÇÃO</span><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a href="#duvidas">Dúvidas</a></div><div><span>CONTATO</span><a href="#contato">Falar comigo</a><p>Atendimento direto com quem faz.</p></div><div className={styles.footerLogo}><VVCLogo/></div></div><div className={styles.copyright}><span>© 2026 VIVECI DIGITAL STUDIO</span><a href="#inicio">VOLTAR AO TOPO ↑</a></div></footer>
  </main>;
}
