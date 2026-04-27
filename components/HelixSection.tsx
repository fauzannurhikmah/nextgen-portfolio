"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HelixSection() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase0Ref = useRef<HTMLDivElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let cleanupThree: (() => void) | null = null;

    (async () => {
      const THREE = (await import("three")).default ?? await import("three");
      const canvas = canvasRef.current;
      const wrap   = wrapRef.current;
      if (!canvas || !wrap) return;

      const W = () => canvas.parentElement!.offsetWidth;
      const H = () => canvas.parentElement!.offsetHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W(), H());

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 200);
      camera.position.set(8, 0, 28);

      // ── build helix ──────────────────────────────────────────────────────
      const POINTS = 140, TURNS = 5, HEIGHT = 14, R = 2.5;
      const group  = new THREE.Group();
      scene.add(group);

      const mat1 = new THREE.MeshStandardMaterial({
        color: 0x00d4c8, emissive: 0x003330, metalness: 0.7, roughness: 0.2,
      });
      const mat2 = new THREE.MeshStandardMaterial({
        color: 0xff6b35, emissive: 0x3a1000, metalness: 0.7, roughness: 0.2,
      });

      // Per-atom scatter offsets (fixed at build time)
      const s1orig: THREE.Vector3[] = [];
      const s2orig: THREE.Vector3[] = [];
      const scatter1: THREE.Vector3[] = [];
      const scatter2: THREE.Vector3[] = [];
      const atoms1: THREE.Mesh[] = [];
      const atoms2: THREE.Mesh[] = [];
      const bridges: THREE.Mesh[] = [];
      const s1pts: THREE.Vector3[] = [];
      const s2pts: THREE.Vector3[] = [];

      for (let i = 0; i < POINTS; i++) {
        const t  = i / (POINTS - 1);
        const a  = t * Math.PI * 2 * TURNS;
        const y  = (t - 0.5) * HEIGHT;
        const x1 = Math.cos(a) * R,        z1 = Math.sin(a) * R;
        const x2 = Math.cos(a + Math.PI) * R, z2 = Math.sin(a + Math.PI) * R;

        s1pts.push(new THREE.Vector3(x1, y, z1));
        s2pts.push(new THREE.Vector3(x2, y, z2));
        s1orig.push(new THREE.Vector3(x1, y, z1));
        s2orig.push(new THREE.Vector3(x2, y, z2));

        if (i % 3 === 0) {
          const sg = new THREE.SphereGeometry(0.14, 10, 10);
          const m1 = new THREE.Mesh(sg, mat1.clone());
          const m2 = new THREE.Mesh(sg, mat2.clone());
          m1.position.copy(s1orig[i]);
          m2.position.copy(s2orig[i]);
          group.add(m1, m2);
          atoms1.push(m1);
          atoms2.push(m2);
          scatter1.push(new THREE.Vector3(
            (Math.random() - 0.5) * 22,
            (Math.random() - 0.5) * 22,
            (Math.random() - 0.5) * 12,
          ));
          scatter2.push(new THREE.Vector3(
            (Math.random() - 0.5) * 22,
            (Math.random() - 0.5) * 22,
            (Math.random() - 0.5) * 12,
          ));
        }

        if (i % 7 === 0) {
          const len = new THREE.Vector3(x1 - x2, 0, z1 - z2).length();
          const bg  = new THREE.CylinderGeometry(0.04, 0.04, len, 8);
          const bm  = new THREE.Mesh(bg,
            new THREE.MeshStandardMaterial({
              color: 0xe8ff47, emissive: 0x303800,
              metalness: 0.5, roughness: 0.4,
              transparent: true, opacity: 0,
            })
          );
          bm.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
          bm.lookAt(new THREE.Vector3(x2, y, z2));
          bm.rotateX(Math.PI / 2);
          group.add(bm);
          bridges.push(bm);
        }
      }

      // Tubes
      const tube1 = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s1pts), POINTS * 2, 0.065, 8, false),
        mat1,
      );
      const tube2 = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s2pts), POINTS * 2, 0.065, 8, false),
        mat2,
      );
      group.add(tube1, tube2);

      // Glow flash plane (phase 3)
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xe8ff47, transparent: true, opacity: 0, side: THREE.DoubleSide,
      });
      const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), glowMat);
      glowPlane.position.z = -6;
      scene.add(glowPlane);

      // ── Lights ───────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const dl1 = new THREE.DirectionalLight(0x00d4c8, 3);
      dl1.position.set(5, 10, 5); scene.add(dl1);
      const dl2 = new THREE.DirectionalLight(0xff6b35, 2);
      dl2.position.set(-5, -5, -3); scene.add(dl2);
      const pl  = new THREE.PointLight(0xe8ff47, 2, 30);
      pl.position.set(0, 0, 10); scene.add(pl);
      const pl2 = new THREE.PointLight(0x00d4c8, 0, 25);
      pl2.position.set(0, 6, 6); scene.add(pl2);

      // ── Resize ───────────────────────────────────────────────────────────
      const onResize = () => {
        renderer.setSize(W(), H());
        camera.aspect = W() / H();
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      // ── Scroll progress (raw 0→1) ─────────────────────────────────────
      let scrollProg = 0;
      const onScroll = () => {
        const rect   = wrap.getBoundingClientRect();
        const totalH = wrap.offsetHeight - window.innerHeight;
        scrollProg   = Math.max(0, Math.min(1, -rect.top / totalH));
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      // ── Lerped state — EVERYTHING goes through lerp, no hard jumps ──────
      // Camera
      let camZ = 28,  camZt = 28;
      let camX = 8,   camXt = 8;
      // Tubes separation (phase 2)
      let sep  = 0,   sept  = 0;
      // Rotation speed multiplier
      let rotSpd = 0.2, rotSpdt = 0.2;
      // Bridge opacity
      let bridgeOp = 0, bridgeOpt = 0;
      // Point light intensities
      let pl1I = 2,  pl1It = 2;
      let pl2I = 0,  pl2It = 0;
      // Glow flash
      let glowOp = 0, glowOpt = 0;
      // Atom scatter amount (0 = assembled, 1 = scattered)
      let scatterT = 1, scatterTt = 1;   // starts scattered, assembles on scroll

      // Smooth lerp helper
      const lerpF = (cur: number, tgt: number, f: number) => cur + (tgt - cur) * f;
      const LERP  = 0.055;   // global lerp factor — lower = smoother/slower

      let t2 = 0;
      const render = () => {
        animId = requestAnimationFrame(render);
        t2 += 0.008;

        const p = scrollProg;   // 0–1 across entire section

        // ── Compute TARGETS from scroll progress ─────────────────────────
        // All targets are smooth functions of p — no discontinuities.

        // Phase 0 (p 0→0.25): assemble atoms, camera pulls in
        // Phase 1 (p 0.25→0.5): spin fast, zoom in, bridges light
        // Phase 2 (p 0.5→0.75): strands separate
        // Phase 3 (p 0.75→1.0): re-merge, glow

        // Smooth step helpers
        const s01 = Math.max(0, Math.min(1, (p - 0.0)  / 0.25));   // 0→1 in phase 0
        const s12 = Math.max(0, Math.min(1, (p - 0.25) / 0.25));   // 0→1 in phase 1
        const s23 = Math.max(0, Math.min(1, (p - 0.5)  / 0.25));   // 0→1 in phase 2
        const s34 = Math.max(0, Math.min(1, (p - 0.75) / 0.25));   // 0→1 in phase 3

        // Ease (cubic)
        const e01 = 1 - Math.pow(1 - s01, 3);
        const e12 = 1 - Math.pow(1 - s12, 3);
        const e23 = 1 - Math.pow(1 - s23, 3);
        const e34 = 1 - Math.pow(1 - s34, 3);

        // Camera Z: 28 → 18 → 10 → 14 → 12
        camZt = 28 - e01 * 10         // phase 0: 28→18
               - e12 * 8              // phase 1: 18→10
               + e23 * 4              // phase 2: 10→14
               - e34 * 2;             // phase 3: 14→12

        // Camera X: 8 → 6 → 4 → 6 → 5
        camXt = 8 - e01 * 2 - e12 * 2 + e23 * 2 - e34 * 1;

        // Scatter: starts 1, goes to 0 during phase 0, stays 0
        scatterTt = 1 - e01;

        // Rotation speed: slow → fast → medium → slow
        rotSpdt = 0.2 + e01 * 0.15 + e12 * 0.55 - e23 * 0.4 - e34 * 0.3;

        // Bridge opacity: 0 → 1 in phase 0/1, 0 in phase 2, back to 1 in phase 3
        bridgeOpt = e01 * 0.7
                   + e12 * 0.0        // already at 0.7
                   - e23 * 0.7        // phase 2: fade out
                   + e34 * 0.7;       // phase 3: fade back in

        // Tube separation X: 0 → 4 in phase 2, back to 0 in phase 3
        sept = e23 * 4 - e34 * 4;

        // PL1 intensity: 2 → 6 in phase 1, stays → explodes in phase 3
        pl1It = 2 + e12 * 4 - e23 * 2 + e34 * 8;

        // PL2 intensity: 0 → 3 phase 1, → 5 phase 2, → 6 phase 3
        pl2It = e12 * 3 + e23 * 2 + e34 * 1;

        // Glow flash: bell curve around phase 3 midpoint
        glowOpt = Math.sin(e34 * Math.PI) * 0.08;

        // ── Apply lerps ──────────────────────────────────────────────────
        camZ     = lerpF(camZ,     camZt,     LERP);
        camX     = lerpF(camX,     camXt,     LERP);
        sep      = lerpF(sep,      sept,      LERP);
        rotSpd   = lerpF(rotSpd,   rotSpdt,   LERP * 0.6);
        bridgeOp = lerpF(bridgeOp, bridgeOpt, LERP);
        pl1I     = lerpF(pl1I,     pl1It,     LERP);
        pl2I     = lerpF(pl2I,     pl2It,     LERP);
        glowOp   = lerpF(glowOp,   glowOpt,   LERP * 1.5);
        scatterT = lerpF(scatterT, scatterTt, LERP * 0.8);

        // ── Apply to scene ───────────────────────────────────────────────
        camera.position.z = camZ;
        camera.position.x = camX;
        camera.lookAt(0, 0, 0);

        // Atoms: lerp between scatter position and helix position
        atoms1.forEach((m, ai) => {
          const orig = s1orig[ai * 3] ?? s1orig[s1orig.length - 1];
          const sc   = scatter1[ai];
          if (!orig || !sc) return;
          m.position.x = lerpF(m.position.x, orig.x + sc.x * scatterT, 0.06);
          m.position.y = lerpF(m.position.y, orig.y + sc.y * scatterT, 0.06);
          m.position.z = lerpF(m.position.z, orig.z + sc.z * scatterT, 0.06);
        });
        atoms2.forEach((m, ai) => {
          const orig = s2orig[ai * 3] ?? s2orig[s2orig.length - 1];
          const sc   = scatter2[ai];
          if (!orig || !sc) return;
          m.position.x = lerpF(m.position.x, orig.x + sc.x * scatterT, 0.06);
          m.position.y = lerpF(m.position.y, orig.y + sc.y * scatterT, 0.06);
          m.position.z = lerpF(m.position.z, orig.z + sc.z * scatterT, 0.06);
        });

        // Tubes separation — lerped, no jump
        tube1.position.x = lerpF(tube1.position.x, -sep, 0.07);
        tube2.position.x = lerpF(tube2.position.x,  sep, 0.07);

        // Bridges opacity — lerped
        bridges.forEach((b) => {
          const bm = b.material as THREE.MeshStandardMaterial;
          bm.opacity = lerpF(bm.opacity, bridgeOp, LERP * 1.2);
          bm.emissiveIntensity = 0.4 + Math.sin(t2 * 2.5 + b.position.y) * 0.25;
        });

        // Group rotation — continuously driven, speed lerped
        group.rotation.y += rotSpd * 0.016;

        // Lights
        pl.intensity  = pl1I + Math.sin(t2 * 2) * 0.4;
        pl2.intensity = pl2I;
        glowMat.opacity = glowOp;

        renderer.render(scene, camera);
      };
      render();

      cleanupThree = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    })();

    // ── GSAP: text panels scrubbed by scroll ─────────────────────────────
    const ctx = gsap.context(() => {
      if (!wrapRef.current) return;
      const totalH = wrapRef.current.offsetHeight;

      const panels = [
        { ref: phase0Ref, enter: 0.00, peak: 0.08, leave: 0.22 },
        { ref: phase1Ref, enter: 0.22, peak: 0.32, leave: 0.47 },
        { ref: phase2Ref, enter: 0.47, peak: 0.57, leave: 0.72 },
        { ref: phase3Ref, enter: 0.72, peak: 0.82, leave: 1.00 },
      ];

      panels.forEach(({ ref, enter, peak, leave }) => {
        if (!ref.current) return;

        // Scrub opacity: 0 → 1 on enter, 1 → 0 on leave
        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: `top+=${enter * totalH}px top`,
            end:   `top+=${peak  * totalH}px top`,
            scrub: 1.2,
          },
        });

        if (leave < 1.0) {
          gsap.to(ref.current, {
            opacity: 0,
            y: -30,
            ease: "power2.in",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: `top+=${(leave - 0.06) * totalH}px top`,
              end:   `top+=${leave          * totalH}px top`,
              scrub: 1.0,
            },
          });
        }
      });
    });

    return () => {
      ctx.revert();
      cleanupThree?.();
    };
  }, []);

  const phaseData = [
    {
      ref: phase0Ref,
      tag: "// Phase 01",
      lines: [{ text: "THE DNA OF", accent: false }, { text: "GREAT CODE", accent: true }],
      desc: "Clean architecture, predictable patterns. Systems that scale elegantly from prototype to production.",
      idx: 0,
    },
    {
      ref: phase1Ref,
      tag: "// Phase 02",
      lines: [{ text: "PRECISION", accent: false }, { text: "AT SPEED", accent: true }],
      desc: "Performance is not a feature — it's the foundation. Every millisecond is a design decision.",
      idx: 1,
    },
    {
      ref: phase2Ref,
      tag: "// Phase 03",
      lines: [{ text: "SEPARATION", accent: false }, { text: "OF CONCERNS", accent: true }],
      desc: "Decoupled systems that evolve independently. Complexity managed, never accumulated.",
      idx: 2,
    },
    {
      ref: phase3Ref,
      tag: "// Phase 04",
      lines: [{ text: "SYNTHESIS", accent: false }, { text: "AND SHIP", accent: true }],
      desc: "All parts converge into a living product. Elegant, tested, deployed. Then iterate.",
      idx: 3,
    },
  ];

  return (
    <div ref={wrapRef} className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 62% 50%, rgba(0,212,200,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Text panels — GSAP scrubs opacity/y */}
        <div className="absolute inset-0 flex items-center px-[5vw] pointer-events-none z-10">
          <div className="max-w-[1300px] w-full mx-auto relative" style={{ height: 340 }}>
            {phaseData.map(({ ref, tag, lines, desc, idx }) => (
              <div
                key={tag}
                ref={ref}
                className="absolute left-0 top-0"
                style={{ opacity: 0, transform: "translateY(30px)", maxWidth: 520 }}
              >
                <div className="font-mono text-[10px] tracking-[.22em] uppercase text-accent mb-4">
                  {tag}
                </div>
                <h2 className="font-display text-[clamp(44px,5.5vw,80px)] leading-[.9] tracking-[.02em] mb-6">
                  {lines.map((l, li) => (
                    <span key={li} className={`block ${l.accent ? "text-accent" : "text-cream"}`}>
                      {l.text}
                    </span>
                  ))}
                </h2>
                <p className="text-[15px] leading-[1.8] text-cream/50 max-w-[420px]">{desc}</p>

                {/* Phase dots */}
                <div className="flex items-center gap-2 mt-8">
                  {[0, 1, 2, 3].map((di) => (
                    <div
                      key={di}
                      className="h-px rounded-full transition-all duration-300"
                      style={{
                        width:      di === idx ? 32 : 10,
                        background: di === idx ? "#e8ff47" : "rgba(240,236,227,0.18)",
                      }}
                    />
                  ))}
                  <span className="font-mono text-[9px] tracking-[.15em] text-cream/30 ml-2 uppercase">
                    {String(idx + 1).padStart(2, "0")} / 04
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 pointer-events-none">
          <div className="font-mono text-[9px] tracking-[.18em] uppercase text-cream/18">
            scroll to explore
          </div>
          <div className="w-px h-10 bg-cream/10 relative overflow-hidden">
            <div
              className="absolute left-0 w-full bg-accent"
              style={{ height: "45%", animation: "scrollTick 2s infinite ease-in-out" }}
            />
          </div>
        </div>

        {/* Corner labels */}
        <div className="absolute top-28 left-[5vw] font-mono text-[9px] tracking-[.15em] text-cream/14 uppercase z-10 pointer-events-none">
          Architecture
        </div>
        <div className="absolute top-28 right-[5vw] font-mono text-[9px] tracking-[.15em] text-cream/14 uppercase z-10 pointer-events-none text-right">
          Three.js · WebGL
        </div>
      </div>
    </div>
  );
}
