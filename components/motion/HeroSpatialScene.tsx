"use client";

import { useEffect, useRef } from "react";
import styles from "../viveci.module.css";

const VERTEX_SURFACE = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vPulse;

  void main() {
    vec3 p = position;
    vPulse = sin((p.x + p.y) * 4.0 + uTime * 1.35) * 0.5 + 0.5;
    p += normal * vPulse * 0.012;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT_SURFACE = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform vec3 uLight;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vPulse;

  void main() {
    vec3 n = normalize(vNormal);
    float key = max(dot(n, normalize(uLight)), 0.0);
    float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.8);
    float specular = pow(max(dot(reflect(-normalize(uLight), n), vView), 0.0), 34.0);
    vec3 color = uColor * (0.2 + key * 0.62) + vec3(0.55, 0.82, 1.0) * (rim * 1.25 + specular * 0.8);
    float alpha = uAlpha * (0.34 + rim * 0.66) * (0.88 + vPulse * 0.12);
    gl_FragColor = vec4(color, alpha);
  }
`;

const VERTEX_POINTS = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  varying float vGlow;

  void main() {
    vec3 p = position;
    float wave = sin(p.y * 4.0 + uTime * 0.72) * 0.025;
    p *= 1.0 + wave;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(14.0 / max(1.0, -viewPosition.z), 1.2, 3.4);
    vGlow = sin((p.x - p.z) * 5.0 + uTime) * 0.5 + 0.5;
  }
`;

const FRAGMENT_POINTS = /* glsl */ `
  precision highp float;
  varying float vGlow;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float halo = 1.0 - smoothstep(0.06, 0.5, length(uv));
    gl_FragColor = vec4(0.31, 0.72, 1.0, halo * (0.24 + vGlow * 0.62));
  }
`;

const VERTEX_STARS = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute float seed;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p.z = mod(p.z + uTime * (0.035 + seed * 0.025) + 12.0, 14.0) - 10.0;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp((6.0 + seed * 13.0) / max(1.0, -viewPosition.z), 0.75, 2.35);
    vSeed = seed;
  }
`;

const FRAGMENT_STARS = /* glsl */ `
  precision highp float;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = (1.0 - smoothstep(0.04, 0.5, d)) * (0.2 + vSeed * 0.52);
    gl_FragColor = vec4(mix(vec3(0.2, 0.55, 1.0), vec3(0.86, 0.95, 1.0), vSeed), alpha);
  }
`;

const VERTEX_GRID = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying float vDepth;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    vDepth = smoothstep(-12.0, 2.0, position.z);
  }
`;

