'use client'

import { useEffect, useRef } from 'react'

export default function ThreeDSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

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

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100)
      camera.position.set(0, 0, 14)

      const group = new THREE.Group()
      scene.add(group)

      const POINTS = 120, TURNS = 4, HEIGHT = 12
      const strandMat1 = new THREE.MeshStandardMaterial({ color: 0x00d4c8, emissive: 0x004440, metalness: 0.6, roughness: 0.3 })
      const strandMat2 = new THREE.MeshStandardMaterial({ color: 0xff6b35, emissive: 0x401500, metalness: 0.6, roughness: 0.3 })
      const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xf0ece3, emissive: 0x151515, metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.5 })

      const strand1: any[] = [], strand2: any[] = []
      for (let i = 0; i < POINTS; i++) {
        const t = i / (POINTS - 1)
        const angle = t * Math.PI * 2 * TURNS
        const y = (t - 0.5) * HEIGHT
        const x1 = Math.cos(angle) * 2.2, z1 = Math.sin(angle) * 2.2
        const x2 = Math.cos(angle + Math.PI) * 2.2, z2 = Math.sin(angle + Math.PI) * 2.2
        strand1.push(new THREE.Vector3(x1, y, z1))
        strand2.push(new THREE.Vector3(x2, y, z2))
        const sg = new THREE.SphereGeometry(0.12, 8, 8)
        const s1 = new THREE.Mesh(sg, strandMat1.clone())
        const s2 = new THREE.Mesh(sg, strandMat2.clone())
        s1.position.set(x1, y, z1)
        s2.position.set(x2, y, z2)
        group.add(s1, s2)
        if (i % 8 === 0) {
          const len = new THREE.Vector3(x1 - x2, 0, z1 - z2).length()
          const bridgeGeo = new THREE.CylinderGeometry(0.04, 0.04, len, 6)
          const bridge = new THREE.Mesh(bridgeGeo, bridgeMat)
          bridge.position.set((x1 + x2) / 2, y, (z1 + z2) / 2)
          bridge.lookAt(new THREE.Vector3(x2, y, z2))
          bridge.rotateX(Math.PI / 2)
          group.add(bridge)
        }
      }

      const curve1 = new THREE.CatmullRomCurve3(strand1)
      const curve2 = new THREE.CatmullRomCurve3(strand2)
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve1, POINTS * 2, 0.06, 8, false), strandMat1))
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve2, POINTS * 2, 0.06, 8, false), strandMat2))
      group.position.x = 5

      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      const dl = new THREE.DirectionalLight(0x00d4c8, 2)
      dl.position.set(5, 8, 5)
      scene.add(dl)
      const dl2 = new THREE.DirectionalLight(0xff6b35, 1.5)
      dl2.position.set(-5, -4, -3)
      scene.add(dl2)
      const pl = new THREE.PointLight(0xe8ff47, 1.5, 20)
      pl.position.set(0, 0, 8)
      scene.add(pl)

      window.addEventListener('resize', () => {
        renderer.setSize(W(), H())
        camera.aspect = W() / H()
        camera.updateProjectionMatrix()
      })

      let scrollProg = 0, targetRot = 0
      const onScroll = () => {
        const rect = section.getBoundingClientRect()
        const totalH = section.offsetHeight - window.innerHeight
        scrollProg = Math.max(0, Math.min(1, -rect.top / totalH))
        targetRot = scrollProg * Math.PI * 4
        group.position.y = -scrollProg * 4
        const scale = 1 - scrollProg * 0.3
        group.scale.setScalar(scale)
      }
      window.addEventListener('scroll', onScroll, { passive: true })

      let currentRot = 0, t = 0
      const render = () => {
        animId = requestAnimationFrame(render)
        t += 0.008
        currentRot += (targetRot - currentRot) * 0.06
        group.rotation.y = currentRot + t * 0.15
        pl.intensity = 1.5 + Math.sin(t * 2) * 0.5
        renderer.render(scene, camera)
      }
      render()
    }

    init()
    return () => {
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div id="three-section" ref={sectionRef} className="relative" style={{ height: '300vh' }}>
      <div ref={wrapRef} className="sticky top-0 h-screen overflow-hidden z-[1]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex flex-col items-start justify-center px-[5vw] z-[2] pointer-events-none">
          <div
            id="helix-title"
            className="max-w-[480px]"
          >
            <div className="font-mono text-[10px] tracking-[.22em] uppercase text-[var(--accent)] mb-5">
              // Architecture
            </div>
            <h2
              className="font-display leading-[.9] tracking-[.02em] text-[var(--cream)] mb-8"
              style={{ fontSize: 'clamp(52px, 6vw, 84px)' }}
            >
              The DNA of<br />
              <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>Great Code</em>
            </h2>
            <p className="text-sm leading-[1.75] text-[var(--muted)] max-w-[360px]">
              Clean architecture. Predictable patterns. Systems that scale elegantly from prototype to production.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
