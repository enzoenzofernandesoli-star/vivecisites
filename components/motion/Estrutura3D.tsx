"use client";

import { useEffect, useRef } from "react";
import styles from "../viveci.module.css";

/**
 * Estrutura de blocos que se monta no scroll, atrás da primeira dobra.
 *
 * Duas adaptações conscientes em relação ao documento de referência:
 *
 * 1. O documento pede `position: fixed` atrás do site inteiro. Aqui as seções
 *    têm fundo opaco, então uma camada fixa ficaria invisível o tempo todo. A
 *    estrutura vive dentro da primeira dobra, que é onde as fases seguintes
 *    atuam, e é destruída quando a dobra sai da tela.
 * 2. O documento desloca a malha +5.4 em X porque "o texto vive à esquerda".
 *    Neste herói o android ocupa a direita e a copy ocupa a esquerda, então o
 *    deslocamento é espelhado: a malha ocupa o campo escuro da esquerda, e o
 *    esmaecimento radial a mantém longe do android.
 *
 * O tom de destaque é o azul da marca. O documento pede vermelho, mas os
 * acentos vermelhos foram removidos do site em `80d7dea`.
 */

const COLUNAS = 54;
const LINHAS = 32;
const CAMADAS = 2;
const TOTAL = COLUNAS * LINHAS * CAMADAS;
const PASSO = 0.6;
const DESLOCAMENTO_X = -5.4;

const vertex = `
attribute vec3 position;
attribute vec3 normal;
attribute vec3 aScatter;
attribute vec3 aAlvo;
attribute float aRnd;
attribute float aTom;
attribute float aBorda;
attribute float aAlt;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 uCam;
uniform float uMontagem;
uniform float uT;
uniform vec3 uPtr;

varying vec3 vN;
varying vec3 vView;
varying float vD;
varying float vTom;
varying float vBorda;
varying float vAlt;
varying float vProf;

void main() {
  // o atraso por instância faz a montagem varrer a malha em vez de estalar
  float d = smoothstep(0.0, 1.0, clamp(uMontagem * 1.85 - aRnd * 0.85, 0.0, 1.0));

  // solto deriva; encaixado fica quieto
  vec3 solto = aScatter;
  solto.x += sin(uT * 0.45 + aRnd * 9.0) * 1.6;
  solto.y += sin(uT * 0.38 + aRnd * 7.0) * 1.3;
  solto.z += sin(uT * 0.31 + aRnd * 5.0) * 1.1;

  vec3 base = mix(solto, aAlvo, d);

  // onda que varre a estrutura da esquerda para a direita
  float faixa = mod(uT * 2.4, 34.0) - 17.0;
  float onda = exp(-pow((base.x - faixa) * 0.55, 2.0)) * d;
  base.z += onda * 0.95;

  // o ponteiro já chega projetado no plano da estrutura
  vec2 paraFora = base.xy - uPtr.xy;
  float dist = length(paraFora);
  float empurrao = exp(-pow(dist * 0.42, 2.0)) * uPtr.z * d;
  base.xy += normalize(paraFora + vec2(0.0001)) * empurrao * 1.6;
  base.z += empurrao * 0.6;

  float escala = (0.45 + 0.55 * d) * (0.30 + 0.70 * aBorda) * (1.0 + onda * 0.55 + empurrao * 0.35);
  vec3 mundo = position * escala + base;

  vec4 mv = modelViewMatrix * vec4(mundo, 1.0);

  vN = normalize(normalMatrix * normal);
  vView = normalize(uCam - mundo);
  vD = d;
  vTom = aTom;
  vBorda = aBorda;
  vAlt = aAlt;
  vProf = -mv.z;

  gl_Position = projectionMatrix * mv;
}
`;

