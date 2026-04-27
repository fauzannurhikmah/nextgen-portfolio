'use client'

import { useEffect, useRef, useState } from 'react'

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'done'>('loading')
  const [progress, setProgress] = useState(0)
  const [displayNum, setDisplayNum] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const curtainTopRef = useRef<HTMLDivElement>(null)
  const curtainBotRef = useRef<HTMLDivElement>(null)

  // ── Fake progress counter ────────────────────────────────────────────────
  useEffect(() => {
    let current = 0
    const intervals = [
      { target: 30, speed: 18 },
      { target: 65, speed: 28 },
      { target: 88, speed: 40 },
      { target: 100, speed: 22 },
    ]
    let idx = 0
    const tick = () => {
      const { target, speed } = intervals[idx]
      if (current < target) {
        current = Math.min(current + 1, target)
        setProgress(current)
        setDisplayNum(current)
        setTimeout(tick, speed + Math.random() * 15)
      } else {
        idx++
        if (idx < intervals.length) setTimeout(tick, 80)
        else {
          // Finished loading → trigger reveal
          setTimeout(() => setPhase('reveal'), 300)
        }
      }
    }
    tick()
  }, [])

  // ── WebGL: animated noise/grid on canvas ─────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animId: number

    const W = () => canvas.width
    const H = () => canvas.height
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const init = async () => {
      const THREE = await import('three')
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false })
      renderer.setPixelRatio(1)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x08090f, 1)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      const geo = new THREE.PlaneGeometry(2, 2)
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uProgress: { value: 0 } },
        vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
        fragmentShader: `
          uniform float uTime;
          uniform float uProgress;
          void main() {
            vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth}.0, ${window.innerHeight}.0);
            float grid = step(0.98, sin(uv.x * 80.0)) + step(0.98, sin(uv.y * 80.0));
            float accent = step(0.995, sin(uv.x * 80.0)) * step(0.995, sin(uv.y * 80.0));
            float pulse = sin(uTime * 2.0 + uv.x * 4.0 + uv.y * 4.0) * 0.5 + 0.5;
            float prog = uProgress;
            float reveal = step(uv.x, prog);
            vec3 bg = vec3(0.031, 0.035, 0.059);
            vec3 gridCol = vec3(0.08, 0.10, 0.14) * (0.5 + pulse * 0.5);
            vec3 accentCol = vec3(0.91, 1.0, 0.278) * pulse;
            vec3 col = bg + gridCol * grid * 0.6 + accentCol * accent * 1.2;
            col *= 0.85 + reveal * 0.15;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })
      scene.add(new THREE.Mesh(geo, mat))

      let t = 0
      const render = () => {
        animId = requestAnimationFrame(render)
        t += 0.016
        mat.uniforms.uTime.value = t
        renderer.render(scene, camera)
      }
      render()

      return { mat }
    }

    init()
    return () => cancelAnimationFrame(animId)
  }, [])

  // ── Curtain reveal animation ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal') return
    const top = curtainTopRef.current
    const bot = curtainBotRef.current
    if (!top || !bot) return

    // Slide curtains apart
    top.style.transition = 'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)'
    bot.style.transition = 'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)'
    top.style.transform = 'translateY(-100%)'
    bot.style.transform = 'translateY(100%)'

    setTimeout(() => setPhase('done'), 1200)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ pointerEvents: phase === 'reveal' ? 'none' : 'all' }}
    >
      {/* WebGL background grid */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* ── Curtains (split screen reveal) ── */}
      <div ref={curtainTopRef} className="absolute inset-0 flex flex-col"
        style={{ background: 'var(--ink)', transformOrigin: 'top', bottom: '50%' }}>

        {/* TOP HALF CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-end pb-12 relative z-10">

          {/* Logo */}
          <div className="font-display text-[clamp(36px,5vw,64px)] tracking-[.08em] text-[var(--cream)] mb-10 select-none">
            FAUZAN<span style={{ color: 'var(--accent)' }}>.</span>
          </div>

          {/* Progress bar */}
          <div className="w-[280px] relative">
            <div className="w-full h-px" style={{ background: 'rgba(240,236,227,0.08)' }} />
            <div
              className="absolute top-0 left-0 h-px transition-none"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent2), var(--accent))',
                boxShadow: '0 0 12px var(--accent)',
                transition: 'width 0.1s linear',
              }}
            />
            {/* Glowing tip */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{
                left: `${progress}%`,
                transform: 'translate(-50%, -50%)',
                background: 'var(--accent)',
                boxShadow: '0 0 16px var(--accent), 0 0 6px var(--accent)',
                transition: 'left 0.1s linear',
              }}
            />
          </div>

          {/* Status text */}
          <div className="mt-6 font-mono text-[9px] tracking-[.25em] uppercase"
            style={{ color: 'rgba(240,236,227,0.3)' }}>
            {progress < 30 && 'Initialising systems...'}
            {progress >= 30 && progress < 65 && 'Loading assets...'}
            {progress >= 65 && progress < 88 && 'Compiling shaders...'}
            {progress >= 88 && 'Launching...'}
          </div>
        </div>
      </div>

      <div ref={curtainBotRef} className="absolute inset-0 flex flex-col"
        style={{ background: 'var(--ink)', transformOrigin: 'bottom', top: '50%' }}>

        {/* BOTTOM HALF CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-start pt-12 relative z-10">

          {/* Counter */}
          <div className="relative overflow-hidden h-20 flex items-center justify-center">
            <span
              className="font-display text-[80px] leading-none select-none"
              style={{
                color: displayNum === 100 ? 'var(--accent)' : 'var(--cream)',
                letterSpacing: '-0.02em',
                transition: 'color 0.3s',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(displayNum).padStart(2, '0')}
            </span>
            <span className="font-display text-[32px] leading-none select-none self-start mt-2 ml-1"
              style={{ color: 'var(--accent)' }}>
              %
            </span>
          </div>

          {/* Tagline */}
          <div className="font-mono text-[10px] tracking-[.3em] uppercase mt-4 text-center"
            style={{ color: 'rgba(240,236,227,0.2)', maxWidth: '260px', lineHeight: 2 }}>
            Engineering precision<br />meets design intuition.
          </div>
        </div>
      </div>

      {/* Center dividing line (glows during loading) */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: '50%',
          background: `linear-gradient(90deg, transparent, var(--accent) ${progress}%, rgba(240,236,227,0.06) ${progress}%, transparent)`,
          boxShadow: progress > 50 ? `0 0 20px var(--accent)` : 'none',
          transition: 'background 0.1s linear, box-shadow 0.3s',
        }}
      />

      {/* Corner decorations */}
      {[
        'top-6 left-6 border-t border-l',
        'top-6 right-6 border-t border-r',
        'bottom-6 left-6 border-b border-l',
        'bottom-6 right-6 border-b border-r',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-6 h-6 ${cls}`}
          style={{ borderColor: 'rgba(232,255,71,0.3)' }} />
      ))}

      {/* Scan line animation */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(232,255,71,0.12), transparent)',
          animation: 'scanLine 2.5s ease-in-out infinite',
          top: 0,
        }}
      />

      <style>{`
        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
