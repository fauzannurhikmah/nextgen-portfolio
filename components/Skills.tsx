"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { cat: "Frontend",   name: "React / Next.js",     tags: ["TypeScript","App Router","RSC","Suspense"],        w: 0.92 },
  { cat: "3D / WebGL", name: "Three.js / GLSL",      tags: ["WebGL","GLSL Shaders","R3F"],                     w: 0.88 },
  { cat: "Backend",    name: "Node.js / Go",          tags: ["gRPC","REST","Microservices"],                    w: 0.85 },
  { cat: "Data",       name: "PostgreSQL / Redis",    tags: ["ClickHouse","Kafka","Prisma"],                    w: 0.80 },
  { cat: "Infra",      name: "AWS / Kubernetes",      tags: ["Terraform","Docker","CI/CD"],                     w: 0.82 },
  { cat: "Motion",     name: "GSAP / Framer Motion",  tags: ["ScrollTrigger","Physics","SVG"],                  w: 0.90 },
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".skill-row").forEach((row, i) => {
        gsap.fromTo(row,
          { x: -60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: "expo.out",
            scrollTrigger: {
              trigger: row, start: "top 90%", once: true,
              onEnter: () => {
                const bar = row.querySelector<HTMLElement>(".sk-bar");
                if (bar) {
                  const w = parseFloat(row.dataset.w || "0.8");
                  gsap.to(bar, { scaleX: w, duration: 1.5, delay: 0.2, ease: "expo.out" });
                }
              },
            },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".skills-gsap-up").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-40 px-[5vw]">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex items-end justify-between mb-20 gap-10 flex-wrap">
          <h2 className="skills-gsap-up font-display text-[clamp(52px,6vw,84px)] leading-[.92] tracking-[.02em]">
            The <span className="text-accent">Stack</span>
          </h2>
          <p className="skills-gsap-up max-w-[340px] text-[14px] leading-[1.7] text-cream/40 md:text-right">
            Tools I reach for when precision matters.
          </p>
        </div>

        <table className="w-full border-collapse">
          <tbody>
            {skills.map((s) => (
              <tr
                key={s.name}
                className="skill-row border-b border-cream/[0.08] first:border-t first:border-cream/[0.08] hover:bg-accent/[0.02] transition-colors duration-200 cursor-none group"
                data-w={s.w}
              >
                <td className="py-5 font-mono text-[10px] tracking-[.2em] uppercase text-cream/35 w-40">
                  {s.cat}
                </td>
                <td className="py-5 font-body text-[18px] font-semibold text-cream group-hover:text-accent transition-colors duration-200 min-w-[200px]">
                  {s.name}
                </td>
                <td className="py-5 px-5 hidden md:table-cell">
                  <div className="flex gap-2 flex-wrap">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 border border-cream/[0.08] font-mono text-[10px] tracking-[.06em] text-cream/35 group-hover:border-accent/25 group-hover:text-accent/70 transition-all duration-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-5 w-32">
                  <div className="w-28 h-[2px] bg-cream/[0.1] overflow-hidden rounded-sm">
                    <div className="sk-bar h-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
