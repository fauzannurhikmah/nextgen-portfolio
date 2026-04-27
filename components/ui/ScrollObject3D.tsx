'use client'

import { useEffect, useRef } from 'react'

/*
  SCROLL JOURNEY — one fixed canvas, one 3D object that PHYSICALLY TRAVELS
  from section to section as user scrolls:

  SECTION 0 → Hero:       Object enters from right, spins, hovers center-right
  SECTION 1 → About:      Object flies to bottom-left, morphs orientation
  SECTION 2 → Skills:     Object rockets up center, splits/reassembles
  SECTION 3 → Projects:   Object dives to right, tilts forward
  SECTION 4 → Experience: Object spirals to left, camera pulls back
  SECTION 5 → Contact:    Object lands center, glows, camera zoom-in
*/

// Lerp helpers
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const smoothstep = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}

// Keyframe: [x, y, z, rotX, rotY, rotZ, scale, cameraZ]
const KEYFRAMES = [
  // HERO: comes in from right, floating
  { x: 3.5,  y: 0.0,  z: 0,   rx: 0.2,  ry: 0,    rz: 0.1,  s: 1.0,  cz: 12, label: 'hero'       },
  // MARQUEE/transition: glide center
  { x: 0.0,  y: 0.5,  z: 0,   rx: 0.3,  ry: 1.2,  rz: 0,    s: 0.85, cz: 13, label: 'trans'      },
  // ABOUT: sweeps to bottom-left, tilted
  { x: -3.8, y: -2.0, z: 1,   rx: -0.4, ry: 2.8,  rz: -0.2, s: 0.9,  cz: 11, label: 'about'      },
  // SKILLS: rockets up center, faces camera
  { x: 0.2,  y: 2.8,  z: 2,   rx: -1.0, ry: 4.8,  rz: 0.15, s: 1.1,  cz: 10, label: 'skills'     },
  // PROJECTS: dives to right, angled aggressively
  { x: 4.2,  y: -1.2, z: 0,   rx: 0.6,  ry: 6.5,  rz: 0.4,  s: 0.95, cz: 13, label: 'projects'   },
  // EXPERIENCE: arcs to far left
  { x: -4.5, y: 1.0,  z: -1,  rx: 0.2,  ry: 8.0,  rz: -0.3, s: 0.8,  cz: 14, label: 'experience' },
  // CONTACT: lands dead center, zoomed, glowing
  { x: 0.0,  y: 0.0,  z: 3,   rx: 0.0,  ry: 9.4,  rz: 0,    s: 1.3,  cz: 9,  label: 'contact'    },
]

