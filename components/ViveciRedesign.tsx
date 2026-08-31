"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";
import { ContactForm } from "./ContactForm";
import { VVCLogo } from "./VVCLogo";
import styles from "./viveci.module.css";

const process = [
  ["Conversa", "Você me conta sobre o negócio, o público e o que hoje dá trabalho."],
  ["Modelo", "Eu organizo as informações e construo uma primeira versão com a sua identidade."],
  ["Você olha", "Recebe o link, navega pelo celular e decide com o site na sua frente."],
  ["Valor", "Com o que precisa estar no projeto definido, eu passo um valor fechado."],
  ["Publicação", "Ajustes finais, domínio conectado e seu negócio pronto para ser encontrado."],
] as const;

const services = [
  ["Site institucional", "Seu negócio apresentado com clareza, confiança e uma ação simples para o cliente."],
  ["Cardápio digital", "Categorias, fotos e preços com o pedido chegando direto no seu WhatsApp."],
  ["Agendamento online", "O cliente escolhe serviço, dia e horário sem esperar uma resposta."],
  ["Catálogo de produtos", "Uma vitrine própria com filtros, informações e pedido direto."],
  ["Landing page", "Uma página objetiva para orçamento, campanha ou captação de contatos."],
  ["Presença no Google", "Estrutura preparada para a busca local entender e encontrar o seu negócio."],
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

export function ViveciRedesign() {
  const intro = useRef<HTMLElement>(null);
  const projectsSection = useRef<HTMLElement>(null);
  const projectsViewport = useRef<HTMLDivElement>(null);
  const projectsTrack = useRef<HTMLDivElement>(null);
  const [projectDragLimit, setProjectDragLimit] = useState(0);
  const introProgress = usePinnedProgress(intro);
  const projectsScrollProgress = usePinnedProgress(projectsSection);
  const logoDraw = useTransform(introProgress, [0, .48], [0, 1]);
  const introHintOpacity = useTransform(introProgress, [0, .025, .085], [1, .95, 0]);
  const introHintY = useTransform(introProgress, [0, .085], [0, 16]);
  const introMarkScale = useTransform(introProgress, [.45, .78], [1, .2]);
  const introMarkY = useTransform(introProgress, [.45, .78], [0, -330]);
  const heroOpacity = useTransform(introProgress, [.5, .75], [0, 1]);
  const heroY = useTransform(introProgress, [.5, .78], [60, 0]);
  const imageY = useTransform(introProgress, [.5, 1], [30, -20]);
  const smoothImageY = useSpring(imageY, { stiffness: 80, damping: 25 });
  const projectX = useTransform(projectsScrollProgress, [0, 1], [0, -projectDragLimit]);
  const projectProgress = useTransform(projectsScrollProgress, [0, 1], [.16, 1]);

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
        <motion.div className={styles.introMark} style={{ scale: introMarkScale, y: introMarkY }}>
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
            <Image src="/images/viveci-monumental-hq.png" fill preload quality={95} sizes="100vw" alt="Arquitetura monumental de inspiração romana, em travertino" />
          </motion.div>
          <div className={styles.heroShade}/>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>VVC / SITES PARA NEGÓCIOS LOCAIS</p>
            <h1>Vim, vi, e fiz<br/>o seu <em>site.</em></h1>
            <p className={styles.heroSub}>Eu chego, entendo como o seu negócio funciona e construo um site único, feito.</p>
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
      <div className={styles.sectionIntro}><span>Serviços</span><h2>O site certo para o momento do seu negócio.</h2><a href="#contato">Quero o meu →</a></div>
      <div className={styles.serviceGrid}>{services.map(([title,text],i)=><article key={title}><div className={styles.serviceIcon}>{["⌂","▤","◫","▦","□","◎"][i]}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
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
                  <Image src={project.image} fill quality={100} sizes="(max-width: 800px) 88vw, 72vw" alt={`Página inicial do projeto ${project.area}`} style={{ objectPosition: project.position }} draggable={false}/>
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
      <div className={styles.techCopy}><span>Tecnologia</span><h2>Design que funciona.<br/>Tecnologia que sustenta.</h2><p>Cada tela é construída para abrir rápido, orientar o visitante e funcionar bem na situação real: no celular, na rua e sem tempo para adivinhar.</p><ul><li>Celular primeiro</li><li>Performance e velocidade</li><li>SEO local</li><li>Acessibilidade</li><li>Movimento com propósito</li></ul><a href="#contato">Ver isso no meu negócio →</a></div>
      <div className={styles.deviceStage}>
        <div className={styles.desktopMock}><div className={styles.mockBar}><i/><i/><i/><span>modelo.viveci.studio</span></div><div className={styles.mockPage}><div><small>MODELO DEMONSTRATIVO</small><h3>MADEIRA COM<br/>DESIGN. ESPAÇOS<br/>COM PROPÓSITO.</h3><button>CONHEÇA O PROJETO</button></div><Image src="/images/vvc-architecture-hq.png" fill quality={95} sizes="45vw" alt="Interior contemporâneo usado em um modelo demonstrativo" /></div></div>
        <div className={styles.phoneMock}><div className={styles.phoneNotch}/><small>VIVECI</small><h3>MADEIRA<br/>COM DESIGN.</h3><Image src="/images/vvc-architecture-hq.png" fill quality={95} sizes="180px" alt="Detalhe do modelo demonstrativo no celular" /></div>
      </div>
    </section>

    <section className={styles.offer}>
      <div><span>O modelo vem primeiro</span><h2>Eu monto.<br/>Você olha.<br/><em>Depois decide.</em></h2></div>
      <div><p>Nenhum negócio deveria pagar por um site que ainda não viu. Eu preparo uma versão com a sua marca e as suas informações para você navegar antes de conversarmos sobre valor.</p><a className={styles.darkButton} href="#contato">Quero ver meu modelo →</a></div>
    </section>

    <section className={styles.story} id="sobre">
      <div className={styles.storyImage}><Image src="/images/viveci-monumental-hq.png" fill quality={95} sizes="45vw" alt="Detalhe da arquitetura monumental que inspira a identidade da Viveci" /></div>
      <div className={styles.storyCopy}><span>A origem</span><h2>Veni.<br/>Vidi.<br/><em>Vici.</em></h2><p>Viveci nasce desses três verbos. Não como uma promessa de conquista, mas como método: primeiro eu chego ao seu negócio, depois entendo como ele funciona e só então construo.</p><p>Meu nome é Enzo. Na Viveci, você fala diretamente com quem desenha e escreve o código. O site é feito para o seu negócio e continua sendo seu.</p><a href="#contato">Falar comigo →</a></div>
    </section>

    <section className={styles.faq} id="duvidas"><div><span>Dúvidas</span><h2>Antes de você perguntar.</h2></div><div>{[["O modelo é grátis mesmo?","Sim. Você não paga para ver, não assina nada e pode recusar sem compromisso."],["Eu já tenho Instagram. Preciso de site?","O Instagram ajuda quem já conhece você. O site também encontra quem está procurando seu serviço no Google."],["Quanto custa?","O valor depende do que o site precisa ter. Eu só fecho o número depois que você vê o modelo e define o escopo."],["Quem fica com o site e o domínio?","O endereço e o conteúdo ficam no nome do seu negócio. O site é seu."]].map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>

    <section className={styles.contact} id="contato"><div className={styles.contactTitle}><span>Vamos ver como fica?</span><h2>Seu próximo site começa com um modelo.</h2><p>Sem custo. Sem compromisso. Você só precisa me contar sobre o negócio.</p></div><ContactForm/></section>

    <footer className={styles.footer}><div className={styles.footerArch}><Image src="/images/viveci-monumental-hq.png" fill quality={95} sizes="35vw" alt="" /></div><div className={styles.footerCta}><h2>Vamos construir<br/>o seu próximo site?</h2><a href="#contato">Quero ver meu modelo →</a></div><div className={styles.footerGrid}><div><b>VIVECI</b><span>/ DIGITAL STUDIO</span><p>Sites para negócios que atendem gente todo dia.</p></div><div><span>NAVEGAÇÃO</span><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#processo">Processo</a><a href="#sobre">Sobre</a><a href="#duvidas">Dúvidas</a></div><div><span>CONTATO</span><a href="#contato">Falar comigo</a><p>Atendimento direto com quem faz.</p></div><div className={styles.footerLogo}><VVCLogo/></div></div><div className={styles.copyright}><span>© 2026 VIVECI DIGITAL STUDIO</span><a href="#inicio">VOLTAR AO TOPO ↑</a></div></footer>
  </main>;
}
