"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const jobs = [
  {
    period: "2023 — Present",
    company: "Scale AI",
    role: "Senior Software Engineer",
    desc: "Leading frontend architecture for AI evaluation tooling. Built a real-time annotation platform reducing ML data labelling cycles from days to hours, used by Fortune 500 clients.",
  },
  {
    period: "2021 — 2023",
    company: "Stripe",
    role: "Software Engineer II",
    desc: "Core contributor to Stripe Elements and Payment Links. Led accessibility overhaul achieving WCAG 2.1 AA across checkout — reduced support tickets by 34%.",
  },
  {
    period: "2019 — 2021",
    company: "Figma",
    role: "Software Engineer",
    desc: "Built the plugin API infrastructure, now powering 1M+ plugins. Contributed to WebGL rendering pipeline improvements that significantly boosted canvas performance.",
  },
  {
    period: "2018 — 2019",
    company: "YC W19",
    role: "Co-Founder & CTO",
    desc: "Sole technical founder. Zero to $180k ARR in 9 months. Hired 4 engineers, architected the full stack, raised $1.2M seed. Hard shutdown after pivot failed — learned more than any job.",
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".exp-gsap-up").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>(".exp-card").forEach((card, i) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0, rotateX: 10 },
          {
            y: 0, opacity: 1, rotateX: 0, duration: 1, delay: i * 0.1, ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-40 px-[5vw]">
      <div className="max-w-[1300px] mx-auto">
        <div className="mb-20">
          <div className="exp-gsap-up font-mono text-[10px] tracking-[.22em] uppercase text-accent mb-4">
            // Experience
          </div>
          <h2 className="exp-gsap-up font-display text-[clamp(52px,6vw,84px)] leading-[.9] tracking-[.02em]">
            Where I've<br />Worked
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-cream/[0.08]">
          {jobs.map((j) => (
            <div
              key={j.company}
              className="exp-card relative overflow-hidden p-11 bg-cream/[0.015] hover:bg-accent/[0.02] transition-colors duration-300 cursor-none"
            >
              <div className="font-mono text-[10px] tracking-[.18em] uppercase text-cream/30 mb-1.5">
                {j.period}
              </div>
              <div className="inline-block px-3 py-1 bg-accent/[0.08] border border-accent/20 text-accent font-mono text-[10px] tracking-[.1em] mb-5">
                {j.company}
              </div>
              <h3 className="font-body text-[22px] font-semibold text-cream mb-3 leading-[1.2]">
                {j.role}
              </h3>
              <p className="text-[13px] leading-[1.75] text-cream/40">{j.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
