"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "../viveci.module.css";

const vertex = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}
`;
const fragment = `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uTime;
varying vec2 vUv;
void main(){
  vec2 delta=vUv-uMouse;
  float distanceToPointer=length(delta);
  float envelope=1.0-smoothstep(0.0,0.48,distanceToPointer);
  float wave=sin(distanceToPointer*28.0-uTime*3.2);
  vec2 refraction=normalize(delta+vec2(0.0001))*wave*envelope*uStrength*0.009;
  vec2 uv=clamp((vUv+refraction)*uScale+uOffset,vec2(0.001),vec2(0.999));
  gl_FragColor=texture2D(tMap,uv);
}
`;

/** Refração localizada: preserva o recorte da imagem e renderiza só enquanto assenta. */
export function DistortionImage({src,alt,sizes,objectPosition}:{
  src:string;alt:string;sizes:string;objectPosition?:string;
}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=host.current;
    if(!el)return;
    const query=window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let generation=0;
    let cleanup:(()=>void)|undefined;
    let visible=false;
    let disposed=false;
    const destroy=()=>{generation++;cleanup?.();cleanup=undefined;el.setAttribute("data-pronto","false");};
    const setup=async()=>{
      const token=++generation;
      let contextLost=false;
      const valid=()=>!disposed&&!contextLost&&token===generation&&visible&&query.matches;
      try{
        const {Renderer,Program,Mesh,Triangle,Texture}=await import("ogl");
        if(!valid())return;
        const img=new window.Image();
        img.src=el.querySelector("img")?.currentSrc||src;
        await img.decode();
        if(!valid())return;
        const renderer=new Renderer({dpr:Math.min(devicePixelRatio,1.5),alpha:true,antialias:false});
        const gl=renderer.gl;
        const canvas=gl.canvas as HTMLCanvasElement;
        const releases:(()=>void)[]=[];
        cleanup=()=>{releases.reverse().forEach(release=>release());canvas.remove();gl.getExtension("WEBGL_lose_context")?.loseContext();};
        canvas.className=styles.distortCanvas;
        canvas.setAttribute("aria-hidden","true");
        const texture=new Texture(gl,{image:img,generateMipmaps:false});
        releases.push(()=>gl.deleteTexture(texture.texture));
        const scale=[1,1],offset=[0,0],mouse=[.5,.5];
        const program=new Program(gl,{vertex,fragment,depthTest:false,depthWrite:false,uniforms:{
          tMap:{value:texture},uScale:{value:scale},uOffset:{value:offset},uMouse:{value:mouse},uStrength:{value:0},uTime:{value:0}
        }});
        releases.push(()=>program.remove());
        const geometry=new Triangle(gl);
        releases.push(()=>geometry.remove());
        const mesh=new Mesh(gl,{geometry,program});
        el.appendChild(canvas);
        let frame=0;
        let strength=0;
        let last=0;
        let hovered=false;
        let rect=el.getBoundingClientRect();
        const draw=(now:number)=>{
          frame=0;
          if(!valid()||document.hidden)return;
          const dt=Math.min(40,now-(last||now-16.67))/16.67;
          last=now;
          strength*=Math.pow(.93,dt);
          program.uniforms.uStrength.value=strength;
          program.uniforms.uTime.value=now*.001;
          renderer.render({scene:mesh});
          if(strength>.002)frame=requestAnimationFrame(draw);
        };
        const request=()=>{if(!frame&&!document.hidden&&valid())frame=requestAnimationFrame(draw);};
        const measure=()=>{
          rect=el.getBoundingClientRect();
          if(!rect.width||!rect.height)return;
          renderer.setSize(rect.width,rect.height);
          const ratio=(rect.width/rect.height)/(img.naturalWidth/img.naturalHeight);
          scale[0]=Math.min(1,ratio);scale[1]=Math.min(1,1/ratio);
          const top=objectPosition?.includes("top");
          offset[0]=(1-scale[0])/2;offset[1]=(1-scale[1])*(top?1:.5);
          request();
        };
        const enter=()=>{hovered=true;rect=el.getBoundingClientRect();strength=.65;el.setAttribute("data-pronto","true");request();};
        const move=(event:PointerEvent)=>{
          mouse[0]=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
          mouse[1]=1-Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
          strength=1;request();
        };
        const leave=()=>{hovered=false;el.setAttribute("data-pronto","false");strength=.15;request();};
        const visibility=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(document.hidden)el.setAttribute("data-pronto","false");else if(hovered){el.setAttribute("data-pronto","true");request();}};
        const lost=(event:Event)=>{event.preventDefault();contextLost=true;leave();cancelAnimationFrame(frame);frame=0;};
        const ro=new ResizeObserver(measure);
        releases.push(()=>{
          ro.disconnect();cancelAnimationFrame(frame);
          el.removeEventListener("pointerenter",enter);el.removeEventListener("pointermove",move);el.removeEventListener("pointerleave",leave);
          document.removeEventListener("visibilitychange",visibility);window.removeEventListener("blur",leave);canvas.removeEventListener("webglcontextlost",lost);
        });
        el.addEventListener("pointerenter",enter);el.addEventListener("pointermove",move);el.addEventListener("pointerleave",leave);
        document.addEventListener("visibilitychange",visibility);window.addEventListener("blur",leave);canvas.addEventListener("webglcontextlost",lost);
        ro.observe(el);measure();
        if(el.matches(":hover"))enter();
      }catch{if(token===generation)destroy();}
    };
    const sync=()=>{destroy();if(visible&&query.matches&&!document.hidden)void setup();};
    const resume=()=>{if(!document.hidden&&!cleanup)sync();};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});
    observer.observe(el);query.addEventListener("change",sync);
    document.addEventListener("visibilitychange",resume);
    return()=>{disposed=true;observer.disconnect();query.removeEventListener("change",sync);document.removeEventListener("visibilitychange",resume);destroy();};
  },[src,objectPosition]);
  return <div ref={host} className={styles.distortHost} data-pronto="false"><Image src={src} fill quality={100} sizes={sizes} alt={alt} style={{objectPosition}} draggable={false}/></div>;
}
