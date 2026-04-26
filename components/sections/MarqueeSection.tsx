'use client'

const ITEMS = [
  'React & Next.js',
  'Node.js & Go',
  'WebGL & Three.js',
  'Distributed Systems',
  'TypeScript',
  'Kubernetes',
  'Design Systems',
  'Performance Engineering',
]

export default function MarqueeSection() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div
      className="relative py-[22px] overflow-hidden"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(90deg,rgba(232,255,71,.04),transparent 50%,rgba(255,107,53,.04))',
      }}
    >
      <div className="marquee-track flex gap-0 whitespace-nowrap">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-8 px-8 font-display text-[var(--muted)] uppercase tracking-[.18em]"
            style={{ fontSize: 'clamp(13px, 1.6vw, 17px)' }}
          >
            <span
              className="inline-block w-[5px] h-[5px] rounded-full bg-[var(--accent)] flex-shrink-0"
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