const fragment = `
precision highp float;

varying vec3 vN;
varying vec3 vView;
varying float vD;
varying float vTom;
varying float vBorda;
varying float vAlt;
varying float vProf;

uniform vec3 uBase;
uniform vec3 uTom;
uniform vec3 uNevoa;

void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vView);
  vec3 luz = normalize(vec3(0.38, 0.72, 0.58));

  // três termos: só difusa deixa o bloco chapado
  float difusa = 0.30 + 0.80 * max(dot(n, luz), 0.0);
  float especular = pow(max(dot(reflect(-luz, n), v), 0.0), 34.0) * 0.55 * vD;
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.8) * 0.30 * vD;

  vec3 cor = mix(uBase, uTom, vTom);
  cor *= difusa;
  cor *= 0.72 + 0.55 * vAlt;
  cor += especular + fresnel;
  cor *= mix(0.18, 1.22, vD);
  cor *= 0.10 + 0.90 * vBorda;

  // a névoa agora dissolve o bloco em vez de pintá-lo da cor do fundo:
  // o herói continua aparecendo por trás
  float nevoa = clamp((vProf - 19.0) / 60.0, 0.0, 1.0);
  cor = mix(cor, uNevoa, nevoa * 0.65);
  float alfa = (1.0 - nevoa) * (0.12 + 0.88 * vBorda) * mix(0.25, 1.0, vD);

  gl_FragColor = vec4(cor, alfa);
}
`;

/** Setters que a fase de direção usa para dirigir a cena pelo scroll. */
export type ControleEstrutura = {
  montagem: (valor: number) => void;
  camera: (x: number, y: number, z: number) => void;
};

