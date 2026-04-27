const items = [
  "React & Next.js", "Node.js & Go", "WebGL & Three.js",
  "Distributed Systems", "TypeScript", "Kubernetes",
  "Design Systems", "Performance Engineering",
];

export default function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div className="py-5 border-t border-b border-cream/[0.08] overflow-hidden bg-gradient-to-r from-accent/[0.04] via-transparent to-accent2/[0.04]">
      <div className="marquee-track flex gap-0 whitespace-nowrap">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-8 px-8 font-display text-[clamp(13px,1.6vw,17px)] tracking-[.18em] uppercase text-cream/35"
          >
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-accent flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
