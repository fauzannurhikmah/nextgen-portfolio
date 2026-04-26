'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav
      id="nav"
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-[5vw] py-7"
      style={{ transition: 'background 0.4s' }}
    >
      <style>{`
        #nav::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(8,9,15,.8), transparent);
          opacity: 0;
          transition: opacity .4s;
          pointer-events: none;
        }
        #nav.nav-solid::before { opacity: 1; }
      `}</style>

      <Link
        href="#"
        className="font-display text-[22px] tracking-[.06em] text-[var(--cream)] no-underline z-10 relative"
      >
        FAUZAN<span className="text-[var(--accent)]">.</span>
      </Link>

      <div className="flex items-center gap-9 z-10 relative">
        <ul className="hidden md:flex gap-8 list-none">
          {['About', 'Skills', 'Projects', 'Experience'].map((item) => (
            <li key={item}>
              <Link
                href={`#${item.toLowerCase()}`}
                className="font-mono text-[11px] tracking-[.18em] uppercase text-[var(--muted)] no-underline transition-colors duration-200 hover:text-[var(--cream)]"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="#contact"
          className="px-6 py-[9px] bg-[var(--accent)] text-[var(--ink)] font-mono text-[11px] font-medium tracking-[.12em] uppercase rounded-[2px] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(232,255,71,.25)]"
        >
          Hire Me
        </Link>
      </div>
    </nav>
  )
}
