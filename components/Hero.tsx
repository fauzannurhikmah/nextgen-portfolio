"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function Hero() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let animId: number;
    (async () => {
      const THREE = (await import("three")).default ?? await import("three");
      const canvas  = canvasRef.current;
      const section = sectionRef.current;
      if (!canvas || !section) return;

      const W = () => window.innerWidth;
      const H = () => window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W(), H());

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100);
      camera.position.z = 28;

      const COLS = 34, ROWS = 22;
      const geo  = new THREE.BufferGeometry();
      const pos: number[] = [], uv: number[] = [], idx: number[] = [];

      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          pos.push((c - COLS / 2) * (24 / COLS), (r - ROWS / 2) * (15 / ROWS), 0);
          uv.push(c / COLS, r / ROWS);
        }
      }
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const a = r * (COLS + 1) + c;
          idx.push(a, a + 1, a + COLS + 1, a + 1, a + COLS + 2, a + COLS + 1);
        }
      }
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv",       new THREE.Float32BufferAttribute(uv,  2));
      geo.setIndex(idx);

      type Ripple = { ox: number; oy: number; startT: number };
      const ripples: Ripple[] = [];

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        wireframe:   true,
        uniforms: {
          uTime:    { value: 0 },
          uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
          uRipple0: { value: new THREE.Vector4(0, 0, -99, 0) },
          uRipple1: { value: new THREE.Vector4(0, 0, -99, 0) },
          uRipple2: { value: new THREE.Vector4(0, 0, -99, 0) },
        },
        vertexShader: `
          uniform float uTime;
          uniform vec2  uMouse;
          uniform vec4  uRipple0;
          uniform vec4  uRipple1;
          uniform vec4  uRipple2;
          varying float vZ;
          varying float vRipple;

          float rippleDisplace(vec4 r, vec2 ndc) {
            if (r.z < -50.0) return 0.0;
            float age    = uTime - r.z;
            float radius = age * 4.5;
            float dist   = length(ndc - r.xy);
            float ring   = exp(-pow(dist - radius, 2.0) * 8.0);
            float decay  = exp(-age * 1.2);
            return ring * decay * r.w;
          }

          void main() {
            vec3 p = position;
            p.z = sin(p.x * 0.4 + uTime) * 1.4
                + sin(p.y * 0.35 + uTime * 0.8) * 1.1;
            vec2 ndc = vec2(p.x / 12.0, p.y / 7.5);
            float d  = length(ndc - (uMouse * 2.0 - 1.0));
            p.z -= d * 0.9;
            float ripZ = rippleDisplace(uRipple0, ndc)
                       + rippleDisplace(uRipple1, ndc)
                       + rippleDisplace(uRipple2, ndc);
            p.z     += ripZ * 5.0;
            vZ       = p.z;
            vRipple  = clamp(abs(ripZ) * 4.0, 0.0, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          varying float vZ;
          varying float vRipple;
          void main() {
            float t     = (vZ + 2.5) / 5.0;
            vec3 teal   = vec3(0.0,  0.831, 0.784);
            vec3 orange = vec3(1.0,  0.42,  0.208);
            vec3 yellow = vec3(0.91, 1.0,   0.28);
            vec3 col    = mix(teal, orange, clamp(t, 0.0, 1.0));
            col         = mix(col, yellow, vRipple * 0.85);
            float alpha = clamp(t * 0.5 + 0.08, 0.04, 0.28) + vRipple * 0.4;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      scene.add(new THREE.Mesh(geo, mat));

      // Key fix: listen on window so overlapping divs don't block it
      const onClick = (e: MouseEvent) => {
        const rect = section.getBoundingClientRect();
        if (e.clientY < rect.top || e.clientY > rect.bottom) return;
        const nx =  (e.clientX / W()) * 2 - 1;
        const ny = -(e.clientY / H()) * 2 + 1;
        ripples.unshift({ ox: nx, oy: ny, startT: mat.uniforms.uTime.value });
        if (ripples.length > 3) ripples.pop();
      };
      window.addEventListener("click", onClick);

      let mx = 0.5, my = 0.5;
      const onMove = (e: MouseEvent) => { mx = e.clientX / W(); my = 1 - e.clientY / H(); };
      window.addEventListener("mousemove", onMove);
      const onResize = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); };
      window.addEventListener("resize", onResize);

      const slots = [mat.uniforms.uRipple0, mat.uniforms.uRipple1, mat.uniforms.uRipple2];
      let t = 0;
      const render = () => {
        animId = requestAnimationFrame(render);
        t += 0.009;
        mat.uniforms.uTime.value = t;
        mat.uniforms.uMouse.value.x += (mx - mat.uniforms.uMouse.value.x) * 0.04;
        mat.uniforms.uMouse.value.y += (my - mat.uniforms.uMouse.value.y) * 0.04;
        for (let i = 0; i < 3; i++) {
          const r = ripples[i];
          slots[i].value.set(r ? r.ox : 0, r ? r.oy : 0, r ? r.startT : -99, r ? 1.0 : 0);
        }
        renderer.render(scene, camera);
      };
      render();

      return () => {
        window.removeEventListener("click",     onClick);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize",    onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    })();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.2 })
        .to(".hero-eyebrow-inner", { y: 0, duration: 1, ease: "expo.out" })
        .to(".headline-row span",  { y: 0, duration: 1.15, stagger: 0.13, ease: "expo.out" }, "<0.1")
        .to(".hero-desc-p",        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "<0.35")
        .to(".hero-actions-inner", { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "<0.1");
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen min-h-[700px] flex items-end overflow-hidden px-[5vw] pb-[7vh]"
      style={{ cursor: "crosshair" }}
    >
      {/* Canvas: pointer-events-none so overlays don't block, but window listener catches all */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-90 pointer-events-none" />

      {/* All decorative layers: pointer-events-none */}
      <div className="noise-overlay absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 50%, transparent 25%, rgba(8,9,15,0.72) 100%)" }}
      />

      {/* Ripple hint */}
      <div className="absolute top-28 right-[5vw] z-10 font-mono text-[9px] tracking-[.2em] uppercase text-cream/20 flex items-center gap-2 pointer-events-none select-none">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" />
        Click mesh to ripple
      </div>

      {/* Scroll indicator */}
      <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4 pointer-events-none">
        <div className="scroll-vert" />
        <span className="font-mono text-[9px] tracking-[.15em] text-cream/30 uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Scroll
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1300px] w-full">
        <div className="flex items-center gap-3 mb-5 overflow-hidden">
          <div className="hero-eyebrow-inner flex items-center gap-3" style={{ transform: "translateY(100%)" }}>
            <div className="px-3 py-1 border border-accent/30 font-mono text-[10px] tracking-[.2em] uppercase text-accent rounded-sm">Available</div>
            <div className="w-14 h-px bg-gradient-to-r from-accent to-transparent" />
            <span className="font-mono text-[10px] tracking-[.16em] uppercase text-cream/35">Open to New Projects · 2025</span>
          </div>
        </div>

        <div>
          {(["FULL", "STACK", "DEV."] as const).map((word, i) => (
            <div key={word} className="headline-row">
              <span className={`font-display text-[clamp(88px,13.5vw,200px)] leading-[.88] tracking-[-0.01em] ${i === 1 ? "stroke-text" : i === 2 ? "text-accent" : ""}`}>
                {word}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mt-8 gap-8 flex-wrap">
          <p className="hero-desc-p max-w-[380px] text-[15px] font-normal leading-[1.75] text-cream/40" style={{ transform: "translateY(40px)", opacity: 0 }}>
            Engineering precision meets design intuition. I build digital products that perform at the edge — fast, scalable, and remembered.
          </p>
          <div className="hero-actions-inner flex gap-3 items-center" style={{ transform: "translateY(40px)", opacity: 0 }}>
            <Link href="#projects" className="px-9 py-3.5 bg-accent text-ink font-mono text-[11px] font-medium tracking-[.14em] uppercase rounded-sm hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(232,255,71,0.3)] transition-all duration-200 no-underline">Selected Work</Link>
            <Link href="#contact" className="px-9 py-3 border border-cream/20 text-cream/40 font-mono text-[11px] tracking-[.14em] uppercase rounded-sm hover:border-cream/50 hover:text-cream hover:-translate-y-1 transition-all duration-200 no-underline">Get in Touch</Link>
          </div>
          <div className="hidden lg:block text-right">
            <div className="font-display text-[56px] leading-none text-cream tracking-[.02em]">6<span className="text-accent text-[32px]">+</span></div>
            <div className="font-mono text-[9px] tracking-[.2em] uppercase text-cream/35 mt-1">Years of craft</div>
          </div>
        </div>
      </div>
    </section>
  );
}
