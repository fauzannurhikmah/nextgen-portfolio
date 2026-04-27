'use client'

import { useEffect, useRef } from 'react'

// Narrative chapters that appear as you scroll
const CHAPTERS = [
  {
    tag: '// 01 — Foundation',
    title: 'Architect\nFirst.',
    titleAccent: '',
    body: 'Every system that scales starts with a question: "What if 100× more users hit this tomorrow?" I design for that day from line one.',
    align: 'left',
    progress: 0,        // scroll 0–30%
  },
  {
    tag: '// 02 — Craft',
    title: 'Code is\n',
    titleAccent: 'Communication.',
    body: 'Clarity over cleverness. Naming matters. A function name that lies is a bug. A module that hides intent is debt. I write for the engineer who comes next.',
    align: 'left',
    progress: 0.35,     // scroll 30–65%
  },
  {
    tag: '// 03 — Ship',
    title: 'Iteration\nis the\n',
    titleAccent: 'Strategy.',
    body: 'Perfect is the enemy of shipped. Fast feedback loops. Measure, cut, re-measure. The helix never stops spinning — neither do I.',
    align: 'left',
    progress: 0.68,     // scroll 65–100%
  },
]

export default function ThreeDSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const chapRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    let animId: number

    const init = async () => {
      const THREE = await import('three')

      const W = () => canvas.parentElement!.offsetWidth
      const H = () => canvas.parentElement!.offsetHeight

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setSize(W(), H())
      renderer.shadowMap.enabled = true

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100)
      camera.position.set(0, 0, 14)

      // ─── DNA HELIX ───────────────────────────────────────────────────────────
      const group = new THREE.Group()
      scene.add(group)

      const POINTS = 140, TURNS = 5, HEIGHT = 14
      const strandMat1 = new THREE.MeshStandardMaterial({
        color: 0x00d4c8, emissive: 0x007060, metalness: 0.7, roughness: 0.2,
      })
      const strandMat2 = new THREE.MeshStandardMaterial({
        color: 0xff6b35, emissive: 0x6b2500, metalness: 0.7, roughness: 0.2,
      })
      const bridgeMat = new THREE.MeshStandardMaterial({
        color: 0xf0ece3, emissive: 0x202020, metalness: 0.3, roughness: 0.6,
        transparent: true, opacity: 0.55,
      })
      const nodeMat1 = new THREE.MeshStandardMaterial({
        color: 0xe8ff47, emissive: 0x4a5200, metalness: 0.8, roughness: 0.15,
      })

      const strand1Pts: any[] = [], strand2Pts: any[] = []
      for (let i = 0; i < POINTS; i++) {
        const t = i / (POINTS - 1)
        const angle = t * Math.PI * 2 * TURNS
        const y = (t - 0.5) * HEIGHT
        const r = 2.0 + Math.sin(t * Math.PI * 2) * 0.2   // slight radius pulse
        const x1 = Math.cos(angle) * r,  z1 = Math.sin(angle) * r
        const x2 = Math.cos(angle + Math.PI) * r, z2 = Math.sin(angle + Math.PI) * r
        strand1Pts.push(new THREE.Vector3(x1, y, z1))
        strand2Pts.push(new THREE.Vector3(x2, y, z2))

        // Accent nodes every 12 steps
        if (i % 12 === 0) {
          const ng = new THREE.SphereGeometry(0.22, 12, 12)
          const n1 = new THREE.Mesh(ng, nodeMat1.clone())
          const n2 = new THREE.Mesh(ng, nodeMat1.clone())
          n1.position.set(x1, y, z1); n2.position.set(x2, y, z2)
          group.add(n1, n2)
        }

        // Small strand spheres
        if (i % 3 === 0) {
          const sg = new THREE.SphereGeometry(0.10, 8, 8)
          const s1 = new THREE.Mesh(sg, strandMat1.clone())
          const s2 = new THREE.Mesh(sg, strandMat2.clone())
          s1.position.set(x1, y, z1); s2.position.set(x2, y, z2)
          group.add(s1, s2)
        }

        // Bridges every 7
        if (i % 7 === 0) {
          const len = new THREE.Vector3(x1 - x2, 0, z1 - z2).length()
          const bg = new THREE.CylinderGeometry(0.035, 0.035, len, 6)
          const bridge = new THREE.Mesh(bg, bridgeMat)
          bridge.position.set((x1 + x2) / 2, y, (z1 + z2) / 2)
          bridge.lookAt(new THREE.Vector3(x2, y, z2))
          bridge.rotateX(Math.PI / 2)
          group.add(bridge)
        }
      }

      // Smooth tube backbones
      const c1 = new THREE.CatmullRomCurve3(strand1Pts)
      const c2 = new THREE.CatmullRomCurve3(strand2Pts)
      group.add(new THREE.Mesh(new THREE.TubeGeometry(c1, POINTS * 3, 0.055, 10, false), strandMat1))
      group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, POINTS * 3, 0.055, 10, false), strandMat2))

      // ─── FLOATING PARTICLES ───────────────────────────────────────────────────
      const partGeo = new THREE.BufferGeometry()
      const partCount = 80
      const partPos = new Float32Array(partCount * 3)
      const partPhase = new Float32Array(partCount)
      for (let i = 0; i < partCount; i++) {
        partPos[i * 3]     = (Math.random() - 0.5) * 16
        partPos[i * 3 + 1] = (Math.random() - 0.5) * 16
        partPos[i * 3 + 2] = (Math.random() - 0.5) * 4
        partPhase[i] = Math.random() * Math.PI * 2
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3))
      const partMat = new THREE.PointsMaterial({
        color: 0xe8ff47, size: 0.06, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const particles = new THREE.Points(partGeo, partMat)
      scene.add(particles)

      // ─── LIGHTS ───────────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.35))
      const dl1 = new THREE.DirectionalLight(0x00d4c8, 2.5); dl1.position.set(6, 10, 5); scene.add(dl1)
      const dl2 = new THREE.DirectionalLight(0xff6b35, 2.0); dl2.position.set(-6, -5, -3); scene.add(dl2)
      const pl  = new THREE.PointLight(0xe8ff47, 2.0, 25); pl.position.set(0, 0, 8); scene.add(pl)
      const pl2 = new THREE.PointLight(0x00d4c8, 1.5, 20); pl2.position.set(-4, 4, 6); scene.add(pl2)

      // ─── SCROLL JOURNEY CONFIG ────────────────────────────────────────────────
      // Object travels a cinematic path from right → center → left → right
      // while camera also shifts subtly
      const PATH = {
        x:     [ 5.5,   0,  -4.5,  5.5],  // group X positions per chapter
        y:     [ 0,    -1,    1,   0  ],   // group Y
        rotY:  [ 0, Math.PI * 2, Math.PI * 4, Math.PI * 6], // accumulated Y rotation
        scale: [ 1.0,  1.15, 0.95, 1.0],  // group scale
        camZ:  [14,    12,   13,   14 ],   // camera Z
      }

      let scrollProg = 0
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t

      const getPathValue = (arr: number[], p: number) => {
        const seg = p * (arr.length - 1)
        const i = Math.min(Math.floor(seg), arr.length - 2)
        const f = seg - i
        // smooth step
        const sf = f * f * (3 - 2 * f)
        return lerp(arr[i], arr[i + 1], sf)
      }

      const onScroll = () => {
        const rect = section.getBoundingClientRect()
        const totalH = section.offsetHeight - window.innerHeight
        scrollProg = Math.max(0, Math.min(1, -rect.top / totalH))

        // ── Chapter text fade in/out ──────────────────────────────────────────
        chapRefs.current.forEach((el, ci) => {
          if (!el) return
          const chap = CHAPTERS[ci]
          const nextProg = ci < CHAPTERS.length - 1 ? CHAPTERS[ci + 1].progress : 1.1

          // Visible window for each chapter
          const fadeIn  = chap.progress
          const fullOn  = chap.progress + 0.06
          const fadeOut = nextProg - 0.06
          const fullOff = nextProg

          let opacity = 0
          let ty = 40
          if (scrollProg >= fadeIn && scrollProg < fullOn) {
            const t = (scrollProg - fadeIn) / (fullOn - fadeIn)
            opacity = t
            ty = 40 * (1 - t)
          } else if (scrollProg >= fullOn && scrollProg < fadeOut) {
            opacity = 1
            ty = 0
          } else if (scrollProg >= fadeOut && scrollProg < fullOff) {
            const t = (scrollProg - fadeOut) / (fullOff - fadeOut)
            opacity = 1 - t
            ty = -30 * t
          }

          el.style.opacity = String(opacity)
          el.style.transform = `translateY(${ty}px)`
        })
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', () => {
        renderer.setSize(W(), H())
        camera.aspect = W() / H()
        camera.updateProjectionMatrix()
      })

      // ─── RENDER LOOP ──────────────────────────────────────────────────────────
      let t = 0
      let curX = PATH.x[0], curY = PATH.y[0], curRotY = 0, curScale = 1, curCamZ = 14

      const render = () => {
        animId = requestAnimationFrame(render)
        t += 0.007

        // Scroll-driven targets
        const tgX     = getPathValue(PATH.x, scrollProg)
        const tgY     = getPathValue(PATH.y, scrollProg)
        const tgRotY  = getPathValue(PATH.rotY, scrollProg)
        const tgScale = getPathValue(PATH.scale, scrollProg)
        const tgCamZ  = getPathValue(PATH.camZ, scrollProg)

        // Smooth follow with different lerp speeds for cinematic feel
        curX     += (tgX - curX) * 0.04
        curY     += (tgY - curY) * 0.04
        curRotY  += (tgRotY - curRotY) * 0.03
        curScale += (tgScale - curScale) * 0.05
        curCamZ  += (tgCamZ - curCamZ) * 0.04

        group.position.x = curX
        group.position.y = curY
        group.rotation.y = curRotY + t * 0.18   // base spin + scroll accumulated
        group.scale.setScalar(curScale)

        camera.position.z = curCamZ
        // Subtle camera Y sway
        camera.position.y = Math.sin(t * 0.3) * 0.3

        // Pulsing lights
        pl.intensity  = 2.0 + Math.sin(t * 1.8) * 0.7
        pl2.intensity = 1.5 + Math.cos(t * 1.4) * 0.5

        // Particles drift
        const pa = partGeo.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < partCount; i++) {
          pa.setY(i, pa.getY(i) + Math.sin(t + partPhase[i]) * 0.003)
          pa.setX(i, pa.getX(i) + Math.cos(t * 0.7 + partPhase[i]) * 0.002)
        }
        pa.needsUpdate = true
        partMat.opacity = 0.3 + Math.sin(t * 0.5) * 0.15

        renderer.render(scene, camera)
      }
      render()
    }

    init()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div id="three-section" ref={sectionRef} className="relative" style={{ height: '400vh' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* WebGL canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Dark gradient sides — gives cinematic letterbox feel */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(8,9,15,0.82) 0%, transparent 35%, transparent 65%, rgba(8,9,15,0.82) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(8,9,15,0.6) 0%, transparent 15%, transparent 85%, rgba(8,9,15,0.9) 100%)' }} />

        {/* Chapter text panels — absolutely positioned, fade in/out via scroll */}
        {CHAPTERS.map((ch, ci) => (
          <div
            key={ci}
            ref={el => { chapRefs.current[ci] = el }}
            className="absolute inset-0 flex flex-col justify-center px-[6vw] pointer-events-none"
            style={{ opacity: ci === 0 ? 0 : 0, transition: 'none', maxWidth: '520px' }}
          >
            {/* Chapter tag */}
            <div className="font-mono text-[10px] tracking-[.28em] uppercase text-[var(--accent)] mb-6"
              style={{ opacity: 0.85 }}>
              {ch.tag}
            </div>

            {/* Big headline */}
            <h2
              className="font-display leading-[.88] tracking-[.01em] mb-8"
              style={{ fontSize: 'clamp(52px, 6.5vw, 96px)' }}
            >
              {ch.title.split('\n').map((line, li) => (
                <span key={li} className="block text-[var(--cream)]">{line}</span>
              ))}
              {ch.titleAccent && (
                <span className="block" style={{ color: 'var(--accent)' }}>{ch.titleAccent}</span>
              )}
            </h2>

            {/* Body text */}
            <p className="text-[15px] leading-[1.85] max-w-[400px]"
              style={{ color: 'rgba(240,236,227,0.58)' }}>
              {ch.body}
            </p>

            {/* Chapter number indicator */}
            <div className="flex items-center gap-4 mt-10">
              {CHAPTERS.map((_, di) => (
                <div key={di}
                  className="h-px transition-all duration-500"
                  style={{
                    width: di === ci ? '48px' : '16px',
                    background: di === ci ? 'var(--accent)' : 'rgba(240,236,227,0.2)',
                  }} />
              ))}
              <span className="font-mono text-[9px] tracking-[.2em] uppercase"
                style={{ color: 'rgba(240,236,227,0.3)' }}>
                0{ci + 1} / 0{CHAPTERS.length}
              </span>
            </div>
          </div>
        ))}

        {/* Scroll progress bar — right edge */}
        <ScrollProgressBar sectionRef={sectionRef} />
      </div>
    </div>
  )
}

// ─── Scroll progress bar component ─────────────────────────────────────────
function ScrollProgressBar({ sectionRef }: { sectionRef: React.RefObject<HTMLDivElement> }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current
      const bar = barRef.current
      if (!section || !bar) return
      const rect = section.getBoundingClientRect()
      const totalH = section.offsetHeight - window.innerHeight
      const prog = Math.max(0, Math.min(1, -rect.top / totalH))
      bar.style.height = `${prog * 100}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sectionRef])

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3">
      <div className="font-mono text-[8px] tracking-[.2em] uppercase"
        style={{ color: 'rgba(240,236,227,0.25)', writingMode: 'vertical-rl' }}>
        Progress
      </div>
      <div className="w-px h-24 relative" style={{ background: 'rgba(240,236,227,0.1)' }}>
        <div ref={barRef} className="absolute top-0 left-0 w-full"
          style={{
            height: '0%',
            background: 'linear-gradient(to bottom, var(--accent), var(--accent2))',
            transition: 'height 0.1s linear',
            boxShadow: '0 0 8px var(--accent)',
          }} />
      </div>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
    </div>
  )
}
