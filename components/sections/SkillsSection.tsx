'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const skills = [
  { cat: 'Frontend', name: 'React / Next.js', tags: ['TypeScript', 'App Router', 'RSC', 'Suspense'], bar: 0.92 },
  { cat: '3D / WebGL', name: 'Three.js / GLSL', tags: ['WebGL', 'GLSL Shaders', 'R3F'], bar: 0.88 },
  { cat: 'Backend', name: 'Node.js / Go', tags: ['gRPC', 'REST', 'Microservices'], bar: 0.85 },
  { cat: 'Data', name: 'PostgreSQL / Redis', tags: ['ClickHouse', 'Kafka', 'Prisma'], bar: 0.8 },
  { cat: 'Infra', name: 'AWS / Kubernetes', tags: ['Terraform', 'Docker', 'CI/CD'], bar: 0.82 },
  { cat: 'Motion', name: 'GSAP / Framer', tags: ['ScrollTrigger', 'Physics', 'SVG'], bar: 0.9 },
]

export default function SkillsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="skills" className="py-[160px] px-[5vw]">
      <div className="max-w-[1300px] mx-auto" ref={ref}>
        <div className="flex items-end justify-between flex-wrap gap-10 mb-20 md:flex-nowrap">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            className="font-display leading-[.92] tracking-[.02em]"
            style={{ fontSize: 'clamp(52px, 6vw, 84px)' }}
          >
            The{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>Stack</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-[340px] text-sm leading-[1.7] text-[var(--muted)] md:text-right"
          >
            Tools I reach for when precision matters.
          </motion.p>
        </div>

        <table className="w-full border-collapse">
          <tbody>
            {skills.map((skill, i) => (
              <SkillRow key={skill.name} skill={skill} index={i} parentInView={inView} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SkillRow({
  skill,
  index,
  parentInView,
}: {
  skill: (typeof skills)[0]
  index: number
  parentInView: boolean
}) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rowRef, { once: true })

  useEffect(() => {
    if (inView && barRef.current) {
      const el = barRef.current
      setTimeout(() => {
        el.style.transform = `scaleX(${skill.bar})`
      }, 300 + index * 80)
    }
  }, [inView, skill.bar, index])

  return (
    <motion.tr
      ref={rowRef}
      initial={{ x: -60, opacity: 0 }}
      animate={inView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
      className="group cursor-none"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <td className="py-5 align-middle font-mono text-[10px] tracking-[.2em] uppercase text-[var(--muted)] w-40">
        {skill.cat}
      </td>
      <td className="py-5 align-middle text-[18px] font-semibold text-[var(--cream)] transition-colors duration-200 group-hover:text-[var(--accent)]">
        {skill.name}
      </td>
      <td className="py-5 align-middle px-5">
        <div className="flex gap-2 flex-wrap">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 border border-[var(--border)] font-mono text-[10px] tracking-[.06em] text-[var(--muted)] transition-all duration-200 group-hover:border-[rgba(232,255,71,.25)] group-hover:text-[rgba(232,255,71,.7)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="py-5 align-middle w-[120px]">
        <div className="w-[120px] h-[2px] bg-[var(--muted2)] overflow-hidden rounded-[1px]">
          <div ref={barRef} className="sk-bar" />
        </div>
      </td>
    </motion.tr>
  )
}
