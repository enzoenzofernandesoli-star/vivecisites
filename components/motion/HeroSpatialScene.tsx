"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ScrollTrigger } from "@/lib/gsap";
import styles from "../viveci.module.css";

const MODELO = "/models/robot-expressive.glb";
const MEDIA_3D = "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

type PontoRota = { em:number; x:number; y:number; z:number; escala:number; giro:number; opacidade:number };

const ROTA: PontoRota[] = [
  { em:0, x:3.25, y:-1.5, z:-1, escala:.4, giro:.24, opacidade:0 },
  { em:.07, x:3.25, y:-1.5, z:-1, escala:.4, giro:.24, opacidade:0 },
  { em:.13, x:3.12, y:-1.48, z:-.8, escala:.44, giro:-.46, opacidade:.78 },
  { em:.28, x:-3.12, y:-1.52, z:-1.15, escala:.42, giro:.54, opacidade:.62 },
  { em:.46, x:3.08, y:-1.5, z:-.72, escala:.44, giro:-.42, opacidade:.7 },
  { em:.64, x:-3.18, y:-1.54, z:-1.2, escala:.4, giro:.62, opacidade:.54 },
  { em:.79, x:3.18, y:-1.5, z:-1, escala:.42, giro:-.52, opacidade:.46 },
  { em:.9, x:3.35, y:-1.54, z:-2, escala:.36, giro:-.78, opacidade:0 },
  { em:1, x:3.35, y:-1.54, z:-2, escala:.36, giro:-.78, opacidade:0 },
];

function interpolarRota(progresso:number) {
  const p=Math.max(0,Math.min(1,progresso));
  const fim=ROTA.findIndex((ponto)=>ponto.em>=p);
  if(fim<=0)return {...ROTA[0]};
  const a=ROTA[fim-1],b=ROTA[fim];
  const t=(p-a.em)/Math.max(.0001,b.em-a.em);
  const suave=t*t*(3-2*t);
  return {em:p,x:a.x+(b.x-a.x)*suave,y:a.y+(b.y-a.y)*suave,z:a.z+(b.z-a.z)*suave,escala:a.escala+(b.escala-a.escala)*suave,giro:a.giro+(b.giro-a.giro)*suave,opacidade:a.opacidade+(b.opacidade-a.opacidade)*suave};
}

