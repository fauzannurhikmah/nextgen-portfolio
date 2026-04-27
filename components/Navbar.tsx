"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[200] px-[5vw] py-7 flex items-center justify-between transition-all duration-500 ${
        scrolled
          ? "bg-ink/85 backdrop-blur-md border-b border-cream/[0.07]"
          : "bg-transparent"
      }`}
    >
      <Link href="/" className="font-display text-[22px] tracking-[.06em] text-cream no-underline">
        ALEX<span className="text-accent">.</span>
      </Link>

      <div className="flex items-center gap-9">
        <ul className="hidden md:flex gap-8 list-none">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-[11px] tracking-[.18em] uppercase text-cream/40 no-underline hover:text-cream transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="#contact"
          className="px-6 py-[9px] bg-accent text-ink font-mono text-[11px] font-medium tracking-[.12em] uppercase rounded-sm hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(232,255,71,0.25)] transition-all duration-200 no-underline"
        >
          Hire Me
        </Link>
      </div>
    </nav>
  );
}
