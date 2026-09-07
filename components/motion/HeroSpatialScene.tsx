"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "../viveci.module.css";

type Parada = { id:string; fala:string; lado:"esquerda"|"direita"; altura:number; giro:number };

const PARADAS:Parada[]=[
  {id:"servicos",fala:"Sites, visibilidade, sistemas e suporte. Quatro frentes para fortalecer sua presença digital.",lado:"direita",altura:.5,giro:-.42},
  {id:"projetos",fala:"Aqui você explora experiências criadas para diferentes negócios e objetivos.",lado:"esquerda",altura:.53,giro:.48},
  {id:"processo",fala:"Conversa, modelo, avaliação, valor e publicação. Você acompanha cada etapa.",lado:"direita",altura:.49,giro:-.5},
  {id:"tecnologia",fala:"Interface, aplicação e dados trabalham juntos em uma experiência integrada.",lado:"esquerda",altura:.52,giro:.44},
  {id:"duvidas",fala:"Modelo, preço, domínio e próximos passos: tudo explicado sem complicação.",lado:"direita",altura:.5,giro:-.4},
  {id:"contato",fala:"Conte o essencial sobre seu negócio. A conversa continua diretamente pelo WhatsApp.",lado:"esquerda",altura:.5,giro:.46},
];

function criarRobo(){
  const robo=new THREE.Group();
  const cabeca=new THREE.Group();
  cabeca.position.y=1.28;
  robo.add(cabeca);

  const metal=new THREE.MeshPhysicalMaterial({color:0x02060d,metalness:.88,roughness:.25,clearcoat:1,clearcoatRoughness:.13,envMapIntensity:.38});
  const metalAzulado=new THREE.MeshPhysicalMaterial({color:0x061327,metalness:.84,roughness:.27,clearcoat:1,clearcoatRoughness:.14,envMapIntensity:.42});
  const vidro=new THREE.MeshPhysicalMaterial({color:0x000103,metalness:.08,roughness:.16,clearcoat:1,clearcoatRoughness:.035,reflectivity:.7,envMapIntensity:.14});
  const emissivo=new THREE.MeshStandardMaterial({color:0x168cff,emissive:0x168cff,emissiveIntensity:4.2,metalness:.45,roughness:.18,toneMapped:false});
  const emissivoSuave=new THREE.MeshStandardMaterial({color:0x0b5fc9,emissive:0x0a67dc,emissiveIntensity:2.1,metalness:.55,roughness:.22});
  const malha=(geometria:THREE.BufferGeometry,material:THREE.Material,pai:THREE.Group=robo)=>{const item=new THREE.Mesh(geometria,material);pai.add(item);return item};

  const casco=malha(new THREE.SphereGeometry(1,48,36),metalAzulado,cabeca);
  casco.scale.set(.82,1.14,.78);casco.rotation.x=-.06;
  const formaVisor=new THREE.Shape();
  formaVisor.moveTo(-.6,.82);formaVisor.lineTo(.46,.8);formaVisor.quadraticCurveTo(.68,.62,.67,.3);formaVisor.lineTo(.59,-.48);formaVisor.quadraticCurveTo(.37,-.76,.06,-.9);formaVisor.lineTo(-.46,-.63);formaVisor.quadraticCurveTo(-.7,-.28,-.72,.18);formaVisor.quadraticCurveTo(-.7,.6,-.6,.82);
  const geometriaVisor=new THREE.ExtrudeGeometry(formaVisor,{depth:.19,steps:1,bevelEnabled:true,bevelSegments:5,bevelSize:.075,bevelThickness:.07,curveSegments:28});
  const visor=malha(geometriaVisor,vidro,cabeca);visor.position.set(-.03,.01,.58);visor.rotation.x=-.035;
  const testa=malha(new THREE.TorusGeometry(.72,.035,12,56,Math.PI*.92),metal,cabeca);
  testa.position.set(-.03,.47,.66);testa.rotation.z=Math.PI*1.04;testa.rotation.x=.1;

  [-1,1].forEach((lado)=>{
    const ouvido=new THREE.Group();ouvido.position.set(lado*.87,.03,.03);ouvido.rotation.z=Math.PI/2;cabeca.add(ouvido);
    malha(new THREE.CylinderGeometry(.34,.38,.18,40),metal,ouvido);
    const aro=malha(new THREE.TorusGeometry(.27,.045,14,44),emissivo,ouvido);aro.rotation.x=Math.PI/2;aro.position.y=lado*.105;
    const miolo=malha(new THREE.CylinderGeometry(.19,.22,.21,40),metalAzulado,ouvido);miolo.position.y=lado*.02;
    const nucleo=malha(new THREE.CylinderGeometry(.08,.1,.225,32),emissivoSuave,ouvido);nucleo.position.y=lado*.025;
  });

  const halo=malha(new THREE.TorusGeometry(1.43,.025,12,96),emissivoSuave);halo.position.set(0,1.32,-.72);
  const haloInterno=malha(new THREE.TorusGeometry(1.28,.009,8,96),emissivo);haloInterno.position.copy(halo.position);
  for(let i=0;i<6;i++){const anel=malha(new THREE.CylinderGeometry(.34-i*.018,.38-i*.018,.1,32),i%2?metalAzulado:metal);anel.position.y=.28-i*.12}
  const nucleoPescoco=malha(new THREE.CylinderGeometry(.25,.32,.72,32),metalAzulado);nucleoPescoco.position.y=-.02;

  const torso=malha(new THREE.SphereGeometry(1,48,32),metal);torso.position.set(0,-.82,-.02);torso.scale.set(1.43,.9,.75);
  const peitoral=malha(new THREE.SphereGeometry(1,48,32),metalAzulado);peitoral.position.set(0,-.67,.43);peitoral.scale.set(1.02,.62,.34);
  [-1,1].forEach((lado)=>{
    const ombro=malha(new THREE.SphereGeometry(1,36,28),metal);ombro.position.set(lado*1.28,-.67,-.02);ombro.scale.set(.62,.59,.67);
    const aroOmbro=malha(new THREE.TorusGeometry(.43,.035,12,48,Math.PI*1.1),emissivoSuave);aroOmbro.position.set(lado*1.3,-.63,.48);aroOmbro.rotation.z=lado>0?-.95:.95;
    const clavicula=malha(new THREE.BoxGeometry(.72,.12,.12),metalAzulado);clavicula.position.set(lado*.62,-.38,.67);clavicula.rotation.z=lado*.26;clavicula.rotation.y=lado*.06;
  });
  const placaCentral=malha(new THREE.ConeGeometry(.38,.88,4),metalAzulado);placaCentral.position.set(0,-.72,.76);placaCentral.rotation.z=Math.PI/4;placaCentral.scale.set(.72,1,.22);
  [-1,1].forEach((lado)=>{const luzPeito=malha(new THREE.BoxGeometry(.055,.52,.045),emissivo);luzPeito.position.set(lado*.39,-.72,.82);luzPeito.rotation.z=lado*.2});
  const gola=malha(new THREE.TorusGeometry(.43,.09,18,52),metalAzulado);gola.position.y=.18;gola.rotation.x=Math.PI/2;
  robo.scale.setScalar(1.05);robo.rotation.x=.04;
  return {robo,cabeca,emissivo,emissivoSuave};
}

