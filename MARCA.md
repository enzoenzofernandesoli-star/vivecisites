# Marca digital — VIVECI / VVC Digital Studio

Extraído do código em produção (`main`, 07/09/2026) e medido no navegador em
1440px. Onde o CSS tem regras sobrescritas, o valor listado é o que realmente
chega na tela, não o que está escrito na primeira declaração.

---

## Identidade

**Nome:** Viveci · **Assinatura:** VVC Digital Studio
**Origem:** os três verbos de *veni, vidi, vici* — chegar, entender, construir.
Não é sobre conquista, é sobre a ordem das etapas.

**Promessa central:** "Veja o seu site antes de pagar."
**Assinatura de voz:** "Sua visão. Nossa tecnologia."
**Descritor:** sites para que empresas sejam encontradas, transmitam confiança
e transformem visitas em clientes.

---

## Cores

O site é escuro por padrão. A base é azul-noite quase preto, o texto é um
branco quente e o único sinal forte é o azul elétrico.

### Base

| Papel | Token | Hex | Onde aparece |
|---|---|---|---|
| Fundo geral | `--ink` | `#05080C` | fundo do site inteiro e do rodapé |
| Fundo da primeira dobra | `--navy` | `#020D1B` | herói, seções escuras |
| Superfície elevada | `--electric` | `#06172B` | painéis e cartões sobre o fundo |
| Superfície média | `--atlantic` | `#0B223A` | blocos e molduras internas |

### Texto

| Papel | Token | Hex | Uso |
|---|---|---|---|
| Texto principal | `--ivory` | `#F4F1E9` | títulos e texto sobre escuro |
| Texto de apoio | `--ivory` a 78–80% | `rgba(244,241,233,.78)` | parágrafos, descrições |
| Texto terciário | `--steel` | `#91A8C0` | legendas, rótulos secundários |

### Acentos

| Papel | Token | Hex | Uso |
|---|---|---|---|
| Sinal (principal) | `--signal` | `#1877FF` | bordas ativas, barras, brilho, foco |
| Sinal claro | `--signal-bright` | `#57A9FF` | olhos de seção, números, ícones de destaque, assinatura do rodapé |
| Acento quente | `--gold` | `#AD9165` | ícones de serviço e palavras em `<em>` |
| Areia | `--sand` | `#D8CDBB` | raro, superfícies claras |

### Linhas e véus

| Papel | Valor |
|---|---|
| Linha de estrutura | `rgba(145,168,192,.18)` |
| Borda ativa | `rgba(24,119,255,.58)` a `.86` |
| Brilho de foco | `0 0 22px rgba(24,119,255,.58)` |
| Véu sobre imagem | gradiente de `rgba(2,8,20,.92)` a transparente |

**Regra de proporção.** O azul de sinal aparece 217 vezes no CSS; o dourado, 39.
O azul manda. O dourado é tempero, nunca protagonista, e nunca dois acentos no
mesmo elemento.

**Vermelho não existe mais.** Todos os acentos vermelhos foram convertidos para
o azul elétrico. Os tokens `--red` e `--riviera` ainda existem no código, mas
apontam para `#1877FF` — são nome legado, não cor vermelha.

**Tokens declarados e não usados** (ignore ao replicar): `--white`,
`--steel-deep`, `--panel`, `--panel-strong`.

---

## Tipografia

Três famílias, com papéis que não se misturam.

### Michroma — display

Geométrica, larga, técnica. É a fonte que dá a cara de tecnologia.
Google Fonts, peso único 400. Sempre com espaçamento entre letras positivo em
títulos grandes.

| Elemento | Tamanho medido | Entrelinha | Tracking |
|---|---|---|---|
| Título do herói (VIVECI) | 84,7px (`clamp(3.4rem, 6.6vw, 7.6rem)`) | 0,98 | `.11em` |
| Subtítulo do herói | 21,2px | 1,2 | `-.025em` |
| Título de seção | 37,2px (`clamp(1.8rem, 2.9vw, 3.5rem)`) | 1,12 | `.02em` |
| Título de cartão | 25,7px | normal | `-.025em` |

No celular o título do herói cai para `clamp(2.9rem, 15vw, 5.4rem)` com
tracking `.085em` e `white-space: nowrap`, para "VIVECI" nunca quebrar em duas
linhas.

### Instrument Sans — texto e interface

Neutra, legível, sem personalidade competindo com a Michroma.
Local, pesos 400 e 700, com itálico.

| Elemento | Tamanho | Entrelinha |
|---|---|---|
| Corpo de texto | 16px (`clamp(14px, 1.1vw, 16px)`) | 1,70 |
| Apoio do herói | 15,2px | 1,45 |
| Botões | 12px | normal |
| Pergunta do FAQ | 17,3px | normal |

### Bricolage Grotesque — voz editorial

Entra só onde uma voz mais humana ajuda: a assinatura do rodapé (24px, peso
700, em azul claro) e alguns títulos de destaque. Local, pesos 400 e 500.

### Rótulos e olhos de seção

O detalhe mais característico da marca: texto minúsculo com espaçamento
enorme entre letras.

