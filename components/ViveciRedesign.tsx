"use client";

import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";
import { ContactForm } from "./ContactForm";
import { VVCLogo } from "./VVCLogo";
import styles from "./viveci.module.css";

const process = [
  ["Conversa", "Você me conta sobre o negócio, o público e o que hoje dá trabalho."],
  ["Modelo", "Eu organizo as informações e construo uma primeira versão com a sua identidade."],
  ["Você avalia", "Você recebe o link, navega pelo celular e decide com o site na sua frente."],
  ["Valor", "Com tudo o que o projeto precisa já definido, eu apresento um valor fechado."],
  ["Publicação", "Faço os ajustes finais, conecto o domínio e deixo seu negócio pronto para ser encontrado."],
] as const;

const serviceObjectives = [
  {
    title: "Presença",
    purpose: "Para que sua empresa seja encontrada, transmita confiança e apresente seus serviços com clareza profissional.",
    services: ["Site institucional", "Presença no Google", "Integração com WhatsApp"],
    glyph: "P",
  },
  {
    title: "Captação",
    purpose: "Para transformar visitantes em oportunidades reais e tornar o próximo contato simples, direto e mensurável.",
    services: ["Landing pages", "Formulários de contato", "WhatsApp", "Estrutura de conversão", "Analytics e mensuração"],
    glyph: "C",
  },
  {
    title: "Operação",
    purpose: "Para o site também executar funções do negócio e reduzir tarefas que hoje dependem de atendimento manual.",
    services: ["Agendamento online", "Cardápio digital", "Catálogo de produtos", "Reservas", "Automações e integrações"],
    glyph: "O",
  },
] as const;

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
  const introMarkOpacity = useTransform(introProgress, [0, .01, .03], [0, 0, 1]);
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

  const moveProjects = (direction: -1 | 1) => {
    const section = projectsSection.current;
    if (!section) return;
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const step = 1 / Math.max(1, projects.length - 1);
    const target = Math.max(0, Math.min(1, projectsScrollProgress.get() + direction * step));
    window.scrollTo({ top: section.offsetTop + target * distance, behavior: "smooth" });
  };

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
            <a className={styles.brand} href="#inicio"><b>VIVECI</b><span>/ DIGITAL STUDIO</span></a>
            <nav aria-label="Navegação principal"><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a href="#sobre">Sobre</a><a className={styles.headerCta} href="#contato">Quero meu modelo ↗</a></nav>
          </header>
          <motion.div className={styles.heroPhoto} style={{ y: smoothImageY }}>
            <Image src="/images/vvc-midnight-hero-extracted.png" fill preload quality={100} sizes="100vw" alt="Escultura clássica diante de uma arquitetura monumental em tons de azul-marinho" />
          </motion.div>
          <div className={styles.heroShade}/>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>VVC / SITES PARA NEGÓCIOS LOCAIS</p>
            <h1>Vim, vi e fiz<br/>o seu <em>site.</em></h1>
            <p className={styles.heroSub}><strong>Sites feitos para transformar visitas em clientes.</strong><span>Criamos a presença digital do seu negócio para que ele transmita confiança, apareça no Google e facilite a chegada de novos clientes.</span></p>
            <a className={styles.primaryButton} href="#contato">Quero ver meu modelo <span>→</span></a>
          </div>
          <div className={styles.heroPromise}>
            <span>O MODELO VEM PRIMEIRO</span>
            <strong>Você vê antes de decidir.</strong>
            <p>Eu preparo a primeira versão com a identidade do seu negócio. Você abre, navega e avalia sem custo e sem compromisso.</p>
          </div>
          <div className={styles.heroMonogram} aria-hidden>VVC</div>
          <div className={styles.heroSide}><i/><span>Estratégia</span><span>Design</span><span>Tecnologia</span><span>Resultado</span></div>
        </motion.div>
      </div>
    </section>

    <section className={styles.guarantees} aria-label="Diferenciais">
      {[["⌂", "Clareza e presença", "Informação organizada para o cliente confiar desde o primeiro segundo."],["◇", "Feito para negócios", "Eu entendo sua operação antes de escolher como o site deve funcionar."],["▦", "Design editorial", "Hierarquia forte, leitura simples e uma identidade que não parece pronta."],["◷", "Velocidade e performance", "Uma experiência rápida no celular e preparada para ser encontrada."]].map(([icon,title,text])=><article key={title}><span>{icon}</span><h2>{title}</h2><p>{text}</p></article>)}
    </section>

    <section className={styles.services} id="servicos">
      <div className={styles.sectionIntro}><span>Objetivos</span><h2>Um site pensado para o resultado que o seu negócio precisa.</h2><p>A tecnologia muda de acordo com o objetivo. O site continua sendo o centro de tudo.</p><a href="#contato">Quero ver meu modelo →</a></div>
      <div className={styles.serviceGrid}>{serviceObjectives.map((objective)=><article className={styles.serviceObjective} key={objective.title}>
        <div className={styles.serviceHeading}><div className={styles.serviceGlyph} aria-hidden>{objective.glyph}</div><h3>{objective.title}</h3></div>
        <p className={styles.servicePurpose}>{objective.purpose}</p>
        <ul aria-label={`Soluções para ${objective.title}`}>{objective.services.map((service)=><li key={service}>{service}</li>)}</ul>
      </article>)}</div>
    </section>

    <section ref={projectsSection} className={styles.projects} id="projetos">
      <div className={styles.projectsSticky}>
        <div className={styles.projectsHead}>
          <div><span>Projetos selecionados</span><h2>Trabalhos feitos para serem <em>percorridos.</em></h2></div>
          <div className={styles.projectsGuide}><p>Role para conhecer diferentes direções de projeto — da presença institucional ao catálogo digital.</p><span>ROLE PARA EXPLORAR <i>↓</i></span></div>
        </div>
        <div ref={projectsViewport} className={styles.projectsViewport} role="region" aria-label="Galeria horizontal de projetos controlada pelo scroll">
          <motion.div ref={projectsTrack} className={styles.projectsTrack} style={{ x: projectX }}>
            {projects.map((project) => <motion.article className={styles.projectCard} key={project.area} whileHover="hover" initial="rest" variants={{ rest: { y: 0 }, hover: { y: -7 } }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>
              <div className={styles.projectShell}>
                <div className={styles.projectChrome} aria-hidden>
                  <span><i/><i/><i/></span><b/><em/>
                </div>
                <motion.div className={styles.projectImage} variants={{ rest: { scale: 1 }, hover: { scale: 1.025 } }} transition={{ duration: .85, ease: [.22, 1, .36, 1] }}>
                  <Image src={project.image} fill quality={100} sizes="(max-width: 800px) 88vw, (max-width: 1600px) 72vw, 1120px" alt={`Página inicial do projeto ${project.area}`} style={{ objectPosition: project.position }} draggable={false}/>
                </motion.div>
              </div>
            </motion.article>)}
          </motion.div>
        </div>
        <div className={styles.projectsControls}>
          <div className={styles.projectsProgress}><motion.i style={{ scaleX: projectProgress }}/></div>
          <div><button type="button" onClick={() => moveProjects(-1)} aria-label="Projeto anterior">←</button><button type="button" onClick={() => moveProjects(1)} aria-label="Próximo projeto">→</button></div>
        </div>
      </div>
    </section>

    <section className={styles.processSection} id="processo">
      <div className={styles.processTop}><span>Processo</span><strong>Um processo claro.<br/>Sem surpresas.</strong><small>Do primeiro contato ao site publicado.</small></div>
      <div className={styles.processTrack}>
        {process.map(([title,text],i)=><article key={title}><div className={styles.processLine}/><h2>{title}</h2><p>{text}</p><div className={styles.processGlyph} aria-hidden>{i === 0 ? "○" : i === 1 ? "◇" : i === 2 ? "V" : i === 3 ? "⌘" : "↗"}</div></article>)}
      </div>
    </section>

    <section className={styles.tech}>
      <div className={styles.techCopy}><span>Tecnologia</span><h2>Design que funciona.<br/>Tecnologia que sustenta tudo.</h2><p>Cada tela é construída para carregar rapidamente, orientar o visitante e funcionar em situações reais: no celular, na rua ou quando não há tempo para adivinhar.</p><ul><li>Celular primeiro</li><li>Performance e velocidade</li><li>SEO local</li><li>Acessibilidade</li><li>Movimento com propósito</li></ul><a href="#contato">Ver isso no meu negócio →</a></div>
      <div className={styles.deviceStage}>
        <div className={styles.desktopMock}><div className={styles.mockBar}><i/><i/><i/><span>modelo.viveci.studio</span></div><div className={styles.mockPage}><div><small>MODELO DEMONSTRATIVO</small><h3>MADEIRA COM<br/>DESIGN. ESPAÇOS<br/>COM PROPÓSITO.</h3><button>CONHEÇA O PROJETO</button></div><Image src="/images/vvc-architecture-hq.png" fill quality={100} sizes="(max-width: 800px) 94vw, 47vw" alt="Interior contemporâneo usado em um modelo demonstrativo" /></div></div>
        <div className={styles.phoneMock}><div className={styles.phoneNotch}/><small>VIVECI</small><h3>MADEIRA<br/>COM DESIGN.</h3><Image src="/images/vvc-architecture-hq.png" fill quality={100} sizes="(max-width: 800px) 27vw, 14vw" alt="Detalhe do modelo demonstrativo no celular" /></div>
      </div>
    </section>

    <section className={styles.offer}>
      <div><span>O modelo vem primeiro</span><h2>Eu monto.<br/>Você avalia.<br/><em>Depois decide.</em></h2></div>
      <div><p>Nenhum negócio deveria pagar por um site que ainda não viu. Eu preparo uma versão com a sua marca e as suas informações para você navegar antes de conversarmos sobre valor.</p><a className={styles.darkButton} href="#contato">Quero ver meu modelo →</a></div>
    </section>

    <section className={styles.story} id="sobre">
      <div className={styles.storyImage}><Image src="/images/viveci-monumental-hq.png" fill quality={100} sizes="(max-width: 800px) 100vw, 48vw" alt="Detalhe da arquitetura monumental que inspira a identidade da Viveci" /></div>
      <div className={styles.storyCopy}><span>A origem</span><h2 className={styles.originWords}><span>Veni</span><span>Vidi</span><em>Vici</em></h2><p>A Viveci nasce desses três verbos. Não como uma promessa de conquista, mas como método: primeiro eu chego ao seu negócio, depois entendo como ele funciona e só então construo.</p><p>Meu nome é Enzo. Na Viveci, você fala diretamente com quem desenha e escreve o código. O site é feito para o seu negócio e pertence a você.</p><a href="#contato">Falar comigo →</a></div>
    </section>

    <section className={styles.faq} id="duvidas"><div><span>Dúvidas</span><h2>Antes de você perguntar.</h2></div><div>{[["O modelo é grátis mesmo?","Sim. Você não paga para ver, não assina nada e pode recusar sem compromisso."],["Eu já tenho Instagram. Preciso de site?","O Instagram ajuda a manter contato com quem já conhece o seu negócio. O site também permite que sua empresa seja encontrada por quem procura seu serviço no Google."],["Quanto custa?","O valor depende do que o site precisa ter. Eu só defino o valor depois que você vê o modelo e aprova o escopo."],["Quem fica com o site e o domínio?","O domínio e o conteúdo pertencem ao seu negócio. O site é seu."]].map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>

    <section className={styles.contact} id="contato"><div className={styles.contactTitle}><span>Vamos ver como fica?</span><h2>Seu próximo site começa com um modelo.</h2><p>São só quatro informações. O restante da conversa acontece diretamente pelo WhatsApp.</p></div><ContactForm/></section>

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

    <footer className={styles.footer}><div className={styles.footerArch}><Image src="/images/viveci-monumental-hq.png" fill quality={100} sizes="(max-width: 800px) 60vw, 35vw" alt="" /></div><div className={styles.footerCta}><h2>Vamos construir<br/>o seu próximo site?</h2><a href="#contato">Quero ver meu modelo →</a></div><div className={styles.footerGrid}><div><b>VIVECI</b><span>/ DIGITAL STUDIO</span><p>Sites para negócios que atendem gente todo dia.</p></div><div><span>NAVEGAÇÃO</span><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a href="#sobre">Sobre</a><a href="#duvidas">Dúvidas</a></div><div><span>CONTATO</span><a href="#contato">Falar comigo</a><p>Atendimento direto com quem faz.</p></div><div className={styles.footerLogo}><VVCLogo/></div></div><div className={styles.copyright}><span>© 2026 VIVECI DIGITAL STUDIO</span><a href="#inicio">VOLTAR AO TOPO ↑</a></div></footer>
  </main>;
}
