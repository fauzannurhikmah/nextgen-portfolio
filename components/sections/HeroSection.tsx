'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const headline1Ref = useRef<HTMLSpanElement>(null)
  const headline2Ref = useRef<HTMLSpanElement>(null)
  const headline3Ref = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP hero entrance
    const tl = gsap.timeline({ delay: 0.15 })
    tl.to(eyebrowRef.current, { y: 0, duration: 1, ease: 'expo.out' })
      .to(
        [headline1Ref.current, headline2Ref.current, headline3Ref.current],
        { y: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' },
        '<.1'
      )
      .to(
        descRef.current,
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '<.4'
      )
      .to(
        actionsRef.current,
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '<.1'
      )
  }, [])

  useEffect(() => {
    // WebGL fluid mesh
    const canvas = canvasRef.current
    if (!canvas) return

    let animId: number
    let renderer: any, scene: any, camera: any, mat: any

    const init = async () => {
      const THREE = await import('three')

      const W = () => window.innerWidth
      const H = () => window.innerHeight

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setSize(W(), H())

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100)
      camera.position.set(0, 0, 28)

      const COLS = 28, ROWS = 18
      const geo = new THREE.BufferGeometry()
      const pos: number[] = [], uv: number[] = [], idx: number[] = []
      const W2 = COLS / 2, H2 = ROWS / 2

      for (let r = 0; r <= ROWS; r++)
        for (let c = 0; c <= COLS; c++) {
          pos.push((c - W2) * (22 / COLS), (r - H2) * (14 / ROWS), 0)
          uv.push(c / COLS, r / ROWS)
        }
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
          const a = r * (COLS + 1) + c
          idx.push(a, a + 1, a + COLS + 1, a + 1, a + COLS + 2, a + COLS + 1)
        }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
      geo.setIndex(idx)

      mat = new THREE.ShaderMaterial({
        transparent: true,
        wireframe: true,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        },
        vertexShader: `
          uniform float uTime; uniform vec2 uMouse;
          varying float vZ;
          void main() {
            vec3 p = position;
            float d = length(p.xy / vec2(11.,7.) - uMouse * 2. + 1.);
            p.z = sin(p.x * .4 + uTime) * 1.2 + sin(p.y * .3 + uTime * .7) * 1.0 - d * .8;
            vZ = p.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
          }
        `,
        fragmentShader: `
          varying float vZ;
          void main() {
            float t = (vZ + 2.5) / 5.;
            vec3 a = vec3(0., 0.831, 0.784);
            vec3 b = vec3(1., 0.42, 0.208);
            vec3 col = mix(a, b, t);
            gl_FragColor = vec4(col, clamp(t * .5 + .08, .04, .22));
          }
        `,
      })

      scene.add(new THREE.Mesh(geo, mat))

      let mx = 0.5, my = 0.5
      const onMouse = (e: MouseEvent) => {
        mx = e.clientX / W()
        my = 1 - e.clientY / H()
      }
      document.addEventListener('mousemove', onMouse)

      const onResize = () => {
        renderer.setSize(W(), H())
        camera.aspect = W() / H()
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      let t = 0
      const render = () => {
        animId = requestAnimationFrame(render)
        t += 0.009
        mat.uniforms.uTime.value = t
        mat.uniforms.uMouse.value.x += (mx - mat.uniforms.uMouse.value.x) * 0.04
        mat.uniforms.uMouse.value.y += (my - mat.uniforms.uMouse.value.y) * 0.04
        renderer.render(scene, camera)
      }
      render()
    }

    init()
    return () => {
      cancelAnimationFrame(animId)
      if (renderer) renderer.dispose()
    }
  }, [])

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[700px] flex items-end overflow-hidden px-[5vw] pb-[7vh]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80 w-full h-full" />
      <div className="hero-noise absolute inset-0 z-[1] opacity-[.025]" />
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, transparent 30%, rgba(8,9,15,.7) 100%)',
        }}
      />
      <div
        className="absolute top-1/2 left-0 w-full h-px z-[2]"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(232,255,71,.12),transparent)' }}
      />

      {/* Scroll indicator */}
      <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4 hidden md:flex">
        <div className="w-px h-20 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, transparent, rgba(240,236,227,.3))' }}>
          <div className="scroll-vert absolute inset-0" />
        </div>
        <span className="font-mono text-[9px] tracking-[.15em] text-[var(--muted)]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Scroll
        </span>
      </div>

      <div className="relative z-10 max-w-[1300px] w-full">
        {/* Eyebrow */}
        <div className="flex items-center gap-3.5 mb-5 overflow-hidden">
          <div ref={eyebrowRef} className="flex items-center gap-3.5" style={{ transform: 'translateY(100%)' }}>
            <div className="px-3.5 py-1 border border-[rgba(232,255,71,.3)] font-mono text-[10px] tracking-[.2em] uppercase text-[var(--accent)]">
              Available
            </div>
            <div className="flex-1 max-w-[60px] h-px" style={{ background: 'linear-gradient(90deg,var(--accent),transparent)' }} />
            <span className="font-mono text-[10px] tracking-[.16em] uppercase text-[var(--muted)]">
              Open to New Projects · 2025
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="overflow-hidden mb-0">
          {[
            { text: 'FULL', className: '' },
            { text: 'STACK', em: true },
            { text: 'DEV.', accent: true },
          ].map((row, i) => (
            <div key={i} className="overflow-hidden leading-[.88]">
              <span
                ref={i === 0 ? headline1Ref : i === 1 ? headline2Ref : headline3Ref}
                className={`block font-display leading-[.88] tracking-[-0.01em] ${row.accent ? 'text-[var(--accent)]' : ''
                  }`}
                style={{
                  fontSize: 'clamp(88px, 13.5vw, 200px)',
                  transform: 'translateY(110%)',
                }}
              >
                {row.em ? <em style={{ fontStyle: 'normal', WebkitTextStroke: '1px var(--cream)', color: 'transparent' }}>{row.text}</em> : row.text}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between mt-8 gap-8">
          <div className="max-w-[380px] overflow-hidden">
            <p
              ref={descRef}
              className="text-[15px] font-normal leading-[1.75] text-[var(--muted)]"
              style={{ transform: 'translateY(40px)', opacity: 0 }}
            >
              Engineering precision meets design intuition. I build digital products that perform at the edge — fast, scalable, and remembered.
            </p>
          </div>

          <div className="overflow-hidden">
            <div
              ref={actionsRef}
              className="flex gap-3.5 items-center"
              style={{ transform: 'translateY(40px)', opacity: 0 }}
            >
              <Link
                href="#projects"
                className="px-9 py-3.5 bg-[var(--accent)] text-[var(--ink)] font-mono text-[11px] font-medium tracking-[.14em] uppercase rounded-[2px] no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(232,255,71,.3)]"
              >
                Selected Work
              </Link>
              <Link
                href="#contact"
                className="px-9 py-3.5 border border-[rgba(240,236,227,.2)] text-[var(--muted)] font-mono text-[11px] tracking-[.14em] uppercase rounded-[2px] no-underline transition-all duration-200 hover:border-[rgba(240,236,227,.5)] hover:text-[var(--cream)] hover:-translate-y-1"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="text-right hidden lg:block">
            <div className="font-display text-[56px] leading-none text-[var(--cream)] tracking-[.02em]">
              6<span className="text-[28px] text-[var(--accent)]">+</span>
            </div>
            <div className="font-mono text-[9px] tracking-[.2em] uppercase text-[var(--muted)] mt-1">
              Years of craft
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
