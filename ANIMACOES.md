# Animações sobre o visual original

Base: `37c122d`, branch `melhoria/animacoes-original`. O redesign anterior não faz parte desta entrega. Layout, CSS, textos, imagens, fontes e dependências originais preservados.

## Alterações

- Cena espacial WebGL no herói com câmera em perspectiva, três malhas toroidais iluminadas e campo esférico de partículas. A câmera e o conjunto 3D respondem ao ponteiro com amortecimento.
- Perspectiva sutil no herói e nos cartões, com retorno suave e transformações independentes da rolagem.
- Refração WebGL localizada no ponteiro, preservando proporção e enquadramento da imagem. Renderização sob demanda, encerrada ao sair da tela.
- Entradas de texto e seções mais curtas, botões magnéticos limitados e limpeza dos efeitos ao mudar a preferência de movimento.
- Scroll suave apenas no desktop com ponteiro preciso; tarefas decorativas pausadas com a aba oculta.
- O robô original permanece como direção visual; a nova geometria 3D é procedural e se integra à órbita já presente na arte, evitando um modelo externo incompatível com a identidade.
- A cena 3D só é montada em desktop com ponteiro preciso e movimento permitido. Ela pausa fora da viewport ou com a aba oculta e libera canvas, programas, geometrias e contexto WebGL ao desmontar.

## Verificação

`npm run lint`, `npm run build` e `python scripts/verificar-animacoes.py` (preview na porta 3190).

Teste automatizado: cena espacial, perspectiva e refração no desktop; remoção dos efeitos com movimento reduzido; ausência de erros JavaScript; ausência de WebGL e overflow horizontal em 375 e 768 px. Capturas em `outputs/`. Lighthouse do redesign anterior não representa esta branch.

## Referências aplicadas

Skills do Segundo Cérebro: motion-design, fixing-motion-performance, fixing-accessibility, gsap-react, gsap-scrolltrigger, threejs-shaders e webapp-testing. Direção Awwwards subordinada à preservação do design solicitada pelo usuário.

- https://github.com/oframe/ogl/blob/master/examples/mouse-flowmap.html
- https://gsap.com/docs/v3/GSAP/gsap.quickTo()/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