/** Reconstrução volumétrica do android VVC, renderizada em tempo real. */
export function HeroSpatialScene(){
  const raiz=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),balao=useRef<HTMLDivElement>(null),texto=useRef<HTMLParagraphElement>(null);
  const portalPronto=useSyncExternalStore(()=>()=>{},()=>true,()=>false);

  useEffect(()=>{
    const host=raiz.current,palco=viewport.current,card=balao.current,mensagem=texto.current;
    if(!portalPronto||!host||!palco||!card||!mensagem)return;
    const reduzir=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(reduzir.matches){host.hidden=true;return}

    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:window.innerWidth>700,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<800?1:1.4));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    renderer.domElement.setAttribute("aria-hidden","true");renderer.domElement.dataset.robot3d="true";palco.appendChild(renderer.domElement);
    const cena=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(31,1,.1,30);camera.position.set(0,.24,9.15);camera.lookAt(0,.05,0);
    const pmrem=new THREE.PMREMGenerator(renderer),ambiente=pmrem.fromScene(new RoomEnvironment(),.035).texture;cena.environment=ambiente;cena.environmentIntensity=.46;
    cena.add(new THREE.HemisphereLight(0xc6dcff,0x01040a,1.7));
    const chave=new THREE.DirectionalLight(0xf0f6ff,3.2);chave.position.set(-3.5,5,5);cena.add(chave);
    const frontal=new THREE.PointLight(0xd8e7ff,22,14,1.65);frontal.position.set(-.8,1.8,5.8);cena.add(frontal);
    const recorte=new THREE.PointLight(0x168cff,38,12,2);recorte.position.set(3,1.8,3.2);cena.add(recorte);
    const recorteOposto=new THREE.PointLight(0x0a5ee9,22,10,2);recorteOposto.position.set(-3,-1,2);cena.add(recorteOposto);
    const {robo,cabeca,emissivo,emissivoSuave}=criarRobo();cena.add(robo);
    const triggers:ReturnType<typeof ScrollTrigger.create>[]=[];
    let ativa=-1,alvoGiro=0,giroOrganico=0,proximoGiro=0,frame=0,visivel=true,ultimo=performance.now();

    const ajustar=()=>{const largura=Math.max(1,palco.clientWidth),altura=Math.max(1,palco.clientHeight);renderer.setSize(largura,altura,false);camera.aspect=largura/altura;camera.updateProjectionMatrix()};
    const posicionar=(parada:Parada,index:number,imediato=false)=>{
      if(ativa===index&&!imediato)return;ativa=index;alvoGiro=parada.giro;host.dataset.lado=parada.lado;mensagem.textContent=parada.fala;
      const margem=Math.max(14,window.innerWidth*.018),x=parada.lado==="esquerda"?margem:window.innerWidth-host.offsetWidth-margem;
      const y=Math.max(80,Math.min(window.innerHeight-host.offsetHeight-24,window.innerHeight*parada.altura)),duracao=imediato?0:1.05;
      gsap.timeline({defaults:{overwrite:"auto"}}).to(card,{autoAlpha:0,y:10,duration:imediato?0:.16,ease:"power2.in"},0).to(host,{autoAlpha:1,x,y,scale:1,duration:duracao,ease:"power4.out"},0).fromTo(card,{autoAlpha:0,y:13,scale:.96},{autoAlpha:1,y:0,scale:1,duration:imediato?0:.48,ease:"back.out(1.35)"},imediato?0:.68);
    };
    gsap.set(host,{autoAlpha:0,x:window.innerWidth+80,y:window.innerHeight*.55});gsap.set(card,{autoAlpha:0,y:12});
    PARADAS.forEach((parada,index)=>{const secao=document.getElementById(parada.id);if(!secao)return;triggers.push(ScrollTrigger.create({trigger:secao,start:"top 62%",end:"bottom 38%",onEnter:()=>posicionar(parada,index),onEnterBack:()=>posicionar(parada,index),onLeave:()=>index===PARADAS.length-1&&gsap.to(host,{autoAlpha:0,y:window.innerHeight,duration:.55,ease:"power3.in",overwrite:true}),onLeaveBack:()=>index===0&&gsap.to(host,{autoAlpha:0,x:window.innerWidth+60,duration:.55,ease:"power3.in",overwrite:true}),invalidateOnRefresh:true}))});

    const desenhar=(agora:number)=>{frame=requestAnimationFrame(desenhar);if(!visivel)return;const delta=Math.min(.05,(agora-ultimo)/1000);ultimo=agora;const tempo=agora/1000;if(tempo>proximoGiro){giroOrganico=(Math.random()-.5)*.38;proximoGiro=tempo+2.6+Math.random()*2.8}const giroDesejado=alvoGiro+giroOrganico+Math.sin(tempo*.63)*.09;robo.rotation.y+=(giroDesejado-robo.rotation.y)*Math.min(1,delta*1.7);robo.rotation.z=Math.sin(tempo*.74)*.025;robo.position.y=Math.sin(tempo*.9)*.055;cabeca.rotation.y=Math.sin(tempo*.47)*.12;cabeca.rotation.x=Math.sin(tempo*.61)*.035;emissivo.emissiveIntensity=3.5+Math.sin(tempo*2.1)*.75;emissivoSuave.emissiveIntensity=1.8+Math.sin(tempo*1.45)*.42;renderer.render(cena,camera)};
    const observador=new ResizeObserver(ajustar);observador.observe(palco);ajustar();frame=requestAnimationFrame(desenhar);
    const redimensionar=()=>{renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<800?1:1.4));if(ativa>=0)posicionar(PARADAS[ativa],ativa,true)};
    const mudarVisibilidade=()=>{visivel=!document.hidden&&!reduzir.matches;if(visivel)ultimo=performance.now()};
    const mudarReducao=()=>{host.hidden=reduzir.matches;visivel=!reduzir.matches&&!document.hidden;if(visivel)ultimo=performance.now()};
    window.addEventListener("resize",redimensionar,{passive:true});document.addEventListener("visibilitychange",mudarVisibilidade);reduzir.addEventListener("change",mudarReducao);
    return()=>{cancelAnimationFrame(frame);triggers.forEach((trigger)=>trigger.kill());observador.disconnect();window.removeEventListener("resize",redimensionar);document.removeEventListener("visibilitychange",mudarVisibilidade);reduzir.removeEventListener("change",mudarReducao);gsap.killTweensOf([host,card]);cena.traverse((objeto)=>{if(!(objeto instanceof THREE.Mesh))return;objeto.geometry.dispose();const materiais=Array.isArray(objeto.material)?objeto.material:[objeto.material];materiais.forEach((material)=>material.dispose())});ambiente.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()};
  },[portalPronto]);

  if(!portalPronto)return null;
  return createPortal(<aside ref={raiz} className={styles.robotNarrator} aria-label="Guia 3D da página" data-lado="direita"><div ref={viewport} className={styles.robotViewport}/><div ref={balao} className={styles.robotSpeech} role="status" aria-live="polite"><span>VVC / GUIA 3D</span><p ref={texto}>{PARADAS[0].fala}</p></div></aside>,document.body);
}