/** Robô GLB real ligado ao scroll. Fonte e licença: public/models/ATTRIBUTION.md. */
export function HeroSpatialScene(){
  const host=useRef<HTMLDivElement>(null);
  const portalPronto=useSyncExternalStore(()=>()=>{},()=>true,()=>false);

  useEffect(()=>{
    const raiz=host.current;
    if(!portalPronto||!raiz)return;
    const media=window.matchMedia(MEDIA_3D);
    let desmontarCena:(()=>void)|undefined;
    let geracao=0;

    const montar=async()=>{
      if(!media.matches||desmontarCena)return;
      const id=++geracao;
      const [THREE,{GLTFLoader},{RoomEnvironment}]=await Promise.all([import("three"),import("three/examples/jsm/loaders/GLTFLoader.js"),import("three/examples/jsm/environments/RoomEnvironment.js")]);
      if(id!==geracao||!media.matches||!raiz.isConnected)return;

      const canvas=document.createElement("canvas");
      canvas.setAttribute("aria-hidden","true");
      canvas.dataset.robotCanvas="true";
      raiz.appendChild(canvas);
      const renderizador=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
      renderizador.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderizador.outputColorSpace=THREE.SRGBColorSpace;
      renderizador.toneMapping=THREE.ACESFilmicToneMapping;
      renderizador.toneMappingExposure=1.12;

      const cena=new THREE.Scene();
      cena.fog=new THREE.FogExp2(0x020814,.075);
      const geradorAmbiente=new THREE.PMREMGenerator(renderizador);
      const texturaAmbiente=geradorAmbiente.fromScene(new RoomEnvironment(),.04).texture;
      cena.environment=texturaAmbiente;
      const camera=new THREE.PerspectiveCamera(32,1,.1,40);
      camera.position.set(0,1.15,7.1);
      const mundo=new THREE.Group(),robo=new THREE.Group();
      mundo.add(robo);cena.add(mundo);

      cena.add(new THREE.HemisphereLight(0x9bcaff,0x02040b,1.65));
      const recorte=new THREE.DirectionalLight(0x2b8cff,5.2);recorte.position.set(4,4.5,4);cena.add(recorte);
      const preenchimento=new THREE.PointLight(0xeaf6ff,18,11,2);preenchimento.position.set(-3.5,2.4,3.4);cena.add(preenchimento);

      const materialCorpo=new THREE.MeshPhysicalMaterial({color:0x07111f,metalness:.84,roughness:.22,clearcoat:.9,clearcoatRoughness:.16});
      const materialPlacas=new THREE.MeshPhysicalMaterial({color:0x102b52,metalness:.72,roughness:.2,clearcoat:1,clearcoatRoughness:.1,emissive:0x061b42,emissiveIntensity:.8});
      const materialLuz=new THREE.MeshStandardMaterial({color:0x07101d,metalness:.75,roughness:.18,emissive:0x168cff,emissiveIntensity:2.7});

      const corredor=new THREE.Group();
      const vertices:number[]=[];
      for(let i=0;i<11;i++){
        const z=1.5-i*1.45,largura=5.8+i*.42,altura=3.2+i*.22,x=largura/2,y0=-1.8,y1=y0+altura;
        vertices.push(-x,y0,z,-x,y1,z,-x,y1,z,x,y1,z,x,y1,z,x,y0,z);
      }
      const geoCorredor=new THREE.BufferGeometry();geoCorredor.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
      const matCorredor=new THREE.LineBasicMaterial({color:0x1565c7,transparent:true,opacity:.12});
      corredor.add(new THREE.LineSegments(geoCorredor,matCorredor));corredor.position.z=-1;cena.add(corredor);

      const quantidade=190,poeira=new Float32Array(quantidade*3);let semente=20260907;
      const aleatorio=()=>{semente=(semente*1664525+1013904223)>>>0;return semente/4294967296};
      for(let i=0;i<quantidade;i++){poeira[i*3]=(aleatorio()-.5)*13;poeira[i*3+1]=(aleatorio()-.5)*7;poeira[i*3+2]=aleatorio()*-15+3}
      const geoPoeira=new THREE.BufferGeometry();geoPoeira.setAttribute("position",new THREE.BufferAttribute(poeira,3));
      const matPoeira=new THREE.PointsMaterial({color:0x65b5ff,size:.022,transparent:true,opacity:.48,depthWrite:false});
      const pontos=new THREE.Points(geoPoeira,matPoeira);cena.add(pontos);

      let mixer:InstanceType<typeof THREE.AnimationMixer>|undefined,duracaoPasso=1,carregado=false,alvo=0,atual=0,frame=0,ultimo=performance.now(),documentoVisivel=!document.hidden;
      new GLTFLoader().load(MODELO,(gltf)=>{
        if(id!==geracao)return;
        const modelo=gltf.scene;
        modelo.traverse((objeto)=>{
          if(!(objeto instanceof THREE.Mesh))return;
          const nome=objeto.material?.name?.toLowerCase()??"";
          objeto.material=nome.includes("black")?materialLuz:nome.includes("main")?materialPlacas:materialCorpo;
          objeto.castShadow=false;objeto.receiveShadow=false;
        });
        modelo.updateMatrixWorld(true);
        const caixa=new THREE.Box3().setFromObject(modelo),tamanho=new THREE.Vector3(),centro=new THREE.Vector3();
        caixa.getSize(tamanho);caixa.getCenter(centro);
        const escalaBase=3.55/Math.max(.001,tamanho.y);
        modelo.scale.setScalar(escalaBase);
        modelo.position.set(-centro.x*escalaBase,-caixa.min.y*escalaBase,-centro.z*escalaBase);
        robo.add(modelo);
        mixer=new THREE.AnimationMixer(modelo);
        const caminhada=gltf.animations.find((clip)=>clip.name==="Walking")??gltf.animations[0];
        if(caminhada){duracaoPasso=caminhada.duration;mixer.clipAction(caminhada).play()}
        carregado=true;raiz.dataset.pronto="true";
      },undefined,()=>{raiz.dataset.falhou="true"});

      const ajustar=()=>{const largura=window.innerWidth,altura=window.innerHeight;renderizador.setSize(largura,altura,false);renderizador.setPixelRatio(Math.min(window.devicePixelRatio,largura<1200?1.25:1.5));camera.aspect=largura/Math.max(1,altura);camera.updateProjectionMatrix()};
      const trigger=ScrollTrigger.create({trigger:document.querySelector("main")??document.body,start:"top top",end:"bottom bottom",onUpdate:(self)=>{alvo=self.progress},invalidateOnRefresh:true});
      alvo=trigger.progress;atual=alvo;

      const desenhar=(agora:number)=>{
        frame=0;
        if(!media.matches){desmontarCena?.();return}
        if(!documentoVisivel)return;
        const delta=Math.min(.05,(agora-ultimo)/1000);ultimo=agora;atual+=(alvo-atual)*Math.min(1,delta*5.8);
        const rota=interpolarRota(atual);
        robo.position.set(rota.x,rota.y,rota.z);robo.rotation.y=rota.giro;robo.rotation.z=Math.sin(atual*Math.PI*7)*.035;robo.scale.setScalar(rota.escala);
        mixer?.setTime(atual*duracaoPasso*8);
        mundo.rotation.y=(atual-.5)*.16;corredor.position.x=Math.sin(atual*Math.PI*4)*.32;corredor.position.z=-1+atual*2.7;pontos.position.z=(atual*7)%3;
        matCorredor.opacity=rota.opacidade*.12;matPoeira.opacity=rota.opacidade*.48;raiz.style.opacity=String(rota.opacidade);
        if(carregado||rota.opacidade>.01)renderizador.render(cena,camera);
        frame=requestAnimationFrame(desenhar);
      };
      const iniciar=()=>{if(frame||!documentoVisivel||!media.matches)return;ultimo=performance.now();frame=requestAnimationFrame(desenhar)};
      const parar=()=>{if(frame)cancelAnimationFrame(frame);frame=0};
      const visibilidade=()=>{documentoVisivel=!document.hidden;if(documentoVisivel)iniciar();else parar()};
      const observadorTamanho=new ResizeObserver(ajustar);observadorTamanho.observe(document.documentElement);document.addEventListener("visibilitychange",visibilidade);ajustar();iniciar();

      desmontarCena=()=>{
        geracao++;parar();trigger.kill();observadorTamanho.disconnect();document.removeEventListener("visibilitychange",visibilidade);raiz.removeAttribute("data-pronto");raiz.style.opacity="";
        cena.traverse((objeto)=>{if(!(objeto instanceof THREE.Mesh||objeto instanceof THREE.LineSegments||objeto instanceof THREE.Points))return;objeto.geometry.dispose();const materiais=Array.isArray(objeto.material)?objeto.material:[objeto.material];materiais.forEach((material)=>material.dispose())});
        mixer?.stopAllAction();texturaAmbiente.dispose();geradorAmbiente.dispose();renderizador.dispose();renderizador.forceContextLoss();canvas.remove();desmontarCena=undefined;
      };
    };
    const atualizar=()=>{if(media.matches)void montar();else desmontarCena?.()};
    media.addEventListener("change",atualizar);atualizar();return()=>{geracao++;media.removeEventListener("change",atualizar);desmontarCena?.()};
  },[portalPronto]);

  if(!portalPronto)return null;
  return createPortal(<div ref={host} className={styles.heroSpatialScene} aria-hidden/>,document.body);
}
