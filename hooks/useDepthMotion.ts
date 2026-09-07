"use client";
import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/** Inclina o conteúdo interno, sem disputar os transforms do scroll. */
export function useDepthMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const root=scope.current;
    if(!root)return;
    const mm=gsap.matchMedia();
    mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",()=>{
      const disposers:(()=>void)[]=[];
      const surfaces=root.querySelectorAll<HTMLElement>("[data-depth]");
      surfaces.forEach((surface)=>{
        const target=surface.querySelector<HTMLElement>("[data-depth-plane]");
        if(!target)return;
        let box:DOMRect;
        gsap.set(target,{transformPerspective:1000,transformOrigin:"50% 50%"});
        const rx=gsap.quickTo(target,"rotationX",{duration:.55,ease:"power3.out"});
        const ry=gsap.quickTo(target,"rotationY",{duration:.55,ease:"power3.out"});
        const enter=()=>{box=surface.getBoundingClientRect();};
        const move=(event:PointerEvent)=>{
          if(!box)return;
          const x=Math.max(-.5,Math.min(.5,(event.clientX-box.left)/box.width-.5));
          const y=Math.max(-.5,Math.min(.5,(event.clientY-box.top)/box.height-.5));
          const amount=surface.dataset.depth==="hero"?2:6;
          rx(-y*amount);ry(x*amount);
        };
        const reset=()=>{rx(0);ry(0);};
        surface.addEventListener("pointerenter",enter);surface.addEventListener("pointermove",move);surface.addEventListener("pointerleave",reset);window.addEventListener("blur",reset);
        disposers.push(()=>{surface.removeEventListener("pointerenter",enter);surface.removeEventListener("pointermove",move);surface.removeEventListener("pointerleave",reset);window.removeEventListener("blur",reset);rx.tween.kill();ry.tween.kill();});
      });
      return()=>disposers.forEach((dispose)=>dispose());
    });
    return()=>mm.revert();
  },{scope});
}