export default function ScrollObject3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animId: number
    let destroyed = false

    const init = async () => {
      const THREE = await import('three')
      if (destroyed) return

      const W = () => window.innerWidth
      const H = () => window.innerHeight

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setSize(W(), H())
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 200)
      camera.position.set(0, 0, 12)

      // ── BUILD THE 3D OBJECT: Geometric crystal/gem cluster ────────────────
      const masterGroup = new THREE.Group()
      scene.add(masterGroup)

      // Core: icosahedron gem
      const coreGeo = new THREE.IcosahedronGeometry(1.2, 1)
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x080c20,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 1.5,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        ior: 2.4,
        reflectivity: 1.0,
        iridescence: 1.0,
        iridescenceIOR: 1.8,
      })
      const core = new THREE.Mesh(coreGeo, coreMat)
      masterGroup.add(core)

      // Outer wireframe shell
      const wireGeo = new THREE.IcosahedronGeometry(1.45, 1)
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xe8ff47,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      })
      const wireShell = new THREE.Mesh(wireGeo, wireMat)
      masterGroup.add(wireShell)

      // Orbiting rings
      const ringData = [
        { r: 1.9, tube: 0.025, tilt: 0,           color: 0x00d4c8, speed: 0.8  },
        { r: 2.3, tube: 0.018, tilt: Math.PI/3,   color: 0xe8ff47, speed: -0.5 },
        { r: 2.6, tube: 0.012, tilt: Math.PI/1.5, color: 0xff6b35, speed: 0.35 },
      ]
      const rings: THREE.Mesh[] = []
      ringData.forEach(({ r, tube, tilt, color }) => {
        const rg = new THREE.TorusGeometry(r, tube, 8, 80)
        const rm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
        const ring = new THREE.Mesh(rg, rm)
        ring.rotation.x = tilt
        masterGroup.add(ring)
        rings.push(ring)
      })

      // Satellite crystals orbiting
      const satCount = 6
      const sats: { mesh: THREE.Mesh; angle: number; speed: number; r: number; y: number }[] = []
      for (let i = 0; i < satCount; i++) {
        const sg = new THREE.OctahedronGeometry(0.12 + Math.random() * 0.08, 0)
        const sm = new THREE.MeshStandardMaterial({
          color: [0x00d4c8, 0xe8ff47, 0xff6b35][i % 3],
          emissive: [0x002a28, 0x2a2800, 0x2a1000][i % 3],
          metalness: 0.9, roughness: 0.1,
        })
        const sat = new THREE.Mesh(sg, sm)
        const orbitGroup = new THREE.Group()
        orbitGroup.add(sat)
        sat.position.set(2.2 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8, 0)
        masterGroup.add(orbitGroup)
        sats.push({ mesh: orbitGroup as any, angle: (i / satCount) * Math.PI * 2, speed: 0.4 + Math.random() * 0.4, r: 1, y: (Math.random() - 0.5) * 1.5 })
      }

      // ── PARTICLE FIELD (drifts with object) ──────────────────────────────
      const partCount = 120
      const partGeo = new THREE.BufferGeometry()
      const partPos = new Float32Array(partCount * 3)
      const partVel = new Float32Array(partCount * 3)
      for (let i = 0; i < partCount; i++) {
        const r = 3 + Math.random() * 5
        const a = Math.random() * Math.PI * 2
        const b = Math.random() * Math.PI
        partPos[i*3]   = r * Math.sin(b) * Math.cos(a)
        partPos[i*3+1] = r * Math.sin(b) * Math.sin(a)
        partPos[i*3+2] = r * Math.cos(b)
        partVel[i*3]   = (Math.random()-.5)*.004
        partVel[i*3+1] = (Math.random()-.5)*.004
        partVel[i*3+2] = (Math.random()-.5)*.004
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3))
      const partMat = new THREE.PointsMaterial({
        color: 0xe8ff47, size: 0.04, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const particleSystem = new THREE.Points(partGeo, partMat)
      masterGroup.add(particleSystem)

      // Trail: ghost copies that lag behind
      const trailGeo = new THREE.IcosahedronGeometry(1.2, 0)
      const trailMeshes: THREE.Mesh[] = []
      for (let i = 0; i < 5; i++) {
        const tm = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({
          color: 0x00d4c8, wireframe: true, transparent: true, opacity: 0.06 - i * 0.01,
        }))
        scene.add(tm)
        trailMeshes.push(tm)
      }

      // ── LIGHTS ───────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x111122, 0.8))

      const lights = [
        { color: 0x00d4c8, intensity: 4.0, pos: [8, 6, 6]   },
        { color: 0xff6b35, intensity: 3.5, pos: [-6, -4, -3] },
        { color: 0xe8ff47, intensity: 2.5, pos: [0, 0, 10]   },
        { color: 0xffffff, intensity: 1.5, pos: [-4, 8, 4]   },
      ]
      const pointLights: THREE.PointLight[] = []
      lights.forEach(({ color, intensity, pos }) => {
        const pl = new THREE.PointLight(color, intensity, 30)
        pl.position.set(...(pos as [number, number, number]))
        scene.add(pl)
        pointLights.push(pl)
      })

      // ── SCROLL STATE ────────────────────────────────────────────────────
      // Map scroll progress [0,1] across page to keyframe index
      let rawScroll = 0

      const getScrollProgress = () => {
        const totalScroll = document.body.scrollHeight - window.innerHeight
        return totalScroll > 0 ? window.scrollY / totalScroll : 0
      }

      window.addEventListener('scroll', () => {
        rawScroll = getScrollProgress()
      }, { passive: true })

      // Interpolate between keyframes
      const sampleKeyframe = (prog: number) => {
        const n = KEYFRAMES.length - 1
        const raw = prog * n
        const i = clamp(Math.floor(raw), 0, n - 1)
        const f = raw - i
        const sf = f * f * (3 - 2 * f) // smoothstep

        const a = KEYFRAMES[i]
        const b = KEYFRAMES[Math.min(i + 1, n)]
        return {
          x:  lerp(a.x,  b.x,  sf),
          y:  lerp(a.y,  b.y,  sf),
          z:  lerp(a.z,  b.z,  sf),
          rx: lerp(a.rx, b.rx, sf),
          ry: lerp(a.ry, b.ry, sf),
          rz: lerp(a.rz, b.rz, sf),
          s:  lerp(a.s,  b.s,  sf),
          cz: lerp(a.cz, b.cz, sf),
        }
      }

      // Current smoothed state
      let cur = { ...sampleKeyframe(0) }

      // Trail positions history
      const trailHistory: { x: number; y: number; z: number }[] = Array(20).fill({ x: 3.5, y: 0, z: 0 })

      // ── RESIZE ──────────────────────────────────────────────────────────
      window.addEventListener('resize', () => {
        renderer.setSize(W(), H())
        camera.aspect = W() / H()
        camera.updateProjectionMatrix()
      })

      // ── RENDER LOOP ─────────────────────────────────────────────────────
      let t = 0

      const render = () => {
        animId = requestAnimationFrame(render)
        if (destroyed) return
        t += 0.012

        // Get target from scroll
        const target = sampleKeyframe(rawScroll)

        // Smooth current toward target — SLOW lerp = cinematic lag
        const lerpSpeed = 0.045
        cur.x  = lerp(cur.x,  target.x,  lerpSpeed)
        cur.y  = lerp(cur.y,  target.y,  lerpSpeed)
        cur.z  = lerp(cur.z,  target.z,  lerpSpeed)
        cur.rx = lerp(cur.rx, target.rx, lerpSpeed * 1.2)
        cur.ry = lerp(cur.ry, target.ry, lerpSpeed * 0.8)
        cur.rz = lerp(cur.rz, target.rz, lerpSpeed * 1.5)
        cur.s  = lerp(cur.s,  target.s,  lerpSpeed * 1.5)
        cur.cz = lerp(cur.cz, target.cz, lerpSpeed * 0.8)

        // Apply to master group
        masterGroup.position.set(cur.x, cur.y, cur.z)
        masterGroup.rotation.x = cur.rx + Math.sin(t * 0.6) * 0.06
        masterGroup.rotation.y = cur.ry + t * 0.25
        masterGroup.rotation.z = cur.rz + Math.cos(t * 0.4) * 0.04
        masterGroup.scale.setScalar(cur.s)

        // Camera follows
        camera.position.z = cur.cz
        camera.position.x = lerp(camera.position.x, cur.x * 0.15, 0.03)
        camera.position.y = lerp(camera.position.y, cur.y * 0.08, 0.03)
        camera.lookAt(masterGroup.position)

        // Wireframe shell counter-rotates
        wireShell.rotation.y = -t * 0.4
        wireShell.rotation.x = -t * 0.15

        // Orbiting rings
        rings.forEach((ring, i) => {
          ring.rotation.z = t * ringData[i].speed
          ring.rotation.y = t * ringData[i].speed * 0.5
        })

        // Satellite orbits
        sats.forEach((sat, i) => {
          sat.angle += sat.speed * 0.012
          ;(sat.mesh as THREE.Group).rotation.y = sat.angle
        })

        // Particles breathe
        const pa = partGeo.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < partCount; i++) {
          let px = pa.getX(i) + partVel[i*3]
          let py = pa.getY(i) + partVel[i*3+1]
          let pz = pa.getZ(i) + partVel[i*3+2]
          const d = Math.sqrt(px*px + py*py + pz*pz)
          if (d > 8 || d < 2) { partVel[i*3] *= -1; partVel[i*3+1] *= -1; partVel[i*3+2] *= -1 }
          pa.setXYZ(i, px, py, pz)
        }
        pa.needsUpdate = true

        // Trail: push current pos, render ghosts at older positions
        trailHistory.unshift({ x: cur.x, y: cur.y, z: cur.z })
        trailHistory.length = 20
        trailMeshes.forEach((tm, i) => {
          const h = trailHistory[Math.min((i + 1) * 3, 19)]
          tm.position.set(h.x, h.y, h.z)
          tm.rotation.copy(masterGroup.rotation)
          tm.scale.setScalar(cur.s * (1 - i * 0.12))
        })

        // Pulsing light intensities
        pointLights[0].intensity = 4.0 + Math.sin(t * 1.5) * 1.2
        pointLights[1].intensity = 3.5 + Math.cos(t * 1.2) * 1.0
        pointLights[2].intensity = 2.5 + Math.sin(t * 2.0) * 0.8
        // Light follows object position
        pointLights[2].position.set(cur.x, cur.y + 2, cur.z + 8)

        // Wire opacity pulses near contact section
        const contactProx = smoothstep(0.85, 1.0, rawScroll)
        ;(wireShell.material as THREE.MeshBasicMaterial).opacity = 0.18 + contactProx * 0.45
        ;(wireMat as THREE.MeshBasicMaterial).color.setHex(
          contactProx > 0.5 ? 0xe8ff47 : 0xe8ff47
        )

        renderer.render(scene, camera)
      }
      render()
    }

    init()
    return () => {
      destroyed = true
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  )
}
