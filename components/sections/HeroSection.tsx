'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

export default function HeroSection() {
  const sectionRef   = useRef<HTMLElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const eyebrowRef   = useRef<HTMLDivElement>(null)
  const headline1Ref = useRef<HTMLSpanElement>(null)
  const headline2Ref = useRef<HTMLSpanElement>(null)
  const headline3Ref = useRef<HTMLSpanElement>(null)
  const descRef      = useRef<HTMLParagraphElement>(null)
  const actionsRef   = useRef<HTMLDivElement>(null)

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 })
    tl.to(eyebrowRef.current, { y: 0, duration: 1, ease: 'expo.out' })
      .to([headline1Ref.current, headline2Ref.current, headline3Ref.current],
        { y: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, '<.1')
      .to(descRef.current, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '<.4')
      .to(actionsRef.current, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '<.1')
  }, [])

  // WebGL grid mesh — click ripple lives here
  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    let animId: number

    const init = async () => {
      const THREE = await import('three')
      const W = () => window.innerWidth
      const H = () => window.innerHeight

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setSize(W(), H())

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100)
      camera.position.set(0, 0, 28)

      // Grid mesh
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
      geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uv,  2))
      geo.setIndex(idx)

      const MAX_RIPPLES = 6
      const ripples: { x: number; y: number; t: number; amp: number }[] = []

      const rUniforms: Record<string, { value: any }> = {}
      for (let i = 0; i < MAX_RIPPLES; i++)
        rUniforms[`uRipple${i}`] = { value: new THREE.Vector4(-999, -999, -1, 0) }

      const mat = new THREE.ShaderMaterial({
        transparent: true, wireframe: true,
        uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, ...rUniforms },
        vertexShader: `
          uniform float uTime; uniform vec2 uMouse;
          uniform vec4 uRipple0,uRipple1,uRipple2,uRipple3,uRipple4,uRipple5;
          varying float vZ; varying float vRip;
          float rip(vec4 r, vec2 p) {
            if(r.z < 0.0) return 0.0;
            float age = uTime - r.z; if(age > 3.5) return 0.0;
            float dist = length(p - r.xy);
            float wave = sin((dist - age * 5.0) * 2.8) * exp(-pow(dist - age * 5.0,2.0) / 3.5);
            return wave * exp(-age * 1.0) * r.w;
          }
          void main() {
            vec3 p = position;
            float d = length(p.xy/vec2(11.,7.) - uMouse*2.+1.);
            float baseZ = sin(p.x*.4+uTime)*1.2 + sin(p.y*.3+uTime*.7) - d*.8;
            float rt = rip(uRipple0,p.xy)+rip(uRipple1,p.xy)+rip(uRipple2,p.xy)
                      +rip(uRipple3,p.xy)+rip(uRipple4,p.xy)+rip(uRipple5,p.xy);
            p.z = baseZ + rt*4.5; vZ=p.z; vRip=abs(rt);
            gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.);
          }`,
        fragmentShader: `
          varying float vZ; varying float vRip;
          void main() {
            float t = (vZ+2.5)/5.0;
            vec3 col = mix(vec3(0.,0.831,0.784), vec3(1.,0.42,0.208), clamp(t,0.,1.));
            col = mix(col, vec3(0.91,1.0,0.278), clamp(vRip*0.7,0.,0.8));
            gl_FragColor = vec4(col, clamp(t*.5+.08,.04,.38) + vRip*0.35);
          }`,
      })
      scene.add(new THREE.Mesh(geo, mat))

      // Screen → world
      const toWorld = (ex: number, ey: number) => {
        const nx = (ex / W()) * 2 - 1
        const ny = -(ey / H()) * 2 + 1
        const halfH = Math.tan((55 * Math.PI / 180) / 2) * 28
        return { wx: nx * halfH * (W() / H()), wy: ny * halfH }
      }

      // ✅ Attach click to SECTION (not canvas), canvas is pointer-events-none
      const onClick = (e: MouseEvent) => {
        const { wx, wy } = toWorld(e.clientX, e.clientY)
        if (ripples.length >= MAX_RIPPLES) ripples.shift()
        ripples.push({ x: wx, y: wy, t: mat.uniforms.uTime.value, amp: 0.8 + Math.random() * 0.5 })

        // DOM flash dot
        const dot = document.createElement('div')
        dot.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;
          width:6px;height:6px;border-radius:50%;background:#e8ff47;
          transform:translate(-50%,-50%) scale(1);pointer-events:none;z-index:4;
          box-shadow:0 0 20px #e8ff47,0 0 40px rgba(232,255,71,0.4);`
        document.body.appendChild(dot)
        requestAnimationFrame(() => {
          dot.style.transition = 'transform 0.7s ease,opacity 0.7s ease'
          dot.style.transform = 'translate(-50%,-50%) scale(14)'
          dot.style.opacity = '0'
        })
        setTimeout(() => dot.remove(), 800)
      }
      section.addEventListener('click', onClick)

      let mx = 0.5, my = 0.5
      document.addEventListener('mousemove', e => { mx = e.clientX / W(); my = 1 - e.clientY / H() })
      window.addEventListener('resize', () => { renderer.setSize(W(), H()); camera.aspect = W()/H(); camera.updateProjectionMatrix() })

      let t = 0
      const render = () => {
        animId = requestAnimationFrame(render)
        t += 0.009
        mat.uniforms.uTime.value = t
        mat.uniforms.uMouse.value.x += (mx - mat.uniforms.uMouse.value.x) * 0.04
        mat.uniforms.uMouse.value.y += (my - mat.uniforms.uMouse.value.y) * 0.04
        for (let i = 0; i < MAX_RIPPLES; i++) {
          const r = ripples[i]
          const u = (mat.uniforms as any)[`uRipple${i}`]
          r && (t - r.t) <= 3.5 ? u.value.set(r.x, r.y, r.t, r.amp) : u.value.set(-999,-999,-1,0)
        }
        renderer.render(scene, camera)
      }
      render()
    }
    init()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen min-h-[700px] flex items-end overflow-hidden px-[5vw] pb-[7vh] cursor-crosshair"
    >
      {/* Canvas — pointer-events-none, click lands on section */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-75 w-full h-full pointer-events-none" />

      {/* Overlays — all pointer-events-none */}
      <div className="hero-noise absolute inset-0 z-[1] opacity-[.025] pointer-events-none" />
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, transparent 30%, rgba(8,9,15,.75) 100%)' }} />
      <div className="absolute top-1/2 left-0 w-full h-px z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(232,255,71,.12),transparent)' }} />

      {/* Click hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-mono text-[9px] tracking-[.2em] uppercase pointer-events-none select-none"
        style={{ color: 'rgba(240,236,227,0.2)', animation: 'pulse 3s ease-in-out infinite' }}>
        ✦ click grid to ripple
      </div>

      {/* Scroll indicator */}
      <div className="absolute right-[5vw] top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-4 pointer-events-none">
        <div className="w-px h-20 relative overflow-hidden"
          style={{ background: 'linear-gradient(to bottom,transparent,rgba(240,236,227,.3))' }}>
          <div className="scroll-vert absolute inset-0" />
        </div>
        <span className="font-mono text-[9px] tracking-[.15em] text-[var(--muted)]"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Scroll</span>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1300px] w-full">
        <div className="flex items-center gap-3.5 mb-5 overflow-hidden">
          <div ref={eyebrowRef} className="flex items-center gap-3.5" style={{ transform: 'translateY(100%)' }}>
            <div className="px-3.5 py-1 border border-[rgba(232,255,71,.3)] font-mono text-[10px] tracking-[.2em] uppercase text-[var(--accent)]">Available</div>
            <div className="max-w-[60px] h-px" style={{ background: 'linear-gradient(90deg,var(--accent),transparent)', width: '60px' }} />
            <span className="font-mono text-[10px] tracking-[.16em] uppercase text-[var(--muted)]">Open to New Projects · 2025</span>
          </div>
        </div>

        <div className="overflow-hidden">
          {[
            { text: 'FULL',  em: false, accent: false },
            { text: 'STACK', em: true,  accent: false },
            { text: 'DEV.',  em: false, accent: true  },
          ].map((row, i) => (
            <div key={i} className="overflow-hidden leading-[.88]">
              <span
                ref={i === 0 ? headline1Ref : i === 1 ? headline2Ref : headline3Ref}
                className={`block font-display leading-[.88] tracking-[-0.01em] ${row.accent ? 'text-[var(--accent)]' : ''}`}
                style={{ fontSize: 'clamp(88px,13.5vw,200px)', transform: 'translateY(110%)' }}
              >
                {row.em
                  ? <em style={{ fontStyle:'normal', WebkitTextStroke:'1px var(--cream)', color:'transparent' }}>{row.text}</em>
                  : row.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mt-8 gap-8 flex-wrap">
          <div className="max-w-[380px]">
            <p ref={descRef} className="text-[15px] leading-[1.75] text-[var(--muted)]"
              style={{ transform: 'translateY(40px)', opacity: 0 }}>
              Engineering precision meets design intuition. I build digital products that perform at the edge — fast, scalable, and remembered.
            </p>
          </div>
          <div>
            <div ref={actionsRef} className="flex gap-3.5 items-center" style={{ transform: 'translateY(40px)', opacity: 0 }}>
              <Link href="#projects"
                className="px-9 py-3.5 bg-[var(--accent)] text-[var(--ink)] font-mono text-[11px] font-medium tracking-[.14em] uppercase rounded-[2px] no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(232,255,71,.3)]">
                Selected Work
              </Link>
              <Link href="#contact"
                className="px-9 py-3.5 border border-[rgba(240,236,227,.2)] text-[var(--muted)] font-mono text-[11px] tracking-[.14em] uppercase rounded-[2px] no-underline transition-all duration-200 hover:border-[rgba(240,236,227,.5)] hover:text-[var(--cream)] hover:-translate-y-1">
                Get in Touch
              </Link>
            </div>
          </div>
          <div className="text-right hidden lg:block">
            <div className="font-display text-[56px] leading-none text-[var(--cream)] tracking-[.02em]">6<span className="text-[28px] text-[var(--accent)]">+</span></div>
            <div className="font-mono text-[9px] tracking-[.2em] uppercase text-[var(--muted)] mt-1">Years of craft</div>
          </div>
        </div>
      </div>
    </section>
  )
}
