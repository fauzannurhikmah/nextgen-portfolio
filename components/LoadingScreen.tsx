"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface Props { onComplete: () => void; }

export default function LoadingScreen({ onComplete }: Props) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [pct, setPct]     = useState(0);
  const [status, setStatus] = useState("Initialising systems");

  /* Particle canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type P = { x:number; y:number; vx:number; vy:number; r:number; a:number; col:string };
    const pts: P[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
      r: Math.random()*1.4+0.4, a: Math.random()*0.4+0.05,
      col: Math.random()>0.55 ? "#e8ff47" : "#f0ece3",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i+1; j < pts.length; j++) {
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if (d<130) { ctx.strokeStyle=`rgba(232,255,71,${(1-d/130)*0.05})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); }
        }
      }
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.globalAlpha=p.a; ctx.fill(); ctx.globalAlpha=1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  /* Progress ticker */
  useEffect(() => {
    let p = 0;
    const steps = [
      { target: 30,  speed: 0.7,  msg: "Initialising systems"  },
      { target: 60,  speed: 2.0,  msg: "Loading assets"        },
      { target: 85,  speed: 1.2,  msg: "Building experience"   },
      { target: 100, speed: 0.5,  msg: "Almost ready"          },
    ];
    let stepIdx = 0;
    const iv = setInterval(() => {
      const s = steps[stepIdx];
      p = Math.min(s.target, p + s.speed);
      setPct(Math.floor(p));
      setStatus(s.msg);
      if (p >= s.target && stepIdx < steps.length - 1) stepIdx++;
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          // Cinematic exit
          const tl = gsap.timeline({ onComplete });
          tl
            .to(".loader-bar-fill", { scaleX: 1, duration: 0.2, ease: "power2.out" })
            .to(".loader-pct",      { scale: 1.08, duration: 0.15 }, "<")
            .to(".loader-pct",      { scale: 1,    duration: 0.15 }, "+=0.05")
            // Logo halves fly apart
            .to(".loader-logo-l",  { x: "-40vw", opacity: 0, duration: 0.7, ease: "expo.in" }, 0.25)
            .to(".loader-logo-r",  { x: "40vw",  opacity: 0, duration: 0.7, ease: "expo.in" }, 0.25)
            // Counter fades
            .to(".loader-pct",     { opacity: 0, scale: 1.3, duration: 0.5, ease: "power2.in" }, 0.25)
            .to(".loader-status",  { opacity: 0, duration: 0.3 }, 0.2)
            // Scanline sweeps across
            .to(".loader-scan",    { left: "110%", duration: 0.7, ease: "power2.inOut" }, 0.3)
            // Two curtain halves split open (reveal)
            .to(".curtain-l",      { xPercent: -100, duration: 1.1, ease: "expo.inOut" }, 0.55)
            .to(".curtain-r",      { xPercent:  100, duration: 1.1, ease: "expo.inOut" }, 0.55)
            // Entire wrapper slides up
            .to(wrapRef.current,   { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, 1.3);
        }, 250);
      }
    }, 28);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[9999] bg-ink overflow-hidden select-none">
      {/* Particle bg */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage:"linear-gradient(rgba(232,255,71,1) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,71,1) 1px,transparent 1px)", backgroundSize:"64px 64px" }} />

      {/* Scanline */}
      <div className="loader-scan absolute top-0 bottom-0 w-[2px] z-10 pointer-events-none"
        style={{ left:"-2px", background:"linear-gradient(to bottom,transparent,#e8ff47,transparent)", boxShadow:"0 0 24px 6px rgba(232,255,71,0.35)" }} />

      {/* Curtains */}
      <div className="curtain-l absolute top-0 left-0 w-1/2 h-full bg-ink z-[5]" />
      <div className="curtain-r absolute top-0 right-0 w-1/2 h-full bg-ink z-[5]" />

      {/* Corner brackets */}
      {["top-6 left-6 border-t border-l","top-6 right-6 border-t border-r","bottom-6 left-6 border-b border-l","bottom-6 right-6 border-b border-r"].map((c,i)=>(
        <div key={i} className={`absolute w-8 h-8 border-accent/30 pointer-events-none ${c}`} />
      ))}

      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[6] pointer-events-none">
        {/* Logo */}
        <div className="flex items-center overflow-hidden mb-12">
          <span className="loader-logo-l font-display text-[clamp(40px,7vw,88px)] tracking-[.1em] text-cream leading-none">FAUZAN</span>
          <span className="loader-logo-r font-display text-[clamp(40px,7vw,88px)] tracking-[.1em] text-accent leading-none">.</span>
        </div>

        {/* Big percentage */}
        <div className="loader-pct font-display tabular-nums leading-none text-cream"
          style={{ fontSize: "clamp(72px,16vw,160px)" }}>
          {String(pct).padStart(3,"0")}
          <span className="text-accent" style={{ fontSize:"0.38em" }}>%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-72 h-px bg-cream/10 relative overflow-hidden">
          <div className="loader-bar-fill absolute inset-y-0 left-0 bg-accent origin-left"
            style={{ transform:`scaleX(${pct/100})`, transition:"transform 0.06s linear" }} />
        </div>

        {/* Status */}
        <div className="loader-status mt-5 font-mono text-[10px] tracking-[.26em] uppercase text-cream/30">
          {status}
        </div>

        {/* Version */}
        <div className="absolute bottom-6 font-mono text-[9px] tracking-[.2em] uppercase text-cream/15">
          Portfolio v2.0 · 2025
        </div>

        {/* Side labels */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[.2em] uppercase text-cream/12"
          style={{ writingMode:"vertical-rl", transform:"rotate(180deg) translateY(50%)" }}>
          Full Stack Developer
        </div>
        <div className="absolute right-6 top-1/2 font-mono text-[9px] tracking-[.2em] uppercase text-cream/12"
          style={{ writingMode:"vertical-rl" }}>
          Next.js · Three.js · GSAP
        </div>
      </div>
    </div>
  );
}
