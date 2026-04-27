"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { val: "6", sup: "+", key: "Years active" },
  { val: "40", sup: "+", key: "Projects shipped" },
  { val: "3", sup: "x", key: "Companies scaled" },
  { val: "1M", sup: "+", key: "Users reached" },
];

const strengths = [
  { icon: "⚡", title: "Performance Engineering", desc: "Core Web Vitals obsessive. Sub-100ms or bust." },
  { icon: "🏗", title: "Systems Architecture", desc: "Scalable from day 1, not day 100,000." },
  { icon: "🎨", title: "Design Engineering", desc: "The gap between design and code is my home." },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".about-gsap-up").forEach((el) => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true } }
        );
      });
      gsap.fromTo(".about-gsap-fade",
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: ".about-gsap-fade", start: "top 85%", once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-[100px] py-40 px-[5vw] max-w-[1300px] mx-auto"
    >
      {/* Left */}
      <div>
        <div className="about-gsap-up font-mono text-[10px] tracking-[.22em] uppercase text-accent mb-5">
          // About
        </div>
        <h2 className="about-gsap-up font-display text-[clamp(52px,6.5vw,90px)] leading-[.92] tracking-[.02em] text-cream">
          I Build<br />Things<br />
          <span className="stroke-text">That Ship.</span>
        </h2>
      </div>

      {/* Right */}
      <div className="pt-5">
        <p className="about-gsap-up text-[16px] font-normal leading-[1.82] text-cream/60 mb-6">
          <strong className="text-cream font-medium">Alex Chen</strong> — Senior Engineer at Scale AI. Previously Stripe, Figma. I specialise in the full spectrum: from WebGL shaders and React component libraries to distributed backend systems processing millions of events.
        </p>
        <p className="about-gsap-up text-[16px] font-normal leading-[1.82] text-cream/60 mb-6">
          I don't just write code — I architect decisions that compound over time. Every PR is a product decision. Every abstraction has a cost.
        </p>

        {/* Stats */}
        <div className="about-gsap-fade grid grid-cols-2 gap-px border border-cream/[0.08] mt-12">
          {stats.map((s) => (
            <div
              key={s.key}
              className="p-7 bg-cream/[0.02] hover:bg-accent/[0.04] transition-colors duration-300"
            >
              <div className="font-display text-[52px] leading-none text-cream tracking-[.02em]">
                {s.val}<span className="text-[28px] text-accent">{s.sup}</span>
              </div>
              <div className="font-mono text-[10px] tracking-[.16em] uppercase text-cream/35 mt-2">{s.key}</div>
            </div>
          ))}
        </div>

        {/* Strengths */}
        <div className="about-gsap-up mt-10 flex flex-col">
          {strengths.map((s) => (
            <div
              key={s.title}
              data-hover
              className="flex items-center gap-4 py-3.5 border-b border-cream/[0.08] group cursor-none transition-all duration-300 hover:pl-2"
            >
              <div className="w-8 h-8 border border-cream/[0.08] flex items-center justify-center text-sm flex-shrink-0 group-hover:border-accent/40 group-hover:bg-accent/[0.06] transition-all duration-300">
                {s.icon}
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-cream mb-0.5">{s.title}</h4>
                <p className="text-[13px] text-cream/40">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
