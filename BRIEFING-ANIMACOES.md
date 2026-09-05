# BRIEFING — Camada de animação do site Viveci

**Referência:** trionn.com (Next.js + GSAP/ScrollTrigger/SplitText + Lenis + OGL/WebGL)
**Alvo:** mesmo nível de efeito, rodando na stack deste projeto.
**Como usar:** execute uma FASE por vez. Não peça o documento inteiro de uma vez — animação quebra em silêncio, e depurar 6 fases juntas é o que mata esse tipo de projeto.

---

## 0. Correções ao briefing original

O briefing original descrevia um stack que **não é o deste repositório**. Verificado em 2026-09-05:

| Briefing original dizia | Real |
|---|---|
| Vite | **Next.js 16.3.3** (App Router) |
| React 18 | **React 19.2.8** |
| Tailwind v4 + shadcn/ui | **não instalados** — CSS Modules (`components/viveci.module.css`) |
| React Router | **não existe** — App Router |
| `src/lib/`, `src/providers/` | **não há `src/`** — é `app/`, `components/`, `lib/`, `providers/` na raiz |

Consequências práticas:

- O hook `useGSAP` do `@gsap/react` continua útil (React 19 também tem StrictMode com duplo-mount em dev).
- **A FASE 5 do briefing original está errada na premissa.** Não há React Router; transição de rota no App Router usa `template.tsx` ou `usePathname` + `AnimatePresence`. Reescrita abaixo.
- Estilos entram no `.module.css` existente, não em classes Tailwind.

---

## 1. Stack

**Já tem:** Next.js 16 (App Router) + React 19 + TypeScript + CSS Modules + Framer Motion 13.

**Instalado na FASE 1:**

```bash
npm i gsap @gsap/react lenis ogl
```

Versões confirmadas: `gsap 3.15.0`, `@gsap/react 2.1.2`, `lenis 1.3.26`, `ogl 1.0.11`.

Verificado: `ScrollTrigger`, `SplitText` e `ScrollSmoother` vêm no pacote público do GSAP, sob a licença "Standard 'no charge'". Não precisa do Club.

**Divisão de responsabilidade (regra dura):**

| Ferramenta | Usar para | NUNCA usar para |
|---|---|---|
| GSAP + ScrollTrigger | Tudo que reage ao scroll: reveal, pin, parallax, horizontal | micro-interação de botão |
| Framer Motion | UI: hover, modal, accordion, transição de rota | qualquer coisa ligada a scroll |
| Lenis | Só o scroll suave global | nada além disso |
| OGL | Só os canvas de efeito | layout |

**As duas bibliotecas nunca animam o mesmo elemento.** Framer Motion e GSAP escrevem os dois em `transform` — se disputarem o mesmo nó, dá tremida inexplicável.

> ⚠️ **Dívida conhecida.** O site já tem movimento ligado a scroll feito em Framer Motion, anterior a este briefing: `usePinnedProgress` (rAF + listener de scroll) move o trilho do carrossel de projetos e o parallax da hero, e `useInView` dispara os reveals. Hoje convive com o Lenis — verificado. Mas a regra acima diz que scroll é território do GSAP. Se alguma fase futura mexer no carrossel, migre para ScrollTrigger em vez de empilhar os dois.

---

## 2. Regras de ouro

1. Animar **só `transform` e `opacity`**. Nada de `width`, `height`, `top`, `box-shadow`, `filter` em animação contínua.
2. Todo elemento animado com `will-change: transform` — removido depois que a animação termina.
3. **Tudo dentro de `gsap.matchMedia()`**, respeitando `prefers-reduced-motion`. É também o interruptor pra desligar efeito pesado no mobile.
4. Nenhuma animação pode causar **layout shift**. Elemento que entra com `yPercent` já ocupa o espaço final desde o início.
5. Estado inicial no CSS, não no JS. Se o JS falhar, o site aparece — nunca fica invisível.
6. Nada de animação que dependa de JS pra o conteúdo existir. Texto no HTML sempre (SEO).
7. Cada fase entrega em branch separada e roda no celular de verdade antes de merge.