- Olho de seção: 8px, `letter-spacing: .2em`, maiúsculas, `#57A9FF`
- Etiquetas técnicas: 7 a 9px, `letter-spacing` entre `.18em` e `.24em`
- Lettering da logo (DIGITAL STUDIO): `letter-spacing: .62em`

Escala de tracking em uso, do mais fechado ao mais aberto:
`-.065em` · `-.035em` · `-.025em` · `0` · `.01em` · `.11em` · `.16em` ·
`.18em` · `.2em` · `.22em` · `.24em` · `.38em` · `.42em` · `.48em` · `.55em` ·
`.62em`

**Regra:** quanto maior o texto, mais fechado o tracking. Quanto menor, mais
aberto. Título grande é apertado; rótulo de 8px é espalhado.

---

## Logo

Monograma **VVC** em linha fina, desenhado como traço contínuo.

- Dois "V" que se cruzam logo abaixo do topo, e um "C" quadrado aberto à direita
- O braço direito do segundo V aterrissa exatamente no canto superior do C
- `viewBox="0 0 800 230"`, traço de 10, pontas retas (`butt`) e cantos vivos (`miter`)
- Proporção aproximada de 3,4 : 1
- Cor: marfim sobre escuro. Sem preenchimento, só contorno

**Bloco completo da marca**, de cima para baixo: monograma, "DIGITAL STUDIO"
espaçado em `.62em`, e um traço de acento curto e centralizado.

Na abertura o traço é desenhado em ordem — primeiro V, segundo V, depois o C
saindo do canto — e só então entram o lettering e o acento.

---

## Formas e espaço

| Elemento | Valor |
|---|---|
| Pílulas (botões, chips de ação) | `border-radius: 999px` |
| Círculos (ícones, números de etapa) | `border-radius: 50%` |
| Cartões e painéis | 7 a 16px |
| Molduras internas | 5 a 11px |
| Espessura de linha | 1px, quase sempre |

**Ritmo vertical:** pausas grandes entre narrativas. Preenchimento de seção
entre `5.5vw` e `17vw` conforme a largura da tela. Margens laterais de `3.5vw`
no desktop e `5vw` no celular.

**Grade:** o conteúdo respira em colunas assimétricas — `26% / 74%` nos
serviços, `58% / 42%` nas ofertas. Raramente meio a meio.

---

## Movimento

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | entradas, o padrão da casa |
| `--ease-in-out` | `cubic-bezier(.77,0,.175,1)` | transições longas |
| `--ease-pop` | `cubic-bezier(.34,1.4,.5,1)` | aparições com leve estouro |
| `--dur-press` | 160ms | clique |
| `--dur-hover` | 250ms | hover |
| `--dur-enter` | 500ms | entrada de elemento |

**Princípios:**

- Anima só `transform` e `opacity`. Nunca `width`, `top` ou `background` em
  animação contínua
- Uma ideia de movimento por seção, não quatro
- Títulos entram palavra por palavra, com máscara de linha, subindo
- Sem bounce, sem autoplay decorativo, sem loop contínuo de GPU
- Motor único de rolagem suave, só no desktop com ponteiro preciso
- `prefers-reduced-motion` entrega o conteúdo completo, imediato, sem percurso
  obrigatório e sem WebGL

---

## Imagens

- **Herói:** android preto com halo azul, recortado sobre campo escuro. Ocupa
  a direita; a copy vive à esquerda
- **Projetos:** capturas reais de sites dentro de moldura tecnológica. Sem
  resultado inventado, sem número de performance que não exista
- Tratamento: saturação levemente reduzida, contraste levemente elevado, véu
  escuro por cima para o texto ganhar
- Nunca `quality=100`; alta o bastante sem peso desnecessário

---

## Voz

Direta, primeira pessoa, sem jargão de agência. Frases curtas. O verbo antes
do adjetivo.

**Padrões que se repetem:**

- "Veja primeiro. Decida depois."
- "Sua visão. Nossa tecnologia."
- "Sites que elevam a sua marca."
- CTA principal: "Ver meu modelo" / "Quero ver meu modelo"
- Etapas nomeadas em uma palavra: Conversa · Modelo · Você avalia · Valor · Publicação

**O que a voz não faz:** não promete número que não pode provar, não usa
superlativo vazio, não numera o que não tem ordem real. Numeração só onde
existe sequência de verdade — as camadas de tecnologia (01 Interface,
02 Aplicação, 03 Dados) são numeradas; as perguntas frequentes, não.

---

## Acessibilidade e regras duras

- Alvo de toque com no mínimo 44px
- Foco sempre visível, contorno em `--signal-bright` com deslocamento de 4px
- Contraste garantido por véu direcional: onde a copy vive, a superfície
  escurece
- O texto existe no HTML, nunca depende de JavaScript para aparecer
- Estado inicial no CSS: se o JS falhar, o site aparece
- Nenhuma animação causa deslocamento de layout

---

## Metadados

- **Título:** Viveci — Veja o seu site antes de pagar
- **Cor de tema:** `#020D1B`
- **Esquema:** `dark light`
- **Domínio de referência:** vvcdigital.studio

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules ·
Framer Motion · GSAP 3.15 com ScrollTrigger e SplitText · Lenis · ogl (WebGL)
