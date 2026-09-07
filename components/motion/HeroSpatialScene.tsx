"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "../viveci.module.css";

type Parada = { id:string; fala:string; lado:"esquerda"|"direita"; altura:number; inclinacao:number };

/** Falas resumem somente o conteúdo já publicado em cada seção. */
const PARADAS:Parada[]=[
  {id:"servicos",fala:"Sites, visibilidade, sistemas e suporte. Quatro frentes para fortalecer sua presença digital.",lado:"direita",altura:.5,inclinacao:-5},
  {id:"projetos",fala:"Aqui você explora experiências criadas para diferentes negócios e objetivos.",lado:"esquerda",altura:.53,inclinacao:5},
  {id:"processo",fala:"Conversa, modelo, avaliação, valor e publicação. Você acompanha cada etapa.",lado:"direita",altura:.49,inclinacao:-4},
  {id:"tecnologia",fala:"Interface, aplicação e dados trabalham juntos em uma experiência integrada.",lado:"esquerda",altura:.52,inclinacao:5},
  {id:"duvidas",fala:"Modelo, preço, domínio e próximos passos: tudo explicado sem complicação.",lado:"direita",altura:.5,inclinacao:-4},
  {id:"contato",fala:"Conte o essencial sobre seu negócio. A conversa continua diretamente pelo WhatsApp.",lado:"esquerda",altura:.5,inclinacao:4},
];

/** O mesmo android do herói vira um personagem 2.5D recorrente e orgânico. */
export function HeroSpatialScene(){
  const raiz=useRef<HTMLElement>(null),avatar=useRef<HTMLDivElement>(null),plano=useRef<HTMLDivElement>(null),balao=useRef<HTMLDivElement>(null),texto=useRef<HTMLParagraphElement>(null);
  const portalPronto=useSyncExternalStore(()=>()=>{},()=>true,()=>false);

  useGSAP(()=>{
    const host=raiz.current,personagem=avatar.current,imagem=plano.current,card=balao.current,mensagem=texto.current;
    if(!portalPronto||!host||!personagem||!imagem||!card||!mensagem)return;
    const mm=gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)",()=>{
      let ativa=-1;
      const triggers:ReturnType<typeof ScrollTrigger.create>[]=[];
      gsap.set(host,{autoAlpha:0,x:window.innerWidth+80,y:window.innerHeight*.55});
      gsap.set(personagem,{transformPerspective:1100,transformStyle:"preserve-3d",transformOrigin:"50% 65%"});
      gsap.set(card,{autoAlpha:0,y:12});
      const flutuar=gsap.to(imagem,{y:-9,duration:2.8,ease:"sine.inOut",repeat:-1,yoyo:true});
      const observar=gsap.to(imagem,{rotationX:"random(-2.2,2.2)",rotationY:"random(-5,5)",rotationZ:"random(-1.2,1.2)",duration:"random(2.6,4.1)",ease:"sine.inOut",repeat:-1,yoyo:true,repeatRefresh:true});

      const posicionar=(parada:Parada,index:number,imediato=false)=>{
        if(ativa===index&&!imediato)return;
        ativa=index;host.dataset.lado=parada.lado;mensagem.textContent=parada.fala;
        const margem=Math.max(14,window.innerWidth*.018),x=parada.lado==="esquerda"?margem:window.innerWidth-host.offsetWidth-margem;
        const y=Math.max(76,Math.min(window.innerHeight-host.offsetHeight-26,window.innerHeight*parada.altura));
        const duracao=imediato?0:1.05;
        gsap.timeline({defaults:{overwrite:"auto"}})
          .to(card,{autoAlpha:0,y:10,duration:imediato?0:.16,ease:"power2.in"},0)
          .to(host,{autoAlpha:1,x,y,scale:1,duration:duracao,ease:"power4.out"},0)
          .to(personagem,{rotationY:parada.inclinacao,rotationZ:parada.lado==="esquerda"?1.2:-1.2,duration:duracao,ease:"power4.out"},0)
          .fromTo(card,{autoAlpha:0,y:13,scale:.96},{autoAlpha:1,y:0,scale:1,duration:imediato?0:.48,ease:"back.out(1.35)"},imediato?0:.68);
      };

      PARADAS.forEach((parada,index)=>{
        const secao=document.getElementById(parada.id);if(!secao)return;
        triggers.push(ScrollTrigger.create({trigger:secao,start:"top 62%",end:"bottom 38%",onEnter:()=>posicionar(parada,index),onEnterBack:()=>posicionar(parada,index),onLeave:()=>index===PARADAS.length-1&&gsap.to(host,{autoAlpha:0,y:window.innerHeight,duration:.55,ease:"power3.in",overwrite:true}),onLeaveBack:()=>index===0&&gsap.to(host,{autoAlpha:0,x:window.innerWidth+60,duration:.55,ease:"power3.in",overwrite:true}),invalidateOnRefresh:true}));
      });
      const redimensionar=()=>{if(ativa>=0)posicionar(PARADAS[ativa],ativa,true)};
      window.addEventListener("resize",redimensionar,{passive:true});
      return()=>{window.removeEventListener("resize",redimensionar);triggers.forEach((trigger)=>trigger.kill());flutuar.kill();observar.kill()};
    });
    return()=>mm.revert();
  },{scope:raiz,dependencies:[portalPronto]});

  useEffect(()=>{
    if(!portalPronto)return;
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizar=()=>{if(raiz.current)raiz.current.hidden=media.matches};
    atualizar();media.addEventListener("change",atualizar);return()=>media.removeEventListener("change",atualizar);
  },[portalPronto]);

  if(!portalPronto)return null;
  return createPortal(<aside ref={raiz} className={styles.robotNarrator} aria-label="Guia da página" data-lado="direita">
    <div ref={avatar} className={styles.robotNarratorAvatar} aria-hidden="true"><div ref={plano} className={styles.robotNarratorPlane}><Image src="/images/vvc-android-hero-blue.png" fill sizes="(max-width: 800px) 140px, 300px" alt="" loading="lazy" decoding="async"/></div></div>
    <div ref={balao} className={styles.robotSpeech} role="status" aria-live="polite"><span>VVC / GUIA</span><p ref={texto}>{PARADAS[0].fala}</p></div>
  </aside>,document.body);
}
