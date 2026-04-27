'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const projects = [
  { num:'01', title:'Prism — Design System',      desc:'Production component library powering 12 teams. Token-based architecture delivering pixel-perfect consistency across web and native. Cut UI dev time by 60%.',         tags:['React','TypeScript','Storybook'] },
  { num:'02', title:'Flowstate — AI Whiteboard',  desc:'Real-time collaborative canvas with AI ideation. 1000+ concurrent users via CRDT sync on Cloudflare Durable Objects. Sub-50ms frame latency.',                    tags:['Next.js','Rust WASM','WebSockets'] },
  { num:'03', title:'Meridian — Analytics Pipeline',desc:'50M events/day IoT ingestion pipeline. Sub-100ms query latency on aggregated time-series via ClickHouse + materialized views.',                                  tags:['Go','Kafka','ClickHouse'] },
  { num:'04', title:'Vessel — Dev CLI',            desc:'8k+ GitHub stars. Containerised microservice scaffolding tool that generates production-ready Dockerfiles, K8s manifests, and CI pipelines from a single config.', tags:['Rust','Docker SDK','Open Source'] },
]

export default function ProjectsSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once:true, amount:0.1 })

  return (
    <section id="projects" className="py-[160px] px-[5vw]"
      style={{ background:'linear-gradient(180deg,var(--ink) 0%,var(--ink2) 100%)' }}>
      <div className="max-w-[1300px] mx-auto" ref={ref}>
        <div className="mb-20">
          <motion.div
            initial={{ opacity:0, y:50 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:0.9, ease:[0.23,1,0.32,1] }}
            className="font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-4"
          >// Selected Work</motion.div>
          <motion.h2
            initial={{ opacity:0, y:50 }} animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:0.9, delay:0.1, ease:[0.23,1,0.32,1] }}
            className="font-display leading-[.9] tracking-[.02em]"
            style={{ fontSize:'clamp(52px,7vw,100px)' }}
          >
            Featured<br />
            <em style={{ fontStyle:'normal', WebkitTextStroke:'1px rgba(240,236,227,.25)', color:'transparent' }}>Projects</em>
          </motion.h2>
        </div>

        <div className="flex flex-col gap-px">
          {projects.map((proj, i) => (
            <motion.div key={proj.num}
              initial={{ opacity:0, y:40 }} animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ duration:0.9, delay:i*0.1, ease:[0.23,1,0.32,1] }}
              className="proj-item grid gap-8 items-center py-9 group cursor-none transition-all duration-[350ms] hover:pl-4"
              style={{ gridTemplateColumns:'80px 1fr auto', borderBottom:'1px solid var(--border)', borderTop: i===0 ? '1px solid var(--border)' : undefined }}
            >
              <div className="font-mono text-[12px] tracking-[.1em] text-[var(--muted)]">{proj.num}</div>
              <div>
                <h3 className="font-semibold text-[var(--cream)] mb-2.5 transition-colors duration-200 group-hover:text-[var(--accent)]"
                  style={{ fontSize:'clamp(20px,2.5vw,30px)' }}>
                  {proj.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--muted)] max-w-[600px]">{proj.desc}</p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-3.5">
                <div className="flex gap-2 flex-wrap justify-end">
                  {proj.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 border border-[var(--border)] font-mono text-[9px] tracking-[.1em] uppercase text-[var(--muted)]">{tag}</span>
                  ))}
                </div>
                <div className="w-[42px] h-[42px] flex items-center justify-center text-lg text-[var(--muted)] border border-[var(--border)] -rotate-45 transition-all duration-300 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:rotate-0 group-hover:bg-[rgba(232,255,71,.06)]">→</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