---

## 3. Arquitetura de arquivos (adaptada a este repo)

```
lib/
  gsap.ts                    # registra plugins uma vez; exporta gsap/ScrollTrigger/SplitText
providers/
  SmoothScrollProvider.tsx   # Lenis + sincronia com ScrollTrigger
  ScrollTriggerProbe.tsx     # sonda temporária da FASE 1 — remover na FASE 2
hooks/
  useTextReveal.ts
  useParallax.ts
  useMagnetic.ts
components/motion/
  Reveal.tsx
  HorizontalSection.tsx
  Cursor.tsx
  DistortionImage.tsx        # OGL
```

---

## FASE 1 — Fundação: Lenis + GSAP sincronizados ✅ FEITA

**A fase mais importante.** Se Lenis e ScrollTrigger não estiverem no mesmo loop de frame, tudo depois fica um frame atrasado e você não descobre por quê.

Entregue: `lib/gsap.ts`, `providers/SmoothScrollProvider.tsx`, montagem no `app/layout.tsx`, sonda de verificação.

**Duas armadilhas encontradas neste repo** (uma o briefing avisava, outra não):

1. `body { overflow-x: hidden }` cria container de scroll e quebra o Lenis. Trocado por `overflow-x: clip`, que recorta sem criar container.
2. `html { scroll-behavior: smooth }` briga com o Lenis — dois motores de suavização ao mesmo tempo. Resolvido com `html.lenis-smooth { scroll-behavior: auto }`: desliga o nativo só quando o Lenis está ativo, preservando o smooth para quem usa movimento reduzido (onde o Lenis não liga).

**Aceite verificado:** `<html class="lenis lenis-scrolling">`, ScrollTrigger recebendo updates (11 updates, progresso 0.726, direção 1), e o movimento pré-existente intacto — reveals disparando, trilho do carrossel andando de −7,5px para −3439,81px.

**Ao começar a FASE 2:** apagar `providers/ScrollTriggerProbe.tsx`, a linha que o monta no layout e o `data-probe-target` na seção de processo.

---

## FASE 2 — Reveal de texto

Título que sobe palavra por palavra, com máscara.

```ts
// hooks/useTextReveal.ts — chamar SEMPRE depois de document.fonts.ready
await document.fonts.ready;
const split = new SplitText(el, { type: "lines,words", linesClass: "reveal-line" });
gsap.from(split.words, {
  yPercent: 115,
  duration: 1,
  ease: "expo.out",
  stagger: 0.025,
  scrollTrigger: { trigger: el, start: "top 80%", once: true },
});
```

```css
.reveal-line { overflow: hidden; }
```

**Duas armadilhas:**

- Rodar o split antes das fontes carregarem = linhas quebram no lugar errado. Daí o `document.fonts.ready`. Este site carrega Michroma + Instrument Sans via `next/font`, então isso importa de verdade.
- Split destrói e recria o DOM do texto. Chame `split.revert()` na limpeza do `useGSAP`, senão cada re-render acumula spans.

**Atenção:** já existe um componente `Reveal` (em `ViveciRedesign.tsx`) feito com `useInView` + transição CSS, usado nos cabeçalhos e cards de Serviços/Tecnologia/FAQ. Decida: ou o novo `<Reveal>` GSAP substitui aquele, ou têm nomes diferentes. Não deixe os dois com o mesmo nome.

---

## FASE 3 — Scroll choreography

1. **Parallax de imagem** — `yPercent: -12` com `scrub: true`. Passou de 15% vira enjoo.
2. **Seção pinada** — `pin: true` no container, timeline interna com `scrub`.
3. **Scroll horizontal** — a galeria de projetos. `xPercent: -100 * (n-1)` com `pin` + `scrub`.
4. **Header que reage** — encolhe/muda de cor ao passar do hero.