const FRAGMENT_GRID = /* glsl */ `
  precision highp float;
  varying float vDepth;
  void main() {
    gl_FragColor = vec4(0.08, 0.43, 1.0, vDepth * 0.22);
  }
`;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Cena espacial procedural: geometria 3D real, sem modelo externo ou loop fora da viewport. */
export function HeroSpatialScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root) return;

    const media = window.matchMedia("(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let destroyScene: (() => void) | undefined;
    let generation = 0;

    const mount = async () => {
      if (!media.matches || destroyScene) return;
      const id = ++generation;
      const { Camera, Geometry, Mesh, Program, Renderer, Sphere, Torus, Transform, Vec3 } = await import("ogl");
      if (id !== generation || !media.matches || !root.isConnected) return;

      const renderer = new Renderer({ alpha: true, antialias: true, depth: true, dpr: Math.min(devicePixelRatio, 1.35), powerPreference: "high-performance" });
      const { gl } = renderer;
      gl.clearColor(0, 0, 0, 0);
      renderer.autoClear = true;
      const canvas = gl.canvas;
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.spatialScene = "true";
      root.appendChild(canvas);

      const camera = new Camera(gl, { fov: 38, near: 0.1, far: 30 });
      camera.position.set(0, 0, 7.2);
      camera.lookAt([0, 0, 0]);
      const scene = new Transform();
      const rig = new Transform();
      rig.position.set(1.65, 0.22, 0);
      rig.rotation.set(-0.08, -0.12, 0.08);
      rig.setParent(scene);

      const light = new Vec3(-0.35, 0.7, 0.8).normalize();
      const clock = { value: 0 };
      const programs: InstanceType<typeof Program>[] = [];
      const geometries: { remove(): void }[] = [];
      const meshes: InstanceType<typeof Mesh>[] = [];

      const material = (color: [number, number, number], alpha: number) => {
        const program = new Program(gl, {
          vertex: VERTEX_SURFACE,
          fragment: FRAGMENT_SURFACE,
          transparent: true,
          cullFace: false,
          depthWrite: false,
          uniforms: { uTime: clock, uColor: { value: color }, uLight: { value: light }, uAlpha: { value: alpha } },
        });
        program.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
        programs.push(program);
        return program;
      };

      const rings = [
        { radius: 1.74, tube: 0.018, rotation: [1.12, 0.18, 0.22], color: [0.08, 0.45, 1] as [number, number, number], alpha: 0.72 },
        { radius: 2.03, tube: 0.009, rotation: [0.32, 0.82, -0.34], color: [0.22, 0.72, 1] as [number, number, number], alpha: 0.52 },
        { radius: 2.34, tube: 0.006, rotation: [0.7, -0.5, 0.66], color: [0.36, 0.52, 1] as [number, number, number], alpha: 0.34 },
      ];

      rings.forEach((ring, index) => {
        const geometry = new Torus(gl, { radius: ring.radius, tube: ring.tube, radialSegments: 6, tubularSegments: 112 });
        const mesh = new Mesh(gl, { geometry, program: material(ring.color, ring.alpha) });
        mesh.rotation.set(ring.rotation[0], ring.rotation[1], ring.rotation[2]);
        mesh.renderOrder = 2 + index;
        mesh.setParent(rig);
        geometries.push(geometry);
        meshes.push(mesh);
      });

      const particleGeometry = new Sphere(gl, { radius: 2.58, widthSegments: 34, heightSegments: 20 });
      const particleProgram = new Program(gl, {
        vertex: VERTEX_POINTS,
        fragment: FRAGMENT_POINTS,
        transparent: true,
        cullFace: false,
        depthWrite: false,
        uniforms: { uTime: clock },
      });
      particleProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      const particles = new Mesh(gl, { geometry: particleGeometry, program: particleProgram, mode: gl.POINTS });
      particles.rotation.set(0.2, 0.25, 0);
      particles.renderOrder = 1;
      particles.setParent(rig);
      programs.push(particleProgram);
      geometries.push(particleGeometry);
      meshes.push(particles);

      const random = seededRandom(20260907);
      const starCount = 680;
      const starPositions = new Float32Array(starCount * 3);
      const starSeeds = new Float32Array(starCount);
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (random() - 0.5) * 18;
        starPositions[i * 3 + 1] = (random() - 0.5) * 8;
        starPositions[i * 3 + 2] = random() * 14 - 10;
        starSeeds[i] = random();
      }
      const starGeometry = new Geometry(gl, {
        position: { size: 3, data: starPositions },
        seed: { size: 1, data: starSeeds },
      });
      const starProgram = new Program(gl, {
        vertex: VERTEX_STARS,
        fragment: FRAGMENT_STARS,
        transparent: true,
        cullFace: false,
        depthWrite: false,
        uniforms: { uTime: clock },
      });
      starProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      const stars = new Mesh(gl, { geometry: starGeometry, program: starProgram, mode: gl.POINTS, frustumCulled: false });
      stars.renderOrder = 0;
      stars.setParent(scene);
      programs.push(starProgram);
      geometries.push(starGeometry);
      meshes.push(stars);

      const gridValues: number[] = [];
      for (let x = -8; x <= 8; x += 0.8) gridValues.push(x, -1.9, 3, x, -1.9, -12);
      for (let z = 3; z >= -12; z -= 0.75) gridValues.push(-8, -1.9, z, 8, -1.9, z);
      const gridGeometry = new Geometry(gl, { position: { size: 3, data: new Float32Array(gridValues) } });
      const gridProgram = new Program(gl, {
        vertex: VERTEX_GRID,
        fragment: FRAGMENT_GRID,
        transparent: true,
        cullFace: false,
        depthWrite: false,
      });
      gridProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      const grid = new Mesh(gl, { geometry: gridGeometry, program: gridProgram, mode: gl.LINES, frustumCulled: false });
      grid.renderOrder = 0;
      grid.setParent(scene);
      programs.push(gridProgram);
      geometries.push(gridGeometry);
      meshes.push(grid);

      let width = 0;
      let height = 0;
      let visible = true;
      let frame = 0;
      let last = performance.now();
      let pointerX = 0;
      let pointerY = 0;
      let smoothX = 0;
      let smoothY = 0;

      const resize = () => {
        const box = root.getBoundingClientRect();
        width = Math.max(1, box.width);
        height = Math.max(1, box.height);
        renderer.setSize(width, height);
        camera.perspective({ aspect: width / height });
      };

      const pointer = (event: PointerEvent) => {
        const box = root.getBoundingClientRect();
        pointerX = ((event.clientX - box.left) / box.width - 0.5) * 2;
        pointerY = ((event.clientY - box.top) / box.height - 0.5) * 2;
      };
      const resetPointer = () => { pointerX = 0; pointerY = 0; };

      const render = (now: number) => {
        if (!visible || document.hidden) { frame = 0; return; }
        const delta = Math.min((now - last) / 1000, 0.05);
        last = now;
        clock.value += delta;
        smoothX += (pointerX - smoothX) * Math.min(1, delta * 3.7);
        smoothY += (pointerY - smoothY) * Math.min(1, delta * 3.7);
        rig.rotation.y = -0.12 + smoothX * 0.2 + clock.value * 0.025;
        rig.rotation.x = -0.08 - smoothY * 0.13;
        camera.position.x = smoothX * 0.3;
        camera.position.y = -smoothY * 0.2;
        camera.lookAt([0, 0, 0]);
        meshes[0].rotation.z += delta * 0.08;
        meshes[1].rotation.y -= delta * 0.055;
        meshes[2].rotation.x += delta * 0.035;
        particles.rotation.y -= delta * 0.018;
        renderer.render({ scene, camera });
        frame = requestAnimationFrame(render);
      };

      const start = () => {
        if (frame || !visible || document.hidden) return;
        last = performance.now();
        frame = requestAnimationFrame(render);
      };
      const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
      const visibility = () => document.hidden ? stop() : start();
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      }, { threshold: 0.02 });
      const ro = new ResizeObserver(resize);
      observer.observe(root);
      ro.observe(root);
      root.parentElement?.addEventListener("pointermove", pointer, { passive: true });
      root.parentElement?.addEventListener("pointerleave", resetPointer);
      document.addEventListener("visibilitychange", visibility);
      resize();
      start();

      destroyScene = () => {
        generation++;
        stop();
        observer.disconnect();
        ro.disconnect();
        root.parentElement?.removeEventListener("pointermove", pointer);
        root.parentElement?.removeEventListener("pointerleave", resetPointer);
        document.removeEventListener("visibilitychange", visibility);
        meshes.forEach((mesh) => mesh.setParent(null));
        geometries.forEach((geometry) => geometry.remove());
        programs.forEach((program) => program.remove());
        canvas.remove();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        destroyScene = undefined;
      };
    };

    const update = () => {
      if (media.matches) void mount();
      else destroyScene?.();
    };
    media.addEventListener("change", update);
    update();
    return () => { generation++; media.removeEventListener("change", update); destroyScene?.(); };
  }, []);

  return <div ref={host} className={styles.heroSpatialScene} aria-hidden />;
}
