'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const experiences = [
  { period:'2023 — Present', company:'Scale AI', role:'Senior Software Engineer',
    desc:'Leading frontend architecture for AI evaluation tooling. Built a real-time annotation platform reducing ML data labelling cycles from days to hours, used by Fortune 500 clients.' },
  { period:'2021 — 2023', company:'Stripe', role:'Software Engineer II',
    desc:'Core contributor to Stripe Elements and Payment Links. Led accessibility overhaul achieving WCAG 2.1 AA across checkout — reduced support tickets by 34%.' },
  { period:'2019 — 2021', company:'Figma', role:'Software Engineer',
    desc:'Built the plugin API infrastructure, now powering 1M+ plugins. Contributed to WebGL rendering pipeline improvements that significantly boosted canvas performance.' },
  { period:'2018 — 2019', company:'YC W19', role:'Co-Founder & CTO',
    desc:'Sole technical founder. Zero to $180k ARR in 9 months. Hired 4 engineers, architected the full stack, raised $1.2M seed. Hard shutdown after pivot failed — learned more than any job.' },
]

export default function ExperienceSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once:true, amount:0.1 })

  return (
    <section id="experience" className="py-[160px] px-[5vw] max-w-[1300px] mx-auto" ref={ref}>
      <div className="mb-20">
        <motion.div
          initial={{ opacity:0, y:50 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.9, ease:[0.23,1,0.32,1] }}
          className="font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4"
        >// Experience</motion.div>
        <motion.h2
          initial={{ opacity:0, y:50 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.9, delay:0.1, ease:[0.23,1,0.32,1] }}
          className="font-display leading-[.9] tracking-[.02em]"
          style={{ fontSize:'clamp(52px,6vw,84px)' }}
        >Where I've<br />Worked</motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-[var(--border)]">
        {experiences.map((exp, i) => (
          <motion.div key={exp.company}
            initial={{ opacity:0, y:60 }}
            animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:1, delay:i*0.1, ease:[0.23,1,0.32,1] }}
            className="exp-card relative overflow-hidden p-11 bg-[rgba(240,236,227,.015)] transition-colors duration-300 hover:bg-[rgba(232,255,71,.02)] group"
          >
            <style>{`
              .exp-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
                background:linear-gradient(90deg,var(--accent),transparent);
                transform:scaleX(0); transform-origin:left;
                transition:transform .5s cubic-bezier(.23,1,.32,1); }
              .exp-card:hover::before { transform:scaleX(1); }
            `}</style>
            <div className="font-mono text-[10px] tracking-[.18em] uppercase text-[var(--muted)] mb-1.5">{exp.period}</div>
            <div className="inline-block px-3 py-1 mb-5 font-mono text-[10px] tracking-[.1em] text-[var(--accent)]"
              style={{ background:'rgba(232,255,71,.08)', border:'1px solid rgba(232,255,71,.2)' }}>
              {exp.company}
            </div>
            <div className="text-[22px] font-semibold text-[var(--cream)] mb-3 leading-[1.2]">{exp.role}</div>
            <p className="text-[13px] leading-[1.75] text-[var(--muted)]">{exp.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