**Regra:** no mobile (`< 768px`), pin e scroll horizontal **desligam** e viram stack vertical. Dentro de `gsap.matchMedia()`, não com `if` solto.

> O item 3 colide diretamente com o carrossel atual, que já é scroll-jack em Framer Motion e no celular já vira scroll-snap nativo. Migrar, não empilhar.

---

## FASE 4 — Cursor e magnetismo (desktop only)

- Cursor customizado: `div` seguindo o mouse com `gsap.quickTo` (não `gsap.to` a cada `mousemove` — isso cria centenas de tweens por segundo).
- Estados: normal / hover em link (cresce) / hover em projeto (vira "VER").
- Botão magnético: puxa em direção ao mouse dentro de um raio, volta com `elastic.out`.
- Tudo atrás de `(pointer: fine)`. Em touch, nem carrega.

---

## FASE 5 — Transição de rota (reescrita para App Router)

O site hoje é uma página só (`app/page.tsx`). Esta fase só faz sentido quando existir uma segunda rota.

Quando existir, no App Router: `app/template.tsx` (remonta a cada navegação, ao contrário de `layout.tsx`) com `AnimatePresence`, ou `usePathname()` como `key`.

**Obrigatório ao entrar na rota nova:**

```ts
lenis.scrollTo(0, { immediate: true });
ScrollTrigger.refresh();
```

Esquecer isso = a página nova abre no meio e os triggers ficam calculados com a altura da página antiga. É o bug número 1 desse tipo de site.

---

## FASE 6 — WebGL com OGL

**Só depois que 1–5 estiverem no ar.** Mais retorno visual e mais dor de cabeça.

**6a. Hover com distorção nas thumbs de projeto**

```glsl
uniform sampler2D tMap;
uniform sampler2D tDisp;
uniform float uProgress;
varying vec2 vUv;
void main() {
  vec4 disp = texture2D(tDisp, vUv);
  vec2 uv = vUv + (disp.rg - 0.5) * uProgress * 0.15;
  gl_FragColor = texture2D(tMap, uv);
}
```

`uProgress` sobe 0→1 com `gsap.to` no `mouseenter`. O displacement é um PNG de ruído Perlin — gere um, não precisa ser bonito.

**6b. Trail de fluido no cursor** — só se 6a estiver estável. Sinceramente: menor retorno pelo custo.

**Regras não negociáveis do WebGL:**

- Import dinâmico (`const { Renderer } = await import("ogl")`) — não pode entrar no bundle inicial.
- Só em `(min-width: 1024px)` **e** `(pointer: fine)`.
- `IntersectionObserver`: canvas fora da viewport para de renderizar.
- `dpr` limitado a `Math.min(devicePixelRatio, 2)`.
- Fallback: se o contexto WebGL falhar, mostra o `<Image>` normal. O site nunca depende do canvas.

---

## 7. Checklist de performance (ao fim de cada fase)

- [ ] Lighthouse mobile: Performance ≥ 85, CLS < 0.1
- [ ] Testado em celular real, não só no DevTools
- [ ] `prefers-reduced-motion` desliga tudo e o site continua usável
- [ ] Imagens em WebP/AVIF, com `width`/`height` declarados
- [ ] Bundle inicial sem OGL
- [ ] Sem `console.error` de ScrollTrigger ("trigger element not found")
- [ ] Navegar/rolar bastante sem acumular lag (vazamento de tween)

---

## 8. O que separa isto do Trionn (e não é código)

- **Tipografia.** Eles usam fontes pagas com peso e tracking trabalhados.
- **Conteúdo.** A galeria deles é cheia de trabalho real bem fotografado. Hoje dois dos doze projetos daqui são capturas de tela de login.
- **Contenção.** O site deles tem MENOS movimento do que parece na lembrança. Cada seção tem um efeito, não quatro. A tentação vai ser empilhar tudo — resista.