export function Estrutura3D({
  controle,
}: {
  controle?: React.MutableRefObject<ControleEstrutura | null>;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const consulta = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );

    let geracao = 0;
    let visivel = false;
    let descartado = false;
    let limpar: (() => void) | undefined;

    const destruir = () => {
      geracao++;
      limpar?.();
      limpar = undefined;
      if (controle) controle.current = null;
      el.setAttribute("data-pronto", "false");
    };

    const montar = async () => {
      const marca = ++geracao;
      let contextoPerdido = false;
      const vale = () =>
        !descartado && !contextoPerdido && marca === geracao && visivel && consulta.matches;

      try {
        const { Renderer, Camera, Transform, Program, Mesh, Box } = await import("ogl");
        if (!vale()) return;

        // Transparente de propósito: um canvas opaco cobriria o android e o
        // campo navy do herói. Só os blocos pintam; o resto deixa passar.
        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio, 1.75),
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
        const gl = renderer.gl;
        const canvas = gl.canvas as HTMLCanvasElement;
        gl.clearColor(0, 0, 0, 0);
        canvas.className = styles.estruturaCanvas;
        el.appendChild(canvas);

        const soltar: (() => void)[] = [];

        // ---- atributos por instância ----
        const scatter = new Float32Array(TOTAL * 3);
        const alvo = new Float32Array(TOTAL * 3);
        const rnd = new Float32Array(TOTAL);
        const tom = new Float32Array(TOTAL);
        const borda = new Float32Array(TOTAL);
        const alt = new Float32Array(TOTAL);

        let i = 0;
        for (let camada = 0; camada < CAMADAS; camada++) {
          for (let linha = 0; linha < LINHAS; linha++) {
            for (let coluna = 0; coluna < COLUNAS; coluna++) {
              const nx = (coluna / (COLUNAS - 1)) * 2 - 1;
              const ny = (linha / (LINHAS - 1)) * 2 - 1;

              // relevo em patamares: lê como estrutura, não como granulado
              const rel =
                Math.sin(nx * 3.1 + ny * 1.7) * 0.9 +
                Math.sin(ny * 4.3 - nx * 2.2) * 0.65 +
                Math.sin((nx + ny) * 6.5) * 0.3;
              const plato = Math.round(rel * 1.6) / 1.6;

              const x = (coluna - (COLUNAS - 1) / 2) * PASSO + DESLOCAMENTO_X;
              const y = (linha - (LINHAS - 1) / 2) * PASSO;
              const z = plato * 0.44 - camada * 0.34;

              alvo[i * 3] = x + (Math.random() - 0.5) * 0.1;
              alvo[i * 3 + 1] = y + (Math.random() - 0.5) * 0.1;
              alvo[i * 3 + 2] = z + (Math.random() - 0.5) * 0.1;

              const raioSolto = 16 + Math.random() * 30;
              const angulo = Math.random() * Math.PI * 2;
              scatter[i * 3] = Math.cos(angulo) * raioSolto + DESLOCAMENTO_X;
              scatter[i * 3 + 1] = (Math.random() - 0.5) * 34;
              scatter[i * 3 + 2] = -14 - Math.random() * 8;

              rnd[i] = Math.random();
              tom[i] = Math.random() < 0.06 ? 1 : 0;

              // sem o esmaecimento radial a malha vira um retângulo colado na tela
              const raio = Math.sqrt(nx * nx * 0.82 + ny * ny * 1.15);
              const bruto = 1 - Math.min(Math.max((raio - 0.34) / 0.7, 0), 1);
              borda[i] = bruto * bruto * (3 - 2 * bruto);

              alt[i] = plato / 3.7 + 0.5;
              i++;
            }
          }
        }

        const geometria = new Box(gl, {
          width: 0.455,
          height: 0.455,
          depth: 0.34,
          attributes: {
            aScatter: { size: 3, data: scatter, instanced: 1 },
            aAlvo: { size: 3, data: alvo, instanced: 1 },
            aRnd: { size: 1, data: rnd, instanced: 1 },
            aTom: { size: 1, data: tom, instanced: 1 },
            aBorda: { size: 1, data: borda, instanced: 1 },
            aAlt: { size: 1, data: alt, instanced: 1 },
          },
        });
        soltar.push(() => geometria.remove());

        const programa = new Program(gl, {
          vertex,
          fragment,
          uniforms: {
            uCam: { value: [0, 0, 22] },
            uMontagem: { value: 0 },
            uT: { value: 0 },
            uPtr: { value: [0, 0, 0] },
            uBase: { value: [0.62, 0.72, 0.86] },
            uTom: { value: [0.09, 0.47, 1] },
            uNevoa: { value: [4 / 255, 7 / 255, 14 / 255] },
          },
        });
        soltar.push(() => programa.remove());

        const cena = new Transform();
        const malha = new Mesh(gl, { geometry: geometria, program: programa });
        malha.frustumCulled = false;
        malha.setParent(cena);

        const camera = new Camera(gl, { fov: 42, near: 0.1, far: 140 });
        const alvoCamera = { x: DESLOCAMENTO_X + 1.2, y: 0.4, z: 22 };
        camera.position.set(alvoCamera.x, alvoCamera.y, alvoCamera.z);

        const medir = () => {
          const r = el.getBoundingClientRect();
          renderer.setSize(r.width, r.height);
          camera.perspective({ aspect: r.width / Math.max(r.height, 1) });
        };
        medir();
        const ro = new ResizeObserver(medir);
        ro.observe(el);
        soltar.push(() => ro.disconnect());

        // ---- ponteiro: uma leitura por frame, projetada no plano da malha ----
        let ptrX = 0;
        let ptrY = 0;
        let ptrForca = 0;
        let ptrPendente = false;
        let ptrCru = { x: 0, y: 0 };

        const aoMover = (evento: PointerEvent) => {
          const r = el.getBoundingClientRect();
          ptrCru = {
            x: ((evento.clientX - r.left) / r.width) * 2 - 1,
            y: -(((evento.clientY - r.top) / r.height) * 2 - 1),
          };
          ptrPendente = true;
        };
        const aoSair = () => { ptrPendente = true; ptrCru = { x: 0, y: 0 }; ptrForca = 0; };
        window.addEventListener("pointermove", aoMover, { passive: true });
        window.addEventListener("pointerleave", aoSair, { passive: true });
        soltar.push(() => {
          window.removeEventListener("pointermove", aoMover);
          window.removeEventListener("pointerleave", aoSair);
        });

        // ---- laço ----
        let raf = 0;
        let rodando = false;
        let inicio = performance.now();
        let montagemAlvo = 0;
        let camAlvo = { ...alvoCamera };

        const quadro = () => {
          if (!vale()) { rodando = false; return; }
          const t = (performance.now() - inicio) / 1000;

          if (ptrPendente) {
            ptrPendente = false;
            // sem projetar no plano da malha o empurrão acontece longe do olho
            const alc = camera.position.z * 0.42;
            ptrX = ptrCru.x * alc + camera.position.x * 0.35;
            ptrY = ptrCru.y * alc * 0.62;
            ptrForca = ptrCru.x === 0 && ptrCru.y === 0 ? 0 : 1.15;
          }

          programa.uniforms.uT.value = t;
          // a suavização existe só para o trecho dirigido por scrub; alta
          // demais, ela atrasava o fim da montagem em mais de um segundo
          programa.uniforms.uMontagem.value +=
            (montagemAlvo - programa.uniforms.uMontagem.value) * 0.2;
          programa.uniforms.uPtr.value = [ptrX, ptrY, ptrForca];

          // órbita lenta: sem paralaxe, 3D parece imagem parada
          const orbitaX = Math.sin(t * 0.055) * 2.4;
          const orbitaY = Math.sin(t * 0.055) * 1.1;
          const orbitaZ = Math.cos(t * 0.055) * 1.8;
          camera.position.x += (camAlvo.x + orbitaX - camera.position.x) * 0.05;
          camera.position.y += (camAlvo.y + orbitaY - camera.position.y) * 0.05;
          camera.position.z += (camAlvo.z + orbitaZ - camera.position.z) * 0.05;
          camera.lookAt([DESLOCAMENTO_X, 0, 0]);
          programa.uniforms.uCam.value = [
            camera.position.x,
            camera.position.y,
            camera.position.z,
          ];

          renderer.render({ scene: cena, camera });
          raf = requestAnimationFrame(quadro);
        };
        const ligar = () => { if (!rodando) { rodando = true; inicio = performance.now() - 1000; quadro(); } };
        const desligar = () => { rodando = false; cancelAnimationFrame(raf); };
        soltar.push(desligar);

        const aoTrocarAba = () => (document.hidden ? desligar() : ligar());
        document.addEventListener("visibilitychange", aoTrocarAba);
        soltar.push(() => document.removeEventListener("visibilitychange", aoTrocarAba));

        const aoPerder = (evento: Event) => {
          evento.preventDefault();
          contextoPerdido = true;
          desligar();
          el.setAttribute("data-pronto", "false");
        };
        canvas.addEventListener("webglcontextlost", aoPerder);
        soltar.push(() => canvas.removeEventListener("webglcontextlost", aoPerder));

        limpar = () => {
          soltar.forEach((f) => f());
          const perder = gl.getExtension("WEBGL_lose_context");
          canvas.remove();
          perder?.loseContext();
        };

        if (controle) {
          controle.current = {
            montagem: (valor) => { montagemAlvo = Math.min(Math.max(valor, 0), 1); },
            camera: (x, y, z) => { camAlvo = { x, y, z }; },
          };
        }

        el.setAttribute("data-pronto", "true");
        ligar();
      } catch {
        // sem WebGL a camada de pôster do CSS continua servindo de fundo
      }
    };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel && consulta.matches) montar();
        else destruir();
      },
      { rootMargin: "10%" }
    );
    observador.observe(el);

    const aoMudarConsulta = () => { if (consulta.matches && visivel) montar(); else destruir(); };
    consulta.addEventListener("change", aoMudarConsulta);

    return () => {
      descartado = true;
      observador.disconnect();
      consulta.removeEventListener("change", aoMudarConsulta);
      destruir();
    };
  }, [controle]);

  return <div ref={host} className={styles.estrutura3d} data-pronto="false" aria-hidden />;
}
