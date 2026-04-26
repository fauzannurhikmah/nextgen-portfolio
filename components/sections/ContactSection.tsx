'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const socials = [
  { label: 'GitHub', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'Read.cv', href: '#' },
]

export default function ContactSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="contact"
      className="py-[160px] px-[5vw] text-center relative overflow-hidden"
      ref={ref}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,255,71,.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-[800px] mx-auto relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-6"
        >
          Let's build together
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="contact-head font-display leading-[.88] tracking-[.01em] mb-10"
          style={{ fontSize: 'clamp(64px, 11vw, 160px)' }}
        >
          LET'S
          <br />
          TALK.
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="text-[16px] leading-[1.7] text-[var(--muted)] max-w-[480px] mx-auto mb-14"
        >
          Building something ambitious? Have a complex problem? Or just want to talk craft — my inbox is open.
        </motion.p>

        <motion.a
          href="mailto:fauzannurhikmah0@gmail.com"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block font-display tracking-[.04em] text-[var(--cream)] no-underline pb-2 transition-colors duration-300 hover:text-[var(--accent)] hover:border-[var(--accent)]"
          style={{
            fontSize: 'clamp(28px, 4.5vw, 56px)',
            borderBottom: '1px solid rgba(232,255,71,.3)',
          }}
        >
          fauzannurhikmah0@gmail.com
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="flex justify-center gap-4 mt-14 flex-wrap"
        >
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center gap-2 px-[22px] py-2.5 border border-[var(--border)] text-[var(--muted)] font-mono text-[10px] tracking-[.14em] uppercase no-underline transition-all duration-200 hover:border-[rgba(240,236,227,.35)] hover:text-[var(--cream)] hover:-translate-y-1"
            >
              ⟶ {s.label}
            </Link>
          ))}
        </motion.div>

        <div
          className="mt-[100px] pt-8 flex justify-between items-center"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="font-mono text-[10px] tracking-[.12em] text-[rgba(240,236,227,.2)] uppercase">
            © 2025 Fauzan Nurhikmah
          </span>
          <span className="font-mono text-[10px] tracking-[.12em] text-[rgba(240,236,227,.2)] uppercase">
            Built with craft, not templates
          </span>
        </div>
      </div>
    </section>
  )
}
