"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../viveci.module.css";

const VERT = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D tMap;
uniform sampler2D tDisp;
uniform float uProgress;
varying vec2 vUv;
void main() {
  vec4 disp = texture2D(tDisp, vUv);
  vec2 uv = vUv + (disp.rg - 0.5) * uProgress * 0.15;
  gl_FragColor = texture2D(tMap, uv);
}`;

/**
 * Thumb de projeto com distorção no hover, via OGL.
 *
 * Regras que este componente não quebra:
 * - `ogl` entra por import dinâmico: nunca no bundle inicial
 * - só em telas grandes e ponteiro fino
 * - o contexto WebGL só é criado quando o card entra na viewport, e é
 *   destruído ao sair — no carrossel há 12 cards e o navegador limita o
 *   número de contextos simultâneos
 * - se qualquer etapa falhar, a <Image> continua visível por baixo
 */
export function DistortionImage({
  src,
  alt,
  sizes,
  objectPosition,
}: {
  src: string;
  alt: string;
  sizes: string;
  objectPosition?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [canvasPronto, setCanvasPronto] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const apto =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!apto) return;

    let vivo = true;
    let desmontar: (() => void) | null = null;

    const montar = async () => {
      try {
        const { Renderer, Camera, Transform, Program, Mesh, Triangle, Texture } =
          await import("ogl");
        if (!vivo) return;

        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio, 2),
          alpha: true,
          antialias: false,
        });
        const gl = renderer.gl;
        // contexto perdido ou negado: cai para a <Image>
        if (!gl) return;

        gl.canvas.className = styles.distortCanvas;
        el.appendChild(gl.canvas);

        new Camera(gl);
        new Transform();

        const carregar = (url: string) => {
          const tex = new Texture(gl, { generateMipmaps: false });
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.src = url;
          img.onload = () => { tex.image = img; };
          return tex;
        };

        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            tMap: { value: carregar(src) },
            tDisp: { value: carregar("/images/displacement.png") },
            uProgress: { value: 0 },
          },
        });

        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

        const medir = () => {
          const r = el.getBoundingClientRect();
          renderer.setSize(r.width, r.height);
        };
        medir();
        const ro = new ResizeObserver(medir);
        ro.observe(el);

        let raf = 0;
        let rodando = false;
        const desenhar = () => {
          renderer.render({ scene: mesh });
          raf = requestAnimationFrame(desenhar);
        };
        const ligar = () => { if (!rodando) { rodando = true; desenhar(); } };
        const desligar = () => { rodando = false; cancelAnimationFrame(raf); };

        // fora da viewport o loop para; a destruicao do contexto fica a
        // cargo do gatilho externo
        const io = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? ligar() : desligar()),
          { rootMargin: "200px" }
        );
        io.observe(el);

        const { gsap } = await import("@/lib/gsap");
        if (!vivo) return;
        const alvo = program.uniforms.uProgress;
        const entrar = () => gsap.to(alvo, { value: 1, duration: 0.6, ease: "power2.out" });
        const sair = () => gsap.to(alvo, { value: 0, duration: 0.8, ease: "power2.out" });
        el.addEventListener("pointerenter", entrar);
        el.addEventListener("pointerleave", sair);

        setCanvasPronto(true);

        desmontar = () => {
          io.disconnect();
          ro.disconnect();
          desligar();
          el.removeEventListener("pointerenter", entrar);
          el.removeEventListener("pointerleave", sair);
          gsap.killTweensOf(alvo);
          gl.canvas.remove();
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
      } catch {
        // sem WebGL, sem OGL, sem shader: a <Image> segue no lugar
      }
    };

    /**
     * Monta ao aproximar e destrói ao afastar. Sem destruir, o carrossel de
     * 12 cards acumula 12 contextos WebGL vivos — o navegador permite ~16,
     * e cada um segura memória de GPU.
     *
     * A margem larga e o atraso na saída evitam ficar criando e destruindo
     * a cada micro-scroll.
     */
    let montado = false;
    let saida: ReturnType<typeof setTimeout> | null = null;

    const gatilho = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (saida) { clearTimeout(saida); saida = null; }
          if (!montado) { montado = true; montar(); }
        } else if (montado && !saida) {
          saida = setTimeout(() => {
            saida = null;
            montado = false;
            desmontar?.();
            desmontar = null;
            setCanvasPronto(false);
          }, 600);
        }
      },
      { rootMargin: "400px" }
    );
    gatilho.observe(el);

    return () => {
      vivo = false;
      if (saida) clearTimeout(saida);
      gatilho.disconnect();
      desmontar?.();
      setCanvasPronto(false);
    };
  }, [src]);

  return (
    <div ref={host} className={styles.distortHost} data-pronto={canvasPronto ? "true" : "false"}>
      <Image src={src} fill quality={100} sizes={sizes} alt={alt} style={{ objectPosition }} draggable={false} />
    </div>
  );
}
