"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    num: "01",
    title: "Prism — Design System",
    desc: "Production component library powering 12 teams. Token-based architecture delivering pixel-perfect consistency across web and native. Cut UI dev time by 60%.",
    stack: ["React", "TypeScript", "Storybook"],
    href: "#",
  },
  {
    num: "02",
    title: "Flowstate — AI Whiteboard",
    desc: "Real-time collaborative canvas with AI ideation. 1000+ concurrent users via CRDT sync on Cloudflare Durable Objects. Sub-50ms frame latency.",
    stack: ["Next.js", "Rust WASM", "WebSockets"],
    href: "#",
  },
  {
    num: "03",
    title: "Meridian — Analytics Pipeline",
    desc: "50M events/day IoT ingestion pipeline. Sub-100ms query latency on aggregated time-series via ClickHouse + materialized views.",
    stack: ["Go", "Kafka", "ClickHouse"],
    href: "#",
  },
  {
    num: "04",
    title: "Vessel — Dev CLI",
    desc: "8k+ GitHub stars. Containerised microservice scaffolding tool that generates production-ready Dockerfiles, K8s manifests, and CI pipelines from a single config.",
    stack: ["Rust", "Docker SDK", "Open Source"],
    href: "#",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".proj-gsap-up").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>(".proj-item").forEach((item) => {
        gsap.fromTo(item, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: item, start: "top 88%", once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-40 px-[5vw]"
      style={{ background: "linear-gradient(180deg, #08090f 0%, #0d0f1c 100%)" }}
    >
      <div className="max-w-[1300px] mx-auto">
        {/* Head */}
        <div className="mb-20">
          <div className="proj-gsap-up font-mono text-[10px] tracking-[.22em] uppercase text-accent mb-4">
            // Selected Work
          </div>
          <h2 className="proj-gsap-up font-display text-[clamp(52px,7vw,100px)] leading-[.9] tracking-[.02em]">
            Featured<br />
            <span className="stroke-text-dim">Projects</span>
          </h2>
        </div>

        {/* List */}
        <div className="flex flex-col gap-px">
          {projects.map((p) => (
            <a
              key={p.num}
              href={p.href}
              className="proj-item group grid grid-cols-[50px_1fr_auto] md:grid-cols-[80px_1fr_auto] gap-8 items-center py-9 border-b border-cream/[0.08] first:border-t first:border-cream/[0.08] no-underline hover:pl-4 hover:bg-accent/[0.015] transition-all duration-300 cursor-none"
            >
              <div className="font-mono text-[12px] tracking-[.1em] text-cream/30">{p.num}</div>

              <div>
                <h3 className="font-body text-[clamp(18px,2.5vw,30px)] font-semibold text-cream mb-2.5 group-hover:text-accent transition-colors duration-200">
                  {p.title}
                </h3>
                <p className="text-[14px] leading-[1.6] text-cream/40 max-w-[600px]">{p.desc}</p>
              </div>

              <div className="hidden md:flex flex-col items-end gap-3.5">
                <div className="flex gap-2 flex-wrap justify-end">
                  {p.stack.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 border border-cream/[0.08] font-mono text-[9px] tracking-[.1em] uppercase text-cream/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="w-10 h-10 border border-cream/[0.08] flex items-center justify-center text-[18px] text-cream/30 group-hover:border-accent group-hover:text-accent group-hover:bg-accent/[0.06] transition-all duration-300 -rotate-45 group-hover:rotate-0">
                  →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
