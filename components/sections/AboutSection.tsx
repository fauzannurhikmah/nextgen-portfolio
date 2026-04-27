'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden:  { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1] } },
}

const stats = [
  { val: '6', sup: '+', key: 'Years active' },
  { val: '40', sup: '+', key: 'Projects shipped' },
  { val: '3',  sup: 'x', key: 'Companies scaled' },
  { val: '1M', sup: '+', key: 'Users reached' },
]

const strengths = [
  { icon: '⚡', title: 'Performance Engineering', desc: 'Core Web Vitals obsessive. Sub-100ms or bust.' },
  { icon: '🏗', title: 'Systems Architecture',   desc: 'Scalable from day 1, not day 100,000.' },
  { icon: '🎨', title: 'Design Engineering',      desc: 'The gap between design and code is my home.' },
]

export default function AboutSection() {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="about" ref={ref} className="relative py-[160px] px-[5vw]">
      <div className="max-w-[1300px] mx-auto">
        {/* Section label — top left */}
        <motion.div
          variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-16"
        >// About</motion.div>

        {/* Layout: text on left, right half is where 3D object will float */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] md:gap-[100px] items-start">
          {/* LEFT — headline */}
          <div>
            <motion.h2
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              transition={{ delay: 0.1 }}
              className="font-display leading-[.92] tracking-[.02em] text-[var(--cream)]"
              style={{ fontSize: 'clamp(52px,6.5vw,90px)' }}
            >
              I Build<br />Things<br />
              <em style={{ fontStyle:'normal', WebkitTextStroke:'1px rgba(240,236,227,.3)', color:'transparent', display:'block' }}>
                That Ship.
              </em>
            </motion.h2>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 1.2 }}
              className="grid grid-cols-2 gap-px mt-12 border border-[var(--border)]"
            >
              {stats.map(s => (
                <div key={s.key}
                  className="p-7 bg-[rgba(240,236,227,.02)] transition-colors duration-300 hover:bg-[rgba(232,255,71,.04)]"
                >
                  <div className="font-display text-[48px] leading-none text-[var(--cream)] tracking-[.02em]">
                    {s.val}<span className="text-[24px] text-[var(--accent)]">{s.sup}</span>
                  </div>
                  <div className="font-mono text-[10px] tracking-[.16em] uppercase text-[var(--muted)] mt-2">{s.key}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — bio + strengths */}
          <div className="pt-2">
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="text-[16px] leading-[1.82] text-[rgba(240,236,227,.62)] mb-6"
            >
              <strong className="text-[var(--cream)] font-medium">Fauzan Nurhikmah</strong> — Senior Engineer & Full Stack Developer. I specialise in the full spectrum: from WebGL shaders and React component libraries to distributed backend systems processing millions of events.
            </motion.p>
            <motion.p
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              transition={{ delay: 0.1 }}
              className="text-[16px] leading-[1.82] text-[rgba(240,236,227,.62)] mb-10"
            >
              I don't just write code — I architect decisions that compound over time. Every PR is a product decision. Every abstraction has a cost.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-0"
            >
              {strengths.map(s => (
                <div key={s.title}
                  className="strength-row flex items-center gap-4 py-4 transition-all duration-300 group"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 border border-[var(--border)] transition-all duration-300 group-hover:border-[rgba(232,255,71,.4)] group-hover:bg-[rgba(232,255,71,.06)]">
                    {s.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--cream)] mb-0.5">{s.title}</h4>
                    <p className="text-[13px] text-[var(--muted)]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
