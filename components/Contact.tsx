"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const socials = [
  { label: "GitHub",   href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter",  href: "#" },
  { label: "Read.cv",  href: "#" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".contact-gsap-up").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.fromTo(".contact-head", { y: 80, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.4, ease: "expo.out",
        scrollTrigger: { trigger: "#contact", start: "top 80%", once: true },
      });
      gsap.fromTo(".socials-wrap", { opacity: 0 }, {
        opacity: 1, duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: ".socials-wrap", start: "top 85%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-40 px-[5vw] text-center relative overflow-hidden border-t border-cream/[0.08]"
    >
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,255,71,0.07) 0%, transparent 70%)" }}
      />

      <div className="max-w-[800px] mx-auto relative z-[1]">
        <div className="contact-gsap-up font-mono text-[10px] tracking-[.22em] uppercase text-accent mb-6">
          Let's build together
        </div>

        <h2 className="contact-head font-display text-[clamp(64px,11vw,160px)] leading-[.88] tracking-[.01em] mb-10">
          LET'S<br />TALK.
        </h2>

        <p className="contact-gsap-up text-[16px] font-normal leading-[1.7] text-cream/40 max-w-[480px] mx-auto mb-14">
          Building something ambitious? Have a complex problem? Or just want to talk craft — my inbox is open.
        </p>

        <a
          href="mailto:alex@example.com"
          className="contact-gsap-up inline-block font-display text-[clamp(28px,4.5vw,56px)] tracking-[.04em] text-cream no-underline border-b border-accent/30 pb-2 hover:text-accent hover:border-accent transition-all duration-300"
        >
          alex@example.com
        </a>

        <div className="socials-wrap flex justify-center gap-4 mt-14 flex-wrap">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="flex items-center gap-2 px-5 py-2.5 border border-cream/[0.08] text-cream/40 font-mono text-[10px] tracking-[.14em] uppercase no-underline hover:border-cream/35 hover:text-cream hover:-translate-y-0.5 transition-all duration-200 cursor-none"
            >
              ⟶ {s.label}
            </a>
          ))}
        </div>

        <div className="mt-24 pt-8 border-t border-cream/[0.08] flex justify-between items-center flex-wrap gap-4">
          <span className="font-mono text-[10px] tracking-[.12em] uppercase text-cream/20">
            © 2024 Alex Chen
          </span>
          <span className="font-mono text-[10px] tracking-[.12em] uppercase text-cream/20">
            Built with craft, not templates
          </span>
        </div>
      </div>
    </section>
  );
}
